"use strict";
/* Arcade: Tic-Tac-Toe, Connect 4, Pong, Snake Battle, Draw & Guess. The first person in a room runs the game; everyone else sends inputs.
   Needs the page helpers $, toast, ME, INFO. Talks to the server's /wsp room relay (see PartyHub.java). */
(function(){
const A={ws:null,me:"",host:"",ps:[],g:null,key:"",on:false,tick:0,raf:0};
window.ARC=A;
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isHost=()=>A.me&&A.me===A.host;
const seat=id=>A.ps.findIndex(p=>p.id===id);
const nameOf=id=>{const p=A.ps.find(p=>p.id===id);return p?p.n:"?"};
function send(s){if(A.ws&&A.ws.readyState===1)A.ws.send(s)}
const bc=o=>send("B|"+JSON.stringify(o));
const to=(id,o)=>send("T|"+id+"|"+JSON.stringify(o));
const GAMES=[
 {id:"ttt",n:"Tic-Tac-Toe",d:"2 players · first to three in a row",ic:"❌⭕"},
 {id:"c4",n:"Connect 4",d:"2 players · drop discs, line up four",ic:"🔴🟡"},
 {id:"pong",n:"Pong",d:"2 players · drag your paddle · first to 7",ic:"🏓"},
 {id:"snake",n:"Snake Battle",d:"2–12 players · eat, grow, don't crash",ic:"🐍"},
 {id:"draw",n:"Draw & Guess",d:"2–12 players · draw the word, others guess",ic:"🎨"}];
let root,body,title,who;
function build(){
 if(root)return;
 const st=el("style","",`#arc{position:fixed;inset:0;z-index:90;background:var(--bg);color:var(--text);display:flex;flex-direction:column}#arc.hide{display:none}
 #arc .top{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--outline)}#arc .top b{flex:1;font-size:17px}
 #arc .ib{min-height:40px;min-width:40px;border-radius:20px;border:1px solid var(--outline);background:var(--surface);color:var(--text);font-weight:700;padding:0 12px}
 #arc .bd{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;align-items:center;gap:12px}
 #arc .gm{width:min(520px,100%);display:flex;gap:12px;align-items:center;text-align:left;padding:14px;border-radius:18px;border:1px solid var(--outline);background:var(--surface);color:var(--text)}#arc .gm:active{transform:scale(.98)}#arc .gm span{font-size:26px;min-width:64px;text-align:center}#arc .gm small{display:block;color:var(--muted)}
 #arc .pl{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;font-size:13px}#arc .pl i{font-style:normal;padding:4px 10px;border-radius:14px;background:var(--surface2)}#arc .pl i.me{border:1px solid var(--primary)}
 #arc .msg{color:var(--muted);text-align:center;min-height:20px}#arc .big{font-size:20px;font-weight:800;text-align:center}
 #arc .bd2{display:grid;gap:6px;touch-action:manipulation}#arc .cell{aspect-ratio:1;border-radius:14px;border:1px solid var(--outline);background:var(--surface);color:var(--text);font-size:min(14vw,64px);font-weight:800;display:grid;place-items:center;padding:0}
 #arc canvas{max-width:100%;border-radius:14px;border:1px solid var(--outline);background:#101012;touch-action:none}
 #arc .pri{min-height:44px;padding:0 22px;border-radius:22px;border:0;background:var(--primary);color:var(--onprimary);font-weight:800}
 #arc .dp{display:grid;grid-template-columns:repeat(3,64px);gap:6px}#arc .dp button{height:56px;border-radius:16px;border:1px solid var(--outline);background:var(--surface);color:var(--text);font-size:22px}
 #arc input{min-height:44px;border-radius:22px;border:1px solid var(--outline);background:var(--surface);color:var(--text);padding:0 16px;font-size:16px;min-width:0}
 #arc .chat{width:min(520px,100%);max-height:120px;overflow:auto;font-size:14px;background:var(--surface);border-radius:12px;padding:8px 12px}#arc .chat div{padding:1px 0}#arc .chat .ok{color:var(--primary)}
 #arcfab{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(max(16px,env(safe-area-inset-bottom)) + 72px);width:52px;height:52px;border-radius:18px;border:1px solid var(--primary);background:var(--surface2);color:var(--primary-text);font-size:24px;z-index:20;box-shadow:var(--shadow)}#arcfab.hide{display:none}`);
 document.head.appendChild(st);
 root=el("div","hide");root.id="arc";root.setAttribute("role","application");root.setAttribute("aria-label","Arcade");
 const top=el("div","top");const back=el("button","ib","←");back.setAttribute("aria-label","Back");title=el("b","","Arcade");who=el("span","msg","");
 const x=el("button","ib","✕");x.setAttribute("aria-label","Close arcade");
 top.append(back,title,who,x);body=el("div","bd");root.append(top,body);document.body.appendChild(root);
 back.onclick=()=>{if(A.g)leaveGame();else close()};x.onclick=close;
 const f=el("button","hide","🕹️");f.id="arcfab";f.setAttribute("aria-label","Open Arcade");f.onclick=open;document.body.appendChild(f);
 setInterval(()=>{f.classList.toggle("hide",!(INFO&&INFO.gameEnabled)||$("#app").classList.contains("hide")||A.on||(typeof G!=="undefined"&&G.on))},800);
 addEventListener("keydown",e=>{if(!A.on)return;if(e.key==="Escape")close();if(A.g&&A.g.key)A.g.key(e)});
}
function open(){build();A.on=true;root.classList.remove("hide");menu()}
function close(){leaveGame();A.on=false;if(root)root.classList.add("hide")}
function menu(){
 title.textContent="Arcade";who.textContent="";body.innerHTML="";
 body.append(el("div","msg","Pick a game. Everyone who picks the same game and room code plays together."));
 const code=el("input");code.placeholder="Room code (optional)";code.maxLength=8;code.setAttribute("aria-label","Room code");code.value=localStorage.getItem("ls_room")||"";
 body.append(code);
 GAMES.forEach(g=>{const b=el("button","gm",`<span>${g.ic}</span><div><b>${g.n}</b><small>${g.d}</small></div>`);b.onclick=()=>{const c=code.value.replace(/[^A-Za-z0-9]/g,"").slice(0,8);try{localStorage.setItem("ls_room",c)}catch(e){}play(g.id,c)};body.append(b)});
}
function play(id,code){
 leaveGame();A.key=id+"#"+code;A.host="";A.ps=[];
 const g=GAMES.find(x=>x.id===id);title.textContent=g.n;body.innerHTML="";
 const info=el("div","msg","Connecting…");body.append(info);
 const ws=new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host+"/wsp");A.ws=ws;
 ws.onopen=()=>send("J|"+id+"|"+code);
 ws.onclose=()=>{if(A.ws===ws&&A.g){A.ws=null;toast("Disconnected from the game");leaveGame()}};
 ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}
  if(m.t==="full"){toast("That room is full");leaveGame();return}
  if(m.t==="room"){const oldHost=A.host;A.me=m.you;A.host=m.host;A.ps=m.p;
   if(!A.g){A.g=MAKERS[id]();A.g.id=id;body.innerHTML="";A.g.start(body)}
   who.textContent=(code?"Room "+code+" · ":"")+A.ps.length+" here";
   A.g.room(oldHost!==A.host)}
  else if(m.t==="m"&&A.g){let d;try{d=JSON.parse(m.d)}catch(e){return}A.g.msg(m.f,d)}};
}
function leaveGame(){
 if(A.g&&A.g.stop)A.g.stop();A.g=null;clearInterval(A.tick);cancelAnimationFrame(A.raf);
 if(A.ws){const w=A.ws;A.ws=null;try{w.close()}catch(e){}}
 if(root&&A.on)menu();
}
const players=()=>el("div","pl",A.ps.map(p=>`<i class="${p.id===A.me?"me":""}">${esc(p.n)}${p.id===A.host?" ★":""}</i>`).join(""));
function waitBox(need){const b=el("div","msg",`Waiting for ${need} to join… share this page's address and pick the same game${A.key.endsWith("#")?"":" and room code"}.`);return b}

