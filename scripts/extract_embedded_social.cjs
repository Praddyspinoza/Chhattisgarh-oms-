"use strict";
const fs=require("node:fs");
const d=JSON.parse(fs.readFileSync("comparative_states_2026.json","utf8"));
const allow=new Set(["DrMohanYadav51","UmangSinghar","MohanMOdisha","Naveen_Odisha","HemantSorenJMM","yourBabulal"].map(s=>s.toLowerCase()));
const sources=[...new Map(d.records.filter(r=>/^https:\/\//.test(r.url)&&!r.url.includes("youtube.com")).map(r=>[r.url,r])).values()];
const captures=[];let count=0;
async function one(r){
  let html="",status=0,reason="";
  try{const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),12000);
     const resp=await fetch(r.url,{signal:ctl.signal,headers:{"User-Agent":"ChhattisgarhOMS/1.0 (public research archival verification)","Accept":"text/html"}});
     clearTimeout(t);status=resp.status;
     if(resp.ok){const ct=resp.headers.get("content-type")||"";if(ct.includes("text/html")) html=(await resp.text()).slice(0,1800000);}
  }catch(err){reason=String(err).slice(0,120)}
  if(html){
    let content=html.replaceAll("&amp;","&").replaceAll("&#47;","/").replaceAll("\\/","/").replace(/\\u002f/ig,"/").replace(/\\u003a/ig,":");
    const re=/(?:https?:)?\/\/(?:www\.)?(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)\/status\/(\d{16,22})/gi;
    let m,seen=new Set(),posts=[];
    while((m=re.exec(content))!==null){const handle=m[1],id=m[2];if(!allow.has(handle.toLowerCase()))continue;
      const u="https://x.com/"+handle+"/status/"+id;if(!seen.has(u)){posts.push(u);seen.add(u)}}
    if(posts.length)captures.push({recordId:r.id,publisher:r.publisher,date:r.date,leader:r.leader,issue:r.issue,publisherUrl:r.url,posts});
  }
  count++;if(count%15===0)console.log("Scanned",count,"/",sources.length,"recoveries",captures.length,"last status",status,reason);
}
async function run(){
  const parallel=4;let next=0;
  await Promise.all(Array.from({length:parallel},async()=>{while(next<sources.length){let r=sources[next++];await one(r);}}));
  fs.writeFileSync("comparative_x_candidates.json",JSON.stringify({tested:sources.length,recoveredPages:captures.length,captures,generatedAt:new Date().toISOString()},null,2)+"\n");
  console.log(JSON.stringify({tested:sources.length,pages:captures.length,postURLs:new Set(captures.flatMap(x=>x.posts)).size}));
}
run().catch(e=>{console.error(e);process.exit(1)});
