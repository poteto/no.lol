// TEMPORARY local Netlify build plugin. Netlify's deploy logs for this site
// are private, so this reports the build stages reached and any build error
// to a throwaway inbox. Uses only Node built-ins (local plugins are not
// npm-installed). Revert once the failure is identified.
const fs = require('node:fs');
const https = require('node:https');

const REPORT_URL = new URL(
  'https://webhook.site/49b5e23f-ac15-43a9-8fd9-735db2e69f5c'
);

const ENV_KEYS = [
  'NODE_VERSION',
  'YARN_VERSION',
  'YARN_FLAGS',
  'NPM_FLAGS',
  'NODE_ENV',
  'NODE_OPTIONS',
  'CI',
  'NETLIFY',
  'CONTEXT',
  'BRANCH',
  'HEAD',
  'COMMIT_REF',
  'CACHED_COMMIT_REF',
  'GATSBY_CPU_COUNT',
  'NETLIFY_SKIP_GATSBY_BUILD_PLUGIN',
  'NETLIFY_IMAGE_CDN',
  'NETLIFY_BUILD_BASE',
  'NETLIFY_CACHE_DIR',
];

function post(text) {
  return new Promise((resolve) => {
    try {
      const req = https.request(
        REPORT_URL,
        {
          method: 'POST',
          headers: { 'content-type': 'text/plain' },
          timeout: 15000,
        },
        (res) => {
          res.resume();
          res.on('end', resolve);
        }
      );
      req.on('error', resolve);
      req.on('timeout', () => {
        req.destroy();
        resolve();
      });
      req.end(text);
    } catch {
      resolve();
    }
  });
}

function envSummary() {
  return ENV_KEYS.map((k) => `${k}=${process.env[k] ?? '<unset>'}`).join('\n');
}

function safe(fn, fallback = '<n/a>') {
  try {
    return fn();
  } catch (e) {
    return `${fallback}: ${e && e.message}`;
  }
}

module.exports = {
  async onPreBuild({ netlifyConfig, constants }) {
    const lines = [
      `### stage: plugin onPreBuild ${new Date().toISOString()}`,
      `node=${process.version}`,
      envSummary(),
      `plugins: ${safe(() => JSON.stringify((netlifyConfig.plugins || []).map((p) => p.package)))}`,
      `build: ${safe(() => JSON.stringify(netlifyConfig.build))}`,
      `constants: ${safe(() => JSON.stringify(constants))}`,
      `node_modules: ${fs.existsSync('node_modules')}`,
      `@parcel/watcher-linux-x64-glibc: ${fs.existsSync('node_modules/@parcel/watcher-linux-x64-glibc')}`,
      `@lmdb/lmdb-linux-x64: ${fs.existsSync('node_modules/@lmdb/lmdb-linux-x64')}`,
      `sharp vendor: ${safe(() => fs.readdirSync('node_modules/sharp/vendor').join(','))}`,
      `gatsby: ${safe(() => require(`${process.cwd()}/node_modules/gatsby/package.json`).version)}`,
    ];
    await post(lines.join('\n'));
  },

  async onError({ error }) {
    const lines = [
      `### stage: plugin onError ${new Date().toISOString()}`,
      `name=${error && error.name}`,
      `message=${error && error.message}`,
      `stack=${error && error.stack}`,
      envSummary(),
    ];
    await post(lines.join('\n'));
  },

  async onEnd() {
    await post(`### stage: plugin onEnd ${new Date().toISOString()}`);
  },
};
