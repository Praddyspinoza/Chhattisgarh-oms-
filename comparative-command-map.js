/* OpenStreetMap-derived district boundaries under ODbL; source mentions are not event geolocations. */
(()=>{"use strict";
const root=document.getElementById("omsCommandMap");if(!root)return;
const d=document.getElementById("oms-comparative-embedded"),g=document.getElementById("oms-comparative-government");
if(!d||!g)return;let data,gov;try{data=JSON.parse(d.textContent);gov=JSON.parse(g.textContent)}catch(e){root.textContent="Map data unavailable: "+e.message;return}
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const states=["Madhya Pradesh","Odisha","Jharkhand"];
const short={"Madhya Pradesh":"MP","Odisha":"OD","Jharkhand":"JH"};
const L=id=>data.leaders.find(l=>l.id===id);
const geo={};
const spatial=window.OMS_GEO_BOUNDARIES;
if(!spatial||states.some(s=>!spatial[s]||!spatial[s].features)){root.innerHTML='<div class="cm-detail"><strong>Real district boundary data could not be loaded.</strong> The source archive and existing tabs remain available.</div>';return}
function pointsOf(geom){if(!geom)return [];if(geom.type==="Polygon")return geom.coordinates.flat(1);if(geom.type==="MultiPolygon")return geom.coordinates.flat(2);return []}
for(const st of states){
 const feats=spatial[st].features;const all=feats.flatMap(f=>pointsOf(f.geometry));
 const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
 const box=[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)];
 const list=feats.map(f=>{const p=pointsOf(f.geometry);let ax=0,ay=0;for(const q of p){ax+=q[0];ay+=q[1]}return[f.properties.name,ay/p.length,ax/p.length]});
 geo[st]={box,features:feats,places:list};
}
const canonical={"Madhya Pradesh":{},"Odisha":{"Baleshwar":"Balasore","Kendujhar":"Keonjhar","Nabarangapur":"Nabarangpur","Debagarh":"Deogarh","Jagatsinghapur":"Jagatsinghpur"},"Jharkhand":{"Kodarma":"Koderma","Seraikela-Kharsawan":"Seraikela Kharsawan"}};
function displayName(st,name){return canonical[st]?.[name]||name}
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
const mapZoom=Object.fromEntries(states.map(s=>[s,1]));
function near(st,lat,lon){
 const b=geo[st].box,lonRange=b[1]-b[0],latRange=b[3]-b[2];
 const scale=Math.min(286/lonRange,215/latRange),offx=(320-lonRange*scale)/2,offy=(250-latRange*scale)/2;
 return[offx+(lon-b[0])*scale,offy+(b[3]-lat)*scale]
}
function svgPath(st,geom){
 const rings=geom.type==="Polygon"?geom.coordinates:(geom.type==="MultiPolygon"?geom.coordinates.flat():[]);
 return rings.map(ring=>ring.map((xy,i)=>{const p=near(st,xy[1],xy[0]);return(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)}).join("")+"Z").join("");
}
function testWord(txt,phrase){
 const v=String(phrase).toLowerCase().replace(/[\^$.*+?()[\]{}|]/g,"\\$&");
 return new RegExp("(^|[^a-z])"+v+"([^a-z]|$)","i").test(txt)
}
function mention(r,st){
 const names=Array.isArray(r.districts)?r.districts.map(x=>x.toLowerCase()):[];
 const txt=[r.title,r.summary,r.detail,r.sourceHeadline].filter(Boolean).join(" ").toLowerCase();
 return geo[st].places.map(p=>p[0]).filter(n=>{
  const variants=[n,displayName(st,n),...(aliases[st]?.[n]||[]),...(aliases[st]?.[displayName(st,n)]||[])];
  return variants.some(x=>names.includes(x.toLowerCase())||testWord(txt,x))
 });
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
 const s=stats[st],group=geo[st],focused=view.state!=="all"?view.state:(view.leader!=="all"?L(view.leader)?.state:null),one=focused===st,dim=Boolean(focused)&&!one;
 const ranked=[...s.map].filter(([n,r])=>r.length).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));
 const max=Math.max(1,...ranked.map(x=>x[1].length));
 const z=mapZoom[st]||1, vw=320/z, vh=250/z;
 const middle=district?.state===st?group.places.find(p=>p[0]===district.name):null;
 const center=middle?near(st,middle[1],middle[2]):[160,125];
 const vx=Math.max(0,Math.min(320-vw,center[0]-vw/2)),vy=Math.max(0,Math.min(250-vh,center[1]-vh/2));
 let svg='<svg class="cm-svg" viewBox="'+vx.toFixed(1)+' '+vy.toFixed(1)+' '+vw.toFixed(1)+' '+vh.toFixed(1)+'" role="group" aria-label="'+esc(st)+' real district boundaries with reporting highlights">'+
 '<defs><radialGradient id="cm-glow-'+short[st]+'"><stop stop-color="#f16e7d" stop-opacity=".13"/><stop offset="1" stop-color="#020a1a" stop-opacity="0"/></radialGradient></defs>'+
 '<ellipse cx="160" cy="129" rx="156" ry="117" fill="url(#cm-glow-'+short[st]+')"/>';
 for(const f of group.features){
  const name=f.properties.name,rows=s.map.get(name)||[],hot=rows.length>0,sel=district?.state===st&&district?.name===name;
  const opacity=hot?Math.min(.98,.48+Math.log1p(rows.length)/Math.log1p(max)*.5):.96;
  svg+='<path tabindex="0" role="button" class="cm-district cm-polygon'+(hot?' cm-hot':'')+(sel?' cm-target':'')+'" data-action="district" data-state="'+esc(st)+'" data-district="'+esc(name)+'" d="'+svgPath(st,f.geometry)+'" aria-label="'+esc(displayName(st,name)+', '+st+': '+rows.length+' matching source items')+'" style="--cm-intensity:'+opacity.toFixed(2)+'"><title>'+esc(displayName(st,name)+' · '+rows.length+' source mentions')+'</title></path>';
 }
 for(const [name] of ranked.slice(0,6)){
  const p=group.places.find(x=>x[0]===name);if(!p)continue;const xy=near(st,p[1],p[2]);
  svg+='<text class="cm-label" x="'+xy[0].toFixed(1)+'" y="'+xy[1].toFixed(1)+'" text-anchor="middle">'+esc(displayName(st,name).length>15?displayName(st,name).slice(0,13)+"…":displayName(st,name))+'</text>';
 }
 svg+='</svg>';
 const chips=ranked.slice(0,5).map(([name,rr])=>'<button class="cm-chip" data-action="district" data-state="'+esc(st)+'" data-district="'+esc(name)+'">'+esc(displayName(st,name))+' · '+rr.length+'</button>').join("");
 return '<article class="cm-map-card'+(one?' cm-selected':'')+(dim?' cm-dim':'')+'"><div class="cm-map-head"><button data-action="state" data-state="'+esc(st)+'" title="Filter entire comparative dashboard to '+esc(st)+'">'+esc(st)+' ⌄</button><small>'+s.lit+'/'+group.features.length+' DISTRICTS LIT</small><div class="cm-zoom-controls"><button data-action="zoom" data-state="'+esc(st)+'" data-zoom="in" aria-label="Zoom into '+esc(st)+'">+</button><button data-action="zoom" data-state="'+esc(st)+'" data-zoom="out" aria-label="Zoom out from '+esc(st)+'">−</button></div></div>'+svg+
 '<div class="cm-map-foot">'+(chips||'<span class="cm-empty">No district-named report for current selection</span>')+
 (ranked.length>5?'<button class="cm-chip cm-quiet" data-action="state" data-state="'+esc(st)+'">View '+ranked.length+' districts</button>':'')+'</div></article>';
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

