# First-touch source blocker invariant: a uniform adaptive defense without pairing or game-tree search

**FROZEN BEFORE independent physical tests on 2026-10-18.** Canonical owner branch `research/semantic-quotient`; mathematical status **candidate sufficient theorem awaiting independent 7×6 falsification**. Standard original Connect Four W=7,H=6,K=4; retain symbolic W,H,K. This is a new SOURCE proof family for `NO_FORCED_WIN_p(q)` with o as the SECOND, potentially combinable with separate opponent dual packing (LOSS) or one nonloss action (DRAW) to produce a Level 2 best continuation. **Do not infer either outcome from no-win alone**, and do not alter qualified IsoGraph 1.2 or the immutable unified v1-v4.

## Non-pairing insight

Existing gravity-safe complete pairings prevent a p win by replying to an attacker's first touch in a fixed pair. Those matchings require involutions, disjoint cells, and very specific release orders. A stronger abstract defense invariant requires NONE of these global matching conditions. A response `y(x)` may be directed, many-to-one, and dependent on the CURRENT attacker's landing cell x; what matters is that its single placement **kills every surviving p original winning requirement that x advanced**, so p never makes progress on a still viable winning generator.

Let source q=(h,R0,R1), current mover p=sum(h) mod2, o=1-p, original normalized surviving winning-generator family R_p. Each G∈R_p is a subset of future physical cells needed for p to complete one of the ORIGINAL 69 geometric K-windows. Its cells are initially unclaimed by either player; original historical p stones were eliminated by cofactor contraction, original o blockers eliminated that generator entirely.

For each original residual G and each column c touched by G, let `gate_c(G)` be G's LOWEST remaining cell in column c (the element minimal under that original column's gravity-chain order). All other cells of G in that column have `gate_c(G)` as a strict predecessor. Define the current original *gate family* for each future physical cell x:

    Gates(x) := { G ∈ R_p : x = gate_c(G) for c=column(x) }.

A p first touch of any STILL-VIABLE G must be in `Gates(x)`, because if p could first touch higher x∈G, its lower future G predecessor was occupied before x became playable: if by o then G is already blocked, and if by p then G was already first touched, and our induction shows o blocked G immediately afterwards.

For every x with Gates(x) nonempty, define the original common residual source intersection

    I(x) := intersection_{G ∈ Gates(x)} G  minus {x}.

Seek ONE ORIGINAL source response cell `y(x)∈I(x)` satisfying one of TWO gravity-safe release guards:

**(A) Independent bottom frontier:** y=(d,h_d) is the original currently playable BOTTOM-most remaining physical cell in ANY original column d. While any G∈Gates(x) is still viable, y∈G is unclaimed: if p ever claimed y, G would already have been touched by p and blocked at that turn by this same invariant; if o claimed y, G would already be blocked. Thus when x becomes playable later, unclaimed y is STILL at its own column frontier (original h_d remains unchanged until y is claimed).

**(B) Immediate vertical successor:** y=(column(x), row(x)+1), with row(y)<H. When x is claimed at its legal frontier, y is released and now immediately gravity playable. Because y∈Gates(x)'s every G, o claiming y blocks every newly advanced generator; y cannot have been claimed earlier before x because gravity forbids it.

The policy can use ANY deterministic source-priority choice between safe (A)/(B) y candidates, including many-to-one mappings; the condition does not require disjoint pairs, a complete support pairing, matching parity, nor same relative ordinal releases.

## Exact sufficient source theorem: o prevents p FIRST WIN

**Source guard:** For EVERY original future physical x with nonempty Gates(x), the common intersection I(x) contains AT LEAST ONE universally gravity-safe response cell of kind (A) or (B) above. Fix a deterministic map x→y(x) solely from original h,R_p.

**Uniform online response policy for o as second:** If current p claims a legal x belonging to some still-viable original p requirement G, then by induction x must belong to Gates(x), and o immediately claims y(x). If x belongs to NO live G, o claims ANY original gravity-legal free cell (or game has already ended in o win/draw). Recompute neither the response map nor a future game strategy tree; it is a fixed source-cell lookup valid for the remaining game's duration.

