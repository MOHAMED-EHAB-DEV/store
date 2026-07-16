const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'lib'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

let allFiles = [];
targetDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    allFiles = allFiles.concat(walk(fullPath));
  }
});

let updatedCount = 0;

allFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  
  // First, remove whole line if it contains only unoptimized (and optional props)
  let newContent = content.replace(/^[ \t]*\bunoptimized\b(?:=\{[^}]*\})?[ \t]*\r?\n/gm, '');
  
  // Second, remove inline unoptimized
  newContent = newContent.replace(/[ \t]+\bunoptimized\b(?:=\{[^}]*\})?/g, '');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${path.relative(path.join(__dirname, '..'), file)}`);
    updatedCount++;
  }
});

console.log(`Done. Updated ${updatedCount} files.`);
