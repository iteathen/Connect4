# Non-distributed symbolic alternation — exact local result and branch-work economics

**Date:** 2026-10-16  
**Owner:** `research/semantic-quotient`  
**Research direction:** Josh Oshiro  
**Status:** exact scoped symbolic-value operator and internal conformance controls; **global branch-work elimination remains OPEN**. No game-theory authority or production solver change.

## Governing research decision

The exact residual-q/cofactor/alternating-value algorithmic core is already constructively complete. The core **may** recurse and branch. The preferred optional improvement is avoiding multiple independently evaluated recursive game continuations without hiding an equivalent expansion inside symbolic operators. Formal minimality is deferred.

This experiment does not repeat the qualified RBA four-front / antichain-semiring proof. That corpus had already established exact symbolic alternation, including 4/6-ply interval/frontier composition, but identified universal mixed-reply expansion as the principal wall:

- `research/isograph/discovery/2026-09-18-policy-frontier/RBA_FOUR_FRONT_BLOCK_CHECKPOINT_0_1.md`;
- `research/isograph/discovery/2026-09-18-policy-frontier/RBA_ALGEBRA_CORE_CHECKPOINT_0_1.md`;
- `research/isograph/discovery/2026-09-18-policy-frontier/RBA_RELATION_REFINEMENT_CHECKPOINT_0_1.md`.

The distinct question here is whether preserving these operations **as a shared, un-distributed monotone Boolean circuit** gives a useful exact single-result operator on selected support fibers, with honest work accounting.

## 1. Exact symbolic input contract

Fix one support `h`; let `S_h` be the distinct nonempty residual subsets of geometric winning lines after all support cells are removed (regardless of past owner).

For shape `j`, let

```text
X_j = 1 iff the P0 residual upset contains j
Y_j = 1 iff the P1 residual upset does NOT contain j
```

The variables must denote residual-upset-closed antichains, not arbitrary independent Boolean physical facts. The fixed-claimant P0-favorable order is bitwise increasing in both `X` and `Y`.

For landing event `a`, define the source-index families for child shape `j`:

```text
TruePre_j  = {i | (shape_i minus {a}) subseteq child_shape_j}
FalsePre_j = {i | a notin shape_i, shape_i subseteq child_shape_j}
```

Thus the P0 child coordinate is `OR X_i` over its owner-true or owner-false family, depending on the mover. The complemented P1 coordinate is `AND Y_i` over the corresponding family. Empty OR is false and empty AND is true. These are direct identities of minimal-residual upset/cofactor semantics; no physical q-state enumeration is needed to construct them.

## 2. Two threshold outputs and exact terminal control

Compile, for each fixed support:

```text
W(h,X,Y) = (absolute P0 value >= WIN)
N(h,X,Y) = (absolute P0 value >= DRAW)
```

Using `W/N` rather than one signed bit preserves all three W/D/L classes:
`W -> +1`, `NOT W AND N -> 0`, `NOT N -> -1`.

For a P0 move, immediate completion is `X_{ {a} }` and
the continued threshold is `X_{ {a} } OR ChildThreshold`.
For a P1 move, P1 survival is `Y_{ {a} }` and the continued
threshold is `Y_{ {a} } AND ChildThreshold`.
If no support-relative singleton `{a}` exists, the immediate-P0
win condition is false and the P1-survival guard is true.

On the final placement, do not invoke a nonexistent nonterminal child:
- P0 final action: `W=immediateP0Win`, `N=true`;
- P1 final action: `W=false`, `N=notImmediateP1Win`.

Then aggregate all legal action thresholds with **OR for P0's turn,
AND for P1's turn**. The output includes corresponding action-specific
threshold circuits and all W/D/L-equal best move labels.

This is the same first-win finite-rank algebra as the qualified recursive
core, represented as a shared circuit with substitution instead of repeated
value calls on each actual q position. Compilation still follows multiple
child **supports**; it has not eliminated all strategic fanout.

## 3. First execution: bounded exact controls

Sources:

- `research/isograph/discovery/2026-10-16-algorithmic-core/symbolic-residual-circuit.mjs`;
- `symbolic-circuit-control.mjs`;
- baseline: `SYMBOLIC_CIRCUIT_MATCHED_BASELINE_0_1.json`;
- predeclared budgets: `SYMBOLIC_CIRCUIT_BRANCH_REDUCTION_PLAN_0_1.md`.

Three selected supports were tested against:

1. every physically reachable nonterminal position with that support,
   checked by an independently implemented direct-run-length physical
   evaluator and by the already-qualified oracle-independent recursive
   residual-q solver;
2. **128** deterministic seeded abstract q pairs drawn as valid residual
   antichains per support. They need not be physical/historically realizable
   and are **not** an IID population for a universal confidence bound.

There were **260 physical positions** and **384 abstract q samples** total,
with **zero W/D/L, action-value or optimal-action-set mismatches**.

