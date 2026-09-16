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

function intersectionSize(left, right) {
  return popcount32((left[0] & right[0]) >>> 0) + popcount32((left[1] & right[1]) >>> 0);
}

function setCell(pair, cell) {
  if (cell < 32) pair[0] = (pair[0] | ((2 ** cell) >>> 0)) >>> 0;
  else pair[1] = (pair[1] | ((2 ** (cell - 32)) >>> 0)) >>> 0;
}

function reflectTerm(term) {
  const reflected = [0, 0];
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    if (!hasCell(term, cell)) continue;
    const row = Math.floor(cell / DOMAIN.columns);
    const column = cell % DOMAIN.columns;
    setCell(reflected, row * DOMAIN.columns + (DOMAIN.columns - 1 - column));
  }
  return reflected;
}

function normalizedTermKey(terms, reflect = false) {
  const normalized = terms.map(term => reflect ? reflectTerm(term) : [term[0] >>> 0, term[1] >>> 0]);
  normalized.sort((left, right) => {
    const sizeDelta = termSize(left) - termSize(right);
    if (sizeDelta !== 0) return sizeDelta;
    const hiDelta = (left[1] >>> 0) - (right[1] >>> 0);
    if (hiDelta !== 0) return hiDelta;
    return (left[0] >>> 0) - (right[0] >>> 0);
  });
  return normalized.map(term => `${(term[0] >>> 0).toString(16)}.${(term[1] >>> 0).toString(16)}`).join(',');
}

function mirrorMask(mask) {
  let result = 0;
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if ((mask & (1 << column)) !== 0) result |= 1 << (DOMAIN.columns - 1 - column);
  }
  return result;
}

function histogram(values, maximum) {
  const bins = new Array(maximum + 1).fill(0);
  for (const value of values) {
    if (value < 0 || value > maximum) throw new RangeError(`histogram value ${value} outside 0..${maximum}`);
    bins[value] += 1;
  }
  return bins.join('.');
}

function termSizeHistogram(terms) {
  return histogram(terms.map(termSize), DOMAIN.connect);
}

function supportHeights(kernel, stateId) {
  const supportIndex = kernel.states.supportAt(stateId);
  const heights = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    const landing = kernel.supportAccess.landingAt(supportIndex, column);
    heights.push(landing === 0xff ? DOMAIN.rows : Math.floor(landing / DOMAIN.columns));
  }
  return heights;
}

function stateTerms(kernel, stateId) {
  return Object.freeze({
    p0: kernel.classes.terms(kernel.states.p0At(stateId)),
    p1: kernel.classes.terms(kernel.states.p1At(stateId)),
  });
}

function landingCells(kernel, stateId) {
  const supportIndex = kernel.states.supportAt(stateId);
  const cells = new Array(DOMAIN.columns).fill(0xff);
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    cells[column] = kernel.supportAccess.landingAt(supportIndex, column);
  }
  return cells;
}

function landingMask(term, landings) {
  let mask = 0;
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    const cell = landings[column];
    if (cell !== 0xff && hasCell(term, cell)) mask |= 1 << column;
  }
  return mask;
}

function supportDelays(term, heights) {
  const delays = [];
  for (let cell = 0; cell < CELL_COUNT; cell += 1) {
    if (!hasCell(term, cell)) continue;
    const row = Math.floor(cell / DOMAIN.columns);
    const column = cell % DOMAIN.columns;
    const delay = row - heights[column];
    if (delay < 0) throw new Error(`residual term contains occupied cell ${cell}`);
    delays.push(delay);
  }
  delays.sort((a, b) => a - b);
  return delays.join('.');
}

function overlapHistogram(term, terms, selfIndex = -1) {
  const overlaps = [];
  for (let index = 0; index < terms.length; index += 1) {
    if (index === selfIndex) continue;
    overlaps.push(intersectionSize(term, terms[index]));
  }
  return histogram(overlaps, DOMAIN.connect);
}

function termDescriptors(own, opponent, heights, landings, reflect = false) {
  const descriptors = [];
  for (let index = 0; index < own.length; index += 1) {
    const term = own[index];
    let mask = landingMask(term, landings);
    if (reflect) mask = mirrorMask(mask);
    descriptors.push([
      termSize(term),
      mask.toString(16),
      supportDelays(term, heights),
      overlapHistogram(term, own, index),
      overlapHistogram(term, opponent),
    ].join(':'));
  }
  descriptors.sort();
  return descriptors.join(',');
}

function crossOverlapProfile(p0, p1) {
  const keys = [];
  for (const left of p0) {
    for (const right of p1) keys.push(`${termSize(left)}.${termSize(right)}.${intersectionSize(left, right)}`);
  }
  keys.sort();
  return keys.join(',');
}

function canonicalReflection(forward, reflected) {
  return forward <= reflected ? forward : reflected;
}

