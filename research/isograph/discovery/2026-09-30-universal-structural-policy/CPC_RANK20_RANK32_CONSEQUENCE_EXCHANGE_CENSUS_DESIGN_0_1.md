# RLC rank-32 consequence-class exchange census 0.1

**Date:** 2026-10-01  
**Status:** frozen exact-q exchange design before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source

Consume only:

`CPC_RANK20_FORCED_C3_RANK5_LOCAL_GRAMMAR_PROBE_0_1.json`.

The frozen source contains 36 rank-5 root-action attempts whose first unresolved lower state is an exact rank-32 q state.

Those 36 attempts collapse to:

- 24 distinct exact-q classes;
- 12 singleton classes;
- 12 classes occurring exactly twice.

Every repeated pair observed in the frozen source shares a rank-28 physical prefix and reaches the same exact q after two different four-event suffixes.

## Purpose

Determine whether the recurring rank-32 consequence classes arise from a small exact exchange / trace structure rather than accidental duplicate paths.

Do not increase proof-grammar depth.

Do not use W/D/L.

## Part 1 — reconstruct exact unresolved transition rows

For every `NO_RANK_LE3_PROOF` row:

1. reconstruct the source rank-30 leaf;
2. append the attempted P0 root action and the recorded P1 reply;
3. independently recompute the resulting rank-32 exact q key:
   - rank / side;
   - support;
   - normalized P0 residual antichain;
   - normalized P1 residual antichain;
4. require the recomputed q-class ID to match the frozen source.

## Part 2 — repeated-class rank-28 ancestor recovery

For each of the 12 repeated exact-q classes:

1. take its two complete rank-32 physical sequences;
2. compute their longest common prefix;
3. require the common prefix to have rank 28;
4. retain the two four-event suffix words;
5. require the two suffixes to have the same column-event multiset.

A failure of any condition is preserved as a falsifier of the proposed exchange interpretation.

## Part 3 — complete four-event multiset permutation census

For each repeated class:

1. enumerate every distinct permutation of its four-event multiset;
2. replay from the exact common rank-28 ancestor;
3. classify each permutation as:
   - illegal before four events;
   - terminal before four events;
   - nonterminal rank-32 exact q;
4. for every nonterminal result record:
   - support;
   - normalized P0/P1 residual antichains;
   - exact q-class ID;
5. partition legal nonterminal words by exact q identity.

The original repeated class is an **exchange orbit** only if both frozen source words land in the same exact-q block, as they already should by reconstruction.

Do not assume all permutations belong to that block.

## Part 4 — minimal word-exchange graph

On the legal nonterminal permutation words for each multiset:

- connect two words when one adjacent transposition turns one word into the other;
- label each edge:
  - `Q_PRESERVING_SWAP` if exact q is unchanged;
  - `Q_CHANGING_SWAP` otherwise.

For the two frozen source words, compute the shortest path through permutation words:

- unrestricted adjacent-swap distance;
- shortest all-q-preserving path if one exists.

This distinguishes:

- direct/local commutation;
- multi-step exact exchange through intermediate equal-q words;
- convergence without an all-q-preserving swap path.

## Part 5 — motif normalization

Normalize each repeated-class result by:

- equality pattern of the four-event word (for example AABC or AABB);
- source-word permutation pattern relative to first occurrence labels;
- q-orbit size;
- total legal nonterminal permutation count;
- q-preserving swap-edge count;
- whether the two source words are joined by a q-preserving path;
- support delta from rank-28 ancestor;
- changed normalized residual sets.

Group exact recurring motif signatures.

## Interpretation

Strong positive evidence would be:

- the 12 repeated q classes reduce to a small number of exchange motifs;
- several independent ancestors share the same q-preserving permutation topology;
- source pairs connect through short q-preserving swap paths.

Negative evidence includes:

- every collision has a unique permutation topology;
- source convergence occurs only through q-changing intermediate words;
- same event multiset generally maps to many unrelated q classes.

## Boundary

This is exact transition algebra only.

No oracle, solved W/D/L, minimax, unrestricted search, best-move table, opening book, BSFP solved frontier, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

A q-preserving exchange motif is not yet a winning certificate. It is a candidate consequence-class transport identity.
