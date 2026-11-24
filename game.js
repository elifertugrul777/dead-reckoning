'use strict';

const { cities, people } = window.DR;
const $ = id => document.getElementById(id);
const svgNS = 'http://www.w3.org/2000/svg';
const SAVE_KEY = 'dead-reckoning-season2';
const BEST_KEY = SAVE_KEY+'-best';
const DURATIONS = [120,120,120,150];
const storage = {
  read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  write(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch {} }
};
const localClock = (city,record) => new Intl.DateTimeFormat('tr-TR',{
  timeZone:city.zone,day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'
}).format(new Date(record.iso));
const utcClock = record => record.iso.slice(8,10)+' Tem · '+record.iso.slice(11,16)+' UTC';
const timeText = (city,minute) => String(city.hour ?? 22).padStart(2,'0')+':'+String(minute).padStart(2,'0');
const secondsText = s => String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const landing = $('landing');
const workspace = $('workspace');
const beat = makeAudio();
let audioEnabled = false;
let game;
let ticker;
let playback;
let lastClue = null;
let hint = false;

function initial() {
  return {stage:0,phase:'hunt',score:0,finished:false,deadline:0,attempts:0,opened:[],solved:[],
    choice:null,selected:[null,null,null],utc:false,aligned:false,person:null};
}
function save() { storage.write(SAVE_KEY,game); }
function choiceScore(base) { return base+Math.max(0,(game.deadline ? remaining() : 0)-game.attempts*15); }

function makeAudio() {
  let context;
  let mixer;
  let clock;
  let bar = 0;
  const score = [
    [55,82.41,130.81,146.83],[43.65,65.41,103.83,116.54],
    [48.99,73.42,116.54,130.81],[41.20,61.74,98,110]
  ];
  function tone(note,length,level,kind,offset=0,attack=.02) {
    if (!context || context.state !== 'running') return;
    const start=context.currentTime+offset;
    const oscillator=context.createOscillator();
    const envelope=context.createGain();
    oscillator.type=kind;
    oscillator.frequency.value=note;
    envelope.gain.setValueAtTime(.0001,start);
    envelope.gain.exponentialRampToValueAtTime(level,start+attack);
    envelope.gain.exponentialRampToValueAtTime(.0001,start+length);
    oscillator.connect(envelope).connect(mixer);
    oscillator.start(start);
    oscillator.stop(start+length+.03);
  }
  function motif() {
    const [bass,fifth,third,high]=score[bar++%score.length];
    tone(bass,3.6,.17,'sine',0,.55);
    tone(fifth,3.7,.035,'triangle',0,.8);
    for (const [i,note] of [third,high,fifth*2,third*2,high,third].entries()) {
      tone(note,.64,i===3?.05:.027,'triangle',.16+i*.47);
    }
    for (const offset of [0,.37,1.8,2.17]) tone(46,.23,.12,'sine',offset);
  }
  async function toggle(on) {
    if (!on) {
      clearInterval(clock);
      if (mixer) mixer.gain.setValueAtTime(0,context.currentTime);
      return false;
    }
    const Audio=window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    if (!context) {
      context=new Audio();
      mixer=context.createGain();
      mixer.connect(context.destination);
    }
    await context.resume();
    mixer.gain.setValueAtTime(.32,context.currentTime);
    clearInterval(clock);
    motif();
    clock=setInterval(motif,3200);
    return true;
  }
  function cue(type) {
    const notes={open:[196,247],clue:[261,392,523],proof:[293,440,587],warn:[110,97],finish:[196,293,392,587]}[type] || [196];
    notes.forEach((note,i)=>tone(note,type==='finish'?1.25:.38,.12,'triangle',i*.11));
  }
  return {toggle,cue};
}
function sound(type) { if (audioEnabled) beat.cue(type); }
async function setSound(on) {
  try { audioEnabled=await beat.toggle(on); } catch { audioEnabled=false; }
  $('sound').setAttribute('aria-pressed',audioEnabled);
  $('sound').textContent=audioEnabled?'♪ Ses açık':'♪ Ses kapalı';
}
function startSound() { if (storage.read(SAVE_KEY+'-sound')!==false && !audioEnabled) void setSound(true); }
$('sound').onclick=()=>{const next=!audioEnabled;storage.write(SAVE_KEY+'-sound',next);void setSound(next);};

