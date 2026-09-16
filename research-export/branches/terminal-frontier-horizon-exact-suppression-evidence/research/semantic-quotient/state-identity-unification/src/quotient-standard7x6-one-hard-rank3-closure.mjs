#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CENTER_ORDER = Object.freeze([3, 4, 2, 5, 1, 6, 0]);
const CENSUS = fileURLToPath(new URL('./quotient-standard7x6-proof-frontier-census.mjs', import.meta.url));
const PONS_INVALID_MOVE = -1000;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

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

function parsePonsLine(sequence, line) {
  const fields = line.trim().split(/\s+/);
  const scores = sequence.length === 0 ? fields : fields[0] === sequence ? fields.slice(1) : null;
  if (!scores || scores.length !== DOMAIN.columns) throw new Error(`invalid Pons line for ${sequence}: ${line}`);
  return scores.map((field, column) => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) {
      throw new RangeError(`invalid Pons score ${field} at ${sequence}/${column + 1}`);
    }
    return score;
  });
}

function analyzeBatch(sequences) {
  if (sequences.length === 0) return [];
  const child = spawnSync(requiredEnv('PONS_SOLVER_PATH'), ['-a', '-b', requiredEnv('PONS_BOOK_PATH')], {
    input: `${sequences.join('\n')}\n`,
    encoding: 'utf-8',
    timeout: 120000,
    maxBuffer: Math.max(2 * 1048576, sequences.length * 256),
  });
  if (child.error) throw child.error;
  if (child.status !== 0) throw new Error(`Pons batch failed: ${(child.stderr ?? '').slice(-8000)}`);
  const lines = (child.stdout ?? '').split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length !== sequences.length) throw new Error(`Pons returned ${lines.length} lines for ${sequences.length} inputs`);
  return sequences.map((sequence, index) => parsePonsLine(sequence, lines[index]));
}

function chooseWinningWitness(scores, sequence) {
  let bestScore = -Infinity;
  let bestColumn = -1;
  for (const column of CENTER_ORDER) {
    const score = scores[column];
    if (score === PONS_INVALID_MOVE) continue;
    if (score > bestScore) {
      bestScore = score;
      bestColumn = column;
    }
  }
  if (bestColumn < 0 || bestScore <= 0) throw new Error(`no exact-winning witness at ${sequence}`);
  return Object.freeze({ column: bestColumn, score: bestScore });
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

const immediateMemo = new Map();
const overloadMemo = new Map();
const shallowMemo = new Map();
const rank3Memo = new Map();

function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  let value = false;
  if ((rankOf(kernel, stateId) & 1) === 0) {
    for (const column of legalColumns(kernel, stateId)) {
      if (kernel.advance(stateId, column) === domain.QN_TERMINAL_WIN) {
        value = true;
        break;
      }
    }
  }
  immediateMemo.set(stateId, value);
  return value;
}

function overload(kernel, stateId) {
  if (overloadMemo.has(stateId)) return overloadMemo.get(stateId);
  let value = false;
  if ((rankOf(kernel, stateId) & 1) === 1) {
    const legal = legalColumns(kernel, stateId);
    value = legal.length > 0;
    for (const column of legal) {
      const child = kernel.advance(stateId, column);
      if (child === domain.QN_TERMINAL_WIN || child < 0 || !immediate(kernel, child)) {
        value = false;
        break;
      }
    }
  }
  overloadMemo.set(stateId, value);
  return value;
}

function shallowP0Kind(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rankOf(kernel, stateId) & 1) !== 0) throw new Error('shallowP0Kind requires P0-to-move state');
  if (immediate(kernel, stateId)) {
    shallowMemo.set(stateId, 'I');
    return 'I';
  }
  for (const column of legalColumns(kernel, stateId)) {
    const child = kernel.advance(stateId, column);
    if (child >= 0 && overload(kernel, child)) {
      shallowMemo.set(stateId, 'E(O)');
      return 'E(O)';
    }
  }
  shallowMemo.set(stateId, 'H');
  return 'H';
}

function proveRank3(kernel, stateId) {
  if (rank3Memo.has(stateId)) return rank3Memo.get(stateId);
  const base = shallowP0Kind(kernel, stateId);
  if (base !== 'H') {
    const result = Object.freeze({ expression: base, rootMove: null, childKinds: Object.freeze([]) });
    rank3Memo.set(stateId, result);
    return result;
  }

  for (const rootColumn of legalColumns(kernel, stateId)) {
    const defender = kernel.advance(stateId, rootColumn);
    if (defender < 0) continue;
    const childKinds = [];
    let valid = true;
    for (const defenderColumn of legalColumns(kernel, defender)) {
      const attacker = kernel.advance(defender, defenderColumn);
      if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) {
        valid = false;
        break;
      }
      const kind = shallowP0Kind(kernel, attacker);
      if (kind === 'H') {
        valid = false;
        break;
      }
      childKinds.push(kind);
    }
    if (!valid) continue;
    const normalized = [...new Set(childKinds)].sort();
    const result = Object.freeze({
      expression: `E(A(${normalized.join('|')}))`,
      rootMove: rootColumn,
      childKinds: Object.freeze(normalized),
    });
    rank3Memo.set(stateId, result);
    return result;
  }
  rank3Memo.set(stateId, null);
  return null;
}

