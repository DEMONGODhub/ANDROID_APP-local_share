"use strict";
/* Orb Arena client: every sphere carries a gun that points where you aim (like its eyes). Needs the page helpers $, J, store, toast, ME, INFO, DEV, AV. */
const G={ws:null,on:false,me:null,W:4500,H:4500,r0:18,cost:1,mode:0,tp:new Map(),sp:{x:2250,y:2250,z:2200,free:false,follow:null},spec(){return !!(this.my&&this.my[9])},pl:new Map(),os:[],bl:[],lb:[],mm:[],n:0,g:{m:0,ph:0,t:0,zr:2150,al:0},my:[100,100,0,0,0,0,0,0,0],
 keys:{},mouse:{x:innerWidth/2,y:innerHeight/2},lbtn:false,rbtn:false,joy:null,jid:-1,ajoy:null,aid:-1,aim:0,aimSent:9,fireBtn:false,boostBtn:false,tapUntil:0,sf:0,sb:0,sent:"",lastSend:0,lastAim:0,
 cam:{x:1500,y:1500,z:900},k:1,raf:0,last:0,dead:false,fx:[],rings:[],floats:[],feed:[],trails:new Map(),seen:new Set(),shake:0,flash:0,hudT:0,pt:0,wl:null,
 touch:matchMedia("(pointer:coarse)").matches,hostOpen:false,rosterT:0,bannerT:0,lastCount:-1,fs:false,fireWas:false};
