export function publicIssueSupport(value: unknown, expectedNumber: number): number {
 if (!value || typeof value !== "object") throw new Error("Invalid public response");
 const issue = value as { number?: unknown; reactions?: { [key: string]: unknown } };
 if (issue.number !== expectedNumber) throw new Error("Wrong proposal response");
 const count = issue.reactions?.["+1"];
 if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) throw new Error("Invalid support count");
 return count;
}
