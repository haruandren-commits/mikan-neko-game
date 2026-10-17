
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
<g class="feline ink" fill="#fffdf4">
<path class="tail-piece" d="M65 126C43 133 39 119 30 126C21 136 42 145 62 139" fill="#fffdf4"/>
<path d="M62 120Q51 132 47 140Q50 147 64 142L76 129M98 120Q109 132 113 140Q110 147 96 142L84 129"/>
<path d="M64 94Q55 108 61 127Q78 139 99 127Q105 108 95 94Z"/>
<ellipse cx="80" cy="118" rx="10" ry="13" fill="#f7e5c0" stroke="none"/>
<path d="M63 106Q49 96 45 60Q45 54 51 54Q57 54 57 62L68 92M97 106Q111 96 115 60Q115 54 109 54Q103 54 103 62L92 92"/>
<g class="ear-piece"><path d="M50 73L49 48Q50 42 58 46L73 62M110 73L111 48Q110 42 102 46L87 62"/><path d="M55 58L55 50L65 61M105 58L105 50L95 61" fill="#efb9a5" stroke="none"/></g>
<path class="head" d="M47 80Q44 60 68 59Q80 54 94 60Q117 61 113 82Q116 104 80 105Q44 104 47 80Z"/>
<path d="M59 99Q80 105 101 99L99 106Q80 113 61 106Z" fill="#e79139"/>
<circle cx="80" cy="110" r="6.5" fill="#ffd666"/><path d="M80 111V115M78 109H82" fill="none" stroke-width="1.5"/>
<g class="face-normal"><g class="eyelids" fill="#62442f" stroke="none"><ellipse cx="66" cy="81" rx="3.3" ry="4"/><ellipse cx="94" cy="81" rx="3.3" ry="4"/></g><path d="M74 91Q77 96 80 91Q83 96 86 91" fill="none"/></g>
<g class="face-smile" fill="none"><path d="M61 82Q66 75 71 82M89 82Q94 75 99 82M73 91Q80 100 87 91"/></g>
<g class="face-sleepy" fill="none"><path d="M61 82H71M89 82H99"/><ellipse cx="80" cy="94" rx="3" ry="4"/></g>
<g class="face-worried" fill="none"><path d="M60 81L71 84M100 81L89 84M74 96Q80 91 86 96"/><path d="M111 82Q118 90 112 92Q106 91 111 82" fill="#8dd1df" stroke="none"/></g>
<g class="face-surprised"><circle cx="66" cy="82" r="6"/><circle cx="94" cy="82" r="6"/><circle cx="66" cy="83" r="2" fill="#62442f" stroke="none"/><circle cx="94" cy="83" r="2" fill="#62442f" stroke="none"/><ellipse cx="80" cy="96" rx="4" ry="5" fill="#bc816a"/></g>
<path d="M77 87Q80 85 83 87L80 90Z" fill="#d28c7c" stroke="none"/>
<g fill="#efc0aa" stroke="none"><ellipse cx="56" cy="90" rx="6" ry="3"/><ellipse cx="104" cy="90" rx="6" ry="3"/></g>
<path d="M45 88L37 86M45 92L36 94M115 88L123 86M115 92L124 94" stroke-width="1.4"/>
<g class="paws"><ellipse cx="50" cy="57" rx="7" ry="5"/><ellipse cx="110" cy="57" rx="7" ry="5"/><path d="M48 56V58M52 56V58M108 56V58M112 56V58" stroke-width="1"/></g>
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
