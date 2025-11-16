#!/usr/bin/env node

/**
 * YAML to JSON Converter
 *
 * Converts YAML files in the data/ directory to JSON format.
 * This allows editing data in human-friendly YAML while serving
 * JSON to the browser for better performance.
 *
 * Usage: node _scripts/yaml-to-json.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DATA_DIR = path.join(__dirname, '../data');
const VERBOSE = process.env.VERBOSE === 'true';

/**
 * Convert a YAML file to JSON
 */
function convertYamlToJson(yamlFilePath) {
  try {
    const yamlContent = fs.readFileSync(yamlFilePath, 'utf8');
    const data = yaml.load(yamlContent);

    const jsonFilePath = yamlFilePath.replace(/\.ya?ml$/, '.json');
    const jsonContent = JSON.stringify(data, null, 2);

    fs.writeFileSync(jsonFilePath, jsonContent, 'utf8');

    const fileName = path.basename(yamlFilePath);
    const outputFileName = path.basename(jsonFilePath);
    console.log(`✓ Converted ${fileName} → ${outputFileName}`);

    return true;
  } catch (error) {
    console.error(`✗ Error converting ${path.basename(yamlFilePath)}:`, error.message);
    return false;
  }
}

/**
 * Process all YAML files in the data directory
 */
function processDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Error: Data directory not found at ${DATA_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR);
  const yamlFiles = files.filter(file => /\.ya?ml$/i.test(file));

  if (yamlFiles.length === 0) {
    console.log('No YAML files found in data/ directory');
    return;
  }

  console.log(`\nConverting ${yamlFiles.length} YAML file(s)...\n`);

  let successCount = 0;
  let failCount = 0;

  yamlFiles.forEach(file => {
    const yamlFilePath = path.join(DATA_DIR, file);

    // Skip if it's a directory
    if (fs.statSync(yamlFilePath).isDirectory()) {
      return;
    }

    const success = convertYamlToJson(yamlFilePath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(`\n${successCount} file(s) converted successfully`);
  if (failCount > 0) {
    console.log(`${failCount} file(s) failed to convert`);
    process.exit(1);
  }
}

// Run the conversion
if (require.main === module) {
  processDataDirectory();
}

module.exports = { convertYamlToJson, processDataDirectory };
