/**
 * KADEMICS — search.js
 * Frontend search bar — calls /api/search?q=... on the C backend.
 * The C backend spawns 3 Windows threads (CreateThread) in parallel.
 * Results arrive as { archive: [], oracle: [], gauntlet: [] }
 * This JS renders the aggregated results in the dropdown.
 */
import { API } from './api.js';

let searchTimeout = null;

/**
 * initSearch()
 * Attaches the search bar to the nav input and renders results.
 */
export function initSearch() {
  const input    = document.getElementById('nav-search-input');
  const dropdown = document.getElementById('search-results-dropdown');
  const navSearch = document.querySelector('.nav-search');

  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearTimeout(searchTimeout);

    if (q.length < 2) {
      dropdown.classList.remove('open');
      navSearch?.classList.remove('scanning');
      return;
    }

    // Show scanning animation while waiting for C parallel search threads
    navSearch?.classList.add('scanning');

    // Debounce: 200ms after user stops typing
    searchTimeout = setTimeout(async () => {
      try {
        const data = await API.search(q);
        renderSearchResults(dropdown, data, q);
        navSearch?.classList.remove('scanning');
      } catch {
        navSearch?.classList.remove('scanning');
      }
    }, 200);
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // Keyboard: close on Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { dropdown.classList.remove('open'); input.blur(); }
  });
}

/**
 * renderSearchResults()
 * Takes aggregated JSON from C parallel search and renders items.
 */
function renderSearchResults(dropdown, data, query) {
  dropdown.innerHTML = '';

  const allResults = [
    ...(data.archive  || []),
    ...(data.oracle   || []),
    ...(data.gauntlet || [])
  ];

  if (allResults.length === 0) {
    dropdown.innerHTML = `
      <div class="search-result-item" style="color:var(--text-dim)">
        <i class="fa fa-search" style="color:var(--text-dim)"></i>
        No results for "${escapeHtml(query)}"
      </div>`;
    dropdown.classList.add('open');
    return;
  }

  // Section header
  dropdown.innerHTML = `
    <div style="padding:6px 16px;font-size:0.65rem;color:var(--text-dim);letter-spacing:0.15em;border-bottom:1px solid rgba(0,243,255,0.08)">
      [PARALLEL SCAN COMPLETE] — ${allResults.length} RESULT${allResults.length !== 1 ? 'S' : ''} FOUND
    </div>`;

  allResults.slice(0, 12).forEach(item => {
    const div = document.createElement('div');
    div.className = 'search-result-item';

    let icon  = '📁';
    let color = 'var(--cyan)';
    let link  = '#';

    switch (item.section) {
      case 'archive':
        icon  = item.type === 'note' ? '📄' : item.type === 'teacher' ? '👤' : '📚';
        color = 'var(--cyan)';
        link  = '/archive.html';
        break;
      case 'oracle':
        icon  = '⭐';
        color = 'var(--violet)';
        link  = `/teacher-dossier.html?id=${item.id}`;
        break;
      case 'gauntlet':
        icon  = '🎮';
        color = item.status === 'LIVE' ? 'var(--laser-red)' : 'var(--warning)';
        link  = '/gauntlet.html';
        break;
    }

    div.innerHTML = `
      <span class="result-type" style="color:${color};border-color:${color}30">${item.section.toUpperCase()}</span>
      <span>${icon} ${escapeHtml(item.name || '')}</span>`;

    div.addEventListener('click', () => {
      window.location.href = link;
      dropdown.classList.remove('open');
    });
    dropdown.appendChild(div);
  });

  dropdown.classList.add('open');
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
