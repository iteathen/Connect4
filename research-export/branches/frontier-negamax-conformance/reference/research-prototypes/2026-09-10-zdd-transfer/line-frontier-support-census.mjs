import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';
import { createBsfpSupportLatticeProfile } from '../../../components/bsfp/support-lattice.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });

// Best deterministic order from run 34510802686. Line IDs are geometry-owned
// createConnectWinningLines() IDs; this is research evidence, not a frozen ABI.
const LINE_ORDER = Object.freeze([
  24,25,26,57,0,45,27,12,30,4,46,58,34,33,8,47,59,16,28,29,20,31,32,
  1,13,48,60,17,49,61,5,50,62,9,21,35,2,51,63,14,6,52,18,64,10,53,65,
  22,39,36,3,37,54,66,15,40,7,55,19,67,38,11,56,68,23,41,42,43,44,
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[index];
}

const lines = createConnectWinningLines(SPEC);
assert(lines.length === 69, `expected 69 lines, got ${lines.length}`);
assert(LINE_ORDER.length === lines.length, 'line order length mismatch');
assert(new Set(LINE_ORDER).size === lines.length, 'line order contains duplicates');
for (let id = 0; id < lines.length; id += 1) assert(LINE_ORDER.includes(id), `line order missing ${id}`);

const orderPos = new Int16Array(lines.length);
for (let pos = 0; pos < LINE_ORDER.length; pos += 1) orderPos[LINE_ORDER[pos]] = pos;

const cellCount = SPEC.columns * SPEC.rows;
const first = new Int16Array(cellCount);
const last = new Int16Array(cellCount);
first.fill(32767);
last.fill(-1);
for (let lineId = 0; lineId < lines.length; lineId += 1) {
  const pos = orderPos[lineId];
  for (const cell of lines[lineId]) {
    first[cell] = Math.min(first[cell], pos);
    last[cell] = Math.max(last[cell], pos);
  }
}
for (let cell = 0; cell < cellCount; cell += 1) {
  assert(first[cell] !== 32767 && last[cell] >= first[cell], `cell ${cell} has no line incidence`);
}

const support = createBsfpSupportLatticeProfile(SPEC);
assert(support.itemCapacity === 823543, `unexpected support count ${support.itemCapacity}`);

const perRank = Array.from({ length: support.maxRank + 1 }, (_, rank) => ({
  rank,
  supports: 0,
  maxCarriedWidth: 0,
  maxScopeWidth: 0,
  maxStateNodes: 0,
  maxTransitionConfigurations: 0,
  sumCarriedWidth: 0,
  sumStateNodes: 0,
  stateNodes: [],
}));

let globalWorstState = null;
let globalWorstTransitions = null;
let globalMaxCarriedWidth = 0;
let globalMaxScopeWidth = 0;
let totalStateNodes = 0;
let totalTransitionConfigurations = 0;

function analyzeSupport(supportIndex) {
  const heights = support.decodeHeights(supportIndex);
  const occupied = new Uint8Array(cellCount);
  for (let column = 0; column < SPEC.columns; column += 1) {
    for (let row = 0; row < heights[column]; row += 1) occupied[row * SPEC.columns + column] = 1;
  }

  let stateNodes = 1; // initial empty frontier state
  let transitionConfigurations = 0;
  let maxCarriedWidth = 0;
  let maxScopeWidth = 0;
  let sumCarriedWidth = 0;

  for (let pos = 0; pos < lines.length; pos += 1) {
    let scopeWidth = 0;
    let carriedWidth = 0;
    for (let cell = 0; cell < cellCount; cell += 1) {
      if (!occupied[cell]) continue;
      // Assignment must exist while any line at this level or later can still use it.
      if (first[cell] <= pos && last[cell] >= pos) scopeWidth += 1;
      // After processing this line, retain only assignments crossing into the suffix.
      if (first[cell] <= pos && last[cell] > pos) carriedWidth += 1;
    }
    maxScopeWidth = Math.max(maxScopeWidth, scopeWidth);
    maxCarriedWidth = Math.max(maxCarriedWidth, carriedWidth);
    sumCarriedWidth += carriedWidth;
    transitionConfigurations += 2 ** scopeWidth;
    stateNodes += 2 ** carriedWidth;
  }

  return Object.freeze({
    supportIndex,
    rank: support.ranks[supportIndex],
    heights,
    maxCarriedWidth,
    maxScopeWidth,
    meanCarriedWidth: sumCarriedWidth / lines.length,
    stateNodes,
    transitionConfigurations,
  });
}

for (let supportIndex = 0; supportIndex < support.itemCapacity; supportIndex += 1) {
  const result = analyzeSupport(supportIndex);
  const bucket = perRank[result.rank];
  bucket.supports += 1;
  bucket.maxCarriedWidth = Math.max(bucket.maxCarriedWidth, result.maxCarriedWidth);
  bucket.maxScopeWidth = Math.max(bucket.maxScopeWidth, result.maxScopeWidth);
  bucket.maxStateNodes = Math.max(bucket.maxStateNodes, result.stateNodes);
  bucket.maxTransitionConfigurations = Math.max(bucket.maxTransitionConfigurations, result.transitionConfigurations);
  bucket.sumCarriedWidth += result.meanCarriedWidth;
  bucket.sumStateNodes += result.stateNodes;
  bucket.stateNodes.push(result.stateNodes);

  globalMaxCarriedWidth = Math.max(globalMaxCarriedWidth, result.maxCarriedWidth);
  globalMaxScopeWidth = Math.max(globalMaxScopeWidth, result.maxScopeWidth);
  totalStateNodes += result.stateNodes;
  totalTransitionConfigurations += result.transitionConfigurations;
  if (!globalWorstState || result.stateNodes > globalWorstState.stateNodes) globalWorstState = result;
  if (!globalWorstTransitions || result.transitionConfigurations > globalWorstTransitions.transitionConfigurations) globalWorstTransitions = result;
}

const rankSummaries = perRank.map((bucket) => {
  bucket.stateNodes.sort((a, b) => a - b);
  return Object.freeze({
    rank: bucket.rank,
    supports: bucket.supports,
    maxCarriedWidth: bucket.maxCarriedWidth,
    maxScopeWidth: bucket.maxScopeWidth,
    meanOfMeanCarriedWidth: bucket.supports === 0 ? null : bucket.sumCarriedWidth / bucket.supports,
    meanStateNodes: bucket.supports === 0 ? null : bucket.sumStateNodes / bucket.supports,
    p50StateNodes: percentile(bucket.stateNodes, 0.50),
    p95StateNodes: percentile(bucket.stateNodes, 0.95),
    maxStateNodes: bucket.maxStateNodes,
    maxTransitionConfigurations: bucket.maxTransitionConfigurations,
  });
});

const focusRanks = new Set([15, 18, 23, 24, 30, 36, 42]);
console.log(JSON.stringify({
  kind: 'connect4-line-first-frontier-support-census',
  status: 'pass',
  claim: 'research-only exact structural census; stateNodes is an assignment-frontier upper bound before any semantic suffix merging',
  geometry: '7x6:c4',
  supportCount: support.itemCapacity,
  lineCount: lines.length,
  cellCount,
  fixedOrderSourceRun: 34510802686,
  global: {
    maxCarriedWidth: globalMaxCarriedWidth,
    maxScopeWidth: globalMaxScopeWidth,
    worstStateSupport: globalWorstState,
    worstTransitionSupport: globalWorstTransitions,
    meanStateNodesAcrossSupports: totalStateNodes / support.itemCapacity,
    meanTransitionConfigurationsAcrossSupports: totalTransitionConfigurations / support.itemCapacity,
  },
  focusRanks: rankSummaries.filter((entry) => focusRanks.has(entry.rank)),
  rankSummaries,
}, null, 2));
