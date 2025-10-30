const { chromium } = require('playwright');

async function testAllImprovements() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing all navigation and layout improvements...');

    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    console.log('\n📋 Testing sidebar padding and layout...');

    // Check sidebar padding
    const sidebarPadding = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const style = window.getComputedStyle(sidebar);
        return {
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight
        };
      }
      return null;
    });

    if (sidebarPadding) {
      console.log(`Sidebar padding-left: ${sidebarPadding.paddingLeft} (target: 15px)`);
      const paddingOk = parseInt(sidebarPadding.paddingLeft) >= 15;
      console.log(`Sidebar padding improved: ${paddingOk ? '✅' : '❌'}`);
    }

    console.log('\n🔗 Testing internal page navigation...');

    // Test some internal page links
    const testPages = [
      { name: 'TIK Identity', path: '#/docs/Klysera/Culture/TIK-Identity' },
      { name: 'Culture Manifesto', path: '#/docs/Klysera/Culture/Culture-Manifesto' },
      { name: 'Leadership Overview', path: '#/docs/Klysera/Leadership/Overview' }
    ];

    let workingInternalLinks = 0;

    for (const testPage of testPages) {
      try {
        console.log(`\n🔍 Testing internal page: ${testPage.name}`);

        await page.goto(`https://klysera.github.io/people-and-culture/${testPage.path}`, {
          waitUntil: 'networkidle',
          timeout: 10000
        });
        await page.waitForTimeout(2000);

        // Check if page has breadcrumb navigation
        const hasBreadcrumbs = await page.locator('**[Home]**').count() > 0 ||
                              await page.textContent('body').then(text => text.includes('Home'));

        // Check if content loaded
        const content = await page.locator('.content').textContent();
        const hasContent = content && content.trim().length > 100;

        // Check for 404
        const heading = await page.locator('h1').first().textContent();
        const is404 = heading && (heading.includes('404') || heading.includes('Not Found'));

        console.log(`  Content loaded: ${hasContent ? '✅' : '❌'}`);
        console.log(`  No 404 error: ${!is404 ? '✅' : '❌'}`);
        console.log(`  Has breadcrumbs: ${hasBreadcrumbs ? '✅' : '❌'}`);

        if (hasContent && !is404) {
          workingInternalLinks++;

          // Test a breadcrumb link if available
          try {
            const homeLink = page.locator('text=Home').first();
            if (await homeLink.isVisible()) {
              await homeLink.click();
              await page.waitForTimeout(1000);
              console.log(`  Breadcrumb navigation: ✅`);
            }
          } catch (error) {
            console.log(`  Breadcrumb test: ❌`);
          }
        }

      } catch (error) {
        console.log(`❌ ${testPage.name}: Error - ${error.message}`);
      }
    }

    console.log('\n📱 Testing navbar positioning...');

    // Go back to home page
    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Check navbar positioning
    const navbarPosition = await page.evaluate(() => {
      const navbar = document.querySelector('.app-nav');
      if (navbar) {
        const style = window.getComputedStyle(navbar);
        const rect = navbar.getBoundingClientRect();
        return {
          position: style.position,
          top: style.top,
          right: style.right,
          zIndex: style.zIndex,
          visible: rect.width > 0 && rect.height > 0
        };
      }
      return null;
    });

    if (navbarPosition) {
      console.log(`Navbar position: ${navbarPosition.position}`);
      console.log(`Navbar top: ${navbarPosition.top}`);
      console.log(`Navbar right: ${navbarPosition.right}`);
      console.log(`Navbar z-index: ${navbarPosition.zIndex}`);
      console.log(`Navbar visible: ${navbarPosition.visible ? '✅' : '❌'}`);

      const positionFixed = navbarPosition.position === 'fixed';
      console.log(`Navbar properly positioned: ${positionFixed ? '✅' : '❌'}`);
    }

    console.log('\n🎭 Testing cover page behavior...');

    // Test cover page vs main content
    const coverPageTest = await page.evaluate(() => {
      const cover = document.querySelector('.cover');
      const content = document.querySelector('.content');

      return {
        hasCover: !!cover,
        hasContent: !!content,
        coverVisible: cover && window.getComputedStyle(cover).display !== 'none',
        contentVisible: content && window.getComputedStyle(content).display !== 'none'
      };
    });

    console.log(`Cover page present: ${coverPageTest.hasCover ? '✅' : '❌'}`);
    console.log(`Main content present: ${coverPageTest.hasContent ? '✅' : '❌'}`);
    console.log(`Cover visible: ${coverPageTest.coverVisible ? '✅' : '❌'}`);

    console.log('\n📊 Summary of All Improvements:');

    const results = {
      sidebarPadding: sidebarPadding && parseInt(sidebarPadding.paddingLeft) >= 15,
      internalLinks: workingInternalLinks >= 2,
      navbarPosition: navbarPosition && navbarPosition.position === 'fixed',
      coverPage: coverPageTest.hasCover && coverPageTest.hasContent
    };

    console.log(`✅ Sidebar padding improved: ${results.sidebarPadding ? '✅' : '❌'}`);
    console.log(`✅ Internal links working: ${results.internalLinks ? '✅' : '❌'} (${workingInternalLinks}/3)`);
    console.log(`✅ Navbar positioning fixed: ${results.navbarPosition ? '✅' : '❌'}`);
    console.log(`✅ Landing page layout: ${results.coverPage ? '✅' : '❌'}`);

    const allFixed = Object.values(results).every(result => result);
    console.log(`\n🎯 All improvements working: ${allFixed ? '🎉 YES' : '⚠️ Some issues remain'}`);

    // Take final screenshot
    await page.screenshot({ path: 'all-improvements-test.png', fullPage: true });
    console.log('\n📸 Final improvements test screenshot saved');

    return allFixed;

  } catch (error) {
    console.error('❌ Improvements test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testAllImprovements().then(success => {
  if (success) {
    console.log('\n🎉 All navigation and layout improvements successfully implemented!');
  } else {
    console.log('\n⚠️ Some improvements may need additional attention');
  }
}).catch(error => {
  console.error('❌ Test failed:', error);
});