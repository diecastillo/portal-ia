import { LOGOS } from './logos.js';
import { solicitarPassword } from './api.js';
import { escapeHtml, safeStorage, loadJson, saveJson } from './util.js';
import { getIdentity, openGate } from './identity.js';

const FAVS_KEY = 'portalia_favs';

const SVG_STAR_FILLED = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.8 1.5 6.9L12 17.9l-6.1 3.4 1.5-6.9-5.2-4.8 6.9-.7L12 2.5z"/></svg>';
const SVG_STAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.8 1.5 6.9L12 17.9l-6.1 3.4 1.5-6.9-5.2-4.8 6.9-.7L12 2.5z"/></svg>';
const SVG_EXTERNAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>';
const SVG_SPINNER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-9-9" style="animation:spin .7s linear infinite"/></svg>';
const SVG_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

export function initTools(tools) {
  const grid = document.getElementById('grid');
  const filtersEl = document.getElementById('filters');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const store = safeStorage();

  const categories = ['Todas', ...new Set(tools.flatMap((t) => t.cats)).values()].sort((a, b) =>
    a === 'Todas' ? -1 : b === 'Todas' ? 1 : a.localeCompare(b));
  const favorites = new Set(loadJson(store, FAVS_KEY, []));
  let activeCat = 'Todas';
  let query = '';

  document.getElementById('toolCount').textContent = tools.length;

  function matches(tool) {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || tool.name.toLowerCase().includes(q) ||
      tool.desc.toLowerCase().includes(q) || tool.cats.some((c) => c.toLowerCase().includes(q));
    const matchesCat = activeCat === 'Todas' ||
      (activeCat === 'Favoritas' ? favorites.has(tool.name) : tool.cats.includes(activeCat));
    return matchesQuery && matchesCat;
  }

  function renderFilters() {
    filtersEl.innerHTML = '';
    const chips = categories.map((label) => ({
      label,
      count: label === 'Todas' ? tools.length : tools.filter((t) => t.cats.includes(label)).length,
    }));
    chips.push({ label: 'Favoritas', count: favorites.size });
    chips.forEach(({ label, count }) => {
      const chip = document.createElement('button');
      chip.className = 'chip' + (activeCat === label ? ' active' : '');
      chip.innerHTML = `${escapeHtml(label)} <span class="count">${count}</span>`;
      chip.addEventListener('click', () => { activeCat = label; render(); });
      filtersEl.appendChild(chip);
    });
  }

  function cardHtml(tool) {
    const isFav = favorites.has(tool.name);
    const logo = tool.logo ? LOGOS[tool.logo] : null;
    const icon = logo
      ? `<svg viewBox="0 0 24 24" fill="${logo.hex}"><path d="${logo.path}"/></svg>`
      : escapeHtml(tool.name.charAt(0));
    const name = escapeHtml(tool.name);
    return `
      <div class="card-top">
        <div class="${logo ? 'card-icon has-logo' : 'card-icon'}" ${logo ? '' : `style="background:${tool.color}"`}>${icon}</div>
        <button class="fav-btn ${isFav ? 'active' : ''}" aria-label="Marcar como favorita" data-name="${name}">
          ${isFav ? SVG_STAR_FILLED : SVG_STAR}
        </button>
      </div>
      <h3>${name}</h3>
      <p>${escapeHtml(tool.desc)}</p>
      <div class="card-tags">${tool.cats.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join('')}</div>
      <div class="card-foot">
        <a class="access-btn" href="${escapeHtml(tool.url)}" target="_blank" rel="noopener">Acceder ${SVG_EXTERNAL}</a>
        <span class="plan-tag ${tool.plan === 'pagada' ? 'paid' : 'free'}">${tool.plan === 'pagada' ? 'De pago' : 'Gratis'}</span>
      </div>
      ${tool.requiresCredential ? `<button class="request-btn" data-tool="${name}">Enviarme la contraseña por email</button>` : ''}`;
  }

  function renderGrid() {
    const visible = tools.filter(matches);
    grid.innerHTML = '';
    visible.forEach((tool) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = cardHtml(tool);
      grid.appendChild(card);
    });
    resultCount.textContent = visible.length === tools.length
      ? `${tools.length} herramientas`
      : `${visible.length} de ${tools.length}`;
    emptyState.classList.toggle('show', visible.length === 0);
    grid.style.display = visible.length === 0 ? 'none' : 'grid';
  }

  function render() {
    renderFilters();
    renderGrid();
  }

  // Delegación de eventos: un solo listener para todas las tarjetas
  grid.addEventListener('click', (e) => {
    const fav = e.target.closest('.fav-btn');
    if (fav) {
      const name = fav.dataset.name;
      if (!favorites.delete(name)) favorites.add(name);
      saveJson(store, FAVS_KEY, [...favorites]);
      render();
      return;
    }
    const req = e.target.closest('.request-btn');
    if (req) pedirPassword(req);
  });

  async function pedirPassword(btn) {
    const identity = getIdentity();
    if (!identity) { openGate(); return; }
    const original = btn.textContent;
    btn.disabled = true;
    btn.classList.remove('sent', 'error');
    btn.innerHTML = SVG_SPINNER + ' Enviando...';
    try {
      await solicitarPassword(identity.empId, btn.dataset.tool);
      btn.classList.add('sent');
      btn.innerHTML = SVG_CHECK + ' Revisa tu email';
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('sent');
        btn.textContent = original;
      }, 4000);
    } catch (err) {
      btn.classList.add('error');
      btn.textContent = 'No se pudo enviar — reintentar';
      btn.disabled = false;
    }
  }

  searchInput.addEventListener('input', (e) => { query = e.target.value; renderGrid(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  render();
}
