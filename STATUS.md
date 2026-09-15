# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is the current-state router. Detailed evidence is under `docs/research/**`; executable controls are under `research/semantic-quotient/**`.

## Proof boundary

- External solved W/D/L, strong-distance, opening-book, witness and varying-board data are validation/falsification evidence only.
- C4-0006/C4-0007 remain Candidate structural/proof specifications; C4-0010 remains an accepted research consumer and does not promote them.
- Unknown != loss; theorem failure != opposite outcome; upper bound != exact census; equal dimension != natural isomorphism.
- Strongest controls contain no predefined 28 or 69 and no recursive minimax/Negamax/MCTS/PNS proof step.

## Standard structural theorem

From generated `K=4,H=6,W=7` GF(2) incidence:

```text
L=69
rank(B)=35
dim ker(B)=34
Y_cell=28
Y_line=28.
```

The qualified CPC/residual beta/gamma forms are perfect rank 28 and define the natural isomorphism `T:Y_line->Y_cell`. Natural splittings remain

```text
im(B)=Y_cell direct-sum C_axis=28+7
ker(B)=Y_line direct-sum C_phase=28+6
C_phase ~= Even(F2^7).
```

The phase quotient is canonically the edge space of the width path, with `partial(edge_i)=e_i+e_(i+1)`. Every two-ply displacement `e_a+e_b` has a unique interval lift and structural phase transport length `|a-b|`; same-column response has zero phase transport.

The target-free canonical bridge independently derives the same 28-line geometry later observed by the solved oracle: natural preterminal rank `2K-3=5`, parity-capacity horizon 41, and the five-high center stack uniquely maximizes maximal-delay candidate exclusion `38-10=28`. This remains a structural envelope theorem until semantic strong-distance selection is closed.

## K=4 board-family invariants

Regular formulas:

```text
L                    = 4WH-9W-9H+18
rank(B)              = WH-7
rank(Q_axis)         = W+H-6
rank(Q_phase)        = W-1
dim(Y_cell)          = WH-W-H-1
dim(Y_line)          = 3WH-10W-9H+26
Delta                = (W-4)(2H-9)-9
Delta(W,H)-Delta(H,W)=H-W.
```

Generated-rank definitions remain authoritative on narrow degeneracies (`4x4` incidence; `4x5` phase).

Balanced regular boards satisfy `(W-4)(2H-9)=9`, giving exactly `5x9/core30`, `7x6/core28`, `13x5/core46`. Standard 7x6 is the only balanced one with <=42 cells and the only current balanced board on which the qualified beta/gamma pairings are both perfect.

Cross-board CPC residual parity is

```text
q_(W,H)(S)=(W-1)H+C(S)+r_max(S) mod 2.
```

The old `q=C+r` shorthand is standard-board-specific because `(W-1)H=36` is even.

Width 7 is also the unique K=4 width with one unique maximum-impact initially playable event. Combining that width fact with `Delta=0` forces `H=6`, hence `Y=WH-W-H-1=28`. This is a structural classification, not an optimal-move theorem.

## Searchless response layer 1: elementary frontier

A board-family response theorem now uses only generic Claimeven/Baseinverse response programs.

For empty `W x H`, K=4, an explicit compatible construction certifies every P0 geometric winning requirement except the horizontal length-4 requirements on one-based odd rows `3,5,7,...`.

Exact unresolved frontier:

```text
R1(W,H)=(W-3)*floor((H-1)/2).
```

Standard 7x6:

```text
69 geometric requirements
61 certified by elementary responses
8 unresolved = four row-3 horizontals + four row-5 horizontals.
```

This `61 certified / 8 unresolved` theorem is unrelated to the earlier W/D/L-only experiment that happened to observe 61 terminal lines.

Control:
`research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-elementary-response-cover-control.mjs`

## Searchless selection theorem 1: center opening is necessary

A stronger constructive theorem closes the first game-semantic selection step.

For every even `H>=4` on width 7, every non-center first move by P0 has an explicit P1 draw certificate built only from generic Before, Baseinverse and Claimeven response programs.

