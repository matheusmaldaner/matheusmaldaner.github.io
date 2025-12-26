/**
 * Generate sitemap.xml with dynamic lastmod dates from git history
 *
 * This script:
 * 1. Gets the last git commit date for each page
 * 2. Falls back to current date if git fails
 * 3. Generates a valid sitemap.xml
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Site configuration
const SITE_URL = 'https://matheus.wiki';

// Pages to include in sitemap with their priorities and change frequencies
const PAGES = [
  { path: '/', file: 'index.html', priority: '1.0', changefreq: 'monthly' },
  { path: '/pages/news.html', file: 'pages/news.html', priority: '0.8', changefreq: 'weekly' },
  { path: '/pages/projects.html', file: 'pages/projects.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/pages/research.html', file: 'pages/research.html', priority: '0.9', changefreq: 'monthly' },
  { path: '/cv/', file: 'cv/index.md', priority: '0.8', changefreq: 'monthly' },
  { path: '/404.html', file: '404.html', priority: '0.1', changefreq: 'yearly' }
];

/**
 * Get the last git commit date for a file
 * @param {string} filePath - Path to the file
 * @returns {string} - ISO date string (YYYY-MM-DD)
 */
function getLastModifiedDate(filePath) {
  try {
    // Get the last commit date for this file in ISO format
    const gitDate = execSync(
      `git log -1 --format="%ci" -- "${filePath}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    if (gitDate) {
      // Parse git date format: "2025-12-24 10:30:00 -0500"
      const date = new Date(gitDate);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    }
  } catch {
    // Git command failed - file might be new or untracked
    console.warn(`Warning: Could not get git date for ${filePath}`);
  }

  // Fallback to current date
  return new Date().toISOString().split('T')[0];
}

/**
 * Generate the sitemap XML content
 * @returns {string} - Complete sitemap XML
 */
function generateSitemap() {
  const urlEntries = PAGES.map(page => {
    const lastmod = getLastModifiedDate(page.file);
    const fullUrl = `${SITE_URL}${page.path}`;

    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

/**
 * Main function
 */
function main() {
  console.log('Generating sitemap.xml with git-based lastmod dates...');

  const sitemap = generateSitemap();
  const outputPath = path.join(__dirname, '..', 'sitemap.xml');

  fs.writeFileSync(outputPath, sitemap, 'utf-8');

  console.log(`Sitemap generated successfully: ${outputPath}`);
  console.log('Pages included:');
  PAGES.forEach(page => {
    const lastmod = getLastModifiedDate(page.file);
    console.log(`  - ${page.path} (lastmod: ${lastmod})`);
  });
}

main();