| Board / support | Physical states | Allocated gates (all intermediate) | Reachable final gates | Abstract tests |
|---|---:|---:|---:|---:|
| 4x3 c3 `[2,2,1,2]` | 26 | 963 | 301 | 128 |
| 4x3 c3 `[1,1,1,1]` | 6 | 28,264 | 6,163 | 128 |
| 4x4 c4 `[3,3,2,2]` | 228 | 2,113 | 482 | 128 |

On construction, **zero concrete q values were recursively solved**.
The recursive reference, over the same physical and abstract queries, used
respectively 2,666 / 47,325 / 8,145 q transitions. The circuit evaluator
instead visited 15,218 / 141,397 / 82,657 Boolean gates across the
corresponding batches. Gates are not equivalent to transition evaluations in
cost; the comparison demonstrates *different work shape*, not an automatic
runtime speedup.

The three final circuits are much smaller than their accumulated construction
allocation. This distinction is load-bearing for the next experiment.

### Fixed empty-root negative

At the **empty 4x3 c3 root**, circuit compilation exhausted the **60,000**
allocated-gate budget after 111 compiled supports, 282 support action
expressions and 69,550 substitutions. It returned **no complete root
circuit**, and the failed budget is not evidence that a compact normal form
does not exist.

The oracle-free recursive q evaluator had already solved this domain
using 3,734 distinct q states. In this configuration, the symbolic
construction is not economically superior to that established reference.

## 4. Exact support-poset implication simplification

The second experiment added an **opt-in** simplifier to the same compiler:

```text
shape_i subseteq shape_j
  => X_i implies X_j
  => Y_j implies Y_i
```

These are mathematically exact on valid residual upsets. The simplifier
uses them for redundant AND/OR literals and immediate generalized absorption,
without distributing the Boolean formula and without inventing value facts.

The original profile remains available unchanged with
`simplifyByPoset=false`. Re-run against the exact same three supports,
physical states, deterministic abstract q seed `0x4c2a3027`,
and numerical budgets returned **zero mismatches again**.

| Support | Final live gates before | Live gates after | Reduction | Allocated gates after |
|---|---:|---:|---:|---:|
| `[2,2,1,2]` | 301 | 229 | 23.9% | 799 |
| `[1,1,1,1]` | 6,163 | 2,851 | 53.7% | 16,995 |
| `[3,3,2,2]` | 482 | 407 | 15.6% | 1,868 |

The second run removed 403 / 2,630 / 382 redundant gate inputs/factors,
respectively. This is a **useful exact local circuit reduction**,
not formal minimality of the core.

Raw evidence:
`SYMBOLIC_POSET_ABSORPTION_RESULTS_0_1.json`.
Source-level comparator: `symbolic-circuit-control.mjs --poset`.

### A persistent root problem

The same empty 4x3 root *still exhausted the 60,000-gate budget*
after 116 compiled supports and 301 support action expressions,
despite the qualified simplification. The simplifier is insufficient
to establish practical unbranched compilation from an empty board.

## 5. Negative validator control

An in-memory corrupt compiler was constructed by replacing the P1
immediate-win/survival guard with constant true. The original reference
and physical comparator were unchanged.

`symbolic-circuit-mutation-control.mjs` detected the resulting wrong
W/D/L or action vector on **all three** tested support controls, including a
legal physical witness at each. The production circuit source was not
altered. Reproducer and exact failing positions are recorded in
`SYMBOLIC_CIRCUIT_TERMINAL_MUTATION_RESULTS_0_1.json`.

## 6. Operational and epistemic verdict

### Established

- Exact P0-winning and P0-nonloss threshold **circuit semantics** on the
  declared residual-upset domain, from direct monotone cofactor
  substitution and terminal-first value algebra.
- An executable **support-local single-result value compiler**, with no
  concrete-q strategic recursion during construction and independently
  checked exact action vectors on 260 physical and 384 abstract samples.
- A valid, measured, input-poset implication reduction of **16–54%**
  final reachable gates across these three supports.
- Exact negative evidence that circuit construction and stored intermediate
  work, not merely the number of returned values, remain problematic.

### Not established

- No root 4x3 circuit within the frozen budget; no standard7x6 root compiler.
- No proof of a polynomial circuit size/construction bound; no demonstrated
  general elimination of strategic branching. Alternating AND/OR fanout
  remains in the compiled representation, and support compilation still
  follows multiple descendant supports.
- No authority promotion, production adoption or general speedup claim.
  Timings are isolated V8 code-mode runs, **not matched hardware/Node26
  performance qualification**.
- No independent external replication; finite physical controls and
  pseudorandom abstract samples are implementation evidence, not a
  probabilistic universal soundness proof.

### Next vertical target

Evaluate **retained-versus-discarded intermediate expression economics** on
a single already-failed root suffix by direct output-sensitive
factorization/early redundancy elimination. The supplied evidence shows
more than half of gate allocations are not reachable from the final
support circuits. A new candidate must reduce **peak retained live
memory and total construction work**, not simply postpone expansion.
Use the same 60k gate/300k substitution/15-second bounds and first-win
guards; reject candidates without a real cost improvement.

Do **not** reopen algorithmic core correctness, minimality,
full-rank W/D/L frontier construction, or individual `44444` proof paths
as prerequisites for this optional branch-work research.
