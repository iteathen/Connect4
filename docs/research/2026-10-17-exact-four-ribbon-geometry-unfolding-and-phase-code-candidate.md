# Exact 7×6 Connect4 geometry unfolding into four linked one-dimensional ribbons

**Date:** 2026-10-17 Pacific. **Owner motivation:** unfold the apparent two-dimensional Connect Four geometry to a *simpler linear representation without changing its computational process*. **Canonical research owner:** research/semantic-quotient. **Status:** DEDUCTIVE REPRESENTATION / CANDIDATE MATHEMATICAL STRUCTURAL ISOMORPHISM frozen BEFORE independent actual-7×6 controls. NOT a winner algorithm or an IsoGraph 1.2 authority promotion. Keep W,H,K symbolic for future generalization, but test and seek closure FIRST on real W=7,H=6,K=4.

## 1. Four one-dimensional ordered strand families, fixed geometry

Let X={ (c,r):0<=c<W, 0<=r<H } be the physical cell set. Define four families of ordered strands, with cells sorted along each strand:

- **Rows (horizontal):** r constant, c increasing. H strands of length W.
- **Columns (vertical):** c constant, r increasing. W strands of length H.
- **Rising diagonals:** c-r constant, c increasing. W+H-1 strands, length varies.
- **Falling diagonals:** c+r constant, c increasing. W+H-1 strands, length varies.

Each physical cell appears **once in each family**. Hence the unfolded ribbons have exactly 4WH occurrences referring to WH distinct **physical event identities**. On standard 7×6: 6+7+12+12=**37** ordered strands, **168** strand-cell occurrences referencing exactly **42** underlying cells, and four occurrences per physical cell.

Each original straight K-cell winning line is EXACTLY one contiguous length-K interval in EXACTLY one strand. Conversely every contiguous K-length strand interval is a valid original winning line. Their counts remain dimension-bearing:

    Horizontal  H*(W-K+1)
    Vertical    W*(H-K+1)
    Rising      (W-K+1)*(H-K+1)
    Falling     (W-K+1)*(H-K+1)

for 1<=K<=min(W,H). At standard (7,6,4) the split is 24+21+12+12=69. The four "linear problems" are NOT independent: occurrences must be linked by literal underlying cell ID. Formally each x∈X has four occurrences x_R,x_C,x_U,x_D satisfying the COPY/equality relation

    x_R = x_C = x_U = x_D = physical_event(x)

for presence, owner, and timing data where defined. Removing these links changes the set of legal positions and terminal outcomes; it is forbidden.

This is an **intervalized hypergraph lift** (four 1D fibers with shared-variable equality), not a claim that WDL becomes a GF(2)-linear equation, or that running several line scanners gives perfect play.

## 2. Exact state encoding and transition conjugacy

For legal nonterminal source q=(h,R0,R1) under the qualified first-win-stopped residual semantics, define Φ(q) as:

1. W column frontiers h; physical-cell-to-four-ribbon occurrence links fixed by (W,H,K).
2. Every source original normalized residual generator G∈R_p, tagged with its exact owner p and the set of linked PHYSICAL future cell IDs G. A chosen suitable original K-interval containing G may be attached as a *display/certificate container* when possible, but **the interval container ID is NOT semantic identity**; different historical original lines can collapse to the same normalized residual G.
3. All required first-win/terminal/cofactor semantics of q, not a memory of historical colored stones. This lift can be decoded exactly to (h,R0,R1) by reading tagged generator cell IDs, and therefore preserves the qualified q_o ordinary future behavior.

Define a **LOCAL ribbon transition** T^hat_a for an original current legal column a with source landing event x=(a,h_a), p=sum h mod2:

- inspect every p-tagged residual generator that consists of exactly {x}; if present, the action is an immediate p first win and ordinary play TERMINATES;
- otherwise delete x from every p-tagged generator containing x (owner contraction);
- delete every 1-p tagged generator that contains x (opponent blocker);
- normalize source generator antichains by inclusion; raise h_a by one;
- if the board is now completely full without a previous win, terminate DRAW.

Each update modifies **references to one physical event across its four ribbon occurrences**; it may affect multiple terminal K-windows simultaneously but never treats the copies as separate stones. New display/certificate interval identities can be selected deterministically and do not change tagged source generator semantics.

**Conjugacy theorem (to falsify independently):** for every qualified nonterminal q and every literal legal column a,

    Φ(T_a(q)) = T^hat_a(Φ(q))

for nonterminal results, and both sides return identical first-win/draw terminal tokens when terminal. Legal literal action masks are identical, side-to-move follows support parity, and no history/non-q proof premises are smuggled into the source. By induction on the strictly descending remaining-event count, Φ is a full orientation-sensitive literal-action-labelled future-game bisimulation, so EXACT WDL and COMPLETE best-column sets are preserved.

This theorem is an exact **change of representation**, not an algorithm that already determines V and M*: the same strategic dependency remains, reorganized.

## 3. A second exact linear layer: the 7×6 edge GF(2) code

Along each strand, place a binary local *edge phase difference*

    δ_(x,y) = χ(x) XOR χ(y),

for consecutive physical cell IDs x,y along that one strand. On the fixed standard7×6 physical board (not a source frontier subgraph), adjacent undirected edges in four directions count:

    horizontal  H(W-1)=36;
    vertical    W(H-1)=35;
    rising      (W-1)(H-1)=30;
    falling     (W-1)(H-1)=30;
    total       E=131.

