/**
 * Import public first-party Facebook + Instagram records from Apify Actors.
 * APIFY_TOKEN is a GitHub Actions secret, never committed or exposed to Pages.
 * The stable 5 Aug–5 Nov 2026 window is enforced AGAIN on every result.
 * The live dashboard reads chhattisgarh_social_2026.json.
 */
import fs from "node:fs/promises";
const START="2026-08-05",END="2026-11-05";
const API="https://api.apify.com/v2";
const token=process.env.APIFY_TOKEN?.trim();
const dryRun=process.env.DRY_RUN!=="false";
const maxCharge=Math.min(5,Math.max(.1,Number(process.env.MAX_CHARGE_USD_PER_ACTOR||"2")));
const maxItems=Math.min(10000,Math.max(1,Number(process.env.MAX_ITEMS||"6000")));
const socialPath="chhattisgarh_social_2026.json";
const social=JSON.parse(await fs.readFile(socialPath,"utf8"));
const profileMap=JSON.parse(await fs.readFile("apify_meta_2026_accounts.json","utf8")).accounts;
const fbInput=JSON.parse(await fs.readFile("apify_facebook_2026_input.json","utf8"));
const igInput=JSON.parse(await fs.readFile("apify_instagram_2026_input.json","utf8"));
const doFacebook=process.env.PLATFORM!=="instagram";
const doInstagram=process.env.PLATFORM!=="facebook";
const canonUrl=url=>{try{const u=new URL(String(url||""));u.search="";u.hash="";u.pathname=u.pathname.replace(/\/+$/,"")||"/";if(u.protocol!=="https:")return "";return u.toString();}catch{return ""}};
const fbSlug=url=>{try{const u=new URL(url);if(!/(^|\.)facebook\.com$/i.test(u.hostname))return "";const seg=decodeURIComponent(u.pathname).split("/").filter(Boolean)[0]||"";return seg.toLowerCase()}catch{return ""}};
const igSlug=url=>{try{const u=new URL(url);if(!/(^|\.)instagram\.com$/i.test(u.hostname))return "";return (u.pathname.split("/").filter(Boolean)[0]||"").toLowerCase()}catch{return ""}};
const fbs=new Map(profileMap.filter(a=>a.facebook).map(a=>[fbSlug(a.facebook),a.name]));
const igs=new Map(profileMap.filter(a=>a.instagram).map(a=>[igSlug(a.instagram),a.name]));
const timeISO=v=>{
 if(v===null||v===undefined||v==="")return "";
 let d;if(typeof v==="number"){d=new Date(v<1e12?v*1000:v);}else if(/^\d{10,13}$/.test(String(v))){let n=Number(v);d=new Date(n<1e12?n*1000:n);}else{d=new Date(String(v));}
 return Number.isNaN(d.getTime())?"":d.toISOString();
};
const validDate=ts=>ts.slice(0,10)>=START&&ts.slice(0,10)<=END;
const normText=v=>String(v||"").replace(/[\r\n\t]+/g," ").replace(/\s+/g," ").trim().slice(0,4500);
const topics=["Tribal Issues","Religion / Hinduism","Governance","Minerals","Mining","Agriculture & Farmers","Internal Security & Bastar","Infrastructure & Development","Education, Healthcare & Employment","Environment & Forests"];
const keyword=[
 ["Tribal Issues",/(?:आदिवासी|जनजाति|जनजातीय|tribal|adivasi|pesa\b|वनाधिकार|वन अधिकार)/i],
 ["Religion / Hinduism",/(?:मंदिर|हिंदुत्व|हिंदू|हिन्दू|श्रीराम|navratri|hindutva|religious conversion|धर्मांतरण)/i],
 ["Governance",/(?:शासन|प्रशासन|भ्रष्टाचार|मंत्रिमंडल|cabinet|governance|election commission|निर्वाचन आयोग)/i],
 ["Minerals",/(?:खनिज|लौह अयस्क|mineral|lithium|iron ore|critical minerals)/i],
 ["Mining",/(?:खनन|खदान|कोयला|mining|coal mine|illegal excavation)/i],
 ["Agriculture & Farmers",/(?:किसान|खेती|कृषि|धान खरीदी|खेती|फसल|agriculture|farmer|paddy)/i],
 ["Internal Security & Bastar",/(?:नक्सल|माओवादी|सुरक्षाबल|bastar|naxal|maoist|insurgency)/i],
 ["Infrastructure & Development",/(?:सड़क|रेलवे|पुल निर्माण|infrastructure|highway|railway|housing project)/i],
 ["Education, Healthcare & Employment",/(?:शिक्षा|स्वास्थ्य|अस्पताल|रोजगार|भर्ती|education|hospital|employment|medical)/i],
 ["Environment & Forests",/(?:वन संरक्षण|जलवायु परिवर्तन|पर्यावरण|forest conservation|environment|climate change)/i]
];
function issueTags(text){const hits=keyword.filter(([,re])=>re.test(text)).map(([topic])=>topic);return {issue:hits.length===1?hits[0]:"Unclassified",candidates:hits};}
async function call(url,method="GET",payload){
 const res=await fetch(url,{method,headers:{Authorization:"Bearer "+token,...(payload?{"content-type":"application/json"}:{})},body:payload?JSON.stringify(payload):undefined});
 const raw=await res.text();let out;try{out=JSON.parse(raw)}catch{throw new Error("Apify HTTP "+res.status+" returned invalid JSON (truncated): "+raw.slice(0,200))}
 if(!res.ok)throw new Error("Apify HTTP "+res.status+": "+JSON.stringify(out).slice(0,420));
 return out;
}
async function runActor(actor,input,limit){
 let started=await call(API+"/acts/"+actor+"/runs?maxTotalChargeUsd="+encodeURIComponent(maxCharge)+"&maxItems="+encodeURIComponent(limit),"POST",input);
 const id=started?.data?.id;if(!id)throw new Error(actor+" returned no run id");
 console.log("Actor started:",actor,"run",id,"max charge USD",maxCharge);
 let run;
 for(let i=0;i<120;i++){
  await new Promise(ok=>setTimeout(ok,10000));
  run=(await call(API+"/actor-runs/"+encodeURIComponent(id))).data;
  if(["SUCCEEDED","FAILED","ABORTED","TIMED-OUT"].includes(run?.status))break;
 }
 if(run?.status!=="SUCCEEDED")throw new Error(actor+" status "+(run?.status||"unknown")+"; no new dataset accepted");
 if(!run.defaultDatasetId)throw new Error(actor+" returned no dataset");
 const dataset=run.defaultDatasetId;const items=[];
 for(let offset=0;offset<limit;offset+=1000){
  const page=await call(API+"/datasets/"+encodeURIComponent(dataset)+"/items?format=json&clean=1&limit="+Math.min(1000,limit-offset)+"&offset="+offset);
  if(!Array.isArray(page))throw new Error("Unexpected dataset response from "+actor);
  items.push(...page);if(page.length<Math.min(1000,limit-offset))break;
 }
 return {actor,runId:id,datasetId:dataset,items};
}
function facebookPost(row){
 if(!row||typeof row!=="object"||row.error)return {reject:"invalid_row"};
 const url=canonUrl(row.url||row.postUrl||row.postURL||row.link||"");
 let host="";try{host=new URL(url).hostname}catch{}
 if(!/(^|\.)facebook\.com$/i.test(host))return {reject:"invalid_facebook_url"};
 const path=new URL(url).pathname.toLowerCase(),knownPath=/\/posts\/|\/videos\/|\/reel\/|\/permalink\.php/.test(path);
 if(!knownPath)return {reject:"not_a_post_permalink"};
 const page=canonUrl(row.facebookUrl||row.pageUrl||row.user?.profileUrl||row.page?.url||"");
 const pageName=page?fbs.get(fbSlug(page)):"";
 const pathName=fbs.get(fbSlug(url));
 if(pageName&&pathName&&pageName!==pathName)return {reject:"conflicting_page_identity"};
 const leader=pageName||pathName;
 if(!leader)return {reject:"unmatched_public_page_identity"};
 const at=timeISO(row.time||row.createdAt||row.date||row.timestamp||row.postedAt||"");
 if(!at||!validDate(at))return {reject:"out_of_window_or_no_timestamp"};
 const content=normText(row.text||row.message||row.caption||row.content||"");
 const tags=issueTags(content);
 return {id:"FB-"+(row.postId||row.id||url),platform:"Facebook",leader,handle:fbSlug(page)||fbSlug(url),date:at.slice(0,10),publishedAt:at,url,title:(content||"Original Facebook post · text unavailable").slice(0,225),textExcerpt:content,issue:tags.issue,issueCandidates:tags.candidates,issueCoding:"keyword_provisional_needs_review",originalPageConfirmed:false,sourceType:"apify_facebook_actor_dataset",evidenceStatus:"actor_public_post_timestamp_and_page_match",publisherName:"Apify Facebook Posts Scraper",publisherUrl:null,mediaCount:Array.isArray(row.media)?row.media.length:undefined,engagement:{likes:row.likes??null,shares:row.shares??null,comments:row.comments??null},apiVerified:false,provenance:"Public Meta page scraping, not Meta Graph API; original post URL and timestamp present in actor output"};
}
function instagramPost(row){
 if(!row||typeof row!=="object"||row.error)return {reject:"invalid_row"};
 const url=canonUrl(row.url||row.postUrl||row.link||"");
 let h="",p="";try{const u=new URL(url);h=u.hostname;p=u.pathname;}catch{}
 if(!/(^|\.)instagram\.com$/i.test(h)||!/^\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?$/i.test(p))return {reject:"invalid_instagram_permalink"};
 const owner=String(row.ownerUsername||row.owner?.username||row.username||row.owner?.userName||"").trim().replace(/^@/,"").toLowerCase();
 const leader=igs.get(owner);
 if(!leader)return {reject:"unmatched_original_author"};
 const at=timeISO(row.timestamp||row.takenAt||row.taken_at||row.createdAt||row.date||"");
 if(!at||!validDate(at))return {reject:"out_of_window_or_no_timestamp"};
 const content=normText(row.caption||row.text||row.captionText||row.description||"");
 const tags=issueTags(content);
 return {id:"IG-"+(row.id||row.shortCode||row.shortcode||url),platform:"Instagram",leader,handle:owner,date:at.slice(0,10),publishedAt:at,url,title:(content||"Original Instagram post · caption unavailable").slice(0,225),textExcerpt:content,issue:tags.issue,issueCandidates:tags.candidates,issueCoding:"keyword_provisional_needs_review",originalPageConfirmed:false,sourceType:"apify_instagram_actor_dataset",evidenceStatus:"actor_public_post_timestamp_and_owner_match",publisherName:"Apify Instagram Scraper",publisherUrl:null,engagement:{likes:row.likesCount??row.likes??null,comments:row.commentsCount??row.comments??null},apiVerified:false,provenance:"Public Instagram actor scrape, not Meta Graph API; original author and timestamp checked"};
}
function validateInputs(){
 const expectedFB=new Set([...fbs.keys()]),expectedIG=new Set([...igs.keys()]);
 for(const obj of fbInput.startUrls||[]){if(!expectedFB.has(fbSlug(obj.url)))throw Error("Unmapped Facebook target: "+obj.url)}
 for(const s of igInput.directUrls||[]){if(!expectedIG.has(igSlug(s)))throw Error("Unmapped Instagram target: "+s)}
 if(fbInput.onlyPostsNewerThan!==START||!String(fbInput.onlyPostsOlderThan).startsWith("2026-11-06"))throw Error("Facebook actor date window mismatch");
 if(igInput.onlyPostsNewerThan!==START||igInput.onlyPostsOlderThan!=="2026-11-06")throw Error("Instagram actor date window mismatch");
 if(!fbs.size&&!igs.size)throw Error("No confirmed Meta profiles for actor runs");
}
validateInputs();
const plan={dryRun,accounts:{facebook:fbs.size,instagram:igs.size},actors:{facebook:doFacebook?"apify~facebook-posts-scraper":null,instagram:doInstagram?"nologin~instagram-scraper":null},window:{START,END},maxChargeUsdPerActor:maxCharge,maxItems};
if(dryRun){console.log(JSON.stringify(plan,null,2));process.exit(0)}
if(!token){console.error("APIFY_TOKEN GitHub Action secret unavailable. Did not run paid Actor.");process.exit(2)}
const batches=[],failures=[];
if(doFacebook)try{batches.push(await runActor("apify~facebook-posts-scraper",fbInput,Math.min(maxItems,7000)))}catch(e){failures.push({platform:"Facebook",reason:String(e.message||e)});console.error(failures.at(-1).reason)}
if(doInstagram)try{batches.push(await runActor("nologin~instagram-scraper",igInput,Math.min(maxItems,7000)))}catch(e){failures.push({platform:"Instagram",reason:String(e.message||e)});console.error(failures.at(-1).reason)}
if(!batches.length){console.error("No actor completed; existing dataset untouched");process.exit(3)}
let items=0,accepted=0,rejected={};const merged=new Map((social.posts||[]).map(p=>[canonUrl(p.url).toLowerCase(),p]));
for(const batch of batches){for(const row of batch.items){items++;const record=batch.actor.includes("facebook")?facebookPost(row):instagramPost(row);
 if(record.reject){rejected[record.reject]=(rejected[record.reject]||0)+1;continue;}
 const key=canonUrl(record.url).toLowerCase();if(!key){rejected.invalid_url=(rejected.invalid_url||0)+1;continue;}
 const old=merged.get(key);if(old){merged.set(key,{...old,...record,issue:topics.includes(old.issue)&&old.issue!=="Unclassified"?old.issue:record.issue})}else{merged.set(key,record);accepted++}
}}
const posts=[...merged.values()].sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.url).localeCompare(String(b.url)));
const oldMeta=social.metaCollection||[];
const out={...social,posts,updated:new Date().toISOString().slice(0,10),evidenceCount:posts.filter(p=>p.platform==="X"||!p.platform).length,
metaCollection:[...oldMeta,...batches.map(b=>({actor:b.actor,runId:b.runId,datasetId:b.datasetId,retrieved:b.items.length,collectedAt:new Date().toISOString(),collectionClass:"public_scraping_actor_not_meta_graph_api"}))],
metaResearchStatus:{historicalWindow:{start:START,end:END},retrievedRecords:items,newAcceptedPosts:accepted,rejections:rejected,failedActors:failures,unverifiedProfileCount:20-new Set(profileMap.filter(a=>a.name!=="Chhattisgarh CMO").map(a=>a.name)).size,platformCounts:{facebook:posts.filter(p=>p.platform==="Facebook").length,instagram:posts.filter(p=>p.platform==="Instagram").length,x:posts.filter(p=>p.platform==="X"||!p.platform).length},caveat:"Not exhaustive: only confirmed public Page/profile URLs. Actor datasets are not an official Meta Graph API extraction; issue coding is provisional and requires review."}};
await fs.writeFile(socialPath,JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify({actorsSucceeded:batches.length,actorsFailed:failures.length,retrieved:items,accepted,postTotal:posts.length,platformCounts:out.metaResearchStatus.platformCounts,rejections:rejected},null,2));
if(failures.length)process.exitCode=1;
