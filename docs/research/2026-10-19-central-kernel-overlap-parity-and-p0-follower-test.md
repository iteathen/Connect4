# Source width-kernel resource parity and deterministic P0 follower falsifier

**Date:** 2026-10-19 Pacific. **Research owner:** research/semantic-quotient. **Owner direction:** seek exact V_empty(W,H,K) via nested width/height/K parity and online strategy-preserving structural relations. **Status:** exact incidence/width-parity theorem plus a separate HYPOTHETICAL P0 no-loss response policy awaiting independent adversarial falsification. No new official gameplay authority and no WDL oracle premise.

## 1. Exact central overlap kernel (deductive)

For K<=W, every horizontal or diagonal geometric K-winning line occupies one of the column intervals [s,s+K-1], 0<=s<=W-K. Their column-wise intersection is

    I(W,K) = {W-K, W-K+1, ..., K-1}

when W<=2K-1; it is empty for W>=2K. Its cardinality is

    C(W,K) = max(0,2K-W).

This is an exact geometric intersection of the K-column spans, NOT an intersection of the actual K-cell diagonal targets at the SAME rows, nor a perfect-play value theorem.

Within the nonempty-kernel domain K<=W<=2K-1, the kernel has parity

    C(W,K) mod2 = W mod2,

since 2K is even. It contains floor(C/2) disjoint adjacent column pairs, with one unmatched kernel column iff W is odd. Thus the resource threshold used by the generalized Allis K>=4 P1 no-win response, C>=2, is equivalent to W<=2K-2. At W=2K-1 the common kernel shrinks to ONE unmatched column; at W>=2K it vanishes.

For standard K4:
    W=4: C=4 (two pairs)
    W=5: C=3 (one pair + unmatched center)
    W=6: C=2 (one pair)
    W=7: C=1 (zero pairs + unmatched)
    W>=8: C=0.

This explains an exact nested *geometric* parity dependence on width, but does NOT classify WDL: W4/W5 observed DRAW, W6 even-H observed P1 WIN, W7H6 P0 WIN, and W8H6 P1 WIN. In particular C>=3 might supply a surplus P0 defensive resource, but that is a distinct OPEN conjecture needing an actual adaptive no-loss strategy.

## 2. Fixed candidate P0 response, frozen BEFORE physical test

A simple candidate, called **P0 leading-cell / trailing vertical mate with deterministic spill**, is specified on empty K4 W=4 or 5, even H>=4:
- P0 first chooses column W-K (leftmost common-kernel column, zero-based).
- After P1 chooses original legal column c, landing at zero-based row r:
  - if r+1<H, P0 immediately takes the next cell ABOVE r in column c;
  - if r=H-1 (the P1 drop filled column c), P0 chooses the leftmost OTHER original gravity-legal column.
- If there is no legal P0 reply after P1's move, the board must already have become terminal draw; otherwise the hypothesis fails.
- Stop actual physical gameplay at the first win by either player; do not require the defender to prevent their OWN win. The intended theorem would be P1-CANNOT-FORCE-WIN, enough for P0 at least DRAW.

This is a fully specified single-reply SOURCE policy, not a game-tree search. Its physics and sufficient all-line blocker law are NOT YET PROVED. It might fail by creating forbidden lower-support phase shifts, horizontal P1 threats, diagonal crossings, or last-column resource depletion. A failure refutes this *specific policy*, not possible P0 non-loss or a general dimension theorem. Note that if P0 gains all K bottom cells while occupying successive columns before P1 can claim row1 horizontally, P0 wins first; naive after-terminal P1 completion counts are not a valid falsifier.

## 3. Frozen independent physical falsification

Implement the candidate source responder as height-only deterministic code. Implement independent original colored physical W,H,K board and all four K-line orientations. Enumerate all legal P1 responses against source P0 policy for W4 H4/H6 and W5 H4/H6 when budgets permit. Record earliest counterexample history if P1 FIRST wins, exactly which geometric K-line, which original row and the failure's source phase/pair interpretation. Test terminal-first P0 wins properly. Freeze candidate before examining results. No game WDL is inferred from source unless a new deductive strategy theorem is separately supplied.

## 4. Next strategy-sufficient question

Can the extra central overlap kernel C>=3 supply enough online compatible response contracts for P0 to prevent P1 wins on empty K4 width4/5, while C=2 at width6 permits a P1 forced win? One must distinguish an exact obstacle to a selected finite resource-policy family from universal impossibility. No arbitrary horizon, first-win-time optimization, strategy-tree/QBF/BDD value evaluation or silent promotion of a finite sample to a general theorem.

**Engine applicability:** C and C mod2 can be evaluated in constant time, but are only geometry metadata until a guarded WDL consequence is proved. No solver modification authorized.
