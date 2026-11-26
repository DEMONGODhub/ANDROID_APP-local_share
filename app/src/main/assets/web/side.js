/* Left side panel: brand, nav, workspaces. Pure wiring over existing buttons; no new server calls. */
(function(){
"use strict";
const D=document,Q=s=>D.querySelector(s);
const app=Q("#app");if(!app)return;
const ic=p=>'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
const I={files:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',chat:'<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/>',send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',game:'<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 10v5M4.5 12.5h5M16 11h.01M18 14h.01"/>',tv:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',scr:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',up:'<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',ws:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>'};
const store=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null};
const on=id=>{const b=Q(id);return b&&!b.hidden&&!b.classList.contains("hide")?b:null};
// items: [label, icon, target button selector]
const NAV=[["Browse","Files",I.files,"#brand"],["People","Chat",I.chat,"#chb"],["People","Send",I.send,"#snb"],["Play & watch","Play games",I.game,"#fab"],["Play & watch","Watch screen",I.scr,"#watch"],["Play & watch","TV remote",I.tv,"#rmt"],["More","Help",I.help,"#help"]];
D.body.insertAdjacentHTML("beforeend",'<div id="sbk" class="hide"></div><aside id="sb" aria-label="Side panel"><div class="sbh"><span class="sbl"><i></i><b>LocalShare</b></span><button class="ib" id="sbx" aria-label="Close side panel">'+ic('<path d="M18 6 6 18M6 6l12 12"/>')+'</button></div><button class="btn pri sbu" id="sbu">'+ic(I.up)+'<span>Upload</span></button><nav id="sbn" aria-label="Sections"></nav><div class="sbt">Workspaces</div><div id="sbw"></div></aside>');
const sb=Q("#sb"),bk=Q("#sbk");
const logo=Q("#logo3");if(logo)sb.querySelector(".sbl i").innerHTML=logo.innerHTML;
const hb=D.createElement("button");hb.className="ib";hb.id="sbm";hb.setAttribute("aria-label","Open side panel");hb.innerHTML=ic(I.menu);
const hd=Q("#app header");if(hd)hd.insertBefore(hb,hd.firstChild);
let pinned=false,open=false;
function wide(){return innerWidth>=1100}
const CH='<path d="m15 18-6-6 6-6"/>',EX='<path d="M18 6 6 18M6 6l12 12"/>',XP='<path d="m9 18 6-6-6-6"/>';
function apply(){
  const want=wide()&&store("ls_sb")!=="0",mini=want&&store("ls_sbm")==="1";
  pinned=want;D.body.classList.toggle("sbp",pinned);D.body.classList.toggle("sbm",mini);
  const x=Q("#sbx");x.innerHTML=ic(!pinned?EX:mini?XP:CH);x.setAttribute("aria-label",!pinned?"Close side panel":mini?"Expand side panel":"Collapse side panel");x.title=x.getAttribute("aria-label");
  sb.classList.toggle("on",pinned||open);bk.classList.toggle("hide",pinned||!open);
  hb.style.display=pinned?"none":"";
}
function show(v){open=v;if(wide()){store("ls_sb",v?"1":"0");open=false}apply();if(v)draw()}
hb.onclick=()=>show(true);Q("#sbx").onclick=()=>{if(pinned){store("ls_sbm",store("ls_sbm")==="1"?"0":"1");apply()}else show(false)};
bk.onclick=()=>show(false);
D.addEventListener("keydown",e=>{if(e.key==="Escape"&&open){show(false)}});
addEventListener("resize",apply);
function drawNav(){
  const n=Q("#sbn");n.innerHTML="";
  let last="";
  NAV.forEach(([g,t,i,sel])=>{const tg=on(sel);if(!tg)return;
    if(g!==last){last=g;n.insertAdjacentHTML("beforeend",'<div class="sbt">'+g+"</div>")}
    const b=D.createElement("button");b.className="sbi";b.title=t;b.innerHTML=ic(i)+"<span>"+t+"</span>";const bd=tg.querySelector("b");if(bd)b.insertAdjacentHTML("beforeend","<em>"+bd.textContent+"</em>");
    b.onclick=()=>{tg.click();if(!pinned)show(false)};n.appendChild(b)});
}
function drawWs(){
  const w=Q("#sbw"),S=window.WS&&WS.state?WS.state():null;w.innerHTML="";
  if(!S)return;
  for(let i=0;i<S.n;i++){
    const b=D.createElement("button");b.className="sbi"+(i===S.cur?" cur":"");
    b.title=S.titles[i]||"Workspace "+(i+1);b.innerHTML='<span class="sbn">'+(i+1)+"</span><span>"+(S.titles[i]||(i===S.cur?"Files":"Empty"))+"</span>";
    b.onclick=()=>{WS.go(i);if(!pinned)show(false)};w.appendChild(b);
  }
}
function draw(){drawNav();drawWs();const u=on("#upb");Q("#sbu").style.display=u?"":"none"}
Q("#sbu").onclick=()=>{const u=Q("#upb");if(u)u.click();if(!pinned)show(false)};
addEventListener("wschange",drawWs);
new MutationObserver(()=>{if(pinned||open)draw()}).observe(app,{attributes:true,subtree:true,attributeFilter:["class","hidden"],childList:true,characterData:true});
apply();draw();
})();
