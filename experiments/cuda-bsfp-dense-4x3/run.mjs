import assert from 'node:assert/strict';

import { openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import {
  BSFP_4X3_CONNECT3_DENSE_PROFILE as PROFILE,
  decodeBsfpWdlU32,
} from '../../components/bsfp/index.mjs';
import { createDenseBsfp4x3WdlPlan } from '../../components/bsfp/cuda/index.mjs';

const U32_BYTES = 4;
const COLUMNS = 4;
const ROWS = 3;
const CONNECT = 3;
const CELL_COUNT = COLUMNS * ROWS;
const CUDA_JS_REVISION = '98e2ebc942c14d63acf4dd82e912dd548c363a05';

function encodeU32(values) {
  const bytes = new Uint8Array(values.length * U32_BYTES);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) throw new RangeError(`u32 value out of range at ${index}`);
    view.setUint32(index * U32_BYTES, value, true);
  }
  return bytes;
}

async function allocateU32(runtime, count, access = 'read-write') {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError('allocation count must be a positive safe integer');
  const memory = await runtime.allocateDevice({ byteLength: count * U32_BYTES });
  const view = await memory.view({ dtype: 'u32', elementCount: count, access });
  return { memory, view, count };
}

async function writeU32(allocation, values) {
  if (values.length > allocation.count) throw new RangeError('fixture write exceeds allocation');
  await allocation.memory.write(encodeU32(values));
}

async function closeAllocation(allocation) {
  await allocation.view.close();
  await allocation.memory.close();
}

function cellIndex(column, row) {
  return row * COLUMNS + column;
}

function hasWinFrom(cells, column, row, player) {
  const encoded = player + 1;
  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (const [dc, dr] of directions) {
    let count = 1;
    for (const sign of [-1, 1]) {
      let c = column + dc * sign;
      let r = row + dr * sign;
      while (c >= 0 && c < COLUMNS && r >= 0 && r < ROWS && cells[cellIndex(c, r)] === encoded) {
        count += 1;
        c += dc * sign;
        r += dr * sign;
      }
    }
    if (count >= CONNECT) return true;
  }
  return false;
}

function stateKey(cells, sideToMove) {
  return `${sideToMove}:${Array.from(cells).join('')}`;
}

function createIndependentOracle() {
  const memo = new Map();

  function solve(cells, heights, sideToMove, ply) {
    const key = stateKey(cells, sideToMove);
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    let best = sideToMove === 0 ? -1 : 1;
    let hasMove = false;
    for (let column = 0; column < COLUMNS; column += 1) {
      const row = heights[column];
      if (row >= ROWS) continue;
      hasMove = true;
      cells[cellIndex(column, row)] = sideToMove + 1;
      heights[column] += 1;

      let value;
      if (hasWinFrom(cells, column, row, sideToMove)) value = sideToMove === 0 ? 1 : -1;
      else if (ply + 1 === CELL_COUNT) value = 0;
      else value = solve(cells, heights, 1 - sideToMove, ply + 1);

      heights[column] -= 1;
      cells[cellIndex(column, row)] = 0;
      if (sideToMove === 0) best = Math.max(best, value);
      else best = Math.min(best, value);
    }

    if (!hasMove) best = 0;
    memo.set(key, best);
    return best;
  }

  return { solve };
}

function ownershipMask(cells) {
  let mask = 0;
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    if (cells[cell] === 2) mask = (mask | (1 << cell)) >>> 0;
  }
  return mask;
}

async function readTable(allocation) {
  const result = await allocation.memory.read({ byteLength: PROFILE.tableBytes });
  return new DataView(result.bytes.buffer, result.bytes.byteOffset, result.bytes.byteLength);
}

function tableValue(tableView, supportIndex, assignmentMask) {
  const element = supportIndex * PROFILE.assignmentCount + assignmentMask;
  return tableView.getUint32(element * U32_BYTES, true);
}

