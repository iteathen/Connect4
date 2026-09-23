# Current state

Owner-authorized fresh branch: `work/isomax-jsminsys-rebuild`.
The former execution implementation remains in its historical branches.

Implemented: exact shared TT; in-place branch publication; retained worker
continuation; exact max/min branch reconciliation; deterministic root witness;
global edge retirement; bounded host/thread lifecycle and failure cleanup.

Qualified so far: component tests, real 1/2/4-worker ranked DAGs, randomized
oracle comparison, abort/death/deadline/capacity controls, static hot-call-graph
detector and deliberately bad detector control.

Not yet claimed: native Connect Four kernel integration, full-game correctness,
performance superiority, JMS-SEALED or complete NEES-EXTREME conformance.
The dynamic kernel boundary remains unqualified. The benchmark is an execution
fixture baseline only. See the NEES profile for the explicit remaining debt.

Native RBA design has been revised following owner review. JSMinSys is pinned
to round 100 (`64ba37a1`). See `docs/design/rba-native-integration.md` for the
support-local coordinate, action transport, q-layout, arena and outcome contracts.

Next implementation unit: native standard-7x6 RBA coordinates and cofactors,
independent differential tests and complete hot-operation cycle accounting.
Do not start four-front construction before representation qualification.
The existing executor still has its 42-word fixture payload and 1..5 protocol;
replace all consumers coherently when integrating the qualified native layout.
Strict JSMinSys extends through every hot helper. Full cycle totals and full
transitive conformance remain outstanding; current symbolic accounting is not
completion of either requirement. Qualify the complete kernel + worker/TT/manager
unit before presenting measurements as IsoMax solve scores.
