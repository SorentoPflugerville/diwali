'use strict';
const cfg=window.EVENT, $=id=>document.getElementById(id), form=$('rsvpForm');
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
$('date').textContent=cfg.dateLabel;$('time').textContent=cfg.time;$('venue').textContent=cfg.venue;
$('rsvpDeadline').textContent=cfg.rsvpDeadlineLabel;$('paymentDeadline').textContent=cfg.paymentDeadlineLabel;
const live=/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(cfg.endpoint);
$('preview').hidden=live;if(live)form.action=cfg.endpoint;
$('requestId').value=crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(36).slice(2);
const groups=[['adults','Adults','Ages 18+',cfg.adultPrice,2,1],['children','Children','Ages 3–17',cfg.childPrice,0,0],['infants','Little ones','Under 3 · Free',0,0,0]];
for(const [id,label,age,price,value,min] of groups){
 const row=document.createElement('div');row.className='counter';
 row.innerHTML=`<div><strong id="${id}Label">${label}</strong><small>${age}${price?' · '+money(price)+' each':''}</small></div><div class="stepper"><button type="button" aria-label="Fewer ${label.toLowerCase()}">−</button><input id="${id}" name="${id}" type="number" min="${min}" max="20" value="${value}" required aria-labelledby="${id}Label"><button type="button" aria-label="More ${label.toLowerCase()}">+</button></div>`;
 $('counters').append(row);const input=$(id),buttons=row.querySelectorAll('button');
 buttons.forEach((b,i)=>b.onclick=()=>{input.value=Math.max(min,Math.min(20,(Number(input.value)||0)+(i?1:-1)));update()});input.oninput=update;
}
function update(){let total=0,people=0;$('breakdown').replaceChildren();for(const [id,label,,price,,min] of groups){const count=Number($(id).value)||0;total+=count*price;people+=count;const buttons=$(id).parentElement.querySelectorAll('button');buttons[0].disabled=count<=min;buttons[1].disabled=count>=20;const row=document.createElement('div');row.className='summary-row';row.innerHTML=`<span>${count} × ${label.toLowerCase()}</span><span>${price?money(count*price):'Free'}</span>`;$('breakdown').append(row)}$('total').textContent=money(total);$('guestTotal').textContent=people+' guests in your group';$('mobileGuests').textContent=people+' guests';$('mobileTotal').textContent=money(total)}update();
$('relationship').onchange=()=>{const guest=$('relationship').value==='Guest';$('addressLabel').textContent=guest?'Name of your Sorento host':'Street address in Sorento';$('address').placeholder=guest?'Host’s full name':'Street address'};
$('payment').onchange=()=>{$('payerWrap').hidden=$('payment').value!=='Reported';$('payer').required=!$('payerWrap').hidden};
for(const r of cfg.zelle){const box=document.createElement('div');box.className='recipient';const text=document.createElement('span');text.textContent=`Zelle: ${r.name} · ${r.destination}`;const copy=document.createElement('button');copy.type='button';copy.textContent='Copy';copy.onclick=async()=>{try{await navigator.clipboard.writeText(r.destination);copy.textContent='Copied'}catch{copy.textContent='Select & copy'}};box.append(copy,text);$('zelle').append(box)}
if(!cfg.zelle.length){const p=document.createElement('p');p.className='muted';p.textContent='Payment details will be announced. Your places can still be reserved once registration opens.';$('zelle').append(p);$('payment').options[1].disabled=true}
if(!cfg.contacts.length){$('contacts').textContent='Organizer contact details will be announced.'}else for(const c of cfg.contacts){const p=document.createElement('p');p.textContent=`${c.name} · ${c.phone}`;$('contacts').append(p)}
if(cfg.photo2025){const fig=$('photo2025');const a=document.createElement('a');a.href=cfg.photo2025;a.target='_blank';a.rel='noopener';const img=document.createElement('img');img.src=cfg.photo2025;img.alt='Sorento Diwali celebration, 2025';img.loading='lazy';a.append(img);const cap=document.createElement('figcaption');cap.textContent='Diwali 2025';fig.append(a,cap);fig.hidden=false}
form.addEventListener('submit',e=>{if(step<2){e.preventDefault();advance();return}if(!validateStep(2)){e.preventDefault();return}if(!live){e.preventDefault();$('formError').textContent='Preview only — registration is not open yet. Nothing has been sent or reserved.';return}$('formError').textContent='';$('submit').disabled=true;$('submit').textContent='Saving your reservation…'});
window.addEventListener('pageshow',()=>{$('submit').disabled=false;$('submit').innerHTML='Reserve my places <span>✦</span>'});

// Guest-first flow: shorter mobile screens, one clear action per step.
const fields=Array.from(form.querySelectorAll('fieldset'));
const panels=[fields[1],fields[0],fields[2]];
let step=0;
form.noValidate=true;
const labels=['Your group','Your details','Review & reserve'];
labels.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(i+1)+'. '+label;b.onclick=()=>{if(i<=step){step=i;showStep()}else if(validateStep(step)){step++;showStep()}};$('stepProgress').append(b)});
function validateStep(i){for(const el of panels[i].querySelectorAll('input,select')){if(!el.checkValidity()){el.reportValidity();return false}}return true}
function advance(){if(validateStep(step)){step=Math.min(2,step+1);showStep()}}
function showStep(){panels.forEach((p,i)=>p.hidden=i!==step);$('stepProgress').querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-current',i===step?'step':'false');b.disabled=i>step+1});$('backStep').hidden=step===0;$('nextStep').hidden=step===2;$('submit').hidden=step!==2;$('review').hidden=step!==2;$('formError').textContent='';if(step===2){$('review').replaceChildren();const title=document.createElement('strong');title.textContent='Check your reservation';const details=document.createElement('p');details.textContent=form.elements.name.value+' · '+form.elements.email.value;const counts=document.createElement('p');counts.textContent=$('adults').value+' adults, '+$('children').value+' children (3+), '+$('infants').value+' under 3 · '+$('mobileTotal').textContent;$('review').append(title,details,counts)} }
$('nextStep').onclick=advance;$('backStep').onclick=()=>{step=Math.max(0,step-1);showStep()};showStep();