$('city-strip').innerHTML=cities.map(city=>'<article class="city-card" data-scene="'+city.id+'"><span>VAKA '+city.no+'</span><strong>'+city.city+'</strong></article>').join('');
function dialog(title,body) {
  $('dialog-content').innerHTML='<h2>'+title+'</h2>'+body;
  if (!$('dialog').open) $('dialog').showModal();
}
$('guide').onclick=()=>dialog('İlk hamlen ne?', '<ol><li>Olay sahnesinde parlayan noktaları bularak dört delili topla.</li><li>Haritada zamanı oynat ve iki delil testini yap.</li><li>Alibi hakkında karar ver. Finalde üç saati UTC’ye çevirip imzayı bir şüpheliye bağla.</li></ol><p>Süreli mod isteğe bağlı. Müzik ve efektleri üstteki ses düğmesinden kapatabilirsin.</p>');
function updateHome() {
  const last=storage.read(SAVE_KEY);
  const best=storage.read(BEST_KEY);
  $('continue').hidden=!last || last.finished;
  $('best').hidden=!best;
  if(best) $('best').textContent='Kişisel rekor · '+best+' puan';
}
$('start').onclick=()=>{
  if (!$('continue').hidden) {
    dialog('Yeni soruşturma açılsın mı?','<p>Mevcut kaydın yerine yeni bir dosya açılır.</p><button id="new-confirm" class="primary" type="button">Yeni dosya aç</button>');
    $('new-confirm').onclick=()=>{$('dialog').close();startSound();enter(initial());};
  } else {startSound();enter(initial());}
};
$('continue').onclick=()=>{startSound();enter(storage.read(SAVE_KEY)||initial());};
$('brand').onclick=event=>{event.preventDefault();goHome();};
function enter(state) {
  game=state;
  landing.hidden=true;
  workspace.hidden=false;
  lastClue=null;
  hint=false;
  save();
  render(true);
}
function goHome() {
  clearInterval(ticker);
  stopPlayback();
  landing.hidden=false;
  workspace.hidden=true;
  updateHome();
  window.scrollTo(0,0);
}
function render(top=false) {
  clearInterval(ticker);
  stopPlayback();
  if (game.finished) showOutcome();
  else if (game.stage===cities.length) renderFinal();
  else renderCase(cities[game.stage]);
  if ($('home')) $('home').onclick=goHome;
  if (!game.finished) bindClock();
  if (top) {
    window.scrollTo(0,0);
    $('screen-title')?.focus({preventScroll:true});
  }
}
function nav() {
  const locations=cities.concat([{city:'Final',no:'04'}]);
  return '<nav class="case-nav" aria-label="Dosya ilerlemesi">'+locations.map((city,i)=>
    '<span '+(i===game.stage?'aria-current="step"':'')+' class="'+(i<game.stage?'cleared':'')+'">'+(i<game.stage?'✓ ':city.no+' · ')+city.city+'</span>'
  ).join('')+'<button id="home" type="button" class="quiet">Ana menü</button></nav>';
}
function remaining() { return Math.max(0,Math.ceil((game.deadline-Date.now())/1000)); }
function clockMarkup() {
  return '<div class="clock"><output id="countdown" aria-label="Kalan süre">'+(game.deadline?secondsText(remaining()):'')+'</output>'+
    '<button id="timed" type="button" class="quiet" '+(game.deadline?'hidden':'')+'>⏱ Süreli modu başlat</button></div>';
}
function bindClock() {
  $('timed').onclick=()=>{
    game.deadline=Date.now()+DURATIONS[game.stage]*1000;save();sound('open');render();
  };
  function tick() {
    if (!game.deadline) return;
    const left=remaining();
    $('countdown').textContent=secondsText(left);
    $('countdown').classList.toggle('urgent',left<=20);
    if(left===20 && !$('countdown').dataset.alerted){$('countdown').dataset.alerted='yes';sound('warn');}
    if (left===0) {
      clearInterval(ticker);
      stopPlayback();
      workspace.querySelectorAll('[data-lock]').forEach(button=>button.disabled=true);
      $('expiry').hidden=false;
    }
  }
  $('untimed-continue').onclick=()=>{game.deadline=0;save();render();};
  $('retry').onclick=()=>{
    const {stage,score}=game;
    game={...initial(),stage,score,deadline:Date.now()+DURATIONS[stage]*1000};lastClue=null;hint=false;save();render(true);
  };
  tick();
  if(game.deadline && remaining()>0) ticker=setInterval(tick,200);
}
function expiryMarkup() {
  return '<div class="expiry" id="expiry" hidden><strong>Süre doldu.</strong><div><button id="untimed-continue" class="primary" type="button">Süresiz devam et</button><button id="retry" class="secondary" type="button">Vakayı yeniden başlat</button></div></div>';
}
function mapButton(label,action,pressed) {
  return '<button type="button" class="quiet" data-map="'+action+'" aria-pressed="'+pressed+'">'+label+'</button>';
}
function graphic(name, attrs = {}) {
  const el = document.createElementNS(svgNS,name);
  for (const [key,value] of Object.entries(attrs)) el.setAttribute(key,String(value));
  return el;
}
function svgLabel(group, content, x, y, classes = '', anchor = 'start') {
  const el = graphic('text',{x,y,class:classes,'text-anchor':anchor});
  el.textContent = content;
  group.append(el);
  return el;
}
function project(center, span, w, h) {
  // Independent spans define a schematic equirectangular view of each case.
  return ([lon,lat]) => [(0.5+(lon-center[0])/span[0])*w,(0.5-(lat-center[1])/span[1])*h];
}
function path(points, proj, close = false) {
  return points.map((point,index) => {
    const [x,y] = proj(point);
    return (index ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ') + (close ? ' Z' : '');
}
function geographicKm(a,b) {
  const radians = Math.PI/180;
  const dLat = (b[1]-a[1])*radians;
  const dLon = (b[0]-a[0])*radians;
  const h = Math.sin(dLat/2)**2 + Math.cos(a[1]*radians)*Math.cos(b[1]*radians)*Math.sin(dLon/2)**2;
  return 6371.0088*2*Math.asin(Math.sqrt(Math.min(h,1)));
}
function routeKm(points) {
  return points.slice(1).reduce((total,point,index) => total+geographicKm(points[index],point),0);
}
function pointAlong(points, progress) {
  // Piecewise linear interpolation weighted by geographic segment length.
  const distances = points.slice(1).map((point,index) => geographicKm(points[index],point));
  let target = distances.reduce((sum,value) => sum+value,0)*Math.max(0,Math.min(1,progress));
  for (let i=0;i<distances.length;i++) {
    if (target <= distances[i]) {
      const ratio = distances[i] ? target/distances[i] : 0;
      return points[i].map((value,axis) => value+ratio*(points[i+1][axis]-value));
    }
    target -= distances[i];
  }
  return points.at(-1);
}
function line(group, x1, y1, x2, y2, color, width = 1) {
  group.append(graphic('line',{x1,y1,x2,y2,stroke:color,'stroke-width':width}));
}
function coordinateLabel(coords) {
  const [lon,lat] = coords;
  return Math.abs(lat).toFixed(4)+'° '+(lat < 0?'S':'N')+' / '+Math.abs(lon).toFixed(4)+'° '+(lon < 0?'W':'E');
}
function addMarker(group, coords, label, proj, onClick, selected, offset) {
  const [x,y] = proj(coords);
  const marker = graphic('g',{class:'marker',tabindex:0,role:'button','aria-label':label,transform:'translate('+x+' '+y+')'});
  const labelLeft = offset[0] - (offset[2] === 'end' ? label.length*9 : 0);
  const hitLeft = Math.min(-16,labelLeft-4);
  const hitRight = Math.max(16,labelLeft+label.length*9+4);
  marker.append(
    graphic('rect',{x:hitLeft,y:-26,width:hitRight-hitLeft,height:57,fill:'transparent'}),
    graphic('circle',{r:13,fill:'none',stroke:selected?'#f1ac65':'#7bd8ca44','stroke-width':1.5}),
    graphic('circle',{class:'dot',r:5,fill:selected?'#f1ac65':'#8bd4c8',stroke:'#192526','stroke-width':1.5})
  );
  svgLabel(marker,label,offset[0],offset[1],'',offset[2] || 'start');
  marker.addEventListener('click',onClick);
  marker.addEventListener('keydown',event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); }
  });
  group.append(marker);
  return marker;
}
function mapMarkup(city) {
  return '<div class="map-head"><span class="field">'+(city?'OLAY HARİTASI':'DÜNYA HARİTASI')+'</span><div class="controls" id="map-buttons">' +
    (city ? mapButton('Şehir','local',true) + mapButton('Dünya','world',false) + mapButton('Rota','route',true) : '') +
    '</div></div><svg id="map" class="map-canvas" viewBox="0 0 760 390" aria-label="Etkileşimli soruşturma haritası" preserveAspectRatio="xMidYMid meet"></svg>' +
    '<div id="map-note" class="map-key" aria-live="polite">Bir işarete dokun ve konumunu incele.</div>';
}
function paintMap(city, view, showRoute, selectedSite, minute) {
  const map = $('map');
  const world = view === 'world' || !city;
  const w = 760, h = 390;
  const proj = world ? project([8,14],[370,189],w,h) : project(city.center,city.span,w,h);
  map.replaceChildren();
  const title = graphic('title');
  title.textContent = world ? 'Lisbon, New York and Tokyo' : city.city+' evidence locations';
  map.append(title,graphic('rect',{x:0,y:0,width:w,height:h,fill:'#101f25'}));
  const topology = window.DR_COAST[world ? 'world' : city.id];
  topology.forEach(polygon => map.append(graphic('path',{d:path(polygon,proj,true),fill:'#24373b',stroke:'#496367','stroke-width':world ? 1 : 1.7})));
  for (let x=0;x<=w;x+=38) line(map,x,0,x,h,'#557e8025');
  for (let y=0;y<=h;y+=39) line(map,0,y,w,y,'#557e8025');
  if (world) {
    if (game.aligned) {
      const linked = [cities[1], cities[0], cities[2]].map(item=>item.center);
      map.append(graphic('path',{d:path(linked,proj),stroke:'#f1ac65','stroke-width':1.5,'stroke-dasharray':'5 5',fill:'none','pointer-events':'none'}));
    }
    const offsets = [[13,21],[11,-12],[11,-12]];
    cities.forEach((item,index) => addMarker(map,item.center,item.city,proj,() => {
      $('map-note').textContent = item.city+' · '+item.zone+' · '+coordinateLabel(item.center);
    },(city?.id === item.id) || game.aligned,offsets[index]));
    svgLabel(map,'DÜNYA / WGS 84',18,367,'small-map');
  } else {
    if(city.water) svgLabel(map,city.water,530,220,'small-map');
    if(showRoute) {
      map.append(graphic('path',{d:path(city.route,proj),stroke:'#31464a','stroke-width':7,fill:'none'}));
      map.append(graphic('path',{d:path(city.route,proj),stroke:'#7baba4','stroke-width':2,'stroke-dasharray':'8 5',fill:'none'}));
      const [, departure, arrival] = city.track;
      const progress = (minute-departure)/(arrival-departure);
      const [x,y] = proj(pointAlong(city.route,progress));
      const vehicle = graphic('circle',{cx:x,cy:y,r:8,fill:'#f1ac65',stroke:'#201c17','stroke-width':2.2});
      vehicle.id = 'vehicle-on-map';
      map.append(vehicle);
    }
    const offsets = city.id === 'lisbon' ? [[-12,-15,'end'],[12,-12],[12,-13]] :
      city.id === 'newyork' ? [[12,-14],[-12,-14,'end'],[12,19]] : [[12,16],[13,-10],[-12,17,'end']];
    city.sites.forEach(([id,label,lon,lat],index) => {
      addMarker(map,[lon,lat],label,proj,() => {
        selectedSite.value = id;
        $('map-note').textContent = label+' · '+coordinateLabel([lon,lat]);
        paintMap(city,view,showRoute,selectedSite,minute);
        const markers = $('map').querySelectorAll('.marker');
        markers[index]?.focus();
      },selectedSite.value === id,offsets[index]);
    });
    const latitude = city.center[1];
    const px500 = (.5/(111.32 * Math.cos(latitude*Math.PI/180))) / city.span[0]*w;
    line(map,20,357,20+px500,357,'#bed0cd',2);
    svgLabel(map,'≈ 500 m',20,375,'small-map');
    svgLabel(map,'K ↑',720,33,'small-map');
  }
}

