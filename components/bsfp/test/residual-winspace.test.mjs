import assert from 'node:assert/strict';
import test from 'node:test';

import { createConnectWinningLines } from '../geometry.mjs';
import {
  createResidualState,
  createResidualWinspaceProfile,
  normalizeResidualRequirements,
  residualRequirementsImply,
  residualStateAtLeastAsFavorableToP0,
  residualStateKey,
} from '../residual-winspace.mjs';
import {
  createResidualWdlFrontierBucket,
  insertP0LossFrontier,
  insertP0WinFrontier,
  p0LossFrontierCovers,
  p0WinFrontierCovers,
} from '../residual-frontier.mjs';
import { solveBsfpSymbolicWdl } from '../reference-solver.mjs';

function lineMasks(geometry) {
  return createConnectWinningLines(geometry).map((line) => {
    let mask = 0n;
    for (const cell of line) mask |= 1n << BigInt(cell);
    return mask;
  });
}

function physicalRequirements(lines, p0Bits, p1Bits, side) {
  const occupied = p0Bits | p1Bits;
  const opponent = side === 0 ? p1Bits : p0Bits;
  const requirements = [];
  for (const line of lines) {
    if ((line & opponent) !== 0n) continue;
    const remaining = line & ~occupied;
    if (remaining !== 0n) requirements.push(remaining);
  }
  return normalizeResidualRequirements(requirements);
}

function owns(bits, columns, column, row) {
  if (column < 0 || row < 0) return false;
  const cell = row * columns + column;
  return (bits & (1n << BigInt(cell))) !== 0n;
}

function hasWinFrom(bits, geometry, column, row) {
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (const [dc, dr] of directions) {
    let count = 1;
    for (const sign of [-1, 1]) {
      let c = column + dc * sign;
      let r = row + dr * sign;
      while (c >= 0 && c < geometry.columns && r >= 0 && r < geometry.rows && owns(bits, geometry.columns, c, r)) {
        count += 1;
        c += dc * sign;
        r += dr * sign;
      }
    }
    if (count >= geometry.connect) return true;
  }
  return false;
}

function ownershipBits(p1Bits, cellCount) {
  const result = new Uint8Array(cellCount);
  for (let cell = 0; cell < cellCount; cell += 1) {
    if ((p1Bits & (1n << BigInt(cell))) !== 0n) result[cell] = 1;
  }
  return result;
}

function physicalKey(p0Bits, p1Bits) {
  return `${p0Bits.toString(16)}/${p1Bits.toString(16)}`;
}

function qualifyResidualGeometry(geometry, expected) {
  const residual = createResidualWinspaceProfile(geometry);
  const symbolic = solveBsfpSymbolicWdl(geometry);
  const lines = lineMasks(geometry);
  const seenPhysical = new Map();
  const residualValues = new Map();
  const stack = [{
    p0Bits: 0n,
    p1Bits: 0n,
    heights: new Uint8Array(geometry.columns),
    moves: 0,
    p0Requirements: residual.initialRequirements,
    p1Requirements: residual.initialRequirements,
  }];
  let legalEdges = 0;
  let winningEdges = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    const supportIndex = symbolic.support.encodeHeights(current.heights);
    const state = createResidualState({
      supportIndex,
      sideToMove: current.moves & 1,
      p0Requirements: current.p0Requirements,
      p1Requirements: current.p1Requirements,
    });
    const stateKey = residualStateKey(state);
    const pKey = physicalKey(current.p0Bits, current.p1Bits);
    const priorStateKey = seenPhysical.get(pKey);
    if (priorStateKey !== undefined) {
      assert.equal(stateKey, priorStateKey, `residual history dependence at ${pKey}`);
      continue;
    }
    seenPhysical.set(pKey, stateKey);

    const exactWdl = symbolic.evaluateNonterminal({
      heights: current.heights,
      ownershipBits: ownershipBits(current.p1Bits, residual.cellCount),
    });
    const priorWdl = residualValues.get(stateKey);
    if (priorWdl === undefined) residualValues.set(stateKey, exactWdl);
    else assert.equal(exactWdl, priorWdl, `equal residual states disagree on W/D/L at ${stateKey}`);

    assert.deepEqual(current.p0Requirements, physicalRequirements(lines, current.p0Bits, current.p1Bits, 0));
    assert.deepEqual(current.p1Requirements, physicalRequirements(lines, current.p0Bits, current.p1Bits, 1));

    if (current.moves === residual.cellCount) {
      assert.equal(exactWdl, 0, 'full non-winning board must be a draw');
      continue;
    }

    const mover = current.moves & 1;
    for (let column = 0; column < geometry.columns; column += 1) {
      const row = current.heights[column];
      if (row >= geometry.rows) continue;
      legalEdges += 1;
      const landingCell = row * geometry.columns + column;
      const bit = 1n << BigInt(landingCell);
      const nextP0 = mover === 0 ? current.p0Bits | bit : current.p0Bits;
      const nextP1 = mover === 1 ? current.p1Bits | bit : current.p1Bits;
      const moverBits = mover === 0 ? nextP0 : nextP1;
      const physicalWin = hasWinFrom(moverBits, geometry, column, row);
      const transition = residual.applyPlacement({
        p0Requirements: current.p0Requirements,
        p1Requirements: current.p1Requirements,
        mover,
        landingCell,
      });
      assert.equal(transition.kind === 'terminal-win', physicalWin, `terminal mismatch at ${pKey} column ${column}`);
      if (physicalWin) {
        winningEdges += 1;
        assert.equal(transition.winner, mover);
        continue;
      }

      assert.deepEqual(transition.p0Requirements, physicalRequirements(lines, nextP0, nextP1, 0));
      assert.deepEqual(transition.p1Requirements, physicalRequirements(lines, nextP0, nextP1, 1));
      const nextHeights = current.heights.slice();
      nextHeights[column] += 1;
      stack.push({
        p0Bits: nextP0,
        p1Bits: nextP1,
        heights: nextHeights,
        moves: current.moves + 1,
        p0Requirements: transition.p0Requirements,
        p1Requirements: transition.p1Requirements,
      });
    }
  }

  assert.equal(symbolic.rootWdl, expected.rootWdl);
  assert.equal(seenPhysical.size, expected.physicalStates);
  assert.equal(residualValues.size, expected.residualStates);
  return { legalEdges, winningEdges };
}

