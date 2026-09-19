import { COLUMNS, ROWS } from '../domain/index.mjs';
import {
  CONCLUSION_EXACT_VALUE,
  CONCLUSION_FORCED_MOVE,
  CONCLUSION_NO_WIN,
} from './certificate.mjs';
import { deriveNativeFrontierConsequence, nativeFrontierCode } from './frontier.mjs';
import { IsoMaxCertificateIndex, IsoMaxTransitionCache } from './isomax-index.mjs';
import { ResidualPool } from './residual-pool.mjs';
import { IsometricState } from './state.mjs';
import { IsoMaxRbaValueResolver } from './rba-value-resolver.mjs';
import { CENTER_ORDER as MOVE_ORDER, promotedColumn } from './move-order.mjs';

function emptyMetrics() {
  return {
    nodes: 0,
    transitionCacheHits: 0,
    transitionCacheStores: 0,
    nativeExactHits: 0,
    nativeForcedHits: 0,
    certificateExactHits: 0,
    certificateForcedHits: 0,
    certificateNoWinHits: 0,
    unresolvedCertificates: 0,
    forcedTransitions: 0,
    recursiveChildren: 0,
    valueBoundaryQueries: 0,
    valueBoundaryHits: 0,
    valueBoundaryQueryMs: 0,
    orderingPromotions: 0,
  };
}

function assertExactValue(value) {
  if (value !== -1 && value !== 0 && value !== 1) throw new Error(`invalid exact W/D/L value: ${value}`);
}

export class IsoMaxSolver {
  constructor({
    pool = new ResidualPool(),
    certificates = null,
    transitionCache = null,
    valueResolver = null,
  } = {}) {
    if (!(pool instanceof ResidualPool)) throw new TypeError('pool must be a ResidualPool');
    this.pool = pool;
    this.certificates = certificates ?? new IsoMaxCertificateIndex(pool);
    if (!(this.certificates instanceof IsoMaxCertificateIndex) || this.certificates.pool !== pool) {
      throw new TypeError('certificates must be an IsoMaxCertificateIndex for the solver pool');
    }
    this.transitionCache = transitionCache ?? new IsoMaxTransitionCache({ pool });
    if (!(this.transitionCache instanceof IsoMaxTransitionCache) || this.transitionCache.pool !== pool) {
      throw new TypeError('transitionCache must be an IsoMaxTransitionCache for the solver pool');
    }
    this.metrics = emptyMetrics();
    if (valueResolver !== null && (!(valueResolver instanceof IsoMaxRbaValueResolver) || valueResolver.pool !== pool)) {
      throw new TypeError('valueResolver must be an IsoMaxRbaValueResolver for the solver pool');
    }
    this.valueResolver = valueResolver;
    this.orderingRootPly = 0;
    this.nextControlNode = Infinity;
  }

  createState(moves = null) {
    return new IsometricState({ pool: this.pool, moves });
  }

  resetSearchMemory() {
    this.transitionCache = new IsoMaxTransitionCache({ pool: this.pool });
  }

  solveValue(state) {
    this.assertState(state);
    this.metrics = emptyMetrics();
    this.orderingRootPly = state.ply;
    const value = this.solveNode(state);
    return { value, metrics: { ...this.metrics } };
  }

  solve(state) {
    this.assertState(state);
    this.metrics = emptyMetrics();
    this.orderingRootPly = state.ply;
    const value = this.solveNode(state);
    const move = state.isTerminal() ? null : this.selectMoveForValue(state, value);
    return { value, move, metrics: { ...this.metrics } };
  }

  solveMoves(moves) {
    return this.solve(this.createState(moves));
  }

