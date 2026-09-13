#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const CELL_COUNT = DOMAIN.columns * DOMAIN.rows;
const CENTER_ORDER = Object.freeze([3, 4, 2, 5, 1, 6, 0]);
const SRC = new URL('./', import.meta.url);
const SELF = fileURLToPath(import.meta.url);
const PONS_INVALID_MOVE = -1000;

// Resource cap copied from the independently measured depth-10 standard-board
// campaign. This is a measurement budget, not a semantic/domain limit.
const PREFIX_SEARCH_STORAGE = Object.freeze({
  states: 2097152,
  classes: 4194304,
  chunksPerSlot: 4194304,
});
const PREFIX_ARENA = Object.freeze({
  entryCapacity: 262144,
  termCapacity: 144703488,
});

function envInteger(name, fallback, minimum, maximum) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be an integer in ${minimum}..${maximum}, got ${raw}`);
  }
  return value;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function signWdl(score) {
  if (!Number.isSafeInteger(score)) throw new TypeError(`strong score must be an integer, got ${score}`);
  return score === 0 ? 0 : score > 0 ? 1 : -1;
}

function parsePonsAnalysis(sequence, stdout) {
  const lines = stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length !== 1) throw new Error(`Pons analysis emitted ${lines.length} result lines for ${sequence || '<root>'}`);
  const fields = lines[0].split(/\s+/);
  let scoreFields;
  if (sequence.length === 0) scoreFields = fields;
  else {
    if (fields[0] !== sequence) throw new Error(`Pons analysis prefix mismatch: ${fields[0]} != ${sequence}`);
    scoreFields = fields.slice(1);
  }
  if (scoreFields.length !== DOMAIN.columns) throw new Error(`Pons analysis returned ${scoreFields.length} scores`);
  return scoreFields.map((field, column) => {
    const score = Number(field);
    if (!Number.isSafeInteger(score) || score < PONS_INVALID_MOVE || score > 64) {
      throw new RangeError(`Pons action score ${field} at column ${column + 1} is invalid`);
    }
    return score;
  });
}

function analyzeWithPons(sequence) {
  const solver = requiredEnv('PONS_SOLVER_PATH');
  const book = requiredEnv('PONS_BOOK_PATH');
  const maxMs = envInteger('PONS_CASE_MS', 60000, 1000, 180000);
  const started = performance.now();
  const child = spawnSync(solver, ['-a', '-b', book], {
    input: `${sequence}\n`,
    encoding: 'utf-8',
    timeout: maxMs,
    maxBuffer: 2 * 1048576,
  });
  if (child.error?.code === 'ETIMEDOUT') throw new Error(`Pons analysis exceeded ${maxMs} ms at ${sequence || '<root>'}`);
  if (child.status !== 0) {
    throw new Error(`Pons analysis failed at ${sequence || '<root>'}: ${(child.stderr ?? '').slice(-2000)}`);
  }
  return Object.freeze({ scores: parsePonsAnalysis(sequence, child.stdout ?? ''), elapsedMs: performance.now() - started });
}

function chooseOptimal(scores) {
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
  if (bestColumn < 0 || !Number.isFinite(bestScore)) throw new Error('Pons solver returned no playable move');
  return Object.freeze({ bestColumn, bestScore });
}

function createPhysicalBoard() {
  const board = new Int8Array(CELL_COUNT).fill(-1);
  const heights = new Uint8Array(DOMAIN.columns);
  let ply = 0;
  function owns(player, c, r) {
    return c >= 0 && c < DOMAIN.columns && r >= 0 && r < DOMAIN.rows
      && board[r * DOMAIN.columns + c] === player;
  }
  function wins(player, c, r) {
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      let length = 1;
      for (const direction of [-1, 1]) {
        let x = c + dc * direction;
        let y = r + dr * direction;
        while (owns(player, x, y)) {
          length += 1;
          x += dc * direction;
          y += dr * direction;
        }
      }
      if (length >= DOMAIN.connect) return true;
    }
    return false;
  }
  return Object.freeze({
    play(column) {
      if (!Number.isSafeInteger(column) || column < 0 || column >= DOMAIN.columns || heights[column] >= DOMAIN.rows) {
        throw new RangeError(`illegal physical move ${column + 1} at ply ${ply}`);
      }
      const row = heights[column]++;
      const player = ply & 1;
      board[row * DOMAIN.columns + column] = player;
      ply += 1;
      return Object.freeze({ ply, player, column, row, win: wins(player, column, row), full: ply === CELL_COUNT });
    },
    get ply() { return ply; },
  });
}

function collectPerfectPlayLine() {
  const board = createPhysicalBoard();
  const records = [];
  let sequence = '';
  let terminal = null;
  const started = performance.now();
  while (board.ply < CELL_COUNT) {
    const analysis = analyzeWithPons(sequence);
    const { bestColumn, bestScore } = chooseOptimal(analysis.scores);
    records.push(Object.freeze({
      ply: board.ply,
      sequence,
      scores: analysis.scores,
      bestColumn,
      bestColumnOneBased: bestColumn + 1,
      bestScore,
      expectedWdl: signWdl(bestScore),
      oracleActionMs: analysis.elapsedMs,
    }));
    const move = board.play(bestColumn);
    sequence += String(bestColumn + 1);
    if (move.win || move.full) {
      terminal = Object.freeze({ sequence, ply: board.ply, winner: move.win ? move.player : null, draw: !move.win });
      break;
    }
  }
  if (!terminal) throw new Error('Pons optimal line did not reach a legal terminal');
  return Object.freeze({
    kind: 'pinned-pascal-pons-perfect-play-line-v1',
    sourceCommit: process.env.PONS_SOURCE_COMMIT ?? null,
    bookAssetId: Number(process.env.PONS_BOOK_ASSET_ID ?? 0) || null,
    bookSha256: process.env.PONS_BOOK_SHA256 ?? null,
    selection: 'maximum exact strong score; center-order deterministic tie break',
    elapsedMs: performance.now() - started,
    terminal,
    records,
  });
}

async function staticClosureProfile(line) {
  const [{ createSlot64ResidualQuotientKernel }, domain] = await Promise.all([
    import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs', SRC)),
    import(new URL('quotient-negamax-domain-contract.mjs', SRC)),
  ]);
  const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
    cacheEdges: true,
    prefixClasses: 4096,
    responseClosure: true,
    searchStorage: Object.freeze({ states: 4096, classes: 65536, chunksPerSlot: 65536 }),
  });
  kernel.prepareSearchStorage();
  let stateId = kernel.rootId;
  const rows = [];
  for (let index = 0; index < line.records.length; index += 1) {
    const external = line.records[index];
    const rank = kernel.supportAccess.rankAt(kernel.states.supportAt(stateId));
    if (rank !== external.ply) throw new Error(`static replay rank drift at ${external.sequence || '<root>'}`);
    const frontierBoundCode = kernel.frontierBoundCode(stateId);
    const tacticalCode = kernel.tacticalCode(stateId);
    let staticExact = null;
    let staticKind = null;
    if (frontierBoundCode === domain.FRONTIER_BOUND_DRAW) {
      staticExact = 0;
      staticKind = 'bilateral-frontier-exhaustion';
    }
    const tactical = domain.tacticalExactValue(tacticalCode);
    if (tactical !== null) {
      if (staticExact !== null && staticExact !== tactical) throw new Error('static closure sources contradict');
      staticExact = tactical;
      staticKind = tacticalCode >= domain.TACTICAL_IMMEDIATE_BASE ? 'immediate-win'
        : tacticalCode === domain.TACTICAL_LOSS ? 'forced-loss' : 'tactical-draw';
    }
    if (staticExact !== null && staticExact !== external.expectedWdl) {
      throw new Error(`static exact result disagrees with Pons at ply ${external.ply}: ${staticExact} != ${external.expectedWdl}`);
    }
    rows.push(Object.freeze({
      ply: external.ply,
      sequence: external.sequence,
      expectedWdl: external.expectedWdl,
      strongScore: external.bestScore,
      frontierBoundCode,
      tacticalCode,
      staticExact,
      staticKind,
    }));
    const child = kernel.advance(stateId, external.bestColumn);
    const finalMove = index === line.records.length - 1;
    if (finalMove) {
      if (line.terminal.draw) {
        if (!Number.isSafeInteger(child) || child < 0) throw new Error('draw terminal replay failed');
      } else if (child !== domain.QN_TERMINAL_WIN) {
        throw new Error(`winning terminal move did not produce QN_TERMINAL_WIN: ${child}`);
      }
    } else {
      if (!Number.isSafeInteger(child) || child < 0) throw new Error(`nonterminal replay failed at ply ${external.ply}`);
      stateId = child;
    }
  }
  return Object.freeze(rows);
}

async function runPrefixCase() {
  const sequence = process.env.PREFIX_SEQUENCE ?? '';
  const expectedWdl = envInteger('PREFIX_EXPECTED_WDL', 0, -1, 1);
  const strongScore = envInteger('PREFIX_STRONG_SCORE', 0, -64, 64);
  const prefixPly = sequence.length;
  const start = performance.now();
  try {
    const [{ createSlot64ResidualQuotientKernel }, { createSemanticSharedTtArena },
      { createOnlineSemanticQuotientSearcher }] = await Promise.all([
      import(new URL('quotient-native-negamax-slot64-residual-kernel.mjs', SRC)),
      import(new URL('quotient-semantic-shared-tt.mjs', SRC)),
      import(new URL('quotient-online-semantic-search-lib.mjs', SRC)),
    ]);
    const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
      cacheEdges: true,
      prefixClasses: 4096,
      responseClosure: true,
      searchStorage: PREFIX_SEARCH_STORAGE,
    });
    kernel.prepareSearchStorage();
    const arena = createSemanticSharedTtArena({ ...PREFIX_ARENA, domainSpec: DOMAIN });
    const searcher = createOnlineSemanticQuotientSearcher(kernel, arena, { etc: false });
    global.gc?.();
    const cpuStart = process.cpuUsage();
    const searchStart = performance.now();
    const solved = searcher.solvePath([...sequence].map(digit => Number(digit) - 1));
    const searchMs = performance.now() - searchStart;
    const cpu = process.cpuUsage(cpuStart);
    if (solved.value !== expectedWdl) {
      throw new Error(`exact quotient result disagrees with Pons WDL at ${sequence || '<root>'}: ${solved.value} != ${expectedWdl}`);
    }
    const stats = searcher.stats();
    console.log(`PREFIX_CASE=${JSON.stringify({
      status: 'resolved', sequence, prefixPly, expectedWdl, strongScore, value: solved.value,
      searchMs, cpuMs: (cpu.user + cpu.system) / 1000, elapsedMs: performance.now() - start,
      calls: stats.search.calls, expanded: stats.search.expanded,
      frontierBoundCuts: stats.search.frontierBoundCuts, tacticalExact: stats.search.tacticalExact,
      forcedNodes: stats.search.forcedNodes, proofAdmissions: stats.search.proofAdmissions,
      states: stats.localStates, classes: stats.localClasses,
      rss: process.memoryUsage().rss,
      resourceCap: { searchStorage: PREFIX_SEARCH_STORAGE, arena: PREFIX_ARENA },
    })}`);
  } catch (error) {
    console.log(`PREFIX_CASE=${JSON.stringify({
      status: 'error', sequence, prefixPly, expectedWdl, strongScore,
      elapsedMs: performance.now() - start,
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      resourceCap: { searchStorage: PREFIX_SEARCH_STORAGE, arena: PREFIX_ARENA },
    })}`);
  }
}

function parsePrefixCase(stdout) {
  const line = stdout.split(/\r?\n/).find(entry => entry.startsWith('PREFIX_CASE='));
  return line ? JSON.parse(line.slice('PREFIX_CASE='.length)) : null;
}

function probePrefix(record, maxPrefixMs) {
  const child = spawnSync(process.execPath, ['--expose-gc', SELF], {
    encoding: 'utf-8',
    maxBuffer: 8 * 1048576,
    timeout: maxPrefixMs,
    env: {
      ...process.env,
      PREFIX_CASE_MODE: '1',
      PREFIX_SEQUENCE: record.sequence,
      PREFIX_EXPECTED_WDL: String(record.expectedWdl),
      PREFIX_STRONG_SCORE: String(record.bestScore),
    },
  });
  if (child.error?.code === 'ETIMEDOUT') {
    return Object.freeze({ status: 'timeout', sequence: record.sequence, prefixPly: record.ply,
      expectedWdl: record.expectedWdl, strongScore: record.bestScore, timeoutMs: maxPrefixMs });
  }
  const parsed = parsePrefixCase(child.stdout ?? '');
  if (parsed) return Object.freeze(parsed);
  return Object.freeze({ status: 'process-failure', sequence: record.sequence, prefixPly: record.ply,
    expectedWdl: record.expectedWdl, strongScore: record.bestScore, exitStatus: child.status,
    signal: child.signal, stderr: (child.stderr ?? '').slice(-2000) });
}

function contiguousExactSuffixStart(probes, terminalPly) {
  let start = terminalPly;
  const byPly = new Map(probes.map(probe => [probe.prefixPly, probe]));
  for (let ply = terminalPly - 1; ply >= 0; ply -= 1) {
    const probe = byPly.get(ply);
    if (!probe || probe.status !== 'resolved') break;
    start = ply;
  }
  return start === terminalPly ? null : start;
}

async function runCampaign() {
  const maxPrefixMs = envInteger('MAX_PREFIX_MS', 15000, 1000, 120000);
  const minPrefixPly = envInteger('MIN_PREFIX_PLY', 8, 1, 41);

  const line = collectPerfectPlayLine();
  console.log(`PERFECT_PLAY_PATH=${JSON.stringify(line)}`);

  const staticRows = await staticClosureProfile(line);
  for (const row of staticRows) console.log(`STATIC_PREFIX=${JSON.stringify(row)}`);

  const probes = [];
  for (let index = line.records.length - 1; index >= 0; index -= 1) {
    const record = line.records[index];
    if (record.ply < minPrefixPly) continue;
    const probe = probePrefix(record, maxPrefixMs);
    probes.push(probe);
    console.log(`PREFIX_PROBE=${JSON.stringify(probe)}`);
  }
  probes.sort((a, b) => a.prefixPly - b.prefixPly);

  const resolved = probes.filter(probe => probe.status === 'resolved');
  const staticExact = staticRows.filter(row => row.staticExact !== null);
  const earliestExactPrefix = resolved.length ? resolved[0].prefixPly : null;
  const earliestStaticExactPrefix = staticExact.length ? staticExact[0].ply : null;
  const suffixStart = contiguousExactSuffixStart(probes, line.terminal.ply);
  console.log(`PERFECT_PLAY_CLOSURE_SUMMARY=${JSON.stringify({
    kind: 'connect4-standard7x6-perfect-play-closure-v3',
    pathSource: 'Pascal Pons exact solver at pinned upstream commit plus official opening book',
    sourceCommit: line.sourceCommit,
    bookAssetId: line.bookAssetId,
    bookSha256: line.bookSha256,
    pathGenerationMs: line.elapsedMs,
    terminalPly: line.terminal.ply,
    terminalSequence: line.terminal.sequence,
    terminalWinner: line.terminal.winner,
    minPrefixPly,
    maxPrefixMs,
    probedPrefixes: probes.length,
    resolvedPrefixes: resolved.length,
    earliestExactPrefix,
    exactPliesRemainingOnSelectedLine: earliestExactPrefix === null ? null : line.terminal.ply - earliestExactPrefix,
    contiguousExactSuffixStart: suffixStart,
    contiguousExactSuffixPlies: suffixStart === null ? null : line.terminal.ply - suffixStart,
    earliestStaticExactPrefix,
    staticExactPliesRemaining: earliestStaticExactPrefix === null ? null : line.terminal.ply - earliestStaticExactPrefix,
    oneSidedFrontierBounds: staticRows.filter(row => row.frontierBoundCode === 1 || row.frontierBoundCode === 2).length,
    bilateralFrontierDraws: staticRows.filter(row => row.frontierBoundCode === 3).length,
    unresolved: probes.filter(probe => probe.status !== 'resolved'),
    resourceCap: { searchStorage: PREFIX_SEARCH_STORAGE, arena: PREFIX_ARENA },
    interpretation: {
      oracleScoresAreValidationOnly: true,
      exactPrefixMeans: 'current quotient solver independently proved exact WDL from that selected perfect-play prefix',
      staticExactMeans: 'current executable structural/tactical classifier alone established exact WDL before recursion',
      branchScope: 'one deterministic strong-score-optimal line; not a whole-root worst-branch proof horizon',
      cpcCaution: 'simple parity arithmetic is never counted as exact closure without executable response/resource guards',
      rootGate: `quotient exact probes intentionally begin at ply ${minPrefixPly}; the standard empty-board quotient root is not launched`,
    },
  })}`);
}

if (process.env.PREFIX_CASE_MODE === '1') await runPrefixCase();
else await runCampaign();
