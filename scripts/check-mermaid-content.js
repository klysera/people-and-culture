const { chromium } = require('playwright');

async function checkMermaidContent() {
  console.log('🔍 Checking Mermaid diagram content for syntax errors...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the TIK Identity page
    await page.goto('https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // Get the raw mermaid content before processing
    const mermaidContent = await page.evaluate(() => {
      // Look for the original markdown content
      const bodyContent = document.body.innerHTML;

      // Find mermaid blocks in the original content
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
      const matches = [];
      let match;

      while ((match = mermaidRegex.exec(bodyContent)) !== null) {
        matches.push(match[1]);
      }

      return matches;
    });

    console.log('Found Mermaid blocks:');
    mermaidContent.forEach((content, index) => {
      console.log(`\nBlock ${index + 1}:`);
      console.log('='.repeat(50));
      console.log(content);
      console.log('='.repeat(50));
    });

    // Check the rendered mermaid elements
    const renderedElements = await page.$$eval('.mermaid', elements => {
      return elements.map((el, index) => ({
        index: index + 1,
        id: el.id,
        innerHTML: el.innerHTML.substring(0, 500),
        hasError: el.innerHTML.includes('Syntax error') || el.innerHTML.includes('Parse error'),
        hasSvg: el.querySelector('svg') !== null
      }));
    });

    console.log('\nRendered Elements:');
    renderedElements.forEach(element => {
      console.log(`\nElement ${element.index}:`);
      console.log(`ID: ${element.id}`);
      console.log(`Has SVG: ${element.hasSvg}`);
      console.log(`Has Error: ${element.hasError}`);
      if (element.hasError) {
        console.log('Content (first 500 chars):', element.innerHTML);
      }
    });

    // Try to get the actual error message if any
    const errorMessages = await page.$$eval('.mermaid', elements => {
      return elements.map(el => {
        const errorNodes = Array.from(el.childNodes).filter(node =>
          node.nodeType === Node.TEXT_NODE &&
          (node.textContent.includes('Syntax error') || node.textContent.includes('Parse error'))
        );
        return errorNodes.map(node => node.textContent);
      }).flat();
    });

    if (errorMessages.length > 0) {
      console.log('\nError Messages Found:');
      errorMessages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg}`);
      });
    }

    // Check if there are any style issues
    const styleContent = await page.evaluate(() => {
      const mermaidElement = document.querySelector('.mermaid');
      if (!mermaidElement) return null;

      const svg = mermaidElement.querySelector('svg');
      if (!svg) return null;

      return {
        svgStyle: svg.getAttribute('style'),
        svgWidth: svg.getAttribute('width'),
        svgHeight: svg.getAttribute('height'),
        svgViewBox: svg.getAttribute('viewBox')
      };
    });

    if (styleContent) {
      console.log('\nSVG Properties:');
      console.log(JSON.stringify(styleContent, null, 2));
    }

    // Take a screenshot of the specific mermaid element
    const mermaidElement = await page.$('.mermaid');
    if (mermaidElement) {
      await mermaidElement.screenshot({ path: 'tests/screenshots/mermaid-element.png' });
      console.log('\n📸 Mermaid element screenshot saved');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkMermaidContent().catch(console.error);