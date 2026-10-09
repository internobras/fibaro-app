(()=>{'use strict';
const route=location.pathname.replace(/^\/+|\/+$/g,'');
const configs={
 telecom:{interest:'fibra',label:'Fibra y móvil',cta:'Ayúdame a elegir',wa:'Hola Alicia, quiero revisar mi fibra y móvil.'},
 energia:{interest:'energia',label:'Energía',cta:'Revisar mi factura',wa:'Hola Alicia, te envío una foto de mi factura para revisar si puedo mejorar.'},
 empresas:{interest:'empresa',label:'Empresas',cta:'Revisar mi empresa',wa:'Hola Alicia, quiero revisar la conectividad de mi empresa.'},
 'zona-fibaro':{interest:'cobertura',label:'Zona FÍBARO',cta:'Comprobar mi caso',wa:'Hola Alicia, quiero comprobar mi caso en Zona FÍBARO.'},
 'fibra-sanlucar':{interest:'fibra',label:'Sanlúcar',cta:'Comprobar cobertura',wa:'Hola Alicia, soy de Sanlúcar y quiero revisar mi fibra.'},
 'fibra-rota':{interest:'fibra',label:'Rota',cta:'Comprobar cobertura',wa:'Hola Alicia, soy de Rota y quiero revisar mi fibra.'},
 'fibra-chipiona':{interest:'fibra',label:'Chipiona',cta:'Comprobar cobertura',wa:'Hola Alicia, soy de Chipiona y quiero revisar mi fibra.'},
 'fibra-el-puerto':{interest:'fibra',label:'El Puerto',cta:'Comprobar cobertura',wa:'Hola Alicia, soy de El Puerto y quiero revisar mi fibra.'},
 'fibra-jerez':{interest:'fibra',label:'Jerez',cta:'Comprobar cobertura',wa:'Hola Alicia, soy de Jerez y quiero revisar mi fibra.'}
};
const cfg=configs[route];
function meta(property,content){let el=document.querySelector(`meta[property="${property}"],meta[name="${property}"]`);if(!el){el=document.createElement('meta');el.setAttribute(property.startsWith('og:')?'property':'name',property);document.head.append(el)}el.content=content}
const description=document.querySelector('meta[name="description"]')?.content||'';
meta('og:type','website');meta('og:url',location.href.split('?')[0]);meta('og:title',document.title);if(description)meta('og:description',description);meta('og:image','https://www.fibaroteleco.com/alicia.webp');meta('twitter:card','summary_large_image');
if(!document.querySelector('link[rel="icon"]')){const icon=document.createElement('link');icon.rel='icon';icon.type='image/svg+xml';icon.href='/tecnicos/icon.svg';document.head.append(icon)}
document.querySelectorAll('nav').forEach(n=>{if(!n.hasAttribute('aria-label'))n.setAttribute('aria-label','Principal')});
if(!cfg)return;
document.querySelectorAll('a[href="/#contacto"]').forEach(a=>{a.href=`/?interest=${encodeURIComponent(cfg.interest)}#empezar`;if(a.matches('.cta,.pill'))a.textContent=cfg.cta});
document.querySelectorAll('a[href*="wa.me"],a[href*="api.whatsapp.com/send"]').forEach(a=>a.href=`https://wa.me/34633671657?text=${encodeURIComponent(cfg.wa)}`);
const substitutions=new Map([
 ['Historial del caso','Una persona de referencia'],['Prioridad operativa.','Primero, lo que más afecta a tu negocio.'],['Seguimiento único.','Un solo hilo de principio a fin.'],['más control operativo','más cercanía técnica'],['margen operativo','capacidad de coordinación'],['Solicitud, oferta, alta, instalación y seguimiento conservan el mismo contexto.','No tienes que repetir el caso cada vez que avanza el proceso.'],['Alicia continúa el caso con el contexto guardado.','Alicia revisa tu caso y te explica el siguiente paso.']
]);
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){for(const [from,to] of substitutions)if(node.nodeValue.includes(from))node.nodeValue=node.nodeValue.replaceAll(from,to)}
if(route==='energia'){const hero=document.querySelector('.hero .actions');if(hero){const photo=document.createElement('a');photo.className='ghost';photo.href=`https://wa.me/34633671657?text=${encodeURIComponent(cfg.wa)}`;photo.target='_blank';photo.rel='noopener';photo.dataset.track='energia_factura';photo.textContent='Enviar foto de mi factura';hero.append(photo)}}
const sticky=document.createElement('div');sticky.className='seo-mobile-sticky';sticky.innerHTML=`<a href="/?interest=${encodeURIComponent(cfg.interest)}#empezar">${cfg.cta}</a><a href="https://wa.me/34633671657?text=${encodeURIComponent(cfg.wa)}" target="_blank" rel="noopener">WhatsApp</a>`;document.body.append(sticky);
})();
