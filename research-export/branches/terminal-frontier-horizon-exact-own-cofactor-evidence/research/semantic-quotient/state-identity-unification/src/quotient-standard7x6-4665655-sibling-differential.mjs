#!/usr/bin/env node
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const PREFIX = '4665655';
const SIBLING_REPLIES = Object.freeze([1, 2, 5, 7]);
const FIXED_P0_WITNESS = 4;

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit) - 1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`bad replay ${sequence}`);
    stateId = child;
  }
  return stateId;
}
function rank(kernel, stateId) { return kernel.supportAccess.rankAt(kernel.states.supportAt(stateId)); }
function legal(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) if (kernel.supportAccess.landingAt(support, c) !== 0xff) out.push(c);
  return out;
}
function landing(kernel, stateId, column) {
  const cell = kernel.supportAccess.landingAt(kernel.states.supportAt(stateId), column);
  if (cell === 0xff) return null;
  return { cell, column, row: Math.floor(cell / DOMAIN.columns) };
}
function heights(kernel, stateId) {
  const support = kernel.states.supportAt(stateId), out = [];
  for (let c = 0; c < DOMAIN.columns; c += 1) {
    const cell = kernel.supportAccess.landingAt(support, c);
    out.push(cell === 0xff ? DOMAIN.rows : Math.floor(cell / DOMAIN.columns));
  }
  return out;
}
function popcount32(value) {
  let x = value >>> 0;
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}
function termSize([lo, hi]) { return popcount32(lo) + popcount32(hi); }
function termHasCell([lo, hi], cell) {
  return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0);
}
function termKey([lo, hi]) { return `${lo >>> 0}:${hi >>> 0}`; }
function termStats(terms) {
  const sizeHistogram = {};
  for (const term of terms) {
    const n = termSize(term);
    sizeHistogram[n] = (sizeHistogram[n] ?? 0) + 1;
  }
  return { count: terms.length, sizeHistogram };
}
function terms(kernel, stateId, player) {
  return kernel.classes.terms(player === 0 ? kernel.states.p0At(stateId) : kernel.states.p1At(stateId));
}
function exactTermDiff(before, after) {
  const b = new Map(before.map(term => [termKey(term), term]));
  const a = new Map(after.map(term => [termKey(term), term]));
  const removed = [...b.entries()].filter(([key]) => !a.has(key)).map(([, term]) => term);
  const added = [...a.entries()].filter(([key]) => !b.has(key)).map(([, term]) => term);
  return { removed: termStats(removed), added: termStats(added) };
}
function linesForCell(cell) {
  const c0 = cell % DOMAIN.columns, r0 = Math.floor(cell / DOMAIN.columns);
  let count = 0;
  const orientations = {};
  for (const [dc, dr, name] of [[1,0,'H'],[0,1,'V'],[1,1,'D+'],[1,-1,'D-']]) {
    let local = 0;
    for (let start = -3; start <= 0; start += 1) {
      const cells = [];
      let ok = true;
      for (let i = 0; i < 4; i += 1) {
        const c = c0 + (start + i) * dc, r = r0 + (start + i) * dr;
        if (c < 0 || c >= DOMAIN.columns || r < 0 || r >= DOMAIN.rows) { ok = false; break; }
        cells.push(r * DOMAIN.columns + c);
      }
      if (ok && cells.includes(cell)) { local += 1; count += 1; }
    }
    orientations[name] = local;
  }
  return { count, orientations };
}

