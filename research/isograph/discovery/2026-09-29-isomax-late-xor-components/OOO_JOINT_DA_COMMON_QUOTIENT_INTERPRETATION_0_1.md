# EW-RS-078: a realizability constraint preserves common direction

This is a structural finite-alphabet result, internally qualified by exhaustive enumeration and a separate graph-traversal verifier. It is not scalar qualification or a closed syndrome law. `research/semantic-quotient` remains the durable research owner; the experimental and foundational branches are staging surfaces.

## Question and construction

RS-077 leaves four incomparable D/A carriers: TOTAL/SIGNED_NET, SIGNED_NET/TOTAL, ABS_NET/SEPARATED, and SEPARATED/ABS_NET. C retains its common active-sign-support cardinality. Rather than select one carrier or guess coefficients, RS-078 constructs the most informative deterministic pair quotient obtainable from **each** carrier.

On a fixed source domain, join the four equality relations transitively. The resulting connected-component label factors every carrier. Conversely, any function factoring every carrier is constant on each generating equality and therefore on each component. This proves the universal property within the declared finite domain; it does not prove scalar sufficiency.

## The domain is load-bearing

For one sign, the original owner-channel counts satisfy `D=x+y` and `A=|x-y|`. Thus `D>=A` and `D-A` is even. Conversely those conditions yield nonnegative integer counts `(D+A)/2` and `(D-A)/2`, up to owner exchange.

Applying the frozen saturations leaves exactly seven single-sign symbols:

`(0,0), (1,1), (2,0), (2,2+), (3+,0), (3+,1), (3+,2+)`.

The two signs therefore admit 49 bucket-feasible D/A states, compared with 144 in the unconstrained Cartesian alphabet. This is an outcome-independent restriction implied by the existing bucket definitions. It neither restores exact tails nor asserts complete board/triangle realizability.

| Source domain | States | Four carrier class counts | Common quotient classes | States distinguished from simultaneous sign reversal |
| --- | ---: | --- | ---: | ---: |
| Cartesian | 144 | 72 / 72 / 63 / 80 | 30 | 0 |
| Owner-count feasible | 49 | 40 / 40 / 39 / 42 | 31 | 16 |

Restricting the domain can **increase** the number of common quotient classes: impossible states had provided connecting paths between feasible states. Removing them prevents false identifications. The two class counts concern different domains and are not directly a compression ranking.

For example `(D+,D-,A+,A-)=(0,2,0,2+)` and its reverse `(2,0,2+,0)` are separate singleton components on the feasible domain. They merge on the Cartesian domain. This is a structural illustration, not a scalar witness or an exception used to define the quotient.

Independent D-only and A-only reversals remain indistinguishable whenever the reversed state is feasible (29 states for each operation). Yet simultaneous reversal can distinguish 16 feasible states. The apparent tension is resolved by partial-domain closure: the intermediate independently reversed states need not be feasible. This is a precise candidate explanation for why direction can be represented in either family without being wholly dispensable.

## Research disposition

- Qualification: the generated partition, factor maps, closure, maximality, state catalogs, interval semantics and reversal counts pass the finite structural verifier.
- Discovery: retain the 31-state common pair quotient as a candidate. Joint feasibility is a concrete new invariant; the unconstrained Cartesian quotient is a useful negative structural control.
- Scalar status: unknown. Common factorization of four scalar-exact triangle carriers does not imply their common **pair** quotient is scalar-exact on dependency residues. Pair-level quotienting, triangle assembly and linear image formation need not commute.
- Formula status: no coefficient, scalar lookup table or closed combination rule is selected. EW-RS-059 remains sealed.

The next experiment should freeze both common pair quotients, retain all four original carriers plus the separated reconstruction control, form sorted triangles and matched-dependency rows outcome-independently, freeze all catalogs and bases before scalar replay, then test the known 1/2/2 scalar images. If the 31-state quotient fails, do not split its components using outcomes: investigate triangle realizability or a common quotient of the structural dependency images under a new warrant.

## RS-077 sequencing qualification

The takeover audit found candidate-by-candidate preparation/replay despite the all-grid freeze claim. Commit `c890864d` separates complete grid preparation from replay. The full repaired run reproduced the entire published raw evidence byte-for-byte, including all 375 candidate audits; SHA-256 `9e26e7a113e30456c871ff5c59a9759a721504f1794faa5c686160ecf4b7e413`. The old execution is preserved as historical evidence and the new run is recorded in `RS077_FREEZE_SEQUENCE_AUDIT_0_1.json`.

No Q_F/Q_A result, standard 7x6 qualification, universal Connect Four claim, physical-gravity interpretation, or BSFP change follows.
