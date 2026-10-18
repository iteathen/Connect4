# Exact opponent second-move pairing + winner packing: force LOSS without requiring attacker winlines extinct

**Frozen 2026-10-17 Pacific, before genuine W=7,H=6,K=4 controls.** Mathematical candidates retaining W,H,K as symbolic parameters. Research owner `research/semantic-quotient`. **Status:** exact sufficient structural theorem, not arbitrary-q solution and not qualified IsoGraph 1.2 authority.

## Structural theorem

Let original legal first-win-stopped source state q=(h,R0,R1), n=sum h, current mover p=n mod2, opponent o=1-p, T=W*H−n>0 and T **EVEN**. Let original source residual winning generator antichains be R_p and R_o, including all remaining original geometry, blockers and already-owned cell provenance.

Assume TWO independent, verifiable source-only certificates:

**Guard A: gravity-safe full-cell opponent-as-second responder pairing.** Partition EVERY remaining original physical cell into disjoint pairs in a complete pairing that covers ALL of p's current original viable winning generators: for each G∈R_p some complete pair P is contained in G. The pairs are gravity **co-release safe**: if p chooses the first available cell of any incomplete pair, o can ALWAYS occupy its paired mate immediately on the next turn, irrespective of the order other pairs have been completed. Previously qualified examples: two consecutive same-column future cells, or same relative ordinal cells in two complete column-chain prefixes with supported even tails. Source may use `createCoReleasePairBlockProof.prove(h,R_p)`; when R_p is empty, ANY valid no-win obstruction suffices without pairing and we may use the historical inevitable LOSS theorem directly.

**Guard B: dual overload of opponent o's winning requirements.** There exist nonnegative rational weights λ_G on original R_o with

    for each future original cell x:  SUM_{G∈R_o: x∈G} λ_G ≤ 1

but

    SUM_{G∈R_o} λ_G > T/2.

Since T even and p moves first, p can make at most T/2 placements before any nonwinning full board; the existing original-source rational fractional hypergraph packing implementation can construct/verify such λ, irrespective of how o chooses its pair replies. This is a static certificate over the CURRENT q, not an enumerated policy/game graph.

**THEOREM — o forces a FIRST WIN against all p strategies, despite nonempty R_p.** o adopts the single pairing response rule: whenever p places in a pair not previously completed, reply with the uniquely paired mate. Safe source gravity co-release guarantees its immediate legality. Every original p winline contains a pair and thus can never be entirely occupied by p under this response policy; p cannot first-win. Suppose o never first-wins: play reaches full board with neither winner. Then each original surviving o requirement G∈R_o must contain at least one of p's T/2 future stones (otherwise the original K-line has become fully o-owned and would have caused an earlier first-win). The weighted line-incidence inequalities imply

    Σ_G λ_G ≤ Σ_{x∈p_future_stones} Σ_{G∋x}λ_G ≤ |p_future_stones|=T/2,

contradicting Guard B. Therefore o MUST first-win before a hypothetical full-board draw while denying every p win, for EVERY legal p play schedule. Thus original root has current mover LOSS under perfect opposition and EVERY current legal literal column is Level2 best. The returned ONE deterministic literal legal move is a valid owner-operational Level2 continuation. Level3 timing not supplied.

**Crucial distinctions:** Fractional overload alone does not stop p winning FIRST; a no-force-win pairing alone does not prove o wins rather than draws. Their conjunction has strictly stronger conclusion. The pairing is one *uniform online response policy* defined by original q structural cell pairing and not a table of independently valued game successors. Its validity is a source local gravity-release theorem. The proof uses only a global contradiction and NEVER separately values competing future games. The pair constructor may examine several STATIC structural matching candidates, but that work is not traversal of strategic futures; account for it explicitly. Do not confuse "opponent win against all p play under one pairing response" with "o wins regardless of o mistakes."

**Case A: R_p empty**. Old source inevitable-loss overload already proves o wins under EVERY complete hypothetical game; no pairing required, and new mechanism adds no proof strength. For a genuinely NEW witness insist R_p **nonempty** plus actual Guard A pairing and Guard B overload.

**Proof failure and output semantics:** If source pairing unavailable or dual λ sum does not exceed T/2, return INCOMPLETE. This does NOT prove current mover can win/draw, and no favorable alternative game is explored. An arbitrary q may still lack all source proof methods.

## Frozen independent standard 7×6 experiment

