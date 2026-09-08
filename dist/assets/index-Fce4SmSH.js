(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function o(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(s){if(s.ep)return;s.ep=!0;const i=o(s);fetch(s.href,i)}})();function $(e){const t=e.trim().toUpperCase();return/^[A-Z]\d{6}$/.test(t)?{valid:!0,value:t}:{valid:!1,message:"Enter a Bioguide ID such as R000570."}}function y(e,t){const o=$(e);if(!o.valid)return[];const n=t.politicians.find(s=>s.bioguideId===o.value);return(n==null?void 0:n.icpsr)===void 0?[]:[...new Set(t.votes.filter(s=>s.icpsr===n.icpsr).map(s=>s.congress))].sort((s,i)=>s-i)}function b(e){if(!Number.isInteger(e)||e<1)throw new Error("Congress number must be a positive integer.");const t=1789+(e-1)*2;return`${A(e)} Congress (${t}–${t+2})`}function A(e){const t=e%100>=11&&e%100<=13?"th":{1:"st",2:"nd",3:"rd"}[e%10]??"th";return`${e}${t}`}function R(e){return[1,2,3].includes(e)?"yes":[4,5,6].includes(e)?"no":[7,8].includes(e)?"present":e===9?"not-voting":e===0?"not-member":"unknown"}function U(){return{yes:0,no:0,present:0,abstain:0,"not-voting":0,"not-member":0,unknown:0}}function I(e,t,o){const n=b(t),s=U(),i=$(e);if(!i.valid)return{status:"invalid-id",congress:t,congressLabel:n,counts:s,votes:[],warnings:[{code:"invalid-id",message:i.message}]};const l=o.politicians.find(a=>a.bioguideId===i.value);if(!l)return{status:"unsupported",congress:t,congressLabel:n,counts:s,votes:[],warnings:[{code:"incomplete-mapping",message:"This Bioguide ID is not mapped to a supported voting-record identifier."}]};if(l.icpsr===void 0)return{status:"partial",politician:l,congress:t,congressLabel:n,counts:s,votes:[],warnings:[{code:"incomplete-mapping",message:"This historical member is known, but the voting-record identifier is missing."}]};const p=o.votes.filter(a=>a.congress===t&&a.icpsr===l.icpsr),r=new Set,g=[],D=p.map(a=>{const f=`${a.congress}-${a.chamber}-${a.rollnumber}`,h=R(a.castCode);let d;return r.has(f)?d={code:"duplicate-vote",message:"Duplicate provider record; verify this vote before relying on the aggregate."}:h==="unknown"?d={code:"unknown-outcome",message:`Provider cast code ${a.castCode} could not be normalized.`}:a.sourceUrl||(d={code:"missing-provenance",message:"This record has no source link."}),r.add(f),s[h]+=1,d&&g.push(d),{voteId:f,date:a.date,title:a.title,outcome:h,originalCastCode:a.castCode,sourceUrl:a.sourceUrl,warning:d}});return{status:g.some(a=>a.code==="incomplete-mapping")?"partial":p.length===0?"no-results":g.length>0?"partial":"success",politician:l,congress:t,congressLabel:n,generatedAt:o.generatedAt,source:o.source,counts:s,votes:D,warnings:g}}function E(e,t=Date.now()){return t-Date.parse(e)>1440*60*1e3}const N={schemaVersion:1,generatedAt:"2026-09-07T06:00:00.000Z",source:"Voteview snapshot fixture",politicians:[{bioguideId:"R000570",name:"Paul Ryan",chamber:"House",icpsr:29939},{bioguideId:"M001111",name:"Example Senator",chamber:"Senate",icpsr:99999}],votes:[{congress:113,chamber:"House",rollnumber:1,icpsr:29939,castCode:1,date:"2013-01-03",title:"Election of the Speaker",billId:"HRES1",sourceUrl:"https://www.congress.gov/"},{congress:113,chamber:"House",rollnumber:2,icpsr:29939,castCode:6,date:"2013-01-04",title:"Adoption of the rules",billId:"HRES5",sourceUrl:"https://www.congress.gov/"},{congress:113,chamber:"House",rollnumber:3,icpsr:29939,castCode:9,date:"2013-01-07",title:"Procedural motion",sourceUrl:"https://www.congress.gov/"}]},S=document.querySelector("#app");if(!S)throw new Error("Application root is missing.");let c=N;const H=[81,90,100,110,113,114,115,116,117,118,119];S.innerHTML=`
  <div class="shell">
    <header class="masthead">
      <p class="kicker">PUBLIC RECORD / ROLL CALL</p>
      <h1>Trace the vote.</h1>
      <p class="lede">Inspect a member's congressional record by Bioguide ID, with every count tied back to a source record.</p>
    </header>
    <section class="lookup-panel" aria-labelledby="lookup-title">
      <div class="section-heading">
        <p class="eyebrow">Individual record</p>
        <h2 id="lookup-title">Choose a member and Congress</h2>
      </div>
      <form id="lookup-form" class="lookup-form">
        <label>
          <span>Bioguide ID</span>
          <input id="bioguide" name="bioguide" value="R000570" autocomplete="off" spellcheck="false" aria-describedby="id-help" />
          <small id="id-help">Example: R000570</small>
        </label>
        <label>
          <span>Congress</span>
          <select id="congress" name="congress">
            ${H.map(e=>`<option value="${e}">${b(e)}</option>`).join("")}
          </select>
        </label>
        <button type="submit">View record <span aria-hidden="true">→</span></button>
      </form>
    </section>
    <section id="result" aria-live="polite" aria-busy="false"></section>
  </div>
`;const O=document.querySelector("#lookup-form"),k=document.querySelector("#bioguide"),m=document.querySelector("#congress"),w=document.querySelector("#result");O.addEventListener("submit",e=>{e.preventDefault();const t=k.value,o=Number(m.value),n=y(t,c);L(n,o);const s=Number(m.value);C(I(t,s,c))});function L(e,t){if(e.length===0)return;const o=e.includes(t??0)?t:e[0];m.innerHTML=e.map(n=>`<option value="${n}"${n===o?" selected":""}>${b(n)}</option>`).join("")}function C(e){var i,l,p;const t=P(c.generatedAt),o=c.generatedAt?`<div class="freshness ${t?"is-stale":"is-fresh"}"><span class="freshness-dot" aria-hidden="true"></span><span>${t?"Snapshot is stale":"Snapshot is current"}</span><time datetime="${c.generatedAt}">Updated ${v(c.generatedAt)}</time></div>`:"";if(e.status==="invalid-id"||e.status==="unsupported"){const r=e.status==="invalid-id"?"Check the Bioguide ID.":"We couldn't find that member.";w.innerHTML=`<div class="message-panel"><p class="eyebrow">${e.status==="invalid-id"?"Invalid ID":"No match"}</p><h2>${r}</h2><p>${u(((i=e.warnings[0])==null?void 0:i.message)??"Check the Bioguide ID and try again.")}</p></div>`;return}const n=e.warnings.length>0?`<div class="warning-summary" role="status"><span class="warning-mark" aria-hidden="true">!</span><span>${e.warnings.length} record warning${e.warnings.length===1?"":"s"} shown inline below.</span></div>`:"",s=e.votes.length>0?e.votes.map(r=>`<tr>
        <td><time datetime="${r.date}">${v(r.date)}</time></td>
        <td><strong>${u(r.title)}</strong><small>${r.voteId}</small></td>
        <td><span class="outcome outcome-${r.outcome}">${r.outcome}</span></td>
        <td>${r.warning?`<span class="row-warning" tabindex="0" title="${u(r.warning.message)}" aria-label="Warning: ${u(r.warning.message)}">!</span>`:r.sourceUrl?`<a class="source-link" href="${r.sourceUrl}" target="_blank" rel="noreferrer">Source ↗</a>`:"—"}</td>
      </tr>`).join(""):'<tr><td colspan="4" class="empty-cell">No voting records were found for this Congress.</td></tr>';w.innerHTML=`
    <div class="result-heading">
      <div><p class="eyebrow">${e.status==="partial"?"Partial record":"Verified record"}</p><h2>${u(((l=e.politician)==null?void 0:l.name)??"Unknown member")}</h2><p class="muted">${e.congressLabel} · ${((p=e.politician)==null?void 0:p.chamber)??""}</p></div>
      ${o}
    </div>
    ${n}
    <div class="metrics" aria-label="Vote totals">
      <div><span class="metric-value">${e.votes.length}</span><span class="metric-label">Recorded votes</span></div>
      <div><span class="metric-value">${e.counts.yes}</span><span class="metric-label">Yea</span></div>
      <div><span class="metric-value">${e.counts.no}</span><span class="metric-label">Nay</span></div>
      <div><span class="metric-value">${e.counts["not-voting"]+e.counts.present}</span><span class="metric-label">Not decisive</span></div>
    </div>
    <div class="table-wrap"><table><caption>Vote-level evidence for ${u(e.congressLabel)}</caption><thead><tr><th scope="col">Date</th><th scope="col">Measure</th><th scope="col">Outcome</th><th scope="col">Evidence</th></tr></thead><tbody>${s}</tbody></table></div>
    <p class="source-note">Provider: ${u(e.source??"Unknown")} · Retrieved ${e.generatedAt?v(e.generatedAt):"unknown"}. Warnings exclude uncertain outcomes from downstream comparison calculations.</p>
  `}function P(e){return E(e)}function v(e){return new Intl.DateTimeFormat("en-US",{year:"numeric",month:"short",day:"numeric"}).format(new Date(e))}function u(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t]??t)}T();async function T(){try{const o=await fetch("./data/snapshot.json");if(!o.ok)throw new Error(`Snapshot returned ${o.status}`);c=await o.json()}catch{}const e=k.value,t=y(e,c);L(t,Number(m.value)),C(I(e,Number(m.value),c))}
