#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CENSUS = fileURLToPath(new URL('./quotient-standard7x6-proof-frontier-census.mjs', import.meta.url));
const STATE_CAP = Number(process.env.RANK5_STATE_CAP ?? 100000);
if (!Number.isSafeInteger(STATE_CAP) || STATE_CAP < 10000) throw new RangeError(`RANK5_STATE_CAP invalid: ${STATE_CAP}`);

class CapHit extends Error {}

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

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`replay crossed terminal/illegal edge at ${sequence}`);
    stateId = child;
  }
  return stateId;
}

function rankOf(kernel, stateId) {
  return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId));
}

function legalColumns(kernel, stateId) {
  const support = kernel.states.supportAt(stateId);
  const result = [];
  for (let column = 0; column < DOMAIN.columns; column += 1) {
    if (kernel.supportAccess.landingAt(support, column) !== 0xff) result.push(column);
  }
  return result;
}

function cappedAdvance(kernel, stateId, column) {
  const child = kernel.advance(stateId, column);
  if (kernel.states.count > STATE_CAP) throw new CapHit(`state cap ${STATE_CAP} exceeded`);
  return child;
}

function isImmediateWin(kernel, stateId) {
  if ((rankOf(kernel, stateId) & 1) !== 0) return false;
  for (const column of legalColumns(kernel, stateId)) {
    if (cappedAdvance(kernel, stateId, column) === domain.QN_TERMINAL_WIN) return true;
  }
  return false;
}

function isOverloadLeaf(kernel, stateId) {
  if ((rankOf(kernel, stateId) & 1) !== 1) return false;
  const legal = legalColumns(kernel, stateId);
  if (legal.length === 0) return false;
  for (const column of legal) {
    const child = cappedAdvance(kernel, stateId, column);
    if (child === domain.QN_TERMINAL_WIN || child < 0) return false;
    if (!isImmediateWin(kernel, child)) return false;
  }
  return true;
}

const immediateMemo = new Map();
const overloadMemo = new Map();
const rank3Memo = new Map();

function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  const value = isImmediateWin(kernel, stateId);
  immediateMemo.set(stateId, value);
  return value;
}

function overload(kernel, stateId) {
  if (overloadMemo.has(stateId)) return overloadMemo.get(stateId);
  const value = isOverloadLeaf(kernel, stateId);
  overloadMemo.set(stateId, value);
  return value;
}

function moveToOverload(kernel, stateId) {
  for (const column of legalColumns(kernel, stateId)) {
    const child = cappedAdvance(kernel, stateId, column);
    if (child >= 0 && overload(kernel, child)) return { column, child };
  }
  return null;
}

function proveP0Rank3(kernel, stateId) {
  if (rank3Memo.has(stateId)) return rank3Memo.get(stateId);
  if ((rankOf(kernel, stateId) & 1) !== 0) throw new Error('proveP0Rank3 requires P0-to-move state');

  if (immediate(kernel, stateId)) {
    const proof = Object.freeze({ expression: 'I', grammarRank: 0 });
    rank3Memo.set(stateId, proof);
    return proof;
  }

  const direct = moveToOverload(kernel, stateId);
  if (direct) {
    const proof = Object.freeze({ expression: 'E(O)', grammarRank: 1, rootColumn: direct.column });
    rank3Memo.set(stateId, proof);
    return proof;
  }

  for (const rootColumn of legalColumns(kernel, stateId)) {
    const defender = cappedAdvance(kernel, stateId, rootColumn);
    if (defender < 0) continue;
    const kinds = [];
    let valid = true;
    for (const defenderColumn of legalColumns(kernel, defender)) {
      const attacker = cappedAdvance(kernel, defender, defenderColumn);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) {
        valid = false;
        break;
      }
      if (immediate(kernel, attacker)) {
        kinds.push('I');
        continue;
      }
      const response = moveToOverload(kernel, attacker);
      if (!response) {
        valid = false;
        break;
      }
      kinds.push('E(O)');
    }
    if (!valid) continue;
    const normalized = [...new Set(kinds)].sort();
    const expression = `E(A(${normalized.join('|')}))`;
    const proof = Object.freeze({ expression, grammarRank: 3, rootColumn });
    rank3Memo.set(stateId, proof);
    return proof;
  }

  rank3Memo.set(stateId, null);
  return null;
}

