(() => {
  'use strict';

  function setRadio(name, value) {
    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function justificationFor(card) {
    const id = card.id.split('-')[1];
    const tipo = card.querySelector(`input[name="tipo-${id}"]:checked`)?.value || 'MADERA';
    const medio = document.querySelector(`input[name="medio-${id}"]:checked`)?.value || '';
    if (medio === 'PEMP') return 'Se utiliza PEMP como medio prioritario y adecuado para el acceso al poste.';
    if (medio === 'ESCALERA') return 'Se utiliza escalera exterior con patas extensibles estabilizadoras como medio adecuado para el acceso al poste.';
    if (medio === 'ESCALERA_EXC') return 'Se utiliza escalera exterior extensible de fibra de forma excepcional al no resultar viable PEMP ni escalera estabilizada en este emplazamiento.';
    if (medio === 'EXCEPCIONAL_D') {
      if (tipo === 'MADERA') return 'Se utilizan trepadores de forma excepcional al no resultar viable PEMP ni escalera estabilizada en este emplazamiento.';
      if (tipo === 'HORMIGON') return 'Se utilizan barras pasantes o estribos de forma excepcional al no resultar viable PEMP ni escalera estabilizada en este emplazamiento.';
      return 'Se utilizan peldaños o herramienta especial de forma excepcional al no resultar viable PEMP ni escalera estabilizada en este emplazamiento.';
    }
    return '';
  }

  function syncJustification(card, force = false) {
    if (!card) return;
    const area = card.querySelector('.poste-just');
    if (!area) return;
    const next = justificationFor(card);
    if (!next) return;
    if (force || !area.value.trim() || area.dataset.auto === '1') {
      area.value = next;
      area.dataset.auto = '1';
      area.removeAttribute('aria-invalid');
    }
  }

  function applyPostConforme(card) {
    if (!card) return;
    const id = card.id.split('-')[1];
    const tipo = card.querySelector(`input[name="tipo-${id}"]:checked`)?.value || '';
    const medio = document.querySelector(`input[name="medio-${id}"]:checked`)?.value || '';

    if (!tipo || !medio) {
      const target = card.querySelector('[name^="medio-"]');
      target?.scrollIntoView({ block: 'center' });
      setStatus('Elige primero el tipo de poste y el medio de acceso.', 'error');
      return false;
    }

    if (tipo === 'MADERA') {
      for (let i = 1; i <= 6; i++) setRadio(`wood-${id}-${i}`, 'SI');
      setRadio(`cambio-${id}`, 'NO');
    }
    setRadio(`estado-${id}`, 'BUENO');

    if (medio === 'ESCALERA' || medio === 'ESCALERA_EXC') {
      for (const k of ['a','b','c','d','e','f','g']) setRadio(`s7${k}-${id}`, 'SI');
      setRadio(`s7final-${id}`, 'SI');
      const obs = card.querySelector('.ladder-obs');
      if (obs && !obs.value.trim()) obs.value = 'Sin incidencias.';
    }

    const confirm = card.querySelector('.poste-confirm');
    if (confirm) confirm.checked = true;
    syncJustification(card, true);

    const btn = card.querySelector('.quick-post-ok');
    if (btn) {
      btn.textContent = '✓ Todo conforme aplicado';
      btn.dataset.applied = '1';
    }
    return true;
  }

  function applyGeneralConforme() {
    setRadio('clima', 'SI');
    document.querySelectorAll('.persona-row').forEach(row => {
      const form = row.querySelector('input[name^="p-form-"]');
      const riesgo = row.querySelector('input[name^="p-riesgo-"]');
      if (form) setRadio(form.name, 'SI');
      if (riesgo) setRadio(riesgo.name, 'SI');
    });

    document.querySelectorAll('.epi-check').forEach(el => { el.checked = true; });
    const epiConfirm = document.getElementById('epi-confirm');
    if (epiConfirm) epiConfirm.checked = true;
    for (const name of ['mep1','mep2','mep3']) setRadio(name, 'SI');

    let ok = true;
    document.querySelectorAll('.poste-card').forEach(card => { if (!applyPostConforme(card)) ok = false; });
    if (ok) setStatus('Valores conformes aplicados. Revisa los datos variables, firma y confirma al final.', 'ok');
  }

  function addQuickButton(card) {
    if (!card || card.querySelector('.quick-post-ok')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn quick-post-ok';
    button.textContent = '✓ Todo conforme en este poste';
    button.addEventListener('click', () => applyPostConforme(card));
    const typeBlock = card.querySelector('.tipo-toggle');
    if (typeBlock) typeBlock.insertAdjacentElement('afterend', button);
  }

  const originalAddPoste = addPoste;
  addPoste = function() {
    originalAddPoste();
    const cards = document.querySelectorAll('.poste-card');
    addQuickButton(cards[cards.length - 1]);
  };

  window.addEventListener('DOMContentLoaded', () => {
    const trabajo = document.getElementById('trabajo');
    if (trabajo && !trabajo.value.trim()) trabajo.value = 'Subida a postes';

    document.querySelectorAll('.poste-card').forEach(addQuickButton);

    const postesCard = document.getElementById('postes-list')?.closest('.card');
    if (postesCard && !postesCard.querySelector('.quick-all')) {
      const box = document.createElement('div');
      box.className = 'quick-all';
      box.innerHTML = '<div><strong>Modo rápido</strong><span>Si has comprobado que todo está correcto, aplica de una vez los valores conformes.</span></div><button type="button" class="btn btn-primary">✓ Aplicar todo conforme</button>';
      box.querySelector('button').addEventListener('click', applyGeneralConforme);
      postesCard.querySelector('h2')?.insertAdjacentElement('afterend', box);
    }

    document.addEventListener('change', e => {
      if (e.target.name?.startsWith('medio-') || e.target.name?.startsWith('tipo-')) {
        syncJustification(e.target.closest('.poste-card'));
      }
    });

    document.addEventListener('input', e => {
      if (e.target.classList?.contains('poste-just')) e.target.dataset.auto = '0';
    });

    const style = document.createElement('style');
    style.textContent = `
      .quick-all{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:11px 12px;margin:-2px 0 14px;background:#eef8f2;border:1px solid #c9e8d6;border-radius:11px}.quick-all strong{display:block;color:#155b3b;font-size:13px}.quick-all span{display:block;color:#5f7469;font-size:11px;margin-top:2px}.quick-post-ok{width:100%;margin:0 0 12px;background:#eef8f2;color:#14603c;border:1px solid #b9dfca}.quick-post-ok[data-applied="1"]{background:#dff4e8;border-color:#9fd0b4}.quick-post-ok:hover{filter:brightness(.98)}@media(max-width:620px){.quick-all{align-items:stretch;flex-direction:column}.quick-all .btn{width:100%}}`;
    document.head.appendChild(style);
  });
})();
