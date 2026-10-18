# Critical repair: first-terminal colored-profile convolution requires backwards co-reachability

**2026-10-18; SOURCE MATHEMATICAL FAILURE preserved and correction FROZEN before independent verification.** Canonical research owner `research/semantic-quotient`; qualified IsoGraph 1.2 unchanged.

## 1. Precise failure of the previous FROZEN unguarded theorem

The historical source theorem `docs/research/2026-10-18-multichain-absorbing-original-winline-source-terminal-masks.md` and its frozen implementation `standard7x6-source-multichain-absorbing-first-terminal.mjs` asserted exact FIRST winner possibilities over ALL COMPLETE hypothetical gravity shuffles realizing ONE specified physical owner-color profile. It propagated forward nonterminal colored prefix resource masks `N_k` and absorbed a win whenever an original owner winning generator became complete on a colored physical event. **That claim is FALSE as stated**: `N_k` also includes coloring-compatible prefixes that have no legal continuation respecting all future physical owner bits. A terminal reached from such a *dead-end color prefix* is not reachable by ANY COMPLETE hypothetical shuffle of the requested profile, even when a physically valid game could stop at that prefix under some partial play.

Actual FIRST frozen true7×6 independent discrepancy:
- Genuine original nonwinning prefix `44444`, P1 to move, original source R0=48/R1=42;
- selected future physical owner words c1:[1,1,0], c2:[0,1,0], c3:[1,0,1] (three future gravity events per column);
- historical source falsely reported P1 first-win relative rank range **7..9**;
- independent original 69-line physical exhaustive future-word observer found P1 FIRST only at relative rank **9** in all 12 complete colored-profile-compatible hypothetical words;
- source owner outcome P1-first happened to agree, but its purported exact lower rank was a false claim.

The first failure is durably preserved in `research/isograph/discovery/2026-10-18-unfolded-phase-race/STANDARD7X6_MULTICHAIN_ABSORBING_FIRST_TERMINAL_INITIAL_FALSIFIER_FAILURE_0_1.json`. The previous theorem/file must not be promoted, and a prefix winner without full-profile co-reachability must NOT be treated as a legitimate fixed-**complete**-profile outcome.

## 2. Sound exact repaired theorem

Keep the EXACT original source `q=(h,R0,R1)`, fixed r colored gravity chains, layer k and mixed-radix resource index J from the earlier `docs/research/2026-10-18-multichain-mixed-radix-colored-shuffle-factorization.md`.

Let `M_(k,d)` be source legal colored head-eligibility bitmask, and let `S_k` be the source backwards full-color-completion viability masks:

    S_T = bit(full target selected prefix vector).
    S_k = OR_d ((S_(k+1) >> stride_d) & M_(k,d)).

A resource count vector i∈S_k means **at least one complete hypothetical original gravity/phase schedule of the target owner coloring exists from that resource point**. This is fixed-profile SCHEDULE feasibility only, not a full-game opponent policy.

