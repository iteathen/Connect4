# CPC as a binary control potential: ownership, phase and seams in one scalar field

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Unify CPC event-rank parity with the newly derived ownership/domain-wall representation.

The key result is that the basic CPC formula gives an **absolute** target-owner bit in which the current ply cancels. Strategic release/reservation parity then acts as one scalar correction field. The phase word, seam masks and domain-wall edge field are simply discrete derivatives of that correction potential.

This removes several representational conversions without weakening CPC's resource/deadline guards.

## 1. Player bit convention

Use

```text
owner bit 0 -> first player / repository P0
owner bit 1 -> second player / repository P1.
```

At occupied-cell count `ply`, standard alternating no-pass play gives the absolute side-to-move bit

```text
stm = ply mod 2.
```

## 2. Basic CPC event rank

For target cell

```text
t=(c,r)
```

with current frontier heights `h_c`, CPC gives

```text
N(t)
  = (r-h_c+1) + sum_(d!=c)(H-h_d)
  = (W-1)H - ply + r + 1.
```

The target is the `N(t)`-th event relative to the current side to move, so its owner parity relative to `stm` is

```text
N(t)-1 mod 2.
```

## 3. Absolute-owner cancellation theorem

The absolute owner bit of the zero-reservation target is therefore

```text
q0(t)
 = stm + (N(t)-1)
 = ply + (W-1)H - ply + r
 = (W-1)H + r
 mod 2.
```

Thus:

> **Basic absolute CPC theorem.** In the zero-reservation event reservoir, the absolute first/second-player owner bit of a target is independent of the current prefix and target-column height. It is
>
> `q0(c,r)=((W-1)H+r) mod 2`.

The familiar standard-board odd/even threat ownership is one specialization: on 7x6, `(W-1)H=36` is even, so `q0=r mod 2` in zero-based rows.

No solved outcome premise is used.

## 4. Strategic parity correction as a scalar potential

CPC already states that if a valid strategic fragment changes the number of relevant prior events before target `t` by `Delta(t)`, then

```text
N'(t)=N(t)+Delta(t)
```

and target ownership flips iff `Delta(t)` is odd, subject to the fragment's support/resource/event-order guards.

Define the binary correction potential

```text
rho(t)=Delta(t) mod 2.
```

Then the absolute owner field is

```text
q(c,r)=kappa + r + rho(c,r),
```

where

```text
kappa=(W-1)H mod 2.
```

This is the common scalar field behind CPC ownership and the domain-wall calculus.

`rho` is not asserted unconditionally for an unresolved fragment: it exists on the region/targets where the corresponding CPC correction is actually certified under its guards.

## 5. Horizontal and vertical disagreement are derivatives of rho

For adjacent horizontal cells,

```text
H(x,y)
 = q(x,y)+q(x+1,y)
 = rho(x,y)+rho(x+1,y)
 = delta_x rho.
```

For adjacent vertical cells,

```text
V(x,y)
 = q(x,y)+q(x,y+1)
 = 1 + rho(x,y)+rho(x,y+1)
 = 1 + delta_y rho.
```

Therefore the vertical seam field from the domain-wall normal form is exactly

```text
S=1+V=delta_y rho.
```

And the horizontal phase word is

```text
H=delta_x rho.
```

So phase and seams are the two coordinate derivatives of one CPC correction potential.

## 6. Plaquette flatness becomes equality of mixed derivatives

Because `rho` is a scalar `F2` field,

```text
delta_y delta_x rho = delta_x delta_y rho.
```

This is exactly the previously derived plaquette relation

```text
H_(y+1)+H_y = delta_x S_y.
```

Thus the finite seam transport law is not an extra dynamic identity. It is commutation of the two discrete derivatives of the CPC correction potential.

## 7. Pure-followup phase is a vertically constant potential

In a pure-followup region there are no seam corrections:

```text
S=delta_y rho=0.
```

Therefore

```text
rho(x,y)=phi(x)+constant
```

through that connected region, and

```text
H=delta_x phi=d.
```

The pure-followup phase code is precisely the vertically constant sector of the general CPC potential.

