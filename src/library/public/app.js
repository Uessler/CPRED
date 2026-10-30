(function(){
  'use strict';
  const M=window.RedModel,$=id=>document.getElementById(id),esc=s=>String(s===undefined?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const live=location.protocol==='lib:', previewKey='sexored.preview.v1';
  const portraitCatalog=window.RedPortraits||[];
  const catalog=portraitCatalog.concat(window.RedTokens||[]);
  let galleryPage=0;
  let tokenId='',data=null,dirty=false,busy=false,feed=[];
  function notice(msg){$('notice').textContent=msg||'';$('notice').hidden=!msg;}
  function changed(){dirty=true;$('save-state').textContent='Alterações não salvas';$('save-state').style.color='#edbb80';}
  function saved(){dirty=false;$('save-state').textContent='Salvo no token';$('save-state').style.color='';}
  function renderTokens(){const q=$('token-search').value.toLocaleLowerCase('pt-BR'),category=$('token-category').value;const found=catalog.filter(t=>(!category||t.category===category)&&(t.name+' '+t.group+' '+t.category).toLocaleLowerCase('pt-BR').includes(q));galleryPage=Math.max(0,Math.min(galleryPage,Math.ceil(found.length/60)-1));$('gallery-count').textContent=found.length+' de '+catalog.length+' tokens · Página '+(galleryPage+1)+' de '+Math.max(1,Math.ceil(found.length/60));$('token-prev').disabled=galleryPage===0;$('token-next').disabled=(galleryPage+1)*60>=found.length;$('token-grid').innerHTML=found.slice(galleryPage*60,(galleryPage+1)*60).map(t=>'<button class="token-card" data-spawn="'+t.id+'" title="Adicionar '+esc(t.name)+'"><img loading="lazy" src="'+(t.id.startsWith('p')?'portraits/':'tokens/')+t.id+'.png" alt="'+esc(t.name)+'"><span>'+esc(t.name)+'</span><small>'+esc(t.group)+'</small></button>').join('');}
  function safeLocalRead(){try{return JSON.parse(localStorage.getItem(previewKey)||'null');}catch(_){return null;}}
  async function api(action,args){
    if(!live){
      if(action==='list')return {ok:1,tokens:[{id:'preview',name:(safeLocalRead()||{}).handle||'Novo edgerunner'}],selected:['preview'],gm:1};
      if(action==='load')return {ok:1,data:safeLocalRead()||{},name:'Novo edgerunner'};
      if(action==='save'){localStorage.setItem(previewKey,JSON.stringify(args.data));return {ok:1};}
      if(action==='create')return {ok:1,id:'preview'};
      if(action==='roll')return M.rollCheck(args.base,args.modifier,Math.random);
      if(action==='damage')return M.rollDamage(args.expression,Math.random);
    }
    const response=await fetch('macro:api@lib:local.sexored.red',{method:'POST',body:JSON.stringify(Object.assign({action},args||{}))});
    const body=await response.text();let result;try{result=JSON.parse(body);}catch(_){throw Error('MapTool: '+body.replace(/<[^>]*>/g,' ').slice(0,500));}
    if(!result.ok)throw Error(result.error||'Falha no MapTool.');return result;
  }
  async function protect(fn){if(busy)return;busy=true;notice('');try{await fn();}catch(e){notice(e.message||String(e));}finally{busy=false;}}
  async function save(){if(!data)return;const normalized=M.normalize(data);await api('save',{id:tokenId,data:normalized});saved();const op=$('tokens').selectedOptions[0];if(op)op.textContent=normalized.handle;}
  async function load(id){if(!id)return;if(dirty)await save();const r=await api('load',{id});tokenId=id;let d=r.data;if(typeof d==='string')d=JSON.parse(d);data=M.normalize(d,r.name);feed=[];render();saved();$('empty').hidden=true;$('sheet').hidden=false;}
  async function refresh(prefer){if(dirty)await save();const r=await api('list');const tokens=r.tokens||[];$('tokens').innerHTML=tokens.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('');$('create').hidden=!r.gm;const selected=tokens.find(t=>t.id===prefer)||tokens.find(t=>(r.selected||[]).includes(t.id))||tokens[0];if(selected){$('tokens').value=selected.id;await load(selected.id);}else{$('sheet').hidden=true;$('empty').hidden=false;data=null;tokenId='';}}
  function render(){
    document.querySelectorAll('[data-field]').forEach(el=>{el.value=data[el.dataset.field]===undefined?'':data[el.dataset.field];});
    $('stats').innerHTML=M.stats.map(([id,name])=>'<div class="stat"><label for="stat-'+id+'">'+id+'</label><input id="stat-'+id+'" data-stat="'+id+'" type="number" min="0" max="30" value="'+data.stats[id]+'"><small>'+name+'</small></div>').join('');
    renderVitals();renderSkills();renderGear();renderLife();renderFeed();window.dispatchEvent(new Event('sexored:change'));
  }
  function renderVitals(){const hp=Math.max(0,Math.min(100,data.hp/data.maxHp*100));$('hp-meter').style.width=hp+'%';$('luck-max').textContent=data.stats.LUCK;$('wound-state').textContent=data.hp===0?'MORTALMENTE FERIDO':data.hp<Math.ceil(data.maxHp/2)?'GRAVEMENTE FERIDO · MODIFICADORES MANUAIS':'OPERACIONAL';}
  function renderSkills(){
    const query=$('skill-search').value.toLocaleLowerCase('pt-BR');
    $('skill-list').innerHTML=M.groups.map(([g])=>{const ss=M.skills.filter(s=>s.group===g&&(s.name+' '+g).toLocaleLowerCase('pt-BR').includes(query));if(!ss.length)return '';return '<article class="skill-group"><h3>'+g+'</h3>'+ss.map(s=>'<div class="skill-row"><button data-roll="'+esc(s.id)+'" title="Rolar '+esc(s.name)+'">'+s.name+(s.cost===2?' <small>×2</small>':'')+'</button><small>'+s.stat+'</small>'+(['Idioma','Ciência','Conhecimento local','Artes marciais','Tocar instrumento'].includes(s.id)?'<input class="specialty" data-specialty="'+esc(s.id)+'" value="'+esc(data.specialties[s.id])+'" placeholder="Especialidade" aria-label="Especialidade de '+esc(s.name)+'">':'')+'<input data-skill="'+esc(s.id)+'" type="number" min="0" max="10" value="'+(data.skills[s.id]||0)+'" aria-label="Nível de '+esc(s.name)+'"><span class="base">'+M.skillBase(data,s.id)+'</span></div>').join('')+'</article>';}).join('');
  }
  function inputField(label,collection,i,key,type,extra){const item=data[collection][i];return '<label>'+label+'<input data-collection="'+collection+'" data-index="'+i+'" data-key="'+key+'" type="'+(type||'text')+'" value="'+esc(item[key]===undefined?'':item[key])+'" '+(extra||'')+'></label>';}
  function renderGear(){
    $('weapons').innerHTML=data.weapons.map((w,i)=>'<article class="gear-card"><div class="gear-fields">'+inputField('ARMA','weapons',i,'name')+'<label>PERÍCIA<select data-collection="weapons" data-index="'+i+'" data-key="skill">'+M.skills.filter(s=>['Combate','Armas de distância'].includes(s.group)).map(s=>'<option '+(w.skill===s.id?'selected':'')+'>'+s.name+'</option>').join('')+'</select></label>'+inputField('DANO','weapons',i,'damage')+inputField('MUNIÇÃO','weapons',i,'ammo','number','min="0"')+inputField('PENTE','weapons',i,'magazine','number','min="0"')+'</div><div class="gear-buttons"><button data-attack="'+i+'">↗ Atacar</button><button data-damage-roll="'+i+'">Rolar dano</button><button data-reload="'+i+'" class="ghost">Recarregar</button><button class="ghost remove" data-remove="weapons" data-index="'+i+'">Remover</button></div></article>').join('')||'<p class="helper">Nenhuma arma cadastrada. Adicione a sua primeira arma.</p>';
    $('items').innerHTML=data.items.map((w,i)=>'<article class="gear-card"><div class="gear-fields item-fields">'+inputField('ITEM','items',i,'name')+inputField('QUANTIDADE','items',i,'qty','number','min="0"')+inputField('OBSERVAÇÕES','items',i,'notes')+'</div><div class="gear-buttons"><button class="ghost remove" data-remove="items" data-index="'+i+'">Remover</button></div></article>').join('')||'<p class="helper">Seu inventário está vazio.</p>';
    $('cyber-list').innerHTML=data.cyber.map((w,i)=>'<article class="gear-card"><div class="gear-fields cyber-fields">'+inputField('IMPLANTE','cyber',i,'name')+inputField('LOCAL / BASE','cyber',i,'location')+inputField('PH REGISTRADA','cyber',i,'loss','number','min="0"')+inputField('OPÇÕES E EFEITOS','cyber',i,'notes')+'</div><div class="gear-buttons"><button class="ghost remove" data-remove="cyber" data-index="'+i+'">Remover</button></div></article>').join('')||'<p class="helper">Nenhum implante cadastrado. Seu chrome, suas escolhas.</p>';
  }
  function renderLife(){$('lifepath').innerHTML=M.life.map(k=>'<label>'+k.toUpperCase()+'<textarea rows="3" data-life="'+esc(k)+'">'+esc(data.life[k]||'')+'</textarea></label>').join('');}
  function renderFeed(){$('feed').innerHTML=feed.slice(0,12).map(r=>'<div class="roll-entry"><strong>'+esc(r.total)+'</strong><b>'+esc(r.label)+'</b><small>'+esc(r.detail)+'</small></div>').join('')||'<p class="helper">Suas rolagens aparecem aqui e no chat da mesa.</p>';}
  function record(label,total,detail){feed.unshift({label,total,detail});renderFeed();}
  async function roll(label,base){await save();const modifier=M.bounded($('modifier').value,-100,100);const r=await api('roll',{id:tokenId,label,base,modifier});record(label,r.total,'d10 '+r.first+(r.extra?(r.first===1?' − ':' + ')+r.extra:'')+' · base '+base+' · mod '+modifier);}
  async function amount(kind){const dialog=$('amount-dialog');$('amount-title').textContent=kind==='damage'?'Registrar dano recebido':'Recuperar pontos de vida';$('amount-value').value='0';dialog.returnValue='';dialog.showModal();const answer=await new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue),{once:true}));if(answer!=='ok')return;const n=M.bounded($('amount-value').value,0,999999);data.hp=Math.max(0,Math.min(data.maxHp,data.hp+(kind==='damage'?-n:n)));changed();render();await save();}
  $('role').innerHTML=M.roles.map(r=>'<option>'+r+'</option>').join('');
  const galleryButton=document.createElement('button');galleryButton.id='open-gallery';galleryButton.className='ghost';galleryButton.textContent='◉ Tokens cyberpunk';$('create').insertAdjacentElement('afterend',galleryButton);
  const categoryNames={'Personagens':'Retratos de personagens','Corporations':'Corporações','Criminal Organizations':'Organizações criminosas','Gangs':'Gangues','Security':'Segurança'};
  $('token-category').innerHTML='<option value="">Todas as categorias</option>'+Array.from(new Set(catalog.map(t=>t.category))).map(c=>'<option value="'+esc(c)+'">'+esc(categoryNames[c]||c)+'</option>').join('');
  if(portraitCatalog.length)$('token-category').value='Personagens';
  const pager=document.createElement('div');pager.className='gallery-pager';pager.innerHTML='<button id="token-prev" class="ghost">← Anterior</button><button id="token-next" class="ghost">Próxima →</button>';$('token-grid').insertAdjacentElement('afterend',pager);
  galleryButton.onclick=()=>{renderTokens();$('token-gallery').showModal();};$('close-gallery').onclick=()=>$('token-gallery').close();$('token-search').oninput=()=>{galleryPage=0;renderTokens();};$('token-category').onchange=()=>{galleryPage=0;renderTokens();};$('token-prev').onclick=()=>{galleryPage--;renderTokens();};$('token-next').onclick=()=>{galleryPage++;renderTokens();};
  $('token-grid').onclick=e=>{const b=e.target.closest('[data-spawn]');if(!b)return;protect(async()=>{if(!live)throw Error('Adicione tokens pelo painel dentro do MapTool. A prévia apenas mostra a coleção.');if(dirty)await save();const t=catalog.find(x=>x.id===b.dataset.spawn);const r=await api('spawn',{asset:t.id,name:t.name,type:$('token-kind').value});await refresh(r.id);$('token-gallery').close();notice(t.name+' adicionado ao mapa. Salve a campanha com Ctrl+S.');});};
  document.addEventListener('change',e=>{const el=e.target;if(!data)return;
    if(el.dataset.field){data[el.dataset.field]=el.type==='number'?M.bounded(el.value,0,el.dataset.field==='cash'?999999999:999999):el.value;changed();renderVitals();}
    if(el.dataset.stat){data.stats[el.dataset.stat]=M.bounded(el.value,0,30);changed();renderSkills();renderVitals();}
    if(el.dataset.skill){data.skills[el.dataset.skill]=M.bounded(el.value,0,10);changed();renderSkills();}
    if(el.dataset.specialty){data.specialties[el.dataset.specialty]=el.value;changed();}
    if(el.dataset.life){data.life[el.dataset.life]=el.value;changed();}
    if(el.dataset.collection){data[el.dataset.collection][Number(el.dataset.index)][el.dataset.key]=el.type==='number'?M.bounded(el.value,0,999999):el.value;changed();}
  });
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.tab){document.querySelectorAll('.tab,nav button').forEach(x=>x.classList.remove('active'));$(b.dataset.tab).classList.add('active');b.classList.add('active');}
    if(!data)return;
    if(b.dataset.roll)protect(()=>roll(b.dataset.roll+(data.specialties[b.dataset.roll]?' · '+data.specialties[b.dataset.roll]:''),M.skillBase(data,b.dataset.roll)));
    if(b.dataset.action)protect(async()=>{const a=b.dataset.action;if(a==='damage'||a==='heal')await amount(a);if(a==='luck'){data.luck=data.stats.LUCK;changed();render();}if(a==='derive'){data.maxHp=10+5*Math.ceil((data.stats.BODY+data.stats.WILL)/2);data.hp=Math.min(data.hp,data.maxHp);changed();render();}});
    if(b.dataset.remove){const c=b.dataset.remove,i=Number(b.dataset.index);if(confirm('Remover “'+(data[c][i].name||'entrada')+'” da ficha?')){data[c].splice(i,1);changed();renderGear();}}
    if(b.dataset.attack!==undefined)protect(async()=>{const w=data.weapons[Number(b.dataset.attack)];const usesAmmo=['Armas de distância'].includes((M.skills.find(s=>s.id===w.skill)||{}).group);if(usesAmmo&&Number(w.ammo)<1)throw Error('Sem munição. Recarregue antes de atacar.');await roll('Ataque · '+w.name,M.skillBase(data,w.skill));if(usesAmmo){w.ammo=Math.max(0,Number(w.ammo)-1);changed();renderGear();await save();}});
    if(b.dataset.damageRoll!==undefined)protect(async()=>{const w=data.weapons[Number(b.dataset.damageRoll)];const parsed=M.rollDamage(w.damage,()=>0);const r=await api('damage',{id:tokenId,expression:w.damage,count:parsed.dice.length,bonus:parsed.bonus,label:w.name});record('Dano · '+w.name,r.total,(r.dice||[]).join(' + ')+(r.critical?' · 2+ seis: conferir ferimento crítico':''));});
    if(b.dataset.reload!==undefined)protect(async()=>{const w=data.weapons[Number(b.dataset.reload)];w.ammo=Number(w.magazine)||0;changed();renderGear();await save();notice('Pente recarregado. Desconte as balas de reserva no inventário.');});
  });
  $('tokens').onchange=()=>protect(()=>load($('tokens').value));$('refresh').onclick=()=>protect(()=>refresh(tokenId));$('save').onclick=()=>protect(save);
  $('create').onclick=()=>protect(async()=>{if(!live&&dirty)await save();if(!live&&data)throw Error('A prévia possui uma ficha de demonstração. Crie personagens no MapTool.');const r=await api('create');await refresh(r.id);});
  $('skill-search').oninput=renderSkills;$('initiative').onclick=()=>protect(()=>roll('Iniciativa',data.stats.REF));
  $('add-weapon').onclick=()=>{data.weapons.push({name:'Nova arma',skill:'Pistolas',damage:'2d6',ammo:0,magazine:0});changed();renderGear();};
  $('add-item').onclick=()=>{data.items.push({name:'Novo item',qty:1,notes:''});changed();renderGear();};
  $('add-cyber').onclick=()=>{data.cyber.push({name:'Novo implante',location:'',loss:0,notes:''});changed();renderGear();};
  $('export').onclick=()=>protect(async()=>{if(!data)throw Error('Selecione uma ficha.');await save();if(live){$('export-text').value=JSON.stringify(data,null,2);$('export-dialog').showModal();$('export-text').select();}else{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download=(data.handle||'edgerunner')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}});
  $('import').onchange=()=>protect(async()=>{const file=$('import').files[0];if(!file)return;if(file.size>5000000)throw Error('Arquivo muito grande (máximo 5 MB).');if(!data)throw Error('Crie ou selecione um token primeiro.');const incoming=M.normalize(JSON.parse(await file.text()));if(confirm('Substituir a ficha deste token pelos dados do arquivo?')){data=incoming;changed();render();await save();} $('import').value='';});
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='Há alterações não salvas.';}});
  window.SexoredBridge={getData:()=>data,getTokenId:()=>tokenId,save,request:api,replace:(incoming)=>{data=M.normalize(incoming);dirty=false;render();saved();},notice};
  protect(async()=>{await refresh();$('connection').textContent=live?'MAPTOOL CONECTADO':'PRÉVIA LOCAL · DADOS NO NAVEGADOR';});
})();
