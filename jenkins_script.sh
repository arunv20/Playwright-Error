#!/bin/bash

echo "🔧 Installing dependencies..."
npm ci

echo "📦 Installing Playwright browsers (with dependencies)..."
npx playwright install --with-deps

echo "🧪 Running Playwright tests..."
npx playwright test

echo "📄 Showing the error report..."
cat playwright-error-report.txt