(function(){
const cv=$("#cv"),ctx=cv.getContext("2d"),mmc=$("#mm"),mmx=mmc.getContext("2d");
const TAU=Math.PI*2,rnd=Math.random;
const pump=[0,1,2,3].map(v=>{const i=new Image();i.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(AV.pumpkin(v));return i});
const hex=h=>`hsl(${h} 85% 60%)`;
/* the host's accent colour (set on the page as --primary): menus, highlights and your own orb follow it */
const ACC=()=>{const v=document.documentElement.style.getPropertyValue("--primary").trim();return/^#[0-9a-f]{6}$/i.test(v)?v:"#FFD60A"};
const accRGB=()=>{const n=parseInt(ACC().slice(1),16);return(n>>16)+","+(n>>8&255)+","+(n&255)};
const accShade=f=>{const n=parseInt(ACC().slice(1),16),m=f>0?255:0,a=Math.abs(f),c=[n>>16,n>>8&255,n&255].map(x=>Math.round(x+(m-x)*a));return`rgb(${c})`};
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};

/* ---- insects, drawn in code: c = context, (x,y) centre, r = body radius, h = heading, w = walking phase ---- */
const BUGS=[{n:"Aphid",c:"#7FD35A",d:"#3E8E2E"},{n:"Ant",c:"#C4532F",d:"#6B2412"},{n:"Beetle",c:"#2FA394",d:"#14504A"},{n:"Spider",c:"#8A63B5",d:"#34224F"},{n:"Mantis",c:"#A6D14A",d:"#587A1C"},{n:"Hornet",c:"#F5C518",d:"#2E2204"}];
const BNOTE=["tiny and fast","quick, balanced","slow, tough shell","long legs, eats ants","tall, hits hard","fast flyer, top of the chain"];
const ell=(c,x,y,a,b,f,rot)=>{c.fillStyle=f;c.beginPath();c.ellipse(x,y,a,b,rot||0,0,TAU);c.fill()};
function bugLegs(c,n,r,len,w,col){
  c.strokeStyle=col;c.lineWidth=Math.max(1.3,r*.09);c.lineCap="round";c.lineJoin="round";
  for(let i=0;i<n;i++){const ax=r*(n>1?.4-i*.8/(n-1):0);
    for(const s of[-1,1]){const ph=Math.sin(w+i*1.9+(s>0?Math.PI:0));
      c.beginPath();c.moveTo(ax,s*r*.22);c.lineTo(ax+ph*r*.12,s*r*(.45+len*.45));c.lineTo(ax+ph*r*.5,s*r*(.7+len));c.stroke()}}
}
function bugFeel(c,r,hx,w,t,col){ // two antennae that sway
  c.strokeStyle=col;c.lineWidth=Math.max(1,r*.06);c.lineCap="round";
  for(const s of[-1,1]){const k=Math.sin(t*5+w*.5+s)*r*.12;c.beginPath();c.moveTo(hx,s*r*.1);c.quadraticCurveTo(hx+r*.45,s*r*.3+k,hx+r*.8,s*r*.55+k*1.6);c.stroke()}
}
/* stepping legs: every foot is planted on the ground; when the body moves too far from it the foot steps forward (opposite groups take turns) and a two-bone leg bends to reach it */
const LEGN=[3,3,3,4,3,3],LEGL=[.35,.65,.45,1.05,.8,.4];
function ikLegs(c,o,n,len,r,h,col){
  const ch=Math.cos(h),sh=Math.sin(h),K=1.45,L=r*(.45+len*.5)*1.5,dt=o.dt||.016,W=(lx,ly)=>[o.x+lx*ch-ly*sh,o.y+lx*sh+ly*ch];
  const AX=i=>r*(n>1?.4-(i>>1)*.8/(n-1):0),SD=i=>i&1?1:-1;
  if(!o.ft||o.ft.length!==n*2){o.ft=[];for(let i=0;i<n*2;i++){const f=W(AX(i),SD(i)*r*(.7+len)*K);o.ft.push({x:f[0],y:f[1],st:-1,fx:0,fy:0,tx:0,ty:0})}}
  c.strokeStyle=col;c.lineWidth=Math.max(1.5,r*.11);c.lineCap=c.lineJoin="round";
  const lead=Math.min(r*.9,(o.sv||0)*.1),gp=i=>((i>>1)+(i&1))&1;
  for(let i=0;i<n*2;i++){
    const s=SD(i),a=W(AX(i),s*r*.22),rest=W(AX(i)+lead,s*r*(.7+len)*K),f=o.ft[i];
    if(f.st<0){
      const far=Math.hypot(f.x-rest[0],f.y-rest[1]);
      if(far>3.5*r){f.x=rest[0];f.y=rest[1]}
      else if(far>r*.6&&!o.ft.some((g,j)=>g.st>=0&&gp(j)!==gp(i))){f.st=0;f.fx=f.x;f.fy=f.y;f.tx=rest[0];f.ty=rest[1]}
    }else{f.st+=dt*(7+(o.sv||0)/r);const u=Math.min(1,f.st),e=u*u*(3-2*u);f.x=f.fx+(f.tx-f.fx)*e;f.y=f.fy+(f.ty-f.fy)*e;if(u>=1)f.st=-1}
    let dx=f.x-a[0],dy=f.y-a[1],d=Math.hypot(dx,dy)||1;if(d>L*1.98){dx*=L*1.98/d;dy*=L*1.98/d;d=L*1.98}
    let nx=-dy/d,ny=dx/d;if((nx*-sh+ny*ch)*s<0){nx=-nx;ny=-ny}const q=Math.sqrt(Math.max(0,L*L-d*d/4)),kx=a[0]+dx/2+nx*q,ky=a[1]+dy/2+ny*q;
    c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(kx,ky);c.lineTo(a[0]+dx,a[1]+dy);c.stroke();
  }
}
function bug(c,sp,x,y,r,h,w,t,pal,feet){
  const P=pal||BUGS[sp],C=P.c,D=P.d;
  if(feet)ikLegs(c,feet,LEGN[sp],LEGL[sp],r,h,D);
  c.save();c.translate(x,y);c.rotate(h);
  if(!feet)bugLegs(c,LEGN[sp],r,LEGL[sp],w,D);
  if(sp===5){const f=Math.sin(t*46)*.35;for(const s of[-1,1]){c.save();c.rotate(s*(.9+f));ell(c,-r*.15,0,r*.9,r*.28,"rgba(225,240,255,.5)");c.restore()}}
  if(sp===0){ell(c,-r*.1,0,r*.85,r*.7,C);ell(c,r*.7,0,r*.33,r*.3,D);for(const s of[-1,1]){c.strokeStyle=D;c.lineWidth=r*.1;c.beginPath();c.moveTo(-r*.7,s*r*.45);c.lineTo(-r*1.05,s*r*.6);c.stroke()}ell(c,-r*.2,-r*.2,r*.25,r*.14,"rgba(255,255,255,.35)")}
  if(sp===1){ell(c,-r*.6,0,r*.5,r*.4,C);ell(c,0,0,r*.3,r*.22,D);ell(c,r*.58,0,r*.3,r*.28,C);ell(c,-r*.7,-r*.12,r*.2,r*.1,"rgba(255,255,255,.28)")}
  if(sp===2){ell(c,-r*.1,0,r*.8,r*.68,C);c.strokeStyle=D;c.lineWidth=r*.07;c.beginPath();c.moveTo(-r*.88,0);c.lineTo(r*.62,0);c.stroke();ell(c,-r*.3,-r*.28,r*.34,r*.14,"rgba(255,255,255,.3)",-.3);ell(c,r*.8,0,r*.28,r*.26,D);
    c.fillStyle=D;for(const s of[-1,1]){c.beginPath();c.moveTo(r*.95,s*r*.1);c.lineTo(r*1.3,s*r*.32);c.lineTo(r*1.0,s*r*.34);c.fill()}}
  if(sp===3){ell(c,-r*.45,0,r*.62,r*.52,C);ell(c,-r*.45,0,r*.2,r*.3,D);ell(c,r*.38,0,r*.4,r*.32,D);c.fillStyle="#ff4a4a";for(const s of[-1,1])for(let i=0;i<3;i++){c.beginPath();c.arc(r*(.55+(i?.12:0)),s*r*(.06+i*.07),r*.045,0,TAU);c.fill()}}
  if(sp===4){ell(c,-r*.5,0,r*.68,r*.2,C);ell(c,r*.1,0,r*.5,r*.15,D);ell(c,r*.72,0,r*.24,r*.2,C);const g=Math.sin(t*3+w)*.12;c.strokeStyle=C;c.lineWidth=r*.1;c.lineCap="round";
    for(const s of[-1,1]){c.beginPath();c.moveTo(r*.3,s*r*.12);c.lineTo(r*.9,s*(r*.45+g*r));c.lineTo(r*.62,s*r*.12);c.stroke()}}
  if(sp===5){c.save();c.beginPath();c.ellipse(-r*.55,0,r*.58,r*.36,0,0,TAU);c.clip();ell(c,-r*.55,0,r*.6,r*.4,C);c.fillStyle=D;for(let i=0;i<3;i++)c.fillRect(-r*1.1+i*r*.36,-r*.5,r*.17,r);c.restore();
    c.fillStyle=D;c.beginPath();c.moveTo(-r*1.1,0);c.lineTo(-r*1.45,0);c.lineTo(-r*1.1,r*.1);c.fill();ell(c,r*.12,0,r*.3,r*.28,D);ell(c,r*.58,0,r*.26,r*.24,C)}
  const hx=[.88,.9,1.05,.65,.95,.82][sp];
  if(sp!==3)bugFeel(c,r,hx,w,t,D);
  c.fillStyle="#fff";for(const s of[-1,1]){c.beginPath();c.arc(hx*.9,s*r*.14,r*.085,0,TAU);c.fill()}
  c.fillStyle="#111";for(const s of[-1,1]){c.beginPath();c.arc(hx*.9+r*.03,s*r*.14,r*.045,0,TAU);c.fill()}
  c.restore();
}
function crown(c,x,y,r,h){c.save();c.translate(x,y);c.rotate(h);c.fillStyle="#FFD84A";c.beginPath();c.moveTo(r*.45,-r*.4);for(let i=0;i<4;i++){c.lineTo(r*.45+r*.18,-r*.4+i*r*.27+r*.14);c.lineTo(r*.78,-r*.4+(i+1)*r*.27)}c.lineTo(r*.45,r*.4);c.closePath();c.fill();c.restore()}
function bossBug(c,k,x,y,r,h,w,t,feet){
  if(k===2){bug(c,5,x,y,r,h,w,t,{c:"#FFB000",d:"#2A1500"},feet);crown(c,x,y,r,h);return}
  if(k===3){bug(c,2,x,y,r,h,w,t,{c:"#8A6A22",d:"#2B1B05"},feet);crown(c,x,y,r,h);c.save();c.translate(x,y);c.rotate(h);c.fillStyle="#2B1B05";c.beginPath();c.moveTo(r*.9,-r*.12);c.lineTo(r*1.6,0);c.lineTo(r*.9,r*.12);c.fill();c.restore();return}
  if(feet)ikLegs(c,feet,4,.9,r,h,"#3a0d0a");c.save();c.translate(x,y);c.rotate(h);if(!feet)bugLegs(c,4,r,.9,w,"#3a0d0a");
  const wag=Math.sin(t*3)*.15;c.strokeStyle="#7A1A12";c.lineCap="round";
  c.lineWidth=r*.28;c.beginPath();c.moveTo(-r*.5,0);c.bezierCurveTo(-r*1.5,r*(.1+wag),-r*1.5,r*1.0,-r*.7,r*.95);c.stroke();
  c.fillStyle="#FF3B2B";c.beginPath();c.moveTo(-r*.7,r*.95);c.lineTo(-r*.25,r*.78);c.lineTo(-r*.5,r*1.15);c.fill();
  ell(c,-r*.1,0,r*.75,r*.5,"#8B1E14");ell(c,-r*.2,-r*.15,r*.4,r*.12,"rgba(255,255,255,.2)");ell(c,r*.7,0,r*.3,r*.26,"#5B0F0A");
  for(const s of[-1,1]){c.strokeStyle="#8B1E14";c.lineWidth=r*.14;c.beginPath();c.moveTo(r*.5,s*r*.2);c.lineTo(r*1.0,s*r*.55);c.stroke();ell(c,r*1.1,s*r*.55,r*.22,r*.13,"#B02A1C",s*.5);c.fillStyle="#fff";c.beginPath();c.arc(r*.78,s*r*.1,r*.06,0,TAU);c.fill()}
  c.restore();
}
const SMK=[[1,"80,225,255"],[2,"255,170,40"],[4,"255,70,50"],[8,"70,130,255"],[16,"255,215,70"]];
G.sm=[];
function smoke(o,dt){ // coloured puffs: speed cyan, rapid orange, power red, shield blue, invincible gold
  const b=o.bits||0;if(!(b&31))return;
  for(const[m,c]of SMK)if(b&m&&rnd()<dt*26){const a=rnd()*TAU,d=o.r*.6*rnd();G.sm.push({x:o.x+Math.cos(a)*d,y:o.y+Math.sin(a)*d,vx:(rnd()-.5)*40,vy:-20-rnd()*40,l:.9,m:.9,s:o.r*(.3+rnd()*.3),c})}
  if(G.sm.length>380)G.sm.splice(0,G.sm.length-380);
}
function drawSmoke(dt){
  for(let i=G.sm.length-1;i>=0;i--){const f=G.sm[i];f.l-=dt;if(f.l<=0){G.sm.splice(i,1);continue}f.x+=f.vx*dt;f.y+=f.vy*dt;const al=f.l/f.m;
    ctx.fillStyle=`rgba(${f.c},${.38*al})`;ctx.beginPath();ctx.arc(f.x,f.y,f.s*(1.9-al),0,TAU);ctx.fill()}
}
/* ---- choose your insect: your pick decides your stats and where you sit in the food chain ---- */
let SPC=+store.get("ls_sp");if(!(SPC>=0&&SPC<6))SPC=1;
function paintPick(){
  for(const box of document.querySelectorAll(".spk")){box.innerHTML="";
    BUGS.forEach((b,i)=>{const e=document.createElement("button");e.className="spb"+(i===SPC?" sel":"");e.title=b.n+": "+BNOTE[i]+(i<5?" (eats smaller bugs, "+BUGS[i+1].n+" eats it)":"");e.setAttribute("aria-label",b.n);
      const cv2=document.createElement("canvas");cv2.width=cv2.height=64;bug(cv2.getContext("2d"),i,32,32,15,-.6,0,0);e.appendChild(cv2);
      e.onclick=()=>{SPC=i;store.set("ls_sp",String(i));if(G.ws&&G.ws.readyState===1)G.ws.send("s "+i);paintPick();toast(b.n+": "+BNOTE[i])};box.appendChild(e)})}
}
paintPick();G.bug=bug;G.bossBug=bossBug;

/* ---- sound (tiny, optional) ---- */
const SND={on:store.get("ls_snd")!=="0",c:null,t:0};
function beep(f,d,type,v,f2){
  if(!SND.on)return;const now=performance.now();if(now-SND.t<25)return;SND.t=now;
  try{const c=SND.c||(SND.c=new(window.AudioContext||window.webkitAudioContext)()),o=c.createOscillator(),g=c.createGain(),t=c.currentTime;
    o.type=type||"square";o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(v||.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d)}catch(e){}
}
const SI={on:"M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z",off:"M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"};
const paintSnd=()=>{$("#gsnd").innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="'+(SND.on?SI.on:SI.off)+'"/></svg>'};
$("#gsnd").onclick=()=>{SND.on=!SND.on;store.set("ls_snd",SND.on?"1":"0");paintSnd();beep(660,.08)};

/* ---- open / close ---- */
function gameOpen(){
  if(G.on)return;G.on=true;$("#game").classList.remove("hide");$("#fab").classList.add("hide");
  const el=$("#game");try{const r=(el.requestFullscreen||el.webkitRequestFullscreen);r&&r.call(el)}catch(e){}
  G.dead=false;$("#dead").classList.add("hide");$("#gconn").classList.add("hide");$("#hp").classList.add("hide");G.hostOpen=false;
  $("#ghost").hidden=!(ME.host||ME.mgr);paintSnd();
  $("#gav").src=AV.mine==="c"?AV.img:avSrc(AV.mine);
  $("#gh").textContent=G.touch?"One stick: the gun points the way you move · hold FIRE to shoot (1 pumpkin a shot) · BOOST dashes":"Move: your mouse (the ball follows the cursor, the gun points at it) or WASD · Fire: click or Space (1 pumpkin a shot) · Boost: Shift · Esc leaves";
  $("#gh").style.opacity=1;setTimeout(()=>{$("#gh").style.opacity=0},7000);
  try{if(navigator.wakeLock)navigator.wakeLock.request("screen").then(l=>{G.wl=l}).catch(()=>{})}catch(e){}
  gameConnect();G.last=performance.now();cancelAnimationFrame(G.raf);G.raf=requestAnimationFrame(frame);
}
function gameClose(){
  if(!G.on)return;G.on=false;$("#game").classList.add("hide");$("#fab").classList.toggle("hide",!INFO.gameEnabled||$("#app").classList.contains("hide"));
  cancelAnimationFrame(G.raf);clearInterval(G.pt);clearTimeout(G.rt);G.keys={};G.joy=null;G.ajoy=null;G.jid=G.aid=-1;G.lbtn=G.rbtn=G.fireBtn=G.boostBtn=false;
  $("#jy").classList.add("hide");$("#jy2").classList.add("hide");
  if(G.ws){G.ws.onclose=null;G.ws.close();G.ws=null}G.pl.clear();G.os=[];G.bl=[];G.fx=[];G.rings=[];G.floats=[];G.feed=[];G.trails.clear();G.seen.clear();G.me=null;
  try{G.wl&&G.wl.release();G.wl=null}catch(e){}
  G.fs=false;try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}
}
window.gameOpen=gameOpen;window.gameClose=gameClose;
$("#gplay").onclick=gameOpen;$("#glo").onclick=$("#lo").onclick;$("#fab").onclick=gameOpen;$("#gx").onclick=gameClose;
$("#gfs").onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else $("#game").requestFullscreen()}catch(e){}};
$("#again").onclick=()=>{if(G.ws&&G.ws.readyState===1)G.ws.send("r");G.dead=false;$("#dead").classList.add("hide")};

