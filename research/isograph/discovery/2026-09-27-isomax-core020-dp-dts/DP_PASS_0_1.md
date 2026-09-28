# IsoMax post-IA DP 0.8 pass 0.1

**Protocols executed:** DP-01 through DP-45  
**Frozen base:** `4cecb8f4f626bd701548c0951f36cec12d5c4ab5`  
**Purpose:** find new structural work after Core-0.20 primitive closure + recursive IA fixed point.

## Main result

The pass found one exact structural reduction and two immediate experimental leads.

### Exact structural reduction — WDL proof interval automaton

The current zero-bound mechanism is the complete nonempty interval carrier of
mover-relative WDL:

```text
UNKNOWN     = {-1,0,+1}
LOWER0      = {0,+1}
UPPER0      = {-1,0}
EXACT_LOSS  = {-1}
EXACT_DRAW  = {0}
EXACT_WIN   = {+1}
```

Generic lower/upper proof refinement is not new; C4-0010 and the historical
packed proof store already own it.

The **new projection identified here** is that this exact six-state carrier is
isomorphic to a 3-bit possibility mask:

```text
LOSS  = 100
DRAW  = 010
WIN   = 001

UNKNOWN    111
LOWER0     011
UPPER0     110
EXACT -1   100
EXACT  0   010
EXACT +1   001
```

and proof refinement is simply:

```text
next = current AND evidence
```

with:

```text
next == 0                    -> contradiction
next == current              -> semantic stutter
power_of_two(next)           -> exact
LOWER0 AND UPPER0 == 010     -> exact draw
```

A resident q can strictly refine at most twice from UNKNOWN before exactness.

Mechanical control:
`wdl-proof-refinement-control.mjs`.

### Lead 1 — CPC close-only exact promotion

Current search already evaluates CPC after a non-cutoff local weak-bound hit.

The coalesced implementation currently uses search-derived weak stores only.
CPC-derived weak stores were rejected economically.

However, when:

```text
local verified same-q proof = LOWER0
CPC interval                = UPPER0
```

or the dual case, the current control flow can return a zero cutoff without
turning the q into exact draw.

The proof automaton says that evidence fusion is exact:

```text
LOWER0 ∩ UPPER0 = EXACT_DRAW.
```

Candidate policy:

- never re-enable general CPC weak-bound publication;
- after CPC is already computed, inspect an existing verified local weak row;
- same-direction CPC evidence -> stutter, no store;
- no existing weak row -> preserve current policy, no CPC weak store;
- opposite-direction evidence -> promote the existing local q to exact draw;
- publish that newly exact draw through the already-qualified shared-exact path.

This adds no CPC call and no new table. It targets only maximum information gain.

### Lead 2 — shared-miss stutter suppression

The all-noncutoff shared fallback is exact-control neutral but a strong hard-window lead.

A local weak hit may repeatedly trigger the same shared-exact probe while:

- the local q/key is unchanged;
- the local weak proof state is unchanged;
- shared probe repeatedly misses.

Every repeated miss is a DTS stutter under q/proof semantics but still pays
hash/atomic/key-validation cost.

The existing known-hash-reuse plan removes duplicate hashing but not repeated
miss observation.

Next diagnostic should count, per resident weak q:

- first shared miss;
- repeated shared miss before local proof refinement/replacement;
- a later exact shared hit after one or more misses.

If repeated misses dominate and later-arriving hits are rare, test one-bit
"shared miss already observed for this resident weak state" suppression.
Because fallback is optional optimization, skipping a later probe cannot weaken
semantic correctness; it can only forgo a reuse opportunity. Clear the bit on
slot replacement or strict local proof refinement.

Do not add this bit before the diagnostic.

## All 45 protocols

