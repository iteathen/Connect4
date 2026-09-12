# Active frontier solver: move evaluation, terminal detection and hot-loop report

Date: 2026-09-12
Audited source: 9c778bcaf010372ca2a3a91a7cdcec8debf5518f
Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The move scorer and terminal tests are compact frontier operations. The complete
search loop is not a compact allocation-free bitwise kernel: it repeatedly crosses
semantic/proof adapters, revalidates and reloads proof records, constructs temporary
JavaScript values and interns residual/state representations. These are source-level
findings. A CPU/allocation profile is still required to rank actual wall-clock costs;
V8 may eliminate some temporary objects through optimization.

## 1. Evaluation for move selection

There is no neural evaluator, heuristic leaf score or distance-to-win evaluation.
The only advisory move value is:

    score(player, landing cell) = count of original geometric winning lines
                                  through that cell with no opponent stone

Standard 7x6 has 69 geometric lines. Each player's live-line set uses three Uint32
words, so a frontier seed uses six words / 24 bytes. At initialization, all lines
are live. On a placement, the opponent's lines through that cell are cleared;
the mover's live lines remain. Own stones do not cancel the mover's line value.
This is incremental provenance, not a reconstructed occupancy board.

For each legal column, the deep worker obtains its landing cell, performs three
AND/popcount operations, and orders at most seven moves using insertion into
preallocated typed move/score stacks. Order is descending frontier score, then
current legal proof-store best move only within equal-score ties, then ascending
column index. The root vector [3,4,5,7,5,4,3] follows from geometry, not a hardcoded
center table. The advisory score never supplies a W/D/L bound.

The shallow asynchronous coordinator implements the same ordering but builds
{column,value} objects, uses Array.sort and maps back to a column array. That is
shallow scheduling overhead; the recursive synchronous worker does not use this
object-sort path. Tactical immediate wins bypass ordinary ordering and can choose
the first winning column in the substrate's center-order enumeration; every such
choice is already an exact win, rather than a heuristic preference.

Source: quotient-live-line-move-order.mjs:118,177;
quotient-negamax-engine.mjs:207,316,672.

## 2. Terminal and exact closure detection

The production path uses residual requirements, not a fresh four-in-a-row scan.
For each player, a class is the normalized set of remaining cells needed by live
winning requirements. Its cached singleton mask identifies one-cell requirements.

At each visited state, the solver first reads available exact proof bounds and
intersects them with residual exhaustion facts:

- own residual class empty: upper bound <= draw;
- opponent residual class empty: lower bound >= draw;
- both empty: exact draw;
- any contradiction with a retained proof: fail explicitly.

A closed proof interval or a window cutoff may return before local tactical work.
Otherwise tacticalCode scans the legal landing cells (at most seven):

1. A playable mover singleton is an exact immediate win. This takes precedence
   over opponent threats.
2. More than one distinct playable opponent singleton is an exact forced loss.
3. No legal continuation is draw under the maintained nonterminal-state convention.
4. Exactly one opponent singleton restricts the move to the forced blocking column.
5. Otherwise the state remains unresolved.

During a move, ownTransition removes the placed cell from affected requirements.
If a requirement becomes empty it emits a terminal-win sentinel; advance returns
that sentinel instead of interning a post-win state. Opponent blockTransition
removes requirements containing the occupied cell. Earlier wins are therefore not
traversed as later nonterminal positions. A tactical forced loss is a proved future
outcome, not a claim that four stones are already present.

Repeated forced responses are normalized in a loop with sign/window inversion.
The current root does not compute general CPC response-policy, blocker/race or NDC
fixed-point certificates. Its local closures must not be described as complete
strategic terminalization.

Source: quotient-native-negamax-support-layout-kernel.mjs:627,675;
quotient-native-negamax-slot64-residual-kernel.mjs:23;
quotient-negamax-engine.mjs:371;
quotient-slot64-residual-pool-v2.mjs:581.

## 3. Full deep-worker loop and representation transformations

    local qID
      -> support + P0/P1 class IDs
      -> transient exact semantic descriptor + combined hash
      -> shared TT bucket / exact term comparison / generation handle
      -> lower/upper proof reads + structural interval
      -> local terminal/forced closure
      -> live-line move scores and typed insertion ordering
      -> own residual reduction + sparse antichain normalization
         and opponent residual filtering
      -> chunk/class interning + child q-state interning
      -> checked parent/child rank + next live-line frontier
      -> recursive exact Negamax on unresolved decisions
      -> generation-current monotone shared proof publication

Support access itself is cheap: a precomputed Uint32 descriptor yields rank and
column height by shifts/masks; child support adds a radix weight. The expensive
base-radix decoding loops construct this table during setup, not at each node.

Residual classes comprise ten slot-local 64-bit chunks spanning the 625-term
ontology. Own-transition cache misses load 20 Uint32 words into reusable scratch,
reduce affected terms by table lookup, and clear strict supersets via sparse rows.
Opponent blocking filters affected chunk words directly and reuses unchanged
chunks. Changed chunks and class tuples are hash-interned with exact comparisons;
the resulting support/class triple is separately hash-interned as a qID.

