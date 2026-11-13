"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const html=fs.readFileSync("index.html","utf8");
const d=JSON.parse(fs.readFileSync("v12_data.json","utf8"));
const s=JSON.parse(fs.readFileSync("social_discovery.json","utf8"));
function embed(id){
  const marker='<script id="'+id+'" type="application/json">';
  const pos=html.indexOf(marker);assert(pos>=0,"Missing "+id);
  const start=pos+marker.length,end=html.indexOf("</script>",start);
  assert(end>start,"Malformed "+id);
  return JSON.parse(html.slice(start,end));
}
const dataEmbed=embed("v12Data"),socialEmbed=embed("v12SocialLinksData");
assert.deepEqual(dataEmbed.bjpRecords,d.bjpRecords,"HTML BJP data differs from JSON");
assert.deepEqual(socialEmbed.accounts,s.accounts,"HTML social accounts differ");
assert.deepEqual(socialEmbed.searchLinks,s.searchLinks,"HTML social search links differ");
for(const id of ["command","v12-bjp","v12-cm","v12-links","cg-map-hub","archiveData","v12MotionSocialScript","cgBjpSocialDirector"]){
  assert(html.includes('id="'+id+'"'),"Missing original/expanded module: "+id);
}
assert.equal(d.bjpLeaders.length,10);
assert.equal(d.bjpRecords.length,149);
assert.equal(s.searchLinks.length,10);
assert.equal(s.originalXPostLinks.length,24);
assert.equal(s.metaPostLinks.length,0);
assert.equal(new Set(d.bjpRecords.map(x=>x.id)).size,d.bjpRecords.length);
for(const r of d.bjpRecords){
  assert(r.date>=d.window.start&&r.date<=d.window.end,"Out-of-window "+r.id);
  assert(d.bjpLeaders.some(p=>p.n===r.leader),"Unknown leader "+r.id);
  assert(r.primaryIssue==null||d.issueTaxonomy.some(x=>x.id===r.primaryIssue),"Unknown issue "+r.id);
  assert(/^https:\/\//.test(r.url),"Invalid link "+r.id);
}
for(const a of s.accounts)assert(/^https:\/\//.test(a.url),"Invalid account URL");
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let checked=0;
for(const [,attr,content] of scripts){
 if(/application\/json/.test(attr)||!content.trim())continue;
 new vm.Script(content,{filename:"inline-script-"+(++checked)+".js"});
}
console.log(JSON.stringify({pass:true,bjpRecords:d.bjpRecords.length,leaders:d.bjpLeaders.length,accountLinks:s.accounts.length,originalX:s.originalXPostLinks.length,originalMeta:s.metaPostLinks.length,parsedScripts:checked},null,2));
