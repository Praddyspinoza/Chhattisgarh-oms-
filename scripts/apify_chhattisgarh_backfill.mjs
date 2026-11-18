/**
 * Chhattisgarh X archive: date-bounded public-post ingest through Apify.
 * Controlled GitHub Actions execution only. Requires APIFY_TOKEN secret.
 * Does not change dashboard HTML or UI/UX.
 * Only exact public first-party status permalinks from the monitored handles are retained.
 */
import fs from "node:fs/promises";
const ACTOR = "winterlock~x-tweet-scraper";
const START = "2026-08-05", END = "2026-11-05";
const APIFY = "https://api.apify.com/v2";
const token = process.env.APIFY_TOKEN?.trim();
const cost = Math.min(Math.max(Number(process.env.MAX_CHARGE_USD||"5"),.1),10);
const maxItems = Math.min(Math.max(Number(process.env.MAX_ITEMS||"8000"),1),12000);
const dryRun = process.env.DRY_RUN === "true";
const rest = async (url,method="GET",input) => {
  const rsp=await fetch(url,{method,headers:{"Authorization":"Bearer "+token,...(input?{"Content-Type":"application/json"}:{})},body:input?JSON.stringify(input):undefined});
  const txt=await rsp.text();
  let obj; try {obj=JSON.parse(txt);}catch {throw Error("Unexpected Apify response HTTP "+rsp.status+" "+txt.slice(0,300))}
  if(!rsp.ok)throw Error("Apify HTTP "+rsp.status+": "+JSON.stringify(obj).slice(0,450));
  return obj;
};
const socialPath="chhattisgarh_social_2026.json";
const social=JSON.parse(await fs.readFile(socialPath,"utf8"));
const core=(social.accounts||[]).filter(a=>a.handle&&a.accountUrl?.startsWith("https://x.com/"));
const additional=(social.supplementaryAccounts||[]).filter(a=>a.handle&&a.accountUrl?.startsWith("https://x.com/"));
const roster=[...core,...additional], known=new Map(roster.map(a=>[a.handle.toLowerCase(),a]));
const config=JSON.parse(await fs.readFile("apify_x_2026_input.json","utf8"));
const extraConfig=JSON.parse(await fs.readFile("apify_ministers_official_2026_input.json","utf8"));
let searchTerms=[...new Set([...(config.searchTerms||[]),...(extraConfig.searchTerms||[])])];
if(!searchTerms.length)throw Error("No user-approved account searches configured");
const input={searchTerms,sort:"Latest",start:START,end:"2026-11-06",maxItems};
if(dryRun){console.log(JSON.stringify({dryRun:true,actor:ACTOR,accounts:roster.length,queries:searchTerms.length,costCapUsd:cost,maxItems},null,2));process.exit(0)}
if (!token) { console.error("APIFY_TOKEN secret missing; no paid actor run attempted."); process.exit(2); }
const launched=await rest(APIFY+"/actors/"+ACTOR+"/runs?maxTotalChargeUsd="+encodeURIComponent(String(cost))+"&maxItems="+encodeURIComponent(String(maxItems)),"POST",input);
const runId=launched.data?.id;
if(!runId)throw Error("Apify did not return an actor run ID");
console.log("Apify actor run started",runId,"cost cap",cost);
let run;
for(let i=0;i<100;i++){
  await new Promise(resolve=>setTimeout(resolve,10000));
  run=(await rest(APIFY+"/actor-runs/"+encodeURIComponent(runId))).data;
  if(["SUCCEEDED","FAILED","ABORTED","TIMED-OUT"].includes(run?.status))break;
}
if(run?.status!=="SUCCEEDED")throw Error("Apify not successful ("+(run?.status||"no completion")+") at "+runId+". Saved archive unchanged.");
if(!run.defaultDatasetId)throw Error("No Apify output dataset; unchanged");
let items=[],offset=0;
while(offset<maxItems){
 const page=await rest(APIFY+"/datasets/"+encodeURIComponent(run.defaultDatasetId)+"/items?format=json&clean=1&limit=1000&offset="+offset);
 if(!Array.isArray(page)||page.length===0)break;
 items.push(...page);offset+=page.length;
 if(page.length<1000)break;
}
const topics=["Tribal Issues","Religion / Hinduism","Governance","Minerals","Mining","Agriculture & Farmers","Internal Security & Bastar","Infrastructure & Development","Education, Healthcare & Employment","Environment & Forests"];
/** Very conservative provisional tagging. Treat as an initial filter, not audited topic claims. */
const tagRules=[
 ["Tribal Issues",/(?:\btribal\b|adivasi|आदिवासी|जनजातीय|pesa\b|वनाधिकार|वन अधिकार|forest rights)/i],
 ["Religion / Hinduism",/(?:हिंदुत्व|हिंदू|हिन्दू|राम मंदिर|धर्मांतरण|धर्म परिवर्तन|religious conversion|hinduism|hindutva)/i],
 ["Governance",/(?:\bgovernance\b|प्रशासन|कानून|विधानसभा|मुख्यमंत्री|सरकारी आदेश|government policy|cabinet decision|भ्रष्टाचार|corruption|निर्वाचन आयोग)/i],
 ["Minerals",/(?:critical minerals|खनिज संपदा|खनिज संसाधन|geological survey|खनिज उत्पादन|खनिज राजस्व|iron ore|लौह अयस्क|lithium\b|rare earth)/i],
 ["Mining",/(?:\bmining\b|खदान|खनन|कोयला खनन|coal mine|illegal mining|अवैध उत्खनन|खनन प्रभावित)/i],
 ["Agriculture & Farmers",/(?:\bfarmers\b|किसान|खेती|कृषि|धान खरीदी|paddy procurement|कृषक|फसल|धान उपार्जन|सिंचाई)/i],
 ["Internal Security & Bastar",/(?:नक्सल|माओवादी|आतंकवाद|police operation|पुलिस मुठभेड़|आंतरिक सुरक्षा|left wing extremism|lwe\b)/i],
 ["Infrastructure & Development",/(?:\binfrastructure\b|सड़क निर्माण|सड़क परियोजना|परियोजना लोकार्पण|जल जीवन मिशन|airport|bridge construction|road project|railway line)/i],
 ["Education, Healthcare & Employment",/(?:\beducation\b|\bhealthcare\b|\bemployment\b|school education|विद्यालय|शिक्षा|स्वास्थ्य|अस्पताल|रोजगार|भर्ती परीक्षा|शिक्षक भर्ती|medical college)/i],
 ["Environment & Forests",/(?:\benvironment\b|पर्यावरण|वन संरक्षण|जंगल|जैव विविधता|wildlife|हसदेव|hasdeo|वन विनाश)/i]
];
const stamp=id=>new Date(Number((BigInt(id)>>22n)+1288834974657n)).toISOString().slice(0,10);
const records=new Map((social.posts||[]).filter(p=>p.id&&p.url).map(p=>[p.id,p]));
let accepted=0,ignored=0,updated=0;
for(const raw of items){
 if(!raw||raw.isRetweet===true||raw.type==="error"||raw.error) {ignored++;continue}
 const u=String(raw.url||raw.twitterUrl||raw.tweetUrl||"");
 const m=/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/([a-z0-9_]+)\/status\/(\d{18,20})(?:[/?#].*)?$/i.exec(u);
 if(!m){ignored++;continue}
 const name=m[1],id=m[2],account=known.get(name.toLowerCase());
 if(!account){ignored++;continue}
 const author=String(raw.author?.userName||raw.author?.username||raw.user?.userName||raw.user?.screen_name||"").replace(/^@/,"");
 if(author&&author.toLowerCase()!==name.toLowerCase()){ignored++;continue}
 const date=stamp(id);
 if(date<START||date>END){ignored++;continue}
 let at="";try{at=new Date(raw.createdAtIso||raw.createdAt||raw.date).toISOString().slice(0,10)}catch{}
 if(at&&Math.abs(Date.parse(at)-Date.parse(date))>86400000){ignored++;continue}
 const original=String(raw.text||raw.fullText||raw.full_text||"").replace(/\s+/g," ").trim();
 if(!original){ignored++;continue}
 const matches=tagRules.filter(([,re])=>re.test(original)).map(([category])=>category);
 const existing=records.get("X-"+id);
 const result={
  ...(existing||{}),id:"X-"+id,leader:account.name,handle:name,date,url:"https://x.com/"+name+"/status/"+id,
  title:original.slice(0,205),text:original,
  issue:existing?.issue&&topics.includes(existing.issue)?existing.issue:matches.length===1?matches[0]:"Unclassified",
  issueCandidates:matches,
  classificationStatus:existing?.issue&&topics.includes(existing.issue)?"prior_manual_archive_tag":"keyword_provisional_needs_editorial_review",
  evidenceStatus:"apify_actor_public_post_export",
  dateEvidence:"X original status ID + Apify createdAt cross-check",
  publisherUrl:existing?.publisherUrl||null,
  publisherName:existing?.publisherName||"Apify public-post actor",
  sourceNote:"Original public X post recovered by an Apify Actor with account and date checks; not an official X API export. Editor must verify ambiguous issue tags.",
  apiVerified:false
 };
 if(existing){updated++;}else accepted++;
 records.set(result.id,result);
}
const all=[...records.values()].sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.id).localeCompare(String(a.id)));
const out={...social,posts:all,updated:new Date().toISOString().slice(0,10),
 methodology:String(social.methodology||"")+" Additional public post records recovered with Apify Actor "+ACTOR+" and account/ID/date verification. Provisional keyword issue tags require editorial review; X public search may omit some posts.",
 apifyCollection:{actor:ACTOR,runId,defaultDatasetId:run.defaultDatasetId,sourceRetrieved:items.length,accepted,updated,ignored,completedAt:new Date().toISOString(),collectionStatus:"public_actor_dataset_not_official_x_api",keywordCoding:"provisional"}};
await fs.writeFile(socialPath,JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify({success:true,actorRunId:runId,sourceItems:items.length,newItems:accepted,enrichedExisting:updated,ignored,total:all.length,accountCoverage:new Set(all.map(p=>p.leader)).size},null,2));
