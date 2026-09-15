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
let nextFieldId = 0;
let posteCount = 0;

/* ---------- Personas (máx 2, tal y como tiene el formulario original) ---------- */
function addPersona() {

  personaCount++;
  const id = personaCount;
  const div = document.createElement('div');
  div.className = 'persona-row';
  div.id = 'persona-' + id;
  div.innerHTML = `
    <button class="del" type="button" data-remove-person>Quitar</button>
    <div class="grid">
      <div class="field"><label>Nombre y apellidos</label><input type="text" class="p-nombre"></div>
      <div class="field"><label>Categoría</label><input type="text" class="p-categoria" placeholder="Ej. Técnico"></div>
    </div>
    <div class="grid3">
      <div class="field"><label>Formación adecuada</label>
        <div class="yn"><label class="opt"><input type="radio" name="p-form-${id}" value="SI">Sí</label><label class="opt"><input type="radio" name="p-form-${id}" value="NO">No</label></div>
      </div>
      <div class="field"><label>Conoce riesgos/medidas</label>
        <div class="yn"><label class="opt"><input type="radio" name="p-riesgo-${id}" value="SI">Sí</label><label class="opt"><input type="radio" name="p-riesgo-${id}" value="NO">No</label></div>
      </div>
      <div class="field"><label>Es RP</label>
        <div class="yn"><label class="opt"><input type="radio" name="p-rp-${id}" value="SI">Sí</label><label class="opt"><input type="radio" name="p-rp-${id}" value="NO">No</label></div>
      </div>
    </div>`;
  document.getElementById('personas-list').appendChild(div); labelFields();
}

function getPersonas() {
  return [...document.querySelectorAll('.persona-row')].map(row => ({
    nombre: row.querySelector('.p-nombre').value,
    categoria: row.querySelector('.p-categoria').value,
    formacion: row.querySelector('input[name^="p-form-"]:checked')?.value || '',
    riesgos: row.querySelector('input[name^="p-riesgo-"]:checked')?.value || '',
    rp: row.querySelector('input[name^="p-rp-"]:checked')?.value || ''
  }));
}

/* ---------- EPIs ---------- */
function renderEpiGrid() {
  const grid = document.getElementById('epi-grid');
  grid.innerHTML = EPI_LIST.map(e => `
    <label class="chk"><input type="checkbox" class="epi-check" data-key="${e.key}"> ${e.label}</label>
  `).join('');
}
function getEpis() {
  const out = {};
  document.querySelectorAll('.epi-check').forEach(c => { out[c.dataset.key] = c.checked; });
  return out;
}

/* ---------- Medio de acceso / sección 7 ---------- */
function onMedioChange() {
  document.querySelectorAll('.poste-card').forEach(card=>{
    const id=card.id.split('-')[1],pemp=radio('medio-'+id)==='PEMP';
    card.querySelector('.ladder-checks').hidden=pemp;
    card.querySelectorAll('.ladder-checks input').forEach(e=>e.disabled=pemp);
  });
}

function defaultJustificacion() { return ''; }

/* ---------- Firma (canvas) ---------- */
let sigCtx, sigHasContent = false;
let strokes = [], activeStroke = null;
function initSigPad() {
  const canvas = document.getElementById('sigpad');
  function redraw() {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    sigCtx = canvas.getContext('2d'); sigCtx.scale(dpr,dpr);
    sigCtx.strokeStyle='#172632'; sigCtx.lineWidth=2; sigCtx.lineCap='round'; sigCtx.lineJoin='round';
    for (const stroke of strokes) {
      sigCtx.beginPath(); stroke.forEach((p,i)=>sigCtx[i?'lineTo':'moveTo'](p.x*r.width,p.y*r.height)); sigCtx.stroke();
    }
    sigHasContent = strokes.some(s=>s.length>2 && s.some(p=>Math.hypot(p.x-s[0].x,p.y-s[0].y)>.015));
  }
  const pos=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0 || activeStroke)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);activeStroke=[pos(e)];strokes.push(activeStroke);});
  canvas.addEventListener('pointermove',e=>{if(!activeStroke)return;e.preventDefault();activeStroke.push(pos(e));redraw();});
  const end=()=>{activeStroke=null;redraw();};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
  new ResizeObserver(redraw).observe(canvas); redraw();
  canvas.redraw=redraw;
}
function clearSig(){strokes=[];activeStroke=null;document.getElementById('sigpad').redraw();}
function signatureData(){
  const c=document.getElementById('sigpad'),ctx=c.getContext('2d'),d=ctx.getImageData(0,0,c.width,c.height).data;
  let x0=c.width,y0=c.height,x1=0,y1=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const out=document.createElement('canvas');out.width=x1-x0+5;out.height=y1-y0+5;
  out.getContext('2d').drawImage(c,x0,y0,x1-x0+1,y1-y0+1,2,2,x1-x0+1,y1-y0+1);return out.toDataURL('image/png');
}

