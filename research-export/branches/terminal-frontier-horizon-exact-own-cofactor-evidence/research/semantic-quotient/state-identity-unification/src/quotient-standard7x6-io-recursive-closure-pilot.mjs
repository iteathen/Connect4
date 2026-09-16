#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CENTER_ORDER = Object.freeze([3, 4, 2, 5, 1, 6, 0]);
const PONS_INVALID_MOVE = -1000;
const CENSUS = fileURLToPath(new URL('./quotient-standard7x6-proof-frontier-census.mjs', import.meta.url));
const MAX_ADDITIONAL_PLIES = Number(process.env.IO_MAX_ADDITIONAL_PLIES ?? 4);
const STATE_CAP = Number(process.env.IO_STATE_CAP ?? 100000);
if (!Number.isSafeInteger(MAX_ADDITIONAL_PLIES) || MAX_ADDITIONAL_PLIES < 0 || MAX_ADDITIONAL_PLIES > 8) {
  throw new RangeError(`IO_MAX_ADDITIONAL_PLIES must be 0..8, got ${MAX_ADDITIONAL_PLIES}`);
}
if (!Number.isSafeInteger(STATE_CAP) || STATE_CAP < 1000) throw new RangeError(`IO_STATE_CAP invalid: ${STATE_CAP}`);

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
  return scores.map(field => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) throw new RangeError(`invalid Pons score ${field}`);
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
  if (bestColumn < 0 || bestScore <= 0) throw new Error(`no exact-winning discovery witness at ${sequence}, best=${bestScore}`);
  return { column: bestColumn, score: bestScore };
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

function immediateWinColumns(kernel, stateId) {
  const result = [];
  for (const column of legalColumns(kernel, stateId)) {
    if (kernel.advance(stateId, column) === domain.QN_TERMINAL_WIN) result.push(column);
  }
  return result;
}

function baseKind(kernel, stateId) {
  const rank = rankOf(kernel, stateId);
  const legal = legalColumns(kernel, stateId);
  if ((rank & 1) === 0) {
    return immediateWinColumns(kernel, stateId).length > 0 ? 'I' : null;
  }
  if (legal.length === 0) return null;
  for (const column of legal) {
    const child = kernel.advance(stateId, column);
    if (child === domain.QN_TERMINAL_WIN || child < 0) return null;
    if (immediateWinColumns(kernel, child).length === 0) return null;
  }
  return 'O';
}

class ExpressionRegistry {
  constructor() {
    this.ids = new Map([['I', 0], ['O', 1]]);
    this.keys = ['I', 'O'];
  }
  intern(key) {
    const existing = this.ids.get(key);
    if (existing !== undefined) return existing;
    const id = this.keys.length;
    this.ids.set(key, id);
    this.keys.push(key);
    return id;
  }
  e(child) {
    return this.intern(`E:${child}`);
  }
  a(children) {
    const normalized = [...new Set(children)].sort((a, b) => a - b);
    return this.intern(`A:${normalized.join(',')}`);
  }
  label(id) {
    return this.keys[id];
  }
}

const census = runCensus();
if (census.frontierDepth !== 8) throw new Error(`expected depth-8 census, got ${census.frontierDepth}`);
const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true,
  prefixClasses: 4096,
  responseClosure: true,
  searchStorage: Object.freeze({ states: 524288, classes: 1048576, chunksPerSlot: 524288 }),
});
kernel.prepareSearchStorage();

const roots = [];
for (const representative of census.representativeQuotientStates) {
  const stateId = replay(kernel, representative.sequence);
  if (baseKind(kernel, stateId) === 'I') continue;
  roots.push({ stateId, sequence: representative.sequence });
}
if (roots.length !== 822) throw new Error(`expected 822 recursive roots, got ${roots.length}`);

const nodes = new Map();
const layers = Array.from({ length: MAX_ADDITIONAL_PLIES + 1 }, () => new Set());
function ensureNode(stateId, sequence, depth) {
  let node = nodes.get(stateId);
  if (!node) {
    node = {
      stateId,
      sequence,
      depth,
      rank: rankOf(kernel, stateId),
      kind: baseKind(kernel, stateId),
      edges: [],
      terminalFailure: false,
      expanded: false,
      witnessScore: null,
      proof: null,
    };
    nodes.set(stateId, node);
  } else if (depth < node.depth) {
    node.depth = depth;
    node.sequence = sequence;
  }
  if (depth <= MAX_ADDITIONAL_PLIES) layers[depth].add(stateId);
  return node;
}
for (const root of roots) ensureNode(root.stateId, root.sequence, 0);

