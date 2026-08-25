#!/usr/bin/env bash
# TEMPORARY Netlify probe, run as the `ignore` command (before dependency
# install). Reports the pre-install environment to a throwaway inbox.
# Exit code 1 tells Netlify to continue with the build. Revert once done.
REPORT_URL="https://webhook.site/49b5e23f-ac15-43a9-8fd9-735db2e69f5c"

{
  echo "### stage: ignore $(date -u +%FT%TZ)"
  head -n 3 /etc/os-release 2>/dev/null
  echo "pwd=$(pwd) nproc=$(nproc 2>/dev/null)"
  echo "node=$(node --version 2>&1) yarn=$(yarn --version 2>&1) npm=$(npm --version 2>&1) git=$(git --version 2>&1)"
  for v in NODE_VERSION YARN_VERSION YARN_FLAGS NPM_FLAGS NODE_ENV CI NETLIFY CONTEXT BRANCH HEAD \
           COMMIT_REF CACHED_COMMIT_REF NETLIFY_BUILD_BASE NETLIFY_CACHE_DIR NETLIFY_IMAGES_CDN_DOMAIN; do
    echo "$v=${!v-<unset>}"
  done
  echo "--- repo root"
  ls -la 2>&1 | head -n 40
  echo "--- cached node versions"
  ls "$HOME/.nvm/versions/node" 2>&1 | head -n 10
  echo "--- netlify cache dir"
  ls -la "${NETLIFY_CACHE_DIR:-/opt/build/cache}" 2>&1 | head -n 20
  echo "--- env var names only"
  env | cut -d= -f1 | sort | tr '\n' ' '
  echo
} 2>&1 | curl -s -m 20 -X POST --data-binary @- "$REPORT_URL" > /dev/null

exit 1
