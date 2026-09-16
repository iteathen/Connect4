# Remove redundant residual reads before further optimization

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The owner set the order: eliminate unnecessary operations, identify common
invariants, then optimize what remains. C4-0006 owns exact residual reduction,
blocking and antichain meaning; C4-0010 owns exact proof and identity semantics.

Assessment of the profiled working tree found that each mover cache miss copied
the entire canonical class to `inputBits` before scanning it. `loadClassBits`
called the chunk copy helper once per slot, repeatedly validated known references,
and wrote a scratch array that was only read by the immediately following pass.
Both transition entry points also repeated class/cell validation in private cache
helpers after validating the same arguments at entry.

The shared invariant is immutable canonical chunk content during transition
evaluation. Blocking already reads those chunks directly. Mover reduction now
reads them directly too. Its read phase does not intern or grow the chunk arena;
normalization and interning occur afterward. Consequently no borrowed view can
become stale during that read phase.

Execution removed the whole-class input copy, `inputBits`, `loadClassBits`, its
now-unused `copyTo` helper, and duplicate private-cache input checks. Public
class/cell/mask checks, cache-result validation, exact reduction and normalization,
class interning, proof behavior and initialization-derived dimensions remain.
There are no new strings, parsing, callbacks, temporary views or allocations in
the successful transition path. Arithmetic still performs the required game
transition; this change does not claim all transformations or copies elsewhere
have been eliminated.

Qualification: 23 storage/decision controls passed, followed by all four local
slot64, semantic replacement, ExploreHint and dependency campaigns. The slot64
campaign compares complete bounded graphs with the term-ID reference. Existing
growth and malformed-input controls remain green. The changed source is already
covered by the four workflow path filters. Campaigns were used for correctness;
their overlapping timings are not performance evidence.

One subsequent isolated cold depth-8 normal Negamax run on the empty 7-column,
6-row board used the same settings and 60-second external timeout. It took
10059.9007 ms versus the earlier 10040.0977 ms. Every search/proof/descriptor
counter and bounded result matches. Both have 4,777,115 calls, 672,690 expansions,
2,424 cutoffs and 221,398 local states. The root remains unknown at the horizon.
The timing difference is about 0.2%; no speedup is established. Removed scratch
is 80 bytes for this initialized geometry; the meaningful removal is its repeated
copy work, not that small retained allocation.

[Evidence](evidence/2026-09-12-direct-residual-read/result.json) preserves the run,
qualification logs, source changes and exact-counter comparison. No full root
was run. Changes remain in the existing working tree, with broader integration
still pending. The next target is reuse of established class/event transitions
and avoiding canonical probes when identity is already known. A larger cache,
new normalization rule or changed proof policy is not adopted by assumption.
