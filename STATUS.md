# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is the current-state router. Detailed evidence is under `docs/research/**`; executable controls are under `research/semantic-quotient/**`.

## Proof boundary

- External solved W/D/L, strong-distance, opening-book, witness and varying-board data are validation/falsification evidence only.
- Finite board sweeps are implementation/falsification checks only. No theorem quantified over unbounded `W` or `H` may be justified by testing boards up to some finite cutoff.
- C4-0006/C4-0007 remain Candidate structural/proof specifications; C4-0010 remains an accepted research consumer and does not promote them.
- Unknown != loss; theorem failure != opposite outcome; upper bound != exact census; equal dimension != natural isomorphism.
- Strongest controls contain no predefined 28 or 69 and no recursive minimax/Negamax/MCTS/PNS proof step.

## Total-domain logical foundation

The active board-size domain is every positive integer rectangle `W x H`, with `K=4`. Small boards must collapse from the same generated objects used on regular boards; there is no separate small-board mode.

Let

```text
a=(W-3)_+
b=(H-3)_+.
```

For every positive `W,H`, the generated geometric winspace has exactly

```text
L(W,H)=H*a + W*b + 2*a*b.
```

This is a counting proof over arbitrary integers: horizontal starts contribute `Ha`, vertical starts `Wb`, and the two diagonal orientations contribute `ab` each.

A universal mate-response lemma is also proved: if a legal disjoint response matching hits every generated opponent winning requirement, the opponent cannot complete a requirement. If the same construction is available to either player, the finite empty-board game is a draw.

Two infinite board families already collapse logically under that lemma:

1. **Every `1<=W<4`, arbitrary positive `H`, is a draw.** With `a=0`, all generated requirements are vertical (or the winspace is empty). Every vertical length-4 interval `{s,s+1,s+2,s+3}` contains the even-depth support pair `{s,s+1}` when `s` is even or `{s+1,s+2}` when `s` is odd.
2. **Every `H=1`, arbitrary positive `W`, is a draw.** The only generated requirements are horizontal, and every four consecutive frontier cells contain one adjacent pair from `(0,1),(2,3),...`.

These are quantified logic proofs; finite examples are not premises.

Primary note:
`docs/research/2026-09-14-total-domain-logical-foundation.md`

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

The first line now has the proved total-domain replacement `L(W,H)=H(W-3)_+ + W(H-3)_+ + 2(W-3)_+(H-3)_+`. The remaining regular formulas are not yet promoted to total-domain formulas; generated-rank definitions remain authoritative on narrow degeneracies (`4x4` incidence; `4x5` phase).

Balanced regular boards satisfy `(W-4)(2H-9)=9`, giving exactly `5x9/core30`, `7x6/core28`, `13x5/core46`. Standard 7x6 is the only balanced one with <=42 cells and the only current balanced board on which the qualified beta/gamma pairings are both perfect.

Cross-board CPC residual parity is

```text
q_(W,H)(S)=(W-1)H+C(S)+r_max(S) mod 2.
```

The old `q=C+r` shorthand is standard-board-specific because `(W-1)H=36` is even.

Width 7 is also the unique K=4 width with one unique maximum-impact initially playable event. Combining that width fact with `Delta=0` forces `H=6`, hence `Y=WH-W-H-1=28`. This is a structural classification, not an optimal-move theorem.

## Searchless response layer 1: elementary frontier

A board-family response theorem uses only generic Claimeven/Baseinverse response programs.

For empty `W x H`, `K=4`, the explicit compatible construction leaves unresolved only horizontal length-4 requirements on one-based odd rows `3,5,7,...`.

The total-domain counting form of that unresolved set is

```text
R1(W,H)=(W-3)_+ * floor((H-1)/2).
```

The positive part is required: narrow boards have no horizontal length-4 requirements and must collapse to zero rather than produce a negative count.

Standard 7x6:

```text
69 geometric requirements
61 certified by elementary responses
8 unresolved = four row-3 horizontals + four row-5 horizontals.
```

This `61 certified / 8 unresolved` theorem is unrelated to the earlier W/D/L-only experiment that happened to observe 61 terminal lines.

Controls:
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-elementary-response-cover-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-total-domain-support-response-matching.mjs`

## Searchless selection theorem 1: center opening is necessary

A stronger constructive theorem closes the first game-semantic selection step on width 7.

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

The construction/proof is height-parametric and uses no legal continuation tree. Finite runner ranges are qualification only and are not the proof of the quantified `H` claim.

Therefore:

```text
P0 forced win on 7 x even-H => P0 opens center.
```

On 7x6 this proves the first center event of the canonical five-event chain searchlessly. It does not assume or prove the external root-win label; it is a necessary-condition theorem.

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
- elementary response cover alone (the canonical five-center prefix still leaves the same eight odd-horizontal channels);
- finite board interpolation as a proof of an unbounded board-family formula.

The recurring missing game-semantic mechanism remains **deadline-valued response/support transfer**: a defensive response can block one requirement while simultaneously discharging gravity support for a dependent opponent event. Eventual ownership therefore cannot replace completion-before-deadline semantics.

## Active seam: total-domain structural calculus

The current task is to extend the structural calculus over every positive `W,H` by proof, not census.

Immediate targets:

1. replace regular-only expressions with positive-part/generated-set forms where mathematically valid;
2. derive exact narrow-board degeneracies from empty direction classes, kernels, images and quotients rather than hand-written cases;
3. derive exact generated incidence/core rank regimes symbolically;
4. keep CPC/phase/residual operators defined when direction classes or quotients collapse;
5. recover the 7x6 common `Y=28` as a corollary of those same total-domain definitions.

Any formula claimed for unbounded `W,H` must have a symbolic proof for arbitrary positive integers. A finite runner can only falsify or validate its implementation.

## Durable evidence

- `docs/research/2026-09-14-total-domain-logical-foundation.md`
- `docs/research/2026-09-14-empty-board-canonical-28-bridge.md`
- `docs/research/2026-09-14-k4-board-invariant-family.md`
- `docs/research/2026-09-14-k4-selection-invariant-frontier.md`
- `docs/research/2026-09-14-searchless-seven-wide-opening-selection.md`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-total-domain-support-response-matching.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-board-invariant-family-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-balanced-pairing-family-audit.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-phase-path-transport-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-initial-event-centrality-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-preterminal-exclusion-capacity-audit.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-elementary-response-cover-control.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-seven-wide-noncenter-draw-certificate.mjs`

## Paused / secondary seams

- post-center strong-distance selector: valid, paused while total-domain theorem is active;
- history-aware marked residual calculus after the qualified 21-space: valid, paused;
- exact varying-board censuses: validation/falsification only;
- forward W/D/L rank-7 P1 horizon at exact state `4665655`: valid unfinished work, paused.
