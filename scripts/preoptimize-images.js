const execa = require('execa');
const path = require('path');
const signale = require('signale');
const { promisify } = require('util');
const { existsSync, lstatSync, readdirSync, unlink } = require('fs');

const CJPEG_BIN_PATH = '/usr/local/opt/mozjpeg/bin/cjpeg';
const CONVERT_BIN_PATH = 'convert';
const CONTENT_PATH = 'content';
const OPTIMIZED_SUFFIX = 'optimized';
const OUTPUT_EXT = 'jpg';

const unlinkAsync = promisify(unlink);

function* findFromDir(startPath, filter) {
  if (!existsSync(startPath)) {
    console.error('No dir found for: ', startPath);
    return;
  }

  const files = readdirSync(startPath);

  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = lstatSync(filename);
    const file = path.parse(filename);
    if (stat.isDirectory()) {
      yield* findFromDir(filename, filter);
    } else if (
      file.ext === `.${OUTPUT_EXT}` &&
      file.name.indexOf(OPTIMIZED_SUFFIX) === -1
    ) {
      yield filename;
    }
  }
}

(async () => {
  for (const filename of findFromDir(CONTENT_PATH)) {
    const { dir, name } = path.parse(filename);
    const out = path.join(dir, `${name}-${OPTIMIZED_SUFFIX}.${OUTPUT_EXT}`);
    signale.start(`Optimizing ${filename}...`);
    try {
      const convert = execa(CONVERT_BIN_PATH, [filename, 'pnm:-']);
      const cjpeg = execa(CJPEG_BIN_PATH, ['-optimize', '-outfile', out]);
      convert.stdout.pipe(cjpeg.stdin);
      await convert;
      await cjpeg;
      await unlinkAsync(filename);
      signale.success(`Wrote to ${out}\n`);
    } catch (_err) {
      signale.fatal('Something went wrong');
      break;
    }
  }
  signale.complete('Done, killing child processes...');
})();
