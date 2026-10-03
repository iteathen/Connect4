# CPCX turn-6 equivalence conversation and research provenance — 2026-10-03

**Status:** research-conversation provenance and synthesis; not itself a theorem  
**Active branch:** experiment/cpcx-20261002  
**Research direction / originating turn-6 equivalence insight:** Joshua Oshiro  
**Formalization, executable diagnostics, theorem extraction, and qualification:** OpenAI ChatGPT  
**Production CPC / production solver:** unchanged

## Purpose

Preserve the reasoning that redirected the CPCX turn-6 campaign from deeper forward
projection toward a constrained equivalence / quotient approach.

The important point is not only the resulting code and theorem files. The research
direction came from a specific conceptual observation about the state after the first
five center-column events, and the logic that followed should remain attributable and
recoverable even if later files are reorganized.

This note distinguishes:

1. the originating idea from the conversation;
2. the exact structural facts established afterward;
3. the constrained equivalence that survived falsification;
4. the open proof boundary.

## 1. Background: why turn 6 was the first RLC boundary

The first-five rank-local move calculator used the current landing descriptor:

~~~text
(A,B,H)
~~~

where:

- A = mover-live winning-line incidence at the landing;
- B = opponent-live winning-line incidence denied by the landing;
- H = remaining empty capacity above the landing in the same column.

On the canonical center stack the calculator obtains:

~~~text
empty  -> 4
4      -> 4
44     -> 4
444    -> 4
4444   -> 4
~~~

At prefix:

~~~text
44444
~~~

the center landing D6 is still the unique A/B Pareto maximum:

~~~text
D6 = (6,6,0)
~~~

but H=0, because taking D6 saturates column 4.

The earlier runtime therefore stopped with the conservative boundary:

~~~text
UNIQUE_MAX_EXHAUSTS_COLUMN
~~~

The research question became whether H=0 represented a genuine loss of structural
control or merely a change of representation.

## 2. Joshua Oshiro's turn-6 observation

The originating observation was that Player 2's sixth move from 44444 has only two
structurally different possibilities.

### Case A — Player 2 takes column 4

The move consumes D6 and completely closes the center column.

Player 1 then receives a board on which every off-center column is untouched. In that
sense Player 1 acts on a virgin side substrate, except that the already-existing tokens
in column 4 remain fixed and continue to participate in horizontal and diagonal winning
lines.

The center structure therefore cannot simply be deleted, but it is no longer a live
action dimension.

### Case B — Player 2 does not take column 4

Player 2 places exactly one token in an off-center column.

The center landing D6 remains available to Player 1. The off-center move changes the
board elsewhere, but it does not consume the center resource.

### Core research intuition

These cases are exhaustive.

Therefore the turn-6 problem may not require projection to the end of the game. The
more promising route is to identify an exact equivalence or claim-relative quotient
between the two cases and then reuse the same rank-local / structural logic that
produced the earlier moves.

The center tokens are known to change dependencies. The proposal was explicitly not to
pretend the boards are physically identical. Instead, search for the constraints under
which their differing geometry becomes an exact, reusable correction to a common
structural state.

The working polynomial-time research assumption is therefore:

> seek the smallest equivalence that remains universally true after the center-column
> geometry and parity effects are represented explicitly.

If such a finite exact equivalence cannot be found, ordinary search remains the fallback;
but the research program should first exhaust the equivalence route rather than assume
the geometry difference is irreducible.

## 3. First exact consequence: exhausted-max handoff

Executable diagnostics established the following current-rank facts.

At 44444:

~~~text
D6 = (6,6,0)
~~~

is the unique RLC Pareto maximum.

For every off-center sixth move:

~~~text
x in {1,2,3,5,6,7}
~~~

the exact D6 tuple is inherited unchanged by Player 1:

~~~text
D6 remains (6,6,0)
~~~

and D6 remains Player 1's unique A/B Pareto maximum.

Thus an off-center Player-2 move does not weaken or split the exhausted center maximum.
It passes that rank-local control object intact to the opponent.

If Player 2 instead takes D6, column D becomes saturated and Player 1's RLC Pareto
frontier over the side columns is exactly the reflected pair:

~~~text
{3,5}
~~~

with positive remaining height.

This motivated the candidate concept:

**Exhausted-Max Handoff (EMH):**

A unique Pareto maximum with H=0 need not be classified as failure if adversary
occupation of that landing creates a finite quotient boundary while adversary moves
elsewhere pass the same maximum intact to the next mover.

## 4. Exact center-gate dichotomy

At rank 6 define:

- G = 1 iff D6 remains open;
- E = number of new off-center tokens introduced by the sixth move.

Mechanically:

~~~text
G = E in {0,1}
~~~

for all seven legal sixth moves.

Equivalently:

~~~text
consume D6 -> no off-center disturbance
decline D6 -> exactly one off-center disturbance
~~~

Player 2 cannot both consume the center gate and alter a side column on the same move.

This is the exact binary structural split that motivated the equivalence program.

## 5. The saturated center is an exact static boundary

For:

~~~text
444444
~~~

