import fs from "fs";
import path from "path";

const sourceFile = "d:\\my-store\\components\\ui\\svgs\\Icons.tsx";
const outputDir = "d:\\my-store\\components\\ui\\svgs\\icons";

async function splitIcons() {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const content = fs.readFileSync(sourceFile, "utf8");

    // Extract Props type - handling potential variations
    const propsMatch = content.match(/type Props = \{[\s\S]*?\};/);
    const propsType = propsMatch
      ? propsMatch[0]
      : "type Props = { className?: string; isActive?: boolean };";

    // Extract exported names from the export { ... } block
    const exportBlockMatch = content.match(/export\s*\{([\s\S]+?)\};/);
    const exportedNames = exportBlockMatch
      ? exportBlockMatch[1]
          .split(",")
          .map((n) => n.trim())
          .filter((n) => n)
      : [];

    // Manual list of icons to find, including those explicitly exported with 'export const'
    const iconNames = new Set(exportedNames);
    const exportConstNames = [...content.matchAll(/export const (\w+)/g)].map(
      (m) => m[1],
    );
    exportConstNames.forEach((name) => iconNames.add(name));

    console.log(`Found ${iconNames.size} icons to split.`);

    const iconMap = new Map();

    // Regex that tries to capture the arrow function component
    // It looks for "const/export const Name = (props) => ( ... )" or "{ ... }"
    // This is a bit complex due to nested parens/braces in SVGs.
    // We'll use a simpler approach: finding the start of each icon and taking everything until the next one or the end block.

    for (const name of iconNames) {
      // Look for "const Name =" or "export const Name ="
      const startRegex = new RegExp(
        `(?:const|export const)\\s+${name}\\s*=`,
        "g",
      );
      const startMatch = startRegex.exec(content);

      if (startMatch) {
        const startIdx = startMatch.index;
        // Find where the next icon starts or where the export block starts
        let endIdx = content.length;

        // Possible "next" points
        const nextIcons = [
          ...content.matchAll(/(?:const|export const)\s+(\w+)\s*=/g),
        ]
          .map((m) => m.index)
          .filter((idx) => idx > startIdx);

        if (nextIcons.length > 0) {
          endIdx = Math.min(...nextIcons);
        }

        const exportBlockStart = content.indexOf("export {");
        if (exportBlockStart > startIdx && exportBlockStart < endIdx) {
          endIdx = exportBlockStart;
        }

        let iconCode = content.substring(startIdx, endIdx).trim();

        // Cleanup: remove trailing semicolons if they belong to the next line or are just extra
        // Most components here end with ); or };
        // We'll try to find the last ) or } that closes the component
        const lastBrace = Math.max(
          iconCode.lastIndexOf(")"),
          iconCode.lastIndexOf("}"),
        );
        if (lastBrace !== -1) {
          // Check if there's a semicolon after it
          if (iconCode[lastBrace + 1] === ";") {
            iconCode = iconCode.substring(0, lastBrace + 2);
          } else {
            iconCode = iconCode.substring(0, lastBrace + 1);
          }
        }

        // Ensure it's exported
        if (!iconCode.startsWith("export ")) {
          iconCode = "export " + iconCode;
        }

        iconMap.set(name, iconCode);
      }
    }

    for (const [name, iconCode] of iconMap) {
      const fileContent = `${propsType}\n\n${iconCode}\n`;
      fs.writeFileSync(path.join(outputDir, `${name}.tsx`), fileContent);
    }

    console.log(`Successfully split ${iconMap.size} icons into ${outputDir}`);

    // Create an index.ts for convenience (optional but recommended)
    const indexContent =
      Array.from(iconMap.keys())
        .map((name) => `export * from "./${name}";`)
        .join("\n") + "\n";
    fs.writeFileSync(path.join(outputDir, "index.ts"), indexContent);
    console.log("Created index.ts for icons folder.");
  } catch (error) {
    console.error("Error splitting icons:", error);
  }
}

splitIcons();