const immediateMemo = new Map(), overloadMemo = new Map(), shallowMemo = new Map();
function immediate(kernel, stateId) {
  if (immediateMemo.has(stateId)) return immediateMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 0) for (const c of legal(kernel, stateId)) if (kernel.advance(stateId, c) === domain.QN_TERMINAL_WIN) { value = true; break; }
  immediateMemo.set(stateId, value); return value;
}
function overload(kernel, stateId) {
  if (overloadMemo.has(stateId)) return overloadMemo.get(stateId);
  let value = false;
  if ((rank(kernel, stateId) & 1) === 1) {
    const moves = legal(kernel, stateId); value = moves.length > 0;
    for (const c of moves) {
      const child = kernel.advance(stateId, c);
      if (child === domain.QN_TERMINAL_WIN || child < 0 || !immediate(kernel, child)) { value = false; break; }
    }
  }
  overloadMemo.set(stateId, value); return value;
}
function shallow(kernel, stateId) {
  if (shallowMemo.has(stateId)) return shallowMemo.get(stateId);
  if ((rank(kernel, stateId) & 1) !== 0) throw new Error('shallow requires P0-to-move');
  let value = 'H';
  if (immediate(kernel, stateId)) value = 'I';
  else for (const c of legal(kernel, stateId)) {
    const child = kernel.advance(stateId, c);
    if (child >= 0 && overload(kernel, child)) { value = 'E(O)'; break; }
  }
  shallowMemo.set(stateId, value); return value;
}
function p0MoveProfile(kernel, stateId, column) {
  const defender = kernel.advance(stateId, column);
  if (defender === domain.QN_TERMINAL_WIN) return { column: column + 1, terminal: true, valid: true, hardCount: 0, replyKinds: ['I'] };
  if (defender < 0) return { column: column + 1, terminal: false, valid: false, hardCount: null, replyKinds: [] };
  const replyKinds = [], hard = [];
  for (const reply of legal(kernel, defender)) {
    const attacker = kernel.advance(defender, reply);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) return { column: column + 1, terminal: false, valid: false, hardCount: null, replyKinds, p1TerminalReply: reply + 1 };
    const kind = shallow(kernel, attacker);
    replyKinds.push({ reply: reply + 1, kind });
    if (kind === 'H') hard.push({ reply: reply + 1, stateId: attacker });
  }
  return { column: column + 1, terminal: false, valid: true, hardCount: hard.length, replyKinds, hard };
}
function bestStructuralMoves(kernel, stateId) {
  const profiles = legal(kernel, stateId).map(c => p0MoveProfile(kernel, stateId, c)).filter(x => x.valid);
  profiles.sort((a,b) => a.hardCount - b.hardCount || Number(b.terminal) - Number(a.terminal) || a.column - b.column);
  return { minimumHard: profiles[0]?.hardCount ?? null, bestColumns: profiles.filter(p => p.hardCount === profiles[0]?.hardCount).map(p => p.column), profiles: profiles.map(p => ({ column: p.column, hardCount: p.hardCount, terminal: p.terminal })) };
}
function sharedTermCount(a,b) {
  const set = new Set(a.map(termKey));
  return b.filter(t => set.has(termKey(t))).length;
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges: true, prefixClasses: 4096, responseClosure: true,
  searchStorage: Object.freeze({ states: 262144, classes: 524288, chunksPerSlot: 131072 }),
});
kernel.prepareSearchStorage();

