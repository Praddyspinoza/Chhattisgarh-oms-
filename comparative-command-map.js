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
 const s=stats[st],group=geo[st],one=view.state===st,dim=view.state!=="all"&&!one;
 const ranked=[...s.map].filter(([n,r])=>r.length).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));
 const max=Math.max(1,...ranked.map(x=>x[1].length));
 let svg='<svg class="cm-svg" viewBox="0 0 320 250" role="group" aria-label="'+esc(st)+' real district boundaries with reporting highlights">'+
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
 return '<article class="cm-map-card'+(one?' cm-selected':'')+(dim?' cm-dim':'')+'"><div class="cm-map-head"><button data-action="state" data-state="'+esc(st)+'" title="Filter entire comparative dashboard to '+esc(st)+'">'+esc(st)+' ⌄</button><small>'+s.lit+'/'+group.features.length+' DISTRICTS LIT</small></div>'+svg+
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