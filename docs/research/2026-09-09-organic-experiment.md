# C4 organic remaining-game experiment

Date: 2026-09-09. Research evidence only; not maintained implementation.

## Result

A real structural opportunity survived correctness checks and a favorable but
explicitly selected workload. Root-time winning-requirement reduction identifies
columns whose remaining spaces cannot participate in any relevant victory.
Their physical moves are collapsed into one canonical neutral action; turns and
remaining capacity are retained, and irrelevant stone colors are omitted from
the root-scoped TT key.

In the 54-position structural stress cohort, the integrated paired-word kernel
reduced nodes from **112,174 to 76,853 (31.49%)**.
The reversed-order confirmation reduced median compile-plus-search time from
**17.918 to 12.784 ms (28.65%)**.
Including the measured full-table invalidations, the medians were
**28.536 vs 23.541 ms**, or
**17.51%** lower.
These are sums across the 54 roots, normalized to one cold solve per root, not
latency for a single position. Five repetitions, 16 fresh-table iterations per
recorded batch; all repetitions, including the slower first one, retained.

The untouched survivor holdout did NOT demonstrate a general speedup. On its
24 structurally eligible late roots, nodes fell from 923 to 694 (24.81%), but the
saved search was too small to repay setup. On its 80 unfiltered survivor roots,
this root-only neutral treatment did not reduce nodes at all. This is a
conditional mechanism win, not a new universally faster solver.

## Question and implementations

The question was whether preserving the remaining game's structure can remove
work organically, rather than requiring a more elaborate TT allocator.

1. **Baseline:** exact preserved two-word bitboard solver, unchanged.
2. **lines:** compile root-viable winning requirements; scan numeric masks.
3. **minimal:** also remove duplicate/superset requirements per player.
4. **minimalNeutral:** use minimal goals, collapse certified neutral actions,
   and erase irrelevant neutral colors from the key.
5. **gate:** pay the same root compiler cost but use the original kernel, with
   the trivial no-goal draw certificate available. No sampled root used that
   draw shortcut.
6. **actionsOnly / keyOnly:** development ablations isolating move-class
   collapse from neutral-color key normalization.
7. **integrated:** compile masks at the root and feed them into a narrowly
   generated derivative of the original fast kernel; when no dead column
   exists it uses the unmodified kernel. Both facades share the SAME TT arrays.

The native requirement scanner was slower on early roots. This was not treated
as a refutation of the abstraction: the integrated variant keeps the original
bitboard operations and adds only the compiled neutral restrictions/key mask.
The original prototype and unfavorable measurements remain preserved.

## Structural argument and boundaries

For one player, a viable winning line is represented by its remaining empty
cells. If requirement A is a subset of B, completing B cannot win before A;
blocking A also blocks B. Removing B preserves terminal-game outcomes.

A column is eligible only if its ENTIRE unfilled portion is absent from every
retained requirement of BOTH players. It remains eligible through descendants:
requirements only shrink or disappear, and a discarded superset cannot become
necessary after its subset is blocked or completed. A neutral move consumes
one turn and one available space. Canonically filling the first eligible
column preserves the remaining active game and neutral move count.

This experiment does not remove tempo, approximate the score, or use a
probabilistic key. Actual occupied-cell count and side-to-move remain exact.
Normalized current bits remain a subset of the occupancy mask, so the original
paired-word position encoding uniquely identifies that normalized board.

The root compiler's meaning is LOCAL to its solve. Its table is invalidated
before a new root is prepared. Cross-root quotient-key reuse is NOT qualified.
No new map lookup, allocation, scheduler polling, redirect, or cleanup policy
occurs inside negamax. The native scanner uses fixed numeric arrays. Object
construction in the cold compiler is included in setup time.

The small-board semantic test groups states by full reduced requirements,
active column heights and neutral capacity. The 7x6 timed implementation does
NOT yet use that full semantic signature as its TT key; it implements only
root goal reduction and the neutral-specific quotient. Do not transfer the
small-board compression percentage to the 7x6 timed kernel.

