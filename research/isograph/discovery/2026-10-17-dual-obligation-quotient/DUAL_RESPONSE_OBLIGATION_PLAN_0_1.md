# Frozen experiment: exact universal-response antichain quotient, not symbolic depth expansion

**Date:** 2026-10-17 Pacific. **Live HEAD at experiment freeze:** `4adcf4c68017f8c75695d6ad1cbe25b80b498505`.
**Owner:** `research/semantic-quotient`. **Status:** FROZEN, not evidence/qualification.
**Objective:** owner-prioritized elimination of independently expanded strategic response obligations. Do NOT optimize another whole-game BDD, QBF compiler, GC, node order, or deeper support cone.

## Abstract mathematical object / theorem candidate

For a finite action-labelled response relation P(b,a) in a single guarded bounded obligation block, define
  S_b={a in A : P(b,a)=true};
  K_a={b in B : P(b,a)=true}.
An opponent response b1 is **dominated as a UNIVERSAL obligation** by b2 when S_b2 subseteq S_b1. Then both
  forall b exists a P(b,a)   and
  exists a forall b P(b,a)
are determined by only the inclusion-MINIMAL distinct S_b (retain ALL original b labels/transporters for output). The first is true iff no minimal S_b is empty; the second iff intersection of all minimal S_b is nonempty. The sets of b with S_b empty, and the sets of b whose pointwise binary fixed-horizon value is the same, remain reconstructible from original signatures, not guessed from a collapsed class. This dual quotient is a direct exact algebraic law, independent of a solution policy.

**Do not** misstate this as a cross-depth strategy elimination theorem. A future-dependent family S_b(z) may be quotiented only if subset inclusion is certified **pointwise over every relevant z** (with original first-win, response legality, capacities and mover guard). If different b change the domain/legal meaning of z, first totalize guarded P and prove a *common-domain* transport. No illegal quantified permutation.

## Predeclared proof / controls
1. Prove finite exact union/intersection identities for antitone response neighborhoods, including empty-action-set and terminal-losing reply signatures, all equal rows, and the legal 4x3-c3 prefix `223` response rows `[0xe,0x4,0xe,0x7]`, where `forall b exists a` is true and `exists a forall b` false.
2. Implement a **source-response-mask** dual quotient that obtains S_b by transposing the already derived original-source `K_a` masks, returns minimal universal obligation signatures with their original source reply labels and explicit full transport. Count all W^2 transpose tests, pairwise subset comparisons, antichain construction and final conjunction/union logic. Do not materialize descendant q values or winning policies in the PRODUCER.
3. An independent generic Boolean-matrix falsifier checks all 65,536 four-by-four relations and 16 scoped legal reply masks per relation. It compares direct original response matrix quantifiers and exact preserved label outcome sets to antichain compression; source input mask legality must be explicit.
4. Independently validate source-q response masks from real legal 4x3-c3 P1-to-move positions exhaustively (all 2208 known) and 4x4-c4 P1 positions if bounded, plus `223` and canonical `44444`. Source physical q state generator and qualified child-q response-cover/physical comparators are **VALIDATION ONLY**, not candidate input from solved labels. Preserve historical negative physical results and run no unrestricted game-tree minimax in the candidate.
5. Measure actual universal reply obligation reduction (number of legal replies vs number of minimal signature groups), number of strict dominances, duplicated signatures, nonreducible antichains, and TRUE/FALSE distribution. Preserve all original action labels even when abstract signatures are equal. Compare to earlier one-sided maximal response-cover family: dual quotient complements it and must not claim to be an entirely new arbitrary-depth strategic solver.
6. Resource envelope per SOURCE operator: 60,000 representation nodes, 300,000 nontrivial Boolean/bitset operations, 10,000 support representatives, 15 seconds; 4x4 exhaustive validation corpus may require multiple independent <=15s batches. Explicitly count all source computation and verification work, no silent cap changes.

**Success:** a proved and falsified exact reduction of universal response obligations, with quantified measured work saving at that level. Conditional arbitrary-depth lift must be separately proved, not merely asserted. Unrestricted standard7x6 `44444` WDL and complete WDL-optimal move set remain UNKNOWN. No game-theory authority promotion, no merge.
