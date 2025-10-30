const { chromium } = require('playwright');

async function checkGitHubCache() {
  console.log('🔍 Checking GitHub Pages cache and content...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Enable request interception to see what's being loaded
    await page.route('**/*', route => {
      const url = route.request().url();

      if (url.includes('TIK-Identity.md')) {
        console.log('📡 Loading TIK-Identity.md from:', url);
      }

      route.continue();
    });

    await page.goto('https://klysera.github.io/people-and-culture/#/docs/Klysera/Culture/TIK-Identity', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Check what content is actually being processed
    const rawContent = await page.evaluate(() => {
      // Get the main content area
      const mainContent = document.querySelector('.content .markdown-section');
      if (!mainContent) return 'No content found';

      // Find any raw mermaid content that hasn't been processed
      const innerHTML = mainContent.innerHTML;

      // Look for ```mermaid blocks
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
      const matches = [];
      let match;

      while ((match = mermaidRegex.exec(innerHTML)) !== null) {
        matches.push(match[1]);
      }

      return {
        totalLength: innerHTML.length,
        hasMermaidBlocks: matches.length > 0,
        mermaidBlocks: matches,
        firstMermaidBlock: matches[0] ? matches[0].substring(0, 300) : null
      };
    });

    console.log('Raw content analysis:');
    console.log(`Content length: ${rawContent.totalLength}`);
    console.log(`Has mermaid blocks: ${rawContent.hasMermaidBlocks}`);
    console.log(`Number of blocks: ${rawContent.mermaidBlocks ? rawContent.mermaidBlocks.length : 0}`);

    if (rawContent.firstMermaidBlock) {
      console.log('First mermaid block (300 chars):');
      console.log(rawContent.firstMermaidBlock);
    }

    // Check if the content matches our latest changes
    const hasCircularSyntax = rawContent.firstMermaidBlock && rawContent.firstMermaidBlock.includes('((This Is Klysera))');
    const hasOldSyntax = rawContent.firstMermaidBlock && rawContent.firstMermaidBlock.includes('[("This Is Klysera")]');

    console.log('\nSyntax check:');
    console.log(`Has new circular syntax ((...)): ${hasCircularSyntax}`);
    console.log(`Has old problematic syntax [("...")]: ${hasOldSyntax}`);

    if (hasOldSyntax) {
      console.log('❌ OLD SYNTAX DETECTED - GitHub Pages is serving cached content');
      console.log('💡 Try force refresh or wait for cache to expire');
    } else if (hasCircularSyntax) {
      console.log('✅ NEW SYNTAX DETECTED - Content is updated');
    }

    // Try to force reload without cache
    console.log('\n🔄 Attempting hard refresh...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Check again after reload
    const reloadedContent = await page.evaluate(() => {
      const mainContent = document.querySelector('.content .markdown-section');
      if (!mainContent) return null;

      const innerHTML = mainContent.innerHTML;
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
      const match = mermaidRegex.exec(innerHTML);

      return match ? match[1].substring(0, 200) : null;
    });

    if (reloadedContent) {
      console.log('After reload - first mermaid block (200 chars):');
      console.log(reloadedContent);

      const stillHasOldSyntax = reloadedContent.includes('[("');
      console.log(`Still has old syntax: ${stillHasOldSyntax}`);
    }

    // Check the last modified date of the page
    const lastModified = await page.evaluate(() => {
      return document.lastModified;
    });

    console.log(`\nPage last modified: ${lastModified}`);

    // Try accessing the raw markdown file directly
    console.log('\n📄 Checking raw GitHub content...');
    const rawMarkdownUrl = 'https://raw.githubusercontent.com/klysera/people-and-culture/main/docs/Klysera/Culture/TIK-Identity.md';

    try {
      const response = await page.goto(rawMarkdownUrl);
      const markdownContent = await page.textContent();

      const hasNewSyntaxInRaw = markdownContent.includes('((This Is Klysera))');
      const hasOldSyntaxInRaw = markdownContent.includes('[("This Is Klysera")]');

      console.log(`Raw file has new syntax: ${hasNewSyntaxInRaw}`);
      console.log(`Raw file has old syntax: ${hasOldSyntaxInRaw}`);

      if (hasNewSyntaxInRaw) {
        console.log('✅ GitHub has the updated content');
        console.log('💡 The issue might be GitHub Pages cache - try waiting 5-10 minutes');
      } else {
        console.log('❌ GitHub still has old content');
        console.log('💡 The push might not have completed properly');
      }

    } catch (error) {
      console.log('❌ Could not fetch raw file:', error.message);
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await browser.close();
  }
}

checkGitHubCache().catch(console.error);