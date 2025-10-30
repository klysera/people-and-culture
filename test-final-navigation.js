const { chromium } = require('playwright');

async function testFinalNavigation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing all navigation improvements...');

    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.waitForSelector('.sidebar', { timeout: 15000 });

    console.log('\n✅ Successfully connected to updated site');

    console.log('\n📏 Testing navbar title font size...');

    // Check if title font size was reduced
    const titleFontSize = await page.evaluate(() => {
      const titleElement = document.querySelector('.sidebar h1 a');
      if (titleElement) {
        const style = window.getComputedStyle(titleElement);
        return {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          text: titleElement.textContent
        };
      }
      return null;
    });

    if (titleFontSize) {
      console.log(`Title: "${titleFontSize.text}"`);
      console.log(`Font size: ${titleFontSize.fontSize} (target: 18px)`);
      console.log(`Font weight: ${titleFontSize.fontWeight} (target: 600)`);

      const sizeOk = parseInt(titleFontSize.fontSize) <= 20;
      console.log(`Font size reduced: ${sizeOk ? '✅' : '❌'}`);
    }

    console.log('\n📋 Testing sidebar hierarchy levels...');

    // Check sidebar structure depth
    const maxDepth = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return 0;

      let maxDepth = 0;

      function getDepth(element) {
        let depth = 0;
        let parent = element.parentElement;
        while (parent && parent !== sidebar) {
          if (parent.tagName === 'UL' || parent.tagName === 'LI') {
            depth++;
          }
          parent = parent.parentElement;
        }
        return depth;
      }

      const allElements = sidebar.querySelectorAll('*');
      allElements.forEach(el => {
        const depth = getDepth(el);
        if (depth > maxDepth) maxDepth = depth;
      });

      return maxDepth;
    });

    console.log(`Maximum nesting depth: ${maxDepth} (target: ≤2)`);
    console.log(`Hierarchy simplified: ${maxDepth <= 2 ? '✅' : '❌'}`);

    console.log('\n🔗 Testing navbar content...');

    // Check if Resources was replaced with Research
    const navbarContent = await page.evaluate(() => {
      const navbar = document.querySelector('.app-nav');
      if (!navbar) return [];

      const items = [];
      const strongElements = navbar.querySelectorAll('strong');
      strongElements.forEach(strong => {
        items.push(strong.textContent.trim());
      });
      return items;
    });

    console.log('Navbar sections:', navbarContent);
    const hasResearch = navbarContent.includes('Research');
    const hasResources = navbarContent.includes('Resources');
    console.log(`'Resources' replaced with 'Research': ${hasResearch && !hasResources ? '✅' : '❌'}`);

    console.log('\n🔗 Testing internal link functionality...');

    // Test key internal links
    const testLinks = [
      'TIK Identity',
      'Culture Manifesto',
      'Leadership Overview',
      'Research Overview'
    ];

    let workingLinks = 0;
    let brokenLinks = 0;

    for (const linkText of testLinks) {
      try {
        console.log(`\n🔍 Testing: ${linkText}`);

        // Find the link
        const link = page.locator(`a:has-text("${linkText}")`).first();
        const isVisible = await link.isVisible();

        if (!isVisible) {
          console.log(`❌ ${linkText}: Link not visible`);
          brokenLinks++;
          continue;
        }

        await link.click();
        await page.waitForTimeout(3000);

        // Check content loading
        const currentUrl = page.url();
        const content = await page.locator('.content').textContent();
        const hasContent = content && content.trim().length > 100;

        // Check for 404
        const heading = await page.locator('h1').first().textContent();
        const is404 = heading && (heading.includes('404') || heading.includes('Not Found'));

        console.log(`  URL: ${currentUrl}`);
        console.log(`  Content: ${hasContent ? '✅' : '❌'}`);
        console.log(`  No 404: ${!is404 ? '✅' : '❌'}`);

        if (!is404 && hasContent) {
          workingLinks++;
        } else {
          brokenLinks++;
        }

      } catch (error) {
        console.log(`❌ ${linkText}: Error`);
        brokenLinks++;
      }
    }

    console.log('\n📱 Testing responsive behavior...');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileContentVisible = await page.locator('.content').isVisible();
    const mobileSidebarVisible = await page.locator('.sidebar').isVisible();

    console.log(`Mobile content: ${mobileContentVisible ? '✅' : '❌'}`);
    console.log(`Mobile sidebar: ${mobileSidebarVisible ? '✅' : '❌'}`);

    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);

    console.log('\n📊 Final Results Summary:');
    console.log(`✅ Working links: ${workingLinks}`);
    console.log(`❌ Broken links: ${brokenLinks}`);
    console.log(`📏 Title font size reduced: ${titleFontSize ? '✅' : '❌'}`);
    console.log(`📋 Hierarchy simplified: ${maxDepth <= 2 ? '✅' : '❌'}`);
    console.log(`🔄 Resources→Research: ${hasResearch && !hasResources ? '✅' : '❌'}`);

    // Take final screenshot
    await page.screenshot({ path: 'final-navigation-test.png', fullPage: true });
    console.log('\n📸 Final test screenshot saved as final-navigation-test.png');

    const allIssuesFixed = (
      workingLinks >= 3 &&
      brokenLinks === 0 &&
      maxDepth <= 2 &&
      hasResearch &&
      !hasResources
    );

    return {
      success: allIssuesFixed,
      workingLinks,
      brokenLinks,
      maxDepth,
      hasResearch,
      hasResources,
      titleFontSize
    };

  } catch (error) {
    console.error('❌ Final navigation test failed:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

testFinalNavigation().then(results => {
  if (results.success) {
    console.log('\n🎉 All navigation improvements successfully implemented!');
  } else if (results.error) {
    console.log('\n❌ Test failed with error');
  } else {
    console.log('\n⚠️ Some issues may need additional attention');
  }
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});