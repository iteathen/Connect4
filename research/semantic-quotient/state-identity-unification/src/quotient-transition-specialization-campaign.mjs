import { performance } from 'node:perf_hooks';
import { solveBsfpOwnershipAntichainWdl } from '../../../../components/bsfp/ownership-antichain-solver.mjs';
import {
  createQuotientNativeNegamaxKernel,
  QN_ILLEGAL,
  QN_TERMINAL_WIN,
} from './quotient-native-negamax-kernel.mjs';

const CLASS_UNKNOWN = -3;
const CLASS_TERMINAL_WIN = -1;

const CASES = Object.freeze([
  Object.freeze({ columns: 4, rows: 3, connect: 3, expectedStates: 3735 }),
  Object.freeze({ columns: 4, rows: 4, connect: 4, expectedStates: 34095 }),
  Object.freeze({ columns: 5, rows: 3, connect: 4, expectedStates: 11317 }),
  Object.freeze({ columns: 4, rows: 5, connect: 4, expectedStates: 294593 }),
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function pairCount(pair) {
  return popcount32(pair[0]) + popcount32(pair[1]);
}

function comparePair(left, right) {
  const countDelta = pairCount(left) - pairCount(right);
  if (countDelta !== 0) return countDelta;
  const leftHi = left[1] >>> 0;
  const rightHi = right[1] >>> 0;
  if (leftHi !== rightHi) return leftHi < rightHi ? -1 : 1;
  const leftLo = left[0] >>> 0;
  const rightLo = right[0] >>> 0;
  return leftLo === rightLo ? 0 : leftLo < rightLo ? -1 : 1;
}

function pairSubsetOf(a, b) {
  return (((a[0] & ~b[0]) >>> 0) === 0) && (((a[1] & ~b[1]) >>> 0) === 0);
}

function containsBit(pair, bitLo, bitHi) {
  return (((pair[0] & bitLo) >>> 0) !== 0) || (((pair[1] & bitHi) >>> 0) !== 0);
}

function termsEqual(left, right) {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    if ((left[i][0] >>> 0) !== (right[i][0] >>> 0)) return false;
    if ((left[i][1] >>> 0) !== (right[i][1] >>> 0)) return false;
  }
  return true;
}

function assertCanonicalAntichain(terms, label) {
  for (let i = 1; i < terms.length; i += 1) {
    assert(comparePair(terms[i - 1], terms[i]) < 0, `${label}: terms are not strictly canonical-order sorted`);
  }
  for (let i = 0; i < terms.length; i += 1) {
    for (let j = i + 1; j < terms.length; j += 1) {
      assert(!pairSubsetOf(terms[i], terms[j]), `${label}: earlier term dominates later term`);
      assert(!pairSubsetOf(terms[j], terms[i]), `${label}: later term dominates earlier term`);
    }
  }
}

function specializedBlockTerms(terms, bitLo, bitHi) {
  const result = [];
  for (const term of terms) {
    if (!containsBit(term, bitLo, bitHi)) result.push(term);
  }
  return result;
}

function specializedOwnTerms(terms, bitLo, bitHi, metrics = null) {
  const reduced = [];
  const unchanged = [];
  for (const term of terms) {
    if (!containsBit(term, bitLo, bitHi)) {
      unchanged.push(term);
      continue;
    }
    const next = [(term[0] & ~bitLo) >>> 0, (term[1] & ~bitHi) >>> 0];
    if (next[0] === 0 && next[1] === 0) return { terminal: true, terms: null };
    reduced.push(next);
  }

  // Both streams remain internally canonical antichains. The only dominance
  // newly introduced by clearing one common bit is reduced -> unchanged.
  const survivingUnchanged = [];
  outer: for (const candidate of unchanged) {
    for (const minimum of reduced) {
      if (metrics) metrics.crossDominanceChecks += 1;
      if (pairSubsetOf(minimum, candidate)) continue outer;
    }
    survivingUnchanged.push(candidate);
  }

  const result = [];
  let r = 0;
  let u = 0;
  while (r < reduced.length || u < survivingUnchanged.length) {
    if (r >= reduced.length) {
      result.push(survivingUnchanged[u++]);
    } else if (u >= survivingUnchanged.length) {
      result.push(reduced[r++]);
    } else if (comparePair(reduced[r], survivingUnchanged[u]) <= 0) {
      result.push(reduced[r++]);
    } else {
      result.push(survivingUnchanged[u++]);
    }
  }
  return { terminal: false, terms: result };
}

function enumerateReachable(kernel) {
  let terminalEdges = 0;
  let nonterminalEdges = 0;
  let illegalEdges = 0;
  for (let id = 0; id < kernel.states.count; id += 1) {
    for (let column = 0; column < kernel.columns; column += 1) {
      const child = kernel.advance(id, column);
      if (child === QN_ILLEGAL) illegalEdges += 1;
      else if (child === QN_TERMINAL_WIN) terminalEdges += 1;
      else nonterminalEdges += 1;
    }
  }
  return { states: kernel.states.count, terminalEdges, nonterminalEdges, illegalEdges };
}

function qualifySpecialization(spec) {
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const census = enumerateReachable(kernel);
  assert(census.states === spec.expectedStates, `${spec.columns}x${spec.rows}: relational census drift`);
  const classCount = kernel.classes.size;
  const metrics = {
    ownChecked: 0,
    blockChecked: 0,
    terminalChecked: 0,
    crossDominanceChecks: 0,
  };

  for (let classId = 0; classId < classCount; classId += 1) {
    const terms = kernel.classTerms(classId);
    assertCanonicalAntichain(terms, `class ${classId}`);
    for (let cell = 0; cell < kernel.cellCount; cell += 1) {
      const cacheIndex = classId * kernel.cellCount + cell;
      const bitLo = kernel.bitLo[cell];
      const bitHi = kernel.bitHi[cell];

      const ownTarget = kernel.classes.ownTransitions[cacheIndex];
      if (ownTarget !== CLASS_UNKNOWN) {
        const candidate = specializedOwnTerms(terms, bitLo, bitHi, metrics);
        if (ownTarget === CLASS_TERMINAL_WIN) {
          assert(candidate.terminal, `own terminal mismatch class=${classId} cell=${cell}`);
          metrics.terminalChecked += 1;
        } else {
          assert(!candidate.terminal, `own false terminal class=${classId} cell=${cell}`);
          const expected = kernel.classTerms(ownTarget);
          assert(termsEqual(candidate.terms, expected), `own specialized terms mismatch class=${classId} cell=${cell}`);
          assertCanonicalAntichain(candidate.terms, `own ${classId}/${cell}`);
          metrics.ownChecked += 1;
        }
      }

      const blockTarget = kernel.classes.blockTransitions[cacheIndex];
      if (blockTarget !== CLASS_UNKNOWN) {
        const candidate = specializedBlockTerms(terms, bitLo, bitHi);
        const expected = kernel.classTerms(blockTarget);
        assert(termsEqual(candidate, expected), `block specialized terms mismatch class=${classId} cell=${cell}`);
        assertCanonicalAntichain(candidate, `block ${classId}/${cell}`);
        metrics.blockChecked += 1;
      }
    }
  }

  return { census, classCount, metrics };
}

function installSpecializedTransitions(kernel) {
  const pool = kernel.classes;
  const perf = {
    ownTransitionHits: 0,
    ownTransitionMisses: 0,
    blockTransitionHits: 0,
    blockTransitionMisses: 0,
    crossDominanceChecks: 0,
  };

  pool.ownTransition = function ownTransitionSpecialized(id, cell, bitLo, bitHi) {
    const cacheIndex = id * this.cellCount + cell;
    const cached = this.ownTransitions[cacheIndex];
    if (cached !== CLASS_UNKNOWN) {
      this.metrics.ownTransitionHits += 1;
      perf.ownTransitionHits += 1;
      return cached;
    }
    this.metrics.ownTransitionMisses += 1;
    perf.ownTransitionMisses += 1;
    const candidate = specializedOwnTerms(this.terms(id), bitLo, bitHi, perf);
    if (candidate.terminal) {
      this.ownTransitions[cacheIndex] = CLASS_TERMINAL_WIN;
      return CLASS_TERMINAL_WIN;
    }
    const result = this.internNormalized(candidate.terms);
    this.ownTransitions[cacheIndex] = result;
    return result;
  };

  pool.blockTransition = function blockTransitionSpecialized(id, cell, bitLo, bitHi) {
    const cacheIndex = id * this.cellCount + cell;
    const cached = this.blockTransitions[cacheIndex];
    if (cached !== CLASS_UNKNOWN) {
      this.metrics.blockTransitionHits += 1;
      perf.blockTransitionHits += 1;
      return cached;
    }
    this.metrics.blockTransitionMisses += 1;
    perf.blockTransitionMisses += 1;
    const result = this.internNormalized(specializedBlockTerms(this.terms(id), bitLo, bitHi));
    this.blockTransitions[cacheIndex] = result;
    return result;
  };

  return perf;
}

function expectedRootActions(spec, oracle) {
  const actions = Array(spec.columns).fill(null);
  for (let column = 0; column < spec.columns; column += 1) {
    const heights = Array(spec.columns).fill(0);
    heights[column] = 1;
    actions[column] = oracle.evaluate({ heights, p0OwnershipMask: 1n << BigInt(column) });
  }
  return actions;
}

function runSolve(spec, specialized, expectedWdl, expectedActions, qualifyActions = false) {
  const start = performance.now();
  const kernel = createQuotientNativeNegamaxKernel(spec, { cacheEdges: false });
  const specializationMetrics = specialized ? installSpecializedTransitions(kernel) : null;
  const setupMs = performance.now() - start;
  const solver = kernel.createWdlSolver({ wdlMode: 'full', etc: false });
  const solveStart = performance.now();
  const result = solver.run();
  const solveMs = performance.now() - solveStart;
  assert(result === expectedWdl, `${specialized ? 'specialized' : 'generic'} root WDL mismatch`);
  let actions = null;
  if (qualifyActions) {
    actions = solver.rootActionValues();
    for (let column = 0; column < spec.columns; column += 1) {
      assert(actions[column] === expectedActions[column], `${specialized ? 'specialized' : 'generic'} root action ${column} mismatch`);
    }
  }
  return {
    result,
    actions,
    setupMs,
    solveMs,
    totalMs: performance.now() - start,
    expanded: solver.metrics.expanded,
    calls: solver.metrics.calls,
    states: kernel.states.count,
    classes: kernel.classes.size,
    specializationMetrics,
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function benchmarkCase(spec, repeats = 11) {
  assert(Number.isInteger(repeats) && repeats > 0, 'repeat count must be positive');
  const qualification = qualifySpecialization(spec);
  const oracle = solveBsfpOwnershipAntichainWdl(spec);
  const expectedActions = expectedRootActions(spec, oracle);
  const genericQualified = runSolve(spec, false, oracle.rootWdl, expectedActions, true);
  const specializedQualified = runSolve(spec, true, oracle.rootWdl, expectedActions, true);
  assert(genericQualified.expanded === specializedQualified.expanded, 'specialization changed search work');
  assert(genericQualified.calls === specializedQualified.calls, 'specialization changed search call count');

  const generic = [];
  const specialized = [];
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    generic.push(runSolve(spec, false, oracle.rootWdl, expectedActions));
    specialized.push(runSolve(spec, true, oracle.rootWdl, expectedActions));
  }
  const result = {
    geometry: `${spec.columns}x${spec.rows}:c${spec.connect}`,
    qualification,
    genericMs: median(generic.map((entry) => entry.totalMs)),
    specializedMs: median(specialized.map((entry) => entry.totalMs)),
    genericSolveMs: median(generic.map((entry) => entry.solveMs)),
    specializedSolveMs: median(specialized.map((entry) => entry.solveMs)),
    expanded: specializedQualified.expanded,
    calls: specializedQualified.calls,
    speedRatioSpecializedOverGeneric: median(specialized.map((entry) => entry.totalMs)) / median(generic.map((entry) => entry.totalMs)),
    representativeSpecialization: specialized[Math.floor(repeats / 2)]?.specializationMetrics ?? null,
  };
  console.error(`[q-transition-specialize] ${result.geometry} generic=${result.genericMs.toFixed(3)}ms specialized=${result.specializedMs.toFixed(3)}ms ratio=${result.speedRatioSpecializedOverGeneric.toFixed(3)} exp=${result.expanded}`);
  return result;
}

const cases = CASES.map((spec) => benchmarkCase(spec));
console.error(`QUOTIENT_TRANSITION_SPECIALIZATION_SUMMARY=${JSON.stringify(cases.map((entry) => ({ geometry: entry.geometry, genericMs: entry.genericMs, specializedMs: entry.specializedMs, ratio: entry.speedRatioSpecializedOverGeneric, expanded: entry.expanded })))}`);
console.log(JSON.stringify({
  kind: 'connect4-quotient-transition-specialization-campaign-v1',
  status: 'complete',
  date: '2026-09-11',
  hypothesis: 'A one-cell residual transition can preserve canonical antichain order and avoid generic sort/minimization: blocking is filtering; own advancement needs only reduced-vs-unchanged dominance plus a two-stream merge.',
  authority: 'candidate optimization only until exhaustive reachable-transition equivalence and independent BSFP root/action WDL checks pass',
  cases,
}, null, 2));