function baseSignatures(kernel, stateId) {
  const heights = supportHeights(kernel, stateId);
  const reverseHeights = [...heights].reverse();
  const landings = landingCells(kernel, stateId);
  const { p0, p1 } = stateTerms(kernel, stateId);
  const support = canonicalReflection(heights.join('.'), reverseHeights.join('.'));
  const sizes = `${support}|0:${termSizeHistogram(p0)}|1:${termSizeHistogram(p1)}`;

  const incidenceForward = `${heights.join('.')}|0:${p0.map(term => `${termSize(term)}:${landingMask(term, landings).toString(16)}`).sort().join(',')}|1:${p1.map(term => `${termSize(term)}:${landingMask(term, landings).toString(16)}`).sort().join(',')}`;
  const incidenceReflected = `${reverseHeights.join('.')}|0:${p0.map(term => `${termSize(term)}:${mirrorMask(landingMask(term, landings)).toString(16)}`).sort().join(',')}|1:${p1.map(term => `${termSize(term)}:${mirrorMask(landingMask(term, landings)).toString(16)}`).sort().join(',')}`;
  const incidence = canonicalReflection(incidenceForward, incidenceReflected);

  const dependencyForward = `${heights.join('.')}|0:${termDescriptors(p0, p1, heights, landings, false)}|1:${termDescriptors(p1, p0, heights, landings, false)}|x:${crossOverlapProfile(p0, p1)}`;
  const dependencyReflected = `${reverseHeights.join('.')}|0:${termDescriptors(p0, p1, heights, landings, true)}|1:${termDescriptors(p1, p0, heights, landings, true)}|x:${crossOverlapProfile(p0, p1)}`;
  const dependency = canonicalReflection(dependencyForward, dependencyReflected);

  const exactForward = `${heights.join('.')}|0:${normalizedTermKey(p0)}|1:${normalizedTermKey(p1)}`;
  const exactReflected = `${reverseHeights.join('.')}|0:${normalizedTermKey(p0, true)}|1:${normalizedTermKey(p1, true)}`;
  const exactQGeometry = canonicalReflection(exactForward, exactReflected);

  return Object.freeze({ support, sizes, incidence, dependency, exactQGeometry });
}

function touchHistogram(terms, cell) {
  const touched = [];
  for (const term of terms) if (hasCell(term, cell)) touched.push(termSize(term));
  return histogram(touched, DOMAIN.connect);
}

function landingEffectVector(kernel, stateId) {
  const landings = landingCells(kernel, stateId);
  const { p0, p1 } = stateTerms(kernel, stateId);
  const effects = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    const cell = landings[column];
    if (cell === 0xff) {
      effects.push('X');
      continue;
    }
    const row = Math.floor(cell / DOMAIN.columns);
    const child = kernel.advance(stateId, column);
    if (!Number.isSafeInteger(child)) throw new Error(`non-integer quotient transition from ${stateId}/${column}`);
    if (child < 0) {
      effects.push(`${row}:t${touchHistogram(p0, cell)}:${touchHistogram(p1, cell)}:T${child}`);
      continue;
    }
    const childTerms = stateTerms(kernel, child);
    effects.push(`${row}:t${touchHistogram(p0, cell)}:${touchHistogram(p1, cell)}:c${termSizeHistogram(childTerms.p0)}:${termSizeHistogram(childTerms.p1)}`);
  }
  return effects;
}

