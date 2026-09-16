import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.105.0/+esm';

const SUPABASE_URL='https://kgcuqxzpxykqszdeonte.supabase.co';
const SUPABASE_KEY='sb_publishable_I5X2IBZZkmFyDDez_Kf4aA_hNyLkzay';
const PENDING_KEY='fibaro_tech_email_pending_v1';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,experimental:{passkey:true}}});

function escAttr(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function pending(){try{return JSON.parse(localStorage.getItem(PENDING_KEY)||'{}')}catch{return {}}}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}

function enhanceAuth(){
  const oldBtn=document.getElementById('sendOtp');
  const phone=document.getElementById('a-phone');
  if(!oldBtn||!phone||oldBtn.dataset.emailAuth==='1')return;
  const saved=pending();
  if(saved.name&&!document.getElementById('a-name').value)document.getElementById('a-name').value=saved.name;
  if(saved.phone&&!phone.value)phone.value=saved.phone;
  const phoneField=phone.closest('.field');
  if(phoneField&&!document.getElementById('a-email')){
    phoneField.insertAdjacentHTML('afterend',`<div class="field"><label>Correo electrónico</label><input id="a-email" type="email" inputmode="email" autocomplete="email" placeholder="tu@correo.com" value="${escAttr(saved.email||'')}"><small style="display:block;margin-top:6px;color:#6f8290">Te enviaremos aquí el acceso seguro. El móvil queda como dato de contacto, no como credencial.</small></div>`);
  }
  const btn=oldBtn.cloneNode(true);
  oldBtn.replaceWith(btn);
  btn.dataset.emailAuth='1';
  btn.textContent='Recibir acceso por email';
  btn.onclick=sendAccess;
  const note=document.querySelector('.privacyNote');
  if(note)note.textContent='Tu correo identifica tu acceso; tu móvil queda como dato de contacto. Tu código público de referido es independiente y nunca permite entrar en tu cuenta.';
}

async function sendAccess(){
  const name=document.getElementById('a-name')?.value.trim()||'';
  const digits=(document.getElementById('a-phone')?.value||'').replace(/\D/g,'');
  const email=(document.getElementById('a-email')?.value||'').trim().toLowerCase();
  const st=document.getElementById('authStatus');
  const btn=document.getElementById('sendOtp');
  const fail=(m)=>{if(st){st.textContent=m;st.className='authStatus error'}};
  if(name.length<2)return fail('Indica tu nombre o alias.');
  if(digits.length!==9)return fail('Indica un móvil español de 9 cifras.');
  if(!validEmail(email))return fail('Indica un correo electrónico válido.');
  localStorage.setItem(PENDING_KEY,JSON.stringify({name,phone:digits,email,at:Date.now()}));
  if(st){st.textContent='Enviando acceso seguro…';st.className='authStatus'}
  if(btn)btn.disabled=true;
  const redirectTo=`${location.origin}/tecnicos/top-tarifas/`;
  const {error}=await supabase.auth.signInWithOtp({
    email,
    options:{
      shouldCreateUser:true,
      emailRedirectTo:redirectTo,
      data:{full_name:name,tech_name:name,tech_phone:digits,tech_source:'top_tarifas'}
    }
  });
  if(error){
    if(btn)btn.disabled=false;
    const msg=/rate limit/i.test(error.message)?'Has solicitado varios accesos seguidos. Espera un momento y vuelve a intentarlo.':error.message;
    return fail(msg);
  }
  if(st){
    st.textContent=`Te hemos enviado un enlace seguro a ${email}. Ábrelo y volverás directamente a Top Tarifas.`;
    st.className='authStatus success';
  }
  if(btn){btn.textContent='Enlace enviado';btn.disabled=true;}
}

const observer=new MutationObserver(enhanceAuth);
observer.observe(document.getElementById('app'),{childList:true,subtree:true});
enhanceAuth();

// Al volver desde el correo, conservamos los datos de alta unos minutos por si hacen falta para completar el perfil.
const {data:{session}}=await supabase.auth.getSession();
if(session){
  const saved=pending();
  if(saved.at&&Date.now()-saved.at>24*60*60*1000)localStorage.removeItem(PENDING_KEY);
}
