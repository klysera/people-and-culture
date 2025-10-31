const fs = require('fs');
const path = require('path');

const docsDir = '/mnt/e/Klysera/People-Culture/docs';
const projectRoot = '/mnt/e/Klysera/People-Culture';

// Get all markdown files
function getAllMarkdownFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllMarkdownFiles(fullPath, files);
        } else if (entry.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }
    return files;
}

// Process a single file
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const relativePath = path.relative(docsDir, filePath);

    // Pattern to match markdown links
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

    content = content.replace(linkPattern, (match, text, href) => {
        // Skip external links, anchors, and already correct paths
        if (href.startsWith('http') ||
            href.startsWith('#') ||
            href.startsWith('docs/') ||
            href.startsWith('/')) {
            return match;
        }

        // Skip non-markdown files and images
        if (!href.endsWith('.md') && !href.includes('.md#')) {
            return match;
        }

        // Handle relative paths
        const currentDir = path.dirname(filePath);
        let targetPath;

        // Check if it's a relative path
        if (href.startsWith('../') || href.startsWith('./') || !href.includes('/')) {
            targetPath = path.resolve(currentDir, href);
        } else {
            // It might be a path from project root
            targetPath = path.join(projectRoot, href);
            if (!fs.existsSync(targetPath.split('#')[0])) {
                // Try from docs directory
                targetPath = path.join(docsDir, href);
            }
        }

        // Extract anchor if present
        let anchor = '';
        if (targetPath.includes('#')) {
            const parts = targetPath.split('#');
            targetPath = parts[0];
            anchor = '#' + parts[1];
        }

        // Check if target exists
        if (!fs.existsSync(targetPath)) {
            // Try different possibilities
            const possiblePaths = [
                path.join(docsDir, 'Klysera', href),
                path.join(docsDir, 'Research', href),
                path.join(currentDir, href.split('#')[0])
            ];

            let found = false;
            for (const possible of possiblePaths) {
                if (fs.existsSync(possible)) {
                    targetPath = possible;
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.log(`  ⚠️  Link target not found: "${href}" in ${relativePath}`);
                return match;
            }
        }

        // Convert to path from docs directory
        if (targetPath.startsWith(docsDir)) {
            let newPath = 'docs/' + path.relative(docsDir, targetPath).replace(/\\/g, '/');
            newPath = newPath + anchor;

            if (href !== newPath) {
                console.log(`  ✓ Fixed: "${href}" → "${newPath}" in ${relativePath}`);
                modified = true;
                return `[${text}](${newPath})`;
            }
        }

        return match;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
}

// Main execution
console.log('🔍 Scanning for internal markdown links to fix...\n');

const files = getAllMarkdownFiles(docsDir);
console.log(`Found ${files.length} markdown files to check\n`);

let totalModified = 0;
let totalLinks = 0;

for (const file of files) {
    if (processFile(file)) {
        totalModified++;
    }
}

console.log(`\n✅ Link fixing complete!`);
console.log(`   Modified ${totalModified} files`);
console.log(`   Checked ${files.length} total files`);