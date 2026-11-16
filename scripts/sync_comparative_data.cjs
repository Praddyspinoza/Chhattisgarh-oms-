"use strict";
const fs=require("node:fs");
const path="comparative.html";
const d=JSON.parse(fs.readFileSync("comparative_states_2026.json","utf8"));
const gov=JSON.parse(fs.readFileSync("comparative_government_2026.json","utf8"));
let html=fs.readFileSync(path,"utf8");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const link=r=>/^https:\/\//.test(r)?esc(r):"#";
function classify(r){
 if(r.sourceType==="video"||r.type==="News-channel video")return "Video reports";
 if(r.sourceType==="headline-only"||r.status==="headline-index-only")return "Headline-only indexes";
 if(r.sourceType==="channel"||["NDTV","NDTV MPCG","Odisha TV","Bansal News","News18"].includes(r.publisher))return "News channels / broadcasters";
 return "Newspapers / digital news";
}
const records=d.records.slice().sort((a,b)=>b.date.localeCompare(a.date));
const posts=d.posts.slice().sort((a,b)=>b.date.localeCompare(a.date));
const bigHead=(label,count)=>'<div class="archive-head"><div><strong>'+esc(label)+'</strong><span>Click a headline to open its original source. Dates: 5 August–5 November 2026.</span></div><div>'+count+' DIRECT LINKS</div></div>';
function groupHeader(topic,quantity){
 return '<section class="topic-frame"><div class="topic-header"><span class="topic-number">'+String(d.issues.indexOf(topic)+1).padStart(2,"0")+'</span><div><h3>'+esc(topic)+'</h3><small>'+quantity+' sourced links</small></div></div>';
}
function leaderStart(l,n){
 return '<details class="leader-group" '+(n?'open':'')+'><summary><span class="leader-name">'+esc(l.name)+'</span><span>'+esc(l.state)+' · '+esc(l.role)+'</span><b>'+n+' link'+(n===1?'':'s')+'</b></summary>';
}
let reports=bigHead("NEWSPAPERS · NEWS CHANNELS · VIDEO",records.length);
for(const topic of d.issues){
 const topicRows=records.filter(r=>r.issue===topic);
 reports+=groupHeader(topic,topicRows.length);
 for(const l of d.leaders){
  const own=topicRows.filter(r=>r.leader===l.id);
  reports+=leaderStart(l,own.length);
  for(const k of ["Newspapers / digital news","News channels / broadcasters","Video reports","Headline-only indexes"]){
   const ss=own.filter(r=>classify(r)===k);
   if(!ss.length)continue;
   reports+='<div class="source-subhead">'+esc(k)+' <b>'+ss.length+'</b></div>';
   reports+=ss.map(r=>'<article class="source-row"><div class="source-top"><span class="publisher-name">'+esc(r.publisher)+'</span><time>'+esc(r.date)+'</time><span class="source-type">'+esc(k)+'</span></div><a class="source-headline" href="'+link(r.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.title)+' ↗</a><div class="source-details">'+esc(r.summary)+'</div><div class="source-bottom"><span>'+esc(r.type||"Article")+'</span><a href="'+link(r.url)+'" target="_blank" rel="noopener noreferrer">Open original publisher ↗</a></div></article>').join("");
  }
  if(!own.length)reports+='<div class="no-sources">No indexed source in this research batch. This is not evidence of inactivity.</div>';
  reports+='</details>';
 }
 reports+='</section>';
}
let social=bigHead("RECOVERED INDIVIDUAL X POST PERMALINKS · VIDEO",posts.length);
for(const topic of d.issues){
 const topicPosts=posts.filter(r=>r.issue===topic);
 social+=groupHeader(topic,topicPosts.length);
 for(const l of d.leaders){
  const own=topicPosts.filter(p=>p.leader===l.id);
  social+=leaderStart(l,own.length);
  for(const p of own){
   const headline=p.sourceHeadline||p.detail||"Post referenced by public reporting";
   social+='<article class="source-row"><div class="source-top"><span class="publisher-name">'+esc(p.platform)+' · @'+esc(l.x)+'</span><time>'+esc(p.date)+'</time><span class="source-type">PUBLISHER-REPORTED HEADING</span></div><a class="source-headline" href="'+link(p.url)+'" target="_blank" rel="noopener noreferrer">'+esc(headline)+' ↗</a><div class="source-bottom"><span>Reported by '+esc(p.publisher)+'</span><a href="'+link(p.publisherUrl)+'" target="_blank" rel="noopener noreferrer">Corroborating publisher ↗</a></div></article>';
  }
  if(!own.length)social+='<div class="no-sources">No original post permalink recovered under this issue. Historical X searches are available in the interactive account directory.</div>';
  social+='</details>';
 }
 social+='</section>';
}
const markers=[
  {id:"reportList",begin:"<!-- STATIC_COMPARE_REPORTS_START -->",end:"<!-- STATIC_COMPARE_REPORTS_END -->",content:reports},
  {id:"postList",begin:"<!-- STATIC_COMPARE_SOCIAL_START -->",end:"<!-- STATIC_COMPARE_SOCIAL_END -->",content:social}
];
for(const m of markers){
 const start=html.indexOf(m.begin),stop=html.indexOf(m.end);
 if(start>=0&&stop>start){html=html.slice(0,start+m.begin.length)+m.content+html.slice(stop);}
 else{
  const placeholder='<div id="'+m.id+'"></div>';
  if(!html.includes(placeholder))throw Error("Cannot locate "+m.id+" static container");
  html=html.replace(placeholder,'<div id="'+m.id+'">'+m.begin+m.content+m.end+'</div>');
 }
}
const gmarker='<script id="oms-comparative-government" type="application/json">';
const gs=html.indexOf(gmarker),ge=html.indexOf("</script>",gs+gmarker.length);
if(gs<0||ge<gs)throw Error("Government data script missing");
const governmentJson=JSON.stringify(gov).replace(/</g,"\\u003c").replace(/>/g,"\\u003e");
html=html.slice(0,gs+gmarker.length)+governmentJson+html.slice(ge);

