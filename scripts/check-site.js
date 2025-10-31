const { chromium } = require('playwright');

async function checkSite() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        console.log('🌐 Navigating to hosted site...');
        await page.goto('https://klysera.github.io/people-and-culture/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForTimeout(3000);

        // Take a screenshot of the homepage
        await page.screenshot({
            path: 'site-homepage.png',
            fullPage: true
        });
        console.log('📸 Homepage screenshot saved as site-homepage.png');

        // Check if there's navigation
        const navElements = await page.$$('nav, .nav, .navigation, .sidebar, .menu');
        console.log(`📋 Found ${navElements.length} navigation elements`);

        // Check for any folder structure in navigation
        const links = await page.$$eval('a[href*=".md"], a[href*="/docs/"]', links =>
            links.map(link => ({
                text: link.textContent.trim(),
                href: link.href
            }))
        );

        console.log(`🔗 Found ${links.length} documentation links:`);
        links.slice(0, 10).forEach((link, i) => {
            console.log(`   ${i + 1}. ${link.text} -> ${link.href}`);
        });

        // Check page title and structure
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);

        // Look for any automatic navigation generation
        const bodyHTML = await page.content();
        const hasDocsify = bodyHTML.includes('docsify');
        const hasGitbook = bodyHTML.includes('gitbook');
        const hasJekyll = bodyHTML.includes('jekyll');
        const hasMkdocs = bodyHTML.includes('mkdocs');

        console.log('\n🔍 Site framework detection:');
        console.log(`   Docsify: ${hasDocsify}`);
        console.log(`   GitBook: ${hasGitbook}`);
        console.log(`   Jekyll: ${hasJekyll}`);
        console.log(`   MkDocs: ${hasMkdocs}`);

        // Check if GitHub Pages is using a specific theme
        const themeInfo = await page.evaluate(() => {
            const generator = document.querySelector('meta[name="generator"]');
            const theme = document.querySelector('meta[name="theme"]');
            return {
                generator: generator ? generator.content : null,
                theme: theme ? theme.content : null
            };
        });

        console.log(`\n⚙️  Generator: ${themeInfo.generator || 'None detected'}`);
        console.log(`🎨 Theme: ${themeInfo.theme || 'None detected'}`);

        // Try to navigate to a documentation page
        console.log('\n🧭 Testing navigation to Culture Hub...');
        const cultureHubUrl = 'https://klysera.github.io/people-and-culture/docs/Klysera/Culture-Hub';
        await page.goto(cultureHubUrl, { waitUntil: 'networkidle', timeout: 10000 });

        await page.screenshot({
            path: 'site-culture-hub.png',
            fullPage: true
        });
        console.log('📸 Culture Hub screenshot saved as site-culture-hub.png');

        const cultureHubTitle = await page.title();
        console.log(`📄 Culture Hub page title: ${cultureHubTitle}`);

    } catch (error) {
        console.error('❌ Error checking site:', error.message);

        // Take screenshot of error state
        try {
            await page.screenshot({ path: 'site-error.png', fullPage: true });
            console.log('📸 Error screenshot saved as site-error.png');
        } catch (screenshotError) {
            console.error('Failed to take error screenshot:', screenshotError.message);
        }
    } finally {
        await browser.close();
    }
}

checkSite().catch(console.error);