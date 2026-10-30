(function(){
 'use strict';
 const B=window.SexoredBridge,M=window.RedModel,C=window.RedMarketCatalog||{items:[]},$=id=>document.getElementById(id);
 const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function details(i){return '<p class="product-description">'+esc(i.description||'Descrição ainda não disponível.')+'</p>'+(i.details&&i.details.length?'<dl class="product-facts">'+i.details.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>':'')+'<p class="helper">'+(i.descriptionStatus==='reference'?'Somente referência de catálogo.':'Resumo de consulta; efeitos e requisitos devem ser conferidos na fonte.')+'</p>'; }
 const money=n=>Number(n).toLocaleString('pt-BR')+' eb';
 const fold=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const byId=new Map(C.items.map(i=>[i.id,i]));let page=0,chosen=null,transaction='',buying=false;
 const nav=document.createElement('button');nav.dataset.tab='market';nav.textContent='07 / Mercado';$('tabs').appendChild(nav);
 const tab=document.createElement('section');tab.id='market';tab.className='tab';tab.innerHTML=`
 <div class="market-hero"><div><span class="eyebrow">NIGHT CITY / COMÉRCIO LOCAL</span><h2>Mercado da Rua</h2><p>Equipe-se para o próximo trabalho.</p></div><div class="market-wallet"><span class="eyebrow">SEU SALDO</span><strong id="market-balance">0 eb</strong><small>Edite o saldo na aba Visão geral.</small></div></div>
 <div class="market-filters"><input id="market-search" placeholder="Buscar item em português ou inglês…" aria-label="Buscar item"><select id="market-category" aria-label="Categoria"></select><select id="market-source" aria-label="Fonte"><option value="">Básico + índice de suplementos</option><option value="core">Catálogo do básico</option><option value="index">Índice de suplementos</option></select><select id="market-order" aria-label="Ordenar"><option value="name">Nome</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option></select><label class="affordable"><input id="market-affordable" type="checkbox"> Cabe no meu saldo</label></div>
 <p class="helper">Preços de referência em eurobucks. Itens com preço variável, valor inconsistente ou moeda de Elflines exigem consulta à fonte. Imagens são ícones do item ou da categoria, identificados em cada cartão. Comprar não equipa armas nem instala cyberware automaticamente.</p>
 <div class="market-toolbar"><span id="market-count" class="eyebrow"></span><div><button id="market-prev" class="ghost">← Anterior</button><button id="market-next" class="ghost">Próxima →</button></div></div><div id="market-grid"></div>
 <div class="section-heading"><h2>Últimas compras</h2><button id="market-inventory" class="ghost">Ver inventário ↗</button></div><div id="market-history"></div>`;
 $('sheet').appendChild(tab);
 const dialog=document.createElement('dialog');dialog.id='purchase-dialog';dialog.innerHTML=`<div class="purchase-head"><span class="eyebrow">CONFIRMAR COMPRA</span><button id="purchase-close" class="ghost">✕</button></div><img id="purchase-image" alt=""><h2 id="purchase-name"></h2><p id="purchase-source" class="helper"></p><div id="purchase-description"></div><label>Quantidade de unidades / pacotes<input id="purchase-qty" type="number" min="1" max="99" value="1"></label><div class="purchase-totals"><span>Preço unitário</span><b id="purchase-unit"></b><span>Total</span><strong id="purchase-total"></strong><span>Saldo após a compra</span><b id="purchase-after"></b></div><p id="purchase-error" role="alert"></p><button id="purchase-confirm" class="primary wide">Comprar e adicionar ao inventário</button><p class="helper">O preço é conferido no catálogo do MapTool. Salve a campanha após comprar.</p>`;document.body.appendChild(dialog);
 $('market-category').innerHTML='<option value="">Todas as categorias</option>'+Array.from(new Set(C.items.map(i=>i.category))).sort().map(c=>'<option>'+esc(c)+'</option>').join('');
 function buyable(i){return Number.isInteger(i.price)&&i.price>=0&&i.currency==='eb';}
 function render(){
  const d=B.getData();if(!d)return;const cash=Number(d.cash)||0;$('market-balance').textContent=money(cash);
  const q=fold($('market-search').value),cat=$('market-category').value,source=$('market-source').value;
  let rows=C.items.filter(i=>(!cat||i.category===cat)&&(!source||i.sourceKind===source)&&fold(i.name+' '+i.originalName+' '+i.category+' '+i.source+' '+(i.description||'')).includes(q)&&(!$('market-affordable').checked||(buyable(i)&&i.price<=cash)));
  const order=$('market-order').value;rows.sort(order==='name'?(a,b)=>a.name.localeCompare(b.name,'pt-BR'):(a,b)=>(order==='price-desc'?-1:1)*((a.price==null?Infinity:a.price)-(b.price==null?Infinity:b.price)));
  page=Math.max(0,Math.min(page,Math.ceil(rows.length/36)-1));$('market-count').textContent=rows.length+' itens · Página '+(page+1)+' / '+Math.max(1,Math.ceil(rows.length/36));$('market-prev').disabled=page===0;$('market-next').disabled=(page+1)*36>=rows.length;
  $('market-grid').innerHTML=rows.slice(page*36,(page+1)*36).map(i=>`<article class="market-card"><div class="market-art"><img loading="lazy" src="${esc(i.image)}" alt="${esc(i.imageKind+' — '+i.name)}"><small>${esc(i.imageKind)}</small></div><div class="market-card-body"><span class="eyebrow">${esc(i.category)}</span><h3>${esc(i.name)}</h3>${i.name!==i.originalName?'<p class="market-original">'+esc(i.originalName)+'</p>':''}<p class="market-ref">${esc(i.source)}${i.indexPage?' · Índice p. '+i.indexPage:''}</p><small>${esc(i.unit)}</small><details class="market-description"><summary>Descrição e dados técnicos</summary>${details(i)}</details><div class="market-card-bottom"><strong>${buyable(i)?money(i.price):esc(i.priceLabel)}</strong><button data-buy="${i.id}" class="${buyable(i)&&i.price<=cash?'primary':'ghost'}" ${buyable(i)?'':'disabled'}>${buyable(i)?'Comprar':'Consultar'}</button></div>${buyable(i)&&i.price>cash?'<small class="shortfall">Faltam '+money(i.price-cash)+'</small>':''}</div></article>`).join('')||'<p class="helper">Nenhum item encontrado. Tente outro termo ou filtro.</p>';
  $('market-history').innerHTML=(d.purchases||[]).slice(-10).reverse().map(r=>`<div class="purchase-row"><span>${esc(r.qty)} × ${esc(r.name)}<small>${esc(r.date)}</small></span><strong>− ${money(r.total)}</strong></div>`).join('')||'<p class="helper">Nenhuma compra registrada para este personagem.</p>';
  decorateInventory();
 }
 function decorateInventory(){
  const d=B.getData();if(!d)return;Array.from($('items').children).forEach((card,index)=>{const item=d.items[index],ref=item&&byId.get(item.catalogId);if(!ref||card.querySelector('.inventory-product'))return;const block=document.createElement('div');block.className='inventory-product';block.innerHTML='<img src="'+esc(ref.image)+'" alt="'+esc(ref.name)+'"><div><span class="eyebrow">COMPRADO NO MERCADO</span><small>'+esc(ref.source)+' · '+money(item.unitPrice)+'</small></div>';card.prepend(block);const more=document.createElement('details');more.className='inventory-description';more.innerHTML='<summary>Descrição e dados técnicos</summary>'+details(ref);card.insertBefore(more,block.nextSibling);});
 }
 function quote(){const d=B.getData();if(!chosen||!d)return;const qty=Number($('purchase-qty').value),valid=Number.isInteger(qty)&&qty>=1&&qty<=99,total=chosen.price*qty,after=Number(d.cash)-total;$('purchase-total').textContent=valid?money(total):'—';$('purchase-after').textContent=valid?money(after):'—';$('purchase-confirm').disabled=buying||!valid||after<0;$('purchase-error').textContent=!valid?'Informe uma quantidade inteira de 1 a 99.':after<0?'Eurobucks insuficientes.':'';}
 function checkout(id){chosen=byId.get(id);if(!chosen||!buyable(chosen))return;transaction='buy-'+Date.now()+'-'+Math.random().toString(36).slice(2);$('purchase-name').textContent=chosen.name;$('purchase-description').innerHTML=details(chosen);$('purchase-image').src=chosen.image;$('purchase-image').alt=chosen.name;$('purchase-source').textContent=chosen.source+' · '+chosen.unit;$('purchase-unit').textContent=money(chosen.price);$('purchase-qty').value='1';quote();dialog.showModal();}
 $('market-grid').onclick=e=>{const button=e.target.closest('[data-buy]');if(button&&!buying)checkout(button.dataset.buy);};
 $('purchase-close').onclick=()=>{if(!buying)dialog.close();};$('purchase-qty').oninput=quote;
 dialog.addEventListener('cancel',e=>{if(buying)e.preventDefault();});
 $('purchase-confirm').onclick=async()=>{
  if(buying||!chosen)return;buying=true;quote();const id=B.getTokenId(),qty=Number($('purchase-qty').value);
  try{
   await B.save();if(B.getTokenId()!==id)throw Error('O personagem mudou. Abra novamente a compra.');
   let result;
   if(location.protocol==='lib:')result=await B.request('buy',{id,itemId:chosen.id,qty,transaction});
   else {const d=JSON.parse(JSON.stringify(B.getData())),total=chosen.price*qty;if(d.cash<total)throw Error('Eurobucks insuficientes.');const old=d.items.find(x=>x.catalogId===chosen.id);if(old)old.qty+=qty;else d.items.push({name:chosen.name,qty,catalogId:chosen.id,unitPrice:chosen.price,source:chosen.source,kind:chosen.kind,unit:chosen.unit,notes:chosen.source});d.cash-=total;d.purchases.push({transaction,itemId:chosen.id,name:chosen.name,qty,unitPrice:chosen.price,total,date:new Date().toLocaleString('pt-BR')});result={data:d};}
   if(B.getTokenId()===id){B.replace(typeof result.data==='string'?JSON.parse(result.data):result.data);if(location.protocol!=='lib:')await B.save();}
   dialog.close();B.notice(qty+' × '+chosen.name+' comprado e adicionado ao inventário. Salve a campanha com Ctrl+S.');render();
  }catch(e){$('purchase-error').textContent=e.message||String(e);}finally{buying=false;$('purchase-confirm').disabled=false;}
 };
 ['market-search','market-category','market-source','market-order','market-affordable'].forEach(id=>{$(id).addEventListener(id==='market-search'?'input':'change',()=>{page=0;render();});});
 $('market-prev').onclick=()=>{page--;render();};$('market-next').onclick=()=>{page++;render();};$('market-inventory').onclick=()=>document.querySelector('[data-tab="gear"]').click();
 document.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b&&b.dataset.tab==='market')render();if(b&&b.dataset.tab==='gear')setTimeout(decorateInventory,0);});
 document.addEventListener('change',e=>{if(e.target.dataset.field==='cash')setTimeout(render,0);});window.addEventListener('sexored:change',render);render();
})();
