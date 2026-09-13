import assert from 'node:assert/strict';

const C = 4;
const R = 3;
const K = 3;
const CELL_COUNT = C * R;
const bit = i => 1n << BigInt(i);
const cell = (c, r) => r * C + c;
const popcount = value => {
  let x = value;
  let count = 0;
  while (x) {
    x &= x - 1n;
    count += 1;
  }
  return count;
};

const winningLines = [];
for (let r = 0; r < R; r += 1) {
  for (let c = 0; c < C; c += 1) {
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const line = [];
      for (let i = 0; i < K; i += 1) {
        const x = c + i * dx;
        const y = r + i * dy;
        if (x < 0 || x >= C || y < 0 || y >= R) {
          line.length = 0;
          break;
        }
        line.push(cell(x, y));
      }
      if (line.length === K) winningLines.push(line);
    }
  }
}
assert.equal(winningLines.length, 14);
const lineMasks = winningLines.map(line => line.reduce((mask, x) => mask | bit(x), 0n));

function hasWin(bits, lastCell = -1) {
  return lineMasks.some(mask =>
    (lastCell < 0 || (mask & bit(lastCell)) !== 0n) && (bits & mask) === mask);
}

function heights(p0, p1) {
  const occupied = p0 | p1;
  const out = Array(C).fill(0);
  for (let c = 0; c < C; c += 1) {
    while (out[c] < R && (occupied & bit(cell(c, out[c]))) !== 0n) out[c] += 1;
  }
  return out;
}

function stateKey(p0, p1) {
  return `${p0}/${p1}`;
}

const statesByKey = new Map();
const states = [];
function internState(p0, p1, lastCell = -1) {
  const key = stateKey(p0, p1);
  const existing = statesByKey.get(key);
  if (existing !== undefined) return existing;

  const ply = popcount(p0 | p1);
  const side = ply & 1;
  let terminal = null;
  if (lastCell >= 0) {
    const previousMover = 1 - side;
    const previousBits = previousMover === 0 ? p0 : p1;
    if (hasWin(previousBits, lastCell)) terminal = previousMover === 0 ? 1 : -1;
  }
  if (terminal === null && ply === CELL_COUNT) terminal = 0;

  const state = { id: states.length, p0, p1, ply, side, terminal, children: [] };
  statesByKey.set(key, state);
  states.push(state);
  return state;
}

internState(0n, 0n);
for (let index = 0; index < states.length; index += 1) {
  const state = states[index];
  if (state.terminal !== null) continue;
  const support = heights(state.p0, state.p1);
  for (let c = 0; c < C; c += 1) {
    if (support[c] >= R) continue;
    const landing = cell(c, support[c]);
    const p0 = state.side === 0 ? state.p0 | bit(landing) : state.p0;
    const p1 = state.side === 1 ? state.p1 | bit(landing) : state.p1;
    const child = internState(p0, p1, landing);
    state.children.push({ column: c, child: child.id });
  }
}

const forwardMemo = new Int8Array(states.length);
forwardMemo.fill(2);
function forwardValue(stateId) {
  if (forwardMemo[stateId] !== 2) return forwardMemo[stateId];
  const state = states[stateId];
  if (state.terminal !== null) return (forwardMemo[stateId] = state.terminal);
  let value = state.side === 0 ? -1 : 1;
  for (const edge of state.children) {
    const childValue = forwardValue(edge.child);
    if (state.side === 0) {
      if (childValue > value) value = childValue;
      if (value === 1) break;
    } else {
      if (childValue < value) value = childValue;
      if (value === -1) break;
    }
  }
  forwardMemo[stateId] = value;
  return value;
}
forwardValue(0);
for (const state of states) forwardValue(state.id);

