/* Comparative archive issue shares: counts are indexed items, not all posts published on X. */
(()=>{
"use strict";
const container=document.getElementById("comparisonAnalytics");
const node=document.getElementById("oms-comparative-embedded");
if(!container||!node)return;
let data;try{data=JSON.parse(node.textContent)}catch{return}
const leaders=data.leaders,issues=data.issues;
const palette=["#ddbd73","#d89275","#8ec4a8","#8cb7db","#d5a6d6","#a2ca7c","#bfa2ee","#78c7bd","#e2a7aa","#b8b8c6"];
const e=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let active={state:"all",leader:"all",issue:"all"};
const directX=data.posts.filter(p=>p.platform==="X"&&/^https:\/\/(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+/.test(p.url));
const news=data.records.filter(r=>/^https:\/\//.test(r.url)&&r.issue);
function counts(rows,id){
 const own=rows.filter(r=>r.leader===id);
 return{total:own.length,values:issues.map((key,i)=>({name:key,count:own.filter(r=>r.issue===key).length,index:i}))};
}
function pie(rows,id,tag,caption){
 const values=counts(rows,id);let angle=-Math.PI/2;
 let paths="";
 if(values.total){
  for(const item of values.values){
   if(!item.count)continue;
   const portion=item.count/values.total;
   if(portion>=.999999){
    paths+='<circle class="an-slice" cx="80" cy="80" r="57" fill="'+palette[item.index]+'" role="button" tabindex="0" data-an-leader="'+e(id)+'" data-an-issue="'+e(item.name)+'"><title>'+e(item.name+": "+item.count+" (100%)")+'</title></circle>';
    angle+=Math.PI*2;continue;
   }
   const a1=angle,a2=angle+portion*Math.PI*2,pt=a=>[(80+57*Math.cos(a)).toFixed(2),(80+57*Math.sin(a)).toFixed(2)];
   const start=pt(a1),end=pt(a2);
   const path="M80 80L"+start.join(" ")+"A57 57 0 "+(portion>.5?1:0)+" 1 "+end.join(" ")+"Z";
   paths+='<path class="an-slice" fill="'+palette[item.index]+'" d="'+path+'" role="button" tabindex="0" data-an-leader="'+e(id)+'" data-an-issue="'+e(item.name)+'"><title>'+e(item.name+": "+item.count+" ("+(100*portion).toFixed(1)+"%)")+'</title></path>';
   angle=a2;
  }
 }
 if(!values.total)paths='<circle cx="80" cy="80" r="57" fill="#293b52" stroke="#647389" stroke-dasharray="2 4"/>';
 const top=values.values.filter(x=>x.count).sort((a,b)=>b.count-a.count);
 const legend=top.length?top.map(item=>{
 const pct=(item.count/values.total*100).toFixed(1);
 return '<button class="an-legend" data-an-leader="'+e(id)+'" data-an-issue="'+e(item.name)+'" title="Filter to '+e(item.name)+'"><span class="an-swatch" style="background:'+palette[item.index]+'"></span><span class="an-issue-name">'+e(item.name)+'</span><strong>'+item.count+'</strong><small>'+pct+'%</small></button>';
 }).join(""):'<p class="an-empty">No verified post permalinks in this archive for this leader.</p>';
 return '<div class="an-figure" data-an-chart="'+tag+'"><div class="an-figure-title">'+e(caption)+'</div><div class="an-figure-body"><div class="an-pie-wrap"><svg class="an-donut" viewBox="0 0 160 160" aria-label="'+e(caption+' issue distribution for '+id)+'">'+paths+'<circle class="an-hole" cx="80" cy="80" r="35"/><text x="80" y="76" class="an-n">'+values.total+'</text><text x="80" y="93" class="an-n-caption">INDEXED</text></svg></div>'+
 '<div class="an-legend-list">'+legend+'</div></div></div>';
}
function render(){
 const shown=leaders.map(l=>{
 const a=counts(directX,l.id),b=counts(news,l.id);
 const faded=active.leader!=="all"&&active.leader!==l.id||active.state!=="all"&&active.state!==l.state;
 return '<article class="an-leader'+(faded?' an-faded':'')+'" data-an-card="'+e(l.id)+'"><div class="an-leader-head"><div><strong>'+e(l.name)+'</strong><span>'+e(l.state)+' · '+e(l.role)+' · '+e(l.party||"")+'</span></div><div class="an-badges"><span>'+a.total+' X permalinks</span><span>'+b.total+' news entries</span></div></div>'+
 '<div class="an-leader-grid">'+pie(directX,l.id,"x","Original X permalinks · issue share")+pie(news,l.id,"news","News & broadcast entries · issue share")+'</div>'+
 '<div class="an-leader-footer"><button data-an-open="social" data-an-leader="'+e(l.id)+'">Open this leader’s X headlines ↗</button><button data-an-open="reports" data-an-leader="'+e(l.id)+'">Open this leader’s newspaper sources ↗</button></div></article>';
 }).join("");
 container.innerHTML='<div class="an-header"><div class="eyebrow">ANALYTICS · SINGLE-ISSUE PRIMARY CLASSIFICATION</div><h2>Six leaders · X versus news coverage by issue</h2><p>Each political leader has two independent, interactive charts. The first measures the <b>share of recovered individual X post links</b>; the second measures <b>share of news and broadcast entries indexed about that leader</b>. News reporting about someone is not necessarily a statement made by them. These charts do not estimate all their public activity.</p></div>'+
 '<div class="an-summary"><span><b>'+directX.length+'</b> source-linked X status URLs</span><span><b>'+news.length+'</b> news/broadcast records</span><span><b>6</b> leaders</span><span><b>10</b> primary issues</span></div><div class="an-cards">'+shown+'</div>'+
 '<p class="an-disclaimer">Coverage: 5 August–5 November 2026. Percentages are calculated separately for each leader and each source type, from this incomplete source collection only. Unverified X searches, retweets not individually linked, inferred posts, news articles without identifiable URLs, and video-only records are not counted in the X pie charts. Click any pie slice or legend issue to filter the rest of the terminal.</p>';
}
function clickFilter(selector,key,val){
 const target=[...document.querySelectorAll(selector+" [data-"+key+"]")].find(x=>x.getAttribute("data-"+key)===val);
 if(target){target.click();return true}return false;
}
function chooseLeader(id){
 const l=leaders.find(x=>x.id===id);if(!l)return;
 clickFilter("#states","state",l.state);
 clickFilter("#roles","role","all");
 clickFilter("#leaders","leader",id);
}
container.addEventListener("click",ev=>{
 const issue=ev.target.closest("[data-an-issue]"),open=ev.target.closest("[data-an-open]");
 if(issue){chooseLeader(issue.getAttribute("data-an-leader"));clickFilter("#issues","issue",issue.getAttribute("data-an-issue"));document.querySelector("#omsCommandMap")?.scrollIntoView({behavior:"smooth",block:"start"});return}
 if(open){chooseLeader(open.getAttribute("data-an-leader"));clickFilter(".sidebar","issue","all");
 const tab=open.getAttribute("data-an-open");document.querySelector('.tabs [data-tab="'+tab+'"]')?.click();document.querySelector(".tabs")?.scrollIntoView({behavior:"smooth",block:"start"})}
});
container.addEventListener("keydown",ev=>{if((ev.key==="Enter"||ev.key===" ")&&ev.target.matches(".an-slice[data-an-issue]")){ev.preventDefault();ev.target.dispatchEvent(new MouseEvent("click",{bubbles:true}))}});
document.addEventListener("comparative:render",ev=>{
 if(ev.detail){active=Object.assign({},active,ev.detail);}
 render();
});
render();
})();