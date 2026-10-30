from pathlib import Path
import json,yaml,hashlib
ROOT=Path(__file__).resolve().parent.parent
PUBLIC=ROOT/'src/library/public'
p=PUBLIC/'market-data.js'
data=json.loads(p.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
summaries=json.loads((ROOT/'tools/market-summaries.json').read_text(encoding='utf8'))
quality={'standard':'padrão','poor':'baixa','excellent':'excelente'}
classes={'attacker':'ataque','defender':'defesa','booster':'suporte','blackice':'Black ICE'}
cybertypes={'cyberAudioSuite':'opção de áudio','cyberEye':'opção de ciberolho','cyberArm':'opção de ciberbraço','cyberLeg':'opção de ciberperna','neuralWare':'implante neural','fashionWare':'modificação estética','internalBodyCyberware':'implante interno','externalBodyCyberware':'implante externo','borgware':'borgware'}
records={}
for f in Path('work/red-core/src/packs/core').rglob('*.yaml'):
 d=yaml.safe_load(f.read_text(encoding='utf8'));ident='m'+hashlib.sha256((d['name']+'|'+d.get('type','')).encode()).hexdigest()[:12];records[ident]=d
for item in data['items']:
 d=records.get(item['id']);facts=[];desc='';status='reference'
 if d:
  s=d['system'];typ=d['type'];n=d['name'];desc=summaries.get(n,'');status='summary' if desc else 'technical'
  def fact(label,value):
   if value is not None and value!='':facts.append([label,str(value)])
  if typ=='weapon':
   desc=desc or ('Arma de ataque à distância.' if s.get('isRanged') else 'Arma para combate corpo a corpo.')
   fact('Dano',s.get('damage'));fact('ROF',s.get('rof'));fact('Perícia',s.get('weaponSkill'));fact('Mãos',s.get('handsReq'));fact('Qualidade',quality.get(s.get('quality'),s.get('quality')))
   if s.get('magazine',{}).get('max'):fact('Capacidade',s['magazine']['max'])
   fact('Ocultável','sim' if s.get('concealable',{}).get('concealable') else 'não')
   fm=s.get('fireModes',{})
   if fm.get('autoFire'):fact('Autofire',fm['autoFire'])
   if fm.get('suppressiveFire'):fact('Fogo supressivo','sim')
  elif typ=='program':
   fact('Classe',classes.get(s.get('class'),s.get('class')));fact('ATK',s.get('atk'));fact('DEF',s.get('def'));fact('REZ',s.get('rez',{}).get('max'));fact('Slots',s.get('size'))
  elif typ=='cyberware':
   if not desc:
    if 'Covering' in n:desc='Revestimento para o membro cibernético indicado no nome; personaliza sua aparência.'
    elif n.startswith('Meat '):desc='Membro orgânico de referência, usado para organizar as opções corporais compatíveis.'
    elif 'Linear Frame' in n:desc='Reforço estrutural implantado para ampliar a força do corpo. Confira os requisitos e limites na referência.'
    else:desc='Implante ou opção corporal. Confira compatibilidade e requisitos antes da instalação.'
   fact('Categoria',cybertypes.get(s.get('type'),s.get('type')))
   loss=s.get('humanityLoss',{});fact('Perda de Humanidade',loss.get('roll'));fact('PH média',loss.get('static'));fact('Espaços ocupados',s.get('size'))
   if s.get('installedItems',{}).get('slots'):fact('Slots para opções',s['installedItems']['slots'])
   if s.get('isWeapon'):fact('Dano',s.get('damage'));fact('ROF',s.get('rof'))
   fact('Aplicação','compra não instala o implante')
  elif typ=='gear':
   if 'Cyberdeck' in n:desc='Computador de invasão para netrunning; recebe programas e hardware nos slots disponíveis.'
   elif 'Linear Frame' in n:desc='Exoesqueleto externo que amplia a força durante o uso. Confira plugs e limites na referência.'
   desc=desc or 'Equipamento utilitário. Consulte a referência para suas aplicações específicas.'
   if s.get('installedItems',{}).get('slots'):fact('Slots',s['installedItems']['slots'])
   fact('Qualidade',quality.get(s.get('quality'),s.get('quality')))
  elif typ=='armor':
   desc=desc or ('Escudo balístico com pontos de vida próprios.' if s.get('isShield') else 'Proteção vestível para a localização indicada; o SP reduz o dano conforme as regras de armadura.')
   if s.get('isHeadLocation'):fact('SP cabeça',s.get('headLocation',{}).get('sp'))
   if s.get('isBodyLocation'):fact('SP corpo',s.get('bodyLocation',{}).get('sp'))
   fact('Penalidade',s.get('penalty'))
   if s.get('isShield'):fact('PV do escudo',s.get('shieldHitPoints',{}).get('max'))
  elif typ=='ammo':
   effects={'basic':'Munição comum, sem efeito especial.','armorPiercing':'Munição perfurante: provoca ablação maior na armadura atingida.','biotoxin':'Munição para aplicação de biotoxina; confira resistência e efeitos na referência.','poison':'Munição para aplicar veneno; confira resistência e efeitos na referência.','incendiary':'Munição incendiária, capaz de provocar fogo.','rubber':'Munição de impacto com regras próprias de dano não letal.','smart':'Munição inteligente para sistemas de armas compatíveis.'}
   desc=effects.get(s.get('type'),'Munição especial para o tipo de arma indicado. Verifique o efeito e a compatibilidade na referência.')
   fact('Quantidade por pacote',s.get('amount'));fact('Tipo',s.get('type'));fact('Formato',s.get('variety'))
  elif typ=='vehicle':
   desc='Veículo para deslocamento e transporte. Capacidade, resistência e velocidades estão indicadas abaixo.'
   fact('SDP',s.get('sdp'));fact('Assentos',s.get('seats'));fact('Velocidade em combate',s.get('speedCombat'));fact('Velocidade de viagem',s.get('speedNarrative'))
  elif typ=='clothing':desc='Peça de vestuário do estilo e da categoria indicados no nome. Não fornece proteção balística por si só.'
  elif typ=='itemUpgrade':desc='Melhoria para equipamento compatível. A compra adiciona a peça ao inventário; instalação e efeitos são ajustados manualmente.'
  elif typ=='drug':desc='Substância de uso consumível. Confira aplicação, duração, resistência e efeitos adversos na referência antes de usar.'
 else:desc='Descrição específica ainda não verificada. O índice oficial consultado informa nome, preço e referência, mas não explica o funcionamento deste produto.'
 item.update(description=desc,descriptionStatus=status,details=facts)
data['version']='0.3.1'
p.write_text('window.RedMarketCatalog='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';',encoding='utf8')
print('Descrições:',sum(i['descriptionStatus']!='reference' for i in data['items']),'Programas:',sum(i['kind']=='program' for i in data['items']))
