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

// Paper data
const papersData = {
    paper1: {
        title: "Abstracting General Syntax for XAI after Decomposing Explanation Sub-Components",
        authors: "Stephen Wormald, Matheus Kunzler Maldaner, Kristian O'Connor, Olivia P. Dizon-Paradis, Damon L. Woodard",
        venue: "Springer AI",
        date: "2024",
        abstract: "This paper presents an overview of the Qi-Framework, a novel approach to defining and quantifying explainability in machine learning. It introduces a mathematically grounded syntax that abstracts and organizes the subcomponents of common eXplainable Artificial Intelligence (XAI) methods. The framework aims to provide a standardized language for describing explainability needs, evaluating explanation relevance to specific use cases, and guiding the selection of XAI methods. The report explores how the Qi-Framework helps rank methods by their utility, supports the discovery of new XAI techniques, and fosters collaborative advancements in interpretable machine learning.",
        link: "https://www.researchsquare.com/article/rs-4824427/latest"
    },
    paper2: {
        title: "MIRAGE: Multi-model Interface for Reviewing and Auditing Generative Text-to-Image AI",
        authors: "Matheus Kunzler Maldaner, Wesley Hanwen Deng, Jason I. Hong, Ken Holstein, Motahhare Eslami",
        venue: "HCOMP 2024",
        date: "2024",
        abstract: "This paper introduces MIRAGE, a web-based tool designed to enable users to audit and compare outputs from multiple AI text-to-image (T2I) models. By providing a structured platform for evaluating AI-generated images, MIRAGE empowers users to surface harmful biases and contribute to the growing efforts in improving generative AI systems. A preliminary user study with five participants revealed that MIRAGE users could draw on their lived experiences and identities to identify subtle biases more effectively when reviewing multiple T2I models simultaneously, compared to evaluating a single model. The report highlights MIRAGE's potential to foster more inclusive and trustworthy generative AI applications.",
        link: "https://www.humancomputation.com/assets/wip_2024/HCOMP_24_WIP_4.pdf"
    },
    paper3: {
        title: "Seeing Twice: How Side-by-Side T2I Comparison Changes Auditing Strategies",
        authors: "Matheus Kunzler Maldaner, Wesley Hanwen Deng, Jason I. Hong, Ken Holstein, Motahhare Eslami",
        venue: "ACM CI 2025",
        date: "2025",
        abstract: "While generative AI systems have gained popularity in diverse applications, their potential to produce harmful outputs limits their trustworthiness and utility. A small but growing line of research has explored tools and processes to better engage non-AI expert users in auditing generative AI systems. In this work, we present the design and evaluation of MIRAGE, a web-based tool exploring a 'contrast-first' workflow that allows users to pick up to four different text-to-image (T2I) models, view their images side-by-side, and provide feedback on model performance on a single screen. In our user study with fifteen participants, we used four predefined models for consistency, with only a single model initially being shown. We found that most participants shifted from analyzing individual images to general patterns once the side-by-side step appeared with all four models; several participants appeared with all four models.",
        link: "https://ci.acm.org/2025/wp-content/uploads/101-Maldaner.pdf"
    },
    paper4: {
        title: "eXpLogic: Explaining Logic Types and Patterns in DiffLogic Networks",
        authors: "Stephen Wormald, David Koblah, Matheus Kunzler Maldaner, Domenic Forte, Damon L. Woodard",
        venue: "ITNG 2025",
        date: "2025",
        abstract: "This paper introduces eXpLogic, an algorithm for creating saliency maps that explain DiffLogic neural networks where each node learns specific logic types. Inspired by circuit analysis, eXpLogic precisely identifies input patterns responsible for model decisions, helping interpret predictions and optimize networks. We evaluate eXpLogic against gradient-based methods using our novel SwitchDist metric, showing eXpLogic better predicts which inputs affect class scores. This approach reduced network size by 87% and improved inference time by 8% with minimal impact on performance. Our work demonstrates how architectural choices can enhance explainability in deep learning, with applications in critical sectors that can affect human lives including healthcare, defense, and law.",
        link: "https://arxiv.org/abs/2503.09910"
    },
    paper6: {
        title: "Magentic-UI: Towards Human-in-the-loop Agentic Systems",
        authors: "Hussein Mozannar, Gagan Bansal, Cheng Tan, Adam Fourney, Victor Dibia, Jingya Chen, Jack Gerrits, Tyler Payne, Matheus Kunzler Maldaner, Madeleine Grunde-McLaughlin, Eric Zhu, Griffin Bassman, Jacob Alber, Peter Chang, Ricky Loynd, Friederike Niedtner, Ece Kamar, Maya Murad, Rafah Hosn, Saleema Amershi",
        venue: "Microsoft Research AI Frontiers (arXiv preprint)",
        date: "July 2025",
        abstract: "AI agents powered by large language models are increasingly capable of autonomously completing complex, multi-step tasks using external tools. Yet, they still fall short of human-level performance in most domains including computer use, software development, and research. Their growing autonomy and ability to interact with the outside world, also introduces safety and security risks including potentially misaligned actions and adversarial manipulation. We argue that human-in-the-loop agentic systems offer a promising path forward, combining human oversight and control with AI efficiency to unlock productivity from imperfect systems. We introduce Magentic-UI, an open-source web interface for developing and studying human-agent interaction. Built on a flexible multi-agent architecture, Magentic-UI supports web browsing, co-planning, human-agent collaboration, real-time task execution with human oversight and intervention, action approval, multi-tasking, memory planning and reuse, and final answer verification.",
        link: "https://arxiv.org/abs/2507.22358v1"
    },
    paper7: {
        title: "Efficient and Transparent Machine Learning: Exploring Applications of Differentiable Logic Gate Networks",
        authors: "Matheus Kunzler Maldaner",
        venue: "Undergraduate Thesis, University of Florida",
        date: "May 2025",
        abstract: "Despite their remarkable capabilities, the decision-making process of deep neural networks remains as black boxes, obscuring the logic behind their decisions and undermining trust in critical domains such as healthcare, national security, and law. While the field of Explainable Artificial Intelligence (XAI) has emerged to mitigate these issues, current post hoc explanation methods often fail to deliver reliable insights as they are applied after a model has already been trained, rather than addressing the underlying architecture. To overcome these fundamental limitations, this thesis explores Differentiable Logic Gate Networks (DiffLogic), a type of neurosymbolic AI (NSAI) architecture that enables neural networks to learn a distribution of logic gates for each node. Specifically, this work seeks to address unexplored areas in XAI and NSAI by: (1) implementing DiffLogic on Field Programmable Gate Arrays (FPGA) for hardware acceleration, (2) developing a compression algorithm for DiffLogic models, and (3) deploying visualization tools to intuitively interpret learned logical structures.",
        link: "#",
        restricted: true,
        restrictionNote: "Under 2-year embargo period"
    }
};