function districtResearch(st,name,ignoreIssue){
 return research.filter(r=>{
  if(!r.leader||r.state!==st)return false;
  const l=L(r.leader);if(!l)return false;
  if(view.leader!=="all"&&r.leader!==view.leader)return false;
  if(view.role!=="all"&&l.role!==view.role)return false;
  if(!ignoreIssue&&view.issue!=="all"&&r.issue!==view.issue)return false;
  if(r.kind==="News / broadcaster"&&view.publisher!=="all"&&r.publisher!==view.publisher)return false;
  if(view.term&&!([r.title,r.summary,r.detail,r.issue,r.publisher,l.name].filter(Boolean).join(" ").toLowerCase().includes(view.term)))return false;
  return mention(r,st).includes(name);
 });
}
function institutionalDistrict(st,name){
 return research.filter(r=>!r.leader&&r.state===st&&mention(r,st).includes(name)&&(view.issue==="all"||r.issue===view.issue));
}
function districtPicker(){
 const chosen=district?district.state+"|"+district.name:"";
 const opts=states.filter(st=>view.state==="all"||view.state===st).map(st=>'<optgroup label="'+esc(st)+'">'+geo[st].places.map(p=>{
  const val=st+"|"+p[0];
  return '<option value="'+esc(val)+'"'+(chosen===val?' selected':'')+'>'+esc(displayName(st,p[0]))+'</option>';
 }).join("")+'</optgroup>').join("");
 return '<div class="cm-district-toolbar"><div class="cm-toolbar-title"><b>District dossier navigator</b><span>Leader + district shows every issue · Leader + issue illuminates all mentioned districts</span></div>'+
 '<select id="cmDistrictPicker" class="cm-selector" aria-label="Choose an actual administrative district"><option value="">Select any district from these three states</option>'+opts+'</select>'+
 '<button class="cm-button" data-action="allIssues">All ten issues</button>'+
 '<button class="cm-button" data-action="tab" data-open-tab="official">Government circulars · '+gov.officialRecords.length+'</button>'+
 '<button class="cm-button" data-action="tab" data-open-tab="assembly">Vidhan Sabha records · '+gov.assemblyRecords.length+'</button>'+
 '<button class="cm-button" data-action="tab" data-open-tab="social">Original X links · '+data.posts.filter(x=>x.platform==="X").length+'</button></div>';
}
function details(){
 const all=states.flatMap(st=>[...stats[st].map].filter(x=>x[1].length).map(([name,rs])=>({st,name,rs}))).sort((a,b)=>b.rs.length-a.rs.length);
 if(!district){
 return '<div class="cm-detail"><div class="cm-detail-head"><strong>Geographic evidence dossier · Choose a district</strong><small>'+all.length+' highlighted districts under your current filters</small></div>'+
 '<p class="cm-summary">Select a chief minister or opposition leader, then choose a district on the map or in the district navigator. The ten-issue archive, X posts and links to original publisher reports will open together.</p>'+
 '<div class="cm-map-foot">'+all.slice(0,14).map(x=>'<button class="cm-chip" data-action="district" data-state="'+esc(x.st)+'" data-district="'+esc(x.name)+'">'+esc(displayName(x.st,x.name))+' · '+short[x.st]+' ('+x.rs.length+')</button>').join("")+'</div></div>';
 }
 const st=district.state,name=district.name;
 const allIssueItems=districtResearch(st,name,true);
 const current=districtResearch(st,name,false);
 const institution=institutionalDistrict(st,name);
 const unique=[...new Map(current.map(r=>[(r.kind||"")+":"+(r.url||r.id),r])).values()].sort((a,b)=>(b.date||"").localeCompare(a.date||""));
 const visible=showAll?unique:unique.slice(0,14);
 const leaderLabel=view.leader==="all"?"both state leaders":L(view.leader)?.name||"filtered leaders";
 const leadersForDiscovery=data.leaders.filter(l=>l.state===st&&(view.leader==="all"||view.leader===l.id)&&(view.role==="all"||view.role===l.role));
 const xDiscovery=leadersForDiscovery.map(l=>{
  const terms=["from:"+l.x,"since:2026-08-05","until:2026-11-06",displayName(st,name)];
  if(view.issue!=="all")terms.push(view.issue);
  const u="https://x.com/search?q="+encodeURIComponent(terms.join(" "))+"&src=typed_query";
  return '<a class="cm-x-search" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Search @'+esc(l.x)+' × '+esc(displayName(st,name))+' on X ↗ <small>(discovery search; not a verified post)</small></a>';
 }).join("");
 let issues='<div class="cm-issue-grid">';
 for(const t of data.issues){
  const count=allIssueItems.filter(r=>r.issue===t).length;
  issues+='<button class="cm-issue-tile'+(view.issue===t?' active':'')+'" data-action="issue" data-issue="'+esc(t)+'" title="'+esc(t)+' - '+count+' district-linked items"><span>'+esc(t)+'</span><b>'+count+'</b></button>';
 }
 issues+='</div>';
 const sections=data.issues.filter(t=>view.issue==="all"||view.issue===t).map(t=>{
  const rows=visible.filter(r=>r.issue===t);
  if(!rows.length)return "";
  return '<section class="cm-source-group"><div class="cm-source-group-head"><strong>'+esc(t)+'</strong><small>'+rows.length+' linked records shown</small></div><div class="cm-evidence">'+rows.map(evidence).join("")+'</div></section>';
 }).join("");
 const instParts=institution.length?'<section class="cm-source-group cm-institution-context"><div class="cm-source-group-head"><strong>Official/legislative references naming '+esc(displayName(st,name))+'</strong><small>'+institution.length+' institutional items · NOT leader statements</small></div>'+
 '<div class="cm-evidence">'+institution.slice(0,10).map(evidence).join("")+'</div></section>':'';
 return '<div class="cm-detail"><div class="cm-detail-head"><strong>'+esc(displayName(st,name)+' · '+st)+'</strong><small>'+allIssueItems.length+' items across ten issues · '+esc(leaderLabel)+'</small><button class="cm-button" data-action="close">Close district ×</button></div>'+
 '<p class="cm-summary">Reporting period: 5 August–5 November 2026. These counts describe indexed sources mentioning the district, not a measured incidence of events. Choose an issue below to highlight its other districts; return to all ten issues for the full district record.</p>'+
 '<div class="cm-social-discovery">'+xDiscovery+'</div>'+issues+
 '<div class="cm-detail-head cm-subheading"><strong>'+esc(view.issue==="all"?"Reporting on all ten issues":view.issue)+'</strong><small>'+unique.length+' source entries · '+unique.filter(x=>x.kind==="Original X link").length+' X permalinks</small></div>'+
 (unique.length?(sections||'<p class="cm-summary">No entries displayed under this filter.</p>')+(unique.length>14?'<p><button class="cm-button" data-action="more">'+(showAll?'Show fewer':'Show all '+unique.length+' original headlines')+'</button></p>':''):
 '<p class="cm-summary">No specific publisher source in the selected leader and issue combination names this district. It does not establish that no activity took place.</p>')+instParts+'</div>';
}
function render(){
 calculate();
 if(district&&view.state!=="all"&&district.state!==view.state)district=null;
 const k=[view.state,view.leader,view.role,view.issue,view.publisher,view.term,district?.name,district?.state,showAll,...states.map(st=>mapZoom[st])].join("|");if(k===key)return;key=k;
 const lit=states.reduce((n,s)=>n+stats[s].lit,0),unplaced=states.reduce((n,s)=>n+stats[s].unplaced,0),named=filtered.length-unplaced;
 root.innerHTML='<div class="cm-top"><div><div class="cm-overline">District-boundary evidence command center / Madhya Pradesh · Odisha · Jharkhand</div><h2>Three-state geographic intelligence · six leaders · ten issues</h2>'+
 '<p class="cm-summary">Real district polygons. Select a leader and district for reporting on all ten issues, or select a leader and issue to light up the districts mentioned in matching sources. Click any shaded district to open linked evidence.</p></div>'+
 '<div class="cm-action-row"><button class="cm-button" data-action="reset">Clear filters</button><a class="cm-button" target="_blank" rel="noopener noreferrer" href="./district-atlas.html">Full geographic atlas ↗</a></div></div>'+
 districtPicker()+
 '<div class="cm-totals"><span><b>'+lit+'</b> reporting-linked districts</span><span><b>'+filtered.length+'</b> matching source records</span><span><b>'+named+'</b> district-named source entries</span><span><b>'+unplaced+'</b> unplaced records preserved</span><span><b>109</b> district polygons</span></div>'+
 '<div class="cm-map-grid'+(view.state!=="all"||view.leader!=="all"?" cm-focused":"")+'">'+states.map(stateCard).join("")+'</div>'+flow()+details()+
 '<p class="cm-footnote">Real district boundaries © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>, ODbL 1.0, via <a href="https://github.com/Vardhan-Systems/vardhan-maps" target="_blank" rel="noopener noreferrer">vardhan-maps</a>. This is not an official Survey of India map. Madhya Pradesh 55; Odisha 30; Jharkhand 24 districts. Highlighting is based on explicit district references or documented place-name aliases in news and official materials; it is not incident geolocation, a measurement of political activity, or a census of all news. Statewide sources without district mentions remain in the research tabs.</p>';
}
function clickFilter(holder,key,val){const el=[...document.querySelectorAll(holder+' [data-'+key+']')].find(n=>n.getAttribute('data-'+key)===val);if(el){el.click();return true}return false}
function state(st){clickFilter("#states","state",view.state===st?"all":st)}
function leader(id){if(id!=="all"){const l=L(id);if(!l)return;if(view.state!=="all"&&view.state!==l.state)clickFilter("#states","state",l.state);if(view.role!=="all"&&view.role!==l.role)clickFilter("#roles","role","all")}
 clickFilter("#leaders","leader",view.leader===id?"all":id)}
