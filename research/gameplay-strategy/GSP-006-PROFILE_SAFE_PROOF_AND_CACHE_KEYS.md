# GSP-006 — Profile-safe proof and cache keys

**Status:** rough proposal  
**Purpose:** prevent exact q identity from being overextended into stronger proof/context identity.

## Proposal

Make cache/proof identity explicitly layered:

~~~text
gameplay key:
    q

proof key:
    q + only the additional premises required by that proof fact

advisory key:
    implementation-owned hint context
~~~

## Motivation

The q theorem concerns ordinary future behavior.

It does not automatically preserve path-dependent NDC certificates, reserved responses, deadline assumptions not derivable from q, proof provenance, move-order history, or neural/evaluator state.

NEI and Discovery Protocols repeatedly showed that SAME under one profile must not leak into another profile.

## Implementation ideas

Use typed records such as:

~~~text
QKey(q)

ProofKey(
    q,
    proofProfile,
    extraContext
)

HintKey(
    q,
    implementationContext
)
~~~

Hashing may address storage but may not establish equality.

Proof publication must carry the profile that justifies reuse.

## Qualification

Construct negative controls where q is equal but a path-dependent certificate context differs.

The q-keyed proof cache must refuse to reuse stronger facts unless their premises are derivable from q.
