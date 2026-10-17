'use strict';
// Original synthesized sounds. No third-party samples or runtime downloads.
class GameSound {
 constructor(){
  this.enabled=false;try{this.enabled=localStorage.getItem('mikan-neko-sound')==='on'}catch{}
  this.context=null;this.voices=new Set();this.silent=false;this.generation=0;
 }
 unlock(){
  if(!this.enabled)return Promise.resolve();
  try{
   if(!this.context){
    const Audio=window.AudioContext||window.webkitAudioContext;
    this.context=new Audio({latencyHint:'interactive'});
    this.master=this.context.createGain();this.master.gain.value=.28;
    const limiter=this.context.createDynamicsCompressor();
    limiter.threshold.value=-18;limiter.knee.value=12;limiter.ratio.value=8;
    this.master.connect(limiter);limiter.connect(this.context.destination);
   }
   // Called directly from user gestures, including Safari resume gestures.
   return this.context.resume().catch(()=>{});
  }catch{return Promise.resolve()}
 }
 setEnabled(value){
  this.enabled=value;try{localStorage.setItem('mikan-neko-sound',value?'on':'off')}catch{}
  if(!value)this.stop();
 }
 stop(){this.generation++;for(const node of this.voices){try{node.stop()}catch{}}this.voices.clear()}
 pause(){this.silent=true;this.stop();if(this.context)this.context.suspend().catch(()=>{})}
 resume(){this.silent=false;return this.unlock()}
 note(frequency,duration,delay=0,type='sine',end=frequency,volume=.35){
  const ctx=this.context;if(!ctx||ctx.state!=='running'||this.silent||!this.enabled||this.voices.size>=24)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+delay;
  osc.type=type;osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+duration);
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.008);
  gain.gain.exponentialRampToValueAtTime(.001,t+duration);
  osc.connect(gain);gain.connect(this.master);this.voices.add(osc);
  osc.onended=()=>{this.voices.delete(osc);osc.disconnect();gain.disconnect()};osc.start(t);osc.stop(t+duration+.02);
 }
 meow(pattern){
  const ctx=this.context;if(!ctx||ctx.state!=='running'||this.silent||!this.enabled||this.voices.size>=20)return;
  // A voiced source through two vowel formants gives a short "nya-o" sound.
  const osc=ctx.createOscillator(),amp=ctx.createGain(),a=ctx.createBiquadFilter(),b=ctx.createBiquadFilter(),t=ctx.currentTime;
  osc.type='sawtooth';const base=[480,560,430][pattern];
  osc.frequency.setValueAtTime(base,t);osc.frequency.exponentialRampToValueAtTime(base*1.45,t+.1);osc.frequency.exponentialRampToValueAtTime(base*.62,t+.4);
  a.type=b.type='bandpass';a.Q.value=2.5;b.Q.value=3;
  a.frequency.setValueAtTime(1350,t);a.frequency.exponentialRampToValueAtTime(650,t+.42);
  b.frequency.setValueAtTime(2400,t);b.frequency.exponentialRampToValueAtTime(1100,t+.42);
  amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(.3,t+.035);amp.gain.exponentialRampToValueAtTime(.001,t+.43);
  osc.connect(a);osc.connect(b);a.connect(amp);b.connect(amp);amp.connect(this.master);
  this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);[osc,a,b,amp].forEach(n=>n.disconnect())};osc.start(t);osc.stop(t+.45);
 }
 play(kind,combo=0){
  if(!this.enabled||this.silent||!this.context||this.context.state!=='running')return;
  const n=(...args)=>this.note(...args);
  if(kind==='appear'){
   const p=.94+Math.random()*.12;n(230*p,.15,0,'sine',570*p,.35);n(460*p,.12,.08,'sine',180*p,.18);
  }else if(kind==='hit'){
   const p=Math.pow(2,Math.min(combo-1,12)/24);n(480*p,.11,0,'sine',170*p,.6);n(950*p,.07,.015,'sine',600*p,.12);
   if(combo%3===0)[1047,1319,1568].forEach((f,i)=>n(f*p,.12,.055+i*.055,'sine',f*p,.17));
  }else if(kind==='escape')this.meow(Math.floor(Math.random()*3));
  else if(kind==='countdown'){n(660,.065,0,'sine',600,.26)}
  else if(kind==='start'){[523,659,784].forEach((f,i)=>n(f,.13,i*.085,'sine',f,.24))}
  else if(kind==='record'){[523,659,784,1047,1319,1568].forEach((f,i)=>n(f,.18,i*.085,'triangle',f,.22))}
  else if(kind==='end'){[660,523,440,330].forEach((f,i)=>n(f,.13,i*.095,'triangle',f*.8,.22))}
 }
}
