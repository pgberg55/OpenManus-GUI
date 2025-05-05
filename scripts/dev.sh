#!/bin/bash

# Exit on error
set -e

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check if Python virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
  echo "Activating Python virtual environment..."
  source .venv/bin/activate
fi

# Start FastAPI server in the background
echo "Starting FastAPI server on port 5400..."
cd apps/api
python -m uvicorn main:app --host 0.0.0.0 --port 5400 --reload &
FASTAPI_PID=$!

# Function to kill background processes on exit
cleanup() {
  echo "Shutting down FastAPI server (PID: $FASTAPI_PID)..."
  kill $FASTAPI_PID 2>/dev/null || true
  exit 0
}

# Register the cleanup function to be called on exit
trap cleanup EXIT INT TERM

# Wait for FastAPI to start
echo "Waiting for FastAPI to start..."
sleep 2

# Start Tauri app in development mode
echo "Starting Tauri app in development mode..."
cd ../desktop
pnpm dev

# This point is reached when the Tauri app is closed
echo "Tauri app closed. Shutting down..."