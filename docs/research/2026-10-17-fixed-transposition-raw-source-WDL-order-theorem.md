# Fixed two-column transposition: direct raw source WDL order with no permutation enumeration

**Frozen 2026-10-17 Pacific before real 7×6 physical and historic transport controls.** Canonical branch `research/semantic-quotient`. **Status:** proposed exact theorem from previously established original residual-q monotone future-program simulation; independently verify before new qualification. Original standard W=7,H=6,K=4; retain W,H,K symbols. Do not change IsoGraph 1.2 gameplay authority, immutable V1/V2/V3, or historically rejected odd pairing.

## Target and value criterion

For genuine first-win-stopped original q=(h,R0,R1), mover p=(sum h) mod2, literal legal first columns a,b, write J_a(q)∈{-1,0,1} for ordinary P0-relative unrestricted optimal value after first move a. We seek **direct SOURCE proof of J_a≤J_b** using only h,R0,R1 and a SINGLE explicitly given column transposition σ swapping a and b. No search over any alternative future games, no enumeration/backtracking over capacity-compatible column permutations, no full numeric WDL, and no normalized q-child construction.

### Necessary support condition

Only compare DISTINCT legal columns a,b with **equal current height h_a=h_b**; applying one stone to either then swapping a and b yields identical post-first-action height support. If h_a≠h_b, these two distinct child height HISTOGRAMS are different, so no static height-preserving full-column permutation can map one first-action support to the other. This statement concerns fixed-height-permutation transport, NOT impossibility of a completely different source order proof.

Let x_a=(a,h_a), x_b=(b,h_b) denote original currently playable cells, σ(a,r)=(b,r), σ(b,r)=(a,r), σ fixes all other original cells; σ(x_a)=x_b. σ is an involution. Express σ directly as one fixed bit permutation; no choices/mapping search.

### Raw winning-requirement cofactor notation (no future q materialization)

For owner s∈{0,1}, let F_s(t) describe the original family AFTER placing current mover stone in legal original column t at x_t:

    F_s(t) :=
      { G\{x_t} : G in R_s(q) }                  if s==p,
      { G in R_s(q) : x_t not in G }             if s!=p.

These are raw masks, **not normalized successor game positions**. Prior exact theorem Min(O_x F)=Min(O_x Min F) and Min(B_x F)=Min(B_x Min F) ensures direct raw cofactor subset tests suffice, because removing dominated raw supersets does not change the upward-closed win requirements. Retain FIRST winning terminal: if {x_a} or {x_b} appears in R_p, the corresponding first action wins IMMEDIATELY and is separately resolved by the already qualified immediate winner source theorem. We restrict this transposition theorem to both first actions nonterminal, and n+1<WH.

For any physical residual G define σG by swapping its column a/b cell identities while preserving original row.

### Fixed transposition P0-favorability inclusion inequalities

Define direct, finite original-source clauses:

    C_0(a,b):   For EACH G in F_0(a),
                EXISTS H in F_0(b) with H subset_of σG.

    C_1(a,b):   For EACH H in F_1(b),
                EXISTS G in F_1(a) with G subset_of σH.

All witnesses H/G above are ORIGINAL residual generator masks with inline played-cell removal/blocker filtering. The EXISTS ranges only over current ORIGINAL R0/R1 winning-line requirements, **not future moves or strategic histories**.

**SOURCE WDL WEAK ORDER THEOREM (candidate until independent checked):**

    [h_a=h_b] AND [nonterminal a,b] AND C_0(a,b) AND C_1(a,b)
            ==> J_a(q) <= J_b(q).

Reason: under σ, every P0 winning requirement available in the first-a game has a no-harder subset requirement in first-b; and each P1 threat available in first-b has a no-harder subset corresponding threat in first-a. Thus first-b game is at least as favorable to P0, for EVERY corresponding gravity-legal future column word and FIRST-terminal boundary. The original q-cofactor/game weak-simulation theorem makes ordinary optimal WDL monotone in this order for both mover parities. σ is a bijection on the complete remaining gravity action alphabet; game-valuations are NOT evaluated to establish the inequalities.

Both C_0(a,b) and C_1(a,b) are necessary for THIS particular source simulation certificate, not asserted necessary for actual J_a<=J_b. If reverse C_0(b,a) & C_1(b,a) also holds, then source proves J_a=J_b, but the owner needs only ONE BEST action, and other ties need not be enumerated.

**Caution:** This source theorem relies on the previously qualified owner-sensitive original q full-future simulation monotonicity (not merely equal supports). Do not equate existence of a winning continuation with guaranteed value, or infer strict comparison from failure of a source inclusion test.

### Closed implementation with no permutation proof search

Implement σG in O(1) BigInt masks via masks A_col, B_col of all H physical cells:

    σ(G)=(G outside cols a,b)
         OR shift(G & colMask_a, b-a)
         OR shift(G & colMask_b, a-b).

For every legal equal-height pair, evaluate direct raw source clause C_0/C_1 using original R_s only. No recursive column-permutation witness assignment, no alternate future q, no semantic future game WDL, and no static strategy-tree construction. Pairwise source comparisons are purely symbolic original winning-line-incidence tests; their number is at most choose(W,2), not the count of possible future games. Partial-order transitive closure on the CURRENT action-label set gives one best original move when a P0 upper extremum or P1 lower extremum is connected to all legal labels. If no such source-certificate extremum, return INCOMPLETE.

### Frozen validation and adversarial falsifiers

1. Commit pure direct transposition source operator BEFORE any physical reference. Keep exact counts: original residue mask subset tests, equal-height action pair comparisons, direct positive weak edges, NO completed candidate column permutations, NO alternate future game-value evaluations.
2. Independent physical true7x6 first-win-stopped oracle on a deterministically generated nonuniform corpus of actual standard boards, including P0- and P1-to-move and near-full ranks. For each positive C_0&C_1, check actual J_a<=J_b against separately implemented PHYSICAL recursive minimax, bounded late positions, and compare equivalent weak edges with frozen either-mover source transporter. Any contradiction refutes new source lemma; preserve full history, q masks, root action values, original a,b.
3. Where direct action-label extremum exists, verify its best-action value equals ordinary root WDL. Then compare to frozen V3 on SAME original q to identify genuinely new valid continuations, no unsupported marginal count from separate samples.
4. Include canonical first-win-stopped history 44444 with p=P1; direct source returns no claim unless positive original inclusion guards; root scalar WDL remains UNKNOWN. It is possible all seven columns have same current height except center, yet original residual owner asymmetry blocks all inequalities; explicitly record.
5. A sound direct transposition may be LESS complete than existing enumerated transport because that method can find nongeneric column permutations. The aim is eliminating combinatorial STATIC proof witness search for each certified edge, not pretending this class alone must match all previously proven edges.

**Research boundary:** no arbitrary-q total no-search Level2 proof; no solver-branch merge or IsoGraph logic-authority change. Maintain independent physical oracle as falsifier ONLY, and mark unproved candidates INCOMPLETE.
