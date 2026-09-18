# Connect4 IsoGraph — Natural Entropic Identity application 0.1

**Status:** applied derived NEI overlay  
**Date:** 2026-09-18  
**Connect4 base authority:** IsoGraph logic authority 1.1  
**Qualified NEI semantics:** NEI 0.1 + NEI 0.2  
**NEI 0.3:** used only as non-authoritative observation/scope guidance  
**Current authority 1.1 mutated:** no

## Purpose

Apply Natural Entropic Identity to the actual Connect4 IsoGraph rather than leaving NEI as an unused extension.

The result is deliberately profile-relative. Connect4 contains several different identity questions:

~~~text
artifact identity
event identity
lineage identity
physical-state identity
future-behavior semantic-state identity
~~~

NEI does not collapse those questions into one global partition.

## Governing profile form

Every result is interpreted as:

~~~text
P = explicit Connect4 identity profile
E = frozen Connect4 authority/evidence
Q = only when qualified unresolved identity-relevant structure exists
~~~

No result below uses absence of difference as positive SAME evidence.

No result below uses SI spelling, file location, or mere structural resemblance as natural-identity evidence.

## Evidence hierarchy results

### C4-R0044

Two distinct artifacts support one evidence lineage.

Under artifact-instance identity:

~~~text
representation-algebra.json
!=
OQS detailed provenance report

NEI = DISTINCT
~~~

Under lineage identity after explicit lineage projection:

~~~text
lineage_of(artifact A)
=
lineage_of(artifact B)

NEI = SAME
~~~

This is not a contradiction. The profiles ask different identity questions.

### C4-R0074

The historical qualification and canonical requalification are distinct events:

~~~text
historical event
!=
canonical reproduction event

NEI(event identity) = DISTINCT
~~~

Both belong to the same evidence lineage:

~~~text
lineage_of(historical event)
=
lineage_of(canonical event)

NEI(lineage identity) = SAME
~~~

The `reproduces` relation therefore preserves event distinction while supporting lineage sameness.

### C4-R0045

The rolling-rank and compact-CUDA evidence are two distinct lineages:

~~~text
NEI(lineage identity) = DISTINCT
~~~

Their cross-lineage statistical independence remains:

~~~text
UNKNOWN
~~~

That UNKNOWN is **not** NEI semantic UNKNOWN.

It is an unresolved evidence-independence property between two already-distinct lineages.

This prevents a major category error:

~~~text
unknown independence
    !=
unknown identity
~~~

## Solver-semantic state identity

SIU-1 supplies a stronger identity application.

The tested semantic state is:

~~~text
q =
  supportIndex
  + sideToMove
  + normalized P0 residual antichain
  + normalized P1 residual antichain
~~~

Across the complete bounded controls:

~~~text
4x3:c3
4x4:c4
5x3:c4
4x5:c4
~~~

SIU-1 checked:

~~~text
1,681,808 physical states
0 exactness mismatches
0 BSFP W/D/L mismatches
0 reverse-closure mismatches
~~~

The same q drove exact forward transitions, terminal behavior, strong score, per-action score and W/D/L behavior over the exhausted finite domains.

Therefore, under the scoped profile:

~~~text
P-C4-FUTURE-BEHAVIOR-STATE-BOUNDED-0.1
~~~

for any two states in the same exhausted control domain:

~~~text
q(x) = q(y)
    ->
NEI_P(x,y) = SAME
~~~

This does **not** say the two physical board states are the same physical state.

Indeed, every tested geometry has more physical states than relational states and a maximum class size greater than one.

Thus there exist pairs for which:

~~~text
NEI_physical-state(x,y) = DISTINCT

while

NEI_future-behavior(x,y) = SAME
~~~

This is the intended NEI behavior: identity is scoped to the declared natural/domain question rather than forced into one universal partition.

## Standard 7x6

The same conclusion is **not** promoted to the standard 7x6 game.

SIU-1 explicitly lists standard-7x6 exhaustive sufficiency as a non-claim.

The current state-identity-unification packet is represented as source-native `INCOMPLETE_SCOPE`, and no qualified QU realization family has been established for the global 7x6 identity question.

Therefore:

~~~text
same q on standard 7x6
    -> INCOMPLETE_UNQUALIFIED
~~~

not:

~~~text
SAME
DISTINCT
UNKNOWN
~~~

In particular, NEI semantic UNKNOWN would require a qualified QU-mediated family containing admissible SAME and DISTINCT identity models. That family does not currently exist.

This is a successful fail-closed result.

## Identity hierarchy now exposed

The applied Connect4 identity stack is:

~~~text
representation/SI identity
    != artifact identity
    != evidence-event identity
    != evidence-lineage identity
    != statistical independence
    != physical-state identity
    != scoped future-behavior state identity
~~~

Relations may connect these layers without collapsing them.

Examples:

~~~text
artifact A DISTINCT artifact B
lineage(A) SAME lineage(B)

event A DISTINCT event B
lineage(A) SAME lineage(B)

physical state A DISTINCT physical state B
future-behavior(A) SAME future-behavior(B)
~~~

## Files

Profiles:

`research/isograph/identity/CONNECT4_NEI_PROFILES_0_1.json`

Results:

`research/isograph/identity/CONNECT4_NEI_RESULTS_0_1.json`

Native result overlay:

`research/isograph/identity/CONNECT4_NEI_RESULTS_0_1.isg`

Application manifest:

`research/isograph/identity/CONNECT4_NEI_APPLICATION_MANIFEST_0_1.json`

## Authority consequence

Authority 1.1 remains byte-identical.

This overlay is a derived NEI application over authority 1.1.

A later Connect4 IsoGraph authority revision should ingest whichever NEI profile/result relations are intended to become representation authority.

## Final disposition

~~~text
NEI_APPLIED_TO_CONNECT4_ISOGRAPH = YES

determinate SAME results        = 3
determinate DISTINCT results    = 3
semantic NEI UNKNOWN results    = 0
incomplete/unqualified results  = 1

global identity collapse        = NO
unknown collapsed               = NO
authority 1.1 mutated           = NO
~~~