As before, construct original q generator threshold vectors θ_{p,G,d}: the minimum number of selected physical events from each column required for G∈R_p to be fully p-owned; omit G if any cell lies outside target p-owner allocation. At a colored-prefix source event edge i --d--> i'=i+e_d, with mover p=(n+k) mod2, `Win_p(i')` means some p generator has all θ_{p,G}≤i' componentwise.

**Exact corrected absorbing convolution:**

    N_0 = bit(zero counts).
    For each k=0,..,T−1:
      for each i in N_k and source eligible d:
        i'=i+e_d
        GUARD: i' is in S_(k+1).
        if not GUARD: ignore this entire edge
          (color-compatible prefix but NOT extendable to complete target coloring);
        else if Win_p(i'):
          record Pp FIRST WIN at relative rank k+1;
          do not propagate i' as nonterminal;
        else:
          N_(k+1) |= bit(i').

At T, `N_T` containing the full resource vector certifies existence of a complete original fixed owner profile with NO FIRST WIN within the segment.

**Soundness/completeness theorem:** N_k bit i is 1 iff some physically legal, color-compatible, FIRST-WIN-FREE prefix reaches i **AND** that same prefix can be extended counterfactually to a COMPLETE gravity-legal owner coloring matching all remaining specified events. Absorbed p terminal edges with the S_(k+1) guard are precisely all actually possible FIRST winner placements among full hypothetical words of the specified profile, preserving original first-win stopping. Thus recording the absorbed P0/P1 results and nonterminal final N_T exactly classifies the fixed owner profile's complete-shuffle FIRST terminal outcome SET and min/max actual first-win ranks.

Proof by induction: base empty prefix is co-reachable because source prechecks profile feasibility S0 bit0. Every eligible edge preserves gravity and player-clock color. A target in S_(k+1) guarantees some complete suffix independent of prefix word order, since future availability depends only on fixed physical column-prefix counts and global rank, and original FIRST WIN has already been handled by absorbing. Induction in both directions gives precisely the prefixes that occur on complete target-colored full words before their actual first win, and every such terminal first-win is absorbed at its first completed original surviving generator. The co-reachability requirement excludes dead-end prefix ghosts. This makes source chronology reduction exact **for a specified complete owner-color allocation**, not for arbitrary unfinished-game prefixes.

## 3. Strictly separate original full-game semantics

The completion suffix after a FIRST win is a COUNTERFACTUAL bookkeeping schedule used only to characterize a supplied **full owner allocation**. Actual Connect Four stops at that first win. By refusing nonextendable prefixes, we intentionally distinguish this *complete profile* from a different valid partial physically terminal trajectory whose opponent may not finish that target coloring. The resulting exact terminal-outcome set is NOT perfect-play WDL of q and does not prove any original first action is Level2 BEST against unknown/adaptive opponent play.

The source scans finite static colored resource prefix states and merges them with OR. It does **not** enumerate complete word strings, independently value strategic future game q states, or construct a minimax/strategy tree; finite combinatorial resource work is explicitly disclosed. For large r, budget failure remains INCOMPLETE. Keep the owner qualification boundary.

## 4. FROZEN same-corps independent physical attack

- Preserve the unguarded original source file and evidence unchanged.
- Freeze a separately named corrected SOURCE ESM producer `standard7x6-source-multichain-absorbing-first-terminal-coreachable-v2.mjs` with identical original q and θ logic but backward S-compatible event guards, before executing any new physical controls.
- Re-use the previously independent frozen original 69-line checker `standard7x6-multichain-independent-original-physical-falsifier.mjs` and frozen 62-case test matrix; freeze a separate v2 comparison script before testing.
- Compare first winner possibility SET and FIRST terminal rank extrema for ALL 1,482 realizable owner-color profiles from the SAME 62 real original 7×6 selected-three-column cases. Explicitly require corrected P1 rank exactly9 in the `44444` failure fixture and BOTH P0/P1 first winners for the `2532541156412471331416356736376672` / `2544` vs `4425` source-negative control.
- Preserve original failure, updated claim status, errors, source operations, zero strategic game WDL calls, and every still-incomplete/budgeted case. No unapproved authority promotion or solver branch merge. Maintained Node26 CI / formal checker must be recorded as not run unless actually executed.

## 5. Remaining strategic research boundary

If v2 passes, the fixed-profile first terminal sequence dependence is exactly eliminated under a bounded resource bitset. A total no-strategic-branching Level2 solver still needs a NEW source theorem eliminating/admitting alternate future **OWNER ALLOCATIONS chosen under observation-sensitive P0/P1 policy**, not merely merging possible temporal schedules for one allocation. The previous rank34 source trace-diamond J2=-1/J5=0 action-value counterexample remains controlling. No complete root perfect-play WDL or best original column at `44444` has been source-proved.
