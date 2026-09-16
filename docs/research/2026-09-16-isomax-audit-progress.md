# IsoMax audit: persisted findings, 2026-09-16

**Status:** ongoing audit; not a completed corpus review or optimization qualification.

**Direction:** Josh Oshiro. **Audit and reproduction:** OpenAI ChatGPT.

## Examined checkpoint

Live `isometric` was fetched repeatedly and remained at
`fbb1a1c239f6ad48ede392f3f5d99a0328da9078`. No solver changes have been
made in this audit checkpoint. Node 26.7.0 on Windows passed all 17 existing
`components/isometric/test/*.test.mjs` tests (395.8637 ms total).

The cross-branch research inventory initially found 2,121 distinct Git blobs
across research, research documentation, specifications and root authority/state
files. Inventory is not reading. The comprehensive reading requirement is still
in progress, including historical prototypes and load-bearing external authority.
No claim of a completed research review is made here.

## Reproduced correctness finding: residual-pool namespace

`IsoMaxTransitionCache` hashes local residual class IDs and packed support but
does not bind or check their pool. `IsoMaxSolver` permits a caller-supplied cache
without checking that cache's pool. Its state and certificate-index checks do
check pool ownership, so those checks do not close the cache boundary.

Run from the repository root:

```js
import {
  ResidualPool, IsometricState, IsoMaxTransitionCache,
} from './components/isometric/index.mjs';

const a = new IsometricState({
  pool: new ResidualPool({ transitionPrefixClasses: 16 }),
  moves: [0, 1, 2, 3],
});
const b = new IsometricState({
  pool: new ResidualPool({ transitionPrefixClasses: 16 }),
  moves: [0, 1, 3, 2],
});
const ka = a.transitionSignature();
const kb = b.transitionSignature();
const semantic = (state, key) => JSON.stringify([
  state.pool.terms(key[0]), state.pool.terms(key[1]),
]);
const cache = new IsoMaxTransitionCache();
cache.set(a, 12345);
console.log(Array.from(ka.slice(0, 3)), Array.from(kb.slice(0, 3)));
console.log(semantic(a, ka) === semantic(b, kb), cache.get(b));
```

Observed: both keys are `[10, 11, 8688128]`, residual contents differ, and
`cache.get(b)` incorrectly returns `12345`. Both states come from valid legal
move imports; no fields were manually corrupted. The arbitrary value isolates
cache identity, not a claimed W/D/L differential on these opening positions.

This is a context/namespace omission, not a hash collision and not evidence that
side/status must be restored. Proposed repair after the required reading:
bind exact memoization to one residual pool and reject incompatible reuse;
qualify direct cache use and solver injection. Do not add the full colored board
or proof identity to every key to repair a missing pool boundary.

## Detached commits: initial independent inspection

Each of the six commit diffs and the complete current Isometric implementation
were read. Classification below distinguishes source-level correctness from
unmeasured performance. Additional regression and timing qualification remains.

| Commit | Initial finding |
| --- | --- |
| `2360825` | Scratch aliasing is safe on the current transition-signature path: orientation and stabilizer are consumed before their slots are overwritten; class slots are unchanged. Allocation reduction is real in source; timing not yet measured. |
| `171fa44` | Scalar expressions preserve the old two-half construction and unsigned coercion, including cell 31 and cells 32–41. Full randomized boundary coverage remains to be added. |
| `b17f0ba` | Incoming signature scratch is separate from rehash scratch. Doubling the table while reinserting its old load stays below the growth threshold, so ordinary rehash cannot recursively overwrite its scratch. Repeated-resize/collision qualification remains. |
| `7c107ff` | Useful but incomplete evidence: six prefixes trigger one resize. No explicit collision construction, repeated resizing, mirrored rehash or cross-pool case. |
| `c1d4a36` | Identical mask intersections and consequence priority without temporary mask arrays. Remaining conclusion-record allocation still exists in the recursive path. |
| `fbb1a1c` | Conditional derivation exists for legal move-history imports: side is rank parity; a winning residual sentinel identifies the winner; absent a sentinel, rank 42 means draw and lower rank means ongoing. This does not validate arbitrary mutated state records or cross-pool class IDs. Full supported-domain qualification and documentation reconciliation remain. |

