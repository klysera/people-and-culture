# GitHub Pages Testing with Playwright

## Setup

1. Install Node.js and npm if not already installed
2. Install dependencies:
```bash
npm install
npx playwright install
```

## Running Tests

### Basic test run:
```bash
npm test
```

### Run with browser UI (headed mode):
```bash
npm run test:headed
```

### Interactive test runner:
```bash
npm run test:ui
```

### View test results:
```bash
npm run test:report
```

## What the Tests Check

### Navigation Tests
- ✅ Homepage loads correctly
- ✅ Navigation links work
- ✅ Overview pages render as HTML (not .md files)
- ✅ Breadcrumb navigation functions
- ✅ All section overview pages are accessible
- ✅ Mobile navigation works
- ✅ External links work correctly
- ✅ Site map functionality
- ✅ Page load performance

### Mermaid Diagram Tests
- ✅ Mermaid.js script loads
- ✅ Diagrams render as SVG elements
- ✅ Multiple diagram types work

### Accessibility Tests
- ✅ Proper heading structure
- ✅ Descriptive link text
- ✅ Alt text for images

## Expected Results

All tests should pass, confirming:
1. **Navigation works**: No 404 errors on overview pages
2. **Mermaid diagrams render**: SVG elements appear where expected
3. **Mobile-friendly**: Works on different screen sizes
4. **Fast loading**: Pages load within 5 seconds
5. **Accessible**: Proper heading structure and descriptive links

## Troubleshooting

If tests fail:
1. Check if GitHub Pages site is deployed: https://klysera.github.io/people-and-culture/
2. Verify Mermaid diagrams are visible in browser
3. Test navigation manually to confirm issues
4. Check browser console for JavaScript errors

## Running Specific Tests

```bash
# Test only navigation
npx playwright test --grep "Navigation"

# Test only Mermaid diagrams
npx playwright test --grep "Mermaid"

# Test on specific browser
npx playwright test --project=chromium

# Test on mobile only
npx playwright test --project="Mobile Chrome"
```

## Continuous Integration

These tests can be integrated into GitHub Actions for automated testing on every push to main branch.