function issue(id){if(id==="all"){clickFilter(".sidebar","issue","all");return}clickFilter("#issues","issue",id)}
function openDistrict(st,name,resetIssue){
 if(!geo[st]?.places.some(p=>p[0]===name))return;
 district={state:st,name};showAll=false;
 if(view.state!=="all"&&view.state!==st)clickFilter("#states","state",st);
 if(view.leader!=="all"&&L(view.leader)?.state!==st)clickFilter("#leaders","leader","all");
 if(resetIssue&&view.issue!=="all")clickFilter(".sidebar","issue","all");
 key="";render();root.querySelector(".cm-detail")?.scrollIntoView({behavior:"smooth",block:"nearest"});
}
root.addEventListener("change",ev=>{if(ev.target?.id==="cmDistrictPicker"&&ev.target.value){const sep=ev.target.value.indexOf("|");openDistrict(ev.target.value.slice(0,sep),ev.target.value.slice(sep+1),true)}});
root.addEventListener("click",ev=>{
 const b=ev.target.closest("[data-action]");if(!b||!root.contains(b))return;
 const action=b.getAttribute("data-action");
 if(action==="state")return state(b.getAttribute("data-state"));
 if(action==="leader")return leader(b.getAttribute("data-leader"));
 if(action==="issue")return issue(b.getAttribute("data-issue"));
 if(action==="district")return openDistrict(b.getAttribute("data-state"),b.getAttribute("data-district"),false);
 if(action==="tab"){const tab=b.getAttribute("data-open-tab");const button=document.querySelector('.tabs [data-tab="'+tab+'"]');if(button){button.click();button.scrollIntoView({behavior:"smooth",block:"center"})}return}
 if(action==="allIssues")return issue("all");
 if(action==="zoom"){const st=b.getAttribute("data-state"),factor=b.getAttribute("data-zoom")==="in"?1.5:1/1.5;mapZoom[st]=Math.max(1,Math.min(3.5,(mapZoom[st]||1)*factor));key="";return render()}
 if(action==="close"){district=null;showAll=false;key="";return render()}
 if(action==="more"){showAll=!showAll;key="";return render()}
 if(action==="reset"){district=null;showAll=false;for(const st of states)mapZoom[st]=1;clickFilter("#states","state","all");clickFilter("#roles","role","all");clickFilter("#leaders","leader","all");clickFilter(".sidebar","issue","all");const q=document.getElementById("q");if(q&&q.value){q.value="";q.dispatchEvent(new Event("input",{bubbles:true}))}const p=document.getElementById("publisher");if(p&&p.value!=="all"){p.value="all";p.dispatchEvent(new Event("change",{bubbles:true}))}key="";return render()}
});
root.addEventListener("keydown",ev=>{if((ev.key===" "||ev.key==="Enter")&&ev.target.matches("path[data-action='district']")){ev.preventDefault();ev.target.dispatchEvent(new MouseEvent("click",{bubbles:true}))}});
document.addEventListener("comparative:render",event=>{if(event.detail){view=Object.assign({},view,event.detail);key="";render()}});
render();
})();