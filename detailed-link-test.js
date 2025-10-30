const { chromium } = require('playwright');

async function detailedLinkTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 800 });

  try {
    console.log('🔍 Running detailed link analysis...');

    // Connect to GitHub Pages
    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n📋 Testing specific sections...');

    // Test key navigation sections - using more flexible text-based selectors
    const testSections = [
      { name: 'Culture Foundation', selector: 'text=Overview' },
      { name: 'Hiring & Onboarding', selector: 'text=Overview' },
      { name: 'Leadership Excellence', selector: '.sidebar a:has-text("Leadership")', linkText: 'Overview' },
      { name: 'Research Hub', selector: 'text=Research Overview' },
      { name: 'TIK Identity', selector: 'text=TIK Identity' },
      { name: '2-Month Roadmap', selector: 'text=2-Month Operational Roadmap' }
    ];

    let issues = [];

    for (const section of testSections) {
      try {
        console.log(`\n🔗 Testing: ${section.name}`);

        const link = page.locator(section.selector).first();
        const isVisible = await link.isVisible();

        if (!isVisible) {
          issues.push(`${section.name}: Link not visible`);
          console.log(`❌ ${section.name}: Link not visible`);
          continue;
        }

        await link.click();
        await page.waitForTimeout(2000);

        // Check if content loaded properly
        const contentExists = await page.locator('#main').count() > 0;
        const hasText = await page.locator('#main').textContent();

        if (!contentExists || !hasText?.trim()) {
          issues.push(`${section.name}: No content loaded`);
          console.log(`❌ ${section.name}: No content loaded`);
        } else {
          console.log(`✅ ${section.name}: Content loaded successfully`);
        }

        // Check for 404 content
        const is404 = await page.textContent('h1');
        if (is404?.includes('Page Not Found') || is404?.includes('404')) {
          issues.push(`${section.name}: Shows 404 error`);
          console.log(`❌ ${section.name}: Shows 404 error`);
        }

      } catch (error) {
        issues.push(`${section.name}: ${error.message}`);
        console.log(`❌ ${section.name}: ${error.message}`);
      }
    }

    console.log('\n🔍 Testing file path issues...');

    // Check for common file path problems
    const response = await page.evaluate(async () => {
      const issues = [];

      // Check if docsify is loading properly
      if (typeof window.$docsify === 'undefined') {
        issues.push('Docsify not loaded properly');
      }

      // Check for 404 responses in network
      const performanceEntries = performance.getEntriesByType('navigation');
      if (performanceEntries.length > 0 && performanceEntries[0].responseStart === 0) {
        issues.push('Possible network issues');
      }

      return issues;
    });

    issues.push(...response);

    console.log('\n📱 Testing responsive behavior...');

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const sidebarVisible = await page.locator('.sidebar').isVisible();
    const contentVisible = await page.locator('#main').isVisible();

    if (!contentVisible) {
      issues.push('Content not visible on mobile');
    }

    console.log(`Mobile content visible: ${contentVisible ? '✅' : '❌'}`);
    console.log(`Mobile sidebar behavior: ${sidebarVisible ? '✅' : '❌'}`);

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    const tabletContentVisible = await page.locator('#main').isVisible();
    console.log(`Tablet content visible: ${tabletContentVisible ? '✅' : '❌'}`);

    console.log('\n🎨 Testing layout and styling...');

    // Check for CSS issues
    await page.setViewportSize({ width: 1200, height: 800 });

    const layoutIssues = await page.evaluate(() => {
      const issues = [];

      // Check sidebar width
      const sidebarEl = document.querySelector('.sidebar');
      if (sidebarEl) {
        const sidebarRect = sidebarEl.getBoundingClientRect();
        if (sidebarRect.width < 200) {
          issues.push('Sidebar too narrow');
        }
      }

      // Check main content area
      const main = document.querySelector('#main');
      if (main) {
        const mainRect = main.getBoundingClientRect();
        if (mainRect.width < 300) {
          issues.push('Main content area too narrow');
        }
      }

      // Check for overlapping elements
      const content = document.querySelector('.content');
      const sidebarOverlap = document.querySelector('.sidebar');
      if (content && sidebarOverlap) {
        const contentRect = content.getBoundingClientRect();
        const sidebarOverlapRect = sidebarOverlap.getBoundingClientRect();
        if (contentRect.left < sidebarOverlapRect.right && window.innerWidth > 768) {
          issues.push('Content overlapping with sidebar');
        }
      }

      return issues;
    });

    issues.push(...layoutIssues);

    console.log('\n📊 Final Results:');

    if (issues.length === 0) {
      console.log('🎉 All tests passed! No issues found.');
    } else {
      console.log(`⚠️ Found ${issues.length} issues:`);
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    // Take final screenshot
    await page.screenshot({ path: 'detailed-test-screenshot.png', fullPage: true });
    console.log('\n📸 Detailed screenshot saved as detailed-test-screenshot.png');

    return { issues, totalIssues: issues.length };

  } catch (error) {
    console.error('❌ Detailed test failed:', error);
    return { error: error.message, issues: [error.message] };
  } finally {
    await browser.close();
  }
}

// Run the detailed test
detailedLinkTest().then(results => {
  if (results.error) {
    console.log('\n❌ Detailed test failed');
    process.exit(1);
  } else {
    console.log('\n✅ Detailed test completed');
    if (results.totalIssues > 0) {
      console.log(`⚠️ Found ${results.totalIssues} issues to address`);
    } else {
      console.log('🎉 Perfect! No issues found.');
    }
  }
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});