const expansion = [];
let capHit = false;
for (let depth = 0; depth < MAX_ADDITIONAL_PLIES; depth += 1) {
  const layerNodes = [...layers[depth]].map(id => nodes.get(id)).filter(node => node && !node.kind && !node.expanded);
  const p0Nodes = layerNodes.filter(node => (node.rank & 1) === 0);
  const scoreRows = analyzeBatch(p0Nodes.map(node => node.sequence));
  const scoreByState = new Map(p0Nodes.map((node, index) => [node.stateId, scoreRows[index]]));
  let createdEdges = 0;
  let bases = 0;
  let p0Expanded = 0;
  let p1Expanded = 0;

  for (const node of layerNodes) {
    if (node.kind) {
      bases += 1;
      continue;
    }
    const legal = legalColumns(kernel, node.stateId);
    if ((node.rank & 1) === 0) {
      p0Expanded += 1;
      const witness = chooseWinningWitness(scoreByState.get(node.stateId), node.sequence);
      node.witnessScore = witness.score;
      const child = kernel.advance(node.stateId, witness.column);
      if (child === domain.QN_TERMINAL_WIN) {
        throw new Error(`non-I P0 node selected terminal witness at ${node.sequence}/${witness.column + 1}`);
      }
      if (child < 0) throw new Error(`illegal selected witness at ${node.sequence}/${witness.column + 1}`);
      const childNode = ensureNode(child, `${node.sequence}${witness.column + 1}`, depth + 1);
      node.edges.push({ column: witness.column, child: childNode.stateId });
      createdEdges += 1;
    } else {
      p1Expanded += 1;
      for (const column of legal) {
        const child = kernel.advance(node.stateId, column);
        if (child === domain.QN_TERMINAL_WIN) {
          node.terminalFailure = true;
          continue;
        }
        if (child < 0) throw new Error(`illegal P1 edge at ${node.sequence}/${column + 1}`);
        const childNode = ensureNode(child, `${node.sequence}${column + 1}`, depth + 1);
        node.edges.push({ column, child: childNode.stateId });
        createdEdges += 1;
      }
    }
    node.expanded = true;
    if (nodes.size > STATE_CAP) {
      capHit = true;
      break;
    }
  }
  expansion.push({
    depth,
    statesAtDepth: layers[depth].size,
    expandableStates: layerNodes.length,
    p0Expanded,
    p1Expanded,
    createdEdges,
    cumulativeStates: nodes.size,
  });
  if (capHit) break;
}

const registry = new ExpressionRegistry();
let aNodesProven = 0;
let rawABranches = 0;
let normalizedABranches = 0;
let maxNormalizedArity = 0;
for (let depth = Math.min(MAX_ADDITIONAL_PLIES, layers.length - 1); depth >= 0; depth -= 1) {
  for (const stateId of layers[depth]) {
    const node = nodes.get(stateId);
    if (!node) continue;
    if (node.kind === 'I') {
      node.proof = { expr: 0, grammarRank: 0, maxExpandedDepth: 0 };
      continue;
    }
    if (node.kind === 'O') {
      node.proof = { expr: 1, grammarRank: 0, maxExpandedDepth: 0 };
      continue;
    }
    if (!node.expanded || node.terminalFailure) continue;
    if ((node.rank & 1) === 0) {
      const provenChildren = node.edges.map(edge => nodes.get(edge.child)?.proof).filter(Boolean);
      if (provenChildren.length === 0) continue;
      const best = provenChildren.sort((a, b) => a.grammarRank - b.grammarRank || a.expr - b.expr)[0];
      node.proof = {
        expr: registry.e(best.expr),
        grammarRank: 1 + best.grammarRank,
        maxExpandedDepth: 1 + best.maxExpandedDepth,
      };
    } else {
      if (node.edges.length !== legalColumns(kernel, node.stateId).length) continue;
      const children = node.edges.map(edge => nodes.get(edge.child)?.proof);
      if (children.some(child => !child)) continue;
      const classes = children.map(child => child.expr);
      const unique = new Set(classes);
      aNodesProven += 1;
      rawABranches += classes.length;
      normalizedABranches += unique.size;
      maxNormalizedArity = Math.max(maxNormalizedArity, unique.size);
      node.proof = {
        expr: registry.a(classes),
        grammarRank: 1 + Math.max(...children.map(child => child.grammarRank)),
        maxExpandedDepth: 1 + Math.max(...children.map(child => child.maxExpandedDepth)),
      };
    }
  }
}

