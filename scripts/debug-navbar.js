const { chromium } = require('playwright');

async function debugNavbar() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://klysera.github.io/people-and-culture/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const navbarDebug = await page.evaluate(() => {
      const navbar = document.querySelector('.app-nav');
      if (!navbar) return 'No navbar found';

      return {
        innerHTML: navbar.innerHTML,
        textContent: navbar.textContent,
        structure: Array.from(navbar.children).map(child => ({
          tagName: child.tagName,
          textContent: child.textContent.substring(0, 100)
        }))
      };
    });

    console.log('Navbar debug info:');
    console.log('Structure:', navbarDebug.structure);
    console.log('Full text:', navbarDebug.textContent);

    return true;
  } catch (error) {
    console.error('Debug failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

debugNavbar();