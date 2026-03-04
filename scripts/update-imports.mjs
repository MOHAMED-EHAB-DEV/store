import fs from "fs";
import path from "path";

const projectRoot = "d:\\my-store";
const searchDirs = ["app", "components", "lib", "constants"];
const newIconBase = "@/components/ui/svgs/icons";

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== "node_modules" && f !== ".next" && f !== ".git") {
        walk(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

function updateFileImports(filePath) {
  const ext = path.extname(filePath);
  if (![".tsx", ".ts", ".jsx", ".js"].includes(ext)) return;

  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  // Matches: import { Icon1, Icon2 } from '@/components/ui/svgs/Icons'
  // Also handles relative paths if they end in /Icons
  // Using [^}]+ instead of [\s\S]+? to avoid matching across multiple imports
  const importRegex =
    /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]*?\/svgs\/Icons)['"];?/g;

  const newContent = content.replace(
    importRegex,
    (match, namedImports, importPath) => {
      changed = true;
      const icons = namedImports
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i && !i.startsWith("//") && !i.startsWith("/*"));

      // We'll use the aliased path for consistency as it was likely used
      // If the original used relative, we could try to preserve it, but @/ is safer in Next.js
      return icons
        .map((icon) => `import { ${icon} } from "${newIconBase}/${icon}";`)
        .join("\n");
    },
  );

  if (changed) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated imports in: ${filePath}`);
  }
}

async function run() {
  console.log("Starting import update...");
  searchDirs.forEach((dir) => {
    const fullPath = path.join(projectRoot, dir);
    walk(fullPath, updateFileImports);
  });
  console.log("Import update complete.");
}

run();
