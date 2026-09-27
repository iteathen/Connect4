# Selected IsoMax version — 2026-09-27

Owner: work/isomax-jsminsys-rebuild. Temporary promotion branch:
work/isomax-six-deep-one-wide-20260927. This promotes the owner's selected
implementation, not every experimental policy or a new theorem/spec status.

JSMinSys pin: a3cf7f9ca5c90e5025542c3b27ab0b735a610e9a.
The library implementation was benchmarked at b6ce1c541807b0123cf8f5dab759dcccd6a93f3b;
5452c5c adds the unchanged-code Fhourstones evidence. a3cf7f9 changes only the
cold source-hash verifier to normalize Windows CRLF checkouts to Git LF text. The dependency PR is
https://github.com/iteathen/JSMinSys/pull/52, which includes the #51 foundation.

Public solve7x6, CLI and Fhourstones harness consume the library's prepared
six-deep/one-wide profile: seven workers, 4M shared and 1M private cache entries
per worker, sampling mask 0. The adapter fixes native root-frontier routing; it
does not create local workers, TT, scheduling or solver logic. Explicit worker
and memory overrides remain possible but are outside the selected-profile
performance claim. The two-worker minimum and 120-second ceiling remain.

Library qualification: 164 tests, source-generation/catalog/geometry/hot-closure
checks, 40 deterministic polarity comparisons and 70 matched performance runs.
Cumulative review at the pinned head found no blocking production issue. The
longer derived fixture improved about 1.9% in operation cycles; short-case
variation and GC/JIT debt remain documented.

Standard Fhourstones inputs with the selected profile on Windows/i5-12600K/Node
26.7.0: 45461667 WIN in 0.209s; 35333571 LOSS in 83.133s; 13333111 and empty board
both reached the 120s ceiling with null WDL and clean shutdown. This is 2/4
completed, not an official Fhourstones score or empty-board solve. Source:
https://github.com/iteathen/JSMinSys/blob/5452c5c6c3cb67d359fbfe2e50047293163767e9/evidence/isomax-fhourstones-20260927/REPORT.md

Application qualification covers the promoted default, independent late-position
oracle, reflection/witness, 2/4-worker overrides, terminal handling, cancellation
and deadline cleanup. A default-profile test failed on the old two-worker route
and passes with the profile integration. Library tests are run from the vendor
working directory because the structural audits use repository-relative paths.

Research and BSFP are unchanged. Historical results retain their revisions.
NEES scope is inherited with explicit deviations, not elevated to JMS-SEALED.

Integration result: all 12 application tests and all 164 vendored library tests
passed on Windows/Node 26.7.0. The default CLI solved official input 45461667
with seven workers, mask 0 and clean shutdown; raw output is
20260927-selected-isomax-smoke.json. Source guards initially rejected CRLF
checkout bytes; the owning JSMinSys verifier now normalizes only line endings,
and all generation/catalog/geometry/hot-closure checks pass.
