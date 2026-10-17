# Frozen hypothesis: source-only column-permutation full-future alternating simulation

**Date:** 2026-10-17 Pacific. **Current HEAD at freeze:** `c073f29c94af239afe6f9dfb9f532acf9c56566d`.
**Research owner:** `research/semantic-quotient`. **Status:** FROZEN MATHEMATICAL PLAN, NOT COMPLETED EVIDENCE.
**Owner-primary question:** eliminate independent strategic branches while returning exact W/D/L and **all** equally optimal legal action labels. Avoid deeper BDD/QBF compilation and hidden continuation search.

## 1. Exact proposed source relation and proof before any oracle

For two LEGAL NONTERMINAL residual games q_A and q_B on the same W×H board, with the same side-to-move, a **column transport** `π` is a permutation of {0,…,W−1} satisfying h_A[c] = h_B[π(c)] for every c. Consequently, each available future cell (c,r), r≥h_A[c], maps bijectively to (π(c),r), r≥h_B[π(c)]. Every gravity-legal choice word c_0,… is mapped to π(c_0),… with the SAME legal/full-board timing. The move owner alternation is unchanged.

Define the mapping φπ on finite future cell sets. If

    φπ(U_R0(q_A)) ⊆ U_R0(q_B)
    AND
    U_R1(q_B) ⊆ φπ(U_R1(q_A)),

then **candidate theorem** `V(q_A) ≤ V(q_B)` for unrestricted P0-relative ordinary W/D/L, by source residual favorable-upset isotonicity and induction through EVERY future legal action along π (not by checking game continuations). Need explicit first-win terminal comparability; the two source positions are both nonterminal and one implication has the correct favorable direction for each player. Mutual implication (possibly with a different permutation) gives equal unrestricted W/D/L values. Exact full future-game isomorphism / all subsequent optimal action label transport requires BOTH upset equalities under ONE consistent fixed π, a stronger condition than scalar equality.

For q_A and q_B obtained from the SAME P1-to-move source q by distinct first responses b,c, compute their SINGLE-MOVE residual cofactors directly from ORIGINAL parent R0/R1:
  - P1 first landing x_b=(b,h[b]); R1_b=Min({r\{x_b}:r∈R1}), R0_b=Min({r∈R0:x_b∉r});
  - analogously for c.
The candidate must NEVER construct or evaluate future game continuations, policies, solved labels or full action-QBF. It may construct these single-move *residual arrays* without materializing successor q objects; count all work.

For q_b vs q_c, heights differ; the permutation above is a concrete exact **multi-response matching map**. It matches EVERY later action (not just one ownership-swap diamond), and is thus a sufficient **root-branch** weak dominance certificate if the residual upset condition holds. For P1 to move, b has no HIGHER P0 result than c if `V(q_b)≤V(q_c)`. This safely eliminates c for obtaining the SCALAR P1 minimum, but c may tie and cannot be excluded from the COMPLETE optimal move set without a separate strict value or bidirectional order certificate.

**This is an exact sufficient criterion only.** A nontrivial nonreflection column permutation may be allowed when original residual obligations already blocked by opponent stones have fewer geometric constraints than the raw board, but never infer a column permutation is legitimate without checking ALL remaining normalized residual requirements and every legal landing. A permutation need NOT preserve the original geometric winning-line set provided it preserves the two actual source-residual future winning upsets.

## 2. Constructive enumeration and resource limits

Build admissible π only by HEIGHT equality, and use source-contracted residual generator signatures for further sound pre-pruning (e.g. residual degree histograms, terminal one-cell incidences). Search up to W! finite *column permutations*, **NOT future move sequences**; the number of candidates and generator containment checks must be reported (including failed ones). Stop per source compile at 60,000 retained nodes/objects, 300,000 nontrivial source bitset/permutation operations, 10,000 support reps and 15s. An ordinary W! permutation enumeration can be expensive but is bounded at W=7; any resource partial remains UNKNOWN, not negative equivalence evidence.

Output all original action labels, each candidate (b,c) relation direction, a witnessing permutation and generator-containment witness, reflection/nonreflection flag, and counts of eliminated distinct full-future VALUE evaluations for scalar min under proved weak dominance. Do not use mere equality of bounded response signatures.

## 3. Predeclared independent falsifiers

1. Generic finite residual-upset/permutation inclusion and one-step cofactor closure tests; compare swapped source h under arbitrary π, include empty residual pools, terminal-first-win and full-column guards, and a deliberately broken capacity permutation (must FAIL).
2. Complete physically legal nonterminal P1 source corpora of **4x3-c3** (2,208) and up to 4x4-c4 (67,992, if computationally affordable), with source-derived P1 children and external exact-q full-game recursion used ONLY by independent VALIDATOR after certificates. Count all false value inequalities, incorrectly claimed full-future equivalences and wrong transported legal actions. Count unique q+action pairs, not repeated physical histories.
3. Mandatory known scope-breakers `111` (4x3) and `1111222234334` (4x4), whose bounded reply signatures match but unrestricted W/D/L differ; `223` ∀∃ noncommutation; standard7x6 `44444` seven P1 first choices including center-fill b=4. Baseline genuine horizontal-reflection pairs {1,7},{2,6},{3,5} must be provable using the exact transport, but no W/D/L label may be assumed.
4. Explicitly compare with reflection-only quotient, report NEW nonreflection full-future weak-dominance/equality pairs (if any), and determine whether they save downstream universal branch values at the root. If no positive new relations, record a bounded *negative* candidate result—not a universal impossibility theorem.

No authority promotion, merge, solver integration or new unrestricted W/D/L result without an independent full-game certificate.
