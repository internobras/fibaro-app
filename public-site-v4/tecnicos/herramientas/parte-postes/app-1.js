/* ===================== Partes de Postes — lógica de la app =====================
   Todo se ejecuta en el navegador. No se sube ni se guarda nada en ningún servidor.
   El PDF de salida usa el formulario ORIGINAL de Telefónica (plantilla.pdf) como
   página de fondo en cada parte; aquí solo se superponen textos y marcas de check
   en las coordenadas exactas del documento original. No se redibuja nada del
   formulario en sí.
================================================================================ */

const EPI_LIST = [
  { key: 'epiCasco', label: 'CASCO CON SUJECIÓN FACIAL Y/O BARBUQUEJO' },
  { key: 'epiGuantes', label: 'GUANTES CONTRA RIESGOS MECÁNICOS' },
  { key: 'epiGafas', label: 'GAFAS DE SEGURIDAD' },
  { key: 'epiBotas', label: 'BOTAS DE SEGURIDAD' },
  { key: 'epiChaleco', label: 'CHALECO/ROPA ALTA VISIBILIDAD' },
  { key: 'epiArnes', label: 'ARNÉS ANTICAÍDAS' },
  { key: 'epiEquipoAmarre', label: 'EQUIPO DE AMARRE DE POSICIONAMIENTO' },
  { key: 'epiLineaVida', label: 'LÍNEA DE VIDA + DISPOSITIVO DESLIZANTE' },
  { key: 'epiDobleCabo', label: 'DOBLE CABO DE ANCLAJE' },
  { key: 'epiPertiga', label: 'PÉRTIGA + LÍNEA DE VIDA + DISPOSITIVO DESLIZANTE' },
  { key: 'epiPuntoAnclaje', label: 'PUNTO DE ANCLAJE MÓVIL (aro de cinta / bandola horca)' }
];

/* Coordenadas EXACTAS (en puntos PDF, origen abajo-izquierda) de cada casilla
   del formulario original "o-39825-3.pdf". Extraídas directamente del PDF. */
