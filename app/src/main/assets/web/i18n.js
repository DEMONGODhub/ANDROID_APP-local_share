/* Language switch (English / Hindi). Swaps the page's fixed labels by exact match; file names and chat text are never touched. */
(function(){
"use strict";
const store=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null};
let lang=store("ls_lang");if(!lang)lang=(navigator.language||"").toLowerCase().startsWith("hi")?"hi":"en";
const HI={"Browse":"ब्राउज़","People":"लोग","Play & watch":"खेलें और देखें","More":"और","Enter a name to join.":"जुड़ने के लिए अपना नाम लिखें।","Enter the password to join.":"जुड़ने के लिए पासवर्ड डालें।","Loading…":"लोड हो रहा है…","Your name":"आपका नाम","Pick your picture":"अपनी तस्वीर चुनें","Password":"पासवर्ड","Show password":"पासवर्ड दिखाएँ","Join":"जुड़ें","Access blocked":"पहुँच रोकी गई","The person sharing this folder has blocked this device.":"यह फ़ोल्डर शेयर करने वाले ने इस डिवाइस को रोक दिया है।","Game time":"गेम टाइम","This phone is hosting the game only.":"यह फ़ोन सिर्फ़ गेम होस्ट कर रहा है।","Play Orb Arena":"Orb Arena खेलें","Leave":"बाहर निकलें","Change my picture":"मेरी तस्वीर बदलें","Send":"भेजें","Live chat":"लाइव चैट","Help for this device":"इस डिवाइस के लिए मदद","Sort by":"क्रमबद्ध करें","Name":"नाम","Newest":"सबसे नया","Largest":"सबसे बड़ा","Type":"प्रकार","Search":"खोजें","Search this folder":"इस फ़ोल्डर में खोजें","Watch screen":"स्क्रीन देखें","TV remote":"टीवी रिमोट","Select":"चुनें","Selection":"चयन","All":"सभी","Download ZIP":"ZIP डाउनलोड करें","Delete":"हटाएँ","Cancel":"रद्द करें","Close":"बंद करें","Back to top":"ऊपर जाएँ","Back":"वापस","Home":"होम","Chat":"चैट","Full screen":"फ़ुल स्क्रीन","Files to the host":"होस्ट को फ़ाइलें","Ask to send":"भेजने के लिए पूछें","Shared text":"साझा किया गया टेक्स्ट","Share text":"टेक्स्ट शेयर करें","Slow mode":"स्लो मोड","Clear":"साफ़ करें","Message everyone":"सभी को संदेश भेजें","Message":"संदेश","Waiting for the host":"होस्ट का इंतज़ार है","The host has to let you in. Keep this page open.":"होस्ट को आपको अंदर आने देना होगा। यह पेज खुला रखें।","Viewer":"व्यूअर","Queue":"कतार","Download":"डाउनलोड","Score":"स्कोर","Sound":"आवाज़","Game over":"गेम ख़त्म","Play again":"फिर से खेलें","Spectating":"दर्शक मोड","Reconnecting…":"दोबारा जुड़ रहा है…","Players":"खिलाड़ी","Everyone":"सभी","Rules":"नियम","Teams":"टीम","Health":"सेहत","Bots":"बॉट","Shooting":"शूटिंग","Game mode":"गेम मोड","Host controls":"होस्ट कंट्रोल","Nobody has joined yet.":"अभी कोई नहीं जुड़ा है।","Folders":"फ़ोल्डर","Files":"फ़ाइलें","Play games":"गेम खेलें","Help":"मदद","Workspaces":"वर्कस्पेस","Workspace":"वर्कस्पेस","Upload":"अपलोड","Empty":"खाली","Folder":"फ़ोल्डर","Choose a folder":"एक फ़ोल्डर चुनें","Pick the folder you want to open.":"वह फ़ोल्डर चुनें जिसे आप खोलना चाहते हैं।","Tap to open":"खोलने के लिए टैप करें","This folder is empty":"यह फ़ोल्डर खाली है","Nothing matches your search":"आपकी खोज से कुछ नहीं मिला","No folder matches your search":"आपकी खोज से कोई फ़ोल्डर नहीं मिला","The host has not shared any folder yet":"होस्ट ने अभी कोई फ़ोल्डर शेयर नहीं किया है","Done":"हो गया","Connecting…":"जुड़ रहा है…","Pause":"रोकें","Choose files to upload":"अपलोड के लिए फ़ाइलें चुनें","Choose files to send":"भेजने के लिए फ़ाइलें चुनें","Switch grid and list":"ग्रिड और सूची बदलें","Home, choose a folder":"होम, फ़ोल्डर चुनें","Send files or text to the host":"होस्ट को फ़ाइल या टेक्स्ट भेजें","Message sound":"संदेश की आवाज़","Clear the chat for everyone":"सभी के लिए चैट साफ़ करें","Close chat":"चैट बंद करें","Send a picture":"तस्वीर भेजें","Observe the match":"मैच देखें","Follow a player":"खिलाड़ी को फ़ॉलो करें"};
const RE=[[/^(\d+) items?$/,"$1 आइटम"],[/^(\d+) folders?$/,"$1 फ़ोल्डर"],[/^(\d+) selected$/,"$1 चुने गए"]];
function tr(s){const t=s.trim();if(!t)return null;let o=HI[t];if(o===undefined)for(const [r,v] of RE)if(r.test(t)){o=t.replace(r,v);break}return o===undefined?null:s.replace(t,o)}
function run(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentNode&&n.parentNode.nodeName;return p==="SCRIPT"||p==="STYLE"||p==="TEXTAREA"?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
  const ns=[];while(w.nextNode())ns.push(w.currentNode);
  ns.forEach(n=>{const o=tr(n.nodeValue);if(o!==null&&o!==n.nodeValue)n.nodeValue=o});
  root.querySelectorAll("[placeholder],[aria-label],[title]").forEach(e=>["placeholder","aria-label","title"].forEach(a=>{const v=e.getAttribute(a);if(v){const o=tr(v);if(o!==null&&o!==v)e.setAttribute(a,o)}}));
}
function addSwitch(){
  const sb=document.querySelector("#sb");if(!sb||document.querySelector("#sbl2"))return;
  const b=document.createElement("button");b.id="sbl2";b.className="sbi";b.style.marginTop="auto";
  b.innerHTML='<span class="sbn">A</span><span>'+(lang==="hi"?"English":"हिन्दी")+"</span>";
  b.onclick=()=>{store("ls_lang",lang==="hi"?"en":"hi");location.reload()};sb.appendChild(b);
}
addSwitch();
if(lang!=="hi")return;
document.documentElement.lang="hi";
let q=0;const go=()=>{q=0;run(document.body)};
new MutationObserver(()=>{if(!q)q=requestAnimationFrame(go)}).observe(document.body,{childList:true,subtree:true,characterData:true});
go();
})();
