const { chromium } = require('playwright');

async function finalComprehensiveTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🎯 FINAL COMPREHENSIVE TEST - All Issues Resolution');
    console.log('=' .repeat(60));

    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    console.log('\n1️⃣ Testing HR/People & Culture Removal...');

    const navbarContent = await page.evaluate(() => {
      const navbar = document.querySelector('.app-nav');
      return navbar ? navbar.textContent : '';
    });

    const hrRemoved = !navbarContent.includes('HR/People & Culture');
    console.log(`   HR/People & Culture removed from navbar: ${hrRemoved ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n2️⃣ Testing Research Menu with Company Links...');

    // Click Research to expand dropdown
    const researchSection = page.locator('text=Research').first();
    await researchSection.click();
    await page.waitForTimeout(1000);

    const companyLinks = await page.evaluate(() => {
      const links = [];
      const allLinks = document.querySelectorAll('.app-nav a');
      allLinks.forEach(link => {
        const text = link.textContent.trim();
        if (text.includes('GitLab') || text.includes('Zapier') || text.includes('Doist')) {
          links.push(text);
        }
      });
      return links;
    });

    console.log(`   Company research links found: ${companyLinks.length >= 3 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Links: ${companyLinks.join(', ')}`);

    // Test navigation to GitLab research
    const gitlabLink = page.locator('a:has-text("GitLab Research")');
    await gitlabLink.click();
    await page.waitForTimeout(2000);

    const gitlabNavigation = page.url().includes('GitLab');
    console.log(`   GitLab Research navigation: ${gitlabNavigation ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n3️⃣ Testing Sidebar Caret Icon Duplication Fix...');

    // Go back to home to test sidebar
    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Test multiple clicks on sidebar headers
    const sidebarTestResults = [];

    for (let i = 0; i < 3; i++) {
      const headerSelector = `.sidebar h3:nth-of-type(${i + 1})`;
      const header = page.locator(headerSelector);

      const initialText = await header.textContent();

      // Click 3 times and check for duplication each time
      for (let click = 1; click <= 3; click++) {
        await header.click();
        await page.waitForTimeout(300);

        const currentText = await header.textContent();
        const caretCount = (currentText.match(/[▾▸]/g) || []).length;

        if (caretCount > 1) {
          sidebarTestResults.push(`Header ${i + 1}, Click ${click}: DUPLICATION (${caretCount} carets)`);
          break;
        }
      }

      if (sidebarTestResults.length === 0 || !sidebarTestResults[sidebarTestResults.length - 1].includes('DUPLICATION')) {
        sidebarTestResults.push(`Header ${i + 1}: No duplication detected ✅`);
      }
    }

    console.log('   Sidebar caret duplication test results:');
    sidebarTestResults.forEach(result => console.log(`     ${result}`));

    const noDuplication = !sidebarTestResults.some(result => result.includes('DUPLICATION'));
    console.log(`   Overall caret duplication fix: ${noDuplication ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n4️⃣ Testing Overall Site Functionality...');

    // Test internal navigation
    const internalNavTest = await page.evaluate(() => {
      const sidebarLinks = document.querySelectorAll('.sidebar a');
      return sidebarLinks.length > 0;
    });

    console.log(`   Sidebar navigation present: ${internalNavTest ? '✅ PASS' : '❌ FAIL'}`);

    // Test navbar background
    const navbarBg = await page.evaluate(() => {
      const navbar = document.querySelector('.app-nav');
      if (!navbar) return false;
      const style = window.getComputedStyle(navbar);
      return style.backgroundColor !== 'rgba(0, 0, 0, 0)';
    });

    console.log(`   Navbar solid background: ${navbarBg ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL RESULTS SUMMARY:');
    console.log('=' .repeat(60));

    const allResults = {
      hrRemoved,
      companyLinksAdded: companyLinks.length >= 3,
      gitlabNavigation,
      noDuplication,
      internalNavTest,
      navbarBg
    };

    Object.entries(allResults).forEach(([test, result]) => {
      const status = result ? '✅ PASS' : '❌ FAIL';
      const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`✓ ${testName}: ${status}`);
    });

    const allPassed = Object.values(allResults).every(result => result === true);

    console.log('\n' + '=' .repeat(60));
    console.log(`🎯 OVERALL RESULT: ${allPassed ? '🎉 ALL ISSUES RESOLVED!' : '⚠️ SOME ISSUES REMAIN'}`);
    console.log('=' .repeat(60));

    if (allPassed) {
      console.log('\n✨ Congratulations! All requested fixes have been implemented and tested successfully:');
      console.log('  • HR/People & Culture section removed from navbar');
      console.log('  • Research menu updated with company-specific links');
      console.log('  • Sidebar caret icon duplication bug fixed');
      console.log('  • All navigation and UI improvements working perfectly');
    }

    // Take final screenshot
    await page.screenshot({ path: 'final-comprehensive-test-result.png', fullPage: true });
    console.log('\n📸 Final test screenshot saved');

    return allPassed;

  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

finalComprehensiveTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});