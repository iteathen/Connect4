import assert from 'node:assert/strict';

const COMPLETE_CONTROLS = [
  [3, 3, 3], [3, 4, 3], [4, 3, 3], [4, 4, 3],
  [4, 4, 4], [5, 3, 3], [5, 3, 4],
];

function solve(columns, rows, connect) {
  const cellCount = columns * rows;
  const bit = i => 1n << BigInt(i);
  const cell = (c, r) => r * columns + c;
  const popcount = value => {
    let x = value;
    let count = 0;
    while (x) { x &= x - 1n; count += 1; }
    return count;
  };

  const winningLines = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        const line = [];
        for (let k = 0; k < connect; k += 1) {
          const cc = c + dc * k;
          const rr = r + dr * k;
          if (cc < 0 || cc >= columns || rr < 0 || rr >= rows) {
            line.length = 0;
            break;
          }
          line.push(cell(cc, rr));
        }
        if (line.length === connect) winningLines.push(line);
      }
    }
  }
  const lineMasks = winningLines.map(line => line.reduce((mask, x) => mask | bit(x), 0n));
  const hasWin = bits => lineMasks.some(mask => (bits & mask) === mask);

  function heightsOf(p0, p1) {
    const occupied = p0 | p1;
    const heights = Array(columns).fill(0);
    for (let c = 0; c < columns; c += 1) {
      while (heights[c] < rows && (occupied & bit(cell(c, heights[c]))) !== 0n) heights[c] += 1;
    }
    return heights;
  }

  const states = [];
  const stateByKey = new Map();
  function internState(p0, p1) {
    const key = `${p0.toString(16)}/${p1.toString(16)}`;
    if (stateByKey.has(key)) return stateByKey.get(key);
    const ply = popcount(p0 | p1);
    const p0Win = hasWin(p0);
    const p1Win = hasWin(p1);
    assert(!(p0Win && p1Win));
    let terminal = null;
    if (p0Win) terminal = 1;
    else if (p1Win) terminal = -1;
    else if (ply === cellCount) terminal = 0;
    const state = { id: states.length, p0, p1, ply, side: ply & 1, terminal, children: [] };
    stateByKey.set(key, state.id);
    states.push(state);
    return state.id;
  }

  internState(0n, 0n);
  for (let index = 0; index < states.length; index += 1) {
    const state = states[index];
    if (state.terminal !== null) continue;
    const heights = heightsOf(state.p0, state.p1);
    for (let c = 0; c < columns; c += 1) {
      if (heights[c] >= rows) continue;
      const landing = cell(c, heights[c]);
      const p0 = state.side === 0 ? state.p0 | bit(landing) : state.p0;
      const p1 = state.side === 1 ? state.p1 | bit(landing) : state.p1;
      state.children.push({ column: c, landing, child: internState(p0, p1) });
    }
  }

  const exact = new Int8Array(states.length);
  exact.fill(2);
  function exactValue(stateId) {
    if (exact[stateId] !== 2) return exact[stateId];
    const state = states[stateId];
    if (state.terminal !== null) return (exact[stateId] = state.terminal);
    let value = state.side === 0 ? -1 : 1;
    for (const edge of state.children) {
      const childValue = exactValue(edge.child);
      value = state.side === 0 ? Math.max(value, childValue) : Math.min(value, childValue);
    }
    return (exact[stateId] = value);
  }
  exactValue(0);
  for (const state of states) exactValue(state.id);

  function residualAntichain(state, player) {
    const own = player === 0 ? state.p0 : state.p1;
    const opponent = player === 0 ? state.p1 : state.p0;
    const residuals = [];
    for (let i = 0; i < winningLines.length; i += 1) {
      if ((lineMasks[i] & opponent) !== 0n) continue;
      residuals.push(winningLines[i].filter(x => (own & bit(x)) === 0n));
    }
    residuals.sort((a, b) => a.length - b.length || a.join(',').localeCompare(b.join(',')));
    const minimal = [];
    for (const candidate of residuals) {
      const set = new Set(candidate);
      if (minimal.some(existing => existing.every(x => set.has(x)))) continue;
      minimal.push(candidate);
    }
    return minimal;
  }

  function playableCells(state) {
    const heights = heightsOf(state.p0, state.p1);
    const out = [];
    for (let c = 0; c < columns; c += 1) if (heights[c] < rows) out.push(cell(c, heights[c]));
    return out;
  }

  function tacticalClass(state) {
    if (state.terminal !== null) return { kind: 'terminal', value: state.terminal };
    const playable = new Set(playableCells(state));
    const own = residualAntichain(state, state.side);
    const opponent = residualAntichain(state, 1 - state.side);
    const immediate = new Set(own.filter(r => r.length === 1 && playable.has(r[0])).map(r => r[0]));
    if (immediate.size) return { kind: 'immediate', value: state.side === 0 ? 1 : -1 };
    const threats = new Set(opponent.filter(r => r.length === 1 && playable.has(r[0])).map(r => r[0]));
    if (threats.size >= 2) return { kind: 'double-threat-loss', value: state.side === 0 ? -1 : 1 };
    if (own.length === 0 && opponent.length === 0) return { kind: 'exhaustion-draw', value: 0 };
    if (threats.size === 1) return { kind: 'forced' };
    return { kind: 'decision' };
  }

  function responseTemplate(state, pooled) {
    if (state.terminal !== null) return null;
    const heights = heightsOf(state.p0, state.p1);
    const pool = [];
    const responseCells = new Set();
    const triggerToResponse = new Map();
    if (!pooled && !heights.every(h => ((rows - h) & 1) === 0)) return null;

    for (let c = 0; c < columns; c += 1) {
      let start = heights[c];
      const remaining = rows - heights[c];
      if (pooled && (remaining & 1) !== 0) {
        pool.push(cell(c, heights[c]));
        start += 1;
      }
      for (let r = start; r + 1 < rows; r += 2) {
        const trigger = cell(c, r);
        const response = cell(c, r + 1);
        triggerToResponse.set(trigger, response);
        responseCells.add(response);
      }
    }
    if (pooled && (pool.length & 1) !== 0) return null;
    return { heights, pool, responseCells, triggerToResponse };
  }

  function responseCertificate(state, pooled) {
    const template = responseTemplate(state, pooled);
    if (!template) return null;
    const attackerResiduals = residualAntichain(state, state.side);
    if (attackerResiduals.length === 0) return null;
    if (!attackerResiduals.every(r => r.some(x => template.responseCells.has(x)))) return null;
    return { ...template, attackerResiduals };
  }

  function policyVerify(state, certificate) {
    const attacker = state.side;
    let initialPoolMask = 0n;
    for (const x of certificate.pool) initialPoolMask |= bit(x);
    const memo = new Map();
    let visited = 0;

    function recurse(stateId, poolMask) {
      const memoKey = `${stateId}/${poolMask.toString(16)}`;
      if (memo.has(memoKey)) return memo.get(memoKey);
      visited += 1;
      const current = states[stateId];
      assert.equal(current.side, attacker);

      for (const attackerEdge of current.children) {
        const afterAttacker = states[attackerEdge.child];
        if (afterAttacker.terminal !== null) {
          const attackerWin = attacker === 0 ? 1 : -1;
          if (afterAttacker.terminal === attackerWin) {
            memo.set(memoKey, false);
            return false;
          }
          continue;
        }

        let responseTarget = -1;
        let nextPoolMask = poolMask;
        if ((poolMask & bit(attackerEdge.landing)) !== 0n) {
          nextPoolMask &= ~bit(attackerEdge.landing);
          for (let x = 0; x < cellCount; x += 1) {
            if ((nextPoolMask & bit(x)) !== 0n) { responseTarget = x; break; }
          }
          if (responseTarget < 0) { memo.set(memoKey, false); return false; }
          nextPoolMask &= ~bit(responseTarget);
        } else if (certificate.triggerToResponse.has(attackerEdge.landing)) {
          responseTarget = certificate.triggerToResponse.get(attackerEdge.landing);
        } else {
          memo.set(memoKey, false);
          return false;
        }

        const defenderEdge = afterAttacker.children.find(edge => edge.landing === responseTarget);
        if (!defenderEdge) { memo.set(memoKey, false); return false; }
        const afterDefender = states[defenderEdge.child];
        if (afterDefender.terminal !== null) continue;
        if (!recurse(afterDefender.id, nextPoolMask)) {
          memo.set(memoKey, false);
          return false;
        }
      }
      memo.set(memoKey, true);
      return true;
    }

    return { safe: recurse(state.id, initialPoolMask), visited };
  }

  const residualKey = residuals => residuals.map(r => r.join('.')).sort().join('|');
  const quotientKey = state => `${heightsOf(state.p0, state.p1).join(',')};${residualKey(residualAntichain(state, 0))};${residualKey(residualAntichain(state, 1))}`;

  function certificateStats(pooled) {
    const q = new Set();
    const decisionQ = new Set();
    const decisionValueDistribution = Object.create(null);
    let physicalStates = 0;
    let decisionStates = 0;
    let exactValueMismatches = 0;
    let policyFailures = 0;
    let policyStatesVisited = 0;
    let maxPolicyStatesPerCertificate = 0;

    for (const state of states) {
      const certificate = responseCertificate(state, pooled);
      if (!certificate) continue;
      physicalStates += 1;
      q.add(quotientKey(state));
      const value = exact[state.id];
      const boundHolds = state.side === 0 ? value <= 0 : value >= 0;
      if (!boundHolds) exactValueMismatches += 1;
      if (tacticalClass(state).kind === 'decision') {
        decisionStates += 1;
        decisionQ.add(quotientKey(state));
        const key = `side${state.side}:value${value}`;
        decisionValueDistribution[key] = (decisionValueDistribution[key] ?? 0) + 1;
      }
      if (pooled) {
        const policy = policyVerify(state, certificate);
        if (!policy.safe) policyFailures += 1;
        policyStatesVisited += policy.visited;
        maxPolicyStatesPerCertificate = Math.max(maxPolicyStatesPerCertificate, policy.visited);
      }
    }
    assert.equal(exactValueMismatches, 0);
    if (pooled) assert.equal(policyFailures, 0);
    return {
      physicalStates,
      quotientClasses: q.size,
      decisionStates,
      decisionQuotientClasses: decisionQ.size,
      exactValueMismatches,
      decisionValueDistribution,
      ...(pooled ? { policyFailures, policyStatesVisited, maxPolicyStatesPerCertificate } : {}),
    };
  }

  function directInterval(state, pooled) {
    let lo = -1;
    let hi = 1;
    const tactical = tacticalClass(state);
    if (tactical.value !== undefined) lo = hi = tactical.value;
    if (responseCertificate(state, pooled)) {
      if (state.side === 0) hi = Math.min(hi, 0);
      else lo = Math.max(lo, 0);
    }
    return { lo, hi };
  }

  function strictChoiceStats(pooled) {
    const stats = {
      decisionParents: 0,
      parentsWithStrictElimination: 0,
      strictEliminatedEdges: 0,
      exactParentValueMismatchesAfterBatchElimination: 0,
      byParentSide: {
        P0: { decisionParents: 0, parentsWithStrictElimination: 0, strictEliminatedEdges: 0 },
        P1: { decisionParents: 0, parentsWithStrictElimination: 0, strictEliminatedEdges: 0 },
      },
    };

    for (const parent of states) {
      if (parent.terminal !== null || tacticalClass(parent).kind !== 'decision' || parent.children.length < 2) continue;
      stats.decisionParents += 1;
      const sideStats = parent.side === 0 ? stats.byParentSide.P0 : stats.byParentSide.P1;
      sideStats.decisionParents += 1;
      const children = parent.children.map(edge => ({
        interval: directInterval(states[edge.child], pooled),
        exact: exact[edge.child],
      }));
      const eliminated = Array(children.length).fill(false);
      for (let i = 0; i < children.length; i += 1) {
        for (let j = 0; j < children.length; j += 1) {
          if (i === j) continue;
          if (parent.side === 0 && children[i].interval.hi < children[j].interval.lo) eliminated[i] = true;
          if (parent.side === 1 && children[i].interval.lo > children[j].interval.hi) eliminated[i] = true;
        }
      }
      const count = eliminated.filter(Boolean).length;
      if (!count) continue;
      stats.parentsWithStrictElimination += 1;
      stats.strictEliminatedEdges += count;
      sideStats.parentsWithStrictElimination += 1;
      sideStats.strictEliminatedEdges += count;
      const retained = children.filter((_, i) => !eliminated[i]);
      const retainedValue = parent.side === 0
        ? Math.max(...retained.map(child => child.exact))
        : Math.min(...retained.map(child => child.exact));
      if (retainedValue !== exact[parent.id]) stats.exactParentValueMismatchesAfterBatchElimination += 1;
    }
    assert.equal(stats.exactParentValueMismatchesAfterBatchElimination, 0);
    return stats;
  }

  function naiveFalsifiers() {
    if (columns !== 4 || rows !== 3 || connect !== 3) return null;

    function naive(state, leaveTop) {
      if (state.terminal !== null) return false;
      const heights = heightsOf(state.p0, state.p1);
      const responseCells = new Set();
      for (let c = 0; c < columns; c += 1) {
        const remaining = rows - heights[c];
        if (leaveTop) {
          for (let r = heights[c] + 1; r < rows; r += 2) responseCells.add(cell(c, r));
        } else {
          const start = heights[c] + (remaining & 1);
          for (let r = start + 1; r < rows; r += 2) responseCells.add(cell(c, r));
        }
      }
      const own = residualAntichain(state, state.side);
      return own.length > 0 && own.every(r => r.some(x => responseCells.has(x)));
    }

    function count(leaveTop) {
      let qualifyingStates = 0;
      let exactValueMismatches = 0;
      let smallestCounterexample = null;
      for (const state of states) {
        if (!naive(state, leaveTop)) continue;
        qualifyingStates += 1;
        const holds = state.side === 0 ? exact[state.id] <= 0 : exact[state.id] >= 0;
        if (!holds) {
          exactValueMismatches += 1;
          if (!smallestCounterexample || state.ply < smallestCounterexample.ply) {
            smallestCounterexample = {
              stateId: state.id,
              ply: state.ply,
              side: state.side,
              exactValue: exact[state.id],
              support: heightsOf(state.p0, state.p1),
              p0Hex: state.p0.toString(16),
              p1Hex: state.p1.toString(16),
            };
          }
        }
      }
      return { qualifyingStates, exactValueMismatches, smallestCounterexample };
    }

    return {
      leaveTopUnpairedWithoutResourcePolicy: count(true),
      leaveBottomUnpairedWithoutEvenPoolGuard: count(false),
    };
  }

  const legacy = certificateStats(false);
  const pooled = certificateStats(true);
  let legacyNotPooled = 0;
  for (const state of states) {
    if (responseCertificate(state, false) && !responseCertificate(state, true)) legacyNotPooled += 1;
  }
  assert.equal(legacyNotPooled, 0);
  const legacyChoice = strictChoiceStats(false);
  const pooledChoice = strictChoiceStats(true);

  return {
    domain: { columns, rows, connect, cells: cellCount, winningLines: winningLines.length },
    graph: {
      reachableStates: states.length,
      nonterminalStates: states.filter(state => state.terminal === null).length,
      rootValue: exact[0],
    },
    certificateControl: {
      legacyAllEven: legacy,
      pooledFrontier: pooled,
      legacyNotPooled,
      incrementalPhysicalStates: pooled.physicalStates - legacy.physicalStates,
      incrementalDecisionStates: pooled.decisionStates - legacy.decisionStates,
      incrementalQuotientClasses: pooled.quotientClasses - legacy.quotientClasses,
      incrementalDecisionQuotientClasses: pooled.decisionQuotientClasses - legacy.decisionQuotientClasses,
    },
    strictSiblingElimination: {
      legacyAllEven: legacyChoice,
      pooledFrontier: pooledChoice,
      incrementalStrictEdges: pooledChoice.strictEliminatedEdges - legacyChoice.strictEliminatedEdges,
      incrementalParents: pooledChoice.parentsWithStrictElimination - legacyChoice.parentsWithStrictElimination,
    },
    naiveFalsifiers: naiveFalsifiers(),
  };
}

