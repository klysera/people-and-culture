const { chromium } = require('playwright');

async function debugBrowserContent() {
  console.log('🔍 Debugging browser content processing...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // Get the raw HTML content
    const htmlContent = await page.content();

    // Extract mermaid blocks from the processed content
    const mermaidData = await page.evaluate(() => {
      const elements = document.querySelectorAll('.mermaid-container .mermaid');

      return Array.from(elements).map((element, index) => {
        return {
          index: index + 1,
          id: element.id,
          textContent: element.textContent.substring(0, 300),
          innerHTML: element.innerHTML.substring(0, 500),
          hasClass: element.className,
          parentHtml: element.parentElement ? element.parentElement.outerHTML.substring(0, 200) : null
        };
      });
    });

    console.log('Mermaid elements found:', mermaidData.length);

    mermaidData.forEach(data => {
      console.log(`\nElement ${data.index}:`);
      console.log(`ID: ${data.id}`);
      console.log(`Class: ${data.hasClass}`);
      console.log(`Text Content (first 300 chars):`, data.textContent);
      console.log(`HTML Content (first 500 chars):`, data.innerHTML);
    });

    // Check if the conversion from markdown to HTML is working
    const beforeEachContent = await page.evaluate(() => {
      // Try to find the original content before Docsify processing
      const scripts = Array.from(document.querySelectorAll('script'));

      // Look for our beforeEach hook
      const docsifyScript = scripts.find(script =>
        script.textContent && script.textContent.includes('beforeEach')
      );

      return docsifyScript ? docsifyScript.textContent.substring(0, 1000) : 'Not found';
    });

    console.log('\nDocsify beforeEach hook content (first 1000 chars):');
    console.log(beforeEachContent);

    // Check if the mermaid library is properly loaded
    const mermaidStatus = await page.evaluate(() => {
      return {
        loaded: typeof window.mermaid !== 'undefined',
        version: window.mermaid ? window.mermaid.version : null,
        hasInit: window.mermaid ? typeof window.mermaid.init === 'function' : false,
        hasRender: window.mermaid ? typeof window.mermaid.render === 'function' : false
      };
    });

    console.log('\nMermaid Library Status:');
    console.log(JSON.stringify(mermaidStatus, null, 2));

    // Try manual rendering
    console.log('\n🧪 Testing manual Mermaid rendering...');
    const manualTest = await page.evaluate(() => {
      try {
        if (!window.mermaid) return { error: 'Mermaid not loaded' };

        // Create test element
        const testDiv = document.createElement('div');
        testDiv.className = 'mermaid-manual-test';
        testDiv.innerHTML = `graph TD
    A[Start] --> B[End]`;
        document.body.appendChild(testDiv);

        // Try to render
        window.mermaid.init(undefined, testDiv);

        const hasSvg = testDiv.querySelector('svg') !== null;
        const content = testDiv.innerHTML.substring(0, 200);

        return {
          success: hasSvg,
          content: content,
          error: hasSvg ? null : 'No SVG generated'
        };
      } catch (error) {
        return { error: error.message, stack: error.stack };
      }
    });

    console.log('Manual test result:', JSON.stringify(manualTest, null, 2));

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugBrowserContent().catch(console.error);