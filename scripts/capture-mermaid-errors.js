const { chromium } = require('playwright');

async function captureMermaidErrors() {
  console.log('🔍 Capturing detailed Mermaid error logs from browser...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const consoleMessages = [];
  const networkErrors = [];
  const jsErrors = [];

  try {
    // Capture all console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // Capture JavaScript errors
    page.on('pageerror', error => {
      jsErrors.push({
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    });

    // Capture network failures
    page.on('requestfailed', request => {
      networkErrors.push({
        url: request.url(),
        failure: request.failure(),
        method: request.method()
      });
    });

    console.log('📡 Loading TIK Identity page...');
    await page.goto('https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for processing and rendering
    await page.waitForTimeout(5000);

    // Inject custom error capturing for Mermaid
    const mermaidErrors = await page.evaluate(() => {
      const errors = [];

      // Override console.error to catch Mermaid errors
      const originalError = console.error;
      console.error = function(...args) {
        if (args.some(arg => arg && arg.toString().toLowerCase().includes('mermaid'))) {
          errors.push({
            type: 'mermaid-error',
            args: args.map(arg => arg && arg.toString ? arg.toString() : arg),
            timestamp: new Date().toISOString()
          });
        }
        return originalError.apply(console, args);
      };

      // Check for existing mermaid errors in global scope
      if (window.mermaidErrors) {
        errors.push(...window.mermaidErrors);
      }

      // Try to get mermaid parse errors
      try {
        if (window.mermaid && window.mermaid.parse) {
          const mermaidElements = document.querySelectorAll('.mermaid');
          mermaidElements.forEach((element, index) => {
            try {
              const content = element.textContent.trim();
              if (content && content !== '') {
                window.mermaid.parse(content);
              }
            } catch (parseError) {
              errors.push({
                type: 'parse-error',
                element: index,
                content: element.textContent.substring(0, 200),
                error: parseError.message,
                stack: parseError.stack
              });
            }
          });
        }
      } catch (e) {
        errors.push({
          type: 'mermaid-check-error',
          error: e.message
        });
      }

      return errors;
    });

    // Get detailed element information
    const elementInfo = await page.evaluate(() => {
      const mermaidElements = document.querySelectorAll('.mermaid');

      return Array.from(mermaidElements).map((element, index) => {
        const svg = element.querySelector('svg');
        const errorElement = element.querySelector('.error-icon, .error-text');

        return {
          index: index,
          id: element.id,
          className: element.className,
          textContent: element.textContent.substring(0, 500),
          innerHTML: element.innerHTML.substring(0, 500),
          hasSvg: !!svg,
          hasError: !!errorElement,
          svgAttributes: svg ? {
            width: svg.getAttribute('width'),
            height: svg.getAttribute('height'),
            viewBox: svg.getAttribute('viewBox'),
            role: svg.getAttribute('role'),
            ariaRoleDescription: svg.getAttribute('aria-roledescription')
          } : null,
          computedStyle: {
            display: window.getComputedStyle(element).display,
            visibility: window.getComputedStyle(element).visibility,
            width: window.getComputedStyle(element).width,
            height: window.getComputedStyle(element).height
          }
        };
      });
    });

    // Display all captured information
    console.log('='.repeat(80));
    console.log('DETAILED MERMAID ERROR ANALYSIS');
    console.log('='.repeat(80));

    console.log('\n📋 CONSOLE MESSAGES:');
    consoleMessages.forEach((msg, index) => {
      if (msg.text.toLowerCase().includes('mermaid') ||
          msg.text.toLowerCase().includes('error') ||
          msg.text.toLowerCase().includes('syntax') ||
          msg.type === 'error') {
        console.log(`${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
        if (msg.location) {
          console.log(`   Location: ${JSON.stringify(msg.location)}`);
        }
      }
    });

    console.log('\n🚨 JAVASCRIPT ERRORS:');
    jsErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.name}: ${error.message}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack.split('\n')[0]}`);
      }
    });

    console.log('\n🌐 NETWORK ERRORS:');
    networkErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.method} ${error.url}`);
      console.log(`   Failure: ${error.failure ? error.failure.errorText : 'Unknown'}`);
    });

    console.log('\n🔧 MERMAID-SPECIFIC ERRORS:');
    mermaidErrors.forEach((error, index) => {
      console.log(`${index + 1}. Type: ${error.type}`);
      if (error.args) {
        console.log(`   Args: ${error.args.join(', ')}`);
      }
      if (error.error) {
        console.log(`   Error: ${error.error}`);
      }
      if (error.content) {
        console.log(`   Content: ${error.content}`);
      }
      if (error.stack) {
        console.log(`   Stack: ${error.stack.split('\n')[0]}`);
      }
    });

    console.log('\n📊 ELEMENT DETAILS:');
    elementInfo.forEach(info => {
      console.log(`\nElement ${info.index}:`);
      console.log(`  ID: ${info.id}`);
      console.log(`  Class: ${info.className}`);
      console.log(`  Has SVG: ${info.hasSvg}`);
      console.log(`  Has Error: ${info.hasError}`);
      console.log(`  Display: ${info.computedStyle.display}`);
      console.log(`  Visibility: ${info.computedStyle.visibility}`);

      if (info.svgAttributes) {
        console.log(`  SVG Role: ${info.svgAttributes.role}`);
        console.log(`  SVG Aria Role: ${info.svgAttributes.ariaRoleDescription}`);
        console.log(`  SVG ViewBox: ${info.svgAttributes.viewBox}`);
      }

      if (info.textContent.includes('graph') || info.textContent.includes('TIK')) {
        console.log(`  Content Preview: ${info.textContent.substring(0, 100)}...`);
      } else {
        console.log(`  Rendered Content: ${info.textContent.substring(0, 200)}...`);
      }
    });

    // Try to get the exact Mermaid configuration
    const mermaidConfig = await page.evaluate(() => {
      if (window.mermaid) {
        try {
          return {
            version: window.mermaid.version,
            config: window.mermaid.getConfig ? window.mermaid.getConfig() : 'getConfig not available',
            hasInit: typeof window.mermaid.init === 'function',
            hasRender: typeof window.mermaid.render === 'function',
            hasParse: typeof window.mermaid.parse === 'function'
          };
        } catch (e) {
          return { error: e.message };
        }
      }
      return { error: 'Mermaid not loaded' };
    });

    console.log('\n⚙️ MERMAID CONFIGURATION:');
    console.log(JSON.stringify(mermaidConfig, null, 2));

    console.log('\n='.repeat(80));
    console.log('END OF ERROR ANALYSIS');
    console.log('='.repeat(80));

    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'tests/screenshots/mermaid-error-debug.png', fullPage: true });
    console.log('\n📸 Debug screenshot saved to: tests/screenshots/mermaid-error-debug.png');

  } catch (error) {
    console.error('❌ Error capture failed:', error.message);
  } finally {
    await browser.close();
  }
}

captureMermaidErrors().catch(console.error);