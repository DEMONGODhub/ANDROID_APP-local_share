/* LocalShare viewer: opens one file at a time inside the page.
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
 folder:"M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z",plus:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
 zin:"M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2V7z",zout:"M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zM7 9h5v1H7z",
 rot:"M15.55 5.55L11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42A5.93 5.93 0 0 1 17.91 11h2.02zM13 17.9v2.02a7.9 7.9 0 0 0 3.89-1.61l-1.44-1.44A5.9 5.9 0 0 1 13 17.9zm3.89-2.42l1.42 1.42A7.9 7.9 0 0 0 19.93 13h-2.02a5.9 5.9 0 0 1-1.02 2.48z",
 flip:"M15 21h2v-2h-2v2zm4-12h2V7h-2v2zM3 5v14c0 1.1.9 2 2 2h4v-2H5V5h4V3H5c-1.1 0-2 .9-2 2zm16-2v2h2c0-1.1-.9-2-2-2zm-8 20h2V1h-2v22zm8-6h2v-2h-2v2zM15 5h2V3h-2v2zm4 8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2z",
 print:"M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z",
 eye:"M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
 moon:"M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.4 5.4 0 0 1-4.4 2.26 5.4 5.4 0 0 1-5.4-5.4c0-1.81.89-3.42 2.26-4.4A9 9 0 0 0 12 3z",
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
#wtabs{flex:1;min-width:0;display:flex;align-items:center;overflow:hidden}.wtt{flex:1;min-width:0;display:flex;align-items:center;gap:8px;height:40px;margin-bottom:6px;font-weight:600;font-size:15px}.wtt svg{flex:none;color:var(--primary)}.wtt span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wtt i{flex:none;width:8px;height:8px;border-radius:50%;background:var(--primary)}
#wsb{flex:1;min-height:0;position:relative}.wp{position:absolute;inset:0;overflow:auto;overscroll-behavior:contain}.wp:not(.on){display:none!important}.wp.on{display:flex;flex-direction:column}.wp.on.mu{display:grid}
#ws.mp #wsb{padding-bottom:74px}
#prt{display:none}
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

.vmenu{min-width:260px;max-width:min(340px,92%);max-height:78%}.vmenu button{display:flex!important;justify-content:space-between;align-items:center;gap:14px}.vmenu button em{font-style:normal;color:rgba(255,255,255,.6);font-size:13px}
.vmh{display:flex;align-items:center;gap:6px;padding:2px 4px 6px;border-bottom:1px solid rgba(255,255,255,.15);margin-bottom:4px}.vmh button{width:34px!important;height:34px!important;padding:0!important;justify-content:center!important;border-radius:50%!important;flex:none}.vmh b{font-size:14px}
.vsl{display:flex;align-items:center;gap:10px;padding:6px 12px;font-size:13px;color:#fff}.vsl span:first-child{flex:none;min-width:70px}.vsl input{flex:1;min-width:80px;accent-color:var(--primary)}.vsl b{flex:none;min-width:44px;text-align:right;font-weight:600;font-size:12px}.vsl .vd{flex:1;display:flex;gap:6px}.vsl .vd button{padding:4px 8px!important;border-radius:8px!important;background:rgba(255,255,255,.12)!important;font-size:12px!important;display:block!important;width:auto!important}
.vmn{margin:6px 12px;color:rgba(255,255,255,.65);font-size:12.5px;line-height:1.45}
body.mpOn #fab{bottom:calc(max(16px,env(safe-area-inset-bottom)) + 68px)}body.mpOn #arcfab{bottom:calc(max(16px,env(safe-area-inset-bottom)) + 140px)}body.mpOn #totop{bottom:calc(max(20px,env(safe-area-inset-bottom)) + 66px)}
.vnext{background:var(--surface);border:1px solid var(--outline);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;align-self:start;position:sticky;top:12px;max-height:calc(100vh - 130px);padding:0!important}
.vnext .plh{padding:14px 16px 10px;background:var(--surface2);border-bottom:1px solid var(--outline)}.vnext .plh b{display:block;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vnext .plh small{color:var(--muted);font-size:12px}
.vnext label{margin:0;padding:10px 16px;border-bottom:1px solid var(--outline)}.vnext .vl{overflow:auto;padding:6px;flex:1;min-height:0;position:relative}
.vit .num{flex:none;width:22px;align-self:center;text-align:center;color:var(--muted);font-size:12px;font-style:normal}.vit.on .num{color:var(--primary)}
@media(max-width:1000px){.vnext{position:static;max-height:60vh;margin:0 14px}}
body.mpOn #ups{bottom:calc(max(12px,env(safe-area-inset-bottom)) + 68px)}
.win{position:absolute;inset:0;display:none;flex-direction:column;background:var(--bg);min-width:0;min-height:0}.win.on{display:flex}
.win>.wp{position:relative;inset:auto;flex:1;min-height:0}
.fv{position:fixed;right:16px;bottom:96px;width:min(420px,calc(100vw - 24px));z-index:80;background:#000;border:1px solid var(--outline);border-radius:14px;box-shadow:var(--shadow);overflow:hidden}
.fv .fh{display:flex;align-items:center;gap:2px;padding:3px 4px 3px 12px;background:var(--surface2);cursor:move;touch-action:none;user-select:none}
.fv .fh span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:600}
.fv .fh button{width:32px;height:32px;border:0;border-radius:8px;background:none;color:var(--text);font:inherit;font-size:16px;cursor:pointer}.fv .fh button:hover,.fv .fh button:focus-visible{background:var(--bg)}
.fv .vp{border-radius:0;max-height:none}
.fv.pw{position:static;width:100vw;height:100vh;border:0;border-radius:0}.fv.pw .fh{display:none}.fv.pw .vp{height:100%;aspect-ratio:auto}
body.mpOn .fv{bottom:164px}
#wst>button.cfg{margin-left:2px}
#wcp{position:fixed;z-index:60;left:50%;bottom:20px;transform:translateX(-50%);width:min(380px,calc(100vw - 24px));background:var(--surface2);color:var(--text);border:1px solid var(--outline);border-radius:18px;padding:16px;box-shadow:var(--shadow);max-height:80vh;overflow:auto}#wcp.hide{display:none}
#wcp h3{margin:0 0 10px;font-size:16px;display:flex;align-items:center}#wcp h3 button{margin-left:auto}#wcp h4{margin:14px 0 8px;font-size:13px;color:var(--muted);font-weight:600}
#wcp .sw{display:flex;flex-wrap:wrap;gap:10px;align-items:center}#wcp .sw button{width:34px;height:34px;border-radius:50%;border:2px solid var(--outline);cursor:pointer;padding:0}#wcp .sw button.on{border-color:var(--text);box-shadow:0 0 0 2px var(--bg) inset}#wcp .sw input{width:38px;height:34px;border:0;background:none;padding:0}
#wcp .ps{display:grid;grid-template-columns:1fr 1fr;gap:8px}#wcp .ps button,#wcp .cx{height:38px;border-radius:12px;border:1px solid var(--outline);background:var(--bg);color:var(--text);font:inherit;cursor:pointer}#wcp .ps button.on{border-color:var(--primary);color:var(--primary)}#wcp h3 .cx{width:34px;height:34px;border-radius:17px}
/* music tools */
.mu .tools{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.mu .tools button{height:34px;padding:0 14px;border-radius:17px;border:0;background:var(--surface2);color:var(--text);font:inherit;font-size:13px;font-weight:600;cursor:pointer}.mu .tools button.on{background:var(--text);color:var(--bg)}
.mu .tp2{width:min(520px,92vw);background:var(--surface2);border-radius:14px;padding:10px 14px;font-size:13px}.mu .tp2.hide{display:none}.mu .tp2 .row{display:flex;align-items:center;gap:10px;margin:6px 0}.mu .tp2 .row span{flex:none;width:58px;color:var(--muted)}.mu .tp2 .row input{flex:1;accent-color:var(--primary)}.mu .tp2 .row b{flex:none;width:44px;text-align:right}
.mu .tp2 .chips{display:flex;flex-wrap:wrap;gap:6px}.mu .tp2 .chips button{height:32px;padding:0 12px;border-radius:16px;border:1px solid var(--outline);background:var(--bg);color:var(--text);font:inherit;font-size:13px;cursor:pointer}.mu .tp2 .chips button.on{border-color:var(--primary);color:var(--primary)}
/* picture tab tools */
.imb{position:absolute;top:10px;left:50%;transform:translateX(-50%);display:flex;gap:4px;padding:4px;border-radius:24px;background:rgba(20,20,22,.85);border:1px solid rgba(255,255,255,.15);z-index:2;max-width:94%;overflow-x:auto}.imb button{flex:none;width:38px;height:38px;border:0;border-radius:50%;background:none;color:#fff;display:grid;place-items:center;cursor:pointer;font:inherit;font-size:12px}.imb button:hover{background:rgba(255,255,255,.18)}.imb button.on{color:var(--primary)}
.im{overflow:hidden;touch-action:none}.im img{max-width:100%;max-height:100%;transition:transform .15s;user-select:none;-webkit-user-drag:none}.im.g img{transition:none;cursor:grabbing}
/* preview panes in the editor */
.edw .pv{position:absolute;inset:0;overflow:auto;background:#fff;color:#1b1b1b;padding:18px;font:15px/1.6 system-ui,sans-serif}.edw .pv iframe{width:100%;height:100%;border:0;background:#fff;position:absolute;inset:0}
.edw .pv table{border-collapse:collapse;font-size:13px}.edw .pv th,.edw .pv td{border:1px solid #ccc;padding:4px 8px;text-align:left;white-space:nowrap}.edw .pv th{position:sticky;top:-18px;background:#f0f0f0}.edw .pv pre{background:#f4f4f4;padding:10px;border-radius:8px;overflow:auto}.edw .pv code{background:#f4f4f4;padding:1px 4px;border-radius:4px}.edw .pv img{max-width:100%}
.cm-s-ls.light,.edw.light .CodeMirror{background:#fff;color:#1b1b1b}.edw.light .CodeMirror-gutters{background:#f3f3f3;border-color:#ddd}.edw.light .cm-s-ls .CodeMirror-linenumber{color:#888}.edw.light .cm-s-ls .cm-keyword{color:#7c3aed}.edw.light .cm-s-ls .cm-string{color:#15803d}.edw.light .cm-s-ls .cm-comment{color:#6b7280}.edw.light .cm-s-ls .cm-number,.edw.light .cm-s-ls .cm-atom{color:#c2410c}.edw.light .cm-s-ls .cm-def,.edw.light .cm-s-ls .cm-variable-2{color:#1d4ed8}.edw.light .cm-s-ls .cm-property,.edw.light .cm-s-ls .cm-builtin,.edw.light .cm-s-ls .cm-operator{color:#0e7490}.edw.light .cm-s-ls .CodeMirror-activeline-background{background:rgba(0,0,0,.05)}.edw.light .cm-s-ls .CodeMirror-cursor{border-left-color:#000}
.dx.wh .paper{background:#1a1a1c;color:#e6e6e6}.dx.wh .paper a{color:#8ab4ff}.dx.wh .paper td,.dx.wh .paper th{border-color:#444}
@media print{body>*:not(#prt){display:none!important}#prt{display:block!important}}
`;
const st=D.createElement("style");st.textContent=css;D.head.appendChild(st);
D.body.insertAdjacentHTML("beforeend",'<div id="ws" class="hide" role="dialog" aria-label="Open file"><div id="wst"><button id="wmin" aria-label="Back to files" title="Back to files">'+ic(I.back)+'</button><div id="wtabs"></div></div><div id="wsb"></div></div><div id="mp" class="hide" role="region" aria-label="Music player"></div>');
const ws=Q("#ws"),tabsEl=Q("#wtabs"),body=Q("#wsb"),mp=Q("#mp");
const kicon={files:I.folder,video:I.film,audio:I.music,text:I.code,docx:I.doc,pdf:I.doc,image:I.img};
const fu=(p,dl)=>"/api/file?path="+encodeURIComponent(p)+(dl?"&dl=1":"");
const ext=n=>(n.match(/\.([^.]+)$/)||[,""])[1].toLowerCase();
const mm=t=>{if(!isFinite(t))return"0:00";t=Math.floor(t);const h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return(h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s).padStart(2,"0")};
const mk=(tag,cls,html)=>{const e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const base=n=>n.replace(/\.[^.]+$/,"");
const warn=t=>{try{toast(t)}catch(e){}};
const getStore=k=>{try{return localStorage.getItem(k)}catch(e){return null}},setStore=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function lazy(src,test){return new Promise((ok,no)=>{if(test()){ok();return}const s=D.createElement("script");s.src=src;s.onload=ok;s.onerror=()=>no(new Error("Could not load "+src));D.head.appendChild(s)})}

/* ---------- one viewer at a time (no tabs, no windows) ---------- */
let active=null,pushed=false,locked=true;
const narrow=()=>innerWidth<760;
const vis=(t,b)=>{t.pane.classList.toggle("on",b);t.fr.classList.toggle("on",b)};
const findTab=key=>active&&active.key===key?active:null;
function renderTabs(){
  tabsEl.innerHTML="";if(!active)return;
  const b=mk("div","wtt");b.innerHTML=ic(kicon[active.k]||I.doc,18)+"<span></span>"+(active.dirty?'<i title="Unsaved changes"></i>':"");
  b.querySelector("span").textContent=active.title;tabsEl.appendChild(b);
}
function activate(t){
  active=t;vis(t,true);if(t.onshow)t.onshow();
  renderTabs();syncMini();
}
function lock(b){
  if(b===locked)return;locked=b;
  if(b){
    if(active){active.dirty=false;closeTab(active)}
    try{A.pause();A.q=[];A.i=-1;A.removeAttribute("src")}catch(x){}
    hideWs();
  }
  renderTabs();syncMini();
}
function closeTab(t){
  if(t.dirty&&!confirm("Close "+t.title+" without saving your changes?"))return;
  if(t.onclose)t.onclose();
  t.fr.remove();if(active===t)active=null;
  hideWs();syncMini();
}
function showWs(){
  if(locked)return;
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
Q("#wmin").onclick=()=>{if(active)closeTab(active);else hideWs()};
addEventListener("beforeunload",ev=>{if(active&&active.dirty){ev.preventDefault();ev.returnValue=""}});
function addTab(key,k,title,pane){
  const t={key,k,title,pane};pane.classList.add("wp");
  const fr=mk("div","win");t.fr=fr;fr.appendChild(pane);body.appendChild(fr);
  return t;
}
/* put t on screen; the viewer that was there goes away */
function swap(t){
  const old=active;if(!old||old===t)return;
  if(old.onclose)old.onclose();old.fr.remove();active=null;
}
function siblings(kinds,C){
  try{C=C||{cur,shown};return(C.shown||[]).filter(x=>!x.d&&kinds.includes(x.k)).map(x=>({n:x.n,k:x.k,s:x.s||0,p:join(C.cur,x.n)}))}catch(e){return[]}
}
/* open(e) is called from the file list. opts.edit opens text files straight in the editor. */
function open(e,C,opts){
  if(locked||!e||e.d||!KINDS.includes(e.k))return false;
  C=C||{cur,shown,entries};
  const p=join(C.cur,e.n);
  if(active&&active.key!==(e.k==="audio"?"audio":p)&&active.dirty&&!confirm("Close "+active.title+" without saving your changes?"))return false;
  if(e.k==="audio"){playAudio(e.n,p,siblings(["audio"],C));let t=findTab("audio");if(!t)t=musicTab();swap(t);showWs();activate(t);return true}
  let t=findTab(p);
  if(!t){
    t=e.k==="video"?videoTab(e,p,C):e.k==="text"?textTab(e,p):e.k==="docx"?docxTab(e,p):e.k==="pdf"?pdfTab(e,p):imageTab(e,p,C);
  }
  swap(t);
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
const SL={id:0,end:false,at:0};
function sleepStop(){clearTimeout(SL.id);SL.id=0;SL.end=false;SL.at=0}
A.addEventListener("ended",()=>{if(SL.end){sleepStop();return}nextTrack(true)});
A.rate=+(getStore("ls_rate")||1);A.defaultPlaybackRate=A.rate;A.playbackRate=A.rate;
const EQ={on:false,ctx:null,nodes:null,v:Object.assign({b:0,m:0,t:0},(()=>{try{return JSON.parse(getStore("ls_eq")||"{}")}catch(x){return{}}})())};
function eqApply(){
  if(!EQ.ctx){
    try{
      const C0=window.AudioContext||window.webkitAudioContext;EQ.ctx=new C0();const src=EQ.ctx.createMediaElementSource(A);
      const mk2=(type,f)=>{const n=EQ.ctx.createBiquadFilter();n.type=type;n.frequency.value=f;if(type==="peaking")n.Q.value=1;return n};
      const b=mk2("lowshelf",140),m=mk2("peaking",1200),t=mk2("highshelf",4500);src.connect(b);b.connect(m);m.connect(t);t.connect(EQ.ctx.destination);EQ.nodes={b,m,t};
    }catch(x){warn("The equalizer is not available in this browser");return false}
  }
  EQ.nodes.b.gain.value=EQ.v.b;EQ.nodes.m.gain.value=EQ.v.m;EQ.nodes.t.gain.value=EQ.v.t;if(EQ.ctx.state==="suspended")EQ.ctx.resume();
  setStore("ls_eq",JSON.stringify(EQ.v));return true;
}
A.addEventListener("play",()=>{if(EQ.ctx&&EQ.ctx.state==="suspended")EQ.ctx.resume()});
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
  const hasTrack=A.q.length>0&&A.i>=0;
  const mt=findTab("audio"),mv=!ws.classList.contains("hide")&&!!mt;
  const show=!locked&&hasTrack&&!mv;mp.classList.toggle("hide",!show);D.body.classList.toggle("mpOn",show);
  ws.classList.toggle("mp",show&&!ws.classList.contains("hide"));
  if(show)paintMini();
}
function paintMini(){
  const m=A.meta||{};
  if(!mp.firstChild){
    mp.innerHTML='<div class="art" role="button" aria-label="Open music tab"></div><div class="tx" role="button"><b></b><small></small></div><button class="pv" aria-label="Previous">'+ic(I.prev)+'</button><button class="pp" aria-label="Play or pause"></button><button class="nx" aria-label="Next">'+ic(I.next)+'</button><button class="cl" aria-label="Stop and close">'+ic(I.x,18)+'</button><div class="bar"><i></i></div>';
    const go=()=>{const t=findTab("audio")||musicTab();swap(t);showWs();activate(t)};
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
  pane.innerHTML='<div class="now"><div class="cover"></div><div class="meta"><h2></h2><p></p></div><div class="seek"><span class="a">0:00</span><input type="range" min="0" max="1000" value="0" aria-label="Seek"><span class="b">0:00</span></div><div class="ctl"><button class="sh" aria-label="Shuffle">'+ic(I.shuf)+'</button><button class="pv" aria-label="Previous">'+ic(I.prev,28)+'</button><button class="big" aria-label="Play or pause"></button><button class="nx" aria-label="Next">'+ic(I.next,28)+'</button><button class="rp" aria-label="Repeat">'+ic(I.rep)+'</button></div><div class="tools"><button class="bs"></button><button class="bz"></button><button class="be">Equalizer</button></div><div class="tp2 hide"></div><div class="vol">'+ic(I.vol,18)+'<input type="range" min="0" max="100" aria-label="Volume"></div></div><div class="q"><h3>Queue</h3><div class="ql"></div></div>';
  const $=s=>pane.querySelector(s),seek=$(".seek input");let drag=false;
  $(".big").onclick=()=>A.playing?A.pause():A.play();$(".pv").onclick=prevTrack;$(".nx").onclick=()=>nextTrack(false);
  $(".sh").onclick=()=>{A.shuf=!A.shuf;t.paint()};$(".rp").onclick=()=>{A.rep=(A.rep+1)%3;t.paint()};
  seek.oninput=()=>{drag=true;if(A.duration)$(".a").textContent=mm(seek.value/1000*A.duration)};seek.onchange=()=>{if(A.duration)A.currentTime=seek.value/1000*A.duration;drag=false};
  const vol=$(".vol input");vol.value=Math.round(A.volume*100);vol.oninput=()=>{A.volume=vol.value/100;setStore("ls_vol",String(A.volume))};
  const tp=$(".tp2"),bs=$(".bs"),bz=$(".bz"),be=$(".be");let tool="";
  const sleepTxt=()=>{if(SL.end)return"Sleep: end of track";if(SL.at){const r=Math.max(0,Math.round((SL.at-Date.now())/1000));return"Sleep "+mm(r)}return"Sleep timer"};
  const paintTools=()=>{bs.textContent="Speed "+(A.rate===1?"1×":A.rate+"×");bs.classList.toggle("on",A.rate!==1);bz.textContent=sleepTxt();bz.classList.toggle("on",!!(SL.at||SL.end));be.classList.toggle("on",EQ.v.b!==0||EQ.v.m!==0||EQ.v.t!==0)};
  const chips=(arr,cur,fn)=>{const d=mk("div","chips");arr.forEach(([v,l])=>{const b=mk("button",cur===v?"on":"",l);b.onclick=()=>fn(v);d.appendChild(b)});return d};
  const drawTool=()=>{
    tp.classList.toggle("hide",!tool);tp.innerHTML="";if(!tool)return;
    if(tool==="speed"){tp.appendChild(chips([.5,.75,.9,1,1.1,1.25,1.5,2].map(x=>[x,x===1?"Normal":x+"×"]),A.rate,r=>{A.rate=r;A.defaultPlaybackRate=r;A.playbackRate=r;try{A.preservesPitch=true}catch(x){}setStore("ls_rate",String(r));paintTools();drawTool()}))}
    else if(tool==="sleep"){tp.appendChild(chips([[0,"Off"],[5,"5 min"],[10,"10 min"],[15,"15 min"],[30,"30 min"],[45,"45 min"],[60,"1 hour"],["end","End of track"]],SL.end?"end":SL.at?-1:0,v=>{sleepStop();if(v==="end")SL.end=true;else if(v>0){SL.at=Date.now()+v*60000;SL.id=setTimeout(()=>{A.pause();sleepStop();paintTools()},v*60000)}paintTools();drawTool()}))}
    else if(tool==="eq"){
      const row=(k,l)=>{const r=mk("div","row","<span></span><input type=\"range\" min=\"-12\" max=\"12\" step=\"1\"><b></b>");r.firstChild.textContent=l;const i=r.querySelector("input"),o=r.querySelector("b");i.value=EQ.v[k];o.textContent=EQ.v[k]+" dB";i.oninput=()=>{EQ.v[k]=+i.value;o.textContent=i.value+" dB";if(eqApply())paintTools()};return r};
      tp.append(row("b","Bass"),row("m","Mid"),row("t","Treble"));
      tp.appendChild(chips([["flat","Flat"],["bass","Bass boost"],["vocal","Vocal"],["treble","Treble"],["loud","Loud"]],"",k=>{const P={flat:[0,0,0],bass:[8,0,-1],vocal:[-2,5,2],treble:[-2,0,8],loud:[6,-1,6]}[k];EQ.v={b:P[0],m:P[1],t:P[2]};if(eqApply())paintTools();drawTool()}));
    }
  };
  const pick=k=>()=>{tool=tool===k?"":k;drawTool()};bs.onclick=pick("speed");bz.onclick=pick("sleep");be.onclick=pick("eq");paintTools();
  const tick=setInterval(()=>{if(!pane.isConnected){clearInterval(tick);return}if(SL.at)paintTools()},1000);
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
function videoTab(e,p,C){
  const pane=mk("div"),t=addTab(p,"video",e.n,pane);
  const list=siblings(["video"],C);
  const v=mk("video");v.playsInline=true;v.preload="auto";v.autoplay=true;v.src=fu(p);
  const w=mk("div","vw");
  const vp=mk("div","vp");
  vp.innerHTML='<div class="vbig"><i></i></div><div class="vc"><div class="vprog" aria-label="Seek"><div class="tr"><div class="bf"></div><div class="pl"></div><div class="kn"></div></div><div class="tp">0:00</div></div><div class="vrow"><button class="pp" aria-label="Play or pause"></button><button class="nx" aria-label="Next video">'+ic(I.next)+'</button><span class="vv"><button class="mu2" aria-label="Mute"></button><input type="range" min="0" max="100" aria-label="Volume"></span><span class="tm">0:00 / 0:00</span><span class="sp"></span><button class="cc" aria-label="Subtitles" hidden>'+ic(I.cc)+'</button><button class="gr" aria-label="Settings">'+ic(I.gear)+'</button><button class="th" aria-label="Theatre mode" title="Theatre mode (t)">'+ic(I.theatre)+'</button><button class="pi" aria-label="Picture in picture" title="Picture in picture (i)">'+ic(I.pip)+'</button><button class="fs" aria-label="Fullscreen" title="Fullscreen (f)">'+ic(I.full)+"</button></div></div>";
  vp.insertBefore(v,vp.firstChild);
  const info=mk("div","vinfo");info.innerHTML='<h2></h2><div class="vm"><span class="sz"></span><button class="chip lp">Loop</button><a class="chip dl">'+ic(I.dl,16)+' Download</a></div>';
  info.querySelector("h2").textContent=base(e.n);info.querySelector(".sz").textContent=(e.s?fmtSize(e.s):"")+" · "+ext(e.n).toUpperCase();
  const dl=info.querySelector(".dl");dl.href=fu(p,1);dl.setAttribute("download",e.n);
  const main=mk("div");main.append(vp,info);
  const nx=mk("div","vnext");const cn=(C.cur||"").split("/").filter(Boolean).pop()||"Videos",plx=Math.max(0,list.findIndex(x=>x.p===p));
  nx.innerHTML='<div class="plh"><b></b><small></small></div><label><input type="checkbox"> Play next automatically</label><div class="vl"></div>';
  nx.querySelector(".plh b").textContent=cn;nx.querySelector(".plh small").textContent="Playlist · "+(plx+1)+" / "+list.length;
  const ap=nx.querySelector("input");ap.checked=getStore("ls_ap")!=="0";ap.onchange=()=>setStore("ls_ap",ap.checked?"1":"0");
  const vl=nx.querySelector(".vl");
  list.forEach((x,xi)=>{
    const b=mk("button","vit"+(x.p===p?" on":""),'<i class="num">'+(x.p===p?"▶":xi+1)+'</i><div class="th2"></div><span></span>');
    b.querySelector("span").textContent=base(x.n);const sm=mk("small",null,x.s?fmtSize(x.s):"");b.querySelector("span").appendChild(sm);
    const th=b.querySelector(".th2");th.style.backgroundImage='url("/api/thumb?path='+encodeURIComponent(x.p)+'&w=320")';
    b.onclick=()=>{if(x.p===p)return;open({n:x.n,k:"video",s:x.s,d:false},C,{replace:t})};vl.appendChild(b);
  });
  w.append(main,nx);pane.appendChild(w);setTimeout(()=>{const on=vl.querySelector(".on");if(on)vl.scrollTop=Math.max(0,on.offsetTop-vl.offsetTop-8)},60);
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
  const idx=list.findIndex(x=>x.p===p),nextV=()=>{const n2=list[idx+1];if(n2)open({n:n2.n,k:"video",s:n2.s,d:false},C,{replace:t})};
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
  // floating player: the same player and controls, in a small window that stays while you browse
  let fl=null;
  const unfloat=go=>{if(!fl)return;const f=fl;fl=null;t.floating=false;vp.classList.remove("fl");main.insertBefore(vp,main.firstChild);if(f.pw){try{f.pw.close()}catch(x){}}f.remove();if(go){swap(t);showWs();activate(t)}};
  const float=async pop=>{
    if(fl)return;const f=mk("div","fv");
    f.innerHTML='<div class="fh"><span></span><button class="fo" title="Pop out over other apps" aria-label="Pop out">\u29c9</button><button class="fe" title="Back to the tab" aria-label="Back to the tab">\u2922</button><button class="fc" title="Stop and put back" aria-label="Close floating player">\u2715</button></div>';
    f.querySelector("span").textContent=base(e.n);if(!window.documentPictureInPicture)f.querySelector(".fo").remove();
    fl=f;t.floating=true;vp.classList.add("fl");f.appendChild(vp);D.body.appendChild(f);
    f.querySelector(".fe").onclick=()=>unfloat(true);f.querySelector(".fc").onclick=()=>{v.pause();unfloat(false)};
    const fo=f.querySelector(".fo");if(fo)fo.onclick=()=>{popOut(f)};
    const h=f.querySelector(".fh");
    h.addEventListener("pointerdown",ev=>{if(ev.target.closest("button")||f.pw)return;const r=f.getBoundingClientRect(),sx=ev.clientX-r.left,sy=ev.clientY-r.top;h.setPointerCapture(ev.pointerId);f.style.right="auto";f.style.bottom="auto";f.style.left=r.left+"px";f.style.top=r.top+"px";
      const mv=e2=>{f.style.left=Math.max(0,Math.min(innerWidth-80,e2.clientX-sx))+"px";f.style.top=Math.max(0,Math.min(innerHeight-40,e2.clientY-sy))+"px"};
      const up=()=>{h.removeEventListener("pointermove",mv);h.removeEventListener("pointerup",up)};h.addEventListener("pointermove",mv);h.addEventListener("pointerup",up)});
    if(!ws.classList.contains("hide"))hideWs();
    if(pop)popOut(f);
  };
  const popOut=async f=>{
    try{const pw=await documentPictureInPicture.requestWindow({width:420,height:290});
      D.querySelectorAll("style,link[rel=stylesheet]").forEach(n=>pw.document.head.appendChild(n.cloneNode(true)));
      pw.document.documentElement.className=D.documentElement.className;pw.document.documentElement.style.cssText=D.documentElement.style.cssText;
      pw.document.body.style.cssText="margin:0;background:#000";f.classList.add("pw");f.pw=pw;pw.document.body.appendChild(f);
      pw.addEventListener("pagehide",()=>{if(fl===f){v.pause();unfloat(false)}})}
    catch(x){warn("Pop out is not available here")}
  };
  pi.title="Floating player (i)";pi.onclick=ev=>{ev.stopPropagation();float(false)};
  v.addEventListener("play",()=>A.pause());
  // ----- picture, captions, audio tracks and tools: one menu with pages -----
  const picSaved=(()=>{try{return JSON.parse(getStore("ls_pic")||"{}")}catch(x){return{}}})();
  const pic=Object.assign({b:100,c:100,s:100,h:0},picSaved);
  let fit=getStore("ls_fit")||"contain",rot=0,flip=false,abA=null,abB=null;
  const applyPic=()=>{const d=pic.b===100&&pic.c===100&&pic.s===100&&pic.h===0;v.style.filter=d?"":"brightness("+pic.b+"%) contrast("+pic.c+"%) saturate("+pic.s+"%) hue-rotate("+pic.h+"deg)";setStore("ls_pic",JSON.stringify(pic))};
  const applyXf=()=>{v.style.objectFit=fit;let sc=1;if(rot%180){const r=vp.clientWidth/Math.max(1,vp.clientHeight);sc=Math.min(r,1/r)}v.style.transform=(rot||flip)?"rotate("+rot+"deg) scale("+(flip?-sc:sc)+","+sc+")":"";setStore("ls_fit",fit)};
  applyPic();applyXf();
  const capCfg=Object.assign({z:100,c:"#ffffff",b:"rgba(0,0,0,.7)"},(()=>{try{return JSON.parse(getStore("ls_cap")||"{}")}catch(x){return{}}})());
  const applyCap=()=>{let st2=Q("#wscap");if(!st2){st2=D.createElement("style");st2.id="wscap";D.head.appendChild(st2)}st2.textContent=".vp video::cue{font-size:"+capCfg.z+"%;color:"+capCfg.c+";background-color:"+capCfg.b+"}";setStore("ls_cap",JSON.stringify(capCfg))};applyCap();
  const ccb=$(".cc"),tracks=[];
  const toVtt=tx=>{tx=tx.replace(/^\uFEFF/,"").replace(/\r/g,"");return/^WEBVTT/.test(tx)?tx:"WEBVTT\n\n"+tx.replace(/(\d\d:\d\d:\d\d),(\d{3})/g,"$1.$2")};
  const curCap=()=>[...v.textTracks].find(x=>x.mode==="showing")||null;
  const setCap=tt=>{[...v.textTracks].forEach(x=>{x.mode=x===tt?"showing":"disabled"});ccb.classList.toggle("on",!!tt)};
  function addSub(tx,label,show){const tr=D.createElement("track");tr.kind="subtitles";tr.label=label;tr.src=URL.createObjectURL(new Blob([toVtt(tx)],{type:"text/vtt"}));v.appendChild(tr);tracks.push(tr);ccb.hidden=false;if(show)setCap(tr.track);else tr.track.mode="disabled"}
  const shiftCues=(tt,d)=>{if(!tt||!tt.cues)return;for(const c of tt.cues){c.startTime=Math.max(0,c.startTime+d);c.endTime=Math.max(.05,c.endTime+d)}tt._off=(tt._off||0)+d};
  (async()=>{const b0=base(e.n).toLowerCase();let first=true;
    for(const x of (C&&C.entries||[])){const n=x.n.toLowerCase();
      if(x.d||!/\.(srt|vtt)$/.test(n)||!n.startsWith(b0+".")||(x.s||0)>2e6)continue;
      try{const r=await fetch(fu(join(C.cur,x.n)));if(!r.ok)continue;addSub(await r.text(),n.slice(b0.length+1).replace(/\.(srt|vtt)$/,"")||"Subtitles",first);first=false}catch(x2){}}})();
  v.addEventListener("loadedmetadata",()=>{ccb.hidden=ccb.hidden&&!(v.textTracks&&v.textTracks.length);if(v.textTracks&&v.textTracks.length)ccb.hidden=false});
  ccb.onclick=ev=>{ev.stopPropagation();const c=curCap();if(c)setCap(null);else{const all=[...v.textTracks];setCap(all[0]||null)}};
  const snap=()=>{try{const c=D.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);c.toBlob(b=>{const a=D.createElement("a");a.href=URL.createObjectURL(b);a.download=base(e.n)+"-"+mm(v.currentTime).replace(":","m")+"s.png";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)})}catch(x){warn("Could not save this frame")}};
  v.addEventListener("timeupdate",()=>{if(abA!=null&&abB!=null&&v.currentTime>=abB)v.currentTime=abA});
  let menu=null;const closeMenu=()=>{if(menu){menu.remove();menu=null}};
  const R=(label,val,fn,on)=>{const b=mk("button",on?"on":"","<span></span><em></em>");b.firstChild.textContent=label;b.lastChild.textContent=val||"";b.onclick=ev=>{ev.stopPropagation();fn()};return b};
  const H=(title,back)=>{const h=mk("div","vmh","<button aria-label=\"Back\">"+ic(I.back,18)+"</button><b></b>");h.lastChild.textContent=title;h.firstChild.onclick=ev=>{ev.stopPropagation();showMenu(back)};return h};
  const S=(label,min,max,val,unit,fn)=>{const w=mk("div","vsl","<span></span><input type=\"range\"><b></b>");const r=w.querySelector("input");w.firstChild.textContent=label;r.min=min;r.max=max;r.value=val;w.lastChild.textContent=val+unit;r.oninput=()=>{w.lastChild.textContent=r.value+unit;fn(+r.value)};r.onclick=ev=>ev.stopPropagation();return w};
  const note2=t=>mk("p","vmn",t);
  const capName=tt=>tt?(tt.label||tt.language||"Captions"):"Off";
  function showMenu(page){
    if(!menu){menu=mk("div","vmenu");vp.appendChild(menu)}menu.innerHTML="";menu.onclick=ev=>ev.stopPropagation();const add=(...x)=>menu.append(...x);
    if(page==="speed"){add(H("Speed","root"));[.25,.5,.75,1,1.25,1.5,1.75,2,3].forEach(r=>add(R(r===1?"Normal":r+"×","",()=>{v.playbackRate=r;showMenu("root")},v.playbackRate===r)))}
    else if(page==="pic"){add(H("Picture adjust","root"),S("Brightness",50,150,pic.b,"%",x=>{pic.b=x;applyPic()}),S("Contrast",50,150,pic.c,"%",x=>{pic.c=x;applyPic()}),S("Colour",0,200,pic.s,"%",x=>{pic.s=x;applyPic()}),S("Tint",-90,90,pic.h,"°",x=>{pic.h=x;applyPic()}),R("Reset picture","",()=>{Object.assign(pic,{b:100,c:100,s:100,h:0});applyPic();showMenu("pic")}))}
    else if(page==="fit"){add(H("Fit and turn","root"));[["contain","Fit (keep shape)"],["cover","Fill screen (crop)"],["fill","Stretch"]].forEach(([k,l])=>add(R(l,"",()=>{fit=k;applyXf();showMenu("fit")},fit===k)));add(R("Rotate 90°",rot?rot+"°":"",()=>{rot=(rot+90)%360;applyXf();showMenu("fit")}),R("Mirror",flip?"On":"",()=>{flip=!flip;applyXf();showMenu("fit")}),R("Reset","",()=>{fit="contain";rot=0;flip=false;applyXf();showMenu("fit")}))}
    else if(page==="subs"){const all=[...v.textTracks],c=curCap();add(H("Captions","root"),R("Off","",()=>{setCap(null);showMenu("subs")},!c));all.forEach(tt=>add(R(capName(tt),tt.language||"",()=>{setCap(tt);showMenu("subs")},tt===c)));
      add(R("Load a file (.srt or .vtt)","",()=>{const f=mk("input");f.type="file";f.accept=".srt,.vtt,text/vtt";f.onchange=async()=>{const fl=f.files[0];if(!fl)return;addSub(await fl.text(),fl.name.replace(/\.(srt|vtt)$/i,""),true);showMenu("subs")};f.click()}));
      if(c){const d=mk("div","vsl","<span>Timing</span><span class=\"vd\"><button>−0.5 s</button><button>+0.5 s</button></span><b></b>");const bs=d.querySelectorAll("button");d.lastChild.textContent=((c._off||0)>0?"+":"")+(c._off||0).toFixed(1)+" s";bs[0].onclick=ev=>{ev.stopPropagation();shiftCues(c,-.5);d.lastChild.textContent=((c._off||0)>0?"+":"")+(c._off||0).toFixed(1)+" s"};bs[1].onclick=ev=>{ev.stopPropagation();shiftCues(c,.5);d.lastChild.textContent=((c._off||0)>0?"+":"")+(c._off||0).toFixed(1)+" s"};add(d)}
      add(R("Caption style","",()=>showMenu("cap")));if(!all.length)add(note2("No captions in this file. Put a .srt or .vtt with the same name next to the video, or load one."))}
    else if(page==="cap"){add(H("Caption style","subs"));add(S("Size",60,250,capCfg.z,"%",x=>{capCfg.z=x;applyCap()}));
      [["#ffffff","White"],["#ffd60a","Yellow"],["#22d3ee","Cyan"],["#86efac","Green"]].forEach(([k,l])=>add(R("Text: "+l,"",()=>{capCfg.c=k;applyCap();showMenu("cap")},capCfg.c===k)));
      [["rgba(0,0,0,0)","None"],["rgba(0,0,0,.7)","Soft black"],["rgb(0,0,0)","Solid black"]].forEach(([k,l])=>add(R("Background: "+l,"",()=>{capCfg.b=k;applyCap();showMenu("cap")},capCfg.b===k)))}
    else if(page==="audio"){add(H("Audio track","root"));const at=v.audioTracks;
      if(at&&at.length>1){for(let i=0;i<at.length;i++){const k=i;add(R(at[k].label||at[k].language||"Track "+(k+1),at[k].language||"",()=>{for(let j=0;j<at.length;j++)at[j].enabled=j===k;showMenu("audio")},at[k].enabled))}}
      else add(note2("This video has one audio track, or this browser cannot switch tracks. Safari and Edge can; Chrome needs the flag chrome://flags/#enable-experimental-web-platform-features."))}
    else if(page==="tools"){add(H("Tools","root"),R("Save this frame as a picture","S",()=>{snap();closeMenu()}),
      R("Repeat a part: start here","[",()=>{abA=v.currentTime;if(abB!=null&&abB<=abA)abB=null;warn("Start set at "+mm(abA));showMenu("tools")},abA!=null),
      R("Repeat a part: end here","]",()=>{if(abA==null)abA=0;abB=v.currentTime;warn("Repeating "+mm(abA)+" to "+mm(abB));showMenu("tools")},abB!=null),
      R("Stop repeating","",()=>{abA=abB=null;showMenu("tools")}),
      R("One frame back",",",()=>{v.pause();v.currentTime=Math.max(0,v.currentTime-1/24)}),R("One frame forward",".",()=>{v.pause();v.currentTime=Math.min(v.duration||0,v.currentTime+1/24)}),
      R("Copy link to this video","",()=>{try{navigator.clipboard.writeText(location.origin+fu(p));warn("Link copied")}catch(x){warn("Could not copy")}closeMenu()}))}
    else{const c=curCap(),at=v.audioTracks;add(R("Speed",v.playbackRate===1?"Normal":v.playbackRate+"×",()=>showMenu("speed")),R("Picture adjust",(pic.b===100&&pic.c===100&&pic.s===100&&pic.h===0)?"":"Changed",()=>showMenu("pic")),R("Fit and turn",fit==="contain"?"Fit":fit==="cover"?"Fill":"Stretch",()=>showMenu("fit")),R("Captions",capName(c),()=>showMenu("subs")),R("Audio track",at&&at.length>1?at.length+" tracks":"",()=>showMenu("audio")),R("Tools","",()=>showMenu("tools")));
      if(v.videoWidth)add(note2("Quality: original file, "+v.videoWidth+"×"+v.videoHeight+(v.duration?" · "+fmtSize(e.s||0):"")))}
  }
  $(".gr").onclick=ev=>{ev.stopPropagation();if(menu){closeMenu();return}showMenu("root")};
  vp.addEventListener("click",ev=>{if(menu&&!ev.target.closest(".vmenu")&&!ev.target.closest(".gr"))closeMenu()});
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
    else if(k==="N"&&ev.shiftKey)nextV();else if(k==="s"||k==="S")snap();else if(k==="c"||k==="C")ccb.click();else if(k==="["){abA=v.currentTime;warn("Start set at "+mm(abA))}else if(k==="]"){if(abA==null)abA=0;abB=v.currentTime;warn("Repeating "+mm(abA)+" to "+mm(abB))}else if(k===","){v.pause();v.currentTime=Math.max(0,v.currentTime-1/24)}else if(k==="."){v.pause();v.currentTime=Math.min(v.duration||0,v.currentTime+1/24)}else if(k===">"){v.playbackRate=Math.min(2,v.playbackRate+.25);flash(v.playbackRate+"×")}else if(k==="<"){v.playbackRate=Math.max(.25,v.playbackRate-.25);flash(v.playbackRate+"×")}
    else if(/^[0-9]$/.test(k)&&v.duration)v.currentTime=v.duration*(+k/10);else used=false;
    if(used){ev.preventDefault();ev.stopPropagation()}
  };
  t.onhide=()=>{if(!t.floating&&!D.pictureInPictureElement&&!D.fullscreenElement)v.pause()};
  t.onclose=()=>{unfloat(false);save();v.pause();v.removeAttribute("src");v.load();tracks.forEach(x=>URL.revokeObjectURL(x.src))};
  t.onshow=()=>{unfloat(false)};
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
    fontSz();setTimeout(()=>cm.refresh(),30);t.cm=cm;hook();
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
  // extras: light/dark editor, live preview, JSON format, cursor position
  const edb=$(".edb"),fdBtn=$(".fd"),ex=ext(e.n);
  const addB=(html,tip,fn)=>{const b=mk("button","",html);b.title=tip;b.setAttribute("aria-label",tip);b.onclick=fn;edb.insertBefore(b,fdBtn);return b};
  let light=getStore("ls_edlight")==="1";const theme=()=>wrap.classList.toggle("light",light);theme();
  addB(ic(I.moon,18),"Light or dark editor",()=>{light=!light;setStore("ls_edlight",light?"1":"0");theme()});
  const posEl=mk("span","st","");edb.insertBefore(posEl,$(".sp"));
  let pv=null,pvBtn=null,pvT=0;
  function render(){
    if(!pv||!cm)return;const tx=cm.getValue();pv.innerHTML="";pv.style.padding="";
    if(ex==="md"||ex==="markdown")pv.innerHTML=clean(mdToHtml(tx));
    else if(ex==="html"||ex==="htm"||ex==="svg"){const f=D.createElement("iframe");f.setAttribute("sandbox","allow-scripts");f.srcdoc=ex==="svg"?'<body style="margin:0;display:grid;place-items:center;height:100vh">'+tx+"</body>":tx;pv.style.padding="0";pv.appendChild(f)}
    else if(ex==="csv"||ex==="tsv"){const rows=parseCsv(tx,ex==="tsv"?"\t":","),tb=D.createElement("table");rows.slice(0,2000).forEach((r,i)=>{const tr=D.createElement("tr");r.forEach(c=>{const td=D.createElement(i?"td":"th");td.textContent=c;tr.appendChild(td)});tb.appendChild(tr)});pv.appendChild(tb);if(rows.length>2000)pv.appendChild(mk("p","",rows.length+" rows, the first 2000 are shown."))}
    else if(ex==="json"){try{const pre=D.createElement("pre");pre.textContent=JSON.stringify(JSON.parse(tx),null,2);pv.appendChild(pre)}catch(x){pv.appendChild(mk("p","",""));pv.lastChild.style.color="#b91c1c";pv.lastChild.textContent="Not valid JSON: "+x.message}}
  }
  if(["md","markdown","html","htm","svg","csv","tsv","json"].includes(ex))pvBtn=addB(ic(I.eye,18)+" Preview","Preview",()=>{
    if(!cm)return;if(pv){pv.remove();pv=null;pvBtn.classList.remove("on");return}
    pv=mk("div","pv");wrap.appendChild(pv);pvBtn.classList.add("on");render()});
  if(ex==="json"&&can)addB("{ }","Format JSON",()=>{if(!cm)return;try{cm.setValue(JSON.stringify(JSON.parse(cm.getValue()),null,2))}catch(x){warn("This is not valid JSON")}});
  function hook(){
    cm.on("cursorActivity",()=>{const c=cm.getCursor();posEl.textContent="Ln "+(c.line+1)+", Col "+(c.ch+1)+" · "+cm.lineCount()+" lines"});
    cm.on("change",()=>{if(pv){clearTimeout(pvT);pvT=setTimeout(render,300)}});
    const c=cm.getCursor();posEl.textContent="Ln "+(c.line+1)+", Col "+(c.ch+1)+" · "+cm.lineCount()+" lines";
  }
  t.onshow=()=>{if(cm)setTimeout(()=>{cm.refresh();cm.focus()},20)};
  return t;
}
function parseCsv(tx,sep){
  const rows=[];let r=[],c="",q=false;
  for(let i=0;i<tx.length;i++){const ch=tx[i];
    if(q){if(ch==='"'){if(tx[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}
    else if(ch==='"')q=true;else if(ch===sep){r.push(c);c=""}else if(ch==="\n"){r.push(c.replace(/\r$/,""));rows.push(r);r=[];c=""}else c+=ch}
  if(c||r.length){r.push(c);rows.push(r)}return rows;
}
function mdToHtml(src){
  const esc=x=>x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const inl=x=>esc(x).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,'<img alt="$1" src="$2">').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/(^|[^*])\*([^*\n]+)\*/g,"$1<i>$2</i>");
  const out=[],L=src.replace(/\r/g,"").split("\n");let i=0;
  while(i<L.length){
    const l=L[i];
    if(/^```/.test(l)){const b=[];i++;while(i<L.length&&!/^```/.test(L[i]))b.push(L[i++]);i++;out.push("<pre><code>"+esc(b.join("\n"))+"</code></pre>");continue}
    let m=l.match(/^(#{1,6})\s+(.*)$/);if(m){out.push("<h"+m[1].length+">"+inl(m[2])+"</h"+m[1].length+">");i++;continue}
    if(/^\s*([-*_])\1\1+\s*$/.test(l)){out.push("<hr>");i++;continue}
    if(/^>\s?/.test(l)){const b=[];while(i<L.length&&/^>\s?/.test(L[i]))b.push(L[i++].replace(/^>\s?/,""));out.push("<blockquote>"+inl(b.join(" "))+"</blockquote>");continue}
    if(/^\s*[-*+]\s+/.test(l)){const b=[];while(i<L.length&&/^\s*[-*+]\s+/.test(L[i]))b.push("<li>"+inl(L[i++].replace(/^\s*[-*+]\s+/,""))+"</li>");out.push("<ul>"+b.join("")+"</ul>");continue}
    if(/^\s*\d+[.)]\s+/.test(l)){const b=[];while(i<L.length&&/^\s*\d+[.)]\s+/.test(L[i]))b.push("<li>"+inl(L[i++].replace(/^\s*\d+[.)]\s+/,""))+"</li>");out.push("<ol>"+b.join("")+"</ol>");continue}
    if(!l.trim()){i++;continue}
    const b=[];while(i<L.length&&L[i].trim()&&!/^(#{1,6}\s|```|>|\s*[-*+]\s|\s*\d+[.)]\s)/.test(L[i]))b.push(L[i++]);out.push("<p>"+inl(b.join(" "))+"</p>");
  }
  return out.join("\n");
}

/* ---------- docx tab ---------- */
function okUrl(u){const v=String(u).replace(/[\u0000-\u0020\u007f-\u009f]/g,"");return !/^[a-z][a-z0-9+.-]*:/i.test(v)||/^(https?:|mailto:|tel:|blob:)/i.test(v)||/^data:image\/(png|jpe?g|gif|webp|bmp);/i.test(v)}
function clean(html){
  const d=new DOMParser().parseFromString(html,"text/html");
  d.querySelectorAll("script,iframe,object,embed,style,link,meta,form").forEach(x=>x.remove());
  d.querySelectorAll("*").forEach(x=>{[...x.attributes].forEach(a=>{if(/^on/i.test(a.name)||((a.name==="href"||a.name==="src"||a.name==="xlink:href"||a.name==="action"||a.name==="formaction")&&!okUrl(a.value)))x.removeAttribute(a.name)});if(x.tagName==="A"){x.target="_blank";x.rel="noopener"}});
  return d.body.innerHTML;
}
function docxTab(e,p){
  const pane=mk("div","dx"),t=addTab(p,"docx",e.n,pane);
  pane.innerHTML='<div class="dtb"><span></span><button class="chip zo">−</button><button class="chip zi">+</button><button class="chip dk">'+ic(I.moon,16)+' Dark page</button><button class="chip pr">'+ic(I.print,16)+' Print</button><button class="chip cp">Copy text</button><a class="chip dl">'+ic(I.dl,16)+' Download</a></div><div class="paper"><p class="wldr">Opening document…</p></div>';
  pane.querySelector("span").textContent=e.n;const dl=pane.querySelector(".dl");dl.href=fu(p,1);dl.setAttribute("download",e.n);
  const paper=pane.querySelector(".paper");let z=1;const apply=()=>{paper.style.fontSize=(16*z)+"px"};
  pane.querySelector(".dk").onclick=ev=>{pane.classList.toggle("wh");ev.currentTarget.classList.toggle("on",pane.classList.contains("wh"))};
  pane.querySelector(".pr").onclick=()=>{let pr=Q("#prt");if(!pr){pr=mk("div");pr.id="prt";D.body.appendChild(pr)}pr.innerHTML=paper.innerHTML;pr.style.cssText="font:12pt/1.5 Georgia,serif;color:#000;background:#fff";const done=()=>{pr.remove();removeEventListener("afterprint",done)};addEventListener("afterprint",done);print()};
  pane.querySelector(".cp").onclick=()=>{try{navigator.clipboard.writeText(paper.innerText);warn("Text copied")}catch(x){warn("Could not copy")}};
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
function imageTab(e,p,C){
  const pane=mk("div","im"),t=addTab(p,"image",e.n,pane);
  const list=siblings(["image"],C);let i=Math.max(0,list.findIndex(x=>x.p===p));
  const img=new Image();img.alt=e.n;img.draggable=false;pane.appendChild(img);
  let z=1,rot=0,fx=1,x=0,y=0,show1=null;
  const xf=()=>{img.style.transform="translate("+x+"px,"+y+"px) rotate("+rot+"deg) scale("+(z*fx)+","+z+")"};
  const reset=()=>{z=1;rot=0;fx=1;x=0;y=0;xf()};
  const zoom=d=>{z=Math.min(8,Math.max(.2,z*d));if(z<=1.001){x=0;y=0}xf()};
  const show=()=>{const it=list[i];if(!it)return;img.src=fu(it.p);img.alt=it.n;t.title=it.n;reset();renderTabs()};
  const bar=mk("div","imb");
  const B=(icn,tip,fn)=>{const b=mk("button","",ic(icn,20));b.title=tip;b.setAttribute("aria-label",tip);b.onclick=ev=>{ev.stopPropagation();fn(b)};bar.appendChild(b);return b};
  B(I.zout,"Zoom out",()=>zoom(1/1.25));B(I.zin,"Zoom in",()=>zoom(1.25));
  const one=B(I.img,"Fit / actual size",()=>{if(z!==1||x||y)reset();else{z=Math.max(1,img.naturalWidth/Math.max(1,img.clientWidth));xf()}});
  B(I.rot,"Turn right",()=>{rot=(rot+90)%360;xf()});B(I.flip,"Mirror",()=>{fx=-fx;xf()});
  const dl=B(I.dl,"Download",()=>{const a=D.createElement("a");a.href=fu(list[i]?list[i].p:p,1);a.download=(list[i]||e).n;D.body.appendChild(a);a.click();a.remove()});
  B(I.full,"Full screen",()=>{if(D.fullscreenElement)D.exitFullscreen();else if(pane.requestFullscreen)pane.requestFullscreen().catch(()=>{})});
  let slide=0;
  if(list.length>1){
    const l=mk("button","nv l",ic(I.back,24)),r=mk("button","nv r",ic(I.back,24));r.firstChild.style.transform="scaleX(-1)";l.setAttribute("aria-label","Previous picture");r.setAttribute("aria-label","Next picture");
    l.onclick=ev=>{ev.stopPropagation();i=(i-1+list.length)%list.length;show()};r.onclick=ev=>{ev.stopPropagation();i=(i+1)%list.length;show()};pane.append(l,r);
    const sb=B(I.play,"Slideshow",()=>{if(slide){clearInterval(slide);slide=0;sb.classList.remove("on")}else{sb.classList.add("on");slide=setInterval(()=>{i=(i+1)%list.length;show()},3500)}});
    t.key2=ev=>{if(active!==t||ws.classList.contains("hide"))return;const k=ev.key;let used=true;
      if(k==="ArrowLeft")l.click();else if(k==="ArrowRight")r.click();else if(k==="+"||k==="=")zoom(1.25);else if(k==="-")zoom(1/1.25);else if(k==="0")reset();else if(k==="r"||k==="R"){rot=(rot+90)%360;xf()}else used=false;
      if(used){ev.preventDefault();ev.stopPropagation()}};
  }else t.key2=ev=>{if(active!==t||ws.classList.contains("hide"))return;const k=ev.key;if(k==="+"||k==="="){zoom(1.25);ev.preventDefault()}else if(k==="-"){zoom(1/1.25);ev.preventDefault()}else if(k==="0"){reset();ev.preventDefault()}};
  pane.appendChild(bar);
  pane.addEventListener("wheel",ev=>{ev.preventDefault();zoom(ev.deltaY<0?1.12:1/1.12)},{passive:false});
  let drag=null;
  pane.addEventListener("pointerdown",ev=>{if(ev.target.closest(".imb,.nv"))return;drag={px:ev.clientX,py:ev.clientY,x,y,moved:false};pane.setPointerCapture(ev.pointerId)});
  pane.addEventListener("pointermove",ev=>{if(!drag)return;const dx=ev.clientX-drag.px,dy=ev.clientY-drag.py;if(Math.abs(dx)+Math.abs(dy)>3){drag.moved=true;pane.classList.add("g")}if(z>1){x=drag.x+dx;y=drag.y+dy;xf()}});
  pane.addEventListener("pointerup",()=>{pane.classList.remove("g");drag=null});
  pane.addEventListener("dblclick",ev=>{if(ev.target.closest(".imb,.nv"))return;if(z>1||x||y)reset();else{z=2.5;xf()}});
  t.onclose=()=>{if(slide)clearInterval(slide)};t.onhide=()=>{if(slide){clearInterval(slide);slide=0}};
  show();return t;
}

/* ---------- keys, then expose ---------- */
addEventListener("keydown",ev=>{
  if(ws.classList.contains("hide"))return;
  if(ev.altKey&&!ev.ctrlKey&&!ev.metaKey&&active&&(ev.key==="w"||ev.key==="W")){ev.preventDefault();closeTab(active);return}
  if(ev.key==="Escape"&&!(ev.target.closest&&ev.target.closest(".CodeMirror-dialog"))&&!D.fullscreenElement){ev.preventDefault();ev.stopPropagation();hideWs();return}
  if(active&&active.key2)active.key2(ev);
  if((ev.ctrlKey||ev.metaKey)&&ev.key==="w"&&active){ev.preventDefault();closeTab(active)}
},true);
window.WS={lock,open,visible:()=>!ws.classList.contains("hide"),kinds:KINDS};
renderTabs();syncMini();
})();
