# Formal negative completeness control: exact transition vs exact strategic value

Date: 2026-10-16. Canonical owner: research/semantic-quotient.
Predecessors: MOVE7_MOVE8_COLUMN_CLOSURE_RESULTS_0_1.json, ALL_DEPTH_OWNER_MASK_RESULTS_0_1.json, virtual-upset-five-ply.mjs, exact-q-core.mjs.

## Question

Arbitrary-length owner-labelled residual cofactor composition is exact for supplied legal histories. Does the existing bounded search-free P0/P1/P0/P1/P0 value formula, which is exact through P0's third own move, already suffice to classify a full small-board root?

Predeclare the empty 4x3 Connect-3 position as a falsifier with no searched policy input to the candidate. The source-only virtual-upset-five-ply rule is evaluated FIRST.

Then, in VALIDATION ONLY, independently use:
 (a) a physical Connect-K first-win bounded five-ply existential/universal checker (may enumerate action replies; it is a test oracle, not the proposed solver);
 (b) the separately qualified exact q recursion to determine unrestricted W/D/L and all W/D/L-optimal first actions.
 Record mismatch as SHORT-HORIZON INCOMPLETE, not an error in the exact fixed-horizon theorem.

## Strict stop

Physical bounded search <= 100,000 transitions and 30 seconds.
Full q recursion <= 20,000 q states, <= 100,000 transitions and 30 seconds.
Source algebra virtual queries <= 100,000. No candidate formula is modified using observed results.
Keep strict separation between transition completeness and strategic-value completeness; no arbitrary-depth nonbranching claim can follow from the column-capacity tests alone.

## What counts as progress

If the bounded formula returns fewer certified first moves than the full W/D/L reference, document precisely why: its extra OR/AND alternation depth and adaptive response-cover correlations are still missing. The observed WDL outcome is validation data only. Do not use it as a searched candidate policy for the next algebraic operator.