/* ---- connection (reconnects by itself, so a hiccup never throws you out of the game) ---- */
function gameConnect(){
  if(G.ws||!G.on)return;
  const ws=new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host+"/ws");G.ws=ws;
  ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}onMsg(m)};
  ws.onopen=()=>{$("#gconn").classList.add("hide");clearInterval(G.pt);G.pt=setInterval(()=>{if(ws.readyState===1)ws.send("p")},15000);G.sent="";G.sf=0;G.sb=0;G.aimSent=9;ws.send("s "+SPC)};
  ws.onclose=()=>{G.ws=null;clearInterval(G.pt);if(G.on){$("#gconn").classList.remove("hide");clearTimeout(G.rt);G.rt=setTimeout(recover,1200)}};
}
async function recover(){
  if(!G.on||G.ws)return;
  const r=await J("/api/info");if(!G.on||G.ws)return;
  if(!r.ok){G.rt=setTimeout(recover,2500);return}
  if(r.d.authed){INFO=r.d;gameConnect();return}
  if(!ME.host&&!r.d.needPassword){ // the host app restarted: sign back in quietly and carry on
    const l=await J("/api/login",{method:"POST",body:new URLSearchParams({name:ME.name||store.get("ls_name")||"Guest",password:"",device:DEV})});
    if(!G.on)return;
    if(l.ok){const i=await J("/api/info");if(i.ok)INFO=i.d;AV.sync();gameConnect();return}
    if(l.status===429){G.rt=setTimeout(recover,3000);return}
    if(l.status===409){gameClose();ME.name="";showLogin(l.d.error||"That name is now used by someone else. Pick another one.");return}
  }
  gameClose();toast("Sharing restarted. Please sign in again.");ME.name="";showLogin("The host restarted sharing. Please sign in again.");
}
document.addEventListener("fullscreenchange",()=>{if(!G.on)return;if(document.fullscreenElement)G.fs=true;else if(G.fs){G.fs=false;gameClose();return}resizeCv(true)});
document.addEventListener("visibilitychange",()=>{
  if(!G.on)return;
  if(document.hidden)cancelAnimationFrame(G.raf);
  else{G.last=performance.now();G.raf=requestAnimationFrame(frame);if(!G.ws)recover();try{if(navigator.wakeLock)navigator.wakeLock.request("screen").then(l=>{G.wl=l}).catch(()=>{})}catch(e){}}
});

