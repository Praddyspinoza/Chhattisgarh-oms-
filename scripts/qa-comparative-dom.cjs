"use strict";
const fs=require("fs"),vm=require("vm"),assert=require("node:assert/strict");
const html=fs.readFileSync("comparative.html","utf8");
const records=JSON.parse(fs.readFileSync("comparative_states_2026.json","utf8"));
const tag='<script id="oms-comparative-embedded" type="application/json">';
const start=html.indexOf(tag),stop=html.indexOf("</script>",start+tag.length);
assert(start>0&&stop>start,"Embedded data unavailable");
const embedded=html.slice(start+tag.length,stop);
const gtag='<script id="oms-comparative-government" type="application/json">';
const gs=html.indexOf(gtag),ge=html.indexOf("</script>",gs+gtag.length);
assert(gs>0&&ge>gs,"Government JSON embed missing");
const govEmbedded=html.slice(gs+gtag.length,ge);
const govRecords=JSON.parse(fs.readFileSync("comparative_government_2026.json","utf8"));
assert.equal(JSON.parse(govEmbedded).officialRecords.length,govRecords.officialRecords.length,"Stale government records in HTML");
assert.equal(JSON.parse(govEmbedded).assemblyRecords.length,govRecords.assemblyRecords.length,"Stale legislative records in HTML");

const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(x=>!/application\/json/i.test(x[1])&&x[2].trim());
assert.equal(scripts.length,1,"One executable runtime expected");
const runtime=scripts[0][2];
const nodes={};
function node(id){
 if(!nodes[id]){
  nodes[id]={id,innerHTML:"",textContent:"",hidden:false,value:"all",events:{},options:[],
    classList:{toggle(){}},addEventListener(name,fn){this.events[name]=fn;},
    setAttribute(name,val){this[name]=val;}};
 }
 return nodes[id];
}
const tabs=["dossiers","reports","social","official","assembly","overview","sources","method"].map(id=>({...node("tab-"+id),dataset:{tab:id}}));
const sections=tabs.map(t=>({...node(t.dataset.tab),id:t.dataset.tab}));
const dom={
 getElementById(id){return id==="oms-comparative-embedded"?{textContent:embedded}:id==="oms-comparative-government"?{textContent:govEmbedded}:node(id);},
 querySelector(sel){return node("selector:"+sel);},
 querySelectorAll(sel){if(sel===".section")return sections;if(sel==="[data-tab]")return tabs;return [];}
};
vm.runInNewContext(runtime,{document:dom,window:{addEventListener(){}},console,encodeURIComponent,Date,Error,URL,Math,Object,Array,String,Number,Set,Map,RegExp,Boolean},{timeout:4000});
const initial=node("dossierList").innerHTML;
assert(initial.includes("dossier-headline") && initial.includes("Governance"),"Default governance combined dossier is not visible");
const selectAll=node("topicPicker").events.click;
assert(typeof selectAll==="function","Topic selection is not wired");
selectAll({target:{closest:()=>({dataset:{dossierTopic:"all"}})}});
const allDossiers=node("dossierList").innerHTML;
assert(allDossiers.includes("ORIGINAL X / VIDEO PERMALINKS"),"Posts are not integrated with leader dossier");

const govt=node("officialList").innerHTML,house=node("assemblyList").innerHTML;
assert(govt.includes("institution-headline"),"No government order links rendered");
assert(house.includes("institution-headline"),"No Vidhan Sabha links rendered");
for(const r of govRecords.officialRecords)assert(govt.includes(r.url.replace(/&/g,"&amp;")),"Missing official record URL "+r.id);
for(const r of govRecords.assemblyRecords)assert(house.includes(r.url.replace(/&/g,"&amp;")),"Missing legislative record URL "+r.id);
assert(allDossiers.includes("STATE ACTIONS / LEGISLATIVE OVERSIGHT"),"Government and Vidhan Sabha section is missing from integrated issue dossiers");
const reports=node("reportList").innerHTML,posts=node("postList").innerHTML,source=node("sourceGrid").innerHTML;
assert(reports.includes("source-headline"),"No clickable news headlines were rendered");
assert(posts.includes("source-headline"),"No clickable X post headline was rendered");
assert(reports.includes("Newspapers / digital news"),"News publisher subcategory missing");
assert(reports.includes("News channels / broadcasters"),"News channel subcategory missing");
assert(source.includes("Dainik Bhaskar"),"Blocked publication source listing disappeared");
for(const l of records.leaders)assert(reports.includes(l.name)&&posts.includes(l.name),"Missing leader dossier "+l.name);
const escapeHtml=v=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
for(const topic of records.issues)assert(reports.includes(escapeHtml(topic))&&posts.includes(escapeHtml(topic)),"Missing issue "+topic);
for(const r of records.records){assert(reports.includes(escapeHtml(r.url)),"Missing original news link "+r.id);assert(allDossiers.includes(escapeHtml(r.url)),"Missing dossier article "+r.id);}
for(const p of records.posts){assert(posts.includes(escapeHtml(p.url)),"Missing original post link "+p.id);assert(allDossiers.includes(escapeHtml(p.url)),"Missing dossier original post "+p.id);}
const staticNews=html.slice(html.indexOf("<!-- STATIC_COMPARE_REPORTS_START -->"),html.indexOf("<!-- STATIC_COMPARE_REPORTS_END -->"));
const staticSocial=html.slice(html.indexOf("<!-- STATIC_COMPARE_SOCIAL_START -->"),html.indexOf("<!-- STATIC_COMPARE_SOCIAL_END -->"));
assert.equal((staticNews.match(/class="source-headline"/g)||[]).length,records.records.length,"Static news links missing");
assert.equal((staticSocial.match(/class="source-headline"/g)||[]).length,records.posts.length,"Static social links missing");
assert.equal(node("nReports").textContent,records.records.length,"News metric wrong");
assert.equal(node("nPosts").textContent,records.posts.length,"Social metric wrong");
assert.equal(node("nGov").textContent,govRecords.officialRecords.length,"Government metric wrong");
assert.equal(node("nAssembly").textContent,govRecords.assemblyRecords.length,"Legislative metric wrong");
assert(html.includes("STATIC_DOSSIERS_START"),"No static initial dossier fallback");
assert(html.includes("id=\"omsCommandMap\"")&&html.includes("comparative-command-map.js")&&html.includes("comparative-command-map.css"),"Three-state district command map missing from comparative dashboard");
console.log(JSON.stringify({pass:true,renderedNews:records.records.length,renderedPosts:records.posts.length,leaders:records.leaders.length,issues:records.issues.length,staticFallback:true,newsChannelLinks:true,missingLinks:0},null,2));
