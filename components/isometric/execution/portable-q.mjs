import { RESIDUAL_TERMINAL_WIN } from '../residual-pool.mjs';
import { MAX_MOVES, Q_IDENTITY_WORDS, Q_PLAYER_WORDS } from './shared-tt.mjs';

export const Q_FLAG_P0_TERMINAL = 1;
export const Q_FLAG_P1_TERMINAL = 2;
export const Q_STATUS_SHIFT = 2;

/**
 * Reusable worker-local E2 scratch for converting one private IsometricState
 * into the exact portable q_r equality representation used by the shared TT.
 * No worker-local class/chunk ID escapes this object.
 */
export class PortableQBuilder {
  constructor() {
    this.words = new Uint32Array(Q_IDENTITY_WORDS);
    this.replay = new Uint8Array(MAX_MOVES);
    this.support = 0;
    this.flags = 0;
    this.orientation = 0;
    this.replayLength = 0;
  }

  prepare(state) {
    const pool = state.pool;
    const reflectedSupport = state.reflectedSupportCode();
    let p0 = state.p0Class;
    let p1 = state.p1Class;
    let reflected = false;

    if (state.supportCode > reflectedSupport) {
      reflected = true;
      p0 = pool.reflectClass(p0);
      p1 = pool.reflectClass(p1);
    } else if (state.supportCode === reflectedSupport) {
      const reflected0 = pool.reflectClass(p0);
      const reflected1 = pool.reflectClass(p1);
      let comparison = pool.compareClasses(p0, reflected0);
      if (comparison === 0) comparison = pool.compareClasses(p1, reflected1);
      if (comparison > 0) {
        reflected = true;
        p0 = reflected0;
        p1 = reflected1;
      }
    }

    this.support = reflected ? reflectedSupport : state.supportCode;
    this.orientation = reflected ? 1 : 0;
    this.flags = (state.status << Q_STATUS_SHIFT)
      | (p0 === RESIDUAL_TERMINAL_WIN ? Q_FLAG_P0_TERMINAL : 0)
      | (p1 === RESIDUAL_TERMINAL_WIN ? Q_FLAG_P1_TERMINAL : 0);

    if (p0 === RESIDUAL_TERMINAL_WIN) {
      for (let word = 0; word < Q_PLAYER_WORDS; word++) this.words[word] = 0;
    } else {
      for (let word = 0; word < Q_PLAYER_WORDS; word++) {
        this.words[word] = pool.wordAt(p0, word);
      }
    }
    const p1Base = Q_PLAYER_WORDS;
    if (p1 === RESIDUAL_TERMINAL_WIN) {
      for (let word = 0; word < Q_PLAYER_WORDS; word++) this.words[p1Base + word] = 0;
    } else {
      for (let word = 0; word < Q_PLAYER_WORDS; word++) {
        this.words[p1Base + word] = pool.wordAt(p1, word);
      }
    }

    this.replayLength = state.ply;
    for (let ply = 0; ply < state.ply; ply++) this.replay[ply] = state.moveCells[ply] % 7;
    return this.orientation;
  }

  canonicalAction(physicalColumn) {
    return this.orientation ? 6 - physicalColumn : physicalColumn;
  }

  physicalAction(canonicalColumn) {
    return this.orientation ? 6 - canonicalColumn : canonicalColumn;
  }
}
