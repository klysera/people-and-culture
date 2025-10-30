const { chromium } = require('playwright');

async function verifyMermaidFixes() {
  console.log('✅ Verifying Mermaid fixes on live GitHub Pages site...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const results = [];

  try {
    // Test pages with Mermaid diagrams
    const testPages = [
      {
        name: 'TIK Identity',
        url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity',
        expectedDiagrams: 2
      },
      {
        name: 'Leadership Overview',
        url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Leadership/Overview',
        expectedDiagrams: 1
      },
      {
        name: 'Roadmap Overview',
        url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/Roadmap/Overview',
        expectedDiagrams: 1
      },
      {
        name: 'Mermaid Test Page',
        url: 'https://klysera.github.io/people-and-culture/#/docs/Klysera/mermaid-test',
        expectedDiagrams: 7
      }
    ];

    for (const testPage of testPages) {
      console.log(`🔍 Testing: ${testPage.name}`);
      console.log(`URL: ${testPage.url}`);

      await page.goto(testPage.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for Mermaid to render
      await page.waitForTimeout(3000);

      // Check rendered diagrams
      const diagramInfo = await page.evaluate(() => {
        const mermaidElements = document.querySelectorAll('.mermaid');

        return Array.from(mermaidElements).map((element, index) => {
          const svg = element.querySelector('svg');
          const hasError = svg && (
            svg.getAttribute('aria-roledescription') === 'error' ||
            element.innerHTML.includes('Syntax error') ||
            element.innerHTML.includes('Parse error')
          );

          return {
            index: index + 1,
            hasSvg: !!svg,
            hasError: hasError,
            errorType: hasError ? (svg.getAttribute('aria-roledescription') || 'unknown') : null,
            width: svg ? svg.getAttribute('width') : null,
            height: svg ? svg.getAttribute('height') : null
          };
        });
      });

      const totalDiagrams = diagramInfo.length;
      const renderedDiagrams = diagramInfo.filter(d => d.hasSvg && !d.hasError).length;
      const errorDiagrams = diagramInfo.filter(d => d.hasError).length;

      const result = {
        page: testPage.name,
        url: testPage.url,
        expected: testPage.expectedDiagrams,
        found: totalDiagrams,
        rendered: renderedDiagrams,
        errors: errorDiagrams,
        success: renderedDiagrams === testPage.expectedDiagrams && errorDiagrams === 0
      };

      results.push(result);

      console.log(`Expected: ${testPage.expectedDiagrams}, Found: ${totalDiagrams}, Rendered: ${renderedDiagrams}, Errors: ${errorDiagrams}`);
      console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);

      if (errorDiagrams > 0) {
        console.log('Error details:');
        diagramInfo.filter(d => d.hasError).forEach(d => {
          console.log(`  - Diagram ${d.index}: ${d.errorType}`);
        });
      }

      console.log('---\n');

      // Take screenshot if there are errors
      if (errorDiagrams > 0) {
        const fileName = `tests/screenshots/mermaid-error-${testPage.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        await page.screenshot({ path: fileName, fullPage: true });
        console.log(`📸 Error screenshot saved: ${fileName}\n`);
      }
    }

    // Summary
    console.log('='.repeat(60));
    console.log('MERMAID VERIFICATION SUMMARY');
    console.log('='.repeat(60));

    const totalTests = results.length;
    const successfulTests = results.filter(r => r.success).length;
    const totalExpected = results.reduce((sum, r) => sum + r.expected, 0);
    const totalRendered = results.reduce((sum, r) => sum + r.rendered, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

    console.log(`Pages tested: ${totalTests}`);
    console.log(`Successful pages: ${successfulTests}/${totalTests}`);
    console.log(`Total diagrams expected: ${totalExpected}`);
    console.log(`Total diagrams rendered: ${totalRendered}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Overall success rate: ${Math.round((totalRendered / totalExpected) * 100)}%`);

    if (totalErrors === 0) {
      console.log('\n🎉 ALL MERMAID DIAGRAMS RENDERING SUCCESSFULLY!');
    } else {
      console.log('\n⚠️ Some diagrams still have errors. Check the details above.');
    }

    // Detailed results
    console.log('\nDetailed Results:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.page}: ${result.rendered}/${result.expected} rendered (${result.errors} errors)`);
    });

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await browser.close();
  }
}

verifyMermaidFixes().catch(console.error);