These equivalences concern exact terminal-game scores, NOT preservation of the
product's frozen custom heuristic evaluator. No maintained evaluator changed.

## Fairness

All timed modes use the same exact distance-sensitive score, same tactical
preconditions, same center tie order and winning-cell move-ordering meaning,
same 14-byte full-key direct-mapped TT format and same entry count. No extra
TT is secretly allocated by the integrated wrapper.

One Node process / one search worker; Linux x86-64, AMD EPYC 9V74,
Node 22.16.0. Arrays are allocated before timing; every root starts with an
invalidated table. Root compilation is timed. Table clearing is outside the
compile/search segments but is separately measured and included in the second
result column below. No claim about cold process startup is made.

TT capacity was 128K and 512K on the untouched holdout; stress confirmation used
128K (1.75 MiB of TT arrays). Every mode also reserved 64 KiB of typed scratch.
Transient root-compiler JS object allocation is timed, but exact peak total
heap bytes are NOT claimed equal. Process memory snapshots are in raw output.

Warmup roots are separate from holdout roots and exercise both ordinary and
neutral branches. Mode order rotates by root and repetition, reverses on odd
repetitions, and the confirmation starts with the reversed mode list.
No opening book, GPU, worker scheduling, different objective, or heuristic
move-order change was introduced.

## Workloads and selection

Development and holdout each contain 80 nonterminal survivor rollouts, 16 at
each ply 18/22/26/30/34, plus 24 mechanism-enriched roots. These are conditional
survivor distributions, NOT actual played-game samples. Enrichment requires at
least two certified neutral columns, nonempty remaining goals, and no current
immediate win; no scores, node counts or candidate timings select these roots.

Development enrichment screened 7291 candidates; holdout screened
9952. A separate search for no-goal draw roots found none among
15,000 attempted candidates per split. That negative search is retained.

The untouched holdout was frozen before measurement. After its neutral cases
proved too small to amortize setup, a NEW, separately labeled exploratory
stress cohort was generated from DEVELOPMENT roots only: bounded backward
removal of stones while preserving certified neutral columns, followed by
finding and checking a complete legal forward move sequence. The 54 retained
ancestors span plies 19..33. Selection is structural and favors fewer occupied
cells, never candidate speedup. Related ancestors are not independent samples.
The positive stress result is NOT relabeled as untouched holdout evidence.

## Correctness qualification

- All **4,659 reachable nonterminal states** of 4x3 connect-3 were exhaustively
  visited. Their full semantic signatures formed **3,670 classes** (989 merges,
  21.23%). All merged states agreed on successor classes/actions and exact
  value; 11,818 edges and 24 alternative-neutral successor checks passed.
- Each requirement kernel checked 120 small-board roots against the exhaustive
  values, including the empty small board.
- **80 independent 7x6 cell-array endgame roots** (plies 32/34) and **187
  nonterminal child action values** agreed across baseline and candidates.
  Immediate winning actions were checked directly.
- **240 winning-cell-mask comparisons** against cell-array geometry passed.
- Larger historical roots 663152175 and 41267575 agreed in score; raw/minimal
  scanners had identical node counts to the baseline. This is differential,
  not independent, certification of those earlier roots.
- All **54 stress scores** were independently verified. A cell-array
  alpha-beta oracle without TT completed 47 and hit its 5M-node limit on seven.
  A separate cell-array memoized oracle checked eight completed controls and
  all seven remaining cases. Every result agreed. Both oracle sources and
  every capped/complete result are preserved.
- All 104 holdout roots completed in every measured mode at both capacities;
  no timed solver node limit was reached. Their full set is differential
  qualification, not independently certified by the cell oracle.

## Stress confirmation (128K TT)

