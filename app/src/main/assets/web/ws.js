/* LocalShare workspace: open many files as tabs inside the page.
   YouTube-style video, Spotify-style music (keeps playing while you browse), code editor with save, DOCX, PDF and pictures. */
(()=>{
"use strict";
const D=document,Q=s=>D.querySelector(s),KINDS=["video","audio","text","image","pdf","docx"];
const ic=(d,s)=>'<svg viewBox="0 0 24 24" width="'+(s||22)+'" height="'+(s||22)+'" fill="currentColor" aria-hidden="true"><path d="'+d+'"/></svg>';
const I={
 play:"M8 5v14l11-7z",pause:"M6 5h4v14H6zm8 0h4v14h-4z",next:"M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z",prev:"M6 6h2v12H6zm3.5 6l8.5 6V6z",
 vol:"M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z",mute:"M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.5 2.5V12zM19 12c0 .9-.2 1.8-.5 2.6l1.5 1.5A8.8 8.8 0 0 0 21 12c0-4.3-3-7.9-7-8.8v2.1c2.9.9 5 3.5 5 6.7zM4.3 3L3 4.3 7.7 9H3v6h4l5 5v-6.7l4.2 4.2c-.7.5-1.4.9-2.2 1.1v2.1a9 9 0 0 0 3.7-1.8l2 2 1.3-1.3L4.3 3zM12 4L9.9 6.1 12 8.2V4z",
 full:"M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",theatre:"M19 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 10H5V8h14v8z",
 pip:"M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z",
 x:"M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6z",back:"M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z",
 shuf:"M10.6 9.2L5.4 4 4 5.4l5.2 5.2 1.4-1.4zM14.5 4l2.0 2-12.5 12.5 1.4 1.4L17.9 7.4l2 2V4h-5.4zm.3 9.8l-1.4 1.4 3.1 3.1-2 2h5.4v-5.4l-2 2-3.1-3.1z",
 rep:"M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",list:"M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
 save:"M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-10H5V5h10v4z",
 dl:"M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z",music:"M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z",film:"M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4h-4z",
 doc:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
 code:"M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",img:"M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z",
 cc:"M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1z",
 gear:"M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1L11 21h4l.4-2.9c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5-2.2-1.6zM13 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
 find:"M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z",wrap:"M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.3c.8 0 1.5.7 1.5 1.5S18.1 16 17.3 16H15v-2l-3 3 3 3v-2h2.3a3.5 3.5 0 0 0 0-7z"
};
const css=`
#ws{position:fixed;inset:0;z-index:35;background:var(--bg);color:var(--text);display:flex;flex-direction:column}#ws.hide{display:none}
#wst{display:flex;align-items:stretch;gap:4px;padding:6px 8px 0;padding-top:max(6px,env(safe-area-inset-top));background:var(--surface);border-bottom:1px solid var(--outline)}
#wst>button{flex:none;width:40px;height:40px;margin-bottom:6px;border:0;border-radius:20px;background:none;color:var(--text);display:grid;place-items:center;cursor:pointer}#wst>button:hover{background:var(--surface2)}
#wtabs{display:flex;gap:2px;flex:1;min-width:0;overflow-x:auto;scrollbar-width:none;align-items:flex-end}#wtabs::-webkit-scrollbar{display:none}
.wtab{flex:0 1 190px;min-width:110px;max-width:220px;height:40px;display:flex;align-items:center;gap:8px;padding:0 6px 0 12px;border-radius:12px 12px 0 0;background:var(--bg);color:var(--muted);border:1px solid transparent;border-bottom:0;cursor:pointer;font:inherit;font-size:13px;position:relative}
.wtab[aria-selected=true]{background:var(--bg);color:var(--text);border-color:var(--outline);box-shadow:0 2px 0 var(--bg);z-index:1}.wtab:not([aria-selected=true]){background:var(--surface2)}
.wtab svg{flex:none;color:var(--primary)}.wtab span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}.wtab i{flex:none;width:8px;height:8px;border-radius:50%;background:var(--primary);font-style:normal}
.wtab b{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-weight:400}.wtab b:hover{background:var(--outline)}
.wtab.pl::after{content:"";position:absolute;left:12px;right:34px;bottom:3px;height:2px;border-radius:2px;background:var(--primary);opacity:.8}
#wsb{flex:1;min-height:0;position:relative}.wp{position:absolute;inset:0;overflow:auto;overscroll-behavior:contain}.wp:not(.on){display:none!important}.wp.on{display:flex;flex-direction:column}.wp.on.mu{display:grid}
#ws.mp #wsb{padding-bottom:74px}
#wsd{position:fixed;right:14px;bottom:max(14px,env(safe-area-inset-bottom));z-index:34;display:flex;align-items:center;gap:8px;height:48px;padding:0 16px 0 12px;border-radius:24px;border:1px solid var(--outline);background:var(--surface2);color:var(--text);box-shadow:var(--shadow);cursor:pointer;font:inherit;font-weight:700}
#wsd.hide{display:none}#wsd svg{color:var(--primary)}body.mpOn #wsd{bottom:calc(max(14px,env(safe-area-inset-bottom)) + 66px)}
/* mini player (like Spotify's bottom bar) */
#mp{position:fixed;left:8px;right:8px;bottom:max(8px,env(safe-area-inset-bottom));z-index:36;height:60px;border-radius:14px;background:var(--surface2);border:1px solid var(--outline);box-shadow:var(--shadow);display:flex;align-items:center;gap:10px;padding:0 10px 0 6px;overflow:hidden}
#mp.hide{display:none}#mp .art{flex:none;width:48px;height:48px;border-radius:8px;background:linear-gradient(135deg,var(--primary),#333);display:grid;place-items:center;color:var(--onprimary);overflow:hidden;cursor:pointer}.art img{width:100%;height:100%;object-fit:cover}
#mp .tx{flex:1;min-width:0;cursor:pointer}#mp .tx b,#mp .tx small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#mp .tx small{color:var(--muted);font-size:12px}
#mp button{flex:none;width:40px;height:40px;border:0;border-radius:50%;background:none;color:var(--text);display:grid;place-items:center;cursor:pointer}#mp .pp{background:var(--text);color:var(--bg)}
#mp .bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--outline)}#mp .bar i{display:block;height:100%;width:0;background:var(--primary)}
@media(min-width:700px){#mp{left:50%;right:auto;width:560px;transform:translateX(-50%)}}
/* video, YouTube style */
.vw{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:20px;padding:18px 24px 40px;max-width:1700px;margin:0 auto;width:100%;align-items:start}
.vw.th{grid-template-columns:minmax(0,1fr);padding:0 0 30px}.vw.th .vp{border-radius:0;max-height:78vh}.vw.th .vinfo,.vw.th .vnext{padding:0 24px}
.vp{position:relative;background:#000;border-radius:14px;overflow:hidden;aspect-ratio:16/9;width:100%;user-select:none;-webkit-user-select:none}.vp video{width:100%;height:100%;display:block;background:#000;object-fit:contain}
.vp.nc{cursor:none}.vp:fullscreen{border-radius:0;max-height:none;aspect-ratio:auto}
.vc{position:absolute;left:0;right:0;bottom:0;padding:24px 12px 8px;background:linear-gradient(transparent,rgba(0,0,0,.78));color:#fff;transition:opacity .2s}.vp.nc .vc{opacity:0;pointer-events:none}
.vprog{position:relative;height:20px;display:flex;align-items:center;cursor:pointer;touch-action:none}.vprog .tr{position:relative;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,.3);transition:height .1s}.vprog:hover .tr{height:6px}
.vprog .bf,.vprog .pl{position:absolute;left:0;top:0;bottom:0;border-radius:2px}.vprog .bf{background:rgba(255,255,255,.35)}.vprog .pl{background:var(--primary)}.vprog .kn{position:absolute;top:50%;width:13px;height:13px;margin:-6.5px 0 0 -6.5px;border-radius:50%;background:var(--primary);transform:scale(0);transition:transform .1s}.vprog:hover .kn,.vprog.dr .kn{transform:scale(1)}
.vprog .tp{position:absolute;bottom:22px;transform:translateX(-50%);background:rgba(0,0,0,.8);padding:3px 7px;border-radius:6px;font-size:12px;display:none;pointer-events:none}.vprog:hover .tp{display:block}
.vrow{display:flex;align-items:center;gap:2px}.vrow button{width:42px;height:42px;border:0;border-radius:50%;background:none;color:#fff;display:grid;place-items:center;cursor:pointer;position:relative}.vrow button:hover{background:rgba(255,255,255,.18)}.vrow button.on{color:var(--primary)}
.vrow .tm{font-size:13px;margin:0 8px;white-space:nowrap;font-variant-numeric:tabular-nums}.vrow .sp{flex:1}.vrow .vv{display:flex;align-items:center}.vrow .vv input{width:0;opacity:0;transition:width .15s,opacity .15s;accent-color:var(--primary);height:4px;margin:0}.vrow .vv:hover input,.vrow .vv:focus-within input{width:80px;opacity:1;margin:0 8px 0 0}
.vmenu{position:absolute;right:10px;bottom:60px;background:rgba(20,20,22,.96);border:1px solid var(--outline);border-radius:12px;padding:6px;min-width:150px;z-index:3;max-height:60%;overflow:auto}.vmenu button{display:block;width:100%;height:auto!important;border-radius:8px!important;padding:8px 12px;text-align:left;color:#fff;font:inherit;font-size:14px;background:none;border:0;cursor:pointer}.vmenu button:hover{background:rgba(255,255,255,.14)}.vmenu button.on{color:var(--primary)}
.vbig{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}.vbig i{width:68px;height:68px;border-radius:50%;background:rgba(0,0,0,.55);display:grid;place-items:center;color:#fff;opacity:0;transform:scale(.7);font-style:normal;font-size:13px}.vbig i.go{animation:vb .5s ease-out}
@keyframes vb{0%{opacity:.95;transform:scale(.7)}100%{opacity:0;transform:scale(1.35)}}
.vinfo{padding:12px 2px}.vinfo h2{margin:0 0 6px;font-size:20px;line-height:1.3;overflow-wrap:anywhere}.vinfo .vm{display:flex;flex-wrap:wrap;gap:8px;align-items:center;color:var(--muted);font-size:13px}
.chip{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:18px;background:var(--surface2);color:var(--text);border:0;font:inherit;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none}.chip:hover{background:var(--outline)}.chip.on{background:var(--text);color:var(--bg)}
.vnext h3{margin:4px 0 10px;font-size:15px}.vnext label{display:flex;align-items:center;gap:8px;margin-bottom:10px;color:var(--muted);font-size:13px}.vnext label input{accent-color:var(--primary)}
.vit{display:flex;gap:10px;width:100%;padding:6px;margin:0 0 4px;border:0;border-radius:12px;background:none;color:var(--text);text-align:left;cursor:pointer;font:inherit}.vit:hover,.vit.on{background:var(--surface2)}
.vit .th2{flex:none;width:150px;aspect-ratio:16/9;border-radius:8px;background:#000 center/cover;display:grid;place-items:center;color:var(--muted);position:relative}.vit .th2 em{position:absolute;right:4px;bottom:4px;background:rgba(0,0,0,.8);color:#fff;font-size:11px;font-style:normal;padding:1px 4px;border-radius:4px}
.vit span{flex:1;min-width:0;font-size:14px;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}.vit small{display:block;color:var(--muted);font-size:12px;margin-top:2px}
@media(max-width:1000px){.vw{grid-template-columns:minmax(0,1fr);padding:0 0 30px;gap:8px}.vw .vp{border-radius:0}.vw .vinfo,.vw .vnext{padding:0 14px}.vw .tb{display:none}}
/* music, Spotify style */
.mu{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:0;height:100%;min-height:0}.mu .now{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:24px;min-height:0;background:linear-gradient(180deg,color-mix(in srgb,var(--primary) 32%,#101012),var(--bg) 78%)}
.mu .cover{width:min(360px,70vw,42vh);aspect-ratio:1;border-radius:14px;background:linear-gradient(135deg,var(--primary),#2a2a2e);display:grid;place-items:center;color:var(--onprimary);box-shadow:0 18px 50px rgba(0,0,0,.55);overflow:hidden;transition:transform .3s}.mu .cover.pl{transform:scale(1.02)}.mu .cover img{width:100%;height:100%;object-fit:cover}
.mu .meta{text-align:center;max-width:min(520px,92vw)}.mu .meta h2{margin:0;font-size:24px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mu .meta p{margin:4px 0 0;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mu .seek{width:min(520px,92vw);display:flex;align-items:center;gap:10px;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}.mu .seek input{flex:1;accent-color:var(--primary);height:4px}
.mu .ctl{display:flex;align-items:center;gap:10px}.mu .ctl button{width:46px;height:46px;border:0;border-radius:50%;background:none;color:var(--text);display:grid;place-items:center;cursor:pointer}.mu .ctl button.on{color:var(--primary)}.mu .ctl .big{width:64px;height:64px;background:var(--text);color:var(--bg)}.mu .ctl button:hover{background:var(--surface2)}.mu .ctl .big:hover{background:var(--text);transform:scale(1.06)}
.mu .vol{display:flex;align-items:center;gap:8px;color:var(--muted)}.mu .vol input{width:120px;accent-color:var(--primary);height:4px}
.mu .q{border-left:1px solid var(--outline);overflow:auto;padding:14px 10px;background:var(--surface)}.mu .q h3{margin:0 8px 10px;font-size:15px}
.mu .qi{display:flex;align-items:center;gap:10px;width:100%;padding:8px;border:0;border-radius:10px;background:none;color:var(--text);cursor:pointer;font:inherit;text-align:left}.mu .qi:hover{background:var(--surface2)}.mu .qi .n{flex:none;width:22px;text-align:center;color:var(--muted);font-size:13px}.mu .qi.on{color:var(--primary)}.mu .qi.on .n{color:var(--primary)}.mu .qi span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:860px){.mu{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(150px,1fr);overflow:auto}.mu .q{border-left:0;border-top:1px solid var(--outline)}.mu .cover{width:min(260px,64vw,32vh)}}
/* editor */
.ed{display:flex;flex-direction:column;height:100%;min-height:0}.edb{flex:none;display:flex;align-items:center;gap:6px;padding:8px 12px;border-bottom:1px solid var(--outline);background:var(--surface);flex-wrap:wrap}.edb .nm{font-weight:700;margin-right:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:40vw}.edb .lg{color:var(--muted);font-size:12px;background:var(--surface2);padding:2px 8px;border-radius:10px}.edb .sp{flex:1}.edb .st{font-size:12px;color:var(--muted)}
.edb button{height:34px;min-width:34px;padding:0 10px;border:0;border-radius:17px;background:var(--surface2);color:var(--text);font:inherit;font-size:13px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}.edb button:hover{background:var(--outline)}.edb button.pri{background:var(--primary);color:var(--onprimary)}.edb button:disabled{opacity:.45;cursor:default}.edb button.on{color:var(--primary)}
.edw{flex:1;min-height:0;position:relative}.edw .CodeMirror{position:absolute;inset:0;height:100%;font:13px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--bg);color:var(--text)}
.cm-s-ls .CodeMirror-gutters{background:var(--surface);border-right:1px solid var(--outline)}.cm-s-ls .CodeMirror-linenumber{color:var(--muted)}.cm-s-ls .CodeMirror-cursor{border-left:2px solid var(--primary)}.cm-s-ls .CodeMirror-activeline-background{background:rgba(255,255,255,.05)}
.cm-s-ls .CodeMirror-selected{background:rgba(255,214,10,.22)!important}.cm-s-ls .CodeMirror-matchingbracket{color:var(--primary)!important;outline:1px solid var(--primary)}
.cm-s-ls .cm-keyword{color:#C792EA}.cm-s-ls .cm-atom,.cm-s-ls .cm-number{color:#F78C6C}.cm-s-ls .cm-def,.cm-s-ls .cm-variable-2{color:#82AAFF}.cm-s-ls .cm-variable-3,.cm-s-ls .cm-type{color:#FFCB6B}.cm-s-ls .cm-string,.cm-s-ls .cm-string-2{color:#C3E88D}.cm-s-ls .cm-comment{color:#6E7681;font-style:italic}.cm-s-ls .cm-builtin,.cm-s-ls .cm-property{color:#89DDFF}.cm-s-ls .cm-operator{color:#89DDFF}.cm-s-ls .cm-tag{color:#F07178}.cm-s-ls .cm-attribute{color:#FFCB6B}.cm-s-ls .cm-meta{color:#FFCB6B}.cm-s-ls .cm-header{color:var(--primary)}.cm-s-ls .cm-link{color:#82AAFF}.cm-s-ls .cm-error{color:#F07178}
.CodeMirror-dialog{background:var(--surface2)!important;color:var(--text)}.CodeMirror-dialog input{background:var(--bg)!important;color:var(--text)!important;border:1px solid var(--outline)!important;border-radius:6px;padding:2px 6px}
.wnote{padding:10px 14px;color:var(--muted);font-size:13px}
/* docx */
.dx{align-items:center;background:var(--surface2);padding:18px 10px 40px}.dx .dtb{position:sticky;top:0;z-index:2;display:flex;gap:6px;align-items:center;margin-bottom:12px;padding:6px 10px;border-radius:20px;background:var(--surface);border:1px solid var(--outline)}.dx .dtb span{margin:0 6px;font-weight:700;max-width:50vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.paper{background:#fff;color:#1b1b1b;width:min(860px,100%);padding:clamp(18px,6vw,72px);border-radius:4px;box-shadow:0 6px 30px rgba(0,0,0,.4);font:16px/1.6 Georgia,"Times New Roman",serif;overflow-wrap:anywhere;transform-origin:top center}
.paper img{max-width:100%;height:auto}.paper table{border-collapse:collapse;max-width:100%}.paper td,.paper th{border:1px solid #bbb;padding:4px 8px}.paper h1,.paper h2,.paper h3{line-height:1.25}.paper a{color:#1a56c4}
/* pdf, image */
.wp iframe{flex:1;width:100%;border:0;background:#fff}.im{align-items:center;justify-content:center;background:#050505}.im img{max-width:100%;max-height:100%;object-fit:contain;cursor:zoom-in}.im.z{align-items:flex-start;justify-content:flex-start}.im.z img{max-width:none;max-height:none;cursor:zoom-out}
.im .nv{position:absolute;top:50%;width:46px;height:46px;margin-top:-23px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;display:grid;place-items:center;cursor:pointer}.im .nv.l{left:10px}.im .nv.r{right:10px}
.wldr{margin:auto;color:var(--muted)}
`;
const st=D.createElement("style");st.textContent=css;D.head.appendChild(st);
D.body.insertAdjacentHTML("beforeend",'<div id="ws" class="hide" role="dialog" aria-label="Open files"><div id="wst"><button id="wmin" aria-label="Back to files" title="Back to files">'+ic(I.back)+'</button><div id="wtabs" role="tablist"></div></div><div id="wsb"></div></div><button id="wsd" class="hide" aria-label="Open tabs"></button><div id="mp" class="hide" role="region" aria-label="Music player"></div>');
const ws=Q("#ws"),tabsEl=Q("#wtabs"),body=Q("#wsb"),dock=Q("#wsd"),mp=Q("#mp");
const kicon={video:I.film,audio:I.music,text:I.code,docx:I.doc,pdf:I.doc,image:I.img};
const fu=(p,dl)=>"/api/file?path="+encodeURIComponent(p)+(dl?"&dl=1":"");
const ext=n=>(n.match(/\.([^.]+)$/)||[,""])[1].toLowerCase();
const mm=t=>{if(!isFinite(t))return"0:00";t=Math.floor(t);const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return(h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s).padStart(2,"0")};
const mk=(tag,cls,html)=>{const e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const base=n=>n.replace(/\.[^.]+$/,"");
const warn=t=>{try{toast(t)}catch(e){}};
const getStore=k=>{try{return localStorage.getItem(k)}catch(e){return null}},setStore=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function lazy(src,test){return new Promise((ok,no)=>{if(test()){ok();return}const s=D.createElement("script");s.src=src;s.onload=ok;s.onerror=()=>no(new Error("Could not load "+src));D.head.appendChild(s)})}

/* ---------- tab model ---------- */
const tabs=[];let active=null,pushed=false;
const findTab=key=>tabs.find(t=>t.key===key);
function renderTabs(){
  tabsEl.innerHTML="";
  tabs.forEach(t=>{
    const b=mk("div","wtab"+(t.key==="audio"&&A.playing?" pl":""));b.setAttribute("role","tab");b.tabIndex=0;b.setAttribute("aria-selected",t===active);b.title=t.title;
    b.innerHTML=ic(kicon[t.k]||I.doc,18)+"<span></span>"+(t.dirty?"<i title=\"Unsaved changes\"></i>":"")+'<b role="button" aria-label="Close tab">'+ic(I.x,14)+"</b>";
    b.querySelector("span").textContent=t.title;
    b.onclick=ev=>{if(ev.target.closest("b"))closeTab(t);else activate(t)};
    b.onauxclick=ev=>{if(ev.button===1)closeTab(t)};
    b.onkeydown=ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();activate(t)}};
    tabsEl.appendChild(b);if(t===active)b.scrollIntoView({inline:"nearest",block:"nearest"});
  });
  dock.innerHTML=ic(I.list,20)+"<span>"+tabs.length+" open</span>";
  const want=tabs.length>0&&ws.classList.contains("hide");dock.classList.toggle("hide",!want);
}
function activate(t){
  if(active&&active!==t&&active.onhide)active.onhide();
  active=t;tabs.forEach(x=>x.pane.classList.toggle("on",x===t));if(t.onshow)t.onshow();
  renderTabs();syncMini();
}
function closeTab(t){
  if(t.dirty&&!confirm("Close "+t.title+" without saving your changes?"))return;
  if(t.onclose)t.onclose();
  const i=tabs.indexOf(t);tabs.splice(i,1);t.pane.remove();
  if(active===t){active=null;if(tabs.length)activate(tabs[Math.min(i,tabs.length-1)]);else{hideWs();renderTabs()}}
  else renderTabs();
  syncMini();
}
function showWs(){
  ws.classList.remove("hide");D.body.style.overflow="hidden";
  if(!pushed){try{history.pushState({ws:1},"");pushed=true}catch(e){}}
  renderTabs();syncMini();
}
function hideWs(fromPop){
  ws.classList.add("hide");D.body.style.overflow="";
  if(active&&active.onhide)active.onhide();
  if(pushed&&!fromPop){pushed=false;try{if(history.state&&history.state.ws)history.back()}catch(e){}}else pushed=false;
  renderTabs();syncMini();
}
addEventListener("popstate",()=>{if(pushed&&!ws.classList.contains("hide")){pushed=false;hideWs(true)}});
Q("#wmin").onclick=()=>hideWs();dock.onclick=showWs;
addEventListener("beforeunload",ev=>{if(tabs.some(t=>t.dirty)){ev.preventDefault();ev.returnValue=""}});
function addTab(key,k,title,pane){
  const t={key,k,title,pane};tabs.push(t);pane.classList.add("wp");body.appendChild(pane);return t;
}
function siblings(kinds){
  try{return(shown||[]).filter(x=>!x.d&&kinds.includes(x.k)).map(x=>({n:x.n,k:x.k,s:x.s||0,p:join(cur,x.n)}))}catch(e){return[]}
}
/* open(e) is called from the file list. opts.edit opens text files straight in the editor. */
function open(e,opts){
  if(!e||e.d||!KINDS.includes(e.k))return false;
  const p=join(cur,e.n);
  if(e.k==="audio"){playAudio(e.n,p,siblings(["audio"]));let t=findTab("audio");if(!t)t=musicTab();showWs();activate(t);return true}
  let t=findTab(p);
  if(!t){
    t=e.k==="video"?videoTab(e,p):e.k==="text"?textTab(e,p):e.k==="docx"?docxTab(e,p):e.k==="pdf"?pdfTab(e,p):imageTab(e,p);
  }
  showWs();activate(t);return true;
}

/* ---------- music engine ---------- */
const A=new Audio();A.preload="metadata";
Object.assign(A,{q:[],i:-1,shuf:false,rep:0,vol:+(getStore("ls_vol")||1),meta:{}});
Object.defineProperty(A,"playing",{get(){return !A.paused&&!A.ended}});
A.volume=A.vol;
const nameOf=n=>{const b=base(n).replace(/[_]+/g," ");const m=b.match(/^(.+?)\s+-\s+(.+)$/);return m?{artist:m[1],title:m[2]}:{artist:"",title:b}};
function playAudio(n,p,list){
  const q=list.length?list:[{n,p}];A.q=q;A.i=Math.max(0,q.findIndex(x=>x.p===p));load();
}
function load(){
  const it=A.q[A.i];if(!it)return;A.src=fu(it.p);A.meta=Object.assign({cover:null,album:""},nameOf(it.n));
  A.play().catch(()=>{});getMeta(it);mediaSession();refreshAudio();
}
function order(d){
  if(A.shuf&&A.q.length>1){let j;do{j=Math.floor(Math.random()*A.q.length)}while(j===A.i);return j}
  return A.i+d;
}
function nextTrack(auto){
  if(auto&&A.rep===2){A.currentTime=0;A.play();return}
  let j=order(1);if(j>=A.q.length){if(A.rep===1||!auto)j=0;else{refreshAudio();return}}
  A.i=j;load();
}
function prevTrack(){if(A.currentTime>3){A.currentTime=0;return}let j=A.shuf?order(-1):A.i-1;if(j<0)j=A.q.length-1;A.i=j;load()}
A.addEventListener("ended",()=>nextTrack(true));
["play","pause","timeupdate","loadedmetadata","durationchange"].forEach(ev=>A.addEventListener(ev,()=>{refreshAudio(ev==="timeupdate");if(ev==="play"||ev==="pause")renderTabs()}));
function parseID3(buf){
  const v=new DataView(buf),u=new Uint8Array(buf);if(u[0]!==73||u[1]!==68||u[2]!==51)return{};
  const ver=u[3],size=((u[6]&127)<<21)|((u[7]&127)<<14)|((u[8]&127)<<7)|(u[9]&127),out={};let o=10;const end=Math.min(buf.byteLength,10+size);
  const text=(a,b)=>{const enc=u[a];let s=a+1,bytes=u.subarray(s,b);try{return new TextDecoder(enc===1?"utf-16":enc===2?"utf-16be":enc===3?"utf-8":"iso-8859-1").decode(bytes).replace(/\0+$/,"").replace(/^\uFEFF/,"")}catch(e){return""}};
  while(o+10<=end){
    const id=String.fromCharCode(u[o],u[o+1],u[o+2],u[o+3]);if(!/^[A-Z0-9]{4}$/.test(id))break;
    const sz=ver===4?((u[o+4]&127)<<21)|((u[o+5]&127)<<14)|((u[o+6]&127)<<7)|(u[o+7]&127):v.getUint32(o+4),a=o+10,b=a+sz;if(sz<=0||b>end)break;
    if(id==="TIT2")out.title=text(a,b);else if(id==="TPE1")out.artist=text(a,b);else if(id==="TALB")out.album=text(a,b);
    else if(id==="APIC"&&!out.pic){
      const enc=u[a];let i=a+1;while(i<b&&u[i]!==0)i++;const mime=String.fromCharCode(...u.subarray(a+1,i));i++;i++; // type
      if(enc===1||enc===2){while(i+1<b&&!(u[i]===0&&u[i+1]===0))i+=2;i+=2}else{while(i<b&&u[i]!==0)i++;i++}
      if(i<b)out.pic=new Blob([u.subarray(i,b)],{type:/png/i.test(mime)?"image/png":"image/jpeg"});
    }
    o=b;
  }
  return out;
}
async function getMeta(it){
  if(ext(it.n)!=="mp3")return;
  try{
    const r=await fetch(fu(it.p),{headers:{Range:"bytes=0-1999999"}});if(!r.ok&&r.status!==206)return;
    const m=parseID3(await r.arrayBuffer());if(A.q[A.i]!==it)return;
    if(m.title)A.meta.title=m.title;if(m.artist)A.meta.artist=m.artist;if(m.album)A.meta.album=m.album;
    if(m.pic){if(A.meta.cover)URL.revokeObjectURL(A.meta.cover);A.meta.cover=URL.createObjectURL(m.pic)}
    refreshAudio();mediaSession();
  }catch(e){}
}
function mediaSession(){
  if(!("mediaSession" in navigator))return;
  try{
    const m=A.meta||{};navigator.mediaSession.metadata=new MediaMetadata({title:m.title||"",artist:m.artist||"",album:m.album||"LocalShare",artwork:m.cover?[{src:m.cover,sizes:"512x512"}]:[]});
    navigator.mediaSession.setActionHandler("play",()=>A.play());navigator.mediaSession.setActionHandler("pause",()=>A.pause());
    navigator.mediaSession.setActionHandler("nexttrack",()=>nextTrack(false));navigator.mediaSession.setActionHandler("previoustrack",prevTrack);
    navigator.mediaSession.setActionHandler("seekto",d=>{if(d.seekTime!=null)A.currentTime=d.seekTime});
  }catch(e){}
}
/* mini bar */
function syncMini(){
  const hasTrack=A.q.length>0&&A.i>=0,musicVisible=!ws.classList.contains("hide")&&active&&active.key==="audio";
  const show=hasTrack&&!musicVisible;mp.classList.toggle("hide",!show);D.body.classList.toggle("mpOn",show);
  ws.classList.toggle("mp",show&&!ws.classList.contains("hide"));
  if(show)paintMini();
}
function paintMini(){
  const m=A.meta||{};
  if(!mp.firstChild){
    mp.innerHTML='<div class="art" role="button" aria-label="Open music tab"></div><div class="tx" role="button"><b></b><small></small></div><button class="pv" aria-label="Previous">'+ic(I.prev)+'</button><button class="pp" aria-label="Play or pause"></button><button class="nx" aria-label="Next">'+ic(I.next)+'</button><button class="cl" aria-label="Stop and close">'+ic(I.x,18)+'</button><div class="bar"><i></i></div>';
    const go=()=>{let t=findTab("audio");if(!t)t=musicTab();showWs();activate(t)};
    mp.querySelector(".art").onclick=go;mp.querySelector(".tx").onclick=go;
    mp.querySelector(".pv").onclick=prevTrack;mp.querySelector(".nx").onclick=()=>nextTrack(false);
    mp.querySelector(".pp").onclick=()=>A.playing?A.pause():A.play();
    mp.querySelector(".cl").onclick=()=>{A.pause();A.removeAttribute("src");A.load();A.q=[];A.i=-1;const t=findTab("audio");if(t)closeTab(t);syncMini()};
  }
  const art=mp.querySelector(".art");art.innerHTML=m.cover?'<img alt="" src="'+m.cover+'">':ic(I.music,24);
  mp.querySelector("b").textContent=m.title||"";mp.querySelector("small").textContent=m.artist||(A.q[A.i]?"":"");
  mp.querySelector(".pp").innerHTML=ic(A.playing?I.pause:I.play);
  mp.querySelector(".bar i").style.width=(A.duration?A.currentTime/A.duration*100:0)+"%";
}
function refreshAudio(light){
  if(!mp.classList.contains("hide")){if(light)paintMini();else syncMini()}else if(!light)syncMini();
  const t=findTab("audio");if(t&&t.paint)t.paint(light);
}
function musicTab(){
  const pane=mk("div","mu"),t=addTab("audio","audio","Music",pane);
  pane.innerHTML='<div class="now"><div class="cover"></div><div class="meta"><h2></h2><p></p></div><div class="seek"><span class="a">0:00</span><input type="range" min="0" max="1000" value="0" aria-label="Seek"><span class="b">0:00</span></div><div class="ctl"><button class="sh" aria-label="Shuffle">'+ic(I.shuf)+'</button><button class="pv" aria-label="Previous">'+ic(I.prev,28)+'</button><button class="big" aria-label="Play or pause"></button><button class="nx" aria-label="Next">'+ic(I.next,28)+'</button><button class="rp" aria-label="Repeat">'+ic(I.rep)+'</button></div><div class="vol">'+ic(I.vol,18)+'<input type="range" min="0" max="100" aria-label="Volume"></div></div><div class="q"><h3>Queue</h3><div class="ql"></div></div>';
  const $=s=>pane.querySelector(s),seek=$(".seek input");let drag=false;
  $(".big").onclick=()=>A.playing?A.pause():A.play();$(".pv").onclick=prevTrack;$(".nx").onclick=()=>nextTrack(false);
  $(".sh").onclick=()=>{A.shuf=!A.shuf;t.paint()};$(".rp").onclick=()=>{A.rep=(A.rep+1)%3;t.paint()};
  seek.oninput=()=>{drag=true;if(A.duration)$(".a").textContent=mm(seek.value/1000*A.duration)};seek.onchange=()=>{if(A.duration)A.currentTime=seek.value/1000*A.duration;drag=false};
  const vol=$(".vol input");vol.value=Math.round(A.volume*100);vol.oninput=()=>{A.volume=vol.value/100;setStore("ls_vol",String(A.volume))};
  let qk="";
  t.paint=light=>{
    const m=A.meta||{},cv=$(".cover");
    if(!light){
      cv.classList.toggle("pl",A.playing);cv.innerHTML=m.cover?'<img alt="" src="'+m.cover+'">':ic(I.music,110);
      $("h2").textContent=m.title||"Nothing playing";$("p").textContent=[m.artist,m.album].filter(Boolean).join(" · ")||(A.q.length?"Track "+(A.i+1)+" of "+A.q.length:"");
      $(".big").innerHTML=ic(A.playing?I.pause:I.play,32);$(".sh").classList.toggle("on",A.shuf);$(".rp").classList.toggle("on",A.rep>0);
      $(".rp").title=["Repeat off","Repeat all","Repeat one"][A.rep];$(".sh").title=A.shuf?"Shuffle on":"Shuffle off";
      const key=A.q.map(x=>x.p).join("|")+"#"+A.i;
      if(key!==qk){qk=key;const ql=$(".ql");ql.innerHTML="";A.q.forEach((x,i)=>{const b=mk("button","qi"+(i===A.i?" on":""),'<span class="n">'+(i===A.i?"▶":i+1)+"</span><span></span>");b.lastChild.textContent=base(x.n);b.onclick=()=>{A.i=i;load()};ql.appendChild(b)});const on=ql.querySelector(".on");if(on)on.scrollIntoView({block:"nearest"})}
    }
    if(!drag&&A.duration){seek.value=Math.round(A.currentTime/A.duration*1000);$(".a").textContent=mm(A.currentTime);$(".b").textContent=mm(A.duration)}
  };
  t.onshow=()=>{t.paint()};t.onhide=()=>{};
  t.onclose=()=>{};
  t.paint();return t;
}

/* ---------- video tab (YouTube style) ---------- */
function videoTab(e,p){
  const pane=mk("div"),t=addTab(p,"video",e.n,pane);
  const list=siblings(["video"]);
  const v=mk("video");v.playsInline=true;v.preload="auto";v.autoplay=true;v.src=fu(p);
  const w=mk("div","vw");
  const vp=mk("div","vp");
  vp.innerHTML='<div class="vbig"><i></i></div><div class="vc"><div class="vprog" aria-label="Seek"><div class="tr"><div class="bf"></div><div class="pl"></div><div class="kn"></div></div><div class="tp">0:00</div></div><div class="vrow"><button class="pp" aria-label="Play or pause"></button><button class="nx" aria-label="Next video">'+ic(I.next)+'</button><span class="vv"><button class="mu2" aria-label="Mute"></button><input type="range" min="0" max="100" aria-label="Volume"></span><span class="tm">0:00 / 0:00</span><span class="sp"></span><button class="cc" aria-label="Subtitles" hidden>'+ic(I.cc)+'</button><button class="gr" aria-label="Settings">'+ic(I.gear)+'</button><button class="th" aria-label="Theatre mode" title="Theatre mode (t)">'+ic(I.theatre)+'</button><button class="pi" aria-label="Picture in picture" title="Picture in picture (i)">'+ic(I.pip)+'</button><button class="fs" aria-label="Fullscreen" title="Fullscreen (f)">'+ic(I.full)+"</button></div></div>";
  vp.insertBefore(v,vp.firstChild);
  const info=mk("div","vinfo");info.innerHTML='<h2></h2><div class="vm"><span class="sz"></span><button class="chip lp">Loop</button><a class="chip dl">'+ic(I.dl,16)+' Download</a></div>';
  info.querySelector("h2").textContent=base(e.n);info.querySelector(".sz").textContent=(e.s?fmtSize(e.s):"")+" · "+ext(e.n).toUpperCase();
  const dl=info.querySelector(".dl");dl.href=fu(p,1);dl.setAttribute("download",e.n);
  const main=mk("div");main.append(vp,info);
  const nx=mk("div","vnext");nx.innerHTML='<h3>Up next</h3><label><input type="checkbox"> Play next automatically</label><div class="vl"></div>';
  const ap=nx.querySelector("input");ap.checked=getStore("ls_ap")!=="0";ap.onchange=()=>setStore("ls_ap",ap.checked?"1":"0");
  const vl=nx.querySelector(".vl");
  list.forEach(x=>{
    const b=mk("button","vit"+(x.p===p?" on":""),'<div class="th2"></div><span></span>');
    b.querySelector("span").textContent=base(x.n);const sm=mk("small",null,x.s?fmtSize(x.s):"");b.querySelector("span").appendChild(sm);
    const th=b.querySelector(".th2");th.style.backgroundImage='url("/api/thumb?path='+encodeURIComponent(x.p)+'&w=320")';
    b.onclick=()=>{if(x.p===p)return;open({n:x.n,k:"video",s:x.s,d:false})};vl.appendChild(b);
  });
  w.append(main,nx);pane.appendChild(w);
  const $=s=>vp.querySelector(s),pp=$(".pp"),prog=$(".vprog"),big=$(".vbig i");
  const setPP=()=>{pp.innerHTML=ic(v.paused?I.play:I.pause,26)};setPP();
  const flash=txt=>{big.textContent="";big.innerHTML=txt;big.classList.remove("go");void big.offsetWidth;big.classList.add("go")};
  const toggle=()=>{if(v.paused){v.play().catch(()=>{});flash(ic(I.play,30))}else{v.pause();flash(ic(I.pause,30))}};
  pp.onclick=ev=>{ev.stopPropagation();toggle()};
  let hide=0;const wake=()=>{vp.classList.remove("nc");clearTimeout(hide);if(!v.paused)hide=setTimeout(()=>vp.classList.add("nc"),2600)};
  vp.addEventListener("mousemove",wake);vp.addEventListener("touchstart",wake,{passive:true});vp.addEventListener("mouseleave",()=>{if(!v.paused)vp.classList.add("nc")});
  v.addEventListener("play",()=>{setPP();wake();A.pause();renderTabs()});v.addEventListener("pause",()=>{setPP();vp.classList.remove("nc")});
  const tmEl=$(".tm"),pl=$(".pl"),bf=$(".bf"),kn=$(".kn");
  const upd=()=>{const d=v.duration||0,c=v.currentTime||0;tmEl.textContent=mm(c)+" / "+mm(d);const pc=d?c/d*100:0;pl.style.width=pc+"%";kn.style.left=pc+"%";
    if(v.buffered.length&&d){let e2=0;for(let i=0;i<v.buffered.length;i++)if(v.buffered.start(i)<=c&&v.buffered.end(i)>=c)e2=v.buffered.end(i);bf.style.width=(e2/d*100)+"%"}};
  v.addEventListener("timeupdate",upd);v.addEventListener("progress",upd);v.addEventListener("loadedmetadata",upd);
  // seek bar
  const seekTo=ev=>{const r=prog.getBoundingClientRect(),f=Math.min(1,Math.max(0,(ev.clientX-r.left)/r.width));return f};
  prog.addEventListener("pointermove",ev=>{const f=seekTo(ev),tp=$(".tp");tp.textContent=mm(f*(v.duration||0));tp.style.left=(f*prog.clientWidth)+"px"});
  prog.addEventListener("pointerdown",ev=>{ev.stopPropagation();prog.setPointerCapture(ev.pointerId);prog.classList.add("dr");if(v.duration)v.currentTime=seekTo(ev)*v.duration;
    const mv=e3=>{if(v.duration)v.currentTime=seekTo(e3)*v.duration},up=()=>{prog.classList.remove("dr");prog.removeEventListener("pointermove",mv);prog.removeEventListener("pointerup",up)};
    prog.addEventListener("pointermove",mv);prog.addEventListener("pointerup",up)});
  // volume
  const vin=$(".vv input"),mu=$(".mu2");const volIcon=()=>{mu.innerHTML=ic(v.muted||v.volume===0?I.mute:I.vol,22)};
  v.volume=A.vol;vin.value=Math.round(v.volume*100);volIcon();
  vin.oninput=()=>{v.volume=vin.value/100;v.muted=v.volume===0;volIcon()};mu.onclick=ev=>{ev.stopPropagation();v.muted=!v.muted;volIcon()};v.addEventListener("volumechange",()=>{vin.value=v.muted?0:Math.round(v.volume*100);volIcon()});
  // next
  const idx=list.findIndex(x=>x.p===p),nextV=()=>{const n2=list[idx+1];if(n2)open({n:n2.n,k:"video",s:n2.s,d:false})};
  const nb=$(".nx");nb.onclick=ev=>{ev.stopPropagation();nextV()};nb.hidden=!list[idx+1];
  // resume
  const key="ls_pos:"+p+":"+(e.s||0),saved=parseFloat(getStore(key)||"0")||0;
  v.addEventListener("loadedmetadata",()=>{if(saved>5&&v.duration&&saved<v.duration-10){v.currentTime=saved;warn("Continuing from "+mm(saved))}});
  let last=0;const save=()=>{if(!v.duration)return;const c=v.currentTime;setStore(key,c>5&&c<v.duration-10?String(Math.floor(c)):"")};
  v.addEventListener("timeupdate",()=>{const n3=Date.now();if(n3-last>5000){last=n3;save()}});v.addEventListener("pause",save);
  v.addEventListener("ended",()=>{setStore(key,"");setPP();if(ap.checked)nextV()});
  // buttons
  const lp=info.querySelector(".lp");lp.onclick=()=>{v.loop=!v.loop;lp.classList.toggle("on",v.loop)};
  const th=$(".th"),fs=$(".fs"),pi=$(".pi");
  const theatre=()=>{w.classList.toggle("th");th.classList.toggle("on",w.classList.contains("th"))};th.onclick=ev=>{ev.stopPropagation();theatre()};
  const full=()=>{if(D.fullscreenElement)D.exitFullscreen();else if(vp.requestFullscreen)vp.requestFullscreen().catch(()=>{});else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen()};fs.onclick=ev=>{ev.stopPropagation();full()};
  const pip=async()=>{try{if(D.pictureInPictureElement)await D.exitPictureInPicture();else await v.requestPictureInPicture()}catch(x){warn("Picture in picture is not available here")}};
  if(!D.pictureInPictureEnabled)pi.hidden=true;pi.onclick=ev=>{ev.stopPropagation();pip()};
  // settings menu (speed)
  let menu=null;const closeMenu=()=>{if(menu){menu.remove();menu=null}};
  $(".gr").onclick=ev=>{ev.stopPropagation();if(menu){closeMenu();return}menu=mk("div","vmenu");
    [.5,.75,1,1.25,1.5,1.75,2].forEach(r=>{const b=mk("button",v.playbackRate===r?"on":"",r===1?"Normal speed":r+"×");b.onclick=e4=>{e4.stopPropagation();v.playbackRate=r;closeMenu()};menu.appendChild(b)});vp.appendChild(menu)};
  vp.addEventListener("click",ev=>{if(menu&&!ev.target.closest(".vmenu")&&!ev.target.closest(".gr"))closeMenu()});
  // subtitles (.srt/.vtt next to the video)
  const ccb=$(".cc");let tracks=[],showCC=true;
  (async()=>{const b0=base(e.n).toLowerCase();let first=true;
    for(const x of (typeof entries!=="undefined"?entries:[])){const n=x.n.toLowerCase();
      if(x.d||!/\.(srt|vtt)$/.test(n)||!n.startsWith(b0+".")||(x.s||0)>2e6)continue;
      try{const r=await fetch(fu(join(cur,x.n)));if(!r.ok)continue;let tx=(await r.text()).replace(/^\uFEFF/,"").replace(/\r/g,"");
        if(!/^WEBVTT/.test(tx))tx="WEBVTT\n\n"+tx.replace(/(\d\d:\d\d:\d\d),(\d{3})/g,"$1.$2");
        const tr=D.createElement("track");tr.kind="subtitles";tr.label=n.slice(b0.length+1).replace(/\.(srt|vtt)$/,"")||"Subtitles";tr.src=URL.createObjectURL(new Blob([tx],{type:"text/vtt"}));if(first)tr.default=true;first=false;v.appendChild(tr);tracks.push(tr);if(tr.default&&tr.track)tr.track.mode="showing";ccb.hidden=false;
      }catch(x2){}}})();
  ccb.onclick=ev=>{ev.stopPropagation();showCC=!showCC;[...v.textTracks].forEach((tt,i)=>tt.mode=showCC&&i===0?"showing":"hidden");ccb.classList.toggle("on",showCC)};ccb.classList.add("on");
  // gestures: click toggles play, double click seeks or goes fullscreen
  let ct=0,lastX=0;
  vp.addEventListener("click",ev=>{if(ev.target.closest(".vc")||ev.target.closest(".vmenu"))return;
    const now=Date.now();if(now-ct<280){clearTimeout(vp._t);ct=0;const r=vp.getBoundingClientRect(),f=(ev.clientX-r.left)/r.width;
      if(f<.33){v.currentTime=Math.max(0,v.currentTime-10);flash("−10")}else if(f>.66){v.currentTime=Math.min(v.duration||1e9,v.currentTime+10);flash("+10")}else full();return}
    ct=now;vp._t=setTimeout(toggle,260)});
  // keyboard (only while this tab is showing and nothing is being typed)
  t.key2=ev=>{
    if(active!==t||ws.classList.contains("hide"))return;const tg=ev.target;if(tg&&(tg.tagName==="INPUT"&&tg.type!=="range"||tg.tagName==="TEXTAREA"))return;
    const k=ev.key;let used=true;
    if(k===" "||k==="k"||k==="K")toggle();else if(k==="ArrowLeft"||k==="j"||k==="J"){v.currentTime=Math.max(0,v.currentTime-(k==="ArrowLeft"?5:10));flash("−"+(k==="ArrowLeft"?5:10))}
    else if(k==="ArrowRight"||k==="l"||k==="L"){v.currentTime=Math.min(v.duration||1e9,v.currentTime+(k==="ArrowRight"?5:10));flash("+"+(k==="ArrowRight"?5:10))}
    else if(k==="ArrowUp"){v.volume=Math.min(1,v.volume+.05)}else if(k==="ArrowDown"){v.volume=Math.max(0,v.volume-.05)}
    else if(k==="m"||k==="M"){v.muted=!v.muted}else if(k==="f"||k==="F")full();else if(k==="t"||k==="T")theatre();else if(k==="i"||k==="I")pip();
    else if(k==="N"&&ev.shiftKey)nextV();else if(k===">"){v.playbackRate=Math.min(2,v.playbackRate+.25);flash(v.playbackRate+"×")}else if(k==="<"){v.playbackRate=Math.max(.25,v.playbackRate-.25);flash(v.playbackRate+"×")}
    else if(/^[0-9]$/.test(k)&&v.duration)v.currentTime=v.duration*(+k/10);else used=false;
    if(used){ev.preventDefault();ev.stopPropagation()}
  };
  t.onhide=()=>{if(!D.pictureInPictureElement&&!D.fullscreenElement)v.pause()};
  t.onclose=()=>{save();v.pause();v.removeAttribute("src");v.load();tracks.forEach(x=>URL.revokeObjectURL(x.src))};
  t.onshow=()=>{A.pause()};
  return t;
}
const fmtSize=n=>n<1024?n+" B":n<1048576?(n/1024).toFixed(0)+" KB":n<1073741824?(n/1048576).toFixed(1)+" MB":(n/1073741824).toFixed(2)+" GB";

/* ---------- text and code tab ---------- */
const MODES={py:"python",c:"text/x-csrc",h:"text/x-csrc",cpp:"text/x-c++src",cc:"text/x-c++src",cxx:"text/x-c++src",hpp:"text/x-c++src",hh:"text/x-c++src",hxx:"text/x-c++src",java:"text/x-java",cs:"text/x-csharp",kt:"text/x-kotlin",kts:"text/x-kotlin",scala:"text/x-scala",m:"text/x-objectivec",mm:"text/x-objectivec",
 js:"javascript",mjs:"javascript",cjs:"javascript",jsx:"javascript",ts:"text/typescript",tsx:"text/typescript",json:"application/json",css:"css",scss:"text/x-scss",less:"text/x-less",html:"htmlmixed",htm:"htmlmixed",vue:"htmlmixed",xml:"xml",svg:"xml",md:"markdown",
 sh:"shell",bat:"shell",go:"go",rs:"rust",sql:"text/x-sql",php:"php",rb:"ruby",swift:"swift",lua:"lua",yml:"yaml",yaml:"yaml",toml:"toml",pl:"perl",r:"r",dart:"dart",ps1:"powershell",cmake:"cmake",properties:"properties",ini:"properties",cfg:"properties",conf:"properties",diff:"diff",patch:"diff",gradle:"text/x-java"};
const LANG={py:"Python",c:"C",h:"C header",cpp:"C++",cc:"C++",cxx:"C++",hpp:"C++ header",java:"Java",cs:"C#",kt:"Kotlin",kts:"Kotlin",scala:"Scala",js:"JavaScript",mjs:"JavaScript",jsx:"JSX",ts:"TypeScript",tsx:"TSX",json:"JSON",css:"CSS",scss:"SCSS",less:"LESS",html:"HTML",htm:"HTML",vue:"Vue",xml:"XML",svg:"SVG",md:"Markdown",sh:"Shell",bat:"Batch",go:"Go",rs:"Rust",sql:"SQL",php:"PHP",rb:"Ruby",swift:"Swift",lua:"Lua",yml:"YAML",yaml:"YAML",toml:"TOML",pl:"Perl",r:"R",dart:"Dart",ps1:"PowerShell",txt:"Text",log:"Log",csv:"CSV",srt:"Subtitles",vtt:"Subtitles"};
function textTab(e,p){
  const pane=mk("div"),t=addTab(p,"text",e.n,pane);
  const can=!!(typeof INFO!=="undefined"&&INFO.canEdit)&&e.s<=524288;
  pane.innerHTML='<div class="ed"><div class="edb"><span class="nm"></span><span class="lg"></span><span class="st"></span><span class="sp"></span><button class="fd" aria-label="Find" title="Find (Ctrl+F)">'+ic(I.find,18)+'</button><button class="wr" aria-label="Wrap lines" title="Wrap lines">'+ic(I.wrap,18)+'</button><button class="fa" aria-label="Smaller text">A−</button><button class="fb" aria-label="Bigger text">A+</button><a class="chipx"></a>'+(can?'<button class="pri sv" disabled>'+ic(I.save,18)+" Save</button>":"")+'</div><div class="edw"><p class="wnote">Loading…</p></div></div>';
  const $=s=>pane.querySelector(s),wrap=$(".edw");
  $(".nm").textContent=e.n;$(".lg").textContent=LANG[ext(e.n)]||"Text";$(".chipx").remove();
  let cm=null,size=14,saved="";
  const status=s=>{$(".st").textContent=s};
  const setDirty=d=>{if(t.dirty!==d){t.dirty=d;renderTabs()}const b=$(".sv");if(b)b.disabled=!d;status(can?(d?"Unsaved changes":"Saved"):"Read only")};
  const fontSz=()=>{wrap.querySelector(".CodeMirror").style.fontSize=size+"px";cm.refresh()};
  Promise.all([lazy("/static/cm.js?v=1",()=>window.CodeMirror),(()=>{if(!Q("#cmcss")){const l=mk("link");l.id="cmcss";l.rel="stylesheet";l.href="/static/cm.css?v=1";D.head.appendChild(l)}return Promise.resolve()})()])
  .then(()=>fetch(fu(p),e.s>524288?{headers:{Range:"bytes=0-524287"}}:{}))
  .then(r=>{if(!r.ok&&r.status!==206)throw 0;return r.text()})
  .then(tx=>{
    tx=tx.replace(/^\uFEFF/,"");saved=tx;wrap.innerHTML="";
    const ro=!can;
    cm=CodeMirror(wrap,{value:tx,mode:MODES[ext(e.n)]||null,theme:"ls",lineNumbers:true,lineWrapping:false,matchBrackets:true,autoCloseBrackets:!ro,styleActiveLine:true,indentUnit:4,tabSize:4,indentWithTabs:false,readOnly:ro?(e.s>524288?"nocursor":false):false,foldGutter:true,gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"],extraKeys:{"Ctrl-S":()=>doSave(),"Cmd-S":()=>doSave(),"Ctrl-/":"toggleComment","Cmd-/":"toggleComment","Tab":c=>{if(c.somethingSelected())c.indentSelection("add");else c.replaceSelection("    ","end")},"Shift-Tab":c=>c.indentSelection("subtract")}});
    if(ro)cm.setOption("readOnly",true);
    cm.on("change",()=>{if(can)setDirty(cm.getValue()!==saved)});
    status(can?"Saved":"Read only"+(e.s>524288?" · first 512 KB":""));
    if(e.s>524288){const n=mk("div","wnote","This file is larger than 512 KB, so only the beginning is shown. Download it to see everything.");$(".ed").insertBefore(n,wrap)}
    fontSz();setTimeout(()=>cm.refresh(),30);t.cm=cm;
  }).catch(()=>{wrap.innerHTML='<p class="wnote">Could not open this file.</p>'});
  async function doSave(){
    if(!cm||!can)return;const v=cm.getValue();
    if(new Blob([v]).size>524288){warn("Too long. Text files up to 512 KB can be saved.");return}
    const b=$(".sv");b.disabled=true;status("Saving…");
    try{
      const r=await fetch("/api/save?path="+encodeURIComponent(p),{method:"POST",headers:{"Content-Type":"text/plain; charset=utf-8"},body:v});
      if(r.ok){saved=v;setDirty(false);warn("Saved "+e.n);try{cache.clear()}catch(x){}}
      else{b.disabled=false;status(r.status===403?"The host does not allow editing":"Could not save");warn(r.status===403?"The host does not allow editing":"Could not save")}
    }catch(x){b.disabled=false;status("Connection lost");warn("Connection lost")}
  }
  const sv=$(".sv");if(sv)sv.onclick=doSave;
  $(".fd").onclick=()=>{if(cm){cm.focus();cm.execCommand("findPersistent")}};
  $(".wr").onclick=()=>{if(!cm)return;const on=!cm.getOption("lineWrapping");cm.setOption("lineWrapping",on);$(".wr").classList.toggle("on",on)};
  $(".fa").onclick=()=>{size=Math.max(9,size-1);if(cm)fontSz()};$(".fb").onclick=()=>{size=Math.min(30,size+1);if(cm)fontSz()};
  t.onshow=()=>{if(cm)setTimeout(()=>{cm.refresh();cm.focus()},20)};
  return t;
}

/* ---------- docx tab ---------- */
function clean(html){
  const d=new DOMParser().parseFromString(html,"text/html");
  d.querySelectorAll("script,iframe,object,embed,style,link,meta,form").forEach(x=>x.remove());
  d.querySelectorAll("*").forEach(x=>{[...x.attributes].forEach(a=>{if(/^on/i.test(a.name)||(a.name==="href"&&/^\s*javascript:/i.test(a.value)))x.removeAttribute(a.name)});if(x.tagName==="A"){x.target="_blank";x.rel="noopener"}});
  return d.body.innerHTML;
}
function docxTab(e,p){
  const pane=mk("div","dx"),t=addTab(p,"docx",e.n,pane);
  pane.innerHTML='<div class="dtb"><span></span><button class="chip zo">−</button><button class="chip zi">+</button><a class="chip dl">'+ic(I.dl,16)+' Download</a></div><div class="paper"><p class="wldr">Opening document…</p></div>';
  pane.querySelector("span").textContent=e.n;const dl=pane.querySelector(".dl");dl.href=fu(p,1);dl.setAttribute("download",e.n);
  const paper=pane.querySelector(".paper");let z=1;const apply=()=>{paper.style.fontSize=(16*z)+"px"};
  pane.querySelector(".zo").onclick=()=>{z=Math.max(.6,z-.1);apply()};pane.querySelector(".zi").onclick=()=>{z=Math.min(2.2,z+.1);apply()};
  lazy("/static/mammoth.js?v=1",()=>window.mammoth)
  .then(()=>fetch(fu(p))).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()})
  .then(b=>mammoth.convertToHtml({arrayBuffer:b}))
  .then(r=>{paper.innerHTML=clean(r.value)||'<p class="wldr">This document is empty.</p>'})
  .catch(()=>{paper.innerHTML='<p class="wldr">Could not show this document. Only .docx files (not old .doc) can be shown. You can still download it.</p>'});
  return t;
}

/* ---------- pdf and image tabs ---------- */
function pdfTab(e,p){
  const pane=mk("div"),t=addTab(p,"pdf",e.n,pane);
  const f=mk("iframe");f.title=e.n;f.src="/static/pdfview.html?embed=1&path="+encodeURIComponent(p);pane.appendChild(f);
  t.onclose=()=>{f.src="about:blank"};return t;
}
function imageTab(e,p){
  const pane=mk("div","im"),t=addTab(p,"image",e.n,pane);
  const list=siblings(["image"]);let i=Math.max(0,list.findIndex(x=>x.p===p));
  const img=new Image();img.alt=e.n;pane.appendChild(img);
  const show=()=>{const x=list[i];if(!x)return;img.src=fu(x.p);img.alt=x.n;t.title=x.n;renderTabs()};
  if(list.length>1){
    const l=mk("button","nv l",ic(I.back,24)),r=mk("button","nv r",ic(I.back,24));r.firstChild.style.transform="scaleX(-1)";l.setAttribute("aria-label","Previous picture");r.setAttribute("aria-label","Next picture");
    l.onclick=()=>{i=(i-1+list.length)%list.length;show()};r.onclick=()=>{i=(i+1)%list.length;show()};pane.append(l,r);
    t.key2=ev=>{if(active!==t||ws.classList.contains("hide"))return;if(ev.key==="ArrowLeft"){l.click();ev.preventDefault();ev.stopPropagation()}else if(ev.key==="ArrowRight"){r.click();ev.preventDefault();ev.stopPropagation()}};
  }
  img.onclick=()=>pane.classList.toggle("z");show();return t;
}

/* ---------- keys, then expose ---------- */
addEventListener("keydown",ev=>{
  if(ws.classList.contains("hide"))return;
  if(ev.key==="Escape"&&!(ev.target.closest&&ev.target.closest(".CodeMirror-dialog"))&&!D.fullscreenElement){ev.preventDefault();ev.stopPropagation();hideWs();return}
  if(active&&active.key2)active.key2(ev);
  if((ev.ctrlKey||ev.metaKey)&&ev.key==="w"&&active){ev.preventDefault();closeTab(active)}
  if(ev.altKey&&/^[1-9]$/.test(ev.key)&&tabs[+ev.key-1]){ev.preventDefault();activate(tabs[+ev.key-1])}
},true);
window.WS={open,visible:()=>!ws.classList.contains("hide"),kinds:KINDS};
syncMini();
})();
