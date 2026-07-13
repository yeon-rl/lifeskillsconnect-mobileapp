#!/bin/bash

# ============================================================
# iOS Build Script - Auto-increments build number each run
# Usage: bash scripts/build-ios.sh [profile]
#   profile: production (default) | preview | development
# ============================================================

APP_JSON="app.json"
PROFILE="${1:-production}"

# Read current build number
CURRENT_BUILD=$(node -e "const a=require('./${APP_JSON}'); console.log(a.expo.ios.buildNumber)")
NEW_BUILD=$((CURRENT_BUILD + 1))

echo "🔢 Build number: $CURRENT_BUILD → $NEW_BUILD"

# Update app.json with new build number
node -e "
  const fs = require('fs');
  const path = './${APP_JSON}';
  const app = JSON.parse(fs.readFileSync(path, 'utf8'));
  app.expo.ios.buildNumber = String($NEW_BUILD);
  fs.writeFileSync(path, JSON.stringify(app, null, 2) + '\n');
  console.log('✅ app.json updated');
"

echo "🚀 Starting EAS build for iOS (profile: $PROFILE)..."
npx eas-cli build --platform ios --profile $PROFILE

echo ""
echo "✅ Done! Build number is now $NEW_BUILD"
