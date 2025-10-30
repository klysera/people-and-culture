const { chromium } = require('playwright');

async function testSiteNavigation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewportSize({ width: 1200, height: 800 });

  try {
    console.log('🚀 Starting site navigation test...');

    // Try GitHub Pages URL first, then fallback to localhost
    let baseUrl;
    try {
      await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
      baseUrl = 'https://klysera.github.io/people-and-culture/';
      console.log('✅ Connected to GitHub Pages');
    } catch (error) {
      console.log('⚠️ GitHub Pages not ready, testing locally...');
      await page.goto('file://' + __dirname + '/index.html', { waitUntil: 'networkidle' });
      baseUrl = 'file://' + __dirname + '/';
      console.log('✅ Testing local file');
    }

    // Wait for docsify to load
    await page.waitForTimeout(3000);

    console.log('\n📋 Testing page structure...');

    // Check if sidebar exists
    const sidebar = await page.locator('.sidebar').count();
    console.log(`Sidebar present: ${sidebar > 0 ? '✅' : '❌'}`);

    // Check if main content exists
    const content = await page.locator('.content').count();
    console.log(`Main content present: ${content > 0 ? '✅' : '❌'}`);

    // Check if search box exists
    const search = await page.locator('.search input').count();
    console.log(`Search box present: ${search > 0 ? '✅' : '❌'}`);

    console.log('\n🔍 Testing sidebar navigation...');

    // Test sidebar navigation links
    const sidebarLinks = await page.locator('.sidebar a').all();
    console.log(`Found ${sidebarLinks.length} sidebar links`);

    let brokenLinks = [];
    let workingLinks = [];

    for (let i = 0; i < Math.min(sidebarLinks.length, 10); i++) {
      const link = sidebarLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      try {
        await link.click();
        await page.waitForTimeout(1000);

        // Check if content loaded
        const currentUrl = page.url();
        const hasContent = await page.locator('.content').count() > 0;

        if (hasContent) {
          workingLinks.push({ text: text?.trim(), href });
          console.log(`✅ ${text?.trim()}`);
        } else {
          brokenLinks.push({ text: text?.trim(), href, error: 'No content loaded' });
          console.log(`❌ ${text?.trim()} - No content loaded`);
        }
      } catch (error) {
        brokenLinks.push({ text: text?.trim(), href, error: error.message });
        console.log(`❌ ${text?.trim()} - ${error.message}`);
      }
    }

    console.log('\n📱 Testing mobile responsiveness...');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileSidebar = await page.locator('.sidebar').isVisible();
    console.log(`Mobile sidebar handling: ${mobileSidebar ? '✅' : '❌'}`);

    // Test navbar on mobile
    const navbar = await page.locator('.app-nav').count();
    console.log(`Navigation bar present: ${navbar > 0 ? '✅' : '❌'}`);

    console.log('\n🎨 Testing CSS and styling...');

    // Check for broken CSS
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Body background loaded: ${bodyBg !== 'rgba(0, 0, 0, 0)' ? '✅' : '❌'}`);

    // Test theme colors
    const hasCustomTheme = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.getPropertyValue('--theme-color') !== '';
    });
    console.log(`Custom theme applied: ${hasCustomTheme ? '✅' : '❌'}`);

    console.log('\n📊 Summary:');
    console.log(`✅ Working links: ${workingLinks.length}`);
    console.log(`❌ Broken links: ${brokenLinks.length}`);

    if (brokenLinks.length > 0) {
      console.log('\n🔧 Broken links to fix:');
      brokenLinks.forEach(link => {
        console.log(`  - ${link.text}: ${link.href} (${link.error})`);
      });
    }

    // Take a screenshot
    await page.screenshot({ path: 'site-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved as site-screenshot.png');

    return { workingLinks, brokenLinks, baseUrl };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the test
testSiteNavigation().then(results => {
  if (results.error) {
    console.log('\n❌ Navigation test failed');
    process.exit(1);
  } else {
    console.log('\n✅ Navigation test completed');
    if (results.brokenLinks?.length > 0) {
      console.log('⚠️ Found issues that need fixing');
      process.exit(1);
    } else {
      console.log('🎉 All tests passed!');
      process.exit(0);
    }
  }
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});