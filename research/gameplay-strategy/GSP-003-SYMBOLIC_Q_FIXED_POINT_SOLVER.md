# GSP-003 — Symbolic q fixed-point solver

**Status:** rough proposal  
**Goal:** exploit q without ordinary recursive game-tree search.

## Proposal

Solve over sets of quotient states using backward fixed-point semantics:

~~~text
terminal q regions
    -> symbolic predecessor over q
    -> Win/Loss/Draw closure
    -> empty-root classification
~~~

This is the gameplay-facing continuation of CUDA-BSFP once q is accepted as the ordinary future-behavior state.

## Key design point

Do not enumerate every q merely because q is exact.

The previous BSFP work already showed symbolic frontiers can be substantially smaller than explicit q-state enumeration on bounded controls.

The desired primitive is therefore:

~~~text
Pre_a(Qset)
~~~

over symbolic regions of q, not a giant reverse adjacency table.

## Implementation ideas

- represent support ranks separately from residual-family frontiers;
- reuse packed residual cofactor algebra;
- build predecessor constraints symbolically;
- use rank-local or rolling-rank execution;
- retain exact terminal injection and first-win semantics;
- exploit support-local dictionaries where qualified;
- move to GPU only after the symbolic representation is bounded and exact.

## Qualification

Compare explicit q dynamic programming, symbolic q fixed point, and the current BSFP representation.

Measure frontier size, generated candidates, normalization work, retained memory, root time-to-proof, and exact agreement.

## Strategic value

This is the clearest current route to an exact solver that avoids ordinary recursive minimax while still using the q reduction.


## 2026-10-16 — constructive core status and the actual improvement target

The exact q-oriented W/D/L algorithmic core is now **constructively
complete** under the qualified ordinary game-theory semantics. It is
realized in the standalone oracle-independent **recursive, branching**
research reference:

- `research/isograph/discovery/2026-10-16-algorithmic-core/exact-q-core.mjs`;
- `docs/research/2026-10-16-constructive-algorithmic-core-completeness.md`;
- `research/isograph/discovery/2026-10-16-algorithmic-core/CONSTRUCTIVE_CORE_QUALIFICATION_RESULTS_0_1.json`.

This does **not** implement the distinct GSP-003 symbolic fixed-point strategy
or imply production solver adoption. The direct core already computes
exact W/D/L and all W/D/L-optimal moves using ordinary recursive max/min.

The optional stronger objective is now **true branch-work compression**:
take a quantified set of child obligations and derive one exact compact
successor/proof object while avoiding separately recursive child-value
evaluation and avoiding a hidden Cartesian enumeration inside the
aggregating operator. Any proposed symbolic `Pre_a`, antichain-semiring
product, or G2 action quotient must be compared against the established
recursive reference in both exact W/D/L **and actual dependency count,
intermediate width, memory, and total work**.

Do not impose branch elimination, recursion elimination, or representation
minimality as prerequisites for calling the existing semantic algorithmic
core complete.


## 2026-10-16 — first non-distributed threshold-circuit qualification

The exact core remains constructively complete regardless of success of
this optional symbolic optimization. New support-local, **un-distributed**
Boolean value-threshold circuits were built independently of solved oracle
values, using exact residual-upset one-step preimage/substitution.

On three selected 4x3 and 4x4 supports, the compiler passed **260 physical
states and 384 bounded abstract q antichain checks**, recovering complete
W/D/L and equal-value action sets without recursive *concrete q-value*
computation during construction. A support-poset implication simplifier
reduced final reachable circuit gates by 15.6%–53.7% with zero disagreements;
a corrupted first-win guard was rejected on all three controls.

The empty 4x3 root **still exceeded 60,000 transient gate allocations** in
both variants. This is a qualification **PARTIAL**, not general branch
elimination: the compiler visits multiple child supports and the Boolean
circuit still contains alternating fanout. A single output circuit is not
equivalent to one computational path.

Sources/evidence:
`docs/research/2026-10-16-nondistributed-symbolic-alternation.md`
and `research/isograph/discovery/2026-10-16-algorithmic-core/`.

Next GSP-003 target: shrink the *construction-time* alternating expression
rather than prove minimality or recompile complete standard-board ranks.
Use a bounded root-suffix control and report both retained/live DAG
and all transient/discarded work.


## 2026-10-16 — qualified source-q anchored interval WDL and mirror support orbit

**Current strongest exact symbolic route** for this optional strategy is
source-q anchored owner-variable Bellman WDL, strengthened with finite
support-cone lower/upper intervals, batched ROBDD reclamation, strict
source h/R0/R1 horizontal reflection quotient, and a STATIC source
residual-frequency variable order. It is derived from qualified
first-win/owner-cofactor semantics and never searches a concrete
game-state policy while building formulas.

- Complete empty 4x3 Connect3 and 4x4 Connect4 WDL and all action-value
  roots already independently qualified under the earlier owner-BDD
  reference. The new four-threshold interval operator agrees when the
  cutoff reaches the whole small game; 90 independent cross-horizon
  checks show zero WDL interval/action or monotonicity errors.
- Rank20 standard7x6 is **tactically shallow**: root P0 win after one
  own move and all seven action values exact by two plies; independent
  q reference agrees. Do not use the earlier four-ply calculation as
  proof of a substantial nonbranching strategic collapse.
- Ranks14,16,18 similarly close by depth2; complete q references hit
  800k-edge caps, but separate physical depth2 action checks PASS.
- Rank10 and canonical `44444` remain UNKNOWN through ordinary k9
  bounded support cones; first-win transition/capacity rules remain
  exact and unchanged.
- Strict q_o mirror symmetry plus ordered Shannon BDD variable
  transport reduces canonical `44444` depth10 to 6,216 support
  orbits. A STATIC order by frequency of source R0/R1 residual
  incidence completes **depth11**, with 9,366 orbits representing
  18,620 ordinary supports, 16,511 peak BDD nodes and 268,341
  nontrivial operations under the SAME 60k/300k/10k/15s cap.
  **Root and action intervals remain UNKNOWN [-1,+1].**
- Depth12 requires 13,524 reflection orbits, beyond original 10k.
  Further progress demands a new mathematically qualified quotient
  or non-distributed multi-ply response-cover algebra, not raising the
  numerical gate limits or reintroducing winning-policy search.

Full derivation:
`docs/research/2026-10-16-source-anchored-interval-and-reflection.md`.
Implementation and evidence:
`research/isograph/discovery/2026-10-16-algorithmic-core/`
(`bounded-support-interval-bdd.mjs`,
`reflected-bounded-interval-variable-order.mjs`,
`BOUNDED_SUPPORT_INTERVAL_CROSS_HORIZON_RESULTS_0_1.json`,
`BOUNDED_INTERVAL_PHYSICAL_RESULTS_0_2.json`,
`REFLECTED_INTERVAL_VARIABLE_ORDER_RESULTS_0_1.json`).

**Status:** exact BDD interval mechanism and bounded controls PASS;
full arbitrary-depth value composition and computational branch
elimination **OPEN**. The existing recursive q algorithmic core is
complete and remains valid. No minimality or standard7x6 full-root
WDL claim follows.
