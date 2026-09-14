async function generarPDF() {
  const postes = getPostes();
  const validationError = validateBeforeGenerate(postes);
  if (validationError) {
    setStatus(validationError, 'error');
    alert(validationError);
    return;
  }
  if (!window.PDFLib) {
    const msg = 'No se ha podido cargar el motor PDF. Comprueba la conexión y vuelve a intentarlo.';
    setStatus(msg, 'error'); alert(msg); return;
  }

  setStatus('Generando PDF…');
  try {
    const { PDFDocument, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const dataUrl = document.getElementById('sigpad').toDataURL('image/png');
    const sigBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
    const sigImg = await pdfDoc.embedPng(sigBytes);

    const general = {
      empresa: val('empresa'), unidad: val('unidad'), fecha: val('fecha'), hora: val('hora'),
      provincia: val('provincia'), poblacion: val('poblacion'), nactuacion: val('nactuacion'),
      central: val('central'), trabajo: val('trabajo'),
      clima: radio('clima'), medio: radio('medio'), personas: getPersonas(),
      sec7: {a:radio('s7a'),b:radio('s7b'),c:radio('s7c'),d:radio('s7d'),e:radio('s7e'),f:radio('s7f'),g:radio('s7g'),obs:val('s7obs'),final:radio('s7final')},
      epis: getEpis(), epiOtrosTxt: val('epi-otros'),
      mep1: radio('mep1'), mep2: radio('mep2'), mep3: radio('mep3'),
      obs9: val('obs9'), tel: val('tel112'), rpNombre: val('rp-nombre'), rpNif: val('rp-nif')
    };

    const [plantillaRes, reversoRes] = await Promise.all([fetch('plantilla.pdf'), fetch('reverso.pdf')]);
    if (!plantillaRes.ok || !reversoRes.ok) throw new Error('No se han podido cargar las plantillas PDF.');
    const plantillaDoc = await PDFDocument.load(await plantillaRes.arrayBuffer());
    const reversoDoc = await PDFDocument.load(await reversoRes.arrayBuffer());
    const embeddedTemplate = await pdfDoc.embedPage(plantillaDoc.getPage(0));
    const embeddedReverso = await pdfDoc.embedPage(reversoDoc.getPage(0));
    const PW = 595.32, PH = 841.92;

    for (const poste of postes) {
      const page = pdfDoc.addPage([PW, PH]);
      page.drawPage(embeddedTemplate, {x:0,y:0,width:PW,height:PH});
      fillParte(page, font, fontBold, general, poste, sigImg);
      const back = pdfDoc.addPage([PW, PH]);
      back.drawPage(embeddedReverso, {x:0,y:0,width:PW,height:PH});
    }

    const bytes = await pdfDoc.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fecha = general.fecha || 'sinfecha';
    a.href = url;
    a.download = `Partes_Postes_${fecha}_${postes.length}postes.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    setStatus(`PDF listo: ${postes.length} parte(s), cada uno con anverso y reverso.`, 'ok');
    saveRememberedData();
  } catch (err) {
    console.error(err);
    const msg = 'No se ha podido generar el PDF. Revisa la conexión y vuelve a intentarlo.';
    setStatus(msg, 'error'); alert(msg);
  }
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
  const size = opts.size || spec.size || 7;
  const f = opts.bold || spec.bold ? fontBold : font;
  if (spec.maxWidth) {
    wrapAndDraw(page, f, str, spec.x, spec.y, spec.maxWidth, size, spec.lineH || (size + 2));
  } else {
    page.drawText(String(str), { x: spec.x, y: spec.y, size, font: f });
  }
}

function wrapAndDraw(page, font, str, x, y, maxWidth, size, lineH) {
  const words = String(str).split(' ');
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
    if (apto) {
      mark(page, fontBold, 'mad1');
      mark(page, fontBold, 'mad2SI'); mark(page, fontBold, 'mad3SI');
      mark(page, fontBold, 'mad4Bueno'); mark(page, fontBold, 'mad5Bueno'); mark(page, fontBold, 'mad6Bueno');
      mark(page, fontBold, 'madEstBueno');
    } else {
      mark(page, fontBold, 'madEstMalo');
    }
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
    mark(page, fontBold, 's7FinalSI');
  } else {
    s7keys.forEach(k => mark(page, fontBold, 's7' + k + (g.sec7[k] === 'NO' ? 'NO' : 'SI')));
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
  drawTxt(page, font, fontBold, TXT.firmaLinea, `${g.poblacion || ''}, a ${fechaTxt}`);
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
