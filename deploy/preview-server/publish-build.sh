#!/usr/bin/env bash
set -euo pipefail

# Builds the Android preview APK locally on this Mac and publishes it to the
# Caddy-served builds directory so testers can download it from PREVIEW_DOMAIN.
# Run on the Mac mini itself (needs the eas-cli and Android SDK set up).

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUILDS_DIR="${BUILDS_DIR:-/srv/defuckto/builds}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="/tmp/defuckto-${TIMESTAMP}.apk"

cd "$PROJECT_DIR"
npx eas-cli build --local --profile preview --platform android --non-interactive --output "$OUT_FILE"

mkdir -p "$BUILDS_DIR/archive"
cp "$OUT_FILE" "$BUILDS_DIR/archive/defuckto-${TIMESTAMP}.apk"
cp "$OUT_FILE" "$BUILDS_DIR/latest.apk"
rm -f "$OUT_FILE"

echo "Published: https://${PREVIEW_DOMAIN:-<your-domain>}/latest.apk"
