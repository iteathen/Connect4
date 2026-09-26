# Connect4 Lazy SMP Search Method — DP 0.8 Successor View 0.3

**Status:** unqualified successor discovery/support view  
**Predecessor:** `CONNECT4_LAZY_SMP_SEARCH_METHOD_0_2.*`  
**Authority effect:** none  
**Solver-method effect:** none

The 0.2 artifact remains the full orchestration decode for JSMinSys `04d37498607ace16dae33c79462ddfe1503c8a0d`.

The later Core 0.19 campaign separately qualified an exact rendering of the complete executable source closure at that JSMinSys revision. Therefore 0.3 does not rewrite the source topology. It adds the new sufficiency/valuation questions.

## Declared target

This view analyzes support for:

1. the exact Lazy SMP solve result under the 0.2 exact gate;
2. clean invocation termination under the current host contract.

It does not silently redefine telemetry, generic ManagedThreadSession behavior, or other consumers as irrelevant.

## WAKE path

0.2 established:

```text
winner / failure / close
    -> WAKE += 1
    -> notify(WAKE)
```

and also:

```text
current Lazy SMP host
    -> polls STOP / DONE
    -> does not wait on WAKE
```

Therefore:

```text
WAKE increment/notify
    = NONESSENTIAL_FOR_SUFFICIENCY_CANDIDATE
      for current Lazy SMP host observation
```

This is deliberately scoped.

It does **not** establish:

```text
WAKE is globally useless
WAKE may be deleted from generic thread/session infrastructure
another consumer cannot require WAKE
```

A consumer audit is required before any implementation change.

No valuation evidence is supplied here, so the graph does not claim that removing WAKE would make execution faster.

## Metrics before winner CAS

The current worker publishes metrics/result fields before attempting:

```text
CAS WINNER: -1 -> workerIndex
```

Thus the winner is publication-delayed.

But DP 0.8 does not call metric publication nonessential merely because the scalar solve result could exist without it. Metrics/result rows may be part of the externally required target contract.

Disposition:

```text
OBJECTIVE_DEPENDENT
```

## Shared exact cache provenance

The DTS provenance census observed, for its pinned workloads:

```text
100% committed shared stores = CPC_EXACT
100% consumed shared hits    = CPC_EXACT
```

Observed reuse was large:

- solved control: about 21.5–22.6 hits/store;
- hard probe: 19.31 hits/store;
- empty board: 43.22 hits/store.

This establishes the measured current boundary as a cross-worker CPC-exact memoizer for those workloads.

It does not prove:

- every future workload has the same provenance population;
- shared caching is minimum-cost;
- a different sample mask is better;
- shared-hit local backfill is beneficial.

Those remain valuation/experiment questions.

## New-standard disposition

The 0.2 source decode remains valid.

0.3 adds:

- explicit target declaration;
- objective-scoped nonessential-support candidate;
- consumer-boundary guard;
- target-contract preservation;
- measured-evidence scope;
- valuation-not-supplied state.

This is a DP 0.8 successor view, not source authority.
