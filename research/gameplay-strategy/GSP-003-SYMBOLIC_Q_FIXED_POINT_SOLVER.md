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
