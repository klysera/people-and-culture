const { chromium } = require('playwright');

async function finalMermaidTest() {
  console.log('🎯 Final Mermaid rendering test...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Enable console logging to see our debug messages
    page.on('console', msg => {
      if (msg.text().includes('mermaid') || msg.text().includes('Processing')) {
        console.log(`Browser: ${msg.text()}`);
      }
    });

    // Test the TIK Identity page
    console.log('🔍 Testing TIK Identity page...');
    await page.goto('https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for processing
    await page.waitForTimeout(5000);

    // Check results
    const results = await page.evaluate(() => {
      const mermaidElements = document.querySelectorAll('.mermaid');
      const containers = document.querySelectorAll('.mermaid-container');

      return {
        mermaidElements: mermaidElements.length,
        containers: containers.length,
        renderedSvgs: document.querySelectorAll('.mermaid svg').length,
        errorSvgs: document.querySelectorAll('svg[aria-roledescription="error"]').length,
        firstElementContent: mermaidElements[0] ? mermaidElements[0].textContent.substring(0, 100) : null,
        hasCorrectSyntax: mermaidElements[0] ? mermaidElements[0].textContent.includes('TIK((This Is Klysera))') : false
      };
    });

    console.log('Results:');
    console.log(`Mermaid elements: ${results.mermaidElements}`);
    console.log(`Containers: ${results.containers}`);
    console.log(`Rendered SVGs: ${results.renderedSvgs}`);
    console.log(`Error SVGs: ${results.errorSvgs}`);
    console.log(`Has correct syntax: ${results.hasCorrectSyntax}`);

    if (results.firstElementContent) {
      console.log('First element content (100 chars):', results.firstElementContent);
    }

    // Test if the diagrams are working
    const success = results.renderedSvgs > 0 && results.errorSvgs === 0;
    console.log(`\nOverall result: ${success ? '✅ SUCCESS' : '❌ STILL FAILING'}`);

    if (success) {
      console.log('🎉 Mermaid diagrams are now rendering correctly!');
    } else {
      console.log('💡 Diagrams still not working. May need more time for cache to clear.');
    }

    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/final-mermaid-test.png', fullPage: true });
    console.log('\n📸 Final test screenshot saved');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

finalMermaidTest().catch(console.error);