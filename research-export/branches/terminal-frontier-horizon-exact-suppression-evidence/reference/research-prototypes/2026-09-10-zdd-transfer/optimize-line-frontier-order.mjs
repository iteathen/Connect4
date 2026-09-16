import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const lines = createConnectWinningLines(SPEC);
const cellCount = SPEC.columns * SPEC.rows;
const lineCount = lines.length;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(lineCount === 69, `expected 69 lines, got ${lineCount}`);

const cellLines = Array.from({ length: cellCount }, () => []);
for (let lineId = 0; lineId < lineCount; lineId += 1) {
  for (const cell of lines[lineId]) cellLines[cell].push(lineId);
}

function xy(cell) {
  return { x: cell % SPEC.columns, y: Math.floor(cell / SPEC.columns) };
}

const centers = lines.map((line) => {
  let x = 0;
  let y = 0;
  for (const cell of line) {
    const point = xy(cell);
    x += point.x;
    y += point.y;
  }
  return { x: x / line.length, y: y / line.length };
});

function score(order) {
  const position = new Int16Array(lineCount);
  for (let i = 0; i < order.length; i += 1) position[order[i]] = i;
  const events = new Int16Array(lineCount + 1);
  for (const incident of cellLines) {
    let first = lineCount;
    let last = -1;
    for (const lineId of incident) {
      const p = position[lineId];
      if (p < first) first = p;
      if (p > last) last = p;
    }
    if (first < last) {
      events[first] += 1;
      events[last] -= 1;
    }
  }
  const profile = [];
  let current = 0;
  let maximum = 0;
  let sum = 0;
  for (let i = 0; i < lineCount; i += 1) {
    current += events[i];
    profile.push(current);
    if (current > maximum) maximum = current;
    sum += current;
  }
  return { maximum, sum, mean: sum / lineCount, profile };
}

function compare(a, b) {
  if (a.maximum !== b.maximum) return a.maximum - b.maximum;
  if (a.sum !== b.sum) return a.sum - b.sum;
  return 0;
}

function lineXCenterOrder() {
  return Array.from({ length: lineCount }, (_, lineId) => lineId).sort((a, b) =>
    centers[a].x - centers[b].x || centers[a].y - centers[b].y || a - b);
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function mutate(order, rng) {
  const next = order.slice();
  const mode = Math.floor(rng() * 3);
  let a = Math.floor(rng() * lineCount);
  let b = Math.floor(rng() * lineCount);
  if (a === b) b = (b + 1) % lineCount;
  if (a > b) [a, b] = [b, a];
  if (mode === 0) {
    [next[a], next[b]] = [next[b], next[a]];
  } else if (mode === 1) {
    const [value] = next.splice(a, 1);
    next.splice(b, 0, value);
  } else {
    for (let left = a, right = b; left < right; left += 1, right -= 1) [next[left], next[right]] = [next[right], next[left]];
  }
  return next;
}

function randomOrder(rng) {
  const order = Array.from({ length: lineCount }, (_, lineId) => lineId);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const rng = xorshift32(0xc4b5f00d);
let bestOrder = lineXCenterOrder();
let bestScore = score(bestOrder);
const seedScore = bestScore;
let accepted = 0;
let improvements = 0;

// Deterministic bounded annealing. Maximum frontier dominates energy; sum breaks ties.
const iterations = 300_000;
let currentOrder = bestOrder.slice();
let currentScore = bestScore;
for (let iteration = 0; iteration < iterations; iteration += 1) {
  if (iteration > 0 && iteration % 25_000 === 0) {
    // Diversify from a deterministic random restart while retaining global best.
    currentOrder = randomOrder(rng);
    currentScore = score(currentOrder);
  }
  const candidateOrder = mutate(currentOrder, rng);
  const candidateScore = score(candidateOrder);
  const progress = iteration / iterations;
  const temperature = 2500 * (1 - progress) + 20;
  const energyCurrent = currentScore.maximum * 10_000 + currentScore.sum;
  const energyCandidate = candidateScore.maximum * 10_000 + candidateScore.sum;
  const delta = energyCandidate - energyCurrent;
  if (delta <= 0 || rng() < Math.exp(-delta / temperature)) {
    currentOrder = candidateOrder;
    currentScore = candidateScore;
    accepted += 1;
  }
  if (compare(candidateScore, bestScore) < 0) {
    bestOrder = candidateOrder;
    bestScore = candidateScore;
    improvements += 1;
  }
}

// Deterministic best-improvement swap and insertion closure around the best stochastic result.
let changed = true;
let localPasses = 0;
while (changed && localPasses < 20) {
  changed = false;
  localPasses += 1;
  let passOrder = bestOrder;
  let passScore = bestScore;
  for (let a = 0; a < lineCount; a += 1) {
    for (let b = a + 1; b < lineCount; b += 1) {
      const candidate = bestOrder.slice();
      [candidate[a], candidate[b]] = [candidate[b], candidate[a]];
      const candidateScore = score(candidate);
      if (compare(candidateScore, passScore) < 0) {
        passOrder = candidate;
        passScore = candidateScore;
      }
    }
  }
  for (let from = 0; from < lineCount; from += 1) {
    for (let to = 0; to < lineCount; to += 1) {
      if (from === to) continue;
      const candidate = bestOrder.slice();
      const [value] = candidate.splice(from, 1);
      candidate.splice(to, 0, value);
      const candidateScore = score(candidate);
      if (compare(candidateScore, passScore) < 0) {
        passOrder = candidate;
        passScore = candidateScore;
      }
    }
  }
  if (compare(passScore, bestScore) < 0) {
    bestOrder = passOrder;
    bestScore = passScore;
    changed = true;
  }
}

assert(new Set(bestOrder).size === lineCount, 'optimized order is not a permutation');
console.log(JSON.stringify({
  kind: 'connect4-zdd-line-frontier-order-optimization',
  status: 'pass',
  geometry: '7x6:c4',
  objective: 'lexicographic(minimum maximum crossing-cell frontier, then minimum summed frontier)',
  seed: {
    name: 'line-x-center',
    maximumFrontier: seedScore.maximum,
    meanFrontier: seedScore.mean,
    sumFrontier: seedScore.sum,
  },
  search: {
    prngSeed: '0xc4b5f00d',
    annealingIterations: iterations,
    acceptedMutations: accepted,
    globalImprovements: improvements,
    deterministicLocalPasses: localPasses,
  },
  best: {
    maximumFrontier: bestScore.maximum,
    meanFrontier: bestScore.mean,
    sumFrontier: bestScore.sum,
    order: bestOrder,
    profile: bestScore.profile,
  },
}, null, 2));
