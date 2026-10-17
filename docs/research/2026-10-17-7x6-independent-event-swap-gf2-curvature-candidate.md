# Second-order GF(2) curvature of legal event interleavings on the actual 7×6 board

**Date:** 2026-10-17 Pacific. **Research owner:** research/semantic-quotient. **Owner binary-core question:** eliminate turn sequence obfuscation with XOR while preserving exact 7×6 first-win and strategic outcome semantics. **Status:** mathematical falsifier/candidate, FROZEN BEFORE independent physical witness search. Not a nonbranching perfect-play solver, not game-theory authority promotion. W,H,K retain symbolic roles; experiments use only W=7,H=6,K=4.

## 1. Finite-difference test, not a claim that a strategic future was solved

Fix a genuine legal first-win-stopped standard7×6 source q, particularly history 44444 (five center placements, P1 to move). A **complete hypothetical gravity-event schedule** σ is an arbitrary interleaving of all remaining column chains. Gameplay stops at its earliest win; later events in σ are counterfactual bookkeeping only for the algebra. The source q's fixed-schedule first-win payoff is known exactly from previously qualified residual+event phase identities and is not a perfect-play value.

Choose two DISJOINT adjacent-order exchange locations i<j with j>=i+2, each swapping placements from different columns. Four full schedules are gravity legal:

    σ00 = σ
    σ10 = swap_i(σ)
    σ01 = swap_j(σ)
    σ11 = swap_i(swap_j(σ)).

Let for each schedule f_+=(first winner is P0), f_0=(first winner is NOT P1); draw has (f_+,f_0)=(0,1). Define mixed GF2 finite difference for either channel

    Δij fθ = fθ(σ00) XOR fθ(σ10) XOR fθ(σ01) XOR fθ(σ11).

If Δij fθ=1, then the exact **fixed-schedule payoff** is NOT affine in these two binary adjacent-swap switches: an affine expression α XOR βi XOR γj necessarily has Δij=0. This would establish nonzero *quadratic interaction* between otherwise independent legal order switches on the actual original geometry. It does NOT refute source-state zero-branch WDL discovery: the source may have a nonlinear closed arithmetic formula, and perfect play is not uniform quantification over entire complete schedules.

## 2. Why an XOR clock can still require nonlinear geometry

Each independent adjacent event exchange changes the future owner parity of exactly two involved cells and leaves all other ownership bits unchanged. Thus each of the four affected cell owner bits is AFFINE GF2 in the corresponding switch variable. For original K-line G owned by p, the fixed-schedule completion Boolean is

    C_p,G(switches)=PRODUCT_{e∈G}(1 XOR owner(e) XOR p).

Even when each owner(e) is affine, the PRODUCT of two factors depending on different swaps creates a degree-two term. Logical OR across original winning lines and MIN of their completion ranks add further nonlinear structure. XOR factors the alternating turn phase exactly; it does NOT turn conjunction, first-win competition or perfect-play action NAND into a linear XOR operation.

A genuine Δij≠0 witness would locate a minimal two-switch obstruction to trying to factor ALL geometry away into XOR alone. It would give a concrete source target for a nonlinear (e.g. XOR-AND) binary core and support the user's insistence that actual 7×6 original winning-line overlaps matter.

## 3. Frozen genuine standard-board falsifier

1. Generate deterministic hypothetical complete gravity-legal schedules extending original legitimate source 44444, never smaller-board substitutes. Reject any exchanged pair involving equal columns or overlapping adjacent swap slots; preserve first 5 fixed moves and original first-win after prefix.
2. Independently compute the FIRST WINNING PLAYER/TURN in each of four schedules using a true 7×6 physical board with 69 original lines, terminal-first. Confirm every pair swap changes exactly two final per-cell owners, and both swaps together change exactly four (since disjoint positions; cells also distinct under fixed chains and non-overlap). FIRST WIN timing may vary.
3. Determine Δij for both independent f channels and retain a fully reproducible exact 4-schedule witness if nonzero. A sample without one is a sample negative, NOT proof the payoff is affine.
4. If a witness exists, verify source q-only residual XOR payoff for all four schedules independently from the physical first-win observer, with no historical colored input to the source scorer; preserve every original line and event rank guard.
5. Consider whether the quadratic term comes from a single surviving residual generator involving cells in both swaps or from **competing distinct first-win lines**. Do not infer one cause without checking winning lines and times.
6. All four complete schedules are TEST INPUTS for a static Boolean algebra identity, not a zero-strategic-branching producer or perfect-play WDL evaluation. Source algorithm must still independently produce both COMPLETE child-value zero loci for every literal root move or remain INCOMPLETE.
7. Record exact source hash, seed, sample counts and negative cases; commit test harness BEFORE running. No tree search, policy expansion, BDD/QBF, 4×3 or 4×4 benchmarking.

**Authority limit:** a second Boolean derivative constrains representation degree for the *fixed schedule payoff*, not a universal lower bound on algorithms or any claim about true unrestricted V(44444), still UNKNOWN along with all optimal labels.
