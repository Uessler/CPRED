(async function(){
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const call=async(action,args)=>{const r=await fetch('macro:api@lib:local.sexored.red',{method:'POST',body:JSON.stringify(Object.assign({action},args||{}))});const s=await r.text();return JSON.parse(s);};
 const report=async(msg)=>fetch('macro:testReport@lib:local.sexored.red',{method:'POST',body:msg});
 try {
  await delay(2000);
  await report('START '+location.protocol);
  const r=await call('create');
  const d=RedModel.normalize({handle:'Echo · exemplo próprio',stats:{REF:7,DEX:6,INT:6,TECH:5,COOL:6,WILL:6,BODY:6,EMP:5,LUCK:5,MOVE:6},skills:{Pistolas:6,Percepção:4,Esquiva:4},hp:31,maxHp:40,bodySp:11,headSp:11,role:'Solo',weapons:[{name:'Arma de teste',skill:'Pistolas',damage:'3d6',ammo:8,magazine:8}],items:[{name:'Agent',qty:1,notes:'Anotações próprias'}]});
  await call('save',{id:r.id,data:d});
  const loaded=await call('load',{id:r.id});
  const read=typeof loaded.data==='string'?JSON.parse(loaded.data):loaded.data;
  if(read.hp!==31||read.stats.REF!==7)throw Error('Persistence failed');
  await report('PERSISTENCE_OK');
  const roll=await call('roll',{id:r.id,base:13,modifier:-2,label:'Teste de integração'});
  if(typeof roll.total!=='number')throw Error('Roll failed');
  await call('damage',{id:r.id,count:3,bonus:0,label:'Arma de teste'});
  await report('ROLL_DAMAGE_OK');
  document.getElementById('refresh').click();
  await delay(900);
  if(document.getElementById('handle').value!==d.handle)throw Error('UI load failed: '+document.getElementById('notice').textContent);
  document.querySelector('[data-tab="skills"]').click();
  if(document.querySelectorAll('.skill-row').length<60)throw Error('Skills missing');
  await report('SKILLS_OK '+document.querySelectorAll('.skill-row').length);
document.querySelector('[data-tab="gear"]').click();
document.querySelector('[data-attack="0"]').click();
await delay(600);
const ammoCheck=await call('load',{id:r.id});
const ammoData=typeof ammoCheck.data==='string'?JSON.parse(ammoCheck.data):ammoCheck.data;
if(ammoData.weapons[0].ammo!==7)throw Error('Ammo persistence failed '+JSON.stringify(ammoData.weapons[0]));
await report('ATTACK_AMMO_OK');
document.getElementById('export').click();await delay(350);
if(!document.getElementById('export-dialog').open)throw Error('Export dialog failed');
JSON.parse(document.getElementById('export-text').value);
document.getElementById('export-dialog').close();
await report('EXPORT_OK');
  document.querySelector('[data-tab="overview"]').click();
  await report('ALL_OK name='+document.getElementById('handle').value+' background='+getComputedStyle(document.body).backgroundColor);
 } catch(e){await report('FAILED '+e.message);}
})();

