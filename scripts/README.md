# Scripts Directory

This directory contains utility and testing scripts for the Klysera People & Culture documentation site.

## Navigation Testing Scripts

### Core Testing
- `comprehensive-site-test.js` - Complete site functionality test
- `test-site-navigation.js` - Basic navigation and structure testing
- `test-live-site.js` - Live GitHub Pages site testing
- `final-comprehensive-test.js` - Final integration test for all features

### Specific Feature Tests
- `test-navbar-sidebar-fixes.js` - Tests navbar and sidebar improvements
- `test-collapsible-sidebar.js` - Tests sidebar collapse functionality
- `test-final-navigation.js` - Tests navigation improvements
- `test-research-dropdown.js` - Tests Research menu dropdown
- `test-navigation-issues.js` - General navigation issue detection
- `test-link-visibility.js` - Tests internal link visibility
- `test-specific-links.js` - Tests specific page links
- `test-all-improvements.js` - Tests all UI improvements
- `test-final-improvements.js` - Final improvement verification

### Utility Scripts
- `fix-all-relative-paths.js` - Fixes relative paths in documentation files
- `fix-internal-links.js` - Repairs internal link issues
- `debug-navbar.js` - Debug navbar structure and content
- `simple-link-test.js` - Basic link functionality test

## Usage

All scripts are designed to run with Node.js and Playwright:

```bash
# Example usage
node scripts/comprehensive-site-test.js
node scripts/fix-all-relative-paths.js
```

## Requirements

- Node.js
- Playwright (installed via npm)
- Active internet connection for testing live site

## Note

These scripts were created during the development and testing phases of the documentation site. They help ensure navigation functionality, fix link issues, and verify that all improvements work correctly on the live GitHub Pages deployment.