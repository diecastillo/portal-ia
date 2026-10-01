import { getHerramientas } from './api.js';
import { initTheme } from './theme.js';
import { initIdentity } from './identity.js';
import { initStats } from './stats.js';
import { initTools } from './tools.js';

initTheme();
initStats();
initIdentity();
getHerramientas()
  .then(initTools)
  .catch(() => {
    document.getElementById('resultCount').textContent = 'No se pudieron cargar las herramientas';
  });
