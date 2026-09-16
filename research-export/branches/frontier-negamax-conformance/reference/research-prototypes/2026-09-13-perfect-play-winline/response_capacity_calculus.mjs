import assert from 'node:assert/strict';

function intervals(n) {
  const out = [];
  for (let a = 0; a < n; a++) {
    for (let b = a; b < n; b++) out.push([a, b]);
  }
  return out;
}

function hasMatching(obligations, n) {
  const used = new Uint8Array(n);
  const order = obligations
    .map((_, i) => i)
    .sort((i, j) => {
      const ai = obligations[i];
      const aj = obligations[j];
      return (ai[1] - ai[0]) - (aj[1] - aj[0]);
    });

  function rec(k) {
    if (k === order.length) return true;
    const [a, b] = obligations[order[k]];
    for (let slot = a; slot <= b; slot++) {
      if (used[slot]) continue;
      used[slot] = 1;
      if (rec(k + 1)) return true;
      used[slot] = 0;
    }
    return false;
  }

  return rec(0);
}

function intervalHall(obligations, n) {
  for (let a = 0; a < n; a++) {
    for (let b = a; b < n; b++) {
      let contained = 0;
      for (const [l, r] of obligations) {
        if (a <= l && r <= b) contained++;
      }
      if (contained > b - a + 1) return false;
    }
  }
  return true;
}

function* tuples(items, length, prefix = []) {
  if (prefix.length === length) {
    yield prefix.slice();
    return;
  }
  for (const item of items) {
    prefix.push(item);
    yield* tuples(items, length, prefix);
    prefix.pop();
  }
}

let families = 0;
let feasible = 0;
let infeasible = 0;

for (let n = 1; n <= 4; n++) {
  const allowedIntervals = intervals(n);
  for (let m = 0; m <= n + 1; m++) {
    for (const obligations of tuples(allowedIntervals, m)) {
      families++;
      const matching = hasMatching(obligations, n);
      const hall = intervalHall(obligations, n);
      assert.equal(
        hall,
        matching,
        `mismatch n=${n} obligations=${JSON.stringify(obligations)}`,
      );
      if (matching) feasible++;
      else infeasible++;
    }
  }
}

// Ordinary double threat: two mandatory answers before the same next attacker
// opportunity, but only one defender response turn exists.
assert.equal(hasMatching([[0, 0], [0, 0]], 1), false);
assert.equal(intervalHall([[0, 0], [0, 0]], 1), false);

// Tight-prefix + repair: n already-mandatory unit responses consume all n
// response turns. Adding any extra repair obligation wholly inside that prefix
// violates Hall capacity immediately.
for (let n = 1; n <= 4; n++) {
  const saturated = Array.from({ length: n }, (_, i) => [i, i]);
  assert.equal(hasMatching(saturated, n), true);

  const plusRepair = [...saturated, [0, n - 1]];
  assert.equal(hasMatching(plusRepair, n), false);
  assert.equal(intervalHall(plusRepair, n), false);
}

console.log(JSON.stringify({
  kind: 'response-capacity-calculus',
  maxSlots: 4,
  families,
  feasible,
  infeasible,
  mismatches: 0,
  controls: {
    doubleThreat: true,
    saturatedPrefixPlusRepair: true,
  },
}, null, 2));
