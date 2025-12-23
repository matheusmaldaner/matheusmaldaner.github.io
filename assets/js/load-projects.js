/**
 * Load and render projects from JSON data files
 * With featured section, category filtering, and icon-only link buttons
 */

// Global state
let projectsData = [];
let currentFilter = 'all';

// Site owner identifier for linking to ProfilePage
const SITE_OWNER_ID = "https://matheus.wiki/#matheus-maldaner";
const SITE_OWNER_NAME = "matheus kunzler maldaner";

// Inject JSON-LD structured data for SEO and AI indexing
function injectProjectsSchema(projects) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": projects.map(project => {
      const item = {
        "@type": "SoftwareSourceCode",
        "name": project.title,
        "description": project.description,
        "dateCreated": String(project.year)
      };

      // Build authors list: site owner + collaborators
      const authors = [{ "@id": SITE_OWNER_ID }];
      if (project.collaborators) {
        const collabNames = project.collaborators.split(',').map(n => n.trim());
        collabNames.forEach(name => {
          if (name.toLowerCase() === SITE_OWNER_NAME) {
            authors.push({ "@id": SITE_OWNER_ID });
          } else {
            authors.push({ "@type": "Person", "name": name });
          }
        });
      }
      item.author = authors.length === 1 ? authors[0] : authors;

      // Add technologies as programming languages
      if (project.technologies && project.technologies.length > 0) {
        item.programmingLanguage = project.technologies;
      }

      // Add GitHub link as code repository
      if (project.links?.github) {
        item.codeRepository = project.links.github;
      }

      // Add demo as target product
      if (project.links?.demo) {
        item.targetProduct = {
          "@type": "WebApplication",
          "url": project.links.demo
        };
      }

      if (project.image) {
        item.image = `https://matheus.wiki${project.image}`;
      }

      if (project.award && project.award !== false) {
        item.award = typeof project.award === 'string' ? project.award : 'Award Winner';
      }

      return item;
    })
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

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

  if (links.demo) {
    buttons.push(`<a href="${escapeHtml(links.demo)}" class="${btnClass} demo-btn"
      target="_blank" rel="noopener" title="Live Demo" aria-label="Live Demo">
      <i class="fas fa-external-link-alt"></i>
    </a>`);
  }

  if (links.paper) {
    buttons.push(`<a href="${escapeHtml(links.paper)}" class="${btnClass} paper-btn"
      target="_blank" rel="noopener" title="Read Paper" aria-label="Read Paper">
      <i class="fas fa-file-pdf"></i>
    </a>`);
  }

  if (links.blog) {
    buttons.push(`<a href="${escapeHtml(links.blog)}" class="${btnClass} blog-btn"
      target="_blank" rel="noopener" title="Read Blog Post" aria-label="Read Blog Post">
      <i class="fas fa-blog"></i>
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
    <div class="featured-card" data-id="${escapeHtml(project.id)}">
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

  // Context line (hackathon name, class name, or generic context) with award integrated
  let contextLine = '';
  if (project.type === 'hackathon' && project.hackathon_name) {
    if (hasAward) {
      contextLine = `<div class="project-context"><span class="award-text">🏆 ${escapeHtml(awardText)}</span> - ${escapeHtml(project.hackathon_name)}</div>`;
    } else {
      contextLine = `<div class="project-context">${escapeHtml(project.hackathon_name)}</div>`;
    }
  } else if (project.type === 'class' && project.class_name) {
    contextLine = `<div class="project-context">${escapeHtml(project.class_name)}</div>`;
  } else if (project.context) {
    // Generic context for work/research/personal projects
    if (hasAward) {
      contextLine = `<div class="project-context"><span class="award-text">🏆 ${escapeHtml(awardText)}</span> - ${escapeHtml(project.context)}</div>`;
    } else {
      contextLine = `<div class="project-context">${escapeHtml(project.context)}</div>`;
    }
  } else if (hasAward) {
    // Show award even without context
    contextLine = `<div class="project-context"><span class="award-text">🏆 ${escapeHtml(awardText)}</span></div>`;
  }

  const linkButtons = buildLinkButtons(links, 'project-link-btn');

  return `
    <div class="project-card" data-type="${filterType}" data-id="${escapeHtml(project.id)}">
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

  featuredGrid.innerHTML = featured.map(renderProjectCard).join('');
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

    // Inject JSON-LD structured data for SEO/AI
    injectProjectsSchema(projectsData);

    // Render sections
    renderFeaturedProjects();
    renderProjects();
    setupFilterButtons();

  } catch (error) {
    console.error('Error loading projects:', error);
    container.innerHTML = '<p class="no-projects">Unable to load projects right now.</p>';
  }
}

