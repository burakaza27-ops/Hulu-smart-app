const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync('src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Global replacements for Framer Motion bottom sheet animations
  content = content.replace(/initial=\{\{\s*y:\s*['"]100\%['"]\s*\}\}/g, "initial={{ y: '100%', x: '-50%' }}");
  content = content.replace(/animate=\{\{\s*y:\s*0\s*\}\}/g, "animate={{ y: 0, x: '-50%' }}");
  content = content.replace(/exit=\{\{\s*y:\s*['"]100\%['"]\s*\}\}/g, "exit={{ y: '100%', x: '-50%' }}");

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed modals in', file);
    changedCount++;
  }
});

console.log(`Updated ${changedCount} files.`);
