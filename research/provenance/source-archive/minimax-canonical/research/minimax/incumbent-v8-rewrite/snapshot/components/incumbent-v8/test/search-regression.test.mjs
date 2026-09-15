import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { gunzipSync } from "node:zlib";

import { compileConnect4Geometry, IncumbentV8Search, positionFromMoves } from "../index.mjs";

const fixedVectors = JSON.parse(gunzipSync(await readFile(new URL("../../../reference/legacy-search-vectors.json.gz", import.meta.url))).toString("utf8"));
const selfPlayVectors = JSON.parse(gunzipSync(await readFile(new URL("../../../reference/legacy-selfplay-vectors.json.gz", import.meta.url))).toString("utf8"));

test("fixed-depth compatibility mode matches frozen adjustable-board search vectors", () => {
  for (const vector of fixedVectors.vectors) {
    const geometry = compileConnect4Geometry(vector.columns, vector.rows);
    const engine = new IncumbentV8Search(geometry, { ttPower: 16 });
    const result = engine.search(positionFromMoves(geometry, vector.moves), vector.depth, { reusePersistentOrdering: false });
    assert.equal(result.move, vector.move, `${vector.columns}x${vector.rows} move ${vector.moves.join(",")}`);
    assert.equal(result.score, vector.score, `${vector.columns}x${vector.rows} score ${vector.moves.join(",")}`);
  }
});

test("7x6 compatibility mode reproduces frozen legacy self-play move and score traces", () => {
  const geometry = compileConnect4Geometry(selfPlayVectors.columns, selfPlayVectors.rows);
  for (const [depthText, expected] of Object.entries(selfPlayVectors.depths)) {
    const depth = Number(depthText);
    const engine = new IncumbentV8Search(geometry, { ttPower: 19 });
    const moves = [];
    for (let turn = 0; turn < expected.turns.length; turn += 1) {
      const actual = engine.search(positionFromMoves(geometry, moves), depth, { reusePersistentOrdering: false });
      assert.equal(actual.move, expected.turns[turn].move, `depth ${depth} turn ${turn} move`);
      assert.equal(actual.score, expected.turns[turn].score, `depth ${depth} turn ${turn} score`);
      moves.push(actual.move);
    }
    assert.deepEqual(moves, expected.moves, `depth ${depth} full move sequence`);
  }
});

test("persistent TT retains cross-root best-move ordering without treating stale values as current-root bounds", () => {
  const geometry = compileConnect4Geometry(7, 6);
  const engine = new IncumbentV8Search(geometry, { ttPower: 18 });
  const root = engine.search(positionFromMoves(geometry, []), 6, { reusePersistentOrdering: true });
  const childMoves = [root.move];
  const child = engine.search(positionFromMoves(geometry, childMoves), 6, { reusePersistentOrdering: true });
  assert.ok(child.ttCrossRootOrderingHits > 0, "expected retained subtree moves to participate in next-root ordering");
  assert.ok(child.ttOrderingHits >= child.ttCrossRootOrderingHits);
});
