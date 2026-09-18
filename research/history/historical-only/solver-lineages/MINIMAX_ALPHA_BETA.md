# Historical solver lineage — Minimax / Negamax / alpha-beta

**Disposition:** historical-only solver lineage  
**Retired active branch:** `solver/minimax-alpha-beta`  
**Final observed branch head before retirement:** `c25de7ddab5dcae525a250331cd6c74bd94beb4e`  
**Active successor for forward structural exact solving:** `solver/isometric`

## What this lineage was

This lineage collected the conventional exact-search program and its structural descendants:

- minimax / Negamax / alpha-beta;
- null-window exact solving;
- transposition-table design;
- fixed-width position representation;
- rank-banked and decision-state storage;
- shared-TT and multicore/YBWC experiments;
- win-space / residual-state recursive search;
- forced macro transitions;
- structural implication and terminalization;
- move/proof ordering;
- early Allis/VICTOR-derived exact-certificate experiments.

The branch ultimately became a consolidation/preservation surface rather than a promoted production solver.

The accepted incumbent Node search implementation remains on `main` as a baseline/reference/conformance implementation. That retained baseline is not an active solver-family lane.

## Important implementation lessons preserved

### Fixed-width exact search mattered

The September 8 exact-solver work established that conventional JS object-heavy search was not the only viable Node shape. The lineage explored two-word/fixed-width state arithmetic, direct-mapped TT layouts, rank banking, null-window convergence, shared tables, task-local controls and coarse parallel work.

The important surviving lesson is broader than any one layout:

> exact search economics are strongly shaped by representation width, memory locality, state admission and proof reuse; reducing abstract nodes is not sufficient if the representation makes each node much more expensive.

### Exact key compression

One controlled TT experiment reconstructed exact 49-bit position identity from TT index bits plus one stored 32-bit key word.

The experimental entry shrank:

~~~text
14 bytes -> 10 bytes
~~~

at equal entry capacity, a **28.57% reduction in TT backing memory**.

This was exact reconstruction, not a probabilistic fingerprint.

The general lesson survives:

- hashes/fingerprints may address or reject;
- exact identity must still be recoverable/compared;
- table layout can materially change solver economics independently of search semantics.

### Decision-state / rank work

The lineage explored:

- intrinsic rank banking;
- decision-only TT admission;
- forced single-choice transit compression;
- proof-frontier retention;
- compact exact keys.

Useful structural lesson:

> states that do not represent a choice need not always consume the same retained proof/storage resources as branching decision states.

That insight survives independently of the retired solver family.

## Semantic residual / MQ5 result

The strongest late Minimax experiment replaced physical recursive identity with:

~~~text
support / column heights
+ normalized current-player residual requirements
+ normalized opponent residual requirements
~~~

using WSL-625 u16 requirement IDs.

On two frozen exact-search anchors, while holding the alpha-beta policy and 512K TT-slot control aligned, semantic residual identity reduced proof nodes:

~~~text
loss anchor:
    baseline nodes  1,014,754
    residual nodes    786,581
    reduction          22.48%

win anchor:
    baseline nodes  5,261,422
    residual nodes  4,138,812
    reduction          21.34%
~~~

TT writes also fell:

~~~text
loss write ratio  0.759589
win write ratio   0.771847
~~~

and TT hit ratios did not fall:

~~~text
loss hit ratio  1.057512
win hit ratio   1.013107
~~~

This is important historical evidence for the later q-state direction.

### Representation cost warning

The WSL-625 prototype preserved the reduced search tree but remained much slower than the optimized fixed-width baseline:

~~~text
loss elapsed ratio  11.21x
win elapsed ratio   15.41x
~~~

The dominant remaining costs were generic JS `Map` / BigInt based state interning and transition caches.

This is a durable negative lesson:

> semantic compression is not automatically runtime compression. Measure total solver economics, not just node count.

The same discipline applies to current IsoMax and BSFP q-native work.

### Boundary defect worth preserving

An early WSL-625 run returned the wrong loss-anchor score because the implementation confused:

~~~text
42 playable cells
~~~

with the native fixed-width solver's:

~~~text
49-bit sentinel-stride coordinate domain
~~~

Playable cells extended through native bit index 47, while the first transition table covered only indices 0..41.

This is a durable implementation warning:

> semantic cell count and native coordinate/address domain are distinct contracts.

## Structural search discoveries that survived the solver

The Minimax research lineage helped expose several ideas that became solver-neutral research rather than Minimax-owned facts:

- residual winning requirements;
- positive/minimal antichains;
- support-aware future-event state;
- residual automorphisms;
- exact forced transitions;
- blocker/implication reasoning;
- parity/response structure;
- distinction between representation identity and proof authority;
- exact terminalization before generic recursive work.

These now belong to canonical research and/or active Isometric/BSFP contracts rather than to a Minimax branch.

## Important negative / corrective results

The lineage intentionally retained adverse experiments. The most useful broad corrections were:

- complex dependency/chunk TT routing frequently cost more than it saved;
- sharing mechanisms need measured locality/overlap rather than assumed global benefit;
- a smaller semantic search graph can still run slower when each state is expensive to construct, intern or compare;
- finite solved-data agreement does not promote a structural hypothesis into a theorem;
- forced transitions and terminal facts must preserve root-entry/first-win preconditions;
- exact identity may not be replaced by hash equality;
- scheduling/parallel mechanisms are separate from semantic proof identity.

These constraints remain relevant to active solver work.

## Why this solver family became historical

The project no longer needs a separate conventional Minimax/Negamax implementation lane.

The forward exact-solving direction has moved to IsoMax / Isometric, which already:

- carries residual/support-native state;
- consumes structural consequences and guarded certificates before recursion;
- uses exact recursive W/D/L only for unresolved residue;
- has an explicit q/gameplay identity direction;
- keeps proof identity separate from gameplay identity.

Maintaining the older Minimax family as a parallel active solver would duplicate forward-search ownership without adding a distinct current strategic direction.

## Preservation boundary

Do not resurrect `solver/minimax-alpha-beta` merely to recover an old technique.

When a historical mechanism is useful:

1. identify the mechanism/result from this note and Git history;
2. restate it against current canonical research/guards;
3. implement it in the current owning solver only if it still fits that solver's architecture;
4. requalify rather than treating historical measurements as current authority.

The final branch head above is recorded for provenance. Git history remains the source for obsolete implementation bytes; the live research tree preserves the knowledge rather than a duplicate executable solver.
