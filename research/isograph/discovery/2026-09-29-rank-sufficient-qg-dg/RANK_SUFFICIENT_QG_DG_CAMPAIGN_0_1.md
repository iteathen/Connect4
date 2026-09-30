# Rank-sufficient Connect Four representation and exact evaluation campaign

**Status:** ACTIVE successor discovery profile  
**Research direction:** Joshua Oshiro  
**Branch:** `research/rank-sufficient-qg-dg-20260929`  
**Predecessor discovery fixed point:** `0efdc5e3aa9a3d5179adfc42203a123231f75328`  
**Foundational-audit fixed point:** `970e22bf12c33c2a274ba337ccae5a1f677aa9c8`

## Outer problem

For persistent game structure (G), current position (P), a structural representation (Q_G), exact evaluator (D_G), and exact game-theoretic value (V_G):

[
V_G(P)=D_G(Q_G(P)).
]

The objective is to find a **minimal rank-sufficient** representation (Q_G(P)) and an exact evaluation map (D_G).

No internal computational form is assumed for either object.

Admissible outcomes include a closed-form expression, polynomial/polynomial-like object, finite algebra, matrix/tensor operation, combinatorial identity, quotient, rank-local recurrence, fixed point, rewrite system, compositional interface algebra, or a hybrid. A direct non-iterative solution remains fully admissible.

## Rank-local

At rank (r), construction of (Q_G(P_r)) may use:

- all persistent geometry/rules/symmetries in (G);
- the complete current position;
- current rank/turn;
- every fact exactly derivable from current position + (G);
- carried-forward compressed information that remains relevant.

It may not require hypothetical ranks (>r), future-tree exploration merely to define the current representation, or historical detail whose continuation effect has vanished.

Geometry is rank-local because it is persistent at every rank.

## Rank-sufficient

Rank-local is a construction boundary. Rank-sufficient is a semantic property.

A strong future-behavior form is:

