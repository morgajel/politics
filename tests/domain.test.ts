import { describe, expect, it } from "vitest";
import { congressLabel, congressesForBioguideId, isSnapshotStale, lookupVotingRecord, normalizeCastCode, validateBioguideId } from "../src/domain";
import { sampleSnapshot } from "../src/sample-data";

describe("Bioguide validation", () => {
  it("accepts canonical and padded IDs", () => {
    expect(validateBioguideId(" r000570 ")).toEqual({ valid: true, value: "R000570" });
  });

  it("rejects malformed IDs", () => {
    expect(validateBioguideId("not-an-id").valid).toBe(false);
  });

  it("returns a distinct invalid-id lookup state", () => {
    expect(lookupVotingRecord("not-an-id", 113, sampleSnapshot).status).toBe("invalid-id");
  });
});

describe("Congress labels", () => {
  it("renders the approved period format", () => {
    expect(congressLabel(81)).toBe("81st Congress (1949–1951)");
  });
});

describe("Congress discovery", () => {
  it("finds unique Congresses for a Bioguide ID", () => {
    const result = congressesForBioguideId(" r000570 ", {
      ...sampleSnapshot,
      votes: [
        ...sampleSnapshot.votes,
        { ...sampleSnapshot.votes[0], congress: 114 },
        { ...sampleSnapshot.votes[1], congress: 113 },
      ],
    });
    expect(result).toEqual([113, 114]);
  });

  it("returns no Congresses for an unknown or incomplete ID", () => {
    expect(congressesForBioguideId("S000001", sampleSnapshot)).toEqual([]);
    expect(congressesForBioguideId("H000001", {
      ...sampleSnapshot,
      politicians: [{ bioguideId: "H000001", name: "Historical Member", chamber: "House" }],
    })).toEqual([]);
  });
});

describe("outcome normalization", () => {
  it("maps Voteview cast-code groups", () => {
    expect(normalizeCastCode(1)).toBe("yes");
    expect(normalizeCastCode(6)).toBe("no");
    expect(normalizeCastCode(9)).toBe("not-voting");
    expect(normalizeCastCode(42)).toBe("unknown");
  });

  it("marks unknown provider outcomes for warning display", () => {
    const result = lookupVotingRecord("R000570", 113, {
      ...sampleSnapshot,
      votes: [{ ...sampleSnapshot.votes[0], castCode: 42 }],
    });
    expect(result.status).toBe("partial");
    expect(result.votes[0]?.warning?.code).toBe("unknown-outcome");
    expect(result.counts.unknown).toBe(1);
  });
});

describe("snapshot freshness", () => {
  it("becomes stale after 24 hours", () => {
    const generated = Date.parse("2026-09-01T00:00:00.000Z");
    expect(isSnapshotStale(new Date(generated).toISOString(), generated + 24 * 60 * 60 * 1000 + 1)).toBe(true);
    expect(isSnapshotStale(new Date(generated).toISOString(), generated + 24 * 60 * 60 * 1000)).toBe(false);
  });
});

describe("voting record lookup", () => {
  it("filters by Congress and aggregates normalized outcomes", () => {
    const result = lookupVotingRecord("R000570", 113, sampleSnapshot);
    expect(result.status).toBe("success");
    expect(result.counts).toMatchObject({ yes: 1, no: 1, "not-voting": 1 });
    expect(result.votes).toHaveLength(3);
  });

  it("distinguishes unsupported IDs from no records", () => {
    expect(lookupVotingRecord("S000001", 113, sampleSnapshot).status).toBe("unsupported");
    expect(lookupVotingRecord("R000570", 114, sampleSnapshot).status).toBe("no-results");
  });

  it("keeps an incomplete historical mapping as a partial result", () => {
    const result = lookupVotingRecord("H000001", 81, {
      ...sampleSnapshot,
      politicians: [{ bioguideId: "H000001", name: "Historical Member", chamber: "House" }],
    });
    expect(result.status).toBe("partial");
    expect(result.warnings[0]?.code).toBe("incomplete-mapping");
  });
});
