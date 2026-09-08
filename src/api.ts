import type { Snapshot } from "./domain";

export interface LegislatorTerm {
  start: string;
  end: string;
  type?: "rep" | "sen";
}

export interface Legislator {
  id?: {
    bioguide?: string;
    icpsr?: number;
  };
  name?: {
    first?: string;
    last?: string;
  };
  terms?: LegislatorTerm[];
}

const legislatorUrls = [
  "https://unitedstates.github.io/congress-legislators/legislators-current.json",
  "https://unitedstates.github.io/congress-legislators/legislators-historical.json",
];
const cacheKey = "politics:legislators:v1";
const cacheDuration = 24 * 60 * 60 * 1000;
let inMemoryLegislators: Legislator[] | undefined;

const voteviewBaseUrl = "https://voteview.com/static/data/out";

export async function findLegislatorByBioguideId(bioguideId: string): Promise<Legislator | undefined> {
  const normalizedId = bioguideId.trim().toUpperCase();
  const legislators = await loadLegislators();
  return legislators.find((legislator) => legislator.id?.bioguide === normalizedId);
}

export function congressesForTerms(terms: LegislatorTerm[]): number[] {
  const congresses = new Set<number>();
  for (const term of terms) {
    const start = congressForDate(term.start);
    const end = congressForDate(term.end);
    if (start < 1 || end < start) continue;
    for (let congress = start; congress <= end; congress += 1) congresses.add(congress);
  }
  return [...congresses].sort((left, right) => left - right);
}

export async function fetchVotingSnapshot(
  legislator: Legislator,
  congress: number,
  fetcher: typeof fetch = fetch,
): Promise<Snapshot> {
  const icpsr = legislator.id?.icpsr;
  if (icpsr === undefined) throw new Error("The member has no Voteview identifier.");

  const [votesCsv, rollcallsCsv] = await Promise.all([
    fetchCsv(`${voteviewBaseUrl}/votes/HS${congress}_votes.csv`, fetcher),
    fetchCsv(`${voteviewBaseUrl}/rollcalls/HS${congress}_rollcalls.csv`, fetcher),
  ]);
  const rollcalls = new Map(parseCsv(rollcallsCsv).map((row) => [voteKey(row), row]));
  const votes = parseCsv(votesCsv).flatMap((row) => {
    if (Number(row.icpsr) !== icpsr) return [];
    const rollcall = rollcalls.get(voteKey(row));
    if (!rollcall) return [];
    const chamber: "House" | "Senate" = row.chamber === "Senate" ? "Senate" : "House";
    return [{
      congress,
      chamber,
      rollnumber: Number(row.rollnumber),
      icpsr,
      castCode: Number(row.cast_code),
      date: rollcall.date,
      title: rollcall.vote_desc || rollcall.vote_question || "Roll-call vote",
      billId: rollcall.bill_number || undefined,
      sourceUrl: `https://voteview.com/rollcall/${chamber === "Senate" ? "RS" : "RH"}${congress}${String(row.rollnumber).padStart(4, "0")}`,
    }];
  });
  const latestTerm = legislator.terms?.at(-1);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: "Voteview; identity crosswalk: congress-legislators",
    politicians: [{
      bioguideId: legislator.id?.bioguide ?? "",
      name: [legislator.name?.first, legislator.name?.last].filter(Boolean).join(" "),
      chamber: latestTerm?.type === "sen" ? "Senate" : "House",
      icpsr,
    }],
    votes,
  };
}

export async function loadLegislators(
  fetcher: typeof fetch = fetch,
  storage: Storage | undefined = getStorage(),
): Promise<Legislator[]> {
  if (inMemoryLegislators) return inMemoryLegislators;

  const cached = readCache(storage);
  if (cached) {
    inMemoryLegislators = cached;
    return cached;
  }

  const responses = await Promise.all(legislatorUrls.map(async (url) => {
    const response = await fetcher(url);
    if (!response.ok) throw new Error(`Legislator API returned ${response.status}`);
    return response.json() as Promise<Legislator[]>;
  }));
  inMemoryLegislators = responses.flat();
  writeCache(storage, inMemoryLegislators);
  return inMemoryLegislators;
}

function congressForDate(value: string): number {
  const year = Number(value.slice(0, 4));
  if (!Number.isInteger(year)) return 0;
  return Math.floor((year - 1789) / 2) + 1;
}

function getStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function readCache(storage: Storage | undefined): Legislator[] | undefined {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(cacheKey);
    if (!raw) return undefined;
    const cached = JSON.parse(raw) as { fetchedAt?: number; legislators?: Legislator[] };
    if (!cached.fetchedAt || Date.now() - cached.fetchedAt >= cacheDuration || !Array.isArray(cached.legislators)) return undefined;
    return cached.legislators;
  } catch {
    return undefined;
  }
}

function writeCache(storage: Storage | undefined, legislators: Legislator[]): void {
  if (!storage) return;
  try {
    storage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), legislators }));
  } catch {
    // A full or unavailable browser cache should not block a lookup.
  }
}

async function fetchCsv(url: string, fetcher: typeof fetch): Promise<string> {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Voteview returned ${response.status}`);
  return response.text();
}

function voteKey(row: Record<string, string>): string {
  return `${row.congress}-${row.chamber}-${row.rollnumber}`;
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
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