/* ---------- Postes ---------- */
function addPoste() {
  posteCount++;
  const id = posteCount;
  const div = document.createElement('div');
  div.className = 'poste-card';
  div.id = 'poste-' + id;
  div.innerHTML = `
    <div class="head"><b>Poste #${id}</b><button type="button" class="del" data-remove-poste="${id}">Quitar</button></div>
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
    <div class="wood-checks">${woodFields(id)}</div>
    ${accessFields(id)}
    <div class="grid poste-safety-grid">
      <div class="field"><label>Estado tras la comprobación</label>
        <div class="yn"><label class="opt"><input type="radio" name="estado-${id}" value="BUENO"> Apto / bueno</label><label class="opt"><input type="radio" name="estado-${id}" value="MALO"> Defectuoso / no subir</label></div>
      </div>
      <div class="field"><label>¿Han cambiado las condiciones del poste?</label>
        <div class="yn"><label class="opt"><input type="radio" name="cambio-${id}" value="NO"> No</label><label class="opt"><input type="radio" name="cambio-${id}" value="SI"> Sí</label></div>
        <small class="help">Este dato solo se traslada al apartado de postes de madera.</small>
      </div>
    </div>
    <label class="confirm-row"><input type="checkbox" class="poste-confirm"> <span>He realizado las comprobaciones preventivas aplicables a este poste y el estado marcado refleja la revisión realizada.</span></label>
    <div class="field"><label>Justificación del medio de acceso (punto 6)</label>
      <textarea class="poste-just" >${defaultJustificacion()}</textarea>
    </div>`;
  document.getElementById('postes-list').appendChild(div);
  updatePosteCount();
  labelFields();
}
function removePoste(id) {
  document.getElementById('poste-' + id).remove();
  updatePosteCount();
  labelFields();
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
      wood: Object.fromEntries(['1','2','3','4','5','6'].map(k=>[k,radio('wood-'+id+'-'+k)])),
      medio:radio('medio-'+id),
      sec7:Object.fromEntries([...['a','b','c','d','e','f','g','final'].map(k=>[k,radio('s7'+k+'-'+id)]),['obs',card.querySelector('.ladder-obs').value]]),
      tipo: card.querySelector(`input[name="tipo-${id}"]:checked`)?.value || '',
      estado: card.querySelector(`input[name="estado-${id}"]:checked`)?.value || '',
      cambio: card.querySelector(`input[name="cambio-${id}"]:checked`)?.value || '',
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
    .replace(/\u00A0/g, ' ');
}

