const controls = [
  { W: 4, H: 3, K: 3, name: "4x3-c3" },
  { W: 4, H: 4, K: 4, name: "4x4-c4" },
  { W: 5, H: 3, K: 4, name: "5x3-c4" },
  { W: 4, H: 5, K: 4, name: "4x5-c4" },
];

function popcount32(x) {
  x >>>= 0;
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function run(W, H, K) {
  const N = W * H;
  const POSITION_SCALE = 2 ** N;
  const bit = (c, r) => 1 << (c * H + r);
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const rawLines = [];

  for (let c = 0; c < W; c++) {
    for (let r = 0; r < H; r++) {
      for (const [dc, dr] of dirs) {
        const ec = c + (K - 1) * dc;
        const er = r + (K - 1) * dr;
        if (ec < 0 || ec >= W || er < 0 || er >= H) continue;
        let mask = 0;
        for (let i = 0; i < K; i++) mask |= bit(c + i * dc, r + i * dr);
        rawLines.push(mask >>> 0);
      }
    }
  }

  const lines = [...new Set(rawLines)];
  const key = (p0, p1) => p0 + p1 * POSITION_SCALE;
  const unpack = (k) => {
    const p1 = Math.floor(k / POSITION_SCALE);
    return [(k - p1 * POSITION_SCALE) >>> 0, p1 >>> 0];
  };
  const hasWin = (bits) => lines.some((mask) => (bits & mask) === mask);

  function support(p0, p1) {
    const occupied = (p0 | p1) >>> 0;
    const out = [];
    for (let c = 0; c < W; c++) {
      let h = 0;
      while (h < H && (occupied & bit(c, h))) h++;
      out.push(h);
    }
    return out;
  }

  function residualAntichain(own, opponent) {
    const raw = [];
    for (const line of lines) {
      if (line & opponent) continue;
      const residual = (line & ~own) >>> 0;
      if (residual) raw.push(residual);
    }

    const unique = [...new Set(raw)].sort(
      (a, b) => popcount32(a) - popcount32(b) || a - b,
    );

    const minimal = [];
    outer:
    for (const residual of unique) {
      for (const kept of minimal) {
        if ((kept & residual) === kept) continue outer;
      }
      minimal.push(residual);
    }
    return minimal;
  }

  // F_A >= F_B pointwise for the monotone completion functions.
  function formulaAtLeast(A, B) {
    for (const b of B) {
      let covered = false;
      for (const a of A) {
        if ((a & b) === a) {
          covered = true;
          break;
        }
      }
      if (!covered) return false;
    }
    return true;
  }

  const physicalStates = [];
  const seen = new Set();

  function enumerate(p0, p1) {
    const stateKey = key(p0, p1);
    if (seen.has(stateKey)) return;
    seen.add(stateKey);
    physicalStates.push(stateKey);

    const rank = popcount32(p0 | p1);
    const side = rank & 1;
    const heights = support(p0, p1);

    for (let c = 0; c < W; c++) {
      if (heights[c] >= H) continue;
      const landing = bit(c, heights[c]);
      let n0 = p0;
      let n1 = p1;
      if (side === 0) n0 |= landing;
      else n1 |= landing;

      if (hasWin(side === 0 ? n0 : n1) || rank + 1 === N) continue;
      enumerate(n0 >>> 0, n1 >>> 0);
    }
  }

  enumerate(0, 0);

  const valueMemo = new Map();
  const actionMemo = new Map();

  function compareStrong(a, b) {
    if (a[0] !== b[0]) return Math.sign(a[0] - b[0]);
    if (a[0] === 1) return Math.sign(b[1] - a[1]);   // faster win
    if (a[0] === -1) return Math.sign(a[1] - b[1]);  // slower loss
    return 0;
  }

  function solve(stateKey) {
    if (valueMemo.has(stateKey)) return valueMemo.get(stateKey);

    const [p0, p1] = unpack(stateKey);
    const rank = popcount32(p0 | p1);
    const side = rank & 1;
    const heights = support(p0, p1);

    let best = null;
    let bestMask = 0;
    const actions = [];

    for (let c = 0; c < W; c++) {
      if (heights[c] >= H) continue;

      const landing = bit(c, heights[c]);
      let n0 = p0;
      let n1 = p1;
      if (side === 0) n0 |= landing;
      else n1 |= landing;

      let score;
      if (hasWin(side === 0 ? n0 : n1)) {
        score = [1, 1];
      } else if (rank + 1 === N) {
        score = [0, 1];
      } else {
        const child = solve(key(n0 >>> 0, n1 >>> 0));
        score = [-child[0], child[1] + 1];
      }

      actions.push({ c, score });

      if (best === null || compareStrong(score, best) > 0) {
        best = score;
        bestMask = 1 << c;
      } else if (compareStrong(score, best) === 0) {
        bestMask |= 1 << c;
      }
    }

    if (best === null) best = [0, 0];
    valueMemo.set(stateKey, best);
    actionMemo.set(stateKey, { bestMask, actions });
    return best;
  }

  solve(0);
  for (const stateKey of [...physicalStates].reverse()) solve(stateKey);

  // Collapse physical states to exact residual q records.
  const qMap = new Map();

  for (const stateKey of physicalStates) {
    const [p0, p1] = unpack(stateKey);
    const heights = support(p0, p1);
    const rank = popcount32(p0 | p1);
    const side = rank & 1;
    const r0 = residualAntichain(p0, p1);
    const r1 = residualAntichain(p1, p0);
    const signature = `${heights.join(".")}|${r0.join(",")}|${r1.join(",")}`;

    if (!qMap.has(signature)) {
      const info = actionMemo.get(stateKey);
      qMap.set(signature, {
        signature,
        support: heights,
        side,
        moverResiduals: side === 0 ? r0 : r1,
        opponentResiduals: side === 0 ? r1 : r0,
        stateScore: valueMemo.get(stateKey),
        actions: info.actions,
        bestMask: info.bestMask,
      });
    }
  }

  const qStates = [...qMap.values()];
  const supportGroups = new Map();

  for (const q of qStates) {
    const signature = q.support.join(".");
    let group = supportGroups.get(signature);
    if (!group) {
      group = [];
      supportGroups.set(signature, group);
    }
    group.push(q);
  }

  function atLeastAsFavorable(A, B) {
    return (
      formulaAtLeast(A.moverResiduals, B.moverResiduals) &&
      formulaAtLeast(B.opponentResiduals, A.opponentResiduals)
    );
  }

  function actionScore(q, c) {
    const found = q.actions.find((action) => action.c === c);
    return found ? found.score : null;
  }

  let comparablePairs = 0;
  let stateWdlViolations = 0;
  let stateStrongViolations = 0;
  let comparableActionPairs = 0;
  let actionWdlViolations = 0;
  let actionStrongViolations = 0;
  let policyUpwardChecks = 0;
  let policyUpwardViolations = 0;

  let supportPolicyClasses = 0;
  let actionStateEntries = 0;
  let winMinGenerators = 0;
  let nonLossMinGenerators = 0;
  let strongThresholds = 0;
  let strongMinGenerators = 0;

  for (const group of supportGroups.values()) {
    supportPolicyClasses += new Set(group.map((q) => q.bestMask)).size;

    for (let i = 0; i < group.length; i++) {
      for (let j = 0; j < group.length; j++) {
        if (i === j) continue;
        const A = group[i];
        const B = group[j];
        if (!atLeastAsFavorable(A, B)) continue;

        comparablePairs++;

        if (A.stateScore[0] < B.stateScore[0]) stateWdlViolations++;
        if (compareStrong(A.stateScore, B.stateScore) < 0) stateStrongViolations++;

        for (let c = 0; c < W; c++) {
          const a = actionScore(A, c);
          const b = actionScore(B, c);
          if (!a || !b) continue;

          comparableActionPairs++;
          if (a[0] < b[0]) actionWdlViolations++;
          if (compareStrong(a, b) < 0) actionStrongViolations++;

          if (B.bestMask & (1 << c)) {
            policyUpwardChecks++;
            if (!(A.bestMask & (1 << c))) policyUpwardViolations++;
          }
        }
      }
    }

    function minimalGeneratorCount(set) {
      let count = 0;
      outer:
      for (const x of set) {
        for (const y of set) {
          if (x === y) continue;
          if (atLeastAsFavorable(x, y) && !atLeastAsFavorable(y, x)) {
            continue outer;
          }
        }
        count++;
      }
      return count;
    }

    for (let c = 0; c < W; c++) {
      const eligible = group.filter((q) => actionScore(q, c));
      actionStateEntries += eligible.length;

      const winSet = eligible.filter((q) => actionScore(q, c)[0] === 1);
      const nonLossSet = eligible.filter((q) => actionScore(q, c)[0] >= 0);

      winMinGenerators += minimalGeneratorCount(winSet);
      nonLossMinGenerators += minimalGeneratorCount(nonLossSet);

      const levels = [];
      for (const q of eligible) {
        const score = actionScore(q, c);
        if (!levels.some((x) => x[0] === score[0] && x[1] === score[1])) {
          levels.push(score);
        }
      }
      levels.sort(compareStrong);

      for (let t = 1; t < levels.length; t++) {
        const threshold = levels[t];
        const upper = eligible.filter(
          (q) => compareStrong(actionScore(q, c), threshold) >= 0,
        );
        strongThresholds++;
        strongMinGenerators += minimalGeneratorCount(upper);
      }
    }
  }

  return {
    geometry: { W, H, K },
    physical_nonterminal_states: physicalStates.length,
    q_classes: qStates.length,
    supports: supportGroups.size,
    support_policy_classes: supportPolicyClasses,
    q_to_support_policy_collapse:
      +(qStates.length / Math.max(1, supportPolicyClasses)).toFixed(3),
    order: {
      comparable_q_pairs: comparablePairs,
      state_wdl_violations: stateWdlViolations,
      state_strong_violations: stateStrongViolations,
      comparable_fixed_action_pairs: comparableActionPairs,
      action_wdl_violations: actionWdlViolations,
      action_strong_violations: actionStrongViolations,
      direct_policy_upward_checks: policyUpwardChecks,
      direct_policy_upward_violations: policyUpwardViolations,
    },
    frontier: {
      action_state_entries: actionStateEntries,
      win_min_generators: winMinGenerators,
      nonloss_min_generators: nonLossMinGenerators,
      wdl_generators: winMinGenerators + nonLossMinGenerators,
      wdl_entry_to_generator_ratio:
        +(actionStateEntries / Math.max(1, winMinGenerators + nonLossMinGenerators)).toFixed(3),
      strong_thresholds: strongThresholds,
      strong_min_generators: strongMinGenerators,
      strong_entry_to_generator_ratio:
        +(actionStateEntries / Math.max(1, strongMinGenerators)).toFixed(3),
    },
  };
}

const results = [];
for (const control of controls) {
  const started = performance.now();
  const result = run(control.W, control.H, control.K);
  result.name = control.name;
  result.elapsed_ms = Math.round(performance.now() - started);
  results.push(result);
  console.error(control.name, result.elapsed_ms);
}

console.log(JSON.stringify({
  schema: 1,
  experiment: "connect4-support-local-action-value-frontier",
  results,
}, null, 2));
