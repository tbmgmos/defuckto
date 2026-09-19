#!/usr/bin/env bash
# PostToolUse hook: after Claude edits a TS/TSX file in the project, run the
# typechecker and feed any errors back so they get fixed in the same turn.
# Exit 0 = fine (or not a TS file). Exit 2 = type errors, stderr goes to Claude.

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

FILE="$(node -e '
  let s = "";
  process.stdin.on("data", (d) => (s += d)).on("end", () => {
    try {
      const j = JSON.parse(s);
      process.stdout.write((j.tool_input && j.tool_input.file_path) || "");
    } catch (e) {}
  });
')"

case "$FILE" in
  "$PROJECT_DIR"/src/*.ts | "$PROJECT_DIR"/src/*.tsx | "$PROJECT_DIR"/src/**/*.ts | "$PROJECT_DIR"/src/**/*.tsx | \
  "$PROJECT_DIR"/App.tsx | "$PROJECT_DIR"/index.ts) ;;
  *) exit 0 ;;
esac

cd "$PROJECT_DIR" || exit 0
[ -d node_modules ] || { echo "typecheck skipped: run 'npm ci' first" >&2; exit 0; }

mkdir -p node_modules/.cache
OUT="$(npx tsc --noEmit --incremental --tsBuildInfoFile node_modules/.cache/tsc.tsbuildinfo 2>&1)"
STATUS=$?

if [ $STATUS -ne 0 ]; then
  {
    echo "TypeScript errors after editing ${FILE#"$PROJECT_DIR"/}:"
    echo "$OUT" | head -40
  } >&2
  exit 2
fi
exit 0
