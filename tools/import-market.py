from pathlib import Path
import json,yaml,re,hashlib,shutil,base64,collections,unicodedata
ROOT=Path('C:/Users/joaog/Documents/sexored'); REPO=Path('work/red-core'); PUBLIC=ROOT/'src/library/public'; IMAGES=PUBLIC/'market-images';IMAGES.mkdir(exist_ok=True)
def key(s):return ''.join(c for c in unicodedata.normalize('NFKD',s.casefold()) if c.isalnum())
categories={'weapon':'Armas','ammo':'Munição','armor':'Armaduras','clothing':'Moda','cyberware':'Cyberware','drug':'Drogas','gear':'Equipamento','program':'NET','itemUpgrade':'Melhorias','vehicle':'Veículos'}
translations={}
for f in (REPO/'src/babele/pt-BR').glob('*.json'):
 try: translations.update(json.loads(f.read_text(encoding='utf8')).get('entries',{}))
 except Exception: pass
items=[];images={};fallbacks={};base_names={};conflicts=[]
def imagecopy(path):
 if not path.is_file():return None
 name=hashlib.sha256(path.read_bytes()).hexdigest()[:16]+path.suffix
 if not (IMAGES/name).exists():shutil.copyfile(path,IMAGES/name)
 return 'market-images/'+str(Path(name).with_suffix('.png')) if path.suffix=='.svg' else 'market-images/'+name
for f in sorted((REPO/'src/packs/core').rglob('*.yaml')):
 d=yaml.safe_load(f.read_text(encoding='utf8'));sys=d.get('system',{});typ=d.get('type');price=sys.get('price',{}).get('market')
 if typ not in categories or not isinstance(price,(int,float)) or price<0:continue
 original=d['name'];price=20 if original=='Glow Stick' else price;name=translations.get(original,{}).get('name',original)
 if name=='Console' and original=='Cyberdeck':name='Cyberdeck'
 image=imagecopy(REPO/'src'/d.get('img','').replace('systems/cyberpunk-red-core/',''))
 if image:fallbacks.setdefault(categories[typ],image)
 refs='; '.join(str(x.get('book',''))+' p. '+str(x.get('page','')) for x in sys.get('sources',[]))
 ident='m'+hashlib.sha256((original+'|'+typ).encode()).hexdigest()[:12]
 item=dict(id=ident,name=name,originalName=original,category=categories[typ],kind=typ,price=int(price),priceLabel=f'{int(price):,} eb',currency='eb',source=refs,sourceUrl='https://gitlab.com/cyberpunk-red-team/fvtt-cyberpunk-red-core',sourceKind='core',image=image,imageKind='Ícone do item',quality=sys.get('quality',''),unit='unidade / embalagem do catálogo')
 if typ=='weapon':item.update(damage=sys.get('damage',''),magazine=sys.get('magazine',{}).get('max',0),rof=sys.get('rof',1),skill=sys.get('weaponSkill',''))
 if typ=='ammo':item['unit']='embalagem conforme a fonte (ver quantidade no livro)'
 if typ=='cyberware':item['unit']='implante não instalado'
 items.append(item);base_names[key(original)]=item
# Official index: names, prices and references only. No rule text or stat blocks.
index=json.loads(Path('work/index-catalog.json').read_text(encoding='utf8'))
seen={(key(x['originalName']),x['price']) for x in items}
for r in index:
 norm=key(r['name']);price=r['price']
 if any(not re.fullmatch(r'(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)', n) for n in re.findall(r'([0-9,]+)eb',r['cost'])):price=None
 if (norm,price) in seen:continue
 # Keep source-dependent prices separate; do not silently overwrite the core catalog.
 if norm in base_names and price!=base_names[norm]['price']:conflicts.append(dict(name=r['name'],core=base_names[norm]['price'],index=price,page=r['indexPage']))
 if not r['source'] or 'Name Cost Source' in r['name']:continue
 image=fallbacks.get(r['category']) or fallbacks['Equipamento']
 ident='m'+hashlib.sha256((r['name']+'|'+r['cost']+'|'+r['source']).encode()).hexdigest()[:12]
 items.append(dict(id=ident,name=r['name'],originalName=r['name'],category=r['category'],kind='index',price=price,priceLabel=r['cost'],currency='gp' if 'gp' in r['cost'] else 'eb',source=r['source'],sourceUrl='https://rtalsoriangames.com/wp-content/uploads/2026/01/RTG-CPR-DLC-NightMarketIndexv1.24.pdf#page='+str(r['indexPage']),sourceKind='index',indexPage=r['indexPage'],image=image,imageKind='Ícone da categoria',unit='unidade / pacote conforme a referência'))
 seen.add((norm,price))
items.sort(key=lambda x:(x['category'],x['name'].casefold(),x['price'] if x['price'] is not None else -1))
# Exact matching core records also supply the corresponding icon for named index entries.
for item in items:
 if item['image'] is None:item['image']=fallbacks['Equipamento'];item['imageKind']='Ícone da categoria'
DATA=dict(version='0.3.0',updated='2026-10-30',indexVersion='1.24',items=items)
(PUBLIC/'market-data.js').write_text('window.RedMarketCatalog='+json.dumps(DATA,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
backend={i['id']:{k:i.get(k) for k in ['id','name','price','currency','source','kind','image','unit','damage','magazine','rof','skill']} for i in items}
for i in backend.values():i['buyable']=int(isinstance(i['price'],int) and i['price']>=0 and i['currency']=='eb')
encoded=base64.b64encode(json.dumps(backend,ensure_ascii=False,separators=(',',':')).encode()).decode()
folder=ROOT/'src/library/mtscript/market';folder.mkdir(exist_ok=True)
(folder/'catalog.mts').write_text('[h: macro.return = base64.decode("'+encoded+'")]\n',encoding='utf8')
(ROOT/'referencias/Night-Market-Index-v1.24.pdf').write_bytes(Path('work/NightMarketIndex.pdf').read_bytes())
(ROOT/'src/LICENCA-ICONS-GPL-3.md').write_bytes((REPO/'LICENCE.md').read_bytes())
report=dict(total=len(items),core=sum(i['sourceKind']=='core' for i in items),index=sum(i['sourceKind']=='index' for i in items),fixedPrice=sum(i['price'] is not None and i['currency']=='eb' for i in items),icons=len(list(IMAGES.iterdir())),priceDifferences=conflicts)
(ROOT/'referencias/market-import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=True)[:1700])


# Enrich the generated catalog with local Portuguese summaries and technical facts.
import runpy
runpy.run_path(str(ROOT/"tools/enrich-market.py"))
