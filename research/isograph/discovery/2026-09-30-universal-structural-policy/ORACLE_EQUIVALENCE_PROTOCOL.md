# Oracle equivalence reporting protocol

Date: 2026-09-30

For structural-policy validation, never use a solver's single displayed move as the oracle result.

Use the complete legal-move score vector from `components/oracle/exact7x6.mjs::analyzeSequence()` and report:

1. full per-column exact strong scores;
2. W/D/L-equivalent move sets (grouped by sign);
3. exact-strong equivalence classes (grouped by identical score);
4. exact-strong optimal move set (all moves with maximal score);
5. project-acceptable perfect-move set:
   - if any move wins, every winning move is acceptable;
   - else if any move draws, every drawing move is acceptable;
   - else retain every move with maximal strong score (longest-delayed loss).

A structural-policy candidate is acceptable at a position when every move it certifies lies in the project-acceptable perfect-move set. It need not reproduce the oracle's internal tie-breaking or enumerate every acceptable move.

Executable reporter:
`research/isograph/discovery/2026-09-30-universal-structural-policy/oracle-equivalence-report.mjs`

Example:
`node research/isograph/discovery/2026-09-30-universal-structural-policy/oracle-equivalence-report.mjs 44444`

The output is validation evidence only and must not be used to alter a pre-oracle frozen formula without consuming the tested position as training evidence.