| Protocol | Name | Disposition | Finding |
|---|---|---|---|
| DP-01 | Cross-boundary relational structure | NEW_STRUCTURE | Separates rank-changing q transitions, same-q proof refinements, task-occurrence control transitions, advisory-order transitions and cache-observation transitions. Their different boundaries explain several prior performance discrepancies. |
| DP-02 | Constraint-structure discovery | CONFIRMED | Full-q equality is required before proof-state fusion; first-win, exact-only shared publication and mover-relative bound scope remain load-bearing. |
| DP-03 | Interface / port correspondence | NEW_CANDIDATE | A local weak proof row can mask a more informative shared exact row. This is safe semantically but is an information-dominance inversion at the local/shared interface. |
| DP-04 | Dependency-topology discovery | NEW_STRUCTURE | q dependency moves to rank+1; proof refinement stays at the same q/rank. Treating both as one search transition obscures reusable same-q proof structure. |
| DP-05 | QU / open-region topology | RESIDUAL | Runtime scheduling, sharing economics and the extensional-carrier comprehension gap remain QU/authority gaps; no scalar is invented. |
| DP-06 | Repeated relational motifs | NEW_CANDIDATE | Repeated same-bound stores and repeated shared misses are repeated motifs that are stutters under proof semantics but nonzero machine-cost transitions. |
| DP-07 | Alternative-factorization discovery | NEW_STRUCTURE | The WDL lower/upper pair admits an equivalent six-state convex-interval factorization and a 3-bit possibility-mask factorization. |
| DP-08 | Residual-structure discovery after partial match | CONFIRMED | Residual information omitted by scalar/q_r views remains occurrence, orientation, proof provenance and runtime economics; no global identity claim follows. |
| DP-09 | Symmetry / automorphism discovery | CONFIRMED | Horizontal reflection remains the q_o->q_r automorphism. Proof-state refinement is reflection invariant; literal PROMOTE tie-breaking remains orientation-sensitive. |
| DP-10 | Role-equivalent elements under different labels | NEW_STRUCTURE | Search-derived LOWER0 and CPC-derived LOWER0 are semantically role-equivalent evidence but have different provenance and cost. Same for UPPER0. |
| DP-11 | Invariants across admissible variation | NEW_STRUCTURE | At fixed q, valid proof updates are monotone information refinements: the admissible WDL possibility set can only shrink. |
| DP-12 | Known/unknown interface correspondence | NEW_CANDIDATE | Known exact proof refinement can be separated from unknown publication/probe economics; semantics are exact while benefit remains QU until measured. |
| DP-13 | Multi-scale common substructure | NEW_STRUCTURE | The same six-state proof carrier spans local weak bounds, exact local values and exact shared values; storage layer is not semantic state. |
| DP-14 | Transformation-invariant discovery | NEW_EXACT_STRUCTURE | Map [lower,upper] to the set of possible WDL outcomes. For {-1,0,+1}, refinement is exactly set intersection; a 3-bit mask makes this bitwise AND. |
| DP-15 | Information-flow structure | NEW_STRUCTURE | Evidence source -> fixed-q proof refinement -> optional exact promotion -> optional shared publication is the key information-flow chain. |
| DP-16 | Causal / temporal structure | NEW_CANDIDATE | A shared-exact miss followed by another miss on the same unchanged local weak state is a temporal stutter candidate. CPC opposite-bound evidence after a local weak hit is an immediate exact-refinement opportunity. |
| DP-17 | Containment / ownership structure | CONFIRMED | Worker-local proof occurrence, shared exact storage and semantic q value have separate ownership. Sharing does not merge task occurrence identity. |
| DP-18 | Cardinality / multiplicity structure | NEW_EXACT_STRUCTURE | There are exactly six valid nonempty WDL interval states: UNKNOWN, LOWER0, UPPER0, exact loss, exact draw, exact win; contradiction is the empty intersection trap. |
| DP-19 | Dual / reversed structures | NEW_STRUCTURE | LOWER0 and UPPER0 are dual under value-order reversal/player sign transport; one merge rule can cover both directions. |
| DP-20 | Complement / exclusion structure | NEW_EXACT_STRUCTURE | Incompatible proof evidence intersects to the empty mask. Correct same-q evidence must never reach this contradiction state; it is a fail-closed correctness detector. |
| DP-21 | Fixed-point / recurrence structure | NEW_EXACT_STRUCTURE | Starting from UNKNOWN, a resident q can undergo at most two strict proof refinements before reaching an exact singleton. Further same-q publications are necessarily stutter or contradiction. |
| DP-22 | Compositional-structure discovery | NEW_EXACT_STRUCTURE | Proof refinement is associative, commutative and idempotent under interval intersection/bitwise AND. Source order does not change the semantic result. |
| DP-23 | Reconstruction-structure discovery | NEW_EXACT_STRUCTURE | The 3-bit possibility mask reconstructs the exact lower/upper interval; power-of-two masks are exact values, two-bit masks are the weak zero bounds, 111 is unknown. |
| DP-24 | Proof / witness topology | NEW_CANDIDATE | Opposite weak evidence is a complete exact-draw witness: LOWER0 ∩ UPPER0 = {0}. CPC can therefore close an existing search-derived weak row without publishing CPC weak rows generally. |
| DP-25 | Refinement-relation discovery | NEW_STRUCTURE | Information order is reverse set inclusion / interval tightening. Strict refinement, stutter and contradiction are mechanically distinct transition classes. |
| DP-26 | Boundary-movement invariance | NEW_CANDIDATE | Moving proof state between private and shared storage should not change semantic refinement. Current masking/fallback behavior is a realization issue, not a new proof relation. |
| DP-27 | Parameter-role correspondence | CONFIRMED | alpha/beta window parameters and stored proof intervals are related but not identical quantities; a search window must not be treated as persistent q truth without established bound direction. |
| DP-28 | Dimensional / unit structure | NEW_EXACT_STRUCTURE | The 3-bit mask result is specific to three-valued WDL. It must not be generalized to arbitrary score domains without a new carrier proof. |
| DP-29 | Ordering / partial-order structure | NEW_STRUCTURE | The six proof states form a finite information partial order with UNKNOWN at the top and exact singletons maximally informative. |
| DP-30 | Reachability / connectivity structure | NEW_STRUCTURE | Proof refinement transitions remain at one q node; q reachability remains the rank DAG. Exact publication does not create a game edge. |
| DP-31 | Conservation / balance structure | NEW_STRUCTURE | Every valid proof refinement conserves q identity and shrinks—or preserves—the admissible value set. |
| DP-32 | Threshold / phase-boundary structure | NEW_EXACT_STRUCTURE | LOWER0 and UPPER0 are the only nontrivial non-exact thresholds in mover-relative WDL. This closes the weak-bound carrier exactly. |
| DP-33 | Degenerate / special-case structure | NEW_CANDIDATE | Exact draw is the unique nontrivial coalescence of the two weak threshold states. Exact endpoint evidence also absorbs any compatible weak state. |
| DP-34 | Failure-mode correspondence | NEW_CANDIDATE | Observed bound-class interference is consistent with excessive stutter/publication transitions rather than one bound direction being semantically bad. Shared weak masking exact is a second distinct failure mode. |
| DP-35 | Exception-structure discovery | RESIDUAL | Direct-map eviction can physically discard a more refined proof state even though semantic refinement is monotone. Cache residency is an execution exception, not proof weakening. |
| DP-36 | Representation-redundancy discovery | NEW_CANDIDATE | Same-state proof publication and repeated shared misses are representation/observation redundancies. Suppress only after full-q identity or a safe optional-observation rule. |
| DP-37 | Equivalent constraint-closure discovery | NEW_EXACT_STRUCTURE | Historical lower/upper max/min refinement and the new six-state possibility-mask intersection are exact representations of the same WDL proof closure. |
| DP-38 | Semantic-identity candidate discovery | CONFIRMED | Equal proof state does not imply task/q occurrence identity. No new NEI SAME/DISTINCT claim is needed. |
| DP-39 | QUI extension from partial unknown correspondence | NO_NEW_LEAD | No qualified QUI correspondence among runtime QUs is required by the new proof-state model. |
| DP-40 | Global whole-structure isomorphism | REJECT_GLOBAL_MATCH | q transition, proof refinement, task control and cache observation are not globally isomorphic: rank movement, ownership and evidence roles differ. |
| DP-41 | Literal-value coincidence | NO_NEW_LEAD | Numeric code coincidences among cache byte values, masks and WDL tokens carry no semantics by themselves. |
| DP-42 | Lexical / name similarity | NO_NEW_LEAD | Names such as bound, exact, cache and draw are retrieval labels only. |
| DP-43 | Shared ontology / class-label hints | NO_NEW_LEAD | Shared class labels do not establish proof-state equivalence; the interval/mask definitions do. |
| DP-44 | Serialization / layout similarity | NEW_CANDIDATE | A byte-code realization and a 3-bit mask realization may be operation-equivalent, but performance must be measured; serialization/layout similarity is not enough. |
| DP-45 | Raw identifier correspondence | NO_NEW_LEAD | Hash, slot, worker and cache IDs remain addressing only; full q content authorizes same-q refinement. |

## Priority

1. **CPC close-only exact promotion** — smallest new mechanism, strongest exact support.
2. **Proof-transition census** — count strict/stutter/contradiction transitions by source.
3. **Shared-miss repetition census** — decide whether miss memoization is worth a bit.
4. 3-bit proof-mask implementation experiment only after the census shows branch/store
   overhead worth replacing; semantic elegance alone is not speed evidence.

## Non-findings

The pass does not revive:

- general CPC weak-bound stores;
- broad shared weak-bound tables;
- single-worker testing;
- global q/NEI identity claims;
- node-count-only optimization;
- post-terminal cofactor composition.

