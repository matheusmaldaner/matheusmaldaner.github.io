#!/usr/bin/env node
/**
 * Favicon Generator Script
 *
 * Usage: node _scripts/generate-favicons.js <source-image>
 * Example: node _scripts/generate-favicons.js images/headshot.jpeg
 *
 * Generates all required favicon sizes from a single source image.
 * Source image should be at least 512x512px (square works best).
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = process.argv[2];
const OUTPUT_DIR = path.join(__dirname, '..', 'icons');

if (!SOURCE_IMAGE) {
    console.error('Usage: node _scripts/generate-favicons.js <source-image>');
    console.error('Example: node _scripts/generate-favicons.js images/headshot.jpeg');
    process.exit(1);
}

const sourcePath = path.join(__dirname, '..', SOURCE_IMAGE);

if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Source image not found: ${sourcePath}`);
    process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sizes = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'mstile-150x150.png', size: 150 },
];

async function generateFavicons() {
    console.log(`Generating favicons from: ${SOURCE_IMAGE}`);
    console.log(`Output directory: ${OUTPUT_DIR}\n`);

    // Generate PNG sizes
    for (const { name, size } of sizes) {
        const outputPath = path.join(OUTPUT_DIR, name);
        await sharp(sourcePath)
            .resize(size, size, { fit: 'cover' })
            .png()
            .toFile(outputPath);
        console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Generate favicon.ico
    // For simplicity, use the 32x32 PNG as ICO (browsers handle it fine)
    const icoPath = path.join(OUTPUT_DIR, 'favicon.ico');
    await sharp(sourcePath)
        .resize(32, 32, { fit: 'cover' })
        .png()
        .toFile(icoPath.replace('.ico', '-temp.png'));

    // Copy to root as well
    const rootIcoPath = path.join(__dirname, '..', 'favicon.ico');
    await sharp(sourcePath)
        .resize(32, 32, { fit: 'cover' })
        .toFile(rootIcoPath);
    console.log(`✓ Generated favicon.ico (root)`);

    // Copy 32x32 as favicon.ico (most browsers accept PNG with .ico extension)
    fs.copyFileSync(
        path.join(OUTPUT_DIR, 'favicon-32x32.png'),
        path.join(OUTPUT_DIR, 'favicon.ico')
    );
    console.log(`✓ Generated icons/favicon.ico`);

    // Clean up temp file
    const tempFile = icoPath.replace('.ico', '-temp.png');
    if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
    }

    // Generate site.webmanifest
    const manifest = {
        name: "Matheus Kunzler Maldaner",
        short_name: "Matheus",
        icons: [
            {
                src: "/icons/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/icons/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone"
    };

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'site.webmanifest'),
        JSON.stringify(manifest, null, 2)
    );
    console.log(`✓ Generated site.webmanifest`);

    // Generate browserconfig.xml for Microsoft
    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icons/mstile-150x150.png"/>
            <TileColor>#ffffff</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'browserconfig.xml'), browserconfig);
    console.log(`✓ Generated browserconfig.xml`);

    console.log('\n✅ All favicons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Commit the new /icons/ folder');
    console.log('2. Add favicon link to your main index.html <head>:');
    console.log('   <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">');
}

generateFavicons().catch(err => {
    console.error('Error generating favicons:', err);
    process.exit(1);
});
