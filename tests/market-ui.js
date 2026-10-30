(async()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)), report=msg=>fetch('macro:testReport@lib:local.sexored.red',{method:'POST',body:msg});
 const wait=async(f,label)=>{const start=Date.now();while(!f()){if(Date.now()-start>15000)throw Error(label+' timeout: '+document.getElementById('purchase-error').textContent+' / '+document.getElementById('notice').textContent);await sleep(100);}};
 try{
 await sleep(2500);await report('START');
 document.getElementById('create').click();await wait(()=>SexoredBridge.getData(),'create');
 const B=SexoredBridge,id=B.getTokenId();B.replace(RedModel.normalize({handle:'Teste do Mercado',cash:1000}));await B.save();
 document.querySelector('[data-tab="market"]').click();
 const item=RedMarketCatalog.items.find(i=>i.sourceKind==='core'&&i.originalName==='Airhypo');
 document.getElementById('market-search').value='Airhypo';document.getElementById('market-search').dispatchEvent(new Event('input'));
 const button=document.querySelector('[data-buy="'+item.id+'"]');if(!button)throw Error('Market item missing');button.click();
 document.getElementById('purchase-qty').value='2';document.getElementById('purchase-qty').dispatchEvent(new Event('input'));document.getElementById('purchase-confirm').click();
 await wait(()=>!document.getElementById('purchase-dialog').open,'purchase');
 if(B.getData().cash!==900||B.getData().items[0].qty!==2)throw Error('Purchase result incorrect');
 await report('BUY_UI_OK cash='+B.getData().cash+' qty='+B.getData().items[0].qty);
 const txn=B.getData().purchases[0].transaction;const repeated=await B.request('buy',{id,itemId:item.id,qty:2,transaction:txn});
 const again=typeof repeated.data==='string'?JSON.parse(repeated.data):repeated.data;if(!repeated.duplicate||again.cash!==900)throw Error('Duplicate request charged again');await report('IDEMPOTENCY_OK');
 let denied=false;try{await B.request('buy',{id,itemId:item.id,qty:99,transaction:'no-money-test'});}catch(e){denied=e.message.includes('insuficientes');}if(!denied)throw Error('Insufficient funds not denied');
 const verified=await B.request('load',{id});const stored=typeof verified.data==='string'?JSON.parse(verified.data):verified.data;if(stored.cash!==900||stored.items[0].qty!==2)throw Error('Denied purchase mutated state');await report('INSUFFICIENT_ROLLBACK_OK');
 const forged=await B.request('buy',{id,itemId:item.id,qty:1,transaction:'forged-price-test',price:1});const fresh=typeof forged.data==='string'?JSON.parse(forged.data):forged.data;if(fresh.cash!==850||fresh.items[0].qty!==3)throw Error('Client price was trusted');B.replace(fresh);await report('AUTHORITATIVE_PRICE_STACK_OK');
 await B.save();const persisted=await B.request('load',{id});const roundtrip=typeof persisted.data==='string'?JSON.parse(persisted.data):persisted.data;if(roundtrip.purchases.length!==2||roundtrip.items[0].catalogId!==item.id)throw Error('Receipt save lost');await report('RECEIPTS_PERSIST_OK');
 document.getElementById('open-gallery').click();if(document.getElementById('token-category').value!=='Personagens')throw Error('Portraits not default');await wait(()=>document.querySelector('.token-card img').naturalWidth>0,'portrait image');
 document.querySelector('.token-card').click();await wait(()=>B.getTokenId()!==id,'portrait spawn');await report('PORTRAIT_SPAWN_OK '+B.getData().handle);
 document.getElementById('tokens').value=id;document.getElementById('tokens').dispatchEvent(new Event('change'));await wait(()=>B.getTokenId()===id,'return');document.querySelector('[data-tab="market"]').click();
 document.getElementById('token-gallery').close();await wait(()=>document.querySelector('#market-grid img').naturalWidth>0,'market image');document.getElementById('market-grid').scrollIntoView();await report('IMAGES_OK width='+document.querySelector('#market-grid img').naturalWidth);await report('ALL_OK items='+RedMarketCatalog.items.length+' portraits='+RedPortraits.length);
 }catch(e){await report('FAILED '+e.message);}
})();