/* ---- messages from the host ---- */
function banner(text,sub,ms){
  const b=$("#gbn");b.innerHTML="";b.append(text);if(sub){const s=document.createElement("small");s.textContent=sub;b.appendChild(s)}
  b.classList.remove("hide","pop");void b.offsetWidth;b.classList.add("pop");clearTimeout(G.bannerT);if(ms)G.bannerT=setTimeout(()=>b.classList.add("hide"),ms);
}
function feed(text,color){
  const d=document.createElement("div");d.textContent=text;if(color)d.style.borderLeft="3px solid "+color;$("#feed").prepend(d);
  while($("#feed").children.length>5)$("#feed").lastChild.remove();setTimeout(()=>d.remove(),6000);
}
function onMsg(m){
  if(m.t==="hello"){G.me=m.id;G.W=m.w;G.H=m.h;G.r0=m.r0||18;G.cost=m.cost||1;G.mode=m.mode||0;if(window.gameAuto==="obs")setTimeout(()=>setSpec(G.me,true),400);else if(window.gameAuto==="play")setTimeout(()=>setSpec(G.me,false),400);window.gameAuto="";$("#gcost").textContent="1 pumpkin";return}
  if(m.t==="dead"){
    G.dead=true;G.deadAt=performance.now();const box=$("#dead");box.classList.remove("hide");box.classList.toggle("soft",G.mode===1);
    $("#dmsg").textContent="Eliminated by "+m.by+". Score "+m.score+(m.kills?" · "+m.kills+" kills":"")+".";
    $("#dead h2").textContent=G.mode===1?"You are out. Watching":"You were taken out";
    $("#again").classList.toggle("hide",G.mode===1);if(G.mode!==1)$("#again").focus();
    showHall();G.shake=14;G.flash=1;beep(180,.35,"sawtooth",.06,50);return;
  }
  if(m.t!=="s")return;
  G.mode=m.g.m;
  const seen=new Set();
  for(const q of m.p){seen.add(q[0]);let o=G.pl.get(q[0]);
    if(!o){o={id:q[0],x:q[2],y:q[3],r:q[4],dx:0,dy:0,aim:q[6],rec:0,shown:q[7]};G.pl.set(q[0],o)}
    o.name=q[1];o.tx=q[2];o.ty=q[3];o.tr=q[4];o.hue=q[5];o.taim=q[6];o.hp=q[7];o.av=q[8];o.bits=q[9];o.sp=q[10]|0;o.boss=q[11]|0;o.hpMax=q[12]||100}
  for(const id of[...G.pl.keys()])if(!seen.has(id))G.pl.delete(id);
  if(G.dead&&G.pl.has(G.me)&&performance.now()-G.deadAt>800){G.dead=false;$("#dead").classList.add("hide")} // alive again: a new round, or a respawn
  G.os=m.o;G.lb=m.lb;G.mm=m.mm;G.n=m.n;G.g=m.g;G.my=m.me;{const tb=$("#gtm"),tm=m.g.tm|0;tb.classList.toggle("hide",!tm);tb.className=tm?"t"+tm:"hide";tb.textContent=tm===1?"Red team":tm===2?"Blue team":""}G.camT={x:m.cx,y:m.cy};
  // bullets: remember where each one is and how fast it moves, so it glides between snapshots
  const nb=new Set();
  for(const b of m.b){nb.add(b[0]);let o=G.trails.get(b[0]);
    if(!o){o={id:b[0],x:b[1],y:b[2],vx:0,vy:0,hue:b[3],pow:b[4],pts:[],born:performance.now()};G.trails.set(b[0],o);shotFx(o)}
    else{o.vx=(b[1]-o.x)*20;o.vy=(b[2]-o.y)*20;o.x=b[1];o.y=b[2]}
    o.pts.push(b[1],b[2]);if(o.pts.length>14)o.pts.splice(0,2)}
  for(const id of[...G.trails.keys()])if(!nb.has(id))G.trails.delete(id);
  for(const e of m.ev)gameEvent(e);
  if(m.nt)for(const t of m.nt){feed(t,ACC());banner(/appeared|beat/.test(t)?"BOSS":"POWER UP",t,2200);beep(520,.25,"triangle",.07,1040)}
}
function shotFx(b){ // muzzle flash + recoil on the sphere that fired
  let best=null,bd=1e9;for(const p of G.pl.values()){const d=Math.hypot(p.x-b.x,p.y-b.y)-p.r;if(p.hue===b.hue&&d<bd){bd=d;best=p}}
  if(best){best.rec=1;burst(b.x,b.y,b.hue,b.pow?10:6,260,.25,b.pow?5:3);G.rings.push({x:b.x,y:b.y,r:3,R:b.pow?34:20,l:.22,m:.22,h:b.hue});
    if(best.id===G.me){beep(b.pow?170:420,.1,"square",.035,90);G.shake=Math.max(G.shake,3)}else if(Math.hypot(best.x-G.cam.x,best.y-G.cam.y)<700)beep(260,.07,"square",.012,120)}
}
function gameEvent(e){
  if(e[0]==="h"){burst(e[1],e[2],20,9,300,.35,3.4);G.rings.push({x:e[1],y:e[2],r:4,R:30,l:.25,m:.25,h:20});G.floats.push({x:e[1],y:e[2]-10,t:"-"+e[3],l:.8,m:.8,c:e[4]===G.me?"#ff6b5a":"#ffd37a"});
    if(e[4]===G.me){G.shake=Math.max(G.shake,9);G.flash=Math.max(G.flash,.7);beep(130,.12,"sawtooth",.05,70)}else beep(520,.05,"square",.02)}
  else if(e[0]==="b"){G.rings.push({x:e[1],y:e[2],r:6,R:38,l:.3,m:.3,h:190});burst(e[1],e[2],190,6,200,.3,2.6)}
  else if(e[0]==="k"){burst(e[3],e[4],e[5],36,420,.8,5.5);G.rings.push({x:e[3],y:e[4],r:10,R:120,l:.55,m:.55,h:e[5]});
    feed(e[1]+"  ▸  "+e[2],hex(e[5]));beep(95,.4,"sawtooth",.06,40)}
  else if(e[0]==="s"){banner("FIGHT!","",1400);beep(440,.3,"square",.06,880)}
  else if(e[0]==="w"){const me=e[2]===1&&e[1]===ME.name;banner(me?"VICTORY!":e[1]+" wins","The next round starts soon",5200);beep(523,.5,"triangle",.08,1046)}
}
function burst(x,y,hue,n,sp,life,size){
  for(let i=0;i<n;i++){const a=rnd()*TAU,s=sp*(.25+rnd());G.fx.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:life*(.6+rnd()*.6),m:life,s:size*(.6+rnd()*.8),h:hue})}
  if(G.fx.length>450)G.fx.splice(0,G.fx.length-450);
}