function proveP0Rank5(kernel, stateId) {
  const shallow = proveP0Rank3(kernel, stateId);
  if (shallow) return shallow;

  for (const rootColumn of legalColumns(kernel, stateId)) {
    const defender = cappedAdvance(kernel, stateId, rootColumn);
    if (defender < 0) continue;
    const childProofs = [];
    let valid = true;
    for (const defenderColumn of legalColumns(kernel, defender)) {
      const attacker = cappedAdvance(kernel, defender, defenderColumn);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) {
        valid = false;
        break;
      }
      const childProof = proveP0Rank3(kernel, attacker);
      if (!childProof) {
        valid = false;
        break;
      }
      childProofs.push(childProof);
    }
    if (!valid) continue;
    const normalized = [...new Set(childProofs.map(proof => proof.expression))].sort();
    const maximumChildRank = Math.max(...childProofs.map(proof => proof.grammarRank));
    const grammarRank = 2 + maximumChildRank;
    const expression = `E(A(${normalized.join('|')}))`;
    return Object.freeze({ expression, grammarRank, rootColumn, normalizedArity: normalized.length });
  }
  return null;
}

const census = runCensus();
if (census.frontierDepth !== 8) throw new Error(`expected depth-8 census, got ${census.frontierDepth}`);
const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: Math.max(131072, STATE_CAP + 4096), classes: 1048576, chunksPerSlot: Math.max(131072, STATE_CAP + 4096) }),
});
kernel.prepareSearchStorage();

const recursiveRoots = [];
try {
  for (const representative of census.representativeQuotientStates) {
    const stateId = replay(kernel, representative.sequence);
    if (immediate(kernel, stateId)) continue;
    recursiveRoots.push({ stateId, sequence: representative.sequence });
  }
} catch (error) {
  if (error instanceof CapHit) throw new Error('state cap hit while reconstructing the source frontier; increase cap');
  throw error;
}
if (recursiveRoots.length !== 822) throw new Error(`expected 822 recursive roots, got ${recursiveRoots.length}`);

let capHit = false;
let processedRoots = 0;
let rank1 = 0;
let rank3 = 0;
let rank5 = 0;
let unresolvedProcessed = 0;
let maxRank5Arity = 0;
const expressionHistogram = new Map();
const newRank5Examples = [];
const unresolvedExamples = [];

for (const root of recursiveRoots) {
  try {
    const proof = proveP0Rank5(kernel, root.stateId);
    processedRoots += 1;
    if (!proof) {
      unresolvedProcessed += 1;
      if (unresolvedExamples.length < 40) unresolvedExamples.push(root.sequence);
      continue;
    }
    if (proof.grammarRank <= 1) rank1 += 1;
    else if (proof.grammarRank <= 3) rank3 += 1;
    else {
      rank5 += 1;
      maxRank5Arity = Math.max(maxRank5Arity, proof.normalizedArity ?? 0);
      if (newRank5Examples.length < 40) {
        newRank5Examples.push({
          sequence: root.sequence,
          expression: proof.expression,
          grammarRank: proof.grammarRank,
          rootMove: proof.rootColumn + 1,
          normalizedArity: proof.normalizedArity,
        });
      }
    }
    expressionHistogram.set(proof.expression, (expressionHistogram.get(proof.expression) ?? 0) + 1);
  } catch (error) {
    if (error instanceof CapHit) {
      capHit = true;
      break;
    }
    throw error;
  }
}

const provenProcessed = rank1 + rank3 + rank5;
console.log(`LOCAL_PROOF_RANK5=${JSON.stringify({
  kind: 'standard7x6-depth8-local-proof-rank5-pilot-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  recursiveRoots: recursiveRoots.length,
  stateCap: STATE_CAP,
  capHit,
  materializedQStates: kernel.states.count,
  processedRoots,
  unprocessedRootsDueToCap: recursiveRoots.length - processedRoots,
  structurallyProvenProcessedRoots: provenProcessed,
  unresolvedProcessedRoots: unresolvedProcessed,
  rankOneRoots: rank1,
  rankThreeRoots: rank3,
  newRankFiveRoots: rank5,
  processedClosureFraction: processedRoots ? provenProcessed / processedRoots : 0,
  completeClosureFractionIfNoCap: capHit ? null : provenProcessed / recursiveRoots.length,
  maxRankFiveNormalizedArity: maxRank5Arity,
  expressionHistogram: [...expressionHistogram.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([expression, states]) => ({ expression, states })),
  newRankFiveExamples,
  unresolvedExamples,
  proofAuthority: 'All reported proofs use only legal C4-0010 transitions and structural I/O/E/A closure. The pinned oracle is used only by the upstream source-frontier constructor and is not consulted by rank-1/rank-3/rank-5 proof selection.',
  theoremStatus: capHit
    ? 'bounded lower-bound pilot: closed roots are valid structural proofs, but unprocessed roots remain unclassified because the hard state cap stopped expansion'
    : 'complete census for the declared local grammar through rank 5 over all 822 source recursive roots; unresolved roots remain unknown beyond this grammar',
})}`);
