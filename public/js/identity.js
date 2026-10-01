import { getDirectorio } from './api.js';
import { safeStorage, loadJson, saveJson } from './util.js';

const KEY = 'portalia_identity';

const gateOverlay = document.getElementById('gateOverlay');
const deptSelect = document.getElementById('deptSelect');
const empSelect = document.getElementById('empSelect');
const enterBtn = document.getElementById('enterBtn');
const chip = document.getElementById('identityChip');
const avatar = document.getElementById('identityAvatar');
const nameEl = document.getElementById('identityName');
const deptEl = document.getElementById('identityDept');
const changeBtn = document.getElementById('changeIdentityBtn');

let directory = [];
let identity = null;

export const getIdentity = () => identity;
export const openGate = () => gateOverlay.classList.remove('hidden');

function option(value, text) {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = text;
  return opt;
}

function populateEmployees(deptId) {
  empSelect.innerHTML = '';
  const dept = directory.find((d) => d.id === deptId);
  if (!dept) {
    empSelect.disabled = true;
    empSelect.appendChild(option('', 'Primero elige un departamento'));
    return;
  }
  empSelect.disabled = false;
  empSelect.appendChild(option('', 'Selecciona tu nombre...'));
  dept.employees.forEach((e) => empSelect.appendChild(option(e.id, e.name)));
}

function showChip(id) {
  chip.style.display = 'flex';
  nameEl.textContent = id.empName;
  deptEl.textContent = id.deptName;
  avatar.textContent = id.empName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export async function initIdentity() {
  const store = safeStorage('session');

  try {
    directory = await getDirectorio();
  } catch (e) {
    directory = [];
    deptSelect.appendChild(option('', 'No se pudo cargar el directorio'));
  }
  directory.forEach((d) => deptSelect.appendChild(option(d.id, d.name)));

  const checkReady = () => { enterBtn.disabled = !(deptSelect.value && empSelect.value); };
  deptSelect.addEventListener('change', () => { populateEmployees(deptSelect.value); checkReady(); });
  empSelect.addEventListener('change', checkReady);
  changeBtn.addEventListener('click', openGate);

  enterBtn.addEventListener('click', () => {
    const dept = directory.find((d) => d.id === deptSelect.value);
    const emp = dept && dept.employees.find((e) => e.id === empSelect.value);
    if (!dept || !emp) return;
    identity = { deptId: dept.id, deptName: dept.name, empId: emp.id, empName: emp.name };
    saveJson(store, KEY, identity);
    showChip(identity);
    gateOverlay.classList.add('hidden');
  });

  const saved = loadJson(store, KEY, null);
  const dept = saved && directory.find((d) => d.id === saved.deptId);
  if (dept && dept.employees.some((e) => e.id === saved.empId)) {
    identity = saved;
    deptSelect.value = saved.deptId;
    populateEmployees(saved.deptId);
    empSelect.value = saved.empId;
    showChip(identity);
    gateOverlay.classList.add('hidden');
  } else {
    openGate();
  }
}