/* ---- controls: laptop = WASD + mouse + click, phone = two thumbs + buttons ---- */
addEventListener("keydown",e=>{
  if(!G.on)return;const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(k==="Escape"){if(G.hostOpen){toggleHost(false);return}gameClose();return}
  if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
  if("wasd".includes(k)||k.startsWith("Arrow")||k===" "||k==="Shift"){G.keys[k]=true;e.preventDefault()}
  if(k==="Enter"&&G.dead&&G.mode!==1)$("#again").click();
  if(k==="h"&&(ME.host||ME.mgr))toggleHost();
},true);
addEventListener("keyup",e=>{if(!G.on)return;delete G.keys[e.key.length===1?e.key.toLowerCase():e.key]});
cv.addEventListener("wheel",e=>{if(!G.spec())return;e.preventDefault();G.sp.z=Math.max(500,Math.min(4800,G.sp.z*(e.deltaY>0?1.12:1/1.12)))},{passive:false});
cv.addEventListener("contextmenu",e=>e.preventDefault());
cv.addEventListener("pointerdown",e=>{
  cv.setPointerCapture(e.pointerId);
  if(e.pointerType==="mouse"){G.mouse={x:e.clientX,y:e.clientY};if(e.button===2)G.rbtn=true;else G.lbtn=true;if(G.spec())G.mdrag={x:e.clientX,y:e.clientY};return}
  if(G.spec()){G.pan={id:e.pointerId,x:e.clientX,y:e.clientY};G.tp.set(e.pointerId,{x:e.clientX,y:e.clientY});return}
  if(G.jid<0){G.jid=e.pointerId;G.joy={ox:e.clientX,oy:e.clientY,x:0,y:0};const j=$("#jy");j.style.left=e.clientX+"px";j.style.top=e.clientY+"px";j.classList.remove("hide");j.firstChild.style.transform="none"}
});
cv.addEventListener("pointermove",e=>{
  if(e.pointerType==="mouse"){G.mouse={x:e.clientX,y:e.clientY};if(G.spec()&&G.lbtn&&G.mdrag){G.sp.free=true;G.sp.follow=null;G.sp.x-=(e.clientX-G.mdrag.x)*dpr/G.k;G.sp.y-=(e.clientY-G.mdrag.y)*dpr/G.k;G.mdrag={x:e.clientX,y:e.clientY}}return}
  if(G.tp.has(e.pointerId)){ // spectator: drag to pan, two fingers to zoom
    const o=G.tp.get(e.pointerId),n={x:e.clientX,y:e.clientY};
    if(G.tp.size>=2){const ps=[...G.tp.keys()],a=G.tp.get(ps[0]),b=G.tp.get(ps[1]),d0=Math.hypot(a.x-b.x,a.y-b.y);G.tp.set(e.pointerId,n);const a2=G.tp.get(ps[0]),b2=G.tp.get(ps[1]),d1=Math.hypot(a2.x-b2.x,a2.y-b2.y);if(d0>10&&d1>10)G.sp.z=Math.max(500,Math.min(4800,G.sp.z*d0/d1))}
    else{G.tp.set(e.pointerId,n);G.sp.free=true;G.sp.follow=null;G.sp.x-=(n.x-o.x)*dpr/G.k;G.sp.y-=(n.y-o.y)*dpr/G.k}
    return}
  const stick=(s,id,el)=>{const dx=e.clientX-s.ox,dy=e.clientY-s.oy,m=Math.hypot(dx,dy),f=Math.min(m/50,1);s.x=m?dx/m*f:0;s.y=m?dy/m*f:0;el.firstChild.style.transform=`translate(${s.x*36}px,${s.y*36}px)`;return m};
  if(e.pointerId===G.jid&&G.joy)stick(G.joy,G.jid,$("#jy"));
  else if(e.pointerId===G.aid&&G.ajoy){const m=stick(G.ajoy,G.aid,$("#jy2"));if(m>8)G.aim=Math.atan2(G.ajoy.y,G.ajoy.x);G.ajoy.f=m>22}
});
const pend=e=>{
  G.tp.delete(e.pointerId);G.mdrag=null;
  if(e.pointerType==="mouse"){if(e.button===2)G.rbtn=false;else G.lbtn=false}
  else if(e.pointerId===G.jid){G.jid=-1;G.joy=null;$("#jy").classList.add("hide")}
  else if(e.pointerId===G.aid){G.aid=-1;G.ajoy=null;$("#jy2").classList.add("hide")}
};
cv.addEventListener("pointerup",pend);cv.addEventListener("pointercancel",pend);
const hold=(el,on,off)=>{el.addEventListener("pointerdown",e=>{e.stopPropagation();el.setPointerCapture(e.pointerId);on();el.classList.add("on")});const u=()=>{off();el.classList.remove("on")};el.addEventListener("pointerup",u);el.addEventListener("pointercancel",u)};
hold($("#gfire"),()=>{G.fireBtn=true;G.tapUntil=performance.now()+140},()=>{G.fireBtn=false});
hold($("#gb"),()=>{G.boostBtn=true},()=>{G.boostBtn=false});
function inputVec(){
  const k=G.keys;let x=0,y=0;
  if(k.ArrowLeft||k.a)x--;if(k.ArrowRight||k.d)x++;if(k.ArrowUp||k.w)y--;if(k.ArrowDown||k.s)y++;
  if(x||y){const m=Math.hypot(x,y);return[x/m,y/m]}
  if(G.joy)return[G.joy.x,G.joy.y];
  if(G.mv)return G.mv;
  return[0,0];
}
function sendInput(now){
  if(!G.ws||G.ws.readyState!==1)return;
  const[x,y]=inputVec(),s=x.toFixed(2)+" "+y.toFixed(2);
  if(s!==G.sent&&now-G.lastSend>=33){G.ws.send("m "+s);G.sent=s;G.lastSend=now}
  if(G.touch&&Math.hypot(x,y)>.2)G.aim=Math.atan2(y,x); // one stick: the gun points the way you move
  if(Math.abs(angDiff(G.aimSent,G.aim))>.03&&now-G.lastAim>=45){G.ws.send("a "+G.aim.toFixed(3));G.aimSent=G.aim;G.lastAim=now}
  const b=(G.keys.Shift||G.rbtn||G.boostBtn)?1:0;if(b!==G.sb){G.ws.send("b "+b);G.sb=b}
  const f=(G.lbtn||G.keys[" "]||G.fireBtn||(G.ajoy&&G.ajoy.f)||now<G.tapUntil)?1:0;
  if(f!==G.sf){G.ws.send("f "+f);G.sf=f}
}

/* ---- host panel: mode and super powers (only the host's page shows it, and the server checks too) ---- */
function toggleHost(v){
  G.hostOpen=v===undefined?!G.hostOpen:v;$("#hp").classList.toggle("hide",!G.hostOpen);if(G.hostOpen)loadRoster();
  document.querySelectorAll("#hp > .seg button").forEach(b=>b.classList.toggle("sel",+b.dataset.m===G.mode));
  if(G.hostOpen)loadRules();
}
async function loadRules(){
  const r=await J("/api/gamerules");if(!r.ok)return;
  document.querySelectorAll("#hrules .seg").forEach(s=>{const v=r.d[s.dataset.k],n=typeof v==="boolean"?(v?1:0):v;s.querySelectorAll("button").forEach(b=>b.classList.toggle("sel",+b.dataset.v===n))});
}
document.querySelectorAll("#hrules .seg button").forEach(b=>b.onclick=async()=>{
  const r=await J("/api/gamerules",{method:"POST",body:new URLSearchParams({k:b.parentNode.dataset.k,v:b.dataset.v})});
  hpNote(r.ok?"Rule changed":(r.d.error||"Could not change that rule"));if(r.ok)loadRules();
});
async function showHall(){
  const r=await J("/api/hall"),box=$("#hall");if(!r.ok||!r.d.length){box.innerHTML="";return}
  box.textContent="";const t=document.createElement("h4");t.textContent="Hall of fame";box.appendChild(t);
  r.d.slice(0,5).forEach((h,i)=>{const d=document.createElement("div"),s=document.createElement("span"),m=document.createElement("small");s.textContent=(i+1)+". "+h[0];m.textContent=h[3]+" wins · best "+h[1];d.append(s,m);box.appendChild(d)});
}
$("#ghost").onclick=()=>toggleHost();
const PWR=[["speed","b1","Speed"],["rapid","b2","Rapid"],["power","b3","Power"],["shield","b4","Shield"],["invincible","b5","Invincible"]];
function pwrRow(box,id){box.innerHTML=PWR.map(p=>`<button class="pw" data-p="${p[0]}" aria-label="Give ${p[2]}"><img alt="" src="${avSrc(p[1])}"><span>${p[2]}</span></button>`).join("");
  box.querySelectorAll(".pw").forEach(b=>b.onclick=async()=>{b.classList.add("sent");try{navigator.vibrate&&navigator.vibrate(18)}catch(e){}await give(id,b.dataset.p);setTimeout(()=>b.classList.remove("sent"),650)})}
