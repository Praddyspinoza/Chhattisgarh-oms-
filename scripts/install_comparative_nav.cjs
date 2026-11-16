"use strict";
const fs=require("node:fs"),path="index.html",marker='id="omsThreeStateLinkInstaller"';
let html=fs.readFileSync(path,"utf8");
if(html.includes(marker)){console.log("Comparative navigation already installed; no change.");process.exit(0);}
if(!/<\\/body\\s*>/i.test(html))throw Error("Index document has no closing body; refusing to modify.");
const addon="<script id=\"omsThreeStateLinkInstaller\">\n(function(){\n\"use strict\";\nfunction install(){\n if(document.getElementById(\"oms-cmp-entry\"))return;\n var ref=document.querySelector('[data-nav=\"v12-links\"]')||document.querySelector('[data-nav=\"v12-bjp\"]');\n var button=document.createElement(\"button\");\n button.id=\"oms-cmp-entry\";button.type=\"button\";button.textContent=\"THREE-STATE COMPARATIVE ↗\";\n button.setAttribute(\"aria-label\",\"Open Madhya Pradesh, Odisha and Jharkhand comparative intelligence\");\n button.addEventListener(\"click\",function(){window.location.href=\"./comparative.html\";});\n if(ref){\n  button.className=ref.className;\n  button.style.cssText=\"min-width:0;max-width:100%;\";\n  ref.insertAdjacentElement(\"afterend\",button);\n }else{\n  button.style.cssText=\"position:fixed;bottom:18px;right:18px;z-index:2147482000;background:#1a3430;border:1px solid #72cfb5;color:#eaf4ef;padding:12px 16px;border-radius:8px;font:700 12px sans-serif;box-shadow:0 8px 26px #0008;cursor:pointer\";\n  document.body.appendChild(button);\n }\n}\nif(document.readyState===\"loading\")document.addEventListener(\"DOMContentLoaded\",install,{once:true});\nelse install();\n})();\n</script>";
html=html.replace(/<\\/body\\s*>/i,addon+"\n</body>");
fs.writeFileSync(path,html,"utf8");
console.log("Installed additive comparison navigation script; original HTML otherwise preserved.");
