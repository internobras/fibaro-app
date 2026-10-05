(()=>{'use strict';
const CONFIG={
  gaMeasurementId:'G-M4NJFD8R1L',
  metaPixelId:'',
  endpoint:'https://kgcuqxzpxykqszdeonte.supabase.co/functions/v1/submit-intake',
  consentKey:'fibaro_consent_v1',
  consentVersion:1,
  attributionKey:'fibaro_attribution_v1',
  sessionKey:'fibaro_session',
};
const GOOGLE_HOST='https://www.googletagmanager.com';
const SELF_HOSTS=new Set(['fibaroteleco.com','www.fibaroteleco.com',location.hostname]);
const EVENT_MAP={
  page_view:{ga:'page_view',meta:'PageView'},
  whatsapp_clicked:{ga:'whatsapp_click',meta:'Contact'},
  phone_clicked:{ga:'phone_click'},
  funnel_started:{ga:'generate_lead_start'},
  funnel_completed:{ga:'generate_lead',meta:'Lead'},
  offer_clicked:{ga:'select_promotion'},
  campaign_view:{ga:'view_promotion'},
  gift_cta_clicked:{ga:'select_promotion'},
};
const INTERNAL_EVENT_MAP={page_view:'page_view',whatsapp_clicked:'whatsapp_clicked',phone_clicked:'call_clicked',funnel_started:'funnel_started',funnel_completed:'funnel_completed'};
const ALLOWED_EVENTS=new Set(Object.keys(EVENT_MAP));
const SAFE_KEYS=new Set(['page','page_path','cta_position','type','service','placement','offer_id','campaign','content','technical_zone','event_id']);
const q=new URLSearchParams(location.search);
let consent=readConsent(),gaLoaded=false,metaLoaded=false,pageTracked=false,metaPageTracked=false,previousFocus=null;

window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
window.gtag('set','ads_data_redaction',true);
window.gtag('set','url_passthrough',true);
document.documentElement.dataset.analyticsConsent='denied';
document.documentElement.dataset.marketingConsent='denied';

function readConsent(){
  try{const value=JSON.parse(localStorage.getItem(CONFIG.consentKey)||'null');if(value?.version===CONFIG.consentVersion&&typeof value.analytics==='boolean'&&typeof value.marketing==='boolean')return value}catch{}
  return null;
}
function writeConsent(analytics,marketing){
  consent={version:CONFIG.consentVersion,analytics:!!analytics,marketing:!!marketing,timestamp:new Date().toISOString()};
  try{localStorage.setItem(CONFIG.consentKey,JSON.stringify(consent))}catch{}
  applyConsent();
  closePreferences();
}
function applyConsent(){
  const analytics=!!consent?.analytics,marketing=!!consent?.marketing;
  document.documentElement.dataset.analyticsConsent=analytics?'granted':'denied';
  document.documentElement.dataset.marketingConsent=marketing?'granted':'denied';
  window.gtag('consent','update',{
    analytics_storage:analytics?'granted':'denied',
    ad_storage:marketing?'granted':'denied',
    ad_user_data:marketing?'granted':'denied',
    ad_personalization:marketing?'granted':'denied',
  });
  if(analytics||marketing)captureAttribution();
  if(analytics)loadGa();else clearProviderCookies(['_ga','_gid']);
  if(marketing)loadMeta();else clearProviderCookies(['_fbp','_fbc']);
  trackInitial();
  document.dispatchEvent(new CustomEvent('fibaro:consent',{detail:{analytics,marketing}}));
}
function clearProviderCookies(prefixes){
  document.cookie.split(';').map(x=>x.split('=')[0].trim()).filter(name=>prefixes.some(prefix=>name===prefix||name.startsWith(prefix+'_'))).forEach(name=>{
    document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie=`${name}=; Max-Age=0; path=/; domain=.${location.hostname}; SameSite=Lax`;
  });
}
function loadGa(){
  if(gaLoaded||!CONFIG.gaMeasurementId)return;
  gaLoaded=true;
  const script=document.createElement('script');script.async=true;script.src=`${GOOGLE_HOST}/gtag/js?id=${encodeURIComponent(CONFIG.gaMeasurementId)}`;document.head.append(script);
  window.gtag('js',new Date());
  window.gtag('config',CONFIG.gaMeasurementId,{send_page_view:false,allow_google_signals:!!consent?.marketing,allow_ad_personalization_signals:!!consent?.marketing});
}
function loadMeta(){
  if(metaLoaded||!CONFIG.metaPixelId)return;
  metaLoaded=true;
  const fbq=window.fbq=function(){fbq.callMethod?fbq.callMethod.apply(fbq,arguments):fbq.queue.push(arguments)};
  fbq.push=fbq;fbq.loaded=true;fbq.version='2.0';fbq.queue=[];window._fbq=fbq;
  const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(script);
  fbq('init',CONFIG.metaPixelId);
}
function uuid(){try{return crypto.randomUUID()}catch{return`fb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}}
function sessionId(){
  if(!consent?.analytics)return '';
  try{let value=sessionStorage.getItem(CONFIG.sessionKey);if(!value){value=uuid();sessionStorage.setItem(CONFIG.sessionKey,value)}return value}catch{return ''}
}
function clean(value,max=300){return String(value??'').trim().slice(0,max)}
function externalReferrer(){try{const value=document.referrer;if(!value)return'';const url=new URL(value);return SELF_HOSTS.has(url.hostname)?'':value.slice(0,500)}catch{return''}}
function currentTouch(){
  const source=clean(q.get('utm_source')||q.get('src'),160),medium=clean(q.get('utm_medium'),160),campaign=clean(q.get('utm_campaign'),160),content=clean(q.get('utm_content'),160);
  const clickIds=consent?.marketing?{gclid:clean(q.get('gclid'),200),gbraid:clean(q.get('gbraid'),200),wbraid:clean(q.get('wbraid'),200),fbclid:clean(q.get('fbclid'),300)}:{};
  const hasCampaign=!!(source||medium||campaign||content||Object.values(clickIds).some(Boolean));
  if(!hasCampaign)return null;
  return{source:source||inferSource(clickIds),medium:medium||inferMedium(clickIds),campaign,content,landing_path:location.pathname,timestamp:new Date().toISOString(),referrer:externalReferrer(),click_ids:clickIds};
}
function inferSource(ids){if(ids.gclid||ids.gbraid||ids.wbraid)return'google';if(ids.fbclid)return'facebook';return'directo'}
function inferMedium(ids){return Object.values(ids).some(Boolean)?'paid':''}
function readAttribution(){try{return JSON.parse(sessionStorage.getItem(CONFIG.attributionKey)||'null')}catch{return null}}
function captureAttribution(){
  const touch=currentTouch();if(!touch)return readAttribution();
  try{const stored=readAttribution()||{};const next={first_touch:stored.first_touch||touch,last_touch:touch};sessionStorage.setItem(CONFIG.attributionKey,JSON.stringify(next));return next}catch{return{first_touch:touch,last_touch:touch}}
}
function attribution(){
  const stored=(consent?.analytics||consent?.marketing)?readAttribution():null,current=currentTouch();
  const selected=stored?.last_touch||current||{source:'directo',medium:'',campaign:'',content:'',landing_path:location.pathname,referrer:externalReferrer(),click_ids:{}};
  return{selected,first_touch:stored?.first_touch||current||null,last_touch:stored?.last_touch||current||null};
}
function enrichFormData(fd){
  const value=attribution(),selected=value.selected,id=sessionId();
  if(id)fd.set('anonymous_id',id);else fd.delete('anonymous_id');
  fd.set('utm_source',selected.source||'directo');fd.set('utm_medium',selected.medium||'');fd.set('utm_campaign',selected.campaign||'');fd.set('utm_content',selected.content||'');
  fd.set('landing_path',value.first_touch?.landing_path||selected.landing_path||location.pathname);fd.set('referrer',value.first_touch?.referrer||selected.referrer||'');
  let context={};try{context=JSON.parse(String(fd.get('funnel_context')||'{}'))||{}}catch{}
  fd.set('funnel_context',JSON.stringify({...context,first_touch:value.first_touch,last_touch:value.last_touch,click_ids:selected.click_ids||{}}));
  return fd;
}
function safePayload(payload){
  const safe={};for(const[key,value]of Object.entries(payload||{})){if(!SAFE_KEYS.has(key)||value==null)continue;if(typeof value==='string'||typeof value==='number'||typeof value==='boolean')safe[key]=typeof value==='string'?clean(value,200):value}return safe;
}
function eventAttribution(fd){
  const value=attribution(),selected=value.selected,id=sessionId();if(id)fd.set('anonymous_id',id);
  fd.set('utm_source',selected.source||'directo');fd.set('utm_medium',selected.medium||'');fd.set('utm_campaign',selected.campaign||'');fd.set('utm_content',selected.content||'');
  fd.set('landing_path',value.first_touch?.landing_path||selected.landing_path||location.pathname);fd.set('referrer',value.first_touch?.referrer||selected.referrer||'');
}
function sendInternal(name,payload){
  const internalName=INTERNAL_EVENT_MAP[name];if(!consent?.analytics||!internalName)return;
  try{const fd=new FormData();fd.set('mode','event');fd.set('event_name',internalName);fd.set('payload',JSON.stringify(payload));eventAttribution(fd);fetch(CONFIG.endpoint,{method:'POST',body:fd,keepalive:true}).catch(()=>{})}catch{}
}
function sendGa(name,payload){
  if(!consent?.analytics||!gaLoaded||!EVENT_MAP[name]?.ga)return;
  const selected=attribution().selected,params={...payload,page_title:document.title,page_path:location.pathname,page_location:location.href,campaign_source:selected.source||'directo',campaign_medium:selected.medium||'',campaign_name:selected.campaign||'',campaign_content:selected.content||'',debug_mode:location.hostname==='localhost'||location.hostname.endsWith('.vercel.app')};
  window.gtag('event',EVENT_MAP[name].ga,params);
}
function sendMeta(name,payload){
  const metaName=EVENT_MAP[name]?.meta;if(!consent?.marketing||!metaLoaded||!metaName||typeof window.fbq!=='function')return;
  const params={content_name:payload.campaign||payload.type||location.pathname,content_category:payload.cta_position||payload.service||name};
  const options=payload.event_id?{eventID:payload.event_id}:undefined;window.fbq('track',metaName,params,options);
}
function track(name,payload={}){
  if(!ALLOWED_EVENTS.has(name))return;
  const safe=safePayload({...payload,page:payload.page||location.pathname});
  sendInternal(name,safe);sendGa(name,safe);sendMeta(name,safe);
}
function trackInitial(){
  const payload=safePayload({page:location.pathname});
  if(consent?.analytics&&!pageTracked){pageTracked=true;sendInternal('page_view',payload);sendGa('page_view',payload);if(location.pathname.replace(/\/+$/,'')==='/regalo'){const campaign=safePayload({campaign:'navidad2026',page:location.pathname});sendInternal('campaign_view',campaign);sendGa('campaign_view',campaign)}}
  if(consent?.marketing&&!metaPageTracked){metaPageTracked=true;sendMeta('page_view',payload)}
}
function openPreferences(){
  previousFocus=document.activeElement;const panel=document.querySelector('[data-cookie-panel]'),banner=document.querySelector('[data-cookie-banner]');
  if(!panel)return;banner.hidden=true;panel.hidden=false;
  panel.querySelector('[name="cookie-analytics"]').checked=!!consent?.analytics;panel.querySelector('[name="cookie-marketing"]').checked=!!consent?.marketing;
  panel.querySelector('[data-cookie-save]').focus();
}
function closePreferences(){
  const panel=document.querySelector('[data-cookie-panel]');if(panel)panel.hidden=true;
  const banner=document.querySelector('[data-cookie-banner]');if(banner)banner.hidden=!!consent;
  if(previousFocus instanceof HTMLElement)previousFocus.focus();
}
function mountConsentUi(){
  if(document.querySelector('[data-cookie-banner]'))return;
  document.body.insertAdjacentHTML('beforeend',`<section class="cookie-banner" data-cookie-banner aria-label="Preferencias de cookies"${consent?' hidden':''}><div><strong>Tu privacidad, sin letra pequeña</strong><p>Usamos cookies opcionales de analítica para entender la web y de marketing para medir campañas. Puedes aceptar, rechazar o elegir por finalidad.</p><a href="/cookies">Más información</a></div><div class="cookie-actions"><button type="button" data-cookie-reject>Rechazar</button><button type="button" data-cookie-config>Configurar</button><button type="button" data-cookie-accept>Aceptar todas</button></div></section><div class="cookie-panel" data-cookie-panel hidden><div class="cookie-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-title"><button class="cookie-close" type="button" data-cookie-close aria-label="Cerrar">×</button><h2 id="cookie-title">Configurar cookies</h2><p>Las categorías opcionales están desactivadas por defecto. Puedes cambiar esta elección cuando quieras.</p><label><span><strong>Necesarias</strong><small>Permiten guardar tus preferencias y prestar las funciones solicitadas.</small></span><input type="checkbox" checked disabled aria-label="Cookies necesarias siempre activas"></label><label><span><strong>Analítica</strong><small>Google Analytics 4 y medición first-party para conocer uso y adquisición.</small></span><input type="checkbox" name="cookie-analytics"></label><label><span><strong>Marketing/publicidad</strong><small>Meta Pixel y señales publicitarias de Google, solo cuando exista un activo configurado.</small></span><input type="checkbox" name="cookie-marketing"></label><div class="cookie-dialog-actions"><button type="button" data-cookie-reject>Rechazar todo</button><button type="button" data-cookie-save>Guardar preferencias</button><button type="button" data-cookie-accept>Aceptar todo</button></div><a href="/cookies">Consultar la política de cookies</a></div></div>`);
  let footer=document.querySelector('footer');if(!footer){footer=document.createElement('footer');footer.className='legal-cookie-footer';document.body.append(footer)}if(!footer.querySelector('[data-cookie-settings]')){const button=document.createElement('button');button.type='button';button.className='cookie-settings-link';button.dataset.cookieSettings='';button.textContent='Configurar cookies';footer.append(button)}
  document.querySelectorAll('[data-cookie-accept]').forEach(button=>button.addEventListener('click',()=>writeConsent(true,true)));
  document.querySelectorAll('[data-cookie-reject]').forEach(button=>button.addEventListener('click',()=>writeConsent(false,false)));
  document.querySelectorAll('[data-cookie-config],[data-cookie-settings]').forEach(button=>button.addEventListener('click',openPreferences));
  document.querySelector('[data-cookie-save]').addEventListener('click',()=>writeConsent(document.querySelector('[name="cookie-analytics"]').checked,document.querySelector('[name="cookie-marketing"]').checked));
  document.querySelector('[data-cookie-close]').addEventListener('click',closePreferences);
  document.querySelector('[data-cookie-panel]').addEventListener('click',event=>{if(event.target.matches('[data-cookie-panel]'))closePreferences()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('[data-cookie-panel]').hidden)closePreferences()});
}
function bindInteractions(){
  document.addEventListener('click',event=>{
    const target=event.target instanceof Element?event.target:null;if(!target)return;
    const wa=target.closest('a[href*="wa.me"],a[href*="api.whatsapp.com/send"]');if(wa)track('whatsapp_clicked',{cta_position:wa.dataset.track||wa.closest('section')?.id||'global'});
    const phone=target.closest('a[href^="tel:"]');if(phone)track('phone_clicked',{cta_position:phone.dataset.track||'global'});
    const gift=target.closest('[data-track-cta^="regalo"],[data-track^="regalo"],[data-track-cta="navidad_banner"],[data-track-cta="local_banner"],a[href="#quiero-mi-regalo"]');if(gift)track('gift_cta_clicked',{campaign:'navidad2026',cta_position:gift.dataset.trackCta||gift.dataset.track||'regalo'});
    const offer=target.closest('[data-offer]');if(offer)track('offer_clicked',{offer_id:offer.dataset.offer||'',cta_position:'featured_offer'});
    const cta=target.closest('[data-track-cta]');if(cta&&!document.querySelector('#leadForm'))track('funnel_started',{cta_position:cta.dataset.trackCta||'cta'});
  });
}
window.FibaroAnalytics={track,enrichFormData,openPreferences,getConsent:()=>consent,getAttribution:attribution,measurementId:CONFIG.gaMeasurementId,metaPixelId:CONFIG.metaPixelId||null};
if(consent)applyConsent();
const ready=()=>{mountConsentUi();bindInteractions();if(consent)applyConsent()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