const marker='<script id="oms-comparative-embedded" type="application/json">';
const begin=html.indexOf(marker),end=html.indexOf("</script>",begin+marker.length);
if(begin<0||end<0)throw Error("Data script missing");
const json=JSON.stringify(d).replace(/</g,"\\u003c").replace(/>/g,"\\u003e");
html=html.slice(0,begin+marker.length)+json+html.slice(end);
html=html.replace(/<strong id="nReports">[^<]*<\/strong>/,'<strong id="nReports">'+d.records.length+'</strong>');
html=html.replace(/<strong id="nPosts">[^<]*<\/strong>/,'<strong id="nPosts">'+d.posts.length+'</strong>');
html=html.replace(/<strong id="nSources">[^<]*<\/strong>/,'<strong id="nSources">'+new Set(d.records.map(r=>r.publisher)).size+'</strong>');
html=html.replace(/<strong id="nGov">[^<]*<\/strong>/,'<strong id="nGov">'+gov.officialRecords.length+'</strong>');
html=html.replace(/<strong id="nAssembly">[^<]*<\/strong>/,'<strong id="nAssembly">'+gov.assemblyRecords.length+'</strong>');

// Static initial issue dossier, so source headings remain visible without any JavaScript.
const initialTopic="Governance";
const initialNews=records.filter(x=>x.issue===initialTopic);
const initialPosts=posts.filter(x=>x.issue===initialTopic);
const htmlLink=(title,url,cls="")=>'<a class="'+cls+'" href="'+link(url)+'" target="_blank" rel="noopener noreferrer">'+esc(title)+' ↗</a>';
const auditTag=r=>r.linkCheck?.status==="http-reachable"?"LINK REACHABLE":r.linkCheck?.status==="restricted-or-rate-limited"?"ACCESS RESTRICTED":r.linkCheck?.status==="network-unconfirmed"?"LINK NOT CONFIRMED":"NOT AUDITED";
const kindTag=r=>r.sourceType==="video"||r.type==="News-channel video"?"BROADCAST VIDEO":r.sourceType==="channel"||["NDTV","NDTV MPCG","Odisha TV","Bansal News"].includes(r.publisher)?"NEWS CHANNEL":r.sourceType==="headline-only"||r.status==="headline-index-only"?"HEADLINE INDEX":"NEWSPAPER / NEWS";
const newsRow=r=>'<div class="dossier-link"><div class="dossier-byline"><b>'+esc(r.publisher)+'</b><time>'+esc(r.date)+'</time><span>'+esc(kindTag(r))+'</span><span>'+esc(auditTag(r))+'</span></div>'+htmlLink(r.title,r.url,"dossier-headline")+'<div class="dossier-subtitle">'+esc(r.type||"News report")+'</div></div>';
const postRow=p=>'<div class="dossier-link"><div class="dossier-byline"><b>X · @'+esc(d.leaders.find(l=>l.id===p.leader)?.x||"")+'</b><time>'+esc(p.date)+'</time><span>ORIGINAL POST URL</span></div>'+htmlLink(p.sourceHeadline||p.detail||"Publisher-referenced post",p.url,"dossier-headline")+'<div class="dossier-subtitle">Heading from publisher coverage · '+htmlLink("Corroborating report",p.publisherUrl)+'</div></div>';
let dossier='<div class="dossier-topic-header"><div><span class="eyebrow">SELECTED ISSUE · 03 / 10</span><h3>'+esc(initialTopic)+'</h3></div><span class="dossier-count">'+initialNews.length+' news · '+initialPosts.filter(p=>p.platform==="X").length+' X posts</span></div>';
for(const l of d.leaders){
 const lr=initialNews.filter(r=>r.leader===l.id);
 const lp=initialPosts.filter(p=>p.leader===l.id);
 dossier+='<article class="dossier-leader"><header class="dossier-person"><div><strong>'+esc(l.name)+'</strong><span>'+esc(l.state)+' · '+esc(l.role)+' · '+esc(l.party)+'</span></div><b>'+lr.length+' news / '+lp.length+' posts</b></header><div class="dossier-columns">';
 dossier+='<section class="dossier-panel"><div class="dossier-panel-head">NEWSPAPER & BROADCAST REPORTS <b>'+lr.length+'</b></div>'+(lr.length?lr.map(newsRow).join(""):'<p class="dossier-empty">No item captured for this leader and issue.</p>')+'</section>';
 dossier+='<section class="dossier-panel"><div class="dossier-panel-head">ORIGINAL X / VIDEO LINKS <b>'+lp.length+'</b></div>'+(lp.length?lp.map(postRow).join(""):'<p class="dossier-empty">No dated original post link recovered for this issue.</p>')+'</section></div></article>';
}

