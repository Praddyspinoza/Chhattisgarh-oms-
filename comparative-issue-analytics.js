/* Comparative archive issue shares: counts are indexed items, not all posts published on X. */
(()=>{
"use strict";
const container=document.getElementById("comparisonAnalytics");
const node=document.getElementById("oms-comparative-embedded");
if(!container||!node)return;
let data;try{data=JSON.parse(node.textContent)}catch{return}
const EXTRA="Other / general and ceremonial";
const leaders=data.leaders,issues=[...data.issues,EXTRA];
const palette=["#ddbd73","#d89275","#8ec4a8","#8cb7db","#d5a6d6","#a2ca7c","#bfa2ee","#78c7bd","#e2a7aa","#b8b8c6","#f7c974"];
const e=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let active={state:"all",leader:"all",issue:"all"};
const directX=data.posts.filter(p=>p.platform==="X"&&/^https:\/\/(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+/.test(p.url));
const personalX=directX.filter(p=>p.accountType!=="cmo");
const officeX=directX.filter(p=>p.accountType==="cmo");
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
 }).join(""):'<p class="an-empty">No directly linked post assigned to this category in this archive.</p>';
 return '<div class="an-figure" data-an-chart="'+tag+'"><div class="an-figure-title">'+e(caption)+'</div><div class="an-figure-body"><div class="an-pie-wrap"><svg class="an-donut" viewBox="0 0 160 160" aria-label="'+e(caption+' issue distribution for '+id)+'">'+paths+'<circle class="an-hole" cx="80" cy="80" r="35"/><text x="80" y="76" class="an-n">'+values.total+'</text><text x="80" y="93" class="an-n-caption">INDEXED</text></svg></div>'+
 '<div class="an-legend-list">'+legend+'</div></div></div>';
}
function render(){
 const shown=leaders.map(l=>{
  const personal=counts(personalX,l.id),official=counts(officeX,l.id),b=counts(news,l.id);
  const faded=active.leader!=="all"&&active.leader!==l.id||active.state!=="all"&&active.state!==l.state;
  const hasOffice=(data.cmoAccounts||[]).some(a=>a.leader===l.id);
  const office=hasOffice?data.cmoAccounts.find(a=>a.leader===l.id):null;
  return '<article class="an-leader'+(faded?' an-faded':'')+'" data-an-card="'+e(l.id)+'"><div class="an-leader-head"><div><strong>'+e(l.name)+'</strong><span>'+e(l.state)+' · '+e(l.role)+' · '+e(l.party||"")+(office?' · CMO @'+e(office.handle):"")+'</span></div><div class="an-badges"><span>'+personal.total+' individual X</span>'+(hasOffice?'<span>'+official.total+' official CMO X</span>':"")+'<span>'+b.total+' news entries</span></div></div>'+
  '<div class="an-leader-grid'+(hasOffice?' an-three':'')+'">'+
   pie(personalX,l.id,"x","Individual account X · issue share")+
   (hasOffice?pie(officeX,l.id,"cmo-x","Official CM Office X · issue share"):"")+
   pie(news,l.id,"news","News & broadcast coverage · issue share")+'</div>'+
  '<div class="an-leader-footer"><button data-an-open="social" data-an-leader="'+e(l.id)+'">Open X headlines ↗</button><button data-an-open="reports" data-an-leader="'+e(l.id)+'">Open newspaper sources ↗</button></div></article>';
 }).join("");
 container.innerHTML='<div class="an-header"><div class="eyebrow">ANALYTICS · SOURCE ATTRIBUTION SEPARATED</div><h2>Six leaders · personal X vs CM Office X vs news</h2><p>Individual leader X accounts and official government CM Office accounts are counted <b>separately</b>; institutional posts are not attributed as the chief minister’s personal speech. Each Chief Minister has three interactive issue pies, while each opposition leader has two. Media coverage is news <b>about</b> a leader and is not assumed to be personally spoken by them.</p></div>'+
 '<div class="an-summary"><span><b>'+directX.length+'</b> total X status links</span><span><b>'+personalX.length+'</b> individual leaders</span><span><b>'+officeX.length+'</b> official CMO posts</span><span><b>'+news.length+'</b> media links</span></div><div class="an-cards">'+shown+'</div>'+
 '<p class="an-disclaimer">Coverage 5 August–5 November 2026. Denominators are unique indexed post URLs or separately indexed media reports, not the total output of these accounts. CMO author and date were checked on original public X pages; four original body captions are incomplete, and their chart labels are kept unclassified. Keyword-assisted issue categories are provisional and require editorial review. No news article is silently counted as a social post. Click a pie segment or its legend to filter the terminal; a CMO pie also selects the institutional account filter.</p>';
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
 if(issue){const key=issue.getAttribute("data-an-issue");chooseLeader(issue.getAttribute("data-an-leader"));const tag=issue.closest("[data-an-chart]")?.getAttribute("data-an-chart");const account=document.getElementById("accountSource");if(account&&(tag==="x"||tag==="cmo-x")){account.value=tag==="cmo-x"?"cmo":"personal";account.dispatchEvent(new Event("change",{bubbles:true}));}if(key===EXTRA){clickFilter(".sidebar","issue","all");document.querySelector('.tabs [data-tab="social"]')?.click();const target=[...document.querySelectorAll("#postList [data-social-topic]")].find(x=>x.getAttribute("data-social-topic")===EXTRA);target?.scrollIntoView({behavior:"smooth",block:"start"});return}clickFilter("#issues","issue",key);document.querySelector("#omsCommandMap")?.scrollIntoView({behavior:"smooth",block:"start"});return}
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