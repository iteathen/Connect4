# Oracle-compiled action-value frontier theorem

**Date:** 2026-10-16  
**Status:** deductive compilation theorem + exhaustive finite controls; standard-7x6 compactness/scaling remains open  
**Owner:** \`research/semantic-quotient\`  
**Parent:** \`docs/research/2026-10-16-oracle-relative-proof-algorithmic-core.md\`

## Result

For a fixed support, exact Connect Four action value is isotone under the
support-local favorable residual order. Therefore every oracle-labelled
action-value threshold is an upward-closed set and is represented exactly by
its minimal antichain generators.

This yields a direct nonrecursive evaluator:

\[
\boxed{
Q_a(q)
=
\max\left\{
\theta:
\exists m\in M_{s,a,\theta},\ q\succeq m
\right\},
}
\]

followed by

\[
\boxed{
B(q)=\operatorname*{arg\,max}_{a\in\mathcal A(s)}Q_a(q).
}
\]

The oracle is required only to construct/validate the threshold frontiers
offline. Runtime evaluation is structural frontier membership; it does not
descend a future move tree.

---

## 1. Exact carrier

For a legal nonterminal state, let

\[
q=(s,R_0,R_1)
\]

where \(s\) is support and \(R_i\) is player \(i\)'s normalized residual
antichain.

Support determines side to move:

\[
p=p(s).
\]

Write

\[
R_p(q)
\]

for mover residuals and

\[
R_{\bar p}(q)
\]

for opponent residuals.

---

## 2. Favorable residual order

For equal-support states \(q_A,q_B\), define

\[
q_A\succeq_p q_B
\]

iff

\[
\forall r_B\in R_p(q_B)\;
\exists r_A\in R_p(q_A):
r_A\subseteq r_B
\]

and

\[
\forall r_A\in R_{\bar p}(q_A)\;
\exists r_B\in R_{\bar p}(q_B):
r_B\subseteq r_A.
\]

Thus \(q_A\) gives the mover an equal-or-easier completion formula and the
opponent an equal-or-harder completion formula.

---

## 3. Cofactor monotonicity

Let \(x\) be the landing event for one legal action \(a\).

For mover \(t\), the exact residual cofactor is

\[
R_t'
=
\operatorname{Min}
\{r\setminus\{x\}:r\in R_t\},
\]

\[
R_{\bar t}'
=
\operatorname{Min}
\{r\in R_{\bar t}:x\notin r\}.
\]

Residual antichains represent monotone Boolean completion formulas. Substituting
the same event value into two Boolean functions preserves implication.
Minimal-antichain normalization preserves the represented monotone function.

Hence, whenever the same action is nonterminal in both states,

\[
\boxed{
q_A\succeq_p q_B
\Longrightarrow
F_a(q_A)\succeq_p F_a(q_B).
}
\]

Terminal divergence is favorable-monotone under first-win stopping: an earlier
mover win or delayed opponent win cannot worsen the mover-oriented value.

---

## 4. Action-value isotony

Let \(Q_a(q)\) be exact mover-oriented action value under any total order that
first orders

\[
\text{win}>\text{draw}>\text{loss}
\]

and may additionally refine wins by faster completion and losses by later
completion.

Induction on remaining cells gives

\[
\boxed{
q_A\succeq_p q_B
\Longrightarrow
Q_a(q_A)\ge Q_a(q_B).
}
\]

The induction uses:

1. equal support \(\Rightarrow\) identical legal action alphabet and landing
   events;
2. same-action cofactors preserve the beneficiary-favorable order;
3. terminal changes are beneficiary-favorable;
4. max and min are monotone in every coordinate.

This is the support-local action-value isotony theorem.

---

## 5. Oracle threshold sets

Let the exact solved oracle provide

\[
Q_a^{\mathcal O}(q).
\]

For fixed support \(s\), action \(a\), and score threshold \(\theta\), define

\[
U_{s,a,\theta}
=
\{q:
\operatorname{support}(q)=s
\land
Q_a^{\mathcal O}(q)\ge\theta
\}.
\]

By isotony,

\[
q\in U_{s,a,\theta}
\land
q'\succeq q
\Longrightarrow
q'\in U_{s,a,\theta}.
\]

Therefore \(U_{s,a,\theta}\) is upward-closed.

Let

\[
M_{s,a,\theta}
=
\operatorname{Min}_{\succeq}
U_{s,a,\theta}
\]

be its exact minimal frontier.

For every legal \(q\) at support \(s\),

\[
\boxed{
Q_a^{\mathcal O}(q)\ge\theta
\iff
\exists m\in M_{s,a,\theta}:
q\succeq m.
}
\]

---

## 6. Direct compiled action-value formula

Let \(\Theta_{s,a}\) be the finite ordered set of possible oracle action scores
at support \(s\) for action \(a\).

Then

\[
\boxed{
\widehat Q_a(q)
=
\max
\left\{
\theta\in\Theta_{s,a}:
\exists m\in M_{s,a,\theta},\ q\succeq m
\right\}.
}
\]

By the threshold equivalence,

\[
\boxed{
\widehat Q_a(q)=Q_a^{\mathcal O}(q).
}
\]

Therefore

\[
\boxed{
\widehat B(q)
=
\operatorname*{arg\,max}_{a\in\mathcal A(s)}
\widehat Q_a(q)
=
\operatorname*{arg\,max}_{a\in\mathcal A(s)}
Q_a^{\mathcal O}(q).
}
\]

No recursive continuation evaluation appears in \(\widehat Q\).

For W/D/L-only move correctness, only the nontrivial threshold frontiers

\[
Q_a\ge 0
\]

and

\[
Q_a>0
\]

are required.

---

## 7. Exhaustive compiled round-trip control

Implementation:

\[
\texttt{compiled-frontier-roundtrip-control.mjs}
\]

Workflow:

\[
\texttt{Research compiled frontier roundtrip}
\]

Run:

\[
38934241006
\]

Head:

\[
\texttt{c4cf49df99f4ecc111c3a75569bb4d33fc686851}
\]

All legal nonterminal physical states were exhaustively enumerated for:

\[
4\times3\ K=3,
\quad
4\times4\ K=4,
\quad
5\times3\ K=4,
\quad
4\times5\ K=4.
\]

Totals:

\[
\boxed{
1,634,924\text{ physical nonterminal states}
}
\]

collapsed to

\[
\boxed{
343,736\text{ exact q classes}.
}
\]

The favorable-order control reproduced:

\[
\boxed{
6,300,753\text{ comparable q pairs}
}
\]

and

\[
\boxed{
18,076,405\text{ comparable fixed-action pairs}
}
\]

with

\[
\boxed{
0\text{ W/D/L violations}
}
\]

and

\[
\boxed{
0\text{ strong-value violations}.
}
\]

Compiled frontier round-trip:

\[
\boxed{
1,039,073\text{ exact action values decoded}
}
\]

with

\[
\boxed{
0\text{ action-value mismatches},
}
\]

and

\[
\boxed{
343,736\text{ exact best-move masks decoded}
}
\]

with

\[
\boxed{
0\text{ best-move mismatches}.
}
\]

Frontier sizes:

\[
190,055
\]

W/D/L generators for \(1,039,073\) explicit action entries, a compression of

\[
\approx 5.467\times,
\]

and

\[
529,928
\]

full strong-score threshold generators, a compression of

\[
\approx 1.961\times.
\]

This control closes the complete finite round trip:

\[
\text{exact solved values}
\to
\text{minimal threshold frontiers}
\to
\text{frontier-membership evaluator}
\to
\text{exact action values / best moves}.
\]

---

## 8. Standard-7x6 oracle corollary

Let \(\mathcal Q_{7,6,4}\) be the finite set of legal standard-board q states.

The accepted exact oracle defines

\[
Q_a^{\mathcal O}(q)
\]

for every queried legal q/action.

Therefore the mathematical frontier family

\[
\boxed{
\mathcal M
=
\{
M_{s,a,\theta}
\}
}
\]

exists over the complete finite standard-board domain.

If \(\mathcal M\) is fully compiled, then

\[
\boxed{
q
\xrightarrow{\text{frontier membership}}
(Q_1,\ldots,Q_7)
\xrightarrow{\arg\max}
B(q)
}
\]

is an exact standard-7x6 perfect-play evaluator with no runtime continuation
search.

The previously executed standard-7x6 bounded frontier campaign already gives:

\[
257,007
\]

held-out legal actions and

\[
40,855
\]

exact held-out best-move proofs with

\[
0
\]

false action claims and

\[
0
\]

false best-move claims.

This is sampled construction evidence, not complete standard-board frontier
materialization.

---

## 9. What this proves

The correctness problem and the representation-existence problem are separated.

### Proved

\[
\boxed{
\text{exact oracle action function}
\Longrightarrow
\text{exact minimal-frontier representation}
\Longrightarrow
\text{nonrecursive exact evaluator}.
}
\]

Given complete oracle-labelled frontiers, the direct evaluator is exact.

### Still open

The remaining practical question is:

\[
\boxed{
\text{Can the complete standard-7x6 frontier family be constructed, stored,
and queried cheaply enough to be useful?}
}
\]

For generalized Connect-K, a stronger open question is whether frontier
description size and construction/query work admit polynomial bounds in
\(W,H,K\).

The oracle proves/labels correctness. It does not by itself prove compactness.

---

## Claim boundary

- The complete four-game controls are exhaustive finite proofs of the compiled
  frontier evaluator on those domains.
- The standard-7x6 corollary proves existence and correctness conditional only
  on complete frontier compilation from the accepted oracle; it does not claim
  those complete frontiers are currently materialized.
- No oracle is required at runtime once a complete frontier family is compiled.
- No ordinary future move-tree recursion occurs in frontier membership
  evaluation.
- This note does not promote the result into IsoGraph logic authority 1.2 and
  does not claim generalized polynomial-time Connect-K closure.
