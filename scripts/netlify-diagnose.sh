#!/usr/bin/env bash
# TEMPORARY: Netlify's deploy logs for this site are private, so this wrapper
# runs the normal build and posts the environment summary plus the build
# output to a throwaway inbox for debugging. Revert once the failure is found.
set -uo pipefail

REPORT_URL="https://webhook.site/49b5e23f-ac15-43a9-8fd9-735db2e69f5c"
LOG="$(mktemp -t netlify-build.XXXXXX)"

{
  echo "### $(date -u +%FT%TZ) environment"
  head -n 3 /etc/os-release 2>/dev/null
  echo "nproc=$(nproc 2>/dev/null) ; $(free -m 2>/dev/null | awk '/Mem:/ {print $2" MB total, "$7" MB available"}')"
  echo "node=$(node --version 2>&1) yarn=$(yarn --version 2>&1) npm=$(npm --version 2>&1)"
  echo "python3=$(python3 --version 2>&1)"
  for v in NODE_VERSION YARN_VERSION YARN_FLAGS NPM_FLAGS NODE_ENV NODE_OPTIONS CI NETLIFY CONTEXT \
           GATSBY_CPU_COUNT NETLIFY_SKIP_GATSBY_BUILD_PLUGIN NETLIFY_IMAGE_CDN NETLIFY_BUILD_BASE; do
    echo "$v=${!v-<unset>}"
  done
  echo "### optional native packages present"
  ls node_modules/@parcel 2>/dev/null | grep watcher
  ls node_modules/@lmdb 2>/dev/null
  ls -d node_modules/msgpackr-extract node_modules/sharp/vendor/* node_modules/sharp/build/Release/*.node 2>/dev/null
  echo "### pre-existing build dirs (restored cache?)"
  ls -la .cache public 2>&1 | head -n 30
  ls -la /opt/build/cache/cwd 2>&1 | head -n 10
  echo "### $(date -u +%FT%TZ) gatsby build --verbose"
} > "$LOG" 2>&1

./node_modules/.bin/gatsby build --verbose 2>&1 | tee -a "$LOG"
STATUS=${PIPESTATUS[0]}
echo "### $(date -u +%FT%TZ) exit=$STATUS" >> "$LOG"

{ head -n 80 "$LOG"; echo "..."; tail -n 400 "$LOG"; } \
  | curl -s -m 30 -X POST --data-binary @- "$REPORT_URL" > /dev/null || true

exit "$STATUS"