// Carousel state
let currentPage = 0;
const totalPapers = 6; // Note: paper_hcomp.png was missing, so this count should be accurate for available papers.
let papersPerPage = 5;
let activePaper = null;

// Update papers per page based on screen width
function updatePapersPerPage() {
    const width = window.innerWidth;
    if (width <= 736) {
        papersPerPage = 1;
    } else if (width <= 980) {
        papersPerPage = 2;
    } else if (width <= 1280) {
        papersPerPage = 3;
    } else {
        papersPerPage = 5;
    }
}

// Calculate max pages
function getMaxPages() {
    return Math.max(0, Math.ceil(totalPapers / papersPerPage) - 1);
}

// Update navigation buttons state
function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const maxPages = getMaxPages();

    // Disable/enable prev button
    if (currentPage === 0) {
        prevBtn.classList.add('disabled');
    } else {
        prevBtn.classList.remove('disabled');
    }

    // Disable/enable next button
    if (currentPage >= maxPages) {
        nextBtn.classList.add('disabled');
    } else {
        nextBtn.classList.remove('disabled');
    }
}

// Scroll carousel
function scrollCarousel() {
    const carousel = document.getElementById('papersCarousel');
    const cardWidth = carousel.querySelector('.paper-card').offsetWidth;
    const gap = 20;
    const scrollAmount = (cardWidth + gap) * papersPerPage;
    carousel.style.transform = `translateX(-${currentPage * scrollAmount}px)`;
    updateNavButtons();
}

