# Incremental response closure and proof reuse

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT
Date: 2026-09-12

## Assessment and research

The user authorized preserving live-line eval semantics while integrating work
into structural representation, tightening parity/control and examining proof
reuse. Side-dependent terminal propositions are authorized: a zero upper bound
for one side becomes a zero lower bound for the other. It is not an exact draw
until both bounds agree. Advisory eval never establishes a proof bound.

Read C4-0001, C4-0006, C4-0007, C4-0010, AGENT_LOCAL, the owner findings,
universal strategic algebra, nested dependency closure, native winspace results
and the frontier hidden-assumption audit. Historical claims were reconciled
against actual source. Local and remote branch heads agreed at
56b09a03affdf29c0c9a02b69eff4ab798b91cb6 before this continuation; existing
uncommitted hot-path and independent qualification work was preserved.

## Reassessment and selected bounded profile

A complete CPC/NDC implementation cannot be manufactured by treating row parity
as unconditional ownership. The selected first profile compiles a concrete,
jointly executable response policy into support and residual masks. It consumes
the research's response-resource, event-order and blocker-coverage primitives.
The connection to earlier Claimeven/vertical-response reasoning is prior-work
context; named rule classes are not runtime state.

This profile has a fixed implication schedule, so no dynamic queue is necessary:

```text
every remaining column length is even
  -> partition future events into adjacent lower/upper pairs
  -> defender can answer each attack immediately above it
  -> each upper event is protected from the attacker
  -> coverage of every attacking residual requirement
  -> mover-relative upper bound 0
```

No response-policy branching, simulated future moves, per-state certificate
objects or per-class proof cache is added to production. More general conditional
dependencies still require the research's incremental dirty-fact queue or a
proved equivalent generated schedule. This one profile is not full NDC.

## Proof and scope

Assume a reachable, not-already-won state. In every column, H-h is even. Pair
the remaining cells as (h,h+1), (h+2,h+3), and so on. The current mover is the
attacker for this proposition; the opponent is the responding defender.

After any attacker placement, the next cell in that column exists and is legal.
The defender occupies it immediately. Every column again has even remaining
length. Thus the response resources are disjoint, gravity order is satisfied,
and the policy remains executable after every hostile attack. A defender win
ends play safely; otherwise the induction continues until exhaustion.

An attacker cannot complete a requirement containing one of these upper cells:
before its paired attack the cell is inaccessible; afterward the defender
occupies it on the immediate reply. If every active attacker requirement contains
such a cell, no earlier attacker win is possible. This proves an upper bound of
zero for the side to move. Combined with opponent residual exhaustion, it proves
a draw. It does not by itself establish a defender win.

The top cell's parity determines the upper rows only under the full even-length
guard. Cells irrelevant to winning requirements still participate in the guard.
No tempo reservoir is silently discarded. Empty requirements versus an empty
family retain their distinct meanings.

The premises are entirely derivable from this profile's exact q support and
residual classes. Therefore ordinary q-keyed WDL bounds are valid for reuse.
This does not authorize caching richer reserved-resource/deadline certificates
under q alone. Strategic coverage does not mutate physical residual identity.

## Execution and ownership

- `quotient-native-negamax-support-layout-kernel.mjs`: the packed support owner
  exposes the even-remainder guard as one mask comparison over existing height
  bits. Table layout computes the same predicate through owned landing data.
- `quotient-slot64-residual-pool-v2.mjs`: exact inclusion in a compiled term mask
  reads the existing canonical chunks, including after reference/payload growth.
- `quotient-paired-response-closure.mjs`: compiles covered vocabulary terms once
  and combines the support guard with exact residual coverage. Retained typed
  storage is 80 bytes per kernel, zero bytes per state/class. The ten slot64
  chunks already constitute the finite requirement representation.
- `quotient-native-negamax-slot64-residual-kernel.mjs`: consumes the proposition
  through the existing frontier bound interface, including draw intersection.
  The production default enables this profile; `responseClosure:false` is a
  bounded control. Invalid option values fail closed.

Eval remains the existing player-relative live-line mask intersection/popcount.
Ordering, proof-hint tie-breaking, split depth, worker count and root trigger are
unchanged. No additional scorer or unconditional parity detector was introduced.

## Qualification and review

