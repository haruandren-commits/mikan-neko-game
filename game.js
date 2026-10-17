
'use strict';
const $=id=>document.getElementById(id), DURATION=30000;
const PREP_MS=300, RISE_MS=650, ESCAPE_MS=650;
const state={mode:'intro',score:0,combo:0,maxCombo:0,hits:0,lives:3,remaining:DURATION,stage:1,active:-1,expires:0,next:0,last:0,best:0};
const sfx=new GameSound();
let frame=0,previous=-1;
try{state.best=Number(localStorage.getItem('mikan-neko-best'))||0}catch{}
$('best').textContent=state.best;
function artwork(id){return `<svg class="scene" viewBox="0 0 160 170" aria-hidden="true" focusable="false">
<defs><radialGradient id="skin-${id}" cx="30%" cy="20%" r="80%"><stop stop-color="#ffd46a"/><stop offset=".5" stop-color="#ffad32"/><stop offset="1" stop-color="#ed7922"/></radialGradient><linearGradient id="bowl-${id}" x2="0" y2="1"><stop stop-color="#ffb746"/><stop offset="1" stop-color="#ee7d24"/></linearGradient></defs>
<ellipse cx="80" cy="158" rx="57" ry="7" fill="#b8904b" opacity=".23"/>
<g class="shell">
<g class="peek"><path d="M23 117Q80 108 137 117L137 125H23Z" fill="#69492f"/><path class="peek-face" d="M52 124L54 112L59 107L64 111Q80 106 96 111L102 107L106 113L108 124Z" fill="#fffdf4" stroke="#815437" stroke-width="1.5"/><ellipse cx="66" cy="119" rx="5" ry="3" fill="#fff"/><ellipse cx="93" cy="119" rx="5" ry="3" fill="#fff"/><circle cx="66" cy="119" r="2" fill="#544033"/><circle cx="93" cy="119" r="2" fill="#544033"/></g>
<g class="feline ink" fill="#fffef8">
<path class="tail-piece" d="M65 126C44 137 38 123 30 128C24 135 41 144 62 138"/>
<path d="M63 119Q51 132 45 139Q44 147 59 144L77 130M97 119Q109 132 115 139Q116 147 101 144L83 130"/>
<path d="M62 96C63 112 49 118 56 133Q80 144 104 133C111 118 97 112 98 96Z"/>
<path d="M77 128L83 133M83 128L77 133" fill="none" stroke-width="1.5"/>
<path d="M62 108Q48 99 44 61Q42 53 49 53Q56 52 57 62L69 95M98 108Q112 99 116 61Q118 53 111 53Q104 52 103 62L91 95"/>
<g class="ear-piece"><path d="M45 75L46 49Q46 43 53 46L68 62M115 75L114 49Q114 43 107 46L92 62"/><path d="M51 61L51 51L61 63M109 61L109 51L99 63" fill="#efb7ac" stroke="none"/></g>
<path class="head" d="M42 80C40 62 58 57 80 58C102 57 120 62 118 80C120 99 102 108 80 108C58 108 40 99 42 80Z"/>
<path d="M54 72L61 69M99 69L106 72" fill="none" stroke-width="1.7"/>
<path d="M59 102Q80 109 101 102L100 108Q80 116 60 108Z" fill="#d88a32"/>
<circle class="bell" cx="80" cy="115" r="10" fill="#ffc62e"/>
<ellipse cx="77" cy="111" rx="3" ry="2" fill="#fff0a5" stroke="none"/>
<path d="M80 114C76 114 77 119 80 119C83 119 84 114 80 114M80 119V124" fill="none" stroke-width="1.5"/>
<g class="face-normal"><g class="eyelids"><ellipse class="round-eye" cx="68" cy="82" rx="7.8" ry="8.5"/><ellipse class="round-eye" cx="92" cy="82" rx="7.8" ry="8.5"/><ellipse cx="69" cy="83" rx="3.1" ry="4" fill="#4c3629" stroke="none"/><ellipse cx="91" cy="83" rx="3.1" ry="4" fill="#4c3629" stroke="none"/><circle cx="70" cy="81" r="1.2" fill="white" stroke="none"/><circle cx="92" cy="81" r="1.2" fill="white" stroke="none"/></g><path d="M71 98Q80 93 89 98Q80 104 71 98Z" fill="#ef9b92" stroke-width="1.5"/></g>
<g class="face-smile" fill="none"><path d="M61 83Q68 75 75 83M85 83Q92 75 99 83"/><path d="M71 96Q80 108 89 96Z" fill="#ef9b92"/></g>
<g class="face-sleepy" fill="none"><path d="M61 83H75M85 83H99"/><ellipse cx="80" cy="99" rx="4" ry="3" fill="#ef9b92"/></g>
<g class="face-worried" fill="none"><path d="M61 82L74 86M99 82L86 86M73 101Q80 95 87 101"/><path d="M115 84Q122 93 116 95Q110 94 115 84" fill="#8dd1df" stroke="none"/></g>
<g class="face-surprised"><ellipse cx="68" cy="82" rx="8.5" ry="9"/><ellipse cx="92" cy="82" rx="8.5" ry="9"/><ellipse cx="69" cy="83" rx="3" ry="4" fill="#4c3629" stroke="none"/><ellipse cx="91" cy="83" rx="3" ry="4" fill="#4c3629" stroke="none"/><ellipse cx="80" cy="99" rx="5" ry="6" fill="#ef9b92"/></g>
<ellipse cx="80" cy="92" rx="3.4" ry="2.4" fill="#c59783" stroke-width="1.3"/>
<g fill="#efc0aa" stroke="none"><ellipse cx="53" cy="94" rx="5" ry="2.4"/><ellipse cx="107" cy="94" rx="5" ry="2.4"/></g>
<g fill="#56402e" stroke="none"><ellipse cx="51" cy="96" rx="3" ry="3.7"/><ellipse cx="109" cy="96" rx="3" ry="3.7"/></g>
<path d="M48 93L34 89M48 96L33 96M48 99L35 103M112 93L126 89M112 96L127 96M112 99L125 103" stroke-width="1.4"/>
<g class="paws"><ellipse cx="49" cy="57" rx="7" ry="5"/><ellipse cx="111" cy="57" rx="7" ry="5"/><path d="M47 56V58M51 56V58M109 56V58M113 56V58" stroke-width="1"/></g>
</g>
<g class="bowl-piece"><path d="M20 120Q80 127 140 120C142 171 18 171 20 120Z" fill="url(#bowl-${id})" class="ink" stroke="#c66d28"/><path d="M22 121Q80 128 138 121" fill="none" stroke="#ffe6a2" stroke-width="5"/><g fill="#d57827" opacity=".55"><circle cx="42" cy="138" r="1.5"/><circle cx="60" cy="148" r="1.5"/><circle cx="106" cy="141" r="1.6"/><circle cx="121" cy="132" r="1.2"/><circle cx="85" cy="151" r="1.2"/></g><path d="M31 132Q34 143 48 146" stroke="#ffd67d" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<g class="lid-piece"><path d="M20 120C14 49 146 49 140 120Q80 128 20 120Z" fill="url(#skin-${id})" class="ink" stroke="#c66d28"/><path d="M20 120Q80 128 140 120" class="split-line" fill="none" stroke="#9b4b20" stroke-width="2"/><path d="M36 98Q40 81 57 78" stroke="#ffe09a" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/><g fill="#d98929" opacity=".5"><circle cx="110" cy="87" r="1.5"/><circle cx="123" cy="108" r="1.7"/><circle cx="92" cy="77" r="1.2"/></g><path d="M79 69Q82 62 84 61" stroke="#698438" stroke-width="3" fill="none"/><path d="M83 66Q94 52 108 60Q100 73 83 66" fill="#78a84c" stroke="#557c36" stroke-width="1.5"/></g>
</g>
<g class="stars" fill="#ffc93d" stroke="#d69324" stroke-width="1"><path d="M29 65L32 72L40 73L34 78L35 86L29 82L22 86L24 78L18 73L26 72Z"/><path d="M132 81L135 88L143 89L137 94L138 102L132 98L125 102L127 94L121 89L129 88Z"/><path d="M105 41L108 47L115 48L110 52L111 59L105 55L99 59L100 52L95 48L102 47Z"/></g>
</svg><span class="pop"></span>`}

