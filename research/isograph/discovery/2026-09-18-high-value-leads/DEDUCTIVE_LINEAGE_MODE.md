# High-value lead investigation — deductive evidence-lineage mode

**Date:** 2026-09-18  
**Lead:** derive when empirical-independence applicability is `not_applicable_deductive`  
**Status:** current-corpus structure established; general rule remains a typed-successor candidate  
**Authority effect:** none

## Question

Can the explicit lineage field:

~~~text
independence_status = not_applicable_deductive
~~~

be derived from evidence/proof topology rather than manually asserted?

## Current evidence graph

Authority 1.1 contains 10 evidence lineages.

Observed partition:

~~~text
8 empirical/reproduction lineages
2 deductive-only lineages
~~~

The eight empirical/reproduction lineages all contain at least one event with a concrete run/workflow identity and an empirical/qualification/scaling/falsification/reproduction role.

The two deductive lineages are:

~~~text
L-REALIZABILITY-DERIVATION-20260916
L-STRUCTURAL-SELECTION-DERIVATION-20260916
~~~

Both have:

~~~text
one derivation/structural-analysis event
no empirical run/workflow identity
a normalized_derivation artifact
independence_status = not_applicable_deductive
~~~

No other lineage has that combination.

## Current-corpus classifier

The following candidate classifier separates all 10 current lineages:

~~~text
DeductiveOnly(L) :=
    every evidence-bearing event is deductive/derivational
    AND no event is an empirical run/measurement
    AND the lineage contains normalized proof/derivation evidence
~~~

On the frozen graph:

~~~text
DeductiveOnly = true
    exactly for the 2 not_applicable_deductive lineages

DeductiveOnly = false
    for all 8 empirical/reproduction lineages
~~~

There are zero current counterexamples.

## Important mixed-lineage control

The compact-CUDA R0045 lineage contains:

- one empirical CUDA qualification/scaling event;
- one derived saturation/winspace review event.

The existence of a derived review does **not** make the lineage deductive-only.

This is a necessary negative control.

A rule such as:

~~~text
contains a derivation
    -> independence not applicable
~~~

is false.

The correct question concerns the topology of the evidence-bearing lineage as a whole.

## Why claim status cannot own this property

The original cold decoder tried to generalize deductive inapplicability from claim semantics.

That failed.

For example C4-R0016 was included even though it is `empirically_supported`.

Evidence independence concerns whether empirical observations may be counted as statistically independent support.

Therefore the property belongs to:

~~~text
evidence-event / evidence-lineage topology
~~~

not:

~~~text
claim epistemic status
~~~

## Current representation limitation

The candidate classifier above is not yet an exact machine rule because the graph encodes much of its evidence mode through:

- free-text event-kind bytes;
- artifact relation labels such as `normalized_derivation`;
- presence/absence of run identifiers.

Those cues classify the current graph perfectly, but they are not a clean typed semantic contract.

## Proposed typed successor field

Add an explicit lineage/event evidence mode:

~~~text
evidence_mode:
    empirical
    deductive_only
    mixed
~~~

Then derive applicability:

~~~text
deductive_only
    -> empirical independence = NOT_APPLICABLE

empirical
    -> independence relation required/meaningful

mixed
    -> independence applies to empirical event components;
       deductive derivations are not counted as independent trials
~~~

A mixed lineage must not inherit `not_applicable_deductive` merely because some artifacts are derivations.

## NEI guard

The NEI-enabled rerun also established:

~~~text
lineage DISTINCT
    != statistically independent

lineage SAME
    != same evidence event
~~~

Identity and independence remain separate dimensions.

## Falsification burden for generalization

Before promoting the typed rule beyond the current corpus, test:

1. a mixed empirical + deductive lineage;
2. two empirical events derived from one raw run;
3. one proof independently rederived by two formal routes;
4. one empirical reproduction with shared implementation/oracle;
5. one lineage with no run ID but still empirical evidence.

The rule must classify evidence semantics, not merely filename/run formatting.

## Disposition

~~~text
LEAD_20_DERIVED_INDEPENDENCE_APPLICABILITY
    = CURRENT-CORPUS STRUCTURE ESTABLISHED

current 10-lineage classifier
    = PERFECT SEPARATION

general automatic derivation
    = SUPPORTED CANDIDATE

successor requirement
    = typed evidence_mode + mixed-lineage controls
~~~