const p0Win = new Set(states.filter(s => s.terminal === 1).map(s => s.id));
const p1Win = new Set(states.filter(s => s.terminal === -1).map(s => s.id));
let changed = true;
let closurePasses = 0;
while (changed) {
  changed = false;
  closurePasses += 1;
  const nextP0 = new Set(p0Win);
  const nextP1 = new Set(p1Win);
  for (const state of states) {
    if (state.terminal !== null) continue;
    if (!p0Win.has(state.id)) {
      const qualifies = state.side === 0
        ? state.children.some(edge => p0Win.has(edge.child))
        : state.children.every(edge => p0Win.has(edge.child));
      if (qualifies) nextP0.add(state.id);
    }
    if (!p1Win.has(state.id)) {
      const qualifies = state.side === 1
        ? state.children.some(edge => p1Win.has(edge.child))
        : state.children.every(edge => p1Win.has(edge.child));
      if (qualifies) nextP1.add(state.id);
    }
  }
  if (nextP0.size !== p0Win.size || nextP1.size !== p1Win.size) changed = true;
  p0Win.clear();
  for (const id of nextP0) p0Win.add(id);
  p1Win.clear();
  for (const id of nextP1) p1Win.add(id);
}

function backwardValue(stateId) {
  if (p0Win.has(stateId)) return 1;
  if (p1Win.has(stateId)) return -1;
  return 0;
}

let solverDisagreements = 0;
for (const state of states) {
  if (forwardMemo[state.id] !== backwardValue(state.id)) solverDisagreements += 1;
}
assert.equal(solverDisagreements, 0);

function playableCells(state) {
  const support = heights(state.p0, state.p1);
  const out = [];
  for (let c = 0; c < C; c += 1) if (support[c] < R) out.push(cell(c, support[c]));
  return out;
}

function residualAntichain(state, player) {
  const own = player === 0 ? state.p0 : state.p1;
  const opponent = player === 0 ? state.p1 : state.p0;
  const residuals = [];
  for (let lineIndex = 0; lineIndex < winningLines.length; lineIndex += 1) {
    const mask = lineMasks[lineIndex];
    if ((mask & opponent) !== 0n) continue;
    const residual = [];
    for (const x of winningLines[lineIndex]) if ((own & bit(x)) === 0n) residual.push(x);
    residuals.push(residual);
  }
  residuals.sort((a, b) => a.length - b.length || a.join(',').localeCompare(b.join(',')));
  const minimal = [];
  for (const candidate of residuals) {
    const superset = new Set(candidate);
    if (minimal.some(existing => existing.every(x => superset.has(x)))) continue;
    minimal.push(candidate);
  }
  return minimal;
}

function tacticalClass(state) {
  if (state.terminal !== null) return { kind: 'terminal', value: state.terminal };
  const playable = new Set(playableCells(state));
  const own = residualAntichain(state, state.side);
  const opponent = residualAntichain(state, 1 - state.side);

  const immediate = [...new Set(own.filter(r => r.length === 1 && playable.has(r[0])).map(r => r[0]))];
  if (immediate.length > 0) return { kind: 'immediate', value: state.side === 0 ? 1 : -1 };

  const threats = [...new Set(opponent.filter(r => r.length === 1 && playable.has(r[0])).map(r => r[0]))];
  if (threats.length >= 2) return { kind: 'double-threat-loss', value: state.side === 0 ? -1 : 1 };
  if (own.length === 0 && opponent.length === 0) return { kind: 'exhaustion-draw', value: 0 };
  if (threats.length === 1) return { kind: 'forced', cell: threats[0] };
  return { kind: 'decision' };
}

function normalizedProofShape(state) {
  if (state.terminal !== null) return `terminal:${state.terminal}`;
  const value = forwardMemo[state.id];
  if (state.side === 0) {
    if (value === 1) return 'exists(P0Win)';
    if (value === 0) return 'exists(Draw) & forall(not P0Win)';
    return 'forall(P1Win)';
  }
  if (value === -1) return 'exists(P1Win)';
  if (value === 0) return 'exists(Draw) & forall(not P1Win)';
  return 'forall(P0Win)';
}

const tacticalCounts = Object.create(null);
let tacticalExactMismatches = 0;
for (const state of states) {
  const classification = tacticalClass(state);
  tacticalCounts[classification.kind] = (tacticalCounts[classification.kind] ?? 0) + 1;
  if (classification.value !== undefined && classification.value !== forwardMemo[state.id]) tacticalExactMismatches += 1;
}
assert.equal(tacticalExactMismatches, 0);

function residualKey(residuals) {
  return residuals.map(r => [...r].sort((a, b) => a - b).join('.')).sort().join('|');
}
function quotientKey(state) {
  return `${heights(state.p0, state.p1).join(',')};${residualKey(residualAntichain(state, 0))};${residualKey(residualAntichain(state, 1))}`;
}

