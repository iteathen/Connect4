# Complete source Boolean characterization of guaranteed mate by player's NEXT turn: gravity response-cover theorem

**2026-10-17 Pacific.** Owner wants ONE source-certified Level-2 best continuation without evaluating inequivalent future games. Mathematical target: original first-win-stopped, gravity, alternating Connect-K, standard W=7,H=6,K=4 physical evidence first; retain symbols W,H,K. **Status:** structural theorem frozen BEFORE independent true7×6 physical controls. No IsoGraph 1.2 promotion; NOT a general unbounded WDL algorithm.

## Original source predicates

Let q=(h,R0,R1) be nonterminal, p=sum h mod2, opponent o=1-p, and let original legal action a land at x=(a,h_a). `R_p` are normalized surviving original winline future-cell masks. If {x}∈R_p, action a is a first-win terminal; this immediate case overrides everything below.

After a non-winning p action, define the legal opponent reply columns D=D(q,a) (columns with height h_d+1_[d=a] < H). For d∈D define playable y_d=(d,h_d+1_[d=a]), and, when row(y_d)+1<H, define z_d=(d,row(y_d)+1), exactly ONE cell above the opponent reply target.

All these refer only to current ORIGINAL q support and fixed original K-line masks. No q_a or q_ab needs to be constructed to test the following:

    Threat(t) := [{t}∈R_p] OR [{x,t}∈R_p].
    EnemyWinNow(d) := [{y_d}∈R_o].

The original owner contraction removes x from {x,t}; opponent blocker deletion cannot transform an enemy requirement containing x into a singleton. Thus `Threat(y_d)` precisely means that p would win by owning that currently playable target after a (if their turn were next); `Threat(z_d)` means that owning the newly released upper cell after opponent claims y_d would immediately win for p. An opponent reply d is an immediate o WIN iff EnemyWinNow(d); if any exists, the opponent can choose it and stop the game before p's next turn.

