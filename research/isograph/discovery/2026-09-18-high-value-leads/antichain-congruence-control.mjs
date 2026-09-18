function bitCount(x) {
  let n = 0;
  while (x) {
    x &= x - 1;
    n++;
  }
  return n;
}

function canonicalAntichain(family) {
  const xs = [...new Set(family)]
    .filter((x) => x !== 0)
    .sort((a, b) => bitCount(a) - bitCount(b) || a - b);

  const out = [];
  for (const x of xs) {
    if (!out.some((y) => (y & x) === y)) out.push(x);
  }
  return out.sort((a, b) => a - b);
}

function moverCofactor(family, bit) {
  let terminal = false;
  const next = [];
  for (const r of family) {
    const reduced = (r & bit) ? (r & ~bit) : r;
    if (reduced === 0) terminal = true;
    else next.push(reduced);
  }
  return { terminal, next: canonicalAntichain(next) };
}

function opponentCofactor(family, bit) {
  return canonicalAntichain(family.filter((r) => (r & bit) === 0));
}

function equal(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

let totalFamilies = 0;
let totalChecks = 0;

for (let n = 1; n <= 4; n++) {
  const subsets = [];
  for (let s = 1; s < (1 << n); s++) subsets.push(s);

  const familyCount = 1 << subsets.length;
  let checks = 0;

  for (let mask = 0; mask < familyCount; mask++) {
    const family = [];
    for (let i = 0; i < subsets.length; i++) {
      if (mask & (1 << i)) family.push(subsets[i]);
    }

    const canonical = canonicalAntichain(family);

    for (let i = 0; i < n; i++) {
      const bit = 1 << i;

      const rawMover = moverCofactor(family, bit);
      const canonicalMover = moverCofactor(canonical, bit);

      // Once the move is terminal, first-win stopping makes the hypothetical
      // post-terminal residual family semantically unobservable.
      if (
        rawMover.terminal !== canonicalMover.terminal ||
        (!rawMover.terminal && !equal(rawMover.next, canonicalMover.next))
      ) {
        throw new Error(`mover congruence failure n=${n} family=${mask} bit=${i}`);
      }

      const rawOpponent = opponentCofactor(family, bit);
      const canonicalOpponent = opponentCofactor(canonical, bit);
      if (!equal(rawOpponent, canonicalOpponent)) {
        throw new Error(`opponent congruence failure n=${n} family=${mask} bit=${i}`);
      }

      checks++;
    }
  }

  totalFamilies += familyCount;
  totalChecks += checks;
  console.log(JSON.stringify({ n, families: familyCount, checks, result: "PASS" }));
}

console.log(JSON.stringify({
  totalFamilies,
  totalChecks,
  result: "PASS"
}));