function signatures(kernel, stateId) {
  const base = baseSignatures(kernel, stateId);
  const effects = landingEffectVector(kernel, stateId);
  const effectReflection = canonicalReflection(
    `${base.dependency}|e:${effects.join(',')}`,
    `${base.dependency}|e:${[...effects].reverse().join(',')}`,
  );
  const effectMultiset = `${base.dependency}|m:${[...effects].sort().join(',')}`;
  return Object.freeze({ ...base, effectMultiset, effectReflection });
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

function fnv1a(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function summarize(name, records, selector) {
  const classes = new Map();
  for (const record of records) {
    const key = selector(record);
    let bucket = classes.get(key);
    if (!bucket) {
      bucket = [];
      classes.set(key, bucket);
    }
    bucket.push(record);
  }
  const sizes = [...classes.values()].map(bucket => bucket.length).sort((a, b) => b - a);
  const sizeHistogram = {};
  for (const size of sizes) sizeHistogram[size] = (sizeHistogram[size] ?? 0) + 1;
  const largestClasses = [...classes.entries()]
    .map(([key, bucket]) => ({ key, bucket }))
    .sort((left, right) => right.bucket.length - left.bucket.length || left.key.localeCompare(right.key))
    .slice(0, 12)
    .map(({ key, bucket }) => Object.freeze({
      id: `${fnv1a(key)}:${key.length}`,
      size: bucket.length,
      examples: Object.freeze(bucket.slice(0, 5).map(record => record.sequence)),
    }));
  return Object.freeze({
    name,
    states: records.length,
    classes: classes.size,
    compression: records.length / Math.max(1, classes.size),
    singletonClasses: sizes.filter(size => size === 1).length,
    largestClass: sizes[0] ?? 0,
    classSizeHistogram: Object.freeze(sizeHistogram),
    largestClasses: Object.freeze(largestClasses),
  });
}

function successorProfile(kernel, stateId, selector) {
  const effects = [];
  const supportIndex = kernel.states.supportAt(stateId);
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if (kernel.supportAccess.landingAt(supportIndex, column) === 0xff) continue;
    const child = kernel.advance(stateId, column);
    if (child < 0) effects.push(`T${child}`);
    else effects.push(fnv1a(selector(signatures(kernel, child))));
  }
  effects.sort();
  return effects.join(',');
}

function extensionAudit(kernel, records, field) {
  const parentClasses = new Map();
  for (const record of records) {
    const parentKey = record.signature[field];
    const next = successorProfile(kernel, record.stateId, signature => signature[field]);
    let profiles = parentClasses.get(parentKey);
    if (!profiles) {
      profiles = new Set();
      parentClasses.set(parentKey, profiles);
    }
    profiles.add(next);
  }
  let unstableParentClasses = 0;
  let refinedClasses = 0;
  let maxSuccessorProfiles = 0;
  for (const profiles of parentClasses.values()) {
    refinedClasses += profiles.size;
    maxSuccessorProfiles = Math.max(maxSuccessorProfiles, profiles.size);
    if (profiles.size > 1) unstableParentClasses += 1;
  }
  return Object.freeze({
    field,
    parentClasses: parentClasses.size,
    unstableParentClasses,
    stableParentClasses: parentClasses.size - unstableParentClasses,
    oneStepRefinedClasses: refinedClasses,
    oneStepCompression: records.length / Math.max(1, refinedClasses),
    maxSuccessorProfilesWithinParentClass: maxSuccessorProfiles,
    interpretation: 'discovery audit only: differing successor consequence multisets falsify one-step extension coherence for the coarse parent class',
  });
}

const census = runCensus();
if (census.frontierDepth !== 8) throw new Error(`expected depth-8 census, got ${census.frontierDepth}`);
if (!Array.isArray(census.representativeQuotientStates)) throw new Error('census omitted representative quotient states');

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 262144 }),
});
kernel.prepareSearchStorage();

const recursive = [];
let staticExact = 0;
let immediateWins = 0;
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  const tacticalCode = kernel.tacticalCode(stateId);
  const exact = domain.tacticalExactValue(tacticalCode);
  if (exact !== null) {
    staticExact += 1;
    if (tacticalCode >= domain.TACTICAL_IMMEDIATE_BASE) immediateWins += 1;
    continue;
  }
  recursive.push(Object.freeze({
    stateId,
    sequence: representative.sequence,
    signature: signatures(kernel, stateId),
  }));
}

const partitions = Object.freeze([
  summarize('exact-q-mod-horizontal-reflection', recursive, record => record.signature.exactQGeometry),
  summarize('support-shape', recursive, record => record.signature.support),
  summarize('support-plus-residual-size-profile', recursive, record => record.signature.sizes),
  summarize('support-plus-playable-frontier-incidence', recursive, record => record.signature.incidence),
  summarize('support-plus-wsl-resource-dependency-profile', recursive, record => record.signature.dependency),
  summarize('resource-dependency-plus-landing-effect-multiset', recursive, record => record.signature.effectMultiset),
  summarize('resource-dependency-plus-reflection-preserving-landing-effects', recursive, record => record.signature.effectReflection),
]);

const extensionAudits = Object.freeze([
  extensionAudit(kernel, recursive, 'dependency'),
  extensionAudit(kernel, recursive, 'effectMultiset'),
  extensionAudit(kernel, recursive, 'effectReflection'),
]);

console.log(`RECURSIVE_FRONTIER_ALPHABET=${JSON.stringify({
  kind: 'standard7x6-depth8-recursive-frontier-alphabet-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceCensusKind: census.kind,
  sourceConstruction: census.construction,
  sourceOracleAuthority: census.oracleAuthority,
  sourceFrontierPhysicalStates: census.frontierPhysicalStates,
  sourceQuotientStates: census.quotientStates,
  sourceStaticExactStates: census.staticExactFrontierStates,
  sourceImmediateWinStates: census.immediateWinFrontierStates,
  replayStaticExactStates: staticExact,
  replayImmediateWinStates: immediateWins,
  recursiveStates: recursive.length,
  featureAuthority: 'support + WSL residual antichains + exact quotient transitions only; no deeper exact W/D/L labels enter any coarse signature',
  theoremStatus: 'coarse partitions are discovery predicates, not state equivalences; only exact-q-mod-horizontal-reflection inherits the accepted causal-isomorphism theorem',
  partitions,
  extensionAudits,
  interpretation: {
    goal: 'measure whether the real standard-7x6 ply-8 recursive frontier admits a small structural consequence alphabet without importing the unknown deeper solution',
    falsifier: 'a coarse class that contains multiple one-step successor consequence profiles is not extension-coherent at that abstraction and must be refined or treated only as a theorem predicate',
  },
})}`);
