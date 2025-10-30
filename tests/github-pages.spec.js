const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://klysera.github.io/people-and-culture';

test.describe('GitHub Pages Navigation Tests', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Klysera People & Culture/);
    await expect(page.locator('h1')).toContainText('Navigation Center - Klysera People & Culture');
  });

  test('Navigation links work correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Test main navigation links
    await expect(page.locator('a[href="./Culture-Hub.md"]')).toBeVisible();

    // Test role-based navigation
    await expect(page.locator('text=New Team Members')).toBeVisible();
    await expect(page.locator('text=Managers')).toBeVisible();
    await expect(page.locator('text=HR/People & Culture Lead')).toBeVisible();
    await expect(page.locator('text=Everyone')).toBeVisible();
  });

  test('Overview pages render as HTML (not .md)', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click on Culture Overview link
    await page.click('a[href="./Culture/_Overview"]');

    // Should navigate to HTML page, not show 404
    await expect(page).not.toHaveURL(/\.md$/);
    await page.waitForLoadState('networkidle');

    // Should not see 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('text=File not found')).not.toBeVisible();
  });

  test('Breadcrumb navigation works', async ({ page }) => {
    // Navigate to a deep page
    await page.goto(`${BASE_URL}/Culture/TIK-Identity`);

    // Check breadcrumb exists
    await expect(page.locator('text=🏠 Home')).toBeVisible();
    await expect(page.locator('text=🧭 Navigation')).toBeVisible();
    await expect(page.locator('text=📚 Culture Hub')).toBeVisible();

    // Test breadcrumb link back to home
    await page.click('a[href="../README.md"]');
    await expect(page).toHaveURL(BASE_URL);
  });

  test('Mermaid diagrams render correctly', async ({ page }) => {
    // Navigate to a page with Mermaid diagrams
    await page.goto(`${BASE_URL}/Leadership/_Overview`);

    // Wait for Mermaid to load
    await page.waitForTimeout(3000);

    // Check if Mermaid script is loaded
    const mermaidScript = await page.locator('script[src*="mermaid"]');
    await expect(mermaidScript).toBeAttached();

    // Check if mermaid diagrams are rendered (look for SVG elements)
    const mermaidDiagrams = await page.locator('.mermaid svg');
    if (await mermaidDiagrams.count() > 0) {
      await expect(mermaidDiagrams.first()).toBeVisible();
    }
  });

  test('All section overview pages are accessible', async ({ page }) => {
    const overviewPages = [
      '/Culture/_Overview',
      '/Playbook/_Overview',
      '/Leadership/_Overview',
      '/Hiring-Onboarding/_Overview',
      '/Recognition-Rituals/_Overview',
      '/Operating-Principles/_Overview',
      '/Roadmap/_Overview'
    ];

    for (const path of overviewPages) {
      await page.goto(`${BASE_URL}${path}`);

      // Should not see 404 error
      await expect(page.locator('text=404')).not.toBeVisible();
      await expect(page.locator('text=File not found')).not.toBeVisible();

      // Should have breadcrumb navigation
      await expect(page.locator('text=🏠 Home')).toBeVisible();
    }
  });

  test('Mobile navigation works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // Check that navigation is still accessible on mobile
    await expect(page.locator('text=Quick Access')).toBeVisible();
    await expect(page.locator('text=By Role')).toBeVisible();
    await expect(page.locator('text=By Section')).toBeVisible();
  });

  test('External links work correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/Research/GitLab/README`);

    // Test external GitLab links (should open in same tab for now)
    const externalLinks = await page.locator('a[href^="https://handbook.gitlab.com"]');
    if (await externalLinks.count() > 0) {
      await expect(externalLinks.first()).toHaveAttribute('href', /^https:/);
    }
  });

  test('Search functionality via site map', async ({ page }) => {
    await page.goto(BASE_URL);

    // Navigate to complete site map section
    await page.click('text=Complete Site Map');

    // Verify all major sections are listed
    await expect(page.locator('text=🎭 Culture')).toBeVisible();
    await expect(page.locator('text=📖 Playbook')).toBeVisible();
    await expect(page.locator('text=👑 Leadership')).toBeVisible();
    await expect(page.locator('text=🎯 Hiring & Onboarding')).toBeVisible();
    await expect(page.locator('text=🏆 Recognition & Rituals')).toBeVisible();
    await expect(page.locator('text=🔧 Operating Principles')).toBeVisible();
  });

  test('Page load performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('Content Accessibility Tests', () => {
  test('Pages have proper heading structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/Culture/TIK-Identity`);

    // Should have h1 as main heading
    const h1 = await page.locator('h1');
    await expect(h1).toBeVisible();

    // Should have logical heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('Links have descriptive text', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check that links don't just say "click here" or "read more"
    const badLinkTexts = ['click here', 'read more', 'here', 'more'];

    for (const badText of badLinkTexts) {
      const badLinks = await page.locator(`a:has-text("${badText}")`);
      expect(await badLinks.count()).toBe(0);
    }
  });

  test('Images have alt text (if any)', async ({ page }) => {
    await page.goto(BASE_URL);

    const images = await page.locator('img').all();
    for (const img of images) {
      await expect(img).toHaveAttribute('alt');
    }
  });
});