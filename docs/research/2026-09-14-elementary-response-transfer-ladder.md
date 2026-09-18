# Elementary response transfer ladder over arbitrary finite height

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Continue the decomposition-first program into the dynamic response layer. The earlier total-domain elementary theorem gave only the scalar unresolved count

```text
R1(W,H)=(W-3)_+ floor((H-1)/2).
```

This note identifies the actual structure behind that count. The unresolved elementary frontier is a stack of identical width-window modules joined by the same two-row support response. Finite height is therefore a truncation of a height-independent bulk transfer system.

This is a structural response theorem, not a complete W/D/L theorem.

## 1. Width window module

Let

```text
E_W = F2^W
A_W = span{u_s : 0<=s<=W-4}
```

where

```text
u_s=e_s+e_(s+1)+e_(s+2)+e_(s+3).
```

As already proved,

```text
dim A_W = a = (W-3)_+.
```

The vectors `u_s` are independent by leftmost pivot, so the coefficient space of horizontal Connect-4 windows is canonically isomorphic to `A_W`.

## 2. Elementary unresolved layers

Under the qualified Baseinverse/Claimeven elementary response construction, every generated winning requirement is certified except horizontal length-4 requirements on zero-based rows

```text
y=2,4,6,... < H.
```

Write

```text
m=floor((H-1)/2).
```

These rows are exactly

```text
y_k=2k,  k=1,...,m.
```

For each `k`, the unresolved horizontal requirements on row `y_k` form one copy

```text
R_k ~= A_W.
```

Hence the entire elementary unresolved frontier is not merely a set of `am` predicates; it has the exact module decomposition

```text
R_elem(W,H)
  ~= direct_sum_(k=1)^m A_W
  ~= A_W tensor F2^m.
```

Taking dimensions recovers

```text
dim R_elem = a m = (W-3)_+ floor((H-1)/2).
```

The tensor/direct-sum statement is stronger than the count and is valid for every positive `W,H`.

## 3. Two-row support transport

At an unresolved layer `y_k=2k`, the ordinary vertical response pair in column `c` is

```text
(c,2k) -> (c,2k+1),
```

whenever the upper cell exists.

Resolving that pair consumes exactly two consecutive support events in the same column. In the response/control decomposition its consumption vector has

```text
n_c=2,
n_d=0 for d!=c.
```

Therefore

```text
|F|=2,
tau(F)=0,
h'_c=h_c+2.
```

The response is globally parity-neutral and phase-neutral, while advancing the support frontier by exactly two rows in that column.

At the column-event level, the induced transport from one unresolved layer to the next is therefore

```text
e_c -> e_c.
```

By linearity it is the identity on `E_W`, and hence restricts to the identity on the horizontal window module `A_W`.

Thus the height bulk is the constant path representation

```text
A_W --I--> A_W --I--> ... --I--> A_W
```

on the unresolved layers.

The geometry does not change from layer to layer. Only the attached resource/deadline certificate state can change.

## 4. Exact top-boundary defect

The top unresolved layer behaves differently according to height parity.

### Even height

Let `H=2r`. Then

```text
m=r-1,
y_m=2r-2=H-2.
```

The upper mate row `H-1` exists. Therefore every elementary unresolved top-layer cell still has its ordinary same-column response resource above it.

At this elementary layer the top response boundary is closed.

### Odd height

Let `H=2r+1`. Then

```text
m=r,
y_m=2r=H-1.
```

The top unresolved row is the physical top row and has no upper mate event.

Therefore the finite truncation leaves one entire unmatched width-window module

```text
D_top^(1)(W,H) ~= A_W
```

when `H` is odd, and no such elementary unmatched module when `H` is even.

Equivalently,

```text
D_top^(1)(W,H) ~= (H mod 2) A_W
```

with

```text
dim D_top^(1) = (H mod 2)(W-3)_+.
```

This is an exact boundary-response defect, not a game-value formula.

## 5. Relation to infinite-height Connect-Four

Published infinite/semi-infinite Connect-Four work proves cannot-lose strategies on infinite-height finite-width boards using reusable paving/response patterns. At the present level of source detail, their named paving templates are not reconstructed here.

The elementary transfer theorem nevertheless explains the correct architectural relation:

```text
semi-infinite height:
  no terminal top truncation

finite height:
  same repeated two-row bulk response
  + finite top-boundary termination.
```

The exact elementary top defect above is one component of that truncation. It is not claimed to be the only dynamic defect required for W/D/L.

## 6. Why this is not yet the winner formula

A flat same-column response pairing is insufficient to solve general Connect-Four. A defensive response can simultaneously advance support for a later opponent requirement, and threat combinations can transfer Zugzwang/control. Those effects are governed by the previously identified response-support feedback and NDC deadline topology.

Therefore

```text
D_top^(1) != game value.
```

Known finite outcomes may be used to falsify such a reduction, but they are not premises here.

The correct next object is a transfer operator on **certificate state attached to `A_W`**, not on raw board positions:

```text
T_W : boundary-certificate state -> boundary-certificate state
```

for one two-row support slab.

Its state must preserve only load-bearing information:

```text
residual horizontal-window obligations in A_W
support/resource reservations
response consumption transport n(F)
phase boundary tau(F)
CPC release parity
completion-before-deadline relations.
```

If this state closes under `T_W`, arbitrary height reduces to powers of one width-parametric operator plus the top truncation map.

## 7. Finite-memory clue from derivative geometry

Connect-4 geometry has vertical order three:

```text
partial_y^3=0
```

in the quotient residue, so the static information crossing a horizontal cut is bounded by the three vertical derivative residues. The elementary response system adds only period-two support pairing.

This strongly suggests that a complete transfer representation should have bounded vertical memory independent of `H`, although completeness of the NDC/deadline component is not yet proved.

The research target is therefore not a height census but a proof that the strategic boundary descriptor is closed under one local transfer.

## 8. Bulk-versus-boundary hypothesis

The current sharpened hypothesis is

```text
finite Connect-Four value
  = periodic/local response bulk
    + side/bottom boundary condition
    + top truncation defect
    + deadline/control closure.
```

The infinite-height draw theorem constrains the bulk: for a fixed finite width, the response system can avoid loss indefinitely when the top truncation is absent.

Finite-board wins must therefore depend on the finite boundary closure of that response flow rather than on a different geometric law.

## Proof boundary

Sections 1-4 follow directly from the already-proved total-domain elementary response theorem and the response-consumption transport law. No board census or solved W/D/L value is used.

Sections 5-8 state the connection and next research hypothesis. The existence of a complete bounded certificate transfer operator remains to be proved.