const quotient = new Map();
let mixedValueClasses = 0;
let mixedTacticalClasses = 0;
let mixedProofShapeClasses = 0;
for (const state of states) {
  if (state.terminal !== null) continue;
  const key = quotientKey(state);
  const value = forwardMemo[state.id];
  const tactical = tacticalClass(state).kind;
  const shape = normalizedProofShape(state);
  const existing = quotient.get(key);
  if (!existing) quotient.set(key, { value, tactical, shape, physicalStates: 1 });
  else {
    existing.physicalStates += 1;
    if (existing.value !== value) mixedValueClasses += 1;
    if (existing.tactical !== tactical) mixedTacticalClasses += 1;
    if (existing.shape !== shape) mixedProofShapeClasses += 1;
  }
}
assert.equal(mixedValueClasses, 0);
assert.equal(mixedTacticalClasses, 0);
assert.equal(mixedProofShapeClasses, 0);

const quotientTacticalCounts = Object.create(null);
for (const entry of quotient.values()) quotientTacticalCounts[entry.tactical] = (quotientTacticalCounts[entry.tactical] ?? 0) + 1;

const proofShapeCounts = Object.create(null);
for (const state of states) {
  const shape = normalizedProofShape(state);
  proofShapeCounts[shape] = (proofShapeCounts[shape] ?? 0) + 1;
}

const wdlCounts = { '-1': 0, '0': 0, '1': 0 };
for (const value of forwardMemo) wdlCounts[String(value)] += 1;
const terminalStates = states.filter(s => s.terminal !== null).length;
const nonterminalStates = states.length - terminalStates;
const tacticalExactStates = (tacticalCounts.terminal ?? 0)
  + (tacticalCounts.immediate ?? 0)
  + (tacticalCounts['double-threat-loss'] ?? 0)
  + (tacticalCounts['exhaustion-draw'] ?? 0);

const representativeByQuotient = new Map();
for (const state of states) {
  if (state.terminal !== null) continue;
  const key = quotientKey(state);
  if (!representativeByQuotient.has(key)) representativeByQuotient.set(key, state);
}
function mirrorBits(bits) {
  let out = 0n;
  for (let r = 0; r < R; r += 1) {
    for (let c = 0; c < C; c += 1) {
      if ((bits & bit(cell(c, r))) !== 0n) out |= bit(cell(C - 1 - c, r));
    }
  }
  return out;
}
function mirroredQuotientKey(state) {
  return quotientKey({ p0: mirrorBits(state.p0), p1: mirrorBits(state.p1) });
}
const decisionActionFactorization = {
  classes: 0,
  rawActionEdges: 0,
  uniqueExactSuccessorClasses: 0,
  classesWithExactDuplicateSuccessors: 0,
  mirrorCanonicalSuccessorClasses: 0,
  classesReducedByMirror: 0,
};
for (const [key, entry] of quotient) {
  if (entry.tactical !== 'decision') continue;
  const state = representativeByQuotient.get(key);
  const exactSuccessors = [];
  const mirrorSuccessors = [];
  for (const edge of state.children) {
    const childState = states[edge.child];
    if (childState.terminal !== null) {
      const terminalKey = `T:${childState.terminal}`;
      exactSuccessors.push(terminalKey);
      mirrorSuccessors.push(terminalKey);
      continue;
    }
    const exact = quotientKey(childState);
    const mirrored = mirroredQuotientKey(childState);
    exactSuccessors.push(exact);
    mirrorSuccessors.push(exact < mirrored ? exact : mirrored);
  }
  const exactUnique = new Set(exactSuccessors).size;
  const mirrorUnique = new Set(mirrorSuccessors).size;
  decisionActionFactorization.classes += 1;
  decisionActionFactorization.rawActionEdges += exactSuccessors.length;
  decisionActionFactorization.uniqueExactSuccessorClasses += exactUnique;
  decisionActionFactorization.mirrorCanonicalSuccessorClasses += mirrorUnique;
  if (exactUnique < exactSuccessors.length) decisionActionFactorization.classesWithExactDuplicateSuccessors += 1;
  if (mirrorUnique < exactSuccessors.length) decisionActionFactorization.classesReducedByMirror += 1;
}

