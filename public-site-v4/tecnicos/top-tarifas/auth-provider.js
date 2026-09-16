const SUPABASE_URL='https://kgcuqxzpxykqszdeonte.supabase.co';
const SUPABASE_KEY='sb_publishable_I5X2IBZZkmFyDDez_Kf4aA_hNyLkzay';
const AUTH_FN=`${SUPABASE_URL}/functions/v1/tech-auth`;
const PENDING_KEY='fibaro_tech_registration_v2';

function pending(){try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'{}')}catch{return{}}}
function savePending(v){localStorage.setItem(PENDING_KEY,JSON.stringify({...v,at:Date.now()}))}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function status(message,type=''){const el=document.getElementById('authStatus');if(!el)return;el.textContent=message;el.className=`authStatus${type?` ${type}`:''}`}

async function requestAccess(){
  const name=document.getElementById('a-name')?.value.trim()||'';
  const phone=(document.getElementById('a-phone')?.value||'').replace(/\D/g,'');
  const email=(document.getElementById('a-email')?.value||'').trim().toLowerCase();
  const btn=document.getElementById('sendAccess');
  if(name.length<2)return status('Indica tu nombre o alias.','error');
  if(phone.length!==9)return status('Indica un móvil español de 9 cifras.','error');
  if(!validEmail(email))return status('Indica un correo electrónico válido.','error');
  savePending({name,phone,email});
  status('Enviando acceso seguro…');if(btn)btn.disabled=true;
  try{
    const r=await fetch(AUTH_FN,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify({name,phone,email,website:''})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(j.error||'No se ha podido enviar el acceso.');
    status(`Acceso enviado a ${email}. Abre el mensaje y pulsa “Entrar en Top Tarifas”.`,'ok');
    if(btn){btn.textContent='Acceso enviado';btn.disabled=true;setTimeout(()=>{if(document.body.contains(btn)){btn.textContent='Reenviar acceso';btn.disabled=false}},60000)}
  }catch(e){status(e.message||'No se ha podido enviar el acceso.','error');if(btn)btn.disabled=false}
}

function enhance(){
  const old=document.getElementById('sendAccess');
  if(old&&old.dataset.provider!=='resend'){
    const btn=old.cloneNode(true);old.replaceWith(btn);btn.dataset.provider='resend';btn.onclick=requestAccess;
  }
  document.getElementById('passkeyLogin')?.closest('.authAlt')?.remove();
  const p=pending();
  if(p.at&&Date.now()-p.at<24*60*60*1000){
    const n=document.getElementById('a-name'),ph=document.getElementById('a-phone'),em=document.getElementById('a-email');
    if(n&&!n.value)n.value=p.name||'';if(ph&&!ph.value)ph.value=p.phone||'';if(em&&!em.value)em.value=p.email||'';
  }
}

new MutationObserver(enhance).observe(document.getElementById('app'),{childList:true,subtree:true});
enhance();
