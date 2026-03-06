#!/bin/bash
# Mirror free OpenClaw skills into the in-repo library.
# Usage:
#   ./scripts/sync-openclaw-free-skills.sh [source_dir]
#
# Default source_dir: ./.agents/skills

set -euo pipefail

SOURCE_ROOT="${1:-./.agents/skills}"
DEST_ROOT="./skill-library/free"
PREFIX="openclaw-"

if [ ! -d "$SOURCE_ROOT" ]; then
  echo "Source skills directory not found: $SOURCE_ROOT"
  exit 1
fi

mkdir -p "$DEST_ROOT"

for skill_dir in "$SOURCE_ROOT"/*; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  skill_md="$skill_dir/SKILL.md"
  [ -f "$skill_md" ] || continue

  slug="${PREFIX}${skill_name}"
  dest_dir="$DEST_ROOT/$slug"

  rm -rf "$dest_dir"
  mkdir -p "$dest_dir"
  cp -R "$skill_dir"/. "$dest_dir/"
  echo "Mirrored $skill_name -> $dest_dir"
done

echo "Free skill sync complete."