  solveNode(state) {
    // OWNER-PROTECTED HOT-PATH CONTRACT — repository owner instruction.
    // Agents MUST NOT delete, weaken, bypass, or relocate these protections
    // away from the code, including the adjacent invariant/rationale comments.
    // Changing that protection requires an explicit repository-owner instruction.
    //
    // This is the real recursive worker kernel. Keep successful ordinary-value
    // execution scalar/indexed over preloaded, preallocated, sealed storage.
    // No new objects/arrays/views, closures, iterators, spread/destructuring,
    // array transforms, promises, string keys/formatting/parsing, buffer copies,
    // growth, widening, rehashing, logging, or reporter/manager RPC per node.
    // Decode necessary text once into numeric character-code/indexed storage
    // BEFORE entry; do not introduce string operations into recursion.
    // Required scalar residual/history writes are computation, not permission
    // to clone buffers. Reuse scratch only where no live ancestor can alias it.
    //
    // Establish validation at its owning boundary; remove repeated Boolean
    // tests only under proved preconditions. Never trade exact identity,
    // first-win precedence, guarded proof premises, or undo safety for speed.
    // Keep the empty-certificate bypass: object-based certificate/RBA research
    // APIs are NOT silently admitted into the sealed ordinary-worker profile.
    // Scheduling stays one numeric threshold check; reporting is fire-and-
    // forget outside recursion and formatting/I/O belongs to its own worker.
    //
    // Qualify changes with test/hot-loop.test.mjs plus execution/correctness
    // controls and paired real-worker timings (benchmarks/isomax-workers).
    // Fewer source lines or "cleaner" abstractions are not speed evidence.
    // Preserve existing measured optimizations; see HOT-LOOP.md in that folder.
    if (this.metrics.nodes >= this.nextControlNode) this.checkTaskControl(state);
    this.metrics.nodes += 1;
    const cached = this.transitionCache.get(state);
    if (cached !== undefined) {
      assertExactValue(cached);
      this.metrics.transitionCacheHits += 1;
      return cached;
    }

    const native = nativeFrontierCode(state);

    let exact = null;
    let forcedCell = null;
    let p0NoWin = false;
    let p1NoWin = false;

    if (native !== 0 && native < 64) {
      exact = (native & 3) - 2;
      this.metrics.nativeExactHits += 1;
    } else if (native >= 64) {
      forcedCell = native - 64;
      this.metrics.nativeForcedHits += 1;
    }

    if (this.certificates.size !== 0) {
    const facts = this.collectCertificateFacts(state);
    if (facts.exact !== null) {
      if (exact !== null && exact !== facts.exact) {
        throw new Error(`native/certificate exact-value contradiction: ${exact} vs ${facts.exact}`);
      }
      exact = facts.exact;
      this.metrics.certificateExactHits += 1;
    }
    if (facts.forcedCell !== null) {
      if (forcedCell !== null && forcedCell !== facts.forcedCell) {
        throw new Error(`native/certificate forced-move contradiction: ${forcedCell} vs ${facts.forcedCell}`);
      }
      forcedCell = facts.forcedCell;
      this.metrics.certificateForcedHits += 1;
    }
    p0NoWin = facts.p0NoWin;
    p1NoWin = facts.p1NoWin;
    this.metrics.certificateNoWinHits += (p0NoWin ? 1 : 0) + (p1NoWin ? 1 : 0);
    }

    if (exact !== null) {
      if ((exact === 1 && p0NoWin) || (exact === -1 && p1NoWin)) {
        throw new Error('exact-value certificate contradicts an applicable no-win certificate');
      }
      this.storeExact(state, exact);
      return exact;
    }

    if (p0NoWin && p1NoWin) {
      this.storeExact(state, 0);
      return 0;
    }

    if (this.valueResolver !== null) {
      this.metrics.valueBoundaryQueries++;
      const started = performance.now();
      let value;
      try { value = this.valueResolver.resolve(state); }
      finally { this.metrics.valueBoundaryQueryMs += performance.now() - started; }
      if (value !== null) {
        assertExactValue(value);
        this.assertNoWinBounds(value, p0NoWin, p1NoWin);
        this.metrics.valueBoundaryHits++;
        this.storeExact(state,value);
        return value;
      }
    }

    if (forcedCell !== null) {
      const column = this.columnForForcedCell(state, forcedCell);
      state.applyUnchecked(column);
      this.metrics.forcedTransitions += 1;
      let value;
      try { value = this.solveNode(state); }
      finally { state.undo(); }
      this.assertNoWinBounds(value, p0NoWin, p1NoWin);
      this.storeExact(state, value);
      return value;
    }

    let lower = p1NoWin ? 0 : -1;
    let upper = p0NoWin ? 0 : 1;
    if (lower === upper) {
      this.storeExact(state, lower);
      return lower;
    }

    const maximizing = state.sideToMove === 0;
    let best = maximizing ? -1 : 1;
    let sawMove = false;
    const promoted = state.ply > this.orderingRootPly ? promotedColumn(state) : -1;
    if (promoted >= 0) this.metrics.orderingPromotions++;
    for (let orderIndex = promoted >= 0 ? -1 : 0; orderIndex < MOVE_ORDER.length; orderIndex++) {
      const column = orderIndex === -1 ? promoted : MOVE_ORDER[orderIndex];
      if (orderIndex >= 0 && column === promoted) continue;
      // Frontier classification established ongoing status; MOVE_ORDER and
      // promotedColumn supply validated columns. Only gravity fullness varies.
      if (state.heights[column] === ROWS) continue;
      sawMove = true;
      state.applyUnchecked(column);
      this.metrics.recursiveChildren += 1;
      let childValue;
      try { childValue = this.solveNode(state); }
      finally { state.undo(); }
      if (maximizing) {
        if (childValue > best) best = childValue;
        if (best >= upper) {
          break;
        }
      } else {
        if (childValue < best) best = childValue;
        if (best <= lower) {
          break;
        }
      }
    }
    if (!sawMove) throw new Error('ongoing state has no legal moves');
    this.assertNoWinBounds(best, p0NoWin, p1NoWin);
    this.storeExact(state, best);
    return best;
  }

