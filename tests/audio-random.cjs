const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.BASE_URL||'http://127.0.0.1:8000';
 await page.goto(url);await page.locator('#sound').evaluate(el=>el.click());
 await page.waitForFunction(()=>sfx.context?.state==='running');
 const signals=await page.evaluate(async()=>{
  const analyser=sfx.context.createAnalyser();analyser.fftSize=1024;sfx.master.connect(analyser);
  const data=new Float32Array(1024),results={};
  for(const kind of ['appear','hit','escape','start','countdown','end','record','meow0','meow1','meow2']){
   sfx.stop();if(kind.startsWith('meow'))sfx.meow(Number(kind.slice(-1)));else sfx.play(kind,6);let peak=0;
   for(let n=0;n<12;n++){
    await new Promise(r=>setTimeout(r,20));analyser.getFloatTimeDomainData(data);
    peak=Math.max(peak,...data.map(Math.abs));
   }
   results[kind]=peak;
  }
  sfx.stop();analyser.disconnect();return results;
 });
 for(const [kind,peak]of Object.entries(signals))assert.ok(peak>.0001,`${kind}: nonzero generated audio`);
 assert.equal(await page.evaluate(async()=>{sfx.stop();sfx.play('record');await new Promise(r=>setTimeout(r,850));return sfx.voices.size}),0,'terminal fanfare finishes and releases every voice');
 const pitches=await page.evaluate(()=>{
  const notes=[],note=sfx.note.bind(sfx);sfx.note=(...args)=>{notes.push(args[0]);note(...args)};
  sfx.play('hit',1);const low=notes[0];notes.length=0;sfx.play('hit',6);const high=notes[0];
  const appearances=[];for(let i=0;i<5;i++){notes.length=0;sfx.play('appear');appearances.push(notes[0])}
  sfx.note=note;sfx.stop();return {low,high,appearances};
 });
 assert.ok(pitches.high>pitches.low,'combo raises hit pitch');
 assert.ok(new Set(pitches.appearances).size>1,'appearance pitch varies');
 await page.reload();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
 await page.locator('#start').tap();await page.waitForFunction(()=>sfx.context?.state==='running');
 await page.locator('#pause').tap();
 await page.waitForFunction(()=>sfx.context.state==='suspended');
 assert.equal(await page.evaluate(()=>sfx.voices.size),0);
 await page.locator('#resume').tap();await page.waitForFunction(()=>sfx.context.state==='running');
 await page.locator('#sound').tap();assert.equal(await page.evaluate(()=>sfx.voices.size),0);
 await page.reload();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');
 // Controlled random draws exercise both harmless events without adding app test hooks.
 await page.clock.install();await page.locator('#start').click();
 async function forceEvent(value){await page.evaluate(value=>{
  clearFlights();holes.forEach((_,i)=>resetHole(i));state.events=2;state.active=-1;state.escaping=-1;
  state.next=state.remaining;Math.random=()=>value;
 },value);await page.clock.runFor(20)}
 await forceEvent(.05);assert.equal(await page.locator('.feint').count(),1);
 const life=await page.locator('#lives').textContent();
 await page.locator('.feint').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 await page.clock.runFor(450);assert.equal(await page.locator('#lives').textContent(),life);
 assert.equal(await page.locator('#score').textContent(),'0');
 await forceEvent(.18);assert.equal(await page.locator('.peek-only').count(),1);
 await page.locator('.peek-only').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 await page.clock.runFor(800);assert.equal(await page.locator('#lives').textContent(),life);
 assert.equal(await page.locator('#score').textContent(),'0');
 const ranges=await page.evaluate(()=>{
  let seed=5839;Math.random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  return [1,2,3].map(stage=>{state.stage=stage;return Array.from({length:30},randomDelay)});
 });
 for(const [i,values]of ranges.entries()){
  const [min,max]=[[800,1500],[520,1100],[520,800]][i];
  assert.ok(values.every(x=>x>=min&&x<=max));assert.ok(new Set(values).size>20);
 }
 await forceEvent(.4);const first=await page.locator('.emerging').getAttribute('aria-label');
 await forceEvent(.4);assert.equal(await page.locator('.emerging').getAttribute('aria-label'),first,'same location may repeat');
 await forceEvent(.4);assert.notEqual(await page.locator('.emerging').getAttribute('aria-label'),first,'third repeated location is avoided');
 // Energetic entry and varied expressions remain normal hittable cats.
 await page.evaluate(()=>{let calls=0;const seq=[.4,.8,.1,.9];Math.random=()=>seq[(calls++)%seq.length];state.events=2;state.active=-1;state.next=state.remaining});
 await page.clock.runFor(20);assert.equal(await page.locator('.energetic.expression-sleepy').count(),1);
 await page.clock.runFor(350);await page.locator('.up').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 assert.equal(await page.locator('#score').textContent(),'10');
 // Exactly one cue for each of the final five seconds, no gameplay timers after end.
 const cues=await page.evaluate(()=>{
  const events=[];const play=sfx.play.bind(sfx);sfx.play=(...args)=>{events.push(args[0]);play(...args)};
  state.active=-1;state.escaping=-1;state.remaining=5100;state.next=-10000;state.last=performance.now();state.lastCount=6;
  window.cues=events;return events.length;
 });
 await page.clock.runFor(5200);
 assert.equal(await page.locator('#result').isVisible(),true);
 assert.equal(await page.evaluate(()=>window.cues.filter(x=>x==='countdown').length),5);
 const remaining=await page.locator('#time').textContent();
 const count=await page.evaluate(()=>window.cues.length);await page.clock.runFor(5000);
 assert.equal(await page.locator('#time').textContent(),remaining);
 assert.equal(await page.evaluate(()=>window.cues.length),count);
 await page.locator('#retry').click();assert.equal(await page.locator('#time').textContent(),'30');
 assert.deepEqual(errors,[]);
 console.log('PASS: seven effects and three meow waveforms, saved ON/OFF, pause clears/suspends audio, harmless feint/peek, randomized stage gaps, repeats, energetic cat, countdown 5 cues, end cleanup/retry');
 console.log('Waveform peaks:',signals);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
