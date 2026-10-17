# Row / column phase transport and the geometric obstruction to XOR-only Connect4

**Date:** 2026-10-17 Pacific. **Owner's live research intuition:** after XOR factors turn alternation, row constraints and column filling may introduce distinct phase shifts; playing early across several columns changes the effective geometry. **Canonical research owner:** research/semantic-quotient. **Status:** exact source algebra frozen BEFORE standard-board falsification, plus explicit open claims. **Scope now:** true W=7 columns, H=6 rows, K=4 in a line; preserve symbolic W,H,K for LATER generalization. NOT an unrestricted zero-strategic-branching solution or authority promotion.

## 1. What actually changes

Original geometric K-lines do NOT move: there are L(W,H,K) such windows, 69 on 7×6 Connect4. What changes after each move is:

- the support-height vector h, the playable next cell in each nonfull column, and which columns have remaining chain capacity;
- the source-relative row index r-h_c of each future target and its gravity release/deadline structure;
- the P0/P1 feasible source residual antichains R0,R1 (own contraction and opponent blocker deletion);
- the set of legal column-order interleavings and the conditional counter-win/first-win race.

Thus "the shape changes" is a precise **evolving event-poset boundary and surviving winning-hyperedge incidence** statement, not a changing physical grid or a free-standing global "row phase flip".

## 2. Exact factorization into row, column, and interleaving phases

Let n=sum_c h_c, current mover p=n mod2, and future cell e=(c,r), h_c<=r<H. If a fixed gravity-legal hypothetical continuation places e at relative future rank t(e), define b_d(e) as the number of future placements in column d != c strictly before e. Then

    t(e)-1 = (r-h_c)+sum_(d != c) b_d(e)

and its absolute owner bit χ(e)=(n+t(e)-1) mod2 is exactly

    χ(c,r)
       = [r mod2]
         XOR κ_c(q)
         XOR β(c,r)

    κ_c(q):=(n-h_c) mod2
           = (sum_(d != c) h_d) mod2
    β(c,r):=(sum_(d != c) b_d(e)) mod2.

This formula separates (a) **row parity r**, (b) **current outside-column phase κ_c**, and (c) **future cross-column interleaving β**. It does NOT assert κ_c or CPC latest-event parity determines actual future ownership; β is constrained by adversarial legally realizable interleavings. The exact formula is valid under a supplied legal event order even if a hypothetical continuation is extended past first win for validation; ordinary gameplay must stop at its earliest winning line.

## 3. The precise column-update phase shift

For any currently legal move in column a, n'=n+1 and h'_a=h_a+1, h'_c=h_c otherwise. Therefore for every column c,

    κ'_c = κ_c XOR [c != a].

Equivalently, in GF(2)^W using a vector of W ones 𝟙 and standard basis e_a,

    κ'(q,a)=κ(q) XOR 𝟙 XOR e_a.

For still future cells in column a, **the row+column baseline λ(c,r):=r XOR κ_c is unchanged**. Every still future cell in each OTHER column has its baseline λ toggled. This is the exact "column-relative phase shift" suggested by the owner. At a FULL COLUMN boundary h'_a=H the column a future event chain vanishes; κ'_a is algebraically defined but now has NO physically future targets. In particular, the loss of a legal action and of that column's future β contributions is an additional boundary/feasibility change, **not an extra mystical parity toggle**.

These κ updates commute:

    T_a(T_b(κ))=T_b(T_a(κ)),

when both a,b are distinct legal columns and support permits both. The phase-state result depends on final counts, NOT play order. This is an abelian GF(2) *source clock* factor, not full-game strategic commutation.

## 4. Horizontal, vertical and diagonal row-phase constraints, with K explicit

Define source baseline λ(c,r)=(r mod2) XOR κ_c for each future cell. For any two still-future target cells e=(c,r), f=(d,s), their baseline difference is

    D_q(e,f)=λ(c,r) XOR λ(d,s)
            = (r-s mod2) XOR (h_c-h_d mod2).

Two events ultimately have SAME owner iff

    β(e) XOR β(f) = D_q(e,f).

For an original K-cell geometric window L, its K-1 equality constraints relative to one anchor are exactly such equations. Additionally, to satisfy a specific player's source residual G∈R_p, the anchor owner must equal p and all required future cells' owners must equal p. Existing occupied cells and first-win guards belong to source residual semantics, not an invented future phase.

For successive cells of a K-line:

- **Vertical step** (same column, adjacent rows): D=1. Same owner requires an odd number of intervening *other-column* placements between these two vertically consecutive cells.
- **Horizontal step** (adjacent columns, same row): D=(h_c XOR h_(c+1)) mod2. The player's ownership depends on phase correlations of the two columns, not just row parity.
- **Diagonal step** (adjacent columns, row difference ±1): D=1 XOR (h_c XOR h_(c+1)). Rising/falling diagonal steps have the SAME mod2 row difference, but DIFFERENT absolute gravity release depths and original-line incidence; their win conditions cannot be collapsed just because their parity edge looks the same.

