const SECS=[
{id:"quiz",t:"📝 Quiz",d:"Short quizzes I have taken.",g:[["quiz","Quiz Files"]]},
{id:"longquiz",t:"📚 Long Quiz",d:"Long quiz results and papers.",g:[["longquiz","Long Quiz Files"]]},
{id:"exam",t:"🧠 Exam",d:"Midterm and final examinations.",g:[["mid","Midterms"],["fin","Finals"]]},
{id:"activity",t:"🎯 Activity",d:"Class activities and outputs.",g:[["activity","Activity Files"]]},
{id:"lab",t:"🔬 Laboratory",d:"Laboratory reports and experiments.",g:[["lab","Laboratory Files"]]}];
const $=s=>document.querySelector(s);let items=[],db=null,assets=null,dl=null,canUp=false,cur=null;
const IMG=/^image\//;
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove("on"),2600)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const icon=(n,t)=>/pdf/.test(t)?"📕":/word|docx?$/i.test(t+n)?"📘":/sheet|excel|xlsx?$|csv/i.test(t+n)?"📗":/presentation|pptx?$/i.test(n)?"📙":/zip|rar/i.test(t+n)?"🗜️":/video/.test(t)?"🎬":"📄";
function build(){
 $("#secs").innerHTML=SECS.map(s=>`<section id="${s.id}" class="rv"><h2>${s.t}<span class="cnt" data-c="${s.id}">0 files</span></h2><p class="sub">${s.d}</p><div class="groups">${s.g.map(([k,n])=>`<div class="grp"><div class="gh"><h3>${n}</h3><span class="cnt" data-k="${k}">0</span></div><div class="drop" data-k="${k}" style="display:none">⬆ Drop or tap to upload pictures &amp; files<input type="file" multiple hidden></div><div class="grid" data-g="${k}"></div></div>`).join("")}</div></section>`).join("");
 document.querySelectorAll(".drop").forEach(d=>{const inp=d.querySelector("input");d.onclick=e=>{if(e.target!==inp)inp.click()};inp.onchange=()=>{up(d.dataset.k,[...inp.files]);inp.value=""};
  d.ondragover=e=>{e.preventDefault();d.classList.add("over")};d.ondragleave=()=>d.classList.remove("over");d.ondrop=e=>{e.preventDefault();d.classList.remove("over");up(d.dataset.k,[...e.dataTransfer.files])}});
 const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("in")),{threshold:.08});document.querySelectorAll(".rv").forEach(x=>io.observe(x));
}
function render(){
 const sorted=[...items].sort((a,b)=>a.ts-b.ts);
 document.querySelectorAll(".grid").forEach(g=>{const k=g.dataset.g,l=sorted.filter(i=>i.k===k);
  g.innerHTML=l.length?l.map((i,n)=>`<div class="it" data-id="${i.id}" style="animation-delay:${n*40}ms"><span class="no">#${n+1}</span>${canUp?`<button class="x" data-del="${i.id}">✕</button>`:""}${IMG.test(i.type)?`<img loading="lazy" src="${i.url}" alt="${esc(i.name)}">`:`<div class="fi"><i>${icon(i.name,i.type)}</i>${esc(i.name)}</div>`}</div>`).join(""):`<div class="empty" style="grid-column:1/-1">No files yet</div>`});
 let tot=0;document.querySelectorAll("[data-k].cnt").forEach(c=>c.textContent=items.filter(i=>i.k===c.dataset.k).length);
 SECS.forEach(s=>{const n=items.filter(i=>s.g.some(x=>x[0]===i.k)).length;tot+=n;document.querySelector(`[data-c="${s.id}"]`).textContent=n+(n===1?" file":" files")});
 $("#stats").innerHTML=SECS.map(s=>`<a class="stat" href="#${s.id}" style="text-decoration:none;color:inherit"><b>${items.filter(i=>s.g.some(x=>x[0]===i.k)).length}</b><span>${s.t.slice(3)}</span></a>`).join("")+`<div class="stat"><b>${tot}</b><span>Total</span></div>`;
 document.querySelectorAll(".drop").forEach(d=>d.style.display=canUp?"":"none");
 $("#edit").style.display=canUp&&db?"":"none";$("#pbtn").style.display=canUp&&db?"":"none";
}
document.addEventListener("click",e=>{const x=e.target.closest("[data-del]");if(x){e.stopPropagation();del(x.dataset.del);return}const it=e.target.closest(".it");if(it)open(items.find(i=>i.id===it.dataset.id))});
function open(i){if(!i)return;cur=i;$("#lt").textContent=i.name;$("#lv").innerHTML=IMG.test(i.type)?`<img src="${i.url}">`:/pdf/.test(i.type)?`<iframe src="${i.url}"></iframe>`:`<div style="font-size:90px">${icon(i.name,i.type)}</div>`;$("#lb").classList.add("on")}
$("#lx").onclick=()=>{$("#lb").classList.remove("on");$("#lv").innerHTML=""};$("#lb").onclick=e=>{if(e.target.id==="lb")$("#lx").click()};
$("#ldl").onclick=async()=>{if(!cur)return;try{if(dl){const b=await (await fetch(cur.url)).blob();await dl.save({filename:cur.name,data:b});toast("Download ready ✔")}else{window.open(cur.url,"_blank")}}catch(e){if(e&&e.code==="declined")return;window.open(cur.url,"_blank")}};
async function up(k,files){if(!assets||!db)return toast("Uploading not available");let ok=0;
 for(const f of files){try{toast(`Uploading ${f.name}…`);const r=await assets.upload(f);const id="f"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  await db.doc("items/"+id).set({k,name:f.name,type:f.type||"application/octet-stream",url:r.url,aid:r.id,size:f.size,ts:Date.now()});ok++}catch(e){toast("Failed: "+f.name+" ("+(e.code||"error")+")")}}
 if(ok)toast(`✔ ${ok} file${ok>1?"s":""} saved`)}
