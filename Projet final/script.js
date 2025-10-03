// script-final.js - ES6+ moderne avec fallback IE11 et modal focus trap

// --- Variables DOM ---
const projectsGrid = document.getElementById('projectsGrid');
const filtersDiv = document.getElementById('filters');
const searchInput = document.getElementById('search');
const errorBox = document.getElementById('errorBox');
const modal = document.getElementById('projectModal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');
const yearSpan = document.getElementById('year');

if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let allProjects = [];
let activeTech = 'all';
let availableTechs = [];
let lastFocusedElement = null;

// --- Fetch avec fallback IE11 ---
const fetchProjects = () => {
  if (errorBox) errorBox.style.display = 'none';
  projectsGrid.innerHTML = `<div class="loader">Chargement des projets...</div>`;
  const url = 'https://gabistam.github.io/Demo_API/data/projects.json';

  if (window.fetch) {
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        allProjects = data.projects || [];
        extractTechs();
        renderFilters();
        renderProjects();
      })
      .catch(err => showError(`Impossible de charger les projets : ${err.message}`));
  } else {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        projectsGrid.innerHTML = '';
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            allProjects = data.projects || [];
            extractTechs();
            renderFilters();
            renderProjects();
          } catch (e) {
            showError("Erreur parsing JSON : " + e.message);
          }
        } else {
          showError("Impossible de charger les projets : HTTP " + xhr.status);
        }
      }
    };
    xhr.send();
  }
};

// --- Extraire technologies uniques ---
const extractTechs = () => {
  availableTechs = [];
  allProjects.forEach(project => {
    (project.technologies || []).forEach(tech => {
      if (availableTechs.indexOf(tech) === -1) availableTechs.push(tech);
    });
  });
};

// --- Rendu des filtres ---
const renderFilters = () => {
  filtersDiv.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.dataset.tech = 'all';
  allBtn.innerText = 'Tous';
  allBtn.onclick = onFilterClick;
  allBtn.setAttribute('aria-pressed', 'true');
  filtersDiv.appendChild(allBtn);

  availableTechs.forEach(tech => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.tech = tech;
    btn.innerText = tech;
    btn.onclick = onFilterClick;
    btn.setAttribute('aria-pressed', 'false');
    filtersDiv.appendChild(btn);
  });
};

// --- Filtrage ---
const onFilterClick = e => {
  activeTech = e.currentTarget.dataset.tech;
  const btns = filtersDiv.querySelectorAll('.filter-btn');
  for (let i = 0; i < btns.length; i++) {
    const btn = btns[i];
    const isActive = btn.dataset.tech === activeTech;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }
  renderProjects();
};

// --- Rendu des projets ---
const renderProjects = () => {
  const q = (searchInput.value || '').trim().toLowerCase();
  projectsGrid.innerHTML = '';

  const filtered = allProjects.filter(p => {
    const matchTech = activeTech === 'all' || (p.technologies || []).indexOf(activeTech) !== -1;
    const matchSearch = !q || (`${p.title} ${p.client || ''} ${p.description || ''}`).toLowerCase().indexOf(q) !== -1;
    return matchTech && matchSearch;
  });

  if (filtered.length === 0) {
    projectsGrid.innerHTML = `<div class="card" style="padding:20px;"><p>Aucun projet trouvé.</p></div>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;

    const img = document.createElement('img');
    img.src = p.image || 'https://via.placeholder.com/800x400.png?text=No+image';
    img.alt = `${p.title} — ${p.client || ''}`;
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.className = 'project-title';
    title.innerText = p.title;
    body.appendChild(title);

    const client = document.createElement('div');
    client.className = 'client';
    client.innerText = p.client || 'Client inconnu';
    body.appendChild(client);

    const badges = document.createElement('div');
    badges.className = 'badges';
    (p.technologies || []).forEach(t => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.innerText = t;
      badges.appendChild(span);
    });
    body.appendChild(badges);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'btn';
    detailsBtn.innerText = 'Voir détails';
    detailsBtn.onclick = () => openModal(p.id);
    actions.appendChild(detailsBtn);

    const visit = document.createElement('a');
    visit.className = 'btn ghost';
    visit.innerText = 'Visiter';
    visit.href = p.url || '#';
    visit.target = '_blank';
    visit.rel = 'noopener noreferrer';
    actions.appendChild(visit);

    body.appendChild(actions);
    card.appendChild(body);
    projectsGrid.appendChild(card);
  });
};

// --- Modal avec focus trap ---
const openModal = projectId => {
  let p = allProjects.find(proj => proj.id === projectId);
  if (!p) return;

  lastFocusedElement = document.activeElement;

  modalContent.innerHTML = `
    <h2 id="modalTitle">${escapeHtml(p.title)}</h2>
    <p><strong>Client :</strong> ${escapeHtml(p.client || '—')}</p>
    <img src="${p.image || ''}" alt="${escapeHtml(p.title)}" style="width:100%;max-height:260px;object-fit:cover;border-radius:8px;margin-top:12px;">
    <p>${escapeHtml(p.description || '')}</p>
    <h3>Technologies</h3>
    <div class="badges">${(p.technologies || []).map(escapeHtmlBadge).join(' ')}</div>
    <h3>Fonctionnalités</h3>
    <ul>${(p.features || []).map(escapeHtmlLi).join('')}</ul>
    <p><a class="btn" href="${p.url || '#'}" target="_blank" rel="noopener noreferrer">Voir le site</a></p>
  `;

  modal.setAttribute('aria-hidden', 'false');
  modalClose.focus();

  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const firstFocusable = focusable[0];
  const lastFocusable = focusable[focusable.length - 1];

  const keyHandler = e => {
    if (e.key === 'Escape') { closeModal(); }
    if (e.key === 'Tab') {
      if (e.shiftKey) { // shift + tab
        if (document.activeElement === firstFocusable) { e.preventDefault(); lastFocusable.focus(); }
      } else { // tab
        if (document.activeElement === lastFocusable) { e.preventDefault(); firstFocusable.focus(); }
      }
    }
  };

  modalClose.onclick = closeModal;
  modalBackdrop.onclick = closeModal;
  document.onkeydown = keyHandler;
};

const closeModal = () => {
  modal.setAttribute('aria-hidden', 'true');
  modalContent.innerHTML = '';
  modalClose.onclick = null;
  modalBackdrop.onclick = null;
  document.onkeydown = null;
  if (lastFocusedElement) lastFocusedElement.focus();
};

// --- Helpers ---
const escapeHtml = s => String(s || '')
  .replace(/&/g,'&amp;')
  .replace(/</g,'&lt;')
  .replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;')
  .replace(/'/g,'&#39;');

const escapeHtmlBadge = s => `<span class="badge">${escapeHtml(s)}</span>`;
const escapeHtmlLi = s => `<li>${escapeHtml(s)}</li>`;

const showError = msg => {
  if (errorBox) {
    errorBox.style.display = 'block';
    errorBox.innerText = msg;
  }
};

// --- Recherche live ---
let searchTimeout;
searchInput.oninput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(renderProjects, 150);
};

// --- Init ---
fetchProjects();
