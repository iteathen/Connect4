# Structural selection-bridge claims

**Research direction:** Josh Oshiro  
**Formalization / qualification:** OpenAI ChatGPT

These claims strengthen the structural side of the still-open strong-play selection theorem. They do not identify the structural `28` with the independently measured distance-sensitive terminal-line `28`.

## C4-R0070 — safe one-move entry is a singleton interval-hypergraph transversal

**Status:** deductive exact.

For `K>=4`, the pure-followup phase after one setup move is `phi=e_c`. A horizontal K-line is unsafe exactly when its phase window is constant; a diagonal K-line is unsafe exactly when its phase window alternates. Any K-window containing the single `1` is neither; any window omitting it is all-zero. Therefore safety is exactly:

```text
c belongs to every consecutive K-column window.
```

This is the standard hypergraph notion of a singleton transversal/hitting vertex.

For `K<=W<=2K-1`:

```text
S_safe(W,K) = {W-K,...,K-1}
|S_safe| = 2K-W.
```

For `W>=2K`, it is empty. The safe-entry set is a singleton exactly at `W=2K-1`, with center `c=K-1`.

## C4-R0071 — the same width uniquely maximizes initial requirement impact

**Status:** deductive exact.

For `W,H>=K`, the initially legal bottom event at column `c` belongs to

```text
d(c) = 1 + h_K(c) + I(c<=W-K) + I(c>=K-1)
```

Connect-K lines: one vertical, all horizontal K-windows through `c`, and up to two diagonal endpoint lines.

The maximizer structure is:

```text
K <= W < 2K-1:
  exactly two maxima, at W-K and K-1;

W = 2K-1:
  exactly one maximum, at K-1;

W > 2K-1:
  a central plateau with at least two maxima.
```

Thus for `K>=4`:

```text
unique safe one-move entry
<=> W=2K-1
<=> unique maximum-impact initially legal event,
```

and the event is the same center column.

For Connect-4 this gives `W=7,c=3` zero-based. With the independent regular K=4 core-balance law, `W=7` forces `H=6`, and the already-derived core dimension is `28`.

## What remains open

This closes a structural coincidence, not semantic selection. To bridge to strong distance one still needs a theorem that the value-/distance-optimal strategy can be chosen uniformly from this center/phase observation and that opponent delay preserves the relevant phase/deadline structure through the rank-5 center-stack extremum. The number `28` cannot be used as a premise in that proof.
