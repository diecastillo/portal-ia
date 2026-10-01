// El backend sirve el portal, así que la API vive en el mismo origen.
const API = '/api';

async function request(path, options) {
  const res = await fetch(API + path, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const getDirectorio = () => request('/directorio');
export const getSolicitudes = () => request('/solicitudes');
export const getHerramientas = () => fetch('data/herramientas.json').then((r) => r.json());

export const solicitarPassword = (empleadoId, herramienta) =>
  request('/solicitar-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ empleadoId, herramienta }),
  });
