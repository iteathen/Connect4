# Finite top-defect transport module

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Identify the algebra carried by the unmatched-top vector of a finite pure-followup truncation.

The previous boundary-entry theorem derived

```text
u_c=(H-h_c) mod 2
```

for a pure-followup phase entered with opponent to move. `u_c=1` means column `c` has one unmatched opponent event after all possible same-column response pairs are removed.

This note proves that boundary resolution acts on `u` by the same even-weight path-phase module already present in the static line-side decomposition.

## 1. One boundary cycle

Assume column `c` reaches its unmatched final event while `u_c=1`.

The opponent consumes that final event. The column is now exhausted, so its remaining-reservoir parity changes

```text
u_c: 1 -> 0.
```

If the position is nonterminal, the controller now has a turn without a same-column followup obligation. Suppose the controller uses that free move in a nonfull column `j` and then returns to the pure-followup policy.

Consuming one event in `j` flips that column's remaining-reservoir parity:

```text
u_j -> u_j+1.
```

Therefore the net boundary-cycle update is

```text
u' = u + e_c + e_j.
```

The same formula covers the case `u_j=1`: then two defect bits annihilate rather than a defect merely moving.

This is an exact parity statement. Whether `j` is strategically legal/safe is an additional resource/deadline condition.

## 2. Conserved defect charge

Every boundary-cycle update has even Hamming parity. Hence

```text
chi(u)=sum_c u_c mod 2
```

is invariant.

From the definition of `u`,

```text
chi
 = sum_c (H-h_c)
 = WH - ply
 = WH + ply  mod 2.
```

Thus the top-defect charge is exactly the parity of the remaining physical event reservoir.

This is the global CPC/capacity parity reappearing as a conserved finite-boundary charge.

## 3. Algebraic transport space

The set of all pair updates

```text
e_c+e_j
```

spans the even-weight subspace

```text
Even(F2^W).
```

It is enough to use adjacent generators

```text
e_i+e_(i+1),  i=0,...,W-2,
```

which are the boundaries of the width-path edges and form a basis of `Even(F2^W)`.

Therefore, if support/capacity/deadline guards are temporarily forgotten, the top-defect vectors split into exactly two affine transport orbits:

```text
even charge: Even(F2^W)
odd charge : e_0 + Even(F2^W)
```

or equivalently the two cosets distinguished by `chi`.

The unconstrained algebra can reduce any even-charge vector to `0` and any odd-charge vector to a one-defect representative.

This is an algebraic normal form, not a claim that every required transport remains physically legal on a finite board after columns fill.

## 4. Identification with the line-side phase module

The previously proved width phase quotient is

```text
C_phase ~= Even(F2^W)
```

with path-edge boundary

```text
partial(edge_i)=e_i+e_(i+1).
```

The finite top-defect redistribution module is therefore the same natural module:

```text
response path interval
  --partial-->
change of top-defect vector.
```

This supplies a concrete dynamic meaning for the phase sector:

> `C_phase` is not only a static parity quotient of line dependencies; it is also the module of charge-preserving redistributions of finite response defects across columns.

The two interpretations are coupled by the same width-path boundary map.

## 5. Standard width 7

For standard width `W=7`,

```text
dim Even(F2^7)=6,
```

exactly the previously derived `C_phase` dimension.

After the unique one-move safe center setup `phi=e_3`, the finite top vector is

```text
H even: u=e_3,       chi=1
H odd : u=1+e_3,     chi=0
```

because width 7 is odd.

Thus:

```text
even H -> odd defect-charge sector;
odd H  -> even defect-charge sector.
```

The even-charge top defect is algebraically annihilable; the odd-charge defect necessarily leaves one residual charge under pair transports.

No W/D/L conclusion is drawn from this alone. Terminal threats, exhausted columns, safe-phase preservation and deadlines determine whether the required transports can actually be realized.

## 6. Why width 6 behaves differently

For one-move pure-followup setup, `ply=1`. At even width `W`,

```text
chi=WH-1 mod 2 = 1
```

for either height parity.

Thus width 6 always begins the finite top closure in the odd-charge sector even though known solved outcomes vary with height. This is an immediate falsifier of any formula using defect charge alone as the winner sign.

The correct result must combine the charge sector with local safe-phase/resource/deadline structure.

Solved outcome data is used only for this falsification statement, not to derive the transport theorem.

## 7. Resource-constrained transport is the remaining problem

The unconstrained even-space action is transitive within each charge sector. Physical Connect-4 imposes extra guards:

```text
column j must still have capacity for the free move;
the free move must not concede an earlier terminal threat;
the resulting phase/seam state must remain response-certifiable;
other conditional response resources may already reserve j;
completion-before-deadline facts must remain valid.
```

Therefore the remaining dynamic object is an NDC-constrained action of the phase/defect transport module, not a larger geometric state space.

## 8. Candidate canonical boundary state

The finite-boundary layer now has a compact algebraic skeleton:

```text
bulk safety coordinate d=delta phi;
affine lift/top defect u=phi+(H mod 2)1;
charge chi=sum u;
phase/defect transport z in F2^(W-1);
update u -> u+partial z;
update d -> d+delta partial z;
resource/deadline guards on z.
```

This combines the pure-followup code, path Laplacian, CPC parity and line-side phase quotient in one response action.

## Proof boundary

Sections 1-5 follow from finite reservoir parity and the previously proved path-phase construction. Section 6 uses solved finite data only as a falsifier of an overstrong sign hypothesis. Sections 7-8 identify the remaining constrained-transport problem and do not assert a final value formula.
