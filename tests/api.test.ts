import { describe, expect, it } from "vitest";
import { fetchVotingSnapshot, type Legislator } from "../src/api";

describe("Voteview API", () => {
  it("fetches and maps a member's remote Congress records", async () => {
    const legislator: Legislator = {
      id: { bioguide: "R000572", icpsr: 20120 },
      name: { first: "Mike", last: "Rogers" },
      terms: [{ start: "2013-01-03", end: "2015-01-03", type: "rep" }],
    };
    const fetcher: typeof fetch = async (url) => new Response(
      String(url).includes("votes")
        ? "congress,chamber,rollnumber,icpsr,cast_code,prob\n113,House,1,20120,1,100"
        : "congress,chamber,rollnumber,date,bill_number,vote_desc,vote_question\n113,House,1,2013-01-03,HR1,Passage,On Passage",
      { status: 200 },
    );

    const snapshot = await fetchVotingSnapshot(legislator, 113, fetcher);

    expect(snapshot.politicians).toEqual([{ bioguideId: "R000572", name: "Mike Rogers", chamber: "House", icpsr: 20120 }]);
    expect(snapshot.votes).toMatchObject([{ congress: 113, icpsr: 20120, castCode: 1, title: "Passage" }]);
  });
});