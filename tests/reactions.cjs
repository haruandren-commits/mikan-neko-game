const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');await page.locator('#start').tap();
 for(let n=1;n<=3;n++){
  await page.locator('.holding').waitFor();
  // Alternate actual touch targets: lid, face, and torso. All route to one atomic hit.
  const target=['.lid-piece','.head','.feline'][n-1];
  const box=await page.locator('.holding '+target).boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  const hit=page.locator('.hole.hit');await hit.waitFor();
  assert.equal(await hit.evaluate(h=>h.classList.contains('surprised')),n>=3);
  const face='.face-surprised';
  assert.notEqual(await hit.locator(face).evaluate(el=>getComputedStyle(el).display),'none');
  const before=await page.locator('#score').textContent();
  await hit.dispatchEvent('pointerdown',{isPrimary:true,button:0});
  assert.equal(await page.locator('#score').textContent(),before);
  if(n===3){
   await page.locator('#pause').tap();
   const frozen=await hit.locator('.feline').evaluate(el=>el.getAnimations()[0].currentTime);
   await page.waitForTimeout(250);
   const later=await hit.locator('.feline').evaluate(el=>el.getAnimations()[0].currentTime);
   assert.ok(Math.abs(later-frozen)<40,'pause freezes SVG animation time');
   await page.locator('#resume').tap();
  }
 }
 assert.equal(await page.locator('#score').textContent(),'35');
 await page.locator('.hole.escaped').waitFor();
 assert.equal(await page.locator('.escape-flight').count(),1);
 await page.locator('.holding').waitFor();await page.locator('.holding').tap();
 assert.equal(await page.locator('.hole.hit.surprised').count(),0);
 assert.equal(await page.locator('#combo').textContent(),'1 COMBO');
 // Reduced motion keeps playable visibility without idle wiggles.
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('.holding').waitFor();
 assert.equal(await page.locator('.holding .feline').evaluate(el=>getComputedStyle(el).opacity),'1');
 console.log('PASS: real touch on lid/face/body, reactions, double tap, paused animation, combo reset, reduced motion');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