A free move inserts a vertical step in `rho` in one column; its vertical derivative is the seam singleton and its horizontal derivative changes the phase above the seam.

## 8. Directional disagreement in potential form

For a displacement `(dx,dy)` between adjacent cells along one of the Connect-4 directions, the baseline owner field contributes `dy mod 2` and the correction contributes the directional finite difference of `rho`.

Schematically,

```text
edgeDisagreement_d = (dy mod 2) + delta_d rho.
```

Therefore a four-cell Connect-4 in direction `d` occurs exactly when the three consecutive values of this directional disagreement are zero.

The horizontal/vertical/diagonal win predicates are thus the same zero-edge predicate applied to different directional derivatives of one scalar potential.

## 9. Response fragments as potential updates

A strategic fragment that changes relevant prior-event parity on a target region acts by

```text
rho -> rho + f
```

for the certified binary indicator/correction field `f` of that region.

Its visible boundary effects are derivatives:

```text
horizontal phase transport = delta_x f
vertical seam transport    = delta_y f.
```

A free move followed by resumed pure followup is the concrete example

```text
f = e_j tensor vertical_step_r.
```

The fragment is nontrivial only at the boundary of that step in the disagreement representation.

This is the same 'representation where the isomorphism becomes the operation' principle: the strategic update, phase transport and seam insertion are one addition viewed before or after differentiation.

## 10. Pairwise U1 constraints as potential differences

For two certified future events `u,v`, an exact ownership relation

```text
owner(u)+owner(v)=b
```

is an exact potential-difference constraint.

When both targets share the same fixed CPC baseline contribution, this is directly

```text
rho(u)+rho(v)=b.
```

When their baseline rows/directions differ, the known baseline difference is moved to the right-hand side.

Thus parity union-find over strategic events is solving relative values of the same control potential, while fixed-ownership facts anchor its absolute lift.

## 11. Outcome-bit compatibility

A legal terminal four-line has zero disagreement on its three path edges, so all four owner bits are equal.

The low output bit is the exact terminal/win proposition. The high sign/player bit is the absolute potential lift `q` evaluated on any cell of the certified line.

Hence the conceptual encoding

```text
00 draw
01 first-player win
11 second-player win
```

matches the potential/derivative split:

```text
win bit    -> does a terminal zero-edge path exist under exact first-win semantics?
player bit -> which of the two ownership lifts occupies that path?
```

Global player complement adds `1` to the scalar potential/owner lift, leaves every derivative and geometric terminal predicate unchanged, and flips only the decisive player bit.

## 12. What remains outside the potential

The scalar potential unifies **ownership parity**. It does not certify its own causal validity.

Still required where material:

```text
support/accessibility;
response-resource compatibility;
which target region a correction f applies to;
event precedence;
completion-before-deadline;
first-win/terminal stopping semantics;
nonlinear blocker clauses not reducible to one XOR relation.
```

These remain NDC/residual structure attached to the potential updates.

## 13. Current reduced logic shape

The emerging calculus is now

```text
baseline owner potential: kappa+r
+ certified strategic correction potential rho
    -> owner q
    -> derivatives / domain walls
    -> zero-edge Connect-4 predicates

support + resources + deadlines
    -> where/when rho updates are valid

residual blocker hypergraph
    -> nonlinear no-win clauses not captured by XOR alone.
```

This is a smaller primitive set than separate CPC, phase, seam and player-color calculi.

## Next theorem target

Rewrite player-specific residual winning requirements and NDC threat/deadline certificates as:

```text
anchored zero-edge path obligations
+ potential-difference blockers
+ nonlinear blocker clauses only where unavoidable
+ causal deadlines.
```

The objective is to determine how much of WSL/NDC collapses into the same potential representation before introducing any further primitive.

## Proof boundary

Sections 1-8 are direct algebraic consequences of the accepted/Candidate CPC event-count formula and the binary ownership convention. Sections 9-10 describe certified parity corrections only on regions where their original guards hold. No claim is made that arbitrary unresolved strategic fragments define a global unconditional `rho`. No solved W/D/L data is used.
