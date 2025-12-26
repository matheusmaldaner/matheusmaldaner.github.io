#!/usr/bin/env node
/**
 * Image Optimization Script
 *
 * - Converts photo PNGs to JPG (skips PNGs with transparency)
 * - Resizes images larger than max dimensions
 * - Compresses JPGs to specified quality
 * - Creates backups before modifying
 *
 * Usage: node _scripts/optimize-images.js [options]
 * Options:
 *   --dry-run      Preview changes without modifying files
 *   --no-convert   Skip PNG to JPG conversion
 *   --quality N    Set JPEG quality (default: 85)
 *   --threshold N  Size threshold in KB (default: 500)
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const CONFIG = {
  maxWidth: 1920,
  maxHeight: 1920,
  jpegQuality: 85,
  sizeThresholdKB: 500,  // Only for compression, not PNG→JPG conversion
  convertPngToJpg: true,
  dryRun: false
};

// Parse CLI arguments
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--dry-run':
      CONFIG.dryRun = true;
      break;
    case '--no-convert':
      CONFIG.convertPngToJpg = false;
      break;
    case '--quality':
      CONFIG.jpegQuality = parseInt(args[++i], 10);
      break;
    case '--threshold':
      CONFIG.sizeThresholdKB = parseInt(args[++i], 10);
      break;
  }
}

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'images');
const BACKUP_DIR = path.join(PROJECT_ROOT, '_image-backups');
const CONVERSIONS_LOG = path.join(__dirname, 'png-to-jpg-conversions.txt');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

// Track conversions for path fixing
const conversions = [];

// Stats tracking
const stats = {
  processed: 0,
  converted: 0,
  optimized: 0,
  skipped: 0,
  savedBytes: 0,
  initialSize: 0,
  finalSize: 0
};

/**
 * Get all image files recursively
 */
function getImageFiles(dir, extensions = ['.png', '.jpg', '.jpeg']) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  try {
    return Math.round(fs.statSync(filePath).size / 1024);
  } catch {
    return 0;
  }
}

/**
 * Get directory size in bytes
 */
function getDirSize(dir) {
  let size = 0;
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        size += fs.statSync(fullPath).size;
      }
    }
  }
  if (fs.existsSync(dir)) {
    walk(dir);
  }
  return size;
}

/**
 * Check if file was already processed (backup exists)
 */
function wasAlreadyProcessed(filePath) {
  const relPath = path.relative(IMAGES_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relPath);
  return fs.existsSync(backupPath);
}

/**
 * Create backup of file
 */
function backupFile(filePath) {
  const relPath = path.relative(IMAGES_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relPath);
  const backupDir = path.dirname(backupPath);

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(filePath, backupPath);
  }
}

/**
 * Check if PNG has transparency
 */
async function hasTransparency(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    if (!metadata.hasAlpha) {
      return false;
    }

    // Check if alpha channel has any transparent pixels
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Sample pixels for transparency (checking every pixel is slow)
    const pixelCount = info.width * info.height;
    const sampleRate = Math.max(1, Math.floor(pixelCount / 10000));

    for (let i = 3; i < data.length; i += 4 * sampleRate) {
      if (data[i] < 255) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Convert PNG to JPG
 */
async function convertPngToJpg(filePath) {
  const sizeBeforeKB = getFileSizeKB(filePath);

  // Check for transparency (only reason to skip conversion)
  if (await hasTransparency(filePath)) {
    console.log(`  Skipping (has transparency): ${path.relative(PROJECT_ROOT, filePath)}`);
    stats.skipped++;
    return false;
  }

  const jpgPath = filePath.replace(/\.png$/i, '.jpg');

  if (CONFIG.dryRun) {
    console.log(`  [DRY-RUN] Would convert: ${path.relative(PROJECT_ROOT, filePath)}`);
    return true;
  }

  backupFile(filePath);

  // Get dimensions and resize if needed
  const metadata = await sharp(filePath).metadata();
  let pipeline = sharp(filePath);

  if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
    pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  await pipeline
    .jpeg({ quality: CONFIG.jpegQuality })
    .toFile(jpgPath);

  // Remove original PNG
  fs.unlinkSync(filePath);

  const sizeAfterKB = getFileSizeKB(jpgPath);
  const savedKB = sizeBeforeKB - sizeAfterKB;
  stats.savedBytes += savedKB * 1024;
  stats.converted++;

  // Track conversion for path fixing
  const relOld = '/' + path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
  const relNew = '/' + path.relative(PROJECT_ROOT, jpgPath).replace(/\\/g, '/');
  conversions.push({ from: relOld, to: relNew });
  fs.appendFileSync(CONVERSIONS_LOG, `${relOld} -> ${relNew}\n`);

  console.log(`  Converted PNG->JPG: ${path.relative(PROJECT_ROOT, filePath)} (${sizeBeforeKB}KB -> ${sizeAfterKB}KB, saved ${savedKB}KB)`);
  return true;
}

/**
 * Optimize image (resize/compress)
 */
async function optimizeImage(filePath) {
  const sizeBeforeKB = getFileSizeKB(filePath);

  if (sizeBeforeKB < CONFIG.sizeThresholdKB) {
    return false;
  }

  // Skip if already processed (backup exists)
  if (wasAlreadyProcessed(filePath)) {
    return false;
  }

  if (CONFIG.dryRun) {
    console.log(`  [DRY-RUN] Would optimize: ${path.relative(PROJECT_ROOT, filePath)} (${sizeBeforeKB}KB)`);
    return true;
  }

  backupFile(filePath);

  const ext = path.extname(filePath).toLowerCase();
  const metadata = await sharp(filePath).metadata();

  let pipeline = sharp(filePath);

  // Resize if needed
  if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
    pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Compress based on format
  const tempPath = filePath + '.tmp';

  if (ext === '.jpg' || ext === '.jpeg') {
    await pipeline
      .jpeg({ quality: CONFIG.jpegQuality })
      .toFile(tempPath);
  } else if (ext === '.png') {
    await pipeline
      .png({ compressionLevel: 9 })
      .toFile(tempPath);
  }

  // Replace original with optimized
  fs.unlinkSync(filePath);
  fs.renameSync(tempPath, filePath);

  const sizeAfterKB = getFileSizeKB(filePath);
  const savedKB = sizeBeforeKB - sizeAfterKB;
  stats.savedBytes += savedKB * 1024;
  stats.optimized++;

  console.log(`  Optimized: ${path.relative(PROJECT_ROOT, filePath)} (${sizeBeforeKB}KB -> ${sizeAfterKB}KB, saved ${savedKB}KB)`);
  return true;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Get all YAML files recursively
 */
function getYamlFiles(dir) {
  const files = [];
  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        files.push(fullPath);
      }
    }
  }
  walk(dir);
  return files;
}

