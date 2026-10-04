# Bounded independent preparation review

A separate reviewer inspected the source/build/runner packet read-only. It did not execute solvers or certify their mathematical correctness.

Findings corrected before solving-path smoke:

- Fresh build root required; no imported partial build records or stale adjacent headers can override the pinned source closure.
- Audit manifest must bind the exact build-lock SHA-256; required harness hashes cannot be omitted.
- Cold records validate empty root, worker count, zero state and false book/persistence flags. Exact-result records validate each native schema and W/D/L domain.
- Explicit solve-entry markers distinguish preparation from the audited direct solve invocation. No hot-loop instrumentation added.
- Collector cleanup/output drain and the parent watchdog are bounded. Metric validity is separate from exact-result validity.
- IsoMax affinity checks inspect all four indices, requested/actual groups, CPU masks and the before-initialization boundary.
- Performance conclusions remain disabled; later complete runs are only eligible for external post-return validation.

The final reviewer checked manifest/build-lock/harness hash agreement and all five successful cold records. It found no remaining task-blocking issue for preparation and bounded path smokes. It explicitly retained IsoMax's source-based TT attestation and live-handoff scope, and Christophe's inherited concurrency limitations.