function stopPlayback() { clearInterval(playback); playback=null; }
function travelState(city,minute) {
  const [,departure,arrival]=city.track;
  return minute<departure?'İskelede veya istasyonda bekliyor':minute<arrival?'Yolda':'Varış noktasında';
}
function figure(who,name,role) {
  return '<div class="speaker"><div class="portrait" data-cast="'+who+'" aria-hidden="true"></div><span><strong>'+name+'</strong><small>'+role+'</small></span></div>';
}
function say(who,text,id='message') {
  const cast={
    detective:['Ada Demir','Başdedektif'],officer:['Elias Grant','Polis çavuşu'],killer:['Maskeli kişi','Kimliği belirsiz']
  };
  const [name,role]=cast[who];
  return '<div class="dialogue">'+figure(who,name,role)+'<p id="'+id+'" role="status">'+text+'</p></div>';
}
function focusAction() { $('action')?.focus({preventScroll:true}); }
function showNote(message,type='') {
  const box=$('notice');
  box.textContent=message;
  box.dataset.type=type;
  box.hidden=!message;
}
function setPhase(phase) {
  game.phase=phase;save();sound('open');render(true);
}
function board(title,subtitle) {
  return '<div class="board-head"><div><p class="eyebrow">'+subtitle+'</p><h2 id="screen-title" tabindex="-1">'+title+'</h2></div>'+clockMarkup()+'</div>';
}
function phaseBar(active) {
  const steps=[['hunt','Delil topla'],['map','Haritada sına'],['verdict','Karar ver']];
  const at=steps.findIndex(([key])=>key===active);
  return '<div class="phase-bar" aria-label="Vaka adımları">'+steps.map(([key,label],i)=>
    '<span '+(key===active?'aria-current="step"':'')+' class="'+(i<at?'cleared':'')+'">'+(i<at?'✓ ':i+1+'. ')+label+'</span>'
  ).join('')+'</div>';
}
function evidenceBag(city) {
  return '<div class="evidence-bag" aria-label="Delil çantası">'+city.ops.map((item,i)=>
    '<button type="button" data-clue="'+i+'" '+(game.opened.includes(item.id)?'':'disabled')+' aria-label="'+(game.opened.includes(item.id)?item.name:'Bulunmamış delil '+(i+1))+'">'+
      (game.opened.includes(item.id)?'<span aria-hidden="true">'+item.icon+'</span><span>'+item.name+'</span>':'<span aria-hidden="true">◇</span><span>Bulunmadı</span>')+'</button>'
  ).join('')+'</div>';
}
function renderCase(city) {
  const mode=game.phase;
  workspace.innerHTML=nav()+'<article class="board">'+board(city.label,city.city+' · '+city.date)+expiryMarkup()+phaseBar(mode)+
    (mode==='hunt'?huntMarkup(city):mode==='map'?caseMapMarkup(city):verdictMarkup(city))+'</article>';
  if(mode==='hunt') bindHunt(city);
  else if(mode==='map') bindCaseMap(city);
  else bindVerdict(city);
  workspace.querySelectorAll('[data-clue]').forEach(button=>button.onclick=()=>{
    const item=city.ops[Number(button.dataset.clue)];
    if(game.opened.includes(item.id)) showEvidence(item);
  });
}
function huntMarkup(city) {
  const total=city.ops.length;
  const found=game.opened.length;
  return '<div class="mission"><span>'+(found===total?'<strong>Deliller tamam</strong> · Haritayı aç':'<strong>Olay yerini ara</strong> · Parlayan izlere dokun')+'</span><output id="clue-count">'+found+' / '+total+' delil</output></div>'+
    '<div class="scene '+(hint?'hint-on':'')+'" data-scene="'+city.id+'" id="scene" aria-label="'+city.city+' olay yeri">'+
    city.ops.map((item,i)=>'<button type="button" class="hotspot '+(game.opened.includes(item.id)?'found':'')+'" data-lock id="spot-'+i+'" data-spot="'+i+'" style="--x:'+item.x+'%;--y:'+item.y+'%" aria-label="'+(game.opened.includes(item.id)?item.name:'Olay yerindeki iz '+(i+1))+'"><span aria-hidden="true">'+(game.opened.includes(item.id)?'✓':'✦')+'</span></button>').join('')+
    '<button id="hint" type="button" class="scene-hint secondary" aria-pressed="'+hint+'">İzleri vurgula</button></div>'+
    say('detective',city.hook)+
    evidenceBag(city)+'<div class="bottom-bar"><button type="button" id="action" data-lock class="primary" '+(found===total?'':'disabled')+'>Haritayı aç</button><button id="brief" class="quiet" type="button">Olay özeti</button></div>';
}
function showEvidence(item) {
  lastClue=item.id;
  const node=$('message');
  if(!node) return;
  node.replaceChildren();
  const title=document.createElement('strong');
  title.textContent=item.icon+' '+item.name+' ';
  node.append(title,document.createTextNode(item.body));
}
function bindHunt(city) {
  $('hint').onclick=()=>{
    hint=!hint;
    $('scene').classList.toggle('hint-on',hint);
    $('hint').setAttribute('aria-pressed',hint);
  };
  $('brief').onclick=()=>dialog(city.victim,'<p>'+city.intro+'</p>');
  $('action').onclick=()=>setPhase('map');
  const last=city.ops.find(item=>item.id===lastClue);
  if(last) showEvidence(last);
  workspace.querySelectorAll('[data-spot]').forEach(spot=>spot.onclick=()=>{
    const i=Number(spot.dataset.spot);
    const clue=city.ops[i];
    const isNew=!game.opened.includes(clue.id);
    if(isNew) {
      game.opened.push(clue.id);
      save();
      const y=window.scrollY;
      lastClue=clue.id;
      render();
      window.scrollTo(0,y);
      if(game.opened.length===city.ops.length) focusAction();
      else $('spot-'+i)?.focus({preventScroll:true});
      sound('clue');
    }
    showEvidence(clue);
  });
}
function caseMapMarkup(city) {
  const solved=game.solved.length;
  return '<div class="mission"><span><strong>Alibiyi sına</strong> · İki harita testini tamamla</span><output>'+solved+' / 2 test</output></div>'+
    '<div class="test-row">'+city.tests.map((test,i)=>
      '<button type="button" class="secondary '+(game.solved.includes(i)?'test-done':'')+'" data-lock data-test="'+i+'">'+(game.solved.includes(i)?'✓ ':'')+test.title+'</button>'
    ).join('')+'</div><p id="notice" class="notice" role="status" hidden></p>'+
    '<div class="map-frame">'+mapMarkup(city)+
    '<div class="timeline"><div><label for="scrub">Olay saati</label><output id="local-time" for="scrub"></output></div>'+
    '<input type="range" id="scrub" min="'+city.range[0]+'" max="'+city.range[1]+'" value="'+city.range[0]+'" data-lock>'+
    '<div><span id="vehicle-status"></span><button id="playback" class="secondary" type="button" data-lock>▶ Canlandır</button></div></div></div>'+
    say('officer','Bir test seç. Haritada aracın nerede olduğunu gör, sonra iki sonuca dayanarak karar ver.')+
    evidenceBag(city)+'<div class="bottom-bar"><button type="button" id="action" data-lock class="primary" '+(solved===2?'':'disabled')+'>Alibi hakkında karar ver</button></div>';
}
function bindCaseMap(city) {
  let view='local';
  let route=true;
  const site={value:null};
  let minute=city.range[0];
  const draw=()=>paintMap(city,view,route,site,minute);
  function change(value) {
    minute=Number(value);
    $('scrub').value=minute;
    $('local-time').textContent=timeText(city,minute);
    $('vehicle-status').textContent=travelState(city,minute)+' · ≈ '+routeKm(city.route).toFixed(2)+' km';
    const dot=$('vehicle-on-map');
    if(dot) {
      const [,departure,arrival]=city.track;
      const projection=project(city.center,city.span,760,390);
      const [x,y]=projection(pointAlong(city.route,(minute-departure)/(arrival-departure)));
      dot.setAttribute('cx',x);dot.setAttribute('cy',y);
    }
  }
  function halt() {stopPlayback();$('playback').textContent='▶ Canlandır';}
  $('scrub').addEventListener('input',event=>{halt();change(event.target.value);});
  $('playback').onclick=()=>{
    if(playback){halt();return;}
    if(minute>=city.range[1]) change(city.range[0]);
    $('playback').textContent='Ⅱ Duraklat';
    playback=setInterval(()=>{
      change(Math.min(city.range[1],minute+1));
      if(minute>=city.range[1]) halt();
    },330);
  };
  $('map-buttons').addEventListener('click',event=>{
    const button=event.target.closest('[data-map]');
    if(!button) return;
    if(button.dataset.map==='route') route=!route;
    else view=button.dataset.map;
    $('map-buttons').querySelectorAll('[data-map]').forEach(item=>item.setAttribute('aria-pressed',item.dataset.map==='route'?route:item.dataset.map===view));
    draw();
  });
  workspace.querySelectorAll('[data-test]').forEach(button=>button.onclick=()=>{
    const i=Number(button.dataset.test);
    const test=city.tests[i];
    if(!game.solved.includes(i)){game.solved.push(i);save();sound('proof');}
    halt();
    site.value=city.ops.find(item=>item.id===test.needs[0]).site;
    change(test.time);
    draw();
    button.classList.add('test-done');
    button.textContent='✓ '+test.title;
    const count=workspace.querySelector('.mission output');
    count.textContent=game.solved.length+' / 2 test';
    $('action').disabled=game.solved.length<2;
    showNote(test.result,'good');
  });
  $('action').onclick=()=>setPhase('verdict');
  draw();change(minute);
}
function verdictMarkup(city) {
  return '<div class="mission"><span><strong>Son karar</strong> · Delillerin desteklediği ifadeyi seç</span></div>'+
    '<div class="verdict-art" data-scene="'+city.id+'"></div>'+say('detective','Sahnedeki izler ve haritadaki testler neyi kanıtlıyor?')+
    '<div class="choice-list" id="choices" aria-label="Alibi kararı"></div><p class="notice" id="notice" role="status" hidden></p>'+
    '<div class="bottom-bar"><button type="button" id="action" class="primary" data-lock>Kararı gönder</button>'+
    '<button type="button" id="back-map" class="quiet">Haritaya dön</button></div>';
}
function options(id,labels,selected,onChange) {
  const container=$(id);
  container.replaceChildren(...labels.map((label,i)=>{
    const button=document.createElement('button');
    button.className='choice';button.type='button';button.dataset.lock='';button.setAttribute('aria-pressed',i===selected);
    button.textContent=label;
    button.onclick=()=>{
      container.querySelectorAll('button').forEach((item,j)=>item.setAttribute('aria-pressed',i===j));
      onChange(i);
    };
    return button;
  }));
}
function bindVerdict(city) {
  options('choices',city.choices,game.choice,i=>{game.choice=i;save();});
  $('back-map').onclick=()=>setPhase('map');
  $('action').onclick=()=>{
    if(game.choice===null){showNote('Önce bir ifade seç.','bad');return;}
    if(game.choice!==city.answer){game.attempts++;save();showNote('Bu ifade iki delil testiyle uyuşmuyor. Haritaya dönüp tekrar bakabilirsin.','bad');sound('warn');return;}
    const earned=choiceScore(300);
    const report=city.report;
    game={...initial(),stage:game.stage+1,score:game.score+earned};
    lastClue=null;hint=false;save();sound('proof');render(true);
    dialog('Dosya çözüldü · +'+earned+' puan','<p>'+report+'</p><form method="dialog"><button type="submit" class="primary">Sonraki dosyaya geç</button></form>');
  };
}

