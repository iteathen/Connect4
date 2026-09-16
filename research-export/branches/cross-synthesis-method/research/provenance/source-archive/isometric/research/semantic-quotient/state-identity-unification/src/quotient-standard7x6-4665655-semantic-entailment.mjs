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

function supportHeights(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) {
    const landing = kernel.supportAccess.landingAt(support, c);
    out.push(landing === 0xff ? DOMAIN.rows : Math.floor(landing / DOMAIN.columns));
  }
  return out;
}

function rawTerms(kernel, stateId, player) {
  const classId = player === 0 ? kernel.states.p0At(stateId) : kernel.states.p1At(stateId);
  return kernel.classes.terms(classId);
}

function hasCell([lo, hi], cell) {
  return cell < 32
    ? (((lo >>> cell) & 1) !== 0)
    : (((hi >>> (cell - 32)) & 1) !== 0);
}

function cellsOf(term) {
  const out = [];
  for (let cell = 0; cell < DOMAIN.columns * DOMAIN.rows; cell += 1) {
    if (hasCell(term, cell)) out.push(cell);
  }
  return out;
}

function termsOf(kernel, stateId, player) {
  return rawTerms(kernel, stateId, player)
    .map(cellsOf)
    .sort((a, b) => a.length - b.length || a.join('.').localeCompare(b.join('.')));
}

function subset(a, b) {
  if (a.length > b.length) return false;
  const bs = new Set(b);
  return a.every(x => bs.has(x));
}

// For monotone DNF minimal-term families A and B, F_A => F_B iff every A term
// contains at least one B term.
function monotoneImplies(aTerms, bTerms) {
  if (aTerms.length === 0) return true; // false => anything
  if (bTerms.length === 0) return false;
  return aTerms.every(a => bTerms.some(b => subset(b, a)));
}

function reflectCell(cell) {
  const row = Math.floor(cell / DOMAIN.columns);
  const col = cell % DOMAIN.columns;
  return row * DOMAIN.columns + (DOMAIN.columns - 1 - col);
}

function normalizeTerms(terms) {
  return terms
    .map(term => [...term].sort((a, b) => a - b))
    .sort((a, b) => a.length - b.length || a.join('.').localeCompare(b.join('.')));
}

function descriptor(kernel, stateId) {
  return {
    stateId,
    support: supportHeights(kernel, stateId),
    p0: termsOf(kernel, stateId, 0),
    p1: termsOf(kernel, stateId, 1),
  };
}

function reflectDescriptor(d) {
  return {
    stateId: d.stateId,
    support: [...d.support].reverse(),
    p0: normalizeTerms(d.p0.map(term => term.map(reflectCell))),
    p1: normalizeTerms(d.p1.map(term => term.map(reflectCell))),
  };
}

function termFamilyKey(terms) {
  return terms.map(term => term.join('.')).join('|');
}

function descriptorKey(d) {
  return `${d.support.join(',')};${termFamilyKey(d.p0)};${termFamilyKey(d.p1)}`;
}

function canonicalDescriptorKey(d) {
  const r = reflectDescriptor(d);
  const a = descriptorKey(d);
  const b = descriptorKey(r);
  return a < b ? a : b;
}

