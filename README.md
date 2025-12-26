# Personal Website

This repository contains the source code for my personal website.

## Running the Main Website Locally

To run the website locally, you can run the following commands.

```bash
# 1. Navigate to the project directory
cd matheusmaldaner.github.io

# 2. Install dependencies (only needs to be done once)
npm install

# 3. Convert YAML to JSON (run this when you change content in `data/yaml/`)
npm run convert:yaml

# 4. Generate CV posts for Jekyll RSS feeds (run after changing publications/projects/news)
npm run generate:cv-posts

# 5. Generate combined data file (optional - creates a single YAML with all data)
npm run generate:combined

# 6. Generate llms.txt for AI crawlers (optional)
npm run generate:llms-txt

# 7. Generate sitemap.xml with git-based lastmod dates (optional)
npm run generate:sitemap

# 8. Generate favicons from source image (optional - only when updating favicon)
npm run generate:favicons -- images/headshot.jpeg

# 9. Optimize images before committing (if you added new images)
npm run optimize:images

# 10. Start a local web server and open http://localhost:8000 in your browser.
python3 -m http.server
```

## Data Architecture

All content is managed through YAML files in `data/yaml/`. The build process:

1. **Individual YAML files** (`data/yaml/*.yaml`) - Source of truth for all content
2. **JSON conversion** (`npm run convert:yaml`) - Converts YAML to JSON for the website
3. **Combined data** (`npm run generate:combined`) - Aggregates all YAML into `data/combined-data.yaml`
4. **LLM indexing** (`npm run generate:llms-txt`) - Generates `llms.txt` for AI crawlers

The combined data file serves as a portable knowledge base that can be shared with AI assistants or used for other integrations.

### Utility Scripts

Additional helper scripts in `_scripts/`:

- **`projects-helper.js`** - Utility for managing projects.yaml:
  ```bash
  node _scripts/projects-helper.js stats        # Show project statistics
  node _scripts/projects-helper.js list-cv      # List CV-featured projects
  node _scripts/projects-helper.js validate     # Validate projects.yaml structure
  ```

- **Sentinel scripts** (internal use) - Academic paper search automation:
  - `run-sentinel-search.py` - Searches for new publications
  - `merge-sentinel-results.py` - Merges search results

## CV

### Building the CV Website

The CV is a separate Jekyll project. To build and serve it locally:

1. Navigate to the `cv` directory:
    ```bash
    cd cv
    ```
2. Install dependencies:
    ```bash
    # Example for Ubuntu
    sudo snap install ruby --classic
    sudo apt install ruby-bundler
    sudo apt-get install ruby-dev build-essential
    bundle install
    ```
3. Run the Jekyll server:
    ```bash
    bundle exec jekyll serve
    ```

### Generating the CV PDF

To regenerate the printable CV PDF after building the site output:

1. From the repository root (`matheusmaldaner.github.io`), run the Jekyll build for the CV:
    ```bash
    bundle exec jekyll build --source cv --destination _site/cv
    ```
2. Install Node.js dependencies:
    ```bash
    npm ci
    ```
3. Generate the PDF:
    ```bash
    npm run generate:cv-pdf
    ```

This saves `cv.pdf` at the repository root (for publishing) and `_site/cv.pdf` for the deployed site.