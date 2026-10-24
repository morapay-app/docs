#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."
rm -rf out export.zip
pnpm exec mint export --output export.zip
mkdir -p out
unzip -qo export.zip -d out
