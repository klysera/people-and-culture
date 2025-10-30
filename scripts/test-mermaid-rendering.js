const { chromium } = require('playwright');

async function testMermaidRendering() {
  console.log('🔍 Testing Mermaid diagram rendering on Klysera People & Culture site...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  try {
    // Test local site
    console.log('Testing local site at http://localhost:3000...');

    // Navigate to a page with Mermaid diagrams
    await page.goto('http://localhost:3000/#/docs/Klysera/Leadership/Overview', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for Mermaid to render
    await page.waitForTimeout(2000);

    // Check if Mermaid diagrams are rendered
    const mermaidElements = await page.$$eval('.mermaid svg', elements => elements.length);
    const mermaidContainers = await page.$$eval('.mermaid-container', elements => elements.length);

    if (mermaidElements > 0) {
      console.log(`✅ Found ${mermaidElements} rendered Mermaid diagrams`);
      console.log(`✅ Found ${mermaidContainers} Mermaid containers`);
      results.push({ page: 'Leadership Overview', status: 'success', diagrams: mermaidElements });
    } else {
      console.log('❌ No rendered Mermaid diagrams found');

      // Check if there are unrendered mermaid blocks
      const unrenderedMermaid = await page.$$eval('.mermaid', elements =>
        elements.filter(el => !el.querySelector('svg')).length
      );

      if (unrenderedMermaid > 0) {
        console.log(`⚠️ Found ${unrenderedMermaid} unrendered Mermaid blocks`);
        results.push({ page: 'Leadership Overview', status: 'partial', unrendered: unrenderedMermaid });
      }
    }

    // Test another page with Mermaid
    console.log('\nTesting Roadmap page...');
    await page.goto('http://localhost:3000/#/docs/Klysera/Roadmap/Overview', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(2000);

    const roadmapMermaid = await page.$$eval('.mermaid svg', elements => elements.length);
    if (roadmapMermaid > 0) {
      console.log(`✅ Found ${roadmapMermaid} Mermaid diagrams on Roadmap page`);
      results.push({ page: 'Roadmap Overview', status: 'success', diagrams: roadmapMermaid });
    }

    // Test Operating Principles page
    console.log('\nTesting Operating Principles page...');
    await page.goto('http://localhost:3000/#/docs/Klysera/Operating-Principles/Overview', {
      waitUntil: 'networkidle'
    });
    await page.waitForTimeout(2000);

    const principlesMermaid = await page.$$eval('.mermaid svg', elements => elements.length);
    if (principlesMermaid > 0) {
      console.log(`✅ Found ${principlesMermaid} Mermaid diagrams on Operating Principles page`);
      results.push({ page: 'Operating Principles', status: 'success', diagrams: principlesMermaid });
    }

    // Take screenshot of a rendered diagram
    const mermaidContainer = await page.$('.mermaid-container');
    if (mermaidContainer) {
      await mermaidContainer.screenshot({ path: 'tests/screenshots/mermaid-diagram.png' });
      console.log('\n📸 Screenshot saved to tests/screenshots/mermaid-diagram.png');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('MERMAID RENDERING TEST SUMMARY:');
    console.log('='.repeat(50));

    const totalDiagrams = results
      .filter(r => r.status === 'success')
      .reduce((sum, r) => sum + r.diagrams, 0);

    console.log(`Total pages tested: ${results.length}`);
    console.log(`Total diagrams rendered: ${totalDiagrams}`);
    console.log(`Success rate: ${results.filter(r => r.status === 'success').length}/${results.length} pages`);

    if (totalDiagrams === 0) {
      console.log('\n⚠️ WARNING: No Mermaid diagrams were rendered.');
      console.log('Make sure to run a local server with: npx http-server -p 3000');
      console.log('Or test the live site at: https://klysera.github.io/people-and-culture/');
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.log('\n💡 TIP: Make sure the site is running locally at http://localhost:3000');
    console.log('You can start it with: npx http-server -p 3000');
  } finally {
    await browser.close();
  }
}

// Run the test
testMermaidRendering().catch(console.error);