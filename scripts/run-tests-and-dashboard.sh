#!/bin/bash
# run-tests-and-dashboard.sh
# Runs Playwright tests and generates dashboard data.
# Usage: bash scripts/run-tests-and-dashboard.sh [--push]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

echo "════════════════════════════════════════"
echo "  Shunyalabs Console — Test Runner"
echo "════════════════════════════════════════"

# Step 1: Run tests
echo ""
echo "▶ Running Playwright tests..."
npx playwright test || true

# Step 2: Generate dashboard data
echo ""
echo "▶ Generating dashboard data..."
node scripts/generate-dashboard.js

# Step 3: Optionally commit and push
if [ "$1" = "--push" ]; then
  echo ""
  echo "▶ Committing and pushing dashboard data..."
  git add docs/data/ docs/history/ docs/exports/ docs/artifacts/
  git commit -m "Update dashboard data — $(date '+%Y-%m-%d %H:%M')" || echo "No changes to commit"
  git push
  echo "✅ Dashboard data pushed to GitHub"
fi

echo ""
echo "════════════════════════════════════════"
echo "  Done! Open docs/index.html to preview"
echo "════════════════════════════════════════"