// Open panel with paper info
function openPanel(paperId) {
    const paper = papersData[paperId];
    const panel = document.getElementById('paperInfoPanel');
    const overlay = document.getElementById('panelOverlay');
    const content = document.getElementById('panelContent');

    // Remove active class from all cards
    document.querySelectorAll('.paper-card').forEach(card => {
        card.classList.remove('active');
        card.classList.remove('expanded');
    });

    // Add active class to clicked card
    const activeCard = document.querySelector(`[data-paper-id="${paperId}"]`);
    activeCard.classList.add('active');
    activeCard.classList.add('expanded');

    // Populate panel content
    let linkHTML;
    if (paper.restricted) {
        linkHTML = `
            <div class="panel-link disabled" title="${escapeHtml(paper.restrictionNote)}">
                <i class="fas fa-lock"></i> ${escapeHtml(paper.restrictionNote)}
            </div>
        `;
    } else {
        linkHTML = `
            <a href="${escapeHtml(paper.link)}" target="_blank" rel="noopener noreferrer" class="panel-link">
                <i class="fas fa-file-alt"></i> Read Full Paper
            </a>
        `;
    }

    content.innerHTML = `
        <h3>${escapeHtml(paper.title)}</h3>
        <div class="panel-meta">
            <p><strong>Authors:</strong> ${escapeHtml(paper.authors)}</p>
            <p><strong>Venue:</strong> ${escapeHtml(paper.venue)}</p>
            <p><strong>Date:</strong> ${escapeHtml(paper.date)}</p>
        </div>
        <div class="panel-abstract">
            <p>${escapeHtml(paper.abstract)}</p>
        </div>
        ${linkHTML}
    `;

    // Show panel and overlay
    panel.classList.add('active');
    overlay.classList.add('active');
    activePaper = paperId;
}

// Close panel
function closePanel() {
    const panel = document.getElementById('paperInfoPanel');
    const overlay = document.getElementById('panelOverlay');

    panel.classList.remove('active');
    overlay.classList.remove('active');

    // Remove active class from all cards
    document.querySelectorAll('.paper-card').forEach(card => {
        card.classList.remove('active');
        card.classList.remove('expanded');
    });

    activePaper = null;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updatePapersPerPage();
    updateNavButtons();

    // Previous button
    document.getElementById('prevBtn').addEventListener('click', function() {
        if (currentPage > 0 && !this.classList.contains('disabled')) {
            currentPage--;
            scrollCarousel();
        }
    });

    // Next button
    document.getElementById('nextBtn').addEventListener('click', function() {
        if (currentPage < getMaxPages() && !this.classList.contains('disabled')) {
            currentPage++;
            scrollCarousel();
        }
    });

    // Paper card clicks and keyboard support
    document.querySelectorAll('.paper-card').forEach(card => {
        // Make cards keyboard focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');

        card.addEventListener('click', function() {
            const paperId = this.getAttribute('data-paper-id');
            if (activePaper === paperId) {
                closePanel();
            } else {
                openPanel(paperId);
            }
        });

        // Keyboard support for cards (Enter and Space)
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const paperId = this.getAttribute('data-paper-id');
                if (activePaper === paperId) {
                    closePanel();
                } else {
                    openPanel(paperId);
                }
            }
        });
    });

    // Close button
    document.getElementById('panelCloseBtn').addEventListener('click', closePanel);

    // Overlay click
    document.getElementById('panelOverlay').addEventListener('click', closePanel);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // ESC key to close panel
        if (e.key === 'Escape' && activePaper) {
            closePanel();
        }

        // Arrow keys for carousel navigation (only when panel is closed)
        if (!activePaper) {
            if (e.key === 'ArrowLeft') {
                const prevBtn = document.getElementById('prevBtn');
                if (currentPage > 0 && !prevBtn.classList.contains('disabled')) {
                    currentPage--;
                    scrollCarousel();
                }
            } else if (e.key === 'ArrowRight') {
                const nextBtn = document.getElementById('nextBtn');
                if (currentPage < getMaxPages() && !nextBtn.classList.contains('disabled')) {
                    currentPage++;
                    scrollCarousel();
                }
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        updatePapersPerPage();
        currentPage = 0;
        scrollCarousel();
    });
});
let postersData = [];

