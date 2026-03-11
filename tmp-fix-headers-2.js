import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

const files = [
    "app/(admin)/admin/visitors/[id]/page.tsx",
    "app/(admin)/admin/users/page.tsx",
    "app/(admin)/admin/support/page.tsx",
    "app/(admin)/admin/users/[id]/page.tsx",
    "app/(admin)/admin/page.tsx",
    "app/(admin)/admin/faqs/page.tsx",
    "app/(admin)/admin/download-logs/page.tsx",
    "app/(admin)/admin/error-logs/page.tsx",
    "app/(admin)/admin/categories/page.tsx",
    "app/(admin)/admin/categories/new/page.tsx",
    "app/(admin)/admin/categories/edit/[id]/page.tsx",
    "app/(admin)/admin/faqs/edit/[id]/page.tsx",
    "app/(admin)/admin/blogs/page.tsx",
    "app/(admin)/admin/blogs/edit/[id]/page.tsx"
];

let fixedFiles = 0;

for (const f of files) {
    const filePath = path.join(__dirname, f);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Some might be formatted as `headers: await headers(),`
    // Others might be formatting differently.
    const regex = /headers:\s*await\s*headers\(\),?/g;
    if (content.match(regex)) {
        content = content.replace(regex, 'headers: { Cookie: (await headers()).get("cookie") || "" },');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', f);
        fixedFiles++;
    }
}
console.log('Total fixed files:', fixedFiles);
