import "./styles.css";
import { congressesForTerms, fetchVotingSnapshot, findLegislatorByBioguideId } from "./api";
import { congressLabel, lookupVotingRecord, validateBioguideId, type LookupResult } from "./domain";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root is missing.");

app.innerHTML = `
  <div class="shell">
    <header class="masthead">
      <p class="kicker">PUBLIC RECORD / ROLL CALL</p>
      <h1>Trace the vote.</h1>
      <p class="lede">Inspect a member's congressional record by Bioguide ID, with every count tied back to a source record.</p>
    </header>
    <section class="lookup-panel" aria-labelledby="lookup-title">
      <div class="section-heading">
        <p class="eyebrow">Individual record</p>
        <h2 id="lookup-title">Find a member by Bioguide ID</h2>
      </div>
      <form id="lookup-form" class="lookup-form">
        <label>
          <span>Bioguide ID</span>
          <input id="bioguide" name="bioguide" value="R000570" autocomplete="off" spellcheck="false" aria-describedby="id-help" />
          <small id="id-help">Example: R000570</small>
        </label>
        <label id="congress-field" hidden>
          <span>Congress</span>
          <select id="congress" name="congress"></select>
        </label>
        <button type="submit">Find member <span aria-hidden="true">→</span></button>
      </form>
    </section>
    <section id="result" aria-live="polite" aria-busy="false"></section>
  </div>
`;

const form = document.querySelector<HTMLFormElement>("#lookup-form")!;
const bioguideInput = document.querySelector<HTMLInputElement>("#bioguide")!;
const congressField = document.querySelector<HTMLLabelElement>("#congress-field")!;
const congressSelect = document.querySelector<HTMLSelectElement>("#congress")!;
const result = document.querySelector<HTMLElement>("#result")!;
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = bioguideInput.value;
  const button = form.querySelector<HTMLButtonElement>("button")!;
  button.disabled = true;
  result.innerHTML = `<div class="message-panel"><p class="eyebrow">Looking up member</p><h2>Checking congressional service...</h2></div>`;

  const validation = validateBioguideId(id);
  if (!validation.valid) {
    renderResult(lookupVotingRecord(id, 1, { schemaVersion: 1, generatedAt: "", source: "", politicians: [], votes: [] }));
    button.disabled = false;
    return;
  }

  let legislator;
  try {
    legislator = await findLegislatorByBioguideId(id);
  } catch {
    legislator = undefined;
  }

  const availableCongresses = legislator ? congressesForTerms(legislator.terms ?? []) : [];
  updateCongressOptions(availableCongresses, Number(congressSelect.value));
  const congress = Number(congressSelect.value) || availableCongresses[0];
  if (!legislator || congress === undefined) {
    renderResult(lookupVotingRecord(id, 1, { schemaVersion: 1, generatedAt: "", source: "", politicians: [], votes: [] }));
    button.disabled = false;
    return;
  }
  try {
    const remoteSnapshot = await fetchVotingSnapshot(legislator, congress);
    renderResult(lookupVotingRecord(id, congress, remoteSnapshot));
  } catch {
    result.innerHTML = `<div class="message-panel"><p class="eyebrow">Lookup unavailable</p><h2>We couldn't load that voting record.</h2><p>The remote voting data provider did not respond. Try again shortly.</p></div>`;
  }
  button.disabled = false;
});

function updateCongressOptions(availableCongresses: number[], preferredCongress?: number): void {
  congressField.hidden = availableCongresses.length === 0;
  if (availableCongresses.length === 0) {
    congressSelect.innerHTML = "";
    return;
  }
  const congress = availableCongresses.includes(preferredCongress ?? 0) ? preferredCongress : availableCongresses[0];
  congressSelect.innerHTML = availableCongresses
    .map((number) => `<option value="${number}"${number === congress ? " selected" : ""}>${congressLabel(number)}</option>`)
    .join("");
}

function renderResult(record: LookupResult): void {
  if (record.status === "invalid-id" || record.status === "unsupported") {
    const heading = record.status === "invalid-id" ? "Check the Bioguide ID." : "We couldn't find that member.";
    result.innerHTML = `<div class="message-panel"><p class="eyebrow">${record.status === "invalid-id" ? "Invalid ID" : "No match"}</p><h2>${heading}</h2><p>${escapeHtml(record.warnings[0]?.message ?? "Check the Bioguide ID and try again.")}</p></div>`;
    return;
  }

  const warnings = record.warnings.length > 0
    ? `<div class="warning-summary" role="status"><span class="warning-mark" aria-hidden="true">!</span><span>${record.warnings.length} record warning${record.warnings.length === 1 ? "" : "s"} shown inline below.</span></div>`
    : "";
  const rows = record.votes.length > 0
    ? record.votes.map((vote) => `<tr>
        <td><time datetime="${vote.date}">${formatDate(vote.date)}</time></td>
        <td><strong>${escapeHtml(vote.title)}</strong><small>${vote.voteId}</small></td>
        <td><span class="outcome outcome-${vote.outcome}">${vote.outcome}</span></td>
        <td>${vote.warning ? `<span class="row-warning" tabindex="0" title="${escapeHtml(vote.warning.message)}" aria-label="Warning: ${escapeHtml(vote.warning.message)}">!</span>` : vote.sourceUrl ? `<a class="source-link" href="${vote.sourceUrl}" target="_blank" rel="noreferrer">Source ↗</a>` : "—"}</td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="empty-cell">No voting records were found for this Congress.</td></tr>`;

  result.innerHTML = `
    <div class="result-heading">
      <div><p class="eyebrow">${record.status === "partial" ? "Partial record" : "Verified record"}</p><h2>${escapeHtml(record.politician?.name ?? "Unknown member")}</h2><p class="muted">${record.congressLabel} · ${record.politician?.chamber ?? ""}</p></div>
    </div>
    ${warnings}
    <div class="metrics" aria-label="Vote totals">
      <div><span class="metric-value">${record.votes.length}</span><span class="metric-label">Recorded votes</span></div>
      <div><span class="metric-value">${record.counts.yes}</span><span class="metric-label">Yea</span></div>
      <div><span class="metric-value">${record.counts.no}</span><span class="metric-label">Nay</span></div>
      <div><span class="metric-value">${record.counts["not-voting"] + record.counts.present}</span><span class="metric-label">Not decisive</span></div>
    </div>
    <div class="table-wrap"><table><caption>Vote-level evidence for ${escapeHtml(record.congressLabel)}</caption><thead><tr><th scope="col">Date</th><th scope="col">Measure</th><th scope="col">Outcome</th><th scope="col">Evidence</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="source-note">Provider: ${escapeHtml(record.source ?? "Unknown")} · Retrieved ${record.generatedAt ? formatDate(record.generatedAt) : "unknown"}. Warnings exclude uncertain outcomes from downstream comparison calculations.</p>
  `;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

