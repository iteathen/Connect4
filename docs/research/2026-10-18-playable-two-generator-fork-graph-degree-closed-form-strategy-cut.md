# Exact degree-closed-form SOURCE fork preemption for original winning-line pair graphs

**2026-10-18, SOURCE mathematics FROZEN before independent prior-source and true7×6 physical controls.** Research owner `research/semantic-quotient`. Original game authority IsoGraph 1.2 unchanged. This is a closed-form reduction of the already established fork-precursor/Hall response-capacity theorem and the newly validated original canonical center-branch playable pair-graph instance. It does NOT solve arbitrary root ordinary WDL or canonical `44444` Level2 BEST.

From any genuine original first-win-stopped q=(h,R0,R1), let defender o=n mod2 move NOW, attacker p=1−o move NEXT. Current legal gravity frontier physical cells are F={(c,h_c):h_c<H}. Construct the attacker two-cell minimal original source winning requirements which consist of TWO DISTINCT currently playable frontier cells. Each is an undirected edge of a simple graph Γ_p on current literal legal columns. If the defender original R_o has min cardinality≥3, that defender cannot obtain a first K-win in its next two physical placements, since completing its smallest ORIGINAL viable surviving line requires at least three future owner-o cells. Opponent moves can only BLOCK, not shorten, defender's original requirements.

An attacker fork precursor is a vertex x with two distinct neighbors y,z. Defender o MUST play one of {x,y,z} NOW to avoid attacker p taking x NEXT and creating simultaneous playable SINGLETON winning obligations y,z, beyond defender's one remaining reply capacity before attacker completes. This is the existing Sep 14 fork-precursor theorem, not a new generic Connect4 primitive.

## New exact degree reduction, no neighbor-pair enumeration

For any graph Γ and vertex x, define its current fork preemption intersection C(x) over all pairs y,z of distinct neighbors:

    C(x) = ⋂_{ {y,z}⊆N(x), y≠z} {x,y,z}.

If deg(x)<2, the intersection is over zero constraints: define C(x)=V, the entire original legal label set.

**Algebraic identity:**

    deg(x)≤1     ⇒ C(x)=V;
    deg(x)=2     ⇒ C(x)={x}∪N(x);
    deg(x)≥3     ⇒ C(x)={x}.

Proof: For degree2, there is exactly one unordered neighbor pair, so the single triple is {x} plus both neighbors. For degree≥3, x belongs to all pair triples but NO particular neighbor belongs to EVERY unordered pair (choose two OTHER distinct neighbors to exclude it); the intersection therefore contains only x. Degree≤1 has no pairs. Thus no triple enumeration is necessary to find C(x).

The COMPLETE rank-local necessary defender set against all such immediate attacker forks is

    S(q)=Legal(q) ∩ ⋂_{x∈Legal(q)} C(x).

This computes from one original source adjacency bitset per frontier column (W≤7), degree and at most ONE bitwise AND per vertex, with ZERO `∀ y∀z` candidate-pair enumeration and ZERO future strategic game/q valuation. If S(q)=∅ and the guard min |R_o|≥3 holds, EVERY current legal defender move d admits SOME fork center x with two neighbors y,z unaffected by d: P0/P1 attacker p has a literal winning response program (play x, then after the defender's arbitrary one reply take an unblocked y or z). Therefore `S=∅ ⇒ current defender has an unavoidable actual FIRST LOSS in at most attacker p's second future placement`. This is a **source guaranteed forced WIN for the OPPOSITE player**, not a guessed draw or a root best move for some other rank. The owner to move at such q is unavoidably losing; EVERY current legal defender action is then equal in ordinary WDL (all LOSS), so returning one literal is an operational valid Level2 continuation **for that original q alone**. One must certify the empty set at the CURRENT q, not at an independently valued action q child.

For any excluded defender action d∉S, SOURCE can construct ONE fork witness without enumerating neighbor pairs: take the lowest x for which d∉C(x); choose the two smallest distinct neighbors y,z of x **other than d**. These exist by the same degree argument. Every y,z is physically playable at the current frontier, and d is not x,y,z. This is a deterministic bounded forcing program, not a policy search.

When S nonempty, its members are only necessary current defense choices against this bounded fork mechanism; no claim of guaranteed safety or strategic optimality is licensed.

## Required exact W7 H6 K4 controls

- Preserve the original `standard7x6-source-playable-pair-fork-frontier-funnel.mjs`, its independently physically verified 14 canonical excluded P1 replies and 84 continued physical response checks, and `STANDARD7X6_CANONICAL44444_AFTER_CENTER_FORK_GRAPH_14_EXCLUDED_84_RESPONSES_PHYSICAL_0_1.json`.
- Freeze a new DIRECT degree-based source implementation using original q only. No neighbor-pair generator enumeration; source statistics must state `forkNeighborPairCombinationsEnumerated=0`. It must output identical necessary defense masks on all SIX genuine center-finished q_r and agree on all 14 loser witness triples (which may use a different but valid triple from v1).
- Independently physical re-test every excluded d and all subsequent P0/P1 reply positions with original first-winning four-line observer, preserving chronological P0/P1 owner and column playability. The earlier already-frozen physical control may be reused as separate reference. Freeze any exact SOURCE/PHYSICAL source proof mismatch.
- As a separate SOURCE-only graph-property control, enumerate small abstract undirected simple graphs with 1..W vertices and check `S(q)` from the degree formula equals the literal intersection of all neighbor-pair preemption triples. This validates the graph identity independently of Connect4 shapes but **does not** turn arbitrary abstract graphs into physically reachable original q.
- If a genuine source q with `S(q)=∅` is found, freeze q BEFORE independent physical WDL or game continuation, prove the two-turn FORCING program from each actual defender legal current reply, and then separately evaluate it with a physical first-win oracle. Do not invent such an example or count arbitrary late root gameplay certificates without evidence.

## Strategy research significance

The closed degree form represents an exact SOURCE **observation-sensitive response-capacity CUT** rather than a comparison between complete future games. At genuine canonical `44444`, P1 completes center and P0 responds wing r; all observed forks are degree2 and the source obtains the previously validated mandatory P1 sets:

    r=1: all legal; r=2:{1,3,5}; r=3:{2,5};
    r=5:{3,6}; r=6:{3,5,7}; r=7:all legal.

Exactly 14 defensive actions are excluded across those real rank7 histories, as previously physically verified against 84 next P1 replies. The fact that all six S(q_r) remain nonempty means this bounded graph lemma alone still does NOT certify a forced winner for P0 after every such r, and still gives no Level2 BEST at `44444`.

Further progress towards a full game-level no-strategic-branching invariant requires compositional source certificates showing how these obligation graph cuts change UNDER conditional moves and gravity releases, with well-founded rank/progress, rather than a hidden recursive game tree or infinite escalation of local fork horizons.
