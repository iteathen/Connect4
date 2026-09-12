# Derived state-hash retention

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

## Assessment and decision

The 2025 source study suggested measuring what the active representation retains.
The current semantic pool interns the exact triple `supportIndex, R0, R1` and also
retained a 32-bit hash of that triple per capacity slot. C4-0010 requires exact
semantic identity; the hash is only a cache/prefilter. It is not a second proof
authority or a correctness defect. The active online solver disables edge caching.

Remove the stored state hash in the current pool. Probe equality still compares
the full triple. Rehashing recomputes the same hash from those fields; bucket
placement, growth policy, state IDs and proof ownership are unchanged. Growth
still prepares new backing arrays before publishing them. Update online storage
shape validation and the allocation-failure control to match the actual owner.
Residual-class hashes and the shared semantic TT are separate owners and remain.

The historical `quotient-native-negamax-scaled-nohash-kernel.mjs` was inspected
but not adopted: it patches an older pool with obsolete local proof ownership.
No compatibility wrapper or alternate production kernel was introduced.

## Bounded measurement

Baseline is immutable commit `b4c2524c5f272070d3491ad9d25772ff0468cda9`.
An extracted `git archive` containing the source directory and `components/bsfp`
provides its complete local import graph. The comparison script accepts that
source directory as argument 1 and an optional JSON result path as argument 2.
Each variant runs in its own fresh Node 26.7.0 process: three warmups, three
measured cold kernel/TT constructions and solves, three process batches per
geometry, with alternating variant order. No other campaigns ran during timing.
TT capacity is 65,536 entries / 16,777,216 terms; ETC is disabled; the existing
response closure stays enabled. All are connect-4, variable-dimension boards.

| Board | Exact search calls | State capacity | Kernel bytes saved | Median solve baseline → candidate |
|---|---:|---:|---:|---:|
| 4×5 | 23,527 | 16,384 | 65,536 (4.0%) | 138.44 → 135.79 ms |
| 5×4 | 61,908 | 65,536 | 262,144 (9.9%) | 175.13 → 173.72 ms |
| 4×6 | 123,525 | 131,072 | 524,288 (9.3%) | 312.49 → 320.00 ms |

Every result is draw. Search metrics, state interning metrics, residual memory,
and complete support/P0/P1/hash-slot backing arrays match the baseline exactly.
Only the derived retained array disappears: four bytes per capacity slot, 25%
of the state identity arrays. At a 67,108,864-state capacity tier that is 256 MiB
per pool, an arithmetic projection rather than a measured standard-root saving.

Retain this as a memory reduction with a CPU tradeoff. There is no demonstrated
throughput improvement: medians range from 1.9% faster to 2.4% slower. It does not
reduce nodes or solve the missing structural-closure problem. Full-root memory,
replacement pressure, growth peaks and completion remain unproven.

The earlier same-process comparison was much slower for some cases when both
module graphs shared timed call sites. It remains in the evidence as a diagnostic;
JIT interference is a plausible explanation, not an established causal result.
The isolated results are the applicable comparison. Both raw sets are retained
under [state-retention evidence](evidence/2026-09-12-state-retention/isolated.json).

## Qualification and review

All qualification ran locally. Concurrent campaign timings are correctness
evidence only and are not used for performance comparisons.

- Eight storage controls pass, including actual residual-transition growth
  through three capacity tiers, multiple rehashes, reinterning every state,
  edge replay with caching on/off, and transactional allocation failure.
- Thirty-three decision, worker, packed-proof, arena, response and root-config
  controls pass without skips.
- Slot64 full graph/edge identity and independent root/action WDL pass.
- Independent physical terminal and pruning campaigns pass, including variable
  board geometry, high-lane cells, both players and side-dependent propositions.
- Replacement, stale/poisoned lifecycle, dependency (five repeats; split 2/3/4;
  workers 1/2/3/4), and ExploreHint campaigns pass.

The seven campaign logs and contract output are in the same evidence directory.
Production source routing already covers the state kernel in all four bounded
workflows. Slot64 now also routes the online-storage diagnostic dependency and
new comparison harness, and runs the bounded current-version storage check.
Remote green evidence from earlier commits is not relabeled for this change.

Eval, terminal/parity semantics, forced macros, proof publication and worker task
queues are unchanged. No full 7×6 root was run and its trigger is unchanged.
The next owner is actual unnecessary work in the terminal projection, followed
by unresolved structural closure/repeated proof work. Do not treat a smaller
state representation as completion of that investigation.