Define two source STATIC column sets:

    S = {d∈D:Threat(y_d)}                  (p's currently playable winning threats)
    Z = {d∈D:z_d exists AND Threat(z_d)}  (p winning releases if o places y_d).

There is no need to build different future q states or value any successor game to determine S,Z.

## Exact one-opponent-response winner law

Under the guard that p action a is not already a win and ALL opponent columns d∈D have EnemyWinNow(d)=false, p is GUARANTEED to win at their VERY NEXT turn regardless of which column o plays iff

    For every d∈D:
       (S{d} != empty) OR (d∈Z).

This is equivalent to the closed expression

    |S| >= 2
       OR
    (|S|=1 AND the unique member of S belongs to Z)
       OR
    (|S|=0 AND D subset_of Z).

**Proof (⇐).** Opponent plays any d. If p has an earlier playable win target y_c in some c≠d, that cell remains gravity-playable and is not blocked by o's cell y_d; p plays c to win. If no such c, then d∈Z and the o stone has just released z_d directly above y_d. The source witness for z_d is either singleton {z_d} or original pair {x,z_d}; neither includes y_d, so o's placement cannot erase that p win requirement; p plays d to win. No o response can win immediately by the explicit guard. Presence of either winning cell after each d also rules out a prematurely full nonwinning draw.

**Proof (⇒) for the narrowly stated immediate-next-turn property.** After o places y_d, all other current playable cells remain at the same row, and the only newly released cell is z_d (if any). The exact source owner win condition at that next turn is therefore `(S\{d} !=empty) OR d∈Z`. Quantifying d universally gives the expression above. This is NECESSARY and SUFFICIENT to force **win immediately on p's next turn**, not necessary for eventual p wins with longer strategies. No game-tree minimax is used.

**Proof-carrying answer:** action a is definitely in the **WIN** top outcome tier for mover p (a valid Level2 continuation under PERFECT opposition). Its "source certificate" consists of S,Z,D, the original one-/two-cell owner-mask witnesses, and proof that every current opponent frontier is devoid of o singleton win. It does NOT imply all other L2 best labels are found, or determine forced timing beyond at most 3 new placements.

## Three precise gravity fork forms, all accounted for

1. **S has 2 or more members:** ordinary double simultaneously playable fork (old exact theorem).
2. **S has exactly 1 member b and b∈Z:** SAME COLUMN STACKED released threat; opponent's only blocking placement b releases a second immediate p win in b (new theorem recorded separately and true7×6 tested).
3. **S empty and every d∈D belongs to Z:** **ALL-REPLY RELEASE GIFT**. P has no immediate live next-turn threat, but every opponent legal reply releases a p-winning cell exactly above their own placed stone. Their move must open one of p's winning cells. This is a new structural candidate whose actual7×6 occurrence/coverage must be determined from independent physical tests; do not assume it occurs.

When |D|=1, form (3) can be satisfied even on a single unfinished column and may overlap the earlier parity/deterministic-single-column source proof; record real incremental marginal separately.

## Falsification protocol on ORIGINAL standard7×6

Freeze a pure source q-mask operator with the closed |S|/Z condition BEFORE evaluating reference. Sample legal nonterminal real W=7,H=6,K=4 physical histories; source-prove any mate-in-3 action with no child game Q. For EVERY legal opponent reply (not just the "blocking" reply), independently check physical FIRST-WIN and then a physical immediate winning response. Track counts of forms (1),(2),(3), and independent physical scalar action WDL on a budgeted late-rank subset. Record any case that refutes the exact algebra and preserve past test-harness failures separately.

An operational Level2 valid move needs one action certificate. Full Level2 move information requires all outcome-best literal labels and remains stronger. The complete arbitrary-source no-branch Level2 solver remains UNDISCOVERED; canonical 44444 must remain INCOMPLETE unless this exact source direct law certifies an action. No reference values or strategies feed the source producer.

## Research path beyond this boundary

The Boolean `forall d` collapses to just cardinality and set inclusion on D,S,Z, eliminating even explicit dynamic opponent-response enumeration. Seek a similar algebraic elimination for TWO or more adversarial response rounds, using the original q cofactor and K-banded gravity predecessors to build an *inductive release-cover invariant* without enumerating conditional response trees. Never misclassify an algebraic source proof of mate-in-3 as a full no-search game solver.


## Executed actual standard7x6 results (independent control)

**Independent original-physical falsifier PASS** on 4,100 reproducible first-win-stopped original7×6 nonwinning sampled trajectories, yielding **134,185** unique physical nonterminal positions. The pure source producer proved **153,311 original literal first actions** that WIN now or on p's NEXT turn:

| Proof class | Source-certified original first actions |
| --- | ---: |
| Already immediate first win (historical) | 111,336 |
| Two DIFFERENT concurrently playable win targets (historical) | 36,718 |
| One currently playable win target, stacked next-row release (new) | 5,201 |
| NO currently playable win target, ALL opponent moves release win (new) | 56 |

Of the **56** ALL-OPPONENT gifts, **51** had one legal reply and **5** had TWO OR MORE legal reply choices (these five cannot be explained as merely one remaining playable column). This is a finite sample, not source certificate completeness for all 7×6 games.

The independent validator checked **249,206** actual legal original opponent replies to EVERY source-certified non-immediate action and directly found a physically winning p next response in EVERY case. It cross-checked exact source S and Z original threats against an INDEPENDENT bitboard physical winline detector (ZERO mismatches), plus **80** late 7×6 first-action ordinary physical recursive perfect-WDL outcomes, all exact. **No** source game future q or strategic outcome was constructed by the candidate, and **no** improper early opponent win or last-board draw was detected.

**Concrete independently checked multi-reply GIFT witness:**
- Original gravity legal first-win-stopped history `15551624162264264226443165545177173` (absolute ply35, p=P1).
- New source certificate chooses original literal **column 3**.
- The opponent P0 may then play **column 3 OR column 7**.
- The source proves p has **NO presently playable immediate winning target** immediately after the chosen action (`S=∅`). But `D={3,7}⊆Z={3,7}`: either P0 move releases a P1 immediate original K-win target in the column P0 just played, which P1 then takes next.
- Prior `direct-two-turn-frontier-operator.mjs` classified the SAME original action 3 as `NO_EXACT_SOURCE_LOCAL_FINISHING_CERTIFICATE`; its full root L2 output was `INCOMPLETE`. Earlier standalone SAME-COLUMN stacked operator was also `INCOMPLETE` because S=∅. The new source result was `VALID_CONTINUATION`.

Proof executable: `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-gravity-response-cover.mjs`. Independent physical control: `standard7x6-gravity-response-cover-physical-control.mjs`. Machine evidence: `STANDARD7X6_GRAVITY_RESPONSE_COVER_DIRECT_MATE_RESULTS_0_1.json`. Full source/no-future-q source blob and control blob IDs are in evidence. A separate previously proved stacked-only theorem/control recorded **3,276** genuine one-simultaneous-threat selected positive roots and **40,891** independently verified opponent replies, all correct; counts differ because one operator returns ONE selected move per root and the generalized law records ALL static positive first actions.

**Boundary:** The three-case algebra is COMPLETE for this precise win-at-next-turn condition, but not complete for eventual forced win, drawing choice, inevitable-loss fallback, or arbitrary-state total zero-branch Level2. Canonical `44444` remains source-INCOMPLETE. The owner requires just one certified continuation, and this new theorem meets that operational goal on its guarded positive domain.
