import { createConnectWinningLines } from '../../../components/bsfp/geometry.mjs';

const SPEC = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const lines = createConnectWinningLines(SPEC);
const cellCount = SPEC.columns * SPEC.rows;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(lines.length === 69, `expected 69 winning lines, got ${lines.length}`);
assert(lines.reduce((sum, line) => sum + line.length, 0) === 276, 'expected 276 line-cell incidences');

const lineCells = lines.map((line) => new Set(line));
const cellLines = Array.from({ length: cellCount }, () => new Set());
for (let lineId = 0; lineId < lines.length; lineId += 1) {
  for (const cell of lines[lineId]) cellLines[cell].add(lineId);
}

function cellXY(cell) {
  return Object.freeze({ x: cell % SPEC.columns, y: Math.floor(cell / SPEC.columns) });
}

const lineCenters = lines.map((line) => {
  let x = 0;
  let y = 0;
  for (const cell of line) {
    const xy = cellXY(cell);
    x += xy.x;
    y += xy.y;
  }
  return Object.freeze({ x: x / line.length, y: y / line.length });
});

function profileCells(order) {
  const processed = new Uint8Array(cellCount);
  const profile = [];
  for (const cell of order) {
    processed[cell] = 1;
    let crossing = 0;
    for (const members of lineCells) {
      let left = false;
      let right = false;
      for (const member of members) {
        if (processed[member]) left = true;
        else right = true;
      }
      if (left && right) crossing += 1;
    }
    profile.push(crossing);
  }
  return profile;
}

function profileLines(order) {
  const processed = new Uint8Array(lines.length);
  const profile = [];
  for (const lineId of order) {
    processed[lineId] = 1;
    let crossing = 0;
    for (const incident of cellLines) {
      let left = false;
      let right = false;
      for (const member of incident) {
        if (processed[member]) left = true;
        else right = true;
      }
      if (left && right) crossing += 1;
    }
    profile.push(crossing);
  }
  return profile;
}

function summarize(name, orientation, order, profile) {
  const maximum = Math.max(...profile);
  const total = profile.reduce((sum, value) => sum + value, 0);
  return Object.freeze({
    name,
    orientation,
    maximumFrontier: maximum,
    meanFrontier: total / profile.length,
    maximumAt: profile.findIndex((value) => value === maximum) + 1,
    order: Object.freeze(order.slice()),
    profile: Object.freeze(profile.slice()),
  });
}

function compareScore(a, b) {
  if (a.maximumFrontier !== b.maximumFrontier) return a.maximumFrontier - b.maximumFrontier;
  if (a.meanFrontier !== b.meanFrontier) return a.meanFrontier - b.meanFrontier;
  return a.name.localeCompare(b.name);
}

const cells = Array.from({ length: cellCount }, (_, index) => index);
const lineIds = Array.from({ length: lines.length }, (_, index) => index);

const cellOrders = [
  ['row-major', cells.slice()],
  ['column-major', cells.slice().sort((a, b) => {
    const aa = cellXY(a); const bb = cellXY(b);
    return aa.x - bb.x || aa.y - bb.y;
  })],
  ['edge-column-inward', cells.slice().sort((a, b) => {
    const aa = cellXY(a); const bb = cellXY(b);
    const da = Math.min(aa.x, SPEC.columns - 1 - aa.x);
    const db = Math.min(bb.x, SPEC.columns - 1 - bb.x);
    return da - db || aa.x - bb.x || aa.y - bb.y;
  })],
  ['center-column-outward', cells.slice().sort((a, b) => {
    const aa = cellXY(a); const bb = cellXY(b);
    const da = Math.abs(aa.x - (SPEC.columns - 1) / 2);
    const db = Math.abs(bb.x - (SPEC.columns - 1) / 2);
    return da - db || aa.y - bb.y || aa.x - bb.x;
  })],
];

const lineOrders = [
  ['line-x-center', lineIds.slice().sort((a, b) => lineCenters[a].x - lineCenters[b].x || lineCenters[a].y - lineCenters[b].y || a - b)],
  ['line-y-center', lineIds.slice().sort((a, b) => lineCenters[a].y - lineCenters[b].y || lineCenters[a].x - lineCenters[b].x || a - b)],
  ['line-diagonal-center', lineIds.slice().sort((a, b) => (lineCenters[a].x + lineCenters[a].y) - (lineCenters[b].x + lineCenters[b].y) || lineCenters[a].x - lineCenters[b].x || a - b)],
];

function greedyOrder({ itemCount, profileFn, name }) {
  const remaining = new Set(Array.from({ length: itemCount }, (_, index) => index));
  const order = [];
  let bestMaximumSoFar = 0;
  while (remaining.size > 0) {
    let selected = null;
    let selectedScore = null;
    for (const candidate of remaining) {
      const trial = [...order, candidate];
      const profile = profileFn(trial);
      const current = profile[profile.length - 1] ?? 0;
      const maximum = Math.max(bestMaximumSoFar, current);
      const score = [maximum, current, candidate];
      if (selectedScore === null || score[0] < selectedScore[0] || (score[0] === selectedScore[0] && (score[1] < selectedScore[1] || (score[1] === selectedScore[1] && score[2] < selectedScore[2])))) {
        selected = candidate;
        selectedScore = score;
      }
    }
    order.push(selected);
    remaining.delete(selected);
    bestMaximumSoFar = selectedScore[0];
  }
  return [name, order];
}

// The greedy profile functions need to treat unspecified items as unprocessed.
function prefixCellFrontier(prefix) {
  const processed = new Uint8Array(cellCount);
  const values = [];
  for (const cell of prefix) {
    processed[cell] = 1;
    let crossing = 0;
    for (const members of lineCells) {
      let left = false;
      let right = false;
      for (const member of members) {
        if (processed[member]) left = true; else right = true;
      }
      if (left && right) crossing += 1;
    }
    values.push(crossing);
  }
  return values;
}

function prefixLineFrontier(prefix) {
  const processed = new Uint8Array(lines.length);
  const values = [];
  for (const lineId of prefix) {
    processed[lineId] = 1;
    let crossing = 0;
    for (const incident of cellLines) {
      let left = false;
      let right = false;
      for (const member of incident) {
        if (processed[member]) left = true; else right = true;
      }
      if (left && right) crossing += 1;
    }
    values.push(crossing);
  }
  return values;
}

cellOrders.push(greedyOrder({ itemCount: cellCount, profileFn: prefixCellFrontier, name: 'cell-greedy-current-frontier' }));
lineOrders.push(greedyOrder({ itemCount: lines.length, profileFn: prefixLineFrontier, name: 'line-greedy-current-frontier' }));

const results = [];
for (const [name, order] of cellOrders) results.push(summarize(name, 'process-cells/crossing-lines', order, profileCells(order)));
for (const [name, order] of lineOrders) results.push(summarize(name, 'process-lines/crossing-cells', order, profileLines(order)));
results.sort(compareScore);

const incidentCounts = cellLines.map((entry) => entry.size);
console.log(JSON.stringify({
  kind: 'connect4-zdd-incidence-frontier-census',
  status: 'pass',
  geometry: '7x6:c4',
  cellCount,
  winningLineCount: lines.length,
  incidenceCount: 276,
  cellLineIncidence: Object.freeze({
    minimum: Math.min(...incidentCounts),
    maximum: Math.max(...incidentCounts),
    mean: incidentCounts.reduce((a, b) => a + b, 0) / incidentCounts.length,
  }),
  best: results[0],
  results,
}, null, 2));
