import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.0/+esm';
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm';

const SUPABASE_URL='https://kgcuqxzpxykqszdeonte.supabase.co';
const SUPABASE_KEY='sb_publishable_I5X2IBZZkmFyDDez_Kf4aA_hNyLkzay';
const PRIVATE_FN=`${SUPABASE_URL}/functions/v1/tech-private`;
const AUTH_FN=`${SUPABASE_URL}/functions/v1/tech-auth`;
const PENDING_KEY='fibaro_tech_registration_v2';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,experimental:{passkey:true}}});

const app=document.getElementById('app');
const toast=document.getElementById('toast');
const modal=document.getElementById('modal');
const modalBody=document.getElementById('modalBody');
let data=null;
let pending=readPending();
let authMode='login';
const statusLabels={received:'Recibido',reviewing:'En revisión',contacted:'Contactado',processing:'Tramitando',pending_installation:'Pendiente de instalación',installed:'Instalado',validated:'Validado',not_completed:'No completado',duplicate:'Duplicado'};

function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function readPending(){try{const x=JSON.parse(localStorage.getItem(PENDING_KEY)||'{}');if(x.at&&Date.now()-x.at>24*60*60*1000){localStorage.removeItem(PENDING_KEY);return{}}return x||{}}catch{return{}}}
function savePending(v){pending={...v,at:Date.now()};localStorage.setItem(PENDING_KEY,JSON.stringify(pending));}
function clearPending(){pending={};localStorage.removeItem(PENDING_KEY);}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function showToast(msg){toast.textContent=msg;toast.hidden=false;clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.hidden=true,3400)}
function deviceLabel(){const ua=navigator.userAgent;return /iPhone|iPad/.test(ua)?'iPhone / iPad':/Android/.test(ua)?'Android':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'Mac':'Navegador';}
function badgeClass(s){return s==='validated'?'ok':(s==='not_completed'||s==='duplicate')?'bad':'warn'}
function offerUrl(o){return `https://www.fibaroteleco.com/top-tarifas/?r=${encodeURIComponent(data.profile.public_code)}${o?`&o=${encodeURIComponent(o.slug)}`:''}`}
function storefrontUrl(){return offerUrl(null)}
function getOffer(slug){return data.offers.find(x=>x.slug===slug)}

