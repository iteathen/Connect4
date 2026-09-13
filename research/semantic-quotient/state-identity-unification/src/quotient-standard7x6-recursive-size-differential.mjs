#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CELL_COUNT = DOMAIN.columns * DOMAIN.rows;
const CENSUS = fileURLToPath(new URL('./quotient-standard7x6-proof-frontier-census.mjs', import.meta.url));

function runCensus() {
  const child = spawnSync(process.execPath, [CENSUS], {
    env: process.env,
    encoding: 'utf-8',
    timeout: 20 * 60 * 1000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`proof-frontier census failed: ${(child.stderr ?? '').slice(-8000)}`);
  const line = (child.stdout ?? '').split(/\r?\n/).find(value => value.startsWith('PROOF_FRONTIER_CENSUS='));
  if (!line) throw new Error('proof-frontier census did not emit PROOF_FRONTIER_CENSUS');
  return JSON.parse(line.slice('PROOF_FRONTIER_CENSUS='.length));
}

function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function termSize(term) {
  return popcount32(term[0]) + popcount32(term[1]);
}

function hasCell(term, cell) {
  if (cell < 32) return (((term[0] >>> 0) & ((2 ** cell) >>> 0)) >>> 0) !== 0;
  return (((term[1] >>> 0) & ((2 ** (cell - 32)) >>> 0)) >>> 0) !== 0;
}

function setCell(pair, cell) {
  if (cell < 32) pair[0] = (pair[0] | ((2 ** cell) >>> 0)) >>> 0;
  else pair[1] = (pair[1] | ((2 ** (cell - 32)) >>> 0)) >>> 0;
}

function reflectTerm(term) {
  const result = [0, 0];
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    if (!hasCell(term, cell)) continue;
    const row = Math.floor(cell / DOMAIN.columns);
    const column = cell % DOMAIN.columns;
    setCell(result, row * DOMAIN.columns + (DOMAIN.columns - 1 - column));
  }
  return result;
}

function normalizedTerms(terms, reflect = false) {
  const copy = terms.map(term => reflect ? reflectTerm(term) : [term[0] >>> 0, term[1] >>> 0]);
  copy.sort((left, right) => {
    const sizeDelta = termSize(left) - termSize(right);
    if (sizeDelta !== 0) return sizeDelta;
    const hiDelta = (left[1] >>> 0) - (right[1] >>> 0);
    if (hiDelta !== 0) return hiDelta;
    return (left[0] >>> 0) - (right[0] >>> 0);
  });
  return copy.map(term => `${(term[0] >>> 0).toString(16)}.${(term[1] >>> 0).toString(16)}`).join(',');
}

function heights(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const result = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    const landing = kernel.supportAccess.landingAt(support, column);
    result.push(landing === 0xff ? DOMAIN.rows : Math.floor(landing / DOMAIN.columns));
  }
  return result;
}

function sizeHistogram(terms) {
  const bins = new Array(DOMAIN.connect + 1).fill(0);
  for (const term of terms) bins[termSize(term)] += 1;
  return bins.join('.');
}

function stateTerms(kernel, stateId) {
  return {
    p0: kernel.classes.terms(kernel.states.p0At(stateId)),
    p1: kernel.classes.terms(kernel.states.p1At(stateId)),
  };
}

function canonical(left, right) {
  return left <= right ? left : right;
}

function signatures(kernel, stateId) {
  const hs = heights(kernel, stateId);
  const reversed = [...hs].reverse();
  const { p0, p1 } = stateTerms(kernel, stateId);
  const support = canonical(hs.join('.'), reversed.join('.'));
  const sizes = `${support}|0:${sizeHistogram(p0)}|1:${sizeHistogram(p1)}`;
  const exact = canonical(
    `${hs.join('.')}|0:${normalizedTerms(p0)}|1:${normalizedTerms(p1)}`,
    `${reversed.join('.')}|0:${normalizedTerms(p0, true)}|1:${normalizedTerms(p1, true)}`,
  );
  return { support, sizes, exact };
}

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`replay crossed terminal/illegal edge at ${sequence}`);
    stateId = child;
  }
  return stateId;
}

function successorProfile(kernel, stateId, field) {
  const support = kernel.states.supportAt(stateId);
  const children = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if (kernel.supportAccess.landingAt(support, column) === 0xff) continue;
    const child = kernel.advance(stateId, column);
    if (child < 0) children.push(`T${child}`);
    else children.push(signatures(kernel, child)[field]);
  }
  children.sort();
  return children.join('||');
}

