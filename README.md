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

# 4. Start a local web server and open http://localhost:8000 in your browser.
python3 -m http.server
```

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
