const fs = require('fs');
const path = require('path');

const docsDir = '/mnt/e/Klysera/People-Culture/docs';

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

    // Remove breadcrumb line if it exists (first line with pipes)
    const lines = content.split('\n');
    if (lines[0] && lines[0].includes('|') && lines[0].includes('**[')) {
        lines.shift(); // Remove the breadcrumb line
        // Also remove empty line after breadcrumb if exists
        if (lines[0] === '') {
            lines.shift();
        }
        content = lines.join('\n');
        modified = true;
        console.log(`Removed breadcrumb from: ${path.relative(docsDir, filePath)}`);
    }

    // Fix internal markdown links to use absolute paths from docs/
    // Pattern to match markdown links
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

    content = content.replace(linkPattern, (match, text, href) => {
        // Skip external links, anchors, and already absolute paths
        if (href.startsWith('http') ||
            href.startsWith('#') ||
            href.startsWith('docs/') ||
            href.startsWith('/')) {
            return match;
        }

        // Skip non-markdown files
        if (!href.endsWith('.md') && !href.includes('.md#')) {
            return match;
        }

        // Calculate absolute path from docs/
        const currentDir = path.dirname(filePath);
        const targetPath = path.resolve(currentDir, href);

        // Check if target exists
        if (!fs.existsSync(targetPath.split('#')[0])) {
            console.log(`  Warning: Link target not found: ${href} in ${path.relative(docsDir, filePath)}`);
            return match;
        }

        // Convert to relative path from docs directory
        let relativePath = path.relative(docsDir, targetPath);
        relativePath = 'docs/' + relativePath.replace(/\\/g, '/');

        console.log(`  Fixed link in ${path.relative(docsDir, filePath)}: ${href} -> ${relativePath}`);
        modified = true;
        return `[${text}](${relativePath})`;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.relative(docsDir, filePath)}`);
    }

    return modified;
}

// Main execution
console.log('Starting markdown documentation cleanup...\n');

const files = getAllMarkdownFiles(docsDir);
console.log(`Found ${files.length} markdown files\n`);

let totalModified = 0;
for (const file of files) {
    if (processFile(file)) {
        totalModified++;
    }
}

console.log(`\n✅ Processing complete!`);
console.log(`Modified ${totalModified} files out of ${files.length} total files.`);