const prefixState = replay(kernel, PREFIX);
if (rank(kernel, prefixState) !== 7) throw new Error('prefix rank drift');
const prefixP0 = terms(kernel, prefixState, 0), prefixP1 = terms(kernel, prefixState, 1);
const siblings = [];
for (const replyOneBased of SIBLING_REPLIES) {
  const reply = replyOneBased - 1;
  const event = landing(kernel, prefixState, reply);
  const stateId = kernel.advance(prefixState, reply);
  if (stateId < 0) throw new Error(`bad sibling reply ${replyOneBased}`);
  const seq = `${PREFIX}${replyOneBased}`;
  const afterP0 = terms(kernel, stateId, 0), afterP1 = terms(kernel, stateId, 1);
  const killedP0PreTerms = prefixP0.filter(t => termHasCell(t, event.cell));
  const shrunkP1PreTerms = prefixP1.filter(t => termHasCell(t, event.cell));
  const witnessColumn = FIXED_P0_WITNESS - 1;
  const witnessLanding = landing(kernel, stateId, witnessColumn);
  const defender = kernel.advance(stateId, witnessColumn);
  if (defender < 0) throw new Error(`fixed witness ${FIXED_P0_WITNESS} terminal/illegal at ${seq}`);
  const witnessP0Terms = terms(kernel, defender, 0), witnessP1Terms = terms(kernel, defender, 1);
  const hardReplies = [];
  const allReplies = [];
  for (const p1Reply of legal(kernel, defender)) {
    const p1Landing = landing(kernel, defender, p1Reply);
    const attacker = kernel.advance(defender, p1Reply);
    if (attacker === domain.QN_TERMINAL_WIN || attacker < 0) {
      allReplies.push({ reply: p1Reply + 1, terminalForP1: true });
      continue;
    }
    const kind = shallow(kernel, attacker);
    const p0Child = terms(kernel, attacker, 0), p1Child = terms(kernel, attacker, 1);
    const best = kind === 'H' ? bestStructuralMoves(kernel, attacker) : null;
    const row = {
      reply: p1Reply + 1,
      landingRowOneBased: p1Landing.row + 1,
      kind,
      p0: termStats(p0Child),
      p1: termStats(p1Child),
      p0TermsRemovedFromDefender: exactTermDiff(witnessP0Terms, p0Child).removed,
      p1TermsChangedFromDefender: exactTermDiff(witnessP1Terms, p1Child),
      nextStructuralOptions: best,
    };
    allReplies.push(row);
    if (kind === 'H') hardReplies.push({ ...row, stateId: attacker, p0Terms: p0Child, p1Terms: p1Child });
  }
  let hardPair = null;
  if (hardReplies.length === 2) {
    hardPair = {
      replyColumns: hardReplies.map(x => x.reply),
      replyDistance: Math.abs(hardReplies[0].reply - hardReplies[1].reply),
      sharedP0Terms: sharedTermCount(hardReplies[0].p0Terms, hardReplies[1].p0Terms),
      sharedP1Terms: sharedTermCount(hardReplies[0].p1Terms, hardReplies[1].p1Terms),
      p0TermCounts: hardReplies.map(x => x.p0.count),
      p1TermCounts: hardReplies.map(x => x.p1.count),
      nextMinimumHard: hardReplies.map(x => x.nextStructuralOptions.minimumHard),
    };
  }
  siblings.push({
    sequence: seq,
    siblingReply: replyOneBased,
    siblingLanding: { column: replyOneBased, rowOneBased: event.row + 1, cell: event.cell, lineIncidence: linesForCell(event.cell) },
    supportHeights: heights(kernel, stateId),
    cpcBasicOwnerParityAtLandingRelativeToP1Turn: (event.row % 2),
    prefixImpact: {
      p0PreTermsContainingLanding: termStats(killedP0PreTerms),
      p1PreTermsContainingLanding: termStats(shrunkP1PreTerms),
      p0After: termStats(afterP0),
      p1After: termStats(afterP1),
      p0ExactDiff: exactTermDiff(prefixP0, afterP0),
      p1ExactDiff: exactTermDiff(prefixP1, afterP1),
    },
    fixedP0Witness: {
      column: FIXED_P0_WITNESS,
      landingRowOneBased: witnessLanding.row + 1,
      p0After: termStats(witnessP0Terms),
      p1After: termStats(witnessP1Terms),
    },
    hardReplyCount: hardReplies.length,
    hardPair,
    allReplies,
  });
}

console.log(`SIBLING_TRANSITION_DIFFERENTIAL=${JSON.stringify({
  kind: 'standard7x6-4665655-sibling-transition-differential-v1',
  attribution: { researchDirectionAndStructuralTarget: 'Josh Oshiro', formalizationImplementationAndQualification: 'OpenAI ChatGPT' },
  commonPrefix: PREFIX,
  prefixSupportHeights: heights(kernel, prefixState),
  prefixP0Residuals: termStats(prefixP0),
  prefixP1Residuals: termStats(prefixP1),
  siblingReplies: SIBLING_REPLIES,
  fixedP0WitnessColumn: FIXED_P0_WITNESS,
  siblings,
  authority: 'Pure legal C4-0010/WSL transition differential. No external score/value labels are used by this script.',
  interpretationBoundary: 'Reported correlations are theorem-discovery evidence only. Any candidate rule must be derived independently and falsified on the larger closed/overflow control set.',
})}`);