const holes=Array.from({length:9},(_,i)=>{
 const b=document.createElement('button');b.type='button';b.className='hole';b.setAttribute('aria-label',`みかん ${i+1}：猫はいません`);b.innerHTML=artwork(i);
 b.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;e.preventDefault();tap(i)});
 b.addEventListener('click',e=>{if(e.detail===0)tap(i)});$('board').append(b);return b;
});
function initAudio(){return sfx.unlock()}
function sound(kind){sfx.play(kind,state.combo)}
function updateSound(){$('sound').textContent=`音：${sfx.enabled?'ON':'OFF'}`;$('sound').setAttribute('aria-pressed',String(sfx.enabled))}
$('sound').onclick=()=>{
 sfx.setEnabled(!sfx.enabled);updateSound();
 if(sfx.enabled){const generation=sfx.generation;initAudio().then(()=>{if(generation===sfx.generation && state.mode!=='paused')sound('appear')})}
};
updateSound();
function setText(id,value){const el=$(id),text=String(value);if(el.textContent!==text)el.textContent=text}
function hud(){
 setText('score',state.score);setText('time',Math.ceil(state.remaining/1000));
 setText('lives','♥'.repeat(state.lives)+'♡'.repeat(3-state.lives));
 setText('combo',`${state.combo} COMBO`);
 setText('stage',`STAGE ${state.stage} · ${['のんびり','そわそわ','大さわぎ'][state.stage-1]}`);
 const lifeLabel=`残りライフ${state.lives}`;
 if($('lives').getAttribute('aria-label')!==lifeLabel)$('lives').setAttribute('aria-label',lifeLabel);
 $('timer-fill').style.transform=`scaleX(${state.remaining/DURATION})`;
 const progress=document.querySelector('.progress'),seconds=String(Math.ceil(state.remaining/1000));
 if(progress.getAttribute('aria-valuenow')!==seconds)progress.setAttribute('aria-valuenow',seconds);
}
function resetHole(i){holes[i].className='hole';holes[i].dataset.phase='idle';delete holes[i].dataset.kind;holes[i].setAttribute('aria-label',`みかん ${i+1}：猫はいません`)}
function randomDelay(){
 const [min,max]=[[800,1500],[520,1100],[520,800]][state.stage-1];
 return Math.round(min+Math.random()*(max-min));
}
function scheduleNext(recovery=0){state.next=state.remaining-Math.max(recovery,randomDelay())}
function spawn(){
 // Repeats are allowed, but limit runs to two to keep positions varied.
 let choices=holes.map((_,i)=>i);
 if(state.repeat>=2)choices=choices.filter(i=>i!==previous);
 const i=choices[Math.floor(Math.random()*choices.length)];
 holes.forEach((_,n)=>resetHole(n));state.repeat=i===previous?(state.repeat||0)+1:1;previous=i;
 state.active=i;state.born=state.remaining;state.appeared=false;
 const roll=state.events++===0?1:Math.random();
 state.kind=roll<.12?'feint':roll<.24?'peek':'cat';
 state.energetic=state.events>1 && state.kind==='cat' && Math.random()<.16;
 state.riseMs=state.energetic?520:RISE_MS;
 state.expires=state.remaining-PREP_MS-[1350,1050,780][state.stage-1];
 const h=holes[i];h.dataset.kind=state.kind;
 if(state.kind==='feint'){
  h.classList.add('feint');h.dataset.phase='feint';state.eventEnd=state.remaining-420;
  h.setAttribute('aria-label',`みかん ${i+1}：震えるだけ`);
 }else if(state.kind==='peek'){
  h.classList.add('peek-only');h.dataset.phase='peek';state.eventEnd=state.remaining-780;
  h.setAttribute('aria-label',`みかん ${i+1}：ちょい顔出し、見送ってOK`);
 }else{
  h.classList.add('emerging');if(state.energetic)h.classList.add('energetic');
  h.classList.add(['expression-calm','expression-smile','expression-sleepy'][Math.floor(Math.random()*3)]);
  h.dataset.phase='preparing';h.setAttribute('aria-label',`みかん ${i+1}：猫が準備中`);
 }
}
function launchEscape(i){
 const rect=holes[i].getBoundingClientRect(),flight=document.createElement('div');
 flight.className='escape-flight escaped';flight.setAttribute('aria-hidden','true');
 Object.assign(flight.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
 flight.style.setProperty('--flight-x',`${innerWidth-rect.left+180}px`);
 flight.append(holes[i].querySelector('.scene').cloneNode(true));
 const stage=document.createElement('div');stage.className='flight-stage';stage.setAttribute('aria-hidden','true');stage.append(flight);document.body.append(stage);
}
function clearFlights(){document.querySelectorAll('.flight-stage').forEach(el=>el.remove())}
function resolveCat(hit){
 const i=state.active;if(i<0)return;
 state.active=-1;
 holes[i].className='hole '+(hit?'hit':'escaped');
 holes[i].dataset.phase=hit?'blocked':'escaping';
 holes[i].setAttribute('aria-label',`みかん ${i+1}：${hit?'押し戻した猫':'逃げる猫'}`);
 if(hit){
  state.combo++;state.hits++;state.maxCombo=Math.max(state.maxCombo,state.combo);
  holes[i].classList.toggle('surprised',state.combo>=3);
  const points=10+Math.floor(state.combo/3)*5;state.score+=points;
  holes[i].querySelector('.pop').textContent=`+${points} / ${state.combo}コンボ`;
  $('message').textContent=state.combo>=3?`${state.combo}コンボ！ 猫もびっくり！`:'わっ！ みかんへおかえりニャ。';
  $('combo').classList.remove('combo-bounce');void $('combo').offsetWidth;$('combo').classList.add('combo-bounce');sound('hit');scheduleNext(560);
 }else{
  state.combo=0;launchEscape(i);state.escaping=i;state.escapeDone=state.remaining-ESCAPE_MS;
  holes[i].querySelector('.pop').textContent='にゃ〜！';
  $('message').textContent='あっ、猫がお散歩へ…！';scheduleNext(850);state.escapeSoundAt=state.remaining-180;state.escapeSaid=false;
 }
 hud();
}
function sync(now){
 const elapsed=Math.max(0,now-state.last);state.last=now;
 state.remaining=Math.max(0,state.remaining-elapsed);
 state.stage=Math.min(3,1+Math.floor((DURATION-state.remaining)/10000));
 if(state.escaping>=0 && !state.escapeSaid && state.remaining<=state.escapeSoundAt){state.escapeSaid=true;sound('escape')}
 if(state.escaping>=0 && state.remaining<=state.escapeDone){
  resetHole(state.escaping);clearFlights();state.escaping=-1;state.lives--;hud();
  if(!state.lives){finish('life');return}
 }
 if(state.remaining<=0){hud();finish('time');return}
 const seconds=Math.ceil(state.remaining/1000);
 if(seconds<=5 && seconds!==state.lastCount){state.lastCount=seconds;sound('countdown')}
 if(state.active>=0){
  const i=state.active,h=holes[i],age=state.born-state.remaining;
  if(state.kind!=='cat'){
   if(state.kind==='peek' && age>=100 && !state.appeared){state.appeared=true;sound('appear')}
   if(state.remaining<=state.eventEnd){$('message').textContent=state.kind==='feint'?'あれ？ 震えただけ。ライフはそのまま！':'ひょこっ。またあとでニャ！';resetHole(i);state.active=-1;scheduleNext()}
  }else{
   if(age>=100 && !state.appeared){state.appeared=true;sound('appear')}
   if(age>=PREP_MS && !h.classList.contains('up')){
    h.classList.add('up');h.dataset.phase='rising';
    h.setAttribute('aria-label',`みかん ${i+1}：猫と上の皮をタップ`);
   }
   if(age>=state.riseMs){h.classList.add('holding');h.dataset.phase='holding'}
   if(state.remaining<=state.expires)resolveCat(false);
  }
 }
 if(state.mode==='playing' && state.active<0 && state.escaping<0 && state.remaining<=state.next)spawn();
 hud();
}
function loop(now){if(state.mode!=='playing')return;sync(now);if(state.mode==='playing')frame=requestAnimationFrame(loop)}
function tap(i){if(state.mode!=='playing')return;sync(performance.now());if(state.mode==='playing'&&state.active===i && state.kind==='cat' && state.born-state.remaining>=PREP_MS)resolveCat(true)}
function begin(){$('combo').style.animationPlayState='running';$('combo').classList.remove('combo-bounce');sfx.stop();sfx.silent=false;clearFlights();cancelAnimationFrame(frame);Object.assign(state,{mode:'playing',score:0,combo:0,maxCombo:0,hits:0,lives:3,remaining:DURATION,stage:1,active:-1,escaping:-1,escapeDone:0,born:0,events:0,repeat:0,lastCount:6,next:DURATION-450,last:performance.now()});previous=-1;holes.forEach((_,i)=>resetHole(i));['intro','result','paused'].forEach(id=>$(id).hidden=true);$('pause').disabled=false;$('message').textContent='顔が出たら、ぽんっ！';const generation=sfx.generation;initAudio().then(()=>{if(generation===sfx.generation && state.mode==='playing')sound('start')});hud();holes[0].focus({preventScroll:true});frame=requestAnimationFrame(loop)}
function finish(reason){if(state.mode!=='playing')return;state.mode='ended';sfx.stop();clearFlights();cancelAnimationFrame(frame);if(state.active>=0)resetHole(state.active);state.active=-1;$('pause').disabled=true;$('end-reason').textContent=reason==='time'?'30秒、おしまい！':'3匹の猫がお散歩に出かけました。';$('final-score').textContent=state.score;$('final-combo').textContent=state.maxCombo;$('final-hits').textContent=state.hits;const record=state.score>state.best;if(record){state.best=state.score;try{localStorage.setItem('mikan-neko-best',String(state.best))}catch{}}$('best').textContent=state.best;$('record').textContent=record?'✨ 自己ベスト更新！':'またいっしょに遊ぼうニャ。';$('result').hidden=false;$('retry').focus();sound(record?'record':'end')}
function pause(){if(state.mode!=='playing')return;sync(performance.now());if(state.mode!=='playing')return;state.mode='paused';$('combo').style.animationPlayState='paused';sfx.pause();document.querySelectorAll('.hole,.escape-flight').forEach(h=>h.classList.add('motion-paused'));cancelAnimationFrame(frame);$('paused').hidden=false;$('resume').focus()}
function resume(){if(document.hidden||state.mode!=='paused')return;state.mode='playing';$('combo').style.animationPlayState='running';document.querySelectorAll('.hole,.escape-flight').forEach(h=>h.classList.remove('motion-paused'));state.last=performance.now();$('paused').hidden=true;sfx.resume();holes[Math.max(0,state.active)].focus({preventScroll:true});frame=requestAnimationFrame(loop)}
$('start').onclick=begin;$('retry').onclick=begin;$('pause').onclick=pause;$('resume').onclick=resume;$('help').onclick=()=>{if(state.mode==='playing')pause();else{$('result').hidden=true;$('intro').hidden=false;$('start').focus()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});window.addEventListener('pagehide',pause);
// Keep keyboard focus inside the visible modal. Pointer play uses pointerdown only.
document.addEventListener('keydown',e=>{const modal=[...document.querySelectorAll('.overlay')].find(el=>!el.hidden);if(!modal)return;if(e.key==='Tab'){const buttons=[...modal.querySelectorAll('button')];if(buttons.length){e.preventDefault();buttons[0].focus()}}});
hud();$('start').focus();

document.querySelectorAll('.illustration').forEach((el,i)=>el.innerHTML=artwork('hero'+i));
