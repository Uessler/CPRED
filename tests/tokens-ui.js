(async()=>{
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const report=msg=>fetch('macro:testReport@lib:local.sexored.red',{method:'POST',body:msg});
 try{
 await delay(2000);
 document.getElementById('open-gallery').click();
 if(!document.getElementById('token-gallery').open)throw Error('Gallery did not open');
 if(document.querySelectorAll('.token-card').length!==60)throw Error('Pagination missing');
 document.getElementById('token-search').value='Arasaka';document.getElementById('token-search').dispatchEvent(new Event('input'));
 if(document.querySelectorAll('.token-card').length!==10)throw Error('Search failed');
 await delay(500);
 if(!document.querySelector('.token-card img').naturalWidth)throw Error('Image did not load');
 const selected=window.RedTokens.find(t=>t.id===document.querySelector('.token-card').dataset.spawn);
 document.getElementById('token-kind').value='NPC';document.querySelector('.token-card').click();await delay(900);
 if(document.getElementById('handle').value!==selected.name)throw Error('NPC spawn/load failed '+document.getElementById('notice').textContent);
 const r=await fetch('macro:verifyToken@lib:local.sexored.red',{method:'POST',body:document.getElementById('tokens').value});const npc=await r.json();
 if(npc.pc!==0)throw Error('NPC type incorrect');
 await report('NPC_OK '+npc.image);
 document.getElementById('open-gallery').click();document.getElementById('token-kind').value='PC';document.querySelector('.token-card').click();await delay(900);
 const r2=await fetch('macro:verifyToken@lib:local.sexored.red',{method:'POST',body:document.getElementById('tokens').value});const pc=await r2.json();if(pc.pc!==1)throw Error('PC type incorrect');
 await report('PC_OK '+pc.image);
 await report('ALL_OK catalog='+RedTokens.length+' image='+selected.name);
 document.getElementById('open-gallery').click();
 }catch(e){await report('FAILED '+e.message);}
})();
