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

/* ---------- Carga robusta de PDF-Lib y de la versión final del generador ---------- */
(() => {
  const loadFinal = () => {
    if (document.querySelector('script[data-parte-postes-final]')) return;
    const s = document.createElement('script');
    s.src = 'app-5.js?v=20260915b';
    s.dataset.partePostesFinal = '1';
    s.onerror = () => setStatus('No se ha podido cargar el generador. Recarga la página.', 'error');
    document.head.appendChild(s);
  };

  if (window.PDFLib) {
    loadFinal();
    return;
  }

  const lib = document.createElement('script');
  lib.src = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
  lib.crossOrigin = 'anonymous';
  lib.onload = loadFinal;
  lib.onerror = () => setStatus('No se ha podido cargar el motor PDF. Comprueba la conexión y recarga.', 'error');
  document.head.appendChild(lib);
})();
