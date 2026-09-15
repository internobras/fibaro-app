(() => {
  'use strict';

  // Ajuste fiel al formulario oficial: las filas a-g de la comprobación de escalera
  // disponen de SI / NO / N/A. La pregunta final mantiene únicamente SI / NO.
  accessFields = function(id) {
    return `<div class="field"><label>Medio de acceso de este poste</label><div class="medio-toggle"><label><input type="radio" name="medio-${id}" value="ESCALERA">Escalera con patas estabilizadoras</label><label><input type="radio" name="medio-${id}" value="PEMP">PEMP</label></div></div>
      <div class="ladder-checks"><h3>Comprobación de la escalera</h3>
      ${LADDER_LABELS.map((label, i) => {
        const key = i === 7 ? 'final' : 'abcdefg'[i];
        const values = i === 7 ? ['SI', 'NO'] : ['SI', 'NO', 'NA'];
        return `<div class="field"><label>${label}</label><div class="yn">${values.map(v => `<label class="opt"><input type="radio" name="s7${key}-${id}" value="${v}">${v === 'SI' ? 'Sí' : v === 'NO' ? 'No' : 'No aplica'}</label>`).join('')}</div></div>`;
      }).join('')}
      <div class="field"><label>Otras circunstancias que hagan inseguro el trabajo</label><input type="text" class="ladder-obs" maxlength="130" placeholder="Indica cualquier incidencia"></div></div>`;
  };

  // Un poco más de margen en el recuadro de firma del documento final.
  TXT.firmaImgBox = { x: 414, y: 50, w: 118, h: 21 };

  // Nombre del RP sincronizado con la persona marcada como Recurso Preventivo.
  function syncRpName() {
    const rpName = document.getElementById('rp-nombre');
    if (!rpName) return;
    const selected = document.querySelector('.persona-row input[name^="p-rp-"][value="SI"]:checked')?.closest('.persona-row');
    rpName.value = selected ? selected.querySelector('.p-nombre').value.trim() : '';
    rpName.removeAttribute('aria-invalid');
  }

  // Mejora del nombre de fichero para que refleje el número real de partes,
  // especialmente cuando hay más de dos personas trabajadoras.
  const originalGenerarPDF = generarPDF;
  generarPDF = async function() {
    await originalGenerarPDF();
    const link = document.getElementById('download-pdf');
    if (!link || link.hidden || !link.href) return;
    const postes = getPostes();
    const personas = getPersonas();
    const rp = personas.find(p => p.rp === 'SI');
    const others = personas.filter(p => p !== rp);
    const grupos = others.length ? others.length : 1;
    const partes = postes.length * grupos;
    const fecha = val('fecha') || 'sinfecha';
    const name = `Partes_Postes_${fecha}_${partes}parte${partes === 1 ? '' : 's'}.pdf`;
    link.download = name;
  };

  window.addEventListener('DOMContentLoaded', () => {
    const rpName = document.getElementById('rp-nombre');
    const tel = document.getElementById('tel112');
    if (rpName) {
      rpName.readOnly = true;
      rpName.placeholder = 'Se completa al seleccionar el RP';
      rpName.setAttribute('aria-readonly', 'true');
    }
    if (tel) {
      tel.value = '112';
      tel.readOnly = true;
      tel.setAttribute('aria-readonly', 'true');
    }

    // Los postes creados antes de este script usan la versión redefinida porque
    // DOMContentLoaded todavía no se ha ejecutado al cargar este fichero.
    syncRpName();

    document.addEventListener('change', e => {
      if (e.target.name?.startsWith('p-rp-')) syncRpName();
    });
    document.addEventListener('input', e => {
      if (e.target.classList?.contains('p-nombre')) {
        const row = e.target.closest('.persona-row');
        if (row?.querySelector('input[name^="p-rp-"][value="SI"]:checked')) syncRpName();
      }
    });
  });
})();
