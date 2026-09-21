# Pons L1 first-32 campaign

This evidence-only campaign removes the selection bias of the earlier beginning-position spot-check set.

It takes exactly the first 32 rows of external Pons-derived `Test_L1_R1` and the first 32 rows of `Test_L1_R2`, with no filtering based on IsoMax difficulty or internal oracle runtime.

Each position runs in a fresh process with a 15-second bound. A timeout is preserved as an incomplete boundary, not excluded from the corpus. A wrong completed W/D/L result is a correctness failure.

The campaign compares only the W/D/L class implied by the external Pons parent score after side-to-move/P0 perspective conversion. It does not compare distance-to-win magnitude or performance superiority.

No solver file is modified.
