# Native RBA integration — directional review

Status: proposed implementation direction, committed for owner review before
product implementation. No new RBA code or qualification is claimed here.

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

The current TT stores 20 words per player but does not prescribe an executable
RBA layout yet. We must not freeze that storage merely because it exists.
The proposed RBA-native carrier is upset membership in the globally numbered
standard residual-shape vocabulary, with support determining valid shapes.
This reuses global shape IDs across workers and avoids translating local pool
IDs or rebuilding a conventional board. Minimal antichains are an equivalent
boundary presentation, not another independently maintained game state.

Before changing the TT payload meaning, prove/test the normalization mapping
and transition commutation. Update its contract and all consumers together;
do not leave two parallel key interpretations. If support-local packing is
later worthwhile, its basis mapping must be deterministic and qualified.

Two 32-bit lanes suffice for physical cell masks; they do not suffice for an
arbitrary residual-lattice coordinate or boundary. Compose as many uint32 lanes
as the configured domain requires. No accidental 32-shape/64-bit ceiling.
No BigInt, text identity, per-node aggregate allocation or hot storage growth.

q identity, value-boundary identity, proof identity and execution generation
remain distinct. A favorable-state comparison must preserve the paired player
coordinates; independent projections cannot discard their correlation.

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

## Execution integration

Workers read their claimed q directly from shared TT storage. The native kernel
uses exact terminal/cofactor/boundary consequences first. Forced progress stays
local. Unresolved choices use the existing retained continuation and bounded
surplus publication; the manager does not evaluate the game or reconstruct q.

The existing specs permit exact native recursion as a fallback/control while
boundary coverage and economics are qualified. That fallback must operate on
the same RBA-native coordinates, not a bitboard adapter. Its node enumeration
must be reported separately from algebraic boundary closure; it is not evidence
that the nonrecursive RBA system has solved the state.

Boundary-construction capacity and q execution capacity are separate resources.
Prepare both before entry and preserve explicit incomplete/failure outcomes.
Do not increase the 120-second solve ceiling to conceal an algebraic or
representation explosion.

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
   fallback work, memory, contention and total operation separately.
7. Extend the hot-call-graph audit through the actual native kernel and its
   transitive helpers; qualify the complete unit under NEES Draft 0.5 and
   JSMinSys, without treating fixture tests as full conformance.

The first code checkpoint should establish the native coordinate/cofactor
representation and its independent tests. It must not be presented as completion
of the four-front boundary producer. Each subsequent coherent unit is committed.

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