function standardOpeningBoundary() {
  const columns = 7;
  const rows = 6;
  const connect = 4;
  const bit = i => 1n << BigInt(i);
  const cell = (c, r) => r * columns + c;
  const winningLines = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < columns; c += 1) {
      for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        const line = [];
        for (let k = 0; k < connect; k += 1) {
          const cc = c + dc * k;
          const rr = r + dr * k;
          if (cc < 0 || cc >= columns || rr < 0 || rr >= rows) { line.length = 0; break; }
          line.push(cell(cc, rr));
        }
        if (line.length === connect) winningLines.push(line);
      }
    }
  }
  assert.equal(winningLines.length, 69);
  const lineMasks = winningLines.map(line => line.reduce((mask, x) => mask | bit(x), 0n));

  function heightsOf(p0, p1) {
    const occupied = p0 | p1;
    const heights = Array(columns).fill(0);
    for (let c = 0; c < columns; c += 1) {
      while (heights[c] < rows && (occupied & bit(cell(c, heights[c]))) !== 0n) heights[c] += 1;
    }
    return heights;
  }

  function p0ResidualAntichain(p0, p1) {
    const residuals = [];
    for (let i = 0; i < winningLines.length; i += 1) {
      if ((lineMasks[i] & p1) !== 0n) continue;
      residuals.push(winningLines[i].filter(x => (p0 & bit(x)) === 0n));
    }
    residuals.sort((a, b) => a.length - b.length || a.join(',').localeCompare(b.join(',')));
    const minimal = [];
    for (const candidate of residuals) {
      const set = new Set(candidate);
      if (minimal.some(existing => existing.every(x => set.has(x)))) continue;
      minimal.push(candidate);
    }
    return minimal;
  }

  function pooledCheck(p0, p1) {
    const heights = heightsOf(p0, p1);
    const pool = [];
    const responses = new Set();
    for (let c = 0; c < columns; c += 1) {
      let start = heights[c];
      const remaining = rows - heights[c];
      if ((remaining & 1) !== 0) { pool.push(cell(c, heights[c])); start += 1; }
      for (let r = start + 1; r < rows; r += 2) responses.add(cell(c, r));
    }
    const residuals = p0ResidualAntichain(p0, p1);
    const uncovered = residuals.filter(r => !r.some(x => responses.has(x)));
    return { qualifies: (pool.length & 1) === 0 && residuals.length > 0 && uncovered.length === 0, uncovered: uncovered.length };
  }

  const openings = [];
  for (let p0Column = 0; p0Column < columns; p0Column += 1) {
    const p0 = bit(cell(p0Column, 0));
    const replies = [];
    for (let p1Column = 0; p1Column < columns; p1Column += 1) {
      const heights = heightsOf(p0, 0n);
      const p1 = bit(cell(p1Column, heights[p1Column]));
      const check = pooledCheck(p0, p1);
      replies.push({ p1Column: p1Column + 1, qualifies: check.qualifies, uncoveredResiduals: check.uncovered });
    }
    openings.push({
      p0Column: p0Column + 1,
      certifyingP1Replies: replies.filter(reply => reply.qualifies).map(reply => reply.p1Column),
      minimumUncoveredResiduals: Math.min(...replies.map(reply => reply.uncoveredResiduals)),
    });
  }
  return { domain: '7x6-connect4', openings };
}