The independent physical oracle checks all 1,529,805 reachable states across
4x3 connect-3, 4x4 connect-4 and 4x5 connect-4. It checks the support guard,
coverage proposition, exact WDL and all published bounds, without using solver
results as reference authority. It visits every legal physical successor; its
unpruned tree-size figure is counted by dynamic programming, not timed as an
exhaustive tree traversal.

The profile certifies 69,754 states with nonempty attacking residuals; 50,661
have no local terminal/forced result. Dropping the support guard would wrongly
exclude wins in 237,610 checked states. Zero accepted-certificate/WDL mismatches.

Cold/warm, ETC-off/on window checks remain exact. Separate standard-board
controls generate late legal 7x6 positions, enumerate hostile attacks against
the response strategy, compare with an independent full-WDL oracle and test
shared-TT Negamax windows. High-u32 response cells are exercised. These are
bounded late-position solves, not another empty-board solve.

Root comparisons with identical eval, ETC disabled and local proof storage:

| Board | Calls without response closure | Calls with closure | Expanded without / with |
| --- | ---: | ---: | ---: |
| 4x3 connect-3 | 65 | 64 | 27 / 27 |
| 4x4 connect-4 | 4,332 | 3,745 | 2,064 / 1,825 |
| 4x5 connect-4 | 24,873 | 23,527 | 11,303 / 10,756 |

Paired local Node 26.7.0 measurements use two warmup pairs and nine measured
pairs, alternating order, with cold kernel/arena per observation. On 4x5, median
solve time is 57.58 -> 56.38 ms with 65,536 TT entries and 70.17 -> 64.71 ms with
4,096 entries. Median totals including setup are 60.20 -> 58.40 ms and
71.79 -> 66.28 ms. These are bounded local observations, not standard-root
speed predictions or proof that every geometry benefits.

Two initial qualification failures were resolved explicitly. The representation
campaign expected equal node counts while enabling extra closure on only one
side; it now disables response closure in that comparison and retains its count
assertions. Production closure receives separate independent qualification.
The replacement campaign exposed JavaScript -0 at the public root-action boundary;
both Negamax adapters now expose canonical +0 draws. Bound direction remains
metadata and is never inferred from the sign of zero. A regression test covers
both adapters. These were harness-scope and result-representation issues, not
incorrect WDL or permission to discard failing checks.

## Proof-reuse findings

Diagnostic maps observe public proof ports only and never answer proof requests.
They add overhead; their elapsed time is not a performance measurement.

| 4x5 control | Calls | Replacements | Misses after earlier publication |
| --- | ---: | ---: | ---: |
| 4,096 entries; closure off | 29,915 | 12,013 | 3,033 |
| 4,096 entries; closure on | 27,695 | 10,937 | 2,587 |
| 65,536 entries; closure off | 24,873 | 0 | 0 |
| 65,536 entries; closure on | 23,527 | 0 | 0 |

Each warm exact-root repeat uses one call and zero expansions. A miss after a
prior publication establishes absent retained identity, not that the prior
bound would resolve the new window. The same bounded experiment shows increased
work under capacity pressure. It does not prescribe a larger standard-root arena
or a replacement policy without byte-budget and useful-proof evidence.

## Preserved hot-path packet

The earlier authorized edits are retained: one coherent three-field proof read,
reused Float64 scratch preserving invalid-value detection, scalar handle/victim
selection, removal of temporary interval/mask tuples and publication closures,
and a nonblocking atomic proof-record read while a same-generation writer holds
the descriptor stable. Writer/replacement exclusion and poisoned-slot lifecycle
remain intact. Structural closure, pruning, replacement, worker and storage
qualification cover the combined source. Write-side contention and asynchronous
reporting are still separate unfinished work; this packet does not claim all
Atomics.wait calls are removed.

## Cleanup and next owner

Evidence is in `evidence/2026-09-12-response-closure/`, with source fingerprints
and immutable payload hashes. All affected bounded workflow import paths include
the new closure source; tests and measurement steps are wired explicitly.

Next: qualify richer conditional response/resource/deadline dependencies using
the same coverage interface; measure whether lost proofs were sufficient for
revisited windows before changing retention policy; repair live running-worker
counter reporting through bounded asynchronous handoff. Eval policy stays fixed.
The full-root trigger remains unchanged and no new root is admitted. The single
paired response profile does not solve the missing early-game closure problem.
