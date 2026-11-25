/* one Play button, and your avatar holds your own actions */
(function(){
const $=s=>document.querySelector(s);let pop=null;
function closePop(){if(pop){pop.remove();pop=null}}
function open(anchor,items,above){closePop();pop=document.createElement("div");pop.className="pop";pop.setAttribute("role","menu");
 items.forEach(([t,fn,cls])=>{const b=document.createElement("button");b.textContent=t;b.setAttribute("role","menuitem");if(cls)b.className=cls;b.onclick=()=>{closePop();fn()};pop.appendChild(b)});
 document.body.appendChild(pop);const r=anchor.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
 pop.style.left=Math.max(8,Math.min(innerWidth-w-8,above?r.right-w:r.left))+"px";pop.style.top=above?Math.max(8,r.top-h-8)+"px":Math.min(innerHeight-h-8,r.bottom+6)+"px"}
addEventListener("pointerdown",e=>{if(pop&&!e.target.closest(".pop")&&!e.target.closest("#avb")&&!e.target.closest("#fab"))closePop()},true);
addEventListener("keydown",e=>{if(e.key==="Escape")closePop()});
const av=$("#avb");if(av){const edit=av.onclick;av.onclick=ev=>{ev.stopPropagation();if(pop){closePop();return}open(av,[["Change my picture",()=>edit&&edit.call(av,ev)],["Log out",()=>$("#lo").click(),"dng"]])}}
const fab=$("#fab");if(fab){const arena=fab.onclick;fab.setAttribute("aria-label","Play");fab.title="Play";
 fab.onclick=ev=>{if(pop){closePop();return}const arc=$("#arcfab");if(!arc||!(typeof INFO!=="undefined"&&INFO.gameEnabled)){arena&&arena.call(fab,ev);return}
  open(fab,[["Orb Arena",()=>arena&&arena.call(fab,ev)],["Arcade (card & party games)",()=>arc.click()]],true)}}
})();
