# Frontier solver conversation summary

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

This is a curated summary, not a verbatim transcript or independent proof. Inspect
actual code and accepted contracts before mutation. Later discussion narrowed the
active task to local solver optimization; do not automatically resume the earlier
repository/ref-cleanup request.

## Owner direction

Continue the exact frontier-native solver and correctness/compliance audit. Preserve
the relational CPC → WSL → NDC research model, semantic/proof separation and resource
lifecycle. Do not substitute conventional colored-bitboard search or invented parity
claims for structural reasoning.

The repeatedly requested optimization order is:

1. Eliminate unnecessary operations.
2. Find shared structural invariants so one operation replaces several.
3. Optimize the remaining necessary work close to what the JIT executes cheaply.

Hot paths should avoid allocations/classes, strings even for comparisons, parsing,
board reconstruction, unnecessary transformations/copying, blocking waits and
synchronous reporting. If text must be represented in a hot path, use an indexed
character map. Preallocation must follow board size, depth and resource limits.
Variable dimensions have a single initialization owner. Independent work should
be queued without making a caller wait unnecessarily; retain synchronization
required for exact shared proof publication.

Run bounded tests locally. The owner objected when a nominal 60-second timeout
became many sequential 60-second runs. Declare and enforce the total batch budget,
kill and join unfinished work, and never leave orphan or duplicate solves. Use the
normal engine path with explicit bounds. Timing must identify source methods/lines;
sampling without usable attribution is not line-level evidence. Compare identical
conditions and exact search counters, not unrelated throughput totals.

## Structural questions that motivated the audit

The owner suspected excessive search from duplicate work, broken pruning, failure
to quotient irrelevant stones/null events, or old conventional-board logic. Requested
checks included Branch Manager, terminal detection, pruning, eval and move order.

The intended evaluator uses live winning-line incidence: a player's cell value
counts original winning lines through it that contain no opponent stone. Own stones
do not cancel those lines. Preserve multiplicity for ordering without treating it
as exact normalized quotient identity. The original 2025 implementation was studied
for structural reuse; its historical runtime policies are evidence, not authority.

Parity should exploit relationships already encoded in the structure rather than
reconstructing a board and repeating arithmetic. The owner sought reduction to an
XOR/low-bit read. Establishing arithmetic cancellation alone does not prove that a
selected event reservoir certifies terminal ownership; response, resource, order
and race premises still matter.

“Partial terminal” terminology caused confusion. A one-sided no-win fact and a full
W/D/L result occupy different logical categories. Negamax's perspective accommodates
side-relative facts, but a no-win bound must not silently become an exact draw/loss.
Preserve that distinction while using exact structural closure, not heuristic pruning.

## Identity discussion

The owner challenged hashing when the relational information already carries
identity. Hashes help address candidates; they do not add semantic information.
If an existing canonical relationship supplies a state/edge ID, rediscovering its
identity by hashing is redundant. Identical complete future-relevant information
denotes the same solver state regardless of path or time of discovery. Numeric
IDs locate canonical data; they are not another semantic identity.

The assistant overemphasized uniqueness qualifications instead of following that
structural point. Exact comparison is still needed when a bucket index compresses
a larger key space, but this is a lookup issue, not a requirement for invented
semantic identity.

Discussion considered an odd 64-bit multiply followed by XOR-right-shift. The full
64-bit transform is invertible, but truncation to a finite bucket space permits
collisions. Assembly latency claims or one pointer API call do not measure a whole
lookup. Two Uint32 words can hold and compare exact keys without hot-path BigInt;
physical-memory access or a native addon is unnecessary. Current Node experimental
FFI availability was verified after an overly broad contrary assistant claim;
no FFI path was introduced.

Packing row/column coordinates was considered, but a cell coordinate is not the
whole state. A gapped coordinate encoding must not silently replace row-major mask
positions or exceed their width. The owner corrected player-to-move identification:
with P0 starting, `playerToMove = stoneCount & 1`; support rank supplies the count.
That differs from existing-stone ownership or future-event control.

For even board heights, the mixed-radix support index has the same low-bit parity
as rank. A researched basic CPC relation reduces to support XOR column-major target
address under its declared reservoir. This is not a universal geometric color
oracle. The broader useful idea is that ownership relations can be read directly
when the mapping encodes them.

