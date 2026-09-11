# C4-0002 — Legacy-current evaluator v1

**Status:** accepted compatibility specification

## Purpose

Freeze the actual evaluator behavior used by the optimized 2025 Connect Four engine so the incumbent Node rewrite and future CUDA-MCGS lane can share one exact product-owned evaluator profile.

This specification preserves behavior first. It does not claim every legacy label was ideal, and it does not promote historical implementation accidents into generic Connect Four theory. A later evaluator revision may change semantics only under a new profile with independent strength/correctness evidence.

## Adjustable board domain

The evaluator is defined for a rectangular `columns x rows` Connect Four board with `columns >= 4`, `rows >= 4`, gravity, alternating players `0/1`, and four-in-a-row terminal semantics.

The first optimized Node implementation uses a two-`uint32` position profile and therefore admits up to 64 cells. That is an implementation profile, not a redefinition of the product's adjustable-board semantics.

## Terminal score

For `score(player)`:

- player win: `+10_000_000_000_000`;
- opponent win: `-10_000_000_000_000`;
- draw: `0`.

## Live-line positional score

A four-cell winning line is live for a player exactly when it contains no opponent token.

For every live line, add `20` for every token already owned by the player in that line. Equivalently:

`positional = 20 * sum(player-token-count(line))` over opponent-free winning lines.

The packed positional field is `min(abs(positional), 65535)`.

This preserves the optimized engine's emergent geometry: center preference, connectivity, blocking value, and future opportunity all arise from the remaining winning-line solution space rather than a separate piece-square table.

## 3+1 tactical targets

A tactical target is a live winning line containing exactly three player tokens and one empty cell.

Let:

- `targetColumn` / `targetRow` be the empty winning cell;
- `columnHeight` be the number of occupied cells currently in that column;
- `emptyAtAndBelow = targetRow - columnHeight + 1`.

### Immediately playable target

`emptyAtAndBelow == 1` means the winning target is playable now.

The optimized 2025 implementation revisited such a line once through each of its three owned tokens. Consequently the resulting packed score sets the high `fork` tier whenever at least one immediately playable 3+1 target exists. C4-0002 preserves that **score behavior** without requiring the repeated traversal or claiming that the historical variable name perfectly described the semantic class.

### Future parity target

For `emptyAtAndBelow > 1`, the original scan-based parity rule is preserved algebraically.

The number of playable empty cells outside the target column plus the target support sequence has parity:

`totalParityToTarget = (((columns - 1) * rows) - tokenCount + targetRow + 1) & 1`.

A single parity threat exists when `totalParityToTarget == 1`.

This is equivalent to the historical rule `outsideParity !== (emptyAtAndBelow % 2)`. The apparently unusual parity relation is intentional because evaluation occurs before the next recursive move is applied.

### Compound parity target

The optimized evaluator also promotes the position when non-immediate 3+1 targets exist with **both** even and odd `emptyAtAndBelow` parity. This is preserved as the legacy-current compound parity class.

The profile does not reinterpret this class as a generic named fork. It records the actual optimized score behavior.

## Packed score

For a non-terminal position:

- bit 18: at least one immediately playable 3+1 target;
- bit 17: at least one single parity threat OR both even- and odd-support non-immediate threats;
- bit 16: retained as zero in this profile;
- bits 0..15: capped positional score.

The resulting unsigned integer is the player's static score.

## Root utility used by the incumbent search

The incumbent search is root-relative rather than antisymmetric:

`utility = (score(rootPlayer) - 0.65 * score(otherPlayer)) / max(depthFromRoot * 1.01, 1)`.

Terminal values use the same depth scale. This root-relative utility is part of the legacy-current search compatibility profile and matters for safe transposition reuse.

## Qualification rule

The maintained host implementation must match the frozen archive-derived regression vectors exactly before benchmark or strength evidence is accepted. Future Device-JS realization must match the same accepted profile before architecture-isolation comparisons.
