#!/usr/bin/env node

import { createRealCoverage64CofactorFixture } from './real-cofactor-fixture.mjs';

const BLOCK_SIZE = 256;

function pop32(value) {
  let x = value >>> 0;
  let count = 0;
  while (x !== 0) {
    x &= x - 1;
    count += 1;
  }
  return count;
}

function pop64(value) {
  return pop32(value.lo) + pop32(value.hi);
}

const fixture = createRealCoverage64CofactorFixture();
const segments = [];
let totalInputRecords = 0;
let totalKilled = 0;
let totalRetained = 0;
let totalCoverageBitsRetained = 0;
let totalScalarIdTests = 0;
let totalPreimagePredicates = 0;
let totalFirstWaveActiveLanes = 0;
let totalFirstWaveAllocatedLanes = 0;

for (const segment of fixture.segments) {
  let coverageBitsAll = 0;
  let coverageBitsRetained = 0;
  let retained = 0;
  let killed = 0;

  for (let index = 0; index < segment.input.length; index += 1) {
    const bits = pop64(segment.input[index]);
    coverageBitsAll += bits;
    if (segment.expected[index].keep === 0) {
      killed += 1;
    } else {
      retained += 1;
      coverageBitsRetained += bits;
    }
  }

  const scalarIdTests = retained * fixture.maxDictionary;
  const preimagePredicates = retained * segment.parentDictionary.length;
  const firstWaveActiveLanes = Math.min(BLOCK_SIZE, segment.input.length);
  const firstWaveAllocatedLanes = BLOCK_SIZE;

  segments.push({
    id: segment.id,
    geometry: segment.geometry,
    rank: segment.rank,
    ownerTrue: segment.ownerTrue,
    childDictionarySize: segment.childDictionary.length,
    parentDictionarySize: segment.parentDictionary.length,
    inputRecords: segment.input.length,
    killedRecords: killed,
    retainedRecords: retained,
    killFraction: segment.input.length === 0 ? 0 : killed / segment.input.length,
    meanCoverageBitsAll: segment.input.length === 0 ? 0 : coverageBitsAll / segment.input.length,
    meanCoverageBitsRetained: retained === 0 ? 0 : coverageBitsRetained / retained,
    retainedCoverageDensity: retained === 0 || segment.childDictionary.length === 0 ? 0 : (coverageBitsRetained / retained) / segment.childDictionary.length,
    scalarIdTests,
    basisContributionLoads: coverageBitsRetained,
    parentPreimagePredicates: preimagePredicates,
    preimageToScalarPredicateRatio: scalarIdTests === 0 ? 0 : preimagePredicates / scalarIdTests,
    firstWaveLaneUtilization: firstWaveActiveLanes / firstWaveAllocatedLanes,
  });

  totalInputRecords += segment.input.length;
  totalKilled += killed;
  totalRetained += retained;
  totalCoverageBitsRetained += coverageBitsRetained;
  totalScalarIdTests += scalarIdTests;
  totalPreimagePredicates += preimagePredicates;
  totalFirstWaveActiveLanes += firstWaveActiveLanes;
  totalFirstWaveAllocatedLanes += firstWaveAllocatedLanes;
}

const output = {
  schemaVersion: 1,
  kind: 'connect4-bsfp-coverage-cofactor-work-shape',
  fixtureKind: fixture.fixtureKind,
  currentScalarProfile: {
    blockSize: BLOCK_SIZE,
    maxDictionary: fixture.maxDictionary,
    execution: 'one thread per record; retained record serially scans maxDictionary IDs',
  },
  candidateWarpProfile: {
    execution: 'one warp per retained record; lane evaluates parent-bit preimage predicate; ballot packs result',
    status: 'unimplemented; CUDA-JS warp lane/vote assessment tracked separately',
  },
  segments,
  totals: {
    inputRecords: totalInputRecords,
    killedRecords: totalKilled,
    retainedRecords: totalRetained,
    killFraction: totalInputRecords === 0 ? 0 : totalKilled / totalInputRecords,
    meanCoverageBitsRetained: totalRetained === 0 ? 0 : totalCoverageBitsRetained / totalRetained,
    scalarIdTests: totalScalarIdTests,
    basisContributionLoads: totalCoverageBitsRetained,
    parentPreimagePredicates: totalPreimagePredicates,
    preimageToScalarPredicateRatio: totalScalarIdTests === 0 ? 0 : totalPreimagePredicates / totalScalarIdTests,
    firstWaveLaneUtilization: totalFirstWaveAllocatedLanes === 0 ? 0 : totalFirstWaveActiveLanes / totalFirstWaveAllocatedLanes,
  },
  interpretation: [
    'The preimage form is algebraically equivalent to the basis-image form; this census compares work shape, not runtime.',
    'Current scalar predicate tests include padded maxDictionary IDs; basisContributionLoads counts only selected basis images on retained records.',
    'Warp ballot is a parallelism hypothesis. Native A/B is required before replacing the scalar fallback.',
  ],
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