[
Q^F_G(P)=Q^F_G(P')
Rightarrow
P,P'	ext{ are interchangeable for all declared continuation semantics}.
]

A weaker value-only form is:

[
Q^V_G(P)=Q^V_G(P')
Rightarrow
V_G(P)=V_G(P').
]

A proof/certificate representation (Q^P_G) may need to retain stronger premises than either ordinary future behavior or scalar value.

Do not collapse these targets.

## Semantic minimality

Representations are compared by information order, modulo lossless recoding:

[
Q_1 preceq Q_2
]

means (Q_1) is computable from (Q_2), so (Q_1) retains no more semantic information.

“Minimal” means minimal/coarsest under the declared sufficiency target, not fewest bytes, smallest integer, or shortest syntax. Multiple incomparable minima are allowed unless evidence proves a unique coarsest sufficient quotient.

Complete future behavior/value may be used to **validate or falsify** a candidate rank-local map. It may not be used as the construction rule for that map.

## Current exact upper bounds

Qualified Connect4 authority 1.2 already gives, for legal nonterminal standard 7×6:

[
q_o(P)=
	ext{orientation-sensitive support}
+
	ext{normalized P0 residual antichain}
+
	ext{normalized P1 residual antichain}.
]

Qualified result:

[
q_o(P)=q_o(P')
Rightarrow
	ext{same complete literal-action-labelled ordinary future game}.
]

Therefore (q_o) is an exact rank-local **upper bound** for (Q^F_G). It is not assumed minimal.

Horizontal reflection gives exact orbit quotient (q_r) with explicit transporter (cmapsto 6-c). Equal (q_r) supports exact scalar W/D/L/value reuse and transporter-aware future-game correspondence. Therefore (q_r) is an exact rank-local upper bound for scalar (Q^V_G), again not assumed minimal.

The foundational audit showed that the old experimental canonical-frame two-sheet quotient is not automatically a semantic refinement of these qualified identities. It remains evidence about unsafe/safe forgetting, not an authoritative (Q_G).

## Two coupled unknowns

The campaign treats these independently:

1. **What information is sufficient?**
2. **What operation evaluates that information exactly?**

The representation and evaluator need not share a computational form.

## Parallel interpretation channels

### Direct/algebraic channel

Search for rank-local directly computed objects and exact evaluators through:

- conservation laws;
- invariants;
- finite quotient algebras;
- antichain/lattice/semiring closure;
- polynomial identities;
- factorization;
- GF(2) / rank / determinant-like structure;
- canonical normal forms;
- compositional products;
- small sufficient coordinate families.

Existing exact RBA evidence that Bellman threshold transformers are lattice/semiring polynomials is admissible evidence about (D_G), but does not imply that the final evaluator must be recursive or that the current polynomial presentation is minimal.

### Rank-local recursive channel

Search for:

[
Q_{r+1}=F_G(Q_r,m_r,G)
]

with exact sufficiency preserved.

Qualified (q_o) already supplies one such structural update target in principle. The task is to minimize/refactor it without losing semantics, not to assume recursion is the final answer.

## Safe-forgetting questions

For every candidate quotient/merge:

1. What information was discarded?
2. Is it provably irrelevant to the declared continuation/value semantics?
3. Is equivalence exact, board-automorphism-relative, transporter-relative, future-behavior-relative, value-relative, or merely representation-relative?
4. Does the quotient introduce artificial path dependence/holonomy?
5. Does one additional rank-local coordinate restore sufficiency?
6. Does the need for that coordinate reveal structure of (Q_G)?

## Foundational-audit inheritance

Hard inherited facts include:

- the audited old two-sheet cocycle is independently non-exact **on its representation graph**;
- its surviving witness endpoints are not equal exact states and not in one arbitrary-column residual orbit;
- all six witness sheet pairs collapse at complete literal-future resolution in their audited canonical frames;
- action-token recursion omitted transporter alignment;
- arbitrary column canonicalizers are generally not fixed-board Connect4 symmetries;
- edge-local delta position and fundamental-basis nonzero count are representation choices;
- the strong intrinsic physical/future-behavior obstruction interpretation is not supported.

These facts constrain candidate (Q_G); they do not select the form of (D_G).

## Immediate discovery program

### A. Representation ladder

Treat these as distinct candidate levels:

[
P 	o q_o 	o q_r 	o 	ext{candidate coarsenings}
]

with separately declared sufficiency targets.

Search downward from known exact upper bounds rather than inventing a quotient without a semantic reference relation.

### B. Bounded safe-forgetting census

On complete small-board domains:

- construct candidate representations from current rank-local information only;
- derive exact future behavior and value only afterward as validation oracles;
- enumerate collisions;
- falsify any candidate that merges states with different declared semantics;
- distinguish future-behavior collisions from value-only collisions;
- test transition closure (F_G) independently of evaluator (D_G).

### C. Evaluator-shape census

On the same domains, test directly computed algebraic summaries as **candidate sufficient inputs to value**, not as assumed formulas. Preserve counterexamples.

Integrate exact semiring/RBA laws as known evaluator structure, but keep a direct/non-iterative (D_G) open.

## Anti-circularity

- Never define (Q_G(P)) by solving the future subtree.
- Never use solved W/D/L labels as inputs to the structural producer.
- W/D/L/future trees may be validation or falsification evidence after a candidate map is frozen.
- Never call a representation minimal from a finite sample alone.
- Never identify a value quotient with literal future-behavior identity.
- Never interpret a canonicalization artifact as a physical invariant without the required transporter/authority.
- Do not resume the old odd-edge mechanism search unless a corrected semantic carrier independently warrants it.

## Reopened closure

The old discovery and foundational-audit fixed points remain valid for their selected profiles.

This campaign reopens closure because the objective/search profile has changed from:

> explain/classify the selected representation cocycle

to:

> find rank-sufficient (Q_G) and exact (D_G) with representation/evaluator form left open.

Recursive IA/QU/NEI/DP/DTS/EI closure must therefore be rerun over this new problem definition.