The local key consists of support and two residual-class IDs from one canonical
owner. Independently numbered worker IDs are not shared semantic identity. Shared
proof keys still require exact support/P0/P1 content and generation-safe lifecycle.

## Native key and integration corrections

The owner proposed making identity directly suitable for lookup as a double word,
implemented here as two 32-bit words. Current depth-8 reservations need 20+20+20
bits; depth-21 reservations need 20+22+22. Widths derive at initialization; larger
legal configurations retain exact wider storage.

The isolated lookup prototype measured approximately 18% improvement for native
packed reads (80.6 versus 98.2 ms per 3.54 million queries). Repacking fields on
every query was slower. This was not an engine-speed measurement. The owner supported
integration through the state/class owners and their consumers, without duplicate
packed and unpacked storage.

The first integration added accessor/validation work, a split field and intermediate
writes, and regressed about 6.5%. The assistant loosely blamed “field access work.”
The owner challenged whether a DWORD AND could explain this and insisted the
implementation was suspect. The assistant withdrew the attribution: the experiment
changed too much to blame the mask or reject packing.

V8 traces then confirmed that several readers and packing/hash helpers were inlined.
Source call count is not machine call count. A comparison using the same new owner
with packed versus unpacked storage measured slightly less CPU for packed storage,
while the broader integration retained overhead. Small differences and measurement
drift limit certainty.

A real lifecycle bug in the new code was found and corrected: readers captured
before reservation could retain an obsolete layout. Stable reader methods now
use the current owner-selected layout; captured-reader controls verify this.
Count/capacity are private. Redundant adapter validation was reduced while retaining
the state owner's fail-closed validation.

Final paired empty 7-column × 6-row depth-8 measurement:

| Metric | Baseline | Integrated packed owner |
|---|---:|---:|
| Elapsed ms | 1786.365 | 1786.722 |
| Process CPU ms | 1969.5 | 1929.5 |
| State payload bytes | 6,291,456 | 4,194,304 |
| Calls | 4,777,115 | 4,777,115 |
| Local states | 221,398 | 221,398 |

All search/operation counters match. Elapsed is essentially flat; measured CPU is
about 2% lower and state payload saves two MiB. Do not market the isolated 18% as
solver throughput or promise that packing guarantees lower total CPU. The owner's
priority is to remove remaining integration overhead, not dismiss structure because
an implementation regressed.

## Qualification and remaining limits

Final local qualification passed 74 controls, six bounded campaigns and ten
residual-provider controls; all children exited. Five bounded workflow filters
include the new owner. Hosted CI must be checked for the actual pushed SHA; local
green does not mean remote checks ran. Source/evidence manifests are in the
[integration record](2026-09-12-native-key-integration.md).

Earlier depth-21 tests timed out. An improved fixed-window run reached about 92.25
million calls without completing; these are not full-root proof-node counts. The
owner's “under ten million nodes” comparison came from Gemini and was explicitly
questioned. No universal matching-condition bound was established. Opening books,
endgame tables, proof objectives and node accounting differ across solvers.

The Pons-protocol batch used one total 60-second budget: 137 completed positions
across partial sets, all matching published score signs. Setup dominated easy cases
and Begin-Hard's first position remained unfinished. This is not completion of all
6000 cases or an empty-board solve.

Do not trigger a standard 7×6 full root until the full active-path audit and bounded
qualification justify it. Its revision trigger remains unchanged. Continue isolating
candidate construction, descriptor materialization, consumer access and working-set
costs while preserving exactness, stable readers and initialization-owned dimensions.
Maintain status, the audit ledger and evidence of rejected variants. Avoid unrelated
refactors or ref cleanup unless explicitly requested.

## Read next

- [Handoff prompt](2026-09-12-frontier-optimization-handoff.md)
- [Integration and attribution evidence](2026-09-12-native-key-integration.md)
- [Native-key prototype](2026-09-12-native-relational-key.md)
- [Full-engine audit](2026-09-12-full-engine-sanity-audit.md)
- [Ranked depth-21 work](2026-09-12-depth21-ranked-optimization.md)
- [Published-position benchmark](2026-09-12-pons-protocol-benchmark.md)
