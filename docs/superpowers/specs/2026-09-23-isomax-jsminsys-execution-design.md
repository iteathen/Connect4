# IsoMax JSMinSys execution rebuild

Status: execution components implemented under the owner's build instruction.
Native-kernel integration and complete conformance remain unqualified; see
`components/isometric/NEES_PROFILE.md` for evidence and limits.

## Purpose and retained authority

Build three new components: a worker, a shared transposition table, and a branch
manager. Start from source written for JSMinSys; do not port the previous
execution system or import its implementation. Preserve the existing IsoMax
gameplay specifications, first-win semantics, ordinary q equality, and proof
identity distinctions. BSFP is outside this branch.

Specification baseline: Connect4
`c906f83aa536d36b3e53bbc7f65678612f82c387`, C4-0001, C4-0006, C4-0007 and
C4-0011, with the shared-TT execution decision as historical contract context.
Copied specifications retain their original status; copying does not accept a
Candidate clause. Earlier execution recipes are not a requirement to recreate
old machinery when a simpler realization preserves the required semantics.

The owner explicitly selects the latest NEES and JSMinSys for this rebuild:

- NEES Draft 0.5: `7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.
- Merged JSMinSys Draft 0.2: `64ba37a11522b533a1de87942a14921fe690ef86`.

These pins replace older performance-standard pins for the new implementation;
they do not change game meaning. Dependencies must be reproducibly pinned, not
fetched from a moving branch at runtime.

## Scope

This change implements the execution components and their native-kernel
interface. A new complete native WSL kernel is a separate implementation unit;
the old kernel must not be silently imported to make integration tests green.
Execution fixtures exercise the production components using small exact ranked
DAGs with an independently calculated oracle. Such fixtures are infrastructure
evidence, not evidence of a completed Connect Four solve.

## Representation and sole authority

The shared TT owns canonical q content, exact WDL, dependency relationships,
execution ownership, and the lifetime of each addressable slot. There is no
manager-private q dictionary, occurrence pool or independent work-slot state.

The standard-board q content is canonical packed support and both exact
20-word residual sets, plus terminal/sentinel distinctions required at the
admitted boundary. Geometry IDs, cell coordinates, row/column and parity remain
globally meaningful; local pool IDs are never substituted for content equality.
Hash and slot are locators. Full authoritative content decides equality.

This describes the implemented execution-fixture ABI. The revised native RBA
layout, deterministic support-local basis, reflection/action transport and
numeric outcome contract are specified in
`docs/design/rba-native-integration.md`. Replace all 42-word consumers together
after coordinate qualification; do not interpret local coordinates as this
original payload. The current executor assumes canonical q input.

Storage is prepared numeric arrays. Configuration and view construction happen
before hot execution. Capacity exhaustion is explicit, never a draw, lossy
authoritative overwrite, hidden growth or permission to enlarge test limits.

Immutable q payload may be read directly while its lifetime is owned. A worker
must not copy/replay a q merely because another worker created it. Private
scratch is admitted only for an actual transition or required local execution
representation, with cost and ownership recorded.

## TT interface and lifecycle

The interface must provide exact probe/insertion, generation-checked retain and
release, claim/release of execution, exact publication and eligible recycling.
Public configuration validates dimensions and storage bounds once. Trusted
numeric operations consume already-established invariants.

Queue items are `(qIndex, generation)` references only. Slot reuse cannot make
an old ticket target new content. Generation exhaustion fails closed before
aliasing. Hash collisions must exercise full content comparisons.

Reference ownership is explicit:

```text
root/session ownership
+ in-flight publication ownership
+ established incoming dependency edges
+ any explicitly necessary live execution ownership
```

A publication's temporary ownership transfers to topology or is released on
rejection. It is not both retained and transferred. There is no interval in
which referenced child data may recycle before publication is consumed.

Recycle only after all real ownership and pending publication are gone, no
worker can still access the generation, and incoming/outgoing topology has
been released. Retirement invalidates necessity, not semantic content. Exact
publication does not prove that its producing worker has stopped accessing q.

## Worker

Prepare the runtime and native-kernel binding once. Workers pull ready q
references, validate/claim ownership atomically, and execute using the shared
payload under that lifetime. They never synchronously request manager approval
to perform ordinary local computation.

The kernel interface distinguishes exact terminal WDL, local continuation,
and an unresolved genuine branch. Unknown, abort, retirement and capacity
failure are not WDL values. Physical action/orientation information remains
available where witness interpretation needs it.

Deterministic/forced progress stays local. A locally retained continuation must
not be unwound merely to package a scheduler message. Exposed branch data uses
prepared numeric storage, published under a region/ownership protocol that
prevents concurrent mutation and reuse. Workers can return to queue polling
without a synchronous manager acknowledgement.

Exposure policy must not repeat the old unconditional all-frontier expansion
mistake. Visibility, useful shared demand and execution ownership are distinct.
The one-worker path must preserve native continuation and avoid unnecessary
cross-thread work publication. Multiworker admission must be bounded and must
not require workers to assign tasks or inspect peer-idle state.

## Branch manager

The manager consumes numeric publication/completion references and organizes
the shared TT. It attaches dependencies, maintains ready ordering, propagates
exact values, applies global necessity/pruning consequences and reclaims
unowned generations. It neither evaluates the game nor reconstructs identity
from replay.

Bounds and exact values remain distinct. Pruning an edge removes that parent's
need, not every parent's need for the child. A shared child needed elsewhere
continues. No cutoff is published as exact WDL.

Root value and deterministic physical move selection have separate completion
conditions. Reflection transport and earlier tied actions cannot depend on
worker completion order.

Worker death must not fabricate a result or invalidate already-published q
content. Recovery may release only ownership actually held by the dead worker.
The implementation must qualify interruption around reservation, pin acquisition,
publication and release—not only death between complete operations. If a
transaction cannot safely recover, fail the session explicitly and drain owned
resources rather than guessing a value or resurrecting a second q authority.

## JSMinSys / NEES boundary

E0/E1 includes native local work and its transitive helpers. E2 includes shared
probe/claim/publication, branch reconciliation, propagation and reclamation.
Session setup, thread construction, configuration and rich reports are cold.
Moving an operation into the manager does not make it cold.

Use admitted scalar operations, typed storage and qualified JSMinSys blocks.
Do not force a block whose contract is too narrow: compose admitted primitives
and record the cost rather than weakening identity or publication semantics.

Successful hot paths have no dynamic objects/collections, string identity,
promises, structured clone, rich diagnostics or storage growth. Scratch ownership
comments extend through the hot call graph and must be preserved.

The target is a mechanically checked restricted call graph. Importing JSMinSys
does not by itself establish JMS-RESTRICTED or JMS-SEALED conformance. The
selected kernel is part of the transitive boundary, not an unchecked escape.

Cost records include probes, compared words, memory traffic, atomic operations,
blocking, copies and generated-code uncertainty. The available NEES Zen 3 cost
profile must not be reported as measured cycles for this Intel i5-12600K host.
Unknown costs remain symbolic; blocking has no invented finite cycle cost.

The owner requires total-cycle ledgers for every hot function/loop and the
composed operation, including all transitive callees and actual loop/path
counts. Strict JSMinSys applies throughout. Static serial cost, measured
active CPU cycles and elapsed time are distinct reporting fields. A partly
symbolic ledger is incomplete cycle qualification, never a fabricated numeric
total or evidence of speed. Native implementation checkpoints must include
this accounting alongside semantic qualification.

## Acceptance and implementation sequence

1. TT: exact collisions, terminal distinctions, cross-worker equality, stale
   references, conflicting exact publication, ownership/recycling and capacity.
2. Worker: real thread claims, numeric outcomes, local continuation, cancellation,
   one-worker bypass, controlled interruption and cleanup.
3. Manager: duplicate/transposed states, max/min closure, multiple parents,
   global necessity, deterministic witness and bounded queue pressure.
4. Integrated production-component tests at 1/2/4 workers on exact DAG fixtures;
   an intentionally broken control must demonstrate detector sensitivity.
5. Full applicable NEES/JSMinSys review and operation-cost record. No conformance
   claim while mandatory rules remain unverified.
6. Performance measurements at the whole worker–TT–manager operation, including
   cold and retained use. Infrastructure timings are not Connect Four scores.

Persist each coherent tested unit. Before writes/commits, re-check the live
branch and preserve concurrent valid work. Do not merge or publish a claimed
solver qualification from infrastructure-only tests.
