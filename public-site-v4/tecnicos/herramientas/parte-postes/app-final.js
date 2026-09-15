(() => {
  'use strict';

  const MEDIA = {
    PEMP: 'PEMP',
    ESCALERA: 'Escalera con patas estabilizadoras',
    ESCALERA_EXC: 'Escalera exterior - uso excepcional',
    EXCEPCIONAL_D: 'Medio excepcional específico'
  };

  accessFields = function(id) {
    return `<div class="field"><label>Medio de acceso de este poste</label>
      <div class="medio-toggle medios-cuatro">
        <label><input type="radio" name="medio-${id}" value="PEMP"><span>PEMP</span></label>
        <label><input type="radio" name="medio-${id}" value="ESCALERA"><span>Escalera con patas estabilizadoras</span></label>
        <label><input type="radio" name="medio-${id}" value="ESCALERA_EXC"><span>Escalera exterior - uso excepcional</span></label>
        <label><input type="radio" name="medio-${id}" value="EXCEPCIONAL_D"><span class="medio-d-label">Medio excepcional específico</span></label>
      </div>
      <small class="help medio-ayuda">Los medios excepcionales deben justificarse en el punto 6.</small>
    </div>
    <div class="ladder-checks"><h3>Comprobación de la escalera</h3>
      ${LADDER_LABELS.map((label, i) => {
        const key = i === 7 ? 'final' : 'abcdefg'[i];
        const values = i === 7 ? ['SI', 'NO'] : ['SI', 'NO', 'NA'];
        return `<div class="field"><label>${label}</label><div class="yn">${values.map(v => `<label class="opt"><input type="radio" name="s7${key}-${id}" value="${v}">${v === 'SI' ? 'Sí' : v === 'NO' ? 'No' : 'No aplica'}</label>`).join('')}</div></div>`;
      }).join('')}
      <div class="field"><label>Otras circunstancias que hagan inseguro el trabajo</label><input type="text" class="ladder-obs" maxlength="130" placeholder="Indica cualquier incidencia"></div>
    </div>`;
  };

  TXT.firmaImgBox = { x: 414, y: 50, w: 118, h: 21 };

  function isLadder(medio) {
    return medio === 'ESCALERA' || medio === 'ESCALERA_EXC';
  }

  function syncMediumLabel(card) {
    if (!card) return;
    const tipo = card.querySelector('input[name^="tipo-"]:checked')?.value || 'MADERA';
    const span = card.querySelector('.medio-d-label');
    if (!span) return;
    span.textContent = tipo === 'MADERA' ? 'Trepadores (uso excepcional)'
      : tipo === 'HORMIGON' ? 'Estribos (uso excepcional)'
      : 'Herramienta especial / peldaños (uso excepcional)';
  }

  onMedioChange = function() {
    document.querySelectorAll('.poste-card').forEach(card => {
      const id = card.id.split('-')[1];
      const medio = radio('medio-' + id);
      const show = isLadder(medio);
      const block = card.querySelector('.ladder-checks');
      if (block) block.hidden = !show;
      card.querySelectorAll('.ladder-checks input').forEach(el => { el.disabled = !show; });
      syncMediumLabel(card);
    });
  };

  const originalSyncPoste = syncPoste;
  syncPoste = function(card) {
    originalSyncPoste(card);
    syncMediumLabel(card);
  };

  const originalValidate = validateBeforeGenerate;
  validateBeforeGenerate = function(postes) {
    const mapped = postes.map(p => ({
      ...p,
      medio: p.medio === 'ESCALERA_EXC' ? 'ESCALERA' : p.medio === 'EXCEPCIONAL_D' ? 'PEMP' : p.medio
    }));
    const base = originalValidate(mapped);
    if (base) return base;

    const cards = [...document.querySelectorAll('.poste-card')];
    for (const [i, p] of postes.entries()) {
      if ((p.medio === 'ESCALERA_EXC' || p.medio === 'EXCEPCIONAL_D') && p.justificacion.trim().length < 20) {
        const el = cards[i]?.querySelector('.poste-just');
        if (el) {
          el.setAttribute('aria-invalid', 'true');
          el.scrollIntoView({ block: 'center' });
          el.focus({ preventScroll: true });
        }
        return `Poste ${i + 1}: justifica con algo más de detalle el uso del medio excepcional.`;
      }
    }
    return '';
  };

  const originalFillParte = fillParte;
  fillParte = function(page, font, fontBold, g, poste, sigImg) {
    const medioReal = g.medio;
    if (medioReal !== 'ESCALERA_EXC' && medioReal !== 'EXCEPCIONAL_D') {
      return originalFillParte(page, font, fontBold, g, poste, sigImg);
    }

    const tipo = poste.tipo;
    const bKey = tipo === 'MADERA' ? 'madB_ESC' : tipo === 'HORMIGON' ? 'horB_ESC' : 'fibB_ESC';
    const aKey = tipo === 'MADERA' ? 'madA_PEMP' : tipo === 'HORMIGON' ? 'horA_PEMP' : 'fibA_PEMP';
    const cKey = tipo === 'MADERA' ? 'madC_ESCexc' : tipo === 'HORMIGON' ? 'horC_ESCexc' : 'fibC_ESCexc';
    const dKey = tipo === 'MADERA' ? 'madD_TREP' : tipo === 'HORMIGON' ? 'horD_ESTRIBOS' : 'fibD_HERR';

    const oldB = CHK[bKey];
    const oldA = CHK[aKey];
    try {
      if (medioReal === 'ESCALERA_EXC') {
        CHK[bKey] = CHK[cKey];
        return originalFillParte(page, font, fontBold, { ...g, medio: 'ESCALERA' }, poste, sigImg);
      }
      CHK[aKey] = CHK[dKey];
      return originalFillParte(page, font, fontBold, { ...g, medio: 'PEMP' }, poste, sigImg);
    } finally {
      CHK[bKey] = oldB;
      CHK[aKey] = oldA;
    }
  };

  function syncRpName() {
    const rpName = document.getElementById('rp-nombre');
    if (!rpName) return;
    const selected = document.querySelector('.persona-row input[name^="p-rp-"][value="SI"]:checked')?.closest('.persona-row');
    rpName.value = selected ? selected.querySelector('.p-nombre').value.trim() : '';
    rpName.removeAttribute('aria-invalid');
  }

  const originalGenerarPDF = generarPDF;
  generarPDF = async function() {
    const postes = getPostes();
    const personas = getPersonas();
    const rp = personas.find(p => p.rp === 'SI');
    const otros = personas.filter(p => p !== rp);
    const partes = postes.length * (otros.length || 1);
    const fecha = val('fecha') || 'sinfecha';
    const filename = `Partes_Postes_${fecha}_${partes}parte${partes === 1 ? '' : 's'}.pdf`;

    const nativeClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function() {
      if (this.download && this.download.startsWith('Partes_Postes_')) this.download = filename;
      return nativeClick.call(this);
    };
    try {
      await originalGenerarPDF();
    } finally {
      HTMLAnchorElement.prototype.click = nativeClick;
    }
    const link = document.getElementById('download-pdf');
    if (link && !link.hidden && link.href) link.download = filename;
  };

  window.addEventListener('DOMContentLoaded', () => {
    const rpName = document.getElementById('rp-nombre');
    if (rpName) {
      rpName.readOnly = true;
      rpName.placeholder = 'Se completa al seleccionar el RP';
      rpName.setAttribute('aria-readonly', 'true');
    }
    syncRpName();
    document.querySelectorAll('.poste-card').forEach(syncMediumLabel);
    onMedioChange();

    document.addEventListener('change', e => {
      if (e.target.name?.startsWith('p-rp-')) syncRpName();
      if (e.target.name?.startsWith('tipo-')) syncMediumLabel(e.target.closest('.poste-card'));
    });
    document.addEventListener('input', e => {
      if (e.target.classList?.contains('p-nombre')) {
        const row = e.target.closest('.persona-row');
        if (row?.querySelector('input[name^="p-rp-"][value="SI"]:checked')) syncRpName();
      }
    });
    document.addEventListener('click', e => {
      if (e.target.closest('[data-add-poste]')) requestAnimationFrame(() => document.querySelectorAll('.poste-card').forEach(syncMediumLabel));
    });
  });
})();
