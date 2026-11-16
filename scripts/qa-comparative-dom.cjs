"use strict";
const fs=require("fs"),vm=require("vm"),assert=require("node:assert/strict");
const html=fs.readFileSync("comparative.html","utf8");
const records=JSON.parse(fs.readFileSync("comparative_states_2026.json","utf8"));
const tag='<script id="oms-comparative-embedded" type="application/json">';
const start=html.indexOf(tag),stop=html.indexOf("</script>",start+tag.length);
assert(start>0&&stop>start,"Embedded data unavailable");
const embedded=html.slice(start+tag.length,stop);
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(x=>!/application\/json/i.test(x[1]));
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
const tabs=["reports","social","overview","sources","method"].map(id=>({...node("tab-"+id),dataset:{tab:id}}));
const sections=tabs.map(t=>({...node(t.dataset.tab),id:t.dataset.tab}));
const dom={
 getElementById(id){return id==="oms-comparative-embedded"?{textContent:embedded}:node(id);},
 querySelector(sel){return node("selector:"+sel);},
 querySelectorAll(sel){if(sel===".section")return sections;if(sel==="[data-tab]")return tabs;return [];}
};
vm.runInNewContext(runtime,{document:dom,console,encodeURIComponent,Date,Error,URL,Math,Object,Array,String,Number,Set,Map,RegExp,Boolean},{timeout:4000});
const reports=node("reportList").innerHTML,posts=node("postList").innerHTML,source=node("sourceGrid").innerHTML;
assert(reports.includes("source-headline"),"No clickable news headlines were rendered");
assert(posts.includes("source-headline"),"No clickable X post headline was rendered");
assert(reports.includes("Newspapers / digital news"),"News publisher subcategory missing");
assert(reports.includes("News channels / broadcasters"),"News channel subcategory missing");
assert(source.includes("Dainik Bhaskar"),"Blocked publication source listing disappeared");
for(const l of records.leaders)assert(reports.includes(l.name)&&posts.includes(l.name),"Missing leader dossier "+l.name);
for(const topic of records.issues)assert(reports.includes(topic)&&posts.includes(topic),"Missing issue "+topic);
for(const r of records.records)assert(reports.includes(r.url),"Missing original news link "+r.id);
for(const p of records.posts)assert(posts.includes(p.url),"Missing original post link "+p.id);
const staticNews=html.slice(html.indexOf("<!-- STATIC_COMPARE_REPORTS_START -->"),html.indexOf("<!-- STATIC_COMPARE_REPORTS_END -->"));
const staticSocial=html.slice(html.indexOf("<!-- STATIC_COMPARE_SOCIAL_START -->"),html.indexOf("<!-- STATIC_COMPARE_SOCIAL_END -->"));
assert.equal((staticNews.match(/class="source-headline"/g)||[]).length,records.records.length,"Static news links missing");
assert.equal((staticSocial.match(/class="source-headline"/g)||[]).length,records.posts.length,"Static social links missing");
assert.equal(node("nReports").textContent,records.records.length,"News metric wrong");
assert.equal(node("nPosts").textContent,records.posts.length,"Social metric wrong");
console.log(JSON.stringify({pass:true,renderedNews:records.records.length,renderedPosts:records.posts.length,leaders:records.leaders.length,issues:records.issues.length,staticFallback:true,newsChannelLinks:true,missingLinks:0},null,2));
