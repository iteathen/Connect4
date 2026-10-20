# Frozen candidate: 28 strong-optimal terminal lines, physical-junction graph and 27 relative modes

**Date:** 2026-10-19 (America/Los_Angeles). **Research owner:** `research/semantic-quotient`. **Status:** MATHEMATICAL CANDIDATE FROZEN before independent reconstruction/validation; observed counts below are source-discovery predictions, not independent qualification. **Game:** exclusively standard W=7, H=6, K=4, gravity, P0 then P1 alternating, first win ends play.

## 1. Authority and source-set identity

The set `T` consists of the **28 actual original geometric four-cell winning-line IDs** supported as *first terminal P0 winning lines over empty-root, distance-sensitive strong-optimal histories* by September 14 GitHub [issue #41](https://github.com/iteathen/Connect4/issues/41), accepted historical claim C4-R0049 and October 19 replay. `|T|=28`; individual 41-move paths have qualified external strong-score ancestry, but this paper does not rerun those values. It does not substitute arbitrary solved midgame positions. Historical WDL-only terminal set 61 (less complete raw preservation), all physical lines 69, per-board unblocked lines U(s), and sampled 27 support-mirror LOSS q are different referents.

The independently derived static GF(2) spaces `Y_cell=Y_line=28` are **not** the coordinate span of these 28 line identities; restriction of the original 69-to-42 GF(2) physical-cell incidence to `F2^T` has rank26, kernel2, and recorded filtration `28=2+20+6`. Its two line-dependency supports (original line IDs) are
`{34,35,37,43,53,58}` and `{13,14,27,28,61,62}`. Source: `docs/research/2026-09-14-optimal-28-oracle-incidence-audit.md`.

## 2. Freeze the physical overlap operator BEFORE testing its rank

Define ORIGINAL physical cells `X={(c,r):0<=c<7,0<=r<6}`. The five actual strong-optimal opening moves use center column 3 (zero-based), so the initial center-stack physical event `(3,4)` is already P0-owned. At P0's strong-optimal terminal ply41, the last stone must land in one of the top two zero-based rows 4 or5. Independently of whether any particular late-game arrival is strategically realizable, define the **candidate final-landing junction sites**

```
F = {(c,r):0<=c<7, r in {4,5}} minus {(3,4)}.
```

This is a fixed, rule-derived, 13-cell physical set conditional on the **historically externally certified** center-prefix/horizon premises. It is NOT a new from-empty nonsearch derivation of those game-semantic premises.

For each `L∈T`, let `F(L)=L∩F`. Define an undirected simple graph `G_F=(T,E_F)` **without arbitrary edges**:

```
{L,L'}∈E_F  iff  L≠L' and there exists x∈F(L)∩F(L').
```

Each edge means the TWO original K4 line windows contain ONE COMMON physical final-landing-*eligible* junction, with all four unfolded orientation occurrences glued to that SINGLE cell. It does **NOT** mean that the two line identities can be simultaneously realized in a single strong-optimal played history, nor that they share a game-value or perfect-play equivalence. Compare the unrestricted graph based on ANY shared physical K4 cell as a robustness control.

Choose once and for all an orientation of each genuine edge (e.g. lower numerical line ID to higher numerical ID for execution only). For a scalar or player-conditional complex-valued line signal `f:T→C`, define the incidence **coboundary**

```
(d_F f)_{L,L'} = f(L')-f(L).
```

Over GF(2) the same unsigned incidence operator becomes XOR of the two line-coordinate bits. This is a difference operator on the 28 line-identities, **not** the historical 69-to-42 line-to-cell incidence `B`, and not an original game transition. The line graph is defined on the geometry FIRST, before attaching P0 and P1 separate amplitudes or performing Fourier.

**Frozen prediction from preliminary source enumeration:** the physically defined `G_F` has 28 vertices, 102 distinct overlap edges, one connected component and minimum degree2. Thus it should have a spanning tree of 27 edges, incidence/coboundary rank27 over C, Q and GF(2), one scalar constant-mode kernel, 75 independent undirected cycles (over GF2), and a 27-dimensional space of relative complex-valued signals. Here **27 counts independent vertex differences, NOT the number of physical shared-line links**; the latter is predicted to be 102. A connected 28-node overlap graph could have many choices of spanning tree; selecting an arbitrary tree does not make its edges the unique fundamental 27.

The physical reflection `J_x:(c,r)→(6-c,r)` is expected to preserve `T`, `F` and `G_F`, with 14 pairs of line nodes and no fixed line. Over characteristic zero, the 28-coordinate line representation should split as 14 reflection-even plus14 reflection-odd dimensions; after removing the global constant, **27=13 reflection-even relative modes +14 reflection-odd modes**. This finer symmetric rank signature is a candidate to validate, not an accepted WDL symmetry beyond the already qualified physical Jx reflection.

## 3. Keep the different 27s separate

A **separately existing and exact** unfold-first four-way owner-junction tensor uses four copies of a THREE-state physical owner label `s∈Z3` (empty,P0,P1), projected by four local Z3 Fourier transforms. Its nonzero modes obey
```
(k_H+k_V+k_R+k_F) mod 3 = 0;
```
there are **27=3^3 allowed CHARGE-TUPLES per physical junction**, 54 zeros out of81. A different eight-binary-leg Hadamard owner tensor contains a rank-one forbidden-state correction. Neither 27 is a dimension of terminal-line relative modes automatically. In particular, there are 42 junctions with these local 27 sectors, not a distinguished set of 27 global strategic quantities. The existence of a 27-dimensional complex function space on local allowed Z3 sectors and a 27-dimensional complex graph-gradient image permits abstract, noncanonical isomorphisms; **NO natural intertwinement, game-semantic meaning or graph/sector basis correspondence is currently supplied**.

A third number27 in the October18 research is **27/35 first-touch gate cells that lack a one-common legal blocker** at genuine `44444`, a proof-method obstruction. Another 27 was a count of independently physically solved later loss q from a sample, already covered by another prior proof family. Both are logically distinct from the graph and Fourier sector 27s.

## 4. Connection to unfold-first P0/P1 ownership potentiality

Build the 37 original finite H,V,rising,falling strands, 42 shared physical junctions, 168 appearances and 69 exact K4 physical windows, then restrict to the 28 historically certified terminal line IDs. Site/copy gluing must be enforced BEFORE Fourier. For any rigorously chosen actual-history ensemble or symbolic per-owner line field `a_0,a_1∈C^T`, the two graph gradients `d_F a_0`, `d_F a_1` are exact linear DIFFERENCES and each loses one uniform-offset dimension. The signed owner contrast has gradient `d_F(a_0-a_1)` and the same one-dimensional constant kernel on the contrast coordinate, **but this does not remove the absolute line potential or two owner-specific global offsets**. A zero gradient indicates constant SCALAR line signal, not canceled geometric windows, blocked K4 lines, or any WDL result.

No uniform distribution over hypothetical gravity-shuffle colorings is a perfect-play distribution. Weighted local cancellation, the prior 15 genuine empty-shuffle equal-P0/P1 line-potentiality nodes, rank-one exclusion tensor and 27 Z3 sectors remain **operator/representation mathematics** until a first-win-stopped strategy-sufficient theorem exists.

## 5. Frozen independent standard7x6 validation and rejection criteria

1. Independently reconstruct the original 69 physical four-cell windows from 7×6 open boundaries; do not trust or numerically fit the desired 28. Parse original issue #41's full 28 witness physical coordinates/IDs, require set equivalence and original firstwin physical replay.
2. Build F from actual top two rows and P0 occupied center site. Reconstruct the bipartite `T↔F` physical incidence and derived simple pair-overlap graph; verify exact edge count, all vertices, connectedness using an explicit 27-edge spanning-tree witness, orientation-independent GF2/Q rank, and cycle/nullity counts.
3. Independently recompute original cell-incidence `B|T` rank26 and 2 natural dependency witnesses over GF2 (and Q as a separate check), so the new 27 cannot be misrepresented as that matrix's rank.
4. Independently derive the reflection action; count fixed T lines, orbits, parity character dimensions and show `d_F` equivariance with the graph's induced edge orientation. Treat GF2 as a separate field; do not import the characteristic-zero ± eigenspace statement.
5. Verify four-ribbon junction links, 13 eligible physical F sites and no periodic-edge wraps; ensure graph adjacency cannot equate P0/P1 owner probabilities, strategically justify blocked lines or imply legal shared terminal games.
6. Independently evaluate 3^4=81 local Z3 Fourier charge signatures as **exact algebraic sums** and check exactly27 nonzero /54 canceled per local junction; do not identify these modes with graph edges through only a number match.
7. Falsify uniqueness/specificity: repeat incidence graph for ALL original 69 lines on this SAME board (the obvious connected-graph rank rule may hold with rank68), remove all row5 or row4 eligible links separately, and compare. No other board sizes, K, or arbitrary perfect-play starting positions.

**Qualification boundaries:** the generic connected-graph rank `n-1` has an elementary proof; the **specific** connectivity/102-edge/14-orbit assertions require an independent *original-geometry* check. Even if all pass, the theorem establishes an exact static-topology relationship between known root-perfect terminal line IDs and 27 relative modes—**not a non-search derivation of which lines are optimal, and not a new exact WDL oracle**. A future WDL law must additionally show how actual gravity/legal move order, owner-specific four-body K4 projectors, first-win absorption and both-player adaptive quantifiers act on the proposed quotient without losing strategically relevant information.
