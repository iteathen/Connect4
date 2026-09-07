import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { compileConnect4Geometry, legacyCurrentScore } from "../index.mjs";
import { positionFromMoves } from "../search.mjs";

const fixture = JSON.parse(await readFile(new URL("../../../reference/legacy-evaluator-regression.json", import.meta.url), "utf8"));

assert.equal(fixture.profile, "legacy-current-evaluator-v1");
assert.equal(fixture.sourceArchiveSha256, "3dee57256552c2a0c8104cdc76c6b103e7de4a2bc69332a6723d4a5d1e543f20");
assert.equal(fixture.sourceVirtualBoardSha256, "506fa4aa5303c8118ec7a5cb7b1a2bed9115bf008a24c619270a128cc0c6642e");

test("legacy-current evaluator matches frozen adjustable-board score digests", () => {
  for (const group of fixture.groups) {
    const geometry = compileConnect4Geometry(group.columns, group.rows);
    const digest = createHash("sha256");
    for (const encodedMoves of group.moves) {
      const moves = encodedMoves === "" ? [] : Array.from(encodedMoves, Number);
      const position = positionFromMoves(geometry, moves);
      const score0 = legacyCurrentScore(geometry, position.p0Low, position.p0High, position.p1Low, position.p1High, position.ply);
      const score1 = legacyCurrentScore(geometry, position.p1Low, position.p1High, position.p0Low, position.p0High, position.ply);
      digest.update(`${score0}:${score1}\n`);
    }
    assert.equal(
      digest.digest("hex"),
      group.scoresSha256,
      `${group.columns}x${group.rows} legacy evaluator digest`,
    );
  }
});

test("legacy-current evaluator returns zero for a full-board draw", () => {
  const geometry = compileConnect4Geometry(7, 6);
  const moves = Array.from("333321544141104403413010006655666652222255", Number);
  const position = positionFromMoves(geometry, moves);
  assert.equal(position.ply, 42);
  assert.equal(legacyCurrentScore(geometry, position.p0Low, position.p0High, position.p1Low, position.p1High, position.ply), 0);
  assert.equal(legacyCurrentScore(geometry, position.p1Low, position.p1High, position.p0Low, position.p0High, position.ply), 0);
});
