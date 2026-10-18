# Source-q K-banded gradient interface, cut transfer, and the geometry-only WDL falsifier

**Date:** 2026-10-17 Pacific. **Owner direction:** exact standard (W=7,H=6,K=4) geometry unfolding with the turn clock separated by XOR, and zero strategic branching for (unrestricted V, ALL optimal literal moves). **Owner:** research/semantic-quotient. **Status:** source-only algebraic candidate FROZEN BEFORE INDEPENDENT REAL 7×6 REFERENCE. W,H,K retained symbolically for eventual later generalization. No IsoGraph 1.2 promotion or solver branch.

## The active mathematical question

Can the original 69 winning requirements be expressed as a one-column-at-a-time transfer across K-local boundaries so that global geometric branching disappears, leaving one exact source descriptor and a potentially certifiable nonbranching strategic value invariant? Prior four linked 1-D ribbons, 204-slot word tape, source q, gradient delta and XOR phase are **exact behavior-preserving changes of representation**, NOT source WDL. A useful next step must preserve full original source R0/R1, not replace them by row parity or height-only signatures.

## I. Exact static K-banded original-line envelope

Fix a cut after column b, with L_b={0,...,b}, R_b={b+1,...,W-1}. For any residual generator G∈R_p(q), its original K-line origin has either:
- width 1 (vertical line), hence cannot cross any cut; or
- width exactly K consecutive columns (horizontal, rising, falling).

Thus if the FUTURE required-cell set G contains at least one cell in L_b and at least one in R_b, it necessarily lies inside an original K-consecutive-column line crossing cut b. In particular the original line's leftmost column s satisfies

    max(0, b-K+2) <= s <= min(b, W-K),

and all G cells lie inside [s, s+K-1] and at most K-1 columns to either side of the cut. Across all crossing lines, the bounding band is at most 2(K-1) consecutive columns, with board truncation at the edges. At standard K=4 the central cut can couple up to 6 columns, NOT an independent pair of three-column games.

An original geometric line crossing a cut may have all its STILL REQUIRED cells on one side (because some cells on the other side are already owned); such a source residual is not a present **bridge**. The correct active interface is defined from the CURRENT normalized surviving G, not merely from the unfiltered original 69 lines.

## II. Exact source-owned pair factors, WITHOUT per-side normalization

For each owner p and original source G∈R_p(q), define the disjoint physical masks

    G_L=G∩futureCells(L_b), G_R=G∩futureCells(R_b).

Store the exact pair (p,G_L,G_R), including empty half. The map from R_p to pairs is **injective** with inverse G=G_L∪G_R and preserves source antichain identity. Normalize ONLY after reconstructing whole G, NOT the projections separately: independent one-side absorption can incorrectly delete a line combination that is not dominated in the entire board.

For any hypothetical fixed future event phase ownership χ_e, p-satisfaction is exactly:

    C_{p,G} = [∀e∈G_L,χ_e=p] AND [∀e∈G_R,χ_e=p].

A line is completed at the latest relative time of its required events; FIRST winning line is the earliest over all source generators and both players. This is a Boolean-factor transfer over one original q (not WDL or strategy evaluation). A product of side factors is still nonlinear and requires first-win chronology.

## III. Exact local one-action transfer, including bridge migration

Let x=(a,h_a) be the single current gravity-playable cell of action a, p=ply mod2 and o=1-p. If x is left of cut b:

- For each p-owned pair, remove x from its **left mask**, leaving right unchanged, then globally inclusion-normalize complete union masks. If both halves empty, terminal **P win before any other effect**.
- For each opponent-owned pair whose left mask contains x, delete the WHOLE two-sided pair (both left and right); otherwise retain both halves.
- Update h_a; check full-board draw after non-winning move; if action lands to right, use symmetric mirror laws.

An originally crossing p-owned bridge pair (nonempty both halves) can become one-sided once a move contracts its last required cell on one side; an opponent blocker can delete a bridge outright. Therefore the **active bridge interface can shrink** (or its tags can migrate from crossing to local) even as the immutable original geometric K-windows stay fixed. This is a controlled *dynamic decoupling of potential winning constraints*, not necessarily a decomposition of strategic game value.

