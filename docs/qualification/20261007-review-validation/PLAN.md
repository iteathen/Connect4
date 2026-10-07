# IsoMax evidence review qualification

Owner-approved scope: remove incidental personal information from public documentation and archives; make qualification self-contained; strengthen timing, independent correctness, concurrency and external comparison evidence. This is not a solver optimization.

Frozen solver: package source 8b81911bb19f58665f5a5bbb4811a05fc0fd9fba, unchanged worker/runtime modules. Matched control: producer 679239578f853d0a7a2f1bcd70c860926a8ddc14. Six discovered and verified P-core workers, 12 GiB shared partial24 TT and 192 MiB private per worker, identical JIT/runtime and support plans. Fresh process and TT per measured solve. No RLC, books, solved caches or runtime oracle inputs.

- [ ] Remove personal paths, application identities and unrelated administrative prose from current public evidence, retaining originals outside Git. Preserve measured values and source identities; do not rewrite history.
- [ ] Run five alternating control/candidate pairs. Record raw outputs, source/runtime hashes, actual settings, preparation, solve and full-process time, CPU, RSS and cleanup. Validate only after return.
- [ ] Run synchronized six-writer collision stress and independent physical-minimax checks on a frozen legal corpus. Include selected full-memory six-worker cases; record exact coverage limits.
- [ ] Prepare and run audited external native serial and six-thread comparison lanes with matched placement and explicit memory differences. Report both whole-process and native solve timing; do not claim equal capacity where layouts/rounding differ.
- [ ] Run a separate diagnostic build or sampled profile. No production hot-loop instrumentation; diagnostic time is not a production benchmark.
- [ ] Include current raw evidence and reproducible tests in the distribution, refresh hashes/archive and verify extraction. Review and integrate on main using existing protections.

Existing experimental-profile auto-selection, required Windows/Linux pinning and macOS best-effort policy remain owner-authorized. Performance conclusions stay local and preliminary unless this new evidence supports stronger wording. Formula holdouts and BSFP remain untouched. No full 10x10 solve.
