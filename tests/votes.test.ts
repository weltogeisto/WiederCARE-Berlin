import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { publicIssueSupport } from "../lib/votes.ts";

test("support counts only public thumbs-up, not other reactions or comments", () => {
 assert.equal(publicIssueSupport({number: 2, comments: 100, reactions: {"+1": 7, "-1": 20, total_count: 99}}, 2), 7);
 assert.equal(publicIssueSupport({number: 2, reactions: {"+1": 0}}, 2), 0);
});
test("invalid and cross-proposal API responses never become invented zero votes", () => {
 for (const payload of [null, {}, {number: 3, reactions: {"+1": 7}}, {number: 2, reactions: {}}, ...[-1, 0.5, "7", Infinity, NaN].map(count => ({number: 2, reactions: {"+1": count}}))]) assert.throws(() => publicIssueSupport(payload, 2));
});
test("all three approved proposals have distinct public voting threads on the intended repo", () => {
 const data=JSON.parse(readFileSync(new URL("../research/public-proposals.json",import.meta.url),"utf8"));
 assert.equal(data.repository,"weltogeisto/WiederCARE-Berlin");
 assert.deepEqual(data.proposals.map((p: {id: string}) => p.id),["apotheke","spreefront","bauakademie"]);
 assert.equal(new Set(data.proposals.map((p: {issueNumber: number}) => p.issueNumber)).size,3);
 for (const p of data.proposals) assert.equal(p.issueUrl,`https://github.com/${data.repository}/issues/${p.issueNumber}`);
});
