import { mkdir, writeFile } from "node:fs/promises";

const MIN_CONGRESS = 81;
const sources = {
  currentMembers: "https://unitedstates.github.io/congress-legislators/legislators-current.json",
  historicalMembers: "https://unitedstates.github.io/congress-legislators/legislators-historical.json",
  votes: "https://voteview.com/static/data/out/votes/HSall_votes.csv",
  rollcalls: "https://voteview.com/static/data/out/rollcalls/HSall_rollcalls.csv",
};

const [current, historical, votesCsv, rollcallsCsv] = await Promise.all(Object.values(sources).map(async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}));

const members = [...JSON.parse(current), ...JSON.parse(historical)]
  .filter((member) => member.id?.bioguide && member.id?.icpsr)
  .map((member) => ({
    bioguideId: member.id.bioguide,
    name: [member.name?.first, member.name?.last].filter(Boolean).join(" "),
    chamber: member.terms?.at(-1)?.type === "sen" ? "Senate" : "House",
    icpsr: Number(member.id.icpsr),
  }));
const memberByIcpsr = new Map(members.map((member) => [member.icpsr, member]));
const rollcalls = new Map(parseCsv(rollcallsCsv).map((row) => [key(row), row]));
const votes = parseCsv(votesCsv).flatMap((row) => {
  const congress = Number(row.congress);
  const icpsr = Number(row.icpsr);
  const member = memberByIcpsr.get(icpsr);
  const rollcall = rollcalls.get(key(row));
  if (congress < MIN_CONGRESS || !member || !rollcall) return [];
  return [{
    congress,
    chamber: row.chamber === "Senate" ? "Senate" : "House",
    rollnumber: Number(row.rollnumber),
    icpsr,
    castCode: Number(row.cast_code),
    date: rollcall.date,
    title: rollcall.vote_desc || rollcall.vote_question || "Roll-call vote",
    billId: rollcall.bill_number || undefined,
    sourceUrl: rollcall.congress_url || undefined,
  }];
});

await mkdir("public/data", { recursive: true });
await writeFile("public/data/snapshot.json", JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "Voteview; identity crosswalk: congress-legislators",
  politicians: members,
  votes,
}, null, 2) + "\n");

function key(row) {
  return `${row.congress}-${row.chamber}-${row.rollnumber}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (const character of text) {
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { row.push(field); field = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\n" && (field || row.length)) { row.push(field); rows.push(row); row = []; field = ""; }
    } else field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((name, index) => [name, values[index] ?? ""])));
}
