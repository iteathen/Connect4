# Three-dimensional orientation-layer lift and diagonal intersections — candidate direction

**Date:** 2026-10-18 (Pacific). **Owner motivation:** investigate Connect4 as a topological incidence structure rather than a flat displayed grid; in particular understand how diagonal connection lengths and their crossings interact with horizontal/vertical lines, nested parity, width, height and K. **Status:** research candidate / clarification; NOT a novel exact WDL theorem, qualified IsoGraph authority revision, or implementation approval.

## Precisely stated difficulty

The four original line foliations are
- horizontal: y = constant;
- vertical: x = constant;
- ascending diagonal: x-y = constant;
- descending diagonal: x+y = constant.

Introducing u=x+y and v=x-y does not provide independent new degrees of freedom: x=(u+v)/2 and y=(u-v)/2, and integer cells require u and v have the same parity. Consequently adding a **third Euclidean position coordinate** cannot by itself remove intersections or make four line families independently playable. Euclidean diagonal step length sqrt(2) is not the game's connection-count distance; each of the four allowed directional steps counts exactly one connection. Chebyshev distance is a useful visualization metric, but arbitrary king-move bends are NOT legal straight winning lines.

## Candidate three-dimensional visualization / combinatorial lift

Use two physical coordinates plus one **categorical orientation coordinate** d in D={H,V,D+,D-}. Define

    X_tilde = { (x,y,d) : (x,y) physical, d in D }.

On the orientation-d layer, connect only nearest neighbors along the corresponding unit vector:

    H=(1,0), V=(0,1), D+=(1,1), D-=(1,-1).

Every physical original cell has four copies with one shared move/owner/availability identity:

    (x,y,H) ~ (x,y,V) ~ (x,y,D+) ~ (x,y,D-).

Do not interpret a chain that changes orientation via an identity link as a valid K-in-a-row win. Every geometric terminal predicate is an uninterrupted length-K interval in one fixed d layer. Enforce ordinary gravity on **one physical height vector** h_x and original single landing event (x,h_x), synchronously reflected into all orientation layers. Track R0/R1 on common physical cell identities, with source first-win-stopped terminal rules unaffected.

This is a three-dimensional *visualization / categorical layering*, not a claim that the intrinsic geometry becomes three-dimensional. The exact combinatorial 4-layer construction is already substantively present in `docs/research/2026-10-17-exact-four-ribbon-geometry-unfolding-and-phase-code-candidate.md`; existing 7x6 values: 42 physical cell identities, 168 directional appearances, 37 maximal strands, 69 original K4 winning intervals. Reuse that evidence; do not mint a duplicate authority or misattribute novelty.

## What is new to investigate

Earlier four-ribbon work proved representation equivalence. The exploratory research direction here is to treat **intersection coupling** as the primary object in a DIMENSION-VARYING WDL program. Each physical cell is a four-way junction. Each K-line is one monochromatic straight oriented interval; different line intervals can overlap at one or more common physical cells. The relevant object is an exact line-to-cell incidence tensor, plus direction-labelled local edges and parity/resource labels.

Construct an oriented hypergraph (or strand-intersection incidence complex) with:
- original physical cells as shared junctions;
- four disjoint orientation families, each containing fixed-direction K intervals;
- the original gravity predecessor chain in vertical columns;
- parity of remaining future cells, with paired-cell capacity **separate** from parity;
- interfaces of at most K-1 previous columns for newly introduced horizontal/diagonal K windows when extending width by one.

Ask whether the local intersections induce a **finite, strategy-sufficient compositional algebra** as width grows for fixed H,K, and whether a two-row vertical extension adds only neutral pairs under PROVED guarded conditions. A finite geometric interface is established; a bounded STRATEGIC WDL interface is NOT.

## Epistemic limits and falsifiers

1. The image of a 3D geometric embedding must not be confused with independent dimensions or a new gameplay semantics; all four same-cell copies are ONE event.
2. Simple eigenvectors, incidence counts, XOR/cycle parity, and layer-independent line completion do NOT establish forced WIN/DRAW/LOSS.
3. Cross-orientation intersection may be a valuable WDL invariant only after proving adaptive strategy congruence or guarded exact outcome consequence, not by preserving completed-board coloring alone. The prior `2026-10-18-geometry-trace-quotient-strategy-causal-counterexample.md` already falsifies the inference from fixed endpoint equality to strategy-value equality.
4. First-win stopping remains the governing gameplay meaning. There is no requirement that a candidate dimension-to-WDL formula explicitly enumerate first-winner times or strategically inequivalent future game states.
5. Preserve physical 69-line parity/geometry regression, including nontrivial full-column bridges and source R0/R1. Unknown new mathematical strength: **OPEN**.

**Next falsifiable question:** can we derive a 4-orientation intersection invariant with richer information than plain geometric incidence, whose update under adding one column is independent of distant columns, while still respecting globally alternating ownership and gravity? A no-go showing unavoidable nonlocal phase coupling is equally informative. Do not assert a total non-search dimension-to-WDL algorithm without proof.


## Additional exact result — crossing diagonals without target-cell intersection can share extensive gravity support

This is a concrete owner-motivated explanation of why diagonal/X/Y intersections in a topology are more complicated than ordinary line crossings. Work in an **initially empty** board containing a K-by-K bottom-anchored patch over K adjacent columns. Let

    L_+ = { (i,i) : i=0,...,K-1 }
    L_- = { (i,K-1-i) : i=0,...,K-1 }.

Both are genuine opposite-orientation K-cell geometric lines. Direct winning-cell intersection is

    |L_+ ∩ L_-| = K mod 2

(0 for even K, 1 for odd K).

Define the physical GRAVITY SUPPORT CLOSURE

    S(L) = union_{(c,r) in L} { (c,t) : 0 <= t <= r }.

This is the set of cells that have to be filled by either player for EVERY cell in L to become physically accessible. It is NOT the set of cells the intended winning player must personally own. Both diagonals have

    |S(L_+)|=|S(L_-)|=K(K+1)/2.

In column i, the two closures share exactly

    min(i+1,K-i)

cells, so

    |S(L_+) ∩ S(L_-)| 
       = sum_{i=0}^{K-1} min(i+1,K-i)
       = floor((K+1)^2/4).

For K=2m, the sum is m(m+1); for K=2m+1, it is (m+1)^2. At K=4 the two WINNING LINES intersect in ZERO cells but their GRAVITY SUPPORT CLOSURES intersect in SIX cells. This is a symbolic identity for all positive K, not a solved WDL conclusion.

This establishes TWO different source-relational intersections worth tracking:

1. **winning-cell incidence overlap**: |L∩M|;
2. **gravity-support overlap**: |S_h(L)∩S_h(M)|, with h-based future support for genuine nonempty q.

The second may capture indirect column dependencies invisible to the first. In a nonempty q, support is anchored at h: for each column touched by G, include only the still-future physical cells from h_c through the highest G cell in that column. Recompute the expression, not reuse the empty-board triangle.

**Limits:** common supports can be occupied by either player, and their overlap is NOT itself a threat, a defense, a coupling of forced strategies, or a perfect-play winner. More explicitly: support footprint cardinality is not a duration-to-win theorem and no first-win timing search is prescribed. Proposed next algebraic task: combine signed winning-incidence overlaps with gravity support-overlap and CPC column-phase relations, then test whether such a local interface is sufficient for guarded no-win/win information across dimension extension; preserve any counterexamples where it is not.
