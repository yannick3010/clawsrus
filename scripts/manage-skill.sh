#!/bin/bash
# Usage:
#   ./manage-skill.sh <user-id> install <skill-slug> <source-dir>
#   ./manage-skill.sh <user-id> uninstall <skill-slug>
#   ./manage-skill.sh <user-id> lock <skill-slug>
#   ./manage-skill.sh <user-id> unlock <skill-slug>

set -euo pipefail

USER_ID="${1:-}"
ACTION="${2:-}"
SKILL_SLUG="${3:-}"
SOURCE_DIR="${4:-}"

if [ -z "$USER_ID" ] || [ -z "$ACTION" ] || [ -z "$SKILL_SLUG" ]; then
  echo "Usage: ./manage-skill.sh <user-id> <install|uninstall|lock|unlock> <skill-slug> [source-dir]"
  exit 1
fi

if [[ ! "$SKILL_SLUG" =~ ^[a-z0-9-]+$ ]]; then
  echo "Invalid skill slug: $SKILL_SLUG"
  exit 1
fi

BASE_DIR="/opt/clawsrus/customers/$USER_ID"
WORKSPACE_DIR="$BASE_DIR/openclaw/workspace"
TARGET_SKILLS_DIR="$WORKSPACE_DIR/.agents/skills"
LOCKED_SKILLS_DIR="$WORKSPACE_DIR/.agents/skills-locked"
TARGET_DIR="$TARGET_SKILLS_DIR/$SKILL_SLUG"
LOCKED_DIR="$LOCKED_SKILLS_DIR/$SKILL_SLUG"
CONTAINER_NAME="clawsrus-${USER_ID}"

if [ ! -d "$WORKSPACE_DIR" ]; then
  echo "Workspace directory not found: $WORKSPACE_DIR"
  exit 1
fi

mkdir -p "$TARGET_SKILLS_DIR" "$LOCKED_SKILLS_DIR"

restart_container() {
  if ! docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
    echo "Container not found: $CONTAINER_NAME"
    exit 1
  fi

  docker restart "$CONTAINER_NAME" >/dev/null
}

case "$ACTION" in
  install)
    if [ -z "$SOURCE_DIR" ]; then
      echo "Source directory is required for install"
      exit 1
    fi

    if [ ! -d "$SOURCE_DIR" ]; then
      echo "Source skill directory not found: $SOURCE_DIR"
      exit 1
    fi

    if [ ! -f "$SOURCE_DIR/SKILL.md" ]; then
      echo "Source skill is missing SKILL.md: $SOURCE_DIR"
      exit 1
    fi

    rm -rf "$TARGET_DIR" "$LOCKED_DIR"
    mkdir -p "$TARGET_DIR"
    cp -R "$SOURCE_DIR"/. "$TARGET_DIR/"
    ;;
  uninstall)
    rm -rf "$TARGET_DIR" "$LOCKED_DIR"
    ;;
  lock)
    if [ -d "$TARGET_DIR" ]; then
      rm -rf "$LOCKED_DIR"
      mv "$TARGET_DIR" "$LOCKED_DIR"
    fi
    ;;
  unlock)
    if [ -d "$LOCKED_DIR" ]; then
      rm -rf "$TARGET_DIR"
      mv "$LOCKED_DIR" "$TARGET_DIR"
    fi
    ;;
  *)
    echo "Unknown action: $ACTION"
    exit 1
    ;;
esac

restart_container
echo "Skill action complete: $ACTION $SKILL_SLUG for $USER_ID"