  collectCertificateFacts(state) {
    if (this.certificates.size === 0) {
      return { exact: null, forcedCell: null, p0NoWin: false, p1NoWin: false };
    }
    const lookup = this.certificates.lookup(state);
    this.metrics.unresolvedCertificates += lookup.unresolved.length;
    let exact = null;
    let forcedCell = null;
    let p0NoWin = false;
    let p1NoWin = false;
    for (const match of lookup.applicable) {
      const conclusion = match.conclusion;
      if (conclusion.kind === CONCLUSION_EXACT_VALUE) {
        if (exact !== null && exact !== conclusion.value) throw new Error('conflicting applicable exact-value certificates');
        exact = conclusion.value;
      } else if (conclusion.kind === CONCLUSION_FORCED_MOVE) {
        if (forcedCell !== null && forcedCell !== conclusion.cell) throw new Error('conflicting applicable forced-move certificates');
        forcedCell = conclusion.cell;
      } else if (conclusion.kind === CONCLUSION_NO_WIN) {
        if (conclusion.player === 0) p0NoWin = true;
        else p1NoWin = true;
      }
    }
    return { exact, forcedCell, p0NoWin, p1NoWin };
  }

  columnForForcedCell(state, cell) {
    if (!Number.isInteger(cell) || cell < 0 || cell >= COLUMNS * ROWS) throw new Error(`forced cell out of range: ${cell}`);
    const column = cell % COLUMNS;
    const row = Math.floor(cell / COLUMNS);
    if (!state.canPlay(column) || state.heights[column] !== row) {
      throw new Error(`forced certificate targets a non-playable cell: ${cell}`);
    }
    return column;
  }

  selectMoveForValue(state, targetValue) {
    const native = deriveNativeFrontierConsequence(state);
    if (native?.kind === CONCLUSION_FORCED_MOVE) return this.columnForForcedCell(state, native.cell);
    if (native?.kind === CONCLUSION_EXACT_VALUE && native.distance === 1) {
      const ownClass = state.sideToMove === 0 ? state.p0Class : state.p1Class;
      for (const column of MOVE_ORDER) {
        if (!state.canPlay(column)) continue;
        const cell = state.heights[column] * COLUMNS + column;
        if (state.pool.hasSingletonAt(ownClass, cell)) return column;
      }
      throw new Error('immediate-win theorem has no playable singleton witness');
    }

    for (const column of MOVE_ORDER) {
      if (!state.canPlay(column)) continue;
      state.applyUnchecked(column);
      let childValue;
      try { childValue = this.solveNode(state); }
      finally { state.undo(); }
      if (childValue === targetValue) return column;
    }
    throw new Error(`exact value ${targetValue} has no value-preserving legal action`);
  }

  storeExact(state, value) {
    assertExactValue(value);
    this.transitionCache.set(state, value);
    this.metrics.transitionCacheStores += 1;
  }

  assertNoWinBounds(value, p0NoWin, p1NoWin) {
    if (p0NoWin && value > 0) throw new Error('recursive result violates P0 no-win certificate');
    if (p1NoWin && value < 0) throw new Error('recursive result violates P1 no-win certificate');
  }

  assertState(state) {
    if (!(state instanceof IsometricState) || state.pool !== this.pool) {
      throw new TypeError('state must be an IsometricState owned by this solver pool');
    }
  }
}
