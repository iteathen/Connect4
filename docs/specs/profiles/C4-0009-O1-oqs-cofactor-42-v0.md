# O1 — OQS packed cofactor semantic qualification

Working research profile under C4-0006..0009 and Q1. Owns the bounded native
qualification of the existing OQS successor transform, not full OQS synthesis.

Input state is crossing ownership plus canonical exact Win-minimal/Loss-maximal
frontiers at one support/cut. Input fanout is exactly 2^introducedWidth, width
at most four; ordinal bits enumerate fixed cells in ascending cell order. Inputs
are precomputed JS oracle layers, not GPU outputs read back to advance OQS.

One block per candidate applies the packed direct cofactor. Baseline normalizes
both sides using the maintained exact collective. The preservation variant skips
Win normalization when all fixed cells are P1 and Loss normalization when all
fixed cells are P0. The proof and independent antichain test are in the research
record. Output frontier order is unspecified; exact set equality is required.
The plan owns disjoint arrays; no aliasing or generic sort/scan implementation.

For 4x3/4x4 the envelope is 1,024 states, 2,048 candidates, 64 records per frontier,
2,048 input records per side. For the four selected 5x5 supports it is 16,384
states/candidates, 512 records per frontier and 32,768 input records per side.
Every extent/product fits u32. The layout computes exact allocation bytes plus
256 MiB runtime allowance. Q1 owns current free-VRAM admission and timeout.
The runtime explicitly selects the public 64-argument launch policy and 64 MiB
copied-transfer limit; largest individual allocation remains below 128 MiB.
All input arrays cover full declared capacities; invalid device metadata is tested
inside those allocations. Canonical finite 42-bit frontiers are a precondition.

Qualification compares every emitted candidate's crossing and frontier sets to
incremental JS. Unique target sets must cover the reference next quotient. The
selected small supports and 5x5 support 4426 also rebuild every independent R3
layer; the other three 5x5 supports retain R6's R5 aggregate checkpoint scope.
Neither count agreement nor portable submission is called native semantic parity.

Invalid extent/fanout, offsets, frontier capacity and ownership input produce
explicit status; no stale output is accepted. Negative cases are expected controls,
not OQS success. Empty input is valid and produces zero candidates. Resources close
on success and failure; JSON success follows graceful runtime cleanup.

Q1 ID: c4-0009-o1-oqs-cofactor-42. Geometries: 4x3:c3, 4x4:c4, 5x5:c4. No 7x6
admission or root-WDL claim. Generic grouping/dense IDs/device layer chaining remain
open CUDA-Algorithms composition work. Timing includes transfer and orchestration;
no native speedup is implied by compilation or exactness alone.
