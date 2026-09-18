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

function rank(kernel, stateId) {
  return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId));
}

function legal(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) {
    if (kernel.supportAccess.landingAt(support, c) !== 0xff) out.push(c);
  }
  return out;
}

const immediateMemo = new Map();
const overloadMemo = new Map();
const shallowMemo = new Map();

function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 0) {
    for (const c of legal(kernel, stateId)) {
      if (kernel.advance(stateId, c) === domain.QN_TERMINAL_WIN) {
        value = true;
        break;
      }
    }
  }
  immediateMemo.set(stateId, value);
  return value;
}

function overload(kernel, stateId) {
  if (overloadMemo.has(stateId)) return overloadMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 1) {
    const moves = legal(kernel, stateId);
    value = moves.length > 0;
    for (const c of moves) {
      const child = kernel.advance(stateId, c);
      if (child === domain.QN_TERMINAL_WIN || child < 0 || !immediate(kernel, child)) {
        value = false;
        break;
      }
    }
  }
  overloadMemo.set(stateId, value);
  return value;
}

function shallow(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rank(kernel, stateId) & 1) !== 0) throw new Error('shallow requires P0-to-move');
  let value = 'H';
  if (immediate(kernel, stateId)) value = 'I';
  else {
    for (const c of legal(kernel, stateId)) {
      const child = kernel.advance(stateId, c);
      if (child >= 0 && overload(kernel, child)) {
        value = 'E(O)';
        break;
      }
    }
  }
  shallowMemo.set(stateId, value);
  return value;
}

function oneStepWitness(kernel, stateId, column) {
  const defender = kernel.advance(stateId, column);
  if (defender === domain.QN_TERMINAL_WIN) {
    return {
      column: column + 1,
      admissible: true,
      immediateP0Win: true,
      hard: [],
      replyCounts: { total: 0, I: 1, 'E(O)': 0, H: 0 },
    };
  }
  if (defender < 0) {
    return { column: column + 1, admissible: false, reason: 'illegal-or-invalid-p0-transition' };
  }

  const hard = new Set();
  const replyCounts = { total: 0, I: 0, 'E(O)': 0, H: 0 };
  for (const reply of legal(kernel, defender)) {
    replyCounts.total += 1;
    const attacker = kernel.advance(defender, reply);
    if (attacker === domain.QN_TERMINAL_WIN) {
      return {
        column: column + 1,
        admissible: false,
        reason: 'p1-terminal-reply',
        p1TerminalReply: reply + 1,
      };
    }
    if (attacker < 0) {
      return {
        column: column + 1,
        admissible: false,
        reason: 'invalid-p1-transition',
        p1Reply: reply + 1,
      };
    }
    const kind = shallow(kernel, attacker);
    replyCounts[kind] += 1;
    if (kind === 'H') hard.add(attacker);
  }

  return {
    column: column + 1,
    admissible: true,
    immediateP0Win: false,
    hard: [...hard].sort((a, b) => a - b),
    replyCounts,
  };
}

function isSubset(a, b) {
  if (a.length > b.length) return false;
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
    } else if (a[i] > b[j]) {
      j += 1;
    } else {
      return false;
    }
  }
  return i === a.length;
}

function exactKey(hard) {
  return hard.join(',');
}

function normalizeWitnessTerms(witnesses) {
  const admissible = witnesses.filter(w => w.admissible);
  const distinctByKey = new Map();
  const duplicateMoves = [];

  for (const witness of admissible) {
    const key = exactKey(witness.hard);
    if (!distinctByKey.has(key)) {
      distinctByKey.set(key, { hard: witness.hard, columns: [witness.column] });
    } else {
      const row = distinctByKey.get(key);
      row.columns.push(witness.column);
      duplicateMoves.push({ column: witness.column, duplicateOfColumns: [...row.columns.slice(0, -1)], hard: witness.hard });
    }
  }

  const distinct = [...distinctByKey.values()]
    .sort((a, b) => a.hard.length - b.hard.length || exactKey(a.hard).localeCompare(exactKey(b.hard)));
  const minimal = [];
  const absorbed = [];

  for (let i = 0; i < distinct.length; i += 1) {
    const candidate = distinct[i];
    const dominators = distinct
      .filter((other, j) => j !== i && other.hard.length < candidate.hard.length && isSubset(other.hard, candidate.hard));
    if (dominators.length === 0) minimal.push(candidate);
    else {
      absorbed.push({
        columns: candidate.columns,
        hard: candidate.hard,
        dominatedBy: dominators.map(d => ({ columns: d.columns, hard: d.hard })),
      });
    }
  }

  return {
    admissibleWitnessCount: admissible.length,
    distinctTermCount: distinct.length,
    minimalAntichainCount: minimal.length,
    duplicateWitnessCount: duplicateMoves.length,
    strictSupersetAbsorptionCount: absorbed.length,
    minimal,
    absorbed,
    duplicateMoves,
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const controls = [];
for (const sequence of SEQUENCES) {
  const stateId = replay(kernel, sequence);
  if ((rank(kernel, stateId) & 1) !== 0) throw new Error(`${sequence} must be P0-to-move`);
  const witnesses = legal(kernel, stateId).map(column => oneStepWitness(kernel, stateId, column));
  const normalized = normalizeWitnessTerms(witnesses);
  const valid = witnesses.filter(w => w.admissible);
  controls.push({
    sequence,
    supportRank: rank(kernel, stateId),
    legalP0WitnessCount: witnesses.length,
    inadmissibleWitnessCount: witnesses.length - valid.length,
    termArityHistogram: Object.fromEntries(
      [...new Set(valid.map(w => w.hard.length))]
        .sort((a, b) => a - b)
        .map(n => [String(n), valid.filter(w => w.hard.length === n).length]),
    ),
    witnesses: witnesses.map(w => w.admissible ? {
      column: w.column,
      admissible: true,
      immediateP0Win: w.immediateP0Win,
      hardCount: w.hard.length,
      hard: w.hard,
      replyCounts: w.replyCounts,
    } : w),
    normalized,
  });
}

const totals = controls.reduce((acc, row) => {
  acc.legalP0Witnesses += row.legalP0WitnessCount;
  acc.admissibleWitnesses += row.normalized.admissibleWitnessCount;
  acc.distinctTerms += row.normalized.distinctTermCount;
  acc.minimalTerms += row.normalized.minimalAntichainCount;
  acc.duplicateWitnesses += row.normalized.duplicateWitnessCount;
  acc.strictSupersetAbsorptions += row.normalized.strictSupersetAbsorptionCount;
  return acc;
}, {
  legalP0Witnesses: 0,
  admissibleWitnesses: 0,
  distinctTerms: 0,
  minimalTerms: 0,
  duplicateWitnesses: 0,
  strictSupersetAbsorptions: 0,
});

console.log(`PROOF_FRONTIER_ANTICHAIN=${JSON.stringify({
  kind: 'standard7x6-4665655-one-step-proof-frontier-antichain-v1',
  attribution: {
    researchDirectionAndIsomorphicStructureInquiry: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  controls,
  totals,
  authority: 'Pure legal C4-0010 transitions plus theorem-backed I/E(O) structural discharge. No external score/value labels or recursive solved-value oracle are used.',
  scopeBoundary: 'Exactly one P0/P1 macro step per legal P0 witness on four retained controls. No recursive hard-frontier descent.',
  interpretation: 'Strict-superset removal is exact only for the pure exact-q value-obligation term at a common parent/context. It does not erase load-bearing typed CPC/NDC/resource/deadline context or output provenance.',
})}`);
