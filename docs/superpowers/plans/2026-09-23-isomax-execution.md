# Fresh execution components

Goal: implement the authorized worker, TT and BranchManager from scratch.
Architecture: canonical numeric q rows own identity, values, execution and
published branches. No prior solver implementation is imported.
Specification: ../specs/2026-09-23-isomax-jsminsys-execution-design.md.
Stack: Node 26.7, pinned JSMinSys 617c5172, NEES Draft 0.5 at 7650bef0.
Constraints: no BSFP, no fabricated WDL, no hot aggregate allocation, bounded
storage, no implementation compatibility surface. Execute inline.

1. Write failing TT tests for exact collision discrimination, pins, generation,
   capacity, conflicting values and live execution ownership. Implement prepared
   storage and scalar operations in components/isometric/execution/shared-tt.mjs.
2. Write failing manager/worker tests over hand-solved ranked DAGs. Implement
   in-place publication, exact max/min propagation, canonical incoming edges,
   root tie selection and worker continuation. Kernel is prepared once; it reads
   claimed TT content directly. It is not the inherited Connect4 kernel.
3. Run real Node workers at 1/2/4, transpositions, cancellation and worker failure.
   Keep host lifecycle cold; numeric execution runs in dedicated threads.
4. Review the transitive hot scope and maintain NEES costs/debt; qualify the
   complete components, record limitations and commit each coherent unit.

Review focus: no gap between child insertion and parent ownership; no recycling
   while execution or publication references exist; no hash-as-equality; no
   queue slot reuse races; no pruning a child still needed by another parent;
   root witness must not depend on completion order.

Initial synchronization realization: one bounded TT transaction at E2, with
native kernel execution outside the lock. This avoids partially published
multi-row ownership transactions. Contention is an explicit measurement/debt
surface, not an asserted optimum. Worker death inside a transaction fails the
session closed; it must never attempt speculative lock takeover.
