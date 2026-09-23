# Current state

Owner-authorized fresh branch: `work/isomax-jsminsys-rebuild`.
The former execution implementation remains in its historical branches.

Implemented: exact shared TT; in-place branch publication; retained worker
continuation; exact max/min branch reconciliation; deterministic root witness;
global edge retirement; bounded host/thread lifecycle and failure cleanup.

Qualified so far: component tests, real 1/2/4-worker ranked DAGs, randomized
oracle comparison, abort/death/deadline/capacity controls, static hot-call-graph
detector and deliberately bad detector control.

Native standard-7x6 RBA coordinates/cofactors and bounded four-front closure are
implemented. Production fallback remains removed; unresolved queries now continue
through RBA cofactors and shared-TT interval dependencies. Real late-root oracle
tests, including continued traversal, pass at 1/2/4 workers. The selected
eight-word q layout replaces all executor payload consumers; external root
tie priority is applied in caller orientation. Native static traversal has no
open call boundary or detected forbidden materialization/text (not a JMS seal).

The worker-private bounded four-front producer is implemented: exact principal
preimages/right adjoints, terminal guards, streamed local/global skyline
composition, action fronts and exact interval query. Complete small-support
fibers pass an independent residual-array oracle. A complete-horizon native
solve test closes through the fronts. Nonclosing queries retain state/action
bounds and publish relevant RBA children. Exhausted construction budgets return
INCOMPLETE; capacity exhaustion fails explicitly, never WDL. Full boundary-artifact
refinement/recomposition is NOT implemented. Empty-board completion is unproven.

Not yet claimed: empty-root completion, full-game exhaustive qualification,
performance superiority, JMS-SEALED or complete NEES-EXTREME conformance.
The bound native kernel has a closed structural traversal; generic caller kernels
remain open. Full semantic/runtime JMS/NEES conformance is a stronger uncompleted
claim. See the NEES profile for measurement limits and remaining debt.

Native RBA design has been revised following owner review. JSMinSys is pinned
to round 100 (`64ba37a1`). See `docs/design/rba-native-integration.md` for the
support-local coordinate, action transport, q-layout, arena and outcome contracts.

Coordinates have passed independent physical-line differential qualification.
Extended non-WDL outcomes distinguish
incomplete/capacity/uncovered/interruption from exact values.
Strict JSMinSys extends through every hot helper and enclosing worker/manager
loop. `tools/bench-isomax-cycles.mjs` measures process CPU-cycle totals around
prepared hot batches and covered real 1/2/4-worker solves. Numeric measurements
are scenario evidence, not a closed analytical
cycle formula for every possible path. Qualification evidence is persisted under
`docs/qualification/`; no empty-board result follows from late-root measurements.
The earlier Fhourstones evidence remains historical: all four inputs timed out
on the removed fallback. Removal alone is not a solve or a performance win.
