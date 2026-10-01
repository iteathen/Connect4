# Ply-6 oracle interpretation correction

Date: 2026-09-30

After prefix `44444`, two different solver reports have now been observed by the owner:

1. one line solver displayed column `6`;
2. another solver suggested all seven legal moves are equivalent.

These reports are not necessarily contradictory.

## Required distinction

There are two different equivalence notions:

- **W/D/L equivalence:** every legal move has the same result class;
- **strong-score equivalence:** every legal move also has the same terminal-distance score under perfect play.

A solver may report all seven as equivalent at W/D/L resolution while another strong solver chooses one move using loss-delay tie-breaking or deterministic move ordering.

Conversely, if all seven exact strong scores are equal, then a displayed move `6` is only a tie representative and no unique move-6 preference exists.

Because `44444` is horizontally symmetric, any exact score for column 6 must equal the exact score for column 2; similarly 1=7 and 3=5.

## Research disposition

The earlier ORACLE_VALIDATION_MOVE6_0_1.md statement that the exact perfect-play orbit is necessarily `{2,6}` was too strong without the complete per-column strong-score vector.

Current status:

- frozen structural policy predicted `{3,5}`;
- this is a mismatch only if the oracle distinguishes `{3,5}` from the optimal exact strong-score set;
- if all seven are exact-strong tied, the structural selector is not falsified at ply 6 as an optimal-move selector, though it is unnecessarily restrictive;
- if all seven are merely W/D/L tied, exact strong-distance comparison remains unresolved.

Next validation requirement: obtain the complete exact strong-score vector for all seven children of `44444`, not merely one displayed move or a W/D/L class.
