# Exact general-W multi-gravity-chain colored-shuffle factorization by mixed-radix antidiagonals

**2026-10-18 — FROZEN exact SOURCE mathematical theorem before independently implementing or testing true original 7×6 physical three-column controls.** Research owner: `research/semantic-quotient`. Governing qualified game-theory authority remains IsoGraph 1.2, with orientation-sensitive original q and first-win stop. This **does not** solve arbitrary original game WDL or Level2 BEST under adversarial play.

## 1. Input is a prescribed physical event-owner allocation, not a strategy

Let `q=(h,R0,R1)` be any genuine legal first-win-stopped original W×H×K gravity state, n=Σh, and select r≥1 distinct ORIGINAL columns `c_0,...,c_(r−1)`, each with `m_d≥1` next physical events (≤H−h_c) and a prescribed binary owner word `x_d[0..m_d−1]`. The selected segment has `T=Σm_d` events, all nonselected columns stand still. A hypothetical complete segment is a legal gravity shuffle of those column chains; event owner at zero-based global rank k must equal `p_k=(n+k) mod2`.

The sole SOURCE question addressed here is: is this specific physical owner coloring realizable by **some** alternating gravity shuffle, and which of the selected literal columns can occur FIRST among such realizations? The source shall never compute first-action WDL, alternative original game child values or strategies.

## 2. Eliminate one coordinate by the global turn rank

Keep only the first r−1 column-prefix counts as explicit SOURCE coordinate vector

    i=(i_0,...,i_(r−2)),  0≤i_d≤m_d.

At layer k, the last-column prefix count is uniquely determined:

    i_(r−1)= k − Σ_{d=0}^{r−2} i_d.

It is valid only if `0≤i_last≤m_last`. No word order is part of this state: it is a **count of consumed events from the already supplied OWNER-COLORED physical chains**.

Use mixed-radix strides

    s_0=1,  s_d=∏_{e=0}^{d−1}(m_e+1),

and code the first r−1 counts as

    J(i)=Σ_{d=0}^{r−2} i_d s_d.

The total bitset width is

    B=∏_{d=0}^{r−2}(m_d+1).

By convention r=1 gives B=1. For the genuine EMPTY standard 7×6 support with all seven columns contributing six events, B=7^6=117649 bits, which is a bounded STATIC colored-prefix resource signature, not 117649 independently solved future Connect4 games. However the structural work grows exponentially in the number of selected nontrivial columns; do not call it a universal polynomial-size strategic solver.

## 3. Pure Boolean shift/OR source convolution

For each layer k=0..T−1 and column d define a **current SOURCE eligibility bitmask** `M_(k,d)` on J coordinates. Its bit J(i) is 1 iff:

- the inferred last-column coordinate is within its range;
- selected column d still has a next event (i_d<m_d);
- its prescribed next owner `x_d[i_d]` equals `(n+k) mod2`.

For the last column d=r−1 the count i_d is inferred from k. All tests are direct source colored-chain/capacity arithmetic, not game-value computations.

Let `shift_d=s_d` for d<r−1 and `shift_last=0`. Define the Boolean resource bitset

    P_0=1 (only i=0 is a valid empty prefix)

    P_(k+1)= OR_{d=0}^{r−1} ((P_k AND M_(k,d)) << shift_d).

And compute ONE backward suffix-viability bitset:

    S_T = 2^{J(m_0,...,m_(r−2))}

    S_k = OR_{d=0}^{r−1}
              ((S_(k+1) >> shift_d) AND M_(k,d)).

All operations combine ALL prefix resource possibilities simultaneously into at most B bits. They do NOT expand one path per possible word and do NOT evaluate any future game winner or scalar root child value.

**EXACT THEOREM 1 (colored-projection feasibility):**

    some alternating gravity-legal word realizes the prescribed
    ORIGINAL physical column-owner sequences
       iff
    (S_0 AND 1) ≠ 0.

Forward and backward bitset conditions are equivalent by elementary reachability induction over the ORIGINAL disjoint column-chain poset, with all same-resource-prefix words merged by Boolean OR. The result is a theorem of a **fixed owner coloring**, not perfect-play quantification. The process is a static scheduling DP/reachability on prefix counts, so do not rebrand it as literally zero combinatorial search; it is ZERO **independently valued strategic game futures**, which is the owner's strict separate condition.

