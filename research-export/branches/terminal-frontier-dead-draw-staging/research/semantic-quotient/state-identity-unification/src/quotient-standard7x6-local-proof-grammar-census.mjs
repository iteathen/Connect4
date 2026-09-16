#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
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

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) {
      throw new Error(`replay crossed terminal/illegal edge at ${sequence}`);
    }
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

function isImmediateWin(kernel, stateId) {
  if ((rankOf(kernel, stateId) & 1) !== 0) return false;
  for (const column of legalColumns(kernel, stateId)) {
    if (kernel.advance(stateId, column) === domain.QN_TERMINAL_WIN) return true;
  }
  return false;
}

function isOverloadLeaf(kernel, stateId) {
  if ((rankOf(kernel, stateId) & 1) !== 1) return false;
  const legal = legalColumns(kernel, stateId);
  if (legal.length === 0) return false;
  for (const column of legal) {
    const child = kernel.advance(stateId, column);
    if (child === domain.QN_TERMINAL_WIN || child < 0) return false;
    if (!isImmediateWin(kernel, child)) return false;
  }
  return true;
}

function findMoveToOverload(kernel, stateId) {
  if ((rankOf(kernel, stateId) & 1) !== 0) return null;
  for (const column of legalColumns(kernel, stateId)) {
    const child = kernel.advance(stateId, column);
    if (child >= 0 && isOverloadLeaf(kernel, child)) {
      return Object.freeze({ column, child });
    }
  }
  return null;
}

function rankOneProof(kernel, stateId) {
  const witness = findMoveToOverload(kernel, stateId);
  if (!witness) return null;
  return Object.freeze({
    expression: 'E(O)',
    grammarRank: 1,
    rootMove: witness.column,
    universalRawBranches: 0,
    universalConsequenceClasses: 0,
    childKinds: Object.freeze([]),
  });
}

function rankThreeProof(kernel, stateId) {
  if ((rankOf(kernel, stateId) & 1) !== 0) return null;

  for (const rootColumn of legalColumns(kernel, stateId)) {
    const defenderState = kernel.advance(stateId, rootColumn);
    if (defenderState < 0) continue;
    if (isOverloadLeaf(kernel, defenderState)) continue; // rank-one already owns this case.

    const defenderReplies = legalColumns(kernel, defenderState);
    if (defenderReplies.length === 0) continue;

    const childKinds = [];
    const responseWitnesses = [];
    let valid = true;
    for (const defenderColumn of defenderReplies) {
      const attackerState = kernel.advance(defenderState, defenderColumn);
      if (attackerState === domain.QN_TERMINAL_WIN || attackerState < 0) {
        valid = false;
        break;
      }
      if (isImmediateWin(kernel, attackerState)) {
        childKinds.push('I');
        responseWitnesses.push(Object.freeze({ defenderColumn, kind: 'I', attackerColumn: null }));
        continue;
      }
      const response = findMoveToOverload(kernel, attackerState);
      if (!response) {
        valid = false;
        break;
      }
      childKinds.push('E(O)');
      responseWitnesses.push(Object.freeze({
        defenderColumn,
        kind: 'E(O)',
        attackerColumn: response.column,
      }));
    }
    if (!valid) continue;

    const consequenceKinds = [...new Set(childKinds)].sort();
    const aExpression = `A(${consequenceKinds.join('|')})`;
    return Object.freeze({
      expression: `E(${aExpression})`,
      grammarRank: 3,
      rootMove: rootColumn,
      universalRawBranches: childKinds.length,
      universalConsequenceClasses: consequenceKinds.length,
      childKinds: Object.freeze(consequenceKinds),
      responseWitnesses: Object.freeze(responseWitnesses),
    });
  }
  return null;
}

function mirroredSequence(sequence) {
  return [...sequence].map(digit => String(8 - Number(digit))).join('');
}

function canonicalSequence(sequence) {
  const reflected = mirroredSequence(sequence);
  return sequence <= reflected ? sequence : reflected;
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

const roots = [];
let sourceImmediate = 0;
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  if (rankOf(kernel, stateId) !== 8) throw new Error(`rank drift at ${representative.sequence}`);
  if (isImmediateWin(kernel, stateId)) {
    sourceImmediate += 1;
    continue;
  }
  roots.push(Object.freeze({ stateId, sequence: representative.sequence }));
}
if (sourceImmediate !== 319 || roots.length !== 822) {
  throw new Error(`source frontier drift: immediate=${sourceImmediate}, recursive=${roots.length}`);
}

