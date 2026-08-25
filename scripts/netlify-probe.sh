#!/usr/bin/env bash
# TEMPORARY Netlify probe, run as the `ignore` command (before dependency
# install). Reports the pre-install environment to a throwaway inbox, then
# reproduces the dependency install and reports its output, because Netlify's
# own install stage cannot be observed by build plugins.
# Exit code 1 tells Netlify to continue with the build. Revert once done.
REPORT_URL="https://webhook.site/49b5e23f-ac15-43a9-8fd9-735db2e69f5c"
export HOME="${HOME:-/opt/buildhome}"
[ -w "$HOME" ] || export HOME=/tmp/probe-home
mkdir -p "$HOME"

report() { curl -s -m 30 -X POST --data-binary @- "$REPORT_URL" > /dev/null; }

{
  echo "### stage: ignore/env $(date -u +%FT%TZ)"
  head -n 3 /etc/os-release 2>/dev/null
  echo "id=$(id) HOME=$HOME pwd=$(pwd) nproc=$(nproc 2>/dev/null)"
  echo "$(free -m 2>/dev/null | awk '/Mem:/ {print "mem "$2" MB total, "$7" MB available"}') ; disk: $(df -h /opt/build 2>/dev/null | tail -n 1)"
  echo "node=$(node --version 2>&1) npm=$(npm --version 2>&1) corepack=$(corepack --version 2>&1 | head -n 1)"
  echo "which: node=$(command -v node) npm=$(command -v npm) corepack=$(command -v corepack) yarn=$(command -v yarn)"
  echo "PATH=$PATH"
  echo "nvm node versions: $(ls /opt/buildhome/.nvm/versions/node 2>&1 | tr '\n' ' ')"
  for v in NODE_VERSION YARN_VERSION YARN_FLAGS NPM_FLAGS NODE_ENV RUBY_VERSION CI NETLIFY CONTEXT BRANCH HEAD \
           COMMIT_REF CACHED_COMMIT_REF NVM_DIR NVM_BIN; do
    echo "$v=${!v-<unset>}"
  done
  echo "--- netlify cache dir"
  ls -la /opt/build/cache 2>&1 | head -n 20
  echo "--- env var names only"
  env | cut -d= -f1 | sort | tr '\n' ' '
  echo
} 2>&1 | report

{
  echo "### stage: ignore/yarn-install $(date -u +%FT%TZ)"
  export npm_config_cache=/tmp/probe-npm-cache
  echo "+ npx -y yarn@1.22.22 --version"
  npx -y yarn@1.22.22 --version 2>&1 | tail -n 5
  echo "+ yarn install --no-ignore-optional --cache-folder /tmp/probe-yarn-cache (in $(pwd))"
  start=$(date +%s)
  npx -y yarn@1.22.22 install --no-ignore-optional --cache-folder /tmp/probe-yarn-cache 2>&1 | tail -n 80
  echo "yarn install exit=${PIPESTATUS[0]} after $(( $(date +%s) - start ))s"
  echo "--- results"
  ls node_modules/.bin/gatsby node_modules/@parcel/watcher-linux-x64-glibc node_modules/@lmdb/lmdb-linux-x64 2>&1
  echo "sharp vendor: $(ls node_modules/sharp/vendor 2>&1 | tr '\n' ' ')"
  echo "### $(date -u +%FT%TZ) done"
} 2>&1 | report

exit 1
