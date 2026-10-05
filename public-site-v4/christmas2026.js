(()=>{'use strict';
if(window.FIBARO_CHRISTMAS_2026)return;
const campaign=Object.freeze({
 enabled:true,
 name:'Tu regalo por contratar con FÍBARO',
 label:'Navidad 2026',
 startsAt:'2026-10-05T00:00:00+02:00',
 endsAt:'2027-01-06T23:59:59+01:00',
 href:'/regalo',
 zones:['Sanlúcar de Barrameda','Jerez de la Frontera','El Puerto de Santa María','Rota','Chipiona'],
 gifts:Object.freeze({
  fiber:Object.freeze({zone:'Paletilla de jamón',national:'Cheque Amazon de 30 €'}),
  fiberMobile:Object.freeze({zone:'Paletilla o cheque Amazon de 50 €',national:'Cheque Amazon de 50 €'}),
  energy:Object.freeze({zone:'Paletilla de jamón',national:'Cheque Amazon de 30 €'}),
 }),
 headline:'¿Ya tienes tu jamón?',
 copy:'Contrata fibra o luz con FÍBARO y llévate tu regalo de Navidad.',
 zoneCopy:'En nuestra zona, paletilla. Fuera de nuestra zona, cheque Amazon.',
 summary:'Un regalo por cada servicio distinto contratado. Válido para particulares y empresas, sujeto a activación y condiciones de la promoción.',
 legalHref:'/regalo#condiciones',
});
window.FIBARO_CHRISTMAS_2026=campaign;
const now=Date.now(),active=campaign.enabled&&now>=Date.parse(campaign.startsAt)&&now<=Date.parse(campaign.endsAt);
document.documentElement.classList.toggle('christmas-campaign-active',active);
document.documentElement.classList.toggle('christmas-campaign-ended',!active&&now>Date.parse(campaign.endsAt));
const safe=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const secondaryRoutes=new Set(['telecom','energia','empresas','fibra-sanlucar','fibra-jerez','fibra-el-puerto','fibra-rota','fibra-chipiona']);
const route=location.pathname.replace(/^\/+|\/+$/g,'');
if(active&&secondaryRoutes.has(route)&&!document.querySelector('[data-christmas-banner]')){const mount=document.createElement('div');mount.dataset.christmasBanner='';mount.dataset.variant='compact';mount.dataset.position=route.startsWith('fibra-')?'local_banner':'navidad_banner';document.querySelector('main .hero')?.after(mount)}
document.querySelectorAll('[data-christmas-banner]').forEach((mount,index)=>{
 if(!active){mount.hidden=true;return}
 const compact=mount.dataset.variant==='compact',position=mount.dataset.position||(compact?'local_banner':'navidad_banner');
 mount.innerHTML=`<section class="christmas-promo ${compact?'christmas-promo--compact':''}" aria-labelledby="christmas-title-${index}"><div class="christmas-promo__inner"><div><span class="christmas-promo__eyebrow">${safe(campaign.label)}</span><h2 id="christmas-title-${index}">${safe(campaign.headline)}</h2><p>${safe(compact?'Contrata con FÍBARO y llévate tu regalo.':campaign.copy)}</p>${compact?'':`<p class="christmas-promo__zone">${safe(campaign.zoneCopy)}</p>`}</div><div class="christmas-promo__actions"><a class="christmas-promo__cta" href="${safe(campaign.href)}" data-track-cta="${safe(position)}">${compact?'Ver promoción':'Ver mi regalo'}</a><a class="christmas-promo__legal" href="${safe(campaign.legalHref)}">Válido hasta el 6 de enero de 2027. Consulta condiciones.</a></div></div></section>`;
});
const ended=document.querySelector('[data-campaign-ended]');
if(ended)ended.hidden=active||now<=Date.parse(campaign.endsAt);
})();
