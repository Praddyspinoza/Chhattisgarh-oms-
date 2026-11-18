
(function(){
"use strict";
const START="2026-08-05",END="2026-11-05";
const colors=["#79c4b7","#e2bf7d","#b7a0cd","#77a8ca","#e7a3a2","#abbf89","#6daaa7","#95a0d6","#cfa983","#b0b9c4","#607c85"];
const topics=["Tribal Issues","Religion / Hinduism","Governance","Minerals","Mining","Agriculture & Farmers","Internal Security & Bastar","Infrastructure & Development","Education, Healthcare & Employment","Environment & Forests"];
const short=["Tribal","Religion","Governance","Minerals","Mining","Agriculture","Security","Infrastructure","Education/Health","Environment"];
const e=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safe=s=>{try{const u=new URL(String(s));return u.protocol==="https:"?u.href:"";}catch{return ""}};
const el=id=>document.getElementById(id);
const parse=id=>{try{return JSON.parse(el(id)?.textContent||"null")}catch{return null}};
const uid=p=>String(p.url||"").replace(/[?#].*$/,"").toLowerCase();
const dateOfX=s=>{try{const m=String(s).match(/\/status\/(\d{18,20})/);return m?new Date(Number((BigInt(m[1])>>22n)+1288834974657n)).toISOString().slice(0,10):""}catch{return ""}};
const isIn=d=>String(d)>=START&&String(d)<=END;
function boot(){
const view=el("v12-links");
if(!view||el("cgcmpSocial"))return;
let legacy=document.createElement("div");legacy.id="cgcmpLegacy";legacy.hidden=true;legacy.style.display="none";
while(view.firstChild)legacy.appendChild(view.firstChild);
view.appendChild(legacy);
const host=document.createElement("div");host.id="cgcmpSocial";host.className="cgcmp";view.insertBefore(host,legacy);
let social=parse("cg26SocialJSON")||{accounts:[],posts:[],supplementaryAccounts:[]},meta=parse("cgMetaSeed")||{accounts:[]};
let imports=[],invalidImports=0;
const st={group:"all",leader:"all",issue:"all",platform:"all",quality:"all",sort:"recent",q:""};
const metaMap=new Map();
for(const a of meta.accounts||[]){if(!a.leader)continue;const record=metaMap.get(a.leader)||{};if(a.facebook?.url&&a.facebook.status!=="unverified")record.facebook=a.facebook.url;
if(a.instagram?.url&&a.instagram.status!=="unverified")record.instagram=a.instagram.url;metaMap.set(a.leader,record);}
let cmb=()=>social.accounts||[];
function groupOf(a){if(a.group==="Official office")return "Official CMO";
if(a.group==="Opposition")return "Opposition";
if(a.group==="BJP / Government")return "BJP / Government";
return (/police|department|chief electoral|official/i.test(a.name+" "+(a.role||"")))?"Other official accounts":"Other ministers";}
function accounts(){return cmb().concat(social.supplementaryAccounts||[])}
function accountName(p){if(p.leader)return p.leader;const a=accounts().find(a=>a.handle?.toLowerCase()===String(p.handle||"").toLowerCase());return a?.name||"Unknown account"}
function groupOfPost(p){return groupOf(accounts().find(a=>a.name===accountName(p))||{group:"Unknown"})}
function checkedPost(p){if(!p||!p.url)return false;const u=safe(p.url);const platform=p.platform||"X";
if(platform==="X"){const derived=dateOfX(u);const m=u.match(/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/([a-z0-9_]+)\/status\/(\d{18,20})/i);if(!m||!isIn(derived))return false;
const a=accounts().find(x=>x.handle?.toLowerCase()===m[1].toLowerCase());return !!a&&(!p.date||Math.abs(Date.parse(p.date)-Date.parse(derived))<=86400000);}
return isIn(p.date)&&platform!=="X";
}
function sourcePosts(){const map=new Map();for(const p of [].concat(social.posts||[],imports)){
 if(!checkedPost(p))continue;
 const id=uid(p);if(!map.has(id))map.set(id,{...p,leader:accountName(p),platform:p.platform||"X",issue:topics.includes(p.issue)?p.issue:"Unclassified"});
 else if(p.originalPageConfirmed)map.set(id,{...map.get(id),...p,leader:accountName(p)});
}
return [...map.values()];
}
function groupRecords(){return sourcePosts().filter(p=>(st.group==="all"||groupOfPost(p)===st.group)&&(st.leader==="all"||p.leader===st.leader)&&(st.platform==="all"||p.platform===st.platform));}
function filtered(){let rows=groupRecords().filter(p=>(st.issue==="all"||p.issue===st.issue)&&
 (st.quality==="all"||(st.quality==="direct"&&p.originalPageConfirmed)||(st.quality==="publisher"&&!p.originalPageConfirmed&&p.publisherUrl)||(st.quality==="import"&&p.importLocal))&&
 (!st.q||[p.title,p.leader,p.handle,p.issue,p.date,p.publisherName,p.textExcerpt].join(" ").toLowerCase().includes(st.q)));
 rows.sort((a,b)=>st.sort==="oldest"?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
 return rows;
}
function options(items,selected){return items.map(x=>'<option value="'+e(x.value)+'"'+(x.value===selected?' selected':'')+'>'+e(x.label)+'</option>').join("")}
function build(){
host.innerHTML=
'<div class="cgcmp-hero"><div class="cgcmp-hero-top"><div><span class="cgcmp-cap">CHHATTISGARH / COMPARATIVE-STYLE SOCIAL INTELLIGENCE · V14</span>'+
'<h1>Leader × Issue × <em>Original Social Posts</em></h1><p>20 monitored leaders, the institutional Chief Minister’s Office, and other relevant ministerial sources. Ten public-policy issues. A dated, click-through original-post archive arranged in the same issue → leader → headline structure as the three-state comparative dashboard.</p></div>'+
'<a class="cgcmp-link" href="./comparative.html" target="_blank" rel="noopener noreferrer">See three-state reference ↗</a></div>'+
'<div class="cgcmp-platformtabs" id="cgcmpPlatformTabs" role="group" aria-label="Source platform"><button data-p="all" aria-pressed="true">ALL SOCIAL</button><button data-p="X" aria-pressed="false">X / TWITTER</button><button data-p="Facebook" aria-pressed="false">FACEBOOK</button><button data-p="Instagram" aria-pressed="false">INSTAGRAM</button></div></div>'+
'<div id="cgcmpStats" class="cgcmp-metrics" aria-live="polite"></div>'+
'<div class="cgcmp-body"><aside class="cgcmp-aside" aria-label="Leader and issue filters">'+
'<section class="cgcmp-box"><span class="cgcmp-cap">01 / RESEARCH CONTROLS</span><h2>Select leader and issue together</h2>'+
'<div class="cgcmp-control"><label for="cgcmpGroup">Political affiliation / official group</label><select id="cgcmpGroup">'+options([{value:"all",label:"All leaders + offices"},{value:"Opposition",label:"Opposition — 10"},{value:"BJP / Government",label:"BJP / Government — 10"},{value:"Official CMO",label:"Chief Minister’s Office"},{value:"Other ministers",label:"Additional ministers"},{value:"Other official accounts",label:"Other official departments"}],"all")+'</select></div>'+
'<div class="cgcmp-control"><label for="cgcmpLeader">Leader / institutional account</label><select id="cgcmpLeader"><option value="all">All monitored accounts</option></select></div>'+
'<div class="cgcmp-control"><label for="cgcmpIssue">Policy issue</label><select id="cgcmpIssue"><option value="all">All 10 issues</option></select></div>'+
'<div class="cgcmp-control"><label for="cgcmpQuality">Evidence standard</label><select id="cgcmpQuality"><option value="all">All source-linked posts</option><option value="direct">Original public X page checked</option><option value="publisher">Publisher-linked only</option><option value="import">Browser-local Apify import</option></select></div>'+
'<div class="cgcmp-control"><label for="cgcmpSearch">Search headlines / authors</label><input type="search" id="cgcmpSearch" placeholder="Headline, leader, issue, date…"></div>'+
'<div class="cgcmp-control"><label for="cgcmpSort">Date order</label><select id="cgcmpSort"><option value="recent">Newest first</option><option value="oldest">Oldest first</option></select></div>'+
'<div class="cgcmp-collection"><button class="cgcmp-btn subtle" id="cgcmpReset" type="button">Reset filters</button><button class="cgcmp-btn" id="cgcmpExport" type="button">Export CSV ↗</button></div><p class="cgcmp-footer">Fixed 05 AUG–05 NOV 2026. No source dated 06 November onward is counted here.</p></section>'+
'<section class="cgcmp-box"><span class="cgcmp-cap">02 / INDIVIDUAL LEADERS</span><div id="cgcmpLeaderList" class="cgcmp-selectlist"></div></section>'+
'<section class="cgcmp-box"><span class="cgcmp-cap">03 / ISSUE MATRIX</span><div id="cgcmpIssueList" class="cgcmp-topics"></div></section></aside>'+
'<main class="cgcmp-main"><section class="cgcmp-box"><div class="cgcmp-headlinebar"><div><span class="cgcmp-cap">INDIVIDUAL ORIGINAL-POST HEADLINES</span><h2>X / Facebook / Instagram source library</h2></div><span id="cgcmpResultCount" class="cgcmp-badge"></span></div>'+
'<div class="cgcmp-brief">Select any issue and any leader simultaneously. Every headline links to its exact post; where an original page could not be checked, a separate publisher link explains the evidence. Unclassified greetings and ceremonies never inflate policy-issue counts. The original post archive is not a complete platform export.</div>'+
'<div id="cgcmpLedger" class="cgcmp-ledger" aria-live="polite"></div></section>'+
'<div class="cgcmp-vizrow"><section class="cgcmp-box"><div class="cgcmp-headlinebar"><div><span class="cgcmp-cap">ISSUE SHARE / ACCOUNT-SPECIFIC</span><h2 id="cgcmpPieTitle">Indexed X issue share</h2></div></div><div id="cgcmpPie" class="cgcmp-donutbox"></div><p class="cgcmp-footer">Shares use only posts indexed here, not all posts published by a leader. Provisional topic assignments may change upon editorial review.</p></section>'+
'<section class="cgcmp-box"><span class="cgcmp-cap">ORIGINAL SOURCES & COVERAGE</span><h2>Leader / office coverage</h2><div id="cgcmpCoverage" class="cgcmp-accountgrid"></div></section></div>'+
'<section class="cgcmp-box"><span class="cgcmp-cap">TWENTY LEADERS × TEN POLICY ISSUES</span><h2>Clickable social evidence matrix</h2><p>Each number is an indexed original status URL under the primary issue. Select a number to open that leader × topic combination above. A dash is an archive gap, not a count of the person’s actual posts.</p><div class="cgcmp-matrixwrap" id="cgcmpMatrix"></div></section>'+
'<section class="cgcmp-box"><span class="cgcmp-cap">META / PUBLIC ACCOUNT INTELLIGENCE</span><h2>Facebook and Instagram post collection</h2><p>No full historical Facebook or Instagram dataset has been authenticated in this repository. Public profile links and source collections are available below, but an account link is not counted as an original post.</p><div id="cgcmpMetaAccounts" class="cgcmp-accountgrid"></div></section>'+
'<section class="cgcmp-box"><span class="cgcmp-cap">APIFY × X / META / BROWSER-LOCAL COLLECTION</span><h2>Source additional historical posts</h2>'+
'<p>Prepared date-bounded collection inputs for X, Facebook Pages and Instagram. Apify Actor execution requires your Apify connection or token; the published website contains no credentials. A JSON/CSV export can be imported into this browser for provisional review; imports are not saved publicly until committed to the repository.</p>'+
'<div class="cgcmp-collection"><a class="cgcmp-link" href="https://apify.com/winterlock/x-tweet-scraper" target="_blank" rel="noopener noreferrer">X Actor ↗</a>'+
'<a class="cgcmp-link" href="https://apify.com/apify/facebook-posts-scraper" target="_blank" rel="noopener noreferrer">Facebook Actor ↗</a>'+
'<a class="cgcmp-link" href="https://apify.com/nologin/instagram-scraper" target="_blank" rel="noopener noreferrer">Instagram Actor ↗</a>'+
'<a class="cgcmp-link" href="./apify_x_2026_input.json" target="_blank" rel="noopener noreferrer">X JSON input ↗</a>'+
'<a class="cgcmp-link" href="./apify_facebook_2026_input.json" target="_blank" rel="noopener noreferrer">Facebook JSON input ↗</a>'+
'<a class="cgcmp-link" href="./apify_instagram_2026_input.json" target="_blank" rel="noopener noreferrer">Instagram JSON input ↗</a></div>'+
'<div class="cgcmp-collection"><label class="cgcmp-btn" for="cgcmpImport">Import Apify JSON</label><input id="cgcmpImport" type="file" accept=".json,application/json"><button class="cgcmp-btn subtle" type="button" id="cgcmpImportClear">Clear browser-local imports</button></div>'+
'<p id="cgcmpImportStatus" class="cgcmp-collection-status" role="status">Original author, post URL and publication window are checked for each imported record. Unknown ownership or missing timestamps are rejected.</p>'+
'<div class="cgcmp-provenance"><div><b>X evidence:</b> original public-page author/date checks and separately publisher-linked status URLs, without claiming authenticated X API access.</div>'+
'<div><b>Meta evidence:</b> independently source-linked Facebook/Instagram posts are zero until eligible actor output is reviewed. Public account references are not post counts.</div></div></section></main></div>'+
'<p class="cgcmp-footer">Source integrity: 05 Aug–05 Nov 2026 inclusive (UTC-day window). Historical tweets may have been edited/deleted after indexing. Images, shares, reactions, comments, search result estimates and publisher articles are not counted as first-party posts.</p>';
}
function setSelects(){
const all=accounts(),list=all.filter(a=>st.group==="all"||groupOf(a)===st.group);
el("cgcmpLeader").innerHTML=options([{value:"all",label:"All authors / offices"}].concat(list.map(a=>({value:a.name,label:a.name+(a.handle?"  @"+a.handle:"  (no confirmed X)")}))),st.leader);
el("cgcmpIssue").innerHTML=options([{value:"all",label:"All 10 issues + unclassified"}].concat(topics.map(x=>({value:x,label:x})),[{value:"Unclassified",label:"Unclassified / ceremonial"}]),st.issue);
}
function drawStats(){
const all=sourcePosts(),coreNames=new Set(cmb().map(x=>x.name));let core=all.filter(p=>coreNames.has(p.leader));
let xs=all.filter(p=>p.platform==="X"),direct=xs.filter(p=>p.originalPageConfirmed).length;
let metaPosts=all.filter(p=>p.platform==="Facebook"||p.platform==="Instagram"),accountCovered=new Set(core.map(p=>p.leader)).size;
let values=[[xs.length,"Distinct in-window X status URLs"],[direct,"Public X status pages checked"],[xs.length-direct,"Publisher-linked / imported X URLs"],[metaPosts.length,"Indexed Meta original-post links"],[accountCovered+" / "+coreNames.size,"Core leader / CMO accounts with source links"]];
el("cgcmpStats").innerHTML=values.map(x=>'<div class="cgcmp-stat"><strong>'+e(x[0])+'</strong><small>'+e(x[1])+'</small></div>').join("");
}
function renderControls(){
setSelects();
const all=groupRecords();
const names=accounts().filter(a=>st.group==="all"||groupOf(a)===st.group);
el("cgcmpLeaderList").innerHTML=names.map(a=>{
let n=all.filter(p=>p.leader===a.name).length;return '<button class="cgcmp-person" type="button" data-leader="'+e(a.name)+'" aria-pressed="'+(st.leader===a.name)+'"><span>'+e(a.name)+'</span><small>'+n+' linked</small></button>';}).join("");
const counts=Object.fromEntries(topics.map(t=>[t,all.filter(x=>x.issue===t).length]));
el("cgcmpIssueList").innerHTML=topics.map((t,i)=>'<button type="button" class="cgcmp-topic" data-issue="'+e(t)+'" aria-pressed="'+(st.issue===t)+'"><span class="cgcmp-topic-number">'+String(i+1).padStart(2,"0")+'</span><span>'+e(t)+'</span><b>'+counts[t]+'</b></button>').join("");
for(const b of el("cgcmpPlatformTabs").querySelectorAll("[data-p]"))b.setAttribute("aria-pressed",String(b.getAttribute("data-p")===st.platform));
}
function sourceItem(p){
const tag=p.importLocal?"APIFY IMPORT · NOT RECHECKED":p.originalPageConfirmed?"ORIGINAL PAGE CHECKED":"PUBLISHER-LINKED POST";
const report=p.publisherUrl&&safe(p.publisherUrl)&&uid({url:p.publisherUrl})!==uid(p)?'<a href="'+e(safe(p.publisherUrl))+'" target="_blank" rel="noopener noreferrer">Publisher corroboration ↗</a>':"";
const provisional=p.issueCoding==="keyword_provisional"?" · issue coding provisional":"";
return '<article class="cgcmp-post"><div class="cgcmp-post-meta"><span>'+e(p.date)+'</span><span>·</span><span>'+e(p.platform||"X")+' · '+e(p.handle?"@"+p.handle:p.leader)+'</span><span class="cgcmp-badge">'+e(tag)+'</span></div>'+
'<a class="cgcmp-post-title" href="'+e(safe(p.url))+'" target="_blank" rel="noopener noreferrer">'+e(p.title||"Original post link · excerpt not available")+' ↗</a>'+
'<div class="cgcmp-post-links"><a href="'+e(safe(p.url))+'" target="_blank" rel="noopener noreferrer">Open exact original post ↗</a>'+report+'</div>'+
(provisional?'<div class="cgcmp-footer">'+e(provisional)+'</div>':'')+'</article>';
}
function renderLedger(){
const all=filtered(),issueNames=st.issue==="all"?topics.concat("Unclassified"):[st.issue],leaders=accounts().filter(a=>(st.group==="all"||groupOf(a)===st.group)&&(st.leader==="all"||a.name===st.leader));
el("cgcmpResultCount").textContent=all.length+" MATCHING ORIGINAL LINKS";
let blocks=[];
for(let idx=0;idx<issueNames.length;idx++){
const t=issueNames[idx],posts=all.filter(x=>x.issue===t);
if(!posts.length&&st.issue==="all"&&st.leader!=="all")continue;
let body="";
const wanted=leaders.filter(a=>posts.some(p=>p.leader===a.name));
if(st.leader!=="all"&&!wanted.length){
body='<div class="cgcmp-empty">No indexed source link for '+e(st.leader)+' on '+e(t)+'. This does not establish that no original post was published.</div>';
}else if(!wanted.length){
body='<div class="cgcmp-empty">No original post yet indexed under this policy issue. This is a documented collection gap.</div>';
}else{
body=wanted.map((a,i)=>{
const ps=posts.filter(p=>p.leader===a.name);
return '<details class="cgcmp-leadergroup"'+((st.leader!=="all"||i<2)?' open':'')+'><summary><span class="cgcmp-leadername">'+e(a.name)+'</span><small>'+e(groupOf(a))+'</small><b>'+ps.length+' links</b></summary>'+ps.map(sourceItem).join("")+'</details>';
}).join("");
const other=leaders.length-wanted.length;if(other>0)body+='<div class="cgcmp-footer">'+other+' other monitored accounts have no indexed post for this issue in the current source set.</div>';
}
blocks.push('<details class="cgcmp-frame" '+(st.issue!=="all"||posts.length&&idx<2?'open':'')+'><summary><span class="num">'+String(idx+1).padStart(2,"0")+'</span><span class="txt"><strong>'+e(t)+'</strong><small>Original individual X / Meta URLs grouped by author</small></span><span class="count">'+posts.length+' linked</span></summary><div class="cgcmp-frame-content">'+body+'</div></details>');
}
el("cgcmpLedger").innerHTML=blocks.length?blocks.join(""):'<div class="cgcmp-empty">No original post link matches the selected leader, issue, platform or search terms. Change filters or browse the account directory. Do not infer zero posts from this archive gap.</div>';
}
function renderPie(){
const rows=groupRecords(),values=new Map(),keys=topics.concat("Unclassified");
for(const t of keys)values.set(t,rows.filter(x=>x.issue===t).length);
const items=keys.filter(x=>values.get(x)),sum=rows.length;let pos=0,slices=[];
for(const t of items){let pct=100*(values.get(t)/(sum||1)),i=keys.indexOf(t);slices.push(colors[i%colors.length]+' '+pos.toFixed(3)+'% '+(pos+pct).toFixed(3)+'%');pos+=pct;}
const pieBg=slices.length?'conic-gradient('+slices.join(',')+')':'#273f4c';
const circle='<div class="cgcmp-donut" style="background:'+e(pieBg)+'"><div><strong>'+sum+'</strong><small>indexed posts</small></div></div>';
const legend='<div class="cgcmp-legend">'+(items.length?items.map(t=>{
const p=values.get(t),i=keys.indexOf(t);
return '<button type="button" data-issue="'+e(t)+'"><i class="dot" style="background:'+colors[i%colors.length]+'"></i><span>'+e(t)+'</span><span class="pct">'+Math.round(p*100/sum)+'%</span></button>';
}).join(""):'<p>No issue-linked posts indexed for current filter.</p>')+'</div>';
el("cgcmpPieTitle").textContent=(st.leader==="all"?"All source accounts":st.leader)+" · source share";
el("cgcmpPie").innerHTML=circle+legend;
}
function renderCoverage(){
let posts=sourcePosts(),names=accounts().filter(a=>st.group==="all"||groupOf(a)===st.group);
el("cgcmpCoverage").innerHTML=names.map(a=>{
let n=posts.filter(x=>x.leader===a.name).length;return '<button class="cgcmp-account" type="button" data-leader="'+e(a.name)+'"><strong>'+e(a.name)+'</strong><small>'+e(a.handle?"@"+a.handle:"Handle not independently confirmed")+'</small><small>'+n+' indexed originals · '+e(groupOf(a))+'</small></button>';
}).join("");
}
function renderMatrix(){
const rows=accounts().filter(a=>st.group==="all"||groupOf(a)===st.group);
const posts=sourcePosts();
let out='<table class="cgcmp-matrix"><thead><tr><th>Monitored leader / office</th>'+short.map(x=>'<th>'+e(x)+'</th>').join("")+'<th>Total</th></tr></thead><tbody>';
for(const a of rows){const by=posts.filter(p=>p.leader===a.name);out+='<tr><td><b>'+e(a.name)+'</b></td>';
for(const t of topics){const n=by.filter(p=>p.issue===t).length;out+=n?'<td><button type="button" data-matrix-leader="'+e(a.name)+'" data-matrix-issue="'+e(t)+'">'+n+'</button></td>':'<td class="missing">—</td>';}
out+='<td><button type="button" data-matrix-leader="'+e(a.name)+'" data-matrix-issue="all">'+by.length+'</button></td></tr>';
}
out+='</tbody></table>';
el("cgcmpMatrix").innerHTML=out;
}
function renderMeta(){
const names=accounts(),list=[];
const directory=parse("v12SocialLinksData")?.accounts||[];
for(const a of names){
const x=metaMap.get(a.name)||{};
for(const p of directory){if(p.person!==a.name||!["Facebook","Instagram"].includes(p.platform))continue;
if(p.platform==="Facebook")x.facebook=p.url;if(p.platform==="Instagram")x.instagram=p.url;}
if(x.facebook)list.push({name:a.name,kind:"Facebook",url:x.facebook});
if(x.instagram)list.push({name:a.name,kind:"Instagram",url:x.instagram});
}
el("cgcmpMetaAccounts").setAttribute("data-confirmed-public-account-links",String(list.length));
el("cgcmpMetaAccounts").innerHTML=list.length?list.map(x=>'<a href="'+e(safe(x.url))+'" class="cgcmp-account" style="text-decoration:none" target="_blank" rel="noopener noreferrer"><strong>'+e(x.name)+'</strong><small>'+e(x.kind)+' · public account reference ↗</small><small>Historical original posts not yet verified</small></a>').join(""):'<p>No validated public Meta account reference is available for this selection.</p>';
}
function render(){
drawStats();renderControls();renderLedger();renderPie();renderCoverage();renderMatrix();renderMeta();
}
function setIssue(t){st.issue=t;el("cgcmpIssue").value=t;render();el("cgcmpLedger").scrollIntoView({block:"nearest",behavior:"smooth"});}
function setLeader(name){st.leader=name;st.group="all";el("cgcmpGroup").value="all";render();el("cgcmpLedger").scrollIntoView({block:"nearest",behavior:"smooth"});}
function exportCSV(){
const labels=["Date","Leader","Group","Platform","Primary issue","Headline excerpt","Original post URL","Publisher URL","Source class"];
const quote=x=>'"'+String(x==null?"":x).replace(/"/g,'""')+'"';
const rows=filtered().map(p=>[p.date,p.leader,groupOfPost(p),p.platform,p.issue,p.title,p.url,p.publisherUrl,p.originalPageConfirmed?"original_public_page_checked":p.importLocal?"browser_local_import":"publisher_linked"].map(quote).join(","));
const blob=new Blob([[labels.join(","),...rows].join("\r\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob);
const a=document.createElement("a");a.href=url;a.download="chhattisgarh_social_2026_08_05_to_11_05.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function importApify(file){
if(!file)return;
file.text().then(txt=>{
const doc=JSON.parse(txt),items=Array.isArray(doc)?doc:(Array.isArray(doc.items)?doc.items:Array.isArray(doc.data)?doc.data:Array.isArray(doc.posts)?doc.posts:null);
if(!items)throw Error("Expected Apify array, or JSON object with items/data/posts array");
const roster=accounts(),map=new Map(roster.filter(a=>a.handle).map(a=>[a.handle.toLowerCase(),a])),knownMeta=new Map();
for(const a of roster){const m=metaMap.get(a.name)||{};for(const platform of ["facebook","instagram"]){if(!m[platform])continue;let part=new URL(m[platform]).pathname.replace(/^\/|\/$/g,"").toLowerCase();knownMeta.set(platform+":"+part,{account:a,source:m[platform]});}}
let count=0,rejected=0;const existing=new Set(sourcePosts().map(uid));for(const p of items){
let u=safe(p.url||p.twitterUrl||p.postUrl||p.postURL||p.postLink||p.link||"");
if(!u){rejected++;continue}
const x=u.match(/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]+)\/status\/(\d{18,20})/i);
let leader,handle,date,platform,title="",issue=topics.includes(p.issue)?p.issue:"Unclassified";
if(x){platform="X";handle=x[1];const owner=map.get(handle.toLowerCase());if(!owner){rejected++;continue}const author=String(p.author?.userName||p.author?.username||p.user?.username||p.user?.screen_name||"").replace(/^@/,"");if(author&&author.toLowerCase()!==handle.toLowerCase()){rejected++;continue}leader=owner.name;date=dateOfX(u);u="https://x.com/"+handle+"/status/"+x[2];}
else if(/^https:\/\/(?:www\.|m\.)?facebook\.com\//i.test(u)){
platform="Facebook";
const path=new URL(u).pathname.replace(/^\/|\/$/g,"").toLowerCase(),ownerPath=path.split("/")[0];
let match=[...knownMeta.entries()].find(([k])=>k==="facebook:"+ownerPath);
if(!match||!/\/posts\/|\/videos\/|\/reel\/|\/permalink\.php/i.test(u)){rejected++;continue}
leader=match[1].account.name;date=String(p.time||p.date||p.timestamp||p.postTime||p.createdAt||"").slice(0,10);handle=ownerPath;}
else if(/^https:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\//i.test(u)){
platform="Instagram";const user=String(p.ownerUsername||p.username||p.owner?.username||"").toLowerCase();const match=knownMeta.get("instagram:"+user);
if(!match){rejected++;continue}leader=match.account.name;handle=user;date=String(p.takenAt||p.timestamp||p.time||p.date||"").slice(0,10);}
else{rejected++;continue}
if(!isIn(date)||existing.has(uid({url:u}))){rejected++;continue}
title=String(p.text||p.fullText||p.caption||p.message||p.title||"").replace(/\s+/g," ").trim().split(" ").slice(0,20).join(" ").slice(0,170);
imports.push({id:"IMPORT-"+(count+1)+"-"+Date.now(),leader,handle,date,url:u,platform,issue,title:title||"Imported original public post URL · text unavailable",originalPageConfirmed:false,importLocal:true,issueCoding:"unreviewed_import",publisherName:"Apify uploaded dataset"});
existing.add(uid({url:u}));count++;
}
invalidImports+=rejected;
el("cgcmpImportStatus").textContent="Imported "+count+" author/date-checked candidate posts into this browser only. Rejected "+rejected+" duplicates, mismatched accounts, unsupported URLs or out-of-window dates. Imported content remains unreviewed and is not saved to GitHub.";
render();
}).catch(err=>{el("cgcmpImportStatus").textContent="Import rejected: "+e(err.message||err)}).finally(()=>{el("cgcmpImport").value=""});
}
function wire(){
el("cgcmpGroup").addEventListener("change",ev=>{st.group=ev.target.value;st.leader="all";render()});
el("cgcmpLeader").addEventListener("change",ev=>{st.leader=ev.target.value;render()});
el("cgcmpIssue").addEventListener("change",ev=>{st.issue=ev.target.value;render()});
el("cgcmpQuality").addEventListener("change",ev=>{st.quality=ev.target.value;render()});
el("cgcmpSort").addEventListener("change",ev=>{st.sort=ev.target.value;render()});
el("cgcmpSearch").addEventListener("input",ev=>{st.q=ev.target.value.trim().toLowerCase();render()});
el("cgcmpReset").addEventListener("click",()=>{
st.group="all";st.leader="all";st.issue="all";st.platform="all";st.quality="all";st.sort="recent";st.q="";
for(const id of ["cgcmpGroup","cgcmpQuality","cgcmpSort"])el(id).value=id==="cgcmpGroup"?"all":id==="cgcmpQuality"?"all":"recent";
el("cgcmpSearch").value="";render();
});
el("cgcmpExport").addEventListener("click",exportCSV);
el("cgcmpSocial").addEventListener("click",ev=>{
const b=ev.target.closest("[data-leader],[data-issue],[data-p],[data-matrix-leader]");
if(!b)return;
if(b.hasAttribute("data-matrix-leader")){st.group="all";st.leader=b.dataset.matrixLeader;st.issue=b.dataset.matrixIssue;el("cgcmpGroup").value="all";render();el("cgcmpLedger").scrollIntoView({block:"nearest",behavior:"smooth"});return;}
if(b.hasAttribute("data-leader")){setLeader(b.dataset.leader);return;}
if(b.hasAttribute("data-issue")){setIssue(b.dataset.issue);return;}
if(b.hasAttribute("data-p")){st.platform=b.dataset.p;render();return;}
});
el("cgcmpImport").addEventListener("change",ev=>importApify(ev.target.files?.[0]));
el("cgcmpImportClear").addEventListener("click",()=>{imports=[];el("cgcmpImportStatus").textContent="Browser-local imports cleared. Published source ledger remains untouched.";render()});
}
build();wire();render();
Promise.allSettled([
 fetch("./chhattisgarh_social_2026.json",{cache:"no-store"}).then(r=>r.ok?r.json():null),
 fetch("./apify_meta_2026_accounts.json",{cache:"no-store"}).then(r=>r.ok?r.json():null)
]).then(results=>{
 const s=results[0].status==="fulfilled"?results[0].value:null;
 const metaProfiles=results[1].status==="fulfilled"?results[1].value:null;
 if(s&&Array.isArray(s.accounts)&&Array.isArray(s.posts))social=s;
 if(metaProfiles&&Array.isArray(metaProfiles.accounts)){
   for(const profile of metaProfiles.accounts){
     if(!profile.name)continue;
     const existing=metaMap.get(profile.name)||{};
     if(profile.facebook)existing.facebook=profile.facebook;
     if(profile.instagram)existing.instagram=profile.instagram;
     metaMap.set(profile.name,existing);
   }
 }
 render();
}).catch(()=>{});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();


/* CM in Focus: issue-only, user-supplied Apify Facebook source archive. No other view changed. */
(function(){
"use strict";
const NAMES=["Tribal Issues","Religion / Hinduism","Governance","Minerals","Mining","Agriculture & Farmers","Internal Security & Bastar","Infrastructure & Development","Education, Healthcare & Employment","Environment & Forests"];
const COLORS=["#47c3aa","#d4b06b","#6c9fe0","#98b3c8","#b78d82","#9ac66d","#dd8476","#a38ed3","#d5a2bf","#63a6a1"];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safe=s=>{try{let u=new URL(s);return u.protocol==="https:"&&/(^|\.)facebook\.com$/.test(u.hostname)?u.href:""}catch{return""}};
let posts=[],page=1,loading=true,err="",issue="all",query="",limit=30,manifest=null;
function setup(){
 const parent=document.getElementById("v12-cm");
 const target=document.getElementById("v12CmPosts");
 if(!parent||!target||document.getElementById("cmApifyFocused"))return;
 const panel=document.createElement("section");panel.id="cmApifyFocused";panel.className="v12-panel";
 panel.style.cssText="margin:16px 0 20px;grid-column:1/-1;border:1px solid #3b5b60;border-radius:12px;padding:18px;background:rgba(6,20,27,.72)";
 panel.innerHTML='<div class="v12-cap">CM IN FOCUS / ORIGINAL FACEBOOK POST INTELLIGENCE</div><h3 style="margin:8px 0">Vishnu Deo Sai · Ten-issue Facebook archive</h3><p class="v12-hint">Source: user-supplied Apify public-page scraper export. Captions and dates are from the export; original Facebook URLs have not been independently live-checked. Classifications are provisional. Not Meta Graph API-verified. Archive coverage: 30 Sep–4 Nov 2026, not the entire requested 5 Aug–5 Nov period.</p><div id="cmApifySummary" class="v12-stats" style="margin:14px 0"></div><div class="v12-controls" style="margin:12px 0;display:flex;flex-wrap:wrap;gap:12px"><label>Issue<select id="cmApifyIssue"></select></label><label>Search captions<input id="cmApifySearch" type="search" placeholder="Keyword, scheme, district…" /></label><label>Rows<select id="cmApifyLimit"><option value="30">30 per page</option><option value="60">60 per page</option></select></label></div><div id="cmApifyDistribution"></div><div id="cmApifyRows" class="v12-evidence-list"></div><div id="cmApifyPagination" style="display:flex;gap:12px;align-items:center;margin-top:14px"></div>';
 target.parentElement.insertBefore(panel,target);
 const select=panel.querySelector("#cmApifyIssue");
 select.innerHTML='<option value="all">All ten issues</option>'+NAMES.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");
 select.addEventListener("change",e=>{issue=e.target.value;page=1;render()});
 panel.querySelector("#cmApifySearch").addEventListener("input",e=>{query=e.target.value.toLocaleLowerCase();page=1;render()});
 panel.querySelector("#cmApifyLimit").addEventListener("change",e=>{limit=Number(e.target.value);page=1;render()});
 const globalIssue=document.getElementById("v12CmIssue");
 if(globalIssue)globalIssue.addEventListener("change",e=>{issue=e.target.value;select.value=NAMES.includes(issue)?issue:"all";page=1;render()});
 render();
 load();
}
async function load(){
 try{
  const response=await fetch("./cm_facebook_issues_manifest_2026.json",{cache:"no-store"});
  if(!response.ok)throw Error("Issue-only manifest unavailable");
  manifest=await response.json();
  if(!manifest||manifest.posts_on_ten_issues!==339||!Array.isArray(manifest.files)||manifest.files.length!==9)throw Error("Unexpected archive manifest");
  const chunks=await Promise.all(manifest.files.map(async name=>{
    if(!/^cm_facebook_issues_2026_part\d{2}\.json$/.test(name))throw Error("Invalid part filename");
    const res=await fetch("./"+name,{cache:"no-store"});if(!res.ok)throw Error("Missing "+name);
    const body=await res.json();if(!body.issue_only||!Array.isArray(body.posts))throw Error("Invalid archive part");
    return body.posts;
  }));
  const all=chunks.flat();
  if(all.length!==339||new Set(all.map(p=>p.post_id)).size!==339)throw Error("Archive count or duplicate check failed");
  if(all.some(p=>!NAMES.includes(p.issue)||!safe(p.url)||p.date<"2026-08-05"||p.date>"2026-11-05"))throw Error("Out-of-scope post detected");
  posts=all.sort((a,b)=>String(b.published_utc).localeCompare(String(a.published_utc)));
 }catch(e){err=e.message||"Archive load failed"}finally{loading=false;render()}
}
function render(){
 const panel=document.getElementById("cmApifyFocused");if(!panel)return;
 const summary=panel.querySelector("#cmApifySummary"),distribution=panel.querySelector("#cmApifyDistribution"),list=panel.querySelector("#cmApifyRows"),nav=panel.querySelector("#cmApifyPagination");
 if(loading){list.textContent="Loading issue-matched original Facebook links…";return}
 if(err){list.textContent="Archive unavailable: "+err;return}
 const selected=posts.filter(p=>(issue==="all"||p.issue===issue)&&(!query||[p.text,p.title,p.issue,p.date].join(" ").toLocaleLowerCase().includes(query)));
 const c=Object.fromEntries(NAMES.map(n=>[n,selected.filter(p=>p.issue===n).length]));
 summary.innerHTML=[[posts.length,"Posts on the ten issues"],[manifest.posts_excluded_as_off_topic,"Off-topic posts excluded"],[selected.length,"Matching current filters"],[new Set(posts.map(p=>p.url)).size,"Distinct original Facebook URLs"]].map(([n,label])=>'<div class="v12-stat"><b>'+n+'</b><span>'+esc(label)+'</span></div>').join("");
 distribution.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:7px;margin:12px 0">'+NAMES.map((n,i)=>'<button type="button" data-cm-issue="'+i+'" style="cursor:pointer;background:#0c2030;border:1px solid '+COLORS[i]+';border-radius:20px;padding:7px 11px;color:#e3ebf1">'+esc(n)+' · '+c[n]+'</button>').join("")+'</div>';
 distribution.querySelectorAll("[data-cm-issue]").forEach(b=>b.addEventListener("click",()=>{issue=NAMES[Number(b.dataset.cmIssue)];panel.querySelector("#cmApifyIssue").value=issue;page=1;render()}));
 const pages=Math.max(1,Math.ceil(selected.length/limit));page=Math.min(page,pages);
 const visible=selected.slice((page-1)*limit,page*limit);
 list.innerHTML=visible.length?visible.map(p=>{
   const link=safe(p.url);
   const body=String(p.text||"").trim();
   const excerpt=body.length>750?body.slice(0,750)+"…":body;
   const engagement=["Likes: "+(p.likes??"—"),"Comments: "+(p.comments??"—"),"Shares: "+(p.shares??"—")].join(" · ");
   return '<article class="v12-evidence"><div class="v12-evidence-meta">'+esc(p.date)+' · Facebook · Vishnu Deo Sai · Scraper-exported</div><b>'+esc(p.title||"Original Facebook post")+'</b><p style="white-space:pre-wrap">'+esc(excerpt)+'</p><div class="v12-chiprow"><span class="v12-chip">'+esc(p.issue)+'</span>'+(p.secondaryIssues||[]).filter(n=>NAMES.includes(n)).map(n=>'<span class="v12-chip">'+esc(n)+'</span>').join("")+'</div><p class="v12-hint">'+esc(engagement)+' · Issue label provisional · Original link not independently checked</p><a class="v12-link" href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">Open original Facebook post ↗</a></article>';
 }).join(""):'<div class="v12-blank">No posts match this issue and search.</div>';
 nav.innerHTML='<button type="button" id="cmApifyPrev" '+(page===1?"disabled":"")+'>Previous</button><span>Page '+page+' of '+pages+' · '+selected.length+' posts</span><button type="button" id="cmApifyNext" '+(page===pages?"disabled":"")+'>Next</button>';
 nav.querySelector("#cmApifyPrev").addEventListener("click",()=>{page=Math.max(1,page-1);render()});
 nav.querySelector("#cmApifyNext").addEventListener("click",()=>{page=Math.min(pages,page+1);render()});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
