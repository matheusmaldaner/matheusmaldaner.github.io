## CV Directory

To automatically build the CV you may run the following
```bash
cd cv
sudo snap install ruby --classic
sudo apt  install ruby-bundler
sudo apt-get install ruby-dev build-essential
bundle install # to install jekyll
bundle exec jekyll serve
```

## CV PDF

To regenerate the printable CV locally after building the site output:

```bash
# from repository root
bundle exec jekyll build --source cv --destination _site/cv
npm ci
npm run generate:cv-pdf
```

This saves `cv.pdf` at the repository root (for publishing) and `_site/cv.pdf`
for the deployed site. The GitHub Pages workflow runs the same script so a fresh
PDF is produced on every deployment.
