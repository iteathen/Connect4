# Residual degree-3 core: corrected 28 -> 21 theorem

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Question

The original intuition was that residual cofactor

```text
4 -> 3
```

might contract the common `7*4=28` middle object to `7*3=21`.

The naive version was already falsified: ordinary degree-3 residual incidence has rank 42, and the aggregate residual boundary `partial_4` is injective. So cofactor arity alone does **not** reduce 28 to 21.

This checkpoint tests the corrected category: first residualize the identified common `Y`, then quotient the newly exposed degree-3 support/CPC frontier.

## First residual image

Let

```text
D = partial_4 : C4 -> C3
```

and use the qualified 28-dimensional `Y_line`.

The executable control proves

```text
rank(D | Y_line) = 28.
```

So residualization itself preserves all 28 dimensions.

## Degree-3 frontier

For a unique 3-cell residual fragment `S`, define:

```text
phi(S) = parity vector of its minimal gravity-support heights by column
u(S)   = indicator vector of columns containing a globally highest cell of S
q(S)   = CPC event-rank parity
       = supportClosureSize(S) + maxRow(S) mod 2.
```

Now define

```text
pi_3(S) = u(S) XOR q(S) * phi(S).
```

This is a 7-coordinate, gravity-aware residual-frontier map.

Restricted to `D(Y_line)`, the component ranks are:

```text
ordinary degree-3 cell incidence     0
raw support phase phi                0
highest-cell frontier u              5
CPC-weighted support phase q*phi     5
u XOR q*phi                          7.
```

Thus neither ordinary incidence, raw support phase, nor either nonzero component alone supplies the full quotient. The combined CPC/frontier map is surjective onto a 7-dimensional quotient.

## Emergent 21-dimensional residual core

Define

```text
Y_3 = ker(pi_3 | D(Y_line)).
```

The finite control derives

```text
dim D(Y_line) = 28
rank pi_3     = 7
dim Y_3       = 21.
```

Only after deriving the kernel does the control check

```text
21 = W * (K-1) = 7*3.
```

Therefore the corrected theorem is:

```text
28 -> residualize (still 28)
   -> expose/quotient the new support-CPC frontier (rank 7)
   -> 21-dimensional residual core.
```

This is substantially different from saying that differentiation/cofactor alone turns `7*4` into `7*3`.

The 21-space is invariant under left-right reflection and is unchanged by independent changes of the arbitrary execution basis for `Y_line`.

## Critical iteration boundary

The aggregate residual maps form a GF(2) boundary complex:

```text
partial_3 * partial_4 = 0.
```

Since `Y_3` lies inside `im(partial_4)`, applying the same aggregate boundary again gives zero. Therefore this result does **not** justify

```text
21 -> 14 -> 7 -> 0
```

by repeatedly applying the simplicial-style boundary.

Actual sequential cofactor semantics choose/mark events; the aggregate boundary XORs all deletion faces and is homological. A further `3 -> 2` theorem must therefore use a **marked/sequential residual category** that preserves which cofactor event occurred. Do not collapse this distinction.

## Current interpretation

The first `28 -> 21` contraction is now real, but its mechanism is:

```text
R residualization
+ gravity support frontier
+ CPC event-rank parity
+ quotient of a newly exposed 7D frontier.
```

This is consistent with the broader result that neither `P` nor `R` alone generated the common middle structure; their typed composition does.
