#!/bin/bash

set -euo pipefail

IMAGE_TAG="${1:-clawsrus/openclaw-runtime:2026.2.17-r1}"
OPENCLAW_VERSION="${OPENCLAW_VERSION:-2026.2.17}"

echo "Building ${IMAGE_TAG} (openclaw@${OPENCLAW_VERSION})"

docker build \
  -f docker/openclaw-runtime.Dockerfile \
  --build-arg OPENCLAW_VERSION="${OPENCLAW_VERSION}" \
  -t "${IMAGE_TAG}" \
  .

echo "Built ${IMAGE_TAG}"