function shortHash(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193) >>> 0;
  return hash.toString(16).padStart(8, '0');
}

function audit(records, field) {
  const classes = new Map();
  for (const record of records) {
    const key = record.signature[field];
    let bucket = classes.get(key);
    if (!bucket) {
      bucket = [];
      classes.set(key, bucket);
    }
    bucket.push(record);
  }

  let refinedClasses = 0;
  let unstableClasses = 0;
  let mixedExactClasses = 0;
  let maxExactClasses = 0;
  let maxSuccessorProfiles = 0;
  const differentials = [];
  for (const [key, bucket] of classes) {
    const exact = new Map();
    const successors = new Map();
    for (const record of bucket) {
      let exactBucket = exact.get(record.signature.exact);
      if (!exactBucket) {
        exactBucket = [];
        exact.set(record.signature.exact, exactBucket);
      }
      exactBucket.push(record.sequence);

      const next = successorProfile(record.kernel, record.stateId, field);
      let nextBucket = successors.get(next);
      if (!nextBucket) {
        nextBucket = [];
        successors.set(next, nextBucket);
      }
      nextBucket.push(record.sequence);
    }
    refinedClasses += successors.size;
    maxExactClasses = Math.max(maxExactClasses, exact.size);
    maxSuccessorProfiles = Math.max(maxSuccessorProfiles, successors.size);
    if (exact.size > 1) mixedExactClasses += 1;
    if (successors.size > 1) unstableClasses += 1;
    if (exact.size > 1 || successors.size > 1) {
      differentials.push({
        classId: `${shortHash(key)}:${key.length}`,
        states: bucket.length,
        exactQReflectionClasses: exact.size,
        successorProfiles: successors.size,
        exactGroups: [...exact.entries()].map(([exactKey, sequences]) => ({
          exactId: `${shortHash(exactKey)}:${exactKey.length}`,
          sequences: sequences.slice(0, 8),
        })),
        successorGroups: [...successors.values()].map(sequences => sequences.slice(0, 8)),
      });
    }
  }
  differentials.sort((left, right) =>
    right.exactQReflectionClasses - left.exactQReflectionClasses
    || right.successorProfiles - left.successorProfiles
    || right.states - left.states
    || left.classId.localeCompare(right.classId));

  return {
    field,
    states: records.length,
    classes: classes.size,
    mixedExactClasses,
    stableAgainstExactQReflectionClasses: classes.size - mixedExactClasses,
    maxExactQReflectionClassesWithinClass: maxExactClasses,
    unstableOneStepClasses: unstableClasses,
    stableOneStepClasses: classes.size - unstableClasses,
    oneStepRefinedClasses: refinedClasses,
    oneStepCompression: records.length / Math.max(1, refinedClasses),
    maxSuccessorProfilesWithinClass: maxSuccessorProfiles,
    differentials: differentials.slice(0, 40),
  };
}

const census = runCensus();
if (census.frontierDepth !== 8) throw new Error(`expected depth-8 census, got ${census.frontierDepth}`);
const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 262144 }),
});
kernel.prepareSearchStorage();

const recursive = [];
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  if (domain.tacticalExactValue(kernel.tacticalCode(stateId)) !== null) continue;
  recursive.push({ kernel, stateId, sequence: representative.sequence, signature: signatures(kernel, stateId) });
}

const exactClasses = new Set(recursive.map(record => record.signature.exact));
const result = {
  kind: 'standard7x6-depth8-recursive-size-differential-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceFrontierPhysicalStates: census.frontierPhysicalStates,
  recursiveStates: recursive.length,
  exactQModuloReflectionClasses: exactClasses.size,
  audits: [audit(recursive, 'support'), audit(recursive, 'sizes')],
  interpretation: {
    purpose: 'isolate whether the apparent compression below exact q/reflection survives one exact quotient transition',
    authority: 'support and WSL residual classes only; no deeper exact W/D/L labels are used',
    theoremStatus: 'discovery/falsification control only; a stable one-step coarse class is still not a proven recursive equivalence',
  },
};
console.log(`RECURSIVE_SIZE_DIFFERENTIAL=${JSON.stringify(result)}`);
