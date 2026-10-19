# Exact horizontal-only first-player no-loss from bottom-column kernel and upper-support mirror

**Date:** 2026-10-19 Pacific. **Research owner:** research/semantic-quotient. **Owner direction:** derive exact V_empty(W,H,K) by nested width/height/K resource parity without evaluating strategically alternative future games. **Status:** NEW GUARDED DEDUCTIVE SOURCE THEOREM, frozen before independent true original gravity physical validation; no qualified IsoGraph1.2 promotion. This is NOT first-win distance optimization or ordinary game-tree search.

## 1. Exact theorem

For ANY finite integers K>=3, positive H<K, and K<=W<=2K-1:

    V_empty(W,H,K) >= 0.

There is an explicit single P0 opening plus deterministic online P0 response that prevents P1 from FIRST WINNING against EVERY P1 action choice.

**Corollary, new EXACT DIMENSION->DRAW family (combining frozen P1 even-area result):**

    K>=3, H<K, K<=W<=2K-1, W*H even
       => V_empty(W,H,K) = DRAW.

The P1 nonwinning response for ANY H<K, K>=3, even WH was independently frozen/proved at
\`docs/research/2026-10-18-general-k-horizontal-only-even-area-second-player-draw-policy.md\`. The source P0 result here does NOT rely on that P1 result and is independently valid when WH odd. For WH odd, P0 may have a different winning strategy: only V>=0 follows.

The previous W<K exact draw and H=1 exact draw families remain separate and may supersede this weaker bound where they apply. Do not extend this P0 kernel theorem to W>=2K or H>=K without additional proof.

## 2. Exact shared bottom-row blocker (K-column intersection)

Each possible horizontal K-in-a-row has columns in [s,s+K-1], s=0,...,W-K. Their common column intersection is

    I(W,K)={W-K,...,K-1}

for K<=W<=2K-1, of cardinality 2K-W>=1.

Choose a FIXED original P0 opening column

    a=W-K  (zero-based).

P0 places its first stone at original bottom physical cell (a,0), which belongs to EVERY possible bottom-row horizontal K-line. Hence P1 can NEVER complete a horizontal K-line in the bottom row, regardless of future strategy or resources. No opponent game values are evaluated to choose a.

## 3. One deterministic P0 upper-mate / preemption response

After EVERY actual nonterminal P1 original drop into column c at its current original zero-based height r:

- If r+1<H, P0 immediately places into SAME column c at physical row r+1, which is NOW gravity-playable.
- If r=H-1 and there remains any legal original column after P1's move, P0 claims the lowest available physical row in the LEFTMOST still-playable column.
- If no legal column remains, the P1 move filled the board without a win, so stop at DRAW; no P0 response needed.

This policy evaluates one source height-array update and NO strategically alternative game-state values. A P0 win caused by its own move is an acceptable guaranteed WIN for that actual play and stops further action.

## 4. Inductive causal support-mirror theorem

At the start of every P1 turn under this P0 policy, **the top currently occupied cell of every NONFULL, NONEMPTY physical column belongs to P0**. Proof: true immediately after P0's first opening. Suppose the invariant holds at a P1 turn. If P1 plays below the physical top row, P0 instantly occupies the newly released cell above P1's new stone, restoring P0 as that column's top. All other columns remain unchanged. If P1 fills a column's last cell, that column is no longer nonfull; P0's discretionary placement (if any) becomes the top of some other nonfull column, preserving the invariant. No illegal gravity mate can occur in either case.

Consequently, EVERY P1 stone at a physical row r>=1 in such an actual first-win-free game has a P0 stone IMMEDIATELY BELOW it in the same column at row r-1. The P0 supporter was occupied BEFORE P1 could claim the upper cell by gravity; no computation of chronological winning distances is involved.

Since H<K, NO vertical or diagonal K-line exists. Thus only horizontal K-lines need exclusion. A hypothetical P1 K-line at any row r>=1 implies, by the one-row-lower supporter condition, that P0 already owned ALL K horizontally adjacent physical cells at row r-1. That is a P0 original winning K-line. Actual first-win-stopped play would already have terminated with P0 winner before P1's claimed upper line could complete, contradiction. The bottom row was blocked by P0's single initial kernel stone (§2). Hence P1 cannot FIRST WIN while P0 follows the source policy. If P0 never wins, finite original gravity fills the board drawn. This proves V_empty>=0, independently of P1 policy.

**This mirrors a historical source mechanism:** support-mirror first-win preemption was explored on standard 7x6 using vertically paired gravity mates. The new result is a simpler direct P0 immediate-top invariant with one geometric common bottom kernel, applicable across symbolic W,H,K, and it does NOT require a static hypergraph fractional overload or dyadic potential. Credit the general idea's prior project evidence; do not call every support-mirror argument new.

## 5. New exact DRAW composition and width/height examples

The source-only P1 even-area theorem provides V_empty<=0 whenever H<K,K>=3 and WH even. Intersect with current P0 V_empty>=0 to obtain exact V_empty=0 under both guards. This includes:
- K4 H2 widths W4..7;
- K4 H3 even widths W4,W6 (odd widths have P0 nonwin bound only from this theorem);
- K5 H4 widths W5..9;
- K6 H4 widths W6..11;
- arbitrary even-area K<=W<=2K-1, H<K.

The bound ceases to apply when W reaches 2K: there is no single column shared by all bottom-row K windows, and P1 may start from a disjoint bottom window while P0 follows vertically. The physical opponent may first-win on the Kth bottom stone before P0's possible upper-row reply can finish a different line. That is an obstruction to THIS single-anchor policy, not proof P0 necessarily loses for W>=2K. For H>=K, new diagonal K-windows TOUCHING the bottom boundary are not prevented by the horizontal-row support-mirror, as independently verified P0 follower counterexamples on W4/5 K4 H4/6 demonstrate. These are mandatory guards, not implementation expedients.

## 6. Frozen physical and negative verification

1. Freeze the parameterized original SOURCE P0 opener and deterministic same-column upper-mate / leftmost free spill policy BEFORE consulting any oracle values. It must inspect no future different games.
2. Independently generate actual original W,H,K four-direction winning windows, run all P1 choices (validator-only adversarial branching) against fixed P0 policy on bounded W,H,K3..7 with H<K,W in [K,2K-1]. Verify every gravity/legal mate, never any P1 first win, and the exact full DRAW when policy never P0-wins.
3. Include even-area K5 H4 (e.g. W5,W6) as genuine new source exact-draw controls, K4 H3 W4/W6, odd-area W5 H3 (P0 nonloss bound only). Check the source P1 even-area response independently on those SAME geometry families for conjunctive exact DRAW, not by reading oracle values.
4. Freeze a source negative control at W=2K,H=2,K>=3 with P1 filling K bottom columns DISJOINT from P0's one opening: show why the P0 singleton bottom blocker guard is essential. Also preserve regular H>=K K4 diagonal P1 counterexamples to exclude an overbroad theorem.
5. The proof is general symbolic within the guards. Bounded original physical tests can falsify it but cannot promote a total non-search arbitrary W,H,K classifier or claim an external proof assistant qualification.

## 7. Search-engine applicability

Where the guards hold, the source returns a genuine exact P0-nonloss lower bound V>=0 at empty root; when WH even, existing P1 response V<=0 combines to exact DRAW root cutoff, with only integer comparisons in W,H,K. No game-tree evaluation, first-win distance optimization or solved book. Source strategy witness costs O(1) after height array update. Implement only through a qualified generalized solver proof interface after direct original regression and net solve-time measurement; NO production solver edits authorized. 
