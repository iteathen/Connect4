import { performance } from 'node:perf_hooks';

import {
  TensorPlan,
  TensorProgram,
  TensorSession,
  resolveTensorPlan,
} from 'cuda-js-tensor';

const BOARD_CELLS = 42;
const TWO32 = 0x1_0000_0000;
const DEFAULT_CANDIDATE_TILE = 256;
const DEFAULT_REFERENCE_TILE = 1024;
const DEFAULT_MAX_WORKSPACE_BYTES = 128 * 1024 * 1024;

function positiveSafeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${label} must be a positive safe integer`);
  return value;
}

function normalizeDirection(value) {
  if (value === 0 || value === 'minimal' || value === 'or') return 'minimal';
  if (value === 1 || value === 'maximal' || value === 'and') return 'maximal';
  throw new RangeError('Tensor overflow direction must be minimal/or or maximal/and');
}

function popcount32(value) {
  let v = value >>> 0;
  let count = 0;
  while (v !== 0) {
    v = (v & (v - 1)) >>> 0;
    count += 1;
  }
  return count;
}

function pack42(low, high) {
  return (low >>> 0) + (high >>> 0) * TWO32;
}

function hasBit(low, high, cell) {
  if (cell < 32) return ((low >>> cell) & 1) !== 0;
  return (((high >>> 0) >>> (cell - 32)) & 1) !== 0;
}

function f32Bytes(values) {
  return new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
}

function readF32(bytes) {
  const copy = Uint8Array.from(bytes);
  return new Float32Array(copy.buffer, copy.byteOffset, copy.byteLength / 4);
}

function dominanceProgram(direction, candidateTile, referenceTile) {
  return TensorProgram.define((graph) => {
    const candidates = graph.input('candidates', {
      dtype: 'f32',
      capacityShape: [candidateTile, BOARD_CELLS],
      access: 'read',
    });
    const referencesTransposed = graph.input('referencesTransposed', {
      dtype: 'f32',
      capacityShape: [BOARD_CELLS, referenceTile],
      access: 'read',
    });
    const referenceActive = graph.input('referenceActive', {
      dtype: 'f32',
      capacityShape: [referenceTile],
      access: 'read',
    });
    const overlap = graph.matmul(candidates, referencesTransposed);
    const subsetCardinality = direction === 'minimal'
      ? graph.input('referencePopcounts', {
        dtype: 'f32',
        capacityShape: [referenceTile],
        access: 'read',
      })
      : graph.input('candidatePopcounts', {
        dtype: 'f32',
        capacityShape: [candidateTile, 1],
        access: 'read',
      });
    const ones = graph.fill({
      dtype: 'f32',
      capacityShape: [candidateTile, referenceTile],
      access: 'read-write',
    }, 1);
    const deficit = graph.binary('sub', subsetCardinality, overlap);
    const nonZero = graph.binary('minimum', deficit, ones);
    const subset = graph.binary('sub', ones, nonZero);
    const activeSubset = graph.binary('mul', subset, referenceActive);
    const dominated = graph.reduce('maximum', activeSubset, {
      axes: [1],
      order: 'fixed-tree-v1',
    });
    return { dominated };
  });
}

async function allocateInputF32(session, shape) {
  const writable = await session.allocate({ dtype: 'f32', capacityShape: shape, access: 'read-write' });
  try {
    const input = await writable.view({ dtype: 'f32', capacityShape: shape, access: 'read' });
    return Object.freeze({
      writable,
      input,
      async close() {
        await input.close();
        await writable.close();
      },
    });
  } catch (error) {
    await writable.close();
    throw error;
  }
}

async function createDirectionContext(session, direction, options) {
  const program = dominanceProgram(direction, options.candidateTile, options.referenceTile);
  const plan = TensorPlan.create(program);
  const resolved = await resolveTensorPlan(session, plan, {
    backend: options.backend,
    fusion: 'exact-elementwise',
    maxWorkspaceBytes: options.maxWorkspaceBytes,
  });
  const candidates = await allocateInputF32(session, [options.candidateTile, BOARD_CELLS]);
  const referencesTransposed = await allocateInputF32(session, [BOARD_CELLS, options.referenceTile]);
  const referenceActive = await allocateInputF32(session, [options.referenceTile]);
  const referencePopcounts = direction === 'minimal' ? await allocateInputF32(session, [options.referenceTile]) : null;
  const candidatePopcounts = direction === 'maximal' ? await allocateInputF32(session, [options.candidateTile, 1]) : null;
  return {
    direction,
    resolved,
    candidates,
    referencesTransposed,
    referenceActive,
    referencePopcounts,
    candidatePopcounts,
    async close() {
      if (candidatePopcounts) await candidatePopcounts.close();
      if (referencePopcounts) await referencePopcounts.close();
      await referenceActive.close();
      await referencesTransposed.close();
      await candidates.close();
      await resolved.close();
    },
  };
}

export async function createTensorPacked42OverflowNormalizer(runtime, options = {}) {
  const normalized = Object.freeze({
    candidateTile: positiveSafeInteger(options.candidateTile ?? DEFAULT_CANDIDATE_TILE, 'candidateTile'),
    referenceTile: positiveSafeInteger(options.referenceTile ?? DEFAULT_REFERENCE_TILE, 'referenceTile'),
    maxWorkspaceBytes: positiveSafeInteger(options.maxWorkspaceBytes ?? DEFAULT_MAX_WORKSPACE_BYTES, 'maxWorkspaceBytes'),
    backend: options.backend ?? 'simt',
  });
  if (!['simt', 'prefer-cublaslt', 'cublaslt'].includes(normalized.backend)) throw new RangeError('Tensor overflow backend must be simt, prefer-cublaslt, or cublaslt');

  const session = await TensorSession.open({
    runtime,
    runtimeOwnership: 'borrowed',
    limits: {
      maxTensorBytes: Math.max(128 * 1024 * 1024, normalized.maxWorkspaceBytes),
      maxSessionBytes: Math.max(512 * 1024 * 1024, normalized.maxWorkspaceBytes * 2),
      maxLiveTensors: 2048,
    },
  });
  const contexts = new Map();
  let closed = false;
  const totals = {
    calls: 0,
    candidates: 0,
    uniqueCandidates: 0,
    duplicateCandidatesRemoved: 0,
    candidateTiles: 0,
    referenceTiles: 0,
    comparisonPairs: 0,
    tensorRuns: 0,
    tensorUploadMs: 0,
    tensorExecutionMs: 0,
    tensorReadbackMs: 0,
    maximumFrontier: 0,
  };

  async function context(direction) {
    let result = contexts.get(direction);
    if (!result) {
      result = await createDirectionContext(session, direction, normalized);
      contexts.set(direction, result);
    }
    return result;
  }

  async function runReferenceTile(ctx, activeCandidateCount, frontier, referenceStart) {
    const referenceCount = Math.min(normalized.referenceTile, frontier.length - referenceStart);
    const referencesTransposed = new Float32Array(BOARD_CELLS * normalized.referenceTile);
    const referenceActive = new Float32Array(normalized.referenceTile);
    const referencePopcounts = ctx.direction === 'minimal' ? new Float32Array(normalized.referenceTile) : null;
    for (let r = 0; r < referenceCount; r += 1) {
      const reference = frontier[referenceStart + r];
      referenceActive[r] = 1;
      if (referencePopcounts) referencePopcounts[r] = reference.popcount;
      for (let cell = 0; cell < BOARD_CELLS; cell += 1) {
        if (hasBit(reference.low, reference.high, cell)) referencesTransposed[cell * normalized.referenceTile + r] = 1;
      }
    }

    const uploadStarted = performance.now();
    await ctx.referencesTransposed.writable.write(f32Bytes(referencesTransposed));
    await ctx.referenceActive.writable.write(f32Bytes(referenceActive));
    if (referencePopcounts) await ctx.referencePopcounts.writable.write(f32Bytes(referencePopcounts));
    totals.tensorUploadMs += performance.now() - uploadStarted;

    const bindings = {
      candidates: ctx.candidates.input,
      referencesTransposed: ctx.referencesTransposed.input,
      referenceActive: ctx.referenceActive.input,
      ...(ctx.direction === 'minimal'
        ? { referencePopcounts: ctx.referencePopcounts.input }
        : { candidatePopcounts: ctx.candidatePopcounts.input }),
    };
    const executeStarted = performance.now();
    const result = await ctx.resolved.run(bindings);
    totals.tensorExecutionMs += performance.now() - executeStarted;
    totals.tensorRuns += 1;
    try {
      const readStarted = performance.now();
      const bytes = await result.get('dominated').read();
      const values = readF32(bytes.bytes);
      totals.tensorReadbackMs += performance.now() - readStarted;
      const dominated = new Uint8Array(activeCandidateCount);
      for (let i = 0; i < activeCandidateCount; i += 1) {
        const value = values[i];
        if (value !== 0 && value !== 1) throw new Error(`Tensor overflow dominance escaped exact 0/1 result: ${value}`);
        dominated[i] = value === 1 ? 1 : 0;
      }
      totals.referenceTiles += 1;
      totals.comparisonPairs += activeCandidateCount * referenceCount;
      return dominated;
    } finally {
      await result.close();
    }
  }

  async function compareCandidateTile(ctx, entries, frontier) {
    const candidateRows = new Float32Array(normalized.candidateTile * BOARD_CELLS);
    const candidatePops = ctx.direction === 'maximal' ? new Float32Array(normalized.candidateTile) : null;
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (candidatePops) candidatePops[i] = entry.popcount;
      for (let cell = 0; cell < BOARD_CELLS; cell += 1) {
        if (hasBit(entry.low, entry.high, cell)) candidateRows[i * BOARD_CELLS + cell] = 1;
      }
    }
    const uploadStarted = performance.now();
    await ctx.candidates.writable.write(f32Bytes(candidateRows));
    if (candidatePops) await ctx.candidatePopcounts.writable.write(f32Bytes(candidatePops));
    totals.tensorUploadMs += performance.now() - uploadStarted;
    totals.candidateTiles += 1;

    const dominated = new Uint8Array(entries.length);
    let remaining = entries.length;
    for (let referenceStart = 0; referenceStart < frontier.length && remaining > 0; referenceStart += normalized.referenceTile) {
      const tile = await runReferenceTile(ctx, entries.length, frontier, referenceStart);
      for (let i = 0; i < entries.length; i += 1) {
        if (dominated[i] === 0 && tile[i] !== 0) {
          dominated[i] = 1;
          remaining -= 1;
        }
      }
    }
    return dominated;
  }

  return Object.freeze({
    kind: 'connect4-bsfp-tensor-packed42-overflow-normalizer',
    options: normalized,
    async normalize({ lows, highs, popcounts, direction }) {
      if (closed) throw new Error('Tensor packed42 overflow normalizer is closed');
      if (!(lows instanceof Uint32Array) || !(highs instanceof Uint32Array) || !(popcounts instanceof Uint32Array)) {
        throw new TypeError('Tensor overflow inputs must be Uint32Array packed candidate arrays');
      }
      if (lows.length !== highs.length || lows.length !== popcounts.length) throw new RangeError('Tensor overflow packed candidate arrays must have equal length');
      const normalizedDirection = normalizeDirection(direction);
      const ctx = await context(normalizedDirection);
      totals.calls += 1;
      totals.candidates += lows.length;

      const buckets = Array.from({ length: BOARD_CELLS + 1 }, () => []);
      for (let index = 0; index < lows.length; index += 1) {
        const high = highs[index] >>> 0;
        if ((high & ~0x3ff) !== 0) throw new RangeError(`Tensor overflow candidate ${index} exceeds 42 bits`);
        const popcount = popcounts[index];
        if (!Number.isSafeInteger(popcount) || popcount < 0 || popcount > BOARD_CELLS) throw new RangeError(`Tensor overflow candidate ${index} has invalid popcount ${popcount}`);
        const computed = popcount32(lows[index]) + popcount32(high);
        if (computed !== popcount) throw new Error(`Tensor overflow candidate ${index} popcount mismatch: ${popcount} != ${computed}`);
        buckets[popcount].push(index);
      }

      const phases = normalizedDirection === 'minimal'
        ? Array.from({ length: BOARD_CELLS + 1 }, (_, index) => index)
        : Array.from({ length: BOARD_CELLS + 1 }, (_, index) => BOARD_CELLS - index);
      const frontier = [];
      let uniqueCandidates = 0;
      let duplicates = 0;
      for (const phase of phases) {
        const seen = new Set();
        const unique = [];
        for (const index of buckets[phase]) {
          const low = lows[index] >>> 0;
          const high = highs[index] >>> 0;
          const key = pack42(low, high);
          if (seen.has(key)) {
            duplicates += 1;
            continue;
          }
          seen.add(key);
          unique.push(Object.freeze({ index, low, high, popcount: phase, mask: key }));
        }
        uniqueCandidates += unique.length;
        if (unique.length === 0) continue;
        if (frontier.length === 0) {
          frontier.push(...unique);
          totals.maximumFrontier = Math.max(totals.maximumFrontier, frontier.length);
          continue;
        }
        const accepted = [];
        for (let start = 0; start < unique.length; start += normalized.candidateTile) {
          const tileEntries = unique.slice(start, Math.min(unique.length, start + normalized.candidateTile));
          const dominated = await compareCandidateTile(ctx, tileEntries, frontier);
          for (let i = 0; i < tileEntries.length; i += 1) if (dominated[i] === 0) accepted.push(tileEntries[i]);
        }
        frontier.push(...accepted);
        totals.maximumFrontier = Math.max(totals.maximumFrontier, frontier.length);
      }
      totals.uniqueCandidates += uniqueCandidates;
      totals.duplicateCandidatesRemoved += duplicates;
      const masks = Object.freeze(frontier.map((entry) => entry.mask));
      return Object.freeze({
        frontier: masks,
        stats: Object.freeze({
          inputCandidates: lows.length,
          uniqueCandidates,
          duplicateCandidatesRemoved: duplicates,
          survivingRecords: masks.length,
          maximumFrontier: frontier.length,
        }),
      });
    },
    snapshotStats() { return Object.freeze({ ...totals }); },
    async close() {
      if (closed) return;
      closed = true;
      for (const ctx of [...contexts.values()].reverse()) await ctx.close();
      await session.close();
    },
  });
}
