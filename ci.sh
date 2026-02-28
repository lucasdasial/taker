#!/bin/bash

set -e  # Para o script se algum comando falhar

echo "🔍 Running lint..."
npm run lint:fix

echo "🧪 Running tests..."
npm run test

echo "✅ CI finished successfully!"