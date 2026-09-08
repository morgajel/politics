import "./styles.css";
import { congressLabel, congressesForBioguideId, isSnapshotStale, lookupVotingRecord, type LookupResult, type Snapshot } from "./domain";
import { sampleSnapshot } from "./sample-data";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root is missing.");

let snapshot: Snapshot = sampleSnapshot;
const congresses = [81, 90, 100, 110, 113, 114, 115, 116, 117, 118, 119];

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
            ${congresses.map((number) => `<option value="${number}">${congressLabel(number)}</option>`).join("")}
          </select>
        </label>
        <button type="submit">View record <span aria-hidden="true">→</span></button>
      </form>
    </section>
    <section id="result" aria-live="polite" aria-busy="false"></section>
  </div>
`;

const form = document.querySelector<HTMLFormElement>("#lookup-form")!;
const bioguideInput = document.querySelector<HTMLInputElement>("#bioguide")!;
const congressSelect = document.querySelector<HTMLSelectElement>("#congress")!;
const result = document.querySelector<HTMLElement>("#result")!;
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = bioguideInput.value;
  const selectedCongress = Number(congressSelect.value);
  const availableCongresses = congressesForBioguideId(id, snapshot);
  updateCongressOptions(availableCongresses, selectedCongress);
  const congress = Number(congressSelect.value);
  renderResult(lookupVotingRecord(id, congress, snapshot));
});

function updateCongressOptions(availableCongresses: number[], preferredCongress?: number): void {
  if (availableCongresses.length === 0) return;
  const congress = availableCongresses.includes(preferredCongress ?? 0) ? preferredCongress : availableCongresses[0];
  congressSelect.innerHTML = availableCongresses
    .map((number) => `<option value="${number}"${number === congress ? " selected" : ""}>${congressLabel(number)}</option>`)
    .join("");
}

function renderResult(record: LookupResult): void {
  const stale = isStale(snapshot.generatedAt);
  const freshness = snapshot.generatedAt
    ? `<div class="freshness ${stale ? "is-stale" : "is-fresh"}"><span class="freshness-dot" aria-hidden="true"></span><span>${stale ? "Snapshot is stale" : "Snapshot is current"}</span><time datetime="${snapshot.generatedAt}">Updated ${formatDate(snapshot.generatedAt)}</time></div>`
    : "";

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
      ${freshness}
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

function isStale(timestamp: string): boolean {
  return isSnapshotStale(timestamp);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

void loadSnapshot();

async function loadSnapshot(): Promise<void> {
  try {
    const response = await fetch("./data/snapshot.json");
    if (!response.ok) throw new Error(`Snapshot returned ${response.status}`);
    snapshot = await response.json() as Snapshot;
  } catch {
    // The checked-in fixture keeps the static UI usable when the snapshot is unavailable.
  }
  const defaultId = bioguideInput.value;
  const availableCongresses = congressesForBioguideId(defaultId, snapshot);
  updateCongressOptions(availableCongresses, Number(congressSelect.value));
  renderResult(lookupVotingRecord(defaultId, Number(congressSelect.value), snapshot));
}
