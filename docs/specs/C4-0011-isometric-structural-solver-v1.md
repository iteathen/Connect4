# C4-0011 — Isometric / IsoMax structural solver

**Status:** Candidate solver-semantic specification. Research direction: Josh Oshiro.
This cleanup does not promote status or establish a new theorem.

## Current execution profile

Lazy SMP is the sole active parallel composition. Public solve7x6 delegates to
JSMinSys runLazySmpConnect4Rba32. Each of at least two workers owns a private
RBA/CPC exact alpha-beta search. Only committed exact W/D/L cache evidence is
shared: no tasks, partial bounds, search windows or continuation ownership.
There is no Branch Manager, shared work queue or dependency scheduler.

This replaces shared-q, surplus, retained-pull and pre-JSMinSys scheduling.
Their former specification and design/evidence are preserved in
../history/retired-execution/ and Git history, not alternate production modes.

## Semantic authority

Preserve C4-0001 legal moves, support/gravity, alternating play and first-win
stopping; C4-0006 residual/control-parity meanings; and C4-0007 guard, timing,
resource and proof requirements wherever stronger certificates are consumed.
Canonical research remains owned by research/semantic-quotient. The consumed
Connect4 logic authority 1.2 manifest remains scoped to revision
21cfe24af925a2eceaadccac494cacc87b0faf6f and manifest blob
5f401c93f8ea653fd3bc96e386b08ef7d92c519e. Do not silently generalize historical
qualification to another implementation.

Ordinary gameplay identity is support plus both normalized player residual
coordinates. In legal alternating nonterminal states, rank follows support and
turn follows parity. First terminal transitions emit terminal tokens. Reflection
is a separate quotient with action transport c -> columns-1-c. WDL reuse does
not license untransported action reuse. Hashes locate; full canonical content
establishes equality. Cached derived fields may remain for execution economy.
No physical, history or proof identity is inferred from gameplay equality.

Coarse structural similarity locates candidate knowledge only. Stronger proof
reuse requires an applicable transported conclusion with its support, timing,
resource and realizability guards. Unknown guards remain unresolved. Missing
evidence or failed progress is not draw/loss. Proof identities cannot silently
identify different conclusions, payloads or premises.

## Native representation and transitions

Cold ingress converts the external legal root once. Workers thereafter use
support-local RBA coordinates and native cofactors, without physical-board
reconstruction, root replay, legacy residual-pool state or an alternate solver.
The library derives geometry, stable shape IDs, support-local basis, coordinate
widths, reflection and specialization at initialization. IsoMax selects 7x6;
that selection is not a universal library ABI. The vendor gitlink owns the
current physical layout, not the old 42-word/eight-word/pool-ID designs.

Own requirements containing the landing cell contract; opposing requirements
containing it disappear. Normalization preserves the upset coordinate. The
first completed own requirement terminates immediately. Later wins cannot
compete with it. Support/basis transport must commute with legal transitions
and reflection. Restoration remains native.

## Exact closure and search

Qualified CPC/structural consequences precede unresolved traversal. Immediate
current-player wins supersede opponent threats. Two distinct playable opponent
winning cells imply loss when one placement cannot answer both; one forces its
defense without itself establishing WDL. Bilateral residual exhaustion is draw.
Stronger temporal/parity conclusions require their qualified guards.

Unresolved q continues through native RBA cofactor search. This is the primary
solver, not representation-changing fallback. Advisory ordering is never value,
bound, pruning or certificate authority. Current ordering uses live winning-line
contribution after CPC restrictions, with prepared action-order ties. Auxiliary
line multiplicity is not gameplay identity. Four-front algebra remains a
qualified refinement/reference facility; incomplete front work is not evidence
of exactness and is not another distributed scheduler.

Alpha-beta windows remain private; only globally exact q values enter the shared
cache. Public WDL is P0-oriented: +1=P0 win, 0=draw, -1=P1 win. Exact nonterminal
results require a legal value-preserving caller-frame move. Reflections and ties
must be qualified; worker completion order cannot authorize an invalid witness.

## Lifecycle and cost boundary

Default workers=2 and shared sampling mask=7. More workers do not imply speedup.
The deadline stays <=120 seconds. Timeout, cancellation, capacity failure and
worker death cannot fabricate WDL. All owned workers must exit or be terminated
and joined before cleanup is complete.

NEES Draft 0.5 at 7650bef0aecc0d2b226ecf253a1f8937ccf89d69 governs realization;
components/isometric/NEES_PROFILE.md maps the current scope. JSMinSys owns the
native execution and cycle catalog. Hot operations use prepared numeric storage,
without strings, per-node allocation, promises, structured clone, reporting,
manager RPC or ordinary resize/rehash. Cold initialization and worker lifecycle
are separately accounted. Symbolic costs are not measured hardware totals.
Whole-solve comparisons include all workers, startup, teardown and shared cache,
and report work/node counts separately from clocks and elapsed time.

## Qualification

Qualify transitions, first-win stopping, independent residual/oracle agreement,
reflection/witness transport, full key equality, exact-only shared publication,
failure/cancellation/timeout cleanup and 2+/4-worker execution. Preserve library
generic-geometry controls. Guards reject retired scheduler exports and worker
imports of ingress. Performance changes require repeated paired whole-operation
measurement; removing source alone is not proof of speedup.

Historical results retain their exact revisions and protocols. Finite controls
do not prove exhaustive exactness, empty-board completion, universal speedup,
stronger proof-calculus closure or full NEES certification. BSFP remains separate.
