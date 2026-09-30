# Independent bounded revalidation oracle

Owner: `research/semantic-quotient`; this worktree is staging only. No promotion,
new discovery, sealed-carrier execution, or authority change is authorized here.
RS096 remains HOLD and OOO claims remain provisional.

The runnable production allowlist is exactly 6x3-k3, 4x5-k4, 6x3-k4. An explicit
test-only switch additionally permits boards with at most nine cells. Sealed
3x6-k4 and 5x3-k4 cannot pass either branch of the allowlist.

## Mathematical contract and independent mechanisms

The current semantic authority is CONNECT4_LOGIC_AUTHORITY_1_2 with its immutable
manifest. The bounded late algebra is described in the dated late-components
ISOGRAPH_FULL_DECOMPOSITION_0_1.md sections 2–3. This oracle does not turn that
bounded research model into standard-board or unbounded authority.

* Physical states: a row-major ternary cell vector. Enumerate one reachable rank
  at a time breadth-first, stopping at the first completed K-run or board full.
  The comparator uses row-major player masks only as a serialization adapter.
* Terminality: inspect maximal equal-player runs directly in four lattice
  directions; no shared winning-mask code. Winning line residual geometry is
  generated separately by endpoint pairs whose step is an integral unit vector.
* WDL: memoized recursive side-to-move negamax, terminal previous-mover win -1,
  full nonwinning board 0. Export absolute WDL +1 player0, -1 player1, 0 draw.
* T2: physically try legal drops. W means an immediate mover win. Otherwise L2
  means every legal child allows an immediate opponent win. Otherwise O.
* q: owner-unblocked line empty-cell sets, unique and minimal under inclusion.
  Export numeric residual masks sorted ascending, with exact support heights.
* R: a bipartite matching from requirement cells to distinct owner's future
  alternating slots. Cell (c,r) has earliest slot r-h[c]+1; slots cannot exceed
  total remaining board capacity. This independently implements the reference
  relaxed schedulability predicate, not unrestricted physical realizability.
* F: form all legal frontier cells except mover singleton wins AFTER R; remove
  opponent residuals containing that complete set (including empty-set logic).
* G: collect top cells of nonfull columns; remove residuals of the player who
  does not own the final global move that contain all those caps.
* Components: flood-fill the column co-incidence graph, including isolated/full
  columns. Canonicalize exact local heights and owner-labelled residual masks
  over lexicographic permutations. Canonicalize ROLE_CAPPAR independently from
  the original component using relative depths and role-attached capacity
  parity. ZOE omits zero counts and emits O for odd, E for positive even.
* OOO: unique structural ZOE signatures define constant, presence/oddness,
  degree-two products, and three-distinct-oddness products. Compute the lower
  feature left-kernel image in OOO coordinates using BigInt elimination with
  least pivots and a canonical reduced row-echelon certificate. No WDL labels
  enter this construction. Semantic descriptor-text columns make its hash
  invariant under legacy encounter IDs and dependency basis selection.

## Explicit semantic discrepancy and independence boundary

The decomposition prose says F applies absorption to the mover's family. The
reference `run-ooo-sign-channel-coupling.mjs` removes opponent residuals. This
oracle freezes the explicit reference transformation described above, pending
owner disposition. Qualification: PROSE_IMPLEMENTATION_REFERENT_MISMATCH_OPEN.
Discovery: NO_NEW_DISCOVERY_REQUESTED. No source prose is silently repaired.

This is separate code with no imports from the legacy research harness. The
author read its serialization and frozen R/F/G/T2 definitions to define the
comparison contract. It is therefore independent implementation evidence, not
a blind independent rediscovery of those definitions or their mathematical
validity. Exact component lexical certificates deliberately share the same
representation convention. Exhaustive agreement remains bounded empirical
evidence. OOO dependency bytes differ under arbitrary bases, so compare the
semantic-column canonical image hash and also preserve source dependency hashes.

## Durable run protocol

The runner writes source/config/head identities before work, immutable rank
checkpoints, completed value storage, sorted row shards, structural signatures,
and stage progress. Restart reuses only source/config-identical artifacts.
Each completed shard is independently durable; interruption can lose at most
the current shard or current enumeration rank. All temporary outputs use the
independent prefix and remain in this staging evidence directory.

Do not claim all three carriers qualified from toy tests, compilation, equal
counts, source hashes, or a partial state stream. Statewise comparison and the
OOO certificate comparison must report their actual coverage and mismatches.