function validateBeforeGenerate(postes) {
  document.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));
  const fail=(el,msg)=>{if(el){el.setAttribute('aria-invalid','true');el.scrollIntoView({block:'center'});el.focus({preventScroll:true});}return msg;};
  const required=[['nactuacion','Número de actuación'],['empresa','Empresa'],['unidad','Unidad'],['fecha','Fecha'],['hora','Hora'],['provincia','Provincia'],['poblacion','Población'],['central','Central'],['direccion','Dirección'],['trabajo','Trabajo a realizar']];
  for(const [id,label] of required)if(!val(id).trim())return fail(document.getElementById(id),label+': completa este campo.');
  for(const name of ['clima','mep1','mep2','mep3'])if(!radio(name))return fail(document.querySelector('[name="'+name+'"]'),'Responde: '+groupLabel(name));
  const rows=[...document.querySelectorAll('.persona-row')];
  if(!rows.length)return fail(document.querySelector('[data-add-person]'),'Añade al menos un técnico.');
  for(const [i,row] of rows.entries()) {
    for(const [sel,label] of [['.p-nombre','nombre'],['.p-categoria','categoría']])if(!row.querySelector(sel).value.trim())return fail(row.querySelector(sel),'Técnico '+(i+1)+': falta '+label+'.');
    for(const input of row.querySelectorAll('input[type=radio]'))if(!radio(input.name))return fail(input,'Técnico '+(i+1)+': responde '+groupLabel(input.name)+'.');
  }
  const personas=getPersonas(),rp=personas.filter(p=>p.rp==='SI');
  if(rp.length!==1)return fail(document.querySelector('[name^="p-rp-"]'),'Selecciona un técnico como RP responsable de firmar este parte.');
  for(const id of ['rp-nombre','rp-nif'])if(!val(id).trim())return fail(document.getElementById(id),'Completa la identificación del recurso preventivo.');
  if(val('rp-nombre').trim().toLocaleLowerCase()!==rp[0].nombre.trim().toLocaleLowerCase())return fail(document.getElementById('rp-nombre'),'El nombre del firmante debe coincidir con el técnico marcado como RP.');
  if(!document.querySelector('.epi-check:checked')&&!val('epi-otros').trim())return fail(document.querySelector('.epi-check'),'Indica los equipos de protección de la actividad.');
  if(!document.getElementById('epi-confirm').checked)return fail(document.getElementById('epi-confirm'),'Confirma la revisión de los equipos de protección.');
  if(postes.some(p=>p.medio==='ESCALERA') && radio('mep3')==='SI' && (!document.querySelector('[data-key="epiArnes"]').checked || !(document.querySelector('[data-key="epiLineaVida"]').checked || document.querySelector('[data-key="epiPertiga"]').checked)))return fail(document.querySelector('[data-key="epiArnes"]'),'Para declarar los EPI adecuados con escalera, indica arnés y línea de vida según el reverso del parte.');
  if(!postes.length)return fail(document.querySelector('[data-add-poste]'),'Añade al menos un poste.');
  const cards=[...document.querySelectorAll('.poste-card')];
  for(const [i,p] of postes.entries()) {
    const card=cards[i],prefix='Poste '+(i+1)+': ';
    if(!p.medio)return fail(card.querySelector('[name^="medio-"]'),prefix+'elige el medio de acceso.');
    if(p.medio==='ESCALERA')for(const k of ['a','b','c','d','e','f','g','final'])if(!p.sec7[k])return fail(card.querySelector('[name^="s7'+k+'-"]'),prefix+'responde la comprobación de escalera '+k+'.');
    if(p.medio==='ESCALERA' && ['a','b','c','d','e','f','g'].some(k=>p.sec7[k]==='NO') && p.sec7.final!=='NO')return fail(card.querySelector('[name^="s7final-"]'),prefix+'hay una comprobación negativa: el resultado de uso seguro debe ser No.');
    for(const [key,sel,label] of [['numPoste','.poste-num','número de poste'],['numLinea','.poste-linea','línea (escribe No aplica si corresponde)'],['altura','.poste-altura','altura de trabajo'],['direccion','.poste-direccion','dirección'],['justificacion','.poste-just','justificación del medio de acceso']])if(!p[key])return fail(card.querySelector(sel),prefix+'falta '+label+'.');
    if(!/^\d+([.,]\d+)?$/.test(p.altura)||Number(p.altura.replace(',','.'))<=0)return fail(card.querySelector('.poste-altura'),prefix+'indica una altura válida, mayor que cero.');
    for(const name of ['estado',...(p.tipo==='MADERA'?['cambio']:[])])if(!p[name])return fail(card.querySelector('[name^="'+name+'-"]'),prefix+'responde '+name+'.');
    if(p.tipo==='MADERA')for(const k of ['1','2','3','4','5','6'])if(!p.wood[k])return fail(card.querySelector('[name$="-'+k+'"]'),prefix+'falta la comprobación de madera '+k+'.');
    if(p.tipo==='MADERA' && p.estado==='BUENO' && Object.values(p.wood).includes('NO'))return fail(card.querySelector('[name^="estado-"]'),prefix+'hay comprobaciones deficientes. Revisa el estado del poste.');
    if(!p.confirmado)return fail(card.querySelector('.poste-confirm'),prefix+'confirma las comprobaciones realizadas.');
  }
  if(!sigHasContent)return fail(document.getElementById('sigpad'),'Falta la firma del recurso preventivo.');
  if(!document.getElementById('confirmacion-final').checked)return fail(document.getElementById('confirmacion-final'),'Confirma la revisión final antes de generar el PDF.');
  return '';
}