function statKind(g){return g.provenance==="official-register"?"OFFICIAL REGISTRY":g.provenance==="official-document"?"ORIGINAL GOVT PDF":"UNCONFIRMED PORTAL";}
function institutionLine(g,kind){
 const tag=kind==="order"?statKind(g):g.provenance==="official-assembly-index"?"ASSEMBLY INDEX":"PUBLISHER-REPORTED HOUSE RECORD";
 const author=kind==="order"?g.authority:g.recordType;
 return '<div class="institution-item"><div class="institution-meta"><time>'+esc(g.date)+'</time><b>'+esc(author)+'</b><span>'+esc(tag)+'</span></div>'+
 '<a class="institution-headline" href="'+link(g.url)+'" target="_blank" rel="noopener noreferrer">'+esc(g.title)+' ↗</a><p>'+esc(g.summary)+'</p></div>';
}
const states=["Madhya Pradesh","Odisha","Jharkhand"];
let govtBox='<div class="institution-dossier-block"><div class="institution-block-heading"><div><span class="eyebrow">STATE ACTIONS / LEGISLATIVE OVERSIGHT</span><h3>Official orders &amp; Vidhan Sabha: '+esc(initialTopic)+'</h3></div></div><p class="institution-disclaimer">State department records and legislative references are not personally attributable to the CM or opposition leader without direct evidence.</p>';
for(const st of states){
 const orders=gov.officialRecords.filter(x=>x.state===st&&x.issue===initialTopic);
 const house=gov.assemblyRecords.filter(x=>x.state===st&&x.issue===initialTopic);
 const session=gov.sessionNotes.find(x=>x.state===st);
 govtBox+='<details class="institution-state" open><summary><strong>'+esc(st)+'</strong><span>'+orders.length+' official · '+house.length+' assembly</span></summary><div class="institution-two"><div class="institution-part"><div class="institution-part-heading">GOVERNMENT ORDERS / NOTICES <b>'+orders.length+'</b></div>'+(orders.length?orders.map(x=>institutionLine(x,"order")).join(""):'<p class="dossier-empty">No indexed in-window order yet for this issue.</p>')+'</div><div class="institution-part"><div class="institution-part-heading">VIDHAN SABHA RECORDS <b>'+house.length+'</b></div><p class="institution-status">'+esc(session?.start?session.start+" to "+session.end:"No plenary sitting during the requested window")+'</p>'+(house.length?house.map(x=>institutionLine(x,"house")).join(""):'<p class="dossier-empty">No issue-specific House record recovered.</p>')+'</div></div></details>';
}
govtBox+='</div>';
dossier+=govtBox;
// Keep static issue selector visually aligned to the default selected topic.
html=html.replace(/class="topic-choice active" data-dossier-topic="Tribal Issues"/,'class="topic-choice " data-dossier-topic="Tribal Issues"');
html=html.replace(/class="topic-choice " data-dossier-topic="Governance"/,'class="topic-choice active" data-dossier-topic="Governance"');

const dossierStart="<!-- STATIC_DOSSIERS_START -->",dossierEnd="<!-- STATIC_DOSSIERS_END -->";
const ds=html.indexOf(dossierStart),de=html.indexOf(dossierEnd);
if(ds>=0&&de>ds)html=html.slice(0,ds+dossierStart.length)+dossier+html.slice(de);

fs.writeFileSync(path,html,"utf8");
console.log(JSON.stringify({reportLinks:records.length,postLinks:posts.length,leaderCount:d.leaders.length,issues:d.issues.length,htmlBytes:Buffer.byteLength(html)}));
