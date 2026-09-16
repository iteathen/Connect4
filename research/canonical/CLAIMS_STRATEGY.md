# Strategy-dependency and history-complexity claims

**Research direction:** Josh Oshiro  
**Formalization / qualification:** OpenAI ChatGPT

This ledger continues the realizability split above C4-R0060..C4-R0063. Static tuple feasibility and legal-history feasibility are not yet strategic feasibility: a controller may need to distinguish two legal histories in order to choose different responses.

## C4-R0064 — projection-relative uniform strategy

**Status:** deductive exact.

A history projection is strategically sufficient for a particular objective exactly when a winning strategy exists whose action choice factors through that projection (or through the projection plus a proved symmetry action transport). This is the standard observation-based/uniform-strategy object.

Connect-4 witness: after the exact prefix `D1 E1 A1 A2`, the two attacker continuations `B1` and `C1` create different mandatory terminal-block responses. In the `B1` branch P1 must answer `C1`; in the `C1` branch P1 must answer `B1`. An abstraction that merges those histories while forgetting which bottom trigger occurred cannot support one uniform safety response.

## C4-R0065 — dependency-aware quantified strategy encoding

**Status:** deductive exact for bounded horizons.

The same lost distinction has a standard synthesis representation. Opponent choices are universal variables; controller responses are existential Skolem functions. A response may depend only on the opponent distinctions retained in its dependency set. DQBF makes those dependencies explicit.

For the two-branch serialization witness, one universal trigger bit `u` chooses `B1` versus `C1`, and the defender response variable `e` must depend on `u`. Removing `u` from `D(e)` forbids the required contingent strategy. Keeping it permits the response function that chooses the opposite bottom cell.

This identifies the missing **dependency carrier** without claiming DQBF is a cheap runtime implementation.

## C4-R0066 — all-width history compression has a hard boundary

**Status:** deductive exact via published constrained-shuffle theorem.

For even occupied rank, the pre-terminal history problem is exactly constrained shuffle of the column words into `(01)*`. Published constrained-shuffle theory proves `CSh[(ab)*]` NP-hard when the number of input strings is unbounded. Therefore a universal all-width calculus cannot assume that alternating-history realizability collapses to owner counts, parity, or a fixed list of local scalar tests.

This does not obstruct fixed-width specialization. Standard width 7 may still admit a finite-width transfer/separator calculus, and certified strategic subfamilies can be much easier than arbitrary colored supports.

## C4-R0067 — interval matching is not the missing history law

**Status:** deductive exact counterexample.

`w0=01`, `w1=0011` cannot shuffle to `010101`, despite balanced global counts and a perfect matching between events and their individual parity-compatible earliest/latest rank windows. The matching succeeds only by assigning the first `w0` event after its second event, violating the chain order.

Therefore the response-capacity/Hall layer remains valid only after legal slot sets and precedence have already been certified. It cannot itself reconstruct the gravity-history relation.

## Current dynamic logic shape

The smallest established hierarchy is now:

```text
static projection feasibility
  = CSP / lossless join

colored-support history feasibility
  = constrained shuffle / alternating linear extension

strategy feasibility under a projection
  = observation-based uniform strategy
  = bounded Skolem dependency synthesis when encoded propositionally

full strategic quotient sufficiency
  can be certified by a game/alternating bisimulation,
  but that is stronger than value-only equivalence and is not assumed minimal

Connect-4 proof closure
  = guarded strategic alternatives + resources + deadlines + first-win + NDC.
```

The remaining research target is to exploit Connect-4-specific fixed-width, residual, CPC, seam and response structure so the required uniform strategy can be certified without expanding the physical game tree.