function parseISODate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatPosterDate(value) {
    const parsed = parseISODate(value);
    if (!parsed) return value || '';
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function normalizePoster(raw) {
    const id = raw && raw.id ? String(raw.id) : '';
    const title = raw && raw.title ? String(raw.title) : '';
    const venue = raw && raw.venue ? String(raw.venue) : '';
    const dateIso = raw && (raw.date || raw.date_iso) ? String(raw.date || raw.date_iso) : '';
    const posterImage = raw && (raw.poster_image || raw.posterImage || raw.image) ? String(raw.poster_image || raw.posterImage || raw.image) : '';
    const presentationImage = raw && (raw.presentation_image || raw.presentationImage) ? String(raw.presentation_image || raw.presentationImage) : '';

    return {
        id,
        title,
        venue,
        date: raw && raw.date_display ? String(raw.date_display) : formatPosterDate(dateIso),
        date_iso: dateIso,
        posterImage,
        presentationImage
    };
}

async function loadPosters() {
    try {
        const response = await fetch('../data/json/posters.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid posters.json format');

        postersData = data
            .map(normalizePoster)
            .filter(p => p.id && p.title && p.venue && p.posterImage && p.presentationImage)
            .sort((a, b) => {
                const da = parseISODate(a.date_iso);
                const db = parseISODate(b.date_iso);
                if (da && db) return db - da;
                if (da) return -1;
                if (db) return 1;
                return b.id.localeCompare(a.id);
            });

        return true;
    } catch (error) {
        console.error('Error loading posters:', error);
        postersData = [];
        return false;
    }
}

// Posters carousel state
let currentPosterPage = 0;
let postersPerPage = 3;
let activePoster = null;

// Update posters per page based on screen width
function updatePostersPerPage() {
    const width = window.innerWidth;
    if (width <= 736) {
        postersPerPage = 1;
    } else if (width <= 980) {
        postersPerPage = 2;
    } else {
        postersPerPage = 3;
    }
}

// Calculate max pages for posters
function getMaxPosterPages() {
    const totalPosters = postersData.length;
    return Math.max(0, Math.ceil(totalPosters / postersPerPage) - 1);
}

// Render poster cards
function renderPosterCards() {
    const carousel = document.getElementById('postersCarousel');
    if (!carousel) return;
    carousel.innerHTML = postersData.map(poster => `
        <div class="poster-card" data-poster-id="${escapeHtml(poster.id)}" tabindex="0" role="button">
            <img src="${escapeHtml(poster.posterImage)}" alt="${escapeHtml(poster.title)}" class="poster-thumbnail">
            <div class="poster-card-info">
                <h5 class="poster-card-title">${escapeHtml(poster.title)}</h5>
                <p class="poster-card-venue">${escapeHtml(poster.venue)}</p>
            </div>
        </div>
    `).join('');

    // Attach click and keyboard listeners
    document.querySelectorAll('.poster-card').forEach(card => {
        card.addEventListener('click', function() {
            const posterId = this.getAttribute('data-poster-id');
            const poster = postersData.find(p => p.id === posterId);
            if (activePoster === posterId) {
                closePosterPanel();
            } else {
                openPosterPanel(poster);
            }
        });

        // Keyboard support (Enter and Space)
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const posterId = this.getAttribute('data-poster-id');
                const poster = postersData.find(p => p.id === posterId);
                if (activePoster === posterId) {
                    closePosterPanel();
                } else {
                    openPosterPanel(poster);
                }
            }
        });
    });
}

// Update poster navigation buttons
function updatePosterNavButtons() {
    const prevBtn = document.getElementById('prevBtnPosters');
    const nextBtn = document.getElementById('nextBtnPosters');
    const maxPages = getMaxPosterPages();

    if (currentPosterPage === 0) {
        prevBtn.classList.add('disabled');
    } else {
        prevBtn.classList.remove('disabled');
    }

    if (currentPosterPage >= maxPages) {
        nextBtn.classList.add('disabled');
    } else {
        nextBtn.classList.remove('disabled');
    }
}

// Scroll posters carousel
function scrollPostersCarousel() {
    const carousel = document.getElementById('postersCarousel');
    const firstCard = carousel.querySelector('.poster-card');
    if (!firstCard) {
        return;
    }

    const cardWidth = firstCard.offsetWidth;
    const gap = 20;
    const scrollAmount = (cardWidth + gap) * postersPerPage;
    const translateX = currentPosterPage * scrollAmount;

    carousel.style.transform = `translateX(-${translateX}px)`;
    updatePosterNavButtons();
}

