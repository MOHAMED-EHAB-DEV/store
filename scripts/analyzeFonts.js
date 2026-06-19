import fs from 'fs';
import path from 'path';

const projectDir = 'd:/my-store';

const fontClasses = [
  'font-thin',
  'font-extralight',
  'font-light',
  'font-normal',
  'font-medium',
  'font-semibold',
  'font-bold',
  'font-extrabold',
  'font-black'
];

const results = {
  global: {}, // Roboto
  parastoo: {} // Parastoo
};

fontClasses.forEach(cls => {
  results.global[cls] = 0;
  results.parastoo[cls] = 0;
});

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkDir(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Regex to find font classes in className strings or HTML
      fontClasses.forEach(cls => {
        const regex = new RegExp(`\\b${cls}\\b`, 'g');
        const matches = content.match(regex);
        if (matches) {
          // Check if this file or specific line uses font-paras
          // For simplicity, if the file contains "font-paras", let's analyze line-by-line
          const lines = content.split('\n');
          lines.forEach(line => {
            const lineMatches = line.match(regex);
            if (lineMatches) {
              if (line.includes('font-paras')) {
                results.parastoo[cls] += lineMatches.length;
              } else {
                results.global[cls] += lineMatches.length;
              }
            }
          });
        }
      });
    }
  }
}

walkDir(projectDir);
console.log(JSON.stringify(results, null, 2));

