# CPCX Class-C Shared Acquisition/Block Theorem Audit Result 0.2

**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Status:** token-entry topology measured; recurrence not yet solved  
**Parent:** `CPCX_CLASS_C_SHARED_ACQUISITION_BLOCK_THEOREM_AUDIT_RESULT_0_1.md`  
**Workflow:** `Research CPCX Class-C shared acquisition-block theorem audit`  
**Run:** `37171447001` — SUCCESS

## Added question

For each of the 38 exact Class-C theorem instances, is the exact P1-to-move
physical state *after the pinned P0 event* already one of the nodes in the
frozen Class-C physical cohort?

This is the correct token-entry state. It is distinct from the state reached
after the later named supply/response discharge.

## Result

Across all 38 exact theorem instances:

```
theorem certificates:                    38
fixed-cohort token-entry states:          28
fixed-cohort post-discharge reentries:    18
```

### D6

```
certificates:                 18
token entry in fixed cohort:  13
post-discharge reentry:       11
```

### G4

```
certificates:                 20
token entry in fixed cohort:  15
post-discharge reentry:        7
```

## Consequence

The qualified theorem can be tested inside the already-frozen physical
Class-C graph without expanding that graph.

A proof-state extension may admit only theorem instances whose exact
post-pinned P1 state is already a fixed physical node.

The shared token state must be treated separately from ordinary state:

```
A(q,a)
```

where `a` is one exact
`SUPPORT_RELEASE_SHARED_ACQUISITION_BLOCK_EDGE` certificate established on
entry to physical state `q`.

On its named supply event the token prescribes one exact shared response.
On other P1 events the token provides no extra response and ordinary theorem
routes must cover the event.

If the named discharge normalizes outside the fixed cohort and does not
terminally certify P0, that token state fails closed in the next experiment.

## Claim boundary

This is topology/provenance evidence only.

It does not certify any Class-C root.