const CHK = {
  tipoMadera: {x:113.42, y:748.66, w:5.76, h:5.76},
  tipoHormigon: {x:202.37, y:748.66, w:5.76, h:5.76},
  tipoFibra: {x:302.59, y:748.66, w:5.76, h:5.76},
  climaSI: {x:327.67, y:719.98, w:5.76, h:5.76},
  climaNO: {x:350.11, y:719.98, w:5.76, h:5.76},
  p1FormSI: {x:425.62, y:672.1, w:5.76, h:5.76},
  p1FormNO: {x:452.14, y:672.1, w:5.76, h:5.76},
  p1RiesSI: {x:486.96, y:672.1, w:5.76, h:5.76},
  p1RiesNO: {x:528.36, y:672.1, w:5.76, h:5.76},
  p1RP: {x:553.08, y:672.1, w:5.76, h:5.76},
  p2FormSI: {x:425.62, y:662.62, w:5.76, h:5.76},
  p2FormNO: {x:452.14, y:662.62, w:5.76, h:5.76},
  p2RiesSI: {x:486.96, y:662.62, w:5.76, h:5.76},
  p2RiesNO: {x:528.36, y:662.62, w:5.76, h:5.76},
  p2RP: {x:553.08, y:662.62, w:5.76, h:5.76},
  mad1: {x:507.36, y:627.94, w:5.76, h:5.76},
  mad2SI: {x:119.42, y:609.34, w:5.76, h:5.76},
  mad2NO: {x:143.78, y:609.34, w:5.76, h:5.76},
  mad3SI: {x:449.26, y:599.86, w:5.76, h:5.76},
  mad3NO: {x:473.62, y:599.86, w:5.78, h:5.76},
  mad4Bueno: {x:139.1, y:582.22, w:5.76, h:5.76},
  mad4Malo: {x:252.89, y:582.22, w:5.76, h:5.76},
  mad5Bueno: {x:193.49, y:564.55, w:5.76, h:5.76},
  mad5Malo: {x:393.1, y:564.55, w:5.76, h:5.76},
  mad6Bueno: {x:199.25, y:546.07, w:5.76, h:5.76},
  mad6Malo: {x:483.24, y:546.07, w:5.76, h:5.76},
  madEstBueno: {x:341.83, y:516.67, w:6.96, h:6.96},
  madEstMalo: {x:485.76, y:516.67, w:6.96, h:6.96},
  madCambioSI: {x:68.54, y:497.47, w:5.76, h:5.76},
  madCambioNO: {x:90.86, y:497.47, w:5.76, h:5.76},
  madA_PEMP: {x:346.63, y:485.23, w:5.76, h:5.76},
  madB_ESC: {x:545.28, y:485.23, w:5.76, h:5.76},
  madC_ESCexc: {x:460.54, y:474.0, w:5.76, h:5.76},
  madD_TREP: {x:547.92, y:473.71, w:5.76, h:5.76},
  horEstBueno: {x:326.59, y:448.51, w:6.96, h:6.96},
  horEstMalo: {x:450.58, y:448.51, w:6.96, h:6.96},
  horA_PEMP: {x:330.67, y:438.07, w:5.76, h:5.76},
  horB_ESC: {x:504.84, y:438.07, w:5.76, h:5.76},
  horC_ESCexc: {x:454.18, y:428.95, w:5.76, h:5.76},
  horD_ESTRIBOS: {x:525.36, y:428.95, w:5.76, h:5.76},
  fibEstBueno: {x:326.59, y:403.75, w:6.96, h:6.96},
  fibEstMalo: {x:452.74, y:403.75, w:6.96, h:6.96},
  fibA_PEMP: {x:238.61, y:393.17, w:5.76, h:5.76},
  fibB_ESC: {x:461.02, y:393.17, w:5.76, h:5.76},
  fibC_ESCexc: {x:354.19, y:384.17, w:5.76, h:5.76},
  fibD_HERR: {x:528.0, y:384.17, w:5.76, h:5.76},
  s7aSI: {x:518.04, y:295.73, w:4.56, h:4.56},
  s7aNO: {x:535.8, y:295.73, w:4.56, h:4.56},
  s7aNA: {x:554.28, y:295.73, w:4.56, h:4.56},
  s7bSI: {x:518.04, y:287.33, w:4.56, h:4.56},
  s7bNO: {x:535.8, y:287.33, w:4.56, h:4.56},
  s7bNA: {x:554.28, y:287.33, w:4.56, h:4.56},
  s7cSI: {x:518.04, y:278.93, w:4.56, h:4.56},
  s7cNO: {x:535.8, y:278.93, w:4.56, h:4.56},
  s7cNA: {x:554.28, y:278.93, w:4.56, h:4.56},
  s7dSI: {x:518.04, y:270.53, w:4.56, h:4.56},
  s7dNO: {x:535.8, y:270.53, w:4.56, h:4.56},
  s7dNA: {x:554.28, y:270.53, w:4.56, h:4.56},
  s7eSI: {x:518.04, y:262.13, w:4.56, h:4.56},
  s7eNO: {x:535.8, y:262.13, w:4.56, h:4.56},
  s7eNA: {x:554.28, y:262.13, w:4.56, h:4.56},
  s7fSI: {x:518.04, y:253.73, w:4.56, h:4.56},
  s7fNO: {x:535.8, y:253.73, w:4.56, h:4.56},
  s7fNA: {x:554.28, y:253.73, w:4.56, h:4.56},
  s7gSI: {x:518.04, y:245.33, w:4.56, h:4.56},
  s7gNO: {x:535.8, y:245.33, w:4.56, h:4.56},
  s7gNA: {x:554.28, y:245.33, w:4.56, h:4.56},
  s7FinalSI: {x:459.82, y:206.66, w:8.04, h:8.04},
  s7FinalNO: {x:491.16, y:206.66, w:8.04, h:8.04},
  epiCasco: {x:51.86, y:182.3, w:4.56, h:4.56},
  epiChaleco: {x:221.21, y:182.3, w:4.56, h:4.56},
  epiDobleCabo: {x:375.94, y:182.3, w:4.56, h:4.56},
  epiPertiga: {x:375.94, y:173.78, w:4.56, h:4.56},
  epiGuantes: {x:51.86, y:173.42, w:4.56, h:4.56},
  epiArnes: {x:221.21, y:173.42, w:4.56, h:4.56},
  epiPuntoAnclaje: {x:375.94, y:164.3, w:4.56, h:4.56},
  epiGafas: {x:51.86, y:163.94, w:4.56, h:4.56},
  epiEquipoAmarre: {x:221.21, y:163.94, w:4.56, h:4.56},
  epiBotas: {x:51.86, y:155.18, w:4.56, h:4.56},
  epiOtros: {x:375.94, y:155.18, w:4.56, h:4.56},
  epiLineaVida: {x:221.21, y:154.7, w:4.56, h:4.56},
  mep1SI: {x:253.85, y:132.02, w:4.56, h:4.56},
  mep1NO: {x:274.75, y:132.02, w:4.56, h:4.56},
  mep2SI: {x:295.51, y:125.06, w:4.56, h:4.56},
  mep2NO: {x:316.39, y:125.06, w:4.56, h:4.56},
  mep3SI: {x:291.55, y:117.26, w:4.56, h:4.56},
  mep3NO: {x:312.43, y:117.26, w:4.56, h:4.56}
};

