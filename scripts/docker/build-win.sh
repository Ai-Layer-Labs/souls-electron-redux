#!/bin/bash

echo "Building Docker image..."
docker build \
  -f docker/win-build/Dockerfile \
  -t souls-builder-win:latest .

echo "Building Windows executable..."
docker run --rm \
  -v ${PWD}/release:/app/release \
  souls-builder-win:latest

echo "Build complete! Check the release folder for output." 