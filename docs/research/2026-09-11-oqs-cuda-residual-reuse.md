# CUDA residual reuse qualification

Continue from e04cee12bc24cda63fcf889eb4ca2137837f86bf. The CPU reference has
qualified exact residual/input reuse independently of crossing assignment. This
unit moves that transform and the complete crossing-state output mapping into one
prepared CUDA DAG, retaining the existing exact cofactor kernel/collective.

Inputs are an exact residual-pair table plus `(crossing, input-pair-ID)` states.
The qualification fixture supplies exact IDs from full canonical pair equality.
The device computes each pair/input cofactor once, then emits every original
state/input crossing mask and a reference to the computed pair slot. That slot is
not a canonical next-quotient ID. Generic next-pair grouping/compaction remains
CUDA-Algorithms-owned; no private sorting/scan/grouping stack is introduced.

Owned sequential work: (1) finite factored layout and device mapping under the
existing plan lifecycle; (2) full 4x4 selected-support transition controls and the
captured 7x6 support 470594 cut five; (3) native A/B against duplicate per-state
transforms, then evidence/cleanup. Exact small layers have R3 oracle coverage;
the large fixture must match the retained baseline canonical layer digest.

The mapping kernel must reject invalid active extents, pair IDs, high crossing
bits and failed upstream cofactors before using a payload. Reset precedes all
status publication. Candidate products/slots are bounded u32 values. The plan
owns all disjoint allocations and closes them in reverse order. A failed mapping
cannot be reported as a successful partial quotient. Compare every logical
candidate and complete target set; shape/block changes must preserve meaning.

Initial native budget: 30 seconds per geometry, 120 seconds total under Q1. Keep
both representations resident only within the profile's combined finite bound.
Measure identical normalization modes, one warmup and three alternating-order
repetitions. Report transfer/readback/setup separately. No complete OQS, GPU ID
discovery, root result or generalized throughput claim follows from this slice.

Falsifiers: any candidate/set mismatch, invalid slot read, stale status acceptance,
overflow, exceeded admission bound, lifecycle leak or hidden host progression.
Retain immutable Q1 evidence and local failed runs; preserve the original solver
lane and lower-repository pins. A material semantic/shared-contract deviation
requires reassessment before widening.
