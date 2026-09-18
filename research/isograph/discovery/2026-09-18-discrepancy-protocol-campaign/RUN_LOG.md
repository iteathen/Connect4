# Discovery Protocol Campaign Run Log — 2026-09-18

**Campaign:** Connect4 authority-1.1 discrepancy discovery  
**Owner:** `research/semantic-quotient`  
**Purpose:** preserve the complete first live execution history of the IsoGraph Discovery Protocols on a qualified corpus  
**Semantic authority changed:** no

This log is chronological process evidence. The semantic/discovery results are summarized in `CAMPAIGN.md`; the machine state is in `DISCOVERY_LEDGER.json`.

---

## 0. Starting state

Connect4 canonical research head before the Core-0.18 sanity correction campaign:

`ab638ed92b3082dd0fdd0918869c5cc91f2465f5`

Core-0.18 post-hoc sanity audit merged as:

`49d94cdd56f5a85a8c74e18a099cd559466d9aa5`

That audit established:

- authority 1.1 representation compatible with Core-0.18 ideals;
- no semantic repair required;
- old adjudication had a process gap because qualification and discovery dispositions were not separately retained.

No frozen authority file was changed.

---

## 1. Operational observation-first correction

A live machine-readable discrepancy disposition record was created:

`d6f8e49260b1ee0517d87cfbc839c38d265aba39`

File:

`research/isograph/qualification/DISCREPANCY_DISCOVERY_DISPOSITIONS_1_1.json`

It preserved the original qualification findings while opening four possible structural leads and closing the 10/13 prose slip provisionally.

The operating guidance was then changed so future research must use dual dispositions:

- `fc98bbe759b996770c1adc0bd7d11607fd2f4ebf` — root AGENT_LOCAL observation-first rule;
- `be3b30632417fef81f3e91a944ca00151db72b4c` — research AGENTS dual-disposition rule;
- `d8e12662b0df24b7069b7ea96ad44bdd5e568876` — research README;
- `b6a535a1c809f6242ab92c6f27321657723e7af8` — STATUS routing;
- `99b41db8613bef1d1f9dd8dbf54e8033446ed881` — next_step execution rule.

This commit became the frozen starting point for the actual Discovery Protocol campaign.

---

## 2. Protocol authority/guidance loaded

The cumulative Discovery Protocol stack was read from IsoGraph:

~~~text
DP 0.1 blob 4274ac72f42ff9b68aea491882194ca258bf8344
DP 0.2 blob d831321771be6c85c4b2dd2f96ed86ecef151927
DP 0.3 blob 952c33d5229ffd5db2e976d25706e0bb5eedd39d
DP 0.4 blob 32b6dbccbd3d3d78864ff46d93a3fd53ee559abd
DP 0.5 blob c9328ac762d4573480ea6292d1c3775ad58b0b81
Core 0.18 blob f092962900f7e8ff28517458e23df48285d7e9ad
~~~

DP 0.5 and Core 0.18 were unqualified successor candidates and were used as directed research guidance, not retroactive qualification authority.

High-priority protocol sections used:

- DP-07 alternative factorization;
- DP-08 residual discovery;
- DP-10 role correspondence;
- DP-23 reconstruction structure;
- DP-24 proof/witness topology;
- DP-25 refinement;
- DP-36 representation redundancy;
- DP-37 equivalent closure;
- DP 0.4 cross-residual promotion/falsification;
- DP 0.5 discrepancy preservation, semantic quantity alignment and derived-vs-explicit investigation.

---

## 3. Connect4 evidence loaded

The campaign read the frozen/live authority surfaces required for the four open leads:

- authority 1.1 manifest;
- candidate manifest;
- cold report;
- cold score;
- original cold adjudication;
- final qualification review;
- evidence-lineage graph;
- local INCOMPLETE_SCOPE bridge;
- relevant legacy claim-registry bridge records for already-authoritative claim identities.

Claims inspected in detail included:

~~~text
C4-R0010
C4-R0015
C4-R0016
C4-R0018
C4-R0034
C4-R0045
C4-R0052
C4-R0054
C4-R0060
C4-R0062
C4-R0063
C4-R0070
C4-R0071
~~~

Supporting neighboring claims were inspected when needed for relation/dependency falsification.

---

# Lead A execution — scope metadata vs semantic validity scope

## A1. Raw discrepancy

Cold decoder:

~~~text
R0010 scope_present = true
R0034 scope_present = true
R0054 scope_present = true
~~~

Canonical explicit field:

~~~text
false
false
false
~~~

## A2. Quantity alignment

The requested mechanical quantity was:

~~~text
explicit "scope" field exists?
~~~

The claim statements themselves contain limiting language.