The source cut transformation must commute with canonical q cofactor:

    decode(interface_next(encode(q),a)) = q_next(q,a)

including exact literal winner/draw terminal tokens. This gives full orientation-sensitive future-game structural congruence by well-founded induction, but does not deliver (V,M*).

## IV. Height-gradient / virtual diagonal shears belong in the interface

For each future cell let j(c,r)=r-h_c. Along an original nonvertical K-window with physical column step i and slope s∈{0,+1,-1},

    j_{i+1}=j_i+s-Δ_{c+i}, Δ_c=h_{c+1}-h_c.

Thus every crossing source factor can be *displayed* by one anchor future ordinal plus ≤K-1 local affine column translations, while the original physical event ID remains semantic authority. Some original window cells are ALREADY historical (j<0), so the certificate must retain the original geometry container and source R_p rather than treating every translated ordinal as still to be played. The accompanying turn-phase equation

    χ(c,r)= (n+j(c,r)) mod2 XOR β(c,r)

remains exact for a supplied future event order; β is the as-yet-undetermined future-other-column interleaving. Retain global turn parity, column legal capacity, and all first-win timing.

## V. Strong boundary warning / falsifier

It is **not valid** to infer exact unrestricted V(q), Z_+, Z_0, or M*(q) from heights h, integer gradients Δ, parity gradient g, and original geometry alone. These omit which historical cells belong to P0/P1 and hence omit original source survivors R0/R1. This is not merely a theoretical concern: freeze a standard-board CONTROL comparing two legal first-win-stopped actual 7×6 positions with exactly the SAME h (thus identical n, Δ, g, available cells and original K-line geometry), but DIFFERENT R0/R1 and DIFFERENT unrestricted future WDL values. Derive candidate h-only claim rejection without feeding solved labels to any source producer.

The height-gradient source representation should be tested for **losslessness only when combined with full original R0/R1** and first-win guard. Same support is not same semantics in the qualified q theory. This falsifier does not refute a successful FUTURE new source relational theorem based on the full q.

## VI. Frozen true7×6 proof/validation plan

1. Compute the original 69 K-lines, exact static geometry crossing counts for ALL six column cuts, and SOURCE actual-cut bridge factors for canonical legal prefixes 44444, 444444, 444441, 4444442. Record L/R-only and crossing per player, projection overlap, plus any center-capacity zero cut.
2. Freeze a SOURCE-ONLY transfer producer that stores pairs (p,G_L,G_R) using exact 42-cell masks. Compare every ordinary legal one-step q cofactor to the original qualified exact-q-core on genuine legal 7×6 physical q across early/mid/late ranks. Independently construct q from true legal physical owner bits; source transfer has no recursive WDL, future-game query or strategy table.
3. On a seeded corpus of legitimate near-terminal 7×6 physical positions, freeze the height-only insufficiency test *BEFORE* querying an INDEPENDENT branching exact-q WDL reference. Seek two positions SAME h, DIFFERENT R and DIFFERENT unrestricted V, preserve actual legal histories and both complete M* if found. Reference may branch ONLY in validator after freezing proof purpose; no value moves into producer.
4. As further structural target, investigate whether q-cut bridge factor signatures can certify an exact relation between all root action zero loci by source-only algebra. If the only available method enumerates assignments to bridge variables or values multiple inequivalent future games, record INCOMPLETE/FAIL_ZERO_BRANCH, not a success.
5. The canonical 44444 full unrestricted WDL and full tied optimal literals remain UNKNOWN unless newly proved by nonbranching source operator. Do not promote game-theory authority or merge, or use smaller boards as discovery proof.

**Epistemic reminder:** local geometric interfaces and their full q transition conjugacy are exact mathematical representation results; counts of crossing constraints, GF2 rank, and less recursion are not certificates of zero strategic branching.
