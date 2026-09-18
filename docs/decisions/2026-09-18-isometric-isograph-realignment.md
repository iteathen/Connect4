# Isometric realignment after IsoGraph / NEI discovery

**Date:** 2026-09-18  
**Durable implementation branch:** `solver/isometric`  
**Canonical research owner:** `research/semantic-quotient`

## Verdict

Isometric is **substantially aligned already** with the newer IsoGraph/NEI findings.

The implementation already has the right architectural separations:

- residual/support-native gameplay state rather than incumbent colored-board recursion;
- coarse WSL structural buckets used only for retrieval;
- support-aware exact-value caching;
- typed guarded certificates;
- unresolved temporal/resource/realizability guards fail closed;
- recursive exact W/D/L only for residue not closed structurally.

The main mismatch was between the current implementation and its specification.

The specification said transition identity included side-to-move and terminal status. The actual `IsoMaxTransitionCache` equality uses only:

~~~text
canonical P0 residual class
+ canonical P1 residual class
+ canonical support
~~~

which is the q-shaped ordinary gameplay identity identified by canonical research.

## What remains representation detail

The native state still stores:

- `ply`;
- `sideToMove`;
- terminal status;
- support/playable masks;
- reversible history.

Those fields are useful for execution, guards, undo and diagnostics.

They are not all irreducible gameplay-identity coordinates.

In particular:

~~~text
ply
    derives from support

sideToMove
    derives from ply parity

terminal status
    is a first-win transition/result condition,
    not a coordinate of legal nonterminal q
~~~

Their physical storage should therefore be treated as an implementation/economics choice, not as semantic authority.

## Contextual certificate lookup is already well aligned

The certificate index uses the P0/P1 residual pair as a coarse bucket and evaluates support/turn/rank/etc. through guards before accepting a certificate.

That is already close to the contextual-correspondence model discovered by the IsoGraph work:

~~~text
coarse structural relation
    -> candidate lookup

context / guard
    -> lawful applicability

proof identity
    -> reusable proof work
~~~

So this subsystem does not need to be replaced with a single global state key.

## Implementation gap 1 — explicit gameplay-key API

`IsometricState.transitionSignature()` currently returns side/status/orientation fields, while `IsoMaxTransitionCache` intentionally ignores all but the first three semantic fields.

That works, but it hides the identity boundary in an implementation convention.

The solver should expose an explicit q/gameplay-key API so code cannot accidentally start using diagnostic/derived fields as equality authority.

## Implementation gap 2 — proofIdentity hardening

The certificate index currently deduplicates an existing `proofIdentity` token within one structural bucket before comparing a new guard/conclusion payload.

That assumes callers never reuse a proofIdentity for different load-bearing proof content.

The new identity discipline requires this to be explicit:

~~~text
same proofIdentity
    -> same proof profile
    -> same canonical guard
    -> same canonical conclusion
    -> same load-bearing dependency context
~~~

A mismatch must fail closed or create a distinct identity.

## Implementation gap 3 — temporal/resource/realizability closure

Those guard kinds currently return `UNRESOLVED`, which is correct.

Canonical research has now isolated guarded obligation birth as the next structural closure seam:

~~~text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation
~~~

Implementing that seam can reduce recursive residue, but only after the corresponding research clauses are sufficiently qualified.

Until then recursive exact W/D/L remains the correct fallback.

## No required solver rewrite

The intended migration is incremental:

~~~text
current Isometric
    residual/support q-shaped state
    + contextual certificates
    + recursive exact fallback

        -> make q identity explicit
        -> harden proof identity
        -> qualify q congruence directly
        -> implement qualified temporal/resource guards
        -> close more residue structurally
~~~

There is no evidence that the existing recursive backend must be discarded to align Isometric with IsoGraph.

## Non-claims

This decision does not:

- promote the q-congruence research candidate to frozen authority;
- claim empty-root searchlessness;
- remove stored derived fields before performance evidence;
- claim temporal/resource/realizability guards are implemented;
- turn proof identity into q identity;
- make Isometric a Negamax subfamily.

## Current architectural target

~~~text
q ordinary gameplay identity
        |
        +--> exact transition/value cache
        |
        +--> coarse structural retrieval
                 |
                 +--> exact contextual guard
                          |
                          +--> proof/certificate reuse
        |
        v
exact structural closure
        |
        v
recursive exact W/D/L only for unresolved residue
~~~