the center owner word from bottom to top is:

~~~text
P1, P2, P1, P2, P1, P2
~~~

The column is permanently saturated.

All winning lines avoiding column D have the same ownership state they have on the
empty board.

All three vertical winning lines in D contain both owners and are dead to both.

Center-crossing horizontal and diagonal lines reduce to player-specific side residuals
determined by the fixed center owner at their crossing row.

This led to the generic:

**CPCX Saturated-Column Cofactor Homomorphism.**

A saturated column may be removed from the live action space while its immutable owner
word is compiled into exact owner-labelled winning-line cofactors.

For every legal event outside the saturated column:

~~~text
project after event = event transition after projection
~~~

including exact first-terminal preservation.

For 444444 the quotient is:

~~~text
virgin six-column side substrate
+ fixed player-specific center-crossing three-cell residuals
+ ordinary side-only four-cell residuals
~~~

Per player it contains:

~~~text
24 three-cell residuals
18 four-cell residuals
42 live residuals
~~~

The first-five RLC A/B/H profile remains well-defined and exact on this cofactored
geometry.

## 6. Two-event exchange identity

For every off-center x, compare the two event orders:

~~~text
44444 x 4
44444 4 x
~~~

They have:

- identical support heights;
- identical rank;
- identical mover;
- identical ownership everywhere except two cells.

The only owner difference is:

~~~text
{x1, D6}
~~~

and ownership on those two cells is exchanged.

Therefore every winning line outside the incidence cone of those two cells is exactly
the same.

This is not global state equality. It isolates the entire physical difference to a
bounded owner-exchange cone.

## 7. Geometry gauge and parity interpretation

CPCX independently derived the geometry-fixed zero-reservation owner formula.

On standard 7x6:

~~~text
zeroReservationOwner(cell) = row(cell) mod 2
~~~

The original five-token center stack and the fully saturated alternating center are
aligned with this geometry gauge.

Therefore:

### Center consumed first

After 444444, the fixed center spine is gauge aligned and the side board is virgin.

After Player 1 takes a side bottom cell, that event is also gauge aligned.

This is the gauge-vacuum representation.

### Off-center consumed first

After Player 2 plays x and Player 1 subsequently takes D6, support is the same as the
corresponding center-first state, but the ownership pattern differs from the gauge by
exactly:

~~~text
{x1, D6}
~~~

Thus the constrained representation becomes:

~~~text
gauge-aligned saturated-center base
+ bounded two-cell owner-gauge defect
~~~

rather than raw board equality.

## 8. Reflection collapses six defects to three exact classes

The full residual correction was canonicalized under horizontal board reflection.

The six off-center cases collapse exactly to three distance-from-center classes:

~~~text
distance 1: {3,5}
distance 2: {2,6}
distance 3: {1,7}
~~~

This was checked over the complete residual correction, including:

- player;
- original winning-line geometry;
- missing-cell geometry;
- residual cardinality;
- horizontal / vertical / reflected diagonal orientation.

It is not merely equality of aggregate counts.

At the initial handoff the line-indexed residual symmetric-difference sizes are:

~~~text
distance 1 -> 18
distance 2 -> 17
distance 3 -> 16
~~~

So the center-geometry correction is a small finite descriptor.

## 9. Bounded residual-defect transport

The next theorem represents two same-support states as:

~~~text
common residual carrier C
+ left-only residual defect Delta_L
+ right-only residual defect Delta_R
~~~

with physical winning-line identity retained.

Under any common legal owner-labelled event:

- every residual already common receives the same contraction / kill operation on both
  sides;
- therefore a common residual cannot become a new one-sided residual;
- only residuals already in the defect can remain different;
- defect rows may contract, die, complete, converge, or cancel;
- defect cardinality cannot grow.

Symbolically, before first-terminal stopping:

~~~text
Delta(next) is contained in transition(Delta(current))
~~~

and therefore:

~~~text
|Delta(next)| <= |Delta(current)|
~~~

If one paired position reaches a first terminal and the other does not, the divergence
must be witnessed by the defect. The theorem reports the divergence instead of erasing
it.

This turns the center-column geometry difference into a bounded exact continuation
coordinate rather than an expanding history distinction.

Qualification covered fresh owner-swap controls and every current legal event from all
six turn-6 exchange pairs.

## 10. A common RLC response exists across the defect

The next diagnostic asked a stronger question.

After one common adversary side event, do the defect representative and the
gauge-aligned representative still admit at least one common RLC A/B Pareto response?

Across:

~~~text
6 handoff pairs
x 6 current side events
= 36 paired adversary events
~~~

the result was:

~~~text
36/36 nonterminal
36/36 have a nonempty common RLC Pareto frontier
0 terminal divergences
0 defect growth
~~~

A single reflection-invariant response rule was isolated:

~~~text
d = 1:
    respond in defect column X

d = 2:
    if adversary event e is an edge {1,7}, respond X
    otherwise respond e

d = 3:
    respond e
~~~

where:

~~~text
d = |X - 4|
~~~

All 36 current-rank cases select a column belonging to the exact RLC Pareto frontier in
both representatives.

