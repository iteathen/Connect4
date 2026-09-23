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

Next implementation unit: a fresh native WSL kernel honoring the existing
gameplay specs and this execution contract; qualify the complete kernel plus
worker/TT/manager unit before using its measurements as IsoMax solve scores.