const exactControls = COMPLETE_CONTROLS.map(control => solve(...control));
const totals = {
  reachableStates: 0,
  nonterminalStates: 0,
  legacyPhysicalStates: 0,
  pooledPhysicalStates: 0,
  incrementalPhysicalStates: 0,
  legacyDecisionStates: 0,
  pooledDecisionStates: 0,
  incrementalDecisionStates: 0,
  legacyQuotientClasses: 0,
  pooledQuotientClasses: 0,
  legacyDecisionQuotientClasses: 0,
  pooledDecisionQuotientClasses: 0,
  pooledPolicyFailures: 0,
  pooledPolicyStatesVisited: 0,
  legacyStrictEliminatedEdges: 0,
  pooledStrictEliminatedEdges: 0,
  incrementalStrictEliminatedEdges: 0,
};

for (const result of exactControls) {
  const control = result.certificateControl;
  totals.reachableStates += result.graph.reachableStates;
  totals.nonterminalStates += result.graph.nonterminalStates;
  totals.legacyPhysicalStates += control.legacyAllEven.physicalStates;
  totals.pooledPhysicalStates += control.pooledFrontier.physicalStates;
  totals.incrementalPhysicalStates += control.incrementalPhysicalStates;
  totals.legacyDecisionStates += control.legacyAllEven.decisionStates;
  totals.pooledDecisionStates += control.pooledFrontier.decisionStates;
  totals.incrementalDecisionStates += control.incrementalDecisionStates;
  totals.legacyQuotientClasses += control.legacyAllEven.quotientClasses;
  totals.pooledQuotientClasses += control.pooledFrontier.quotientClasses;
  totals.legacyDecisionQuotientClasses += control.legacyAllEven.decisionQuotientClasses;
  totals.pooledDecisionQuotientClasses += control.pooledFrontier.decisionQuotientClasses;
  totals.pooledPolicyFailures += control.pooledFrontier.policyFailures;
  totals.pooledPolicyStatesVisited += control.pooledFrontier.policyStatesVisited;
  totals.legacyStrictEliminatedEdges += result.strictSiblingElimination.legacyAllEven.strictEliminatedEdges;
  totals.pooledStrictEliminatedEdges += result.strictSiblingElimination.pooledFrontier.strictEliminatedEdges;
  totals.incrementalStrictEliminatedEdges += result.strictSiblingElimination.incrementalStrictEdges;
}
assert.equal(totals.pooledPolicyFailures, 0);