function pairedResponseNoWin(state) {
  if (state.terminal !== null) return false;
  const support = heights(state.p0, state.p1);
  if (!support.every(height => ((R - height) & 1) === 0)) return false;
  const responseCells = new Set();
  for (let r = (R - 1) & 1; r < R; r += 2) {
    for (let c = 0; c < C; c += 1) responseCells.add(cell(c, r));
  }
  const own = residualAntichain(state, state.side);
  return own.length > 0 && own.every(requirement => requirement.some(x => responseCells.has(x)));
}
const pairedResponseIntervalControl = {
  physicalStates: 0,
  quotientClasses: 0,
  genuineDecisionPhysicalStates: 0,
  genuineDecisionQuotientClasses: 0,
  exactValueMismatches: 0,
  decisionValueDistribution: Object.create(null),
};
const pairedQuotients = new Set();
for (const state of states) {
  if (!pairedResponseNoWin(state)) continue;
  pairedResponseIntervalControl.physicalStates += 1;
  const exact = forwardMemo[state.id];
  const boundHolds = state.side === 0 ? exact <= 0 : exact >= 0;
  if (!boundHolds) pairedResponseIntervalControl.exactValueMismatches += 1;
  if (state.terminal === null) pairedQuotients.add(quotientKey(state));
  if (tacticalClass(state).kind === 'decision') {
    pairedResponseIntervalControl.genuineDecisionPhysicalStates += 1;
    const key = `side${state.side}:value${exact}`;
    pairedResponseIntervalControl.decisionValueDistribution[key]
      = (pairedResponseIntervalControl.decisionValueDistribution[key] ?? 0) + 1;
  }
}
for (const key of pairedQuotients) {
  if (quotient.get(key)?.tactical === 'decision') pairedResponseIntervalControl.genuineDecisionQuotientClasses += 1;
}
pairedResponseIntervalControl.quotientClasses = pairedQuotients.size;
assert.equal(pairedResponseIntervalControl.exactValueMismatches, 0);

console.log(JSON.stringify({
  kind: 'negamax-bsfp-proof-intersection-control',
  domain: { columns: C, rows: R, connect: K, cells: CELL_COUNT, winningLines: winningLines.length },
  graph: { legalStates: states.length, terminalStates, nonterminalStates },
  forwardNegamax: { rootWdlP0: forwardMemo[0], wdlCounts },
  backwardFixedPoint: {
    rootWdlP0: backwardValue(0),
    closurePasses,
    p0WinStates: p0Win.size,
    p1WinStates: p1Win.size,
    drawResidueStates: states.length - p0Win.size - p1Win.size,
  },
  agreement: { solverDisagreements },
  normalizedProofShapeCounts: proofShapeCounts,
  localStructuralClosure: {
    physicalStateCounts: tacticalCounts,
    exactPhysicalStates: tacticalExactStates,
    forcedResponsePhysicalStates: tacticalCounts.forced ?? 0,
    genuineDecisionPhysicalStates: tacticalCounts.decision ?? 0,
    tacticalExactMismatches,
  },
  commonStructuralQuotient: {
    identity: 'support + normalized P0 residual antichain + normalized P1 residual antichain',
    nonterminalPhysicalStates: nonterminalStates,
    quotientClasses: quotient.size,
    mergedPhysicalStates: nonterminalStates - quotient.size,
    mixedValueClasses,
    mixedTacticalClasses,
    mixedProofShapeClasses,
    tacticalClassCounts: quotientTacticalCounts,
  },
  decisionActionFactorization,
  pairedResponseIntervalControl,
  interpretation: {
    sharedOperators: ['terminal injection', 'structural transition/restriction', 'existential/universal choice', 'finite rank'],
    localClosureObservation: 'Immediate wins, double playable threats, bilateral exhaustion and forced responses are exact partial evaluations of the common predecessor recurrence.',
    remainingGap: 'The remaining genuine decision classes require exact choice-factorization/quantifier elimination rather than another game-value recurrence.',
    actionEqualityFalsifier: 'Exact successor equality removes no action edge in the genuine decision quotient classes; reflection removes only a small handful. The missing calculus must relate distinct successors by stronger proof relations.',
    intervalCertificateWitness: 'The guarded paired-response policy soundly narrows 57 otherwise-genuine decision quotient classes to a one-sided no-win interval with zero exact-value mismatches.',
  },
}, null, 2));