// Open poster detail panel
function openPosterPanel(poster) {
    const panel = document.getElementById('posterDetailPanel');
    const overlay = document.getElementById('posterPanelOverlay');
    const content = document.getElementById('posterPanelContent');

    // Remove active class from all cards
    document.querySelectorAll('.poster-card').forEach(card => {
        card.classList.remove('active');
    });

    // Add active class to clicked card
    const activeCard = document.querySelector(`[data-poster-id="${poster.id}"]`);
    if (activeCard) activeCard.classList.add('active');

    // Populate panel content
    content.innerHTML = `
        <div class="poster-detail-info">
            <h3>${escapeHtml(poster.title)}</h3>
            <div class="poster-detail-meta">
                <p><strong>Venue:</strong> ${escapeHtml(poster.venue)}</p>
                <p><strong>Date:</strong> ${escapeHtml(poster.date)}</p>
            </div>
        </div>
        <div class="poster-images-grid">
            <div class="poster-image-section">
                <h4>Poster</h4>
                <img src="${escapeHtml(poster.posterImage)}" alt="Poster">
            </div>
            <div class="poster-image-section">
                <h4>Presentation</h4>
                <img src="${escapeHtml(poster.presentationImage)}" alt="Presenting at ${escapeHtml(poster.venue)}">
            </div>
        </div>
    `;

    // Show panel and overlay
    panel.classList.add('active');
    overlay.classList.add('active');
    activePoster = poster.id;
}

// Close poster panel
function closePosterPanel() {
    const panel = document.getElementById('posterDetailPanel');
    const overlay = document.getElementById('posterPanelOverlay');

    panel.classList.remove('active');
    overlay.classList.remove('active');

    // Remove active class from all cards
    document.querySelectorAll('.poster-card').forEach(card => {
        card.classList.remove('active');
    });

    activePoster = null;
}

// Initialize posters carousel
document.addEventListener('DOMContentLoaded', function() {
    updatePostersPerPage();
    loadPosters().then(() => {
        currentPosterPage = 0;
        renderPosterCards();

        // Wait for cards to be rendered and laid out
        requestAnimationFrame(() => {
            updatePosterNavButtons();
        });
    });

    // Previous button
    document.getElementById('prevBtnPosters').addEventListener('click', function() {
        if (currentPosterPage > 0 && !this.classList.contains('disabled')) {
            currentPosterPage--;
            requestAnimationFrame(() => {
                scrollPostersCarousel();
            });
        }
    });

    // Next button
    document.getElementById('nextBtnPosters').addEventListener('click', function() {
        if (currentPosterPage < getMaxPosterPages() && !this.classList.contains('disabled')) {
            currentPosterPage++;
            requestAnimationFrame(() => {
                scrollPostersCarousel();
            });
        }
    });

    // Close button
    document.getElementById('posterPanelCloseBtn').addEventListener('click', closePosterPanel);

    // Overlay click
    document.getElementById('posterPanelOverlay').addEventListener('click', closePosterPanel);

    // Keyboard navigation for posters
    document.addEventListener('keydown', function(e) {
        // ESC key to close poster panel
        if (e.key === 'Escape' && activePoster) {
            closePosterPanel();
            return;
        }

        // Arrow keys for posters carousel navigation (only when panel is closed)
        if (!activePoster && !activePaper) {
            if (e.key === 'ArrowLeft') {
                const prevBtn = document.getElementById('prevBtnPosters');
                if (currentPosterPage > 0 && !prevBtn.classList.contains('disabled')) {
                    currentPosterPage--;
                    requestAnimationFrame(() => {
                        scrollPostersCarousel();
                    });
                }
            } else if (e.key === 'ArrowRight') {
                const nextBtn = document.getElementById('nextBtnPosters');
                if (currentPosterPage < getMaxPosterPages() && !nextBtn.classList.contains('disabled')) {
                    currentPosterPage++;
                    requestAnimationFrame(() => {
                        scrollPostersCarousel();
                    });
                }
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        updatePostersPerPage();
        currentPosterPage = 0;
        scrollPostersCarousel();
    });
});
// Add Modal Script
document.addEventListener('DOMContentLoaded', function() {
    // Open modal
    const openButtons = document.querySelectorAll('.open-modal');
    openButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'block';
        });
    });
    
    // Close modal when clicking X
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            document.getElementById(modalId).style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    window.onclick = function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Add expand functionality for abstracts
    document.querySelectorAll('.expand-button').forEach(button => {
        // Set up initial state
        const container = button.closest('.abstract-container');
        const fullAbstract = container.querySelector('.full-abstract');
        const abstractText = container.querySelector('.abstract-text');
        
        // Copy the full text to the abstract text on page load
        if (fullAbstract && abstractText) {
            abstractText.innerHTML = fullAbstract.innerHTML;
        }
        
        button.addEventListener('click', function() {
            const container = this.closest('.abstract-container');
            const isExpanded = container.classList.contains('expanded');
            
            // Toggle the expanded class
            container.classList.toggle('expanded');
            
            // Update button text
            this.textContent = isExpanded ? 'Read More' : 'Show Less';
        });
    });
});
