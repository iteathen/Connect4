import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const hotPathFiles = ["../evaluator.mjs", "../search.mjs", "../transposition-table.mjs"];
const forbidden = [
  ".map(",
  ".filter(",
  ".reduce(",
  ".sort(",
  ".push(",
  ".pop(",
  "structuredClone",
  "JSON.stringify",
  "JSON.parse",
  "new Map(",
  "new Set(",
];

test("incumbent evaluator/search hot path avoids transformation and collection helpers", async () => {
  for (const relativePath of hotPathFiles) {
    const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
    for (const token of forbidden) assert.equal(source.includes(token), false, `${relativePath} contains forbidden hot-path token ${token}`);
  }
});
