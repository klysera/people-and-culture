const { chromium } = require('playwright');

async function testLinkVisibility() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing link visibility issues...');

    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Wait for sidebar to load
    await page.waitForSelector('.sidebar', { timeout: 15000 });

    console.log('\n📋 Analyzing sidebar structure...');

    // Get all links in sidebar
    const allLinks = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return [];

      const links = Array.from(sidebar.querySelectorAll('a'));
      return links.map(link => ({
        text: link.textContent.trim(),
        href: link.getAttribute('href'),
        visible: link.offsetParent !== null,
        display: window.getComputedStyle(link).display,
        visibility: window.getComputedStyle(link).visibility
      })).filter(link => link.text.length > 0);
    });

    console.log(`Found ${allLinks.length} links in sidebar`);

    // Check specific problematic links
    const problemLinks = ['TIK Identity', 'Culture Manifesto', 'Leadership Overview'];

    problemLinks.forEach(linkText => {
      const found = allLinks.find(link => link.text.includes(linkText));
      if (found) {
        console.log(`\n${linkText}:`);
        console.log(`  Visible: ${found.visible ? '✅' : '❌'}`);
        console.log(`  Display: ${found.display}`);
        console.log(`  Visibility: ${found.visibility}`);
        console.log(`  HREF: ${found.href}`);
      } else {
        console.log(`\n${linkText}: ❌ Not found in sidebar`);
      }
    });

    console.log('\n🔍 Testing direct link access...');

    // Test direct navigation to these pages
    const directTests = [
      { name: 'TIK Identity', url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity' },
      { name: 'Culture Manifesto', url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/Culture-Manifesto' },
      { name: 'Leadership Overview', url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Leadership/Overview' }
    ];

    for (const test of directTests) {
      try {
        console.log(`\n🔗 Direct test: ${test.name}`);
        await page.goto(test.url, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);

        const content = await page.locator('.content').textContent();
        const hasContent = content && content.trim().length > 100;
        const heading = await page.locator('h1').first().textContent();
        const is404 = heading && (heading.includes('404') || heading.includes('Not Found'));

        console.log(`  Content loads: ${hasContent ? '✅' : '❌'}`);
        console.log(`  No 404 error: ${!is404 ? '✅' : '❌'}`);

        if (hasContent && !is404) {
          console.log(`  ✅ ${test.name} page exists and loads correctly`);
        }

      } catch (error) {
        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    }

    // Go back to home and test if sidebar sections are collapsible
    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n🔄 Testing collapsible functionality...');

    // Look for collapse indicators or functionality
    const hasCollapseFeatures = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return false;

      // Check for collapse plugin elements
      const collapseElements = sidebar.querySelectorAll('.sidebar-toggle, [data-collapse], .collapse-toggle');
      return collapseElements.length > 0;
    });

    console.log(`Collapse features detected: ${hasCollapseFeatures ? '✅' : '❌'}`);

    // Take screenshot showing current state
    await page.screenshot({ path: 'link-visibility-test.png', fullPage: true });
    console.log('\n📸 Link visibility test screenshot saved');

    return { allLinks: allLinks.slice(0, 10), hasCollapseFeatures };

  } catch (error) {
    console.error('❌ Link visibility test failed:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

testLinkVisibility().then(results => {
  console.log('\n✅ Link visibility analysis completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});