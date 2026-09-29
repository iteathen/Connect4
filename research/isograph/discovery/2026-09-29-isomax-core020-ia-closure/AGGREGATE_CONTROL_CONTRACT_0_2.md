# Aggregate primitive-control contract 0.2

**Status:** Core-0.20 campaign authority for bounded source assertions SC-E024 through SC-E031  
**Date:** 2026-09-29  
**Research direction:** Joshua Oshiro  
**Native rendering:** `AGGREGATE_CONTROL_CORE020_0_2.isg`  
**Frozen witness:** `AGGREGATE_WITNESS_CORE020_0_1.isg`

This contract makes no algorithm name authoritative. Names are reversible views over the primitive carriers, relations, and recurrences below. The complete verifier mechanically checks the reverse maps against the frozen witness.

## Finite sets and counts

`SET_MEMBER` is the represented extension. `ENUM_AT(S,i,x)` is valid only when it is a bijection from the natural prefix `i < N` onto that extension. `CARD(S,N)` is exactly that statement. `SET_EQUAL(S,T)` is extensional membership equivalence. Thus no counter integer is accepted as an opaque leaf.

## Residual structural recursion

For fixed `(width,height,k)`, the initial state has zero height in every column and the complete geometry-generated k-line mask family as both players' residual antichains. At rank `r`, a legal source column is one whose height is below `height`; the landing cell is the cell at that height, and the mover is the parity of `r`.

For the mover, residuals not containing the landing cell persist; residuals containing it lose exactly that cell. An empty result is a mover terminal. Otherwise the resulting family is reduced to its inclusion-minimal antichain. Opponent residuals containing the occupied cell are deleted; the rest persist. The case's frozen structural closure rules are then applied.

A nonterminal successor increments exactly one source-column height. The whole state—heights and residual-mask cell coordinates—is transported by one complete column permutation; representative selection is merely a view over this exact orbit relation.

Every dependency raises occupied rank by one. Termination therefore follows from the finite cell bound: 16 for 4x4 and 20 for 4x5/5x4. No iteration tree is textually unrolled.

Recursive action-unlabelled classes are built in descending rank. A terminal signature is its represented terminal kind. A nonterminal signature is exactly `(rank,mover parity,extensional set of successor recursive-class identities)`; duplicate successor classes are erased. Action-labelled classes use the same recurrence while retaining literal column positions/inactive markers.

SC-E022 separately closes the producer-input role carrier and proves solved W/D/L is not a producer input.

## Binary continuation and cycle certificates

A deeper group contains exactly the action-labelled classes with one action-unlabelled class and one immediate phase-free literal-column profile. It is binary iff it has exactly two members.

For a binary parent, recursive labelled profiles are compared slotwise. A changed live child pair is binary continuation when it enters a binary deeper group; nonbinary continuation when it enters a larger deeper group; action transporter when immediate profiles differ literally but a complete column permutation maps one to the other; branch/multiplicity erasure when both profiles exist but no such permutation exists; terminal/unknown when at least one profile is absent.

Binary continuation maps the two parent sheets bijectively to the two child sheets. The edge delta is the image of parent sheet 0. Duplicate directed `(from,to,delta)` maps are removed.

The cycle certificate partitions reduced edges into a spanning forest and non-tree closures. Forest depth strictly increases away from roots. Every closure carries the forest endpoint path plus a Boolean XOR prefix beginning at 0; XOR with the closing-edge delta is its syndrome. Hence non-tree-edge cardinality is cycle rank. A contradictory reconvergence carries two directed source-to-target paths whose XOR accumulators end at 0 and 1.

## Current-action transporter parity

A profile token is inactive or a represented child class. Token equality is exact inactive/inactive or equality of live child identity. A width-4 transporter is one of the complete 24 permutations and must map every profile token. All-distinct means no width-4 slot pair has equal tokens. Permutation parity is the XOR of the six represented inversion bits.

Pure-transporter/all-distinct and parity-well-defined are reconstructed as predicates, then compared extensionally. Their counts are derived only through primitive set enumeration.

## 7x6 response incidence and GF(2)

The response-pair carrier is the complete 20-row finite relation. For lower cell `l`, upper cell `u`, and winning line `L`, the P1/L feature is 1 exactly when `l` lies on `L`; the P0/L feature is 1 exactly when `u` lies on `L`. Board lines come from the exact 7x6 geometry kernel.

GF(2) elimination is a bounded feature-order loop using the primitive XOR truth table. The witness supplies both span directions: each input is an XOR of basis rows and each basis row is an XOR of inputs. Distinct highest pivots prove independence. Dependency coefficient parity is zero in every basis coordinate. The augmented carrier repeats the same construction with the unmatched center-top vector.

## 4x4 legal/optimal partial2 recursion

The physical-game recursion starts empty. A legal step occupies the lowest empty cell of one nonfull column. First completed winning line stops the branch; full nonwinning rank 16 is draw. Rank increases once per dependency, so the recursion is well founded.

W/D/L is constructed internally only for the source's optimal-edge predicate: terminal P0=+1, draw=0, P1=-1; P0 takes the maximum child, P1 the minimum; an edge is optimal iff child value equals parent value. No solved table is an input.

Finite sibling loops form legal and optimal child pairs. Each partial2 child vector is determined by represented 4x4 line/pair incidence; sibling delta is bitwise XOR. Deduplication is extensional equality. GF(2) rank uses the same finite pivot recurrence, with both delta-to-basis and basis-to-delta certificates.

## Termination and scope

All recurrences above have explicit finite rank or feature bounds, so no termination QU is used for SC-E024–SC-E031. Generalization beyond these bounded cases is not inferred.

DP, NEI, DTS, Experimental Inquiry, production IsoMax, BSFP, and external solved outcome tables are not authorities for this contract.