const results = [];
const expressionHistogram = new Map();
const unresolved = [];
let rankOne = 0;
let rankThree = 0;
let rawUniversalBranches = 0;
let normalizedUniversalBranches = 0;
let maxNormalizedArity = 0;
let rankOneWitnessEdges = 0;
let rankThreeRootWitnessEdges = 0;
let rankThreeResponseWitnessEdges = 0;

for (const root of roots) {
  let proof = rankOneProof(kernel, root.stateId);
  if (proof) {
    rankOne += 1;
    rankOneWitnessEdges += 1;
  } else {
    proof = rankThreeProof(kernel, root.stateId);
    if (proof) {
      rankThree += 1;
      rankThreeRootWitnessEdges += 1;
      rankThreeResponseWitnessEdges += proof.responseWitnesses.filter(item => item.attackerColumn !== null).length;
      rawUniversalBranches += proof.universalRawBranches;
      normalizedUniversalBranches += proof.universalConsequenceClasses;
      maxNormalizedArity = Math.max(maxNormalizedArity, proof.universalConsequenceClasses);
    }
  }

  if (!proof) {
    unresolved.push(root.sequence);
    continue;
  }
  expressionHistogram.set(proof.expression, (expressionHistogram.get(proof.expression) ?? 0) + 1);
  results.push(Object.freeze({
    sequence: root.sequence,
    canonicalReflection: canonicalSequence(root.sequence),
    expression: proof.expression,
    grammarRank: proof.grammarRank,
    rootMove: proof.rootMove + 1,
    childKinds: proof.childKinds,
    responseWitnesses: proof.responseWitnesses
      ? proof.responseWitnesses.map(item => Object.freeze({
          defenderColumn: item.defenderColumn + 1,
          kind: item.kind,
          attackerColumn: item.attackerColumn === null ? null : item.attackerColumn + 1,
        }))
      : Object.freeze([]),
  }));
}

const reflectionClasses = new Map();
for (const result of results) {
  let bucket = reflectionClasses.get(result.canonicalReflection);
  if (!bucket) {
    bucket = [];
    reflectionClasses.set(result.canonicalReflection, bucket);
  }
  bucket.push(result.sequence);
}

const expressionRows = [...expressionHistogram.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([expression, states]) => Object.freeze({ expression, states }));

console.log(`LOCAL_PROOF_GRAMMAR=${JSON.stringify({
  kind: 'standard7x6-depth8-local-proof-grammar-census-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceFrontierPhysicalStates: census.frontierPhysicalStates,
  sourceImmediateWinStates: sourceImmediate,
  recursiveRoots: roots.length,
  proofAuthority: 'All reported closure is derived solely from legal C4-0010 transitions plus the structural I/O/E/A rules. No exact W/D/L score or oracle-selected move enters root proof selection.',
  testedForms: [
    'E(O)',
    'E(A(S)) where each universal child is I or E(O), and S is the set of distinct observed child proof kinds',
  ],
  structurallyProvenRoots: results.length,
  unresolvedRoots: unresolved.length,
  closureFraction: results.length / roots.length,
  rankOneRoots: rankOne,
  rankThreeRoots: rankThree,
  expressionHistogram: expressionRows,
  proofClasses: expressionRows.length,
  reflectionClassesAmongProvenRoots: reflectionClasses.size,
  rawUniversalBranches: rawUniversalBranches,
  normalizedUniversalConsequenceBranches: normalizedUniversalBranches,
  universalBranchReduction: rawUniversalBranches ? 1 - normalizedUniversalBranches / rawUniversalBranches : 0,
  maxNormalizedUniversalArity: maxNormalizedArity,
  explicitWitnessEdges: {
    rankOneRootEdges: rankOneWitnessEdges,
    rankThreeRootEdges: rankThreeRootWitnessEdges,
    rankThreeAttackerResponseEdges: rankThreeResponseWitnessEdges,
  },
  provenExamples: results.slice(0, 40),
  unresolvedExamples: unresolved.slice(0, 40),
  theoremStatus: 'Each reported root is a constructive bounded positive proof under the declared grammar. The census does not claim completeness for unresolved roots or establish any terminal-line-output result.',
})}`);
