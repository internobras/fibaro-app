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
    alert(validationError);
    return;
  }
  if (!window.PDFLib) {
    const msg = 'No se ha podido cargar el motor PDF. Comprueba la conexión y vuelve a intentarlo.';
    setStatus(msg, 'error');
    alert(msg);
    return;
  }

  setStatus('Generando PDF…');
  try {
    const { PDFDocument, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const dataUrl = document.getElementById('sigpad').toDataURL('image/png');
    const sigImg = await pdfDoc.embedPng(dataUrlToBytes(dataUrl));

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

    const [plantillaRes, reversoRes] = await Promise.all([fetch('plantilla.png'), fetch('reverso.png')]);
    if (!plantillaRes.ok || !reversoRes.ok) throw new Error('No se han podido cargar las plantillas del parte.');
    const plantillaImg = await pdfDoc.embedPng(await plantillaRes.arrayBuffer());
    const reversoImg = await pdfDoc.embedPng(await reversoRes.arrayBuffer());
    const PW = 595.32, PH = 841.92;

    for (const poste of postes) {
      const page = pdfDoc.addPage([PW, PH]);
      page.drawImage(plantillaImg, {x:0,y:0,width:PW,height:PH});
      fillParte(page, font, fontBold, general, poste, sigImg);
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
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setStatus(`PDF listo: ${postes.length} parte(s), cada uno con anverso y reverso.`, 'ok');
    saveRememberedData();
  } catch (err) {
    console.error(err);
    const msg = 'No se ha podido generar el PDF. Revisa la conexión y vuelve a intentarlo.';
    setStatus(msg, 'error');
    alert(msg);
  }
}
