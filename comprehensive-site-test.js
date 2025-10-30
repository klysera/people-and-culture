const { chromium } = require('playwright');

async function comprehensiveSiteTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 800 });

  try {
    console.log('🔍 Running comprehensive site analysis...');

    // Connect to GitHub Pages
    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });

    // Wait for docsify to fully load
    await page.waitForTimeout(5000);
    await page.waitForSelector('.sidebar', { timeout: 10000 });

    console.log('\n📋 Testing sidebar structure...');

    // Check if sidebar is loaded
    const sidebarExists = await page.locator('.sidebar').count();
    console.log(`Sidebar present: ${sidebarExists > 0 ? '✅' : '❌'}`);

    // Get all sidebar links
    const allLinks = await page.locator('.sidebar a').all();
    console.log(`Found ${allLinks.length} total sidebar links`);

    let issues = [];
    let workingLinks = 0;
    let brokenLinks = 0;

    console.log('\n🔗 Testing specific navigation sections...');

    // Test key sections by finding them in the sidebar
    const sectionsToTest = [
      'Culture Foundation',
      'Leadership Excellence',
      'Research & Insights',
      'TIK Identity',
      '2-Month Operational Roadmap'
    ];

    for (const sectionName of sectionsToTest) {
      try {
        console.log(`\n🔍 Testing section: ${sectionName}`);

        // Find the link by partial text match
        let targetLink = null;

        for (const link of allLinks) {
          const linkText = await link.textContent();
          if (linkText && (
            linkText.includes(sectionName) ||
            (sectionName === 'Leadership Excellence' && linkText.includes('Leadership')) ||
            (sectionName === 'Research & Insights' && linkText.includes('Research')) ||
            (sectionName === 'TIK Identity' && linkText.includes('TIK Identity')) ||
            (sectionName === '2-Month Operational Roadmap' && linkText.includes('2-Month'))
          )) {
            targetLink = link;
            break;
          }
        }

        if (!targetLink) {
          issues.push(`${sectionName}: Link not found in sidebar`);
          console.log(`❌ ${sectionName}: Link not found in sidebar`);
          brokenLinks++;
          continue;
        }

        // Check if link is visible
        const isVisible = await targetLink.isVisible();
        if (!isVisible) {
          issues.push(`${sectionName}: Link not visible`);
          console.log(`❌ ${sectionName}: Link not visible`);
          brokenLinks++;
          continue;
        }

        // Try to click the link
        await targetLink.click();
        await page.waitForTimeout(2000);

        // Check if content loaded
        const content = await page.locator('.content').textContent();
        const hasContent = content && content.trim().length > 100;

        if (!hasContent) {
          issues.push(`${sectionName}: No content loaded after click`);
          console.log(`❌ ${sectionName}: No content loaded`);
          brokenLinks++;
        } else {
          console.log(`✅ ${sectionName}: Content loaded successfully`);
          workingLinks++;
        }

        // Check for 404 errors
        const pageTitle = await page.title();
        const heading = await page.locator('h1').first().textContent();

        if (heading && (heading.includes('404') || heading.includes('Not Found'))) {
          issues.push(`${sectionName}: Shows 404 error`);
          console.log(`❌ ${sectionName}: Shows 404 error`);
        }

      } catch (error) {
        issues.push(`${sectionName}: Error - ${error.message}`);
        console.log(`❌ ${sectionName}: Error - ${error.message}`);
        brokenLinks++;
      }
    }

    console.log('\n📱 Testing responsive behavior...');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileContentVisible = await page.locator('.content').isVisible();
    const mobileSidebarVisible = await page.locator('.sidebar').isVisible();

    console.log(`Mobile content visible: ${mobileContentVisible ? '✅' : '❌'}`);
    console.log(`Mobile sidebar visible: ${mobileSidebarVisible ? '✅' : '❌'}`);

    if (!mobileContentVisible) {
      issues.push('Mobile: Content not visible');
    }

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    const tabletContentVisible = await page.locator('.content').isVisible();
    console.log(`Tablet content visible: ${tabletContentVisible ? '✅' : '❌'}`);

    console.log('\n🎨 Testing layout and styling...');

    // Reset to desktop view for layout tests
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);

    // Check for CSS loading
    const hasThemeColor = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.getPropertyValue('--theme-color') !== '';
    });

    console.log(`Custom theme loaded: ${hasThemeColor ? '✅' : '❌'}`);

    // Check sidebar width
    const sidebarWidth = await page.evaluate(() => {
      const sidebarEl = document.querySelector('.sidebar');
      return sidebarEl ? sidebarEl.getBoundingClientRect().width : 0;
    });

    console.log(`Sidebar width: ${sidebarWidth}px ${sidebarWidth > 200 ? '✅' : '❌'}`);

    if (sidebarWidth < 200) {
      issues.push('Layout: Sidebar too narrow');
    }

    console.log('\n📊 Final Results:');
    console.log(`✅ Working links: ${workingLinks}`);
    console.log(`❌ Broken links: ${brokenLinks}`);
    console.log(`⚠️ Total issues found: ${issues.length}`);

    if (issues.length === 0) {
      console.log('🎉 All tests passed! No issues found.');
    } else {
      console.log('\n🔧 Issues to address:');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    // Take final screenshot
    await page.screenshot({ path: 'comprehensive-test-screenshot.png', fullPage: true });
    console.log('\n📸 Comprehensive screenshot saved as comprehensive-test-screenshot.png');

    return {
      issues,
      totalIssues: issues.length,
      workingLinks,
      brokenLinks,
      sidebarWidth,
      hasThemeColor
    };

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    return { error: error.message, issues: [error.message] };
  } finally {
    await browser.close();
  }
}

// Run the comprehensive test
comprehensiveSiteTest().then(results => {
  if (results.error) {
    console.log('\n❌ Comprehensive test failed');
    process.exit(1);
  } else {
    console.log('\n✅ Comprehensive test completed');
    if (results.totalIssues > 0) {
      console.log(`⚠️ Found ${results.totalIssues} issues to address`);
      process.exit(1);
    } else {
      console.log('🎉 Perfect! All tests passed.');
      process.exit(0);
    }
  }
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});