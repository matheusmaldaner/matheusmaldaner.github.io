#!/usr/bin/env node

/**
 * Generate Combined Data File
 *
 * Combines all YAML files from data/yaml/ into a single combined-data.yaml file.
 * This creates a "knowledge base" file containing all of Matheus's accomplishments
 * that can be easily shared with AI assistants or used for other purposes.
 *
 * Usage: node _scripts/generate-combined.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const YAML_DIR = path.join(__dirname, '../data/yaml');
const OUTPUT_FILE = path.join(__dirname, '../data/combined-data.yaml');

/**
 * Load a YAML file and return its contents
 */
function loadYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.warn(`Warning: Could not load ${path.basename(filePath)}: ${error.message}`);
    return null;
  }
}

/**
 * Get all YAML files from a directory (non-recursive for main level)
 */
function getYamlFiles(dir) {
  const files = fs.readdirSync(dir);
  return files
    .filter(file => /\.ya?ml$/i.test(file))
    .map(file => path.join(dir, file));
}

/**
 * Main function to generate combined data
 */
function generateCombinedData() {
  console.log('\nGenerating combined-data.yaml...\n');

  // Define the order and structure of sections
  const sections = [
    { key: 'about', file: 'about.yaml', label: 'Personal Information' },
    { key: 'education', file: 'education.yaml', label: 'Education' },
    { key: 'experiences', file: 'experiences.yaml', label: 'Work & Research Experience' },
    { key: 'publications', file: 'publications.yaml', label: 'Publications' },
    { key: 'awards', file: 'awards.yaml', label: 'Awards & Honors' },
    { key: 'skills', file: 'skills.yaml', label: 'Skills' },
    { key: 'memberships', file: 'memberships.yaml', label: 'Professional Memberships' },
    { key: 'references', file: 'references.yaml', label: 'References' },
    { key: 'people', file: 'people.yaml', label: 'Collaborators & Mentors' },
    { key: 'press', file: 'press.yaml', label: 'Press & Media Coverage' },
    { key: 'organizer', file: 'organizer.yaml', label: 'Event Organization' },
    { key: 'reviewer', file: 'reviewer.yaml', label: 'Reviewer Experience' },
    { key: 'mentoring', file: 'mentoring.yaml', label: 'Mentoring' },
    { key: 'institutional', file: 'institutional.yaml', label: 'Institutional Service' },
    { key: 'social_links', file: 'social-links.yaml', label: 'Social Links & Contact' },
    { key: 'news', file: 'news-data.yaml', label: 'News & Updates' },
    { key: 'talks', file: 'talks.yaml', label: 'Talks & Presentations' },
    { key: 'teaching', file: 'teaching.yaml', label: 'Teaching Experience' },
    { key: 'funding', file: 'funding.yaml', label: 'Funding & Grants' },
    { key: 'articles', file: 'articles.yaml', label: 'Articles' },
    { key: 'designs', file: 'designs.yaml', label: 'Design Work' },
    { key: 'paper_pages', file: 'paper-pages.yaml', label: 'Paper Pages' },
    { key: 'parametric_articles', file: 'parametric-articles.yaml', label: 'Parametric Articles' },
    { key: 'pc', file: 'pc.yaml', label: 'Program Committee Service' },
  ];

  const combinedData = {
    _metadata: {
      title: 'Matheus Kunzler Maldaner - Combined Knowledge Base',
      description: 'Auto-generated file combining all data from individual YAML files',
      generated_at: new Date().toISOString(),
      source: 'https://matheus.wiki',
      note: 'This file is auto-generated. Edit individual YAML files in data/yaml/ instead.',
    },
  };

  let loadedCount = 0;
  let skippedCount = 0;

  for (const section of sections) {
    const filePath = path.join(YAML_DIR, section.file);

    if (fs.existsSync(filePath)) {
      const data = loadYamlFile(filePath);

      if (data !== null && data !== undefined) {
        // Skip empty arrays or null values
        if (Array.isArray(data) && data.length === 0) {
          console.log(`  ⊘ ${section.file} (empty array, skipped)`);
          skippedCount++;
          continue;
        }

        combinedData[section.key] = data;
        console.log(`  ✓ ${section.file} → ${section.key}`);
        loadedCount++;
      } else {
        console.log(`  ⊘ ${section.file} (empty or null, skipped)`);
        skippedCount++;
      }
    } else {
      console.log(`  ✗ ${section.file} (not found)`);
      skippedCount++;
    }
  }

  // Check for dissertation subdirectory
  const dissertationDir = path.join(YAML_DIR, 'dissertation');
  if (fs.existsSync(dissertationDir)) {
    const dissertationFiles = getYamlFiles(dissertationDir);
    if (dissertationFiles.length > 0) {
      combinedData.dissertation = {};
      for (const file of dissertationFiles) {
        const data = loadYamlFile(file);
        if (data) {
          const key = path.basename(file, path.extname(file));
          combinedData.dissertation[key] = data;
          console.log(`  ✓ dissertation/${path.basename(file)} → dissertation.${key}`);
          loadedCount++;
        }
      }
    }
  }

  // Generate the YAML output with a nice header
  const header = `# =============================================================================
# Matheus Kunzler Maldaner - Combined Knowledge Base
# =============================================================================
#
# This file is AUTO-GENERATED from individual YAML files in data/yaml/
# DO NOT edit this file directly - edit the source files instead.
#
# Generated: ${new Date().toISOString()}
# Website: https://matheus.wiki
#
# This file can be used to:
# - Share your complete profile with AI assistants
# - Export your data in a single portable format
# - Backup all your accomplishments
#
# =============================================================================

`;

  const yamlContent = yaml.dump(combinedData, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  fs.writeFileSync(OUTPUT_FILE, header + yamlContent, 'utf8');

  console.log(`\n✓ Generated combined-data.yaml`);
  console.log(`  - ${loadedCount} sections loaded`);
  console.log(`  - ${skippedCount} sections skipped (empty or missing)`);
  console.log(`  - Output: data/combined-data.yaml\n`);
}

// Run the generator
if (require.main === module) {
  generateCombinedData();
}

module.exports = { generateCombinedData };
