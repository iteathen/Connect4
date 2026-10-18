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
