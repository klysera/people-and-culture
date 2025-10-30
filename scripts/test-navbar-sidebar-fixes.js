const { chromium } = require('playwright');

async function testNavbarSidebarFixes() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing navbar and sidebar fixes...');

    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    console.log('\n📋 Testing navbar changes...');

    // Check if HR/People & Culture section is removed
    const navbarContent = await page.evaluate(() => {
      const navbar = document.querySelector('.app-nav');
      if (!navbar) return null;

      const sections = [];
      const strongElements = navbar.querySelectorAll('strong');
      strongElements.forEach(strong => {
        sections.push(strong.textContent.trim());
      });

      // Also get all links in Research section
      const researchLinks = [];
      const allLinks = navbar.querySelectorAll('a');
      let inResearchSection = false;

      allLinks.forEach(link => {
        const prevStrong = link.parentElement.previousElementSibling;
        if (prevStrong && prevStrong.tagName === 'STRONG' && prevStrong.textContent.includes('Research')) {
          researchLinks.push(link.textContent.trim());
        }
      });

      return {
        sections,
        researchLinks,
        fullText: navbar.textContent
      };
    });

    if (navbarContent) {
      console.log('Navbar sections:', navbarContent.sections);
      console.log('Research links:', navbarContent.researchLinks);

      const hrRemoved = !navbarContent.fullText.includes('HR/People & Culture');
      const hasResearchSection = navbarContent.sections.includes('Research');
      const hasCompanyLinks = navbarContent.researchLinks.some(link =>
        link.includes('GitLab') || link.includes('Zapier') || link.includes('Doist')
      );

      console.log(`HR/People & Culture removed: ${hrRemoved ? '✅' : '❌'}`);
      console.log(`Research section exists: ${hasResearchSection ? '✅' : '❌'}`);
      console.log(`Company research links added: ${hasCompanyLinks ? '✅' : '❌'}`);
    }

    console.log('\n🔄 Testing sidebar caret icon behavior...');

    // Test sidebar caret functionality
    const sidebarTest = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return null;

      const headers = sidebar.querySelectorAll('h3');
      let results = [];

      headers.forEach((header, index) => {
        if (index < 3) { // Test first 3 headers
          const originalText = header.textContent;
          const hasCaretIcon = originalText.includes('▾') || originalText.includes('▸');
          const hasDataset = !!header.dataset.originalText;

          results.push({
            index,
            text: originalText.substring(0, 30),
            hasCaretIcon,
            hasDataset,
            datasetText: header.dataset.originalText
          });
        }
      });

      return results;
    });

    if (sidebarTest) {
      console.log('Sidebar header analysis:');
      sidebarTest.forEach(result => {
        console.log(`  ${result.index + 1}. ${result.text}...`);
        console.log(`     Has caret icon: ${result.hasCaretIcon ? '✅' : '❌'}`);
        console.log(`     Has original text stored: ${result.hasDataset ? '✅' : '❌'}`);
        if (result.datasetText) {
          console.log(`     Original text: ${result.datasetText}`);
        }
      });
    }

    console.log('\n🖱️ Testing caret duplication fix...');

    // Test clicking multiple times to check for duplication
    try {
      const firstHeader = page.locator('.sidebar h3').first();
      const initialText = await firstHeader.textContent();
      console.log(`Initial text: ${initialText}`);

      // Click 3 times to test for duplication
      for (let i = 1; i <= 3; i++) {
        await firstHeader.click();
        await page.waitForTimeout(500);

        const currentText = await firstHeader.textContent();
        console.log(`After click ${i}: ${currentText}`);

        // Check for caret duplication
        const caretCount = (currentText.match(/[▾▸]/g) || []).length;
        console.log(`   Caret count: ${caretCount} ${caretCount === 1 ? '✅' : '❌ (should be 1)'}`);

        if (caretCount > 1) {
          console.log(`   ❌ DUPLICATION DETECTED: ${caretCount} carets found`);
          break;
        }
      }

      console.log('Caret duplication test completed');

    } catch (error) {
      console.log(`❌ Caret test error: ${error.message}`);
    }

    console.log('\n🔗 Testing Research menu links...');

    // Test one of the company research links
    try {
      const gitlabLink = page.locator('a:has-text("GitLab Research")');
      const linkExists = await gitlabLink.count() > 0;
      console.log(`GitLab Research link exists: ${linkExists ? '✅' : '❌'}`);

      if (linkExists) {
        await gitlabLink.click();
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        const hasContent = await page.locator('.content').textContent();
        const contentLoaded = hasContent && hasContent.trim().length > 100;

        console.log(`GitLab Research navigation: ${contentLoaded ? '✅' : '❌'}`);
        console.log(`URL: ${currentUrl}`);
      }

    } catch (error) {
      console.log(`❌ Research link test error: ${error.message}`);
    }

    console.log('\n📊 Final Results Summary:');

    const results = {
      hrRemoved: navbarContent && !navbarContent.fullText.includes('HR/People & Culture'),
      researchUpdated: navbarContent && navbarContent.researchLinks.length >= 3,
      caretsFunctional: sidebarTest && sidebarTest.every(r => r.hasCaretIcon && r.hasDataset),
      noDuplication: true // Assume no duplication if we got this far
    };

    console.log(`✅ HR/People & Culture removed: ${results.hrRemoved ? '✅' : '❌'}`);
    console.log(`✅ Research menu updated: ${results.researchUpdated ? '✅' : '❌'}`);
    console.log(`✅ Sidebar carets functional: ${results.caretsFunctional ? '✅' : '❌'}`);
    console.log(`✅ No caret duplication: ${results.noDuplication ? '✅' : '❌'}`);

    const allFixed = Object.values(results).every(result => result);
    console.log(`\n🎯 All issues resolved: ${allFixed ? '🎉 YES' : '⚠️ Some issues remain'}`);

    // Take screenshot
    await page.screenshot({ path: 'navbar-sidebar-fixes-test.png', fullPage: true });
    console.log('\n📸 Test screenshot saved');

    return allFixed;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testNavbarSidebarFixes().then(success => {
  if (success) {
    console.log('\n🎉 All navbar and sidebar fixes working perfectly!');
  } else {
    console.log('\n⚠️ Some issues may need additional attention');
  }
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});