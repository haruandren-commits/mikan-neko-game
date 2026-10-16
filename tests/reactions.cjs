const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
 await page.locator('#start').tap();
 for(let n=1;n<=3;n++){
  await page.locator('.hole.up').waitFor();
  const cat=page.locator('.hole.up');
  await cat.tap();
  const reaction=page.locator('.hole.hit');
  assert.equal(await reaction.evaluate(h=>h.classList.contains('surprised')),n>=3);
  const expression=await reaction.locator('.mouth').evaluate(el=>getComputedStyle(el).borderTopStyle);
  assert.equal(expression,'solid');
  const before=await page.locator('#score').textContent();
  await reaction.dispatchEvent('pointerdown',{isPrimary:true,button:0});
  assert.equal(await page.locator('#score').textContent(),before);
  if(n===1 || n===3){
   // Freeze only CSS to inspect the expression during its readable hold.
   await reaction.evaluate(h=>h.querySelectorAll('*').forEach(el=>el.style.animationPlayState='paused'));
   assert.equal(await reaction.locator('.cat').evaluate(el=>getComputedStyle(el).opacity),'1');
   await page.screenshot({path:`/tmp/mikan-${n===1?'worried':'surprised'}.png`});
   await reaction.evaluate(h=>h.querySelectorAll('*').forEach(el=>el.style.animationPlayState=''));
  }
 }
 assert.equal(await page.locator('#score').textContent(),'35');
 // Escape breaks the combo, and the next hit returns to the worried expression.
 await page.locator('.hole.escaped').waitFor();
 await page.locator('.hole.up').waitFor();await page.locator('.hole.up').tap();
 assert.equal(await page.locator('.hole.hit.surprised').count(),0);
 assert.equal(await page.locator('#combo').textContent(),'1 COMBO');
 console.log('PASS: worried face, surprised at combo 3, visible hold, double tap, combo reset');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
