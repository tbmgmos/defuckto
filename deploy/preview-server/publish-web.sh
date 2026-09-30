#!/usr/bin/env bash
set -euo pipefail

# Builds the web version of the app and publishes it to the Caddy-served
# builds directory, at https://$PREVIEW_DOMAIN/web/ — behind the same basic
# auth as the APK. This replaces the old GitHub Pages deploy: Pages needs a
# paid plan for private repos, and the demo should not be public anyway.
# Run on the Mac mini itself.

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUILDS_DIR="${BUILDS_DIR:-/srv/defuckto/builds}"
WEB_DIR="$BUILDS_DIR/web"
OUT_DIR="$(mktemp -d)"
trap 'rm -rf "$OUT_DIR"' EXIT

cd "$PROJECT_DIR"
# WEB_BASE_PATH is read by app.config.js so asset URLs get the /web prefix.
WEB_BASE_PATH=/web npx expo export --platform web --output-dir "$OUT_DIR"

mkdir -p "$WEB_DIR"
rsync -a --delete "$OUT_DIR"/ "$WEB_DIR"/

echo "Published: https://${PREVIEW_DOMAIN:-<your-domain>}/web/"
