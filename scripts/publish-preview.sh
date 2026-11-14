#!/usr/bin/env bash
# Builds the web test version and publishes it to the gh-pages branch
# (https://scaffoldworks-ai.github.io/sca-alumni-app/).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
OUT="$(mktemp -d)"
cp app.json "$OUT/app.json.bak"
trap 'cp "$OUT/app.json.bak" "$ROOT/app.json"' EXIT
node -e "const f='app.json',d=require('./'+f);d.expo.experiments.baseUrl='/sca-alumni-app';require('fs').writeFileSync(f,JSON.stringify(d,null,2))"
CI=1 npx expo export --platform web --output-dir "$OUT/site"
cp "$OUT/site/index.html" "$OUT/site/404.html"
touch "$OUT/site/.nojekyll"
REMOTE="$(git remote get-url origin)"
cd "$OUT/site"
git init -q -b gh-pages
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -m "Web preview build"
git -c push.negotiate=true push -f "$REMOTE" gh-pages
