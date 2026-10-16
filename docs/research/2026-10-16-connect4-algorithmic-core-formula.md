# Connect Four algorithmic core — term-only recurrence

**Date:** 2026-10-16  
**Status:** research synthesis / formula checkpoint; recurrence now oracle-validated, not a logic-authority revision  
**Owner:** \`research/semantic-quotient\`

## Purpose

Record the Connect Four algorithmic core using only state terms, transition operators, boundary predicates, quantifiers, and fixed-point equations.

Related oracle-relative proof:

- \`docs/research/2026-10-16-oracle-relative-proof-algorithmic-core.md\`

---

## 1. State

For board width \(W\), height \(H\), and player bit \(p\in\{0,1\}\),

\[
S=(h,R_0,R_1,p),
\]

with

\[
h=(h_0,\ldots,h_{W-1})\in\{0,\ldots,H\}^{W}.
\]

\(R_0,R_1\) are normalized antichains of residual winning requirements.

Define

\[
\operatorname{Min}(A)
=
\{a\in A:\nexists b\in A,\ b\subsetneq a\}.
\]

Legal columns:

\[
\mathcal A(S)=\{c\in\{0,\ldots,W-1\}:h_c<H\}.
\]

Current landing event:

\[
x_c=(c,h_c).
\]

---

## 2. Exact one-move transform

For \(c\in\mathcal A(S)\),

\[
T_c(h,R_0,R_1,p)
=
(h+e_c,\;R'_0,\;R'_1,\;1-p),
\]

where

\[
R'_p
=
\operatorname{Min}
\{r\setminus\{x_c\}:r\in R_p\},
\]

and

\[
R'_{1-p}
=
\operatorname{Min}
\{r\in R_{1-p}:x_c\notin r\}.
\]

Equivalently,

\[
R'_i
=
\operatorname{Min}
\begin{cases}
\{r\setminus\{x_c\}:r\in R_i\},&i=p,\\[1mm]
\{r\in R_i:x_c\notin r\},&i\neq p.
\end{cases}
\]

---

## 3. Terminal predicates

For \(i\in\{0,1\}\),

\[
\omega_i(S)=\mathbf 1[\varnothing\in R_i].
\]

No surviving win possibility:

\[
\eta_i(S)=\mathbf 1[R_i=\varnothing].
\]

Board exhaustion:

\[
\beta(S)=\mathbf 1[\mathcal A(S)=\varnothing].
\]

Terminal partition:

\[
\mathcal T_i=\{S:\omega_i(S)=1\},
\]

\[
\mathcal T_D=
\{S:\beta(S)=1,\ \omega_0(S)=\omega_1(S)=0\}.
\]

First-win semantics stop the transition at the first newly satisfied \(\omega_i\).

---

## 4. Claim-relative exact recurrence

Fix claimant \(w\in\{0,1\}\).

\[
C_w(S)\in\{0,1\}.
\]

Then

\[
\boxed{
C_w(S)=
\begin{cases}
1,&S\in\mathcal T_w,\\[1mm]
0,&S\in\mathcal T_{1-w}\cup\mathcal T_D,\\[1mm]
0,&\eta_w(S)=1,\\[2mm]
\displaystyle\bigvee_{c\in\mathcal A(S)} C_w(T_cS),&p=w,\\[5mm]
\displaystyle\bigwedge_{c\in\mathcal A(S)} C_w(T_cS),&p\neq w.
\end{cases}}
\]

Nonterminal shorthand:

\[
\boxed{
C_w(S)=
\begin{cases}
\displaystyle\bigvee_{c\in\mathcal A(S)} C_w(T_cS),&p=w,\\[4mm]
\displaystyle\bigwedge_{c\in\mathcal A(S)} C_w(T_cS),&p\neq w.
\end{cases}}
\]

Hence

\[
p=w\Rightarrow\exists c,
\]

\[
p\neq w\Rightarrow\forall c.
\]

No remoteness term occurs.

---

## 5. Quotient form

Let

\[
q=\pi(S)
\]

for an exact future-behavior congruence, and define

\[
F_c(q)=\pi(T_cS).
\]

Then

\[
\boxed{
C_w(q)=
\begin{cases}
1,&q\in\mathcal T_w,\\
0,&q\in\mathcal T_{1-w}\cup\mathcal T_D,\\[1mm]
\displaystyle\bigvee_{c\in\mathcal A(q)}C_w(F_c(q)),&p(q)=w,\\[4mm]
\displaystyle\bigwedge_{c\in\mathcal A(q)}C_w(F_c(q)),&p(q)\neq w.
\end{cases}}
\]

The current ordinary future-behavior carrier is

\[
\pi(S)
=
\left(
\operatorname{support}(S),
\operatorname{Min}(R_0(S)),
\operatorname{Min}(R_1(S))
\right),
\]

with stronger CPC/NDC proof context retained separately whenever a certificate depends on reservation, release, response-resource, precedence, race, or deadline state not derivable from ordinary q.

---

## 6. Fixed-point form

Define

\[
X_w^{(0)}=\mathcal T_w.
\]

For \(n\ge0\),

\[
\boxed{
X_w^{(n+1)}
=
X_w^{(n)}
\cup
\left\{
q:
p(q)=w
\land
\exists c\in\mathcal A(q)\;
F_c(q)\in X_w^{(n)}
\right\}
\cup
\left\{
q:
p(q)\neq w
\land
\forall c\in\mathcal A(q)\;
F_c(q)\in X_w^{(n)}
\right\}.
}
\]

Hence

\[
\boxed{
X_w=\bigcup_{n\ge0}X_w^{(n)}
}
\]

and

\[
\boxed{
C_w(S)=1
\iff
\pi(S)\in X_w.
}
\]

Define controllable predecessor

\[
\operatorname{Pre}_w(X)=
\{q:p(q)=w\land\exists c,\ F_c(q)\in X\}
\cup
\{q:p(q)\neq w\land\forall c,\ F_c(q)\in X\}.
\]

Then

\[
\boxed{
X_w=\mu X.\left(\mathcal T_w\cup\operatorname{Pre}_w(X)\right),
}
\]

where \(\mu\) denotes the least fixed point.

---

## 7. Well-founded certificate form

For structural descriptor \(D(q)\) with well-founded rank

\[
\mu:D\to\mathcal W,
\]

every admitted nonterminal certificate edge satisfies

\[
\boxed{
\mu(D(F_c(q)))<\mu(D(q)).
}
\]

Thus a searchless certificate may replace explicit recursive expansion when

\[
\boxed{
p=w:
\quad
\exists c\in\mathcal A(q)\;
[
F_c(q)\in\mathcal T_w
\lor
D(F_c(q))\prec D(q)
],
}
\]

and

\[
\boxed{
p\neq w:
\quad
\forall c\in\mathcal A(q)\;
[
F_c(q)\in\mathcal T_w
\lor
D(F_c(q))\prec D(q)
].
}
\]

A trivial physical rank is

\[
\mu_{\mathrm{phys}}(S)
=
WH-\sum_{c=0}^{W-1}h_c,
\]

but that rank alone does not remove continuation-tree expansion.

---

## 8. CPC ownership term

For future target \(t=(c,r)\),

\[
N(t)
=
(r-h_c+1)
+
\sum_{d\neq c}(H-h_d),
\]

hence

\[
N(t)
=
(W-1)H-\operatorname{ply}+r+1.
\]

Absolute zero-reservation owner bit:

\[
\boxed{
q_0(c,r)
=
((W-1)H+r)\bmod2.
}
\]

With certified parity correction \(\rho(c,r)\),

\[
\boxed{
q(c,r)
=
((W-1)H+r+\rho(c,r))\bmod2.
}
\]

For standard \(7\times6\),

\[
\boxed{
q_0(c,r)=r\bmod2.
}
\]

---

## 9. Minimal complete statement

\[
\boxed{
\begin{gathered}
q=\pi(S),\\[1mm]
F_c(q)=\pi(T_cS),\\[1mm]
C_w(q)=
\begin{cases}
1,&q\in\mathcal T_w,\\
0,&q\in\mathcal T_{1-w}\cup\mathcal T_D,\\
\bigvee_c C_w(F_c(q)),&p(q)=w,\\
\bigwedge_c C_w(F_c(q)),&p(q)\neq w,
\end{cases}\\[3mm]
F_c(q)\notin\mathcal T
\Rightarrow
\mu(D(F_c(q)))<\mu(D(q)).
\end{gathered}
}
\]

Equivalent fixed-point statement:

\[
\boxed{
X_w
=
\mu X.
\left(
\mathcal T_w
\cup
\{q:p(q)=w\land\exists c,\ F_c(q)\in X\}
\cup
\{q:p(q)\neq w\land\forall c,\ F_c(q)\in X\}
\right).
}
\]

---

## 10. Oracle-relative closure

Let \(\sigma(S,c)\) be the exact mover-relative solved action score from the accepted standard-7x6 oracle.

Define

\[
V_{\mathcal O}(S,c)
=
(-1)^{p(S)}
\operatorname{sgn}\sigma(S,c).
\]

Then

\[
\boxed{
V_{\mathcal O}(S)=
\begin{cases}
\max_c V_{\mathcal O}(S,c),&p(S)=0,\\
\min_c V_{\mathcal O}(S,c),&p(S)=1.
\end{cases}}
\]

Therefore the claimant-relative OR/AND recurrence above follows directly from the oracle action-score contract and does not need recursive formula execution during validation.

Executed validation at head

\[
\texttt{c19c1a5e41cfd2200bf53b86a2f0c77435105529}
\]

passed on

\[
316\text{ positions}
\]

and

\[
1,586\text{ legal action transitions},
\]

with

\[
\texttt{formulaRecursiveDescentUsed=false}.
\]

See:

- \`docs/research/2026-10-16-oracle-relative-proof-algorithmic-core.md\`

---

## 11. Oracle-compiled direct evaluator

For fixed support \(s\), legal action \(a\), and oracle score threshold \(\theta\), define

\[
M_{s,a,\theta}
=
\operatorname{Min}_{\succeq}
\{q:Q_a^{\mathcal O}(q)\ge\theta\}.
\]

Then

\[
\boxed{
\widehat Q_a(q)
=
\max
\left\{
\theta:
\exists m\in M_{s,a,\theta},\ q\succeq m
\right\}
=
Q_a^{\mathcal O}(q).
}
\]

Therefore

\[
\boxed{
\widehat B(q)
=
\operatorname*{arg\,max}_{a\in\mathcal A(s)}
\widehat Q_a(q).
}
\]

The evaluator contains no recursive continuation term. The oracle is used only
to compile or validate the frontier family \(M\); evaluation is structural
antichain membership.

An exhaustive four-game round-trip control decoded

\[
1,039,073
\]

exact action values and

\[
343,736
\]

exact best-move masks with zero mismatches.

See:

- \`docs/research/2026-10-16-oracle-compiled-action-value-frontier-theorem.md\`

---

## 12. Exact remaining problem

The recurrence correctness and the existence of a nonrecursive exact
oracle-compiled evaluator are no longer unresolved.

For standard 7x6, the remaining practical target is to construct/materialize

\[
\mathcal M=\{M_{s,a,\theta}\}
\]

with sufficiently small construction, storage, and membership-query cost.

A stronger generalized-complexity target additionally asks for

\[
|\pi(S)|\le\operatorname{poly}(W,H,K),
\]

\[
\operatorname{cost}(F_c)\le\operatorname{poly}(W,H,K),
\]

and polynomial frontier construction/query complexity.

In shortest form:

\[
\boxed{
\text{remaining problem}
=
\text{complete frontier construction}
+
\text{frontier compression}
+
\text{cheap membership/query}.
}
\]

Oracle comparison can validate frontier construction pointwise without
recursively running the structural evaluator to terminal depth.

---

## Provenance / claim boundary

This synthesis should be read against:

- \`docs/research/2026-09-13-alternating-fixed-point-calculus.md\`;
- \`docs/research/2026-09-10-minimum-description-semantic-quotient.md\`;
- \`docs/research/2026-09-09-universal-strategic-algebra.md\`;
- \`docs/research/2026-09-14-cpc-control-potential-unification.md\`;
- \`research/isograph/discovery/2026-09-18-high-value-leads/STANDARD_7X6_Q_CONGRUENCE.md\`;
- \`docs/research/2026-10-16-oracle-relative-proof-algorithmic-core.md\`;
- \`docs/research/2026-10-16-oracle-compiled-action-value-frontier-theorem.md\`.

This file does not supersede \`research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md\`, does not change specification acceptance status, and does not claim that a polynomial-time oracle-independent Connect Four evaluator has been completed.
