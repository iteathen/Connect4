# EW-RS-079: common pair factorization is not scalar-sufficient

The two RS078 common pair quotients were frozen, assembled into sorted triangles, and evaluated on the existing matched dependencies. All 21 candidate/carrier structures were committed at `ecde05c3` before new scalar replay. Scalar labels came from pinned RS077 evidence `a4c4c373`, after full dependency-index, signature and residue alignment. No formula holdout was read.

| Carrier | Cartesian rank / contradictions | Feasible rank / contradictions | Four PMEC ranks |
| --- | --- | --- | --- |
| 6x3-k3 | 70 / 0 | 71 / 0 | 72,72,72,72 |
| 4x5-k4 | 145 / 38 | 233 / 1 | 250,251,250,252 |
| 6x3-k4 | 6 / 7 | 7 / 7 | 13,13,13,13 |

Every PMEC and separated reconstruction control remains exact. The independent BigInt verifier reconstructs all rows and bases and verifies explicit XOR-of-dependencies contradiction certificates. Contradiction counts depend on the frozen elimination order; the nonzero scalar on a zero structural sum is the decisive invariant.

Qualification disposition: both common pair proposals are falsified as common scalar carriers. Owner-count feasibility substantially repairs the mixed-geometry control but does not close its one contradiction and does not repair the horizontal-only control. No outcome-based exception is added.

Discovery disposition: common factorization and triangle/dependency assembly do not commute in the required way. The next construction moves the common quotient to the observed triangle domain and to the linear dependency domain. EW-RS-080 was committed at `eb9b0475` before RS079 replay, so its candidates were not designed by splitting the observed failure. For the dependency-domain construction, a conditional theorem already ensures scalar preservation: a scalar map vanishing on each control kernel vanishes on their sum. Its remaining dimension and native interpretation are structural questions.

This is bounded Q_V research, not a closed value law or a Q_F/Q_A result. EW-RS-059 remains sealed; there is no standard-7x6 claim.
