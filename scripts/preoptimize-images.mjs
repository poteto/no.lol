import { existsSync, lstatSync, readdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { execa } from 'execa';
import signale from 'signale';

const CJPEG_BIN_PATH = '/usr/local/opt/mozjpeg/bin/cjpeg';
const CONVERT_BIN_PATH = 'convert';
const CONTENT_PATH = 'content';
const OPTIMIZED_SUFFIX = 'optimized';
const OUTPUT_EXT = 'jpg';

function* findFromDir(startPath) {
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
      yield* findFromDir(filename);
    } else if (
      file.ext === `.${OUTPUT_EXT}` &&
      file.name.indexOf(OPTIMIZED_SUFFIX) === -1
    ) {
      yield filename;
    }
  }
}

for (const filename of findFromDir(CONTENT_PATH)) {
  const { dir, name } = path.parse(filename);
  const out = path.join(dir, `${name}-${OPTIMIZED_SUFFIX}.${OUTPUT_EXT}`);
  signale.start(`Optimizing ${filename}...`);
  try {
    await execa(CONVERT_BIN_PATH, [filename, 'pnm:-']).pipe(CJPEG_BIN_PATH, [
      '-optimize',
      '-outfile',
      out,
    ]);
    await unlink(filename);
    signale.success(`Wrote to ${out}\n`);
  } catch (err) {
    signale.fatal('Something went wrong');
    signale.fatal(err);
    break;
  }
}
signale.complete('Done, killing child processes...');
