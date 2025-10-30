const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixLinksInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix different patterns of problematic links
    const replacements = [
      // Home link
      { from: /\*\*\[\s*🏠\s*Home\s*\]\s*\(\.\./g, to: '**[Home](/' },
      { from: /\*\*\[\s*Home\s*\]\s*\(\.\./g, to: '**[Home](/' },

      // Navigation link
      { from: /\*\*\[\s*🧭\s*Navigation\s*\]\s*\(\.\./g, to: '**[Navigation](/' },
      { from: /\*\*\[\s*Navigation\s*\]\s*\(\.\./g, to: '**[Navigation](/' },

      // Culture Hub link
      { from: /\*\*\[\s*📚\s*Culture Hub\s*\]\s*\(\.\./g, to: '**[Culture Hub](/docs/Klysera/' },
      { from: /\*\*\[\s*Culture Hub\s*\]\s*\(\.\./g, to: '**[Culture Hub](/docs/Klysera/' },

      // Overview links - need to be context-aware
      { from: /\*\*\[\s*🎭\s*Culture\s*\]\s*\(\.\//g, to: '**[Culture](/docs/Klysera/Culture/' },
      { from: /\*\*\[\s*Culture\s*\]\s*\(\.\//g, to: '**[Culture](/docs/Klysera/Culture/' },

      // Leadership section
      { from: /\*\*\[\s*👑\s*Leadership\s*\]\s*\(\.\//g, to: '**[Leadership](/docs/Klysera/Leadership/' },
      { from: /\*\*\[\s*Leadership\s*\]\s*\(\.\//g, to: '**[Leadership](/docs/Klysera/Leadership/' },

      // Hiring section
      { from: /\*\*\[\s*🎯\s*Hiring\s*\]\s*\(\.\//g, to: '**[Hiring](/docs/Klysera/Hiring-Onboarding/' },
      { from: /\*\*\[\s*Hiring\s*\]\s*\(\.\//g, to: '**[Hiring](/docs/Klysera/Hiring-Onboarding/' },
    ];

    replacements.forEach(replacement => {
      const newContent = content.replace(replacement.from, replacement.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Additional specific fixes based on file location
    const relativePath = path.relative('docs/Klysera', filePath);

    // Fix README.md links to point to root
    content = content.replace(/\(\.\.\//g, '(/');
    content = content.replace(/README\.md/g, '#/');

    // Fix Culture-Hub.md links
    content = content.replace(/Culture-Hub\.md/g, 'Culture-Hub.md');

    if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing internal page links...');

  // Get all markdown files in docs/Klysera
  const docsPath = 'docs/Klysera';
  const files = execSync(`find ${docsPath} -name "*.md"`, { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.trim().length > 0);

  let fixedCount = 0;

  files.forEach(file => {
    if (fixLinksInFile(file)) {
      fixedCount++;
    }
  });

  console.log(`✅ Fixed links in ${fixedCount} files`);
}

main();