function renderFinal() {
  workspace.innerHTML=nav()+'<article class="board">'+board('Ortak Dakika','LİZBON · NEW YORK · TOKYO')+expiryMarkup()+
    '<div class="mission"><span><strong>Üç kaydı eşleştir</strong> · Her şehirden bir kayıt seç ve saatleri UTC’ye çevir</span></div>'+
    '<div class="final-grid"><div class="map-frame">'+mapMarkup(null)+'</div><div class="final-records">'+
    '<label class="utc"><input id="utc" data-lock type="checkbox" '+(game.utc?'checked':'')+'> Saatleri UTC’ye çevir</label><div id="records"></div></div></div>'+
    say('killer','“Üç ülkede üç farklı saat. Hangisine inanacaksın, dedektif?”')+
    '<p class="notice" id="notice" role="status" hidden></p><p class="notice" id="matched" hidden></p>'+
    '<div class="bottom-bar"><button id="action" class="primary" data-lock type="button">Kayıtları karşılaştır</button></div>'+
    '<div id="suspect-area" '+(game.aligned?'':'hidden')+'><div class="mission"><span><strong>İmzanın sahibini bul</strong> · Zimmet defterindeki anahtarları karşılaştır</span></div>'+
    '<div class="choice-list" id="suspects" aria-label="Şüpheliler"></div><div class="bottom-bar"><button id="submit-final" class="primary danger" data-lock type="button">Dosyayı kapat</button></div></div></article>';
  const draw=()=>paintMap(null,'world',false,{value:null},0);
  function records() {
    $('records').innerHTML=cities.map((city,i)=>'<fieldset><legend>'+city.city+'</legend>'+
      city.sync.map((record,j)=>'<label><input type="radio" data-lock id="sync-'+i+'-'+j+'" name="entry-'+i+'" data-city="'+i+'" value="'+j+'" '+
        (game.selected[i]===j?'checked':'')+'><span>'+record.type+'<strong>'+(game.utc?utcClock(record):localClock(city,record))+'</strong></span></label>').join('')+'</fieldset>').join('');
    $('records').querySelectorAll('input').forEach(item=>item.onchange=()=>{
      game.selected[Number(item.dataset.city)]=Number(item.value);
      game.aligned=false;game.person=null;
      $('suspect-area').hidden=true;
      $('matched').hidden=true;
      showNote('');draw();save();sound('open');
    });
  }
  function reveal() {
    const match=cities[0].sync[game.selected[0]];
    $('matched').textContent=utcClock(match)+' · Ortak işlem: '+match.type+' · İmza anahtarı: '+match.key;
    $('matched').dataset.type='good';
    $('matched').hidden=false;
    $('suspect-area').hidden=false;
    options('suspects',people.map(person=>person.name+' · '+person.key+' · '+person.role),game.person,i=>{game.person=i;save();});
    draw();
  }
  $('utc').onchange=event=>{game.utc=event.target.checked;records();save();sound('open');};
  $('action').onclick=()=>{
    if(!game.utc || game.selected.some(item=>item===null)){showNote('Önce her şehirden bir kayıt seç ve UTC kutusunu işaretle.','bad');return;}
    const selected=cities.map((city,i)=>city.sync[game.selected[i]]);
    const first=selected[0];
    if(!selected.every(item=>item.iso===first.iso && item.key===first.key && item.type===first.type)) {
      game.attempts++;save();showNote('Bu üç kayıt aynı ana veya imzaya ait değil. Saatleri karşılaştırıp tekrar dene.','bad');sound('warn');return;
    }
    game.aligned=true;save();showNote('');reveal();sound('proof');
    $('suspect-area').scrollIntoView({block:'nearest'});
  };
  $('submit-final').onclick=()=>{
    if(game.person===null){showNote('Önce bir şüpheli seç.','bad');return;}
    if(people[game.person].key!==cities[0].sync[game.selected[0]].key) {
      game.attempts++;save();showNote('O kişinin zimmetindeki anahtar, üç kayıttaki imzayla eşleşmiyor.','bad');sound('warn');return;
    }
    game.score+=choiceScore(450);
    game.finished=true;
    storage.write(BEST_KEY,Math.max(storage.read(BEST_KEY)||0,game.score));
    save();sound('finish');render(true);
  };
  draw();records();
  if(game.aligned) reveal();
}
function showOutcome() {
  workspace.innerHTML=nav()+'<article class="board outcome"><div class="board-head"><div><p class="eyebrow">ÜÇ VAKA · ORTAK İMZA</p><h2 id="screen-title" tabindex="-1">Dosya kapandı.</h2></div></div>'+
    '<div class="finale-art" data-scene="final"></div>'+
    say('detective','Üç kayıttaki imza Mara Vale’e ait. Senin çözdüğün çelişkiler sayesinde orijinal görüntülere ulaştık. Bağımsız tanıklar ve orijinal kayıtlar da Vale’i olay yerlerine bağlıyor.')+
    '<div class="score"><div><small>PUAN</small><strong>'+game.score+'</strong></div><div><small>REKOR</small><strong>'+storage.read(BEST_KEY)+'</strong></div></div>'+
    '<div class="bottom-bar"><button id="again" class="primary" type="button">Yeniden oyna</button></div></article>';
  $('again').onclick=()=>enter(initial());
}
updateHome();
