# Historical whole-remediation review

This review covers the producer remediation cycle preceding rc.5 promotion.
Its final labels and test totals belong to that cycle, not the current package.
See [the promotion review](promotion-20261006/REVIEW.md)
and [promotion record](promotion-20261006/README.md)
for the shipped source `8b81911` and later qualification.

Read-only reviewer inspected6792395..1c7b64f, plan and NEES authority without
running tests or competing solvers. No Critical finding or demonstrated solver
result regression. Two Important integrity findings were verified and fixed:

1. validateCycleSymbols skipped activeCycleExpression and unboundedTerms.
The new regression failed before the fix and passed afterward. All three fields
now checked, plus operation counts. Existing PARK_DURATION is explicitly declared
as an unbounded scheduler duration rather than exempted or priced at zero.

2. Materialized result ledger missed affinity Array.from/callback/object/atomic
work. Actual source callback execution on Windows/Linux/macOS now independently
matches the explicit subledgers: five loads per Windows/Linux worker, four macOS.
The regression failed for missing bound callbacks then passed. State readiness
callbacks and native every(Boolean) also explicitly accounted and rooted.

Final fix pass:490tests passed,0failed,1GC-only skip; GC-specific release test
was separately executed and passed.651ledger units,573enforced graph units.
No runtime source change from1c7b64f in the review fix pass.

Reviewer found no separate minor issue. Declined performance causality, machine
boxing elimination, immediate RSS/compiled-plan GC, exhaustive game correctness
and complete NEES conformance. Ruling: preserve bounded claims and report these
limits; tests/code samples cannot establish those stronger properties. Cost if
wrong: users overestimating qualification; no global certificate is issued.

Historical rc.4 remains immutable and older. This review assessed producer
candidate fixes on the work branch. Package/main promotion was a later, separate
step and is documented in the linked promotion record.
