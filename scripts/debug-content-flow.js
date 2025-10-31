const { chromium } = require('playwright');

async function debugContentFlow() {
  console.log('🔍 Debugging complete content flow...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Inject debugging into the page
    await page.addInitScript(() => {
      window.debugLog = [];

      // Override the beforeEach hook to log what's happening
      const originalLog = console.log;
      console.log = function(...args) {
        if (args.some(arg => arg && arg.toString().includes('mermaid'))) {
          window.debugLog.push({ type: 'log', args: args.map(a => a.toString()) });
        }
        return originalLog.apply(console, args);
      };

      const originalWarn = console.warn;
      console.warn = function(...args) {
        window.debugLog.push({ type: 'warn', args: args.map(a => a.toString()) });
        return originalWarn.apply(console, args);
      };

      const originalError = console.error;
      console.error = function(...args) {
        window.debugLog.push({ type: 'error', args: args.map(a => a.toString()) });
        return originalError.apply(console, args);
      };
    });

    console.log('📡 Loading TIK Identity page...');
    await page.goto('https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for processing
    await page.waitForTimeout(3000);

    // Get the debug log
    const debugLog = await page.evaluate(() => window.debugLog);

    console.log('\n📋 DEBUG LOG FROM BROWSER:');
    debugLog.forEach((entry, index) => {
      console.log(`${index + 1}. [${entry.type.toUpperCase()}] ${entry.args.join(' ')}`);
    });

    // Get the raw HTML source to see what Docsify is actually processing
    const rawContent = await page.evaluate(() => {
      // Get the main content div
      const content = document.querySelector('.content .markdown-section');
      if (!content) return 'No content found';

      return content.innerHTML;
    });

    // Look for mermaid patterns in the raw HTML
    console.log('\n🔍 CHECKING RAW HTML CONTENT:');

    const mermaidMatches = rawContent.match(/```mermaid[\s\S]*?```/g);
    if (mermaidMatches) {
      console.log(`Found ${mermaidMatches.length} mermaid blocks in raw HTML:`);
      mermaidMatches.forEach((match, index) => {
        console.log(`\nBlock ${index + 1}:`);
        console.log(match.substring(0, 200) + '...');
      });
    } else {
      console.log('No ```mermaid blocks found in raw HTML');
    }

    // Check for mermaid-container divs
    const containerMatches = rawContent.match(/<div class="mermaid-container"[\s\S]*?<\/div>/g);
    if (containerMatches) {
      console.log(`\nFound ${containerMatches.length} mermaid-container divs:`);
      containerMatches.forEach((match, index) => {
        console.log(`\nContainer ${index + 1}:`);
        console.log(match.substring(0, 300) + '...');
      });
    } else {
      console.log('No mermaid-container divs found');
    }

    // Check the actual content in the mermaid elements
    const elementContents = await page.evaluate(() => {
      const elements = document.querySelectorAll('.mermaid');
      return Array.from(elements).map((el, index) => ({
        index: index,
        id: el.id,
        innerHTML: el.innerHTML.substring(0, 500),
        textContent: el.textContent.substring(0, 500),
        outerHTML: el.outerHTML.substring(0, 600)
      }));
    });

    console.log('\n📊 ACTUAL MERMAID ELEMENT CONTENTS:');
    elementContents.forEach(el => {
      console.log(`\nElement ${el.index} (ID: ${el.id}):`);
      console.log('OuterHTML:', el.outerHTML);
      console.log('TextContent:', el.textContent);
    });

    // Try to manually test our regex on the raw markdown
    console.log('\n🧪 TESTING REGEX ON RAW MARKDOWN:');

    // Fetch the raw markdown file
    const markdownResponse = await fetch('https://raw.githubusercontent.com/klysera/people-and-culture/main/docs/Klysera/Culture/TIK-Identity.md');
    const markdownText = await markdownResponse.text();

    console.log('Raw markdown (first 500 chars):');
    console.log(markdownText.substring(0, 500));

    // Test our regex
    const regex = /```mermaid\r?\n([\s\S]*?)```/g;
    const matches = [];
    let match;

    while ((match = regex.exec(markdownText)) !== null) {
      matches.push(match[1].trim());
    }

    console.log(`\nRegex found ${matches.length} matches:`);
    matches.forEach((match, index) => {
      console.log(`\nMatch ${index + 1}:`);
      console.log(match.substring(0, 200) + '...');
    });

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugContentFlow().catch(console.error);