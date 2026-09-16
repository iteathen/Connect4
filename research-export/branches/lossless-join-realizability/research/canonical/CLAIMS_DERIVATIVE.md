# Canonical derivative / predicate claims

Research direction: **Josh Oshiro**.

This ledger normalizes the exact derivative packet without promoting geometry into game semantics. Read it as part of the single claim graph rooted at `CLAIM_INDEX.json`.

## C4-R0057 — Connect-K derivative multiplicity

**Status:** deductive exact.

For

```text
S_K(T)=1+T+...+T^(K-1)
```

and `K=2^s m` with `m` odd, over `F2`

```text
S_K(T)=(1+T)^(2^s-1) S_m(T)^(2^s).
```

Hence the multiplicity of `partial=1+T` is

```text
nu(K)=2^(v2(K))-1.
```

A Connect-K line window is a pure derivative iff `K` is a power of two. Connect-4 is the smallest nontrivial pure higher-derivative case:

```text
partial -> partial^2 -> partial^3
```

with `partial^3` equal to the length-four incidence window.

**Boundary:** line-incidence algebra only; no W/D/L, legality or optimal-selection consequence follows automatically.

## C4-R0058 — K=4 mixed derivative / diagonal reduction

**Status:** deductive exact.

After horizontal/vertical reduction:

```text
X^3=0
Y^3=0
XY=YX.
```

The diagonal relations reduce to

```text
XY^2 + X^2Y = 0
X^2Y^2 = 0.
```

Thus diagonal four-windows are derived from the axis derivative algebra rather than requiring an independent linear primitive. The 4x4 defect is a boundary realization degeneracy of the same system.

A response pair has first-derivative incidence shape, but whether that resource is causally legal remains a separate support/resource/deadline question.

## C4-R0059 — seven-mode periodic annihilator

**Status:** deductive exact.

The one-axis annihilator is the repeated binary `[4,3]` single-parity-check code `P`. Before diagonal constraints the two-axis annihilator is `P tensor P` with dimension 9. The two derived diagonal relations leave a seven-dimensional periodic subcode. On sufficiently regular boards:

```text
dim coker(B)=7
rank(B)=WH-7.
```

This is a coding-theory representation of the same incidence algebra. It is **not** a gravity, blocker, player, stopping, terminal-selection or game-value theorem.

## What was deliberately not promoted

The source packet also contains strategic interpretations and an operator-native selector/evaluator seam. Those remain hypotheses. In particular:

- exact derivative geometry does not prove that a response is playable or timely;
- periodic/annihilator coordinates do not prove W/D/L;
- pair blockers are not XOR unless split ownership is independently certified;
- pure-followup safety is not a forced-win selector;
- a bitwise/lexicographic structural key may be useful for ordering/evaluation without having correctness authority.

The remaining semantic bridge is recorded in `../open-questions/DERIVATIVE_SEMANTIC_LIFT.md` and connects to existing claims rather than creating a parallel theory.
