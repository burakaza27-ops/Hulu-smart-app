const fs = require('fs');
const path = require('path');

function walk(dir, list = []) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p, list);
    } else if (p.endsWith('.jsx')) {
      list.push(p);
    }
  });
  return list;
}

const files = walk('src');
const keys = new Set();
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Match t('key') or t("key") or t('key', 'fallback')
  const matches = [...content.matchAll(/t\(['"]([^'"]+)['"]/g)];
  matches.forEach(m => keys.add(m[1]));
});

const trans = fs.readFileSync('src/i18n/translations.js', 'utf8');
const missing = [];
keys.forEach(k => {
  if (!trans.includes(`'${k}':`) && !trans.includes(`"${k}":`)) {
    missing.push(k);
  }
});

console.log('Missing keys:', missing);
