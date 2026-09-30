const $=s=>document.querySelector(s);
let S={events:[]};
try{Object.assign(S,JSON.parse(localStorage.getItem("app1")||"{}"))}catch(e){}
if(!Array.isArray(S.events))S.events=[];
S.events=S.events.filter(e=>e.type!=="Séance");
const OFF=[["عيد الوحدة","2026-10-31",1],["ذكرى المسيرة الخضراء","2026-11-06",1],["عيد الاستقلال","2026-11-18",1],["فاتح السنة الميلادية","2027-01-01",1],["تظاهرة الاستقلال","2027-01-11",1],["السنة الأمازيغية","2027-01-14",1],["عطلة نهاية السداسي الأول","2027-01-20",20],["عيد الفطر","2027-03-30",1],["عيد الشغل","2027-05-01",1],["عيد العرش","2027-07-30",1],["عطلة نهاية السداسي الثاني","2027-05-24",52]];
const OLD=["Fête de l'Unité","Marche Verte","Fête de l'Indépendance","Jour de l'an","Manifeste de l'Indépendance","An Amazigh","Vacances fin 1er semestre","Aïd Al Fitr","Fête du Travail"];
function seed(){S.events=S.events.filter(e=>!(OLD.includes(e.title)&&e.date>="2026-10-31"&&e.date<="2027-06-06"));OFF.forEach(([title,date,days],i)=>{if(!S.events.some(e=>e.title===title&&e.date===date)){S.events.push({id:`seed_${i}`,title,date,days})}})};
const save=()=>{try{localStorage.setItem("app1",JSON.stringify(S))}catch(e){}};
if(!S.seed2627ar){seed();S.seed2627ar=1;save()}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const M=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],J=["Di","Lu","Ma","Me","Je","Ve","Sa"];
const pad=n=>String(n).padStart(2,"0"),iso=(y,m,d)=>`${y}-${pad(m+1)}-${pad(d)}`;
const parse=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const fmt=s=>s.split("-").reverse().join("/");
const endOf=e=>{const d=parse(e.date);d.setDate(d.getDate()+dur(e)-1);return iso(d.getFullYear(),d.getMonth(),d.getDate())};

/* Attestation */
document.querySelectorAll("#att .f").forEach(e=>{const k=e.dataset.k;if(S[k]!=null)e.textContent=S[k];
  e.oninput=()=>{S[k]=e.textContent;save()};
  e.onpaste=ev=>{ev.preventDefault();document.execCommand("insertText",false,ev.clipboardData.getData("text/plain"))}});
$("#dp").onchange=e=>{if(!e.target.value)return;const t=$("[data-k=date]");t.textContent=fmt(e.target.value);S.date=t.textContent;save()};

/* Planning (print only) */
function build(){
  const[y0,m0]=(S.st||"2026-09").split("-").map(Number);
  const d0=parseInt(S.sd||"1",10);
  const[y1,m1]=(S.en||"2027-08").split("-").map(Number);
  
  // Calculate number of months
  let nm=Math.min(24,Math.max(1,(y1-y0)*12+m1-m0+1));
  const pages=Math.ceil(nm/4);
  
  const map={};
  S.events.forEach(e=>{for(let i=0;i<dur(e);i++){const d=parse(e.date);d.setDate(d.getDate()+i);(map[iso(d.getFullYear(),d.getMonth(),d.getDate())]??=[]).push(e)}});
  let h="";
  for(let p=0;p<pages;p++){
    h+=`<div class="sheet"><h2>${esc(S.ptitle||"Planning Ingénieur Informatique")} ${esc(S.pyear||"2026-2027")}</h2><div class="g">`;
    for(let i=0;i<4;i++){
      if(p*4+i>=nm)break;
      const n=m0-1+p*4+i,y=y0+Math.floor(n/12),m=n%12,nd=new Date(y,m+1,0).getDate();
      h+=`<div class="m"><h3>${M[m]} ${y}</h3>`;
      
      // Determine start day for this month
      let startDay=1;
      if(p===0&&i===0){startDay=d0;} // First month uses custom start day
      
      for(let d=startDay;d<=31;d++){
        if(d>nd){h+=`<div class="d"><b></b></div>`;continue}
        const w=new Date(y,m,d).getDay(),c=w==4||w==5?"t":w==6?"s":w==0?"u":"",ev=map[iso(y,m,d)];
        h+=`<div class="d ${c}"${ev?` style="background:${colorOf(ev[0])}"`:""}><b>${d} ${J[w]}</b>${ev?`<span class="ev" dir="auto">${esc(ev.map(x=>x.title).join(" / "))}</span>`:(w==4||w==5?'<span class="ln">Cours</span>':"")}</div>`;
      }
      h+=`</div>`;
    }
    h+=`</div><div class="lg"><span><i style="background:#bfe8bf"></i>Jeudi et Vendredi</span><span><i style="background:#bcd6ff"></i>Samedi</span><span><i style="background:#ff8a8a"></i>Vacances</span></div>`;
  }
  $("#plan").innerHTML=h;
}