function rootLocalProof(kernel, stateId) {
  return proveRank3(kernel, stateId);
}

const census = runCensus();
if (census.frontierDepth !== 8) throw new Error(`expected depth-8 census, got ${census.frontierDepth}`);
const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 1048576, classes: 1048576, chunksPerSlot: 262144 }),
});
kernel.prepareSearchStorage();

const unresolvedRoots = [];
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  if (rootLocalProof(kernel, stateId)) continue;
  unresolvedRoots.push({ stateId, sequence: representative.sequence });
}
if (unresolvedRoots.length !== 723) throw new Error(`expected 723 unresolved roots, got ${unresolvedRoots.length}`);

const scoreRows = analyzeBatch(unresolvedRoots.map(root => root.sequence));
const oneHardRows = [];
for (let index = 0; index < unresolvedRoots.length; index += 1) {
  const root = unresolvedRoots[index];
  const witness = chooseWinningWitness(scoreRows[index], root.sequence);
  const defender = kernel.advance(root.stateId, witness.column);
  if (defender < 0) throw new Error(`selected root witness invalid at ${root.sequence}`);
  const hard = [];
  for (const defenderColumn of legalColumns(kernel, defender)) {
    const attacker = kernel.advance(defender, defenderColumn);
    if (attacker < 0) throw new Error(`selected winning move permits terminal/illegal reply at ${root.sequence}`);
    if (shallowP0Kind(kernel, attacker) === 'H') hard.push({ column: defenderColumn, stateId: attacker });
  }
  if (hard.length !== 1) continue;
  oneHardRows.push(Object.freeze({
    parentSequence: root.sequence,
    parentMove: witness.column,
    hardReply: hard[0].column,
    hardStateId: hard[0].stateId,
  }));
}
if (oneHardRows.length !== 290) throw new Error(`expected 290 one-hard roots, got ${oneHardRows.length}`);

const uniqueHard = new Map();
for (const row of oneHardRows) {
  let bucket = uniqueHard.get(row.hardStateId);
  if (!bucket) {
    bucket = [];
    uniqueHard.set(row.hardStateId, bucket);
  }
  bucket.push(row);
}

let closedParents = 0;
let closedSameColumnParents = 0;
let closedOffColumnParents = 0;
let unresolvedParents = 0;
let closedUniqueHardStates = 0;
let unresolvedUniqueHardStates = 0;
const expressionHistogram = new Map();
const examples = [];

for (const [hardStateId, parents] of uniqueHard) {
  const proof = proveRank3(kernel, hardStateId);
  if (!proof) {
    unresolvedUniqueHardStates += 1;
    unresolvedParents += parents.length;
    continue;
  }
  closedUniqueHardStates += 1;
  expressionHistogram.set(proof.expression, (expressionHistogram.get(proof.expression) ?? 0) + parents.length);
  for (const parent of parents) {
    closedParents += 1;
    if (parent.parentMove === parent.hardReply) closedSameColumnParents += 1;
    else closedOffColumnParents += 1;
    if (examples.length < 60) {
      examples.push(Object.freeze({
        parentSequence: parent.parentSequence,
        parentMove: parent.parentMove + 1,
        hardReply: parent.hardReply + 1,
        sameColumn: parent.parentMove === parent.hardReply,
        hardChildExpression: proof.expression,
        hardChildMove: proof.rootMove === null ? null : proof.rootMove + 1,
      }));
    }
  }
}

console.log(`ONE_HARD_RANK3_CLOSURE=${JSON.stringify({
  kind: 'standard7x6-depth8-one-hard-rank3-closure-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceUnresolvedRoots: unresolvedRoots.length,
  oneHardParents: oneHardRows.length,
  uniqueHardQStates: uniqueHard.size,
  closedParents,
  unresolvedParents,
  parentClosureFraction: closedParents / oneHardRows.length,
  closedUniqueHardStates,
  unresolvedUniqueHardStates,
  closedSameColumnParents,
  closedOffColumnParents,
  expressionHistogram: [...expressionHistogram.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([expression, parents]) => ({ expression, parents })),
  examples,
  materializedQStates: kernel.states.count,
  proofAuthority: 'The external oracle selects only the already-diagnostic parent witness used to identify the sole hard child. Rank-3 closure of that child exhausts legal structural I/O/E/A witnesses and does not consult exact W/D/L scores. A closed hard child therefore gives a direct constructive rank-5 proof of its parent under the selected legal parent move.',
  theoremStatus: 'every reported closed parent is a constructive bounded proof; unresolved one-hard parents remain unknown beyond this grammar',
})}`);
