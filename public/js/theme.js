import { safeStorage } from './util.js';

const ICON_DARK = '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>';
const ICON_LIGHT = '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" fill="currentColor" stroke="none"/>';

export function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const root = document.documentElement;
  const store = safeStorage();

  function apply(theme) {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    icon.innerHTML = theme === 'light' ? ICON_LIGHT : ICON_DARK;
  }

  let theme = 'dark';
  try {
    const saved = store && store.getItem('portalia_theme');
    if (saved) theme = saved;
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light';
  } catch (e) {}
  apply(theme);

  toggle.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    apply(theme);
    try { store && store.setItem('portalia_theme', theme); } catch (e) {}
  });
}