function qualifyNativeTable(tableView) {
  const oracle = createIndependentOracle();
  const cells = new Uint8Array(CELL_COUNT);
  const heights = new Uint8Array(COLUMNS);
  const visited = new Set();
  let checkedStates = 0;
  let legalEdges = 0;

  function visit(sideToMove, ply) {
    const key = stateKey(cells, sideToMove);
    if (visited.has(key)) return;
    visited.add(key);

    const expected = oracle.solve(cells, heights, sideToMove, ply);
    const supportIndex = PROFILE.support.encodeHeights(Array.from(heights));
    const assignmentMask = ownershipMask(cells);
    const encodedActual = tableValue(tableView, supportIndex, assignmentMask);
    const actual = decodeBsfpWdlU32(encodedActual);
    assert.equal(actual, expected, `dense GPU WDL mismatch at ${key}`);
    checkedStates += 1;

    for (let column = 0; column < COLUMNS; column += 1) {
      const row = heights[column];
      if (row >= ROWS) continue;
      legalEdges += 1;
      cells[cellIndex(column, row)] = sideToMove + 1;
      heights[column] += 1;
      const terminalWin = hasWinFrom(cells, column, row, sideToMove);
      const terminalDraw = !terminalWin && ply + 1 === CELL_COUNT;
      if (!terminalWin && !terminalDraw) visit(1 - sideToMove, ply + 1);
      heights[column] -= 1;
      cells[cellIndex(column, row)] = 0;
    }
  }

  visit(0, 0);
  const rootEncoded = tableValue(tableView, 0, 0);
  const rootWdl = decodeBsfpWdlU32(rootEncoded);
  assert.equal(rootWdl, 1);
  assert.equal(checkedStates, 4631);
  assert.equal(legalEdges, 11818);

  return { checkedStates, legalEdges, rootWdl };
}

async function qualify(runtime, native) {
  const plan = await createDenseBsfp4x3WdlPlan(runtime, { blockSize: 128 });
  const allocations = [];
  let operation;

  try {
    const table = await allocateU32(runtime, PROFILE.tableElements, 'read-write');
    const ranks = await allocateU32(runtime, PROFILE.support.itemCapacity, 'read');
    const filledMasks = await allocateU32(runtime, PROFILE.support.itemCapacity, 'read');
    const lineMasks = await allocateU32(runtime, PROFILE.winningLineMasks.length, 'read');
    allocations.push(table, ranks, filledMasks, lineMasks);

    await writeU32(ranks, Array.from(PROFILE.ranks));
    await writeU32(filledMasks, Array.from(PROFILE.filledMasks));
    await writeU32(lineMasks, Array.from(PROFILE.winningLineMasks));

    operation = await plan.submit({
      table: table.view,
      ranks: ranks.view,
      filledMasks: filledMasks.view,
      lineMasks: lineMasks.view,
    });
    const terminal = await operation.wait();
    assert.equal(terminal.status, 'completed');
    assert.equal(terminal.kind, 'prepared-batch');
    assert.equal(terminal.nodeCount, 13);

    const result = {
      schemaVersion: 1,
      kind: 'connect4-cuda-bsfp-dense-4x3-wdl-qualification',
      mode: native ? 'native' : 'portable',
      cudaJsRevision: CUDA_JS_REVISION,
      planContract: plan.contract,
      tableElements: PROFILE.tableElements,
      tableBytes: PROFILE.tableBytes,
      supportSkeletons: PROFILE.support.itemCapacity,
      assignmentCount: PROFILE.assignmentCount,
      winningLines: PROFILE.winningLineMasks.length,
      preparedNodeCount: plan.realization.preparedNodeCount,
    };

    if (native) {
      const tableView = await readTable(table);
      Object.assign(result, qualifyNativeTable(tableView));
      result.outcome = 'native-exhaustive-wdl-pass';
    } else {
      result.outcome = 'portable-compile-submit-pass';
    }

    return result;
  } finally {
    if (operation) await operation.close();
    await plan.close();
    for (let index = allocations.length - 1; index >= 0; index -= 1) await closeAllocation(allocations[index]);
  }
}

const mode = process.argv[2] ?? 'portable';
if (!['portable', 'native'].includes(mode)) throw new RangeError('mode must be portable or native');

let runtime;
try {
  runtime = mode === 'native'
    ? await openCudaRuntime({ compiler: true })
    : await openCudaRuntimeForTesting({ compiler: true });
  const result = await qualify(runtime, mode === 'native');
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (runtime) {
    const closed = await runtime.close();
    assert.equal(closed.graceful, true);
  }
}