const provenRoots = roots.map(root => nodes.get(root.stateId)).filter(node => node?.proof);
const unresolvedRoots = roots.length - provenRoots.length;
const rootClassHistogram = new Map();
const grammarRankHistogram = new Map();
for (const node of provenRoots) {
  rootClassHistogram.set(node.proof.expr, (rootClassHistogram.get(node.proof.expr) ?? 0) + 1);
  grammarRankHistogram.set(node.proof.grammarRank, (grammarRankHistogram.get(node.proof.grammarRank) ?? 0) + 1);
}
const topRootClasses = [...rootClassHistogram.entries()]
  .sort((a, b) => b[1] - a[1] || a[0] - b[0])
  .slice(0, 30)
  .map(([expr, states]) => ({ expr, key: registry.label(expr), states }));

const layerSummary = layers.map((ids, depth) => {
  let i = 0, o = 0, proven = 0, unresolved = 0;
  const exprs = new Set();
  for (const id of ids) {
    const node = nodes.get(id);
    if (!node) continue;
    if (node.kind === 'I') i += 1;
    else if (node.kind === 'O') o += 1;
    if (node.proof) {
      proven += 1;
      exprs.add(node.proof.expr);
    } else unresolved += 1;
  }
  return { depth, states: ids.size, I: i, O: o, proven, unresolved, proofClasses: exprs.size };
});

console.log(`IO_RECURSIVE_CLOSURE=${JSON.stringify({
  kind: 'standard7x6-depth8-io-recursive-closure-pilot-v1',
  attribution: {
    researchDirectionAndStructuralTarget: 'Josh Oshiro',
    formalizationImplementationAndQualification: 'OpenAI ChatGPT',
  },
  sourceConstruction: census.construction,
  startingRecursiveStates: roots.length,
  theoremLeaves: {
    I: 'P0-to-move has a legal immediate terminal win',
    O: 'P1-to-move has no terminal win and every legal P1 reply gives P0 an immediate terminal win',
  },
  recursion: {
    P0: 'E(C): one concrete legal P0 witness reaches already-proven C',
    P1: 'A(C1|...|Cn): every legal P1 reply reaches an already-proven child; duplicate proof classes are idempotent',
  },
  oracleAuthority: 'Pons is used only to select which legal P0 edge to attempt at unresolved E nodes. Every reported closed proof is independently valid from the explicit legal edge plus recursively theorem-backed I/O/E/A structure; oracle scores are not proof premises.',
  maxAdditionalExpandedPlies: MAX_ADDITIONAL_PLIES,
  stateCap: STATE_CAP,
  capHit,
  materializedQStates: nodes.size,
  expansion,
  layers: layerSummary,
  provenStartingStates: provenRoots.length,
  unresolvedStartingStates: unresolvedRoots,
  closureFraction: provenRoots.length / roots.length,
  uniqueProofExpressions: registry.keys.length,
  uniqueRootProofClasses: rootClassHistogram.size,
  grammarRankHistogram: Object.fromEntries([...grammarRankHistogram.entries()].sort((a, b) => a[0] - b[0])),
  topRootClasses,
  provenUniversalNodes: aNodesProven,
  rawUniversalBranchesInProvenNodes: rawABranches,
  normalizedConsequenceBranchesInProvenNodes: normalizedABranches,
  universalBranchReduction: rawABranches ? 1 - normalizedABranches / rawABranches : 0,
  maxNormalizedUniversalArity: maxNormalizedArity,
  theoremStatus: 'every closed expression is a direct structural proof under the declared I/O/E/A rules; unresolved states remain unknown, and the Pons-selected E edge is a discovery heuristic rather than an admitted premise',
})}`);
