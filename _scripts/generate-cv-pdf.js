#!/usr/bin/env node

/**
 * Generate a PDF version of the built CV using headless Chrome (Puppeteer).
 * The script spins up a tiny static HTTP server so that absolute /cv/* assets
 * resolve just like they do in production, then prints the page to PDF.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..', '_site');
const SOURCE_PATH = '/cv/index.html';
const OUTPUT_SITE_PATH = path.resolve(ROOT, 'cv.pdf');
const OUTPUT_REPO_PATH = path.resolve(__dirname, '..', 'cv.pdf');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function ensureBuiltSiteExists() {
  if (!fs.existsSync(ROOT)) {
    throw new Error(`Cannot find built site directory at ${ROOT}. Run the site build first.`);
  }
}

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const requestUrl = new URL(req.url, 'http://localhost');
        const safePath = path.normalize(requestUrl.pathname).replace(/^(\.\.[/\\])+/, '');
        let filePath = path.join(rootDir, safePath);

        const stat = await fs.promises.stat(filePath).catch(() => null);

        if (!stat) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        if (stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }

        const data = await fs.promises.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        res.writeHead(200);
        res.end(data);
      } catch (err) {
        res.statusCode = 500;
        res.end(err.message);
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
      });
    });

    server.on('error', reject);
  });
}

async function generatePdf() {
  ensureBuiltSiteExists();

  const { server, baseUrl } = await startStaticServer(ROOT);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(`${baseUrl}${SOURCE_PATH}`, {
      waitUntil: 'networkidle0',
    });
    await page.emulateMediaType('print');
    await fs.promises.mkdir(path.dirname(OUTPUT_SITE_PATH), { recursive: true });
    await page.pdf({
      path: OUTPUT_SITE_PATH,
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
    });
    await fs.promises.copyFile(OUTPUT_SITE_PATH, OUTPUT_REPO_PATH);
    console.log(`PDF generated at ${OUTPUT_SITE_PATH}`);
    console.log(`PDF copied to ${OUTPUT_REPO_PATH}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    server.close();
  }
}

generatePdf().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
