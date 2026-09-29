# Aggregate native Core-0.20 re-audit 0.1

**Date:** 2026-09-29  
**Research direction:** Joshua Oshiro  
**Branch:** `research/isomax-core020-ia-closure-20260929`  
**Trigger:** owner rule that failure at a high level never permits semantic omission

## Disposition

The complete-source reverse-map verifier at workflow run `36635977603` is valuable evidence but is not, by itself, sufficient for a final Core-0.20 primitive-closure claim.

It independently reconstructs the bounded aggregate results and checks the frozen native witness. However, deleting several named witness predicates from `AGGREGATE_CONTROL_CORE020_0_2.isg` still removes semantics that the JavaScript verifier knows externally.

That violates the stronger deletion test:

```text
remove derived/high-level labels
-> exact assertion semantics must remain reconstructable
```

Therefore the aggregate packet remains **INCOMPLETE FOR FINAL CORE-0.20 CLOSURE** until the seams below are natively lowered.

## Remaining reducible seams

### A. SC-E024 / SC-E025 / SC-E026 — cycle census

Current roots still consume:

- `REDUCED_EDGE`;
- `CYCLE_CLOSURE`;
- `CONTRADICTORY_PAIR`;

as named relations.

Required native lowering:

1. define reduced-edge membership as the exact quotient of raw binary-inheritance edges by equality of `(from,to,delta)`;
2. represent a spanning-forest certificate with unique parent/depth and exact tree/non-tree partition;
3. define fundamental-cycle syndrome from the ordered forest path and primitive XOR recurrence;
4. define contradictory reachability from two directed paths with equal endpoints and distinct accumulated parity;
5. make the closure/contradiction set membership reversible to those definitions.

### B. SC-E027 — direct residual structural producer

Current root checks the frozen state/class carrier and rank-increasing child relation, but the native graph does not yet fully define why those child incidences are exactly the rule-derived residual/cofactor successors or why the class assignment is exactly the bottom-up action-unlabelled quotient.

Required native lowering:

1. root state from exact board geometry/winning-line residuals;
2. legal landing-cell relation;
3. mover/opponent residual update;
4. mover-win / draw terminalization;
5. antichain normalization;
6. width-4 column-permutation orbit transport;
7. exact successor coverage and no extra successors;
8. well-founded rank bound;
9. bottom-up recursive class-signature equivalence and class completeness.

### C. SC-E028 — current-action parity audit

Current root consumes `PURE_DISTINCT_FIBER` and `PARITY_DEFINED_FIBER` as named witness predicates.

Required native lowering:

- exact phase-free profile token equality;
- width-4 profile transport by the complete 24-permutation carrier;
- all-distinct-slot predicate;
- pure-transporter fiber predicate;
- parity-well-defined predicate from primitive permutation inversion XOR;
- extensional equality of the resulting two fiber sets.

### D. SC-E029 — deeper binary exit census

Current root consumes the five propagation-category labels as named witness relations.

Required native lowering:

- same immediate phase-free profile;
- binary/nonbinary target-group cardinality;
- exact permutation transport of differing profiles;
- branch/multiplicity erasure as the negation of same-profile and transport conditions;
- terminal/unknown exit from absence of live child profile;
- exclusive/exhaustive classification over every changed child pair.

### E. SC-E030 — response-incidence GF(2)

Current root has raw response vectors and basis certificates, and the verifier checks both span directions, but native definitions must still expose:

- vector-bit incidence from exact lower/upper response cells and winning-line membership;
- finite feature order;
- primitive XOR-fold recurrence for each decomposition certificate;
- highest-pivot / independence semantics;
- dependency-vector XOR = 0;
- augmented unmatched-center vector outside the paired span.

### F. SC-E031 — legal/optimal partial2

Current root has final delta/basis carriers, while the source producer semantics remain external to the native packet.

Required native lowering:

1. complete 4x4 legal physical-game recursion from the empty board;
2. first-win terminal stop;
3. bounded bottom-up W/D/L only for defining the frozen optimal-edge assertion;
4. legal and optimal sibling-pair enumeration;
5. partial2 vector incidence;
6. sibling XOR delta;
7. extensional deduplication;
8. finite GF(2) basis/rank proof.

## Non-gaps

The following are already represented sufficiently for their current claims and must not be reopened merely because their labels remain useful views:

- local Boolean XOR truth table;
- shortest 5x4 route/phase/transporter/action facts;
- all 60 frozen IA bodies in `COMPLETE_IA_CORE020_0_1.isg`;
- source-scope assertions SC-E022 and SC-E023;
- generic loop/recursion control contract;
- exact board-geometry carriers;
- complete width-4 permutation carrier;
- aggregate finite raw witness tuples and cardinality enumeration data.

## Stop rule

Do not rerun final recursive IA closure until A–F are natively closed.

After A–F close:

1. admit all 31 source assertions against their final primitive roots;
2. run the complete IA families over all 31 source assertions + all admitted/generated IAs;
3. lower every newly generated IA body to primitive native structure;
4. repeat until one complete pass adds zero assertions, zero support refinements, and zero QU refinements;
5. stop.

DP, NEI, DTS, and Experimental Inquiry remain excluded.
