/* ---------- Firma (canvas) ---------- */
let sigCtx, drawing = false, sigHasContent = false;
function initSigPad() {
  const canvas = document.getElementById('sigpad');
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  sigCtx = canvas.getContext('2d');
  sigCtx.scale(ratio, ratio);
  sigCtx.lineWidth = 2;
  sigCtx.lineCap = 'round';
  sigCtx.strokeStyle = '#1f2937';

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  };
  const start = (e) => { drawing = true; const p = pos(e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); e.preventDefault(); };
  const move = (e) => { if (!drawing) return; const p = pos(e); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); sigHasContent = true; e.preventDefault(); };
  const end = () => { drawing = false; };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);
}
function clearSig() {
  const canvas = document.getElementById('sigpad');
  sigCtx.clearRect(0, 0, canvas.width, canvas.height);
  sigHasContent = false;
}

/* ---------- Postes ---------- */
function addPoste() {
  posteCount++;
  const id = posteCount;
  const div = document.createElement('div');
  div.className = 'poste-card';
  div.id = 'poste-' + id;
  div.innerHTML = `
    <div class="head"><b>Poste #${id}</b><button type="button" class="del" onclick="removePoste(${id})">Quitar</button></div>
    <div class="tipo-toggle">
      <label><input type="radio" name="tipo-${id}" value="MADERA" checked><span>Madera</span></label>
      <label><input type="radio" name="tipo-${id}" value="HORMIGON"><span>Hormigón</span></label>
      <label><input type="radio" name="tipo-${id}" value="FIBRA"><span>Fibra (PRFV)</span></label>
    </div>
    <div class="grid3">
      <div class="field"><label>Nº poste</label><input type="text" class="poste-num" autocomplete="off"></div>
      <div class="field"><label>Nº línea</label><input type="text" class="poste-linea" autocomplete="off"></div>
      <div class="field"><label>Altura aprox. (m)</label><input type="text" class="poste-altura" inputmode="decimal" autocomplete="off"></div>
    </div>
    <div class="field"><label>Dirección (nº / calle si cambia)</label>
      <input type="text" class="poste-direccion" placeholder="Se usa la dirección general si se deja vacío" autocomplete="street-address">
    </div>
    <div class="grid poste-safety-grid">
      <div class="field"><label>Estado tras la comprobación</label>
        <div class="yn"><label class="opt"><input type="radio" name="estado-${id}" value="BUENO" checked> Apto / bueno</label><label class="opt"><input type="radio" name="estado-${id}" value="MALO"> Defectuoso / no subir</label></div>
      </div>
      <div class="field"><label>¿Han cambiado las condiciones del poste?</label>
        <div class="yn"><label class="opt"><input type="radio" name="cambio-${id}" value="NO" checked> No</label><label class="opt"><input type="radio" name="cambio-${id}" value="SI"> Sí</label></div>
        <small class="help">Este dato solo se traslada al apartado de postes de madera.</small>
      </div>
    </div>
    <label class="confirm-row"><input type="checkbox" class="poste-confirm"> <span>He realizado las comprobaciones preventivas aplicables a este poste y el estado marcado refleja la revisión realizada.</span></label>
    <div class="field"><label>Justificación del medio de acceso (punto 6)</label>
      <textarea class="poste-just" oninput="this.dataset.edited=1">${defaultJustificacion()}</textarea>
    </div>`;
  document.getElementById('postes-list').appendChild(div);
  updatePosteCount();
}
function removePoste(id) {
  document.getElementById('poste-' + id).remove();
  updatePosteCount();
}
function updatePosteCount() {
  const n = document.querySelectorAll('.poste-card').length;
  document.getElementById('poste-count').textContent = n + (n === 1 ? ' poste añadido' : ' postes añadidos');
}

function getPostes() {
  const direccionGeneral = document.getElementById('direccion').value.trim();
  return [...document.querySelectorAll('.poste-card')].map(card => {
    const id = card.id.split('-')[1];
    const dirVal = card.querySelector('.poste-direccion').value.trim();
    return {
      tipo: card.querySelector(`input[name="tipo-${id}"]:checked`).value,
      estado: card.querySelector(`input[name="estado-${id}"]:checked`).value,
      cambio: card.querySelector(`input[name="cambio-${id}"]:checked`).value,
      confirmado: card.querySelector('.poste-confirm').checked,
      numPoste: card.querySelector('.poste-num').value.trim(),
      numLinea: card.querySelector('.poste-linea').value.trim(),
      altura: card.querySelector('.poste-altura').value.trim(),
      direccion: dirVal || direccionGeneral,
      justificacion: card.querySelector('.poste-just').value.trim()
    };
  });
}

/* ===================== GENERACIÓN DEL PDF ===================== */

function setStatus(msg, type = '') {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.dataset.type = type;
}

function formatDateES(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

function cleanPdfText(value) {
  return String(value ?? '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

function validateBeforeGenerate(postes) {
  const required = [
    ['empresa','Empresa'],['unidad','Unidad'],['fecha','Fecha'],['hora','Hora'],
    ['provincia','Provincia'],['poblacion','Población'],['direccion','Dirección'],['trabajo','Trabajo a realizar'],
    ['rp-nombre','Nombre del Recurso Preventivo'],['rp-nif','NIF / matrícula del Recurso Preventivo']
  ];
  for (const [id,label] of required) {
    if (!val(id).trim()) return `${label}: este dato es obligatorio.`;
  }
  const personas = getPersonas();
  if (!personas.length) return 'Añade al menos una persona trabajadora.';
  for (const p of personas) {
    if (!p.nombre.trim() || !p.categoria.trim()) return 'Completa nombre y categoría de todas las personas trabajadoras.';
  }
  if (!personas.some(p => p.rp === 'SI')) return 'Marca qué persona actúa como Recurso Preventivo (RP).';
  if (!postes.length) return 'Añade al menos un poste.';
  for (let i = 0; i < postes.length; i++) {
    const p = postes[i];
    if (!p.direccion) return `Poste #${i+1}: indica una dirección general o específica.`;
    if (!p.justificacion) return `Poste #${i+1}: falta la justificación del medio de acceso.`;
    if (!p.confirmado) return `Poste #${i+1}: confirma que has realizado las comprobaciones preventivas.`;
  }
  if (!sigHasContent) return 'La firma del Recurso Preventivo es obligatoria para generar el parte final.';
  if (!document.getElementById('confirmacion-final').checked) return 'Confirma que los datos reflejan la comprobación realizada antes del trabajo.';
  return '';
}