1. Compute true original 69 K-lines and source antichains from independently generated legal FIRST-WIN-STOPPED physical7×6 positions. Focus even T where p has NONEMPTY R_p and legal replies >1.
2. Source code uses only q and standalone already-frozen source pair proof/dual pack source modules; no q successor materialization or `solve()`. The source must explicitly return the pairing blocks, full coverage, lambda numerator/denominator and strict capacity excess, all valid static integer checks.
3. On each SOURCE-positive q, independently verify that every p winning original residual G contains a pair and that the gravity co-release mapping mates each legal future p first touch. Independently compute full physical perfect-play root WDL and every original legal first-action value when endgame position is sufficiently late. If early and reference too expensive, record scoped validation, not claim all scalar actions have been recursively checked.
4. Confirm a selected physical p move always has a legal matching o mate; on TRUE original physical board replay deterministic p legal choices with matched o replies and verify p never first-wins, o first-wins before full board. This follows source proof, and physical replay is independent falsification, not source strategy search. Preserve one positive q with R_p nonempty or a sample-negative result if none found.
5. Report marginal successes beyond previous R_p empty source inevitable-loss, and any resource/proof budget failures. Source proof, operator and verifier shall be committed before reference execution. Do not fit weights or policies to solved position WDL labels.

**Research implication:** This is a full-future adaptive opponent defense invariant certified at the SOURCE by a PAIRING, not by iterating opponent branches. Combining it with static o win-obligation overload closes eventual first-win for o. It may extend our single-best Level2 LOSS domain without introducing strategic branching. Canonical `44444` unrestricted WDL/Level2 remains UNKNOWN absent a separate certificate.


## Completed independently controlled actual standard7×6 experiment

Source producer `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-pair-defense-plus-dual-overload-source.mjs`; independent physical validator `standard7x6-pair-defense-dual-overload-independent-physical-control.mjs`; full machine evidence `STANDARD7X6_PAIR_DEFENSE_DUAL_OVERLOAD_NONEXTINCT_FORCED_LOSS_RESULTS_0_1.json`. Both source and physical scripts were committed before the run, and the source operator is completely free of game-child evaluations.

From **3100** deterministic nonwinning REAL first-win-stopped 7×6 physical trajectories, **50,037** genuine late original source q were analyzed by the source. The current mover still had at least one ORIGINAL viable winning generator in **49,388** sources. **18** positions with nonempty mover R_p simultaneously satisfied (A) complete gravity-safe o-second-pairing that intersects every current-mover original winning generator, AND (B) strict fractional source packing overload of o-original viable winning requirements beyond all remaining p turns. These source certificates yielded **40** original literal legal first actions ALL proved equally Level2-best LOSS, including 14 roots with >=2 legal first-action alternatives.

The independent PHYSICAL 7×6 control then replayed **80** complete games following the source o-mate response strategy, with varied legal future p choices. All 80 ended in the opponent o's original FIRST WIN; every physical mate reply was gravity legal and no p early first-win or full-board draw occurred. A separate ordinary BRANCHING PHYSICAL minimax verified **17** certified late roots and their **36** original first-action values, every one exactly p LOSS, with ZERO errors. The 18th positive root was outside the late reference filter; its source structural proof and policy physical simulations still passed.

**Concrete new true7×6 source witness:** history `7654253275136145236326217611177672`, n=34, P0 to move with ORIGINAL legal actions `{3,4,5}`. P0 still has **two** viable original partial winning requirements, so the prior R_p-EMPTY forced-loss theorem does NOT apply. P1 has **five DISJOINT** current viable residual winning requirements of dual total weight 5, while P0 has only **four** future blocking turns before full board. A gravity-safe P1 responder pairing blocks BOTH surviving P0 requirements using original source blocks:
- Cross-pair prefix across zero-based columns 2 and 4, paired at the first two **equal relative** gravity-release ordinals;
- Consecutive vertical pairs inside zero-based column 3.

Thus P1 can respond immediately to ANY P0 attack stone with the safe mate and permanently prevent P0 win. P1 MUST finish at least one of their five originally viable winning lines before a hypothetical full non-winning board, since four P0 placements cannot block all five. The source certifies P0 outcome LOSS and all legal `{3,4,5}` moves equally Level2-best. No value of any original first-action future game was calculated in the source producer.

**Qualification:** This is a conditional theorem **strictly stronger in source domain** than the old "R_p empty" + fractional overload sufficient condition, and is valuable because it proves opponent adaptive defensive control without unfolding its contingent move branches. It does not certify every possible losing source and is not a general arbitrary-q Level2 solution. Source pairing construction may enumerate STATIC original column-block proof witnesses, which must be counted separately from gameplay branching and is not a game-strategy graph. Historical overlap with other source losing certificates is not yet exhaustively measured. Canonical `44444` remains INCOMPLETE. No maintained Node26 CI, external proof assistant, or qualified IsoGraph authority revision/merge.
