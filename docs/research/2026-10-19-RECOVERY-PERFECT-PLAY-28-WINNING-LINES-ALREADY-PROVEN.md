# Recovery: Standard Connect4 perfect-play 28 winning lines were already established September 14

**2026-10-19. Research owner `research/semantic-quotient`.** The user correctly recalled an exact earlier finding, not a hypothesis that still required sampling or cold-solving the empty board.

## Authoritative historical result

[GitHub issue #41](https://github.com/iteathen/Connect4/issues/41), “Research evidence: exactly 28 optimal-play terminal winning lines on 7×6”, created September 14, 2026, already records a complete bounded census of **the union of distinct original 4-cell winning-line IDs reachable as FIRST terminal wins of P0 along distance-sensitive optimal play from the literal empty 7×6 board**. First five moves are one-based literal `44444` and first win is on absolute ply41. The 28 original K4 geometric lines split as **12 vertical, 8 horizontal, 4 rising diagonal, 4 falling diagonal**, and P0 wins all root-perfect terminal histories. All 28 original physical line IDs and full 41-move zero-based column histories are embedded in that issue's `complete-line-census.json`.

The historical game-theoretic evidence is NOT a mere empty-root guess. The external solver found strong root score +59, proved first five center moves uniquely strong-optimal and ply41 terminal under optimal resistance, and constructed at least one full optimal path to each of the 28 candidates. The geometric *upper bound* from fixed five-center prefix + final landing restricted to top two rows independently has 28 lines; matching 28 witnesses give the lower bound. Historical independent checks included **1148 positions** across witness words and **504 independent endgame score checks**. Its strong-optimality premises are from Markus Böck's 7×6 solved WDL/strong evaluator dataset; these were not re-solved from scratch in the recent October cold-oracle experiments.

**Separately reported WDL-only result: 61** distinct terminal winning lines, when the player in an already theoretically lost position can choose all losing replies as WDL-equivalent rather than maximizing delay. Its source-only historical empirical summary is preserved in `research/evidence/perfect-play/winset-invariants.json`, but that packet explicitly notes the complete normalized raw 61-run artifact was not retained. Do NOT confuse 61 (coarse ties), 28 (strong distance-sensitive ties), and geometric 69 (all lines on any board).

Canonical qualified locations:
- `research/canonical/CLAIMS_WINSET.md`: C4-R0048 = WDL-only61, C4-R0049 = strong optimal28, C4-R0050 = independent GF2 core dimension28, C4-R0051 = maximal-delay envelope38−10=28, C4-R0052 = **missing target-free game-semantic selection theorem**, C4-R0056 = optimal 28-line set has decomposition `28=2+20+6`.
- `docs/research/2026-09-14-optimal-28-oracle-incidence-audit.md`: full source set comparison; 28 lines are **NOT** an independent basis for the distinct `Y_line` 28-dimensional structural core (intersection dimension only2).
- `docs/research/2026-09-14-empty-board-canonical-28-bridge.md`: mathematically derives **without search** the same 28-member geometric *envelope*: original latest P0 possible terminal ply41, top-two-row candidate envelope38, legal rank5 center stack max10 exclusions, leaving exactly28. This by itself does not prove optimal gameplay MUST select center or attain maximal-delay horizon; those semantic-selection statements remain open.
- `research/evidence/perfect-play/winset-invariants.json`: compact historical qualification and all dimensions.
- `docs/research/2026-09-13-perfect-play-line-output-algebra.md`: exact set-valued definition `G(root)` of firstwinning-line terminal union under WDL-only best play; not merely geometrically live windows on one board.

## October independent physical recheck of issue #41, without solving game values again

On 2026-10-19, directly fetched LIVE issue #41 through the GitHub connector and extracted its original 28 full witness sequences; independently constructed all original 69 finite K4 windows and replayed each of the **28×41=1148** original moves with strict gravity, alternating P0/P1 and first-win stopping. Independently checked:
- each witness genuinely wins FIRST at move41 for P0 with its recorded original K4 line;
- exactly28 distinct original line IDs, with expected 12/8/4/4 direction counts;
- purely geometric upper-bound selector using five-center prefix P0/P1 stones and move41 final top-two-row landing generates **exactly the same set of 28 lines**.
All checks passed, zero mismatch. This checks physical soundness of archived witness geometry; the historical database-guided score qualification (not independently rerun in this check) is the basis for the word "optimal".

Durable verification packet: `research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/RECOVERED_2026_09_14_EMPTYROOT_STRONG28_28_WITNESSES_REPLAY_0_1.json`.

## Withdraw incorrect recent framing

Prior October statements that *no perfect-empty-root surviving winning-line count had been previously computed, or the 27/28 hypothesis remained untested,* were WRONG. The previous ad hoc 158 solved parents / 793 children and 30 conditionally optimal late-game continuations are valid calibration statistics **of a different object**, namely per-position geometric unblocked-line count `U(s)`; they cannot contradict or establish the known `|G_strong(empty)|=28` union over original strong-optimal terminal winning lines. The October cold-oracle root trials that stopped at 200k and4m nodes say ONLY that those fresh re-solves failed under short budgets; they cannot negate September's complete qualified issue #41 census.

The user was recalling **the exact prior answer**, not merely the GF2 coincident 28-dimensional middle object.

## Correct current broader research

**The 28 is now an existing fixed ground truth for strong-optimal terminal support.** The hard new mathematics is WHY the 28 original winning-line identities emerge from the game's initial symmetry, four-way unfolded directional geometry, owner-interference waves, hidden finite Fourier selection and strategic game semantics, **without feeding root solved data into the target-free formula**. Specifically compare:
- the exact original 28-member terminal winning-line SUPPORT set from issue #41;
- `Y_cell=Y_line=28` GF2 structural core, with intersection filtration `2+20+6`, not automatic equality;
- original four-ribbon 37-strand/42-cell linked Fourier ownership/intersection tensors, and the historical rank5 center 38→28 envelope.
Explore this broadly; **defensive obligations are optional**, not the only possible bridge. The historical issue #41 supplies validation witness line IDs, no reason to spend solver cycles rediscovering the strong terminal-line COUNT. An existing exact7x6 Oracle may be used to probe *new* comparisons or extra tie variants, but is not needed to recertify the known 28 existence/count.

Production gameplay logic1.2, main and runtime solvers unchanged; only research/handoff records updated.
