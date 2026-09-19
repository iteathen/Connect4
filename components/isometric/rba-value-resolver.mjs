import { solveRbaWdl, RBA_PROFILE, RBA_RESEARCH_REVISION } from '../bsfp/rba-wdl-reference.mjs';
import { ResidualPool } from './residual-pool.mjs';
import { IsometricState } from './state.mjs';

// Optional ordinary-value authority, never a proof/certificate producer.
// The existing Connect4 RBA implementation owns construction and membership;
// this consumer only maps native pool-local WSL classes into its public API.
export class IsoMaxRbaValueResolver {
  #supports = new Map();
  #requirements = new Map();
  #boundary;
  constructor({ pool, minimumHeights, maxSupports = 4096, maxCandidates = 2_000_000, maxFrontier = 50_000 } = {}) {
    if (!(pool instanceof ResidualPool)) throw new TypeError('RBA value resolver requires its ResidualPool');
    if (!Array.isArray(minimumHeights)) throw new TypeError('RBA value resolver requires an explicit bounded support cone');
    this.pool = pool;
    this.#boundary = solveRbaWdl({ columns:7, rows:6, connect:4 }, {
      minimumHeights, maxSupports, maxCandidates, maxFrontier,
      onSupport: entry => {
        const code = entry.fiber.heights.reduce((code,h,c)=>code | (h << (3*c)), entry.fiber.rank << 21);
        this.#supports.set(code,entry);
      },
    });
    // Publication occurs only after every support is finalized successfully.
    this.profile = RBA_PROFILE;
    this.researchRevision = RBA_RESEARCH_REVISION;
    this.construction = this.#boundary.metrics;
    Object.freeze(this);
  }
  #residuals(id) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Optional RBA conversion cache only. Pool-local IDs are not portable artifact identity; BigInt/object conversion stays outside ordinary worker admission.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    let result = this.#requirements.get(id);
    if (!result) {
      result = Object.freeze(this.pool.terms(id).map(([lo,hi])=>BigInt(lo) | (BigInt(hi)<<32n)));
      this.#requirements.set(id,result);
    }
    return result;
  }
  resolve(state) {
    // OWNER-PROTECTED CALLEE — agents must not remove/weaken this comment.
    // Optional synchronous value path, excluded from sealed workers. A complete boundary may prove WDL; a miss remains unknown and supplies no proof certificate.
    // Inherit the hot-path contract in solver.mjs; qualify changes in the real caller.
    if (!(state instanceof IsometricState) || state.pool !== this.pool) throw new TypeError('RBA state must belong to the resolver pool');
    if (state.isTerminal()) return null; // First-win authority stays with native transition.
    let entry = this.#supports.get(state.supportCode);
    let p0 = state.p0Class, p1 = state.p1Class;
    if (!entry) {
      entry = this.#supports.get(state.reflectedSupportCode());
      if (!entry) return null; // Outside the completed cone is unknown, not draw.
      p0 = this.pool.reflectClass(p0); p1 = this.pool.reflectClass(p1);
    }
    return this.#boundary.evaluate({ heights:entry.fiber.heights,
      p0Requirements:this.#residuals(p0), p1Requirements:this.#residuals(p1) });
  }
}
