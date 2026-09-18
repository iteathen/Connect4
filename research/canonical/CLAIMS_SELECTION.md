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

## C4-R0072 — non-center openings are structurally non-winning on width 7

**Status:** deductive exact.

For `K=4`, `W=7`, and every even `H>=4`, each non-center first move has an explicit P1 response-certificate construction that blocks or preempts every P0 winning group. Therefore:

```text
P0 forced win on 7 x even-H
=> P0 opens center.
```

This is a game-semantic necessity theorem, not a centrality heuristic and not an imported opening table.

Standard `7x6` also has an independent constructive proof that avoids treating named historical rules as final ontology. Three finite local response components compose asynchronously into total P1 policies for the three reflection classes. Their generated invariants cover all 69 P0 lines:

```text
opening 1 / reply 2: 48 singleton + 19 forbidden-pair + 2 support-shadow
opening 2 / reply 3: 49 singleton + 18 forbidden-pair + 2 support-shadow
opening 3 / reply 4: 56 singleton + 11 forbidden-pair + 2 support-shadow
```

with zero unclassified lines; reflection supplies openings `7/6`, `6/5`, and `5/4`.

The theorem establishes only `P0 <= draw` for the non-center openings. It does not prove the center opening is winning.

## What remains open

The opening-selection bridge is now split cleanly:

```text
structural center uniqueness             [C4-R0070/R0071]
+ non-center forced-win exclusion        [C4-R0072]
------------------------------------
center is necessary for any P0 forced win
```

What remains is **positive center progress**: derive a center-opening winning/value-preserving strategy from structural consequence predecessors without importing the root value. After that, strong-distance selection still requires a separate **delay-preservation** theorem carrying the relevant phase/deadline structure to the rank-5 center-stack extremum. Only then can the static 28 be coupled honestly to the strong-play terminal-provenance 28.
