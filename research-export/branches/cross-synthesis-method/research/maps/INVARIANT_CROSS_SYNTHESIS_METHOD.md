# Invariant Cross-Synthesis Method

**Purpose:** give research agents a repeatable way to transfer useful structure across projects or solver lineages without confusing analogy, shared terminology, or implementation similarity with semantic equivalence.

This method is intentionally domain-agnostic. It applies whenever two or more systems may share deeper relational structure despite using different representations, algorithms, execution models, or vocabulary.

## Core rule

Do not transfer implementations first.

Transfer **invariants, relations, and guarded laws** first.

A useful cross-project statement should be expressible in a representation-independent form such as:

```text
Under preconditions P,
structure A determines / restricts / transforms structure B
while preserving invariant I.
```

Only after that statement survives qualification should an implementation transfer be considered.

## Governing cycle

For each meaningful unit use:

```text
assess
-> research
-> reassess
-> plan
-> execute
-> qualify
-> review
-> cleanup/document
```

Do not remain indefinitely in idea-generation mode. Once a candidate invariant is sufficiently precise, convert it into a falsifiable experiment or proof obligation.

## 1. Decompose each source idea before comparing it

For every candidate idea, separate at least:

```text
semantic mechanism
representation
placement in the algorithm
runtime/execution form
measured performance
```

Example pattern:

```text
mechanism:
    repeated exact work shares one semantic identity

representation:
    IDs, hashes, bitsets, graph nodes, arrays, clauses, etc.

placement:
    before expansion, after expansion, during normalization, cache boundary, etc.

runtime form:
    CPU table, GPU kernel, static DAG, dynamic scheduler, etc.
```

A failed representation, placement, or runtime form does **not** automatically falsify the mechanism.

Likewise, a performance win does not prove the semantic mechanism is universally applicable.

## 2. Extract the invariant statement

Rewrite the idea without project-specific nouns where possible.

Weak form:

```text
Project A uses packed representation X and it is faster.
```

Strong form:

```text
Future behavior factors through invariant Q,
while occurrence/context R can be stored separately and reconstructed exactly.
```

Prefer laws about:

- identity;
- implication;
- order;
- closure;
- conservation;
- quotient preservation;
- factorization;
- reachability;
- compatibility;
- realizability;
- symmetry;
- dependency;
- resource/capacity constraints;
- temporal precedence;
- fixed-point structure.

## 3. Record information preserved and information discarded

Every proposed reduction or correspondence must answer:

```text
What information is preserved?
What information is discarded?
What requested observations remain invariant?
What observations may change?
```

A quotient is not valid merely because two objects look structurally similar.

The exact test is:

```text
Can the discarded information change the target behavior or claim?
```

If yes, the quotient needs an additional guard, sidecar, refinement, or must be rejected.

## 4. Match relations, not names

Two projects may use different vocabulary for the same structure, or identical vocabulary for different structures.

Compare objects through their relations and operations:

```text
objects
ordering
composition law
identity/equality criterion
transition law
boundary conditions
symmetries
failure conditions
observables
```

A candidate match is stronger when these commute under an explicit mapping.

For mapping `f`, look for statements like:

```text
f(T_A(x)) = T_B(f(x))
```

or:

```text
x <=_A y  iff  f(x) <=_B f(y)
```

or:

```text
claim_A(x) = claim_B(f(x))
```

under stated guards.

## 5. Classify the strength of every match

Use an explicit ladder:

### Structural resemblance

The systems exhibit a similar pattern.

Useful for discovery only.

### Candidate correspondence

An explicit object/operation mapping has been proposed.

Still not authority.

### Guarded invariant-preserving match

The mapping has explicit preconditions and preserves the relevant relation or claim under those guards.

May be used where the guards are established.

### Qualified equivalence

The mapping has survived complete controls, proof, or another adequate falsification regime for its stated scope.

### Performance-qualified transfer

The semantic equivalence is already established and the transferred runtime form has independently demonstrated value on the target workload.

Never silently promote one level to the next.

## 6. Search for the smallest load-bearing invariant

When two systems differ, do not immediately preserve the entire source state.

Ask:

```text
What is the minimum distinction that changes the truth of the target claim?
```

Possible outcomes include:

- one bit rather than a whole state;
- relative order rather than absolute time;
- capacity rather than resource history;
- an equivalence class rather than a physical object;
- a compatibility relation rather than full reconstruction;
- a dependency cone rather than global state;
- a support-local basis rather than a global vocabulary.

This is often where the largest compression or simplification appears.

## 7. Keep identity domains separate

Do not assume one equivalence relation is sufficient for every purpose.

Common distinct identities include:

```text
physical identity
operational identity
semantic/behavioral identity
transition identity
proof/certificate identity
structural retrieval identity
```

One coarse structural key may be excellent for locating reusable work while being too weak to authorize a transition or solved value.

Conversely, two semantically different states may share the same proof certificate.

Cross-synthesis should preserve these distinctions instead of forcing one universal key.

## 8. Look for factorization before compression

A recurring high-value pattern is:

```text
semantic identity
+
occurrence/context
```

If an expensive exact transformation depends only on semantic identity, compute it once and map many occurrences to the result.

Other common factorizations:

```text
static geometry + dynamic guards
marginals + compatibility relation
bulk counters + boundary state
shared proof kernel + occurrence-specific prerequisites
canonical object + orientation/transform metadata
coarse structural class + claim-specific guard
```

Prefer exact factorization over heuristic pruning because it can reduce work without weakening authority.

## 9. Treat lost correlation as a first-class warning

Many attractive reductions preserve each component separately while losing which combinations are jointly realizable.

