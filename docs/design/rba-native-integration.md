# Native RBA integration — directional review

Status: implementation contract, revised after owner review. Coordinates,
cofactors, the eight-word ABI and bounded four-front construction exist.
Production fallback is forbidden and removed. See STATUS.md and native qualification evidence for
coverage and limits; design statements alone are not qualification evidence.

Execution substrate: JSMinSys round 100 at
`64ba37a11522b533a1de87942a14921fe690ef86`, under NEES Draft 0.5 at
`7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.

## Intended result

Build Connect4 Residual-Lattice Boundary Algebra as the native computation
behind the new worker, shared TT and BranchManager. It must operate on residual
winning requirements and their relational boundaries, not reconstruct an
occupied-cell board inside the solve loop. The existing three components are
execution infrastructure, not an already implemented RBA system.

This is a fresh implementation using pinned JSMinSys and NEES. Historical
implementations inform tests and failure cases; they will not be imported as
the new kernel. BSFP remains outside this work.

## Research checked for this direction

Live canonical research fetched at
`cbcabb74adb945dcd9ab71ae8ab9cb17b79e4eff`.
Live Isometric fetched at `1f98d7b15eefdc5cf032f6f6bcb4bb71b51a02b1`.
Execution rebuild starts at `f4cdf4ccf1c7336fee41fcc759558a7611910fbe`.

Actual research read, under
`research/isograph/discovery/2026-09-18-policy-frontier/`:

- `COFACTOR_UPSET_ADJOINT_CHECKPOINT.md`
- `RBA_RELATION_REFINEMENT_CHECKPOINT_0_1.md`
- `RBA_FOUR_FRONT_BLOCK_CHECKPOINT_0_1.md`
- `RBA_ALGEBRA_CORE_CHECKPOINT_0_1.md`
- `RBA_NATIVE_SEMIRING_CHECKPOINT_0_1.md`

Also read successor `CONNECT4_POST_1_1_RBA_OVERLAY_0_8.md`,
`CONNECT4_RBA_QU_0_15.md`, and the live solver's
`docs/decisions/2026-09-19-isomax-rba-update-alignment.md`.

These are research evidence, not silently promoted accepted specifications.
This is not a claim that the entire research corpus has now been read. Further
operator-specific material and controls must be read before their implementation.

## Representation and identities

At support S, residual shapes form the inclusion poset P(S). A normalized
requirement antichain A denotes the upset Up(A). The native coordinate algebra
is therefore the distributive lattice Upsets(P(S)). A q retains BOTH players'
coordinates and support, with first-win terminal distinctions.

RBA v0 explicitly selects standard 7x6. Its stable global vocabulary is the
625 distinct nonempty subsets of the 69 winning lines. Global IDs describe
meaning; they do not prescribe 625-bit hot coordinates. Freeze the deterministic
ID ordering in the selected profile and qualify it independently.

The executable basis is support-local. Specifically, P(S) consists of distinct
nonempty `line minus occupied support` residuals of the 69 lines, ordered by
global shape ID. It is NOT every globally enumerated shape disjoint from S.
This distinction is present in the native research prototype
`rank33-lattice-boundary-control.mjs`. Therefore the basis has at most 69
elements, needs at most three uint32 lanes per player, and is determined solely
by S. The observed 21–40-element late fibers are examples, not a universal bound.
No worker-local pool/class ID contributes to q equality.

A cofactor S -> S' maps directly between these deterministic bases. Reflection
maps global shape IDs and then their local positions. Neither operation
reconstructs a colored board. Prepare immutable incidence, principal-upset,
cofactor and reflection data before the hot operation that consumes them.
Derive the selected local basis into fixed scratch within the cofactor when
needed; charge this work explicitly rather than allocating a per-support cache.
Preparation capacity and cost remain visible; do not assume that preparing
the entire empty-root support cone is free or accept hidden hot preparation.

Qualification must compare local packing with the global-width control at the
whole operation. Local packing is the first implementation candidate, not an
unmeasured claim of a 10–20x speedup. Two uint32 lanes suffice for a physical
cell mask, but not for all q coordinates or boundary artifacts. No BigInt,
text identity, per-node aggregate allocation or hot storage growth is admitted.

q identity, value-boundary identity, proof identity and execution generation
remain distinct. A favorable-state comparison must preserve the paired player
coordinates; independent projections cannot discard their correlation.

### Semantic types (not hot object constructors)

- `ResidualCoord`: one upset of P(S), equivalently one minimal residual
  requirement antichain. Its elements are residual shapes.
- `QCoord`: support, both player coordinates and required terminal distinctions.
- `FrontGenerator`: one paired q coordinate at a fixed support, in favorable
  P0 order; it is not a single residual requirement.
- `Front`: the minimal generators of an upward region of paired q coordinates.
- `FourFront`: LD, LW, UD, UW at one support, all in fixed P0 value coordinates.
- `ActionFourFront`: those regions indexed by actions in the parent canonical
  frame; action information survives value closure.

These names specify meanings and prepared numeric spans. They do not authorize
hot objects, classes or dynamic aggregate construction. Semiring products act
on FrontGenerators, never on the residual-requirement antichain as though it
were a value front.

### Cold-selected q-layout contract

Before replacing the payload, one selected standard-7x6 layout owns all offsets,
lane bounds, support/rank encoding, flag meanings, reflection permutations,
hash/equality spans and child-output stride. Bind it at preparation, with
constant-specialized hot functions rather than per-node generic dispatch.

The initial candidate is an eight-word fixed TT envelope: word 0 holds seven
3-bit heights in bits 0..20 and validated derived rank in bits 21..26; word 1
holds declared terminal/sentinel flags; words 2..4 and 5..7 hold P0 and P1 local
coordinates. Rank equals the sum of heights; side is rank parity for admitted
legal roots. Invalid ranks, padding or flags are rejected at cold ingress.
Unused coordinate words/tail bits and reserved header bits are zero. TT hashing
and exact comparison cover all eight words; front operators visit only the
active `ceil(|P(S)|/32)` lanes. Hash remains only a locator. Basis/version is a
session-level invariant, not a second mutable q authority.

This layout replaced 42 everywhere in one qualified payload change: TT,
worker `7 * stride` scratch, root ingress, rank extraction, manager polarity,
fixtures and reporting. No mixed old/new interpretation or compatibility shim.
The fixed envelope avoids per-row allocation while local front operators avoid
global-width work; its retained padding cost must still be measured.

### Canonical frame and action transport

The existing executor expects canonical input; it does not canonicalize q.
Root ingress and the native kernel must establish this precondition. Compare
packed support first as in JSMinSys round 098. If support ties, compare complete
reflected P0 then P1 coordinates in their deterministic local bases. Exact
full-q ties select orientation 0. Flags reflect according to their semantics.
Do not use proof/retrieval orientation as gameplay orientation.

Columns are 0..6 in the parent canonical frame. An edge action and every
ActionFourFront index use that frame. A child canonicalization flip transports
subsequent child actions by `c -> 6-c`; it does not change the parent edge's
landing column. Macro continuations compose orientation flips by XOR. Support
ties require the secondary coordinate comparison, not an arbitrary worker choice.

At an external root, transport candidate actions back to the caller frame
BEFORE applying the required center-first tie order `[3,2,4,1,5,0,6]`. Merely
mirroring one canonical tie-selected witness is insufficient. Store root
orientation as execution context and let witness reconciliation account for
caller-frame priority; q equality remains unchanged. Fully symmetric roots
can have tied moves: require deterministic caller-frame selection and correct
value, not impossible strict reflection covariance of a chosen off-center tie.
The executor now applies caller-frame priority before final witness transport;
a regression test covers the formerly incorrect final-only mirror behavior.

## Algebra to implement

1. **Support-local lattice and terminal-extended cofactors.** Own placement
   removes the landing cell from requirements; opponent placement kills
   requirements containing it. A singleton own completion reaches absorbing
   WIN_NOW. Normalize by the actual subset relation, retaining first-win stopping.
2. **Coordinate preimages.** Implement the right adjoint for greatest <=
   preimages and exact minimal principal-cover frontiers for >= preimages.
   Cofactors preserve joins; they are NOT assumed to preserve meets. Use the
   shared uncovered-target cover recurrence where its qualification applies.
3. **Extremal-antichain semiring.** Upward regions compose by minimal union
   and minimal pairwise join. Use immediate local skyline absorption before
   global absorption; do not materialize a full Cartesian product. The dual
   maximal-meet form is a representation choice with an explicit mapping.
4. **Four-front partial value carrier.** Represent lower>=draw, lower>=win,
   upper>=draw and upper>=win, including nesting/consistency checks. Transform
   lower and upper independently with the correct player polarity. Retain
   action-specific boundaries for exact move selection.
5. **Alternating boundary composition.** Combine existential action choices
   and universal opponent replies through exact cofactor preimages. Preserve
   early-terminal/prefix guards. Do not replace the mixed-cover operation with
   a false join/meet homomorphism or flatten to an unguarded Upper-only model.
6. **Native query and closure.** Query the paired coordinates at their exact
   support. Publish exact WDL only when lower and upper agree. Unknown, missing
   coverage, incomplete construction and exhausted capacity supply no exact
   result and no proof certificate.

Ordinary value closure is not NDC proof closure. Reservation, deadline,
intervention and realizability premises are not erased by an RBA value result.

### Fixed polarity and four-front diamond

All values are P0-valued (-1 loss, 0 draw, +1 win), independent of mover.
Favorable order at the same support is `U0 subset U0'` and `U1 superset U1'`.
Join is `(U0 union U0', U1 intersection U1')`; meet is its dual. Complementing
P1 within the valid basis mask converts this to ordinary subset bit order,
provided padding is masked. Both coordinates retain their correlation.

LD means lower >= DRAW; LW lower >= WIN; UD upper >= DRAW; UW upper >= WIN.
Required inclusions are `LW subset LD`, `LW subset UW`, `LD subset UD`, and
`UW subset UD`. LD and UW are generally incomparable. Test this diamond rather
than imposing a four-element chain. P0 choice takes componentwise maxima of
scalar interval endpoints (union of threshold regions); P1 takes minima
(intersection). There is no implicit mover-relative negation.

### Terminal-extended cofactor

The coordinate cofactor is total into the child upset lattice extended by a
fresh WIN_NOW top, distinct from the ordinary full upset. Own singleton
completion maps there. On a legal paired transition it short-circuits the game
immediately: no ordinary child q is interned and no opposite-coordinate later
completion competes with it. Already terminal roots cannot produce moves.

For an ordinary child target V, the right adjoint joins parent principals whose
cofactor image is <= V; terminal-producing principals are excluded by that
inequality. For target WIN_NOW, the right adjoint is the full parent upset.
For >= principal covers, a terminal-producing principal covers every ordinary
target and WIN_NOW. No union of exclusively nonterminal images reaches WIN_NOW.
An empty ordinary target has the empty-coordinate cover. Absorb minimal covers
with these rules, never by silently treating full ordinary membership as top.

### Boundary storage and kernel outcomes

The first producer uses worker-private, preallocated boundary arenas. A worker
owns reservation, construction and reuse; live continuation/front references
prevent reuse until released. Cancellation discards only worker-owned artifacts.
No arena reference is published in TT topology. The TT owns q and exact values;
an arena owns derived boundary artifacts, not a second q identity/value authority.
Duplicate construction is measured before considering shared immutable arenas.

Before attaching an RBA producer, extend the numeric kernel protocol explicitly:

| Outcome | Meaning and disposition |
|---|---|
| EXACT_P1 / EXACT_DRAW / EXACT_P0 | Exact value, only after semantic closure |
| BRANCH | Genuine unresolved choice, published through existing ownership |
| CONTINUE | Retained local execution with a valid next step |
| BOUNDARY_INCOMPLETE | Bounded producer stopped before coverage; no exact value |
| BOUNDARY_CAPACITY | Arena exhausted; explicit failure, no alternate solver |
| QUERY_UNCOVERED | Valid completed artifact does not cover this query |
| CANCELLED / INTERRUPTED | Stop or discard private continuation at its control boundary |

Assign distinct numeric codes and test worker/manager/host handling together.
The implementation extends the original 1..5 protocol with 6..9. Non-WDL outcomes cannot
be coerced into CONTINUE, CONTRACT, a draw or a retry that resets the deadline.
There is no fallback admission or selection outcome.

## Execution integration

Workers read their claimed q directly from shared TT storage. The native kernel
uses exact terminal/boundary consequences. The manager does not evaluate the game
or reconstruct q. Nonclosing queries retain state/action intervals and continue
via exact native cofactors and shared-TT dependencies. This is the primary RBA
solver, not an alternate solver or representation. See rba-native-continuation.md.

Owner direction supersedes the historical permission for recursive fallback.
Independent recursive reference solving is test-only. Production continuation
retains scalar state/action bounds in the existing shared TT and propagates them
through RBA child q dependencies. Full boundary-artifact retention/recomposition
remains unimplemented; no claim is made that scalar propagation implements it.

Boundary-construction capacity and q execution capacity are separate resources.
Prepare both before entry and preserve explicit incomplete/failure outcomes.
Do not increase the 120-second solve ceiling to conceal an algebraic or
representation explosion.

## Strict JSMinSys and total-cycle qualification

Every E0/E1/E2 path and transitive helper must use only the pinned JSMinSys
admitted data, operations and blocks. Compose domain operations from that
substrate; no unrestricted helper escape, hand-written native escape or silent
deviation. Cold preparation/reporting is explicitly outside this scope. Extend
the mechanical call-graph check to the actual kernel; an open call boundary is
not a JSMinSys seal. Preserve hot-contract comments through all callees.
Strings, string indexing/conversion and formatting are forbidden throughout
the hot call graph. If character data is necessary, use preallocated indexed
numeric character-code arrays; rendering belongs to cold reporting.

Each hot function, loop and complete operation requires a NEES cycle ledger:
executed operation counts, loop trip counts, conditional/short-circuit paths,
transitive calls, loads/stores, address work, branches, atomics, failed claims,
publication, retirement and reclamation. Produce path totals and the whole
worker–TT–manager total, without counting a helper both inline and as a call
body. Report fixed/ranged terms, unresolved symbols and unbounded waits.
Unknown cost is never zero. Lowering must be supported on the stated Node/V8,
CPU and locality/contention scenario; Zen 3 reference costs are not measured
Intel i5-12600K cycles.

Record both the NEES static serial total and, where hardware/OS support allows,
measured active CPU cycles for the complete operation. Sum active cycles across
workers and manager separately from critical-path elapsed time and blocked
time. Do not derive actual cycles by multiplying wall time by nominal GHz.
Unavailable counters or unresolved lowering mean an incomplete cycle result,
not permission to claim a closed total. Record instrumentation overhead and use
uninstrumented timing controls; no per-node clock calls or rich hot reporting.

Compare cycles per operation AND total qualified work/cycles, so reduced
enumeration can justify a locally dearer operation. Cycle accounting is part
of each implementation checkpoint, not a deferred documentation exercise.
The executor now has measured total-cycle qualification for declared native
scenarios, alongside the analytical symbolic ledger. See the native qualification
report; neither repinning JSMinSys nor timing one fixture certifies every path.

## Implementation and qualification sequence

1. Prepare the standard shape vocabulary, support incidence and exact lattice
   mappings. Independently reconstruct residuals from physical winning lines
   in tests only; check legal prefixes, reflection and first-win stopping.
2. Test cofactor/adjoint laws and minimal-cover preimages on complete small
   fibers, including terminal top and a meet-preservation counterexample.
3. Test streamed semiring products against explicit finite products, including
   mixed reply covers, bit-31 boundaries and carriers wider than 64 bits.
4. Qualify four-front/action-front composition against independent finite
   interval evaluation; include the research's early-terminal negative control.
5. Integrate native transitions and RBA closure into real 1/2/4-worker solves.
   Check WDL and deterministic reflected root moves against a physical oracle
   on bounded legal late positions. Preserve the existing lifetime/failure tests.
6. Reproduce selected persisted boundary controls before claiming research
   algorithm parity. Measure construction, query, residual transitions,
   incomplete outcomes, memory, contention and total operation separately.
7. Extend the hot-call-graph audit through the actual native kernel and its
   transitive helpers; qualify the complete unit under NEES Draft 0.5 and
   JSMinSys, without treating fixture tests as full conformance.

The first code checkpoint is native coordinates and cofactors only, with
independent physical-line differential tests, full first-win controls, reflection,
cross-worker deterministic bases, padding/bit-31/>64-bit cases, exact equality
and cycle accounting. Prove transition commutation before changing the active
TT payload. When changing that payload, qualify every consumer together. Do not
start four-front construction until this representation checkpoint passes;
implement the numeric protocol before its producer. Commit each coherent unit.

## Decisions this review should catch

- RBA becomes native representation and algebra, not merely an optional lookup
  adapter bolted onto an inherited solver.
- The TT's current residual payload may change to avoid recurring conversions;
  there will still be one canonical shared q authority.
- Both player coordinates and support remain load-bearing. Path-conditioned
  contraction is not promoted to an unconditional gameplay quotient.
- Four-front composition and exact preimages are required, not just tactical
  residual checks renamed RBA.
- Empty-root compactness and fast global boundary construction remain research
  questions. No empty-board solve or universal performance claim is implied.
