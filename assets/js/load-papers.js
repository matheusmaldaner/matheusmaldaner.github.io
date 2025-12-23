/**
 * Load and render papers from JSON data files
 * With featured section, institution badges, awards, and modal popup
 */

// Global state
let papersData = [];
let currentModal = null;

// Site owner identifier for linking to ProfilePage
const SITE_OWNER_ID = "https://matheus.wiki/#matheus-maldaner";
const SITE_OWNER_NAME = "matheus kunzler maldaner";

// Inject JSON-LD structured data for SEO and AI indexing
function injectPublicationsSchema(papers) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": papers.map(paper => {
      const article = {
        "@type": "ScholarlyArticle",
        "name": paper.title,
        "headline": paper.title,
        "datePublished": String(paper.year),
        "publisher": paper.venue
      };

      if (paper.authors && paper.authors.length > 0) {
        article.author = paper.authors.map(name => {
          // Reference the ProfilePage Person for site owner, inline for others
          if (name.toLowerCase() === SITE_OWNER_NAME) {
            return { "@id": SITE_OWNER_ID };
          }
          return {
            "@type": "Person",
            "name": name
          };
        });
      }

      if (paper.abstract) {
        article.abstract = paper.abstract;
      }

      if (paper.url && paper.url !== "#") {
        article.url = paper.url;
      }

      if (paper.pdf) {
        article.mainEntityOfPage = paper.pdf;
      }

      if (paper.image) {
        article.image = `https://matheus.wiki${paper.image}`;
      }

      if (paper.award) {
        article.award = paper.award;
      }

      return article;
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

// Get institution display label
function getInstitutionLabel(institution) {
  const labels = {
    'microsoft': 'MSR',
    'carnegie-mellon': 'CMU',
    'university-of-florida': 'UF'
  };
  return labels[institution] || institution;
}

// Build link buttons HTML (icons only)
function buildLinkButtons(paper, btnClass) {
  const buttons = [];

  if (paper.pdf) {
    buttons.push(`<a href="${escapeHtml(paper.pdf)}" class="${btnClass} pdf-btn"
      target="_blank" rel="noopener" title="Read PDF" aria-label="Read PDF">
      <i class="fas fa-file-pdf"></i>
    </a>`);
  }

  if (paper.code) {
    buttons.push(`<a href="${escapeHtml(paper.code)}" class="${btnClass} code-btn"
      target="_blank" rel="noopener" title="View Code" aria-label="View Code">
      <i class="fab fa-github"></i>
    </a>`);
  }

  if (paper.preview || paper.demo) {
    const demoUrl = paper.preview || paper.demo;
    buttons.push(`<a href="${escapeHtml(demoUrl)}" class="${btnClass} demo-btn"
      target="_blank" rel="noopener" title="View Demo" aria-label="View Demo">
      <i class="fas fa-external-link-alt"></i>
    </a>`);
  }

  if (paper.blog) {
    buttons.push(`<a href="${escapeHtml(paper.blog)}" class="${btnClass} blog-btn"
      target="_blank" rel="noopener" title="Read Blog Post" aria-label="Read Blog Post">
      <i class="fas fa-blog"></i>
    </a>`);
  }

  return buttons.join('');
}

// Render a paper card (used for both featured and regular papers)
function renderPaperCard(paper) {
  const linkButtons = buildLinkButtons(paper, 'paper-link-btn');

  return `
    <div class="paper-grid-card" data-paper-id="${escapeHtml(paper.id)}" tabindex="0" role="button">
      <div class="paper-card-image">
        <img src="${escapeHtml(paper.image)}" alt="${escapeHtml(paper.title)}" loading="lazy">
        <div class="paper-card-badges">
          <span class="institution-badge badge-${escapeHtml(paper.institution)}">${getInstitutionLabel(paper.institution)}</span>
        </div>
      </div>
      <div class="paper-card-content">
        <h3 class="paper-card-title">${escapeHtml(paper.title)}</h3>
        <div class="paper-context">${escapeHtml(paper.venue)} ${paper.year}</div>
        <div class="paper-links">
          ${linkButtons}
        </div>
      </div>
    </div>
  `;
}

// Render featured papers section
function renderFeaturedPapers() {
  const featuredGrid = document.getElementById('featured-papers-grid');
  if (!featuredGrid) return;

  const featured = papersData.filter(p => p.featured === true);

  if (featured.length === 0) {
    // Hide featured section if no featured papers
    const featuredSection = document.querySelector('.papers-container .featured-section');
    if (featuredSection) {
      featuredSection.style.display = 'none';
    }
    return;
  }

  featuredGrid.innerHTML = featured.map(renderPaperCard).join('');
}

// Render regular papers grid
function renderPapers() {
  const grid = document.getElementById('papers-grid');
  if (!grid) return;

  // Exclude featured papers from the regular grid
  const nonFeatured = papersData.filter(p => !p.featured);

  if (nonFeatured.length === 0) {
    grid.innerHTML = '<p class="no-papers">No additional publications found.</p>';
    return;
  }

  grid.innerHTML = nonFeatured.map(renderPaperCard).join('');
}

