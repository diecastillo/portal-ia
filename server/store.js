import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { config } from './config.js';

const readJson = (file) => JSON.parse(readFileSync(path.join(config.dataDir, file), 'utf-8'));

export const empleados = readJson('empleados.json');
export const credenciales = readJson('credenciales.json');

// Directorio público para el selector del portal: sin emails ni contraseñas.
export function directorioPublico() {
  const porDept = new Map();
  for (const [id, e] of Object.entries(empleados)) {
    if (!porDept.has(e.dept)) porDept.set(e.dept, []);
    porDept.get(e.dept).push({ id, name: e.name });
  }
  return [...porDept].map(([name, employees]) => ({
    id: name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    employees,
  }));
}

// Registro de solicitudes persistente en data/solicitudes.json
const solicitudesFile = path.join(config.dataDir, 'solicitudes.json');
let solicitudes = existsSync(solicitudesFile) ? JSON.parse(readFileSync(solicitudesFile, 'utf-8')) : [];

export const listarSolicitudes = () => solicitudes;

export function registrarSolicitud(entry) {
  solicitudes.push(entry);
  writeFileSync(solicitudesFile, JSON.stringify(solicitudes, null, 2));
}
