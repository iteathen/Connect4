import test from 'node:test';
import assert from 'node:assert/strict';

import {
  solveBsfpOwnershipAntichainRootWdlRolling,
  solveBsfpOwnershipAntichainWdl,
} from '../index.mjs';

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4 }),
]);

for (const geometry of CASES) {
  const id = `${geometry.columns}x${geometry.rows}-c${geometry.connect}`;
  test(`rolling ownership-antichain root solver matches retained reference on ${id}`, () => {
    const retained = solveBsfpOwnershipAntichainWdl(geometry);
    const rolling = solveBsfpOwnershipAntichainRootWdlRolling({ ...geometry, supportShardSize: 17, candidateTileSize: 31 });
    assert.equal(rolling.rootWdl, retained.rootWdl);
    assert.equal(rolling.stats.totalWinRecords, retained.stats.totalWinRecords);
    assert.equal(rolling.stats.totalLossRecords, retained.stats.totalLossRecords);
    assert.equal(rolling.stats.totalBoundaryRecords, retained.stats.totalBoundaryRecords);
    assert.equal(rolling.stats.maximumWinFrontier, retained.stats.maximumWinFrontier);
    assert.equal(rolling.stats.maximumLossFrontier, retained.stats.maximumLossFrontier);
    assert.equal(rolling.stats.terminalWinSubtractions, retained.stats.terminalWinSubtractions);
    assert.equal(rolling.stats.terminalLossSubtractions, retained.stats.terminalLossSubtractions);
    assert.ok(rolling.stats.peakResidentBoundaryRecords <= rolling.stats.totalBoundaryRecords);
    assert.equal(rolling.execution.rankWindow, 2);
    assert.equal(rolling.execution.supportShardSize, 17);
    assert.equal(rolling.execution.candidateTileSize, 31);
    assert.ok(rolling.stats.maximumCandidateTile <= 31);
  });
}
