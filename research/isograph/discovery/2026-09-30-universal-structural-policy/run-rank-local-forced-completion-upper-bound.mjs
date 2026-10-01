#!/usr/bin/env node
import assert from 'node:assert/strict';

const W = 7, H = 6, K = 4;
const DIRS = [[1,0],[0,1],[1,1],[1,-1]];
const key = (x,y) => x + ',' + y;

function generatedLines() {
  const out = [];
  for (let y=0; y<H; y++) for (let x=0; x<W; x++) for (const [dx,dy] of DIRS) {
    const cells = Array.from({length:K}, (_,i) => [x+i*dx, y+i*dy]);
    if (cells.every(([cx,cy]) => cx>=0 && cx<W && cy>=0 && cy<H)) out.push(cells);
  }
  return out;
}
const LINES = generatedLines();
assert.equal(LINES.length, 69);

function ownsLine(S, L) {
  return L.every(([x,y]) => S.has(key(x,y)));
}

function emptyPosition() {
  return {heights:Array(W).fill(0), stones:[new Set(),new Set()], rank:0, mover:0};
}

function legal(P) {
  return Array.from({length:W}, (_,c) => c).filter(c => P.heights[c] < H);
}

function apply(P, c) {
  assert(P.heights[c] < H);
  const heights = P.heights.slice();
  const stones = [new Set(P.stones[0]), new Set(P.stones[1])];
  const playedBy = P.mover;
  const y = heights[c]++;
  stones[playedBy].add(key(c,y));
  const win = LINES.some(L => ownsLine(stones[playedBy], L));
  return {heights, stones, rank:P.rank+1, mover:1-playedBy, landing:[c,y], playedBy, win};
}

function position(sequence='') {
  let P = emptyPosition();
  for (let i=0; i<sequence.length; i++) {
    const c = Number(sequence[i]) - 1;
    assert(Number.isInteger(c) && c>=0 && c<W && P.heights[c] < H);
    const Q = apply(P, c);
    assert.equal(Q.win, false, 'input sequence contains a prior terminal at ply ' + (i+1));
    P = Q;
  }
  return P;
}

function winningFrontier(P, player) {
  const out = [];
  for (const c of legal(P)) {
    const S = new Set(P.stones[player]);
    S.add(key(c, P.heights[c]));
    if (LINES.some(L => ownsLine(S, L))) out.push(c);
  }
  return out;
}

function forcedCompletionUpperBound(P) {
  const attacker = P.mover;
  const immediate = winningFrontier(P, attacker);
  if (immediate.length) {
    return {
      upper: 1,
      kind: 'IMMEDIATE_WIN',
      immediateWinningColumns: immediate.map(c => c+1),
      certificates: [],
    };
  }

  const certificates = [];
  for (const a of legal(P)) {
    const Q = apply(P, a);
    assert.equal(Q.win, false);

    const defenderImmediate = winningFrontier(Q, Q.mover);
    if (defenderImmediate.length) continue;

    const attackerTargets = winningFrontier(Q, attacker);
    if (attackerTargets.length >= 2) {
      certificates.push({
        setupColumn: a+1,
        targetColumns: attackerTargets.map(c => c+1),
        defenderImmediateWinningColumns: [],
        hallWitness: {
          obligations: attackerTargets.slice(0,2).map(c => c+1),
          obligationCount: 2,
          responseSlots: 1,
          neighborCount: 1,
          deficient: true,
        },
      });
    }
  }

  if (certificates.length) {
    return {
      upper: 3,
      kind: 'ONE_SETUP_HALL_FORK',
      immediateWinningColumns: [],
      certificates,
    };
  }

  return {
    upper: null,
    kind: 'NO_FINITE_BOUND_FROM_THIS_PRIMITIVE',
    immediateWinningColumns: [],
    certificates: [],
  };
}

const immediateControl = forcedCompletionUpperBound(position('112233'));
assert.equal(immediateControl.upper, 1);
assert.deepEqual(immediateControl.immediateWinningColumns, [4]);

const forkControl = forcedCompletionUpperBound(position('2232'));
assert.equal(forkControl.upper, 3);
assert(forkControl.certificates.some(c =>
  c.setupColumn === 4 &&
  c.targetColumns.includes(1) &&
  c.targetColumns.includes(5)
));

const falsifierPrefix = '444441566';
const candidates = [2,3,6];
const lowerFromBoundedResponseHorizon = new Map([[2,3],[3,3],[6,5]]);
const falsifierChildren = candidates.map(candidate => {
  const child = apply(position(falsifierPrefix), candidate-1);
  assert.equal(child.win, false);
  const upper = forcedCompletionUpperBound(child);
  assert.equal(upper.upper, null);
  return {
    candidate,
    lowerFromBoundedResponseHorizon: lowerFromBoundedResponseHorizon.get(candidate),
    upperFromThisPrimitive: null,
    interval: [lowerFromBoundedResponseHorizon.get(candidate), null],
    upperCertificate: upper,
  };
});

const emptyControl = forcedCompletionUpperBound(position(''));
assert.equal(emptyControl.upper, null);

const result = {
  schema: 'connect4.rank_local_forced_completion_upper_bound.v1',
  theorem: 'immediate win or one-setup two-frontier Hall fork',
  oracleUsed: false,
  controls: {
    immediate: {prefix:'112233', result:immediateControl},
    oneSetupFork: {prefix:'2232', result:forkControl},
    emptyBoundary: {prefix:'', result:emptyControl},
    v4ConsumedFalsifierBoundary: {
      prefix:falsifierPrefix,
      children:falsifierChildren,
      conclusion:'No finite upper bound for candidates 2, 3, or 6 from this narrow primitive; no interval separation and no v5 license.'
    }
  }
};

console.log(JSON.stringify(result, null, 2));
