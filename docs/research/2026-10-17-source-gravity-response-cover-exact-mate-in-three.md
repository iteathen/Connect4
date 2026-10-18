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
