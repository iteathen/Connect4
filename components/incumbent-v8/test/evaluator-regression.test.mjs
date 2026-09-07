import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { gunzipSync } from "node:zlib";

import { compileConnect4Geometry, legacyCurrentScore } from "../index.mjs";
import { positionFromMoves } from "../search.mjs";

const vectors = JSON.parse(gunzipSync(await readFile(new URL("../../../reference/legacy-evaluator-vectors.json.gz", import.meta.url))).toString("utf8"));

test("legacy-current evaluator matches frozen adjustable-board vectors", () => {
  let geometry = null;
  let geometryKey = "";
  for (const vector of vectors.vectors) {
    const key = `${vector.columns}x${vector.rows}`;
    if (key !== geometryKey) {
      geometry = compileConnect4Geometry(vector.columns, vector.rows);
      geometryKey = key;
    }
    const position = positionFromMoves(geometry, vector.moves);
    assert.equal(
      legacyCurrentScore(geometry, position.p0Low, position.p0High, position.p1Low, position.p1High, position.ply),
      vector.score0,
      `${key} p0 ${vector.moves.join(",")}`,
    );
    assert.equal(
      legacyCurrentScore(geometry, position.p1Low, position.p1High, position.p0Low, position.p0High, position.ply),
      vector.score1,
      `${key} p1 ${vector.moves.join(",")}`,
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
