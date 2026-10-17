const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 for(const name of (process.env.TEST_BROWSERS||'chromium,webkit').split(',')){
 const browser=await ({chromium,webkit}[name]).launch({headless:true,...(name==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
 assert.equal(await page.locator('#board .scene').count(),9);
 assert.equal(await page.locator('#board .feline').first().evaluate(el=>getComputedStyle(el).opacity),'0');
 await page.locator('#start').click();await page.clock.runFor(500);
 assert.equal(await page.locator('[data-phase="preparing"]').count(),1);
 await page.locator('.emerging').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 assert.equal(await page.locator('#score').textContent(),'0','preparation is not hittable');
 await page.clock.runFor(300);assert.equal(await page.locator('[data-phase="rising"]').count(),1);
 await page.clock.runFor(350);assert.equal(await page.locator('[data-phase="holding"]').count(),1);
 await page.locator('.hole.up').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 assert.equal(await page.locator('#score').textContent(),'10');
 await page.locator('.hole.hit').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 assert.equal(await page.locator('#score').textContent(),'10');
 await page.locator('#pause').click();const time=await page.locator('#time').textContent();
 assert.equal(await page.locator('.hit .feline').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
 await page.clock.runFor(5000);assert.equal(await page.locator('#time').textContent(),time);
 await page.locator('#resume').click();
 // No hit: escaping starts before life loss and all taps are then ignored.
 await page.clock.runFor(2300);
 assert.equal(await page.locator('.hole.escaped').count(),1);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'escape layer must not widen page');
 assert.equal(await page.locator('#lives').textContent(),'♥♥♥');
 await page.locator('.hole.escaped').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 assert.equal(await page.locator('#score').textContent(),'10');
 await page.locator('#pause').click();
 assert.equal(await page.locator('.escape-flight .feline').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
 await page.clock.runFor(3000);assert.equal(await page.locator('#lives').textContent(),'♥♥♥');
 await page.locator('#resume').click();await page.clock.runFor(650);
 assert.equal(await page.locator('#lives').textContent(),'♥♥♡');
 assert.equal(await page.locator('.escape-flight').count(),0);
 await page.clock.runFor(6500);assert.equal(await page.locator('#result').isVisible(),true);
 assert.equal(await page.locator('#lives').textContent(),'♡♡♡');
 await page.locator('#retry').click();assert.equal(await page.locator('#score').textContent(),'0');
 const positions=new Set();
 for(let i=0;i<300;i++){
  await page.clock.runFor(100);
  if(await page.locator('.hole.up').count()){
   positions.add(await page.locator('.hole.up').getAttribute('aria-label'));
   await page.locator('.hole.up').dispatchEvent('pointerdown',{isPrimary:true,button:0});
  }
 }
 assert.ok(positions.size>1,'random positions must change');
 assert.equal(await page.locator('#time').textContent(),'0');
 assert.equal(await page.locator('#end-reason').textContent(),'30秒、おしまい！');
 assert.match(await page.locator('#stage').textContent(),/STAGE 3/);
 assert.ok(Number(await page.locator('#final-combo').textContent())>3);
 await page.locator('#retry').click();await page.locator('#sound').click();
 assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,value:true}));
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 assert.equal(await page.locator('#paused').isVisible(),true);
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:width===320?568:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);
 console.log(`${name}: PASS nine SVGs, prepare/rise/hold, hit, double tap, pause, delayed life loss, escaped tap ignored, restore, game over/retry, random positions, 30s/stages/combo, sound, background, 4 widths`);
 }finally{await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
