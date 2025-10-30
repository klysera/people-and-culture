const { chromium } = require('playwright');

async function testSpecificLinks() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔗 Testing specific important links on live site...');

    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Test direct URL navigation for key pages
    const testUrls = [
      {
        name: 'Culture Hub',
        url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture-Hub'
      },
      {
        name: 'TIK Identity',
        url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity'
      },
      {
        name: '2-Month Roadmap',
        url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Roadmap/2-Month-Operational-Roadmap'
      },
      {
        name: 'Research Hub',
        url: 'https://klysera.github.io/people-and-culture/#/Research/README'
      },
      {
        name: 'Leadership Overview',
        url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Leadership/Overview'
      }
    ];

    let allWorking = true;

    for (const testItem of testUrls) {
      try {
        console.log(`\n🔍 Testing direct link: ${testItem.name}`);

        await page.goto(testItem.url, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);

        // Check if content loaded
        const content = await page.locator('.content').textContent();
        const hasContent = content && content.trim().length > 50;

        // Check for 404
        const heading = await page.locator('h1').first().textContent();
        const is404 = heading && (heading.includes('404') || heading.includes('Not Found'));

        if (is404) {
          console.log(`❌ ${testItem.name}: Shows 404 error`);
          allWorking = false;
        } else if (!hasContent) {
          console.log(`❌ ${testItem.name}: No content loaded`);
          allWorking = false;
        } else {
          console.log(`✅ ${testItem.name}: Direct link working`);
        }

      } catch (error) {
        console.log(`❌ ${testItem.name}: Error - ${error.message}`);
        allWorking = false;
      }
    }

    console.log('\n📱 Testing navbar navigation...');

    // Go back to home and test navbar
    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Test navbar links if they exist
    const navbarExists = await page.locator('.app-nav').count();
    if (navbarExists > 0) {
      console.log('✅ Navbar present');

      // Test navbar quick access links
      const navLinks = await page.locator('.app-nav a').all();
      console.log(`Found ${navLinks.length} navbar links`);

      for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
        try {
          const link = navLinks[i];
          const linkText = await link.textContent();

          await link.click();
          await page.waitForTimeout(2000);

          const content = await page.locator('.content').textContent();
          const hasContent = content && content.trim().length > 50;

          console.log(`${hasContent ? '✅' : '❌'} Navbar link: ${linkText?.trim()}`);

        } catch (error) {
          console.log(`❌ Navbar link ${i}: Error`);
        }
      }
    } else {
      console.log('ℹ️ No navbar detected (this is normal for current setup)');
    }

    return allWorking;

  } catch (error) {
    console.error('❌ Specific links test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testSpecificLinks().then(success => {
  if (success) {
    console.log('\n🎉 All specific links working perfectly!');
  } else {
    console.log('\n⚠️ Some links need attention');
  }
});