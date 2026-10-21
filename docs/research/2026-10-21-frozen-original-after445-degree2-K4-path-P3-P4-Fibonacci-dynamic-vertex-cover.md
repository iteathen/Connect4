# FROZEN: original quartic K4 after 445 yields P3/P4 path vertex-cover interference and Fibonacci counts

Date 2026-10-21 PDT. Canonical `iteathen/Connect4` research/semantic-quotient; owner research direction Josh Oshiro. Strict proof target: original 7x6 P0 forced win from EMPTY by source four-way geometry, gravity, valid turn response, without reading historic28 line labels or solved root results. The initial P0 prefix `445` is merely a legal source exploration, NOT established perfect P0 play from empty.

Let P0 actual bottom owner cells after legal prefix 445 be x4,x5 (one-based columns4,5 row1) and P1 own c4 row2. Build the exact ORIGINAL 4-body K4 multilinear polynomial W=SUM over all H/V/rising/falling actual K4 windows PRODUCT over four physical site variables; specialize P0-owned c4,c5 to1 and P1-owned c4r2 to0, leave other currently EMPTY physical site variables. Its homogeneous residual degree2 part in original bottom-row variables is conjectured to be:
 W6 degree2 = x2*x3+x3*x6 (adjacency polynomial of path P3 with physical vertex order 2--3--6).
 W7 degree2 = x2*x3+x3*x6+x6*x7 (adjacency polynomial of path P4 with order 2--3--6--7).
 Verify NO OTHER original V/R/F or non-bottom two-missing K4 terms survive from that actual source partial board.

Player1 bottom stone x_j sets corresponding variable0, killing all original P0 two-missing monomial edges incident to that site. A static set B of P1 bottom sites kills EVERY degree2 P0 source line iff B is a VERTEX COVER of the path. Expected:
 W6 min cover cardinality1 with unique {3}.
 W7 min cover cardinality2 with exactly THREE min covers {2,6},{3,6},{3,7}.
 The number of ALL covers on a path Pn equals number of independent sets on Pn = Fibonacci F_(n+2), with F1=F2=1: W6 graph P3 total5 covers, W7 graph P4 total8 covers. Verify independent enumeration all subsets of literal vertices and exact graph path combinatorics; don't infer real game WDL from number counts.

Original chronological P0 move5 pivot forcing (previously source-proved): under P1 move4 c3, P0 takes c6 and P1 must take c7 on move6; under P1 move4 c6, P0 takes c3 and P1 must take c2 on move6. The *third* static minimum cover {c3,c6} becomes chronologically unavailable because P0 occupies the second pivot before P1's move6, leaving precisely the surviving original literal prefixes 445367 and445632. Exactly these two q6 P1 blocker sets are degree2 source covers; all P0 original live K4 residuals at the resulting q6 have size≥3 (no grade1/2), and P1 in one branch acquires a grade2 rising diagonal. Verify with source original 54/69 K4 and independent literal firstwinner replay.

This is a small typed nonrecursive *online vertex-cover* mechanism. Distinguish it from the separate 7-clause fixed disjoint distance-two phase matching UNSAT; they are different mathematical objects and neither individually proves universal original root winner. Crucial negative scope: successful P1 defensive repair resets P0 low-degree K4 geometry; a simple monotone 'P1 paid two repairs therefore permanently insolvent later' is false.

Confirm earlier bounded independent five-ply result: from both repaired q6, P0 cannot FORCE win by move11 using an at-most-five-ply original ray checker, although a cooperative continuation might permit a P0 win11. This is a diagnostic of constrained q6, not root optimal game WDL.

No historical strong28 or root solver consulted. Persist exact K4 list, formal line residual polynomial, vertex cover enumeration, full legal firstwinner controls, novel Fibonacci correspondence and falsifiers. No qualified IsoGraph1.2 / production solver edits, no maintained CI or external assistant run claims.