/* Réglages */
$("#pt").value=S.ptitle||"Planning Ingénieur Informatique";$("#py").value=S.pyear||"2026-2027";$("#st").value=S.st||"2026-09";$("#sd").value=S.sd||"1";
$("#pt").oninput=()=>{S.ptitle=$("#pt").value;save();build()};
$("#py").oninput=()=>{S.pyear=$("#py").value;save();build()};
$("#st").onchange=()=>{S.st=$("#st").value;save();build()};
$("#sd").onchange=()=>{S.sd=$("#sd").value;save();build()};
$("#se").value=S.en||"2027-08";$("#se").onchange=()=>{S.en=$("#se").value;save();build()};

/* CRUD */
let editId=null;const COL={v:"#ff8a8a",d:"#bfe8bf",p:"#bcd6ff",o:"#cccccc"};
const colorOf=e=>COL.v;
const dur=e=>e.days;
function resetForm(){editId=null;$("#et").value="";$("#ed").value="";$("#en").value=1;$("#ok").textContent="Ajouter";$("#ft").textContent="Ajouter des vacances";$("#cx").classList.add("hide");$("#er").textContent=""}
$("#ok").onclick=()=>{
  const date=$("#ed").value,title=$("#et").value.trim(),days=parseInt($("#en").value,10);
  if(!title||!date||!(days>=1)){$("#er").textContent="Renseigne le titre, la date de début et une durée d'au moins 1 jour.";return}
  const o={title,date,days};
  if(editId){const e=S.events.find(x=>x.id===editId);Object.assign(e,o)}else S.events.push({id:Date.now(),...o});
  save();resetForm();render();build();
};
$("#cx").onclick=resetForm;
function render(){
  const q=$("#sq").value.trim().toLowerCase(),df=$("#sd2").value;
  const l=S.events.filter(e=>(!q||e.title.toLowerCase().includes(q))&&(!df||(e.date<=df&&df<=endOf(e)))).sort((a,b)=>a.date.localeCompare(b.date));
  $("#cnt").textContent=`(${l.length}/${S.events.length})`;
  $("#list").innerHTML=l.length?l.map(e=>`<div class="it"><i style="background:${colorOf(e)}"></i><div class="tx"><b dir="auto">${esc(e.title)}</b><small>Du ${fmt(e.date)} au ${fmt(endOf(e))} · ${e.days} jour${e.days>1?"s":""}</small></div><div><button class="on" data-i="${e.id}" data-a="e" style="font-size:12px">Modifier</button><button data-i="${e.id}" data-a="d" style="font-size:12px">Supprimer</button></div></div>`).join(""):"<div style='opacity:.5'>Aucune vacances</div>";
}
$("#list").onclick=ev=>{
  const b=ev.target.closest("button");if(!b)return;const id=+b.dataset.i,e=S.events.find(x=>x.id===id);if(!e)return;
  if(b.dataset.a==="d"){if(confirm(`Supprimer « ${e.title} » ?`)){S.events=S.events.filter(x=>x.id!==id);save();render();build()}}
  else{editId=id;$("#et").value=e.title;$("#ed").value=e.date;$("#en").value=e.days;$("#ok").textContent="Enregistrer";$("#ft").textContent="Modifier les vacances";$("#cx").classList.remove("hide");$("#er").textContent=""}
};
$("#sr").onclick=()=>{seed();save();render();build()};
$("#sq").oninput=render;$("#sd2").onchange=render;$("#sc").onclick=()=>{$("#sq").value="";$("#sd2").value="";render()};

/* Onglets, impression, reset */
const tab=n=>{$("#v1").classList.toggle("hide",n!=1);$("#v2").classList.toggle("hide",n!=2);$("#b1").classList.toggle("on",n==1);$("#b2").classList.toggle("on",n==2)};
$("#b1").onclick=()=>tab(1);$("#b2").onclick=()=>tab(2);
$("#pr").onclick=()=>{build();window.print()};
$("#rs").onclick=()=>{if(confirm("Tout effacer et revenir aux valeurs par défaut ?")){try{localStorage.removeItem("app1")}catch(e){}location.reload()}};
render();build();
