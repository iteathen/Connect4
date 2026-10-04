# CPCX Claim-Relative Controller Witness Audit 0.1

**Status:** frozen diagnostic result; not yet universal recurrence closure  
**Date:** 2026-10-03  
**Branch:** `experiment/cpcx-20261002`  
**Parent target:** `CPCX_WINNER_EXISTENCE_LOSER_EQUIVALENCE_TARGET_0_1.md`  
**Production CPC / production solver:** unchanged

## Purpose

Apply the revised CPCX action semantics to the current turn-6 recurrence seam.

The previous endpoint diagnostic implicitly asked for a stronger property than
the current proof target requires:

```text
one common P0 action that works across every physical realization
```

The revised target requires only:

```text
for each P0/controller realization:
    there exists at least one certified structural handoff

for each P1/opponent boundary:
    every current legal P1 action is covered
```

P0 witnesses may therefore differ between claim-equivalent physical
realizations. No remoteness ordering is required.

## Audit boundary

The audit is deliberately flat.

For each currently exposed P0 controller state it:

1. enumerates only the current legal P0 actions;
2. applies one candidate current action;
3. accepts an immediate P0 first-win certificate, or tests whether the resulting
   P1 boundary admits the already-qualified Protected Diagonal
   Opponent-Response Descent v0.2 theorem;
4. does not recursively enumerate a future legal-action tree.

This is an existential current-action audit composed with an already-qualified
universal current-opponent-frontier theorem.

The diagnostic explicitly reports:

```text
controllerExistentialAuditCurrentActionOnly = true
controllerExistentialAuditUsesQualifiedResponseDescentV2 = true
noRecursiveControllerActionTree = true
```

## Result on the three former no-transfer controller seams

The old endpoint census contained three difficult physical realizations for
which a shared P0 action had not been certified.

Under the claim-relative target, two of those three immediately admit different
P0 structural handoffs.

### Class A

Source:

```text
rank = 22
support = [6,1,0,6,2,5,2]
P0 to move
```

P0 action:

```text
C1
```

produces an open P1 boundary with two independently response-total P0 diagonal
carriers:

```text
A2-B3-C4-D5
missing {B3,C4}
support {1,2}
source measure (2,3,19)
current P1 event count = 5

C6-D5-E4-F3
missing {C6,E4}
support {4,1}
source measure (2,5,19)
current P1 event count = 5
```

For both carriers every current P1 event is certified by v0.2 as P0 first win
or strict protected-measure descent.

Therefore the old requirement that this class share the same P0 move with the
other classes was unnecessary.

### Class B

Source:

```text
rank = 24
support = [6,1,1,5,3,5,3]
P0 to move
```

P0 action:

```text
E4
```

produces an open P1 boundary with the response-total P0 diagonal:

```text
C6-D5-E4-F3
missing {C6}
support {4}
source measure (1,4,17)
current P1 event count = 6
```

Again every current P1 action is covered by v0.2 as P0 first win or strict
descent.

This witness was invisible to the former cross-realization common-action test.

### Class C — remaining seam

Source:

```text
rank = 22
support = [6,2,0,5,2,5,2]
P0 to move
```

No current P0 action is presently certified as either:

- an immediate/direct P0 first win; or
- a handoff into an existing response-total protected-diagonal boundary.

At this source CPCX does have an exact playable-two-piece forcing macro. The
macro is composed without free opponent choice and returns control to P0:

```text
rank = 24
P0 to move
```

However, at that returned controller state:

```text
classifyCpcxProgress -> NO_CERTIFICATE
runCpcxFirstWinCertificate -> NO_CERTIFICATE
```

and none of the current legal P0 actions

```text
{B3,C1,D6,E4,F6,G4}
```

currently yields a P0 first-win certificate or a v0.2 response-total protected
diagonal handoff.

`C1` is positively rejected because it gives P1 an immediate terminal at
`C2`.

Thus Class C is the current narrow controller-side proof seam.

## Consequence

The former controller seam was not:

```text
find one move common to all three physical classes
```

It is now:

```text
Class A -> witness C1
Class B -> witness E4
Class C -> one missing controller witness theorem
```

This is a strict reduction in the proof obligation produced solely by adopting
the correct claim-relative quantifiers.

The result does **not** yet establish global P0 first-win closure, because a
response-total one-layer handoff still needs to live inside a well-founded
admitted recurrence or terminate in a first-win class.

## Next research target

Do not search for longest survival and do not restore a common-action
constraint.

Investigate only the remaining Class C controller state.

The next theorem candidate should answer:

> Which rank-local structural object makes at least one of
> `{B3,D6,E4,F6,G4}` a valid P0 progress witness after the qualified
> playable-two-piece macro, without recursively enumerating future replies?

Preferred order:

1. inspect whether the horizontal playable-two-piece macro has transferred
   control into a non-diagonal carrier that existing CPCX progress omits;
2. inspect pair-hub / CPC2 / support-release / reservoir structures before
   adding a new primitive;
3. if a new primitive is required, require one current P0 witness and universal
   current P1 response coverage only;
4. preserve strict first-win precedence and fail closed on P1 counterterminal;
5. keep the proof outcome-only. Do not introduce mate depth or remoteness.

## Qualification

The existential action audit was generated by the turn-6 endpoint census at
commit:

```text
3fb391afb3dcbb450099a4e4e4fa2caaae06491c
```

GitHub Actions run:

```text
37166964679
Research CPCX opponent response descent
SUCCESS
```

The post-forcing Class C audit was generated at:

```text
bff9177fec4dc2a5521b48f9b4e570329e1653dd
```

GitHub Actions run:

```text
37167121866
Research CPCX opponent response descent
SUCCESS
```

No solved data, oracle, minimax, negamax, alpha-beta, recursive legal-move tree,
or remoteness label is used by these diagnostics.
