# One deterministic original-q column-footprint transport: no permutation DFS

**Frozen before source execution and independent original7×6 physical controls on October 18, 2026.** Canonical research branch research/semantic-quotient; original W=7,H=6,K=4 first-win-stopped game primary, W/H/K symbolic. Status: SOUND SUFFICIENT fixed-witness transport construction if exact source q upset inclusions pass, but **not** a complete replacement for historical capacity-preserving permutation proof search and **not** an arbitrary-board Level2 solver. IsoGraph 1.2 logic authority unchanged.

## Motivation and historical falsifier

The direct SOURCE two-column-swap + full horizontal reflection operator needed zero static permutation-candidate enumeration, but found only a restricted class of current source WDL order edges. Historical static column transport (which still computes ZERO future GAME WDL values) found **11 additional directed weak WDL inequalities** not derivable by that two-fixed-map transitive closure, among 6000 genuine late original7×6 source q.

First source witness at legal rank34 original history `1555271171452354215737327342666366`, post-root heights [5,5,5,3,6,5,5], mover P0. Historical original q transport proved J2<=J7 with nongeometric column mapping [1,5,6,4,7,2,3] (one-based). A separately frozen independent 69-line physical perfect WDL control verified J2=J7=-1; the root's only WDL-best original action is column4 by REFERENCE, not by the old inequality. This confirms a NON-GEOMETRIC SOURCE transport relation can be sound, though the discovered edge does not itself solve a new Level2 root.

## Source-only single-candidate deterministic construction

For any legal first-action pair a,b in current original q=(h,R0,R1), compute ONLY current-source algebraic RAW first-action winning-requirement family descriptions F_s(a),F_s(b), s∈{P0,P1}, from current R_s by mover contraction/opponent blocker deletion. These are STATIC source masks, not future game q states or game values. Reject immediate terminal and nonwinning full-board last move (prior qualified terminal source rules cover these).

Require the complete post-first-action gravity COLUMN CAPACITY HISTOGRAMS equal; otherwise a whole-column bijection is impossible for this proof family.

For each of two symbolic children A=a and B=b and each column c, define a local incidence feature vector S(c):

    S(c) = (post_height_c,
            counts[owner=0 or 1][generator_size=1..K][future_relative_row=0..H−1])

where a count includes a source raw residual generator G of owner s if |G|=generator_size AND G contains future physical cell (c,post_height_c+future_relative_row). Missing/nonplayable rows have count zero.

**One deterministic map, NO candidate search:** partition A and B columns by equal post-action height. Sort each height class ONCE lexicographically by the full per-column S(c), breaking feature ties by original column label to keep one deterministic answer. Match rank-j columns of A class to rank-j columns of B class. This constructs exactly ONE capacity-preserving whole-column mapping π per ordered (a,b), without backtracking, individualization branches, alternate assignments or enumeration of other column permutations.

The fingerprint is a heuristic CANONICAL ORDERING KEY, **not an invariant that alone proves simulation**. Completeness is NOT claimed; weak source games need not have identical incidence signatures, and tie-breaking can miss valid structural mappings. The resulting ONE π must be checked by the previously established exact original-q full-future WDL monotonicity clauses:

    P0-favorability: ∀G∈F0(a), ∃H∈F0(b): H ⊆ π(G)
    P1-harm avoidance: ∀H∈F1(b), ∃G∈F1(a): G ⊆ π^{-1}(H).

Only if BOTH hold and post-action heights mapped pointwise, certify J_a(q)≤J_b(q). This is a mathematically SOUND one-mapping proof regardless of whether the sorting key itself reflects game strategy. Run in opposite direction b→a with its own deterministic SINGLE map if testing reverse source order. No scalar current root WDL or competing future GAME value is computed.

Construct current-mover root best action from transitive closure of these source-certified weak directed inequalities exactly as in existing V3/V4. Return one original literal best column if P0 upper/P1 lower extremum spans all CURRENT legal labels, else INCOMPLETE. An exact source weak edge is valuable even without best selection but must not be mislabeled a Level2 best move by itself.

## Provenance and mathematical caution

Color refinement and canonical labeling of incidence structures are related mathematical tools: canonical vertex color refinement can run efficiently, but a complete graph canonical labeling generally requires extra individualization/branching when colors remain tied; see https://link.springer.com/article/10.1007/s00224-016-9686-0 . Here we intentionally **do not** individualize tied columns or enumerate alternatives. Source exact inclusion checks protect soundness at cost of incompleteness. The source hypergraph incidence signatures include OWNERSHIP and ORIGINAL future gravity rows, unlike unsupported height/phase-only classification (already falsified on true7×6 original source q).

## Frozen controls and falsifiers

1. Freeze standalone ESM original q direct footprint source operator BEFORE examining independent physical WDL. Audit: at most one π for each ordered legal first-action pair, zero mapping candidate DFS nodes, zero future game-value queries, all 69 original K-winlines respected.
2. On the already frozen n34 nongeometric transport witness, test whether this deterministic source signature mapping matches the old source relation J2<=J7; if not, record negative without inferring old source proof invalid. If yes, compare actual π to historical [1,5,6,4,7,2,3] and preserve one direct nongeometric source certificate.
3. In a sample of genuine actual first-win-stopped standard7×6 positions, independently PHYSICALLY validate certified source action weak inequalities and best root selections, then compare to V4 on same q for marginal coverage. Only after SOURCE success, never use physical WDL to choose a mapping.
4. Record direct source fingerprint work, subset checks, distinct pi per action pair, exact first terminal guards and any static failures. No source proof => INCOMPLETE.
5. Maintain source V1–V4, the original fixed-map 44444 reflection classes, historical physical counterexamples and qualified IsoGraph 1.2 unchanged.

**Research objective:** eliminate both strategic GAME-value branching and the old factorial STATIC column mapping proof search, without trading correctness for unsupported signature heuristics.