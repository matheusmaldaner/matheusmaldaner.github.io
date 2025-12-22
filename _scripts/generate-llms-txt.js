#!/usr/bin/env node

/**
 * Generate llms.txt
 *
 * Creates an llms.txt file from combined-data.yaml for AI/LLM indexing.
 * This file helps AI systems understand the most important content on the site.
 *
 * Usage: node _scripts/generate-llms-txt.js
 *
 * References:
 * - https://llmstxt.org/
 * - https://www.xfunnel.ai/blog/understanding-llms-2025
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const COMBINED_DATA_FILE = path.join(__dirname, '../data/combined-data.yaml');
const OUTPUT_FILE = path.join(__dirname, '../llms.txt');
const SITE_URL = 'https://matheus.wiki';

/**
 * Load the combined data YAML file
 */
function loadCombinedData() {
  try {
    const content = fs.readFileSync(COMBINED_DATA_FILE, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error(`Error loading combined-data.yaml: ${error.message}`);
    console.error('Run "npm run generate:combined" first.');
    process.exit(1);
  }
}

/**
 * Strip HTML tags from a string
 */
function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncate text to a maximum length
 */
function truncate(str, maxLength = 200) {
  if (!str) return '';
  const cleaned = stripHtml(str).replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 3) + '...';
}

/**
 * Format authors list
 */
function formatAuthors(authors) {
  if (!authors) return '';
  if (Array.isArray(authors)) {
    return authors.join(', ');
  }
  return authors;
}

/**
 * Generate the llms.txt content
 */
function generateLlmsTxt(data) {
  const lines = [];
  const generatedDate = new Date().toISOString().split('T')[0];

  // Header
  lines.push('# Matheus Kunzler Maldaner');
  lines.push('');
  lines.push('> Personal website of Matheus Kunzler Maldaner - AI/ML researcher and M.S. AI Systems student at the University of Florida. Research focus: Neurosymbolic AI, Human-Computer Interaction, and Agentic Systems.');
  lines.push('');
  lines.push(`Last updated: ${generatedDate}`);
  lines.push('');

  // About section
  if (data.about) {
    lines.push('## About');
    lines.push('');
    if (data.about.bio?.main) {
      lines.push(truncate(data.about.bio.main, 500));
    }
    lines.push('');
    lines.push(`- [Homepage](${SITE_URL}/)`);
    lines.push(`- [CV](${SITE_URL}/cv/)`);
    lines.push('');
  }

  // Publications section
  if (data.publications && data.publications.length > 0) {
    lines.push('## Research Publications');
    lines.push('');

    // Sort by year descending
    const sortedPubs = [...data.publications].sort((a, b) => (b.year || 0) - (a.year || 0));

    for (const pub of sortedPubs) {
      const authors = formatAuthors(pub.authors);
      const venue = pub.venue || '';
      const year = pub.year || '';
      const url = pub.url && pub.url !== '#' ? pub.url : null;

      if (url) {
        lines.push(`- [${pub.title}](${url}): ${truncate(pub.abstract, 150)} (${venue}, ${year})`);
      } else {
        lines.push(`- ${pub.title}: ${truncate(pub.abstract, 150)} (${venue}, ${year})`);
      }
    }
    lines.push('');
  }

  // Projects section - load from projects.json since it's not in combined-data.yaml
  const projectsFile = path.join(__dirname, '../data/json/projects.json');
  if (fs.existsSync(projectsFile)) {
    try {
      const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
      const featuredProjects = projects.filter(p => p.featured || p.cv_featured);

      if (featuredProjects.length > 0) {
        lines.push('## Featured Projects');
        lines.push('');

        for (const project of featuredProjects) {
          const url = project.links?.demo || project.links?.github || project.links?.paper || null;
          const desc = truncate(project.description, 150);

          if (url) {
            lines.push(`- [${project.title}](${url}): ${desc}`);
          } else {
            lines.push(`- ${project.title}: ${desc}`);
          }
        }
        lines.push('');
      }
    } catch (e) {
      // Skip if projects.json can't be loaded
    }
  }

  // Education section
  if (data.education && data.education.length > 0) {
    lines.push('## Education');
    lines.push('');

    for (const edu of data.education) {
      const degree = edu.degree || '';
      const institution = edu.institution || '';
      const years = edu.years || '';
      lines.push(`- ${degree}, ${institution} (${years})`);
    }
    lines.push('');
  }

  // Awards section (top awards only)
  if (data.awards && data.awards.length > 0) {
    lines.push('## Selected Awards');
    lines.push('');

    // Take top 10 most recent/important awards
    const topAwards = data.awards.slice(0, 10);

    for (const award of topAwards) {
      const name = award.name || award.title || '';
      const org = award.organization || award.issuer || '';
      const year = award.year || award.date || '';
      lines.push(`- ${name}${org ? ` (${org})` : ''}${year ? ` - ${year}` : ''}`);
    }
    lines.push('');
  }

  // Experience section
  if (data.experiences && data.experiences.length > 0) {
    lines.push('## Experience');
    lines.push('');

    for (const exp of data.experiences) {
      const position = exp.position || '';
      const institution = exp.institution || '';
      const year = exp.year || '';
      lines.push(`- ${position} at ${institution} (${year})`);
    }
    lines.push('');
  }

  // Contact/Social links
  if (data.social_links && data.social_links.length > 0) {
    lines.push('## Contact & Links');
    lines.push('');

    // Filter to important links only
    const importantIds = ['email', 'github', 'linkedin', 'scholar', 'twitter'];
    const importantLinks = data.social_links.filter(link =>
      importantIds.includes(link.id) && link.url
    );

    for (const link of importantLinks) {
      const name = link.description || link.id || '';
      lines.push(`- [${name}](${link.url})`);
    }
    lines.push('');
  }

  // Site pages
  lines.push('## Site Pages');
  lines.push('');
  lines.push(`- [About / Home](${SITE_URL}/): Main landing page with bio and social links`);
  lines.push(`- [News](${SITE_URL}/pages/news.html): Latest updates, awards, and announcements`);
  lines.push(`- [Projects](${SITE_URL}/pages/projects.html): Software projects, hackathon wins, and demos`);
  lines.push(`- [Research](${SITE_URL}/pages/research.html): Publications, papers, and research posters`);
  lines.push(`- [CV](${SITE_URL}/cv/): Full academic curriculum vitae`);
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`This file was auto-generated on ${generatedDate} from ${SITE_URL}`);

  return lines.join('\n');
}

/**
 * Main function
 */
function main() {
  console.log('\nGenerating llms.txt...\n');

  const data = loadCombinedData();
  const content = generateLlmsTxt(data);

  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');

  const stats = fs.statSync(OUTPUT_FILE);
  console.log(`✓ Generated llms.txt (${stats.size} bytes)`);
  console.log(`  Output: llms.txt\n`);
}

// Run
if (require.main === module) {
  main();
}

module.exports = { generateLlmsTxt };
