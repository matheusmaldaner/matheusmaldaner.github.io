/**
 * Load and render projects from JSON data files
 * With featured section, category filtering, and icon-only link buttons
 */

// Global state
let projectsData = [];
let currentFilter = 'all';

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

// Map types to display labels
function getCategoryLabel(type) {
  const labels = {
    hackathon: 'Hackathon',
    class: 'Coursework',
    personal: 'Personal',
    research: 'Professional',
    work: 'Professional'
  };
  return labels[type] || type;
}

// Get filter category (combines research + work into professional)
function getFilterCategory(type) {
  if (type === 'research' || type === 'work') return 'professional';
  return type;
}

// Build link buttons HTML (icons only)
function buildLinkButtons(links, btnClass) {
  if (!links) return '';

  const buttons = [];

  if (links.github) {
    buttons.push(`<a href="${escapeHtml(links.github)}" class="${btnClass} github-btn"
      target="_blank" rel="noopener" title="View on GitHub" aria-label="View on GitHub">
      <i class="fab fa-github"></i>
    </a>`);
  }

  if (links.devpost) {
    buttons.push(`<a href="${escapeHtml(links.devpost)}" class="${btnClass} devpost-btn"
      target="_blank" rel="noopener" title="View on DevPost" aria-label="View on DevPost">
      <i class="fas fa-trophy"></i>
    </a>`);
  }

  if (links.video) {
    buttons.push(`<a href="${escapeHtml(links.video)}" class="${btnClass} demo-btn"
      target="_blank" rel="noopener" title="Watch Demo" aria-label="Watch Demo">
      <i class="fab fa-youtube"></i>
    </a>`);
  }

  if (links.news) {
    buttons.push(`<a href="${escapeHtml(links.news)}" class="${btnClass} news-btn"
      target="_blank" rel="noopener" title="Read More" aria-label="Read More">
      <i class="fas fa-newspaper"></i>
    </a>`);
  }

  return buttons.join('');
}

// Render a featured project card
function renderFeaturedCard(project) {
  const links = project.links || {};
  const hasAward = project.award && project.award !== false;
  const awardText = typeof project.award === 'string' ? project.award : 'Award Winner';
  const filterType = getFilterCategory(project.type);

  // Context line (hackathon name or class name) with award integrated
  let contextLine = '';
  if (project.type === 'hackathon' && project.hackathon_name) {
    if (hasAward) {
      contextLine = `<span class="award-text">🏆 ${escapeHtml(awardText)}</span> - ${escapeHtml(project.hackathon_name)}`;
    } else {
      contextLine = escapeHtml(project.hackathon_name);
    }
  } else if (project.type === 'class' && project.class_name) {
    contextLine = escapeHtml(project.class_name);
  } else if (hasAward) {
    contextLine = `<span class="award-text">🏆 ${escapeHtml(awardText)}</span>`;
  }

  const linkButtons = buildLinkButtons(links, 'featured-link-btn');

  return `
    <div class="featured-card">
      <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project['image-alt'] || project.title)}" loading="lazy">
      <div class="featured-overlay">
        <div class="featured-badges">
          <span class="category-badge badge-${filterType}">${getCategoryLabel(project.type)}</span>
        </div>
        <h3 class="featured-title">${escapeHtml(project.title)}</h3>
        ${contextLine ? `<div class="featured-context">${contextLine}</div>` : ''}
        <div class="featured-links">${linkButtons}</div>
      </div>
    </div>
  `;
}

// Render a regular project card
function renderProjectCard(project) {
  const links = project.links || {};
  const hasAward = project.award && project.award !== false;
  const awardText = typeof project.award === 'string' ? project.award : 'Award Winner';
  const filterType = getFilterCategory(project.type);

  // Context line (hackathon name or class name) with award integrated
  let contextLine = '';
  if (project.type === 'hackathon' && project.hackathon_name) {
    if (hasAward) {
      contextLine = `<div class="project-context"><span class="award-text">🏆 ${escapeHtml(awardText)}</span> - ${escapeHtml(project.hackathon_name)}</div>`;
    } else {
      contextLine = `<div class="project-context">${escapeHtml(project.hackathon_name)}</div>`;
    }
  } else if (project.type === 'class' && project.class_name) {
    contextLine = `<div class="project-context">${escapeHtml(project.class_name)}</div>`;
  } else if (hasAward) {
    // Show award even without hackathon/class context
    contextLine = `<div class="project-context"><span class="award-text">🏆 ${escapeHtml(awardText)}</span></div>`;
  }

  const linkButtons = buildLinkButtons(links, 'project-link-btn');

  return `
    <div class="project-card" data-type="${filterType}">
      <div class="card-image">
        <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project['image-alt'] || project.title)}" loading="lazy">
        <div class="card-badges">
          <span class="category-badge badge-${filterType}">${getCategoryLabel(project.type)}</span>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${escapeHtml(project.title)}</h3>
        ${contextLine}
        <p class="card-description">${escapeHtml(project.description)}</p>
        <div class="project-links">
          ${linkButtons}
        </div>
      </div>
    </div>
  `;
}

// Render featured projects section
function renderFeaturedProjects() {
  const featuredGrid = document.getElementById('featured-grid');
  if (!featuredGrid) return;

  const featured = projectsData.filter(p => p.featured === true);

  if (featured.length === 0) {
    // Hide featured section if no featured projects
    const featuredSection = document.querySelector('.featured-section');
    if (featuredSection) {
      featuredSection.style.display = 'none';
    }
    return;
  }

  featuredGrid.innerHTML = featured.map(renderFeaturedCard).join('');
}

// Render regular projects grid
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Exclude featured projects from the regular grid
  const nonFeatured = projectsData.filter(p => !p.featured);

  // Apply filter
  const filtered = currentFilter === 'all'
    ? nonFeatured
    : nonFeatured.filter(p => getFilterCategory(p.type) === currentFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="no-projects">No projects found in this category.</p>';
    return;
  }

  grid.innerHTML = filtered.map(renderProjectCard).join('');
}

// Setup filter button event listeners using event delegation
function setupFilterButtons() {
  const filterSection = document.querySelector('.filter-section');
  if (!filterSection) return;

  filterSection.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // Update active state
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    // Update filter and re-render
    currentFilter = btn.dataset.filter;
    renderProjects();
  });
}

// Main load function
async function loadProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  try {
    const response = await fetch('../data/json/projects.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    projectsData = await response.json();

    if (!Array.isArray(projectsData) || projectsData.length === 0) {
      container.innerHTML = '<p class="no-projects">No projects found.</p>';
      return;
    }

    // Sort by year (newest first)
    projectsData.sort((a, b) => (b.year || 0) - (a.year || 0));

    // Render sections
    renderFeaturedProjects();
    renderProjects();
    setupFilterButtons();

  } catch (error) {
    console.error('Error loading projects:', error);
    container.innerHTML = '<p class="no-projects">Unable to load projects right now.</p>';
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', loadProjects);
