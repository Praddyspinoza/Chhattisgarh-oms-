"use strict";
const assert=require("node:assert/strict"),fs=require("fs"),vm=require("node:vm");
const d=JSON.parse(fs.readFileSync("comparative_states_2026.json","utf8"));
const old=JSON.parse(fs.readFileSync("v12_data.json","utf8"));
const html=fs.readFileSync("comparative.html","utf8");
const ids=new Set(),sourceLinks=new Set(),socialLinks=new Set();
const issueIDs=old.issueTaxonomy.map(t=>t.id);
assert.deepEqual(d.issues,issueIDs,"Comparative topics differ from main OMS");
assert.equal(d.leaders.length,6);assert.equal(new Set(d.leaders.map(x=>x.id)).size,6);
assert.equal(d.window.start,"2026-08-05");assert.equal(d.window.end,"2026-11-05");
const byID=Object.fromEntries(d.leaders.map(x=>[x.id,x]));
for(const r of d.records){
 assert(!ids.has(r.id),"Duplicate record "+r.id);ids.add(r.id);
 assert(byID[r.leader],"Unknown article leader "+r.id);
 assert(issueIDs.includes(r.issue),"Wrong issue "+r.id);
 assert(r.date>=d.window.start&&r.date<=d.window.end,"Out of window article "+r.id);
 assert(/^https:\/\//.test(r.url),"Invalid article URL "+r.id);
 assert(typeof r.summary==="string"&&r.summary.length>25,"Missing article summary "+r.id);
 sourceLinks.add(r.url);
}
for(const p of d.posts){
 assert(!ids.has(p.id),"Duplicate ID "+p.id);ids.add(p.id);
 assert(byID[p.leader],"Unknown post leader "+p.id);
 assert(issueIDs.includes(p.issue),"Wrong post issue "+p.id);
 assert(p.date>=d.window.start&&p.date<=d.window.end,"Out of window post "+p.id);
 assert(/^https:\/\//.test(p.url)&&/^https:\/\//.test(p.publisherUrl),"Bad post URL "+p.id);
 assert(!socialLinks.has(p.url.toLowerCase()),"Duplicate post "+p.url);socialLinks.add(p.url.toLowerCase());
 if(p.platform==="X"){
  const m=p.url.match(/^https:\/\/x\.com\/([A-Za-z0-9_]+)\/status\/(\d+)$/);
  assert(m,"Non-permalink X link "+p.id);
  assert.equal(m[1].toLowerCase(),byID[p.leader].x.toLowerCase(),"X account misattribution "+p.id);
  const date=new Date(Number((BigInt(m[2])>>22n)+1288834974657n)).toISOString().slice(0,10);
  assert.equal(date,p.date,"X snowflake timestamp mismatch "+p.id);
  assert(p.status==="embedded-post-url","Unverified social item presented as direct X "+p.id);
 }
}
assert(html.includes("comparative_states_2026.json"));assert(html.includes("cg-brand"));assert(html.includes("original Chhattisgarh OMS V12") && html.includes("cg-brand"),"Original OMS visual tokens missing");
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
for(const [,attrs,source] of scripts){if(/application\/json/i.test(attrs)||!source.trim())continue;new vm.Script(source);}

assert(d.records.length>=160,"Comparative research count unexpectedly reduced");
const marker='<script id="oms-comparative-embedded" type="application/json">';
const start=html.indexOf(marker),end=html.indexOf("</script>",start+marker.length);
assert(start>=0&&end>start,"Embedded research data missing");
const embedded=JSON.parse(html.slice(start+marker.length,end));
assert.equal(embedded.records.length,d.records.length,"Embedded report count stale");
assert.equal(embedded.posts.length,d.posts.length,"Embedded post count stale");
assert(html.includes("source-headline"),"Clickable headline renderer missing");
assert(html.includes("topic-frame"),"Issue heading renderer missing");
console.log(JSON.stringify({pass:true,recordCount:d.records.length,sourceURLs:sourceLinks.size,postCount:d.posts.length,xPosts:d.posts.filter(x=>x.platform==="X").length,leaders:d.leaders.length,issues:issueIDs.length},null,2));
