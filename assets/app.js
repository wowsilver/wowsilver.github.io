'use strict';
const q=(s,root=document)=>root.querySelector(s);
const qa=(s,root=document)=>Array.from(root.querySelectorAll(s));
const menu=q('.menu-toggle'),nav=q('#navigation');
if(menu&&nav){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('open',open)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');menu.focus()}})}
const params=new URLSearchParams(location.search);
const allowedInterests={sea:['turkey','egypt','thailand','uae','maldives'],culture:['turkey','thailand','uae','russia'],nature:['turkey','thailand','maldives','russia']};
const interestNames={sea:'Море и пляж',culture:'Прогулки и впечатления',nature:'Природа и тишина'};
qa('[data-filter-group]').forEach(group=>{
 let format=['family','couple','short'].includes(params.get('format'))?params.get('format'):'all';
 let interest=Object.hasOwn(allowedInterests,params.get('interest'))?params.get('interest'):'all';
 const cards=qa('.destination-card',group),buttons=qa('[data-filter]',group),count=q('.catalog-count',group),empty=q('.empty-state',group),note=q('.interest-note',group);
 function apply(){let n=0;cards.forEach(c=>{const shown=(format==='all'||c.dataset.formats.split(' ').includes(format))&&(interest==='all'||allowedInterests[interest].includes(c.dataset.destination));c.hidden=!shown;if(shown)n++});buttons.forEach(b=>{const a=b.dataset.filter===format;b.classList.toggle('active',a);b.setAttribute('aria-pressed',String(a))});if(count)count.textContent=`Показано направлений: ${n}`;if(empty)empty.hidden=n>0;const status=q('.filter-status',group);if(status)status.textContent=`Показано направлений: ${n}`;if(note){note.hidden=interest==='all';note.replaceChildren();if(interest!=='all'){const text=document.createElement('span');text.textContent='Ваш интерес: '+interestNames[interest];const reset=document.createElement('button');reset.type='button';reset.textContent='Сбросить';reset.addEventListener('click',()=>{interest='all';apply()});note.append(text,reset)}}}
 buttons.forEach(b=>b.addEventListener('click',()=>{format=b.dataset.filter;apply()}));apply();
});
let toastTimer;
function toast(message){const el=q('.toast');if(!el)return;el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3500)}
const form=q('#trip-form');
if(form){
 const countries={undecided:'Пока не определились',turkey:'Турция',egypt:'Египет',thailand:'Таиланд',uae:'ОАЭ',maldives:'Мальдивы',russia:'Россия'};
 const date=new Date();q('#trip-month').min=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
 const destination=params.get('destination');if(Object.hasOwn(countries,destination))q('#destination').value=destination;
 let brief='';
 function childFields(){const container=q('#child-ages'),num=Number(q('#children').value);const values=qa('select',container).map(x=>x.value);container.replaceChildren();container.hidden=num===0;for(let i=0;i<num;i++){const label=document.createElement('label');label.htmlFor=`child-${i}`;label.textContent=`Возраст ребёнка ${i+1}`;const select=document.createElement('select');select.id=`child-${i}`;select.name=`child-${i}`;select.required=true;const blank=document.createElement('option');blank.value='';blank.textContent='Выберите возраст';select.append(blank);for(let age=0;age<18;age++){const op=document.createElement('option');op.value=String(age);op.textContent=age===0?'До года':`${age} лет`;select.append(op)}if(values[i]!==undefined)select.value=values[i];label.append(select);container.append(label)}}
 function monthLabel(value){if(!value)return'Гибкие даты';const [y,m]=value.split('-');return new Intl.DateTimeFormat('ru',{month:'long',year:'numeric'}).format(new Date(Number(y),Number(m)-1,1))}
 function data(){return {destination:countries[q('#destination').value],month:monthLabel(q('#trip-month').value),duration:q('#duration').value,adults:q('#adults').value,children:q('#children').value,ages:qa('#child-ages select').map(s=>s.value===''?'не указан':s.value==='0'?'до года':s.value+' лет'),budget:q('#budget').value,interests:qa('input[name=interest]:checked').map(i=>i.value),meal:q('#meal').value,flight:q('#flight').value,pace:q('#trip-pace').value,room:q('#room').value,priority:q('#priority').value}}
 function summary(){const d=data();q('#summary-title').textContent=d.destination==='Пока не определились'?'Начнём с идеи':d.destination;directionSummary();const rows=[['Откуда','Санкт-Петербург'],['Когда',d.month],['На сколько',d.duration],['Состав',`${d.adults||'—'} взр. · ${d.children} дет.`],['Бюджет / человек',d.budget]];const dl=q('#live-summary');dl.replaceChildren();for(const [a,b] of rows){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=a;dd.textContent=b;row.append(dt,dd);dl.append(row)}}
 function invalidate(){const result=q('#trip-result');if(!result.hidden){result.hidden=true;brief=''}q('#form-error').hidden=true;summary()}
 function directionSummary(){
  const item=travelDirections[q('#destination').value];
  const photo=q('.summary-photo img');photo.src='assets/'+(item?item.image:'maldives')+'.jpg';photo.alt=item?item.alt:'Пляж на Мальдивах';
  const list=q('#destination-questions');list.replaceChildren();
  const questions=item?item.ask:['Что входит в итоговую стоимость','Как расположение подходит вашему плану','Какие услуги оплачиваются отдельно'];
  questions.forEach(text=>{const li=document.createElement('li');li.textContent=text;list.append(li)});
  const link=q('#destination-guide');link.href=item?q('#destination').value+'.html':'destinations.html';link.textContent=item?'Подробнее: '+item.name+' ↗':'Посмотреть идеи ↗';
 }
 const preset=params.get('format');
 if(preset==='family')q('#children').value='1';
 if(preset==='short')q('#duration').value='3–5 дней';
 if(preset==='couple')q('#trip-pace').value='Чередовать отдых и впечатления';
 q('#children').addEventListener('change',()=>{childFields();invalidate()});form.addEventListener('input',invalidate);form.addEventListener('change',invalidate);childFields();summary();
 form.addEventListener('submit',e=>{e.preventDefault();const err=q('#form-error');err.hidden=true;if(!form.checkValidity()){err.textContent='Проверьте число взрослых, месяц поездки и возраст каждого ребёнка.';err.hidden=false;form.reportValidity();return}const d=data();brief=`ПЛАН ПОЕЗДКИ\n\nГород отправления: Санкт-Петербург\nНаправление: ${d.destination}\nКогда: ${d.month}\nПродолжительность: ${d.duration}\nВзрослые: ${d.adults}\nДети: ${d.children}${d.ages.length?' (возраст: '+d.ages.join(', ')+')':''}\nБюджет на человека: ${d.budget}\nИнтересы: ${d.interests.join(', ')||'Обсудим варианты'}\nПитание: ${d.meal}\nДорога: ${d.flight}\nРитм отдыха: ${d.pace}\nРазмещение: ${d.room}\nГлавное при подборе: ${d.priority}\n\nВопросы по направлению:\n${(travelDirections[q('#destination').value]?.ask||['Сравнить подходящие направления']).map(x=>'— '+x).join('\n')}\n\nЧто уточнить: итоговая стоимость, включённые услуги, доплаты, условия размещения и изменения поездки.\n\nПлан сформирован на демонстрационном сайте. Он не является заявкой или бронированием.`;q('#brief-text').textContent=brief;q('#trip-result').hidden=false;q('#result-heading').focus({preventScroll:true});q('#trip-result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})
 });
 q('#copy-brief').addEventListener('click',async()=>{if(!brief)return;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(brief)}else{const field=document.createElement('textarea');field.value=brief;field.setAttribute('readonly','');field.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw new Error('copy unavailable')}toast('План скопирован')}catch{toast('Копирование недоступно. Скачайте план или выделите текст.')}});
 q('#download-brief').addEventListener('click',()=>{if(!brief)return;const blob=new Blob(['\ufeff'+brief],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='plan-poezdki-imp-travel.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('План сохранён в текстовый файл')});
}


// Comparison stays in the open page; no accounts or stored personal data.
const compareButtons=qa('[data-compare]');
if(compareButtons.length){
 const selected=new Set(),show=q('#show-comparison'),clear=q('#clear-comparison');
 const section=q('#comparison'),table=q('#comparison-table');
 function renderComparison(){
  table.replaceChildren();
  if(selected.size<2){section.hidden=true;return}
  const items=Array.from(selected).map(id=>({id,...travelDirections[id]}));
  const caption=document.createElement('caption');caption.textContent='Сравнение выбранных направлений';caption.className='sr-only';table.append(caption);
  const thead=document.createElement('thead'),head=document.createElement('tr');
  const corner=document.createElement('th');corner.scope='col';corner.textContent='На что смотрим';head.append(corner);
  items.forEach(item=>{const th=document.createElement('th');th.scope='col';const a=document.createElement('a');a.href=item.id+'.html';a.textContent=item.name;th.append(a);head.append(th)});thead.append(head);table.append(thead);
  const tbody=document.createElement('tbody');
  [['Главное в отдыхе','focus'],['Возможный ритм','pace'],['Ваш запрос','fit'],['Вопросы перед выбором','ask'],['Следующий шаг','action']].forEach(([label,key])=>{
   const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=label;tr.append(th);
   items.forEach(item=>{const td=document.createElement('td');
    if(key==='ask'){const ul=document.createElement('ul');item.ask.forEach(text=>{const li=document.createElement('li');li.textContent=text;ul.append(li)});td.append(ul)}
    else if(key==='action'){const a=document.createElement('a');a.href='planner.html?destination='+item.id;a.className='table-cta';a.textContent='Спланировать поездку ↗';td.append(a)}
    else td.textContent=item[key];tr.append(td)
   });tbody.append(tr)
  });table.append(tbody);
 }
 function updateComparison(){
  compareButtons.forEach(button=>{const active=selected.has(button.dataset.compare);button.setAttribute('aria-pressed',String(active));button.disabled=selected.size===3&&!active;button.textContent=active?'✓ В сравнении':'+ Сравнить';button.setAttribute('aria-label',(active?'Убрать из сравнения: ':'Добавить в сравнение: ')+travelDirections[button.dataset.compare].name)});
  q('#compare-count').textContent=String(selected.size);show.disabled=selected.size<2;clear.hidden=!selected.size;
  q('#compare-status').textContent=selected.size===0?'Выберите 2–3 направления для сравнения.':selected.size===1?'Выбрано одно направление. Добавьте ещё одно.':selected.size===3?'Выбрано 3 направления. Чтобы добавить другое, уберите одно из выбранных.':'Выбрано 2 направления. Можно сравнить или добавить третье.';
  renderComparison();
 }
 compareButtons.forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.compare;if(selected.has(id))selected.delete(id);else if(selected.size<3)selected.add(id);updateComparison()}));
 clear.addEventListener('click',()=>{selected.clear();updateComparison()});
 show.addEventListener('click',()=>{if(selected.size<2)return;section.hidden=false;renderComparison();q('#comparison-title').focus({preventScroll:true});section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})});
 updateComparison();
}