async function privateCall(action,extra={}){
  const{data:s}=await supabase.auth.getSession();
  const token=s.session?.access_token;
  if(!token)throw new Error('NO_SESSION');
  const r=await fetch(PRIVATE_FN,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${token}`},body:JSON.stringify({action,...extra})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'No se pudo completar la operación');
  return j;
}
async function shareEvent(event_type,offer_slug=null){try{await privateCall('share_event',{event_type,offer_slug})}catch{}}

function authErrorFromUrl(){
  const q=new URLSearchParams(location.search),h=new URLSearchParams(location.hash.replace(/^#/,''));
  const raw=q.get('error_description')||h.get('error_description')||q.get('error')||h.get('error')||'';
  if(!raw)return'';
  try{return decodeURIComponent(raw.replace(/\+/g,' '))}catch{return raw}
}
function renderAuth(message=''){
  const urlErr=authErrorFromUrl();
  const msg=message||urlErr;
  const login=authMode==='login';
  app.innerHTML=`<section class="auth"><div class="authCard"><div class="authLogo">T</div><div class="eyebrow" style="color:#1769ff">TOP TARIFAS</div><h1>${login?'Inicia sesión.':'Crea tu enlace personal.'}</h1><p>${login?'Introduce el correo de tu cuenta. Te enviaremos un enlace para volver a tu perfil, tus ofertas y tus referencias. Sin contraseña.':'Una sola identificación para que tus enlaces, QR y solicitudes queden asociados a ti. Sin contraseñas.'}</p>
  ${login?'':`<div class="field"><label for="a-name">Nombre o alias</label><input id="a-name" autocomplete="name" placeholder="Ej. Juan Carlos o JaviFiber" value="${esc(pending.name||'')}"></div>
  <div class="field"><label for="a-phone">Móvil</label><div class="phoneWrap"><div class="prefix">+34</div><input id="a-phone" inputmode="tel" autocomplete="tel-national" placeholder="600 000 000" value="${esc(pending.phone||'')}"></div></div>`}
  <div class="field"><label for="a-email">Correo electrónico</label><input id="a-email" type="email" inputmode="email" autocomplete="email" placeholder="tu@correo.com" value="${esc(pending.email||'')}"><small>${login?'Usa el mismo correo con el que creaste tu cuenta.':'El acceso seguro se enviará a este correo. Tu móvil queda como dato de contacto.'}</small></div>
  <button class="btn primary" id="sendAccess" style="width:100%">Recibir acceso por email</button>
  <div id="authStatus" role="status" class="authStatus ${msg?'error':''}">${esc(msg)}</div><div class="divider"></div><p>${login?'¿Todavía no tienes cuenta?':'¿Ya tienes una cuenta?'}</p><button class="btn" id="switchAuth">${login?'Crear cuenta':'Iniciar sesión'}</button><div class="privacyNote">Tu código público de referido es independiente de tu acceso. Nadie puede entrar en tu cuenta con tu QR o enlace.</div></div></section>`;
  document.getElementById('sendAccess').onclick=sendAccess;
  document.getElementById('switchAuth').onclick=()=>{pending={...pending,email:document.getElementById('a-email').value,name:document.getElementById('a-name')?.value||pending.name,phone:document.getElementById('a-phone')?.value||pending.phone};authMode=login?'register':'login';renderAuth()};
}
function renderMailSent(email){
  app.innerHTML=`<section class="auth"><div class="authCard"><div class="authLogo">✓</div><div class="eyebrow" style="color:#1769ff">ACCESO ENVIADO</div><h1>Revisa tu correo.</h1><p>${pending.mode==='login'?'Si el correo corresponde a una cuenta activa, recibirás un enlace en':'Hemos enviado el acceso a'} <b>${esc(email)}</b>. Toca el enlace del mensaje y volverás directamente a Top Tarifas.</p><div class="actions"><button class="btn" id="changeEmail">Cambiar datos</button><button class="btn primary" id="resendAccess">Reenviar acceso</button></div><div id="authStatus" class="authStatus ok">El enlace caduca por seguridad. Si no lo ves, revisa spam o promociones.</div></div></section>`;
  document.getElementById('changeEmail').onclick=()=>renderAuth();
  document.getElementById('resendAccess').onclick=sendAccessFromPending;
}
function friendlyAuthError(error){
  const code=String(error?.code||'');const m=String(error?.message||'');
  if(code==='email_address_not_authorized'||/not authorized/i.test(m))return'El proveedor de correo de acceso todavía no está configurado para usuarios externos.';
  if(code==='over_email_send_rate_limit'||/rate limit/i.test(m))return'Se han solicitado demasiados accesos seguidos. Espera un momento y vuelve a intentarlo.';
  if(code==='email_address_invalid'||/invalid email/i.test(m))return'El correo indicado no es válido.';
  return m||'No se ha podido enviar el acceso.';
}
async function sendAccess(){
  const name=document.getElementById('a-name')?.value.trim()||'';
  let phone=(document.getElementById('a-phone')?.value||'').replace(/\D/g,'');
  if(phone.startsWith('0034'))phone=phone.slice(4);
  if(phone.startsWith('34')&&phone.length===11)phone=phone.slice(2);
  const email=document.getElementById('a-email').value.trim().toLowerCase();
  const st=document.getElementById('authStatus'),btn=document.getElementById('sendAccess');
  if(authMode!=='login'&&name.length<2){st.textContent='Indica tu nombre o alias.';st.className='authStatus error';return}
  if(authMode!=='login'&&phone.length!==9){st.textContent='Indica un móvil español de 9 cifras.';st.className='authStatus error';return}
  if(!validEmail(email)){st.textContent='Indica un correo electrónico válido.';st.className='authStatus error';return}
  savePending({name,phone,email,mode:authMode});
  st.textContent='Enviando acceso seguro…';st.className='authStatus';btn.disabled=true;
  try{
    const r=await fetch(AUTH_FN,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify({name,phone,email,mode:authMode,website:''})});
    const j=await r.json().catch(()=>({}));
    btn.disabled=false;
    if(!r.ok)throw new Error(j.error||'No se ha podido enviar el acceso.');
    renderMailSent(email);
  }catch(error){btn.disabled=false;st.textContent=friendlyAuthError(error);st.className='authStatus error'}
}
async function sendAccessFromPending(){if(!pending.email){renderAuth();return}const btn=document.getElementById('resendAccess'),st=document.getElementById('authStatus');btn.disabled=true;st.textContent='Reenviando…';try{const r=await fetch(AUTH_FN,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify({name:pending.name||'',phone:pending.phone||'',email:pending.email,mode:pending.mode||'register',website:''})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'No se ha podido reenviar el acceso.');st.textContent='Acceso reenviado.';st.className='authStatus ok';setTimeout(()=>btn.disabled=false,60000)}catch(error){st.textContent=friendlyAuthError(error);st.className='authStatus error';btn.disabled=false}}

async function load(){
  app.innerHTML='<div class="loading">Cargando tu espacio…</div>';
  try{
    const registration=pending.email?{name:pending.name||'',phone:pending.phone||'',email:pending.email||''}:{};
    data=await privateCall('bootstrap',{device_label:deviceLabel(),registration});
    clearPending();
    renderDashboard();
  }catch(e){if(e.message==='NO_SESSION'||/sesión/i.test(e.message))renderAuth();else app.innerHTML=`<div class="card"><h2>No se pudo abrir Top Tarifas</h2><p class="muted">${esc(e.message)}</p><button class="btn" id="retry">Reintentar</button></div>`,document.getElementById('retry').onclick=load;}
}

function renderDashboard(){
  const p=data.profile,alias=p.alias||p.full_name||'Técnico';
  app.innerHTML=`<section class="hero"><div class="heroTop"><div><div class="eyebrow">TU CANAL DE OPORTUNIDADES</div><h1>Comparte. Nosotros<br>gestionamos el resto.</h1><p>Elige una Top Tarifa, compártela con tu enlace o QR y sigue desde aquí cada solicitud que llegue referida por ti.</p></div><div class="profileMini"><b>${esc(alias)}</b><small>${esc(p.public_code)}</small><div class="actions" style="justify-content:flex-end"><button class="btn" data-profile>Mi perfil</button></div></div></div><div class="stats"><div class="stat"><strong>${data.counts.total}</strong><span>Referencias</span></div><div class="stat"><strong>${data.counts.validated}</strong><span>Validadas</span></div><div class="stat"><strong>${data.counts.in_process}</strong><span>En proceso</span></div><div class="stat"><strong>${data.metrics.opens}</strong><span>Aperturas</span></div></div></section>
  <div class="grid2"><section class="card"><h2>Mi escaparate</h2><div class="muted">Un enlace permanente con las Top Tarifas activas. Puedes ponerlo en tu bio, estado o enviarlo a cualquiera.</div><div class="linkbox"><code>${esc(storefrontUrl())}</code><button class="btn" data-copy-store>Copiar</button></div><div class="actions"><button class="btn primary" data-share-store>Compartir</button><button class="btn" data-qr-store>Mostrar QR</button></div></section><section class="card"><h2>Tu seguimiento</h2><div class="muted">La primera referencia activa de un cliente queda protegida durante 30 días.</div><div class="actions"><button class="btn soft" data-scroll-ref>Ver mis referencias</button><button class="btn" data-security>Seguridad</button></div></section></div>
  <div class="offersHeader"><div><div class="eyebrow" style="color:#1769ff">SELECCIÓN ACTUAL</div><h2>Top Tarifas</h2></div><div class="muted">Alicia actualiza ofertas, textos y creatividades.</div></div><section class="offers">${data.offers.map(renderOffer).join('')}</section>
  <section class="card" id="refs" style="margin-top:22px"><h2>Mis referencias</h2><div class="muted">Solo mostramos la información necesaria para seguir el estado de cada solicitud.</div><div class="refList">${data.referrals.length?data.referrals.map(r=>`<div class="refRow"><div><b>${esc(r.offer_title)} · ${esc(r.customer_name)}</b><div class="refMeta">${esc(r.referral_code)} · ${new Date(r.created_at).toLocaleDateString('es-ES')}${r.status_reason?` · ${esc(r.status_reason)}`:''}</div></div><span class="badge ${badgeClass(r.status)}">${esc(statusLabels[r.status]||r.status)}</span></div>`).join(''):'<div class="empty">Todavía no tienes referencias. Comparte una Top Tarifa y aparecerán aquí cuando alguien la solicite.</div>'}</div></section>`;
  bindDashboard();
}
function renderOffer(o){const features=Array.isArray(o.features)?o.features:[];return `<article class="offer" style="--accent:${esc(o.accent||'#1769ff')}"><div class="offerTop"><div><div class="kicker">${esc(o.kicker||'TOP TARIFA')}</div><h3>${esc(o.title)}</h3><div class="company">${esc(o.company_name||'FÍBARO')}</div></div><div>${o.is_demo?'<span class="demo">DEMO</span>':''}${o.price_label?`<div class="price">${esc(o.price_label)}</div>`:''}</div></div><p>${esc(o.description)}</p><div class="features">${features.slice(0,4).map(f=>`<span class="pill">${esc(f)}</span>`).join('')}</div>${o.conditions?`<div class="offerConditions"><b>Condiciones</b> ${esc(o.conditions)}</div>`:''}<div class="muted">${esc(o.contract_company_label||'FÍBARO asesora y gestiona; el contrato se realiza con la operadora seleccionada.')}</div>${o.is_demo?'<div class="demoNotice">Creatividad provisional. Cualquier material generado se marcará como DEMO.</div>':''}<div class="actions"><button class="btn primary" data-share="${esc(o.slug)}">Compartir</button><button class="btn" data-wa="${esc(o.slug)}">WhatsApp</button><button class="btn" data-story="${esc(o.slug)}">Story / Estado</button><button class="btn" data-feed="${esc(o.slug)}">Publicación</button><button class="btn" data-qr="${esc(o.slug)}">QR</button></div></article>`}
function bindDashboard(){
  document.querySelector('[data-profile]').onclick=openProfile;document.querySelector('[data-copy-store]').onclick=()=>copyText(storefrontUrl(),'copy');document.querySelector('[data-share-store]').onclick=()=>nativeShare(null);document.querySelector('[data-qr-store]').onclick=()=>openQR(null);document.querySelector('[data-scroll-ref]').onclick=()=>document.getElementById('refs').scrollIntoView({behavior:'smooth'});document.querySelector('[data-security]').onclick=openSecurity;
  document.querySelectorAll('[data-share]').forEach(b=>b.onclick=()=>nativeShare(getOffer(b.dataset.share)));document.querySelectorAll('[data-wa]').forEach(b=>b.onclick=()=>shareWhatsApp(getOffer(b.dataset.wa)));document.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>createCreative(getOffer(b.dataset.story),'story'));document.querySelectorAll('[data-feed]').forEach(b=>b.onclick=()=>createCreative(getOffer(b.dataset.feed),'feed'));document.querySelectorAll('[data-qr]').forEach(b=>b.onclick=()=>openQR(getOffer(b.dataset.qr)));
}
async function clipboardFallback(v){const ta=document.createElement('textarea');ta.value=v;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}finally{ta.remove()}}
async function copyText(v,event='copy',o=null){try{await navigator.clipboard.writeText(v)}catch{await clipboardFallback(v)}showToast('Enlace copiado');shareEvent(event,o?.slug)}
async function nativeShare(o){const url=o?offerUrl(o):storefrontUrl(),txt=o?(o.social_text||o.whatsapp_text||o.description):'Estas son mis Top Tarifas de FÍBARO. Si alguna te interesa, puedes solicitarla desde mi enlace.';try{if(navigator.share){await navigator.share({title:o?.title||'Top Tarifas',text:txt,url});await shareEvent('share',o?.slug)}else await copyText(`${txt}\n${url}`,'share',o)}catch(e){if(e.name!=='AbortError')await copyText(`${txt}\n${url}`,'share',o)}}
function shareWhatsApp(o){const url=offerUrl(o),txt=`${o.whatsapp_text||o.description}\n${url}`;shareEvent('whatsapp',o.slug);window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,'_blank','noopener')}
async function openQR(o){const url=o?offerUrl(o):storefrontUrl();const c=document.createElement('canvas');await QRCode.toCanvas(c,url,{width:320,margin:2,errorCorrectionLevel:'M',color:{dark:'#071827',light:'#ffffff'}});modalBody.innerHTML=`<div class="qrbox"><div id="qrslot"></div><h3>${esc(o?.title||'Mi escaparate')}</h3><p>Escanea para abrir ${o?'esta oferta':'tus Top Tarifas'} con tu referencia incorporada.</p><div class="linkbox"><code>${esc(url)}</code></div><div class="actions" style="justify-content:center"><button class="btn primary" id="copyqr">Copiar enlace</button></div></div>`;document.getElementById('qrslot').appendChild(c);document.getElementById('copyqr').onclick=()=>copyText(url,'qr',o);modal.hidden=false;shareEvent('qr',o?.slug)}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
function wrap(ctx,text,x,y,maxWidth,lineHeight){const words=String(text||'').split(' ');let line='';for(let n=0;n<words.length;n++){const test=line+words[n]+' ';if(ctx.measureText(test).width>maxWidth&&n>0){ctx.fillText(line.trim(),x,y);line=words[n]+' ';y+=lineHeight}else line=test}ctx.fillText(line.trim(),x,y);return y}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
async function creativeCanvas(o,kind){const story=kind==='story',W=1080,H=story?1920:1080,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const x=canvas.getContext('2d');const grad=x.createLinearGradient(0,0,W,H);grad.addColorStop(0,o.accent||'#1769ff');grad.addColorStop(1,'#071827');x.fillStyle=grad;x.fillRect(0,0,W,H);const bg=story?o.story_image_url:o.square_image_url;if(bg){try{const im=await loadImage(bg);const s=Math.max(W/im.width,H/im.height),w=im.width*s,h=im.height*s;x.globalAlpha=.5;x.drawImage(im,(W-w)/2,(H-h)/2,w,h);x.globalAlpha=1;x.fillStyle='rgba(7,24,39,.55)';x.fillRect(0,0,W,H)}catch{}}
  x.fillStyle='#56d8ff';x.font='800 30px Arial';x.fillText('TOP TARIFAS · FÍBARO',76,105);if(o.is_demo){x.fillStyle='#ffe38a';x.font='900 34px Arial';x.fillText('DEMO · OFERTA PROVISIONAL',76,160)}
  x.fillStyle='#fff';x.font=story?'900 78px Arial':'900 62px Arial';let y=o.is_demo?260:210;wrap(x,o.title,76,y,W-150,story?88:70);y+=o.title.length>25?(story?190:150):(story?115:90);if(o.price_label){x.font=story?'900 62px Arial':'900 50px Arial';x.fillText(o.price_label,76,y);y+=story?85:68}x.font=story?'700 32px Arial':'700 26px Arial';x.fillStyle='#d9e5eb';x.fillText(o.company_name||'FÍBARO',76,y);y+=story?80:55;x.font=story?'500 29px Arial':'500 24px Arial';x.fillStyle='#e7eff3';wrap(x,o.description,76,y,W-150,story?40:34);
  const qrSize=story?360:250,boxY=story?1300:700,boxH=story?500:305;const qrData=await QRCode.toDataURL(offerUrl(o),{width:qrSize+30,margin:2,errorCorrectionLevel:'M',color:{dark:'#071827',light:'#ffffff'}});const qim=await loadImage(qrData);x.fillStyle='#fff';roundRect(x,75,boxY,W-150,boxH,30);x.fill();x.drawImage(qim,story?120:110,boxY+(story?45:30),qrSize,qrSize);x.fillStyle='#071827';x.font=story?'900 38px Arial':'900 29px Arial';x.fillText('Escanea y solicítala',story?525:405,boxY+(story?150:100));x.font=story?'600 25px Arial':'600 20px Arial';x.fillStyle='#48606f';wrap(x,'La solicitud queda vinculada a mi enlace de recomendación.',story?525:405,boxY+(story?210:145),story?420:560,story?36:28);x.font=story?'700 22px Arial':'700 18px Arial';wrap(x,o.contract_company_label||'FÍBARO asesora y gestiona la contratación.',story?525:405,boxY+(story?320:220),story?420:560,story?32:25);return canvas}
async function createCreative(o,kind){showToast('Preparando creatividad…');try{const canvas=await creativeCanvas(o,kind);canvas.toBlob(async blob=>{if(!blob)return;const file=new File([blob],`top-tarifa-${o.slug}-${kind}.jpg`,{type:'image/jpeg'}),url=offerUrl(o),event=kind==='story'?'story':'feed',text=`${o.social_text||o.description}\n${url}`;try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:o.title,text});await shareEvent(event,o.slug)}else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;a.click();await copyText(url,event,o);showToast('Creatividad guardada y enlace copiado.')}}catch(e){if(e.name!=='AbortError')showToast('No se pudo abrir el menú de compartir.')}},'image/jpeg',.92)}catch{showToast('No se pudo generar la creatividad.')}}

function openProfile(){const p=data.profile,specs=['Fibra','Móvil','Instalaciones','Averías','Empresas','Radio/4G/5G'];modalBody.innerHTML=`<h2>Mi perfil</h2><p class="muted">Completa solo lo que quieras mostrar o usar en tu actividad. El correo de acceso se gestiona aparte por seguridad.</p><div class="profileForm"><div class="field"><label>Nombre o alias</label><input id="pf-name" value="${esc(p.full_name||'')}"></div><div class="field"><label>Alias público</label><input id="pf-alias" value="${esc(p.alias||'')}"></div><div class="field"><label>Móvil de contacto</label><input id="pf-phone" inputmode="tel" value="${esc((p.phone||'').replace(/^\+34/,''))}"></div><div class="field"><label>Correo de acceso</label><input value="${esc(data.user?.email||p.email||'')}" readonly><small>No se modifica desde el perfil.</small></div><div class="field"><label>Empresa</label><input id="pf-company" value="${esc(p.company||'')}"></div><div class="field"><label>Provincia</label><input id="pf-prov" value="${esc(p.province||'')}"></div><div class="field"><label>Población</label><input id="pf-city" value="${esc(p.city||'')}"></div><div class="wide field"><label>Especialidades</label><div class="checks">${specs.map(s=>`<label class="check"><input type="checkbox" value="${s}" ${(p.specialties||[]).includes(s)?'checked':''}>${s}</label>`).join('')}</div></div><div class="wide field"><label>Sobre ti</label><textarea id="pf-bio" rows="3" maxlength="600">${esc(p.bio||'')}</textarea></div></div><div class="actions"><button class="btn primary" id="saveProfile">Guardar perfil</button></div>`;modal.hidden=false;document.getElementById('saveProfile').onclick=saveProfile}
async function saveProfile(){const specialties=[...modalBody.querySelectorAll('.check input:checked')].map(x=>x.value);const profile={full_name:document.getElementById('pf-name').value,alias:document.getElementById('pf-alias').value,phone:document.getElementById('pf-phone').value,company:document.getElementById('pf-company').value,province:document.getElementById('pf-prov').value,city:document.getElementById('pf-city').value,bio:document.getElementById('pf-bio').value,specialties};try{await privateCall('update_profile',{profile});modal.hidden=true;showToast('Perfil actualizado');await load()}catch(e){showToast(e.message)}}
function openSecurity(){const acts=data.activity||[];modalBody.innerHTML=`<h2>Seguridad de acceso</h2><p class="muted">Tu QR y tu código de referido nunca sirven para entrar en tu cuenta.</p><div class="security"><div class="securityItem"><b>Correo de acceso</b><p>${esc(data.user?.email||data.profile.email||'')}</p></div><div class="securityItem"><b>Face ID / huella / PIN del dispositivo</b><p>Si las passkeys están habilitadas, puedes añadir una protección resistente al phishing.</p><div class="actions"><button class="btn primary" id="passkey">Activar passkey</button></div></div><div class="securityItem"><b>Otras sesiones</b><p>Si pierdes un dispositivo, cierra el resto de sesiones asociadas a tu cuenta.</p><div class="actions"><button class="btn" id="signoutOthers">Cerrar otras sesiones</button></div></div><div class="securityItem"><b>Actividad reciente</b>${acts.length?acts.slice(0,6).map(a=>`<p>${new Date(a.created_at).toLocaleString('es-ES')} · ${esc(a.event_type)}${a.device_label?` · ${esc(a.device_label)}`:''}</p>`).join(''):'<p>Sin actividad anterior.</p>'}</div><div class="securityItem"><b>Salir de este dispositivo</b><div class="actions"><button class="btn danger" id="logout">Cerrar sesión</button></div></div></div>`;modal.hidden=false;document.getElementById('passkey').onclick=registerPasskey;document.getElementById('signoutOthers').onclick=signoutOthers;document.getElementById('logout').onclick=logout}
async function registerPasskey(){try{const{data:pk,error}=await supabase.auth.registerPasskey();if(error)throw error;await privateCall('activity',{event_type:'passkey_registered',device_label:deviceLabel()});showToast(`Passkey activada${pk?.friendly_name?`: ${pk.friendly_name}`:''}`);modal.hidden=true;await load()}catch(e){showToast(/passkey_disabled/i.test(e.message)?'Las passkeys aún no están habilitadas para este dominio.':e.message)}}
async function signoutOthers(){const{error}=await supabase.auth.signOut({scope:'others'});if(error)showToast(error.message);else{showToast('Otras sesiones cerradas');await privateCall('activity',{event_type:'other_sessions_revoked',device_label:deviceLabel()})}}
async function logout(){await supabase.auth.signOut({scope:'local'});modal.hidden=true;data=null;renderAuth()}
document.querySelectorAll('[data-close-modal]').forEach(x=>x.onclick=()=>modal.hidden=true);

const{data:initial,error:initError}=await supabase.auth.getSession();
if(initError)renderAuth(initError.message);else if(initial.session)load();else renderAuth();