/**
 * Update image paths in YAML files
 */
function updateYamlPaths() {
  if (conversions.length === 0) {
    return;
  }

  console.log('\n=== Updating YAML References ===\n');

  const yamlFiles = getYamlFiles(path.join(DATA_DIR, 'yaml'));
  // Also check combined-data.yaml
  const combinedPath = path.join(DATA_DIR, 'combined-data.yaml');
  if (fs.existsSync(combinedPath)) {
    yamlFiles.push(combinedPath);
  }

  let totalUpdates = 0;

  for (const yamlFile of yamlFiles) {
    let content = fs.readFileSync(yamlFile, 'utf8');
    let fileUpdates = 0;

    for (const { from, to } of conversions) {
      // Count occurrences before replacing
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        fileUpdates += matches.length;
        content = content.replace(regex, to);
      }
    }

    if (fileUpdates > 0) {
      fs.writeFileSync(yamlFile, content);
      console.log(`  Updated ${fileUpdates} path(s) in ${path.relative(PROJECT_ROOT, yamlFile)}`);
      totalUpdates += fileUpdates;
    }
  }

  if (totalUpdates > 0) {
    console.log(`\nTotal: ${totalUpdates} path(s) updated in YAML files`);
  } else {
    console.log('  No YAML paths needed updating');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('========================================');
  console.log('   Image Optimization Script');
  console.log('========================================');

  if (CONFIG.dryRun) {
    console.log('\nRunning in DRY-RUN mode - no files will be modified\n');
  }

  // Create backup directory
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  // Clear conversions log
  if (!CONFIG.dryRun) {
    fs.writeFileSync(CONVERSIONS_LOG, '');
  }

  // Get initial size
  stats.initialSize = getDirSize(IMAGES_DIR);
  console.log(`\nInitial images directory size: ${formatBytes(stats.initialSize)}`);

  // Get all image files
  const allFiles = getImageFiles(IMAGES_DIR);

  // Process PNG to JPG conversions
  if (CONFIG.convertPngToJpg) {
    console.log('\n=== Converting Photo PNGs to JPG ===');
    console.log('(PNGs with transparency will be skipped)\n');

    const pngFiles = allFiles.filter(f => f.toLowerCase().endsWith('.png'));
    for (const file of pngFiles) {
      await convertPngToJpg(file);
    }
  }

  // Refresh file list after conversions
  const remainingFiles = getImageFiles(IMAGES_DIR);

  // Optimize oversized files
  console.log(`\n=== Optimizing Oversized Files (>${CONFIG.sizeThresholdKB}KB) ===\n`);

  for (const file of remainingFiles) {
    await optimizeImage(file);
  }

  // Get final size
  stats.finalSize = getDirSize(IMAGES_DIR);

  // Print summary
  console.log('\n========================================');
  console.log(`Initial size: ${formatBytes(stats.initialSize)}`);
  console.log(`Final size:   ${formatBytes(stats.finalSize)}`);
  console.log(`Saved:        ${formatBytes(stats.initialSize - stats.finalSize)}`);
  console.log('========================================');

  console.log(`\nConverted: ${stats.converted} | Optimized: ${stats.optimized} | Skipped: ${stats.skipped}`);

  if (!CONFIG.dryRun) {
    // Update YAML paths for converted images
    if (stats.converted > 0) {
      updateYamlPaths();
    }

    console.log(`\nBackups saved to: ${path.relative(PROJECT_ROOT, BACKUP_DIR)}`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