async function give(id,power){
  const r=await J("/api/power",{method:"POST",body:new URLSearchParams({id,power})});
  hpNote(r.ok?"Given to "+(id==="all"?r.d.n+(r.d.n===1?" player":" players"):((G.rost.get(id)||{}).name||"player")):(r.status===400?"Nobody to give it to yet":(r.d.error||"Could not give it")));
}
function hpNote(s){const n=$("#hpn");n.innerHTML="<span></span>";n.firstChild.textContent=s;n.classList.add("on");clearTimeout(G.hpnT);G.hpnT=setTimeout(()=>n.classList.remove("on"),1800)}
G.rost=new Map();G.rsig="";
async function loadRoster(){
  if(!G.hostOpen)return;const r=await J("/api/players");
  if(r.ok){G.rost.clear();for(const p of r.d)G.rost.set(p.id,p);
    const sig=r.d.map(p=>p.id+"|"+p.name+"|"+p.spec+"|"+p.dead+"|"+p.av+"|"+(p.id===G.me)).join(",");
    if(sig!==G.rsig){G.rsig=sig;const L=$("#hpl");L.innerHTML="";
      if(!r.d.length)L.innerHTML='<p class="hempty">Nobody has joined yet.</p>';
      for(const p of r.d){const d=document.createElement("div");d.className="hpr"+(p.spec?" isp":"");d.dataset.id=p.id;
        d.innerHTML='<div class="top"><img alt=""><div class="nm"><b></b><small></small></div><button class="hsp"></button></div><div class="pwr"></div>';
        d.querySelector("img").src=avSrc(p.av,p.id);d.querySelector("b").textContent=p.name+(p.id===G.me?" (you)":"");
        d.querySelector("small").textContent=p.spec?"Spectating":p.dead?"Out":p.score+" pumpkins · "+p.hp+" HP";
        const sp=d.querySelector(".hsp");sp.textContent=p.spec?"Let play":"Spectator";sp.onclick=async()=>{await setSpec(p.id,!p.spec);G.rsig="";loadRoster()};
        pwrRow(d.querySelector(".pwr"),p.id);L.appendChild(d)}}
    paintSpec()}
  clearTimeout(G.rosterT);G.rosterT=setTimeout(loadRoster,2500);
}
document.querySelectorAll("#hp > .seg button").forEach(b=>b.onclick=async()=>{
  const r=await J("/api/gamemode",{method:"POST",body:new URLSearchParams({mode:b.dataset.m})});
  hpNote(r.ok?(b.dataset.m==="1"?"Battle Royale: rounds start by themselves":"PvP: fight and respawn"):(r.d.error||"Could not change the mode"));
  if(r.ok)document.querySelectorAll("#hp > .seg button").forEach(x=>x.classList.toggle("sel",x===b));
});
async function setSpec(id,on){
  const r=await J("/api/spectate",{method:"POST",body:new URLSearchParams({id,on:on?"1":"0"})});
  hpNote(r.ok?(on?"Now a spectator":"Back in the game"):(r.d.error||"Could not change that"));return r.ok;
}
$("#hpob").onclick=async()=>{await setSpec(G.me,!G.spec());setTimeout(paintSpec,300)};
function paintSpec(){$("#hpob").setAttribute("aria-pressed",G.spec()?"true":"false")}
$("#hpx").onclick=()=>toggleHost(false);
pwrRow($("#hpe"),"all");

/* ---- drawing ---- */
let cw=0,ch=0,dpr=1;
function resizeCv(force){
  const d=Math.min(devicePixelRatio||1,2),w=Math.round(innerWidth*d),h=Math.round(innerHeight*d);
  if(force||cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;dpr=d}cw=cv.width;ch=cv.height;
}
// the ground: a dark tile with ash specks, a ring of old runes, and drifting embers
const tile=(()=>{const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.fillStyle="#17120C";x.fillRect(0,0,256,256);
  for(let i=0;i<70;i++){x.fillStyle=`rgba(${60+rnd()*40|0},${40+rnd()*25|0},${20+rnd()*15|0},${.08+rnd()*.14})`;x.beginPath();x.arc(rnd()*256,rnd()*256,1+rnd()*5,0,TAU);x.fill()}
  x.strokeStyle=`rgba(${accRGB()},.055)`;x.lineWidth=2;for(let i=0;i<=256;i+=128){x.beginPath();x.moveTo(i,0);x.lineTo(i,256);x.moveTo(0,i);x.lineTo(256,i);x.stroke()}return c})();
