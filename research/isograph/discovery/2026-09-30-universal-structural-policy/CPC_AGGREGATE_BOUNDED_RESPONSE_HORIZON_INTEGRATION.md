# CPC aggregate bounded-response horizon integration

**Date:** 2026-09-30  
**Status:** exact integration theorem / rank-local lower-bound CPC extension candidate  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Integrate the qualified bounded synchronized-response survival theorem into the same aggregate residual representation used by native CPC.

CPC already evaluates the prepared RBA residual basis as one structural object. The bounded-response theorem does not require a second obligation ontology:

- native CPC asks whether a qualified response template covers all active residual requirements;
- the bounded form asks for the earliest optimistic completion rank among residuals not covered by the template.

Thus native CPC long-range no-win is the full-horizon Boolean endpoint of a stronger rank-valued aggregate calculation.

No solved W/D/L value or oracle score is used.

## 1. CPC residual carrier

Let `q(P)` be the prepared JSMinSys RBA state for a legal nonterminal position `P`. For player `p`, let `R_p(P)` be the active residual shapes carried by the CPC/RBA coordinate basis.

These are the current residual requirement carrier supplied to CPC, not manually selected tactical obligations.

## 2. Optimistic completion rank

For every active residual `R`, define `e_P(R)` as in the bounded-response theorem: the earliest player-relative ply at which the player could occupy the residual if the opponent never occupied one of its cells, respecting support release, turn parity, and one placement per turn.

This is a necessary condition for actual completion, not a forcing claim.

## 3. Aggregate response-template scan

For one complete synchronized-response template `Pi`, let `U_Pi(P)` be the active residuals not covered by `Pi`.

If `U_Pi(P)` is nonempty, define:

`d_Pi(P) = min e_P(R)` over `R` in `U_Pi(P)`.

Then under the odd attacker-relative rank convention:

`H_Pi(P) = d_Pi(P) - 2`.

If every active residual is covered, treat `d_Pi = +infinity`; this is the ordinary full no-win CPC response certificate.

Finally:

`H(P) = max_Pi H_Pi(P)`.

This is the prior bounded synchronized-response theorem expressed over the same active residual carrier CPC already consumes.

## 4. Native CPC as the Boolean endpoint

The current JSMinSys CPC long-range path scans active coordinate bits and succeeds only if every active residual is covered by its paired/frontier response construction.

Therefore native CPC long-range no-win is the aggregate bounded-response calculation with no finite uncovered deadline.

The new horizon is not a separate tactical engine. It is a rank-valued generalization of the existing aggregate CPC response predicate.

## 5. Exact v4 boundary control

The executable control evaluates the three consumed v4 children using the JSMinSys RBA basis at `iteathen/JSMinSys@0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb`.

Prefix: `444441566`.

It must reproduce:

- candidate 2: `H=3`;
- candidate 3: `H=3`;
- candidate 6: `H=5`.

Agreement with the independent generated-line implementation shows that the lower-bound theorem can be hosted by CPC's aggregate residual representation without changing its meaning.

## 6. Current native CPC boundary

The sibling aggregate CPC probe records that current native CPC returns `CPC_NONE`, interval `[-1,+1]`, no forced column, and no preemption restriction for all three v4 children and both forced candidate-6 split successors.

That does not contradict this theorem. Current CPC exposes W/D/L closure and current-action restrictions; it does not expose the finite survival horizon `H`.

So the missing piece is an output-strength extension of CPC, not necessarily a second obligation language.

## 7. Strong-distance integration target

Preferred architecture:

`one aggregate CPC state calculation -> { W/D/L interval, forced/preemption mask, survival lower horizon, forced-completion upper bound when certified }`.

Existing immediate-win, multiple-singleton, stacked-singleton, all-lift, fork-precursor, and long-range response rules are already CPC-style aggregate consequences.

Future upper-bound work should first ask whether the new forced-completion theorem can be expressed as another CPC consequence over the same carrier before creating a parallel obligation engine.

## Boundary

This theorem does not turn `H` into a move score, infer exact remoteness, produce a finite upper bound at the v4 falsifier, license v5, or use Pons as a proof premise.

## Next target

Prototype a CPC strong-distance result object whose first new exact field is the bounded survival horizon. Then test whether the qualified forced-completion primitives can also be stated as aggregate CPC routes with a finite upper-rank field.
