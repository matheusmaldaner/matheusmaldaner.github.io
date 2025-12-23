#!/usr/bin/env node

/**
 * Generate CV Posts from YAML
 *
 * Converts YAML data files into Jekyll markdown posts for the CV section.
 * This enables RSS/Atom feed generation via jekyll-feed plugin.
 *
 * Generates:
 *   - cv/_posts/papers/*.md from data/yaml/publications.yaml
 *   - cv/_posts/news/*.md from data/yaml/news-data.yaml
 *   - cv/_posts/projects/*.md from data/yaml/projects.yaml
 *
 * Usage: node _scripts/generate-cv-posts.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT_DIR = path.join(__dirname, '..');
const YAML_DIR = path.join(ROOT_DIR, 'data/yaml');
const CV_POSTS_DIR = path.join(ROOT_DIR, 'cv/_posts');

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Clear directory contents (but keep the directory)
 */
function clearDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isFile() && file.endsWith('.md')) {
        fs.unlinkSync(filePath);
      }
    }
  }
}

/**
 * Convert date string to Jekyll-compatible date (YYYY-MM-DD)
 */
function parseDate(dateStr, year) {
  if (!dateStr && !year) return null;

  // If it's already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try to parse "Month DD, YYYY" format (e.g., "October 29, 2025")
  const monthMatch = dateStr?.match(/^(\w+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthMatch) {
    const months = {
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };
    const month = months[monthMatch[1].toLowerCase()];
    const day = monthMatch[2].padStart(2, '0');
    const yr = monthMatch[3];
    if (month) {
      return `${yr}-${month}-${day}`;
    }
  }

  // Fallback: use year with default month/day
  if (year) {
    return `${year}-01-01`;
  }

  return null;
}

/**
 * Escape YAML string values
 */
function escapeYamlString(str) {
  if (!str) return '';
  // If string contains special characters, wrap in quotes
  if (/[:#\[\]{}|>&*!?,\\]/.test(str) || str.includes('\n')) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

/**
 * Generate Jekyll front matter from object
 */
function generateFrontMatter(data) {
  const lines = ['---'];

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        if (typeof item === 'object') {
          // Handle objects in arrays (like links)
          lines.push(`  -`);
          for (const [k, v] of Object.entries(item)) {
            lines.push(`    ${k}: ${escapeYamlString(String(v))}`);
          }
        } else {
          lines.push(`  - ${escapeYamlString(String(item))}`);
        }
      }
    } else if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value)) {
        lines.push(`  ${k}: ${escapeYamlString(String(v))}`);
      }
    } else if (typeof value === 'string' && value.includes('\n')) {
      // Multi-line string (like bibtex)
      lines.push(`${key}: |-`);
      for (const line of value.split('\n')) {
        lines.push(`  ${line}`);
      }
    } else {
      lines.push(`${key}: ${escapeYamlString(String(value))}`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Generate publication posts from publications.yaml
 */
function generatePublicationPosts() {
  const yamlPath = path.join(YAML_DIR, 'publications.yaml');
  const outputDir = path.join(CV_POSTS_DIR, 'papers');

  if (!fs.existsSync(yamlPath)) {
    console.log('  ⚠ publications.yaml not found, skipping');
    return 0;
  }

  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  const publications = yaml.load(yamlContent) || [];

  ensureDir(outputDir);
  clearDir(outputDir);

  let count = 0;
  for (const pub of publications) {
    const date = parseDate(null, pub.year);
    if (!date) {
      console.log(`  ⚠ Skipping ${pub.id}: no valid date`);
      continue;
    }

    // Determine publication date more precisely if possible
    let pubDate = date;
    // For papers, use a month estimate based on venue type or default to middle of year
    if (pub.type === 'conference') {
      pubDate = `${pub.year}-06-01`; // conferences typically mid-year
    } else if (pub.type === 'journal') {
      pubDate = `${pub.year}-01-01`;
    } else if (pub.type === 'arxiv' || pub.type === 'preprint') {
      pubDate = `${pub.year}-07-01`;
    } else if (pub.type === 'thesis') {
      pubDate = `${pub.year}-05-15`; // thesis typically May
    }

    const frontMatter = {
      layout: 'paper',
      id: pub.id,
      categories: 'papers',
      permalink: `papers/${pub.id}`,
      title: pub.title,
      authors: pub.authors,
      venue: pub.venue,
      'venue-shorthand': pub['venue-shorthand'] || null,
      year: pub.year,
      url: `/papers/${pub.id}`,
      pdf: pub.pdf || null,
      link: pub.url || null,
      code: pub.code || null,
      demo: pub.demo || pub.preview || null,
      blog: pub.blog || null,
      selected: pub.featured || false,
      type: pub.type || 'paper',
      figure: pub.image || null,
      award: pub.award || null,
      'coming-soon': false,
      bibtex: pub.bibtex || null
    };

    // Remove null values
    for (const key of Object.keys(frontMatter)) {
      if (frontMatter[key] === null) delete frontMatter[key];
    }

    const content = pub.abstract || '';
    const markdown = `${generateFrontMatter(frontMatter)}\n\n${content}\n`;

    const filename = `${pubDate}-${pub.id}.md`;
    fs.writeFileSync(path.join(outputDir, filename), markdown);
    count++;
  }

  return count;
}

/**
 * Generate news posts from news-data.yaml
 */
function generateNewsPosts() {
  const yamlPath = path.join(YAML_DIR, 'news-data.yaml');
  const outputDir = path.join(CV_POSTS_DIR, 'news');

  if (!fs.existsSync(yamlPath)) {
    console.log('  ⚠ news-data.yaml not found, skipping');
    return 0;
  }

  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  const newsItems = yaml.load(yamlContent) || [];

  ensureDir(outputDir);
  clearDir(outputDir);

  let count = 0;
  for (const item of newsItems) {
    // Skip hidden items
    if (item.hidden) continue;

    const date = parseDate(item.date, null);
    if (!date) {
      console.log(`  ⚠ Skipping ${item.id}: no valid date`);
      continue;
    }

    const frontMatter = {
      layout: 'post',
      id: item.id,
      categories: 'news',
      permalink: `news/${item.id}`,
      title: item.title,
      date: date,
      category: item.category,
      featured: item.featured || false,
      image: item.image || null,
      gallery: item.gallery || null,
      links: item.links || null
    };

    // Remove null values
    for (const key of Object.keys(frontMatter)) {
      if (frontMatter[key] === null) delete frontMatter[key];
    }

    let content = item.description || '';
    if (item.secondParagraph) {
      content += `\n\n${item.secondParagraph}`;
    }

    const markdown = `${generateFrontMatter(frontMatter)}\n\n${content}\n`;

    const filename = `${date}-${item.id.replace(/^\d{4}-\d{2}-\d{2}-/, '')}.md`;
    fs.writeFileSync(path.join(outputDir, filename), markdown);
    count++;
  }

  return count;
}

/**
 * Generate project posts from projects.yaml
 */
function generateProjectPosts() {
  const yamlPath = path.join(YAML_DIR, 'projects.yaml');
  const outputDir = path.join(CV_POSTS_DIR, 'projects');

  if (!fs.existsSync(yamlPath)) {
    console.log('  ⚠ projects.yaml not found, skipping');
    return 0;
  }

  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  const projects = yaml.load(yamlContent) || [];

  ensureDir(outputDir);
  clearDir(outputDir);

  let count = 0;
  for (const project of projects) {
    const date = parseDate(null, project.year);
    if (!date) {
      console.log(`  ⚠ Skipping ${project.id}: no valid date`);
      continue;
    }

    const frontMatter = {
      layout: 'post',
      id: project.id,
      categories: 'projects',
      permalink: `projects/${project.id}`,
      title: project.title,
      date: date,
      type: project.type,
      year: project.year,
      technologies: project.technologies || null,
      image: project.image || null,
      'image-alt': project['image-alt'] || null,
      links: project.links || null,
      collaborators: project.collaborators || null,
      award: project.award || null,
      featured: project.featured || project.cv_featured || false,
      hackathon_name: project.hackathon_name || null,
      class_name: project.class_name || null
    };

    // Remove null values
    for (const key of Object.keys(frontMatter)) {
      if (frontMatter[key] === null) delete frontMatter[key];
    }

    const content = project.description || '';
    const markdown = `${generateFrontMatter(frontMatter)}\n\n${content}\n`;

    const filename = `${date}-${project.id}.md`;
    fs.writeFileSync(path.join(outputDir, filename), markdown);
    count++;
  }

  return count;
}

/**
 * Main function
 */
function main() {
  console.log('\nGenerating CV posts from YAML sources...\n');

  console.log('Publications:');
  const pubCount = generatePublicationPosts();
  console.log(`  ✓ Generated ${pubCount} publication posts\n`);

  console.log('News:');
  const newsCount = generateNewsPosts();
  console.log(`  ✓ Generated ${newsCount} news posts\n`);

  console.log('Projects:');
  const projectCount = generateProjectPosts();
  console.log(`  ✓ Generated ${projectCount} project posts\n`);

  const total = pubCount + newsCount + projectCount;
  console.log(`Total: ${total} posts generated`);
  console.log('Run "cd cv && bundle exec jekyll build" to regenerate the feed.\n');
}

// Run
if (require.main === module) {
  main();
}

module.exports = { generatePublicationPosts, generateNewsPosts, generateProjectPosts };
