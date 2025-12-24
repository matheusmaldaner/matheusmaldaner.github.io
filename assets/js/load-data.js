/**
 * Load and render content from JSON data files
 */

// Escape HTML to prevent XSS
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const socialLinks = await response.json();

    const container = document.getElementById('social-links-container');
    if (!container) return;

    const homepageLinks = socialLinks.filter(link => link['on-homepage']);

    const linksHtml = homepageLinks.map(link => {
      const iconClass = getIconClass(link.id);
      const label = getDisplayLabel(link.id, link.description);
      const ariaLabel = getAriaLabel(link.id);

      return `
        <a href="${escapeHtml(link.url)}" target="_blank" aria-label="${escapeHtml(ariaLabel)}"
           style="display: inline-block; margin: 0 15px; color: #555; text-decoration: none; transition: color 0.3s ease;">
          <i class="${escapeHtml(iconClass)}" aria-hidden="true" style="font-size: 1.8em;"></i>
          <div style="font-size: 0.8em; margin-top: 3px;">${escapeHtml(label)}</div>
        </a>
      `;
    }).join('');

    container.innerHTML = linksHtml;
  } catch (error) {
    console.error('Error loading social links:', error);
  }
}

// Load and render about me content
// Note: about.json is trusted content from the site owner, so HTML is allowed
async function loadAboutContent() {
  try {
    const response = await fetch('/data/json/about.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const aboutData = await response.json();

    const container = document.getElementById('about-content-container');
    if (!container) return;

    // Convert newlines to <br> for proper display
    const formatContent = (text) => text.replace(/\n/g, '<br>');

    let html = `<p>${formatContent(aboutData.bio.main)}</p>`;

    aboutData.sections.forEach(section => {
      html += `
        <section>
          <header>
            <h3>${escapeHtml(section.title)}</h3>
          </header>
          <p>${formatContent(section.content)}</p>
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
