/* ---------- Datos recordados en este dispositivo ---------- */
const REMEMBER_KEY = 'forofibra_parte_postes_v1';
const REMEMBER_IDS = ['empresa','unidad','provincia','poblacion','central','rp-nombre','rp-nif'];
function saveRememberedData() {
  const toggle = document.getElementById('recordar-datos');
  if (!toggle) return;
  if (!toggle.checked) { localStorage.removeItem(REMEMBER_KEY); return; }
  const data = {remember:true};
  REMEMBER_IDS.forEach(id => data[id] = val(id));
  const first = document.querySelector('.persona-row');
  if (first) { data.personaNombre = first.querySelector('.p-nombre').value; data.personaCategoria = first.querySelector('.p-categoria').value; }
  localStorage.setItem(REMEMBER_KEY, JSON.stringify(data));
}
function restoreRememberedData() {
  try {
    const data = JSON.parse(localStorage.getItem(REMEMBER_KEY) || 'null');
    if (!data?.remember) return;
    document.getElementById('recordar-datos').checked = true;
    REMEMBER_IDS.forEach(id => { if (data[id]) document.getElementById(id).value = data[id]; });
    const first = document.querySelector('.persona-row');
    if (first) {
      if (data.personaNombre) first.querySelector('.p-nombre').value = data.personaNombre;
      if (data.personaCategoria) first.querySelector('.p-categoria').value = data.personaCategoria;
    }
  } catch (_) {}
}

/* ---------- init ---------- */
window.addEventListener('DOMContentLoaded', () => {
  renderEpiGrid();
  addPersona();
  initSigPad();
  addPoste();
  const now = new Date();
  const localISO = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  document.getElementById('fecha').value = localISO;
  document.getElementById('hora').value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  restoreRememberedData();
  document.getElementById('recordar-datos')?.addEventListener('change', saveRememberedData);
});

/* Carga la versión final del generador, que usa plantillas PNG optimizadas. */
(() => {
  const s = document.createElement('script');
  s.src = 'app-5.js?v=20260915';
  s.defer = true;
  document.head.appendChild(s);
})();
