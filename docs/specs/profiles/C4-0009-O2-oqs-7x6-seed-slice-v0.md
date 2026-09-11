# O2 — Selected 7x6 OQS seed, first-cut CUDA qualification

Working bounded research profile under C4-0006..0009 and Q1, extending O1's exact
cofactor semantics without admitting a complete 7x6 quotient or root solve.

Frozen support 470594 has heights [5,6,6,6,6,6,3], rank 38, 240 minimal Win
records and 3,792 maximal Loss records. The fixture is a completed exact C1
support captured before the later seed probe hit a product-capacity boundary.
It stores its LF-normalized reference-source SHA-256; a changed source refuses
reuse. The observer itself is qualified against all 625 original 4x4 supports.

Input is one state at cut zero. The maintained line-order builder and JS OQS
rebuild 16 successor candidates, check direct versus sequential cofactors and
compare both layers 0 and 1 to independently rebuilt R3 state sets. The selected
fixture is not a legal colored-board sample or a complete geometry census.

Explicit shape selector `seed-cut-0`: one input state, 16 candidates, 4,096
records per side and per candidate, default block 128. O1's broad 7x6 admission
remains disabled. O2 requires no generic grouping and uses the unchanged public
CUDA-JS/Algorithms pins and the O1 plan/collective/kernel. Device memory is the
exact sum of disjoint arrays plus 256 MiB runtime allowance for Q1 admission.
Public launch policy permits 64 arguments; copied-transfer limit is 64 MiB.

Qualification: baseline and preservation modes each run one warmup and three
alternating-order measured repetitions. Every repetition compares every candidate
and the full next-target set. Native success requires all eight passes, two
independent JS layers, zero mismatches and graceful cleanup. Portable submission
proves composition only. Samples include upload, submit/wait and readback; this
single 16-candidate workload cannot establish steady-state large-OQS throughput.

Use short 30-second Q1 cases first; extend only if compile/reference setup rather
than an unexplained device stall requires a measured adjustment. No result is
7x6 root W/D/L, complete OQS, or evidence that later candidate counts fit O2.