R0054 is the strongest case because its proposition is explicitly conditional on:

~~~text
decisive W x H root
distance-optimal terminal move T
~~~

R0010 and R0034 are explicitly bounded to measured/tested/current implementation contexts.

## A3. Discovery candidate

~~~text
explicit_scope_field_present
    !=
semantic_validity_restriction_present
~~~

## A4. Falsifier

The stronger candidate:

~~~text
decoder sets true whenever semantic scope exists
~~~

was tested against the same cold inventory.

Guarded/bounded claims exist that the decoder still marked `scope_present=false`.

## A5. Disposition

~~~text
STRUCTURE_ESTABLISHED:
    explicit metadata and semantic validity restriction are distinct predicates

FALSIFIED:
    universal decoder rule based solely on semantic boundedness

OPEN:
    exact derivation/normalization relation
~~~

No canonical scope field was changed.

---

# Lead B execution — relation-count deficits

## B1. Raw discrepancy

~~~text
R0015  2 -> 1
R0016  2 -> 1
R0052  6 -> 5
~~~

## B2. Explicit structures inspected

R0015:

~~~text
defines -> winspace-basis
supports -> R0016
~~~

R0016:

~~~text
derived_from -> R0015
supports -> R0018
~~~

R0052:

~~~text
refines -> R0011
depends_on -> R0014
depends_on -> R0018
bridges -> R0049
bridges -> R0050
bridges -> R0051
~~~

## B3. Candidate quotient tests

### Drop `supports`

Fits R0015/R0016.

Fails R0052 because it has no `supports` edge.

Rejected.

### Count unique relation types

Predicts:

~~~text
2 / 2 / 3
~~~

not:

~~~text
1 / 1 / 5
~~~

Rejected.

### Count claim-ID targets only

Predicts:

~~~text
1 / 2 / 6
~~~

Rejected.

### Collapse reciprocal support/dependency

Can explain at most part of the R0015/R0016 neighborhood.

Cannot explain R0052.

Rejected as a common explanation.

## B4. Disposition

No shared exact generating basis is supported.

~~~text
STRUCTURAL_LEAD_FALSIFIED
~~~

The branch closes as ordinary decoder omission/counting error unless new edge-specific evidence appears.

This was retained as negative discovery evidence because the identical `actual - 1` pattern is visually seductive and likely to be rediscovered.

---

# Lead C execution — R0045 evidence staircase

## C1. Raw discrepancy

Canonical claim source citations:

~~~text
4
~~~

Cold decoder source count:

~~~text
3
~~~

Evidence lineages:

~~~text
2
~~~

The number 3 had not previously been explained.

## C2. Evidence graph decomposition

Distinct source artifacts:

1. representation-algebra normalized summary;
2. rolling-rank detailed report;
3. compact-CUDA vertical-slice report;
4. saturation/winspace derived review.

Therefore:

~~~text
citation/artifact count = 4
~~~

Events:

1. rolling-rank scaling;
2. compact-CUDA Q1 qualification/scaling;
3. saturation/winspace inference review derived from event 2.

Therefore:

~~~text
event count = 3
~~~

Lineages:

1. rolling-rank lineage;
2. compact-CUDA lineage.

Therefore:

~~~text
lineage count = 2
~~~

Cross-lineage independence remains:

~~~text
UNKNOWN
~~~

## C3. Discovery moment

The previously unexplained decoder value is exactly the authoritative event count:

~~~text
4 citations/artifacts
-> 3 events
-> 2 lineages
-> UNKNOWN independence
~~~

This is a live multi-cardinality instance of the evidence identity hierarchy discovered from R0044.

## C4. Falsifier

The immediate breaker would be an authoritative R0045 graph with event count != 3.

No such breaker exists in authority 1.1.

## C5. Disposition

~~~text
STRUCTURE_ESTABLISHED:
    4 / 4 / 3 / 2 evidence staircase

SUPPORTED_CANDIDATE:
    decoder substituted event layer for requested source/citation layer

NOT CLAIMED:
    hidden model reasoning is known
~~~

This was the strongest positive discovery of the campaign.

---

# Lead D execution — deductive independence applicability

## D1. Raw discrepancy

Explicit evidence graph has two lineages marked:

~~~text
not_applicable_deductive
~~~

covering exactly:

~~~text
R0060
R0062
R0063
R0070
R0071
~~~

The decoder generalized far beyond those five claims.

## D2. Ownership inspection

In authority 1.1:

~~~text
independence_status
~~~

is a property of the evidence lineage.

It is not defined as a function of claim status.

## D3. Falsifier

The decoder included:

~~~text
R0016
~~~

despite R0016 being `empirically_supported`.

