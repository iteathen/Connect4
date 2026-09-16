# Canonical cardinality and initialization-owned residual layout

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

Baseline: `0317c1c` on `research/frontier-negamax-conformance`. This follows the
[method assessment](2026-09-12-hot-method-cpu-assessment.md), under C4-0001,
C4-0006 and C4-0010. No eval, proof-window, terminal or strategic parity policy
changes are included. Board dimensions remain initialization inputs.

## Assess, research and reassess

The canonical slot64 class is immutable, but `termCount` performed twenty
popcounts for every request and the term writer requested another full count.
The descriptor cache separately retained the same length. The sampled 4x6 solve
performed 283,768 count reads and 241,118 term writes. Avoiding object allocation
had left repeated structural work intact.

The owner's additional instruction makes board dimensions a single initialization
fact. The support kernel reread caller configuration for several initializers and
spread it into its public result. Slot64 scratch/chunk tuples and response masks
were padded to the standard profile's twenty words even for smaller vocabularies.
These are ownership and redundant-work findings, not discovered WDL defects.

## Plan and execution

- Canonical classes own a Uint16 cardinality, established before publication.
  General interning counts during the existing singleton metadata pass; blocking
  derives the count from the parent's count minus the actually removed terms.
  Existing-class hits keep existing metadata. Empty classes have count zero.
- `termCount` now returns that owned scalar. The term writer checks capacity from
  the same metadata before any output mutation; it still verifies emitted IDs and
  the final length. No exact comparison is replaced with hash equality.
- The descriptor layer drops its duplicate length array. It retains only a
  one-bit hash-ready marker and reads cardinality through the residual owner's
  checked port. Hash readiness publishes after both hash lanes are complete.
- The support kernel captures `{columns, rows, connect}` once as frozen `domain`.
  Support construction, winning lines, the composed residual vocabulary, live-line
  ordering and response compilation derive from that captured domain. Scalar
  runtime fields are derived views, not independently configurable dimensions.
- The canonical residual owner derives chunk/word counts once from the initialized
  vocabulary. Response masks consume its read-only `termWordCount`. Deep loops
  close over these initialization constants; no per-node geometry object or size
  calculation is introduced. The two-word chunk unit is a representation unit,
  not a board size. Existing 64-cell / 640-term profile capacity limits remain
  explicit and unchanged; this does not claim every geometry fits that profile.

Arrays grow transactionally. The canonical count adds two bytes per allocated
class; removing descriptor lengths saves two bytes per descriptor capacity slot,
with one bit added for hash readiness. Capacities can differ, so those bytes
cannot always be cancelled arithmetically. Memory telemetry includes both owners.
Smaller initialized vocabularies additionally remove unused chunks, masks and
scratch. The standard 625-term vocabulary still needs twenty words.

## Qualification and evidence

Evidence and the isolated comparison reproducer are under
[canonical-cardinality](evidence/2026-09-12-canonical-cardinality/).

The cardinality-only intermediate measurement had 27 sampled searches per version
per case, after warmup, across three isolated-process batches with alternating
version order. Median solve time improved by 3.7% (4x5, 65,536 TT entries), 4.3%
(4x5, 4,096 entries), and 7.6% (4x6, 65,536 entries). These measurements precede
the initialization/layout follow-up and remain separately labelled evidence.

Final qualification and timing results are recorded below after execution.

The full `node --test` run at the cardinality-only stage passed 138 tests and
failed one archived OQS test because `experiments/cuda-bsfp-oqs-cofactor/factored-fixtures.mjs`
is missing. Running that exact test against the untouched baseline reproduced
the same missing-module failure. It is a pre-existing repository/reference
qualification blocker, not an engine-result regression. It is not bypassed or
reported as a green repository-wide check.

## Review and remaining work

Term sequences, shared semantic hashes, exact equality, local state IDs, search
policy, advisory move ordering, stale-generation retry and poison recovery remain
the same contracts. New tests compare cardinality and hashes to the independent
term-ID representation across four geometries and verify allocation recovery,
write rejection, bitmap growth, one-time input capture and derived mask sizing.

Rejected shortcuts: a second count cache, trusting caller-supplied lengths,
dropping exact term equality, hardcoding smaller test-board layouts, per-node
promises and unproved parity publication. No full standard root or root trigger
change is part of this work.

This removes CPU work without claiming fewer searched decisions. Remaining owners
include exact descriptor conversion/binding reuse, residual-transition cache
misses, equivalent neutral actions, concurrent proof contention, work supply and
asynchronous reporting. None is declared solved by this change.
