const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

export function safeStorage(kind = 'local') {
  try { return kind === 'session' ? window.sessionStorage : window.localStorage; } catch (e) { return null; }
}

export function loadJson(storage, key, fallback) {
  try {
    const raw = storage && storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}

export function saveJson(storage, key, value) {
  try { storage && storage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
