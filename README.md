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

# 4. Generate combined data file (optional - creates a single YAML with all data)
npm run generate:combined

# 5. Start a local web server and open http://localhost:8000 in your browser.
python3 -m http.server
```

## Data Architecture

All content is managed through YAML files in `data/yaml/`. The build process:

1. **Individual YAML files** (`data/yaml/*.yaml`) - Source of truth for all content
2. **JSON conversion** (`npm run convert:yaml`) - Converts YAML to JSON for the website
3. **Combined data** (`npm run generate:combined`) - Aggregates all YAML into `data/combined-data.yaml`
4. **LLM indexing** (`npm run generate:llms-txt`) - Generates `llms.txt` for AI crawlers

The combined data file serves as a portable knowledge base that can be shared with AI assistants or used for other integrations.

### llms.txt

The `llms.txt` file is a proposed standard for helping AI systems understand website content. It's automatically generated from the combined data and includes:

- Research publications with abstracts
- Featured projects
- Education and experience
- Contact links

Learn more: [llmstxt.org](https://llmstxt.org/)

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
