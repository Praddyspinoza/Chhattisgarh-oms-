"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict");
const news=JSON.parse(fs.readFileSync("comparative_states_2026.json","utf8"));
const data=JSON.parse(fs.readFileSync("comparative_government_2026.json","utf8"));
const html=fs.readFileSync("comparative.html","utf8");
assert.deepEqual(data.issues,news.issues,"Official issue taxonomy does not match the main OMS");
assert.equal(data.window.start,"2026-08-05");assert.equal(data.window.end,"2026-11-05");
assert(data.officialRecords.length>=45,"Too few official records; check for accidental loss");
assert(data.assemblyRecords.length>=10,"Too few legislative records; check for accidental loss");
const states=new Set(news.leaders.map(x=>x.state)), ids=new Set();
for(const [kind,rows] of [["government",data.officialRecords],["assembly",data.assemblyRecords]]){
 for(const r of rows){
  assert(!ids.has(r.id),"Duplicate record ID "+r.id);ids.add(r.id);
  assert(states.has(r.state),"Unknown source state "+r.id);
  assert(data.issues.includes(r.issue),"Unclassified issue "+r.id);
  assert(r.date>=data.window.start&&r.date<=data.window.end,"Out-of-window circular or session record "+r.id);
  assert(/^https:\/\//.test(r.url),"Missing original government/assembly URL "+r.id);
  assert(r.title&&r.summary,"Missing evidence heading or summary "+r.id);
  if(kind==="government"){
   assert(r.authority,"Missing issuing official authority "+r.id);
   assert(r.provenance,"Missing government provenance tier "+r.id);
   assert(r.leaderAttribution&&/not personally/i.test(r.leaderAttribution),"Govt order improperly attributed to individual leader "+r.id);
   assert(r.linkKind&&r.verificationNote,"Missing index vs document boundary "+r.id);
  }else{
   assert(Array.isArray(r.relatedLeaders),"Assembly personal attribution field absent "+r.id);
   assert(r.provenance,"Missing legislative source classification "+r.id);
  }
 }
}
assert.equal(data.sessionNotes.length,3,"Missing state's parliamentary session calendar");
const mp=data.sessionNotes.find(x=>x.state==="Madhya Pradesh");
assert.equal(mp.start,null,"Madhya Pradesh plenary incorrectly represented as in-window");
const od=data.sessionNotes.find(x=>x.state==="Odisha");assert.equal(od.start,"2026-09-22");assert.equal(od.end,"2026-09-28");
const jh=data.sessionNotes.find(x=>x.state==="Jharkhand");assert.equal(jh.start,"2026-08-06");assert.equal(jh.end,"2026-08-12");
const tag='<script id="oms-comparative-government" type="application/json">';
const st=html.indexOf(tag),en=html.indexOf("</script>",st+tag.length);
assert(st>=0&&en>st,"Comparative HTML has no embedded government/assembly JSON");
const embedded=JSON.parse(html.slice(st+tag.length,en));
assert.equal(embedded.officialRecords.length,data.officialRecords.length,"Stale embedded government records");
assert.equal(embedded.assemblyRecords.length,data.assemblyRecords.length,"Stale embedded assembly records");
for(const s of ['id="officialList"','id="assemblyList"','data-tab="official"','data-tab="assembly"','dossierInstitutions(topic)'])assert(html.includes(s),"Government/legislative UI missing "+s);
console.log(JSON.stringify({pass:true,government:data.officialRecords.length,assembly:data.assemblyRecords.length,sessions:data.sessionNotes.map(x=>({state:x.state,start:x.start,end:x.end})),officialDirectoryIndexEntries:data.officialRecords.filter(x=>x.provenance==="official-register").length,directGovDocumentRefs:data.officialRecords.filter(x=>x.provenance==="official-document").length,unconfirmedLeads:data.officialRecords.filter(x=>x.provenance==="unconfirmed-historical-entry").length},null,2));