/* Coordenadas de texto libre (x = inicio de escritura, y = línea base) */
const TXT = {
  nPoste: {x:444, y:747.5}, nLinea: {x:527, y:747.5},
  direccion: {x:100, y:738.0}, provincia: {x:336, y:738.0}, poblacion: {x:509, y:738.0},
  empresa: {x:94, y:728.4}, unidad: {x:419, y:728.4}, nactuacion: {x:533, y:728.4},
  fecha: {x:85, y:718.8}, hora: {x:169, y:718.8}, central: {x:404, y:718.8},
  trabajo: {x:136, y:709.4, maxWidth: 280}, altura: {x:539, y:709.4, size:6},
  personaNombre1: {x:57, y:671.0}, personaCategoria1: {x:305, y:671.0},
  personaNombre2: {x:57, y:661.4}, personaCategoria2: {x:305, y:661.4},
  justificacion: {x:57, y:343, maxWidth: 500, lineH: 9},
  sec7obs: {x:104, y:235.8, maxWidth: 300},
  epiOtrosTxt: {x:474, y:154.0, maxWidth: 85, size:6.2},
  obs9: {x:401, y:126.2, maxWidth: 150, size:6.5},
  telefono: {x:440, y:92.0, size:9, bold:true},
  firmaLinea: {x:65, y:68.0, size:7.2},
  rpNombre: {x:126, y:57.7, size:7.2},
  rpNif: {x:108, y:48.3, size:7.2},
  firmaImgBox: {x:410, y:48, w:130, h:26}
};

let personaCount = 0;
let posteCount = 0;

/* ---------- Personas (máx 2, tal y como tiene el formulario original) ---------- */
function addPersona() {
  if (document.querySelectorAll('.persona-row').length >= 2) {
    alert('El formulario original solo tiene 2 filas para personas trabajadoras.');
    return;
  }
  personaCount++;
  const id = personaCount;
  const div = document.createElement('div');
  div.className = 'persona-row';
  div.id = 'persona-' + id;
  div.innerHTML = `
    <button class="del" onclick="document.getElementById('persona-${id}').remove()">Quitar</button>
    <div class="grid">
      <div class="field"><label>Nombre y apellidos</label><input type="text" class="p-nombre"></div>
      <div class="field"><label>Categoría</label><input type="text" class="p-categoria" placeholder="Ej. Técnico"></div>
    </div>
    <div class="grid3">
      <div class="field"><label>Formación adecuada</label>
        <div class="yn"><label class="opt"><input type="radio" name="p-form-${id}" value="SI" checked>Sí</label><label class="opt"><input type="radio" name="p-form-${id}" value="NO">No</label></div>
      </div>
      <div class="field"><label>Conoce riesgos/medidas</label>
        <div class="yn"><label class="opt"><input type="radio" name="p-riesgo-${id}" value="SI" checked>Sí</label><label class="opt"><input type="radio" name="p-riesgo-${id}" value="NO">No</label></div>
      </div>
      <div class="field"><label>Es RP</label>
        <div class="yn"><label class="opt"><input type="radio" name="p-rp-${id}" value="SI">Sí</label><label class="opt"><input type="radio" name="p-rp-${id}" value="NO" checked>No</label></div>
      </div>
    </div>`;
  document.getElementById('personas-list').appendChild(div);
}

function getPersonas() {
  return [...document.querySelectorAll('.persona-row')].map(row => ({
    nombre: row.querySelector('.p-nombre').value,
    categoria: row.querySelector('.p-categoria').value,
    formacion: row.querySelector('input[name^="p-form-"]:checked').value,
    riesgos: row.querySelector('input[name^="p-riesgo-"]:checked').value,
    rp: row.querySelector('input[name^="p-rp-"]:checked').value
  }));
}

/* ---------- EPIs ---------- */
function renderEpiGrid() {
  const grid = document.getElementById('epi-grid');
  grid.innerHTML = EPI_LIST.map(e => `
    <label class="chk"><input type="checkbox" class="epi-check" data-key="${e.key}" checked> ${e.label}</label>
  `).join('');
}
function getEpis() {
  const out = {};
  document.querySelectorAll('.epi-check').forEach(c => { out[c.dataset.key] = c.checked; });
  return out;
}

/* ---------- Medio de acceso / sección 7 ---------- */
function onMedioChange() {
  const medio = document.querySelector('input[name="medio"]:checked').value;
  const badge = document.getElementById('sec7-badge');
  const body = document.getElementById('sec7-body');
  if (medio === 'PEMP') {
    badge.textContent = 'No aplica (uso PEMP)';
    badge.classList.add('off');
    body.style.opacity = '0.35';
    body.style.pointerEvents = 'none';
  } else {
    badge.textContent = 'Aplica';
    badge.classList.remove('off');
    body.style.opacity = '1';
    body.style.pointerEvents = 'auto';
  }
  document.querySelectorAll('.poste-just').forEach(t => {
    if (!t.dataset.edited) t.value = defaultJustificacion();
  });
}

function defaultJustificacion() {
  const medio = document.querySelector('input[name="medio"]:checked').value;
  return medio === 'ESCALERA'
    ? 'Se utiliza escalera de exterior con patas extensibles estabilizadoras por ser el medio de acceso adecuado segun el orden de eleccion establecido, sin ejercer esfuerzo sobre el poste.'
    : 'Se utiliza Plataforma Elevadora de Personal (PEMP) por ser el medio de acceso de primera eleccion segun el orden de eleccion establecido.';
}
