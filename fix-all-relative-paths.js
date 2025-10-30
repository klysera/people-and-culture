const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixAllRelativePathsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const originalContent = content;

    // Get the relative path from docs/Klysera to understand current location
    const relativePath = path.relative('docs/Klysera', filePath);
    const depth = relativePath.split('/').length - 1;

    console.log(`Processing: ${filePath} (depth: ${depth})`);

    // Fix different types of relative links based on current file location

    // 1. Fix ./Something links to docs/Klysera/Something
    content = content.replace(/\]\(\.\/([^)]+\.md)\)/g, '](docs/Klysera/$1)');

    // 2. Fix links that should point to root files
    content = content.replace(/\]\(\.\/FILE-STRUCTURE\.md\)/g, '](docs/Klysera/FILE-STRUCTURE.md)');
    content = content.replace(/\]\(\.\/README\.md\)/g, '](README.md)');

    // 3. Fix home and navigation links
    content = content.replace(/\]\(\.\/\#\/\)/g, '](#/)');

    // 4. Fix links that go up levels and then down (../something)
    content = content.replace(/\]\(\.\.\/([^)]+\.md)\)/g, '](docs/Klysera/$1)');

    // 5. Fix Research links specifically
    content = content.replace(/\]\(\/Research\//g, '](Research/');

    // 6. Fix any remaining ./something that should be absolute
    content = content.replace(/\]\(\.\/([^)#]+)\)/g, (match, captured) => {
      if (captured.includes('#')) {
        return match; // Keep fragment links as is
      }
      return `](docs/Klysera/${captured})`;
    });

    // 7. Specific fixes for breadcrumb navigation
    content = content.replace(/\*\*\[Home\]\(\.\/\#\/\)\*\*/g, '**[Home](#/)**');
    content = content.replace(/\*\*\[Navigation\]\(\.\/\#\/\)\*\*/g, '**[Navigation](#/)**');

    // 8. Fix Culture Hub references
    content = content.replace(/\[Culture Hub\]\(\.\/Culture-Hub\.md\)/g, '[Culture Hub](docs/Klysera/Culture-Hub.md)');
    content = content.replace(/\[← Back to Culture Hub\]\(\/Culture-Hub\.md\)/g, '[← Back to Culture Hub](docs/Klysera/Culture-Hub.md)');

    // 9. Fix specific patterns that might be wrong
    content = content.replace(/docs\/Klysera\/\//, 'docs/Klysera/');
    content = content.replace(/docs\/Klysera\/docs\/Klysera\//, 'docs/Klysera/');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Fixed relative paths in: ${filePath}`);
      return true;
    } else {
      console.log(`  ➖ No changes needed: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing ALL remaining relative paths in docs folder...');

  // Get all markdown files in docs folder recursively
  const docsPath = 'docs';

  try {
    const files = execSync(`find ${docsPath} -name "*.md" -type f`, { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim().length > 0);

    console.log(`Found ${files.length} markdown files to process\n`);

    let fixedCount = 0;

    files.forEach(file => {
      if (fixAllRelativePathsInFile(file)) {
        fixedCount++;
      }
    });

    console.log(`\n✅ Fixed relative paths in ${fixedCount} files`);
    console.log('🎯 All paths should now start with "docs/" or be proper absolute paths');

  } catch (error) {
    console.error('❌ Error getting file list:', error.message);
  }
}

main();