// Exact value implication theorem at equal support (up to global reflection):
// Win_P0(A) => Win_P0(B) when B's P0 objective is no harder and B's P1
// objective is no easier. Legal event sequences are identical at equal support.
function winImplies(a, b) {
  const aVariants = [a, reflectDescriptor(a)];
  const bVariants = [b, reflectDescriptor(b)];
  for (let ai = 0; ai < aVariants.length; ai += 1) {
    for (let bi = 0; bi < bVariants.length; bi += 1) {
      const x = aVariants[ai];
      const y = bVariants[bi];
      if (x.support.join(',') !== y.support.join(',')) continue;
      if (monotoneImplies(x.p0, y.p0) && monotoneImplies(y.p1, x.p1)) {
        return { holds: true, aReflected: ai === 1, bReflected: bi === 1 };
      }
    }
  }
  return { holds: false };
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

function playableCells(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const out = new Set();
  for (let c = 0; c < DOMAIN.columns; c += 1) {
    const landing = kernel.supportAccess.landingAt(support, c);
    if (landing !== 0xff) out.add(landing);
  }
  return out;
}

function pairedResponseNoWin(kernel, stateId, ownTerms) {
  const heights = supportHeights(kernel, stateId);
  if (!heights.every(height => (((DOMAIN.rows - height) & 1) === 0))) return false;
  const responseCells = new Set();
  for (let row = (DOMAIN.rows - 1) & 1; row < DOMAIN.rows; row += 2) {
    for (let col = 0; col < DOMAIN.columns; col += 1) {
      responseCells.add(row * DOMAIN.columns + col);
    }
  }
  return ownTerms.length > 0 && ownTerms.every(term => term.some(cell => responseCells.has(cell)));
}

function intervalFacts(kernel, stateId, d) {
  let lower = -1;
  let upper = 1;
  const reasons = [];
  const playable = playableCells(kernel, stateId);

  const p0Immediate = d.p0.filter(term => term.length === 1 && playable.has(term[0]));
  if (p0Immediate.length > 0) {
    lower = 1;
    upper = 1;
    reasons.push('playable-p0-singleton');
    return { lower, upper, reasons };
  }

  const p1ThreatCells = new Set(
    d.p1.filter(term => term.length === 1 && playable.has(term[0])).map(term => term[0]),
  );
  if (p1ThreatCells.size >= 2) {
    lower = -1;
    upper = -1;
    reasons.push('multiple-distinct-playable-p1-singletons');
    return { lower, upper, reasons };
  }

  if (d.p0.length === 0) {
    upper = Math.min(upper, 0);
    reasons.push('p0-residual-exhaustion');
  }
  if (d.p1.length === 0) {
    lower = Math.max(lower, 0);
    reasons.push('p1-residual-exhaustion');
  }
  if (pairedResponseNoWin(kernel, stateId, d.p0)) {
    upper = Math.min(upper, 0);
    reasons.push('paired-response-p0-no-win');
  }

  if (lower > upper) throw new Error(`contradictory interval at state ${stateId}: [${lower},${upper}]`);
  return { lower, upper, reasons };
}

function oneStepWitness(kernel, stateId, column) {
  const defender = kernel.advance(stateId, column);
  if (defender === domain.QN_TERMINAL_WIN) {
    return { column: column + 1, admissible: true, immediateP0Win: true, hard: [] };
  }
  if (defender < 0) return { column: column + 1, admissible: false, reason: 'invalid-p0-transition' };

  const hard = [];
  for (const reply of legal(kernel, defender)) {
    const attacker = kernel.advance(defender, reply);
    if (attacker === domain.QN_TERMINAL_WIN) {
      return { column: column + 1, admissible: false, reason: 'p1-terminal-reply', reply: reply + 1 };
    }
    if (attacker < 0) return { column: column + 1, admissible: false, reason: 'invalid-p1-transition', reply: reply + 1 };
    const kind = shallow(kernel, attacker);
    if (kind === 'H') hard.push({ reply: reply + 1, stateId: attacker });
  }
  return { column: column + 1, admissible: true, immediateP0Win: false, hard };
}

function atomRef(id) {
  return `a${id}`;
}

function termImplies(a, b, implication) {
  // conjunction(a) => conjunction(b)
  return b.every(target => a.some(source => source === target || implication.get(source)?.has(target)));
}

function reduceConjunction(term, implication) {
  const unique = [...new Set(term)];
  return unique.filter(target => !unique.some(source =>
    source !== target && implication.get(source)?.has(target),
  )).sort((a, b) => a - b);
}

function normalizeAlternativeTerms(rows, implication) {
  const grouped = new Map();
  for (const row of rows) {
    if (row.refuted) continue;
    const reduced = reduceConjunction(row.atoms, implication);
    const key = reduced.join(',');
    if (!grouped.has(key)) grouped.set(key, { atoms: reduced, columns: [row.column] });
    else grouped.get(key).columns.push(row.column);
  }
  const terms = [...grouped.values()].sort((a, b) => a.atoms.length - b.atoms.length || a.atoms.join(',').localeCompare(b.atoms.join(',')));
  const absorbed = [];
  const prime = [];
  for (let i = 0; i < terms.length; i += 1) {
    const candidate = terms[i];
    const dominators = [];
    for (let j = 0; j < terms.length; j += 1) {
      if (i === j) continue;
      const other = terms[j];
      if (!termImplies(candidate.atoms, other.atoms, implication)) continue;
      if (termImplies(other.atoms, candidate.atoms, implication)) {
        if (j < i) dominators.push({ kind: 'equivalent', columns: other.columns, atoms: other.atoms });
      } else {
        dominators.push({ kind: 'strict-entailment', columns: other.columns, atoms: other.atoms });
      }
    }
    if (dominators.length === 0) prime.push(candidate);
    else absorbed.push({ columns: candidate.columns, atoms: candidate.atoms, dominatedBy: dominators });
  }
  return { distinctAfterConjunctionReduction: terms.length, primeCount: prime.length, prime, absorbed };
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
  const root = replay(kernel, sequence);
  if ((rank(kernel, root) & 1) !== 0) throw new Error(`${sequence} must be P0-to-move`);

  const witnesses = legal(kernel, root).map(column => oneStepWitness(kernel, root, column));
  const atomByCanonicalKey = new Map();
  const atoms = [];
  const witnessRows = [];

  function internAtom(stateId) {
    const d = descriptor(kernel, stateId);
    const canonicalKey = canonicalDescriptorKey(d);
    let atom = atomByCanonicalKey.get(canonicalKey);
    if (!atom) {
      atom = {
        id: atoms.length,
        representativeStateId: stateId,
        descriptor: d,
        canonicalKey,
        equivalentStateIds: [stateId],
        interval: intervalFacts(kernel, stateId, d),
      };
      atomByCanonicalKey.set(canonicalKey, atom);
      atoms.push(atom);
    } else if (!atom.equivalentStateIds.includes(stateId)) {
      atom.equivalentStateIds.push(stateId);
    }
    return atom;
  }

  for (const witness of witnesses) {
    if (!witness.admissible) {
      witnessRows.push({ column: witness.column, admissible: false, reason: witness.reason, reply: witness.reply ?? null });
      continue;
    }
    if (witness.immediateP0Win) {
      witnessRows.push({ column: witness.column, admissible: true, immediateP0Win: true, atoms: [], refuted: false, hardCount: 0 });
      continue;
    }
    const rows = witness.hard.map(row => ({ ...row, atom: internAtom(row.stateId) }));
    const refuters = rows.filter(row => row.atom.interval.upper <= 0);
    const unresolved = rows.filter(row => row.atom.interval.lower < 1 && row.atom.interval.upper > 0);
    witnessRows.push({
      column: witness.column,
      admissible: true,
      immediateP0Win: false,
      hardCount: witness.hard.length,
      atoms: unresolved.map(row => row.atom.id),
      refuted: refuters.length > 0,
      refuters: refuters.map(row => ({
        reply: row.reply,
        atom: row.atom.id,
        interval: row.atom.interval,
      })),
      dischargedExactWins: rows.filter(row => row.atom.interval.lower === 1).map(row => row.atom.id),
    });
  }

  const implication = new Map(atoms.map(atom => [atom.id, new Set()]));
  const implicationEdges = [];
  for (const a of atoms) {
    for (const b of atoms) {
      if (a.id === b.id) continue;
      const witness = winImplies(a.descriptor, b.descriptor);
      if (!witness.holds) continue;
      implication.get(a.id).add(b.id);
      implicationEdges.push({ from: a.id, to: b.id, ...witness });
    }
  }

  // Transitive closure is exact because implication composes.
  let changed = true;
  while (changed) {
    changed = false;
    for (const [a, targets] of implication) {
      const additions = [];
      for (const b of targets) for (const c of implication.get(b) ?? []) if (!targets.has(c)) additions.push(c);
      for (const c of additions) {
        targets.add(c);
        changed = true;
      }
    }
  }

  const strictClosureEdges = [];
  for (const [a, targets] of implication) for (const b of targets) strictClosureEdges.push([a, b]);
  const normalized = normalizeAlternativeTerms(witnessRows, implication);

  controls.push({
    sequence,
    supportRank: rank(kernel, root),
    witnesses: witnessRows,
    atomCountRawHardStateOccurrences: witnesses.filter(w => w.admissible).reduce((n, w) => n + (w.hard?.length ?? 0), 0),
    canonicalAtomCount: atoms.length,
    reflectionEquivalenceSavings: witnesses.filter(w => w.admissible).reduce((n, w) => n + (w.hard?.length ?? 0), 0) - atoms.length,
    intervalFacts: atoms.map(atom => ({
      atom: atom.id,
      equivalentStateCount: atom.equivalentStateIds.length,
      support: atom.descriptor.support,
      p0ResidualCount: atom.descriptor.p0.length,
      p1ResidualCount: atom.descriptor.p1.length,
      interval: atom.interval,
    })),
    directStrictImplicationEdges: implicationEdges,
    strictImplicationClosureEdgeCount: strictClosureEdges.length,
    implicationSupportGroupCount: new Set(atoms.map(atom => atom.descriptor.support.join(','))).size,
    normalized,
  });
}

const totals = {
  rawHardStateOccurrences: controls.reduce((n, c) => n + c.atomCountRawHardStateOccurrences, 0),
  canonicalAtoms: controls.reduce((n, c) => n + c.canonicalAtomCount, 0),
  reflectionEquivalenceSavings: controls.reduce((n, c) => n + c.reflectionEquivalenceSavings, 0),
  directImplicationEdges: controls.reduce((n, c) => n + c.directStrictImplicationEdges.length, 0),
  implicationClosureEdges: controls.reduce((n, c) => n + c.strictImplicationClosureEdgeCount, 0),
  refutedWitnesses: controls.reduce((n, c) => n + c.witnesses.filter(w => w.admissible && w.refuted).length, 0),
  primeTerms: controls.reduce((n, c) => n + c.normalized.primeCount, 0),
};

console.log(`SEMANTIC_ENTAILMENT_CONTROL=${JSON.stringify({
  kind: 'standard7x6-4665655-semantic-entailment-normalization-v1',
  attribution: {
    researchDirectionInvariantFirstProgram: 'Josh Oshiro',
    formalizationImplementationQualification: 'OpenAI ChatGPT',
  },
  theoremBoundary: {
    reflection: 'Global horizontal reflection is an exact support/winning-hypergraph automorphism.',
    residualObjectiveDominance: 'At equal support, Win_P0(A) implies Win_P0(B) when F0(A) implies F0(B) and F1(B) implies F1(A). This preserves every legal event sequence while making P0 completion no later and P1 completion no earlier.',
    localIntervals: 'Only exact q-derivable or previously qualified local facts are used: playable singleton, multiple distinct opponent singletons, residual exhaustion, and guarded paired-response P0-no-win.',
  },
  controls,
  totals,
  authority: 'No external W/D/L score labels, solved-value oracle, or recursive hard-frontier descent. The experiment uses pure legal C4-0010 transitions plus exact structural theorems.',
  scopeBoundary: 'Exactly the fixed 4665655* one-step P0/P1 macro boundary. Implication closure is over the finite generated atom relation only.',
})}`);