**EXACT THEOREM 2 (ALL feasible first original literal columns):** If S0 bit0 is zero, the fixed-color profile has no first column. Otherwise, for each original selected column d, the first action c_d is physically realizable in some compatible full shuffle iff `x_d[0]=(n mod2)` and S1 contains bit `2^{shift_d}` (with last-column shift0). ONE deterministic nonbranching canonical word can be reconstructed by repeatedly choosing the lowest-literal next eligible column whose target successor suffix bit remains 1. There is no backtracking, path search or independent word valuation.

**Generalizes previous exact special cases:** r=2 reduces to the frozen two-chain bitset phase operator (possibly coordinate-transposed). r=1 reduces to direct alternating owner parity agreement. One primary chain plus singleton columns has a stronger O(L+s) closed scalar `M` formula; do not replace that stronger guarded result with this larger static-resource operator without reason.

## 4. Original first-win and orientation-sensitive batch semantics

For an attainable profile, directly construct original physical owner masks A0,A1 from root h and each selected owner-bit chain. Use ORIGINAL q residual antichains R0,R1 to form fixed-color potential completion flags `F_p=[∃G∈R_p:G⊆A_p]`.

If F0=F1=0, every realizing hypothetical word is first-win free inside the segment. The original oriented q endpoint is directly

    h'_c=h_c+m_c for selected columns,
    R'_p=Min{G\A_p:G∈R_p, (G∩A_(1−p))=∅}.

If one Fp=1 and the other zero, the first terminal winner within any realizing word is p, although its terminal rank may vary. If both Fp=1, the source returns conditional FIRST-WIN RACE INCOMPLETE unless a separately sound two-sided rank interval/poset proof applies. No terminal continuation is treated as an actual legal gameplay history beyond FIRST win.

Neither a feasible head set nor the direct batched q theorem is a Level2 optimal action theorem: the adversary chooses moves conditionally, may deviate from the **supplied** coloring, and knows previous moves. The independent rank34 original source diamond counterexample proves strategically different first actions may be trace-equivalent after fixed blocks.

## 5. Frozen independent original W7 H6 K4 test protocol

1. Freeze the general r-chain source ESM module producing one `S_k` bitset layer per fixed profile and exact all-head mask, ONE canonical word, direct source win flags, conditional batched q. Do not enumerate alternate fixed words or value other original games in source. Count B, scanned count-vectors, masks and shift/OR ops.
2. Independently construct REAL 69 original geometric four-in-row lines, gravity and first-win-stopped physical roots. For three original selected columns {1,2,3}, enumerate all physically distinct hypothetical fixed-event words with A,B,C lengths each 1..3 from empty root and genuine canonical prefix `44444` (54 case configurations), collecting all owner-color physical event signatures and their exact FIRST original literal head sets. This is deliberately a physical FALSIFIER enumeration, not the source producer. Exact arithmetic expectation for these 54 cases: `2 × (2+4+8)^3=5488` requested color profiles, and `2 × Σ_{A,B,C=1}^3 (A+B+C)!/(A!B!C!)=10104` physical validator words.
3. Additionally test three legal late original root columns {2,4,5} at genuine rank34 history `2532541156412471331416356736376672`, with length each1..2 (8 cases; 216 requested physical color profiles). Verify the source exact full set of feasible first columns, correct no-win batch q and first winner guards against the independent physical checker; dual first-win status must remain appropriately incomplete.
4. On the SAME source q and profile, compare general three-chain source with existing exact two-chain source when the third selected chain is omitted, including positive/negative and exact head labels. No context-dependent game labels in either source.
5. Preserve any source/physical mismatch and negative/partial coverage; maintain Node26 CI, independent formal checker and owner-approved IsoGraph gameplay promotion as separate later gates. The original standard7×6 perfect-play WDL and one nonbranching Level2 best move at `44444` remain UNKNOWN/INCOMPLETE.

## 6. Exact scope of the reduction

This is a general **turn-sequence representation factorization for ONE fixed physical-color allocation**, replacing factorially many explicit event words by bounded mixed-radix Boolean resource masks. It grows with number of selected multi-event chains and does NOT remove the exponentially many *possible allocations* or the P0/P1 adaptive strategic response quantifiers. It is an algebraic infrastructure candidate, not the ultimate game-value theorem. For the owner's total zero-strategic-branching target, the future mathematical goal is a much stronger **global original q/ribbon phase + strategy-observation invariant** that proves a best move without evaluating two strategically inequivalent future games.
