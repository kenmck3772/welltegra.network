#!/bin/bash

# Playwright Test Runner Script for WellTegra Network

echo "🎭 WellTegra Network - Running Playwright Tests"
echo "=============================================="

# Set environment variables
export NODE_ENV=test

# Check if we should run against production
if [ "$1" = "--prod" ] || [ "$1" = "--production" ]; then
    echo "🌐 Running tests against production..."
    export PLAYWRIGHT_BASE_URL="https://welltegra.network"
else
    echo "🔧 Running tests against local server..."
    export PLAYWRIGHT_BASE_URL="http://localhost:8080"
fi

# Install browsers if needed
echo "📦 Checking Playwright browsers..."
npx playwright install --with-deps

# Run tests based on parameters
if [ "$2" = "--ui" ]; then
    echo "🎨 Running tests in UI mode..."
    npx playwright test --ui
elif [ "$2" = "--debug" ]; then
    echo "🐛 Running tests in debug mode..."
    npx playwright test --debug
elif [ "$2" = "--headed" ]; then
    echo "👁️ Running tests in headed mode..."
    npx playwright test --headed
elif [ "$2" = "--update-snapshots" ]; then
    echo "📷 Updating snapshots..."
    npx playwright test --update-snapshots
else
    echo "⚡ Running tests in headless mode..."
    npx playwright test
fi

# Show test results
echo ""
echo "📊 Test Results:"
echo "================="
npx playwright show-report

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed. Check the report above."
    exit 1
fi