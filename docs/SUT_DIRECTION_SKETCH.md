# SUT direction sketch

**Status:** rough directional note only. This is not an architecture contract, implementation plan, API specification, or authorization to begin SUT integration work.

SUT (`S ∪ T`) is expected to bring the independently developed IsoMax/Isometric and BSFP solver lines together only after their natural boundaries have matured. The parent solvers should continue to cross-reference one another at those boundaries rather than being reshaped around a guessed SUT interface in advance.

## Current working picture

The cleanest weld presently appears to be two independent solver workers coordinated by Branch Manager:

```text
                 SUT Branch Manager
                  /             \
                 /               \
        IsoMax worker          BSFP worker
        forward solve          backward closure
                 \               /
                  \             /
                    exact TT /
                  horizon knowledge
```

The tentative division of responsibility is:

- **IsoMax worker** advances the forward structural solve using the semantics and calculus owned by the IsoMax/Isometric lineage.
- **BSFP worker** advances backward exact closure using the semantics and fixed-point machinery owned by the BSFP lineage.
- **Branch Manager** remains the likely owner of the weld. It schedules forward branches and checks whether BSFP has already established an exact continuation for a state reached by IsoMax.
- **TT / horizon knowledge** is the likely meeting surface. It should represent exact solved knowledge, not make solver-policy decisions.

## BSFP horizon

The phrase **BSFP horizon** is intentionally broader than search depth. The current idea is the set of states or certified regions for which BSFP already has an exact result:

```text
H_B = { s | BSFP can certify V(s) }
```

When IsoMax reaches a state covered by that horizon, Branch Manager can terminate that forward branch and splice in the exact BSFP continuation value instead of continuing redundant work.

Initially this may reduce to an exact TT probe. Later research may show that BSFP can certify a larger monotone/structural region rather than only exact board identities. SUT should not freeze that representation before the parent solver boundaries establish what is actually safe and useful.

## Intended interaction

Conceptually the two fronts advance toward one another:

```text
IsoMax forward solve  ----->     <-----  BSFP backward closure
                           weld
```

A possible runtime sequence is:

```text
IsoMax advances a branch
        |
        v
Branch Manager receives the reached state
        |
        v
probe BSFP exact knowledge / horizon
        |
   +----+----+
   |         |
 exact      unknown
   |         |
close/splice continue IsoMax
```

If BSFP expands its exact horizon while IsoMax is already working below a newly covered state, Branch Manager may eventually be able to cancel or supersede that now-redundant forward work. The exact concurrency and cancellation policy is deliberately unspecified here.

## Boundary rule

The present preference is:

> Branch Manager detects and performs the weld; IsoMax and BSFP do not absorb each other's internal solver responsibilities.

That keeps both parent engines independently understandable, testable, and developable before SUT exists as a real implementation.

## Deliberately unresolved

This note does **not** decide:

- the final shared state or TT representation;
- whether BSFP horizon membership is exact-state, structural-region, WSL-frontier, or another certified relation;
- worker/process/thread topology;
- synchronization, cancellation, ownership, or memory layout;
- CUDA scheduling or device residency;
- adapter/API shape between the parent engines and Branch Manager;
- whether the mature mathematics ultimately leaves two cooperating engines or collapses into a more unified calculus.

Those decisions should follow the actual mature boundaries of IsoMax and BSFP, not precede them.