// Modal functions
function openProjectModal(project) {
  const modal = document.getElementById('project-modal');
  if (!modal || !project) return;

  const links = project.links || {};
  const hasAward = project.award && project.award !== false;
  const awardText = typeof project.award === 'string' ? project.award : 'Award Winner';

  // Set title
  document.getElementById('modal-title').textContent = project.title;

  // Set image
  const modalImage = document.getElementById('modal-image');
  modalImage.src = project.image;
  modalImage.alt = project['image-alt'] || project.title;

  // Set context (award + hackathon/class/generic context)
  let contextHtml = '';
  if (project.type === 'hackathon' && project.hackathon_name) {
    if (hasAward) {
      contextHtml = `<span class="award-text">🏆 ${escapeHtml(awardText)}</span> - ${escapeHtml(project.hackathon_name)}`;
    } else {
      contextHtml = escapeHtml(project.hackathon_name);
    }
  } else if (project.type === 'class' && project.class_name) {
    contextHtml = escapeHtml(project.class_name);
  } else if (project.context) {
    if (hasAward) {
      contextHtml = `<span class="award-text">🏆 ${escapeHtml(awardText)}</span> - ${escapeHtml(project.context)}`;
    } else {
      contextHtml = escapeHtml(project.context);
    }
  } else if (hasAward) {
    contextHtml = `<span class="award-text">🏆 ${escapeHtml(awardText)}</span>`;
  }
  document.getElementById('modal-context').innerHTML = contextHtml;

  // Set description
  document.getElementById('modal-description').textContent = project.description;

  // Set links
  const linksContainer = document.getElementById('modal-links');
  const linkButtons = [];

  if (links.github) {
    linkButtons.push(`<a href="${escapeHtml(links.github)}" class="modal-link-btn github-btn" target="_blank" rel="noopener">
      <i class="fab fa-github"></i> GitHub
    </a>`);
  }
  if (links.devpost) {
    linkButtons.push(`<a href="${escapeHtml(links.devpost)}" class="modal-link-btn devpost-btn" target="_blank" rel="noopener">
      <i class="fas fa-trophy"></i> DevPost
    </a>`);
  }
  if (links.video) {
    linkButtons.push(`<a href="${escapeHtml(links.video)}" class="modal-link-btn demo-btn" target="_blank" rel="noopener">
      <i class="fab fa-youtube"></i> Demo
    </a>`);
  }
  if (links.news) {
    linkButtons.push(`<a href="${escapeHtml(links.news)}" class="modal-link-btn news-btn" target="_blank" rel="noopener">
      <i class="fas fa-newspaper"></i> News
    </a>`);
  }
  if (links.demo) {
    linkButtons.push(`<a href="${escapeHtml(links.demo)}" class="modal-link-btn demo-btn" target="_blank" rel="noopener">
      <i class="fas fa-external-link-alt"></i> Demo
    </a>`);
  }
  if (links.paper) {
    linkButtons.push(`<a href="${escapeHtml(links.paper)}" class="modal-link-btn paper-btn" target="_blank" rel="noopener">
      <i class="fas fa-file-pdf"></i> Paper
    </a>`);
  }
  if (links.blog) {
    linkButtons.push(`<a href="${escapeHtml(links.blog)}" class="modal-link-btn blog-btn" target="_blank" rel="noopener">
      <i class="fas fa-blog"></i> Blog
    </a>`);
  }

  linksContainer.innerHTML = linkButtons.join('');

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Setup modal event listeners
function setupModalListeners() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  // Close on X button
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProjectModal);
  }

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProjectModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeProjectModal();
    }
  });
}

// Setup card click handlers for modal using event delegation
function setupCardClickHandlers() {
  // Use event delegation on the grids so we don't need to reattach after re-rendering
  const projectsGrid = document.getElementById('projects-grid');
  const featuredGrid = document.getElementById('featured-grid');

  const handleCardClick = (e) => {
    const card = e.target.closest('.project-card, .featured-card');
    if (!card) return;

    // Don't open modal if clicking on a link
    if (e.target.closest('a')) return;

    const projectId = card.dataset.id;
    const project = projectsData.find(p => p.id === projectId);
    if (project) {
      openProjectModal(project);
    }
  };

  if (projectsGrid) {
    projectsGrid.addEventListener('click', handleCardClick);
  }
  if (featuredGrid) {
    featuredGrid.addEventListener('click', handleCardClick);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  setupModalListeners();
  setupCardClickHandlers();
});
