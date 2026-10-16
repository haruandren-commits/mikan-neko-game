const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 for(const name of (process.env.TEST_BROWSERS || 'chromium,webkit').split(',')){
 const type={chromium,webkit}[name];
 const browser=await type.launch({headless:true,...(name==='chromium' && process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8000');
 await page.getByRole('button',{name:'あそぶ！',exact:true}).click();
 await page.clock.runFor(500);
 assert.equal(await page.locator('.hole.up').count(),1);
 await page.clock.runFor(250);
 await page.waitForFunction(()=>{const h=document.querySelector('.hole.up');return h && h.querySelector('.paw').getBoundingClientRect().top<=h.querySelector('.lid').getBoundingClientRect().bottom+4 && h.querySelector('.head').getBoundingClientRect().bottom>h.querySelector('.lid').getBoundingClientRect().bottom});
 const pose=await page.locator('.hole.up').evaluate(h=>{
  const lid=h.querySelector('.lid'),head=h.querySelector('.head'),paw=h.querySelector('.paw');
  const matrix=new DOMMatrix(getComputedStyle(lid).transform);
  return {tilt:matrix.b,raised:matrix.f<0,handTouchesLid:paw.getBoundingClientRect().top<=lid.getBoundingClientRect().bottom+4,faceBelowLid:head.getBoundingClientRect().bottom>lid.getBoundingClientRect().bottom};
 });
 assert.ok(pose.raised && Math.abs(pose.tilt)<.001,'lid is raised horizontally');
 assert.ok(pose.handTouchesLid && pose.faceBelowLid,'hands support lid above face');
 assert.equal(await page.locator('.hole:not(.up) .cat').first().evaluate(el=>getComputedStyle(el).opacity),'0');
 await page.locator('.hole.up').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 assert.equal(await page.locator('#score').textContent(),'10');
 await page.locator('.hole.hit').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 assert.equal(await page.locator('#score').textContent(),'10','double taps must not score');
 await page.getByRole('button',{name:'一時停止',exact:true}).click();
 const time=await page.locator('#time').textContent();await page.clock.runFor(5000);
 assert.equal(await page.locator('#time').textContent(),time);
 await page.getByRole('button',{name:'つづける',exact:true}).click();
 await page.clock.runFor(7000);
 assert.equal(await page.locator('#result').isVisible(),true,'three escapes end game');
 assert.equal(await page.locator('#lives').textContent(),'♡♡♡');
 await page.getByRole('button',{name:'もう一度あそぶ！',exact:true}).click();
 assert.equal(await page.locator('#score').textContent(),'0');
 // Protect every cat while real game time advances through all three stages.
 for(let i=0;i<300;i++){
 await page.clock.runFor(100);
 if(await page.locator('.hole.up').count())await page.locator('.hole.up').dispatchEvent('pointerdown',{isPrimary:true,button:0});
 }
 assert.equal(await page.locator('#time').textContent(),'0');
 assert.equal(await page.locator('#end-reason').textContent(),'30秒、おしまい！');
 assert.match(await page.locator('#stage').textContent(),/STAGE 3/);
 assert.ok(Number(await page.locator('#final-combo').textContent())>3);
 await page.getByRole('button',{name:'もう一度あそぶ！',exact:true}).click();
 await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,value:true}));
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 assert.equal(await page.locator('#paused').isVisible(),true,'background pauses');
 for(const width of [320,375,390,430]){
 await page.setViewportSize({width,height:width===320?568:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow at ${width}`);
 }
 assert.deepEqual(errors,[]);
 await page.screenshot({path:`/tmp/mikan-${name}.png`,fullPage:true});
 console.log(`${name}: scoring, repeated tap, pause, life end, timer end, stage, retry, sound toggle, background, 4 widths passed`);
 await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1});
