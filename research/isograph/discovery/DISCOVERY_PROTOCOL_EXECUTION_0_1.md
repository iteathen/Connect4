# Connect4 Discovery Protocol Execution Contract — 0.1

**Status:** local research-process contract  
**Semantic authority:** none  
**Owner:** `research/semantic-quotient`  
**Applies to:** Connect4 use of the IsoGraph Discovery Protocols

This contract operationalizes the IsoGraph Discovery Protocols for live Connect4 research.

It does not add semantic authority and does not replace the IsoGraph Discovery Protocol specifications.

## Trigger

Open a Discovery Protocol run when at least one of these is present:

- a material discrepancy whose qualification disposition does not explain all observed structure;
- a residual between otherwise matched structures;
- a repeated unexplained count/layer/identity shift;
- a plausible hidden distinction;
- a plausible hidden scoped equivalence;
- a source-native unknown whose topology may itself be useful;
- an attractive quotient/compression that needs falsification before adoption.

Do not open a discovery run for an already-proved mechanical typo unless the anomaly leaves a separate structural question.

## Input freeze

Before interpretation, record:

~~~text
authority/revision
source/reconstruction path
raw observation A
raw observation B
queried subject
requested predicate/quantity
scope/view
representation layer
aggregation level
closure/completeness assumptions
qualification disposition if already known
~~~

Existing frozen evidence may satisfy this requirement.

## Semantic alignment gate

Before comparing values, answer as applicable:

~~~text
same subject/anchor?
same predicate/quantity?
same scope/guard?
same representation layer?
same aggregation level?
same authority/revision?
same closure assumptions?
~~~

If not aligned, record the mismatch itself as a discovery input.

## NEI applicability gate

Before protocol expansion, classify whether the branch actually requires an identity conclusion.

Record one of:

~~~text
NOT_APPLICABLE
    no referent merge/distinctness/identity claim is needed

GUARD_ONLY
    NEI constrains invalid inference between identity and another property,
    but NEI is not the target conclusion

APPLIED
    an explicit NEI profile/result directly resolves a load-bearing identity question

CENTRAL
    identity itself is the main discovery target and DP-38/NEI drive the branch
~~~

Do not invoke NEI merely because two values differ or two structures correspond.

When NEI is applied, preserve the exact profile/scope/evidence revision. A result under one identity profile does not silently transfer to another.

## Protocol selection

Choose the smallest high-information subset of Discovery Protocols suggested by the observation.

Typical anomaly routing:

~~~text
explicit vs derived                    -> DP-23, DP-36
partial common core + residual         -> DP-08
possible alternative decomposition     -> DP-07
role match under different labels      -> DP-10
invariant across variants              -> DP-11
proof/evidence support topology         -> DP-24
possible refinement                    -> DP-25
possible redundant representation      -> DP-36
equivalent constraint closures         -> DP-37
identity question                      -> DP-38 / NEI
unknown topology                        -> DP-05/12/39 as applicable
~~~

Protocol ranking guides search; it does not supply proof authority.

## Candidate record

Every nontrivial candidate explanation records:

~~~text
candidate_id
observation
protocols_invoked
candidate_statement
scope
immediate_neighborhood_checked
falsifier
falsifier_result
residual
lifecycle
qualification_disposition
discovery_disposition
authority_effect
nei_applicability when the applied NEI layer exists
~~~

Lifecycle uses the Discovery Protocol vocabulary:

~~~text
LEAD
CANDIDATE
SUPPORTED_CANDIDATE
QUALIFIED_CLAIM
REJECTED
DORMANT
~~~

Connect4 discrepancy bookkeeping additionally uses:

~~~text
NO_STRUCTURAL_LEAD
OPEN_STRUCTURAL_LEAD
STRUCTURE_ESTABLISHED
STRUCTURAL_LEAD_FALSIFIED
~~~

These are discovery states, not theorem statuses.

## Minimum expansion burden

Before promoting a discovered correspondence beyond LEAD:

1. verify the immediate role/value relation;
2. inspect at least one load-bearing adjacent dependency where available;
3. inspect attached scope/constraint/boundary;
4. seek one concrete falsifier;
5. preserve the residual.

Do not expand globally when a local breaker already falsifies the candidate.

## Falsification-first rule

An attractive explanation should be attacked before it is elaborated.

Useful falsifiers include:

- a second case that should match but does not;
- a relation type the proposed quotient cannot preserve;
- a scope/guard difference;
- a provenance or authority mismatch;
- a counterexample realization;
- an owner/layer mismatch;
- an exact reconstruction failure.

A falsified hypothesis is retained as negative discovery evidence when it is likely to recur.

## Unknown handling

Unknown does not authorize collapse.

When required authority/closure is missing:

~~~text
leave unresolved
preserve the unknown structure
do not infer SAME
do not infer DISTINCT
do not convert missing authority into semantic UNKNOWN
~~~

If qualified QU/NEI semantics apply, use them explicitly.

## Dual disposition rule

Every material discrepancy preserves:

~~~text
qualification_disposition
discovery_disposition
~~~

Examples:

~~~text
qualification: DECODER_COUNT_ERROR
discovery: STRUCTURE_ESTABLISHED
~~~

~~~text
qualification: DECODER_PROSE_SLIPPAGE
discovery: NO_STRUCTURAL_LEAD
~~~

Qualification closure never silently closes discovery.

Discovery interest never excuses a qualification defect.

## Integration

A completed discovery run must:

1. preserve its campaign narrative;
2. preserve a machine-readable ledger;
3. update the originating discrepancy/open-question disposition;
4. index durable findings;
5. route material current-state consequences through STATUS/next_step when appropriate;
6. identify whether a successor IsoGraph authority revision should ingest the result.

A Discovery Protocol result does not modify current semantic authority merely by being recorded.

## Stop conditions

A branch may stop when:

- structure is established for the scoped question;
- the candidate is falsified;
- no structural lead survives;
- required authority is unavailable;
- expected information value is too low relative to cost.

Use DORMANT for unresolved cost-bounded stops.

Do not keep a branch open simply because it is interesting.

## Working rule

~~~text
observe
-> align
-> select protocol
-> generate candidate
-> inspect neighborhood
-> falsify
-> preserve residual
-> classify
-> integrate
~~~

The objective is neither maximum skepticism nor maximum pattern finding.

The objective is to expose real structure while making unsupported collapse difficult.
