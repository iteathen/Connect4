# High-value lead investigation — contextual identity spans

**Date:** 2026-09-18  
**Leads:** profile-mediated safe collapse; context-dependent identity projection  
**Status:** structural refinement established  
**Authority effect:** none

## Trigger

The NEI-enabled rerun showed that the original phrase:

~~~text
artifact -> event -> lineage quotient staircase
~~~

was too strong.

The evidence graph is not globally functional in that direction.

## Evidence-graph census

Authority 1.1 contains:

~~~text
artifact incidence records              26
unique underlying artifact objects      21
~~~

Repeated underlying artifacts:

~~~text
object 3000222:
    5 incidence records
    5 different lineages
    4 claims

object 3000283:
    2 incidence records
    2 different lineages
    4 claims
~~~

The strongest case is object `3000222`, the normalized BSFP representation-algebra artifact.

For R0045 alone, that same artifact participates in **two different lineages**.

Therefore neither of these is sufficient to select a lineage uniquely:

~~~text
artifact identity
(artifact identity, claim identity)
~~~

## Native representation clue

The native evidence graph already creates separate lineage-local nodes for repeated uses of the same underlying artifact.

Those nodes are connected to:

- one lineage;
- one underlying corpus-object SI;
- one lineage-local relation role.

So the representation already contains two distinct concepts even though the vocabulary currently calls the lineage-local record an "immutable evidence artifact":

~~~text
underlying immutable artifact object
lineage-local artifact incidence/occurrence
~~~

Those should be named separately in a successor vocabulary.

## Correct general shape

The most general structure is not a quotient function from artifact objects to lineages.

It is a contextual incidence span:

~~~text
              occurrence / anchor i
             /                    \
            v                      v
     fine referent F          scoped referent V
~~~

For evidence:

~~~text
artifact-lineage occurrence
    -> underlying artifact object
    -> parent evidence lineage
~~~

For solver state:

~~~text
state observation
    -> physical state
    -> relational future-behavior q
~~~

The SIU case happens to be functional from physical state to q.

The evidence case is not globally functional from artifact object to lineage, but it becomes single-valued after choosing the incidence occurrence.

Thus a quotient function is a **special case** of the more general anchored correspondence.

## Identity statement

The reusable NEI/DP pattern is:

~~~text
fine referents x,y may be DISTINCT

choose lawful contextual anchors i_x, i_y

project the anchors into scoped carrier V

NEI_V(view(i_x), view(i_y)) may be SAME

fine identity/provenance of x,y remains represented
~~~

This supports safe semantic collapse without rewriting the fine carrier.

## Why this is stronger than the earlier motif

The earlier candidate said:

~~~text
fine DISTINCT
-> projection
-> coarse SAME
~~~

The refined form explains when "projection" is legal.

If one fine referent may participate in several coarse identities, the mapping requires an occurrence/context anchor.

Without that anchor, the projection is ambiguous and the identity query is incomplete.

## Vocabulary correction candidate

Split the current evidence concept into:

~~~text
evidence_artifact_object
    immutable underlying artifact identity

artifact_lineage_occurrence
    one contextual use/incidence of that artifact in one evidence lineage

artifact_role_in_lineage
    normalized_summary | detailed_report | reproducer | ...
~~~

Then the exact projections become:

~~~text
artifact_lineage_occurrence -> evidence_artifact_object
artifact_lineage_occurrence -> evidence_lineage
~~~

Both are functional.

The problematic global projection:

~~~text
evidence_artifact_object -> evidence_lineage
~~~

is not required.

## Relation to NEI query anchors

This matches NEI's existing principle that query anchors establish which local carriers instantiate the queried represented roles without themselves asserting natural identity.

The Connect4 evidence graph supplies a concrete real-world reason those anchors matter.

## Profile-mediated safe collapse

The high-value lead is therefore refined from:

~~~text
profile-mediated quotient
~~~

to:

~~~text
profile-mediated identity through a contextual correspondence span
~~~

Functional quotienting remains available where the context guarantees one image.

## Falsifiers

### One global artifact-to-lineage function

Falsified by object 3000222.

### Artifact + claim uniquely determines lineage

Falsified by R0045, where object 3000222 participates in both R0045 lineages.

### Coarse SAME erases fine identity

Falsified by every applied NEI result: artifact/event/physical provenance survives.

### All applications use the same semantic mechanism

Rejected. Evidence identity uses incidence/provenance structure; SIU uses future-behavior transition semantics.

Only the correspondence shape is shared.

## Disposition

~~~text
LEAD_32_PROFILE_MEDIATED_SAFE_COLLAPSE
    = REFINED / SUPPORTED STRUCTURAL CORRESPONDENCE

LEAD_36_CONTEXT_DEPENDENT_IDENTITY_PROJECTION
    = STRUCTURE ESTABLISHED

global source->coarse quotient requirement
    = FALSIFIED

successor representation opportunity
    = explicit contextual occurrence/anchor nodes
~~~
