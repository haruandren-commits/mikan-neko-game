const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await page.clock.install();await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
 const closed=await page.locator('.hole').first().evaluate(h=>{
  const lid=h.querySelector('.lid-piece').getBBox(),bowl=h.querySelector('.bowl-piece').getBBox();
  return Math.abs((lid.y+lid.height)-bowl.y);
 });
 assert.ok(closed<10,'closed peel halves meet');
 await page.locator('#start').click();await page.clock.runFor(650);
 const hole=page.locator('.emerging');
 async function sample(ms){await hole.evaluate((h,ms)=>h.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=ms}),ms)}
 await sample(200);
 assert.equal(await hole.locator('.peek').evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.equal(await hole.locator('.feline').evaluate(el=>getComputedStyle(el).opacity),'0');
 await page.screenshot({path:'/tmp/mikan-svg-peek.png'});
 await sample(430);
 const mid=await hole.locator('.feline').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).f);
 await sample(650);
 const end=await hole.locator('.feline').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).f);
 assert.ok(mid>end,'cat stretches upward through intermediate positions');
 const lid=await hole.locator('.lid-piece').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).f);
 assert.ok(Math.abs(lid+62)<1,'lid reaches hands at raised pose');
 await page.screenshot({path:'/tmp/mikan-svg-stretched.png'});
 await page.clock.runFor(500);
 await page.locator('.holding').dispatchEvent('pointerdown',{button:0,isPrimary:true});
 const hit=page.locator('.hit');
 await hit.evaluate(h=>h.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=90}));
 assert.equal(await hit.locator('.feline').evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.notEqual(await hit.locator('.face-surprised').evaluate(el=>getComputedStyle(el).display),'none');
 await page.screenshot({path:'/tmp/mikan-svg-hit.png'});
 await hit.evaluate(h=>h.getAnimations({subtree:true}).forEach(a=>a.currentTime=500));
 assert.equal(await hit.locator('.feline').evaluate(el=>getComputedStyle(el).opacity),'0');
 assert.ok(Math.abs(await hit.locator('.lid-piece').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).f))<1);
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:width===320?568:844});
  const cells=await page.locator('.hole').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,x:r.x,right:r.right}}));
  assert.equal(cells.length,9);assert.ok(cells.every(r=>r.w>=70 && r.x>=0 && r.right<=width));
  await page.screenshot({path:`/tmp/mikan-svg-${width}.png`,fullPage:true});
 }
 console.log('PASS: joined peel, visible peek, progressive rise, supported raised lid, readable hit, closed restoration, 4 mobile layouts');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