All four families together form a CONNECTED graph on V=WH=42 physical cell vertices, because horizontal+vertical edges already connect the rectangular grid. The GF(2) coboundary map

    D: GF(2)^V -> GF(2)^E,    (Dχ)_(xy)=χ(x) XOR χ(y)

has kernel consisting exactly of the two uniform assignments χ=all0 or all1 (dimension 1), hence rank V-1=41. Its 131 edge-difference bits lie in a 41-dimensional cut space satisfying E-(V-1)=**90** independent cycle-parity constraints. An absolute one-bit owner anchor recovers χ from δ. If one tries to "unfold" 131 edge bits as independent variables, those 90 independent GF2 cycle constraints must be retained or the representation admits impossible phases.

A K-cell **full physical line** in any ribbon is monochromatic if and only if its K-1 consecutive edge δ values are all zero. For standard K=4, every original length-4 win window is a run of THREE zero edges, equivalently

    MONO_L(χ) = PRODUCT_(edge in K-window) (1 XOR δ_edge).

The window predicate is a degree-(K-1) AND product of linear GF(2) edge differences, not a pure affine XOR equation. Terminal first-win depends on the earliest placement rank at which such a line is complete, not merely the final coloring; a true nonterminal source q uses surviving R0/R1 owner-tagged residual generators rather than reconstructing old colored owner bits.

**Dynamic caution:** when columns fill, physically FUTURE-event cells vanish from the live gravity poset, but original K-intervals passing through ALREADY OCCUPIED cells remain semantic terminal constraints via their surviving residual requirements. The fixed 131-edge full-board code is not automatically the same as an induced future-only active-edge graph. Pruning occupied cells and treating separated components independently can silently lose cross-column terminal dependencies.

## 4. Why this is close to, but distinct from, a "linear solver"

We have genuinely linearized the SHAPE of all winning lines into intervals; the GF2 edge **consistency** constraints are linear too. We have not removed three other features:

- The global alternating legal move clock and gravity reachability/next-cell enablement across W columns.
- The nonlinear K-way winning condition (AND all required events, OR across winning lines, earliest FIRST completion).
- Perfect-play adaptive alternation/response selection and exact all-move tie membership (two complete binary zero loci from the previous owner-directed XOR work).

The essential research challenge is whether combining **linear ribbon incidence**, **GF2 phase/cycle constraints**, **first-win deadline order**, and **guarded response closure** admits a NEW exact source-only normal form for both complete action zero loci, without independently evaluating inequivalent future games or hiding game trees in a factor network. This is not established by the representation change.

This is related in shape to exact CSP factor-graph variable duplication/equality nodes, not a novel general discovery about such representations: see https://pmc.ncbi.nlm.nih.gov/articles/PMC8303273/ and https://mediatum.ub.tum.de/doc/1538545/1538545.pdf . Do not assume tensor contraction/variable elimination is zero strategic branching: these can enumerate hidden alternatives.

## 5. Frozen genuine standard7×6 falsifiers (BEFORE running them)

1. Generate all four ordered ribbon families and independently compare their window incidence masks to ALL 69 original 7×6 horizontal, vertical, rising and falling winning masks. Each physical event must appear exactly once in each family (168 occurrences with 42 identical cell tokens). Verify 37 strands and per-family counts.
2. Generate all 131 distinct undirected nearest-neighbor edges and verify GF2 coboundary rank 41 / independent cycle count 90 by a separate spanning-tree or rank control, not merely by inserted constants. Check δ from independently generated owner-bit assignments on standard board, and confirm 69 full physical K-windows equivalent to the K-1 local zero-edge conditions.
3. Freeze the LOCAL ribbon q transition producer, then compare every legal action from diverse independent first-win-stopped REAL standard7×6 q (including 44444, 444444, 4444442 and early/middle/near-terminal rank samples) against the qualified original q core. Verify identical terminal outcomes, resulting h and both normalized residual antichains, ALL action labels. Full q identities must agree, not mere WDL.
4. On standard 444444 with completely filled center column, explicitly count surviving R_p requirements crossing **left and right** side future cells with an already occupied center anchor. If any survive, show that cutting ribbons at the center column or claiming 2 independent 3-column games would lose terminal coupling despite the full column no longer being legal.
5. Preserve a counterexample if treating the 4 ribbon copies or their edge phases independently admits impossible physical owners; check at least one shared original cell that occurs in both horizontal and vertical win windows. The COPY consistency condition is non-optional.
6. For mathematical payoff, corroborate first-win time/owner on supplied legal hypothetical 7×6 schedules via earlier independently qualified source-q XOR fixed-schedule payoff; DO NOT infer perfect-play WDL for canonical 44444. Reference game trees may be used ONLY after a source-structural theorem to falsify, never as the producer.
7. Disposition of each candidate: representation/future-game conjugacy PASS/FAIL; source zero-fanout ALL (V,M*) success OPEN unless separately proved. Keep all evidence, negative cases, W,H,K symbolic, and no new small-board-effect-size extrapolation. No solver implementation branch or IsoGraph 1.2 authority promotion.

**Note on dimensions for later generalization:** four strand incidence and connected-grid rank formulas are written in W,H,K for reference; numerical evidence ONLY current 7×6 Connect4. Shape-dependent qualifications must be proved separately before any generalization.
