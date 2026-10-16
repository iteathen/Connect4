# Oracle-relative proof of the Connect Four algorithmic-core recurrence

**Date:** 2026-10-16  
**Status:** oracle-relative proof + executed implementation validation; research synthesis, not a logic-authority revision  
**Owner:** \`research/semantic-quotient\`  
**Formula checkpoint:** \`docs/research/2026-10-16-connect4-algorithmic-core-formula.md\`  
**Validation workflow:** \`.github/workflows/research-oracle-algorithmic-core-proof.yml\`  
**Validation head:** \`c19c1a5e41cfd2200bf53b86a2f0c77435105529\`  
**Workflow run:** \`38932911462\` — SUCCESS

## Result

The claimant-relative existential/universal recurrence from the algorithmic-core
formula is proved directly from the accepted solved-oracle action-score contract.
The proof does **not** require recursively evaluating the formula to terminal
depth.

The local q transition used by the formula is independently deductive:

\[
F_c(\pi(S))=\pi(T_cS).
\]

The oracle supplies the exact solved value of every legal action at the current
position. Therefore the formula can be validated one rank-local transition at a
time against oracle action values.

This closes the correctness question for the alternating recurrence **relative
to the exactness of the accepted standard-7x6 oracle**. It does not establish
that the formula has already been transformed into a polynomial-time
oracle-independent evaluator.

---

## 1. Oracle terms

For a legal nonterminal standard-7x6 state \(S\), let

\[
p(S)\in\{0,1\}
\]

be the player to move and let

\[
\mathcal A(S)
\]

be its legal columns.

Let

\[
\sigma(S,c)\in\mathbb Z
\]

be the accepted oracle strong score of legal action \(c\), expressed relative
to the current mover.

The accepted oracle contract is:

\[
\boxed{
\sigma(S)=\max_{c\in\mathcal A(S)}\sigma(S,c).
}
\]

Only the sign is needed here:

\[
\operatorname{sgn}\sigma=
\begin{cases}
+1,&\text{current mover wins},\\
0,&\text{draw},\\
-1,&\text{current mover loses}.
\end{cases}
\]

Define the absolute P0-oriented action value

\[
\boxed{
V_{\mathcal O}(S,c)
=
(-1)^{p(S)}
\operatorname{sgn}\sigma(S,c)
}
\]

and parent value

\[
\boxed{
V_{\mathcal O}(S)
=
(-1)^{p(S)}
\operatorname{sgn}\sigma(S).
}
\]

Thus

\[
V_{\mathcal O}\in\{-1,0,+1\}
\]

with \(+1=P0\) win, \(0=\) draw, \(-1=P1\) win.

---

## 2. Direct extremum proof

If \(p(S)=0\), multiplying by \((-1)^p=1\) preserves order:

\[
\boxed{
V_{\mathcal O}(S)
=
\max_{c\in\mathcal A(S)}
V_{\mathcal O}(S,c).
}
\]

If \(p(S)=1\), multiplying by \((-1)^p=-1\) reverses order:

\[
\boxed{
V_{\mathcal O}(S)
=
\min_{c\in\mathcal A(S)}
V_{\mathcal O}(S,c).
}
\]

Therefore

\[
\boxed{
V_{\mathcal O}(S)=
\begin{cases}
\max_c V_{\mathcal O}(S,c),&p=0,\\[2mm]
\min_c V_{\mathcal O}(S,c),&p=1.
\end{cases}}
\]

This is exactly the ordinary P0-oriented alternating recurrence.

No continuation path is evaluated by the formula in this proof. The oracle
already supplies each \(V_{\mathcal O}(S,c)\).

---

## 3. Claim-relative OR/AND form

Fix claimant \(w\in\{0,1\}\).

Define

\[
\chi_w(S,c)
=
\mathbf 1[\text{oracle outcome after }c\text{ is a win for }w].
\]

If the claimant is the mover,

\[
p(S)=w,
\]

then the oracle parent is a claimant win iff at least one legal action is a
claimant win:

\[
\boxed{
C_w(S)
=
\bigvee_{c\in\mathcal A(S)}
\chi_w(S,c).
}
\]

If the claimant is not the mover,

\[
p(S)\neq w,
\]

then the oracle parent is a claimant win iff every legal mover action remains a
claimant win:

\[
\boxed{
C_w(S)
=
\bigwedge_{c\in\mathcal A(S)}
\chi_w(S,c).
}
\]

Hence

\[
\boxed{
C_w(S)=
\begin{cases}
\displaystyle\bigvee_c C_w(T_cS),&p=w,\\[4mm]
\displaystyle\bigwedge_c C_w(T_cS),&p\neq w,
\end{cases}}
\]

where in the oracle-relative proof the child predicate is supplied directly by
the solved action label instead of recursively evaluated by the formula.

This is CPCX winner-existence / loser-equivalence in pure terms.

---

## 4. Composition with q

The existing q-congruence derivation gives

\[
\pi(S)
=
(\operatorname{support}(S),
\operatorname{Min}(R_0(S)),
\operatorname{Min}(R_1(S)))
\]

and

\[
\boxed{
F_c(\pi(S))=\pi(T_cS).
}
\]

Therefore define

\[
\widehat V_{\mathcal O}(q)=V_{\mathcal O}(S)
\]

for any legal \(S\) with \(\pi(S)=q\).

Under q future-behavior congruence this is well-defined, and

\[
\boxed{
\widehat V_{\mathcal O}(q)=
\begin{cases}
\max_c \widehat V_{\mathcal O}(F_c(q)),&p(q)=0,\\[2mm]
\min_c \widehat V_{\mathcal O}(F_c(q)),&p(q)=1.
\end{cases}}
\]

Equivalently for claimant \(w\),

\[
\boxed{
\widehat C_w(q)=
\begin{cases}
\bigvee_c \widehat C_w(F_c(q)),&p(q)=w,\\[2mm]
\bigwedge_c \widehat C_w(F_c(q)),&p(q)\neq w.
\end{cases}}
\]

Thus the oracle and the q-local formula commute:

\[
\boxed{
\begin{array}{ccc}
S & \xrightarrow{T_c} & T_cS\\
\downarrow\pi && \downarrow\pi\\
q & \xrightarrow{F_c} & F_c(q)
\end{array}}
\]

with solved value preserved under the oracle labeling.

---

## 5. Executed validation

The dedicated validation harness:

\[
\texttt{quotient-oracle-algorithmic-core-proof.mjs}
\]

was run under exact Node \(26.7.0\) in GitHub Actions.

It consumed the already-qualified oracle corpus:

- 128 deterministic calibration positions;
- 30 beginning-game spot checks;
- all 158 horizontal mirrors as an additional symmetry control.

Executed total:

\[
\boxed{316\text{ positions}}
\]

and

\[
\boxed{1,586\text{ legal action transitions}}.
\]

Source-parent oracle classes:

\[
69\text{ mover wins},\qquad
30\text{ draws},\qquad
59\text{ mover losses}.
\]

Every checked transition passed all of:

\[
\begin{aligned}
&\text{external parent score},\\
&\text{qualified oracle action vector},\\
&\text{mirrored action vector},\\
&\text{support transition},\\
&\text{residual cofactor transition},\\
&\text{immediate terminal agreement},\\
&\text{P0 claimant OR/AND equation},\\
&\text{P1 claimant OR/AND equation}.
\end{aligned}
\]

The run explicitly records:

\[
\boxed{
\texttt{formulaRecursiveDescentUsed=false}.
}
\]

Result schema:

\[
\texttt{connect4.oracle-algorithmic-core-local-proof.v0\_1}.
\]

---

## 6. What is now closed

Relative to the accepted exact-oracle semantics, the following equation is no
longer an open conjecture:

\[
\boxed{
C_w(q)=
\begin{cases}
1,&q\in\mathcal T_w,\\
0,&q\in\mathcal T_{1-w}\cup\mathcal T_D,\\
\bigvee_c C_w(F_c(q)),&p(q)=w,\\
\bigwedge_c C_w(F_c(q)),&p(q)\neq w.
\end{cases}}
\]

The oracle gives a direct extensional value for each legal child, so correctness
of the recurrence does not depend on running this equation recursively during
validation.

The q-local cofactor transform is also independently derived and was exercised
against physical reconstruction on every validation edge.

---

## 7. What remains open

The remaining problem is **not** whether the recurrence gives the correct
perfect-play relation.

The remaining problem is whether an oracle-independent runtime can obtain the
needed child/consequence labels cheaply enough without ordinary exponential
continuation expansion.

Formally, the open optimization/closure target is a directly computable
structural map

\[
G(q)\in\{-1,0,+1\}
\]

or certificate family \(D(q)\) such that

\[
\boxed{
G(q)=\widehat V_{\mathcal O}(q)
}
\]

for every legal q, while

\[
\operatorname{cost}(G)
\]

is substantially smaller than exact continuation search.

Oracle comparison can be used to falsify/qualify candidate \(G\) values
directly:

\[
\boxed{
G(q)\stackrel{?}{=}\widehat V_{\mathcal O}(q)
}
\]

without recursively running \(G\) to terminal depth.

This is the practical consequence of the present proof.

---

## Claim boundary

- The accepted standard-7x6 oracle is used as validation/relative-proof
  authority, not as a runtime dependency of the proposed formula.
- The executed 316-position / 1,586-transition control validates the
  implementation but is not itself an exhaustive enumeration of every legal
  7x6 position.
- The universal equation follows algebraically from the exact oracle action-score
  contract plus the independently derived q transition.
- This note does not promote q-congruence or the formula into IsoGraph logic
  authority 1.2; existing qualification/authority procedures still apply.
- This note does not establish a polynomial-time oracle-independent Connect Four
  solver.
