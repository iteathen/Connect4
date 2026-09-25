# Connect4 Lazy SMP Search Method — IsoGraph Successor Overlay 0.1

**Status:** derived successor operational/search-method overlay; unqualified  
**Authority effect:** none  
**Gameplay-semantics effect:** none  
**Solver-method effect:** none

## Scope

Lazy SMP changes the **search/execution method**, not the underlying exact Connect4 solver method.

Semantic base remains Connect4 logic authority 1.2. The implementation source inspected is JSMinSys `04d37498607ace16dae33c79462ddfe1503c8a0d`.

## Operational rendering

```text
one exact value-dependency relation
        |
        +--> worker w0: complete private demand traversal
        +--> worker w1: complete private demand traversal
        +--> ...
        |
        +--> optional shared exact-fact cache
        |
        +--> first exact root finisher terminates the race
```

Each worker owns:

- complete private exact CPC/RBA/Negamax evaluation state;
- private local exact cache;
- private recursion/scratch;
- deterministic action-order offset `workerIndex mod columns`.

Workers share only exact W/D/L cache evidence. There is no Connect4 Branch Manager, work queue, or branch assignment in Lazy SMP.

## Exact factorization

```text
correctness core:
    each worker can solve the root exactly without shared help

acceleration layer:
    sampled shared exact-cache probe/publication

termination layer:
    first exact root result claims winner; remaining workers close
```

Therefore:

```text
shared miss
shared eviction
sampling skip
dropped contended shared store
    != loss of completeness
```

provided private exact solving remains complete and shared reads fail closed.

## NEI

### Worker occurrence

Two workers are **DISTINCT** as execution/provenance occurrences even if they start at the same root, use the same code, use the same order policy, or derive the same value.

### Implementation key versus q

Same exact implementation key is a scoped SAME result only for the solver key-content question. It is not automatically q_o or q_r identity.

### Cache occurrence versus fact

Local and shared cache entries are DISTINCT storage occurrences. They may carry the SAME exact fact content under one exact key/value scope.

### Value versus witness

Same W/D/L does not imply same q, proof/certificate, or move witness. If multiple optimal moves exist, first-finisher timing may select different valid witnesses while scalar root value remains exact.

### Repeated policy

If `workerIndex mod columns` repeats, the ordering policy may be SAME while worker occurrences remain DISTINCT.

## QU

### QU-LSMP-01 — worker-diversity economics
Open: marginal value of each ordering policy, diversity versus shared-reuse contribution, best exact-preserving diversifier.

### QU-LSMP-02 — shared density/capacity
Open: optimal sample mask, capacity, replacement policy, and their hardware/position dependence.

### QU-LSMP-03 — duplicate-work topology
Open: overlap before exact publication, duplicate root-relevant work, fan-in/leverage of shared facts.

### QU-LSMP-04 — witness distribution
Open: frequency and downstream relevance of different optimal first-finisher witnesses.

### QU-LSMP-05 — worker-count scaling
Open: useful worker count, repeated-policy boundary, memory/coherence/scheduling crossover.

### QU-LSMP-06 — lossy cache materialization
Open: reuse value lost to direct-map replacement/contention and whether smarter persistence repays coordination cost.

### QU-LSMP-07 — implementation key to q_o/q_r
Open: strongest exact mapping theorem from current JSMinSys cache key to authority q_o/q_r and any required transporter metadata.

## Structural discoveries

1. Lazy SMP is **many operational traversals of one semantic value dependency**, not many solvers.
2. Shared cache is **acceleration**, not correctness ownership.
3. Logical exact fact stability and bounded physical cache materialization are different structures.
4. Worker role equivalence does not imply worker occurrence identity.
5. Scalar value identity does not imply witness identity.
6. Execution is not globally isomorphic to the semantic DAG: private occurrence trees/caches and lossy shared materialization are additional operational structure.
7. Current measured control shows solver-kernel work dominates CPU; search coordination/shared-cache self time is comparatively small, so more machinery needs causal evidence.

## Non-claims

This overlay does not:

- change logic authority 1.2;
- change q_o/q_r semantics;
- change the solver method;
- authorize proof transport through value equality;
- imply a Branch Manager should return;
- establish a universal optimal worker count, cache capacity, or sharing density.