Whenever a representation becomes a product of smaller summaries, explicitly ask:

```text
Are arbitrary combinations of these summaries realizable?
```

If not, identify the **minimum compatibility relation** required to recover exact composition.

Do not automatically restore the complete original state. Search first for:

- parity/affine relations;
- clauses;
- small compatibility IDs;
- resource cuts;
- event-order constraints;
- minimal completion relations;
- guarded sidecars.

The missing correlation relation is often the actual transferable invariant.

## 10. Use one project as a falsification oracle for another

Cross-synthesis should be bidirectional.

A typical loop is:

```text
Project A exposes a structural law
-> map it into Project B
-> B exhaustively/procedurally tests the law
-> counterexamples reveal the missing guard
-> refine the invariant
-> retest
-> return the qualified law to the shared corpus
```

Counterexamples are not merely failures. They identify which discarded distinction was load-bearing.

Record the smallest counterexample and the exact missing condition.

## 11. Distinguish discovery information from solver authority

Information sources should be tagged by authority.

Typical categories:

```text
rule/algebra-derived
runtime-earned exact
empirical/benchmark
external oracle
heuristic
```

An external solved result may suggest where to look or qualify the final result, but it must not silently become a premise if the target solver is intended to derive the result independently.

Runtime-earned exact facts are different: once the current computation has proved them, they may legitimately become premises for later stages of that same computation.

## 12. Convert every promising synthesis into a falsifier

Do not leave strong ideas as prose indefinitely.

For each candidate define:

```text
claim
scope
preconditions
mapping
expected invariant
strongest counterexample
reference/oracle semantics
measurement if performance is relevant
```

Prefer complete small controls before large partial workloads.

For exact semantic transfers, compare the full boundary or transition relation when practical, not only the root result.

## 13. Separate semantic qualification from performance qualification

Use two questions:

```text
Is it exact?
Is this execution form profitable?
```

Answer them independently.

A representation may be mathematically superior and computationally worse in a naive implementation.

A fast implementation may exploit a mechanism whose correctness still has not been established.

Do not discard a valid mechanism because one runtime form loses, and do not promote a fast form into semantic authority because it wins a benchmark.

## 14. Preserve negative results at the correct layer

When something fails, record precisely what failed:

```text
mechanism false
mapping incomplete
missing guard
representation too wide
placement too late
normalization too expensive
runtime unsuitable
workload lacks amortization
```

Avoid statements like:

```text
"Idea X failed."
```

when only one implementation form failed.

This prevents later agents from rediscovering valid mechanisms that were incorrectly buried with bad implementations.

## 15. Prefer pre-materialization reductions

When the target algorithm has combinatorial expansion, the highest-value transfer is often a law that eliminates work **before** the product/search/frontier is materialized.

Measure:

```text
exact work eliminated before materialization
---------------------------------------------
cost of proving/applying the invariant
```

This ratio is usually more informative than raw compression after expensive candidates have already been generated.

## 16. Preserve provenance while removing authority from history

Historical notes, prior conclusions, solved labels, issue text, and earlier experiments are evidence—not authority.

Cross-synthesis should:

1. locate the original evidence;
2. restate the invariant independently;
3. identify its actual guards;
4. test it against the current target semantics;
5. preserve provenance for audit;
6. promote only the newly qualified statement.

Do not copy old conclusions merely because multiple documents repeat them.

## 17. Maintain a shared invariant corpus

Successful cross-synthesis should produce reusable objects such as:

```text
invariant statement
preconditions/guards
mapping between representations
preserved observables
known non-preserved observables
proof/evidence status
known counterexamples
implementation consumers
performance evidence, if any
```

The durable artifact is the invariant, not the conversation that discovered it.

## 18. Practical discovery checklist

When inspecting another project, ask in this order:

```text
1. What expensive distinction does this project avoid representing?
2. What exact fact allows it to avoid that distinction?
3. What operation does the reduced object support?
4. What information had to be retained as a guard or sidecar?
5. Where does the abstraction fail?
6. Does the target project contain the same relational pattern?
7. Can an explicit mapping be written?
8. What is the strongest cheap falsifier?
9. Can the reduction occur before combinatorial materialization?
10. Does the runtime form preserve the semantic win?
```

## 19. Common failure modes

Do not:

- transfer code before extracting the invariant;
- equate same dimension/cardinality with isomorphism;
- equate same hash/signature with semantic equality;
- treat a structural analogy as a proved correspondence;
- drop support, timing, resources, or realizability merely because the coarse structure matches;
- turn every newly relevant distinction into universal state identity;
- infer full-state equivalence from proof reuse;
- infer proof equivalence from state similarity;
- use benchmark performance as correctness evidence;
- use solved/oracle knowledge as an unstated premise;
- treat failure of one execution strategy as falsification of the underlying law;
- keep generating hypotheses after a candidate is precise enough to test.

## 20. Preferred end state

The ideal research loop is:

```text
extract invariant
-> find cross-project relational match
-> state explicit mapping and guards
-> falsify aggressively
-> refine from counterexamples
-> prove/qualify
-> choose representation
-> choose placement
-> choose runtime form
-> measure
-> persist invariant and negative evidence
-> feed the result back into every relevant project
```

The goal is not to make projects look alike.

The goal is to expose **the same load-bearing structure wherever it occurs**, preserve exactly the information required for correctness, and let each project keep the representation and execution model best suited to its own workload.

## Compact operating principle

```text
Abstract aggressively.
Transfer cautiously.
Falsify early.
Preserve guards.
Separate semantics from representation.
Separate correctness from performance.
Promote invariants, not anecdotes.
```
