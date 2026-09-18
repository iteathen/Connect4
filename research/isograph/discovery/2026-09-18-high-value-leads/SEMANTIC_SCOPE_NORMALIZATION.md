# High-value lead investigation — semantic scope normalization

**Date:** 2026-09-18  
**Lead:** exact semantic-scope derivation from Connect4 claim structure  
**Status:** structural gap established; successor normalization rule proposed  
**Authority effect:** none

## Question

Can semantic validity scope be derived exactly from the current Connect4 canonical claim fields, instead of relying on prose interpretation?

## Whole-corpus audit

The current canonical bridge contains 74 claims.

Structured scope representation:

~~~text
explicit `scope` field                    31
nonempty `guards` field                    8
either explicit scope or guards             39
neither                                      35
~~~

By status:

~~~text
empirically_supported   26 total / 13 explicit scope / 13 neither
guarded_exact            7 total /  5 explicit guards /  2 neither
deductive_exact          23 total / 18 scope-or-guards / 5 neither
~~~

Two `guarded_exact` claims have no structured guard field:

- C4-R0005;
- C4-R0054.

Thirteen empirically supported claims have no explicit scope field, including:

- C4-R0010;
- C4-R0021;
- C4-R0022;
- C4-R0024;
- C4-R0025;
- C4-R0026;
- C4-R0027;
- C4-R0028;
- C4-R0029;
- C4-R0030;
- C4-R0033;
- C4-R0034;
- C4-R0056.

Their statements nevertheless contain load-bearing bounded conditions such as measured workloads, complete controls, frozen anchors, tested forms, sampled roots, or a named external coordinate set.

## Consequence

An exact function of the form:

~~~text
semantic_scope(claim)
    =
f(explicit scope field, guards field)
~~~

does **not** exist for the current representation.

R0054 is the strongest direct counterexample:

~~~text
status = guarded_exact
scope field = absent
guards field = absent

statement begins:
"For a decisive W x H Connect-4 root
 with distance-optimal terminal move T..."
~~~

The semantic validity condition exists in the proposition but is not normalized into the structured scope/guard fields.

R0010 and R0034 show the analogous empirical case: the claim itself is about a measured/tested implementation regime, but the structured claim has no `scope` field.

## Hidden distinction discovered

The current single notion of "scope" is itself under-factored.

At least four different roles occur:

~~~text
claim domain / truth-condition scope
    where the proposition says it applies

guards / preconditions
    conditions that must hold for the proposition to be exact

evidence coverage
    the experiments/controls/workloads actually observed

anti-lift exclusions
    explicit statements of what the evidence/theorem does not establish
~~~

These are related but not identical.

For example, an empirical result may have:

~~~text
claim domain:
    a particular implementation family

evidence coverage:
    selected measured workloads

anti-lift exclusion:
    not a universal complexity theorem
~~~

Collapsing all three into one free-text `scope` field loses useful structure.

## Proposed successor normalization

Represent semantic scope as a typed constraint record:

~~~text
SemanticScope(C) = {
    claim_domain,
    guards,
    evidence_coverage,
    exclusions
}
~~~

Each component may be empty, but load-bearing restrictions must be represented in the appropriate component.

### Guarded exact requirement

For a claim classified `guarded_exact`:

~~~text
guards must be structurally recoverable
~~~

either directly or through a qualified exact derivation.

A guarded theorem whose guard exists only in prose is under-normalized.

### Empirical requirement

For `empirically_supported`:

~~~text
evidence_coverage must be explicit
~~~

even if the claim-domain scope is broader.

This prevents:

~~~text
evidence scope
    ==
claim truth scope
~~~

from being assumed merely because both are informally called scope.

### Serializer field

The mechanical predicate:

~~~text
explicit_scope_field_present
~~~

should remain a valid representation-level predicate.

It must not be reused as the semantic predicate:

~~~text
claim has restricted validity
~~~

## Reinterpretation of the original decoder anomaly

The cold decoder was mechanically wrong when it returned `scope_present=true` for a record with no explicit field.

But the discrepancy was not arbitrary.

For R0010/R0034/R0054 it pointed toward semantic restrictions that genuinely existed outside the explicit field.

Thus:

~~~text
qualification:
    decoder field extraction error

discovery:
    structured semantic-scope normalization is incomplete
~~~

Both are true.

## Falsifiers considered

### "Every empirically supported claim requires the same claim-domain restriction"

Rejected.

Empirical evidence coverage is always bounded by its evidence, but the intended proposition may have a broader domain. Evidence scope and claim scope must stay separate.

### "Status alone can generate exact scope"

Rejected.

`guarded_exact`, `empirically_supported`, and `deductive_exact` do not encode the actual geometry/workload/guard values.

Status identifies an epistemic mode, not the full semantic scope.

## Disposition

~~~text
LEAD_2_SEMANTIC_SCOPE_DERIVATION
    = STRUCTURE_ESTABLISHED

exact derivation from current structured fields
    = IMPOSSIBLE IN GENERAL

successor requirement
    = typed scope normalization

remaining open work
    = extraction/qualification of scope atoms from legacy prose
~~~
