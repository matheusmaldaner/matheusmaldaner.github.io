/**
 * Load and render content from JSON data files
 */

// Map social link IDs to Font Awesome icon classes
function getIconClass(id) {
  const iconMap = {
    'resume': 'fas fa-file-alt',
    'cv': 'fas fa-file-alt',
    'linkedin': 'fab fa-linkedin',
    'github': 'fab fa-github',
    'instagram': 'fab fa-instagram',
    'twitter': 'fab fa-twitter',
    'devpost': 'fab fa-dev',
    'scholar': 'fas fa-graduation-cap',
    'youtube': 'fab fa-youtube',
    'email': 'fas fa-envelope'
  };
  return iconMap[id] || 'fas fa-link';
}

// Map social link IDs to display labels
function getDisplayLabel(id, description) {
  const labelMap = {
    'resume': 'Resume',
    'cv': 'Resume',
    'linkedin': 'LinkedIn',
    'github': 'GitHub',
    'instagram': 'Instagram',
    'twitter': 'X',
    'devpost': 'Devpost',
    'scholar': 'Papers',
    'youtube': 'YouTube',
    'email': 'Email'
  };
  return labelMap[id] || description;
}

// Map social link IDs to aria labels
function getAriaLabel(id) {
  const ariaMap = {
    'resume': 'View my resume on Google Docs',
    'cv': 'View my resume on Google Docs',
    'linkedin': 'Connect with me on LinkedIn',
    'github': 'View my GitHub profile',
    'instagram': 'Follow me on Instagram',
    'twitter': 'Follow me on X (formerly Twitter)',
    'devpost': 'View my Devpost profile and projects',
    'scholar': 'View my publications on Google Scholar',
    'youtube': 'View my YouTube channel',
    'email': 'Send me an email'
  };
  return ariaMap[id] || `Visit my ${id} profile`;
}

// Load and render social links
async function loadSocialLinks() {
  try {
    const response = await fetch('/data/json/social-links.json');
    const socialLinks = await response.json();

    const container = document.getElementById('social-links-container');
    if (!container) return;

    const homepageLinks = socialLinks.filter(link => link['on-homepage']);

    const linksHtml = homepageLinks.map(link => {
      const iconClass = getIconClass(link.id);
      const label = getDisplayLabel(link.id, link.description);
      const ariaLabel = getAriaLabel(link.id);

      return `
        <a href="${link.url}" target="_blank" aria-label="${ariaLabel}"
           style="display: inline-block; margin: 0 15px; color: #555; text-decoration: none; transition: color 0.3s ease;">
          <i class="${iconClass}" aria-hidden="true" style="font-size: 1.8em;"></i>
          <div style="font-size: 0.8em; margin-top: 3px;">${label}</div>
        </a>
      `;
    }).join('');

    container.innerHTML = linksHtml;
  } catch (error) {
    console.error('Error loading social links:', error);
  }
}

// Load and render about me content
async function loadAboutContent() {
  try {
    const response = await fetch('/data/json/about.json');
    const aboutData = await response.json();

    const container = document.getElementById('about-content-container');
    if (!container) return;

    let html = `<p>${aboutData.bio.main}</p>`;

    aboutData.sections.forEach(section => {
      html += `
        <section>
          <header>
            <h3>${section.title}</h3>
          </header>
          <p>${section.content}</p>
        </section>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading about content:', error);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadSocialLinks();
  loadAboutContent();
});
