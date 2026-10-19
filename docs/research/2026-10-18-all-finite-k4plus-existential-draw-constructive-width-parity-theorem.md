# Universal constructive DRAW HISTORY for ordinary gravity Connect-K with K>=4 — width-parity decomposition

**Date:** 2026-10-18 Pacific. **Research direction:** Josh Oshiro, nested width/height/K parity; formalization OpenAI ChatGPT. **Status:** NEW guarded deductive *EXISTENTIAL DRAW PLAY* theorem, frozen before independent original physical board validation. This is NOT an outcome-under-perfect-play theorem and is NOT authority-promoted. Research owner: research/semantic-quotient.

## 1. Precise proposition (no game-state search)

For EVERY positive integer W,H and every connection length K>=4, ordinary finite W by H gravity Connect-K from the EMPTY board has at least one completely legal alternating, first-win-stopped MOVE HISTORY filling all WH cells without any winner:

    exists original legal move word w of length WH:
        correct alternation and gravity at every prefix,
        no owner ever completes a geometric K-line,
        terminal filled board => DRAW.

Consequently each original EMPTY board has a **possible cooperative draw**, even if its actual perfect-play outcome is P0-WIN or P1-WIN. This is NOT a P0 or P1 strategy to force drawing against arbitrary opponent moves, so it does NOT establish V_empty(W,H,K)=DRAW for any previously unknown board.

## 2. Safe stripe: an exact no-monochromatic-three coloring on every even-width prefix

Take any EVEN number E>=2 of adjacent columns. Define a binary OWNER bit q(c,r) with 0=P0 and 1=P1:

    a_r = floor(r/2) mod 2  (sequence 0,0,1,1,0,0,1,1,...);
    q(c,r) = (c mod2) XOR a_r.

For any row, adjacent columns alternate owners, ruling out three consecutive same-owner horizontal cells. In any fixed column, owner phases follow 0,0,1,1 (or its complement); every three consecutive rows include both owners, ruling out vertical three-in-a-row. Along either slope-1 diagonal, successive owner phases are a_r XOR (c mod2), a_(r±1) XOR ((c+1) mod2), etc. Every 3-window of a is one of 001,011,110,100; no window is constant 000/111 and no window alternates 010/101. Its XOR with the changing column parity also cannot become 000/111. Therefore every horizontal, vertical and ascending/descending diagonal length-3 line in this stripe coloring is nonmonochromatic, so it contains NO monochromatic length-K line for ANY K>=3.

**Legal realization on an EVEN-width rectangle E x H:** Fill physical rows from bottom to top, in a block of E consecutive moves for each row. When a_r=0, fill row r in increasing column order 0,1,...,E-1; when a_r=1, fill it in DECREASING column order E-1,...,0. Because E is even, every new row begins with P0 to move. For a_r=0, the owner at column c is c mod2. For a_r=1, the reversed even-length row-order gives owner (c mod2) XOR 1. Gravity is automatic because every lower row has already been filled. The move word is therefore legal, alternating and realizes exactly q(c,r). Since the final coloring has no monochromatic length-3, no prefix can have achieved a K>=3 winning line either.

Hence for EVERY EVEN W and EVERY H, with K>=3, this one explicit row-scan play produces a DRAW.

## 3. ODD width and the reason K>=4 suffices

For ODD W, let E=W-1 (even, possibly zero). If E>=2, first fill the LEFT E columns to completion with the safe even-width row-scan history above. This uses E*H moves, an EVEN number, and leaves no winner for any K>=3 within the prefix. Then fill the sole RIGHTMOST column c=E from bottom to top in H consecutive moves. The next player is P0 (even prefix count), so that column's owner bits are

    q_last(r) = r mod2.