console.log(JSON.stringify({
  kind: 'pooled-frontier-response-control',
  theorem: {
    name: 'pooled-frontier paired-response safety theorem',
    attacker: 'side to move',
    frontierPool: 'current playable cell from each column with odd remaining capacity',
    poolGuard: 'frontier-pool cardinality is even',
    verticalPairing: 'after omitting each pool cell, pair each remaining column suffix bottom-up; upper mate is defender response',
    coverageGuard: 'every surviving attacker residual requirement intersects the upper-response set',
    consequence: 'attacker cannot force a win',
    policy: [
      'attacker plays vertical lower mate -> defender immediately plays upper mate',
      'attacker plays frontier-pool cell -> defender plays any other still-unconsumed frontier-pool cell',
    ],
  },
  exactControls,
  totals,
  standardOpeningBoundary: standardOpeningBoundary(),
  outputSemantics: {
    strictSiblingElimination: 'safe for W/D/L-perfect output because the eliminated child is provably strictly worse',
    weakTieElimination: 'value-safe only with retained witness; not output-safe without provenance/output subsumption',
  },
  claimBoundary: {
    exactEnumerationRole: 'qualification/falsification oracle only',
    standard7x6Solved: false,
    finalTerminalLineCardinalityUsed: false,
  },
}, null, 2));
