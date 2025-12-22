#!/usr/bin/env node

/**
 * Projects Helper Script
 *
 * Utility script to analyze, categorize, and manage projects.yaml
 *
 * Usage:
 *   node _scripts/projects-helper.js [command]
 *
 * Commands:
 *   stats              - Show project statistics
 *   list-cv            - List CV-featured projects
 *   list-hackathons    - List all hackathon projects
 *   list-classes       - List all coursework projects
 *   update-json        - Update projects.json from projects.yaml
 *   validate           - Validate projects.yaml structure
 *   toggle-cv <id>     - Toggle CV visibility for a project
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const PROJECTS_YAML = path.join(__dirname, '../data/yaml/projects.yaml');
const PROJECTS_JSON = path.join(__dirname, '../data/json/projects.json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadProjects() {
  const content = fs.readFileSync(PROJECTS_YAML, 'utf8');
  // Remove comment lines for YAML parsing
  const filtered = content.split('\n')
    .filter(line => !line.trim().startsWith('#') || line.includes(':'))
    .join('\n');
  return yaml.load(filtered);
}

function saveProjects(projects) {
  const yaml_content = yaml.dump(projects, {
    lineWidth: -1,
    forceQuotes: true
  });
  fs.writeFileSync(PROJECTS_YAML, yaml_content);
}

function showStats() {
  const projects = loadProjects();

  log('\n📊 PROJECT STATISTICS\n', 'bright');

  const stats = {
    total: projects.length,
    byType: {},
    cvFeatured: 0,
    withAwards: 0,
    years: {}
  };

  projects.forEach(p => {
    // Count by type
    stats.byType[p.type] = (stats.byType[p.type] || 0) + 1;

    // CV featured
    if (p.cv_featured !== false) stats.cvFeatured++;

    // With awards
    if (p.award) stats.withAwards++;

    // Years
    if (p.year) {
      stats.years[p.year] = (stats.years[p.year] || 0) + 1;
    }
  });

  log(`Total Projects: ${stats.total}`, 'cyan');
  log(`CV Featured: ${stats.cvFeatured}`, 'cyan');
  log(`With Awards: ${stats.withAwards}`, 'cyan');

  log('\nBy Type:', 'bright');
  Object.entries(stats.byType).forEach(([type, count]) => {
    log(`  ${type}: ${count}`, 'blue');
  });

  log('\nBy Year:', 'bright');
  Object.entries(stats.years)
    .sort((a, b) => b[0] - a[0])
    .forEach(([year, count]) => {
      log(`  ${year}: ${count}`, 'blue');
    });

  log('');
}

function listCVProjects() {
  const projects = loadProjects();
  const cvProjects = projects.filter(p => p.cv_featured !== false);

  log('\n📋 CV-FEATURED PROJECTS\n', 'bright');

  cvProjects.forEach(p => {
    log(`${p.id}`, 'cyan');
    log(`  Title: ${p.title}`, 'dim');
    log(`  Type: ${p.type}${p.type === 'hackathon' ? ` (${p.hackathon_name})` : p.type === 'class' ? ` (${p.class_name})` : ''}`, 'blue');
    log(`  Year: ${p.year}`, 'blue');
    log(`  Award: ${p.award || 'No'}`, p.award ? 'green' : 'dim');
    log('');
  });

  log(`Total: ${cvProjects.length} projects`, 'bright');
  log('');
}

function listHackathons() {
  const projects = loadProjects();
  const hackathons = projects.filter(p => p.type === 'hackathon');

  log('\n🎯 HACKATHON PROJECTS\n', 'bright');

  hackathons.forEach(p => {
    log(`${p.id}`, 'yellow');
    log(`  Title: ${p.title}`, 'dim');
    log(`  Hackathon: ${p.hackathon_name}`, 'blue');
    log(`  Year: ${p.year}`, 'blue');
    log(`  Award: ${p.award || 'No'}`, p.award ? 'green' : 'dim');
    log(`  CV Featured: ${p.cv_featured !== false ? 'Yes' : 'No'}`, p.cv_featured !== false ? 'green' : 'yellow');
    log('');
  });

  log(`Total: ${hackathons.length} projects`, 'bright');
  log('');
}

function listClasses() {
  const projects = loadProjects();
  const classes = projects.filter(p => p.type === 'class');

  log('\n📚 COURSEWORK PROJECTS\n', 'bright');

  classes.forEach(p => {
    log(`${p.id}`, 'cyan');
    log(`  Title: ${p.title}`, 'dim');
    log(`  Course: ${p.class_name}`, 'blue');
    log(`  Year: ${p.year}`, 'blue');
    log(`  CV Featured: ${p.cv_featured !== false ? 'Yes' : 'No'}`, p.cv_featured !== false ? 'green' : 'yellow');
    log('');
  });

  log(`Total: ${classes.length} projects`, 'bright');
  log('');
}

function validateProjects() {
  const projects = loadProjects();
  let hasErrors = false;

  log('\n✓ VALIDATING PROJECTS\n', 'bright');

  projects.forEach((p, idx) => {
    const errors = [];

    // Required fields
    if (!p.id) errors.push('Missing id');
    if (!p.title) errors.push('Missing title');
    if (!p.type) errors.push('Missing type');
    if (!p.year) errors.push('Missing year');
    if (!p.image) errors.push('Missing image');
    if (!p.technologies || !Array.isArray(p.technologies)) errors.push('Missing or invalid technologies');

    // Type-specific validation
    if (p.type === 'hackathon' && !p.hackathon_name) errors.push('Hackathon missing hackathon_name');
    if (p.type === 'class' && !p.class_name) errors.push('Class missing class_name');

    if (errors.length > 0) {
      hasErrors = true;
      log(`❌ Project #${idx + 1} (${p.id}):`, 'red');
      errors.forEach(err => log(`   - ${err}`, 'red'));
    }
  });

  if (!hasErrors) {
    log('✅ All projects valid!', 'green');
  }
  log('');
}

function updateJSON() {
  try {
    const { convertYamlToJson } = require('./yaml-to-json.js');
    const projectsYamlPath = path.join(__dirname, '../data/yaml/projects.yaml');
    const jsonDir = path.join(__dirname, '../data/json');

    convertYamlToJson(projectsYamlPath, jsonDir);
    log('\n✅ projects.json updated successfully!\n', 'green');
  } catch (error) {
    log(`\n❌ Error updating JSON: ${error.message}\n`, 'red');
  }
}

function toggleCV(projectId) {
  const projects = loadProjects();
  const project = projects.find(p => p.id === projectId);

  if (!project) {
    log(`\n❌ Project not found: ${projectId}\n`, 'red');
    return;
  }

  const wasFeatured = project.cv_featured !== false;
  project.cv_featured = wasFeatured ? false : true;

  saveProjects(projects);

  log(`\n✅ Updated ${projectId}:`, 'green');
  log(`   CV Featured: ${!wasFeatured}\n`, 'blue');
}

function showHelp() {
  log('\n📖 PROJECTS HELPER - Usage\n', 'bright');
  log('Commands:', 'bright');
  log('  stats              - Show project statistics', 'dim');
  log('  list-cv            - List CV-featured projects', 'dim');
  log('  list-hackathons    - List all hackathon projects', 'dim');
  log('  list-classes       - List all coursework projects', 'dim');
  log('  update-json        - Update projects.json from projects.yaml', 'dim');
  log('  validate           - Validate projects.yaml structure', 'dim');
  log('  toggle-cv <id>     - Toggle CV visibility for a project', 'dim');
  log('  help               - Show this help message', 'dim');
  log('\nExample:', 'bright');
  log('  node _scripts/projects-helper.js stats', 'dim');
  log('  node _scripts/projects-helper.js toggle-cv neural-network-visualizer\n', 'dim');
}

// Main
const command = process.argv[2] || 'help';

try {
  switch (command) {
    case 'stats':
      showStats();
      break;
    case 'list-cv':
      listCVProjects();
      break;
    case 'list-hackathons':
      listHackathons();
      break;
    case 'list-classes':
      listClasses();
      break;
    case 'update-json':
      updateJSON();
      break;
    case 'validate':
      validateProjects();
      break;
    case 'toggle-cv':
      if (!process.argv[3]) {
        log('\n❌ Error: Please provide a project ID\n', 'red');
        log('Usage: node _scripts/projects-helper.js toggle-cv <project-id>\n', 'dim');
        break;
      }
      toggleCV(process.argv[3]);
      break;
    case 'help':
    default:
      showHelp();
  }
} catch (error) {
  log(`\n❌ Error: ${error.message}\n`, 'red');
  process.exit(1);
}
