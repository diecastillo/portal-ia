import { getSolicitudes } from './api.js';
import { escapeHtml } from './util.js';

const overlay = document.getElementById('statsOverlay');
const body = document.getElementById('statsBody');

function bars(entries) {
  if (!entries.length) return '<div class="stats-empty">Sin datos todavía.</div>';
  const max = entries[0][1];
  return entries.map(([label, count]) => `
    <div class="stats-row">
      <span class="stats-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
      <div class="stats-bar-track"><div class="stats-bar-fill" style="width:${max ? (count / max * 100) : 0}%"></div></div>
      <span class="stats-count">${count}</span>
    </div>`).join('');
}

function ranking(docs, keyFn, limit) {
  const counts = {};
  docs.forEach((d) => { const k = keyFn(d); counts[k] = (counts[k] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return limit ? sorted.slice(0, limit) : sorted;
}

async function load() {
  body.innerHTML = '<div class="stats-empty">Cargando...</div>';
  try {
    const docs = await getSolicitudes();
    if (!docs.length) {
      body.innerHTML = '<div class="stats-empty">Todavía no hay solicitudes de contraseña registradas.</div>';
      return;
    }
    body.innerHTML = `
      <div class="stats-section"><h3>Herramientas más solicitadas</h3>${bars(ranking(docs, (d) => d.herramienta, 8))}</div>
      <div class="stats-section"><h3>Por persona</h3>${bars(ranking(docs, (d) => `${d.empleado} · ${d.dept}`, 8))}</div>
      <div class="stats-section"><h3>Por departamento</h3>${bars(ranking(docs, (d) => d.dept))}</div>`;
  } catch (e) {
    body.innerHTML = '<div class="stats-empty">No se han podido cargar las estadísticas. Comprueba que el backend está arrancado.</div>';
  }
}

export function initStats() {
  document.getElementById('statsToggle').addEventListener('click', () => { overlay.classList.remove('hidden'); load(); });
  document.getElementById('statsCloseBtn').addEventListener('click', () => overlay.classList.add('hidden'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.add('hidden'); });
}