The new column itself contains no monochromatic vertical pair of neighboring cells. A winning line wholly in the first E columns remains impossible by the safe stripe. Any NEW horizontal K-line meeting the last column and with K>=3 also contains K-1>=2 neighboring cells within the striped prefix on the same row. Adjacent horizontal prefix cells are oppositely colored, so it cannot be monochromatic.

Any NEW ascending or descending diagonal K-line meeting the last column and with K>=4 contains K-1>=3 consecutive diagonal cells in the striped prefix. Those three preexisting cells already include both colors (the previous stripe lemma), so the full K-diagonal cannot be monochromatic, REGARDLESS of the new column's owner. This is the load-bearing K>=4 guard. For K=3, the new diagonal may have only two preexisting cells with equal owner and could be completed by the new column; this construction does NOT assert a K3 theorem.

For W=1, skip the even-prefix step and fill the sole column bottom-up with alternating P0/P1; no monochromatic K>=2 vertical segment is possible, and horizontal/diagonal K-lines do not exist. For W=odd>=3, the argument above applies.

The entire constructed W*H-move history is original gravity-legal and never completes any K>=4 winning line. Thus it is a genuine original FIRST-WIN-STOPPED full-board DRAW continuation.

## 4. Why this is mathematically relevant to dimension-to-WDL and parity

The old static K-1-column transfer correctly recognizes balanced nonwinning final colorings, but those colorings are only NECESSARY for a legal draw in general. This constructive result proves something strictly stronger in the EMPTY K>=4 domain: there is ALWAYS at least one GRAVITY-REALIZABLE alternating legal DRAW history, no matter the dimensions. So the new static balanced no-draw test cannot ever give an EMPTY-board source terminal exclusion for K>=4. It retains value for genuine PARTIAL positions whose previous placements constrain legal continuations.

The construction exhibits a genuine WIDTH-PARITY RELATIONSHIP:

    EVEN W: alternate the left-to-right row direction with 0011 row phase;
    ODD W: complete W-1 even columns in that phase, then use the
           unmatched final vertical column as an alternating-tail component.

These decompositions share geometry but do NOT imply WDL equality or perfect-play drawing strategies. In particular, externally recorded K4 6x4 is P1-winning and 7x6 is P0-winning despite both admitting this cooperative DRAW history. No strategic search or computation of first-win timing is needed: absence of a completed K line in the final coloring implies absence at every move prefix.

## 5. Independent falsification protocol (freeze BEFORE run)

1. Freeze source owner-defined word producer for every (W,H,K>=4): even prefix scanning each row in direction a_r, then odd rightmost column bottom-up. It must construct exactly WH original literal columns, with no game-value oracle or future strategic branching.
2. Freeze SEPARATE 69-line-style direct physical grid simulator generalized to W,H,K, rebuilding each geometric K-window and checking gravity frontier, correct turn owner, and first winner at every actual move. Run W,H=1..16 and K=4..8; include meaningful W<K, H<K, odd and even W, both parity classes of H.
3. Verify the completed physical owner field matches the prescribed stripe/tail identity, exact required P0/P1 counts, and no forbidden K-line exists. Any failed case is decisive; preserve it. A K3 odd-W use of the same naive tail is a deliberately out-of-scope negative control where a first-win witness may exist.
4. Independent small-board physically recursive minimax is allowed ONLY as a contrast after source freeze, illustrating P0/P1 decisive perfect-play values despite the legal drawn witness; no oracle value can be used by the constructor. Published 6x4 P1, 7x6 P0, and 4x4 DRAW are sufficient already sourced contrasts.
5. Preserve all records, source budgets, and scope; do not promote official qualified IsoGraph1.2 gameplay logic without qualification. A valid existential legal draw is NOT a forced draw, a Level1 WDL answer or a Level2 best move.

**Primary open problem remains unchanged:** determine exact perfect-play V_empty(W,H,K) and general V(q) without strategically alternative future-game valuation. This theorem establishes the qualitative reason static terminal-feasibility alone cannot settle that question in the K>=4 empty domain.
