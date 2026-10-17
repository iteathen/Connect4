# Source-q anchored exact symbolic value compiler: earlier rank scaling probe

**Date:** 2026-10-16. **Research owner:** `research/semantic-quotient`.
Earlier fixed rank 35/32/30/28 standard7x6 controls have **all passed**:
`SOURCE_ANCHORED_BDD_STANDARD7X6_RANK{28,30,32,35}_RESULTS_0_1.json`.
They use exact q0 residuals; no future game-tree search in the producer.
The identical pre-anchoring support-owner BDD failed the 60k node cap on all
four supports. No budget expansion was made.

## Explicit additional scaling boundary

Use only earlier prefixes of the **same independently validated**
legal first-win-stopped 7x6 fixture
`43214636342357317661423762461717147`, at ranks
**27,26,24,22**, tested in that order. These were selected solely
by support rank (not previously solved WDL):
- rank27: [3,4,6,5,1,5,3], 1,152 future supports;
- rank26: [3,4,6,4,1,5,3], 1,728 supports;
- rank24: [3,3,6,4,1,4,3], 3,456 supports;
- rank22: [3,3,5,4,1,4,2], 8,640 supports.

Do not attempt earlier rank20 (14,400 support vectors) without a new
resource/representation plan; it already violates the strict 10k
support limit. The standard empty root has 7^7=823,543 supports.

## Hard limits unchanged

For each source-q anchored BDD compile, at most **60,000**
simultaneously allocated BDD nodes, **300,000** nontrivial apply/restrict/
not visits, **10,000** support vectors and **15 seconds** wall time.
Independent exact-q reference capped at **200,000** unique q states,
**800,000** transitions and **30 seconds** per prefix. Never query the
reference until source-q symbolic compilation has finished. Treat budget
exhaustion as PARTIAL, not zero/outcome unknown interpreted as loss.

Record source requirement sizes, support rectangle, compilation peak,
total BDD operations, all action-specific WDL values and literal
best moves, independent comparison result, and first obstruction.
If a stage consumes its own cap, checkpoint and continue only to the
already predeclared lower-complexity support (do not increase caps).

This is **instrumental scaling qualification**, not minimality research
or proof of polynomial arbitrary-depth strategy solving. Adaptive
strategic fanout remains encoded in support/action Bellman operators.
