# Safe-bulk entry and finite top-lift defect

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Connect the pure-followup bulk safety code to finite-board initialization and top truncation.

The bulk derivative word

```text
d=delta phi
```

correctly forgets global player complement for infinite-tail safety. This note proves that the same quotient is insufficient for finite-board termination: top truncation selects one of the two vertex lifts of `d`, and that lift depends on board-height parity.

No solved finite-board outcome is used.

## 1. One-move entry into pure-followup bulk

Start from the empty support frontier and let P0 place one setup stone in column `c`. P1 is now to move and P0 adopts same-column followup whenever possible.

The support phase word is

```text
phi=e_c in F2^W.
```

Its width derivative

```text
d=delta e_c
```

has a `1` on each path edge incident to column `c` and `0` elsewhere.

The pure-followup safety theorem says the tail is safe iff `d` contains no length-three factor `000` or `111` over a geometric four-column window.

For a single vertex impulse `e_c`, `d` contains at most two adjacent `1`s, so `111` cannot occur. Safety is therefore exactly the condition that neither zero-run beside the impulse has length at least three.

For an interior column `0<c<W-1`, the left zero run has length `c-1` and the right zero run has length `W-c-2`. Hence

```text
c-1 <= 2
W-c-2 <= 2,
```

or

```text
W-4 <= c <= 3.
```

The same clipped inequalities handle boundary columns. Thus the exact safe opening set for every positive width is

```text
S1(W)={c : max(0,W-4) <= c <= min(W-1,3)}.
```

Its cardinality is

```text
N1(W)=min(W,(8-W)_+).
```

For widths supporting a four-column Connect-4 window (`W>=4`):

```text
W=4 -> 4 safe opening columns
W=5 -> 3
W=6 -> 2
W=7 -> 1
W>=8 -> 0.
```

Therefore:

> **Unique one-move safe-entry theorem.** Among widths `W>=4`, width `7` is the unique width with exactly one one-move entry into a safe pure-followup bulk, and that move is the center column `c=3`.

Widths below four are already draw by the total-domain thin-board theorem; their apparent safe-entry count is vacuous because no four-column winning requirement exists.

## 2. Infinite-height consequence

For any `c in S1(W)`, after P0's setup move in column `c`, P0 may respond to every P1 move by playing immediately above it in the same column on an infinite-height board.

All occupied cells produced by this policy agree with the eventual alternating coloring determined by `phi=e_c`. Since the corresponding derivative word is pure-followup-safe, that complete coloring contains no monochromatic horizontal, vertical or diagonal Connect-4. Therefore P1 cannot complete a Connect-4 under this policy.

Thus for `W=4,5,6,7`, P0 has an explicit one-move-setup cannot-lose strategy on the infinite-height path board. In particular, width 7's unique such setup is the center opening.

This is a cannot-lose statement, not a claim that P0 forces a win.

## 3. Finite-height unmatched-top vector

Now truncate the board at finite height `H`.

Assume a pure-followup phase begins from frontier heights `h_c` with P1/opponent to move and P0/controller responding in the same column. Let

```text
phi_c=h_c mod 2.
```

Column `c` has

```text
R_c=H-h_c
```

remaining physical events.

The response policy consumes events in opponent/controller pairs. If `R_c` is even, the column is exhausted by complete pairs. If `R_c` is odd, one final unmatched event remains for the opponent at the physical top.

Therefore the unmatched-top indicator is

```text
u_c = R_c mod 2
    = H + h_c mod 2
    = phi_c + (H mod 2).
```

In vector form,

```text
u = phi + eta * 1,
eta = H mod 2.
```

This is an exact finite-boundary response defect.

## 4. The forgotten bulk bit reappears at the top

Apply the width derivative:

```text
delta u
 = delta phi + eta delta(1)
 = delta phi
 = d,
```

because the all-ones vertex word spans `ker(delta)`.

Hence even and odd heights can have the **same bulk derivative code** `d` while their finite top-boundary defect vectors are the two different lifts

```text
u=phi
u=phi+1.
```

The exact sequence

```text
0 -> <1> -> F2^W --delta--> F2^(W-1) -> 0
```

therefore has two different semantic uses:

- infinite pure-followup safety depends only on the quotient coordinate `d=delta phi`;
- finite top termination depends on which affine lift of `d` is selected.

Height parity is exactly the lift-selection bit.

This proves that quotienting by global complement is sound for infinite bulk safety but unsound as a complete finite-board state identity.

## 5. Standard width-7 center entry

For `W=7,c=3`,

```text
phi=0001000
```

and

```text
d=001100.
```

The derivative word is safe and is the unique one-move safe entry at this width.

The finite unmatched-top vector is

```text
H even: u=0001000
H odd : u=1110111.
```

Thus the same safe bulk state terminates with:

```text
one unmatched opponent-top column when H is even;
six unmatched opponent-top columns when H is odd.
```

No game-value conclusion is drawn from those cardinalities. The location/resource/deadline topology of the unmatched events still matters.

## 6. Why the top defect is not yet the sign

When an unmatched opponent-top event is consumed, the controller does not have a same-column followup available. If the game has not already terminated, the controller instead receives an ordinary decision slot elsewhere.

A free move changes a column phase and can create a vertical phase seam: cells below the move were generated under the old phase word while cells above it would be generated under a new phase word if pure followup resumes.

Therefore the current bulk word `d` alone is insufficient after a boundary defect. Connect-4 lines crossing the seam can depend on up to three neighboring vertical layers.

The remaining finite-board problem is consequently a bounded-memory **boundary/seam closure**, not merely counting the `1`s in `u`.

## 7. Required state refinement

A complete finite-height transfer state must retain at least:

```text
bulk derivative word d;
a lift/anchor bit sufficient to recover phi;
remaining/top defect information u or an equivalent derived representation;
local vertical seam history up to the Connect-4 interaction range;
response-resource and completion-before-deadline facts.
```

The key correction is structural: the global-complement bit may be removed only inside a region whose consumer asks solely about bulk monochromatic safety. It may not be removed across the finite top boundary.

## 8. Next theorem target

Derive the finite seam operator produced when the controller uses a free boundary decision and then re-enters pure followup.

Because Connect-4 has vertical derivative order three, only lines within three rows of the phase-change event can cross the old/new phase interface. The candidate state should therefore have bounded vertical memory independent of `H`.

If that closure is proved, arbitrary height can be represented by:

```text
bottom initialization
-> safe-bulk transfer
-> affine top lift
-> bounded seam/deadline closure.
```

That is the current shortest path toward a signed all-board value formula.

## Proof boundary

Sections 1-5 are exact consequences of the previously proved pure-followup safety condition, path derivative, and pair-consumption semantics. Section 6 identifies why a scalar top-defect count is insufficient. Sections 7-8 are requirements/research direction.
