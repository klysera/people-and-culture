const { chromium } = require('playwright');

async function debugMermaidLive() {
  console.log('🔍 Debugging Mermaid rendering on live GitHub Pages site...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Enable console logging
    page.on('console', msg => {
      console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
    });

    // Capture JavaScript errors
    page.on('pageerror', error => {
      console.error(`JavaScript Error: ${error.message}`);
    });

    // Navigate to live GitHub Pages site
    const siteUrl = 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity';
    console.log(`Testing live site: ${siteUrl}`);

    await page.goto(siteUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Check for Mermaid elements
    const mermaidElements = await page.$$('.mermaid');
    console.log(`Found ${mermaidElements.length} mermaid elements`);

    if (mermaidElements.length > 0) {
      // Check each mermaid element
      for (let i = 0; i < mermaidElements.length; i++) {
        const element = mermaidElements[i];

        // Get the text content
        const textContent = await element.textContent();
        console.log(`\nMermaid Element ${i + 1}:`);
        console.log('Text Content:', textContent.substring(0, 200) + '...');

        // Check if it has SVG (rendered)
        const svg = await element.$('svg');
        if (svg) {
          console.log('✅ Successfully rendered as SVG');
        } else {
          console.log('❌ Not rendered - still showing text');

          // Check for error messages
          const errorMsg = await element.$eval('*', el => el.innerHTML).catch(() => null);
          if (errorMsg && errorMsg.includes('error')) {
            console.log('Error message found:', errorMsg);
          }
        }

        // Get computed styles
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity
          };
        });
        console.log('Element styles:', styles);
      }
    }

    // Check if Mermaid library is loaded
    const mermaidLoaded = await page.evaluate(() => {
      return typeof window.mermaid !== 'undefined';
    });
    console.log(`\nMermaid library loaded: ${mermaidLoaded}`);

    if (mermaidLoaded) {
      // Get Mermaid version and config
      const mermaidInfo = await page.evaluate(() => {
        return {
          version: window.mermaid.version || 'unknown',
          config: window.mermaid.getConfig ? window.mermaid.getConfig() : 'unavailable'
        };
      });
      console.log('Mermaid version:', mermaidInfo.version);
      console.log('Mermaid config:', JSON.stringify(mermaidInfo.config, null, 2));
    }

    // Check for any Mermaid-related errors in the console
    const consoleErrors = await page.evaluate(() => {
      return window.__mermaidErrors || [];
    });

    if (consoleErrors.length > 0) {
      console.log('\nMermaid Errors Found:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Try to manually render a simple diagram
    console.log('\n🧪 Testing manual Mermaid rendering...');

    const manualTest = await page.evaluate(() => {
      if (typeof window.mermaid === 'undefined') {
        return { success: false, error: 'Mermaid not loaded' };
      }

      try {
        // Create a test element
        const testDiv = document.createElement('div');
        testDiv.className = 'mermaid-test';
        testDiv.innerHTML = 'graph TD\n    A[Start] --> B[End]';
        document.body.appendChild(testDiv);

        // Try to render
        window.mermaid.init(undefined, testDiv);

        // Check if it worked
        const hasSvg = testDiv.querySelector('svg') !== null;
        return { success: hasSvg, error: hasSvg ? null : 'No SVG generated' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    console.log('Manual test result:', manualTest);

    // Take screenshot for debugging
    await page.screenshot({ path: 'tests/screenshots/mermaid-debug.png', fullPage: true });
    console.log('\n📸 Debug screenshot saved to tests/screenshots/mermaid-debug.png');

    // Test another page with different diagrams
    console.log('\n🔄 Testing another page...');
    await page.goto('https://klysera.github.io/people-and-culture/#/docs/Klysera/Leadership/Overview', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(2000);

    const leadershipMermaid = await page.$$('.mermaid');
    console.log(`Found ${leadershipMermaid.length} mermaid elements on Leadership page`);

    if (leadershipMermaid.length > 0) {
      const leadershipSvg = await leadershipMermaid[0].$('svg');
      console.log(`Leadership page diagram rendered: ${leadershipSvg ? 'Yes' : 'No'}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the debug test
debugMermaidLive().catch(console.error);