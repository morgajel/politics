import type { Snapshot } from "./domain";

export const sampleSnapshot: Snapshot = {
  schemaVersion: 1,
  generatedAt: "2026-09-07T06:00:00.000Z",
  source: "Voteview snapshot fixture",
  politicians: [
    { bioguideId: "R000570", name: "Paul Ryan", chamber: "House", icpsr: 29939 },
    { bioguideId: "M001111", name: "Example Senator", chamber: "Senate", icpsr: 99999 },
  ],
  votes: [
    { congress: 113, chamber: "House", rollnumber: 1, icpsr: 29939, castCode: 1, date: "2013-01-03", title: "Election of the Speaker", billId: "HRES1", sourceUrl: "https://www.congress.gov/" },
    { congress: 113, chamber: "House", rollnumber: 2, icpsr: 29939, castCode: 6, date: "2013-01-04", title: "Adoption of the rules", billId: "HRES5", sourceUrl: "https://www.congress.gov/" },
    { congress: 113, chamber: "House", rollnumber: 3, icpsr: 29939, castCode: 9, date: "2013-01-07", title: "Procedural motion", sourceUrl: "https://www.congress.gov/" },
  ],
};