const runes=[];{let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<34;i++)runes.push({x:150+r()*2700,y:150+r()*2700,r:50+r()*90,n:3+(r()*4|0),a:r()*TAU})}
const embers=[];for(let i=0;i<60;i++)embers.push({x:rnd(),y:rnd(),s:.4+rnd()*1.2,p:rnd()*TAU});
function drawGround(k,x0,y0,x1,y1,t){
  const pat=ctx.createPattern(tile,"repeat");ctx.fillStyle=pat;ctx.fillRect(0,0,G.W,G.H);
  for(const u of runes){
    if(u.x+u.r<x0||u.x-u.r>x1||u.y+u.r<y0||u.y-u.r>y1)continue;
    ctx.save();ctx.translate(u.x,u.y);ctx.rotate(u.a+t*.05);ctx.strokeStyle=`rgba(247,122,40,${.10+.05*Math.sin(t+u.x)})`;ctx.lineWidth=2.4/Math.max(k,.5);
    ctx.beginPath();ctx.arc(0,0,u.r,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,u.r*.82,0,TAU);ctx.stroke();
    ctx.beginPath();for(let i=0;i<=u.n*2;i++){const a=i*Math.PI/u.n*Math.floor(u.n/2||1)%TAU,xx=Math.cos(a)*u.r*.82,yy=Math.sin(a)*u.r*.82;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)}ctx.stroke();ctx.restore();
  }
  // walls: a glowing edge with warning stripes outside the arena
  ctx.save();ctx.shadowColor=ACC();ctx.shadowBlur=24;ctx.strokeStyle=ACC();ctx.lineWidth=8;ctx.strokeRect(0,0,G.W,G.H);ctx.restore();
  ctx.fillStyle="rgba(5,3,1,.82)";ctx.fillRect(-4000,-4000,4000+G.W+4000,4000);ctx.fillRect(-4000,G.H,G.W+8000,4000);ctx.fillRect(-4000,0,4000,G.H);ctx.fillRect(G.W,0,4000,G.H);
}
function drawGun(p,len,ang,rec,hue,bits){
  const r=p.r,back=rec*r*.22;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);
  const g0=r*.55-back,g1=r*1.32-back,w=r*.3;
  ctx.fillStyle="#3b3328";ctx.beginPath();ctx.roundRect?ctx.roundRect(g0,-w/2,g1-g0,w,w*.28):ctx.rect(g0,-w/2,g1-g0,w);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.22)";ctx.fillRect(g0,-w/2,g1-g0,w*.22);
  ctx.fillStyle=bits&4?"#ff5a3c":bits&2?"#ffb020":ACC();ctx.fillRect(g1-r*.12,-w*.62,r*.14,w*1.24);
  ctx.fillStyle="#2a2219";ctx.fillRect(g0-r*.04,-w*.78,r*.2,w*1.56);
  if(rec>.6){ctx.fillStyle=`rgba(255,220,120,${rec})`;ctx.beginPath();ctx.moveTo(g1,-w*.9);ctx.lineTo(g1+r*.9*rec,0);ctx.lineTo(g1,w*.9);ctx.fill()}
  ctx.restore();
}
function drawPlayer(p,k,t,now){
  const hue=p.hue,me=p.id===G.me,r=p.r,aim=me?G.aim:p.aim,bits=p.bits||0;
  ctx.save();
  ctx.shadowColor="rgba(0,0,0,.55)";ctx.shadowBlur=12;ctx.shadowOffsetY=4;
  drawGun(p,0,aim,p.rec,hue,bits);
  if(p.boss)bossBug(ctx,p.boss,p.x,p.y,r,p.hd,p.w||0,t,p);else bug(ctx,p.sp|0,p.x,p.y,r,p.hd,p.w||0,t,null,p);
  ctx.shadowColor="transparent";
  {const own=me&&!(G.g&&G.g.tm);ctx.lineWidth=Math.max(1.5,r*.05);ctx.strokeStyle=own?ACC():me?"#fff":`hsla(${hue} 75% 55% / .55)`;ctx.setLineDash([r*.3,r*.2]);ctx.beginPath();ctx.arc(p.x,p.y,r*1.04,0,TAU);ctx.stroke();ctx.setLineDash([])}
  // shield rings from powers and spawn protection
  if(bits&48){ctx.strokeStyle=bits&16?`rgba(255,215,90,${.6+.3*Math.sin(t*9)})`:`rgba(120,220,255,${.5+.3*Math.sin(t*9)})`;ctx.lineWidth=3/k+2;ctx.beginPath();ctx.arc(p.x,p.y,r+7+Math.sin(t*6)*2,0,TAU);ctx.stroke()}
  if(bits&2){ctx.strokeStyle="rgba(255,176,32,.7)";ctx.lineWidth=2.4/k+1;ctx.setLineDash([6,8]);ctx.beginPath();ctx.arc(p.x,p.y,r+14,t*3,t*3+TAU);ctx.stroke();ctx.setLineDash([])}
  if(bits&4){ctx.fillStyle=`rgba(255,80,40,${.18+.1*Math.sin(t*8)})`;ctx.beginPath();ctx.arc(p.x,p.y,r+10,0,TAU);ctx.fill()}
  ctx.restore();
  // shield bar, picture and name above the sphere
  const frac=Math.max(0,Math.min(1,(p.shown??p.hp)/(me?G.my[1]:(p.hpMax||100)))),bw=Math.max(r*1.8,34),bh=Math.max(5,r*.14),by=p.y-r-bh-8;
  ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillRect(p.x-bw/2-1,by-1,bw+2,bh+2);
  ctx.fillStyle=frac>.6?"#5BD66B":frac>.3?"#F2B52C":"#E8503F";ctx.fillRect(p.x-bw/2,by,bw*frac,bh);
  const br=Math.max(11,r*.42),img=avImage(p.av,p.id),ay=by-br-4;
  ctx.save();ctx.beginPath();ctx.arc(p.x,ay,br,0,TAU);ctx.clip();
  if(img)ctx.drawImage(img,p.x-br,ay-br,br*2,br*2);else{ctx.fillStyle=hex(hue);ctx.fill()}ctx.restore();
  ctx.lineWidth=2/k+.5;ctx.strokeStyle=me?"#fff":"rgba(255,255,255,.55)";ctx.beginPath();ctx.arc(p.x,ay,br,0,TAU);ctx.stroke();
  const fs=Math.max(r*.38,12/k);ctx.font=`700 ${fs}px system-ui,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.lineWidth=fs*.14;ctx.strokeStyle="rgba(0,0,0,.6)";const nm=(p.boss?"☠ ":"")+p.name;ctx.strokeText(nm,p.x,p.y+r+fs*.8);ctx.fillStyle=p.boss?"#ff6a4a":"#fff";ctx.fillText(nm,p.x,p.y+r+fs*.8);
}
function drawBullets(k,dt,now){
  ctx.save();ctx.globalCompositeOperation="lighter";ctx.lineCap="round";
  for(const b of G.trails.values()){
    const age=Math.min(.05,(now-b.born)/1000);b.x+=b.vx*dt;b.y+=b.vy*dt;
    const col=b.pow?"255,90,50":accRGB();
    ctx.lineWidth=(b.pow?9:5.5);
    for(let i=b.pts.length-2;i>=2;i-=2){ctx.strokeStyle=`rgba(${col},${i/b.pts.length*.55})`;ctx.beginPath();ctx.moveTo(b.pts[i-2],b.pts[i-1]);ctx.lineTo(b.pts[i],b.pts[i+1]);ctx.stroke()}
    const rr=b.pow?11:7,g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,rr*2.4);g.addColorStop(0,"rgba(255,255,255,.95)");g.addColorStop(.35,`rgba(${col},.8)`);g.addColorStop(1,`rgba(${col},0)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,rr*2.4,0,TAU);ctx.fill();
  }
  ctx.restore();
}
function frame(now){
  G.raf=requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-G.last)/1000||.016),t=now/1000;G.last=now;
  resizeCv();sendInput(now);
  const a=1-Math.exp(-dt*16);
  for(const o of G.pl.values()){o.dx=o.tx-o.x;o.dy=o.ty-o.y;o.x+=o.dx*a;o.y+=o.dy*a;o.r+=(o.tr-o.r)*a;o.aim+=angDiff(o.aim,o.taim??o.aim)*a;o.rec=Math.max(0,o.rec-dt*5);{const sv=Math.hypot(o.dx,o.dy)*16;o.hd=o.hd??o.aim;o.hd+=angDiff(o.hd,sv>25?Math.atan2(o.dy,o.dx):o.aim)*(1-Math.exp(-dt*9));o.w=(o.w||0)+sv*dt/Math.max(10,o.r)*2.4;o.sv=sv;o.dt=dt;smoke(o,dt)}o.shown=(o.shown??o.hp)+((o.hp??0)-(o.shown??o.hp))*a}
  const me=G.pl.get(G.me);
  if(me&&G.my){me.hpMax=G.my[1]}
  const sp=G.spec();
  let tgt=me?{x:me.x,y:me.y}:G.camT||G.cam;
  if(sp){const f=G.sp.follow&&G.pl.get(G.sp.follow);if(f){G.sp.free=false;tgt={x:f.x,y:f.y}}else if(G.sp.free)tgt={x:G.sp.x,y:G.sp.y};else{tgt=G.camT||G.cam}G.sp.x=tgt.x;G.sp.y=tgt.y}
  const c=1-Math.exp(-dt*10);G.cam.x+=(tgt.x-G.cam.x)*c;G.cam.y+=(tgt.y-G.cam.y)*c;
  const r=me?me.r:G.r0,view=Math.min(1500,520+r*6),asp=cw/ch;
  const targetH=Math.min(700+4*r,1.9*view/Math.max(1,asp),1.9*view);G.cam.z+=((sp?G.sp.z:targetH)-G.cam.z)*(1-Math.exp(-dt*(sp?10:4)));
  const k=ch/G.cam.z;G.k=k;
  // aim: the mouse cursor on a laptop, the right thumb on a phone
  if(me&&!sp&&G.aid<0&&(!G.touch||G.mouse.moved)){const sx=((me.x-G.cam.x)*k+cw/2)/dpr,sy=((me.y-G.cam.y)*k+ch/2)/dpr;const dx=G.mouse.x-sx,dy=G.mouse.y-sy,d=Math.hypot(dx,dy),dead=Math.max(8,me.r*k/dpr*.45);G.aim=Math.atan2(dy,dx);
    // desktop: the sphere follows the cursor and the gun points at it; further away = faster
    G.mv=!G.touch||G.mouse.moved?(G.mouse.out||d<dead?null:[dx/d*Math.min(1,(d-dead)/120),dy/d*Math.min(1,(d-dead)/120)]):null}else G.mv=null
  let shx=0,shy=0;if(G.shake>.2){shx=(rnd()-.5)*G.shake;shy=(rnd()-.5)*G.shake;G.shake*=Math.pow(.02,dt)}
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#000000";ctx.fillRect(0,0,cw,ch);
  ctx.setTransform(k,0,0,k,cw/2-G.cam.x*k+shx*dpr,ch/2-G.cam.y*k+shy*dpr);
  const hw=cw/k/2,hh=ch/k/2,x0=G.cam.x-hw,x1=G.cam.x+hw,y0=G.cam.y-hh,y1=G.cam.y+hh;
  drawGround(k,x0,y0,x1,y1,t);
  // Battle Royale: the safe zone, with the danger outside it glowing red
  if(G.mode===1&&G.g.ph>=1){
    ctx.save();ctx.beginPath();ctx.rect(-200,-200,G.W+400,G.H+400);ctx.arc(G.W/2,G.H/2,G.g.zr,0,TAU,true);ctx.fillStyle=`rgba(190,20,20,${.28+.06*Math.sin(t*3)})`;ctx.fill("evenodd");ctx.restore();
    ctx.save();ctx.shadowColor="#ff4a3a";ctx.shadowBlur=26;ctx.strokeStyle="#ff6a4a";ctx.lineWidth=5/Math.max(k,.35);ctx.beginPath();ctx.arc(G.W/2,G.H/2,G.g.zr,0,TAU);ctx.stroke();ctx.restore();
  }
  // pumpkins instead of plain orbs
  for(const o of G.os){const v=Math.round(o[2]/90)%4,im=pump[v],s=22+Math.sin(t*3+o[0]*.07)*1.6;if(im.complete&&im.naturalWidth){ctx.drawImage(im,o[0]-s/2,o[1]-s/2,s,s)}else{ctx.fillStyle="#FF8A1F";ctx.beginPath();ctx.arc(o[0],o[1],8,0,TAU);ctx.fill()}}
  // embers drifting up
  ctx.fillStyle="rgba(255,150,60,.55)";for(const e of embers){const ex=x0+((e.x*cw/k+t*6*e.s)%(hw*2)),ey=y1-((e.y*ch/k+t*18*e.s)%(hh*2));ctx.beginPath();ctx.arc(ex,ey,1.4+e.s,0,TAU);ctx.fill()}
  const ps=[...G.pl.values()].sort((p,q)=>p.r-q.r);
  drawSmoke(dt);
  for(const p of ps)drawPlayer(p,k,t,now);
  drawBullets(k,dt,now);
  // particles, rings, damage numbers
  ctx.save();ctx.globalCompositeOperation="lighter";
  for(let i=G.fx.length-1;i>=0;i--){const f=G.fx[i];f.l-=dt;if(f.l<=0){G.fx.splice(i,1);continue}f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.94;f.vy*=.94;const al=f.l/f.m;ctx.fillStyle=`hsla(${f.h} 95% 62% / ${al})`;ctx.beginPath();ctx.arc(f.x,f.y,f.s*(.4+al*.6),0,TAU);ctx.fill()}
  for(let i=G.rings.length-1;i>=0;i--){const q=G.rings[i];q.l-=dt;if(q.l<=0){G.rings.splice(i,1);continue}const al=q.l/q.m;ctx.strokeStyle=`hsla(${q.h} 95% 65% / ${al})`;ctx.lineWidth=3/Math.max(k,.4);ctx.beginPath();ctx.arc(q.x,q.y,q.r+(q.R-q.r)*(1-al),0,TAU);ctx.stroke()}
  ctx.restore();
  ctx.textAlign="center";ctx.textBaseline="middle";
  for(let i=G.floats.length-1;i>=0;i--){const f=G.floats[i];f.l-=dt;if(f.l<=0){G.floats.splice(i,1);continue}f.y-=dt*46;const al=Math.min(1,f.l/f.m*1.6);ctx.globalAlpha=al;ctx.font=`800 ${Math.max(15,18/k)}px system-ui`;ctx.lineWidth=3;ctx.strokeStyle="rgba(0,0,0,.7)";ctx.strokeText(f.t,f.x,f.y);ctx.fillStyle=f.c;ctx.fillText(f.t,f.x,f.y);ctx.globalAlpha=1}
  // screen effects: vignette, red flash when hurt
  ctx.setTransform(1,0,0,1,0,0);
  const vg=ctx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.35,cw/2,ch/2,Math.max(cw,ch)*.75);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.55)");ctx.fillStyle=vg;ctx.fillRect(0,0,cw,ch);
  if(G.flash>.02){ctx.fillStyle=`rgba(220,30,20,${G.flash*.35})`;ctx.fillRect(0,0,cw,ch);G.flash*=Math.pow(.01,dt)}
  if(now-G.hudT>140){G.hudT=now;hud(me)}
}
function hud(me){
  const my=G.my,g=G.g,sp=G.spec();
  $("#game").classList.toggle("spectating",sp);if(sp&&G.dead){G.dead=false;$("#dead").classList.add("hide")}
  $("#gsc").textContent=my[2];$("#gn").textContent=(g.m===1?g.al+" alive":G.n+(G.n===1?" player":" players"))+" · "+my[3]+" kills";
  const pct=my[1]?Math.max(0,Math.min(100,my[0]/my[1]*100)):0,f=$("#hpf");f.style.width=pct+"%";f.style.background=pct>60?"linear-gradient(#7BE88A,#3FB655)":pct>30?"linear-gradient(#F7C948,#E09B14)":"linear-gradient(#FF7A6A,#D8402F)";
  $("#hpt").textContent=Math.max(0,my[0])+" / "+my[1]+(my[1]>100?"  +SHIELD":"");
  const chips=[["Speed",my[4]],["Rapid fire",my[5]],["Power shot",my[6]],["Invincible",my[7]]].filter(c=>c[1]>0).map(c=>"<span>"+c[0]+" "+Math.ceil(c[1]/1000)+"s</span>");
  $("#pw").innerHTML=chips.join("");
  const can=my[2]>=G.cost||my[5]>0;$("#gfire").classList.toggle("off",!can);
  const mt=g.m===1?(g.ph===1?"Battle Royale · starts in "+g.t+"s":g.ph===2?"Battle Royale · zone closing":g.ph===3?"Battle Royale · round over":"Battle Royale · waiting"):"PvP";
  $("#gmode").innerHTML=mt.replace(/^(\w+( \w+)?)/,"<i>$1</i>");
  if(g.m===1&&g.ph===1&&g.t!==G.lastCount){G.lastCount=g.t;if(g.t<=5&&g.t>0){banner(String(g.t),"get ready",1000);beep(660,.1,"square",.05)}}
  const lb=$("#glb");lb.innerHTML="";
  G.lb.forEach((e,i)=>{const d=document.createElement("div");if(e[0]===G.me)d.className="me";const im=document.createElement("img");im.alt="";im.src=avSrc(e[4],e[0]);
    const a=document.createElement("span");a.textContent=(i+1)+". "+e[1];const b=document.createElement("span");b.textContent=e[2]+(e[3]?" · "+e[3]+"★":"");d.append(im,a,b);lb.appendChild(d)});
  const s=mmc.width;mmx.clearRect(0,0,s,s);mmx.strokeStyle="rgba(255,227,59,.8)";mmx.lineWidth=2;mmx.strokeRect(1,1,s-2,s-2);
  if(g.m===1&&g.ph>=1){mmx.strokeStyle="rgba(255,100,70,.9)";mmx.beginPath();mmx.arc(s/2,s/2,g.zr/G.W*s,0,TAU);mmx.stroke()}
  for(const m of G.mm){const mine=m[0]===G.me;mmx.fillStyle=mine?ACC():"rgba(255,255,255,.75)";mmx.beginPath();mmx.arc(m[1]/G.W*s,m[2]/G.H*s,mine?6:Math.max(3,m[3]/G.W*s*1.4),0,TAU);mmx.fill()}
}
cv.addEventListener("pointermove",e=>{if(e.pointerType==="mouse")G.mouse.moved=true},true);
addEventListener("resize",()=>{if(G.on)resizeCv(true)});