async function del(id){const i=items.find(x=>x.id===id);if(!i||!confirm("Delete "+i.name+"?"))return;try{await db.doc("items/"+id).delete();if(assets&&i.aid)await assets.delete(i.aid);toast("Deleted")}catch(e){toast("Could not delete")}}
$("#edit").onclick=async()=>{const q=(m,k)=>{const v=prompt(m,P[k]||"");return v===null?P[k]||"":v};
 const d={...P,n:q("Your name:","n"),c:q("Course / Year:","c"),b:q("Short intro line:","b"),r:q("Roles shown in typing animation (comma separated), e.g. Student, Developer, Dreamer:","r"),a:q("About you (your story):","a"),sc:q("School:","sc"),ag:q("Age:","ag"),em:q("Email:","em"),lo:q("Location:","lo"),sk:q("Skills with % (e.g. HTML:90, CSS:80, Java:70):","sk"),hb:q("Hobbies (comma separated):","hb")};
 try{await db.doc("profile/me").set(d);toast("Saved ✔")}catch(e){toast("Could not save")}};
const pf=$("#pbtn input");$("#pbtn").onclick=e=>{if(e.target!==pf)pf.click()};
pf.onchange=async()=>{const f=pf.files[0];if(!f||!assets)return;try{toast("Uploading photo…");const r=await assets.upload(f);await db.doc("profile/me").set({...P,ph:r.url});toast("Photo saved ✔")}catch(e){toast("Photo failed")}};
let P={};
function prof(d){if(!d)return;P=d;if(d.n){$("#nm").textContent=d.n;$("#an").textContent="Hello, I'm "+d.n+"!"}if(d.c)$("#crs").textContent=d.c;if(d.b)$("#bio").textContent=d.b;if(d.a)$("#at").textContent=d.a;
 if(d.ph){$("#av").innerHTML=`<img src="${d.ph}" alt="me">`;$("#ph").innerHTML=`<img src="${d.ph}" alt="me">`}
 if(d.r)roles=d.r.split(",").map(x=>x.trim()).filter(Boolean);
 const inf=[["School",d.sc],["Course",d.c],["Age",d.ag],["Email",d.em],["Location",d.lo]].filter(x=>x[1]);
 if(inf.length)$("#info").innerHTML=inf.map(x=>`<div><small>${x[0]}</small><b>${esc(x[1])}</b></div>`).join("");
 if(d.sk){$("#skills").innerHTML=d.sk.split(",").map(x=>{const[n,v]=x.split(":");return`<div class="sk"><span>${esc(n.trim())}<em>${parseInt(v)||80}%</em></span><i><b data-w="${parseInt(v)||80}"></b></i></div>`}).join("");setTimeout(bars,100)}
 if(d.hb)$("#hobs").innerHTML=d.hb.split(",").map(x=>`<span>${esc(x.trim())}</span>`).join("")}