That defeats a claim-status-only derivation.

## D4. Disposition

~~~text
STRUCTURE_ESTABLISHED:
    independence applicability belongs to lineage/evidence topology

FALSIFIED:
    claim-status-only derivation

OPEN:
    exact derived lineage predicate from proof/evidence topology
~~~

---

# Lead E execution — 10/13 prose slip

The authority already represents:

~~~text
10 lineages
13 events
~~~

as different first-class quantities.

The decoder's prose swapped the event count into the lineage label.

No additional structural level was needed to explain it.

Disposition:

~~~text
NO_STRUCTURAL_LEAD
~~~

This remains ordinary summarization substitution.

---

# Cross-case synthesis

The campaign then compared the surviving branches rather than stopping at per-case outcomes.

A recurring shape emerged:

~~~text
requested typed observation at layer L
    ->
observer answers at adjacent semantic layer L'
    ->
answer is meaningful in the system
    but wrong for the requested contract
~~~

Examples:

~~~text
explicit metadata -> inferred semantic restriction
citation/artifact count -> event count
lineage-level applicability -> claim-level semantic generalization
event count -> lineage prose label
~~~

This produced two supported cross-case candidates:

1. **semantic-layer substitution** as a recurring cold-reconstruction failure mode;
2. **typed observation coordinates** requiring subject, quantity, layer, aggregation, scope, authority and closure before direct comparison.

No global model-behavior theorem is claimed.

---

# 4. Campaign publication

Human campaign narrative created:

`26838d1cdd6bad76ad84a9024ae1e867febc6d4d`

Machine ledger created:

`6a89afdbba3e6ae9f9cb306ad77c1e019975dbee`

Discovery results were integrated back into the live discrepancy record:

`092cc664b19bbb3e18045885f08b2be2b701d50d`

---

# 5. Routing/integration

The campaign was made durable in repository routing:

- `375692a44936f7063e5de3333f86200fc20a3289` — research index;
- `c7ecb93eb7de56de111d8834cadfcbcffdef1ba8` — STATUS;
- `4f1aec293b9e163aabc36f2737faea4bf36e8320` — next_step required context.

No authority-1.1 semantic file was touched.

---

# 6. Reusable implementation

A reusable Connect4 execution contract was added:

`ece7e001a698b11df21de22372372df22a6642a3`

File:

`research/isograph/discovery/DISCOVERY_PROTOCOL_EXECUTION_0_1.md`

A machine schema for future ledgers was added:

`e39887fe405e0653cab6bd8a32dad2d4d364bf75`

File:

`research/isograph/discovery/DISCOVERY_PROTOCOL_RUN_SCHEMA_0_1.json`

The first campaign ledger was then normalized to that contract:

`70ae17cac29e85420cb44eadfaa980d34bf9f708`

Mechanical validation found two missing process fields:

- R0045 branch lacked an explicit residual;
- the closed 10/13 branch lacked a recorded falsified hypothesis.

The schema was **not** weakened.

The ledger was repaired:

`0f45d850ea3198aa177b7faf0b068c1665d748d5`

and revalidated with:

~~~text
run_count = 5
errors = []
valid = true
~~~

This is useful process evidence: the first reference run itself was forced to satisfy the same explicit observation/falsifier/residual requirements future runs will use.

---

# Final campaign state

~~~text
positive structures established        3
supported cross-case candidates        2
attractive structural hypothesis killed 1
ordinary error branch closed           1
authority semantic mutations           0
ledger schema validation               PASS
~~~

The campaign therefore produced all important protocol outcomes:

- discovery;
- falsification;
- bounded unresolved residue;
- ordinary-error closure;
- reusable process implementation.

The protocols did not merely find patterns.

They also prevented a false pattern from being promoted.


---

# 7. Upstream IsoGraph feedback

The completed campaign was fed back into the IsoGraph repository as real-world development evidence for the Core 0.18 / DP 0.5 successor stack.

IsoGraph evidence record commit:

`159d18a91ed3238e2b6ca985729b684bffbbec3d`

File:

`qualification/REAL_WORLD_DISCOVERY_PROTOCOL_EVIDENCE_CONNECT4_2026-09-18.md`

IsoGraph STATUS routing commit:

`8208cf659e65f162649a14cea1d7d80511bf4200`

The upstream record explicitly states:

- this campaign is development evidence;
- it does not promote Core 0.18 or DP 0.5;
- future holdouts must use independent structurally analogous cases;
- the Connect4 findings must not become hidden oracle material.

This closes the discovery feedback loop:

```text
specification
-> live application
-> discovery/falsification evidence
-> reusable local execution machinery
-> upstream qualification-design evidence
```
