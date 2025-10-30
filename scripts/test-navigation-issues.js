const { chromium } = require('playwright');

async function testNavigationIssues() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing navigation issues on live site...');

    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.waitForSelector('.sidebar', { timeout: 15000 });

    console.log('\n📏 Testing navbar title font size...');

    // Check navbar title font size
    const navbarTitle = await page.evaluate(() => {
      const titleElement = document.querySelector('.sidebar h1 a, .app-name a');
      if (titleElement) {
        const style = window.getComputedStyle(titleElement);
        return {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          element: titleElement.textContent
        };
      }
      return null;
    });

    if (navbarTitle) {
      console.log(`Navbar title: "${navbarTitle.element}"`);
      console.log(`Font size: ${navbarTitle.fontSize}`);
      console.log(`Font weight: ${navbarTitle.fontWeight}`);
    }

    console.log('\n📋 Testing sidebar hierarchy levels...');

    // Check sidebar structure and nesting levels
    const sidebarStructure = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return null;

      const structure = [];
      const elements = sidebar.querySelectorAll('h1, h2, h3, h4, h5, h6, ul, li');

      elements.forEach((el, index) => {
        if (index < 50) { // Limit output
          const level = el.tagName === 'UL' ? 'UL' :
                       el.tagName === 'LI' ? 'LI' :
                       el.tagName;
          const text = el.textContent ? el.textContent.trim().substring(0, 50) : '';
          const depth = getDepth(el);
          structure.push({ level, text, depth, tagName: el.tagName });
        }
      });

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

      return structure;
    });

    console.log('Sidebar structure (first 20 items):');
    if (sidebarStructure) {
      sidebarStructure.slice(0, 20).forEach(item => {
        console.log(`  ${item.level} (depth: ${item.depth}): ${item.text}`);
      });
    }

    console.log('\n🔗 Testing internal link functionality...');

    // Test some key internal links
    const testLinks = [
      'TIK Identity',
      'Culture Manifesto',
      'Leadership Overview',
      'Research Overview',
      '2-Month Operational Roadmap'
    ];

    let brokenLinks = [];

    for (const linkText of testLinks) {
      try {
        console.log(`\n🔍 Testing link: ${linkText}`);

        // Find and click the link
        const link = page.locator(`a:has-text("${linkText}")`).first();
        const isVisible = await link.isVisible();

        if (!isVisible) {
          brokenLinks.push(`${linkText}: Link not visible`);
          continue;
        }

        await link.click();
        await page.waitForTimeout(3000);

        // Check if content loaded
        const currentUrl = page.url();
        const content = await page.locator('.content').textContent();
        const hasContent = content && content.trim().length > 100;

        // Check for 404
        const heading = await page.locator('h1').first().textContent();
        const is404 = heading && (heading.includes('404') || heading.includes('Not Found'));

        console.log(`  Current URL: ${currentUrl}`);
        console.log(`  Content loaded: ${hasContent ? '✅' : '❌'}`);
        console.log(`  404 error: ${is404 ? '❌' : '✅'}`);

        if (is404) {
          brokenLinks.push(`${linkText}: Shows 404 error`);
        } else if (!hasContent) {
          brokenLinks.push(`${linkText}: No content loaded`);
        }

      } catch (error) {
        brokenLinks.push(`${linkText}: Error - ${error.message}`);
        console.log(`  Error: ${error.message}`);
      }
    }

    console.log('\n📱 Testing navbar structure...');

    // Check navbar items
    const navbarItems = await page.evaluate(() => {
      const navbar = document.querySelector('.app-nav');
      if (!navbar) return [];

      const items = [];
      const links = navbar.querySelectorAll('a, strong');
      links.forEach(link => {
        items.push({
          text: link.textContent.trim(),
          tagName: link.tagName,
          href: link.href || null
        });
      });
      return items;
    });

    console.log('Navbar items:');
    navbarItems.forEach(item => {
      console.log(`  ${item.tagName}: ${item.text}`);
    });

    console.log('\n📊 Issues Summary:');
    console.log(`❌ Broken links found: ${brokenLinks.length}`);
    if (brokenLinks.length > 0) {
      brokenLinks.forEach(issue => console.log(`  - ${issue}`));
    }

    // Take screenshot of current state
    await page.screenshot({ path: 'navigation-issues-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved as navigation-issues-screenshot.png');

    return {
      navbarTitle,
      sidebarStructure: sidebarStructure ? sidebarStructure.slice(0, 10) : [],
      brokenLinks,
      navbarItems
    };

  } catch (error) {
    console.error('❌ Navigation test failed:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

testNavigationIssues().then(results => {
  console.log('\n✅ Navigation analysis completed');
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});