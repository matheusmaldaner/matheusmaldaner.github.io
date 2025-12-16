/**
 * Load and render projects from JSON data files
 */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPrimaryAction(project) {
  if (project && project.proprietary) {
    return { type: 'disabled', label: 'Proprietary Code', url: '#' };
  }

  const links = (project && project.links) || {};
  if (links.github) return { type: 'link', label: 'Github Repo', url: links.github };
  if (links.devpost) return { type: 'link', label: 'DevPost Link', url: links.devpost };
  if (links.news) return { type: 'link', label: 'News Coverage', url: links.news };
  return null;
}

function hasTrophyAction(project) {
  if (!project || project.proprietary) return false;
  const links = project.links || {};
  return Boolean(links.github && links.devpost);
}

function getCardHref(project) {
  const primary = getPrimaryAction(project);
  if (primary && primary.type === 'link') return primary.url;
  return '#';
}

function renderProjectCard(project) {
  const title = project && project.title ? String(project.title) : '';
  const description = project && project.description ? String(project.description) : '';
  const image = project && project.image ? String(project.image) : '';
  const imageAlt = project && (project['image-alt'] || project.imageAlt) ? String(project['image-alt'] || project.imageAlt) : '';

  const safeTitleUpper = escapeHtml(title.toUpperCase());
  const safeDescription = escapeHtml(description);
  const safeImageAlt = escapeHtml(imageAlt || title);
  const href = getCardHref(project);
  const primary = getPrimaryAction(project);
  const trophy = hasTrophyAction(project);
  const devpostUrl = project && project.links && project.links.devpost ? String(project.links.devpost) : '';

  const actions = [];

  if (primary) {
    if (primary.type === 'disabled') {
      actions.push(`<li><a href="#" class="button alt disabled">${escapeHtml(primary.label)}</a></li>`);
    } else {
      actions.push(`<li><a href="${escapeHtml(primary.url)}" class="button alt">${escapeHtml(primary.label)}</a></li>`);
    }
  }

  if (trophy && devpostUrl) {
    actions.push(`
      <li>
        <a href="${escapeHtml(devpostUrl)}" class="button alt award-button" aria-label="Awards">
          <i class="fa fa-trophy" aria-hidden="true"></i>
        </a>
      </li>
    `);
  }

  return `
    <div class="col-4 col-6-medium col-12-small">
      <section class="box">
        <a href="${escapeHtml(href)}" class="image featured">
          <img src="${escapeHtml(image)}" alt="${safeImageAlt}" loading="lazy" />
        </a>
        <header>
          <h3>${safeTitleUpper}</h3>
        </header>
        <p>${safeDescription}</p>
        ${actions.length ? `<footer><ul class="actions">${actions.join('')}</ul></footer>` : ''}
      </section>
    </div>
  `;
}

async function loadProjects() {
  const container = document.getElementById('projects-grid');
  if (!container) return;

  try {
    const response = await fetch('../data/json/projects.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const projects = await response.json();
    if (!Array.isArray(projects) || projects.length === 0) {
      container.innerHTML = '<p>No projects found.</p>';
      return;
    }

    container.innerHTML = projects.map(renderProjectCard).join('');
  } catch (error) {
    console.error('Error loading projects:', error);
    container.innerHTML = '<p>Unable to load projects right now.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadProjects);