function bars(){document.querySelectorAll(".sk b").forEach(b=>{if(b.getBoundingClientRect().top<innerHeight)b.style.width=b.dataset.w+"%"})}
let roles=["Student","Learner","Future Professional"];
(function(){let r=0,c=0,del=false;const el=$("#role");(function t(){const w=roles[r%roles.length];c+=del?-1:1;el.textContent=w.slice(0,c);let sp=del?40:90;if(!del&&c===w.length){del=true;sp=1400}else if(del&&c===0){del=false;r++;sp=300}setTimeout(t,sp)})()})();
const cv=$("#cv"),cx=cv.getContext("2d");let pts=[],mx=-999,my=-999;
function rs(){cv.width=innerWidth;cv.height=innerHeight;pts=Array.from({length:Math.min(70,innerWidth/18|0)},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5}))}rs();addEventListener("resize",rs);
(function f(){cx.clearRect(0,0,cv.width,cv.height);const col=getComputedStyle(document.documentElement).getPropertyValue("--a")||"#6d5dfc";cx.fillStyle=col;cx.strokeStyle=col;
 pts.forEach((p,i)=>{p.x=(p.x+p.vx+cv.width)%cv.width;p.y=(p.y+p.vy+cv.height)%cv.height;cx.globalAlpha=.6;cx.beginPath();cx.arc(p.x,p.y,2,0,7);cx.fill();
  for(let j=i+1;j<pts.length;j++){const q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<120){cx.globalAlpha=(1-d/120)*.25;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke()}}
  const dm=Math.hypot(p.x-mx,p.y-my);if(dm<150){cx.globalAlpha=.4;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(mx,my);cx.stroke()}});requestAnimationFrame(f)})();
addEventListener("pointermove",e=>{mx=e.clientX;my=e.clientY;const g=$("#glow");g.style.left=mx+"px";g.style.top=my+"px"});
addEventListener("scroll",()=>{$("#pg").style.width=scrollY/(document.documentElement.scrollHeight-innerHeight)*100+"%";bars()},{passive:true});
document.addEventListener("pointermove",e=>{const g=e.target.closest&&e.target.closest(".grp");document.querySelectorAll(".grp").forEach(x=>{if(x!==g)x.style.transform=""});if(g){const r=g.getBoundingClientRect();g.style.transform=`perspective(900px) rotateY(${((e.clientX-r.left)/r.width-.5)*6}deg) rotateX(${-((e.clientY-r.top)/r.height-.5)*6}deg) translateY(-4px)`}});
$("#yr").textContent=new Date().getFullYear();build();render();
(async()=>{try{if(!window.claude)return;
 db=await claude.use("db");assets=await claude.use("assets");dl=await claude.use("downloads");
 try{const u=await claude.use("user");canUp=!!(assets&&u&&await u.canEdit())}catch(e){canUp=!!assets}
 if(db){db.collection("items").onSnapshot(s=>{items=s.docs.map(d=>({id:d.id,...d.data()}));render()},()=>{});db.doc("profile/me").onSnapshot(s=>prof(s.data()),()=>{})}
 render()}catch(e){}})();