// Open paper modal
function openPaperModal(paper) {
  const modal = document.getElementById('paper-modal');
  const modalTitle = document.getElementById('paper-modal-title');
  const modalMeta = document.getElementById('paper-modal-meta');
  const modalAbstract = document.getElementById('paper-modal-abstract');
  const modalLinks = document.getElementById('paper-modal-links');
  const modalBibtex = document.getElementById('paper-modal-bibtex');

  currentModal = modal;

  // Set title
  modalTitle.textContent = paper.title;

  // Set metadata
  let authorsHtml = '';
  if (paper.authors && paper.authors.length > 0) {
    const formattedAuthors = paper.authors.map(a => {
      const escaped = escapeHtml(a);
      // Bold the user's name
      if (a.toLowerCase() === 'matheus kunzler maldaner') {
        return `<strong>${escaped}</strong>`;
      }
      return escaped;
    }).join(', ');
    authorsHtml = `<p><strong>Authors:</strong> ${formattedAuthors}</p>`;
  }

  let awardHtml = '';
  if (paper.award) {
    awardHtml = `<p><strong>Award:</strong> <span style="color: #DAA520; font-weight: 600;">🏆 ${escapeHtml(paper.award)}</span></p>`;
  }

  modalMeta.innerHTML = `
    ${authorsHtml}
    <p><strong>Venue:</strong> ${escapeHtml(paper.venue)}</p>
    <p><strong>Year:</strong> ${paper.year}</p>
    <p><strong>Institution:</strong> <span class="institution-badge badge-${escapeHtml(paper.institution)}" style="display: inline-block;">${getInstitutionLabel(paper.institution)}</span></p>
    ${awardHtml}
  `;

  // Set abstract (if we have it in publications.yaml - for now show description or placeholder)
  modalAbstract.innerHTML = paper.abstract
    ? `<p>${escapeHtml(paper.abstract)}</p>`
    : '<p><em>Abstract not available. Click the link below to read the full paper.</em></p>';

  // Set links
  let linksHtml = [];
  if (paper.pdf) {
    linksHtml.push(`<a href="${escapeHtml(paper.pdf)}" class="paper-modal-link pdf" target="_blank" rel="noopener"><i class="fas fa-file-pdf"></i> PDF</a>`);
  }
  if (paper.url && paper.url !== '#') {
    linksHtml.push(`<a href="${escapeHtml(paper.url)}" class="paper-modal-link pdf" target="_blank" rel="noopener"><i class="fas fa-link"></i> Paper</a>`);
  }
  if (paper.code) {
    linksHtml.push(`<a href="${escapeHtml(paper.code)}" class="paper-modal-link code" target="_blank" rel="noopener"><i class="fab fa-github"></i> Code</a>`);
  }
  if (paper.preview || paper.demo) {
    const demoUrl = paper.preview || paper.demo;
    linksHtml.push(`<a href="${escapeHtml(demoUrl)}" class="paper-modal-link demo" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Demo</a>`);
  }
  if (paper.blog) {
    linksHtml.push(`<a href="${escapeHtml(paper.blog)}" class="paper-modal-link blog" target="_blank" rel="noopener"><i class="fas fa-blog"></i> Blog</a>`);
  }
  modalLinks.innerHTML = linksHtml.join('');

  // Handle BibTeX
  if (paper.bibtex) {
    modalBibtex.style.display = 'block';
    modalBibtex.querySelector('.bibtex-content').textContent = paper.bibtex;
  } else {
    modalBibtex.style.display = 'none';
  }

  // Show modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Close paper modal
function closePaperModal() {
  if (currentModal) {
    currentModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentModal = null;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Card click listeners
  document.querySelectorAll('.paper-grid-card').forEach(card => {
    card.addEventListener('click', function() {
      const paperId = this.getAttribute('data-paper-id');
      const paper = papersData.find(p => p.id === paperId);
      if (paper) {
        openPaperModal(paper);
      }
    });

    // Keyboard support (Enter and Space)
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const paperId = this.getAttribute('data-paper-id');
        const paper = papersData.find(p => p.id === paperId);
        if (paper) {
          openPaperModal(paper);
        }
      }
    });
  });

  // Modal close button
  const closeBtn = document.querySelector('.paper-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePaperModal);
  }

  // Click outside modal to close
  const modal = document.getElementById('paper-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closePaperModal();
      }
    });
  }

  // ESC key to close modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentModal) {
      closePaperModal();
    }
  });

  // BibTeX toggle
  const bibtexToggle = document.querySelector('.bibtex-toggle');
  if (bibtexToggle) {
    bibtexToggle.addEventListener('click', function() {
      const content = this.closest('.bibtex-container').querySelector('.bibtex-content');
      content.classList.toggle('show');
      this.textContent = content.classList.contains('show') ? 'Hide' : 'Show';
    });
  }
}

// Main load function
async function loadPapers() {
  const container = document.getElementById('papers-grid');
  if (!container) return;

  try {
    const response = await fetch('../data/json/publications.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    papersData = await response.json();

    if (!Array.isArray(papersData) || papersData.length === 0) {
      container.innerHTML = '<p class="no-papers">No publications found.</p>';
      return;
    }

    // Sort by year (newest first)
    papersData.sort((a, b) => (b.year || 0) - (a.year || 0));

    // Inject JSON-LD structured data for SEO/AI
    injectPublicationsSchema(papersData);

    // Render sections
    renderFeaturedPapers();
    renderPapers();
    setupEventListeners();

  } catch (error) {
    console.error('Error loading papers:', error);
    container.innerHTML = '<p class="no-papers">Unable to load publications right now.</p>';
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', loadPapers);