function dataUrlToBytes(dataUrl) {
  const base64 = String(dataUrl).split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function generarPDF() {
  const postes = getPostes();
  const validationError = validateBeforeGenerate(postes);
  if (validationError) {
    setStatus(validationError, 'error');

    return;
  }
  if (!window.PDFLib) {
    const msg = 'No se ha podido cargar el motor PDF. Comprueba la conexión y vuelve a intentarlo.';
    setStatus(msg, 'error');
    alert(msg);
    return;
  }

  const button=document.querySelector('.generate'); if(button.disabled)return; button.disabled=true;
  setStatus('Generando PDF…');
  try {
    const { PDFDocument, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const dataUrl = signatureData();
    const sigImg = await pdfDoc.embedPng(dataUrlToBytes(dataUrl));

    const general = {
      empresa: val('empresa'), unidad: val('unidad'), fecha: val('fecha'), hora: val('hora'),
      provincia: val('provincia'), poblacion: val('poblacion'), nactuacion: val('nactuacion'),
      central: val('central'), trabajo: val('trabajo'),
      clima: radio('clima'), medio: radio('medio'), personas: getPersonas(),
      epis: getEpis(), epiOtrosTxt: val('epi-otros'),
      mep1: radio('mep1'), mep2: radio('mep2'), mep3: radio('mep3'),
      obs9: val('obs9'), tel: val('tel112'), rpNombre: val('rp-nombre'), rpNif: val('rp-nif')
    };
    const textError=validatePdfCapacity(font,general,postes);
    if(textError){setStatus(textError,'error');return;}

    const [plantillaRes, reversoRes] = await Promise.all([fetch('/tecnicos/herramientas/parte-postes/plantilla.png'), fetch('/tecnicos/herramientas/parte-postes/reverso.png')]);
    if (!plantillaRes.ok || !reversoRes.ok) throw new Error('No se han podido cargar las plantillas del parte.');
    const plantillaImg = await pdfDoc.embedPng(await plantillaRes.arrayBuffer());
    const reversoImg = await pdfDoc.embedPng(await reversoRes.arrayBuffer());
    const PW = 595.32, PH = 841.92;

    const rp=general.personas.find(p=>p.rp==='SI');
    const others=general.personas.filter(p=>p!==rp);
    const groups=others.length ? others.map(p=>[rp,p]) : [[rp]];
    for (const poste of postes) for(const persons of groups) {
      const page = pdfDoc.addPage([PW, PH]);
      page.drawImage(plantillaImg, {x:0,y:0,width:PW,height:PH});
      fillParte(page, font, fontBold, {...general,personas:persons,medio:poste.medio,sec7:poste.sec7}, poste, sigImg);
      const back = pdfDoc.addPage([PW, PH]);
      back.drawImage(reversoImg, {x:0,y:0,width:PW,height:PH});
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fecha = general.fecha || 'sinfecha';
    a.href = url;
    a.download = `Partes_Postes_${fecha}_${postes.length}postes.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    const link=document.getElementById('download-pdf');if(link.dataset.url)URL.revokeObjectURL(link.dataset.url);link.href=url;link.dataset.url=url;link.download=a.download;link.hidden=false;
    setStatus(`PDF listo: ${postes.length * groups.length} partes, ${postes.length * groups.length * 2} páginas con anverso y reverso.`, 'ok');
    saveRememberedData();
  } catch (err) {
    console.error(err);
    const msg = 'No se ha podido generar el PDF. Revisa la conexión y vuelve a intentarlo.';
    setStatus(msg, 'error');
    alert(msg);
  } finally { button.disabled=false; }
}

function val(id) { return document.getElementById(id).value; }
function radio(name) { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; }

/* ---- marcar una casilla existente del formulario original con una X ---- */
function mark(page, fontBold, key) {
  const b = CHK[key];
  if (!b) return;
  const size = Math.max(5.5, b.h * 1.05);
  page.drawText('X', { x: b.x + b.w * 0.06, y: b.y + b.h * 0.08, size, font: fontBold });
}

function drawTxt(page, font, fontBold, spec, str, opts = {}) {
  if (!str) return;
  str = cleanPdfText(str);
  let size = opts.size || spec.size || 7;
  const f = opts.bold || spec.bold ? fontBold : font;
  if (spec.width) size=Math.min(size,spec.width/f.widthOfTextAtSize(str,1));
  if (spec.maxWidth) {
    wrapAndDraw(page, f, str, spec.x, spec.y, spec.maxWidth, size, spec.lineH || (size + 2));
  } else {
    page.drawText(String(str), { x: spec.x, y: spec.y, size, font: f });
  }
}

function wrapAndDraw(page, font, str, x, y, maxWidth, size, lineH) {
  const words = String(str).split(/\s+/).flatMap(word=>{
    const chunks=[];let chunk='';for(const char of word){if(font.widthOfTextAtSize(chunk+char,size)>maxWidth){chunks.push(chunk);chunk='';}chunk+=char;}if(chunk)chunks.push(chunk);return chunks;
  });
  let line = '', cy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      page.drawText(line, { x, y: cy, size, font });
      line = w; cy -= lineH;
    } else line = test;
  }
  if (line) page.drawText(line, { x, y: cy, size, font });
}

/* ---- rellenar UNA página (copia de la plantilla original) con los datos ---- */
function fillParte(page, font, fontBold, g, poste, sigImg) {
  // 1. INFORMACIÓN GENERAL
  mark(page, fontBold, poste.tipo === 'MADERA' ? 'tipoMadera' : poste.tipo === 'HORMIGON' ? 'tipoHormigon' : 'tipoFibra');
  drawTxt(page, font, fontBold, TXT.nPoste, poste.numPoste);
  drawTxt(page, font, fontBold, TXT.nLinea, poste.numLinea);
  drawTxt(page, font, fontBold, TXT.direccion, poste.direccion);
  drawTxt(page, font, fontBold, TXT.provincia, g.provincia);
  drawTxt(page, font, fontBold, TXT.poblacion, g.poblacion);
  drawTxt(page, font, fontBold, TXT.empresa, g.empresa);
  drawTxt(page, font, fontBold, TXT.unidad, g.unidad);
  drawTxt(page, font, fontBold, TXT.nactuacion, g.nactuacion);
  drawTxt(page, font, fontBold, TXT.fecha, formatDateES(g.fecha));
  drawTxt(page, font, fontBold, TXT.hora, g.hora);
  drawTxt(page, font, fontBold, TXT.central, g.central);
  drawTxt(page, font, fontBold, TXT.trabajo, g.trabajo);
  drawTxt(page, font, fontBold, TXT.altura, (poste.altura ? poste.altura + 'm' : ''));
  mark(page, fontBold, g.clima === 'NO' ? 'climaNO' : 'climaSI');

  // 2. PERSONAS
  const personas = g.personas || [];
  if (personas[0]) {
    drawTxt(page, font, fontBold, TXT.personaNombre1, personas[0].nombre);
    drawTxt(page, font, fontBold, TXT.personaCategoria1, personas[0].categoria);
    mark(page, fontBold, personas[0].formacion === 'NO' ? 'p1FormNO' : 'p1FormSI');
    mark(page, fontBold, personas[0].riesgos === 'NO' ? 'p1RiesNO' : 'p1RiesSI');
    if (personas[0].rp === 'SI') mark(page, fontBold, 'p1RP');
  }
  if (personas[1]) {
    drawTxt(page, font, fontBold, TXT.personaNombre2, personas[1].nombre);
    drawTxt(page, font, fontBold, TXT.personaCategoria2, personas[1].categoria);
    mark(page, fontBold, personas[1].formacion === 'NO' ? 'p2FormNO' : 'p2FormSI');
    mark(page, fontBold, personas[1].riesgos === 'NO' ? 'p2RiesNO' : 'p2RiesSI');
    if (personas[1].rp === 'SI') mark(page, fontBold, 'p2RP');
  }

  // 3/4/5 según tipo. Solo se marcan como conformes tras la confirmación explícita de cada poste.
  const apto = poste.estado !== 'MALO';
  if (poste.tipo === 'MADERA') {
    if(poste.wood['1']==='SI')mark(page,fontBold,'mad1');
    for(const k of ['2','3'])mark(page,fontBold,'mad'+k+poste.wood[k]);
    for(const k of ['4','5','6'])mark(page,fontBold,'mad'+k+(poste.wood[k]==='SI'?'Bueno':'Malo'));
    mark(page,fontBold,apto?'madEstBueno':'madEstMalo');
    mark(page, fontBold, poste.cambio === 'SI' ? 'madCambioSI' : 'madCambioNO');
    mark(page, fontBold, g.medio === 'PEMP' ? 'madA_PEMP' : 'madB_ESC');
  } else if (poste.tipo === 'HORMIGON') {
    mark(page, fontBold, apto ? 'horEstBueno' : 'horEstMalo');
    mark(page, fontBold, g.medio === 'PEMP' ? 'horA_PEMP' : 'horB_ESC');
  } else {
    mark(page, fontBold, apto ? 'fibEstBueno' : 'fibEstMalo');
    mark(page, fontBold, g.medio === 'PEMP' ? 'fibA_PEMP' : 'fibB_ESC');
  }

  // 6. Justificación
  drawTxt(page, font, fontBold, TXT.justificacion, poste.justificacion);

  // 7. Check escalera (solo si el medio de la instalación es Escalera; si es PEMP, N/A en todo)
  const s7keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  if (g.medio === 'PEMP') {
    s7keys.forEach(k => mark(page, fontBold, 's7' + k + 'NA'));

  } else {
    s7keys.forEach(k => mark(page, fontBold, 's7' + k + g.sec7[k]));
    drawTxt(page, font, fontBold, TXT.sec7obs, g.sec7.obs);
    mark(page, fontBold, g.sec7.final === 'NO' ? 's7FinalNO' : 's7FinalSI');
  }

  // 8. EPIs
  EPI_LIST.forEach(e => { if (g.epis[e.key]) mark(page, fontBold, e.key); });
  if (g.epiOtrosTxt) {
    mark(page, fontBold, 'epiOtros');
    drawTxt(page, font, fontBold, TXT.epiOtrosTxt, g.epiOtrosTxt);
  }

  // 9. Observaciones
  mark(page, fontBold, g.mep1 === 'NO' ? 'mep1NO' : 'mep1SI');
  mark(page, fontBold, g.mep2 === 'NO' ? 'mep2NO' : 'mep2SI');
  mark(page, fontBold, g.mep3 === 'NO' ? 'mep3NO' : 'mep3SI');
  drawTxt(page, font, fontBold, TXT.obs9, g.obs9);

  // 10. Teléfono
  drawTxt(page, font, fontBold, TXT.telefono, g.tel || '112');

  // Firma
  const fechaTxt = formatDateES(g.fecha);
  page.drawRectangle({x:54,y:65,width:320,height:9,color:PDFLib.rgb(1,1,1)});
  drawTxt(page, font, fontBold, TXT.firmaLinea, `En ${g.poblacion || ''}, a ${fechaTxt}`);
  drawTxt(page, font, fontBold, TXT.rpNombre, g.rpNombre);
  drawTxt(page, font, fontBold, TXT.rpNif, g.rpNif);
  if (sigImg) {
    const dims = sigImg.scale(1);
    const box = TXT.firmaImgBox;
    const scale = Math.min(box.w / dims.width, box.h / dims.height);
    page.drawImage(sigImg, {
      x: box.x, y: box.y,
      width: dims.width * scale, height: dims.height * scale
    });
  }
}

/* ---------- Datos recordados en este dispositivo ---------- */
const REMEMBER_KEY = 'forofibra_parte_postes_v1';
const REMEMBER_IDS = ['empresa','unidad','rp-nombre','rp-nif'];
function saveRememberedData() {
  const toggle = document.getElementById('recordar-datos');
  if (!toggle) return;
  if (!toggle.checked) { try {localStorage.removeItem(REMEMBER_KEY);} catch(_) {} return; }
  const data = {remember:true};
  REMEMBER_IDS.forEach(id => data[id] = val(id));
  const first = document.querySelector('.persona-row input[name^="p-rp-"][value="SI"]:checked')?.closest('.persona-row') || document.querySelector('.persona-row');
  if (first) { data.personaNombre = first.querySelector('.p-nombre').value; data.personaCategoria = first.querySelector('.p-categoria').value; }
  try { localStorage.setItem(REMEMBER_KEY, JSON.stringify(data)); } catch (_) { setStatus('El navegador no permite recordar datos. Puedes seguir generando partes.'); }
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


const WIDTHS={nPoste:39,nLinea:32,direccion:185,provincia:119,poblacion:52,empresa:255,unidad:47,nactuacion:30,fecha:49,hora:46,central:155,trabajo:205,altura:23,personaNombre1:241,personaNombre2:241,personaCategoria1:101,personaCategoria2:101,rpNombre:248,rpNif:266,firmaLinea:300,sec7obs:300,epiOtrosTxt:85,telefono:110};
for(const [key,width] of Object.entries(WIDTHS)){TXT[key].width=width;delete TXT[key].maxWidth;}
for(const key of Object.keys(WIDTHS))if(key!=='firmaLinea')TXT[key].y+=1.4;
const WOOD_LABELS=['Cable, riostras, soportes, herrajes y tubos revisados','Longitud enterrada conforme (botón / placa)','Terreno escarbado 3 cm e inspección visual conforme','Al empujarlo no se mueve ni cruje','Percusión: sonido claro, madera en buen estado','Punzón: opone resistencia, sin descomposición'];
function woodFields(id){return WOOD_LABELS.map((label,i)=>`<div class="field"><label>${i+1}. ${label}</label><div class="yn"><label class="opt"><input type="radio" name="wood-${id}-${i+1}" value="SI">Sí</label><label class="opt"><input type="radio" name="wood-${id}-${i+1}" value="NO">No</label></div></div>`).join('');}
const LADDER_LABELS=['Revisión de escalera vigente y acreditada','Escalera en buen estado, sin defectos','Terreno firme o estabilidad asegurada con zapatas','Suelo despejado y apoyo estable','Inclinación correcta (aprox. 75°)','Longitud adecuada','Zona de trabajo señalizada','¿Se puede usar la escalera con seguridad?'];
function accessFields(id){return `<div class="field"><label>Medio de acceso de este poste</label><div class="medio-toggle"><label><input type="radio" name="medio-${id}" value="ESCALERA">Escalera con patas estabilizadoras</label><label><input type="radio" name="medio-${id}" value="PEMP">PEMP</label></div></div><div class="ladder-checks"><h3>Comprobación de la escalera</h3>${LADDER_LABELS.map((label,i)=>`<div class="field"><label>${label}</label><div class="yn">${['SI','NO',...(i===2?['NA']:[])].map(v=>`<label class="opt"><input type="radio" name="s7${i===7?'final':'abcdefg'[i]}-${id}" value="${v}">${v==='SI'?'Sí':v==='NO'?'No':'No aplica'}</label>`).join('')}</div></div>`).join('')}<div class="field"><label>Otras circunstancias que hagan inseguro el trabajo</label><input type="text" class="ladder-obs" maxlength="130" placeholder="Indica cualquier incidencia"></div></div>`;}
function groupLabel(name){const e=document.querySelector('[name="'+name+'"]');return e?.closest('.field,.sec7-row')?.querySelector('label,.txt')?.textContent || name;}
function validatePdfCapacity(font,g,postes){
  const fields=[];
  for(const key of ['empresa','unidad','provincia','poblacion','nactuacion','central','trabajo'])fields.push([document.getElementById(key),TXT[key].width,1]);
  for(const row of document.querySelectorAll('.persona-row')){fields.push([row.querySelector('.p-nombre'),241,1],[row.querySelector('.p-categoria'),101,1]);}
  fields.push([document.getElementById('rp-nombre'),248,1],[document.getElementById('rp-nif'),266,1],[document.getElementById('obs9'),150,2],[document.getElementById('epi-otros'),85,1],[document.getElementById('tel112'),110,1]);
  for(const card of document.querySelectorAll('.poste-card')){
    for(const [sel,width,lines] of [['.poste-num',39,1],['.poste-linea',32,1],['.poste-altura',23,1],['.poste-just',500,3],['.ladder-obs',300,1]])fields.push([card.querySelector(sel),width,lines]);
    fields.push([card.querySelector('.poste-direccion').value.trim()?card.querySelector('.poste-direccion'):document.getElementById('direccion'),185,1]);
  }
  for(const [el,width,lines] of fields){
    const value=el.value.trim();
    // Reject unsupported glyphs and unreadable shrinking instead of silently losing text.
    let encoded=true;try{font.encodeText(value);}catch(_){encoded=false;}
    let count=1,line='';
    if(encoded && lines>1)for(const word of value.split(/\s+/)){const test=line?line+' '+word:word;if(font.widthOfTextAtSize(test,7)>width){count++;line=word;}else line=test;}
    if(!encoded || count>lines || font.widthOfTextAtSize(value,lines===1?5:7)>width*lines){el.setAttribute('aria-invalid','true');el.scrollIntoView({block:'center'});el.focus({preventScroll:true});return (el.labels?.[0]?.textContent||'Texto')+': '+(!encoded?'contiene caracteres que no admite el formulario.':'abrevia el texto para que quepa de forma legible en el formulario oficial.');}
  }
  return '';
}
function labelFields(){
  document.querySelectorAll('.field').forEach((field,i)=>{const label=field.querySelector('label');const input=field.querySelector('input:not([type=radio]),textarea,select');if(label&&input){if(!input.id)input.id='field-'+(++nextFieldId);label.htmlFor=input.id;}});
  document.querySelectorAll('input[type=text]').forEach(e=>{if(!e.maxLength||e.maxLength<0)e.maxLength=80;});
  document.querySelectorAll('.poste-just').forEach(e=>e.maxLength=300);
}
function syncPoste(card){const wood=card.querySelector('[name^="tipo-"]:checked')?.value==='MADERA';card.querySelector('.wood-checks').hidden=!wood;card.querySelector('[name^="cambio-"]').closest('.field').hidden=!wood;}
window.addEventListener('DOMContentLoaded',()=>{
  renderEpiGrid();addPersona();initSigPad();addPoste();labelFields();
  const now=new Date();document.getElementById('fecha').value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  document.getElementById('hora').value=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  restoreRememberedData();onMedioChange();
  document.querySelector('[data-add-person]').addEventListener('click',addPersona);
  document.querySelector('[data-add-poste]').addEventListener('click',addPoste);
  document.querySelector('[data-clear-signature]').addEventListener('click',clearSig);
  document.querySelector('.generate').addEventListener('click',generarPDF);
  document.addEventListener('click',e=>{if(e.target.matches('[data-remove-person]'))e.target.closest('.persona-row').remove();if(e.target.matches('[data-remove-poste]'))removePoste(e.target.dataset.removePoste);});
  document.addEventListener('change',e=>{
    if(e.target.name?.startsWith('medio-'))onMedioChange();
    if(e.target.name?.startsWith('tipo-'))syncPoste(e.target.closest('.poste-card'));
    if(e.target.name?.startsWith('p-rp-')&&e.target.value==='SI')document.getElementById('rp-nombre').value=e.target.closest('.persona-row').querySelector('.p-nombre').value;
    if(e.target.id==='recordar-datos')saveRememberedData();
  });
  document.addEventListener('input',e=>{e.target.removeAttribute('aria-invalid');});
});
