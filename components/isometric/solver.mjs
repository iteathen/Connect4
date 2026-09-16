import { COLUMNS, ROWS } from '../domain/index.mjs';
import {
  CONCLUSION_EXACT_VALUE,
  CONCLUSION_FORCED_MOVE,
  CONCLUSION_NO_WIN,
} from './certificate.mjs';
import { deriveNativeFrontierConsequence } from './frontier.mjs';
import { IsoMaxCertificateIndex, IsoMaxTransitionCache } from './isomax-index.mjs';
import { ResidualPool } from './residual-pool.mjs';
import { IsometricState } from './state.mjs';

const MOVE_ORDER = Object.freeze([3, 2, 4, 1, 5, 0, 6]);

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
  } = {}) {
    if (!(pool instanceof ResidualPool)) throw new TypeError('pool must be a ResidualPool');
    this.pool = pool;
    this.certificates = certificates ?? new IsoMaxCertificateIndex(pool);
    if (!(this.certificates instanceof IsoMaxCertificateIndex) || this.certificates.pool !== pool) {
      throw new TypeError('certificates must be an IsoMaxCertificateIndex for the solver pool');
    }
    this.transitionCache = transitionCache ?? new IsoMaxTransitionCache();
    if (!(this.transitionCache instanceof IsoMaxTransitionCache)) {
      throw new TypeError('transitionCache must be an IsoMaxTransitionCache');
    }
    this.metrics = emptyMetrics();
  }

  createState(moves = null) {
    return new IsometricState({ pool: this.pool, moves });
  }

  resetSearchMemory() {
    this.transitionCache = new IsoMaxTransitionCache();
  }

  solveValue(state) {
    this.assertState(state);
    this.metrics = emptyMetrics();
    const value = this.solveNode(state);
    return { value, metrics: { ...this.metrics } };
  }

  solve(state) {
    this.assertState(state);
    this.metrics = emptyMetrics();
    const value = this.solveNode(state);
    const move = state.isTerminal() ? null : this.selectMoveForValue(state, value);
    return { value, move, metrics: { ...this.metrics } };
  }

  solveMoves(moves) {
    return this.solve(this.createState(moves));
  }

  solveNode(state) {
    this.metrics.nodes += 1;
    const cached = this.transitionCache.get(state);
    if (cached !== undefined) {
      assertExactValue(cached);
      this.metrics.transitionCacheHits += 1;
      return cached;
    }

    const native = deriveNativeFrontierConsequence(state);
    const facts = this.collectCertificateFacts(state);

    let exact = null;
    let forcedCell = null;
    let p0NoWin = false;
    let p1NoWin = false;

    if (native?.kind === CONCLUSION_EXACT_VALUE) {
      exact = native.value;
      this.metrics.nativeExactHits += 1;
    } else if (native?.kind === CONCLUSION_FORCED_MOVE) {
      forcedCell = native.cell;
      this.metrics.nativeForcedHits += 1;
    }

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

    if (forcedCell !== null) {
      const column = this.columnForForcedCell(state, forcedCell);
      state.applyUnchecked(column);
      this.metrics.forcedTransitions += 1;
      const value = this.solveNode(state);
      state.undo();
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
    for (const column of MOVE_ORDER) {
      if (!state.canPlay(column)) continue;
      sawMove = true;
      state.applyUnchecked(column);
      this.metrics.recursiveChildren += 1;
      const childValue = this.solveNode(state);
      state.undo();
      if (maximizing) {
        if (childValue > best) best = childValue;
        if (best >= upper) {
          best = upper;
          break;
        }
      } else {
        if (childValue < best) best = childValue;
        if (best <= lower) {
          best = lower;
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
      const childValue = this.solveNode(state);
      state.undo();
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
