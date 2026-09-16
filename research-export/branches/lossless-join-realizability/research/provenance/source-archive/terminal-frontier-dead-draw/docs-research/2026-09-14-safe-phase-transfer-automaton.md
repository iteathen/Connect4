# Safe pure-follow-up phase code as a finite transfer automaton

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Close the width dependence of the pure-follow-up bulk safety condition without enumerating board sizes.

The prior theorem reduced a pure-follow-up tail to a derivative word

```text
d in F2^(W-1)
```

which is Connect-4-safe exactly when it has no factor `000` or `111`.

That language has a fixed finite-state transfer representation independent of `W`.

## 1. Four-state automaton

For derivative words of length at least two, retain only the last two bits. Use states

```text
00, 01, 10, 11.
```

Appending a bit is legal exactly when it does not create `000` or `111`.

Therefore the transitions are

```text
00 -> 01
01 -> 10,11
10 -> 00,01
11 -> 10.
```

With state order `(00,01,10,11)`, the transfer matrix is

```text
T =
[0 1 0 0]
[0 0 1 1]
[1 1 0 0]
[0 0 1 0].
```

This matrix is independent of board width and height.

A path-board safe bulk phase class of width `W` is exactly a legal walk of derivative length `W-1` in this automaton, together with the irrelevant global complement choice for the vertex phase word `phi`.

## 2. Exact count

Let `s_m` be the number of safe binary derivative words of length `m`.

Classify a word by the length `1` or `2` of its final run. Removing the last run endpoint gives the recurrence

```text
s_m = s_(m-1) + s_(m-2)
```

with

```text
s_1=2,
s_2=4.
```

Hence

```text
s_m = 2 F_(m+1)
```

for Fibonacci numbers `F_1=F_2=1`.

For a width-`W` path with `W>=2`, `m=W-1`, so

```text
number of safe derivative words = 2 F_W.
```

Each derivative word has exactly two vertex-phase lifts `phi`, differing by global complement, because

```text
ker(delta)=span{1}.
```

Thus

```text
number of safe pure-follow-up phase words = 4 F_W
```

for `W>=2`, or `2 F_W` modulo global player complement.

These are bulk phase states, not game strategies or W/D/L values.

## 3. Existence for every finite path width

The recurrence or automaton immediately proves that the safe set is nonempty for every positive finite width.

Thus there is no width at which pure-follow-up bulk safety is algebraically impossible on an ordinary path board.

Any finite-width obstruction to a non-losing strategy must therefore come from one of:

```text
inability to reach a safe phase state from the legal bottom/side setup;
resource incompatibility;
a threat completing before the safe state is established;
finite top truncation;
or another NDC deadline/control condition.
```

It cannot be blamed on absence of a safe infinite-tail phase word.

## 4. Cylindrical refinement

For a cylindrical width, the derivative word is cyclic. In addition to forbidding cyclic `000` and `111`, it must be integrable as a cyclic vertex phase:

```text
XOR_i d_i = 0.
```

This is the usual even-boundary condition for a cycle.

A fixed finite-state automaton is still sufficient: augment the four last-two-bit states with one running parity bit, then impose closure to the initial two bits and final parity zero.

So cylindrical pure-follow-up safety is also a finite transfer problem independent of width.

Explicit safe cyclic words exist for every width `W>=3`; this existence is an algebraic statement about the tail and is weaker than a complete cannot-lose strategy because initialization/reachability still matters.

## 5. Relation to the response Laplacian

The safe set

```text
S_W = { d : no 000 or 111 }
```

is the target subshift.

A legal even response with path transport `z` acts by

```text
d -> d + L_E z
```

where

```text
L_E = delta partial.
```

Thus the bulk-control problem has a compact exact form:

```text
finite automaton safety constraint
+ Laplacian response translations
+ support/resource/deadline guards.
```

This is a much smaller object than the colored board.

## 6. Research consequence

The infinite-height result now suggests a precise finite-board question:

> Can the bottom/side certificate drive the derivative phase into `S_W`, and keep it there under legal response translations, before the finite top deadline closes the response reservoir?

If yes, that supplies a non-loss certificate. If not, the obstruction should be expressible as a finite boundary/deadline defect rather than a failure of the periodic bulk itself.

## Proof boundary

The automaton, recurrence and counts are exact consequences of the previously proved pure-follow-up safety theorem. No sampled board outcomes or move-tree search are used.

Existence of a safe phase word is not sufficient for game-theoretic non-loss; legal strategy reachability remains the next problem.
