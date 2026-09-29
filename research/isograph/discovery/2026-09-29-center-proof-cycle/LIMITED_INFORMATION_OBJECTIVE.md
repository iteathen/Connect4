# Correction: prove the nominated continuation, not rediscover its answer

Owner clarification: the externally known center sequence `44444` motivates
the question. Re-solving it is not the requested optimization. The deliverable
is a sufficient certificate derived from geometry, rules and limited search
for the center continuation at the standard 7x6 prefixes `44`, `444`, `4444`.
The prior result is not a premise, a leaf label, or a strategy oracle.

## Required conclusion

Nominate action 4 (one-based) as a conjecture to prove. A nomination carries no
value information. For mover-relative action bounds [L(a), U(a)], all derived
from checked rules, a sufficient WDL-optimality certificate is

    L(4) >= max U(a), for a != 4.

A forced-win certificate for action 4 is already sufficient because +1 is the
maximum WDL value: no full solution of the alternatives is required. Otherwise
only the bounds needed to discharge this comparison should be constructed.
Uncovered replies remain unknown. The certificate need not establish a unique
best move, and WDL optimality must not be mislabeled as distance-optimality.

## Information and verification boundary

The producer may use the literal prefix, geometry, legal support, alternating
turns, first-win stopping, freshly derived residual requirements and bounded
partial-search consequences. It may propose conditional responses. A separate
checker must establish legal execution and cover every opponent reply, either
explicitly or by a proved guarded response-family rule. Shared resources,
correlations, timing and first-win conditions must survive composition.

Old solved outcomes, previous exact child vectors and known best-move labels
cannot justify leaves or omitted replies. Validation against them is separate
from construction. Proof size, generation work and verification work must be
reported separately. Polynomial verification alone does not establish
polynomial discovery or polynomial-time perfect play.

## Disposition of work already performed

The earlier exact computations are validation history, not this certificate.
The fixed synchronized-response census is a restricted no-attacker-win family.
It found no complete certificate at these roots/children. At `44` and `4444`
its best policies leave eight horizontal requirements uncovered. This neither
proves nor disproves the nominated center continuation. Do not expand that
family merely to obtain more negative counts; a next rule must explain how it
discharges an actual missing obligation in a sufficient action certificate.

The C1 deep timing expansion was stopped after owner correction. Its preserved
performance evidence remains separate; it cannot answer this proof question.
No new solver, TT representation, worker field or hot-loop change follows from
this scope correction.

Next research work belongs to GSP-004 guarded obligation closure: recover the
existing admissibility/intervention/resource/deadline lemmas and identify the
smallest missing sufficient certificate for the nominated action. Increasing
full-search repetitions is not a substitute.
