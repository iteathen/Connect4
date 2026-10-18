# Geometry unobfuscation alternatives for zero-strategic-branching Connect4

**Date:** 2026-10-17 Pacific. **Direction:** owner-directed brainstorming on "other ways to remove geometry obfuscation", emphasizing exact unfolding of actual 7-column, 6-row, four-to-win geometry. **Canonical research:** \`research/semantic-quotient\`. **Status:** comparative source mathematics / hierarchy of candidates, NOT new qualified IsoGraph game authority, NOT an exact unrestricted zero-branch WDL solver. \`W,H,K\` MUST remain symbolic in equations, but all current discovery/testing uses **W=7,H=6,K=4**.

## The mathematical objective

Find a reversible or precisely quotient-certified map of the ORIGINAL source \`q=(h,R0,R1)\` into an algebra where gravity, turn XOR, geometric K-line incidence, all first-win terminals, and each next legal literal column action have the EXACT same behavior, yet source-level relations become simple enough to derive BOTH complete NAND action-zero-locus masks \`Z_+\`, \`Z_0\` with at most ONE strategically evaluated future equivalence class. A representation change alone is not a solve. No disguised game tree, BDD/QBF strategy enumerations or false commutation between \`forall\`/\`exists\` is permitted.

### Governing previous results

1. Orientation-sensitive source-q and first-win cofactor are qualified. Four linked ribbons (37 strands, 168 alias slots) and a 204-slot single linear tape already reproduce every original 7×6 legal one-ply transition. 131 nearest-neighbor XOR differences have 41 independent degrees of freedom plus 90 cycle consistency constraints; these do NOT make winner detection affine.
2. At canonical \`44444\`, \`h=(0,0,0,5,0,0,0)\`, \`R0=48,R1=42\`; after final center move \`444444\`, the center future chain vanishes but 12 P0 and 12 P1 surviving original residual requirements still span left and right future cells. One center marker inserted in a 36-letter noncenter word XOR-flips a contiguous interval as its insertion rank changes, yet winning conditions and first-completion competition remain nonlinear.
3. Prior two-ply original-source cofactor swaps at \`44444\` give 21 different normalized residual outcomes, and parity/height commutation alone cannot assert future-game value equivalence. The same final owner-coloring can conceal different first winners because first-win time matters.

## Candidate A — *relative-frontier height-gradient connection* (FIRST PRIORITY)

Let \`n=Σ h_c\`, \`p=n mod2\`, and for each future gravity cell (c,r), let

    j(c,r)=r-h_c     (zero-based future ordinal, 0<=j<H-h_c).
    Δ_c=h_(c+1)-h_c  (integer neighbor height gradient, 0<=c<W-1).

The local outside-column phase is \`κ_c=(n-h_c) mod2\`. Its nearest-neighbor GF(2) gradient is EXACTLY

    κ_c XOR κ_(c+1) = (h_(c+1)-h_c) mod2 = Δ_c mod2.

**Important stronger simplification:** row-plus-column baseline collapses entirely in relative ordinals:

    λ(c,r) = (r mod2) XOR κ_c
           = (n+j(c,r)) mod2
           = p XOR (j mod2).

All columns now share the SAME unmodified baseline phase equation. The actual future owner remains

    χ(c,r) = p XOR (j mod2) XOR β(c,r),

where \`β(c,r)\` is parity of OTHER-column future placements before this event under its actual legal event order. β is not determined by the current source.

Let neighboring physical cells be separated by one column to the right with geometric slope \`s=r'-r\`, \`s∈{0,+1,-1}\` for horizontal/rising/falling original lines. Their exact RELATIVE ordinal relation is

    j' = j+s-Δ_c.

Thus all nonvertical geometry reduces to an **integer affine translation across a column interface**, with parity version

    (j'-j) mod2 = (s-Δ_c) mod2.

A four-cell original line spanning c,c+1,c+2,c+3 is represented by the path

    j_i = j_0 + s*i - (h_(c+i)-h_c)
        = j_0 + Σ_(k=c)^(c+i-1)(s-Δ_k),  i=0,...,K-1.

Vertical original lines remain four consecutive ordinals in ONE column, \`j,j+1,...,j+K-1\`.

An action in column a raises h_a by one. Hence only

    Δ'_(a-1)=Δ_(a-1)+1  if a>0,
    Δ'_a    =Δ_a-1       if a<W-1,

and all other Δ are unchanged. At the boundary columns fewer than two links change. The future relative indices IN column a rebase by -1 as its bottom future cell is consumed; everywhere else future ordinals are unchanged. \`h_0\` or another absolute anchor and h/total n remain required for full support and absolute row identities.

**Canonical exact example:** \`44444\` has \`Δ=(0,0,5,-5,0,0)\`, so the phase gradient is \`g=(0,0,1,1,0,0)\`. The next center placement yields \`Δ'=(0,0,6,-6,0,0)\`, \`g'=(0,0,0,0,0,0)\`, and no future event in center column. This is the owner's observed "phase shift" localized to the two center interfaces. However, the source R0/R1 still contain 24 cross-center requirements—\`g'=0\` does NOT separate the game.

**Benefit:** localizes BOTH integer geometric shear and the relative GF2 phase, without duplicating the 42 future event identities. This is the top candidate for representation/invariant discovery. **Limitation:** owner β, first-win race, original line blocker interactions and adaptive action choices remain.

## Candidate B — selective diagonal virtual charts (SECOND PRIORITY, complements A)

Create two injective coordinate shears:

    U_+(c,r)=c-r+H-1, V_+(c,r)=r;
    U_-(c,r)=c+r,     V_-(c,r)=r.

Each rising/falling diagonal becomes a fixed-U linear strand of real event aliases. W+H-1 strands per orientation; all virtual chart slots not inverse-mapped to genuine (c,r) are GHOST and cannot count as cells or K-wins. At 7×6 each chart has 12×6=72 virtual addresses but exactly 42 real physical aliases; 30 are ghosts. The actual 12 rising and 12 falling Connect4 winlines become contiguous K-events within their own genuine strands. Physical gravity, column turn clocks, and the same q original residual IDs stay authoritative.

**Benefit:** diagonal 2D incidence becomes 1D contiguous windows and no longer requires any diagonal-specific winning scanner; especially useful when paired with A's local height gradients. **Limitation:** gravity does NOT become independent movement along virtual U columns, and K-window overlap plus original center-crossing residuals remain linked.

## Candidate C — shared-event interval/convolution factorization (SUPPORTING)

Express the 69 geometric K-window predicates as four masked, length-K sliding-AND scans across the previously qualified 37 linear strands. Keep exactly one physical event/owner variable with four strand references and preserve both source R0/R1 minimal requirement masks. A source action updates one physical event and all line factors incident to it (up to the finite original geometric incidence). Use interval-prefix products or dynamic incidence masks to inspect static source win generators without board-shaped reasoning.

**Benefit:** turns all geometric winning-line calculations into uniform masked interval algebra and an explicit source incidence graph. **Limitation:** \`AND_K\` then \`OR_69\` plus FIRST-completion \`min_t\` is nonlinear. Such an array/sliding-convolution normal form is not an XOR-SAT reduction or strategic solution by itself.

## Candidate D — cut interface / residual-hypergraph boundary factorization (POTENTIALLY STRATEGIC)

Represent the real source hypergraph by regional factors plus an exact bridge table of residual generators meeting both regions. A filled center may be removed from the legal move alphabet but NOT from the historical winning-line provenance. For \`444444\` retain 12+12 cross-center generators and the one global XOR timing clock. More generally choose a line-incidence separator minimizing the number of source-generator connections between regions, then express each generator's satisfaction as \`LeftFactor AND RightFactor\`, with first-completion rank guards.

**Benefit:** isolates where separated regions must communicate, potentially giving a smaller guarded source "interface closure". **Limitation:** no assumption of independence; enumerating boundary assignments/strategies or tensor-network contraction over possible futures may conceal branching and is NOT the owner's solution. Need a direct structural terminal/zero-locus theorem.

## Candidate E — commutation classes and a critical-swap cocycle (STRUCTURAL)

Any two adjacent gravity-legal moves in distinct columns commute as SUPPORT actions, but their order swaps which P0/P1 owns their two cells and may change first-win timing and residual survival. The XOR phase response is local; the source residual cofactor *commutator* is controlled by original surviving generators with odd incidence at the exchanged cells. Algebraically quotient only sequences whose entire future first-win/response meaning can be proved equivalent under source guards. Treat each noncommuting critical swap as a boundary defect in a legal-word trace, not a recursively explored alternative game.

**Benefit:** might factor harmless permutation of independent events while retaining load-bearing K-line interactions. **Limitation:** \`44444\` has 21 nontrivial, source-incomparable two-ply swap diamonds; one-layer or support-only trace commutation is unsound for WDL. Full-future zero-locus/tie proof required before any quotient.

## Candidate F — event-position/"time" first coordinates (LOWER PRIORITY)

Instead of 2D board space, use a column-symbol word \`w\`, prefix counts \`count_c(t)\`, and placement-time position \`τ(c,j)=min{t:count_c(t)=j+1}\`. Then four-in-a-row requires parity and eventual placement constraints on at most K ordinal tokens across columns. The position of a unique center marker induces a contiguous XOR interval shift; its effect can be represented by a difference array or range-XOR update. As an exact **fixed-schedule** model this is known and qualified.

**Benefit:** turns column-fill "phase transitions" into ordinary word insertion/interval parity events. **Limitation:** the future τ-values depend on adaptive strategic selection and first-win stopping. Enumerating all words or symbol insertion positions would disguise the very strategic branching being eliminated.

## Candidate G — geometry-incidence nullspace / constraint-gauge elimination (AUXILIARY)

Use the connected full-grid owner-phase edge map \`D:GF(2)^(WH)→GF(2)^E\` (131 physical adjacent edges at 7×6) and enforce its cycle-parity equations. Rank is WH-1=41 and there are 90 independent cycle constraints in the 7×6 graph. Choose a spanning-tree phase gauge plus one owner anchor; carry only independent parity variables. This eliminates **representational redundancy** in four virtual charts and local column-phase copies.

**Benefit:** exact linear congruence checking and clearer boundaries/phase consistency. **Limitation:** a K-line WIN requires AND of K-1 equal-phase conditions; OR over original lines, first-win order and adversarial alternation remain nonlinear. Do not mistake linear *consistency* for linear WDL.

## Decision hierarchy and next mathematical test

**Primary:** A (relative frontier/height gradient), plus B (virtual diagonals) and C (shared-linked interval constraints) as a unified source normal form. D/E merit follow-up after the source geometry is frozen, because they might bear directly on the full zero-locus strategic question. F/G are useful coordinates/controls rather than likely missing value theorems.

Immediate falsifiers, entirely on TRUE 7×6 Connect4:

1. On all 69 original physical K-lines and many legal source height vectors (including \`44444\`, \`444444\`, \`444441\`, \`4444442\`), verify every neighbor-to-neighbor relative ordinal translation \`j'=j+s-Δ_c\`, both diagonal virtual charts, and \`g_c=Δ_c mod2\` from original h.
2. For every legal current column action from these source vectors, verify exactly one/two height-gradient links update; check the new source h and q cofactors against qualified \`exact-q-core\` single-step semantics on sampled genuine FIRST-WIN-STOPPED standard 7×6 states. Physical game reference may validate but NEVER enter source algebra or compute multiple values in the candidate.
3. Build an explicit counterexample to any proposal "height gradient or 6 XOR edges alone determines unrestricted WDL" when original source R0/R1 differs despite same support: the phase gradient is a function of h and cannot encode owner blockers.
4. Preserve all 69 K-line incidences, source original-cell identities, terminal-first and completed-center bridge guards. Stop with INCOMPLETE for any source whose exact root \`(V,M*)\` cannot be certified with maximum semantic future fanout ONE. An exact representation improvement is not a claimed WDL algorithm.

No alteration of frozen qualified IsoGraph 1.2, no solver implementation branch/merge, no premature generalization of W/H/K, and no CPU/search-time success metric. Static geometry algebra may examine all original line masks and literal labels without spawning strategic futures.