Only the first 4,096 residual classes receive dense own/block transition caching.
Out-of-prefix transitions recompute and intern their result. The root disables
state-edge caching, so repeated state/move transitions still enter residual logic
and q-state interning. This is deliberate bounded-memory policy, not a free direct
state-to-state table lookup. It is a material scaling hypothesis.

## 4. High-level operations still inside that loop

| Operation | Frequency / implication |
| --- | --- |
| Repeated proof reads | lower, upper and bestMove separately resolve/check a generation and load the same packed byte. In the stable cached READY case, each field performs 11 Atomics.load calls across adapter precheck, packed read and adapter postcheck: up to 33 for all three fields, excluding the initial TT lookup. A bounded public-port diagnostic confirms 11 + 11 + 11 loads; this excludes initial lookup and is not a whole-node average. |
| Handle objects | Packed decode returns {slot,generationValue}. The stable three-field path invokes it nine times. These are source-level temporary object constructions; actual heap escape is JIT-dependent. |
| Per-node interval tuples | applyFrontierBoundCode returns a two-element array and frontierBoundsFor returns a three-element array, then both are destructured. This occurs even when the structural code adds no bound. |
| Descriptor validation tuples | assertDescriptor constructs nested hash-field label/value arrays on probes and ensures. |
| Eager diagnostic strings | Validation call arguments interpolate state/key/column labels on ordinary successful paths. Whether V8 removes them must be measured; they are not written solely in error branches. |
| Per-move mask tuples | ownTransition calls assertCellBits before its cache probe; expectedCellBits and assertCellBits each return arrays, with a power expression to reconstruct the expected cell bit. New-class singleton computation also returns a tuple. |
| Publication closures | The semantic adapter constructs a handle callback; the packed publisher constructs a record-transform callback. Publication also performs lifecycle CAS/store/notify operations. |
| Exact descriptor copying | A matching hash candidate still writes sorted P0/P1 term IDs from canonical chunks into reusable scratch and compares shared chunks. Insertion/replacement materializes and writes the descriptor. There is no new term array per call, but real term iteration/copying remains. |
| Repeated metadata scans | Class metadata is cached, but direct term writes recalculate term counts and iterate chunk words. First metadata construction writes terms to scratch and hashes the sequence. |
| Layered validation/access | State, class, column, rank, mask and record checks recur through engine, adapter, support and residual owners. checkedTransition reloads parent and child ranks after advance. Even with edge caching disabled, edgeAt/setEdge boundary checks still execute. |
| Hash/interner work | Changed chunk dictionaries, class tuples and q-state triples can each require hashing and open-address probing. Parent reuse and prefix caches reduce this but do not eliminate it. |
| Growth/rehash pauses | Capacity tiers allocate/copy typed arrays, widen chunk references and rehash tables. These are occasional but potentially large; transactional growth can temporarily retain old and new arrays. |

The exact-proof synchronization and content comparison protect correctness and
must not simply be removed. Opportunities include an owner-provided coherent
record snapshot, scalar internal return contracts, cold diagnostic formatting and
measured transition/cache economics, each preserving existing validation and
replacement controls. No such optimization is silently adopted by this report.

## 5. Costs outside the deep synchronous loop

The coordinator uses arrays/objects/sort/map, Maps, promises, Promise.race and seed
copies; the executor uses queues and structured-cloned task messages. Worker path
replay creates seeds and replays transitions once per task. These costs belong to
coarse dependency/task execution, not per-node RPC. Geometry/vocabulary generation,
profile caching, generic Set/Map construction and most frozen stats objects are
initialization or telemetry costs. JSON output is campaign/progress reporting.
The active residual transition path uses typed words, not BigInt, string state
keys, board conversion or generic pair-array sorting. Historical pair-based
normalization functions in the base module are not the installed slot64 hot path.

The descriptor telemetry proving zero class/state descriptor objects and temporary
term-array materializations covers that layer only. It does not count interval
arrays, handle objects, mask tuples, closures, strings, scheduler objects or retained
interner growth. The entire engine cannot currently be called allocation-free.

## Assessment

The immediate move evaluation and terminal rules are not heavyweight high-level
evaluators. The strongest hot-loop concerns are repeated semantic-proof access,
representation reconstruction/copying, out-of-prefix transition recomputation,
interner growth and temporary JavaScript work around those operations. Their time
ranking remains unmeasured. Initial authoritative work supply is independently
limited to one task at split 3 with exploration disabled; see the
[methods review](2026-09-12-negamax-methods-local-review.md).

This is a report of the existing qualified source. It changes no engine behavior,
solver authority, trigger or active root configuration.

The bounded read-cost diagnostic also verified 69 lines, six seed words and the
exact empty landing vector. It wrapped Atomics.load only to count calls, retained
the original operation/values and restored it in finally. No concurrent worker or
full solve was executed. Raw evidence and the reproducer are in
[evidence](evidence/2026-09-12-frontier-audit/hot-loop-read-cost.json).
