# Shallow ordering reconnaissance: research, not an adopted solver design

Date: 2026-09-26. Status: CANDIDATE / NOT IMPLEMENTED / NO PERFORMANCE CLAIM.
Owner question: could a bounded initial eight-ply exploration improve the
direction of the later exact IsoMax search, at an acceptable total cycle and
engineering cost? This note does not restore prior withdrawn move-order
experiments, change specs, or authorize an invasive solver rewrite.

## Primary-source findings

Stockfish main was fetched as `0a215d6c9e48856ef630013b8ab8312941a59057`
(2026-09-22). Its root search uses successive increasing depths, carries prior
root scores/variations, and brings the best variation forward. That supports
the principle of earlier exploration guiding later search, rather than a
universal fixed three-ply initialization rule.

Historical Stockfish 11 has an especially relevant internal ordering search:
when remaining depth is at least seven and no TT move exists, it searches at
remaining depth minus seven, then retrieves a TT move. A ten-ply request can
therefore trigger a three-ply internal probe. This is a specific historical
example, not confirmation of the exact source of the owner's recollection or
a current recommended Connect4 depth. Its root aspiration window also begins
at depth four; these are distinct mechanisms.

Sources:
- [Stockfish pinned search implementation](https://github.com/official-stockfish/Stockfish/blob/0a215d6c9e48856ef630013b8ab8312941a59057/src/search.cpp)
- [Stockfish 11 search implementation](https://github.com/official-stockfish/Stockfish/blob/sf_11/src/search.cpp)

Lc0's documented AlphaZero-style search routes visits using policy and backed-up
value/visit information. Its standard description is MCTS/PUCT, not a fixed-depth
minimax prepass. It supports the broader idea of informed exploration, but its
depth and neural-evaluation economics do not transfer directly to IsoMax.

Source: [Lc0 search primer](https://lczero.org/dev/lc0/search/alphazero/).

Pascal Pons' exact Connect4 solver at
`d6ba50d8aaf2308c769d9bf2abd42d90f34baf41` iterates on score bounds with null
windows. It is not simply a heuristic depth-eight initialization. It is relevant
because superficially similar iterative searches can have different horizon
and exactness contracts.

Source: [Pons pinned Solver.cpp](https://github.com/PascalPons/connect4/blob/d6ba50d8aaf2308c769d9bf2abd42d90f34baf41/Solver.cpp).

## Existing Connect4 evidence

Read at research head `12b76d3b7f5fac7c7cd6a9c4ec31e3ee37e1078c`:

- [Standard 7x6 presearch profile](../../../semantic-quotient/state-identity-unification/QUOTIENT_STANDARD7X6_PRESEARCH_PROFILE_RESULT.md):
  older quotient implementation, hosted runner, 2026-09-11, workflow 34664840273.
  Through six plies it retained 20,917 q states and took about 326 ms. Exact
  layer counts were 1, 7, 49, 238, 1120, 4263, 15239. No tactical closures or
  forced responses were reported through depth four; they appeared at five/six.
  A separate exhaustive two-ply frontier cost probe took 4.064 seconds and
  increased retained q states to 226,246. It supplied little useful scheduling
  discrimination. This was NOT an ordering-benefit test or current Lazy SMP.
- [Candidate N10](../../../semantic-quotient/state-identity-unification/NEGAMAX_OPTIMIZATION_CANDIDATES.md):
  shallow ordering/internal iterative deepening was already identified and
  deferred pending an evaluator/ordering contract.
- [Historical campaign disposition](../../../semantic-quotient/state-identity-unification/NEGAMAX_OPTIMIZATION_CAMPAIGN_RESULT.md):
  reiterates that deferral. This is useful context, not a prohibition on testing
  a better-defined candidate now.

The old three/four-ply scheduling recommendation does not answer the current
question. Work distribution and predictive move ranking have different goals.
Conversely, the old 4.064-second probing cost is an important negative example:
additional exploration must produce useful decisions, not merely more metadata.

## Cost estimate before an implementation

For a single unrevisited tree traversal with at most seven moves per node,
the move-sequence visit ceiling through depth d is `(7^(d+1)-1)/6`.

| Depth | Sequence visit ceiling including root |
|---|---:|
| 4 | 2,801 |
| 6 | 137,257 |
| 8 | 6,725,601 |
| 10 | 329,554,457 |

These are not distinct q counts or predicted executed visits. Terminal stopping,
pruning and transpositions reduce work; extensions, iterative repeats and
multiple independent worker prepasses add work beyond the single-traversal
model. The eight-ply ceiling has 5,764,801 leaves; horizon evaluation cost can
dominate and must be included.

The earlier [five-minute baseline](empty-five-minute/RESULT.md) measured
2434.716 cycles per all-worker visit. Merely multiplying that rate by the
eight-ply ceiling gives 16.375 billion cycles, about 0.372% of its 4.400 trillion
cycle five-minute budget. This is a scale calculation, NOT a measured prepass
cost or an upper bound on cycles. Shallow residuals, leaf evaluation, cache
behavior, reuse, parallel efficiency and initialization may differ substantially.
It supports investigating seconds-scale affordability, not declaring an eight-
ply pass free or predicting its wall time from four-worker aggregate throughput.

Use measured native prepass counts and cycles at depths four and six to project
eight. If counts are N4/N6, a rough per-ply growth estimate is sqrt(N6/N4);
measure cycles per visited node separately. Treat the projection as provisional
because pruning and transposition rates change with depth. Comparing even depths
avoids confusing an elementary side-to-move alternation with ranking stability.

The governing break-even condition is:

`prepass cycles + guided exact-search cycles < baseline exact-search cycles`.

A five-minute timeout gives a budget denominator, not cycles-to-solve. Exact
completion fixtures or well-defined matched completed proof obligations are
needed for a strong savings claim. More visited nodes alone is not such evidence.

## Information value and the smallest useful next step

Inspect the proposed leaf signal before writing a prepass. The current library
at `ec6a602268e5dd281db9cb29b2f4defd47c6d325` scores candidate placement cells
using live-line multiplicity. That is not already a minimax leaf-position
evaluation. CPC may prove closures/restrictions, but treating every other leaf
as equally unknown can leave all root actions tied. A proposed horizon ranking
must explicitly say what is backed up and remain separate from exact WDL.

Before integrating anything into search:

1. Define the output that could change an actual ordering decision, and the
   cold input interface by which it could be consumed. Do not assume changing
   an order array overrides the existing score ordering.
2. In an isolated disposable experiment, measure four/six/eight-ply cost and
   root-action discrimination. Stop under a fixed cycle/time budget rather
   than completing eight plies at any cost.
3. Compare against the existing order. Stable repetition of an already-selected
   center move alone is not evidence of improvement. Include relevant positions
   where the cheap existing order is less informative, with independent solved
   references when available. Ordering toward an optimal move and ordering
   toward the cheapest proof are related but different objectives.
4. Only if a useful signal emerges, test end-to-end cycle savings with the
   original Lazy-SMP diversification retained. Charge setup, observation,
   transport, retained storage and repeated work to the candidate.

No heuristic leaf value may enter the exact-only TT as solved WDL. Prefer
reusing proven facts when the public interface permits, but do not invent a
new cache/lifecycle simply to make a speculative experiment possible.

The owner explicitly values experiment reversibility and context hygiene.
Keep the baseline untouched, place experimental code outside production, and
retain only clear provenance/results if rejected. If the smallest meaningful
probe requires recursion/TT/worker redesign, reassess the experiment before
mutation. This note is research context, not an adopted architecture or an
instruction for a future agent to implement it automatically.
