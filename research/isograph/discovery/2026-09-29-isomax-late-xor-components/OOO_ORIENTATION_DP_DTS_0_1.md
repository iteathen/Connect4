# IsoMax OOO Orientation Provenance — DP / DTS Note 0.1

**Status:** exact structural deductions plus open QU; no scalar promotion  
**Warrant:** EW-RS-071  
**Date:** 2026-09-30  
**Scope:** declared discovery carriers only; EW-RS-059 holdouts remain sealed.

## Exact deductions

### 1. Raw orientation and reflection

The raw winning-line directions are:

\[
H,\quad V,\quad D_+,\quad D_-.
\]

Horizontal reflection preserves H and V and exchanges \(D_+\leftrightarrow D_-\).

The EW-RS-071 preflight verified this exactly on every declared carrier with zero catalog mismatches.

Therefore diagonal sign is removable for reflection-invariant scalar questions:

\[
D_+\sim D_- \to D.
\]

This is an exact structural quotient, not a scalar fit.

### 2. Finite-board carrier geometry matters

The raw line catalogs are:

| carrier | H | V | D+ | D- |
|---|---:|---:|---:|---:|
| 6x3-k3 | 12 | 6 | 4 | 4 |
| 4x5-k4 | 5 | 8 | 2 | 2 |
| 6x3-k4 | 9 | 0 | 0 | 0 |

For 6x3-k4, \(K=4>H=3\). Vertical k=4 lines are impossible. A k=4 diagonal also requires a row displacement of three between endpoints, impossible on a three-row board. Thus this carrier has only H winning lines.

Yet previously frozen evidence on 6x3-k4 has:

- five complete-degree-2 contradictions;
- oddness-only cubic rank gain 16;
- zero contradictions after OOO;
- matched OOO residue rank 16;
- scalar dependency image dimension 2.

Therefore the strong explanation

\[
\text{OOO exists because H,V,D interact jointly}
\]

is rejected as a general source law.

Orientation may still organize mixed-orientation carriers.

## DTS: discrete support advancement

A move advances exactly one column support state:

\[
h_c\mapsto h_c+1.
\]

No continuous-time, acceleration, velocity, momentum, or fall-speed semantics are admitted.

For any surviving residual cell in the moved column at fixed absolute row \(r\),

\[
d=r-h_c\mapsto d-1.
\]

The role capacity phase toggles:

\[
\kappa_c=(H-h_c)\bmod2\mapsto\kappa_c\oplus1.
\]

Thus the support update is a discrete precedence/release transformation.

### H channel

A horizontal source line has constant absolute row and at most one cell in any column.

A column advance can therefore affect at most one residual cell of a given H source line directly.

Across the line, geometry is transverse to the independent column support chains.

### V channel

A vertical source line lies entirely inside one column.

A column advance acts inside the same support chain as every cell of that source line.

One move may cofactor the current frontier obligation while simultaneously decrementing the relative depths of multiple surviving cells of that same V source line.

Thus V is a pure precedence-chain channel.

### D+ / D- channels

A diagonal source line has at most one cell in each column, like H, but absolute row changes with horizontal displacement.

Its residual depth profile therefore couples board geometry to the support-height vector.

D is a mixed geometry/support channel.

Reflection exchanges the two slope signs but preserves this mixed-channel character.

## DP / MSS disposition

The frozen EW-RS-071 removal order begins:

1. diagonal sign;
2. exact source-line identity;
3. exact residual-cell identity;
4. exact orientation multiplicity;
5. owner separation;
6. phase;
7. exact depth;
8. depth parity;
9. residual-mask grouping.

Current disposition:

- **diagonal sign:** REMOVABLE EXACTLY by reflection;
- **orientation family as universal required support:** REJECTED, because 6x3-k4 is H-only yet has a nonzero OOO correction;
- all finer orientation-derived supports remain experimental until the RS-071 scalar ladder completes.

## QU objects

### QU-ORI-01 — mixed-carrier organization

Does orientation provenance compress or organize the OOO quotient on 6x3-k3 and 4x5-k4 even though it is not universally necessary?

### QU-ORI-02 — H-only primitive

What structural relation generates the 16-dimensional OOO correction on horizontal-only 6x3-k4?

This is now a particularly valuable control because it removes V and D completely.

### QU-ORI-03 — deeper common law

Is H/V/D merely one realization, on sufficiently tall carriers, of a deeper support/exchange/circuit invariant that also has an H-only realization on 6x3-k4?

### QU-ORI-04 — transition closure

Do orientation-labelled q_o/RFG transitions factor through a small orientation/support transition carrier, or is exact residual incidence still required?

### QU-ORI-05 — orientation shuffle

Do true orientation labels outperform deterministic label-shuffled controls after equal structural rank is accounted for?

## Interpretation boundary

The persistence of OOO on both k=3 and k=4 remains evidence against a simple universal \(k-1\) companion-count explanation.

However, the relevant cross-k invariant cannot be “three orientation families,” because one hard k=4 carrier has only one orientation family.

The search should therefore favor structural invariants that survive both:

\[
\text{mixed-orientation carriers}
\]

and

\[
\text{horizontal-only 6x3-k4}.
\]