This is the **Center-Spine Defect Common-RLC Response Lemma**.

It is stronger than support equivalence and weaker than state equality.

The practical meaning is:

> the bounded center defect changes local A/B scores, but at this handoff it does not
> force a different controller response.

## 11. Parity-control direction that followed

The common-response rule suggested another compact coordinate: remaining-capacity
parity.

With the saturated center removed, the side system can enter a state with exactly one
odd remaining-capacity column.

A new research primitive was started:

**Single Odd-Capacity Debt Transport.**

It represents the unmatched parity column as one movable debt:

- an adversary event toggles the parity of its column;
- responding in that same column restores the old debt location;
- responding in the prior debt column clears the old debt and moves the unique debt to
  the adversary's column;
- every two-event macro consumes exactly two units of remaining capacity.

This is currently a pure support/parity theorem, not yet a strategic move theorem.

Its importance to this conversation is conceptual: it supplies a compact way to express
the parity control Joshua Oshiro expected the fixed center spine to induce on the
otherwise virgin side substrate.

## 12. Current constrained-equivalence model

The working turn-6 state representation is now approximately:

~~~text
Q =
  saturated-center cofactor
+ side support
+ mover
+ reflection-canonical residual defect Delta
+ parity / capacity debt
+ first-win and response-capacity guards
~~~

The static center geometry has been compiled out of the live action dimension without
being forgotten.

The owner-exchange difference has been reduced to a bounded defect rather than full
state identity.

Parity control is being represented as a small transportable debt rather than a future
move sequence.

This is the form of equivalence that the conversation was seeking.

## 13. What this does and does not establish

Established structurally:

- the old H=0 boundary at 44444 is not simply a loss of the RLC maximum;
- every off-center P2 move passes the same exhausted D6 maximum intact to P1;
- center saturation creates an exact cofactored six-column system;
- the two event orders differ only through a bounded owner-exchange correction;
- reflection reduces the correction to three classes;
- residual difference is nonincreasing under common event transport;
- all 36 current paired adversary events admit a common RLC response;
- a compact distance/event response rule exists for this current layer.

Not yet established:

- indefinite closure of the common response rule;
- a complete RCIC over all future adversary events;
- that the three defect classes normalize to one final certificate class;
- that the parity-debt transport plus defect state is sufficient for complete
  continuation semantics;
- a structural proof that all seven sixth moves are equivalent perfect moves;
- Best(44444)=LegalActions(44444);
- a universal polynomial-time Connect Four move theorem.

## 14. Immediate research target

Do not return to unconstrained forward projection unless this equivalence program is
falsified.

The next target is:

~~~text
center-spine cofactor
+ bounded defect
+ parity debt
-> response-total structural macro
-> same class or known certificate class
-> strict well-founded progress
~~~

The desired closure is an RLC/RCIC theorem in which every adversary event either:

1. terminates with the correct first-win direction;
2. contracts or eliminates the bounded defect;
3. transports the parity debt while decreasing a well-founded capacity measure;
4. or hands off exactly into an already-qualified certificate class.

The key methodological constraint from the conversation is:

> do not demand physical equality when claim-relative equivalence is sufficient, but do
> not erase the center-column geometry either. Compile its effects into the smallest
> exact invariant needed by the continuation claim.

## 15. Relevant artifacts and commits

Conversation-driven artifacts:

- CPCX_EXHAUSTED_CENTER_MAX_HANDOFF_0_1.md
- run-uc4a-cpcx-turn6-center-gate-equivalence.mjs
- run-uc4a-cpcx-turn6-exhausted-max-handoff.mjs
- run-uc4a-cpcx-turn6-exchange-congruence-boundary.mjs
- run-uc4a-cpcx-turn6-center-spine-cofactor-equivalence.mjs
- CPCX_SATURATED_COLUMN_COFACTOR_HOMOMORPHISM_0_1.md
- cpcx-saturated-column-cofactor.mjs
- cpcx-saturated-column-cofactor.test.mjs
- CPCX_BOUNDED_RESIDUAL_DEFECT_TRANSPORT_0_1.md
- cpcx-residual-defect-transport.mjs
- cpcx-residual-defect-transport.test.mjs
- CPCX_CENTER_SPINE_DEFECT_COMMON_RLC_RESPONSE_0_1.md
- run-uc4a-cpcx-turn6-defect-pair-rlc-response-intersection.mjs
- cpcx-parity-debt.mjs

Important branch milestones in this chain include:

~~~text
2f26872c  record exhausted center-max handoff
6234511c  bound turn6 exchange congruence
bf08fc5d  freeze saturated-column cofactor theorem
065a4dea  canonicalize center-spine defects under reflection
372e3c2d  qualify bounded residual-defect transport
31e29739  isolate defect-distance RLC response rule
82908996  freeze center-spine common RLC response
648557f2  implement single odd-capacity debt transport
~~~

This note intentionally records both the conceptual provenance and the exact boundary of
what has been proved so that later work does not retroactively collapse the distinction
between the originating equivalence insight, diagnostic evidence, and theorem-level
results.