/* ---------- Tic-Tac-Toe and Connect 4 ---------- */
function board(cfg){
 let S,grid,msg,pl,rows=cfg.rows,cols=cfg.cols;
 const fresh=()=>({b:Array(rows*cols).fill(0),t:0,w:-1,ids:[]});
 const mark=v=>cfg.marks[v-1];
 function win(b,v){const D=[[1,0],[0,1],[1,1],[1,-1]];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){if(b[y*cols+x]!==v)continue;
   for(const[dx,dy]of D){let k=1;while(k<cfg.win){const X=x+dx*k,Y=y+dy*k;if(X<0||Y<0||X>=cols||Y>=rows||b[Y*cols+X]!==v)break;k++}if(k===cfg.win)return true}}return false}
 function apply(id,c){ // host only
  const s=S.ids.indexOf(id);if(s<0||S.w>=0||s!==S.t)return;
  let i=c;
  if(cfg.gravity){const x=c%cols;i=-1;for(let y=rows-1;y>=0;y--)if(!S.b[y*cols+x]){i=y*cols+x;break}if(i<0)return}
  else if(S.b[i])return;
  S.b[i]=s+1;
  if(win(S.b,s+1))S.w=s;else if(S.b.every(v=>v))S.w=2;else S.t=1-S.t;
  bc({k:"s",s:S});draw();
 }
 function draw(){
  if(!S)return;
  grid.innerHTML="";
  S.b.forEach((v,i)=>{const c=el("button","cell",v?mark(v):"");c.setAttribute("aria-label",v?"taken":"empty");if(cfg.gravity)c.style.fontSize="min(9vw,40px)";c.onclick=()=>click(i);grid.append(c)});
  const my=S.ids.indexOf(A.me);
  msg.textContent=S.ids.length<2?"":S.w===2?"It's a draw!":S.w>=0?(S.ids[S.w]===A.me?"You win! 🎉":nameOf(S.ids[S.w])+" wins"):my<0?"Watching "+nameOf(S.ids[S.t])+"'s turn":S.t===my?"Your turn "+mark(my+1):"Waiting for "+nameOf(S.ids[S.t]);
  rb.classList.toggle("hide",S.w<0||my<0);
 }
 let rb;
 function click(i){const c=cfg.gravity?i%cols:i;if(isHost())apply(A.me,c);else{const h=A.host;to(h,{k:"i",c})}}
 return{st(){return S},word(){return typeof word==="string"?word:""},start(b){grid=el("div","bd2");grid.style.cssText=`grid-template-columns:repeat(${cols},1fr);width:min(${cfg.gravity?460:360}px,100%)`;
   msg=el("div","big","");pl=el("div");rb=el("button","pri hide","Play again");rb.onclick=()=>{if(isHost()){reset()}else to(A.host,{k:"r"})};
   b.append(msg,grid,rb,pl)},
  room(hc){
   pl.replaceWith(pl=players());
   if(isHost()){if(!S||hc){S=fresh()}
    S.ids=S.ids.filter(id=>seat(id)>=0);for(const p of A.ps){if(S.ids.length<2&&!S.ids.includes(p.id))S.ids.push(p.id)}
    if(S.ids.length<2&&S.w<0)S.b.fill(0);
    bc({k:"s",s:S});draw();if(S.ids.length<2)msg.textContent="Waiting for a friend to join…"}
   else if(hc||!S){S=null;grid.innerHTML="";msg.textContent="Waiting for the host…"}},
  msg(f,d){if(d.k==="s"&&!isHost()){S=d.s;draw()}else if(d.k==="i"&&isHost())apply(f,d.c);else if(d.k==="r"&&isHost()&&S&&S.w>=0&&S.ids.includes(f))reset()}};
 function reset(){const ids=S.ids.slice().reverse();S=fresh();S.ids=ids;bc({k:"s",s:S});draw()}
}
/* ---------- Pong ---------- */
function pong(){
 const W=480,H=300,PH=60,WINP=7;let S=null,cv,ctx,msg,pl,py=H/2,sent=0,keys={};
 let serve0=Math.random()<.5?1:-1;
 const fresh=()=>({ids:[],y:[H/2,H/2],s:[0,0],b:{x:W/2,y:H/2,vx:0,vy:0},w:-1,hold:30});
 const serve=d=>{S.b={x:W/2,y:H/2,vx:(d||1)*5,vy:(Math.random()*4-2)}};
 function step(){ // host, 30 times a second
  if(S.ids.length<2){S.b={x:W/2,y:H/2,vx:0,vy:0};bc({k:"s",s:S});draw();return}
  if(S.w>=0){bc({k:"s",s:S});return}
  if(S.hold>0){S.hold--;if(S.hold===0&&!S.b.vx)serve(serve0)}else{
   const b=S.b;b.x+=b.vx;b.y+=b.vy;
   if(b.y<6){b.y=6;b.vy=Math.abs(b.vy)}if(b.y>H-6){b.y=H-6;b.vy=-Math.abs(b.vy)}
   for(let i=0;i<2;i++){const px=i?W-20:20;if(Math.abs(b.x-px)<10&&Math.abs(b.y-S.y[i])<PH/2+6&&(i?b.vx>0:b.vx<0)){b.vx=-b.vx*1.06;b.vy+=(b.y-S.y[i])/PH*5;b.vx=Math.max(-12,Math.min(12,b.vx))}}
   if(b.x<0||b.x>W){const sc=b.x<0?1:0;S.s[sc]++;if(S.s[sc]>=WINP)S.w=sc;else{S.b={x:W/2,y:H/2,vx:0,vy:0};S.hold=40;serve0=sc?-1:1}}}
  bc({k:"s",s:S});draw();
 }
 function draw(){
  if(!S||!ctx)return;ctx.fillStyle="#101012";ctx.fillRect(0,0,W,H);ctx.strokeStyle="#34343A";ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
  const col=getComputedStyle(document.documentElement).getPropertyValue("--primary")||"#FFD60A";
  ctx.fillStyle=col;for(let i=0;i<2;i++)ctx.fillRect(i?W-20:12,S.y[i]-PH/2,8,PH);
  ctx.beginPath();ctx.arc(S.b.x,S.b.y,7,0,7);ctx.fill();
  ctx.fillStyle="#F2F2F0";ctx.font="bold 34px system-ui";ctx.textAlign="center";ctx.fillText(S.s[0],W/2-50,44);ctx.fillText(S.s[1],W/2+50,44);
  const my=S.ids.indexOf(A.me);
  msg.textContent=S.ids.length<2?"Waiting for a friend to join…":S.w>=0?(S.ids[S.w]===A.me?"You win! 🎉":nameOf(S.ids[S.w])+" wins"):my<0?"Watching "+nameOf(S.ids[0])+" vs "+nameOf(S.ids[1]):"You are the "+(my?"right":"left")+" paddle · drag or use ↑ ↓";
 }
 function setY(v){const my=S?S.ids.indexOf(A.me):-1;py=Math.max(PH/2,Math.min(H-PH/2,v));if(my<0)return;if(isHost())S.y[my]=py;else{const t=Date.now();if(t-sent>33){sent=t;to(A.host,{k:"i",y:Math.round(py)})}}}
 return{st(){return S},word(){return typeof word==="string"?word:""},start(b){msg=el("div","big","");cv=el("canvas");cv.width=W;cv.height=H;cv.style.width="min(520px,100%)";ctx=cv.getContext("2d");pl=el("div");
   const rb=el("button","pri","New game");rb.onclick=()=>{if(isHost())reset();else to(A.host,{k:"r"})};
   b.append(msg,cv,rb,pl);
   const pt=e=>{const r=cv.getBoundingClientRect();setY((e.clientY-r.top)/r.height*H)};
   cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);pt(e)};cv.onpointermove=e=>{if(e.buttons||e.pointerType==="touch")pt(e)};
   A.tick=setInterval(()=>{if(keys.u)setY(py-9);if(keys.d)setY(py+9);if(isHost())step()},33)},
  key(e){const v=e.type==="keydown";if(e.key==="ArrowUp"||e.key==="w")keys.u=v;if(e.key==="ArrowDown"||e.key==="s")keys.d=v},
  room(hc){pl.replaceWith(pl=players());
   if(isHost()){if(!S||hc)S=fresh();S.ids=S.ids.filter(id=>seat(id)>=0);for(const p of A.ps)if(S.ids.length<2&&!S.ids.includes(p.id))S.ids.push(p.id);bc({k:"s",s:S})}
   else if(hc){S=null}},
  msg(f,d){if(d.k==="s"&&!isHost()){S=d.s;draw()}else if(isHost()&&S){if(d.k==="i"){const s=S.ids.indexOf(f);if(s>=0)S.y[s]=Math.max(PH/2,Math.min(H-PH/2,+d.y||0))}else if(d.k==="r")reset()}}};
 function reset(){const ids=S.ids.slice().reverse();S=fresh();S.ids=ids}
}
addEventListener("keyup",e=>{if(A.on&&A.g&&A.g.key)A.g.key(e)});
/* ---------- Snake Battle ---------- */
function snake(){
 const C=32,R=20,CELL=18;let S=null,cv,ctx,msg,pl,want=null;
 const DIRS={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
 const hue=id=>{let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))%360;return h};
 const fresh=()=>({sn:{},f:[],t:0});
 function spawn(id){const x=3+Math.floor(Math.random()*(C-6)),y=3+Math.floor(Math.random()*(R-6));S.sn[id]={c:[[x,y],[x-1,y],[x-2,y]],d:"r",alive:true,sc:S.sn[id]?S.sn[id].sc:0,re:0}}
 function food(){while(S.f.length<Math.max(3,Object.keys(S.sn).length+2))S.f.push([Math.floor(Math.random()*C),Math.floor(Math.random()*R)])}
 function step(){
  const ids=Object.keys(S.sn);
  for(const id of ids){const s=S.sn[id];if(!s.alive){if(--s.re<=0)spawn(id);continue}
   const d=DIRS[s.d],h=s.c[0],n=[h[0]+d[0],h[1]+d[1]];s.c.unshift(n);
   const fi=S.f.findIndex(f=>f[0]===n[0]&&f[1]===n[1]);if(fi>=0){S.f.splice(fi,1);s.sc++}else s.c.pop()}
  for(const id of ids){const s=S.sn[id];if(!s.alive)continue;const h=s.c[0];let dead=h[0]<0||h[1]<0||h[0]>=C||h[1]>=R;
   if(!dead)for(const o of ids){const t=S.sn[o];if(!t.alive)continue;for(let i=o===id?1:0;i<t.c.length;i++)if(t.c[i][0]===h[0]&&t.c[i][1]===h[1]){dead=true;break}if(dead)break}
   if(dead){s.alive=false;s.re=25;s.sc=Math.max(0,s.sc-2);S.f.push(...s.c.filter((_,i)=>i%3===0).slice(0,6).map(c=>[Math.max(0,Math.min(C-1,c[0])),Math.max(0,Math.min(R-1,c[1]))]))}}
  food();S.t++;if(S.f.length>40)S.f.length=40;
  bc({k:"s",s:{t:S.t,f:S.f,sn:Object.fromEntries(Object.entries(S.sn).map(([k,v])=>[k,{c:v.c.slice(0,60),d:v.d,a:v.alive?1:0,sc:v.sc}]))}});draw();
 }
 function turn(id,d){const s=S&&S.sn[id];if(!s||!s.alive||!DIRS[d])return;const o={u:"d",d:"u",l:"r",r:"l"};if(o[s.d]===d&&s.c.length>1)return;s.d=d}
 function draw(){
  if(!S||!ctx)return;ctx.fillStyle="#101012";ctx.fillRect(0,0,C*CELL,R*CELL);
  ctx.fillStyle="#F0745F";for(const f of S.f){ctx.beginPath();ctx.arc(f[0]*CELL+CELL/2,f[1]*CELL+CELL/2,5,0,7);ctx.fill()}
  const rows=[];
  for(const id in S.sn){const s=S.sn[id];const alive=s.alive!==undefined?s.alive:s.a;rows.push([id,s.sc,alive]);if(!alive)continue;
   ctx.fillStyle=`hsl(${hue(id)} 80% ${id===A.me?62:50}%)`;s.c.forEach((c,i)=>{ctx.fillRect(c[0]*CELL+1,c[1]*CELL+1,CELL-2,CELL-2);if(!i){ctx.fillStyle="#000";ctx.fillRect(c[0]*CELL+6,c[1]*CELL+6,5,5);ctx.fillStyle=`hsl(${hue(id)} 80% ${id===A.me?62:50}%)`}})}
  rows.sort((a,b)=>b[1]-a[1]);
  msg.innerHTML=rows.map(r=>`<span style="color:hsl(${hue(r[0])} 80% 62%)">${esc(nameOf(r[0]))}${r[0]===A.me?" (you)":""}: ${r[1]}${r[2]?"":" 💥"}</span>`).join(" · ")||"Waiting…";
 }
 function dir(d){if(isHost())turn(A.me,d);else to(A.host,{k:"i",d})}
 return{st(){return S},word(){return typeof word==="string"?word:""},start(b){msg=el("div","msg","");cv=el("canvas");cv.width=C*CELL;cv.height=R*CELL;cv.style.width="min(580px,100%)";ctx=cv.getContext("2d");pl=el("div");
   const dp=el("div","dp");[["","u",""],["l","d","r"]].forEach((row,ri)=>row.forEach((d,i)=>{const bt=el("button","",d?{u:"↑",d:"↓",l:"←",r:"→"}[d]:"");if(!d){bt.style.visibility="hidden"}else bt.onpointerdown=e=>{e.preventDefault();dir(d)};dp.append(bt)}));
   b.append(msg,cv,dp,pl);let sx=0,sy=0;
   cv.onpointerdown=e=>{sx=e.clientX;sy=e.clientY};cv.onpointerup=e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;dir(Math.abs(dx)>Math.abs(dy)?(dx>0?"r":"l"):(dy>0?"d":"u"))};
   A.tick=setInterval(()=>{if(isHost()&&S)step()},130)},
  key(e){if(e.type!=="keydown")return;const m={ArrowUp:"u",ArrowDown:"d",ArrowLeft:"l",ArrowRight:"r",w:"u",s:"d",a:"l",d:"r"}[e.key];if(m){e.preventDefault();dir(m)}},
  room(hc){pl.replaceWith(pl=players());
   if(isHost()){if(!S||hc){S=fresh()}for(const id in S.sn)if(seat(id)<0)delete S.sn[id];for(const p of A.ps)if(!S.sn[p.id])spawn(p.id);food()}
   else if(hc){S=null}},
  msg(f,d){if(d.k==="s"&&!isHost()){S=d.s;draw()}else if(d.k==="i"&&isHost())turn(f,d.d)}};
}
/* ---------- Draw & Guess ---------- */
const WORDS="apple house tree car sun moon star fish cat dog bird flower boat train plane phone book chair table clock key door cake pizza banana guitar bicycle umbrella glasses hat shoe snake spider rabbit horse cow elephant mountain river rain cloud rocket robot crown candle ladder bridge castle camera ball kite lamp cup bottle ice-cream butterfly turtle penguin".split(" ");
function draw_(){
 const ROUND=60;let S=null,cv,ctx,msg,chat,inp,pl,tools,word="",cur=null,last=0,tm=0,strokes=[];
 const fresh=()=>({ph:"lobby",order:[],i:0,sc:{},end:0,hint:"",got:[],rounds:0});
 function pub(){S.lf=S.ph==="draw"?Math.max(0,Math.ceil((S.end-Date.now())/1000)):0;bc({k:"s",s:S})}
 const endAt=()=>isHost()?S.end:S.endLocal;
 const myTurn=()=>S&&S.ph==="draw"&&S.order[S.i]===A.me;
 function begin(){ // host
  S.order=A.ps.map(p=>p.id);S.i=-1;S.sc={};S.rounds=0;S.ph="draw";next();
 }
 function next(){
  S.i++;if(S.i>=S.order.length){S.ph="over";S.hint="";word="";pub();bc({k:"w",w:""});paint();return}
  while(S.i<S.order.length&&seat(S.order[S.i])<0)S.i++;
  if(S.i>=S.order.length){S.ph="over";S.hint="";pub();paint();return}
  S.revealing=false;
  word=WORDS[Math.floor(Math.random()*WORDS.length)];S.hint=word.replace(/[a-z]/g,"_ ").trim();S.end=Date.now()+ROUND*1000;S.got=[];
  bc({k:"clear"});clear();pub();const d=S.order[S.i];if(d===A.me)paint();else to(d,{k:"w",w:word});paint();
 }
 function say(n,t,ok){const d=el("div",ok?"ok":"",`<b>${esc(n)}</b> ${esc(t)}`);chat.append(d);chat.scrollTop=1e9}
 function guess(id,t){ // host
  if(!S||S.ph!=="draw"||id===S.order[S.i]||S.got.includes(id))return;
  if(t.trim().toLowerCase()===word){const left=Math.max(0,Math.round((S.end-Date.now())/1000));S.sc[id]=(S.sc[id]||0)+10+left;const dr=S.order[S.i];S.sc[dr]=(S.sc[dr]||0)+5;S.got.push(id);
   bc({k:"c",n:nameOf(id),t:"guessed the word! 🎉",ok:1});say(nameOf(id),"guessed the word! 🎉",1);pub();paint();
   if(S.got.length>=S.order.length-1)setTimeout(()=>{if(S&&S.ph==="draw")reveal()},800)}
  else{bc({k:"c",n:nameOf(id),t:t.slice(0,40)});say(nameOf(id),t.slice(0,40))}
 }
 function reveal(){if(S.revealing)return;S.revealing=true;bc({k:"c",n:"The word was",t:word,ok:1});say("The word was",word,1);setTimeout(()=>{if(S)next()},2500)}
 function paint(){
  if(!S)return;const mine=myTurn(),dr=S.order[S.i];
  tools.classList.toggle("hide",!mine);inp.parentNode.classList.toggle("hide",mine||S.ph!=="draw");
  startB.classList.toggle("hide",!(isHost()&&(S.ph==="lobby"||S.ph==="over")&&A.ps.length>=2));
  const left=S.ph==="draw"?Math.max(0,Math.ceil((endAt()-Date.now())/1000)):0;
  const sc=Object.entries(S.sc).sort((a,b)=>b[1]-a[1]).map(([id,v])=>esc(nameOf(id))+" "+v).join(" · ");
  msg.innerHTML=(S.ph==="lobby"?(A.ps.length<2?"Waiting for friends to join…":isHost()?"Everyone here? Press Start.":"Waiting for the host to start…"):S.ph==="over"?"Game over! "+(sc?"🏆 "+sc:""):(mine?"Draw: <b>"+esc(word)+"</b>":esc(nameOf(dr))+" is drawing: <b>"+esc(S.hint)+"</b>")+" · "+left+"s")+(S.ph==="draw"&&sc?"<br><small>"+sc+"</small>":"");
 }
 function clear(){strokes=[];ctx.fillStyle="#fff";ctx.fillRect(0,0,500,340)}
 function line(a,b,c,w){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
 let color="#111",startB;
 return{st(){return S},word(){return typeof word==="string"?word:""},start(b){msg=el("div","msg","");cv=el("canvas");cv.width=500;cv.height=340;cv.style.width="min(560px,100%)";ctx=cv.getContext("2d");clear();
   tools=el("div","pl hide");["#111","#e03131","#1971c2","#2f9e44","#f08c00"].forEach(c=>{const t=el("button","ib","");t.style.background=c;t.style.minWidth="36px";t.setAttribute("aria-label","Pen "+c);t.onclick=()=>color=c;tools.append(t)});
   const e=el("button","ib","Eraser");e.onclick=()=>color="#fff";const cl=el("button","ib","Clear");cl.onclick=()=>{clear();bc({k:"clear"})};tools.append(e,cl);
   chat=el("div","chat");const row=el("div");row.style.cssText="display:flex;gap:8px;width:min(520px,100%)";inp=el("input");inp.placeholder="Type your guess";inp.maxLength=40;inp.style.flex="1";inp.setAttribute("aria-label","Your guess");
   const go=el("button","pri","Guess");const sendG=()=>{const t=inp.value.trim();if(!t)return;inp.value="";if(isHost())guess(A.me,t);else to(A.host,{k:"g",t})};go.onclick=sendG;inp.onkeydown=e=>{if(e.key==="Enter")sendG()};row.append(inp,go);
   startB=el("button","pri hide","Start game");startB.onclick=()=>{if(isHost())begin()};pl=el("div");
   b.append(msg,cv,tools,row,chat,startB,pl);
   const pt=e=>{const r=cv.getBoundingClientRect();return[Math.round((e.clientX-r.left)/r.width*500),Math.round((e.clientY-r.top)/r.height*340)]};
   cv.onpointerdown=e=>{if(!myTurn())return;cv.setPointerCapture(e.pointerId);cur=pt(e);line(cur,cur,color,color==="#fff"?18:4);bc({k:"d",a:cur,b:cur,c:color})};
   cv.onpointermove=e=>{if(!cur||!myTurn())return;const p=pt(e);line(cur,p,color,color==="#fff"?18:4);bc({k:"d",a:cur,b:p,c:color});cur=p};
   cv.onpointerup=()=>{cur=null};
   A.tick=setInterval(()=>{if(S){paint();if(isHost()){if(S.ph==="draw"&&Date.now()>S.end+300)reveal();else if(S.ph==="draw")pub()}}},1000)},
  room(hc){pl.replaceWith(pl=players());
   if(isHost()){if(!S||hc){S=fresh()}if(S.ph==="draw"&&S.order[S.i]&&seat(S.order[S.i])<0)next();pub()}else if(hc)S=null;paint()},
  msg(f,d){
   if(d.k==="s"&&!isHost()){S=d.s;S.endLocal=Date.now()+(S.lf||0)*1000;paint()}
   else if(d.k==="w"){word=d.w;paint()}
   else if(d.k==="clear"){clear()}
   else if(d.k==="d"&&S&&S.order[S.i]===f){line(d.a,d.b,d.c,d.c==="#fff"?18:4)}
   else if(d.k==="c"){say(d.n,d.t,d.ok)}
   else if(d.k==="g"&&isHost())guess(f,String(d.t||""))}};
}
const MAKERS={
 ttt:()=>board({rows:3,cols:3,win:3,gravity:false,marks:["✕","◯"]}),
 c4:()=>board({rows:6,cols:7,win:4,gravity:true,marks:["🔴","🟡"]}),
 pong,snake,draw:draw_};
window.arcadeOpen=open;window.arcadeClose=close;
if(document.readyState!=="loading")build();else addEventListener("DOMContentLoaded",build);
})();
