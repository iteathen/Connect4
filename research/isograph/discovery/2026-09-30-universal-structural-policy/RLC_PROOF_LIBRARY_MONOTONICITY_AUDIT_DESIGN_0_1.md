# RLC proof-library monotonicity audit design 0.1

**Date:** 2026-10-01  
**Branch:** `research/universal-structural-policy-20260930`  
**Recovered branch head before design:** `cb1e8cf7de12c4b77805bc07568a2637fac328e8`  
**Pinned JSMinSys authority:** `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`

## Purpose

Freeze the monotonicity repair before execution.

The live campaign has already re-routed the exact rank-20 root
`44444156666623222242` through the legacy adaptive repair engine and through
the four generic legacy target engines used by the forced-c3 family matrix.
Those checks did not close the exact rank-20 obstruction and did not fail from
resource exhaustion.

The newer q5d34 monotone audit is broader than the first RCIC route matcher,
but its implementation still embeds its route catalog in one experiment
runner. It directly queries the adaptive repair-capacity engine, bounded
rank-1/rank-3 closure, exact qualified-q handoffs and the newer
target-reservoir/contraction routes. It does not yet expose the remaining
generic legacy target proof engines as reusable router adapters, and there is
no durable family-by-family monotonicity ledger.

This design closes that integration seam without changing production CPC,
JSMinSys semantics, BSFP, or any already-qualified theorem.

## Frozen hypothesis

The current universal proof-routing layer is **catalog-incomplete as an
interface**, even though the rank-20 campaign manually queried the omitted
legacy engines.

The concrete omission to test first is the reusable legacy target family:

- generic target-distance / decreasing-\(\mu\) proof (`LAMBDA`);
- generic target+auxiliary lexicographic proof (`THETA`);
- distance-2 target-support re-entry;
- distance-1 resolved-tail capacity.

If one of these engines accepts q5d34 or a q5d34 consequence, the state was not
a genuinely new obstruction; it was an adapter omission. If all applicable
engines reject without resource failure, that negative result is retained as
monotonicity evidence and the structural obstruction survives.

## Exact identity rule

No adapter may use support equality as state identity.

Exact ordinary state identity remains:

```
q = support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

Exact-state handoffs require equality of that complete object. Side to move is
derived from ordinary support rank parity but may remain explicit in proof
orientation.

## Certificate-family classification

Every retained structural proof artifact encountered by the audit is assigned
exactly one of these dispositions:

1. `THEOREM_FAMILY_ROUTABLE` — qualified reusable theorem with a callable
   research-side adapter.
2. `THEOREM_FAMILY_ADAPTER_MISSING` — qualified reusable theorem whose
   premises are not reachable through the current interface. This is a failing
   audit condition.
3. `EXACT_STATE_ONLY` — qualified exact result whose sound scope is only its
   exact semantic-q family; it is preserved as an exact handoff, not promoted
   to a generic theorem.
4. `OBSOLETE_OR_REJECTED` — falsified/rejected material; never counted as
   retained proof capability.
5. `SUPERSEDED_BY_ROUTABLE` — an older qualified family whose sound scope is
   contained in an explicitly named stronger routed replacement.
6. `CANDIDATE_NOT_QUALIFIED` — theorem candidate or discovery result that has
   not yet crossed its own qualification boundary; never counted as retained
   capability.

The first five correspond to the durable monotonicity audit requested by the
campaign. The sixth prevents theorem candidates from being silently promoted
because a file exists.

## Initial retained-family inventory

The audit must at minimum account for these families and their live evidence:

### Direct/generic proof families

- immediate CPC terminal;
- forced-response / singleton / fork completion;
- adaptive repair-capacity induction;
- generic target-distance \(\mu\) repair (`LAMBDA`);
- generic target+aux lexicographic repair (`THETA`);
- distance-2 target-support re-entry;
- resolved-tail capacity;
- truncated target-reservoir pairing;
- RCIC / ranked controlled-invariant composition;
- CPC guard-survival proof kernel on the pinned JSMinSys research branch;
- Bx viability + finite reservoir in its qualified three-column family;
- exact three-column phase transfer.

### Structural combinators / proof calculi

- response-matroid circuit/defect transfer;
- compatible-cover + progress;
- choice elimination;
- W/D/L interval predecessor;
- residual/antichain dominance;
- post-response / controllable-predecessor transport;
- recursive consequence-class convergence by exact semantic-q equality.

### Exact-only retained results

- fixed latent-contract closure families whose own authority states an exact
  fixed root/family boundary;
- qualified rank-specific routed compositions where no generic theorem class
  has yet been proved.

### Rejected/candidate material that must not inflate capability

- rejected three-coordinate CPC/formula decoder;
- rejected pair-star scalar value-progress claim;
- rejected rank-25 c6 obstruction handoff;
- theorem files explicitly marked candidate/pending qualification.

## Adapter integration

Create one research-side module for the **legacy target proof family**. It must
call the existing proof libraries without modifying them and must:

1. enumerate the P0 singleton target claims present in the exact current state;
2. compute target distance from current support;
3. query every applicable legacy target engine;
4. preserve each accepted route independently;
5. report logical rejection separately from resource failure;
6. never infer a theorem from support equality;
7. return explicit inapplicability reasons for guarded families.

The q5d34 monotone audit will consume this adapter in addition to its existing
routes. This is a certificate-class integration, not a list of hard-coded q
identifiers.

## Durable monotonicity audit

Add a separate executable audit that reads a frozen family catalog and verifies:

- every qualified reusable family is either routable or explicitly superseded
  by a routable stronger family;
- every exact-only result has an exact-handoff disposition rather than a fake
  generic adapter;
- rejected and unqualified candidates are excluded from capability counts;
- every superseded entry names an existing routable replacement;
- the legacy target adapter exports all four generic engines above;
- production CPC, JSMinSys, and BSFP are not modified.

Any `THEOREM_FAMILY_ADAPTER_MISSING` entry fails the regression.

## Rank-20 regression

The audit retains the already-generated rank-20 evidence as regression input:

- exact root `44444156666623222242`;
- support `[1,6,1,6,1,5,0]`;
- legacy adaptive repair re-entry: zero closures, zero resource failures;
- forced-c3 four-engine legacy matrix: zero closures, zero resource failures.

The regression proves only that the exact rank-20 obstruction survived the
complete legacy queries that were actually applicable. It does **not** claim
that all rank-20 states are solved.

## q5d34 experiment

After adapter integration, rerun exact q
`5d34e24395b9d801` (rank 34, support `[6,6,3,6,5,5,3]`) through the
expanded positive library and unchanged forced-obligation loss calculus.

Acceptance:

- every newly added legacy engine is visible in route attempts whenever its
  guard applies;
- resource failures remain explicit;
- any positive proof preserves its native proof kind and target;
- absence of a positive route remains `UNKNOWN`, not loss;
- no production CPC, JSMinSys, RCIC theorem semantics, forced-loss semantics,
  or BSFP code changes occur.

## Execution order

1. Commit this frozen design.
2. Add a red regression that requires the global monotonicity catalog and the
   four legacy target adapters.
3. Add/lock the workflow and confirm the red failure.
4. Implement the research-side catalog + legacy target adapter.
5. Integrate that adapter into the q5d34 monotone audit.
6. Rerun/inspect generated evidence.
7. Only after the monotonicity audit is green, continue from the first exact
   q5d34 consequence still unresolved.
