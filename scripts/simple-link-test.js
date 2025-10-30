const { chromium } = require('playwright');

async function simpleLinkTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Simple test of internal page navigation...');

    // Test direct navigation to internal pages
    const testPages = [
      'https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity',
      'https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/Culture-Manifesto',
      'https://klysera.github.io/people-and-culture/#/docs/Klysera/Leadership/Overview'
    ];

    let workingPages = 0;

    for (const url of testPages) {
      try {
        console.log(`\n🔗 Testing: ${url.split('/').pop()}`);

        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);

        // Check if content loaded
        const content = await page.locator('.content').textContent();
        const hasContent = content && content.trim().length > 100;

        // Check for 404
        const heading = await page.locator('h1').first().textContent();
        const is404 = heading && (heading.includes('404') || heading.includes('Not Found'));

        console.log(`  Content loaded: ${hasContent ? '✅' : '❌'}`);
        console.log(`  No 404 error: ${!is404 ? '✅' : '❌'}`);

        if (hasContent && !is404) {
          workingPages++;
        }

      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    console.log(`\n📊 Results: ${workingPages}/3 pages working correctly`);
    return workingPages >= 2;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

simpleLinkTest().then(success => {
  console.log(success ? '\n✅ Internal links working!' : '\n⚠️ Some links need attention');
});