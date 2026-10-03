# CPCX Support-Release Response Neutralization 0.1

**Status:** frozen theorem contract; implementation/qualification pending  
**Scope:** experimental CPCX only  
**Observation:** claim-relative first-terminal relevance of one opponent singleton residual

## Purpose

Turn an unsupported opponent singleton at support distance one into an explicit response-capacity edge instead of treating its optimistic two-ply deadline as an immediately available terminal.

The theorem is generic. It is motivated by the move-6 opponent deadline seam, but no move-6 action, U-class identifier, solved value, or oracle label is a premise.

## Objects

Let `S` be one exact nonterminal CPCX position.

Let:

- `D = S.mover` be the selected proof controller/defender;
- `O = D ^ 1` be the opponent;
- `R` be one live `O` singleton residual with unique missing target `t`;
- `supportDistance_S(t) = 1`;
- `s` be the unique empty cell immediately below `t`, hence the current frontier cell in `t`'s column;
- `d` be one **pinned, independently certified current D event** used by the surrounding proof.

The theorem does not choose `d`. It only audits whether `R` can be erased from the direct first-terminal cone relative to that already-selected event.

## Premises

Certification requires all of the following.

1. **Exact nonterminal source.** `S` is exact, nonterminal, and `D` is to move.

2. **Exact live singleton.** `R` is a current live residual for `O`, has exactly one missing cell `t`, and the current support distance of `t` is exactly one.

3. **Unique release cell.** The cell immediately below `t` is the current legal frontier `s` in the same column.

4. **No current opponent terminal.** `O` has no currently playable singleton in `S`.

5. **Pinned defender event avoids help.**
   - `d` is a current legal D event;
   - `d != s`;
   - `d` is outside `t`'s column;
   - `D:d` is nonterminal for the continuing neutralization claim.

   Consequently `D:d` cannot decrease the support distance of `t`.

6. **Post-d no immediate opponent terminal.** After exact event `D:d`, `O` still has no currently playable singleton.

7. **Finite response-class partition.** On O's next turn, with respect to `R`, there are only two structural classes:
   - `SUPPLY`: O plays `s`;
   - `EXTERNAL`: O plays any legal event other than `s`.

   No physical reply enumeration is required for the external class. Gravity locality proves that an external event cannot make `t` playable through this residual.

8. **Supply is not terminal.** Exact event `O:s` is legal and nonterminal. If it is terminal, another first-terminal cause has already won and this neutral-response theorem is not the applicable rule.

9. **Unique urgent obligation after supply.** After `D:d ; O:s`, the deduplicated set of currently playable O singleton cells is exactly `{t}`.

   This is the response-capacity guard. If a second distinct singleton is present, the theorem fails closed rather than erasing one member of a Hall-deficient overload.

10. **Exact block.** `D:t` is legal after the supply event. The fixed script

```text
D:d ; O:s ; D:t
```

respects alternating ownership and first-win stopping.

11. **No transported immediate opponent terminal.** In the nonterminal continuation after `D:t`, O has no currently playable singleton. This prevents a support-release response from merely transporting the same urgent burden one cell upward.

12. **Residual killed.** Owner-labelled residual cofactor algebra verifies that `D:t` kills `R`.

## Conclusion

Under Premises 1-12, relative to the pinned controller event `d`:

```text
R cannot be a unique unanswerable first-terminal cause.
```

More precisely:

### EXTERNAL class

If O plays a legal event other than `s`, the support distance of `t` remains positive. Therefore `R` cannot terminally complete on that O event.

### SUPPLY class

If O plays `s`, then `t` is the unique urgent O singleton, and D has the exact response `t`. The two-event release/response macro

```text
O:s ; D:t
```

kills `R`, consumes two plies, and returns the mover to O.

The theorem therefore emits a **support-release response edge**

```text
trigger s -> reserved response t
```

rather than an opponent terminal deadline.

## Projection discipline

This theorem does **not** authorize unconditional deletion of `R`.

A surrounding claim-relative quotient may erase `R` from the direct first-terminal residual list only while it preserves:

- the pinned D action's support-avoidance premise;
- the reservation `s -> t`;
- the fact that the reserved response is not simultaneously consumed by a distinct urgent obligation;
- first-terminal precedence.

If multiple residuals share the same response `t`, deduplicate by exact discharge semantics before capacity accounting.

If one supply event creates multiple distinct urgent singleton cells, keep the overload in the response-capacity interface.

## First-win semantics

Every concrete event in the SUPPLY macro is checked with exact first-terminal stopping.

The theorem never interprets `NO_CERTIFICATE` as draw or loss.

A terminal event before the blocking response is a falsifier for this neutral-response theorem, not evidence about the game-theoretic value of the source.

## Complexity

For a fixed-cardinality CPCX residual carrier:

```text
source/residual audit: O(number of live lines)
fixed event audits: O(line incidence)
singleton deduplication: O(number of live lines)
cofactor kill audit: O(live residual count * K), K <= 4
```

There is no recursive legal-move traversal.

## Required qualification controls

Fresh qualification must include:

1. a positive case not derived from `44444`;
2. a positive non-bottom target whose support distance is exactly one;
3. a negative case where `d = s` or otherwise supplies the target;
4. a negative case where `O:s` creates at least two distinct urgent singleton cells;
5. a negative case where blocking `t` releases another immediate O singleton;
6. production-CPC / solved-data / oracle / recursive-search isolation.

## Move-6 use boundary

For the `44444` proof, this theorem may be used only after an exact or independently qualified abstract carrier proves its premises.

In particular, it may explain why an optimistic opponent lower bound of two plies is not itself an urgent first-terminal hazard when the P0 proof action does not supply the missing support cell.

It does not by itself prove:

- a global P0 completion upper bound;
- equality of all opponent residual envelopes;
- the A-C proof-cone quotient;
- `Best(44444)=LegalActions(44444)`.
