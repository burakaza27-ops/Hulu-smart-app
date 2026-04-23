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
let c = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Need to remove x: '-50%' from initial={{ y: '100%', x: '-50%' }} to initial={{ y: '100%' }}
  // And animate={{ y: 0, x: '-50%' }} to animate={{ y: 0 }}
  
  content = content.replace(/,\s*x:\s*['-]-50%['-]/g, '');
  content = content.replace(/x:\s*['-]-50%['-],\s*/g, '');
  content = content.replace(/x:\s*['-]-50%['-]/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    c++;
    console.log('Fixed', file);
  }
});
console.log('Reverted modals in ' + c + ' files.');
