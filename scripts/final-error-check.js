const { chromium } = require('playwright');

async function finalErrorCheck() {
  console.log('🎯 Final Mermaid error check with detailed logging...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const consoleMessages = [];

  try {
    // Capture console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    console.log('📡 Loading TIK Identity page...');
    await page.goto('https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for processing
    await page.waitForTimeout(5000);

    // Check final results
    const results = await page.evaluate(() => {
      const mermaidDiagrams = document.querySelectorAll('.mermaid-diagram');
      const mermaidElements = document.querySelectorAll('.mermaid');
      const svgElements = document.querySelectorAll('svg');
      const errorSvgs = document.querySelectorAll('svg[aria-roledescription="error"]');

      return {
        mermaidDiagrams: mermaidDiagrams.length,
        mermaidElements: mermaidElements.length,
        totalSvgs: svgElements.length,
        errorSvgs: errorSvgs.length,
        successfulSvgs: svgElements.length - errorSvgs.length,
        elements: Array.from(mermaidElements).map((el, index) => ({
          index: index,
          id: el.id,
          hasDataProcessed: el.hasAttribute('data-processed'),
          textContent: el.textContent.substring(0, 100),
          hasSvg: !!el.querySelector('svg'),
          svgError: el.querySelector('svg') ? el.querySelector('svg').getAttribute('aria-roledescription') : null
        }))
      };
    });

    console.log('📊 FINAL RESULTS:');
    console.log(`Mermaid diagram elements: ${results.mermaidDiagrams}`);
    console.log(`Mermaid elements: ${results.mermaidElements}`);
    console.log(`Total SVGs: ${results.totalSvgs}`);
    console.log(`Error SVGs: ${results.errorSvgs}`);
    console.log(`Successful SVGs: ${results.successfulSvgs}`);

    console.log('\n📋 ELEMENT DETAILS:');
    results.elements.forEach(el => {
      console.log(`Element ${el.index}:`);
      console.log(`  ID: ${el.id}`);
      console.log(`  Has data-processed: ${el.hasDataProcessed}`);
      console.log(`  Has SVG: ${el.hasSvg}`);
      console.log(`  SVG Status: ${el.svgError || 'success'}`);
      console.log(`  Content: ${el.textContent}...`);
    });

    console.log('\n📋 RELEVANT CONSOLE MESSAGES:');
    consoleMessages
      .filter(msg =>
        msg.text.toLowerCase().includes('mermaid') ||
        msg.text.toLowerCase().includes('error') ||
        msg.text.toLowerCase().includes('invalid') ||
        msg.type === 'error'
      )
      .forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
      });

    // Overall assessment
    const success = results.successfulSvgs > 0 && results.errorSvgs === 0;

    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('🎉 SUCCESS! Mermaid diagrams are rendering correctly!');
      console.log(`✅ ${results.successfulSvgs} diagrams rendered successfully`);
      console.log('❌ 0 errors');
    } else {
      console.log('❌ Still having issues:');
      console.log(`✅ ${results.successfulSvgs} successful diagrams`);
      console.log(`❌ ${results.errorSvgs} error diagrams`);

      if (results.errorSvgs > 0) {
        console.log('\n💡 DEBUGGING SUGGESTIONS:');
        console.log('1. Check if content preservation is working');
        console.log('2. Verify diagram syntax is valid');
        console.log('3. Check for content corruption during processing');
      }
    }
    console.log('='.repeat(60));

    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/final-mermaid-check.png', fullPage: true });
    console.log('\n📸 Final screenshot saved');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

finalErrorCheck().catch(console.error);