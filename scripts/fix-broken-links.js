const fs = require('fs');
const path = require('path');

const docsDir = '/mnt/e/Klysera/People-Culture/docs';
let totalFixed = 0;

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

// Fix broken links in a file
function fixBrokenLinks(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(docsDir, filePath);
    let modified = false;

    // Common link fixes
    const linkFixes = [
        // Culture Hub link fix
        { from: 'docs/Klysera/Culture/Culture-Hub.md', to: 'docs/Klysera/Culture-Hub.md' },

        // Hiring-Onboarding links - remove leading 'docs/Klysera/' and add proper path
        { from: 'docs/Klysera/Onboarding-Journey.md', to: 'docs/Klysera/Hiring-Onboarding/Onboarding-Journey.md' },
        { from: 'docs/Klysera/Integration-Tools.md', to: 'docs/Klysera/Hiring-Onboarding/Integration-Tools.md' },
        { from: 'docs/Klysera/Hiring-Guide.md', to: 'docs/Klysera/Hiring-Onboarding/Hiring-Guide.md' },
        { from: 'docs/Klysera/TIK-Certification-Program.md', to: 'docs/Klysera/Hiring-Onboarding/TIK-Certification-Program.md' },
        { from: 'docs/Klysera/Certification-Tracking-Template.md', to: 'docs/Klysera/Hiring-Onboarding/Certification-Tracking-Template.md' },

        // Leadership links
        { from: 'docs/Klysera/Overview.md', to: 'docs/Klysera/Leadership/Overview.md' },
        { from: 'docs/Klysera/Leadership-Development.md', to: 'docs/Klysera/Leadership/Leadership-Development.md' },
        { from: 'docs/Klysera/Leadership-Tools.md', to: 'docs/Klysera/Leadership/Leadership-Tools.md' },
        { from: 'docs/Klysera/Leadership-Assessment.md', to: 'docs/Klysera/Leadership/Leadership-Assessment.md' },

        // Operating Principles links
        { from: 'docs/Klysera/Principles/01-Experimental-Mindset.md', to: 'docs/Klysera/Operating-Principles/Principles/01-Experimental-Mindset.md' },
        { from: 'docs/Klysera/Principles/02-Truth-Over-Comfort.md', to: 'docs/Klysera/Operating-Principles/Principles/02-Truth-Over-Comfort.md' },
        { from: 'docs/Klysera/Principles/03-Learn-Fast-Apply-Faster.md', to: 'docs/Klysera/Operating-Principles/Principles/03-Learn-Fast-Apply-Faster.md' },
        { from: 'docs/Klysera/Principles/04-Excellence-with-Warmth.md', to: 'docs/Klysera/Operating-Principles/Principles/04-Excellence-with-Warmth.md' },
        { from: 'docs/Klysera/Principles/05-Results-Over-Motion.md', to: 'docs/Klysera/Operating-Principles/Principles/05-Results-Over-Motion.md' },
        { from: 'docs/Klysera/Principles/06-Radical-Simplicity.md', to: 'docs/Klysera/Operating-Principles/Principles/06-Radical-Simplicity.md' },
        { from: 'docs/Klysera/Principles/07-Context-Not-Control.md', to: 'docs/Klysera/Operating-Principles/Principles/07-Context-Not-Control.md' },

        // Implementation links
        { from: 'docs/Klysera/Implementation/Quick-Start-Guide.md', to: 'docs/Klysera/Operating-Principles/Implementation/Quick-Start-Guide.md' },
        { from: 'docs/Klysera/Implementation/Leadership-Guide.md', to: 'docs/Klysera/Operating-Principles/Implementation/Leadership-Guide.md' },

        // Tools links
        { from: 'docs/Klysera/Tools/Quick-Reference-Cards.md', to: 'docs/Klysera/Operating-Principles/Tools/Quick-Reference-Cards.md' },
        { from: 'docs/Klysera/Tools/Decision-Framework.md', to: 'docs/Klysera/Operating-Principles/Tools/Decision-Framework.md' },
        { from: 'docs/Klysera/Tools/Daily-Rituals-Framework.md', to: 'docs/Klysera/Operating-Principles/Tools/Daily-Rituals-Framework.md' },
        { from: 'docs/Klysera/Tools/TIK-Language-Guide.md', to: 'docs/Klysera/Operating-Principles/Tools/TIK-Language-Guide.md' },
        { from: 'docs/Klysera/TIK-Language-Guide.md', to: 'docs/Klysera/Operating-Principles/Tools/TIK-Language-Guide.md' },

        // Measurement links
        { from: 'docs/Klysera/Measurement/Culture-Metrics.md', to: 'docs/Klysera/Operating-Principles/Measurement/Culture-Metrics.md' },

        // Playbook links
        { from: 'docs/Klysera/Communication-Guide.md', to: 'docs/Klysera/Playbook/Communication-Guide.md' },
        { from: 'docs/Klysera/Meeting-Culture.md', to: 'docs/Klysera/Playbook/Meeting-Culture.md' },
        { from: 'docs/Klysera/Decision-Framework.md', to: 'docs/Klysera/Playbook/Decision-Framework.md' },
        { from: 'docs/Klysera/Daily-Operations.md', to: 'docs/Klysera/Playbook/Daily-Operations.md' },
        { from: 'docs/Klysera/Policies-Guidelines.md', to: 'docs/Klysera/Playbook/Policies-Guidelines.md' },

        // Recognition-Rituals links
        { from: 'docs/Klysera/Recognition-Framework.md', to: 'docs/Klysera/Recognition-Rituals/Recognition-Framework.md' },
        { from: 'docs/Klysera/Daily-Rituals.md', to: 'docs/Klysera/Recognition-Rituals/Daily-Rituals.md' },
        { from: 'docs/Klysera/Special-Programs.md', to: 'docs/Klysera/Recognition-Rituals/Special-Programs.md' },

        // Roadmap link
        { from: 'docs/Klysera/2-Month-Operational-Roadmap.md', to: 'docs/Klysera/Roadmap/2-Month-Operational-Roadmap.md' },
    ];

    // Fix Overview.md ambiguity - context-aware replacement
    if (relativePath.includes('Playbook')) {
        content = content.replace(/docs\/Klysera\/Overview\.md/g, 'docs/Klysera/Playbook/Overview.md');
        modified = true;
    } else if (relativePath.includes('Leadership')) {
        content = content.replace(/docs\/Klysera\/Overview\.md/g, 'docs/Klysera/Leadership/Overview.md');
        modified = true;
    } else if (relativePath.includes('Hiring-Onboarding')) {
        content = content.replace(/docs\/Klysera\/Overview\.md/g, 'docs/Klysera/Hiring-Onboarding/Overview.md');
        modified = true;
    }

    // Apply all other fixes
    for (const fix of linkFixes) {
        if (content.includes(fix.from)) {
            content = content.replace(new RegExp(fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.to);
            console.log(`  Fixed: ${fix.from} → ${fix.to} in ${relativePath}`);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalFixed++;
    }

    return modified;
}

// Main execution
console.log('🔧 Fixing broken links in markdown documentation...\n');

const files = getAllMarkdownFiles(docsDir);
console.log(`Processing ${files.length} markdown files...\n`);

for (const file of files) {
    fixBrokenLinks(file);
}

console.log('\n' + '='.repeat(50));
console.log(`✅ Fixed links in ${totalFixed} files`);
console.log('='.repeat(50));