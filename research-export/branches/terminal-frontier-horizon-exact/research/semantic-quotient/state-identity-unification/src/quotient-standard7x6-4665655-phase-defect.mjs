#!/usr/bin/env node
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const SEQUENCES = Object.freeze(['46656551', '46656552', '46656555', '46656557']);

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`bad replay ${sequence}`);
    stateId = child;
  }
  return stateId;
}
function rank(kernel, stateId) { return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId)); }
function legal(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) if (kernel.supportAccess.landingAt(support, c) !== 0xff) out.push(c);
  return out;
}
function heights(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) {
    const cell = kernel.supportAccess.landingAt(support, c);
    out.push(cell === 0xff ? DOMAIN.rows : Math.floor(cell / DOMAIN.columns));
  }
  return out;
}
function phaseFromHeights(h) { return h.map(x => x & 1); }
function weight(bits) { return bits.reduce((n, x) => n + x, 0); }
function phase(kernel, stateId) {
  const h = heights(kernel, stateId), bits = phaseFromHeights(h);
  return { heights: h, bits, weight: weight(bits), defectDistanceLowerBound: Math.ceil(weight(bits) / 2) };
}

const immediateMemo = new Map(), overloadMemo = new Map(), shallowMemo = new Map();
function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 0) {
    for (const c of legal(kernel, stateId)) if (kernel.advance(stateId, c) === domain.QN_TERMINAL_WIN) { value = true; break; }
  }
  immediateMemo.set(stateId, value); return value;
}
function overload(kernel, stateId) {
  if (overloadMemo.has(stateId)) return overloadMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 1) {
    const moves = legal(kernel, stateId); value = moves.length > 0;
    for (const c of moves) {
      const child = kernel.advance(stateId, c);
      if (child === domain.QN_TERMINAL_WIN || child < 0 || !immediate(kernel, child)) { value = false; break; }
    }
  }
  overloadMemo.set(stateId, value); return value;
}
function shallow(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rank(kernel, stateId) & 1) !== 0) throw new Error('shallow requires P0-to-move');
  let value = 'H';
  if (immediate(kernel, stateId)) value = 'I';
  else {
    for (const c of legal(kernel, stateId)) {
      const child = kernel.advance(stateId, c);
      if (child >= 0 && overload(kernel, child)) { value = 'E(O)'; break; }
    }
  }
  shallowMemo.set(stateId, value); return value;
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const controls = [];
for (const sequence of SEQUENCES) {
  const stateId = replay(kernel, sequence);
  if ((rank(kernel, stateId) & 1) !== 0) throw new Error(`${sequence} not P0-to-move`);
  const parentPhase = phase(kernel, stateId);
  const witnesses = [];
  for (const p0 of legal(kernel, stateId)) {
    const defender = kernel.advance(stateId, p0);
    if (defender === domain.QN_TERMINAL_WIN) {
      witnesses.push({ p0: p0 + 1, immediateP0Win: true, afterP0Phase: null, hardReplies: [] });
      continue;
    }
    if (defender < 0) continue;
    const afterP0Phase = phase(kernel, defender);
    const hardReplies = [], dischargedReplies = [];
    for (const p1 of legal(kernel, defender)) {
      const attacker = kernel.advance(defender, p1);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) {
        dischargedReplies.push({ p1: p1 + 1, kind: 'P1-terminal-or-invalid' });
        continue;
      }
      const kind = shallow(kernel, attacker);
      const childPhase = phase(kernel, attacker);
      const row = { p1: p1 + 1, kind, phaseWeight: childPhase.weight, phaseBits: childPhase.bits, zeroPhase: childPhase.weight === 0 };
      if (kind === 'H') hardReplies.push(row); else dischargedReplies.push(row);
    }
    witnesses.push({
      p0: p0 + 1,
      immediateP0Win: false,
      afterP0Phase,
      hardCount: hardReplies.length,
      minHardPhaseWeight: hardReplies.length ? Math.min(...hardReplies.map(x => x.phaseWeight)) : null,
      zeroPhaseHardReplies: hardReplies.filter(x => x.zeroPhase).map(x => x.p1),
      hardReplies,
      dischargedReplies,
    });
  }
  controls.push({
    sequence,
    supportRank: rank(kernel, stateId),
    parentPhase,
    theoreticalOneMacroMinPhaseWeight: Math.max(0, parentPhase.weight - 2),
    zeroPhaseHardPairs: witnesses.flatMap(w => (w.zeroPhaseHardReplies ?? []).map(p1 => [w.p0, p1])),
    witnesses,
  });
}

console.log(`PHASE_DEFECT_CONTROL=${JSON.stringify({
  kind: 'standard7x6-4665655-column-phase-defect-v1',
  attribution: {
    researchDirectionInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  theorem: {
    phase: 'phi_c = (H-h_c) mod 2 = h_c mod 2 because H=6 is even',
    macroTransition: 'Every nonterminal P0/P1 macro-step toggles the phase coordinates of the two played columns; same-column play toggles one coordinate twice and has zero phase displacement, distinct-column play adds e_i+e_j over GF(2).',
    globalInvariant: 'XOR_c phi_c = supportRank mod 2; therefore every two-ply macro-step stays in the same even/odd phase coset.',
    zeroMeaning: 'phi=0 means every remaining column capacity is even, exactly the support-side guard of the qualified vertical paired-response theorem.',
    distanceLowerBound: 'At even support rank, weight(phi)/2 is a lower bound on the number of distinct-column macro-steps needed to reach phi=0 because one macro-step can clear at most two odd coordinates.',
  },
  controls,
  authority: 'Pure legal C4-0010 transitions and theorem-backed shallow I/E(O) classification only. No external W/D/L values and no recursive hard-frontier descent.',
  scopeBoundary: 'Fixed 4665655* controls, exactly one P0/P1 macro-step.',
})}`);
