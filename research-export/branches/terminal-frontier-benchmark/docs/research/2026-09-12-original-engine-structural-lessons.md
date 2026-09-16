# Original engine: structural lessons and a bounded adaptation

Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

## Source examined

Read all four engine files in
`reference/legacy-source/Connect4-engine-source.zip`: original `Board` methods in
`classDefinitions.js`, later `virtualBoard`, its worker consumer, and constants.
The archive and all entries matched `reference/legacy-source-manifest.json`.
The files carry the owner's 2025 copyright. No archive bytes were modified.

The study executes original `virtualBoard.js`, SHA-256
`506fa4aa5303c8118ec7a5cb7b1a2bed9115bf008a24c619270a128cc0c6642e`,
with its original `globalDefinitions.js`. The older UI-linked `Board` and browser
worker were read; their complete runtime was not executed in this study.

## Lessons from actual operations

`Board.scoreSlot` counts surviving winning lines incident to an address. The
later `positionToWinningLines` compiles that inverse relation once and reuses it
for placement invalidation, evaluation, last-move win recognition and hypothetical
immediate-win recognition. `_applyStatusForIndex` changes only incident opponent
lines and records only actual changes for undo. A relationship directly selects
the affected work and serves several consumers.

The frontier's live-line masks already preserve this slot-value definition.
Canonical residuals normalize exact completion requirements. Geometric
multiplicity serves advisory ordering; normalized requirements serve exact
completion semantics. Sharing access must preserve those distinct meanings.

Original `findZugzwang` selects live one-empty-cell lines, then compares
outside-column parity with support-through-target parity. The later
`_computeThreatFlags` rediscovers targets through owned tokens and live incident
lines. Its flags feed `score`; `abpWorker` consumes that score at its configured
cutoff. `checkWin`, immediate winning moves and forced tactical returns have
separate call paths. This describes their actual consumer; it does not grant the
flags new exact-terminal authority or dismiss their strategic value.

`applyMove`/`undoMove` reuse one working position along a search path and restore
only changed line statuses. The active quotient retains interned states/classes
and transition caches across visited positions. The useful resource comparison
is transient path state versus deliberately retained reuse data. The original
TT is separate and can grow during a task; this is not a claim that its entire
memory footprint is bounded by search depth.

The original worker orders moves by TT/center and uses a root-relative,
asymmetric, depth-scaled cutoff score. Those policies need not be imported.
Whole-search timings require matched proof obligations: the old default depth
is 13, while the frontier's current target is exact WDL.

## Bounded adaptation

The slot64 pool already owns singleton target masks. A prototype reproduces
the later original's four threat flags using its public intersection query:

1. Build playable-cell masks from the existing support frontier.
2. Select unplayable target-row parity with `(((W-1)*H) ^ ply) & 1`.
3. Select even/odd support-distance masks from compiled column relationships.
4. Intersect the masks with each player's canonical singleton mask.

Canonical singleton cells are unoccupied, so the support-mask complement does
not require another board scan. Geometry enters construction. The prototype
retains `16 + 8*W*H` typed bytes, no per-state or per-class storage, and uses at
most eight singleton queries for both players. Geometry tables are not a second
target arena. This executable research projection is not an enabled production
ordering policy or a new production API.

Each original immediate 3-own/1-empty line is visited three times, setting its
high/fork flag. The projection preserves that observable flag without repeating
the traversal. It does not reinterpret it as three distinct immediate threats.
C4-0002 already distinguishes that historical weighting from threat counts.

## Local qualification

On Node 26.7.0, `quotient-legacy-frontier-study.mjs` ran 64 seeded legal games
per geometry: 4x4, 4x5, 5x4, 5x5, 6x4 and 7x6, all connect-4.

- 6,862 pre-move positions;
- 13,724 original executable versus projected flag comparisons;
- 65,328 live-incidence slot-value comparisons;
- 120 complete apply/undo snapshot restoration controls;
- 306 winning-edge comparisons with quotient transitions;
- high-word singleton targets exercised;
- zero mismatches.

The sampled original flags entail 343,176 line-cell inspections and 193,506
support/reservoir cell visits. The projection uses 42,157 singleton queries plus
per-position support/mask assembly. These are traversal counts, not equal-cost
instructions or a speedup measurement. Kernel construction and pool maintenance
costs were not compared. This is not exhaustive WDL or playing-strength evidence.

Raw result: `evidence/2026-09-12-legacy-frontier-study.json`.
Extract the preserved ZIP to a separate directory, then run:

```text
node research/semantic-quotient/state-identity-unification/src/quotient-legacy-frontier-study.mjs <extracted-directory>
```

The script verifies executable hashes before import. Its bounded CI step routes
archive, manifest, study and current kernel dependencies into the slot64 lane.

## Decision

Retain the projection as evidence. The owner questioned its practical value;
the current production solver does not compute these flags, so enabling them
does not eliminate existing CPU work. Eval policy stays unchanged.

Next, investigate which active operations can consume already-owned relations
and which retained objects exist only because of representation choices. Measure
CPU and retained memory on matching bounded obligations. A missing complete
parity-terminal derivation does not block smaller useful structural reductions.
No full root was launched; production behavior and the root trigger are unchanged.
