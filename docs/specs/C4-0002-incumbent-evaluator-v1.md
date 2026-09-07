# C4-0002 — Incumbent evaluator v1

**Status:** accepted incumbent-compatibility specification

## Purpose

Freeze the Connect4-owned evaluator semantics used by the strong Node incumbent and, later, by any CUDA-MCGS comparison that claims evaluator equivalence. This specification preserves the observable optimized legacy evaluator where that behavior cooperates with the search horizon; it does not reinterpret the evaluator as a conventional Connect Four heuristic.

The canonical first benchmark profile is 7×6, but the evaluator machinery is dimension-parameterized. Board dimensions are product profile data, not hard-coded evaluator constants.

## Player score

For a nonterminal position and one player:

1. Consider every geometric four-cell winning line exactly once as semantic structure.
2. A line is *live* for the player when it contains no opponent token.
3. Its positional contribution is `20 * ownTokenCount(line)`.
4. Positional contributions sum over all live lines and are saturated to the low 16 bits at `65535` before tactical packing.

This is a live winning-line field, not a fixed piece-square table. A token gains value through every still-live line containing it and loses that contribution when an opponent kills the line.

Terminal player scores are:

- own win: `+10_000_000_000_000`;
- opponent win: `-10_000_000_000_000`;
- draw: `0`.

## Three-own / one-empty targets

Only a live line with exactly three own tokens and one empty target participates in the tactical/parity classification.

For target `(column, row)` under legal gravity state:

`emptyAtOrBelow = row - columnHeight[column] + 1`

A value of `1` means the target is playable immediately.

For an unplayable target, the legacy scan over all empty support/reservoir cells is algebraically equivalent to:

`totalParityToTarget = (((columns - 1) * rows) - tokenCount + row + 1) & 1`

The reduction is valid for the adjustable-board profiles because it depends on dimensions, ply/token count and target row rather than the 7×6 cell count.

## Preserved immediate-promotion behavior

The optimized legacy implementation revisited a three-own/one-empty line once through each of its owned tokens. Consequently an immediately playable target increments the internal immediate counter three times for that one geometric line.

Incumbent v1 preserves that observable promotion. In packed form, a single such immediate line can therefore set the high tactical/fork bit rather than the single-immediate bit. The historical local labels are diagnostic names only; they do **not** assert a count of distinct geometric threat lines.

This behavior remains frozen because it is visible at the cutoff frontier, where it can act as a crude one-ply tactical horizon promotion. It must not be removed without strength evidence from an independent solved-game oracle.

## Future ownership / parity obligations

For an unplayable three-own/one-empty target:

- `totalParityToTarget === 1` records the single-parity tactical class;
- the parity of `emptyAtOrBelow` records which target-support parity is represented;
- observing both support parities records the compound/double-parity tactical class.

These classes represent future move-ownership obligations under gravity. They are not ordinary geometric fork counts.

## Packed score

The optimized incumbent score is packed lexicographically:

- bit 18: repeated-immediate/high tactical promotion;
- bit 17: parity tactical class (`singleParity || bothSupportParities`);
- bit 16: exactly-one immediate counter value;
- bits 0–15: saturated positional score.

Higher tactical structure therefore outranks arbitrary positional accumulation.

## Root-relative utility

Search evaluates a frontier from the explicit root player's perspective:

`rootPlayerScore - 0.65 * opponentScore`

This asymmetry is intentional. It is not antisymmetric and does not authorize a negamax rewrite.

The legacy depth divisor is common to all ordinary frontier evaluations at one fixed search horizon. The low-level incumbent may keep the raw root-relative utility internally and restore the exact legacy external score at the search boundary, provided fixed-depth conformance remains exact.

## Search cooperation

The evaluator is horizon-coupled. Before ordinary recursion, the incumbent search owns tactical prechecks for:

- an immediate current-player win;
- an opponent double-immediate-threat forced loss;
- restriction to a forced single block.

Evaluator vectors must therefore be interpreted together with C4-0003 rather than as a standalone perfect static evaluator.

## Conformance authority

`reference/conformance/evaluator-v1.json` freezes legal positions extracted from the exact owner-supplied optimized source. It includes live-line positional cases, the repeated-immediate behavior, parity classes, terminals and adjustable board profiles.

The retained provenance source is `reference/legacy-source/Connect4-engine-source.zip`; historical names and implementations remain evidence, while this specification and the frozen vectors own incumbent-v1 meaning.