| Mode | Nodes | Compile + search, ms | Including clearing, ms |
| --- | ---: | ---: | ---: |
| baseline | 112,174 | 17.918 | 28.536 |
| gate | 112,174 | 18.073 | 28.558 |
| minimalNeutral | 76,853 | 15.709 | 26.604 |
| integrated | 76,853 | 12.784 | 23.541 |

Median compile+search and median clear-inclusive columns are each calculated
from the corresponding per-repetition sums, not sums of unrelated medians.

Example: legal sequence 5444456555656667777 (19 occupied cells), exact draw,
searched 23,675 baseline nodes versus 15,728 integrated nodes. It is a
mechanism-stress example, not an ordinary-game performance claim.

## Failure/correction record

- The first requirement scanner lost wall time on early roots. Kept as v1.
- The first development timing inadequately warmed the rare neutral hot path.
  Kept; v2 explicitly warms that path and batches tiny solves.
- v2 initially failed before searching because Array.map passed its index as
  the parser's geometry argument. The failed source/stdout/stderr remain;
  correction uses an explicit one-argument callback.
- The tool's 20-second limit interrupted the five-repeat development v2 run
  during its fifth repetition. Four complete repetitions were used for
  development assessment; the partial fifth remains raw and is not presented
  as a complete cohort. All final holdout and stress runs completed.
- The nonmemoized independent oracle capped seven stress roots; their later
  memoized verification does not erase that evidence.

## Disposition and next seam

There is now evidence that the neutral-resource abstraction can preserve exact
results and reduce total work AND elapsed time when enough suitable work exists.
There is also direct evidence against charging the full compiler to every
small/easy root. The next promising integration is cheaper structural
certification or reuse of already-available winning-line state at genuine
coarse boundaries, not simply adding more allocator/scheduler machinery.

Full dynamic requirement quotient keys, dynamic dead-column discovery,
occupancy-based TT banks, address/remainder keys, and proof-obligation task
sharing remain separate, untested combinations in this unit.

## Preservation and reproduction

The experiment is preserved as a standalone research packet, not committed to
GitHub in this run. No repository write occurred; no maintained source or
main branch was changed. All benchmark processes have exited.

Read remote before work: main de47d43f4f4133a68973d0876a402531ef5735da;
research ed5f2eb2b0e021ba3336265696696da9262cd47a. Imported baseline blob
965c3806c92a7add544dce4777d965b3e12376d6 was verified from actual file bytes.
The prior uploaded research archive supplied the identical baseline file;
none of its historical results are used as new measurements.

From the extracted packet root, no npm installation is needed:

```sh
node reference/research-prototypes/2026-09-09-organic/qualify.mjs
node reference/research-prototypes/2026-09-09-organic/qualify_integrated.mjs
node reference/research-prototypes/2026-09-09-organic/benchmark_v2.mjs holdout 17 3 16 baseline,minimalNeutral,gate,integrated
node reference/research-prototypes/2026-09-09-organic/stress_benchmark.mjs development 17 5 16 integrated,gate,minimalNeutral,baseline
node reference/research-prototypes/2026-09-09-organic/stress_oracle.mjs
node reference/research-prototypes/2026-09-09-organic/stress_oracle_memo.mjs
```

All exact stdout/stderr, corpus seeds and positions, original failed versions,
source-generating wrappers, generated source and source identities are under
reference/research-prototypes/2026-09-09-organic/ and
docs/research/evidence/organic/. Raw output is the primary record;
summary.json/final-summary.json and this report are derivatives.

## External research leads (not implementation authority)

- Pascal Pons, Part 9: https://blog.gamesolver.org/solving-connect-four/09-anticipate-losing-moves/
  Confirms the no-current-immediate-win entry precondition of nonlosing-move
  pruning. Existing owner-provenance source was reused; outside code was not.
- John Tromp: https://tromp.github.io/c4/c4.html
  Background on compact Connect Four bitboard state identity.
