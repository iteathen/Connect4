# Parity-debt control-transfer hypothesis

**Date:** 2026-09-30  
**Status:** research hypothesis / theorem target; not proof authority  
**Branch:** \`research/universal-structural-policy-20260930\`  
**Research direction / causal clue:** Joshua Oshiro  
**Formalization:** OpenAI ChatGPT

## Purpose

Preserve a causal interpretation that now aligns closely with the exact CPC temporal-contract results without prematurely identifying Connect Four with Nim.

The project-owner clue is:

> a player controlling the parity-like response relation may be forced into a blocking move that does not preserve the normal pairing; the resulting unmatched response obligation is not created later at column exhaustion, but was created earlier and only becomes visible there.

This note states that idea in the current CPC vocabulary.

## 1. Proven structural pieces already available

Current exact local results establish:

1. synchronized/paired response systems can preserve a defender response invariant;
2. a licensed bottom-row defender response establishes an odd-row guard as a current-state proof resource;
3. the odd-row guard renews by
   \[
   A:g_{2k}\;\to\;D:g_{2k+1};
   \]
4. when a response column is exhausted at the top, the ordinary same-column mate does not exist;
5. the resulting one-slot unmatched response obligation may be transported to another current frontier blocker under the frozen top-exhaustion phase-debt theorem;
6. exact cofactors preserve the transported CPC/RBA state and first-win ordering.

These are geometry-derived statements. They use no solved W/D/L premise.

## 2. Causal hypothesis

Suppose a defender currently has a response relation \(P\) such that ordinary attacker events can be paired with legal defender events while preserving a proof class.

A forced blocker \(b\) may be necessary even when \(b\neq P(a)\) for the ordinary paired response to the current attacker event \(a\).

Interpret the deviation as creating one unmatched response obligation:

\[
\operatorname{Debt}=1.
\]

The hypothesis is that later top exhaustion does not create a new defect. It exposes this already-carried debt because the expected local mate has disappeared.

Conceptually:

\[
\text{paired control}
\to
\text{forced off-pair block}
\to
\operatorname{Debt}_1
\to
\text{guard/resource evolution}
\to
\text{top exhaustion exposes debt}
\to
\text{external blocker transports debt}.
\]

Thus the natural question is not:

> what special repair is invented when a column fills?

but:

> which player currently owns the unmatched response debt, and through which response resources may that debt lawfully move?

## 3. Nim analogy boundary

The analogy to Nim is useful but presently only an analogy.

Not established:

- that the conserved quantity is literally a Nim-sum;
- that the relevant state is one scalar XOR;
- that every forced off-pair block changes a unique controller bit;
- that the earlier deviation is necessarily a game-theoretic mistake;
- that zero/nonzero values correspond directly to win/loss.

The late formula work is a warning against premature scalarization: mover-dependent gauge changes lose load-bearing residual grouping and role attachment.

Therefore any candidate parity invariant must retain enough typed structure to reconstruct:

- response ownership;
- residual/winning-line attachment;
- support-release depth;
- guard/resource identity;
- first-win precedence.

## 4. Candidate exact state

A finite temporal state may have the form

\[
Q=(q,\Gamma,\delta),
\]

where:

- \(q\) is the exact CPC/RBA semantic state or a separately proved congruent quotient;
- \(\Gamma\) is the current response-resource/guard relation;
- \(\delta\) is an unmatched response-debt state, initially \(0\) or \(1\).

Candidate transitions:

### Ordinary paired response

\[
(q,\Gamma,0)\xrightarrow{A:a,D:P(a)}(q',\Gamma',0).
\]

### Forced off-pair block

\[
(q,\Gamma,0)\xrightarrow{A:a,D:b}(q',\Gamma',1)
\]

only when \(b\) is independently licensed by CPC obligation semantics.

### Debt transport

\[
(q,\Gamma,1)\xrightarrow{A:x,D:r}(q',\Gamma',1)
\]

when the unmatched response is moved to another resource.

### Debt cancellation

\[
(q,\Gamma,1)\xrightarrow{\text{compatible odd resource}}(q',\Gamma',0)
\]

only if a separate exact theorem proves that two unmatched resources annihilate/collapse.

No cancellation theorem is assumed here.

## 5. Relation to the odd-row guard

The guard is a concrete candidate carrier of parity control.

A bottom response gives:

\[
D:g1\Rightarrow G_g(1).
\]

Then attacker use of the guard column forces:

\[
A:g2\to D:g3,\qquad
A:g4\to D:g5.
\]

This repeatedly restores the same odd-row ownership pattern.

At \(A:g6\), the local restoring move is absent. This is exactly the location where an unmatched response obligation becomes externally visible.

The frozen top-exhaustion theorem then permits a guard-preserving residual-attached external response, matching the debt-transport interpretation.

## 6. Theorem target

A useful theorem would establish a finite current-state reconstruction

\[
\operatorname{DebtOwner}(q)
\]

or a small typed debt class such that:

1. ordinary paired responses preserve it;
2. independently forced off-pair blockers transform it by a fixed law;
3. top exhaustion merely exposes the carried class rather than introducing new information;
4. external attached repairs transport the class by a fixed law;
5. the law is observation-preserving for CPC restrictions, terminal precedence, survival certificates, and response capacity.

If a GF(2) representation exists, it should emerge from this typed transition theorem rather than be imposed beforehand.

## 7. Falsifiers

Reject the hypothesis or enrich the state if two states with the same proposed debt descriptor differ in any load-bearing observation:

- legal response set;
- terminal precedence;
- CPC exact/bound/restrict output;
- guard reconstruction;
- response-resource availability;
- residual/winning-line attachment;
- exact successor descriptor under an admitted transition.

A scalar that separates consumed examples but fails this congruence test is not a theorem.

## Claim discipline

This note does not claim:

- Connect Four is Nim;
- a literal Nim-sum has been found;
- parity control alone solves Connect Four;
- candidate 6 is proved optimal;
- v5 is licensed.

It preserves the causal theorem target suggested by the current exact phase-debt and guard machinery.
