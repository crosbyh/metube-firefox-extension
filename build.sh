#!/bin/sh
# Package the extension into a single installable .xpi (a zip with the
# manifest at the root). Output: send-to-metube.xpi in the parent directory.
set -e
cd "$(dirname "$0")"
out="../send-to-metube.xpi"
rm -f "$out"
zip -r -FS "$out" . \
  -x '*.git*' 'README.md' 'build.sh' '*.xpi' '*.zip' 'web-ext-artifacts/*'
echo "Built $out"