The current C4-0011 and native integration note still describe side/status in
the transition key. That documentation drift must be reconciled after the
supported-domain proof and tests, rather than treating either code or prose as
automatic authority.

## Native path and candidates to qualify

The inspected lane imports move histories directly into `IsometricState`, uses
two pool-local minimal residual classes, increments support/playability and
column heights, and restores previous classes on undo. `IsoMaxSolver.solveNode`
uses this state directly through cache lookup, native frontier consequences,
guarded certificates, legal transitions and exact recursive W/D/L. No recursive
colored-board conversion was found in these modules.

Further work identified by actual code, not yet performance claims:

- The empty certificate index still produces a fresh facts object per uncached
  node. Native consequences also allocate frozen records.
- New residual classes scan singleton bits and allocate a pair. The vocabulary
  sorts singletons first by unsigned geometric mask; investigate whether its
  first 42 bits are already exactly the singleton cell mask, with an explicit
  compilation invariant and differential tests.
- Reflection classes are cached but their lexicographic orientation comparison
  scans words repeatedly. Investigate retaining a proved orientation result.
- Residual/class/table storage can grow in recursion; fixed-storage preparation
  versus growth is an unresolved implementation/authority seam, not something
  the six allocation changes resolved.
- Solver exception paths currently lack guaranteed undo. A failure below a
  transition can leave the caller's state advanced; add a reproducer before
  selecting a repair.

Retain support, first-win stopping, typed guard uncertainty and proof identity.
No stronger structural quotient has been accepted in this pass. Historical
native win-space evidence already shows fewer nodes can still mean slower
execution, so these candidates require paired timing and equal-work checks.

## Research continuation: transition identity and structural closure

The inventory now also traverses `reference/research-prototypes/` on every
inventoried branch. Git-blob deduplication adds 52 distinct blobs (487,571 bytes)
and records 3,979 additional occurrences; renamed identical material is not
silently treated as new evidence. Reading remains incomplete.

The actual chronological performance and structural notes expose the following
constraints and candidates for subsequent implementation qualification:

- [Incremental response closure](2026-09-12-incremental-response-closure.md)
  proves a no-win bound from **both** even remaining capacity in every column
  and coverage of every attacking residual by the paired response mask. This
  is a candidate structural addition to native IsoMax, not permission to erase
  support or treat a one-sided bound as an exact draw.
- [Poisoned-support progress](2026-09-13-poisoned-support-progress-calculus.md)
  supplies a smaller candidate: a forced block immediately below another
  opponent singleton loses when the mover has no immediate counterwin. The
  current native frontier reports the forced block and discovers the result
  recursively. A direct packed consequence could remove that transition;
  independent first-win and boundary controls must precede adoption.
- [Response serialization correction](2026-09-13-center-response-serialization-correction.md)
  downgrades earlier five-diagonal/row-lift arguments to counterfactual static
  coverage because their response reservations cannot coexist in legal time.
  Those earlier conclusions must not become pruning rules.
- [Current causal differential](2026-09-13-current-causal-certificate-differential.md)
  distinguishes an exact support/residual transition quotient from a local
  descriptor that happens to preserve WDL but fails successor congruence.
  The reproduced cache bug is likewise an identity-contract failure, not an
  excuse to accept keys based on coincident observed values.
- [Output provenance](2026-09-13-output-provenance-quotient.md) shows why ordinary
  WDL residual antichains cannot identify original terminal-line outputs.
  IsoMax value memoization need not carry that richer output, but a future
  certificate/output consumer must retain its own required provenance.
- The historical [direct-edge](2026-09-12-direct-semantic-edge-reuse.md) and
  [hash reuse](2026-09-12-state-hash-reuse.md) results favor removing repeated
  transformations. The [chunk lookup experiments](2026-09-12-chunk-lookup-experiments.md)
  reject two caches despite fewer interning calls. These are evidence for
  mechanism-specific measurement, not transferable speedup guarantees.

No runtime code or tests changed in this continuation. The namespace repair,
exception-restoration reproducer, domain proof, targeted tests and paired native
benchmarks remain pending after the mandated complete research reading.
