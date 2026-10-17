# Frozen experiment: guard-complete bounded action-threshold QBF and quantified width 0.1

**Date:** 2026-10-16. **Live research HEAD at plan freeze:** `56afca02de55d4ac94c7edd44d568fc90234e29f`.
**Owner:** `research/semantic-quotient`. **Status:** PRE-IMPLEMENTATION PLAN. Not a certified full-game result.

## Mathematical claim to prove BEFORE game-value comparison

For legal first-win-stopped source `q=(h,R0,R1)`, horizon `k<=remaining cells` and source rank parity defining alternating mover `p(t)`, construct a deterministic Boolean circuit on binary-labelled, quantified `ceil(log2(W))`-bit action blocks.

**No forward continuation discovery in producer**:
- `E[t,c,j]` is exactly the Boolean event that c occurred j times among the first t proposed move labels. Build by an algebraic recurrence, NOT enumeration of action words.
- `land[t,c,r] = (action[t]==c) & E[t,c,r-h_c]`, with `0 <= r-h_c < H-h_c`.
- `owner[p,t,x]` is the OR of all prior landing events at cell x on p's turns.
- `win[p,t]` is OR over source minimal R_p, AND over cells x in each residual requirement of `owner[p,t,x]`. Because no source line is already complete and first-win stops immediately, this is exact for all legal, live prefixes.
- `valid[t]` requires decoded column in range and its previous occurrence count less than remaining capacity. `last[t]` means sourceRank+t+1=N; a nonwinning last move draws.
- Fold result from the horizon backward: if invalid, P0's existential action is **FALSE** and P1's universal action **TRUE**; if current mover first wins return its fixed WIN/NONLOSS threshold; if last legal move draws return (WIN false, NONLOSS true); else continue. At a nonterminal cutoff use the four existing `Wlo,Nlo,Whi,Nhi` truth bits (0,0,1,1).

Quantified prefix: original alternating owner blocks unchanged; each binary action bit block is all existential on P0 turns or universal on P1 turns. One-hot action labels are NOT new quantified actions. Retain a distinct fixed-first-action query mode for testing literal action values. Exponential action-word enumeration is forbidden in construction.

Use hash-consed binary AND/OR gate DAG and Tseitin equivalence clauses. All internal gate variables are existential and **deterministically constrained**. Two prefix realizations:
1. **postfix aux**: all gates quantified in a final existential block, avoiding any unsupported dependency reduction;
2. **stage-local aux**: a gate is introduced existentially immediately after the last action block on which it transitively depends. This is sound because its unique truth depends only on that earlier prefix; prove no later action input reaches it. Both variants must be independently checked. The trivial *total order of the actually emitted prefix* is an automatically sound permutation dependency poset for the Ganian–Gründel theorem; do NOT call syntactic absence a complete dependency scheme.

## Independent falsifiers and limits

- Source positions from independent physical legal histories on 4x3-c3, 4x4-c4, standard 7x6-c4, including legal `223` and canonical `44444`. Predeclare each seed; reject already terminal sources.
- For k<=4 on small boards and k<=3 on standard 7x6 (plus bounded `44444` k4 if cost allows): independent **physical first-win transition** validator computes terminal/illegal outcome for every proposed action tuple. The validator alone may enumerate tuples; producer must not.
- Check each tuple against all four circuit outputs and each complete Tseitin clause assignment derived from gate values. Compare full alternating ∃/∀ aggregates, including a first-action-fixed restriction and both quantifier orders, against an independent physical finite-horizon minimax. Explicit counterexamples for P1 invalid code, full column, early terminal absorption, P0 invalid, and four-threshold cutoff.
- Count gate nodes, actual binary operations, CNF clauses/variables, edge count, construction time, AND/OR work and every examined physical validation tuple separately. No oracle/solved policy feeds the producer.
- Construct two genuinely **valid trunk-aligned path decompositions** on the actual Tseitin CNF graph, not the original source residual hypergraph: original-prefix forget order along trunk satisfies (P2) by total-order dependencies, reversed-prefix forget order satisfies (P1). Each variable has interval bags spanning its own forget index and earlier neighbor indices; verify edge coverage and connected occurrence, and record real max bag width. These are UPPER bounds, not optimal bilateral treewidth. Do not substitute heuristic graph min-fill width or claim a theorem application without checking all guards.
- No raw support cone enumeration; 0 support representatives. Fixed per-compile gate/node ceiling 60,000; counted circuit + CNF Boolean operations ceiling 300,000; limit 10,000 support reps (none expected); 15-second deadline. If graph analysis exceeds the same time envelope, return PARTIAL with visible counters.

A shallow-horizon QBF is not unrestricted WDL; a finite physical validator searching continuations does not become a source-algebraic producer. Stage-local Tseitin uniqueness may be proved independently of the enumerated controls. Conditional QBF decidability at measured path-width may be a mathematically valid *upper bound* but not a claim of practical f(k), polynomial cost, or extension beyond `44444` support depth11.

## Source authority and theorem

Current qualified: `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md`. Existing four-threshold exact source-q bounded Bellman: `docs/research/2026-10-16-source-anchored-interval-and-reflection.md`. Prior negative: `docs/research/2026-10-16-bilateral-treewidth-and-galois-response-closures.md`. Published width theorem Ganian & Gründel, SAT 2026: https://doi.org/10.4230/LIPIcs.SAT.2026.16 ; primary proof https://arxiv.org/html/2605.06262v1 (Sections 4–5, P1/P2, Theorem 10).

All reductions/factor assumptions must be proved; none are authorized as a new game-theory authority. Preserve `44444` UNKNOWN, the 10k support boundary, existing histories, no merges.
