"use strict";
const $=s=>document.querySelector(s);
const P={
 chat:"M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",
 volHi:"M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",
 volLo:"M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z",
 volOff:"M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z",
 folder:"M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z",
 file:"M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z",
 music:"M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
 play:"M8 5v14l11-7z",
 more:"M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
 dl:"M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
 move:"M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z",
 edit:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
 trash:"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
 open:"M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
 link:"M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
 x:"M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
 grid:"M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z",
 list:"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
 help:"M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z",
 up:"M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z",
 zip:"M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-2v2h2v2h-2v2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2v2h2v2z",
 pad:"M15 7.5V2H9v5.5l3 3 3-3zM7.5 9H2v6h5.5l3-3-3-3zM9 16.5V22h6v-5.5l-3-3-3 3zM16.5 9l-3 3 3 3H22V9h-5.5z",
 eye:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
 eyeoff:"M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z",
 out:"M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
 wifi:"M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z",
 search:"M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
 full:"M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
 l:"M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",
 r:"M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"};
const svg=(p,s=24)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="${p}"/></svg>`;
const COL={pdf:"#E5584A",zip:"#E8A93B",rar:"#E8A93B","7z":"#E8A93B",apk:"#3DBB8F",doc:"#4C82E8",docx:"#4C82E8",xls:"#3FA56F",xlsx:"#3FA56F",ppt:"#F07F3C",pptx:"#F07F3C"};
const set=(s,p,z)=>{$(s).innerHTML=svg(p,z)};
const logoA=z=>'<svg class="lga" width="'+z+'" height="'+z+'" viewBox="20 12 80 96" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" aria-hidden="true"><rect x="39" y="22" width="42" height="76" rx="10"/><path class="w" d="M92 47a18 18 0 0 1 0 26"/><path class="w w2" d="M28 47a18 18 0 0 0 0 26"/></svg>';
for(const [s,z] of [["#logo1",40],["#logo3",24],["#logo5",40]])$(s).innerHTML=logoA(z);
set("#logo4",P.pad,32);set("#remx",P.x,20);set("#logo2",P.x,32);set("#sico",P.search,20);set("#help",P.help);set("#lo",P.out);set("#chb",P.chat);set("#chx",P.x,20);set("#fab",P.pad,30);set("#vx",P.x);set("#vdl",P.dl);set("#gx",P.x);set("#gfs",P.full);set("#eye",P.eye);
$("#zipb").innerHTML=svg(P.zip,20)+"<span>ZIP</span>";$("#upb").innerHTML=svg(P.up,20)+"<span>Upload</span>";

const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const rid=()=>{const a=new Uint8Array(12);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(a);else a.forEach((_,i)=>a[i]=Math.random()*256);return Array.from(a,b=>b.toString(16).padStart(2,"0")).join("")};
const DEV=store.get("ls_dev")||(()=>{const d=rid();store.set("ls_dev",d);return d})();
const reduced=matchMedia("(prefers-reduced-motion:reduce)").matches;
/* an invite link looks like http://host:port/#inv=TOKEN: it lets this person in with just a name */
let INV="";try{if(location.hash.startsWith("#inv=")){INV=location.hash.slice(5).split("&")[0];sessionStorage.setItem("ls_inv",INV);history.replaceState(null,"","#/")}else INV=sessionStorage.getItem("ls_inv")||""}catch(e){}

function accent(h){ // the host's chosen colour: buttons, logo, highlights (never the files or the stream)
  if(!/^#[0-9a-f]{6}$/i.test(h||""))return;const r=document.documentElement.style,n=parseInt(h.slice(1),16),l=(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255;
  r.setProperty("--primary",h);r.setProperty("--primary-text",h);r.setProperty("--onprimary",l>.55?"#000000":"#FFFFFF");
  const f=document.querySelector('link[rel=icon]');if(f)f.href=f.href.replace(/fill=%22%23[0-9a-fA-F]{6}%22/,"fill=%22%23"+h.slice(1)+"%22");
  try{localStorage.setItem("ls_ac",h)}catch(e){}
}
try{accent(localStorage.getItem("ls_ac"))}catch(e){}
let ME={name:"",host:false,mgr:false},INFO={},view=store.get("ls_view")||"grid",entries=[],cur="",pinger=0,firstLoad=true;

async function J(u,opt){
  let r;try{r=await fetch(u,opt)}catch(e){return{ok:false,status:0,d:{error:"Could not reach the host"}}}
  let d={};try{d=await r.json()}catch(e){}
  if(r.status===403&&d.error==="blocked"){show("blocked");stopAll()}
  else if(r.status===401&&d.error==="auth"&&ME.name){ME.name="";showLogin("Your session ended. Please sign in again.")}
  return{ok:r.ok,status:r.status,d};
}
function show(id){try{window.WS&&WS.lock&&WS.lock(id!=="app")}catch(e){}for(const s of["login","blocked","app","gonly","wait"])$("#"+s).classList.toggle("hide",s!==id);$("#boot").classList.add("hide");$("#fab").classList.toggle("hide",!(id==="app"&&INFO.gameEnabled))}
let tt=0;function toast(t){const e=$("#toast");e.textContent=t;e.classList.remove("hide");clearTimeout(tt);tt=setTimeout(()=>e.classList.add("hide"),2800)}
function stopAll(){clearInterval(pinger);chStop();clearTimeout(wt);closeScr();closeViewer();closeMenu();gameClose();window.arcadeClose&&arcadeClose()}

/* ---------- sign in ---------- */
function showLogin(msg){
  show("login");stopAll();
  const inv=INV&&INFO.invOk;
  if(INV&&!INFO.invOk&&!msg)msg="This invite link has expired or was already used.";
  $("#pwrap").classList.toggle("hide",!INFO.needPassword||!!inv);
  $("#lsub").textContent=inv?"You are invited. Enter a name to join.":INFO.needPassword?"This folder is password protected.":"Enter a name to join.";
  $("#lname").value=store.get("ls_name")||"";$("#lerr").textContent=msg||"";
}
$("#eye").onclick=()=>{const p=$("#lpw"),h=p.type==="password";p.type=h?"text":"password";set("#eye",h?P.eyeoff:P.eye);$("#eye").setAttribute("aria-label",h?"Hide password":"Show password")};
$("#lf").onsubmit=async e=>{
  e.preventDefault();const b=$("#lgo");b.disabled=true;$("#lerr").textContent="";
  const r=await J("/api/login",{method:"POST",body:new URLSearchParams(Object.assign({name:$("#lname").value,password:$("#lpw").value,device:DEV},INV&&INFO.invOk?{invite:INV}:{}))});
  b.disabled=false;
  if(r.ok){INV="";try{sessionStorage.removeItem("ls_inv")}catch(e){}store.set("ls_name",$("#lname").value);$("#lpw").value="";await boot()}
  else $("#lerr").textContent=r.status===429&&r.d.retry?`Too many tries. Please wait ${r.d.retry} seconds.`:r.status===429?"The room is full right now.":(r.d.error||"Could not sign in");
};
async function boot(){
  if(location.hash.startsWith("#ht=")){
    const hp=location.hash.slice(1).split("&"),t=hp[0].slice(3);window.gameAuto=(hp[1]||"").slice(2);history.replaceState(null,"","#/");
    await J("/api/login",{method:"POST",body:new URLSearchParams({hostToken:t,name:"Host",device:"host"})});
  }
  const r=await J("/api/info");if(!r.ok){$("#boot").textContent="Could not reach the host. Check your Wi-Fi and reload.";return}
  INFO=r.d;accent(INFO.ac);
  if(!INFO.authed){if(INV){const v=await J("/api/invite?t="+encodeURIComponent(INV));INFO.invOk=!!(v.ok&&v.d.valid)}return showLogin()}
  ME={name:INFO.name,host:INFO.host,mgr:!!INFO.manager};
  if(INFO.pending)return waitIn();
  enter();
  if(window.gameAuto&&window.gameOpen)gameOpen();
}
/* ---------- live chat ---------- */
let chPrev=null,chLast=0,chTimer=0,chOpen=false,chUnread=0,chFirst=true,chGen=-1,chMod=false,chAC=null;
const REACT=["❤️","🔥","😂","👏","😮"],TEAM={1:"#FF6B63",2:"#6FA1FF"};
const chSnd=()=>store.get("ls_chs")!=="0";
function paintChs(){$("#chs").textContent=chSnd()?"🔔":"🔕";$("#chs").setAttribute("aria-pressed",String(chSnd()))}
function chBeep(){if(!chSnd())return;try{chAC=chAC||new(window.AudioContext||window.webkitAudioContext)();const o=chAC.createOscillator(),g=chAC.createGain();o.frequency.value=880;g.gain.setValueAtTime(.08,chAC.currentTime);g.gain.exponentialRampToValueAtTime(.001,chAC.currentTime+.18);o.connect(g);g.connect(chAC.destination);o.start();o.stop(chAC.currentTime+.2)}catch(e){}}
const chBadge=()=>["#chb","#scrc"].forEach(id=>{let b=$(id+" b");if(!chUnread){if(b)b.remove();return}if(!b){b=document.createElement("b");$(id).appendChild(b)}b.textContent=chUnread>9?"9+":chUnread});
function floatReact(e){const l=$("#rxl"),i=document.createElement("i");i.textContent=e;i.style.right=(10+Math.random()*90)+"px";l.appendChild(i);setTimeout(()=>i.remove(),2700)}
async function chAct(path,body){const r=await J(path,{method:"POST",body:new URLSearchParams(body)});if(r.ok){chLast=0;chGen=-1;$("#chl").innerHTML="";chFirst=true;chPoll()}else toast(r.d.error||"Could not do that")}
function chAdd(m){
  if(m.k===1){if(!chFirst&&m.name!==ME.name)floatReact(m.text);return}
  const l=$("#chl"),near=l.scrollHeight-l.scrollTop-l.clientHeight<80,d=document.createElement("div"),mine=m.name===ME.name;
  d.className="cm"+(mine?" me":"");
  if(chPrev&&chPrev.n===m.name&&m.t-chPrev.t<120000&&l.lastElementChild&&l.lastElementChild.classList.contains("cm"))d.classList.add("cont");chPrev={n:m.name,t:m.t};
  const s=document.createElement("small"),n=document.createElement("i");n.textContent=(m.host&&INFO.hostName?INFO.hostName:m.name)+(m.host?" · host":m.mgr?" · manager":"")+(m.mu?" · muted":"");
  if(m.host&&INFO.hostPic){const hi=document.createElement("img");hi.className="hav";hi.alt="";hi.src="/api/host/pic?v="+INFO.hostPic;s.appendChild(hi)}
  if(TEAM[m.team])n.style.color=TEAM[m.team];
  s.appendChild(n);s.appendChild(document.createTextNode("  "+new Date(m.t).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})));
  if(chMod){const md=document.createElement("span");md.className="mod";
    const del=document.createElement("button");del.textContent="Delete";del.onclick=()=>chAct("/api/chat/del",{id:m.id});md.appendChild(del);
    if(!m.host){const mu=document.createElement("button");mu.textContent=m.mu?"Unmute":"Mute";mu.onclick=()=>chAct("/api/chat/mute",{id:m.id,on:m.mu?"0":"1"});md.appendChild(mu)}
    s.appendChild(md)}
  d.appendChild(s);
  if(m.text){const t=document.createElement("div");t.textContent=m.text;d.appendChild(t)}
  if(m.img){const im=new Image();im.alt="Picture from "+m.name;im.loading="lazy";im.src="/api/chat/img?id="+m.id;im.onclick=()=>window.open(im.src,"_blank","noopener");im.onload=()=>{if(near||mine)l.scrollTop=l.scrollHeight};d.appendChild(im)}
  l.appendChild(d);
  if(near||mine)l.scrollTop=l.scrollHeight;
  while(l.children.length>200)l.removeChild(l.firstChild);
}
async function chPoll(){
  const r=await J("/api/chat?after="+chLast);if(!r.ok)return;
  if(r.d.last<chLast||(chGen>=0&&(r.d.gen|0)!==chGen)){$("#chl").innerHTML="";chLast=0;chFirst=true;chGen=r.d.gen|0;return chPoll()} // cleared, or a message was removed
  chGen=r.d.gen|0;chMod=r.d.canMod;
  let n=0;for(const m of r.d.msgs){chAdd(m);if(m.name!==ME.name&&m.k!==1)n++}
  chLast=r.d.last;
  if(chFirst)chFirst=false;else if(n){chBeep();if(!chOpen){chUnread+=n;chBadge()}}
  $("#chwho").textContent=r.d.online+" online";
  $("#chsl").hidden=!chMod;if(chMod&&document.activeElement!==$("#chsl"))$("#chsl").value=String(r.d.slow);
}
function chDock(){const d=chOpen&&innerWidth>=900&&!$("#scr").classList.contains("hide");$("#chat").classList.toggle("dock",d);$("#scr").classList.toggle("dock",d);try{zApply()}catch(e){}}
function chShow(on){chOpen=on;$("#chat").classList.toggle("hide",!on);chDock();if(on){chUnread=0;chBadge();const l=$("#chl");l.scrollTop=l.scrollHeight;setTimeout(()=>$("#chi").focus(),60)}}
function chStart(){chStop();chLast=0;chFirst=true;chUnread=0;chGen=-1;chBadge();$("#chl").innerHTML="";$("#chc").hidden=!ME.host;paintChs();chPoll();chTimer=setInterval(chPoll,1500)}
function chStop(){clearInterval(chTimer);chShow(false)}
addEventListener("resize",chDock);
(()=>{
const H={"Content-Type":"application/x-www-form-urlencoded"},sl=ms=>new Promise(r=>setTimeout(r,ms));let tm=0;
async function clipLoad(){try{const r=await fetch("/api/clip");if(!r.ok)return;const l=$("#sdl");l.textContent="";(await r.json()).forEach(c=>{const d=document.createElement("div");d.className="sdi";const t=document.createElement("span");t.textContent=c.name+": "+c.text;const k=document.createElement("button");k.className="ib";k.textContent="Copy";k.onclick=async()=>{try{await navigator.clipboard.writeText(c.text)}catch(e){const a=document.createElement("textarea");a.value=c.text;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}toast("Copied")};d.append(t,k);l.append(d)})}catch(e){}}
function show(on){$("#snd").classList.toggle("hide",!on);clearInterval(tm);if(on){clipLoad();tm=setInterval(clipLoad,4000)}}
$("#snb").onclick=()=>{if(INFO.gameOnly){toast("Sending is off in game-only mode");return}show($("#snd").classList.contains("hide"))};$("#sdx").onclick=()=>show(false);
$("#sdsh").onclick=async()=>{const t=$("#sdt").value.trim();if(!t)return;const r=await fetch("/api/clip",{method:"POST",headers:H,body:"text="+encodeURIComponent(t)});if(r.ok){$("#sdt").value="";clipLoad()}else toast("Could not share")};
$("#sdgo").onclick=async()=>{const fs=[...$("#sdf").files],st=$("#sds");if(!fs.length){st.textContent="Pick files first";return}
 st.textContent="Waiting for the host to accept\u2026";
 const r=await fetch("/api/offer",{method:"POST",headers:H,body:"names="+encodeURIComponent(fs.map(f=>f.name).join("\n"))+"&sizes="+fs.map(f=>f.size).join(",")}),j=await r.json().catch(()=>({}));
 if(!r.ok){st.textContent=j.error||"Could not send";return}
 for(;;){await sl(1200);const q=await fetch("/api/offer?id="+j.id).then(x=>x.json()).catch(()=>({state:"declined"}));if(q.state==="accepted")break;if(q.state==="declined"){st.textContent="The host did not accept";return}}
 let bad=0;for(let i=0;i<fs.length;i++)await new Promise(res=>{const x=new XMLHttpRequest();x.open("POST","/api/inbox?id="+j.id+"&i="+i);x.upload.onprogress=e=>{if(e.lengthComputable)st.textContent="Sending "+(i+1)+" of "+fs.length+": "+Math.round(e.loaded*100/e.total)+"%"};x.onload=()=>{if(x.status!==200)bad++;res()};x.onerror=()=>{bad++;res()};x.send(fs[i])});
 st.textContent=bad?bad+" file(s) failed":"Sent "+fs.length+(fs.length===1?" file":" files");$("#sdf").value=""};
})();
$("#chb").onclick=()=>chShow(!chOpen);$("#chx").onclick=()=>chShow(false);$("#scrc").onclick=()=>chShow(!chOpen);
$("#chs").onclick=()=>{store.set("ls_chs",chSnd()?"0":"1");paintChs();chBeep()};
$("#chsl").onchange=async()=>{const r=await J("/api/chat/slow",{method:"POST",body:new URLSearchParams({s:$("#chsl").value})});toast(r.ok?($("#chsl").value==="0"?"Slow mode off":"Slow mode: one message every "+$("#chsl").value+" s"):(r.d.error||"Could not change it"))};
async function react(e){const r=await J("/api/chat/react",{method:"POST",body:new URLSearchParams({e})});if(r.ok)floatReact(e);else if(r.status!==429)toast(r.d.error||"Could not send")}
for(const box of ["#chrx","#scrrx"])REACT.slice(0,box==="#scrrx"?3:5).forEach(e=>{const b=document.createElement("button");b.type="button";b.textContent=e;b.setAttribute("aria-label","React "+e);b.onclick=()=>react(e);$(box).appendChild(b)});
$("#chf").onsubmit=async e=>{
  e.preventDefault();const i=$("#chi"),v=i.value.trim();if(!v)return;
  const r=await J("/api/chat",{method:"POST",body:new URLSearchParams({text:v})});
  if(r.ok){i.value="";chPoll()}else toast(r.d.error||"Could not send");
};
/* pictures are shrunk here first (about 640 px, under 120 KB) */
$("#cha").onclick=()=>$("#chfile").click();
$("#chfile").onchange=async()=>{
  const f=$("#chfile").files[0];$("#chfile").value="";if(!f)return;
  try{
    const bm=await createImageBitmap(f),sc=Math.min(1,640/Math.max(bm.width,bm.height)),c=document.createElement("canvas");c.width=Math.round(bm.width*sc);c.height=Math.round(bm.height*sc);
    c.getContext("2d").drawImage(bm,0,0,c.width,c.height);
    let q=.7,blob;do{blob=await new Promise(r=>c.toBlob(r,"image/jpeg",q));q-=.15}while(blob&&blob.size>115000&&q>.2);
    if(!blob||blob.size>115000)return toast("That picture is too big");
    const r=await fetch("/api/chat/img",{method:"POST",headers:{"Content-Type":"image/jpeg"},body:blob});
    if(r.ok)chPoll();else toast((await r.json().catch(()=>({}))).error||"Could not send the picture");
  }catch(e){toast("Could not read that picture")}
};
$("#chc").onclick=async()=>{if(!confirm("Clear the chat for everyone?"))return;const r=await J("/api/chat/clear",{method:"POST"});if(r.ok){$("#chl").innerHTML="";chLast=0;chPoll()}};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&chOpen)chShow(false)});
/* ---------- waiting for the host to let this device in ---------- */
let wt=0;
function waitIn(){
  show("wait");clearInterval(pinger);clearTimeout(wt);
  const tick=async()=>{
    const r=await J("/api/info");if(!r.ok){wt=setTimeout(tick,3000);return}
    INFO=r.d;accent(INFO.ac);
    if(!INFO.authed){ME.name="";return showLogin("The host did not let you in.")}
    if(!INFO.pending){return boot()}
    wt=setTimeout(tick,2000);
  };
  wt=setTimeout(tick,1500);
}
$("#wcancel").onclick=async()=>{clearTimeout(wt);await J("/api/logout",{method:"POST"});ME.name="";const r=await J("/api/info");INFO=r.d||{};showLogin()};
/* ---------- watching the host's screen ---------- */
let zkb=0,znote="",Z={z:1,x:0,y:0},zst=0,zpt=0,zbase=0,zt0=0,zrtt=0,zfps=0,zage=0,zlive=true;
const scrv=$("#scrv"),imgEl=$("#scrimg"),scrvid=$("#scrvid");let scrimg=imgEl;
function zApply(){
  const cw=scrv.clientWidth,ch=scrv.clientHeight,w=scrimg.offsetWidth,h=scrimg.offsetHeight;
  const mx=Math.max(0,(Z.z*w-cw)/2),my=Math.max(0,(Z.z*h-ch)/2);
  Z.x=Math.max(-mx,Math.min(mx,Z.x));Z.y=Math.max(-my,Math.min(my,Z.y));
  scrimg.style.transform=`translate(${Z.x}px,${Z.y}px) scale(${Z.z})`;
  $("#scrz").textContent=(Math.round(Z.z*10)/10)+"×";
}
function zAt(nz,cx,cy){ // zoom to nz keeping the point under (cx,cy) still
  nz=Math.max(1,Math.min(8,nz));const r=scrv.getBoundingClientRect(),px=cx-r.left-r.width/2,py=cy-r.top-r.height/2;
  Z.x=px-nz*(px-Z.x)/Z.z;Z.y=py-nz*(py-Z.y)/Z.z;Z.z=nz;if(nz===1){Z.x=0;Z.y=0}zApply();
}
function zMid(nz){const r=scrv.getBoundingClientRect();zAt(nz,r.left+r.width/2,r.top+r.height/2)}
$("#scrp").onclick=()=>zMid(Z.z*1.5);$("#scrm").onclick=()=>zMid(Z.z/1.5);$("#scrz").onclick=()=>zMid(1);
scrv.addEventListener("wheel",e=>{e.preventDefault();zAt(Z.z*(e.deltaY<0?1.2:1/1.2),e.clientX,e.clientY)},{passive:false});
const ptr=new Map();let pd=0,lastTap=0;
scrv.addEventListener("pointerdown",e=>{scrv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptr.size===2){const [a,b]=[...ptr.values()];pd=Math.hypot(a.x-b.x,a.y-b.y)}
  const n=Date.now();if(ptr.size===1&&n-lastTap<300){if(Z.z>1)zMid(1);else zAt(2.5,e.clientX,e.clientY);lastTap=0}else lastTap=n});
scrv.addEventListener("pointermove",e=>{const p=ptr.get(e.pointerId);if(!p)return;
  if(ptr.size===2){ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});const [a,b]=[...ptr.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pd>0)zAt(Z.z*d/pd,(a.x+b.x)/2,(a.y+b.y)/2);pd=d;return}
  if(Z.z>1){Z.x+=e.clientX-p.x;Z.y+=e.clientY-p.y;scrv.classList.add("pan");zApply()}
  ptr.set(e.pointerId,{x:e.clientX,y:e.clientY})});
const pend=e=>{ptr.delete(e.pointerId);pd=0;if(!ptr.size)scrv.classList.remove("pan")};
scrv.addEventListener("pointerup",pend);scrv.addEventListener("pointercancel",pend);
window.addEventListener("resize",()=>{if(!$("#scr").classList.contains("hide"))zApply()});
let idleT=0;const awake=()=>{const s=$("#scr");s.classList.remove("idle");clearTimeout(idleT);idleT=setTimeout(()=>{if(!s.contains(document.activeElement)||document.activeElement===scrv)s.classList.add("idle")},3000)};
for(const ev of["pointermove","pointerdown","keydown","touchstart"])$("#scr").addEventListener(ev,awake,{passive:true});
/* picture quality and how long the host has been live */
const clock=ms=>{const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60,p=n=>String(n).padStart(2,"0");return(h?h+":":"")+p(m)+":"+p(r)};
function zPaint(){
  if($("#scr").classList.contains("hide"))return;
  const q=!zlive||zage>4000?"poor":(zrtt<200&&zage<2500)?"good":zrtt<500?"fair":"poor";
  $("#scrq").className=q;
  const w=scrimg.naturalWidth||scrimg.videoWidth,h=scrimg.naturalHeight||scrimg.videoHeight;
  $("#scrtxt").textContent=(!zlive||zage>4000?"Stalled":q==="good"?"Good":q==="fair"?"Fair":"Poor")+(w?" · "+w+"×"+h:"")+" · "+zfps+" fps"+(zkb?" · "+(zkb/1000).toFixed(1)+" Mbps":"")+" · live "+clock(zbase+Date.now()-zt0)+(znote?" · "+znote:"");
}
async function zPoll(){
  const t=performance.now(),r=await J("/api/screen/stat?q="+(store.get("ls_q")||"0"));zrtt=performance.now()-t;
  if(r.ok){$("#vol").hidden=!r.d.audio;if(!r.d.audio&&snd)stopSound();zkb=r.d.kbps|0;znote=r.d.note||"";const qs=$("#scrqs");qs.hidden=r.d.codec!=="h264";if(document.activeElement!==qs)qs.value=store.get("ls_q")||"0";$("#dvr").hidden=r.d.codec!=="h264";zlive=r.d.live;zbase=r.d.since;zt0=Date.now();zfps=r.d.fps;zage=r.d.age;if(!zlive){closeScr();toast("The host stopped sharing the screen");return}}
  else zlive=false;
  zPaint();
}
function openScr(){Z={z:1,x:0,y:0};zApply();zbase=0;zt0=Date.now();zage=0;zlive=true;$("#scrtxt").textContent="Connecting…";$("#scrq").className="";$("#scr").classList.remove("hide");chDock();clearInterval(zst);clearInterval(zpt);zPoll();zst=setInterval(zPoll,2000);zpt=setInterval(zPaint,1000);attach()}
/* the picture: the phone's hardware-encoded video through the browser's video engine, or the old JPEG stream when that is not on */
function useVid(on){imgEl.hidden=on;scrvid.hidden=!on;imgEl.style.transform=scrvid.style.transform="";scrimg=on?scrvid:imgEl;zApply()}
async function attach(tries=0){
  if($("#scr").classList.contains("hide"))return;
  const r=await J("/api/screen/stat");if($("#scr").classList.contains("hide"))return;
  const d=r.ok?r.d:{};
  if(d.codec==="starting"&&tries<20)return setTimeout(()=>attach(tries+1),500);
  if(d.codec==="h264"){
    if(window.MediaSource&&MediaSource.isTypeSupported(d.mime)){useVid(true);return startVideo(d.mime)}
    toast("This browser cannot play the phone's video. The host can turn on Compatibility mode.");closeScr();return;
  }
  useVid(false);imgEl.src="/api/screen?"+Date.now();
}
let vp=null;
function stopVideo(){const v=vp;vp=null;if(v){clearInterval(v.timer);try{v.ab.abort()}catch(e){}try{URL.revokeObjectURL(v.url)}catch(e){}}scrvid.removeAttribute("src");try{scrvid.load()}catch(e){}}
function startVideo(mime){
  stopVideo();
  const ab=new AbortController(),ms=new MediaSource(),url=URL.createObjectURL(ms),v={ab,ms,url,q:[],sb:null};vp=v;scrvid.src=url;
  const again=()=>{if(vp===v){stopVideo();setTimeout(attach,400)}}; // the phone changed its picture size, or the link dropped: start over
  const pump=()=>{
    if(vp!==v||!v.sb||v.sb.updating||!v.q.length)return;
    let n=0;for(const c of v.q)n+=c.length;const buf=new Uint8Array(n);let o=0;for(const c of v.q){buf.set(c,o);o+=c.length}v.q=[];
    try{v.sb.appendBuffer(buf)}catch(e){if(e.name==="QuotaExceededError"){try{const b=v.sb.buffered;if(b.length)v.sb.remove(b.start(0),Math.max(b.start(0),scrvid.currentTime-2))}catch(x){}v.q.unshift(buf)}else again()}
  };
  ms.addEventListener("sourceopen",async()=>{
    try{v.sb=ms.addSourceBuffer(mime);v.sb.mode="segments"}catch(e){toast("This browser cannot play the phone's video");closeScr();return}
    v.sb.addEventListener("updateend",pump);
    try{
      const r=await fetch("/api/screen-video",{signal:ab.signal});if(!r.ok||!r.body)throw 0;const rd=r.body.getReader();
      for(;;){const{value,done}=await rd.read();if(done||vp!==v)break;v.q.push(value);pump();if(v.q.length>300){again();return}}
    }catch(e){}
    again();
  },{once:true});
  v.dvr=false;
  v.timer=setInterval(()=>{
    if(vp!==v||!v.sb)return;const b=scrvid.buffered;if(!b.length)return;
    const st=b.start(0),end=b.end(b.length-1),lag=end-scrvid.currentTime;
    if(!scrvid.paused&&!scrvid.seeking){ // never sit in a hole between pieces of video: hop to the next piece
      let inr=false,nx=-1;for(let i=0;i<b.length;i++){if(scrvid.currentTime>=b.start(i)-.02&&scrvid.currentTime<=b.end(i)+.02){inr=true;break}if(b.start(i)>scrvid.currentTime){nx=b.start(i);break}}
      if(!inr&&nx>=0)scrvid.currentTime=nx+.01}
    if(!v.dvr){
      if(scrvid.paused)scrvid.play().catch(()=>{});
      if(scrvid.currentTime<st-.05||lag>1.2)scrvid.currentTime=Math.max(st,end-.15); // stay at the live edge
      else scrvid.playbackRate=lag>.6?1.08:1;
    }else if(lag<.8&&!scrvid.paused){v.dvr=false} // caught up with the live picture again
    if(!v.sb.updating&&end-st>34){try{v.sb.remove(st,end-30)}catch(e){}} // the last 30 s stay for rewinding; memory stays flat for hours
    if(snd&&!snd.muted)snd.gain.gain.value=v.dvr?0:sndVol(); // no live sound over an old picture
    const dl=$("#dvrl"),sl=$("#dvrs");dl.classList.toggle("live",!v.dvr);$("#dvrp").innerHTML=scrvid.paused?"&#9654;":"&#10074;&#10074;";
    if(!v.drag){sl.min=st;sl.max=Math.max(end,st+.1);sl.value=scrvid.currentTime}
  },400);
}
$("#dvrp").onclick=()=>{if(!vp)return;if(scrvid.paused){scrvid.play().catch(()=>{})}else{vp.dvr=true;scrvid.pause()}};
$("#dvrs").addEventListener("input",()=>{if(!vp)return;vp.drag=true;vp.dvr=true;scrvid.currentTime=parseFloat($("#dvrs").value)});
$("#dvrs").addEventListener("change",()=>{if(vp)vp.drag=false});
$("#dvrl").onclick=()=>{if(!vp)return;const b=scrvid.buffered;vp.dvr=false;if(b.length)scrvid.currentTime=b.end(b.length-1)-.15;scrvid.play().catch(()=>{})};
scrvid.addEventListener("resize",zApply);scrvid.addEventListener("loadedmetadata",zApply);
/* the phone's sound: raw 16-bit PCM over HTTP, with a YouTube-style volume control. The audio context is made inside the tap itself, or phone browsers keep it muted. */
let snd=null;
const sndVol=()=>{const v=parseFloat(store.get("ls_vol"));return isNaN(v)?1:Math.max(0,Math.min(1,v))};
function volPaint(){
  const v=sndVol(),off=!snd||snd.muted||v===0,b=$("#volb");
  b.innerHTML=svg(off?P.volOff:v<.5?P.volLo:P.volHi,24);
  b.setAttribute("aria-label",off?"Sound off. Tap to turn on":"Sound on. Tap to mute");
  $("#scrvol").value=off&&snd&&snd.muted?0:v;
  $("#vlv").style.width=snd&&!snd.muted?Math.min(20,Math.round((snd.lvl||0)*30))+"px":"0";
  const s=$("#scrsns");s.textContent=!snd||snd.muted?"":!snd.got?" · sound connecting…":performance.now()-snd.loud>3000?" · no sound from the phone":"";
}
function startSound(){
  if(snd)return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC){toast("This browser cannot play the sound");return}
  const ab=new AbortController(),ctx=new AC(),gain=ctx.createGain();
  gain.gain.value=sndVol();gain.connect(ctx.destination);
  try{ctx.resume()}catch(e){}
  snd={ab,ctx,gain,muted:false,got:false,loud:performance.now(),lvl:0,played:0,tm:setInterval(volPaint,250)};volPaint();
  (async()=>{
    try{
      const r=await fetch("/api/screen-audio",{signal:ab.signal});if(!r.ok||!r.body)throw new Error("The host is not sending sound");
      const rate=+r.headers.get("X-Rate")||24000,ch=+r.headers.get("X-Channels")||2;
      const rd=r.body.getReader();let left=new Uint8Array(0),next=0;
      for(;;){
        const{value,done}=await rd.read();if(done||!snd||snd.ab!==ab)break;
        const buf=new Uint8Array(left.length+value.length);buf.set(left);buf.set(value,left.length);
        const fr=2*ch,n=Math.floor(buf.length/fr)*fr;left=buf.slice(n);if(!n)continue;
        const dv=new DataView(buf.buffer,0,n),frames=n/fr,bf=ctx.createBuffer(ch,frames,rate);let pk=0;
        for(let c=0;c<ch;c++){const d=bf.getChannelData(c);for(let i=0;i<frames;i++){const s=dv.getInt16((i*ch+c)*2,true)/32768;d[i]=s;if(s>pk)pk=s;else if(-s>pk)pk=-s}}
        snd.got=true;snd.lvl=pk;if(pk>.01)snd.loud=performance.now();
        if(ctx.state==="suspended")ctx.resume();
        const now=ctx.currentTime;if(next<now+0.03)next=now+0.12+(vp?0.2:0); // the video engine adds a little delay of its own
        if(next-now>0.9)continue; // fell behind: drop this piece so the sound stays in step with the picture
        const s=ctx.createBufferSource();s.buffer=bf;s.connect(gain);s.start(next);next+=bf.duration;snd.played+=frames;
      }
    }catch(e){if(snd&&snd.ab===ab&&e.name!=="AbortError")toast(e.message&&e.message.length<80?e.message:"Could not play the sound")}
    if(snd&&snd.ab===ab)stopSound();
  })();
}
function stopSound(){const s=snd;snd=null;if(s){clearInterval(s.tm);try{s.ab.abort()}catch(e){}try{s.ctx.close()}catch(e){}}volPaint()}
function volToggle(){if(!snd){startSound()}else{snd.muted=!snd.muted;snd.gain.gain.value=snd.muted?0:sndVol()}volPaint()}
function volSet(v){v=Math.max(0,Math.min(1,v));store.set("ls_vol",String(v));if(!snd)startSound();else{snd.muted=v===0;snd.gain.gain.value=v}volPaint()}
$("#volb").onclick=()=>{if(matchMedia("(hover:none)").matches&&!$("#vol").classList.contains("open")&&snd){$("#vol").classList.add("open");return}volToggle()};
$("#scrvol").oninput=()=>volSet(parseFloat($("#scrvol").value));
$("#scrqs").onchange=async()=>{store.set("ls_q",$("#scrqs").value);const r=await J("/api/screen/quality",{method:"POST",body:new URLSearchParams({q:$("#scrqs").value})});toast(r.ok?"Quality: "+$("#scrqs").selectedOptions[0].text+(r.d.q>+$("#scrqs").value?" (someone else asked for more)":""):(r.d.error||"Could not change it"))};
document.addEventListener("keydown",e=>{
  const el=document.activeElement||{};if($("#scr").classList.contains("hide")||/TEXTAREA|SELECT/.test(el.tagName)||(el.tagName==="INPUT"&&el.type!=="range")||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==="m"||e.key==="M"){e.preventDefault();volToggle()}
  else if(e.key==="ArrowUp"){e.preventDefault();volSet(sndVol()+.1)}
  else if(e.key==="ArrowDown"){e.preventDefault();volSet(sndVol()-.1)}
});
function closeScr(){stopSound();stopVideo();$("#vol").classList.remove("open");clearInterval(zst);clearInterval(zpt);imgEl.removeAttribute("src");$("#scr").classList.add("hide");chDock();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}
$("#watch").onclick=openScr;$("#scrx").onclick=closeScr;
$("#scrfs").onclick=()=>{const e=$("#scr");if(document.fullscreenElement)document.exitFullscreen();else if(e.requestFullscreen)e.requestFullscreen().catch(()=>toast("Full screen is not available here"))};
$("#scrimg").onerror=()=>{if(!$("#scr").classList.contains("hide")){closeScr();toast("The host stopped sharing the screen")}};
let remTV=false;
function remBtn(on){remTV=on;$("#rmt").classList.toggle("hide",!on);if(!on)$("#rem").classList.add("hide")}
async function rk(k,t){const b=new URLSearchParams({k});if(t)b.set("t",t);const r=await J("/api/remote",{method:"POST",body:b});$("#remn").textContent=r.ok?"":(r.d.error||"Could not send");if(r.ok&&navigator.vibrate)navigator.vibrate(12);return r.ok}
$("#rmt").onclick=()=>{$("#rem").classList.remove("hide")};$("#remx").onclick=()=>$("#rem").classList.add("hide");$("#rem").addEventListener("click",e=>{if(e.target.id==="rem")$("#rem").classList.add("hide")});
$("#rem").addEventListener("click",e=>{const k=e.target.closest("[data-k]");if(k)rk(k.dataset.k)});
$("#remf").addEventListener("submit",async e=>{e.preventDefault();const v=$("#remt").value;if(v&&await rk("text",v))$("#remt").value=""});
function liveBtn(on){$("#watch").classList.toggle("hide",!on);if(!on&&!$("#scr").classList.contains("hide"))closeScr()}
function enter(){
  clearInterval(pinger);pinger=setInterval(ping,4000);liveBtn(!!INFO.live);remBtn(!!INFO.tv);hostChip();
  if(window.AV&&AV.sync)AV.sync();
  if(INFO.gameOnly){show("gonly");return}
  show("app");chStart();set("#vtog",view==="grid"?P.list:P.grid);
  go(hashPath(),true);
}
function hostChip(){ // who is sharing: the host's picture and name, once a guest is in
  const el=$("#hostchip");if(!el)return;const ok=!!(INFO&&INFO.hostPic);el.hidden=!ok;if(!ok)return;
  const im=el.querySelector("img");const u="/api/host/pic?v="+INFO.hostPic;if(im.getAttribute("src")!==u)im.src=u;
  im.alt="Hosted by "+INFO.hostName;el.title="Hosted by "+INFO.hostName;el.querySelector("b").textContent=INFO.hostName||"";
}
let fvSeen=null;
async function ping(){
  const r=await J("/api/ping");
  if(r.status===429)return showLogin("The room is full right now. Try again soon.");
  if(r.ok&&r.d.go!==!!INFO.gameOnly){location.reload();return}
  if(r.ok&&r.d.fv!==undefined){if(fvSeen!==null&&r.d.fv!==fvSeen&&!SEL&&typeof cur==="string")go(cur);fvSeen=r.d.fv} // files changed by someone else: refresh the list
  if(r.ok){liveBtn(!!r.d.live);remBtn(!!r.d.tv);ME.mgr=!!r.d.mgr&&!ME.host;accent(r.d.ac);if(r.d.hp!==INFO.hostPic||r.d.hn!==INFO.hostName){INFO.hostPic=r.d.hp;INFO.hostName=r.d.hn;hostChip()}}
  if(r.ok&&(r.d.up!==INFO.canUpload||r.d.del!==INFO.canDelete||r.d.ren!==INFO.canRename||r.d.edt!==INFO.canEdit||r.d.mov!==INFO.canMove)){INFO.canUpload=r.d.up;INFO.canDelete=r.d.del;INFO.canRename=r.d.ren;INFO.canEdit=r.d.edt;INFO.canMove=r.d.mov;toolbar()}
}
$("#lo").onclick=async()=>{INV="";try{sessionStorage.removeItem("ls_inv")}catch(e){}await J("/api/logout",{method:"POST"});ME.name="";const r=await J("/api/info");INFO=r.d||{};showLogin()};

/* ---------- browsing ---------- */
const fmt=n=>n<1024?n+" B":n<1048576?(n/1024).toFixed(0)+" KB":n<1073741824?(n/1048576).toFixed(1)+" MB":(n/1073741824).toFixed(2)+" GB";
const dt=ms=>ms?new Date(ms).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}):"";
const enc=p=>encodeURIComponent(p);
const fileUrl=(p,dl)=>"/api/file?path="+enc(p)+(dl?"&dl=1":"");
const pdfUrl=p=>"/static/pdfview.html?path="+enc(p);
const join=(a,b)=>a?a+"/"+b:b;
const hashOf=p=>"#/"+p.split("/").filter(Boolean).map(enc).join("/");
const hashPath=()=>{try{return decodeURIComponent(location.hash.replace(/^#\/?/,""))}catch(e){return""}};
const cache=new Map();
let skelT=0,loadId=0;
let OPEN=new URLSearchParams(location.search).get("open");
async function go(p,initial){ if(SEL)selMode(false);
  const my=++loadId;
  const hit=cache.get(p);
  if(hit&&!initial){apply(p,hit)}
  else{clearTimeout(skelT);skelT=setTimeout(()=>{if(my===loadId)skeleton()},150)}
  const r=await J("/api/list?path="+enc(p));
  clearTimeout(skelT);if(my!==loadId)return;
  if(!r.ok){if(r.status===404)toast("That folder is not there any more");if(p)return go("");return}
  const sig=JSON.stringify(r.d.entries);
  if(hit&&hit.sig===sig&&hit.path===r.d.path&&cur===r.d.path)return;
  const rec={path:r.d.path,entries:r.d.entries,sig};cache.set(p,rec);cache.set(r.d.path,rec);
  apply(p,rec,true);
}
function apply(p,rec,fresh){
  const same=rec.path===cur&&!firstLoad;
  cur=rec.path;entries=rec.entries;
  if(hashPath()!==cur)history.replaceState(null,"",hashOf(cur));
  if(!cur&&firstLoad&&entries.length===1&&entries[0].d&&!location.hash.replace(/^#\/?$/,"")){firstLoad=false;location.hash=hashOf(entries[0].n);return}
  firstLoad=false;
  const keep=same?$("#main").scrollTop:0;
  render(!same);$("#main").scrollTop=keep;
  if(OPEN){const nm=OPEN.split("/").pop();OPEN=null;history.replaceState(null,"",location.pathname+location.hash);const oe=entries.find(x=>x.n===nm&&!x.d&&viewable(x));if(oe)setTimeout(()=>openViewer(oe),60)}
}
function skeleton(){const m=$("#main");m.className="";m.innerHTML='<div class="grid">'+'<div class="skel"></div>'.repeat(12)+"</div>"}
addEventListener("hashchange",()=>{if(ME.name){closeMenu();go(hashPath())}});
$("#brand").onclick=()=>{$("#q").value="";if(cur){location.hash="#/"}else go("")};
function crumbs(){
  const c=$("#crumbs");c.innerHTML="";const parts=cur?cur.split("/"):[];let acc="";
  const add=(t,p,last)=>{const b=document.createElement("button");b.textContent=t;if(last)b.setAttribute("aria-current","page");b.onclick=()=>{location.hash=hashOf(p)};c.appendChild(b)};
  add("Folders","",!parts.length);
  parts.forEach((s,i)=>{acc=join(acc,s);const i2=document.createElement("i");i2.textContent="›";c.appendChild(i2);add(s,acc,i===parts.length-1)});
  c.scrollLeft=c.scrollWidth;
}
function toolbar(){
  const root=!cur;
  $("#zipb").classList.toggle("hide",root);$("#selb").classList.toggle("hide",root);if(root&&SEL)selMode(false);$("#upb").classList.toggle("hide",root||!INFO.canUpload);
  $("#sort").classList.toggle("hide",root);$("#vtog").classList.toggle("hide",root);
}
const byName=(a,b)=>a.n.localeCompare(b.n,undefined,{numeric:true,sensitivity:"base"});
const sorters={name:byName,date:(a,b)=>b.m-a.m,size:(a,b)=>b.s-a.s,type:(a,b)=>a.k.localeCompare(b.k)||byName(a,b)};
const extOf=n=>(n.includes(".")?n.split(".").pop():"").toLowerCase();
let rest=[],sentinelIO=null,shown=[];
const revealIO=reduced?null:new IntersectionObserver(es=>{let i=0;es.forEach(en=>{if(en.isIntersecting){en.target.style.setProperty("--d",Math.min(i++,8)*50+"ms");en.target.classList.add("in");revealIO.unobserve(en.target)}})},{root:$("#main"),rootMargin:"0px 0px -4% 0px",threshold:.04});
const reveal=el=>{if(revealIO){el.classList.add("rv");revealIO.observe(el)}};
(()=>{const m=$("#main"),t=$("#totop");t.hidden=false;t.innerHTML=svg(P.up||"M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z",22);let tk=0;
 m.addEventListener("scroll",()=>{if(tk)return;tk=requestAnimationFrame(()=>{tk=0;const y=m.scrollTop;$("#app").classList.toggle("scrolled",y>6);t.classList.toggle("on",y>500)})},{passive:true});
 t.onclick=()=>m.scrollTo({top:0,behavior:reduced?"auto":"smooth"})})();
function render(fade){
  crumbs();toolbar();
  const q=$("#q").value.trim().toLowerCase(),m=$("#main");
  if(sentinelIO)sentinelIO.disconnect();
  m.className=(view==="list"&&cur?"list":"")+(fade&&!reduced?" fade":"");m.innerHTML="";
  if(!cur){
    $("#count").textContent=entries.length+(entries.length===1?" folder":" folders");
    const list=entries.filter(e=>!q||e.n.toLowerCase().includes(q)).sort(byName);
    m.insertAdjacentHTML("beforeend",'<h2 class="h2">Choose a folder</h2><p class="sub">Pick the folder you want to open.</p>');
    if(!list.length){m.insertAdjacentHTML("beforeend",'<div class="empty">'+svg(q?P.search:P.folder,44)+"<p>"+(q?"No folder matches your search":"The host has not shared any folder yet")+"</p></div>");return}
    const t=document.createElement("div");t.className="tiles";
    list.forEach(e=>{
      const a=document.createElement("a");a.className="tile";a.href=hashOf(e.n);
      a.innerHTML='<div class="fi">'+svg(P.folder,30)+"</div><div><b></b><br><span>Tap to open</span></div>";
      a.querySelector("b").textContent=e.n;reveal(a);t.appendChild(a);
    });
    m.appendChild(t);return;
  }
  const sk=$("#sort").value;
  shown=entries.filter(e=>!q||e.n.toLowerCase().includes(q)).sort((a,b)=>(b.d-a.d)||sorters[sk](a,b));
  $("#count").textContent=shown.length+" item"+(shown.length===1?"":"s");
  if(!shown.length){m.innerHTML='<div class="empty">'+svg(q?P.search:P.folder,44)+"<p>"+(q?"Nothing matches your search":"This folder is empty")+"</p></div>";return}
  const g=document.createElement("div");g.className="grid";m.appendChild(g);
  rest=shown.slice();chunk(g,60);
  if(rest.length){
    const s=document.createElement("div");s.style.height="1px";m.appendChild(s);
    sentinelIO=new IntersectionObserver(es=>{if(es[0].isIntersecting){chunk(g,60);if(!rest.length){sentinelIO.disconnect();s.remove()}}},{root:m,rootMargin:"600px"});
    sentinelIO.observe(s);
  }
}
function chunk(g,n){
  const f=document.createDocumentFragment();
  rest.splice(0,n).forEach(e=>f.appendChild(card(e)));
  g.appendChild(f);
}
function card(e){
  const p=join(cur,e.n),k=e.k,ext=extOf(e.n),c=document.createElement("div");c.className="card";c._e=e;reveal(c);
  const a=document.createElement("a");a.className="main";
  const th=document.createElement("div");th.className="thumb";
  if(e.d){th.style.setProperty("--c","var(--primary)");th.innerHTML=svg(P.folder,48)}
  else if(k==="audio"){th.style.setProperty("--c","var(--accent)");th.innerHTML=svg(P.music,44)}
  else{th.style.setProperty("--c",COL[ext]||"var(--muted)");th.innerHTML='<span class="ext"></span>';th.firstChild.textContent=(ext||"FILE").slice(0,4).toUpperCase()}
  if(!e.d&&(k==="image"||k==="video"||k==="pdf"||k==="audio"||k==="docx")){
    const i=new Image();i.alt="";i.loading="lazy";i.decoding="async";let tries=0;
    const src="/api/thumb?path="+enc(p)+"&w=320";
    i.style.opacity=0;i.onload=()=>{i.style.opacity=1};
    i.onerror=()=>{if(tries++<1)setTimeout(()=>{i.src=src+"&r=1"},900);else i.remove()};
    i.src=src;th.appendChild(i);
    if(k==="audio")th.insertAdjacentHTML("beforeend",'<div class="play">'+svg(P.music,16)+"</div>");
    if(k==="video")th.insertAdjacentHTML("beforeend",'<div class="play">'+svg(P.play,18)+"</div>");
  }
  const meta=document.createElement("div");meta.className="meta";
  const n=document.createElement("div");n.className="name";n.textContent=e.n;n.title=e.n;
  const inf=document.createElement("div");inf.className="info";inf.textContent=e.d?"Folder":fmt(e.s)+" · "+dt(e.m);
  meta.append(n,inf);a.append(th,meta);
  setLink(a,e,p);
  const mb=document.createElement("button");mb.className="more";mb.innerHTML=svg(P.more);mb.setAttribute("aria-label","More options for "+e.n);mb.setAttribute("aria-haspopup","menu");
  mb.onclick=ev=>{ev.stopPropagation();openMenu(e,p,mb)};
  c.append(a,mb);
  a.addEventListener("click",ev=>{if(!SEL)return;ev.preventDefault();ev.stopImmediatePropagation();pick(e,c)},true);
  if(SEL&&SEL.has(e.n))c.classList.add("picked");
  return c;
}
/* multi-select: tap items, then download them as one ZIP or delete them together */
let SEL=null;
function selUi(){
  const on=!!SEL;$("#selbar").classList.toggle("hide",!on);$("#selb").textContent=on?"Done":"Select";
  if(!on)return;$("#selc").textContent=SEL.size+" selected";$("#selz").disabled=$("#seld").disabled=!SEL.size;$("#seld").classList.toggle("hide",!INFO.canDelete);
}
function pick(e,c){if(SEL.has(e.n))SEL.delete(e.n);else SEL.add(e.n);c.classList.toggle("picked",SEL.has(e.n));selUi()}
function selMode(on){SEL=on?new Set():null;document.querySelectorAll(".card").forEach(c=>c.classList.remove("picked"));selUi()}
$("#selb").onclick=()=>selMode(!SEL);$("#selx").onclick=()=>selMode(false);
$("#sela").onclick=()=>{if(!SEL)return;const all=shown.length===SEL.size;SEL.clear();if(!all)shown.forEach(e=>SEL.add(e.n));document.querySelectorAll(".card").forEach(c=>c.classList.toggle("picked",SEL.has(c._e.n)));selUi()};
$("#selz").onclick=()=>{const a=document.createElement("a");a.href="/api/zip?path="+enc(cur)+"&names="+enc([...SEL].join("/"));a.download="selection.zip";a.click()};
$("#seld").onclick=()=>dialog('<h3>Delete '+SEL.size+' item'+(SEL.size===1?"":"s")+'?</h3><p>They will be removed from the host\'s phone. This cannot be undone.</p><div class="acts"><button class="btn" id="dc">Cancel</button><button class="btn dng" id="dd">Delete</button></div>',(d,close)=>{
  d.querySelector("#dc").onclick=close;
  d.querySelector("#dd").onclick=async()=>{
    d.querySelector("#dd").disabled=true;let ok=0,bad="";
    for(const n of [...SEL]){const e=entries.find(x=>x.n===n);if(!e)continue;
      const r=await J("/api/delete",{method:"POST",body:new URLSearchParams(e.d?{path:join(cur,n),recursive:"1"}:{path:join(cur,n)})});
      if(r.ok)ok++;else{bad=r.status===403?"The host turned off deleting":(r.d.error||"Could not delete");if(r.status===403){INFO.canDelete=false;break}}}
    close();cache.delete(cur);toast(ok+" deleted"+(bad?". "+bad:""));selMode(false);go(cur,true);
  };
});
const WSK=["video","audio","text","image","pdf","docx"];
function setLink(a,e,p){
  if(e.d){a.href=hashOf(p);return}
  if(WSK.includes(e.k)){
    a.href=e.k==="pdf"?pdfUrl(p):fileUrl(p);
    a.onclick=ev=>{ev.preventDefault();openViewer(e)};
  }else{a.href=fileUrl(p,1);a.setAttribute("download",e.n)}
}
let qt=0;$("#q").oninput=()=>{clearTimeout(qt);qt=setTimeout(()=>render(false),120)};
$("#sort").onchange=()=>render(false);
$("#vtog").onclick=()=>{view=view==="grid"?"list":"grid";store.set("ls_view",view);set("#vtog",view==="grid"?P.list:P.grid);render(false)};

/* ---------- 3-dot menu ---------- */
let menuFor=null;
function closeMenu(){if(!$("#scrim"))return;$("#scrim").remove();$("#menu").remove();if(menuFor){try{menuFor.focus()}catch(e){}menuFor=null}}
function item(icon,label,fn,cls,href,attrs){
  const el=document.createElement(href?"a":"button");if(href){el.href=href;for(const k in attrs||{})el.setAttribute(k,attrs[k])}else el.type="button";
  el.setAttribute("role","menuitem");if(cls)el.className=cls;el.innerHTML=svg(icon,22)+"<span></span>";el.lastChild.textContent=label;
  el.addEventListener("click",()=>{closeMenu();if(fn)fn()});return el;
}
function openMenu(e,p,btn){
  closeMenu();menuFor=btn;
  const sc=document.createElement("div");sc.id="scrim";sc.onclick=closeMenu;
  const m=document.createElement("div");m.id="menu";m.setAttribute("role","menu");m.setAttribute("aria-label","Options for "+e.n);
  const t=document.createElement("div");t.className="mt";t.textContent=e.n;m.appendChild(t);
  if(e.d){
    m.append(item(P.open,"Open",null,"",hashOf(p)),item(P.open,"Open in new browser tab",null,"",hashOf(p),{target:"_blank",rel:"noopener"}),item(P.zip,"Download as ZIP",null,"","/api/zip?path="+enc(p),{download:e.n+".zip"}));
  }else{
    if(WSK.includes(e.k)){
      m.appendChild(item(P.open,"Open",()=>openViewer(e)));
      m.appendChild(item(P.open,"Open in new browser tab",null,"","/?open="+encodeURIComponent(p)+hashOf(p.split("/").slice(0,-1).join("/")),{target:"_blank",rel:"noopener"}));
    }
    m.appendChild(item(P.dl,"Download",null,"",fileUrl(p,1),{download:e.n}));
  }
  m.appendChild(item(P.link,"Copy link",()=>copy(location.origin+(e.d?"/"+hashOf(p):fileUrl(p)),"Link copied")));
  const inside=p.split("/").filter(Boolean).length>=2; // the shared folders themselves can only be changed in the app
  if(inside&&INFO.canRename)m.appendChild(item(P.edit,"Rename",()=>renameDialog(e,p)));
  if(inside&&INFO.canMove)m.appendChild(item(P.move,"Move to…",()=>moveDialog(e,p)));
  if(!e.d&&INFO.canEdit&&e.k==="text"&&e.s<=524288)m.appendChild(item(P.file,"Edit",()=>openViewer(e)));
  if(inside&&INFO.canDelete)m.appendChild(item(P.trash,"Delete",()=>confirmDelete(e,p),"dng"));
  document.body.append(sc,m);
  if(innerWidth>640){
    const r=btn.getBoundingClientRect(),w=m.offsetWidth,h=m.offsetHeight;
    m.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+"px";
    m.style.top=(r.bottom+h+8>innerHeight?Math.max(8,r.top-h-4):r.bottom+4)+"px";
  }
  const f=m.querySelector("a,button");if(f)f.focus();
  m.addEventListener("keydown",ev=>{
    const its=[...m.querySelectorAll("a,button")],i=its.indexOf(document.activeElement);
    if(ev.key==="ArrowDown"){ev.preventDefault();its[(i+1)%its.length].focus()}
    else if(ev.key==="ArrowUp"){ev.preventDefault();its[(i-1+its.length)%its.length].focus()}
  });
}
function copy(text,msg){
  const done=()=>toast(msg);
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done,()=>toast("Could not copy"));return}
  const t=document.createElement("textarea");t.value=text;t.style.cssText="position:fixed;opacity:0";document.body.appendChild(t);t.select();
  try{document.execCommand("copy");done()}catch(e){toast("Could not copy")}t.remove();
}
function dialog(html,build){
  const d=document.createElement("div");d.className="dlg";d.innerHTML="<div role=\"dialog\" aria-modal=\"true\">"+html+"</div>";
  const close=()=>{d.remove();document.removeEventListener("keydown",esc,true)};
  const esc=ev=>{if(ev.key==="Escape"){ev.stopPropagation();close()}};
  document.addEventListener("keydown",esc,true);
  d.addEventListener("click",ev=>{if(ev.target===d)close()});
  document.body.appendChild(d);build&&build(d,close);
  const f=d.querySelector("[autofocus]")||d.querySelector("button");if(f)f.focus();return d;
}
function renameDialog(e,p){
  dialog('<h3>Rename '+(e.d?'folder':'file')+'</h3><input id="rn" maxlength="150" aria-label="New name" autofocus><div class="err" id="re" role="alert"></div><div class="acts"><button class="btn" id="rc">Cancel</button><button class="btn pri" id="rg">Rename</button></div>',(d,close)=>{
    const i=d.querySelector("#rn");i.value=e.n;const dot=e.d?-1:e.n.lastIndexOf(".");i.focus();i.setSelectionRange(0,dot>0?dot:e.n.length);
    d.querySelector("#rc").onclick=close;
    const go1=async()=>{
      const v=i.value.trim();if(!v||v===e.n)return close();
      const b=d.querySelector("#rg");b.disabled=true;
      const r=await J("/api/rename",{method:"POST",body:new URLSearchParams({path:p,name:v})});
      if(r.ok){close();toast("Renamed to "+r.d.name);cache.clear();go(cur,true)}
      else{b.disabled=false;d.querySelector("#re").textContent=r.status===403?"The host does not allow renaming":(r.d.error||"Could not rename")}
    };
    d.querySelector("#rg").onclick=go1;i.onkeydown=ev=>{if(ev.key==="Enter"){ev.preventDefault();go1()}};
  });
}
async function editDialog(e,p){
  let txt;try{const r=await fetch(fileUrl(p));if(!r.ok)throw 0;txt=await r.text()}catch(x){return toast("Could not open this file")}
  dialog('<h3 id="et"></h3><textarea id="ed" spellcheck="false" aria-label="File content"></textarea><div class="err" id="ee" role="alert"></div><div class="acts"><button class="btn" id="ec">Cancel</button><button class="btn pri" id="es">Save</button></div>',(d,close)=>{
    d.querySelector("#et").textContent="Edit "+e.n;const ta=d.querySelector("#ed");ta.value=txt;ta.focus();
    d.querySelector("#ec").onclick=close;
    d.querySelector("#es").onclick=async()=>{
      const b=d.querySelector("#es");
      if(new Blob([ta.value]).size>524288){d.querySelector("#ee").textContent="Too long. Text files up to 512 KB can be edited.";return}
      b.disabled=true;
      const r=await J("/api/save?path="+enc(p),{method:"POST",headers:{"Content-Type":"text/plain; charset=utf-8"},body:ta.value});
      if(r.ok){close();toast("Saved "+e.n);cache.clear();go(cur,true)}
      else{b.disabled=false;d.querySelector("#ee").textContent=r.status===403?"The host does not allow editing":(r.d.error||"Could not save")}
    };
  });
}
function moveDialog(e,p){
  const parts=p.split("/").filter(Boolean),mount=parts[0],parent=parts.slice(0,-1).join("/");
  dialog('<h3>Move to…</h3><p id="mvn"></p><div id="mvc" class="mvc"></div><div id="mvl" class="mvl" role="listbox"></div><div class="err" id="mve" role="alert"></div><div class="acts"><button class="btn" id="mvx">Cancel</button><button class="btn pri" id="mvg">Move here</button></div>',(d,close)=>{
    d.querySelector("#mvn").textContent=e.n;d.querySelector("#mvx").onclick=close;
    let at=parent;const go2=d.querySelector("#mvg"),list=d.querySelector("#mvl"),crumbs=d.querySelector("#mvc"),err=d.querySelector("#mve");
    const bad=dir=>dir===parent||(e.d&&(dir===p||dir.startsWith(p+"/")));
    async function show(dir){
      at=dir;err.textContent="";go2.disabled=bad(dir);
      const segs=dir.split("/").filter(Boolean);crumbs.innerHTML="";
      segs.forEach((sg,i)=>{const b=document.createElement("button");b.type="button";b.textContent=i?sg:sg+" (top)";b.onclick=()=>show(segs.slice(0,i+1).join("/"));crumbs.appendChild(b);if(i<segs.length-1)crumbs.append(" › ")});
      list.innerHTML="<p>Loading…</p>";
      const r=await J("/api/list?path="+enc(dir));if(at!==dir)return;
      if(!r.ok){list.innerHTML="";err.textContent=r.d.error||"Could not open that folder";return}
      list.innerHTML="";const dirs=r.d.entries.filter(x=>x.d&&!(e.d&&join(dir,x.n)===p)).sort((a,b)=>a.n.localeCompare(b.n));
      if(!dirs.length)list.innerHTML="<p>No folders here. Use Move here to put it in this folder.</p>";
      for(const x of dirs){const b=document.createElement("button");b.type="button";b.innerHTML=svg(P.folder,20)+"<span></span>";b.lastChild.textContent=x.n;b.onclick=()=>show(join(dir,x.n));list.appendChild(b)}
    }
    go2.onclick=async()=>{
      go2.disabled=true;const r=await J("/api/move",{method:"POST",body:new URLSearchParams({path:p,to:at})});
      if(r.ok){close();toast("Moved "+e.n);cache.clear();go(cur,true)}
      else{go2.disabled=false;err.textContent=r.status===403?"The host does not allow moving":(r.d.error||"Could not move")}
    };
    show(parent);
  });
}
function confirmDelete(e,p){
  dialog('<h3>Delete this '+(e.d?'folder':'file')+'?</h3><p id="dn"></p><p>'+(e.d?'The folder and everything inside it will be removed from the host\'s phone. This cannot be undone.':'It will be removed from the host\'s phone. This cannot be undone.')+'</p><div class="acts"><button class="btn" id="dc">Cancel</button><button class="btn dng" id="dd" autofocus>Delete</button></div>',(d,close)=>{
    d.querySelector("#dn").textContent=e.n;d.querySelector("#dc").onclick=close;
    d.querySelector("#dd").onclick=async()=>{
      const b=d.querySelector("#dd");b.disabled=true;
      const r=await J("/api/delete",{method:"POST",body:new URLSearchParams(e.d?{path:p,recursive:"1"}:{path:p})});
      close();
      if(r.ok){
        const el=[...document.querySelectorAll(".card")].find(c=>c._e===e);
        entries=entries.filter(x=>x!==e);cache.delete(cur);
        const fin=()=>{el&&el.remove();render(false)};
        if(el&&!reduced){el.classList.add("gone");setTimeout(fin,200)}else fin();
        toast("Deleted "+e.n);
      }else if(r.status===403){INFO.canDelete=false;toast("The host turned off deleting")}
      else toast(r.d.error||"Could not delete");
    };
  });
}

/* ---------- upload / zip ---------- */
$("#zipb").onclick=()=>{const a=document.createElement("a");a.href="/api/zip?path="+enc(cur);a.download=(cur.split("/").pop()||"files")+".zip";a.click()};
$("#upb").onclick=()=>$("#pick").click();
$("#pick").onchange=e=>{uploadFiles([...e.target.files]);e.target.value=""};
function uploadFiles(fs){
  if(!INFO.canUpload||!cur)return toast(cur?"The host turned off uploads":"Open a folder first");
  const dir=cur;let q=Promise.resolve();
  fs.forEach(f=>{q=q.then(()=>uploadOne(f,dir))});
  q.then(()=>{cache.delete(dir);if(cur===dir)go(dir)});
}
function uploadOne(f,dir){
  return new Promise(ok=>{
    const row=document.createElement("div");row.className="up";row.innerHTML="<b></b><span></span><div class=\"bar\"><i></i></div>";
    row.querySelector("b").textContent=f.name;const st=row.querySelector("span"),bar=row.querySelector("i");st.textContent="Starting…";$("#ups").appendChild(row);
    const x=new XMLHttpRequest();x.open("POST","/api/upload?path="+enc(dir)+"&name="+enc(f.name));
    x.upload.onprogress=e=>{if(e.lengthComputable){bar.style.width=(e.loaded/e.total*100)+"%";st.textContent=fmt(e.loaded)+" of "+fmt(e.total)}};
    const end=(t,bad)=>{st.textContent=t;if(bad)st.style.color="var(--danger)";else bar.style.width="100%";setTimeout(()=>row.remove(),bad?5000:1800);ok()};
    x.onload=()=>{if(x.status===200)end("Uploaded");else{let m="Upload failed";try{m=JSON.parse(x.responseText).error||m}catch(e){}end(m,true)}};
    x.onerror=()=>end("Connection lost",true);x.send(f);
  });
}
let dragN=0;
addEventListener("dragenter",e=>{if(!INFO.canUpload||!cur||!e.dataTransfer||![...e.dataTransfer.types].includes("Files"))return;dragN++;if(!$("#drop")){const d=document.createElement("div");d.id="drop";d.textContent="Drop files to upload here";$("#main").appendChild(d)}});
addEventListener("dragleave",()=>{if(--dragN<=0){dragN=0;const d=$("#drop");d&&d.remove()}});
addEventListener("dragover",e=>{if(INFO.canUpload&&cur)e.preventDefault()});
addEventListener("drop",e=>{dragN=0;const d=$("#drop");d&&d.remove();if(!INFO.canUpload||!cur)return;e.preventDefault();uploadFiles([...e.dataTransfer.files])});

/* ---------- media viewer (video, audio, text; images for the host app) ---------- */
let vlist=[],vi=0;
const viewable=e=>!e.d&&["video","audio","text"].concat(ME.host?["image"]:[]).includes(e.k);
function openViewer(e){
  if(window.WS&&WS.open(e))return;
  vlist=shown.filter(viewable);vi=Math.max(0,vlist.findIndex(x=>x.n===e.n));
  $("#viewer").classList.remove("hide");showItem();
}
function closeViewer(){$("#viewer").classList.add("hide");$("#vb").innerHTML="";$("#vqp").classList.add("hide")}
$("#vx").onclick=closeViewer;
function step(d){if(vlist.length<2)return;vi=(vi+d+vlist.length)%vlist.length;showItem()}
async function showItem(){
  const e=vlist[vi],p=join(cur,e.n),b=$("#vb"),my=++showItem.n;b.innerHTML="";
  $("#vt").textContent=e.n;$("#vdl").href=fileUrl(p,1);$("#vdl").setAttribute("download",e.n);
  if(e.k==="image"){const i=new Image();i.alt=e.n;i.src=fileUrl(p);b.appendChild(i)}
  else if(e.k==="video"){const v=document.createElement("video");v.controls=true;v.autoplay=true;v.playsInline=true;v.src=fileUrl(p);b.appendChild(v);wireMedia(v,e,p,my);addSubs(v,e)}
  else if(e.k==="audio"){const w=document.createElement("div");w.style.cssText="display:grid;gap:18px;justify-items:center;width:min(420px,100%)";w.innerHTML='<div style="color:var(--accent)">'+svg(P.music,96)+"</div>";const a=document.createElement("audio");a.controls=true;a.autoplay=true;a.style.width="100%";a.src=fileUrl(p);w.appendChild(a);b.appendChild(w);wireMedia(a,e,p,my)}
  else{
    const pre=document.createElement("pre");pre.textContent="Loading…";b.appendChild(pre);
    try{const r=await fetch(fileUrl(p),{headers:{Range:"bytes=0-524287"}});const t=await r.text();if(my!==showItem.n)return;pre.textContent=t+(e.s>524288?"\n\n… first 512 KB shown. Download the file to see all of it.":"")}catch(x){pre.textContent="Could not load this file."}
  }
  if(vlist.length>1){
    const l=document.createElement("button"),r=document.createElement("button");
    l.className="nav l";r.className="nav r";l.innerHTML=svg(P.l);r.innerHTML=svg(P.r);l.setAttribute("aria-label","Previous");r.setAttribute("aria-label","Next");
    l.onclick=()=>step(-1);r.onclick=()=>step(1);b.append(l,r);
  }
  queueUi();
}
showItem.n=0;
/* ---------- video and music extras: continue where you left off, queue, autoplay next, subtitles ---------- */
const isMed=x=>x&&(x.k==="video"||x.k==="audio");
const mmss=t=>{t=Math.floor(t);return Math.floor(t/60)+":"+String(t%60).padStart(2,"0")};
function wireMedia(m,e,p,my){
  const key="ls_pos:"+p+":"+(e.s||0);let last=0;
  const saved=parseFloat(store.get(key)||"0")||0;
  m.addEventListener("loadedmetadata",()=>{if(saved>5&&m.duration&&saved<m.duration-10){m.currentTime=saved;toast("Continuing from "+mmss(saved))}});
  const save=()=>{if(my!==showItem.n||!m.duration)return;const t=m.currentTime;store.set(key,t>5&&t<m.duration-10?String(Math.floor(t)):"")};
  m.addEventListener("timeupdate",()=>{const n=Date.now();if(n-last>5000){last=n;save()}});
  m.addEventListener("pause",save);
  m.addEventListener("ended",()=>{store.set(key,"");if(store.get("ls_ap")!=="0"){for(let j=vi+1;j<vlist.length;j++)if(isMed(vlist[j])){vi=j;showItem();return}}});
}
async function addSubs(m,e){
  const base=e.n.replace(/\.[^.]+$/,"").toLowerCase();let first=true;
  for(const x of entries){
    const n=x.n.toLowerCase();
    if(x.d||!/\.(srt|vtt)$/.test(n)||!n.startsWith(base+".")||(x.s||0)>2e6)continue;
    try{
      const r=await fetch(fileUrl(join(cur,x.n)));if(!r.ok)continue;
      let t=(await r.text()).replace(/^\uFEFF/,"").replace(/\r/g,"");
      if(!/^WEBVTT/.test(t))t="WEBVTT\n\n"+t.replace(/(\d\d:\d\d:\d\d),(\d{3})/g,"$1.$2");
      if(!m.isConnected)return;
      const tr=document.createElement("track");tr.kind="subtitles";
      tr.label=n.slice(base.length+1).replace(/\.(srt|vtt)$/,"")||"Subtitles";tr.srclang=tr.label.slice(0,2);
      tr.src=URL.createObjectURL(new Blob([t],{type:"text/vtt"}));if(first)tr.default=true;first=false;
      m.appendChild(tr);if(tr.default&&tr.track)tr.track.mode="showing";
    }catch(err){}
  }
}
function queueUi(){
  const n=vlist.filter(isMed).length,q=$("#vq");q.hidden=n<2;
  const pn=$("#vqp");if(n<2){pn.classList.add("hide");return}
  pn.innerHTML="";
  const ap=document.createElement("label");ap.className="ap";ap.innerHTML="<span>Play next automatically</span>";
  const cb=document.createElement("input");cb.type="checkbox";cb.checked=store.get("ls_ap")!=="0";cb.onchange=()=>store.set("ls_ap",cb.checked?"1":"0");ap.appendChild(cb);pn.appendChild(ap);
  vlist.forEach((x,i)=>{if(!isMed(x))return;const bt=document.createElement("button");bt.textContent=(i===vi?"▶ ":"")+x.n;bt.className=i===vi?"on":"";bt.setAttribute("role","listitem");bt.onclick=()=>{vi=i;pn.classList.add("hide");showItem()};pn.appendChild(bt)});
}
set("#vq",P.list);$("#vq").onclick=()=>$("#vqp").classList.toggle("hide");
let sx=0;$("#vb").addEventListener("touchstart",e=>{sx=e.touches[0].clientX},{passive:true});
$("#vb").addEventListener("touchend",e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>70&&vlist[vi]&&vlist[vi].k==="image")step(d>0?-1:1)},{passive:true});

/* ---------- help for this device ---------- */
function device(){
  const u=navigator.userAgent,pl=navigator.platform||"";let os="device";
  if(/Android/.test(u))os="Android";else if(/iPhone|iPod/.test(u))os="iPhone";else if(/iPad/.test(u)||(pl==="MacIntel"&&navigator.maxTouchPoints>1))os="iPad";
  else if(/Windows/.test(u))os="Windows";else if(/CrOS/.test(u))os="Chromebook";else if(/Mac/.test(u))os="Mac";else if(/Linux/.test(u))os="Linux";
  let br="browser";
  if(/Edg\//.test(u))br="Edge";else if(/OPR\//.test(u))br="Opera";else if(/SamsungBrowser/.test(u))br="Samsung Internet";else if(/Firefox|FxiOS/.test(u))br="Firefox";else if(/CriOS|Chrome/.test(u))br="Chrome";else if(/Safari/.test(u))br="Safari";
  return{os,br,pc:["Windows","Mac","Linux","Chromebook"].includes(os)};
}
const TIPS={
 Android:["Tap a photo or PDF to open it right here. Tap the ⋮ on any item to download or delete it.","Downloads are saved in your Downloads folder. Open them from the notification or the Files app.","To keep this page one tap away, open the browser menu and choose “Add to Home screen”."],
 iPhone:["Tap a photo or PDF to open it right here. Tap the ⋮ on any item to download it.","After downloading, tap the arrow in Safari's address bar to find the file, or open the Files app.","To keep this page handy, tap Share, then “Add to Home Screen”."],
 iPad:["Tap a photo or PDF to open it right here. Tap the ⋮ on any item to download it.","Downloads appear in the Files app, in the Downloads folder.","To keep this page handy, tap Share, then “Add to Home Screen”."],
 Windows:["Click a photo or PDF to open it right here. Click the ⋮ on a card for more.","Downloads go to your Downloads folder, or wherever your browser is set to save.","Tip: press Ctrl+D to bookmark this page."],
 Mac:["Click a photo or PDF to open it right here. Click the ⋮ on a card for more.","Downloads go to your Downloads folder.","Tip: press ⌘D to bookmark this page."],
 Linux:["Click a photo or PDF to open it right here. Click the ⋮ on a card for more.","Downloads go to your Downloads folder.","Tip: press Ctrl+D to bookmark this page."],
 Chromebook:["Click a photo or PDF to open it right here. Click the ⋮ on a card for more.","Downloads are saved in the Files app, in Downloads.","Tip: press Ctrl+D to bookmark this page."],
 device:["Tap or click a photo or PDF to open it right here. Use the ⋮ on any item to download it.","Use the ZIP button to download a whole folder at once."]};
const KEYS=[["/","Search"],["←  →  ↑  ↓","Move between items"],["Enter","Open the selected item"],["M","Open its ⋮ menu"],["Delete","Delete the selected file (if allowed)"],["Backspace","Go up one folder"],["G","Switch grid / list"],["U","Upload files"],["Z","Download this folder as ZIP"],["P","Play Orb Arena"],["?","Show this help"],["Esc","Close whatever is open"]];
function buildHelp(inWs){
  const d=device();
  let h='<h3>Help for your '+(d.os==="device"?"device":d.os)+'</h3><p>You are using '+d.br+(d.os==="device"?"":" on "+d.os)+".</p><ul class=\"tips\">"+(TIPS[d.os]||TIPS.device).map(t=>"<li>"+t+"</li>").join("")+"</ul>";
  if(d.pc){h+='<h3>Keyboard shortcuts</h3><table class="keys">'+KEYS.map(k=>"<tr><td><kbd>"+k[0].split("  ").join("</kbd> <kbd>")+"</kbd></td><td>"+k[1]+"</td></tr>").join("")+"</table>"}
  else h+="<p>Using a computer? Press <kbd>?</kbd> there to see keyboard shortcuts.</p>";
  if(!inWs)h+='<div class="acts"><button class="btn pri" id="hc" autofocus>Got it</button></div>';
  return h;
}
window.helpHtml=()=>buildHelp(true);
function showHelp(){
  dialog(buildHelp(),(dl,close)=>{dl.querySelector("#hc").onclick=close});
}
$("#help").onclick=showHelp;

/* ---------- keyboard shortcuts ---------- */
const typing=()=>/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||"");
function cards(){return[...document.querySelectorAll("#main .card>a.main,#main .tile")]}
function focusMove(dx,dy){
  const cs=cards();if(!cs.length)return;
  let i=cs.indexOf(document.activeElement);if(i<0){cs[0].focus();return}
  let cols=1;if(cs.length>1){const t=cs[0].getBoundingClientRect().top;cols=cs.filter(c=>Math.abs(c.getBoundingClientRect().top-t)<4).length||1}
  const n=Math.max(0,Math.min(cs.length-1,i+dx+dy*cols));cs[n].focus();cs[n].scrollIntoView({block:"nearest"});
}
addEventListener("keydown",e=>{
  if(G.on||(window.ARC&&ARC.on)||!ME.name||e.ctrlKey||e.metaKey||e.altKey)return;
  const open=!$("#viewer").classList.contains("hide");
  if(window.WS&&WS.visible())return;
  if(open){if(e.key==="Escape")closeViewer();else if(e.key==="ArrowLeft")step(-1);else if(e.key==="ArrowRight")step(1);return}
  if(document.querySelector(".dlg")||$("#menu")||$("#app").classList.contains("hide"))return;
  if(typing()){if(e.key==="Escape"){e.target.blur();if(e.target.id==="q"){e.target.value="";render(false)}}return}
  const k=e.key,fc=document.activeElement&&document.activeElement.closest&&document.activeElement.closest(".card");
  if(k==="/"){e.preventDefault();$("#q").focus()}
  else if(k==="?"){e.preventDefault();showHelp()}
  else if(k==="g"||k==="G"){if(cur)$("#vtog").click()}
  else if(k==="u"||k==="U"){if(cur&&INFO.canUpload)$("#upb").click()}
  else if(k==="z"||k==="Z"){if(cur)$("#zipb").click()}
  else if(k==="p"||k==="P"){if(INFO.gameEnabled)gameOpen()}
  else if(k==="Backspace"||k==="Escape"){if(cur){e.preventDefault();location.hash=hashOf(cur.split("/").slice(0,-1).join("/"))}}
  else if(k==="ArrowRight"){e.preventDefault();focusMove(1,0)}else if(k==="ArrowLeft"){e.preventDefault();focusMove(-1,0)}
  else if(k==="ArrowDown"){e.preventDefault();focusMove(0,1)}else if(k==="ArrowUp"){e.preventDefault();focusMove(0,-1)}
  else if((k==="m"||k==="M"||(k==="F10"&&e.shiftKey))&&fc){e.preventDefault();fc.querySelector(".more").click()}
  else if(k==="Delete"&&fc&&fc._e&&!fc._e.d&&INFO.canDelete){e.preventDefault();confirmDelete(fc._e,join(cur,fc._e.n))}
});

