const serviceNames={"en": ["Technical analysis", "Innovation execution", "Product data and documentation", "Supplier and manufacturer coordination", "Technical brand activation", "AI-assisted operations"], "es": ["Análisis técnico", "Ejecución de innovación", "Datos y documentación de producto", "Coordinación de proveedores y fabricantes", "Activación técnica de marca", "Operaciones asistidas por IA"]};
'use strict';
let language='en';
try { const saved=localStorage.getItem('thinkp-language'); if(saved==='es'||saved==='en') language=saved; } catch (_) {}
const dialog=document.getElementById('explorer');
const dialogBody=dialog.querySelector('.dialog-body');
let modalStack=[],returnFocus=null,savedScroll=0;
const draft={service:'0',message:''};
const titles={needs:['Find your starting point','Encuentra tu punto de partida'],expertise:['Our expertise','Nuestras especialidades'],service:['Our expertise','Nuestras especialidades'],contact:['Tell us what you need','Cuéntanos qué necesitas']};
function mailForService(index,lang=language){
 const name=serviceNames[lang][index];
 const subject=(lang==='es'?'Consulta de apoyo técnico — ':'Technical support enquiry — ')+name;
 const body=lang==='es'
  ?'Hola Think P,\n\nMe gustaría conversar sobre '+name.toLowerCase()+'.\n\nLa necesidad que quisiera definir:\n\nLa decisión o fecha límite involucrada:\n\nPor favor, indíquenme qué información ayudaría a definir el siguiente paso.'
  :'Hello Think P,\n\nI would like to discuss '+name.toLowerCase()+'.\n\nThe need I would like to scope:\n\nThe decision or deadline involved:\n\nPlease let me know what inputs would help us define the next step.';
 return 'mailto:contact.think.p@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
function thinkPEmail(index,message,lang=language){
 const subject=(lang==='es'?'Consulta Think P — ':'Think P enquiry — ')+serviceNames[lang][index];
 const body=(lang==='es'?'Hola Think P,\n\n':'Hello Think P,\n\n')+message.trim()+(lang==='es'?'\n\nMe gustaría conversar sobre el siguiente paso con su equipo.':'\n\nI would like to discuss the next step with your team.');
 return 'mailto:contact.think.p@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
function applyLanguage(){
 document.documentElement.lang=language;
 document.title=language==='es'?'Think P | Tu aliado técnico':'Think P | Your technical partner';
 document.querySelectorAll('[data-en][data-es]').forEach(el=>el.textContent=el.dataset[language]);
 document.querySelectorAll('[data-alt-en]').forEach(el=>el.setAttribute('aria-label',el.dataset[language==='en'?'altEn':'altEs']));
 document.querySelectorAll('[data-placeholder-en]').forEach(el=>el.placeholder=el.dataset[language==='en'?'placeholderEn':'placeholderEs']);
 document.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===language)));
 document.querySelectorAll('[data-mail-service]').forEach(el=>el.href=mailForService(Number(el.dataset.mailService)));
 if(modalStack.length) document.getElementById('dialog-title').textContent=titles[modalStack.at(-1).view][language==='es'?1:0];
 try {localStorage.setItem('thinkp-language',language);}catch(_){}
}
function setCard(carousel,index){
 index=Math.max(0,Math.min(5,index));
 carousel.dataset.current=String(index);
 carousel.querySelectorAll('[data-card]').forEach(el=>el.hidden=Number(el.dataset.card)!==index);
 carousel.querySelectorAll('[data-action="need"]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.index)===index)));
 carousel.querySelector('.counter').textContent=String(index+1).padStart(2,'0')+' / 06';
 carousel.querySelector('.progress span').style.width=((index+1)/6*100)+'%';
 carousel.querySelector('[data-action="previous"]').disabled=index===0;
 carousel.querySelector('[data-action="next"]').disabled=index===5;
 const active=carousel.querySelector('[data-action="need"][aria-pressed="true"]');
 const strip=carousel.querySelector('.need-tabs');
 const delta=active.getBoundingClientRect().left-strip.getBoundingClientRect().left;
 if(delta<0||delta+active.offsetWidth>strip.clientWidth) strip.scrollLeft+=delta-12;
 const view=modalStack.at(-1); if(dialog.contains(carousel)&&view) view.index=index;
}
function saveDraft(){
 const f=dialogBody.querySelector('.enquiry-form');
 if(f){draft.service=f.elements.subject.value;draft.message=f.elements.body.value;}
}
function renderModal(state){
 saveDraft();
 dialogBody.replaceChildren();
 if(state.view==='needs'){
  dialogBody.append(document.querySelector('#needs .carousel').cloneNode(true));
  setCard(dialogBody.querySelector('.carousel'),state.index??0);
 }else if(state.view==='expertise'||state.view==='service'){
  const grid=document.querySelector('#portfolio .service-grid').cloneNode(true);
  grid.querySelectorAll('details').forEach(el=>el.open=state.view==='service'&&Number(el.dataset.serviceId)===state.index);
  dialogBody.append(grid);
 }else if(state.view==='contact'){
  dialogBody.append(document.getElementById('contact-template').content.cloneNode(true));
  const f=dialogBody.querySelector('form');f.elements.subject.value=draft.service;f.elements.body.value=draft.message;
 }
 dialog.querySelector('[data-action="back"]').hidden=modalStack.length<2;
 applyLanguage();dialogBody.scrollTop=0;
 dialog.querySelector('[data-action="close"]').focus({preventScroll:true});
}
function openModal(view,index){
 if(!dialog.open){
  returnFocus=document.activeElement;savedScroll=window.scrollY;
  document.body.style.position='fixed';document.body.style.top=-savedScroll+'px';document.body.style.width='100%';
  modalStack=[];dialog.showModal();
 }
 modalStack.push({view,index});renderModal(modalStack.at(-1));
}
function closeModal(){if(dialog.open) dialog.close();}
dialog.addEventListener('close',()=>{
 saveDraft();modalStack=[];document.body.style.position='';document.body.style.top='';document.body.style.width='';
 const old=document.documentElement.style.scrollBehavior;document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,savedScroll);document.documentElement.style.scrollBehavior=old;
 if(returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
});
dialog.addEventListener('click',event=>{if(event.target===dialog)closeModal();});
document.addEventListener('click',event=>{
 const lang=event.target.closest('[data-language]');
 if(lang){language=lang.dataset.language;applyLanguage();return;}
 const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
 const action=el.dataset.action;
 if(action==='close'){closeModal();return;}
 if(action==='back'){saveDraft();modalStack.pop();renderModal(modalStack.at(-1));return;}
 if(['needs','expertise','contact'].includes(action)){openModal(action,action==='needs'?Number(document.querySelector('#needs .carousel').dataset.current):undefined);return;}
 if(action==='service'){openModal('service',Number(el.dataset.service));return;}
 const c=el.closest('.carousel');if(!c)return;
 const i=Number(c.dataset.current);
 if(action==='need')setCard(c,Number(el.dataset.index));
 else if(action==='previous')setCard(c,i-1);
 else if(action==='next')setCard(c,i+1);
});
document.addEventListener('keydown',event=>{
 const tab=event.target.closest('[data-action="need"]');if(!tab)return;
 const c=tab.closest('.carousel');const i=Number(c.dataset.current);
 let n;if(event.key==='ArrowRight')n=Math.min(5,i+1);else if(event.key==='ArrowLeft')n=Math.max(0,i-1);else if(event.key==='Home')n=0;else if(event.key==='End')n=5;else return;
 event.preventDefault();setCard(c,n);c.querySelector('[data-index="'+n+'"]').focus({preventScroll:true});
});
let swipe=null;
document.addEventListener('touchstart',event=>{
 const area=event.target.closest('.cards');
 if(area&&!event.target.closest('button,a,input,textarea,select')) swipe={area,x:event.touches[0].clientX,y:event.touches[0].clientY};else swipe=null;
},{passive:true});
document.addEventListener('touchend',event=>{
 if(!swipe)return;const dx=event.changedTouches[0].clientX-swipe.x,dy=event.changedTouches[0].clientY-swipe.y;
 if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5){const c=swipe.area.closest('.carousel');setCard(c,Number(c.dataset.current)+(dx<0?1:-1));}swipe=null;
},{passive:true});
document.addEventListener('submit',event=>{
 if(!event.target.matches('.enquiry-form'))return;
 event.preventDefault();const f=event.target;if(!f.reportValidity())return;
 const message=f.elements.body.value.trim();if(!message){f.elements.body.focus();return;}
 saveDraft();window.location.href=thinkPEmail(Number(f.elements.subject.value),message);
});
applyLanguage();
