const { chromium } = require('playwright');

async function testResearchDropdown() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('🔍 Testing Research dropdown functionality...');

    // Try to find and click on Research section
    const researchSection = page.locator('text=Research').first();
    const sectionExists = await researchSection.count() > 0;
    console.log(`Research section found: ${sectionExists ? '✅' : '❌'}`);

    if (sectionExists) {
      // Try clicking on Research to expand
      await researchSection.click();
      await page.waitForTimeout(1000);

      // Now check for GitLab Research link
      const gitlabLink = page.locator('a:has-text("GitLab Research")');
      const linkVisible = await gitlabLink.isVisible();
      console.log(`GitLab Research link visible after click: ${linkVisible ? '✅' : '❌'}`);

      if (linkVisible) {
        console.log('✅ Research dropdown is working - links appear after clicking Research');

        // Test clicking the GitLab link
        await gitlabLink.click();
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log(`Navigation successful: ${currentUrl.includes('GitLab') ? '✅' : '❌'}`);
        console.log(`Current URL: ${currentUrl}`);
      } else {
        console.log('❌ Research links not visible even after clicking');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testResearchDropdown();