# Discovery Protocol NEI-enabled rerun — run log

**Date:** 2026-09-18  
**Control campaign:** `2026-09-18-discrepancy-protocol-campaign`  
**Rerun campaign:** `2026-09-18-nei-enabled-rerun`  
**Base authority:** Connect4 IsoGraph 1.1  
**Applied identity layer:** Connect4 NEI application 0.1

## 1. Reason for rerun

The first Discovery Protocol campaign executed before NEI was applied to the Connect4 IsoGraph.

After the NEI overlay was added, the same anomaly set was rerun to test whether identity authority materially changed discovery rather than merely adding terminology.

The intended experimental control was:

~~~text
same frozen discrepancy evidence
same authority 1.1
same Discovery Protocol family

change:
    applied NEI profile/result layer is now available
~~~

## 2. Original five branches replayed

### A — scope metadata

NEI applicability test returned `NOT_APPLICABLE`.

No identity conclusion is needed to distinguish:

~~~text
explicit metadata scope
semantic validity restriction
~~~

Result unchanged.

### B — relation-count deficits

NEI applicability test returned `NOT_APPLICABLE`.

The branch remains a representation/factorization question.

The previously falsified shared minimal-basis hypothesis stays closed.

### C — R0045 evidence hierarchy

NEI applied.

The original campaign knew:

~~~text
4 citations/artifacts
3 events
2 lineages
UNKNOWN independence
~~~

NEI added:

~~~text
the two R0045 lineages are DISTINCT under lineage identity

UNKNOWN independence
    !=
NEI UNKNOWN
~~~

The protocol then tested whether the hierarchy could be interpreted as global successive quotient maps.

That failed.

Artifact `3000222` participates in five distinct lineages:

~~~text
L-BSFP-ANTICHAIN-MTBDD-20260910
L-BSFP-LINE-HIT-PRODUCT-20260910
L-BSFP-OQS-RESIDUAL-REUSE-20260911
L-BSFP-ROLLING-SCALING-20260910
L-BSFP-COMPACT-CUDA-SCALING-20260910
~~~

Artifact `3000283` participates in two.

Therefore:

~~~text
lineage_of(artifact)
~~~

is not globally functional.

This materially refined the first campaign's "staircase" language into:

~~~text
context-scoped typed evidence incidence hierarchy
~~~

with separate identity profiles on the carriers.

### D — deductive independence applicability

NEI was used as a guard rather than the target inference.

It established that neither of these lifts is valid:

~~~text
lineage DISTINCT
    -> independent evidence

lineage SAME
    -> same event
~~~

The original branch disposition stayed the same, but its type boundary became stricter.

### E — 10/13 prose substitution

NEI returned `NOT_APPLICABLE`.

The branch remained ordinary semantic-layer/prose substitution.

## 3. New branch F — profile-mediated safe collapse

Once NEI supplied qualified SAME/DISTINCT relations, DP-38 could compare identity behavior across separate Connect4 structures.

Three instances were available:

~~~text
R0044:
    artifact identity      DISTINCT
    lineage projection    SAME

R0074:
    event identity         DISTINCT
    lineage projection    SAME

SIU-1:
    physical identity      DISTINCT
    future-behavior q      SAME
~~~

DP-10/13/14/23/25/38 produced a common structural candidate:

~~~text
fine referents remain DISTINCT
-> context/profile-specific projection
-> projected referents become SAME
-> fine residual/provenance remains represented
~~~

The global-projection version was falsified by multi-lineage artifacts.

The overclaim that all three domains use the same semantic mechanism was also rejected.

The surviving result is therefore a **profile-mediated safe-collapse structural correspondence**, not a universal identity ontology.

## 4. New branch G — standard 7x6 identity closure

Before NEI:

~~~text
7x6 quotient sufficiency remains unproved
~~~

After NEI:

~~~text
same-q future-behavior identity on 7x6
    = INCOMPLETE_UNQUALIFIED
~~~

The Discovery Protocols could now state the exact closure target.

To prove SAME on standard 7x6, establish complete exact future-behavior preservation.

To falsify it, find same-`q` physical states differing in at least one load-bearing observable:

~~~text
legal action set
terminal behavior
same-action successor q
strong score
action score
exact W/D/L
~~~

The identity gap is now a falsifiable obligation rather than a generic missing proof.

## 5. Before/after outcome

Original five branches:

~~~text
materially changed       1
precision improved       1
unchanged / NEI N/A      3
~~~

New branches enabled:

~~~text
profile-mediated identity-collapse correspondence   1
precise 7x6 identity-closure target                 1
~~~

New false interpretation killed:

~~~text
global artifact -> event -> lineage quotient staircase
~~~

## 6. Process change discovered

The rerun showed that simply invoking NEI on every discovery branch would be wasteful and conceptually dangerous.

The local Discovery Protocol execution contract was therefore extended with an explicit applicability gate:

~~~text
NOT_APPLICABLE
GUARD_ONLY
APPLIED
CENTRAL
~~~

The machine schema now requires `nei_applicability` whenever a campaign declares an NEI layer.

Validation:

~~~text
DP-only control:
    5 runs
    valid

NEI-enabled rerun:
    7 runs
    valid
~~~

## 7. Conclusion

NEI made a material difference, but only where identity was genuinely load-bearing.

Its largest contribution was not "more SAME results."

It was stronger control over **which sameness question was being asked**.

The rerun exposed:

1. a false global quotient interpretation that DP alone had not rejected;
2. a reusable cross-domain identity-collapse motif;
3. a precise identity-specific 7x6 falsification target;
4. a clean boundary between identity uncertainty and unrelated unknown properties.

Final disposition:

~~~text
NEI_EFFECT_ON_DISCOVERY = MATERIAL_BUT_SCOPED
~~~


---

# 8. Final integrity

Final Connect4 research head:

`b180fbc194edb65348502fb5a07c9e02138a8865`

Frozen authority/evidence blobs remained unchanged:

~~~text
authority 1.1 manifest              986f10a0011059e4d19598de6c836272c102415d
candidate 1.1 manifest              0b3c54f193b084e2e5dd2eb7f4fb641b1052491a
cold report                         189a15b790f91c65eed49154cd9839dec21364d8
original cold adjudication          0c191314a83dc2d3f5a28fedc1e7d710701844ca
final qualification review          251926dda0f724fb2c64cc7f902875f8e579e2c1
NEI JSON results                    5639078d95fd871c834fc2ff93185e8ccac9b93f
NEI native results                  9d68c3e4fbd1df302512f03bd244eaca022df311
~~~

Campaign validation:

~~~text
DP-only control:
    runs  = 5
    valid = true

DP + NEI rerun:
    runs  = 7
    valid = true
~~~

The rerun changed only derived research/process surfaces. No authority-1.1 semantic artifact was mutated.

**NEI_ENABLED_DISCOVERY_RERUN_INTEGRITY = PASS**