On standard K=4, each original line contributes THREE relative equal-phase constraints plus its player/anchor condition. Their conjunction is a GF(2) polynomial, NOT a linear XOR-only objective; competing original winning lines and earliest completion timing introduce additional nonlinear source truth conditions.

## 5. Two-move exchange: commuting phase and noncommuting geometric consequence

Take two distinct currently legal columns a,b with original landing cells x=(a,h_a), y=(b,h_b). The two possible sequential move orders ab and ba use the SAME final h and κ after two moves. They differ because the initial mover p owns x in ab but y in ba, while opponent o owns the other cell. Under qualified source q terminal guards, the conditioned second-step residual antichains are obtained by owner contraction / opponent blocker deletion directly from original q, exactly as in the preserved two-ply cofactor simulation theorem.

Only original source winning generators G satisfying

    1_[x∈G] XOR 1_[y∈G] = 1

can produce a DIFFERENT **raw** residual consequence under swapping ab versus ba. A G containing neither cell is unchanged in both orders; a G containing both is blocked in both orders. Differences in MINIMAL antichains may also affect unchanged generators through subsumption, but their causal source is a generator with that odd-incidence XOR. Terminal-first exceptions are excluded from this nonterminal comparison.

The full source residual transition therefore does NOT generally commute even though κ does. Call the source difference the **residual exchange obstruction**; if using "curvature", mean this exact finite cofactor noncommutation, NOT physical spacetime curvature or a newly discovered topological invariant. The previous standard7×6 q=44444 result that all 21 unordered landing-cell diamonds were incomparable under the established P0-favorable full-future order remains a negative constraint; no new root WDL is inferred from a source exchange.

## 6. Canonical 44444 phase boundary that matches the owner's intuition

On a true standard7×6 first-win-stopped history of five center-column moves, \`44444\`:

    n=5
    h=[0,0,0,5,0,0,0]
    κ=[1,1,1,0,1,1,1]     (columns 1..7 one-based).

If P1 plays move SIX again in center (action column4), h'_4=6 and

    κ'=[0,0,0,0,0,0,0].

The completed center column then has **no future cells**, and exactly six legal columns remain. If instead P1 plays move6 into outer column1, then

    h'=[1,0,0,5,0,0,0]
    κ'=[1,0,0,1,0,0,0].

Here the center column retains its ONE highest-row future cell, and all seven columns remain legal (unless other columns had previously filled). The two phase patterns differ exactly by the current source support and the source-local phase update. Neither determines unrestricted root WDL or which move is optimal; β freedom, surviving four-in-a-row conditions, adaptive threats and first-win timing are still load-bearing.

## 7. Falsifiers FROZEN BEFORE RUN, true standard board only

1. Derive all 69 original W=7,H=6,K=4 geometric lines and track exact first-win-stopped positions sampled across early/mid/late ranks, including 44444, 444444, 444441 and 4444442.
2. Independently check κ's definition, exact all-other-column phase flip for every legal first action, and the row+column+β owner identity on supplied gravity-legal continuations. Do not interpret baseline λ as guaranteed cell ownership.
3. Across horizontal, vertical, rising/falling diagonal **geometric K-windows** with future target pairs, independently calculate D from source κ and verify same-owner constraints from actual future placement parity and β. Track differing gravity release ranks of rising/falling diagonals even when D agrees.
4. For all two-column source diamonds with both orders nonterminal, check κ/h endpoints commute, and direct source cofactor end states agree with independent physical q reconstruction. Check the odd-incidence necessary condition for any raw residual generator difference. Preserve any discrepancy.
5. Test explicitly whether height+κ+69-line geometry ALONE can determine unrestricted WDL: independently solve near-terminal TRUE 7×6 nonterminal physical positions with matching exact height vectors but differing original P0/P1 R residuals. If full values differ, preserve a concrete history pair and show failure of a height/phase-only WDL formula. Physical reference is branching validation ONLY; never inserted into zero-fanout producer.
6. New unrestricted (V,M*) source algorithm not asserted. Outcome-zero-locus proofs still must certify two COMPLETE nested action sets simultaneously, with no separately valued inequivalent strategic futures. Any proposed phase-only shortcut refuted by a true 7×6 WDL counterexample must be excluded from future candidate algorithms.

**Epistemic classification:** exact algebra for κ and D, conditional exact swap obstruction; empirical 7×6 usefulness pending independently frozen validation. Zero-branch algorithm, canonical 44444 unrestricted WDL and complete best columns: OPEN.
