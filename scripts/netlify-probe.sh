#!/usr/bin/env bash
# TEMPORARY Netlify probe, run as the `ignore` command (before dependency
# install). Reports the pre-install environment to a throwaway inbox.
# Exit code 1 tells Netlify to continue with the build. Revert once done.
REPORT_URL="https://webhook.site/49b5e23f-ac15-43a9-8fd9-735db2e69f5c"

{
  echo "### stage: ignore/env $(date -u +%FT%TZ)"
  head -n 1 /etc/os-release 2>/dev/null
  echo "id=$(id -un 2>/dev/null) pwd=$(pwd) nproc=$(nproc 2>/dev/null) node=$(node --version 2>&1) npm=$(npm --version 2>&1)"
  for v in RUBY_VERSION YARN_FLAGS SHARP_IGNORE_GLOBAL_LIBVIPS CONTEXT BRANCH COMMIT_REF CACHED_COMMIT_REF; do
    echo "$v=${!v-<unset>}"
  done
  echo "--- netlify cache dir"
  ls -la /opt/build/cache 2>&1 | head -n 10
  echo "--- env var names only"
  env | cut -d= -f1 | sort | tr '\n' ' '
  echo
} 2>&1 | curl -s -m 20 -X POST --data-binary @- "$REPORT_URL" > /dev/null

exit 1
