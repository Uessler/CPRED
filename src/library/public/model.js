(function(root){
  'use strict';
  const groups = [
    ['Percepção','Concentração:WILL|Esconder/revelar objeto:INT|Leitura labial:INT|Percepção:INT|Rastrear:INT'],
    ['Corpo','Atletismo:DEX|Contorcionismo:DEX|Dança:DEX|Resistência:WILL|Resistir a tortura/drogas:WILL|Furtividade:DEX'],
    ['Pilotagem','Conduzir veículo terrestre:REF|Pilotar veículo aéreo:REF:2|Pilotar veículo aquático:REF|Cavalgar:REF'],
    ['Educação','Contabilidade:INT|Adestramento:INT|Burocracia:INT|Negócios:INT|Composição:INT|Criminologia:INT|Criptografia:INT|Dedução:INT|Educação:INT|Jogos de azar:INT|Idioma:INT|Pesquisa:INT|Conhecimento local:INT|Ciência:INT|Tática:INT|Sobrevivência:INT'],
    ['Combate','Briga:DEX|Esquiva:DEX|Artes marciais:DEX:2|Armas brancas:DEX'],
    ['Atuação','Atuação:COOL|Tocar instrumento:TECH'],
    ['Armas de distância','Arco:REF|Fogo automático:REF:2|Pistolas:REF|Armas pesadas:REF:2|Armas longas:REF'],
    ['Social','Suborno:COOL|Conversação:EMP|Percepção humana:EMP|Interrogação:COOL|Persuasão:COOL|Cuidados pessoais:COOL|Manha:COOL|Negociação:COOL|Estilo:COOL'],
    ['Técnica','Tecnologia aérea:TECH|Tecnologia básica:TECH|Cibertecnologia:TECH|Demolição:TECH:2|Eletrônica/segurança:TECH:2|Primeiros socorros:TECH|Falsificação:TECH|Tecnologia terrestre:TECH|Pintura/escultura:TECH|Paramédico:TECH:2|Fotografia/cinema:TECH|Abrir fechaduras:TECH|Furto:TECH|Tecnologia aquática:TECH|Tecnologia de armas:TECH']
  ];
  const skills = groups.flatMap(([group, rows])=>rows.split('|').map((row)=>{ const [name,stat,cost] = row.split(':'); return {id:name, name,stat,cost:Number(cost)||1,group}; }));
  const stats = [['INT','Inteligência'],['REF','Reflexos'],['DEX','Destreza'],['TECH','Técnica'],['COOL','Presença'],['WILL','Vontade'],['LUCK','Sorte'],['MOVE','Movimento'],['BODY','Corpo'],['EMP','Empatia']];
  const roles = ['Solo','Netrunner','Tech','Medtech','Rockerboy','Media','Lawman','Exec','Fixer','Nomad'];
  const life = ['Origem cultural','Personalidade','Estilo e aparência','Valores','Pessoas importantes','Família e infância','Amigos e aliados','Inimigos','Relacionamentos','Objetivos'];
  function defaults(name){return {schema:1,handle:name||'Novo edgerunner',role:'Solo',rank:4,reputation:0,stats:Object.fromEntries(stats.map(([id])=>[id,5])),hp:35,maxHp:35,humanity:50,maxHumanity:50,luck:5,ip:0,cash:0,headSp:0,bodySp:0,shield:0,injuries:'',notes:'',skills:{},specialties:{},weapons:[],items:[],cyber:[],life:{},purchases:[]};}
  function bounded(n,min,max,fallback=0){n=Number(n);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.trunc(n))):fallback;}
  function normalize(input,name){
    if(!input || typeof input!=='object' || Array.isArray(input)) throw Error('Ficha inválida: esperado um objeto JSON.');
    if(input.schema && input.schema!==1) throw Error('Versão de ficha não suportada.');
    const d=defaults(name); for(const k of ['handle','role','injuries','notes']) if(typeof input[k]==='string') d[k]=input[k].slice(0,k==='handle'?80:20000);
    for(const k of ['rank','reputation','hp','maxHp','humanity','maxHumanity','luck','ip','cash','headSp','bodySp','shield']) if(input[k]!==undefined) d[k]=bounded(input[k],0,999999);
    d.maxHp=Math.max(1,d.maxHp);d.hp=Math.min(d.hp,d.maxHp);d.humanity=Math.min(d.humanity,d.maxHumanity);
    if(input.cash!==undefined)d.cash=bounded(input.cash,0,999999999);
    for(const [id] of stats) if(input.stats && input.stats[id]!==undefined)d.stats[id]=bounded(input.stats[id],0,30);
    d.luck=Math.min(d.luck,d.stats.LUCK);
    for(const s of skills){d.skills[s.id]=bounded(input.skills&&input.skills[s.id],0,10);d.specialties[s.id]=String(input.specialties&&input.specialties[s.id]||'').slice(0,100);}
    for(const k of ['weapons','items','cyber']) if(Array.isArray(input[k]))d[k]=input[k].slice(0,k==='items'?2000:100).filter(x=>x&&typeof x==='object'&&!Array.isArray(x)).map(x=>Object.fromEntries(Object.entries(x).filter(([key])=>['name','skill','damage','ammo','magazine','rof','notes','qty','location','loss','catalogId','unitPrice','source','kind','unit'].includes(key)).map(([key,val])=>[key,typeof val==='number'?bounded(val,0,999999999):String(val).slice(0,2000)])));
    if(Array.isArray(input.purchases))d.purchases=input.purchases.slice(-200).filter(x=>x&&typeof x==='object').map(x=>({transaction:String(x.transaction||'').slice(0,128),itemId:String(x.itemId||'').slice(0,64),name:String(x.name||'').slice(0,200),qty:bounded(x.qty,1,99,1),unitPrice:bounded(x.unitPrice,0,999999999),total:bounded(x.total,0,999999999),date:String(x.date||'').slice(0,100)}));
    for(const k of life)d.life[k]=String(input.life&&input.life[k]||'').slice(0,4000);
    return d;
  }
  function skillBase(d,id){const s=skills.find(x=>x.id===id);if(!s)throw Error('Perícia desconhecida.');return Number(d.stats[s.stat])+Number(d.skills[id]||0);}
  function rollCheck(base,modifier,rng){const die=()=>Math.floor(rng()*10)+1;const first=die();const extra=(first===1||first===10)?die():0;return {first,extra,total:Number(base)+Number(modifier)+first+(first===1?-extra:extra)};}
  function rollDamage(expr,rng){const match=/^(\d{1,2})d6(?:\s*([+-])\s*(\d{1,3}))?$/i.exec(String(expr).trim());if(!match||Number(match[1])<1||Number(match[1])>20)throw Error('Use de 1d6 a 20d6, opcionalmente +N ou -N.');const dice=Array.from({length:Number(match[1])},()=>Math.floor(rng()*6)+1);const bonus=match[3]?Number(match[3])*(match[2]==='-'?-1:1):0;return {dice,bonus,total:Math.max(0,dice.reduce((a,b)=>a+b,0)+bonus),critical:dice.filter(x=>x===6).length>=2};}
  const api={groups,skills,stats,roles,life,defaults,normalize,skillBase,rollCheck,rollDamage,bounded};root.RedModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