For a left-side opening `x in {0,1,2}`:

```text
P1 reply: x+1
vertical-response columns: {x,x+1} plus {x+4,x+5} when x<=1
Claimeven columns: complement
Before source rows: every even one-based row 2,4,...,H-2 across all four horizontal windows
top Claimeven: every Claimeven column
secondary Baseinverse: bottom {x+4,x+5} when x<=1.
```

Reflection covers openings `4,5,6`.

The executable control verifies rule validity, conservative resource compatibility and complete coverage of every still-live P0 group for all six non-center openings and every even height 4..24; the construction/proof is height-parametric and uses no legal continuation tree.

Therefore:

```text
P0 forced win on 7 x even-H => P0 opens center.
```

On 7x6 this proves the **first center event of the canonical five-event chain searchlessly**. It does not assume or prove the external root-win label; it is a necessary-condition theorem.

Control:
`research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-seven-wide-noncenter-draw-certificate.mjs`

Note:
`docs/research/2026-09-14-searchless-seven-wide-opening-selection.md`

## Compatibility provenance warning

PR #39 intentionally preserves the original U1/Test-B compatibility harness and repairs it in the v3 runner. The base descriptor omitted `claims`; the v3 runner patches that seam and generalizes claim/inverse boundary sharing. The conservative Allis §7.4 compatibility table remains proof authority where the generic v3 predicate admits additional cases.

Do not treat the base/v1 file as the qualified compatibility implementation merely because it is the file patched by the runner.

## Falsified shortcuts

The following are insufficient as strong-distance selectors and remain preserved as falsifiers:

- terminal-envelope cardinality alone;
- preterminal exclusion capacity alone (`8x7` supplies a direct scalar counterexample);
- cooperative earliest-completion horizons;
- minimum blocker hitting sets;
- raw response-release unions;
- simple residual dominance across different support skeletons;
- pairwise rule compatibility without the complete rule/control premises;
- elementary response cover alone (the canonical five-center prefix still leaves the same eight odd-horizontal channels).

The recurring missing mechanism is **deadline-valued response/support transfer**: a defensive response can block one requirement while simultaneously discharging gravity support for a dependent opponent event. Eventual ownership therefore cannot replace completion-before-deadline semantics.

## Active seam: post-center strong-distance selection

The first move is no longer the open problem. Starting from P0 center, derive searchlessly why the longest-resistance P1 response is the same-column zero-phase response, and why the same deadline/control selection repeats through the natural preterminal rank 5.

The required NDC state must carry at least:

```text
residual requirements
support/event prerequisites
board-correct CPC parity
phase-path transport
response resources
blocker certificates
support released by responses
completion/blocker horizons.
```

A certificate must keep prerequisites/guards and exact horizon/rank. A blocker eliminates an opponent requirement only if its certified timing beats that requirement's completion deadline. Any response event must update both blocker state and support prerequisites before closure continues.

The preferred next experiment is to compare the seven P1 responses after P0 center with a **static deadline-valued proof-program bound**, not recursive child values. It should either prove zero-phase center uniquely maximizes the certified survival horizon or preserve the smallest counterexample and identify the missing certificate relation.

External issue #41's post-center distance scores are validation only and are forbidden as premises.

## Durable evidence

- `docs/research/2026-09-14-empty-board-canonical-28-bridge.md`
- `docs/research/2026-09-14-k4-board-invariant-family.md`
- `docs/research/2026-09-14-k4-selection-invariant-frontier.md`
- `docs/research/2026-09-14-searchless-seven-wide-opening-selection.md`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-board-invariant-family-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-balanced-pairing-family-audit.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-phase-path-transport-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-initial-event-centrality-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-preterminal-exclusion-capacity-audit.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-elementary-response-cover-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-seven-wide-noncenter-draw-certificate.mjs`

## Paused / secondary seams

- history-aware marked residual calculus after the qualified 21-space: valid, paused;
- exact varying-board censuses: validation/falsification only;
- forward W/D/L rank-7 P1 horizon at exact state `4665655`: valid unfinished work, paused.
