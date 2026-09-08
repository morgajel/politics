export type NormalizedOutcome =
  | "yes"
  | "no"
  | "present"
  | "abstain"
  | "not-voting"
  | "not-member"
  | "unknown";

export type WarningCode =
  | "invalid-id"
  | "unknown-outcome"
  | "missing-provenance"
  | "incomplete-mapping"
  | "duplicate-vote";

export interface WarningDetail {
  code: WarningCode;
  message: string;
}

export interface Politician {
  bioguideId: string;
  name: string;
  chamber: "House" | "Senate";
  icpsr?: number;
}

export interface ProviderVoteRecord {
  congress: number;
  chamber: "House" | "Senate";
  rollnumber: number;
  icpsr: number;
  castCode: number;
  date: string;
  title: string;
  billId?: string;
  sourceUrl?: string;
}

export interface Snapshot {
  schemaVersion: 1;
  generatedAt: string;
  source: string;
  politicians: Politician[];
  votes: ProviderVoteRecord[];
}

export interface VoteEvidence {
  voteId: string;
  date: string;
  title: string;
  outcome: NormalizedOutcome;
  originalCastCode: number;
  sourceUrl?: string;
  warning?: WarningDetail;
}

export interface AggregateCounts {
  yes: number;
  no: number;
  present: number;
  abstain: number;
  "not-voting": number;
  "not-member": number;
  unknown: number;
}

export interface LookupResult {
  status: "success" | "invalid-id" | "unsupported" | "no-results" | "partial";
  politician?: Politician;
  congress: number;
  congressLabel: string;
  generatedAt?: string;
  source?: string;
  counts: AggregateCounts;
  votes: VoteEvidence[];
  warnings: WarningDetail[];
}

export function validateBioguideId(input: string):
  | { valid: true; value: string }
  | { valid: false; message: string } {
  const value = input.trim().toUpperCase();
  if (!/^[A-Z]\d{6}$/.test(value)) {
    return { valid: false, message: "Enter a Bioguide ID such as R000570." };
  }
  return { valid: true, value };
}

export function congressesForBioguideId(bioguideInput: string, snapshot: Snapshot): number[] {
  const validation = validateBioguideId(bioguideInput);
  if (!validation.valid) return [];

  const politician = snapshot.politicians.find((member) => member.bioguideId === validation.value);
  if (politician?.icpsr === undefined) return [];

  return [...new Set(
    snapshot.votes
      .filter((vote) => vote.icpsr === politician.icpsr)
      .map((vote) => vote.congress),
  )].sort((left, right) => left - right);
}

export function congressLabel(congress: number): string {
  if (!Number.isInteger(congress) || congress < 1) {
    throw new Error("Congress number must be a positive integer.");
  }
  const startYear = 1789 + (congress - 1) * 2;
  return `${ordinal(congress)} Congress (${startYear}\u2013${startYear + 2})`;
}

function ordinal(value: number): string {
  const suffix = value % 100 >= 11 && value % 100 <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[value % 10] ?? "th";
  return `${value}${suffix}`;
}

export function normalizeCastCode(castCode: number): NormalizedOutcome {
  if ([1, 2, 3].includes(castCode)) return "yes";
  if ([4, 5, 6].includes(castCode)) return "no";
  if ([7, 8].includes(castCode)) return "present";
  if (castCode === 9) return "not-voting";
  if (castCode === 0) return "not-member";
  return "unknown";
}

function emptyCounts(): AggregateCounts {
  return {
    yes: 0,
    no: 0,
    present: 0,
    abstain: 0,
    "not-voting": 0,
    "not-member": 0,
    unknown: 0,
  };
}

export function lookupVotingRecord(
  bioguideInput: string,
  congress: number,
  snapshot: Snapshot,
): LookupResult {
  const congressName = congressLabel(congress);
  const counts = emptyCounts();
  const validation = validateBioguideId(bioguideInput);
  if (!validation.valid) {
    return { status: "invalid-id", congress, congressLabel: congressName, counts, votes: [], warnings: [{ code: "invalid-id", message: validation.message }] };
  }

  const politician = snapshot.politicians.find((member) => member.bioguideId === validation.value);
  if (!politician) {
    return {
      status: "unsupported",
      congress,
      congressLabel: congressName,
      counts,
      votes: [],
      warnings: [{ code: "incomplete-mapping", message: "This Bioguide ID is not mapped to a supported voting-record identifier." }],
    };
  }
  if (politician.icpsr === undefined) {
    return {
      status: "partial",
      politician,
      congress,
      congressLabel: congressName,
      counts,
      votes: [],
      warnings: [{ code: "incomplete-mapping", message: "This historical member is known, but the voting-record identifier is missing." }],
    };
  }

  const records = snapshot.votes.filter((vote) => vote.congress === congress && vote.icpsr === politician.icpsr);
  const seen = new Set<string>();
  const warnings: WarningDetail[] = [];
  const votes: VoteEvidence[] = records.map((record) => {
    const voteId = `${record.congress}-${record.chamber}-${record.rollnumber}`;
    const outcome = normalizeCastCode(record.castCode);
    let warning: WarningDetail | undefined;
    if (seen.has(voteId)) {
      warning = { code: "duplicate-vote", message: "Duplicate provider record; verify this vote before relying on the aggregate." };
    } else if (outcome === "unknown") {
      warning = { code: "unknown-outcome", message: `Provider cast code ${record.castCode} could not be normalized.` };
    } else if (!record.sourceUrl) {
      warning = { code: "missing-provenance", message: "This record has no source link." };
    }
    seen.add(voteId);
    counts[outcome] += 1;
    if (warning) warnings.push(warning);
    return { voteId, date: record.date, title: record.title, outcome, originalCastCode: record.castCode, sourceUrl: record.sourceUrl, warning };
  });

  const status = warnings.some((warning) => warning.code === "incomplete-mapping") ? "partial" : records.length === 0 ? "no-results" : warnings.length > 0 ? "partial" : "success";
  return { status, politician, congress, congressLabel: congressName, generatedAt: snapshot.generatedAt, source: snapshot.source, counts, votes, warnings };
}

export function isSnapshotStale(timestamp: string, now = Date.now()): boolean {
  return now - Date.parse(timestamp) > 24 * 60 * 60 * 1000;
}