$("#szi").onclick=()=>{G.sp.z=Math.max(500,G.sp.z/1.3)};$("#szo").onclick=()=>{G.sp.z=Math.min(4800,G.sp.z*1.3)};
$("#sfo").onclick=()=>{const ids=[...G.pl.keys()];if(!ids.length)return;const i=ids.indexOf(G.sp.follow);G.sp.follow=i+1<ids.length?ids[i+1]:null;if(!G.sp.follow)G.sp.free=false;$("#sfo").textContent=G.sp.follow?"Following "+(G.pl.get(G.sp.follow)||{}).name:"Follow a player"};

document.addEventListener("mouseleave",()=>{G.mouse.out=true});document.addEventListener("mouseenter",()=>{G.mouse.out=false});
cv.addEventListener("pointermove",e=>{if(e.pointerType==="mouse")G.mouse.out=false},true);

/* swipe the host sheet away: down on a phone held upright, right when it is the side sheet */
(()=>{const hp=$("#hp");let s=null;
 hp.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"||hp.scrollTop>2||e.target.closest("button,input"))return;s={x:e.clientX,y:e.clientY,side:getComputedStyle(hp).left!=="0px"&&innerWidth>innerHeight,on:false}});
 hp.addEventListener("pointermove",e=>{if(!s)return;const dx=e.clientX-s.x,dy=e.clientY-s.y,d=s.side?dx:dy;if(!s.on&&d>10&&Math.abs(s.side?dy:dx)<d)s.on=true;if(s.on){hp.style.transition="none";hp.style.transform=s.side?`translateX(${Math.max(0,dx)}px)`:`translateY(${Math.max(0,dy)}px)`}});
 const end=e=>{if(!s)return;const d=s.side?e.clientX-s.x:e.clientY-s.y;hp.style.transition="";hp.style.transform="";if(s.on&&d>90)toggleHost(false);s=null};
 hp.addEventListener("pointerup",end);hp.addEventListener("pointercancel",end)})();
})();