test('minimal residual normalization removes duplicates and strict supersets', () => {
  assert.deepEqual(normalizeResidualRequirements([0b11n, 0b1n, 0b101n, 0b1n]), [0b1n]);
  assert.deepEqual(normalizeResidualRequirements([0b11n, 0b110n, 0b101n]), [0b11n, 0b101n, 0b110n]);
  assert.throws(() => normalizeResidualRequirements([0n]), /nonzero bigint mask/);
});

test('residual implication and P0 dominance implement the qualified monotone order', () => {
  assert.equal(residualRequirementsImply([0b11n], [0b1n]), true);
  assert.equal(residualRequirementsImply([0b1n], [0b11n]), false);
  assert.equal(residualRequirementsImply([], [0b1n]), true);
  assert.equal(residualRequirementsImply([0b1n], []), false);

  const stronger = createResidualState({ supportIndex: 7, sideToMove: 0, p0Requirements: [0b1n], p1Requirements: [0b11n] });
  const weaker = createResidualState({ supportIndex: 7, sideToMove: 0, p0Requirements: [0b11n], p1Requirements: [0b1n] });
  assert.equal(residualStateAtLeastAsFavorableToP0(stronger, weaker), true);
  assert.equal(residualStateAtLeastAsFavorableToP0(weaker, stronger), false);
  assert.throws(() => residualStateAtLeastAsFavorableToP0(stronger, { ...weaker, supportIndex: 8 }), /identical support/);
});

test('residual placement is an exact mover/opponent cofactor with terminal win detection', () => {
  const profile = createResidualWinspaceProfile({ columns: 4, rows: 3, connect: 3 });
  const transition = profile.applyPlacement({
    p0Requirements: [0b11n],
    p1Requirements: [0b101n],
    mover: 0,
    landingCell: 0,
  });
  assert.equal(transition.kind, 'nonterminal');
  assert.deepEqual(transition.p0Requirements, [0b10n]);
  assert.deepEqual(transition.p1Requirements, []);

  const terminal = profile.applyPlacement({
    p0Requirements: [0b100n],
    p1Requirements: [0b11n],
    mover: 0,
    landingCell: 2,
  });
  assert.deepEqual(terminal, { kind: 'terminal-win', winner: 0, landingCell: 2 });
});

test('P0 win/loss frontiers retain the minimal/maximal exact dominance boundary', () => {
  const stronger = createResidualState({ supportIndex: 7, sideToMove: 0, p0Requirements: [0b1n], p1Requirements: [0b11n] });
  const weaker = createResidualState({ supportIndex: 7, sideToMove: 0, p0Requirements: [0b11n], p1Requirements: [0b1n] });

  let wins = insertP0WinFrontier([], stronger);
  wins = insertP0WinFrontier(wins, weaker);
  assert.equal(wins.length, 1);
  assert.equal(residualStateKey(wins[0]), residualStateKey(weaker));
  assert.equal(p0WinFrontierCovers(wins, stronger), true);

  let losses = insertP0LossFrontier([], weaker);
  losses = insertP0LossFrontier(losses, stronger);
  assert.equal(losses.length, 1);
  assert.equal(residualStateKey(losses[0]), residualStateKey(stronger));
  assert.equal(p0LossFrontierCovers(losses, weaker), true);

  const bucket = createResidualWdlFrontierBucket({ supportIndex: 7, sideToMove: 0 });
  bucket.insertWin(weaker);
  assert.equal(bucket.classify(stronger), 1);
  assert.throws(() => bucket.insertLoss(stronger), /contradiction/);
});

test('residual state is exact and history-independent over the complete 4x3 game', () => {
  const evidence = qualifyResidualGeometry(
    { columns: 4, rows: 3, connect: 3 },
    { rootWdl: 1, physicalStates: 4659, residualStates: 3735 },
  );
  assert.equal(evidence.legalEdges, 11818);
});

test('residual state is exact and compresses the complete 4x4 game', () => {
  const evidence = qualifyResidualGeometry(
    { columns: 4, rows: 4, connect: 4 },
    { rootWdl: 0, physicalStates: 139625, residualStates: 34095 },
  );
  assert.equal(evidence.legalEdges, 304574);
});