**Inductive invariant:** After every completed p/o turn pair, EVERY still-viable original p winning requirement G has **NO future cell claimed by p**. Basis true from source R_p. Inductive case: p plays x; any still-viable G containing x must have x as its lowest-in-column gate (otherwise its lower gate was played earlier and G would already be blocked). Thus it appears in Gates(x). The selected y(x) belongs to ALL such original G, so o claims one y and blocks all G which p just touched. All other G remain untouched by p (some may also be blocked by o's move), preserving the invariant. A p immediate winning terminal cannot occur: at the start of its move no still-viable G has future p ownership, and any G touched still has a distinct free cell y(x), which the defender can claim on their immediate legal reply. When a nonwinning full board is reached, p never first-won. Hence

    STATIC_FIRST_TOUCH_COVER_p(q) ⇒ p CANNOT FORCE WIN
        against one uniform gravity-legal o response strategy.

This proof is about existence of ONE winner-denying o strategy against ALL p choices; it is NOT a prediction that o wins despite o mistakes. Opponent o can itself first-win earlier, which only strengthens the p-no-win conclusion. The source consumes ZERO strategically inequivalent future game values, constructs ZERO original child q states, and does not enumerate conditional strategy paths.

**SUBTLE SOUNDNESS REQUIREMENT:** The intersection is taken over the G where x is their LOWEST FUTURE G CELL in that column, rather than over all G containing x. A higher x of a previously surviving G can be ignored only because the induction shows its lower G gate cannot have been claimed by p without triggering a block. Tests MUST deliberately attempt such delayed release histories. Source q normalization makes dominated larger generators irrelevant, since any originally removed superset of an active G contains its opponent claimed blocker if G does; no omitted winline may revive.

## Why this could exceed old pairing strategies

A fixed complete cell pairing requires the defender response y to be an involutive partner and every original G to contain a complete pair. Here several G can have overlapping gate incidence and share a root-frontier blocker; an x can map to a y that does NOT reciprocally map to x. Source maps may have chains and stars, no complete matching, and no need to pair unused cells. In a gravity-poset hypergraph, this is an original-source **directed first-touch transversal** / online hitting policy, not a search over future game states.

**Cross-domain context (inspiration only, not imported proof):** Erdős–Selfridge potential defense and Maker–Breaker pairing strategies are standard unrestricted hypergraph methods (Krivelevich's positional games survey: https://www.cs.tau.ac.il/~krivelev/ICM14.pdf). Gravity is a disjoint-chain poset positional game (Bagan et al., `https://arxiv.org/abs/2404.07700`). Neither external theorem is automatically applicable to Connect4's gravity/first-win rules; the two explicit legal-reply cases above supply our own source proof.

## Frozen execution/falsifiers

1. Pure ESM original-q producer calculates the lowest-per-column gate for every original p residual mask, collects common-mask intersections per physical cell, chooses ONE deterministic y(x) from root frontier cells or immediate above x, validates that chosen response belongs to ALL G in Gates(x). Return `NO_FORCED_MOVER_WIN_SOURCE_CERTIFICATE` or `INCOMPLETE`, NEVER a best move from no-win alone. No game successors, full strategic recursion, static permutation/search of pairing candidates, or solved labels.
2. Independent REAL W=7,H=6,K=4 physical reference generates genuine first-win-stopped positions, runs producer source FIRST, then tests policy against attacker p legal alternatives via physical adversarial DFS for short late suffixes and deterministic varied longer p paths (only independent validation branches). Check true first-win safety, legal defender responses, no need to change response map, and independent recursive MINIMAX root cannot be current mover WIN.
3. Compare same positive root q to historical even co-release full pairing and odd safe spare-pending pair no-win source. Record new q that old pairing cannot prove (if any); failing to find some is SAMPLE NEGATIVE, not theorem failure.
4. If real true7x6 positives are found, combine source p-no-win with independent original opponent dual overload or one action guaranteed nonloss to produce one Level 2 best LOSS/DRAW. Freeze that separate composition theorem and test physical.
5. Canonical `44444` still has no Level2 best move absent a separate complete best-action witness. Report this first-touch guard result exactly, never infer root scalar WDL from no-win alone. Do not merge solver branches.

**Research assessment:** The critical value is a full-future universal opponent defense proof expressed as a finite source current-generator **gate-intersection condition**, without a pairing construction or enumerating even one strategically inequivalent game continuation. The guard is likely conservative; failure at arbitrary q is INCOMPLETE. It is not a proof that every legal original7x6 q satisfies the condition.
