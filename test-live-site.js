const { chromium } = require('playwright');

async function testLiveSite() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 800 });

  try {
    console.log('🌐 Testing live GitHub Pages site...');

    // Connect to live GitHub Pages
    await page.goto('https://klysera.github.io/people-and-culture/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for docsify to fully load
    await page.waitForTimeout(5000);
    await page.waitForSelector('.sidebar', { timeout: 15000 });

    console.log('✅ Successfully connected to live site');

    console.log('\n📋 Testing navigation structure...');

    // Check if main elements are present
    const sidebarExists = await page.locator('.sidebar').count();
    const contentExists = await page.locator('.content').count();
    const searchExists = await page.locator('.search input').count();

    console.log(`Sidebar present: ${sidebarExists > 0 ? '✅' : '❌'}`);
    console.log(`Content area present: ${contentExists > 0 ? '✅' : '❌'}`);
    console.log(`Search functionality: ${searchExists > 0 ? '✅' : '❌'}`);

    // Get all sidebar links
    const allLinks = await page.locator('.sidebar a').all();
    console.log(`\nFound ${allLinks.length} sidebar links`);

    let issues = [];
    let workingLinks = 0;
    let brokenLinks = 0;

    console.log('\n🔗 Testing key navigation links...');

    // Test specific important links
    const keyLinks = [
      'Culture Foundation',
      'Leadership Excellence',
      'Hiring & Onboarding',
      'Recognition & Rituals',
      'Research & Insights',
      'TIK Identity',
      '2-Month Operational Roadmap',
      'Culture Manifesto'
    ];

    for (const linkText of keyLinks) {
      try {
        console.log(`\n🔍 Testing: ${linkText}`);

        // Find link by text content
        let targetLink = null;
        for (const link of allLinks) {
          const text = await link.textContent();
          if (text && (
            text.includes(linkText) ||
            (linkText === 'Research & Insights' && text.includes('Research')) ||
            (linkText === 'Leadership Excellence' && text.includes('Leadership')) ||
            (linkText === 'Culture Foundation' && text.includes('Culture') && text.includes('Overview'))
          )) {
            targetLink = link;
            break;
          }
        }

        if (!targetLink) {
          issues.push(`${linkText}: Link not found in sidebar`);
          console.log(`❌ ${linkText}: Link not found`);
          brokenLinks++;
          continue;
        }

        // Check if visible and clickable
        const isVisible = await targetLink.isVisible();
        if (!isVisible) {
          issues.push(`${linkText}: Link not visible`);
          console.log(`❌ ${linkText}: Not visible`);
          brokenLinks++;
          continue;
        }

        // Try clicking the link
        await targetLink.click();
        await page.waitForTimeout(2000);

        // Check if content loaded properly
        const content = await page.locator('.content').textContent();
        const hasContent = content && content.trim().length > 100;

        // Check for 404 or error content
        const heading = await page.locator('h1').first().textContent();
        const is404 = heading && (heading.includes('404') || heading.includes('Not Found'));

        if (is404) {
          issues.push(`${linkText}: Shows 404 error`);
          console.log(`❌ ${linkText}: 404 error`);
          brokenLinks++;
        } else if (!hasContent) {
          issues.push(`${linkText}: No content loaded`);
          console.log(`❌ ${linkText}: No content`);
          brokenLinks++;
        } else {
          console.log(`✅ ${linkText}: Working correctly`);
          workingLinks++;
        }

      } catch (error) {
        issues.push(`${linkText}: Error - ${error.message}`);
        console.log(`❌ ${linkText}: Error - ${error.message}`);
        brokenLinks++;
      }
    }

    console.log('\n📱 Testing responsive design...');

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileContentVisible = await page.locator('.content').isVisible();
    const mobileSidebarBehavior = await page.locator('.sidebar').isVisible();

    console.log(`Mobile content display: ${mobileContentVisible ? '✅' : '❌'}`);
    console.log(`Mobile sidebar behavior: ${mobileSidebarBehavior ? '✅' : '❌'}`);

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    const tabletContentVisible = await page.locator('.content').isVisible();
    console.log(`Tablet content display: ${tabletContentVisible ? '✅' : '❌'}`);

    console.log('\n🎨 Testing visual styling...');

    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);

    // Check theme and styling
    const hasCustomTheme = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.getPropertyValue('--theme-color') !== '';
    });

    console.log(`Custom theme applied: ${hasCustomTheme ? '✅' : '❌'}`);

    // Check for icon cleanup
    const pageContent = await page.content();
    const hasMinimalIcons = !pageContent.includes('🚨') && !pageContent.includes('😨');
    console.log(`Professional styling (minimal icons): ${hasMinimalIcons ? '✅' : '❌'}`);

    console.log('\n📊 Final Test Results:');
    console.log(`✅ Working links: ${workingLinks}`);
    console.log(`❌ Broken links: ${brokenLinks}`);
    console.log(`⚠️ Total issues: ${issues.length}`);

    if (issues.length === 0) {
      console.log('🎉 All tests passed! Live site is fully functional.');
    } else {
      console.log('\n🔧 Issues found:');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    // Take screenshot of live site
    await page.screenshot({ path: 'live-site-screenshot.png', fullPage: true });
    console.log('\n📸 Live site screenshot saved as live-site-screenshot.png');

    return {
      issues,
      totalIssues: issues.length,
      workingLinks,
      brokenLinks,
      hasCustomTheme,
      hasMinimalIcons
    };

  } catch (error) {
    console.error('❌ Live site test failed:', error);
    return { error: error.message, issues: [error.message] };
  } finally {
    await browser.close();
  }
}

// Run the live site test
testLiveSite().then(results => {
  if (results.error) {
    console.log('\n❌ Live site test failed');
    process.exit(1);
  } else {
    console.log('\n✅ Live site test completed');
    if (results.totalIssues > 0) {
      console.log(`⚠️ Found ${results.totalIssues} issues on live site`);
      process.exit(1);
    } else {
      console.log('🎉 Perfect! Live site is fully functional.');
      process.exit(0);
    }
  }
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});