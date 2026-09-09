# Terminal-boundary qualification for backward symbolic solving

**Date:** 2026-09-09  
**Status:** passed research qualification; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`

## Why this check is separate

The backward symbolic solver starts from terminal winning predicates and propagates their dependencies toward earlier support skeletons. If those terminal predicates are wrong, a perfectly consistent symbolic fixed point can still prove the wrong game.

Terminal semantics are therefore qualified independently of the symbolic recurrence.

The qualification asks four separate questions:

1. Does a claimed winning landing actually produce a geometric K-in-row through the newly placed stone?
2. Does the reconstructed terminal board have the expected winner, valid gravity and no pre-existing terminal result?
3. Does a full-board no-win terminal actually reconstruct as a draw?
4. On standard 7x6 known positions, do externally documented terminal outcomes and the maintained independent oracle agree with the same boundary convention and strong-score value?

## Arithmetic correction before execution

The first draft of the harness used JavaScript Number bitwise operators on 7x6 masks. Since JS bitwise operators truncate to 32 bits, that form was rejected before qualification.

The final harness uses:

- Number/32-bit masks only for complete boards with at most 20 cells;
- BigInt for all 7x6 board reconstruction and geometric checks.

A relative path to the frozen oracle corpus was also corrected before the authoritative run.

## Exhaustive complete-game terminal boundary

Four complete small games were enumerated independently. Terminal children are checked and then deliberately not admitted as further game states.

| Game | Nonterminal states | Legal edges | Win-terminal edges | Draw-terminal edges | Winning schemas exercised |
|---|---:|---:|---:|---:|---:|
| 4x3 c3 | 4,631 | 11,818 | 3,192 | 56 | 14/14 |
| 4x4 c4 | 134,289 | 304,574 | 25,780 | 10,692 | 10/10 |
| 5x3 c4 | 147,563 | 377,229 | 11,237 | 11,840 | 6/6 |
| 4x5 c4 | 1,348,441 | 3,175,616 | 374,482 | 74,372 | 17/17 |

Aggregate:

- **1,634,924** nonterminal physical states checked;
- **3,869,237** legal edges checked;
- **414,691** actual winning terminal edges checked;
- **96,960** full-board draw terminal edges checked;
- **0 terminal-predicate mismatches**;
- **0 terminal-board mismatches**;
- **0 prior-terminal states admitted**.

### Independent predicate differential

Every candidate terminal move is classified in two independent ways:

1. membership/completion of a pre-enumerated winning-line mask containing the landing stone;
2. a directional scan from the landing stone in horizontal, vertical and both diagonal directions.

They agreed on every checked edge.

Every geometric winning schema in every complete small geometry was actually exercised by at least one reachable terminal edge. This is stronger than merely unit-testing one horizontal/vertical/diagonal example.

## Frozen standard-7x6 action corpus

The existing `reference/oracles/solved-actions-v1.tsv` contains 128 frozen vectors whose parent scores come from Pascal Pons benchmark checkpoints and whose move vectors were frozen after independent Node-oracle qualification.

Boundary check:

- 128 vectors;
- 896 action slots;
- 583 legal actions;
- 5 full-board terminal-draw actions;
- 0 predicate mismatches;
- 0 frozen-score mismatches;
- 0 reconstructed-board mismatches;
- 0 inconsistencies between a parent's maximum possible immediate score and whether the position actually exposes an immediate win.

### Coverage limitation discovered

This particular 128-vector frozen slice contains **zero immediate winning actions**.

That means it is useful evidence for action-score consistency and terminal draws, but it cannot honestly be cited as independent 7x6 immediate-win coverage. External documented terminal fixtures were therefore added rather than silently treating the corpus as stronger evidence than it is.

## External known terminal fixtures

### Standard 7x6 wins

Three publicly documented winning games were reconstructed independently:

| Source | Terminal sequence (1-based) | Expected | Last landing | Parent oracle score | Expected immediate score |
|---|---|---|---:|---:|---:|
| `connectpy` README | `4455673` | first player win | cell 2 | 18 | 18 |
| `connect-4-game-engine` README vertical example | `1212121` | first player win | cell 21 | 18 | 18 |
| `connect-4-game-engine` README horizontal example | `1525364` | first player win | cell 3 | 18 | 18 |

For every fixture:

- no earlier prefix contained a win;
- the documented last move completed an actual four-in-a-row;
- the winning line contained the landing stone;
- an independent directional scan agreed;
- the reconstructed winner was the documented first player;
- the maintained independent 7x6 oracle evaluated the nonterminal parent at the exact maximum immediate-win score of **18**.

### Documented terminal draw

The 4x4 `connect-4-game-engine` draw example, converted from its published 0-based notation, is:

`1324314213243142`

The reconstructed board is full, contains no winner at any earlier prefix or at the final board, and was therefore independently confirmed as a draw.

### Strong-score convention anchors

A prior passing version of the same CI run also evaluated the two examples documented in Pascal Pons's public benchmark tutorial:

- `4455` -> expected **18**, maintained oracle **18**;
- `44455554221` -> expected **-15**, maintained oracle **-15**.

These are not terminal-board fixtures; they independently anchor the strong-score/distance convention used at the terminal boundary.

## Result

The terminal axioms used by the backward symbolic formulation now have substantially stronger evidence than root-result agreement alone.

Qualified properties:

- gravity and side-to-move consistency;
- no continuation after an earlier win;
- landing-stone membership in every newly completed winning line;
- independent geometric orientation check;
- full-board draw behavior;
- standard 7x6 winner/coordinate mapping against externally documented terminal games;
- immediate strong-score convention against the maintained exact oracle;
- external Pons score convention anchors.

**No mismatch was found.**

This does not itself prove the backward symbolic recurrence. It closes a different obligation: the terminal facts from which that recurrence starts agree with independent physical-game reconstruction and known outcomes.

## Reproduction

```sh
node reference/research-prototypes/2026-09-09-low-confidence-survival/terminal_boundary_qualify.mjs
node reference/research-prototypes/2026-09-09-low-confidence-survival/terminal_known_fixture_qualify.mjs
```

Authoritative CI execution:

- workflow run: `34412654221`
- job: `102670394371`
- head: `ee1c8f294fe3f6483f27e16891cde19b56c40932`
- result: **success**

A previous passing run `34412572715` additionally contains the two Pascal Pons score-anchor checks.

Structured evidence:

`docs/research/evidence/2026-09-09-terminal-boundary-qualification.json`
