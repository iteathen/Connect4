# CPCX Class-C Existing-Theorem Audit 0.1

**Status:** frozen negative diagnostic  
**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Parent:** `CPCX_CLAIM_RELATIVE_CONTROLLER_WITNESS_AUDIT_0_1.md`

## Scope

This audit asks whether the single remaining claim-relative controller seam is
already covered by a qualified CPCX theorem family that is not selected by the
general progress classifier.

The state is reached after the Class-C source's exact playable-two-piece macro:

```text
rank = 24
P0 to move
classifyCpcxProgress = NO_CERTIFICATE
runCpcxFirstWinCertificate = NO_CERTIFICATE
```

Current legal P0 actions:

```text
{B3,C1,D6,E4,F6,G4}
```

`C1` is rejected because it exposes the immediate P1 terminal `C2`.

No remoteness or mate-depth question is considered.

## Pair-star

The qualified CPCX pair-star detector returns no certified pair-star at the
post-macro Class-C state.

Therefore the remaining seam is not an omitted pair-star composition.

## Current P0 residual shape

The post-macro state contains, among others:

```text
P0 singleton:
    C3-D3-E3-F3 missing {C3}, support 2

P0 pair:
    A3-B3-C3-D3 missing {B3,C3}, support {0,2}
    B3-C3-D3-E3 missing {B3,C3}, support {0,2}
    A2-B3-C4-D5 missing {B3,C4}, support {0,3}
    C6-D5-E4-F3 missing {C6,E4}, support {5,0}
```

The simultaneous playable P1 structure includes `{E4,G4}`, so first-win
guards remain material.

## Ranked reservoir audits

For every current P0 action, the diagnostic applied the existing first-win
reservoir RCIC families to every resulting P0 singleton target with P1 to move.

No candidate certified P0 first win.

Most informative results:

### B3

```text
target C3:
    reservoir-gap RCIC
    rootGap = 3
    nodeCount = 763
    NO_CERTIFICATE: COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE

target C4:
    one-defect target: ONE_DEFECT_STATIC_COVERAGE_GAP
    one-defect attachment: ONE_DEFECT_ATTACHMENT_RESPONSE_TOTALITY_FAILURE
    reservoir-gap: PAIRING_PARITY_INADMISSIBLE
```

### D6

```text
target C3:
    reservoir-gap RCIC
    rootGap = 2
    nodeCount = 30
    NO_CERTIFICATE: COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE
```

### E4

```text
target C3:
    reservoir-gap RCIC
    rootGap = 3
    nodeCount = 173
    NO_CERTIFICATE: COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE

target C6:
    one-defect target: ONE_DEFECT_STATIC_COVERAGE_GAP
    one-defect attachment:
        ONE_DEFECT_ATTACHMENT_RESPONSE_TOTALITY_FAILURE
        nodeCount = 507
    reservoir-gap: PAIRING_PARITY_INADMISSIBLE
```

### F6

```text
target C3:
    reservoir-gap RCIC
    rootGap = 3
    nodeCount = 82
    NO_CERTIFICATE: COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE
```

### G4

```text
target C3:
    reservoir-gap RCIC
    rootGap = 2
    nodeCount = 86
    NO_CERTIFICATE: COVERAGE_REPAIR_RESPONSE_TOTALITY_FAILURE
```

The repeated failure is therefore not lack of target-reservoir structure. The
ranked invariant reaches small finite gaps but cannot certify a response for
every relevant P1 event.

## Current interpretation

After changing the CPCX target, the turn-6 proof has been reduced from a
cross-realization common-move problem to one controller state whose obstruction
is now specifically:

```text
existential P0 action
+ universal P1 current-response coverage
```

The existential half is no longer the conceptual problem by itself. Existing
candidate actions produce structural carriers, but none of the current theorem
families can prove the required universal P1 coverage for Class C.

This is consistent with the new target:

- do not rank losing P1 moves by survival depth;
- do prove that all P1 responses remain in the P0-winning class;
- do allow a different P0 witness at each controller descriptor.

## Next target

If CPCX work continues, the narrowest justified target is:

```text
Class-C response-totality repair
```

not a new remoteness rule and not a universal common P0 move.

The most promising evidence-bearing seams are the small reservoir gaps after:

```text
D6 -> target C3, rootGap 2
G4 -> target C3, rootGap 2
```

Any repair must remain structural and claim-relative. It may add an admissible
response class only if that class is derived from current rank-local
obligations/resources and preserves first-win precedence. It must not expand
arbitrary P0 replies or recursively search legal continuations.

## Qualification

Diagnostic commit:

```text
62c1abd608a55f05b366a0b2766a3a0d4e2dbc4e
```

Workflow:

```text
37167336689
Research CPCX opponent response descent
SUCCESS
```

The audit uses no solved data, oracle value, minimax, negamax, alpha-beta, or
remoteness labels.
