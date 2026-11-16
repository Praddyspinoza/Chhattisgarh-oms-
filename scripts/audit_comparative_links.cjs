"use strict";
const fs=require("fs");
const d=JSON.parse(fs.readFileSync("comparative_states_2026.json","utf8"));
const sources=[...new Map([...d.records.map(r=>({kind:"report",...r})),...d.posts.map(p=>({kind:"social",url:p.url,date:p.date,id:p.id,publisher:p.publisher}))].map(r=>[r.url,{url:r.url,kind:r.kind,id:r.id,publisher:r.publisher}])).values()];
async function check(s){
 const out={...s,status:"unknown",http:0,finalUrl:"",pageTitle:"",notes:[]};
 const ctl=new AbortController(); const timer=setTimeout(()=>ctl.abort(),12500);
 try{
  let r=await fetch(s.url,{method:"HEAD",signal:ctl.signal,redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (compatible; OMS-public-source-audit/1.0)"}});
  out.http=r.status;out.finalUrl=r.url;
  if([405,406,501].includes(r.status)){
   r=await fetch(s.url,{method:"GET",signal:ctl.signal,redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (compatible; OMS-public-source-audit/1.0)","Range":"bytes=0-4095"}});
   out.http=r.status;out.finalUrl=r.url;
   if(r.ok&&((r.headers.get("content-type")||"").includes("text/html"))){
    const html=(await r.text()).slice(0,120000);
    const m=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if(m)out.pageTitle=m[1].replace(/\s+/g," ").slice(0,180);
   }
  }
  if(r.status>=200&&r.status<400)out.status="http-reachable";
  else if([401,403,406,429,451].includes(r.status))out.status="restricted-or-rate-limited";
  else if([404,410].includes(r.status))out.status="not-found";
  else out.status="http-error";
  if(/\/tags\/|\/topic\/|\/author\/|\/videos\/?$|\/politics\/?$/i.test(s.url))out.notes.push("non-specific listing URL");
 }catch(err){out.status="network-unconfirmed";out.notes.push(String(err.message||err).slice(0,110))}
 clearTimeout(timer);return out;
}
async function run(){
 const res=[];let n=0,idx=0;
 await Promise.all(Array.from({length:8},async()=>{while(idx<sources.length){const row=sources[idx++];res.push(await check(row));n++;if(n%25===0)console.log("Audited",n,"/",sources.length)}}));
 res.sort((a,b)=>a.url.localeCompare(b.url));
 let summary={total:res.length};
 for(const x of res)summary[x.status]=(summary[x.status]||0)+1;
 const out={auditedAt:new Date().toISOString(),method:"HTTP HEAD, GET on unsupported HEAD only. Access restrictions honored. Non-200 responses may be transient; verification of article content is separate.",summary,links:res};
 fs.writeFileSync("comparative_link_audit.json",JSON.stringify(out,null,2)+"\n");
 console.log(JSON.stringify(summary));
 console.log("Not-found:",JSON.stringify(res.filter(x=>x.status==="not-found").map(x=>({url:x.url,http:x.http})).slice(0,80)));
 console.log("Non-specific:",JSON.stringify(res.filter(x=>x.notes.length).map(x=>x.url).slice(0,80)));
}
run().catch(e=>{console.error(e);process.exit(1)});
