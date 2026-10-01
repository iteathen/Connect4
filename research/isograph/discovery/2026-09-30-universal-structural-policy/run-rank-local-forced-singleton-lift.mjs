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

function immediateCertificate(P) {
  const targets = winningFrontier(P, P.mover);
  if (!targets.length) return null;
  return {
    upper:1,
    kind:'IMMEDIATE_WIN',
    targets:targets.map(c => c+1),
  };
}

function hallForkCertificateForSetup(P, setupColumnOneBased) {
  const a = setupColumnOneBased - 1;
  assert(legal(P).includes(a), 'setup must be legal');
  const attacker = P.mover;
  const Q = apply(P, a);
  if (Q.win) return null;

  const defenderImmediate = winningFrontier(Q, Q.mover);
  if (defenderImmediate.length) return null;

  const attackerTargets = winningFrontier(Q, attacker);
  if (attackerTargets.length < 2) return null;

  return {
    upper:3,
    kind:'ONE_SETUP_HALL_FORK',
    setupColumn:setupColumnOneBased,
    targetColumns:attackerTargets.map(c => c+1),
    defenderImmediateWinningColumns:[],
    hallWitness:{
      obligations:attackerTargets.slice(0,2).map(c => c+1),
      obligationCount:2,
      responseSlots:1,
      neighborCount:1,
      deficient:true,
    },
  };
}

function anyBaseCertificate(P) {
  const immediate = immediateCertificate(P);
  if (immediate) return immediate;
  for (const a of legal(P)) {
    const cert = hallForkCertificateForSetup(P, a+1);
    if (cert) return cert;
  }
  return null;
}

function verifyForcedSingletonLift(P, setupColumnOneBased, childCertificateBuilder) {
  const attacker = P.mover;
  const a = setupColumnOneBased - 1;
  assert(legal(P).includes(a), 'forced-singleton setup must be legal');

  const Q = apply(P, a);
  assert.equal(Q.win, false, 'setup is already terminal; use immediate certificate');

  const defenderImmediate = winningFrontier(Q, Q.mover);
  assert.deepEqual(
    defenderImmediate,
    [],
    'defender has an immediate counter-win; first-win precedence blocks the lift'
  );

  const attackerTargets = winningFrontier(Q, attacker);
  assert.equal(attackerTargets.length, 1, 'lift requires exactly one currently playable attacker terminal target');
  const forcedTarget = attackerTargets[0];

  const R = apply(Q, forcedTarget);
  assert.equal(R.win, false, 'forced defender block unexpectedly terminates');

  const child = childCertificateBuilder(R);
  assert(child && Number.isInteger(child.upper) && child.upper > 0, 'child must carry a finite sound upper certificate');

  return {
    upper: child.upper + 2,
    kind:'FORCED_SINGLETON_LIFT',
    setupColumn:setupColumnOneBased,
    forcedBlockColumn:forcedTarget+1,
    attackerTargetColumns:attackerTargets.map(c => c+1),
    defenderImmediateWinningColumns:[],
    child,
  };
}

function anyOneLiftFromBase(P) {
  const base = anyBaseCertificate(P);
  if (base) return base;

  for (const a of legal(P)) {
    const attacker = P.mover;
    const Q = apply(P, a);
    if (Q.win) continue;
    if (winningFrontier(Q, Q.mover).length) continue;

    const targets = winningFrontier(Q, attacker);
    if (targets.length !== 1) continue;

    const R = apply(Q, targets[0]);
    if (R.win) continue;
    const child = anyBaseCertificate(R);
    if (!child) continue;

    return {
      upper:child.upper+2,
      kind:'FORCED_SINGLETON_LIFT',
      setupColumn:a+1,
      forcedBlockColumn:targets[0]+1,
      attackerTargetColumns:targets.map(c=>c+1),
      defenderImmediateWinningColumns:[],
      child,
    };
  }
  return null;
}

// Exact linear certificate control:
// 32612636 --A4--> unique A target 5 --D5 forced--> child
// child --A4--> two immediate A targets {1,5}, hence Hall-fork U<=3.
const chainPrefix = '32612636';
const chainPosition = position(chainPrefix);
const chainCertificate = verifyForcedSingletonLift(
  chainPosition,
  4,
  child => {
    const cert = hallForkCertificateForSetup(child, 4);
    assert(cert, 'expected child Hall-fork certificate');
    assert(cert.targetColumns.includes(1));
    assert(cert.targetColumns.includes(5));
    return cert;
  }
);
assert.equal(chainCertificate.upper, 5);
assert.equal(chainCertificate.forcedBlockColumn, 5);
assert.equal(chainCertificate.child.upper, 3);
assert.equal(chainCertificate.child.setupColumn, 4);

// Control the already-consumed v4 falsifier. One lift above the current base
// grammar still yields no finite upper bound for candidates 2, 3, or 6.
const falsifierPrefix = '444441566';
const candidateLower = new Map([[2,3],[3,3],[6,5]]);
const falsifierChildren = [2,3,6].map(candidate => {
  const child = apply(position(falsifierPrefix), candidate-1);
  assert.equal(child.win, false);
  const cert = anyOneLiftFromBase(child);
  assert.equal(cert, null, 'v4 boundary unexpectedly acquired a finite upper certificate');
  return {
    candidate,
    lowerFromBoundedResponseHorizon:candidateLower.get(candidate),
    upperFromForcedSingletonLift:null,
    interval:[candidateLower.get(candidate), null],
  };
});

const result = {
  schema:'connect4.rank_local_forced_singleton_lift.v1',
  oracleUsed:false,
  theorem:'forced singleton response + finite child upper certificate => predecessor upper <= child upper + 2',
  controls:{
    fivePlyChain:{
      prefix:chainPrefix,
      certificate:chainCertificate,
    },
    v4ConsumedFalsifierBoundary:{
      prefix:falsifierPrefix,
      children:falsifierChildren,
      conclusion:'No finite upper bound after one forced-singleton lift over the qualified base grammar; no interval separation and no v5 license.',
    },
  },
};

console.log(JSON.stringify(result, null, 2));
