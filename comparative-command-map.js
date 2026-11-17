/* Three-state comparative district motion interface. All locations schematic, not GIS boundaries. */
(()=>{"use strict";
const root=document.getElementById("omsCommandMap");if(!root)return;
const d=document.getElementById("oms-comparative-embedded"),g=document.getElementById("oms-comparative-government");
if(!d||!g)return;let data,gov;try{data=JSON.parse(d.textContent);gov=JSON.parse(g.textContent)}catch(e){root.textContent="Map data unavailable: "+e.message;return}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const states=["Madhya Pradesh","Odisha","Jharkhand"];
const short={"Madhya Pradesh":"MP","Odisha":"OD","Jharkhand":"JH"};
const L=id=>data.leaders.find(l=>l.id===id);
const geo={
"Madhya Pradesh":{
 box:[74,83,21.1,26.9],
 path:"M22 77 L41 47 L82 48 L106 31 L147 39 L174 29 L204 36 L246 30 L282 47 L302 77 L291 108 L304 125 L287 155 L261 158 L255 188 L220 213 L180 216 L151 206 L130 220 L97 205 L70 208 L42 183 L27 148 L15 117 Z",
 list:"Bhopal:23.26:77.41,Raisen:23.33:77.78,Rajgarh:23.85:76.73,Sehore:23.20:77.08,Vidisha:23.53:77.81,Alirajpur:22.31:74.36,Barwani:22.03:74.90,Burhanpur:21.31:76.23,Dhar:22.60:75.30,Indore:22.72:75.86,Jhabua:22.77:74.60,Khandwa:21.83:76.35,Khargone:21.82:75.62,Agar Malwa:23.71:76.02,Dewas:22.96:76.05,Mandsaur:24.07:75.07,Neemuch:24.47:74.87,Ratlam:23.33:75.04,Shajapur:23.43:76.27,Ujjain:23.18:75.79,Ashoknagar:24.57:77.73,Datia:25.67:78.46,Guna:24.65:77.31,Gwalior:26.22:78.18,Shivpuri:25.43:77.66,Bhind:26.55:78.79,Morena:26.49:77.99,Sheopur:25.67:76.70,Balaghat:21.82:80.18,Chhindwara:22.06:78.94,Dindori:22.95:81.08,Jabalpur:23.18:79.99,Katni:23.82:80.39,Mandla:22.60:80.37,Narsinghpur:22.95:79.20,Pandhurna:21.60:78.52,Seoni:22.08:79.54,Betul:21.90:77.90,Harda:22.34:77.10,Narmadapuram:22.74:77.72,Maihar:24.27:80.76,Mauganj:24.68:81.89,Rewa:24.54:81.30,Satna:24.58:80.83,Sidhi:24.42:81.88,Singrauli:24.20:82.68,Chhatarpur:24.91:79.59,Damoh:23.83:79.45,Niwari:25.35:78.60,Panna:24.72:80.20,Sagar:23.84:78.74,Tikamgarh:24.75:78.82,Anuppur:23.10:81.70,Shahdol:23.29:81.36,Umaria:23.53:80.84"
},
"Odisha":{
 box:[81,87.9,17.5,22.7],
 path:"M30 62 L54 39 L83 43 L108 26 L138 53 L172 44 L193 73 L224 57 L249 84 L267 91 L288 114 L277 141 L297 163 L278 187 L257 182 L245 211 L221 228 L198 211 L181 227 L158 208 L140 206 L107 178 L83 164 L69 137 L42 108 Z",
 list:"Angul:20.84:85.10,Balangir:20.70:83.50,Balasore:21.49:86.93,Bargarh:21.33:83.62,Bhadrak:21.05:86.50,Boudh:20.83:84.33,Cuttack:20.46:85.88,Deogarh:21.53:84.73,Dhenkanal:20.67:85.60,Gajapati:18.78:84.09,Ganjam:19.39:85.05,Jagatsinghpur:20.25:86.17,Jajpur:20.85:86.34,Jharsuguda:21.86:84.01,Kalahandi:19.91:83.16,Kandhamal:20.20:84.08,Kendrapara:20.50:86.42,Keonjhar:21.63:85.58,Khordha:20.25:85.80,Koraput:18.81:82.71,Malkangiri:18.35:81.90,Mayurbhanj:21.93:86.73,Nabarangpur:19.23:82.55,Nayagarh:20.13:85.10,Nuapada:20.81:82.54,Puri:19.80:85.82,Rayagada:19.17:83.42,Sambalpur:21.47:83.98,Subarnapur:20.84:83.92,Sundargarh:22.12:84.03"
},
"Jharkhand":{
 box:[83.1,88.2,21.6,25.5],
 path:"M17 106 L34 78 L58 85 L81 53 L111 49 L130 27 L159 42 L187 34 L213 52 L242 45 L270 64 L291 96 L277 127 L302 146 L273 170 L248 164 L231 201 L205 210 L170 200 L144 221 L106 204 L84 188 L60 185 L34 154 Z",
 list:"Bokaro:23.67:86.15,Chatra:24.22:84.86,Deoghar:24.48:86.69,Dhanbad:23.80:86.43,Dumka:24.27:87.25,East Singhbhum:22.80:86.20,Garhwa:24.15:83.80,Giridih:24.19:86.30,Godda:24.83:87.21,Gumla:23.04:84.54,Hazaribagh:23.99:85.36,Jamtara:23.95:86.80,Khunti:23.08:85.28,Koderma:24.47:85.60,Latehar:23.75:84.50,Lohardaga:23.44:84.68,Pakur:24.63:87.85,Palamu:24.03:84.07,Ramgarh:23.63:85.52,Ranchi:23.34:85.31,Sahibganj:25.24:87.64,Seraikela Kharsawan:22.70:85.97,Simdega:22.62:84.50,West Singhbhum:22.55:85.80"
}};
for(const st of states)geo[st].places=geo[st].list.split(",").map(x=>{const a=x.split(":");return[a[0],Number(a[1]),Number(a[2])]});
const aliases={"Madhya Pradesh":{"Narmadapuram":["hoshangabad"],"Katni":["kymore"],"Khargone":["west nimar"],"Khandwa":["east nimar"]},
 "Odisha":{"Khordha":["khurda","bhubaneswar"],"Keonjhar":["kendujhar"],"Sundargarh":["sundergarh","rourkela"],"Koraput":["kotia"],"Balasore":["baleswar"],"Subarnapur":["sonepur"],"Balangir":["bolangir"]},
 "Jharkhand":{"East Singhbhum":["jamshedpur"],"West Singhbhum":["chaibasa"],"Seraikela Kharsawan":["seraikela","saraikela","kharsawan"],"Palamu":["palamau","daltonganj","medininagar"],"Sahibganj":["sahebganj"]}};
const leaderState=Object.fromEntries(data.leaders.map(l=>[l.id,l.state]));
const research=[...data.records.map(r=>Object.assign({kind:"News / broadcaster",state:leaderState[r.leader]},r)),
 ...data.posts.map(r=>Object.assign({kind:r.platform==="X"?"Original X link":"Direct social/video",state:leaderState[r.leader],title:r.sourceHeadline||r.detail,summary:r.detail},r)),
 ...gov.officialRecords.map(r=>Object.assign({kind:"Government institution (not personally attributed)",leader:null},r)),
 ...gov.assemblyRecords.map(r=>Object.assign({kind:"Legislative record (not personally attributed)",leader:null},r))];
let view={state:"all",leader:"all",issue:"Governance",role:"all",publisher:"all",term:""};
let district=null,showAll=false,stats={},filtered=[],key="";
function near(st,lat,lon){const b=geo[st].box;return[Math.min(302,Math.max(18,20+280*(lon-b[0])/(b[1]-b[0]))),Math.min(229,Math.max(20,23+206*(b[3]-lat)/(b[3]-b[2])))]}
function testWord(txt,phrase){const v=phrase.toLowerCase();return new RegExp("(^|[^a-z])"+v+"([^a-z]|$)","i").test(txt)}
function mention(r,st){
 const names=Array.isArray(r.districts)?r.districts.map(x=>x.toLowerCase()):[];
 const txt=[r.title,r.summary,r.detail,r.sourceHeadline].filter(Boolean).join(" ").toLowerCase();
 return geo[st].places.map(p=>p[0]).filter(n=>names.includes(n.toLowerCase())||[n,...(aliases[st]?.[n]||[])].some(x=>testWord(txt,x)));
}
function calculate(){
 filtered=research.filter(r=>{
  if(view.state!=="all"&&r.state!==view.state)return false;
  if(view.issue!=="all"&&r.issue!==view.issue)return false;
  if(r.leader){const l=L(r.leader);if(!l||view.leader!=="all"&&r.leader!==view.leader||view.role!=="all"&&l.role!==view.role)return false;
   if(r.kind==="News / broadcaster"&&view.publisher!=="all"&&r.publisher!==view.publisher)return false;
  }else if(view.leader!=="all"||view.role!=="all"||view.publisher!=="all")return false;
  if(view.term&&!([r.title,r.summary,r.detail,r.issue,r.authority,r.publisher,L(r.leader)?.name].filter(Boolean).join(" ").toLowerCase().includes(view.term)))return false;
  return true;
 });
 stats={};
 for(const st of states){
 const rows=filtered.filter(r=>r.state===st);
 const map=new Map(geo[st].places.map(p=>[p[0],[]]));let unplaced=0;
 for(const r of rows){const ds=mention(r,st);if(!ds.length)unplaced++;for(const n of ds)map.get(n)?.push(r)}
 stats[st]={rows,map,unplaced,lit:[...map].filter(x=>x[1].length).length};
 }
}
function stateCard(st){
 const s=stats[st],group=geo[st],one=view.state===st,dim=view.state!=="all"&&!one;
 const ranked=[...s.map].filter(([n,r])=>r.length).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));
 let svg='<svg class="cm-svg" viewBox="0 0 320 250" role="group" aria-label="'+esc(st)+' schematic evidence points"><path class="cm-outline" d="'+group.path+'"/>';
 for(let i=45;i<310;i+=52)svg+='<path class="cm-gridline" d="M'+i+' 22V228"/>';
 for(let i=45;i<230;i+=45)svg+='<path class="cm-gridline" d="M21 '+i+'H300"/>';
 svg+='<path class="cm-contour" d="'+group.path+'"/>';
 for(const [name,lat,lon] of group.places){
 const pt=near(st,lat,lon),rows=s.map.get(name)||[],hot=rows.length>0,sel=district?.state===st&&district?.name===name;
 const radius=sel?7.1:hot?Math.min(6.8,4.6+Math.sqrt(rows.length)*.6):3.1;
 svg+='<circle tabindex="0" role="button" class="cm-district'+(hot?' cm-hot':'')+(sel?' cm-target':'')+'" cx="'+pt[0].toFixed(1)+'" cy="'+pt[1].toFixed(1)+'" r="'+radius.toFixed(1)+'" data-action="district" data-state="'+esc(st)+'" data-district="'+esc(name)+'" aria-label="'+esc(name+', '+st+': '+rows.length+' matching source entries')+'"><title>'+esc(name+' · '+rows.length+' source mentions')+'</title></circle>';
 }
 for(const [name,rows] of ranked.slice(0,7)){const place=group.places.find(x=>x[0]===name),pt=near(st,place[1],place[2]);svg+='<text class="cm-label" x="'+Math.min(265,pt[0]+6).toFixed(1)+'" y="'+(pt[1]-7).toFixed(1)+'">'+esc(name.length>18?name.slice(0,15)+"…":name)+'</text>'}
 svg+='</svg>';
 const chips=ranked.slice(0,5).map(([name,rr])=>'<button class="cm-chip" data-action="district" data-state="'+esc(st)+'" data-district="'+esc(name)+'">'+esc(name)+' · '+rr.length+'</button>').join("");
 return '<article class="cm-map-card'+(one?' cm-selected':'')+(dim?' cm-dim':'')+'"><div class="cm-map-head"><button data-action="state" data-state="'+esc(st)+'" title="Filter the entire terminal to this state">'+esc(st)+' ⌄</button><small>'+s.lit+'/'+group.places.length+' LIT · '+s.rows.length+' LINKS</small></div>'+svg+
 '<div class="cm-map-foot">'+(chips||'<span class="cm-empty">No named district in this filter</span>')+(ranked.length>5?'<button class="cm-chip cm-quiet" data-action="state" data-state="'+esc(st)+'">+'+(ranked.length-5)+' districts</button>':'')+'</div></article>';
}
function choices(arr,key,label){return arr.map(o=>'<button data-action="'+key+'" data-'+key+'="'+esc(o[0])+'" class="'+(view[key]===o[0]?'active':'')+'" title="'+esc(o[2]||o[1])+'">'+esc(o[1])+'</button>').join("")}
function flow(){
 const ss=[["all","All states"],...states.map(s=>[s,short[s]])],ls=[["all","All leaders"],...data.leaders.filter(l=>view.state==="all"||view.state===l.state).map(l=>[l.id,l.name,l.state+" · "+l.role])],is=[["all","All issues"],...data.issues.map(x=>[x,x])];
 const count=states.reduce((n,s)=>n+stats[s].lit,0);
 return '<div class="cm-lineage"><div class="cm-flow-col"><span class="cm-flow-title">01 / STATE</span><div class="cm-flow-choices">'+choices(ss,"state")+'</div></div><div class="cm-flow-arrow"></div>'+
 '<div class="cm-flow-col"><span class="cm-flow-title">02 / CM OR LoP</span><div class="cm-flow-choices">'+choices(ls,"leader")+'</div></div><div class="cm-flow-arrow"></div>'+
 '<div class="cm-flow-col"><span class="cm-flow-title">03 / POLICY ISSUE</span><div class="cm-flow-choices">'+choices(is,"issue")+'</div></div><div class="cm-flow-arrow"></div>'+
 '<div class="cm-flow-col"><span class="cm-flow-title">04 / DISTRICT → EVIDENCE</span><div class="cm-flow-stat"><b>'+count+'</b> highlighted districts<br><b>'+filtered.length+'</b> indexed source entries</div></div></div>';
}
function evidence(r){const headline=r.title||r.detail||r.sourceHeadline||"Original source";return '<article class="cm-evidence-item"><small class="cm-meta">'+esc([r.date,r.publisher||r.authority||r.recordType||"Public source",r.kind].filter(Boolean).join(" · "))+'</small>'+
 '<a target="_blank" rel="noopener noreferrer" href="'+esc(/^https:\/\//.test(r.url||"")?r.url:"#")+'">'+esc(headline)+' ↗</a>'+(r.summary?'<p>'+esc(r.summary.length>250?r.summary.slice(0,250)+"…":r.summary)+'</p>':'')+'</article>'}
function details(){
 const all=states.flatMap(st=>[...stats[st].map].filter(x=>x[1].length).map(([name,rs])=>({st,name,rs}))).sort((a,b)=>b.rs.length-a.rs.length);
 if(!district){
 return '<div class="cm-detail"><div class="cm-detail-head"><strong>Choose any glowing district to reveal its evidence</strong><small>'+all.length+' highlighted districts</small></div>'+
 '<p class="cm-summary">Click an illuminated point or district chip; every linked headline opens its original publisher, post, or institution.</p>'+
 '<div class="cm-map-foot">'+all.slice(0,12).map(x=>'<button class="cm-chip" data-action="district" data-state="'+esc(x.st)+'" data-district="'+esc(x.name)+'">'+esc(x.name)+' · '+short[x.st]+' ('+x.rs.length+')</button>').join("")+'</div></div>';
 }
 const rows=stats[district.state]?.map.get(district.name)||[];
 const unique=[...new Map(rows.map(r=>[(r.kind||"")+":"+(r.url||r.id),r])).values()].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
 return '<div class="cm-detail"><div class="cm-detail-head"><strong>'+esc(district.name+' · '+district.state)+'</strong><small>'+unique.length+' matching original source links</small><button class="cm-button" data-action="close">Close ×</button></div>'+
 (unique.length?'<div class="cm-evidence">'+(showAll?unique:unique.slice(0,8)).map(evidence).join("")+'</div>'+(unique.length>8?'<p><button class="cm-button" data-action="more">'+(showAll?'Show fewer':'Show all '+unique.length+' links')+'</button></p>':''):
 '<p class="cm-summary">No district-specific item was recovered for the current combined filters. This does not mean the district had no political activity.</p>')+'</div>';
}
function render(){
 calculate();
 const k=[view.state,view.leader,view.role,view.issue,view.publisher,view.term,district?.name,district?.state,showAll].join("|");if(k===key)return;key=k;
 const lit=states.reduce((n,s)=>n+stats[s].lit,0),unplaced=states.reduce((n,s)=>n+stats[s].unplaced,0),named=filtered.length-unplaced;
 root.innerHTML='<div class="cm-top"><div><div class="cm-overline">Command center / three-state comparative source intelligence</div><h2>Interactive district heat field · MP / Odisha / Jharkhand</h2>'+
 '<p class="cm-summary">Click a state, political leader, and policy issue together. Matching districts glow; others return to a neutral tone. Click the district to see what was reported and open the actual original links.</p></div>'+
 '<div class="cm-action-row"><button class="cm-button" data-action="reset">Reset selection</button><a class="cm-button" target="_blank" rel="noopener noreferrer" href="./district-atlas.html">Full geographic atlas ↗</a></div></div>'+
 '<div class="cm-totals"><span><b>'+lit+'</b> highlighted districts</span><span><b>'+filtered.length+'</b> linked records for filters</span><span><b>'+named+'</b> located items</span><span><b>'+unplaced+'</b> unplaced sources retained</span><span><b>109</b> district nodes</span></div>'+
 '<div class="cm-map-grid">'+states.map(stateCard).join("")+'</div>'+flow()+details()+
 '<p class="cm-footnote">Schematic state outlines and approximate district-headquarter positions, not survey/GIS boundaries or event coordinates. Highlights follow explicit district mentions or labelled city-to-district aliases in reporting, not inferred activity ratings. Grey means no indexed match, not no event. Institutional circulars and Assembly reports are not attributed personally to a chief minister or opposition leader. Multiple sources may report one event.</p>';
}
function clickFilter(holder,key,val){const el=[...document.querySelectorAll(holder+' [data-'+key+']')].find(n=>n.getAttribute('data-'+key)===val);if(el){el.click();return true}return false}
function state(st){clickFilter("#states","state",view.state===st?"all":st)}
function leader(id){if(id!=="all"){const l=L(id);if(!l)return;if(view.state!=="all"&&view.state!==l.state)clickFilter("#states","state",l.state);if(view.role!=="all"&&view.role!==l.role)clickFilter("#roles","role","all")}
 clickFilter("#leaders","leader",view.leader===id?"all":id)}
function issue(id){if(id==="all"){clickFilter(".sidebar","issue","all");return}clickFilter("#issues","issue",id)}
root.addEventListener("click",ev=>{
 const b=ev.target.closest("[data-action]");if(!b||!root.contains(b))return;
 const action=b.getAttribute("data-action");
 if(action==="state")return state(b.getAttribute("data-state"));
 if(action==="leader")return leader(b.getAttribute("data-leader"));
 if(action==="issue")return issue(b.getAttribute("data-issue"));
 if(action==="district"){district={state:b.getAttribute("data-state"),name:b.getAttribute("data-district")};showAll=false;key="";render();root.querySelector(".cm-detail")?.scrollIntoView({behavior:"smooth",block:"nearest"});return}
 if(action==="close"){district=null;showAll=false;key="";return render()}
 if(action==="more"){showAll=!showAll;key="";return render()}
 if(action==="reset"){district=null;showAll=false;clickFilter("#states","state","all");clickFilter("#roles","role","all");clickFilter("#leaders","leader","all");clickFilter(".sidebar","issue","all");return}
});
root.addEventListener("keydown",ev=>{if((ev.key===" "||ev.key==="Enter")&&ev.target.matches("circle[data-action='district']")){ev.preventDefault();ev.target.dispatchEvent(new MouseEvent("click",{bubbles:true}))}});
document.addEventListener("comparative:render",event=>{if(event.detail){view=Object.assign({},view,event.detail);key="";render()}});
render();
})();