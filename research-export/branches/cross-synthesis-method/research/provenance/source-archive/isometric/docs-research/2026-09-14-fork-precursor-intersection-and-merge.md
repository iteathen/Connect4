# Fork-precursor intersection and forced-macro transposition

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

Extend the fork-precursor response-capacity theorem in two compositional directions:

1. multiple attacker fork precursors restrict the defender to the intersection of their preemption sets;
2. when the defender preempts one endpoint of a two-threat fork and the other endpoint is then forced, symmetric endpoint-preemption branches commute to one exact physical transposition.

These are proof-graph quotient rules, not game-tree search rules.

## 1. One precursor preemption set

Suppose defender `D` moves now and attacker `A` has a legal enabling move `m` next which, if left intact, creates two distinct playable singleton threats `t1,t2`.

Under the ordinary one-placement response-capacity premise, and absent a separate exact certificate that discharges the fork, the defender's current move must hit

```text
P(m;t1,t2)={m,t1,t2}.
```

This is the previously proved fork-precursor theorem.

## 2. Alternative-precursor intersection theorem

Suppose the attacker has a family of alternative enabling moves

```text
m_alpha
```

with corresponding future two-threat sets

```text
T_alpha={t_alpha,1,t_alpha,2}.
```

Let

```text
P_alpha={m_alpha,t_alpha,1,t_alpha,2}
```

be the current preemption set for precursor `alpha`.

The defender has only one current placement. If the chosen cell is outside some `P_alpha`, then that precursor survives intact and the attacker may choose it, creating the two-threat Hall deficiency on the next turn.

Therefore every current nonlosing defender move must lie in

```text
intersection_alpha P_alpha,
```

unless another exact guarded certificate discharges one of the precursor obligations.

This is controller-choice / defender-universal quantification in set form:

```text
attacker may choose any surviving precursor
=> defender must preempt every precursor family now.
```

## 3. Standard `d1,a1,e1` instance

Use one-based chess-style coordinates on standard 7x6.

Prefix:

```text
1. P0 d1
1... P1 a1
2. P0 e1
```

P1 is to move.

P0 owns `d1,e1`.

### Precursor A: `c1`

If P0 next plays `c1`, P0 owns the run

```text
c1-d1-e1.
```

This creates two immediate bottom singleton threats:

```text
b1-c1-d1-e1 -> b1
c1-d1-e1-f1 -> f1.
```

Thus P1 must currently hit

```text
P_c={b1,c1,f1}.
```

### Precursor B: `f1`

If P0 next plays `f1`, P0 owns

```text
d1-e1-f1.
```

This creates two immediate bottom singleton threats:

```text
c1-d1-e1-f1 -> c1
d1-e1-f1-g1 -> g1.
```

Thus P1 must currently hit

```text
P_f={c1,f1,g1}.
```

### Intersection

A single P1 move must preempt both attacker alternatives:

```text
P_c intersect P_f = {c1,f1}.
```

Therefore:

> **Exact branch restriction.** From `P0 d1, P1 a1, P0 e1`, every P1 continuation that avoids the immediate fork-precursor loss must play `c1` or `f1`, unless P1 has a separate immediate/strategic certificate that supersedes the two fork arguments.

At this prefix P1 has no immediate Connect-4 terminal move, so the ordinary terminal supersession case is absent.

This independently reproduces the historical observation that these are the two meaningful replies; no later solved winner label is used.

## 4. Endpoint-preemption macro theorem

Return to one two-threat precursor `m` with endpoints `t1,t2`.

Assume:

```text
m,t1,t2 are currently independently playable;
D cannot win immediately by playing t1 or t2;
after D occupies one endpoint, m remains legal;
after A plays m, the other endpoint is an immediate singleton threat;
D must occupy that remaining endpoint;
no intervening first-win terminal supersedes the sequence.
```

Then the two defender endpoint-preemption orders

```text
D:t1, A:m, D:t2
```

and

```text
D:t2, A:m, D:t1
```

end with exactly the same:

```text
physical occupied cells and owners;
column heights/support frontier;
side to move;
residual geometric requirements;
control-potential state derivable from that exact position.
```

The moves commute because all three cells were independently playable and the owner assigned to each final cell is the same in both orders.

Thus the two physical branches may be normalized to one deterministic macro-successor.

## 5. Standard `d1,b1,f1` instance

Prefix:

```text
P0 d1
P1 b1
P0 f1
```

The previously proved precursor is

```text
m=e1
T={c1,g1}.
```

P1 is restricted to

```text
{c1,e1,g1}.
```

If P1 chooses endpoint `c1`:

```text
P1 c1
P0 e1
P1 g1 forced.
```

If P1 chooses endpoint `g1`:

```text
P1 g1
P0 e1
P1 c1 forced.
```

Both end after six plies in the exact position

```text
P0: d1,e1,f1
P1: b1,c1,g1
P0 to move.
```

Therefore the two endpoint branches merge exactly.

The third reply `P1 e1` blocks the enabler itself and remains a genuinely different successor.

Hence the seven-column physical reply fanout has already collapsed by exact structural reasoning to only two semantic successor classes:

```text
endpoint-preemption class -> one merged physical state;
enabler-preemption class -> separate state.
```

## 6. Relation to proof hypergraph min-max closure

The intersection theorem is the set-theoretic form of universal defense against controller-selectable precursor certificates:

```text
attacker choice among precursors -> defender must satisfy all current preemption constraints.
```

The macro-transposition theorem then canonicalizes symmetric/commuting variants before any higher proof node is evaluated.

Thus the proof hypergraph should normalize in this order when applicable:

```text
capacity closure
-> restrict actions to obligation-hitting set
-> forced macro-edge closure
-> exact transposition merge
-> only then retain genuinely distinct strategic alternatives.
```

This prevents physical move order from inflating the semantic proof graph.

## 7. Source comparison

Allis Chapter 13 reports the same standard branch restrictions and that the `c1`/`g1` endpoint orders reach the same Diagram 13.14 position. The derivations above are independent geometry/support/capacity proofs; the historical source is regression/provenance evidence, not the premise for the branch restrictions.

## Next target

Apply the same normalization to the remaining distinct semantic successors:

```text
A. merged endpoint-preemption state after d1,b1,f1;
B. enabler-preemption state after d1,b1,f1,e1;
C. the two surviving d1,a1,e1 replies c1/f1;
D. center reply d2 / center-stack seam;
E. adjacent reply c1 seam where no one-step fork precursor currently fires.
```

Seek shared affine/clause/response-capacity obligations rather than comparing raw board states.

## Proof boundary

The intersection theorem follows from attacker choice among independently valid precursor certificates. The macro merge requires the stated playability/no-terminal guards. The standard instances satisfy those local guards directly. No solved W/D/L label is used.
