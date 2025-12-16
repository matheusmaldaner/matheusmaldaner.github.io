#!/usr/bin/env node

/**
 * YAML to JSON Converter
 *
 * Converts YAML files in the data/yaml/ directory to JSON format in data/json/.
 * This allows editing data in human-friendly YAML while serving
 * JSON to the browser for better performance.
 *
 * Usage: node _scripts/yaml-to-json.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const YAML_DIR = path.join(__dirname, '../data/yaml');
const JSON_DIR = path.join(__dirname, '../data/json');

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Convert a YAML file to JSON
 */
function convertYamlToJson(yamlFilePath, outputDir) {
  try {
    const yamlContent = fs.readFileSync(yamlFilePath, 'utf8');
    const data = yaml.load(yamlContent);

    const fileName = path.basename(yamlFilePath).replace(/\.ya?ml$/, '.json');
    const jsonFilePath = path.join(outputDir, fileName);
    const jsonContent = JSON.stringify(data, null, 2);

    ensureDir(outputDir);
    fs.writeFileSync(jsonFilePath, jsonContent, 'utf8');

    const relativeYaml = path.relative(YAML_DIR, yamlFilePath);
    const relativeJson = path.relative(JSON_DIR, jsonFilePath);
    console.log(`✓ ${relativeYaml} → ${relativeJson}`);

    return true;
  } catch (error) {
    console.error(`✗ Error converting ${path.basename(yamlFilePath)}:`, error.message);
    return false;
  }
}

/**
 * Process directory recursively
 */
function processDirectory(inputDir, outputDir) {
  let successCount = 0;
  let failCount = 0;

  const items = fs.readdirSync(inputDir);

  for (const item of items) {
    const inputPath = path.join(inputDir, item);
    const stat = fs.statSync(inputPath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      const subOutputDir = path.join(outputDir, item);
      const result = processDirectory(inputPath, subOutputDir);
      successCount += result.successCount;
      failCount += result.failCount;
    } else if (/\.ya?ml$/i.test(item)) {
      // Convert YAML files
      const success = convertYamlToJson(inputPath, outputDir);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
  }

  return { successCount, failCount };
}

/**
 * Main function
 */
function main() {
  if (!fs.existsSync(YAML_DIR)) {
    console.error(`Error: YAML directory not found at ${YAML_DIR}`);
    process.exit(1);
  }

  console.log(`\nConverting YAML files from data/yaml/ to data/json/...\n`);

  ensureDir(JSON_DIR);
  const { successCount, failCount } = processDirectory(YAML_DIR, JSON_DIR);

  console.log(`\n${successCount} file(s) converted successfully`);
  if (failCount > 0) {
    console.log(`${failCount} file(s) failed to convert`);
    process.exit(1);
  }
}

// Run the conversion
if (require.main === module) {
  main();
}

module.exports = { convertYamlToJson, processDirectory };
