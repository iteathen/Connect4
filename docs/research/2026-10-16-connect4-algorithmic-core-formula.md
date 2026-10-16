# Connect Four algorithmic core — term-only recurrence

**Date:** 2026-10-16  
**Status:** research synthesis / formula checkpoint; not a logic-authority revision  
**Owner:** `research/semantic-quotient`

## Purpose

Record the current algorithmic core in a form containing only state terms, transition operators, boundary predicates, quantifiers, and fixed-point equations.

This note does **not** promote an experimental CPCX result into accepted authority. It synthesizes the canonical residual/alternating-predecessor calculus with the later CPCX winner-existence / loser-equivalence quantifier discipline.

---

## 1. State

For board width (W), height (H), and player bit (pin{0,1}),

[
S=(h,R_0,R_1,p)
]

with

[
h=(h_0,ldots,h_{W-1})in{0,ldots,H}^{W}.
]

(R_0,R_1) are normalized antichains of residual winning requirements.

Define

[
operatorname{Min}(A)
=
{ain A:
exists bin A, bsubsetneq a}.
]

Legal columns:

[
mathcal A(S)={cin{0,ldots,W-1}:h_c<H}.
]

Current landing event:

[
x_c=(c,h_c).
]

---

## 2. Exact one-move transform

For (cinmathcal A(S)),

[
T_c(h,R_0,R_1,p)
=
(h+e_c,;R'_0,;R'_1,;1-p),
]

where for the mover (p),

[
R'_p
=
operatorname{Min}
{rsetminus{x_c}:rin R_p},
]

and for the opponent (1-p),

[
R'_{1-p}
=
operatorname{Min}
{rin R_{1-p}:x_c
otin r}.
]

Equivalently,

[
R'_i
=
operatorname{Min}
egin{cases}
{rsetminus{x_c}:rin R_i},&i=p,\[1mm]
{rin R_i:x_c
otin r},&i
eq p.
end{cases}
]

---

## 3. Terminal predicates

For (iin{0,1}),

[
omega_i(S)=
mathbf 1[arnothingin R_i].
]

No surviving win possibility:

[
eta_i(S)=
mathbf 1[R_i=arnothing].
]

Board exhaustion:

[
eta(S)=
mathbf 1[mathcal A(S)=arnothing].
]

Terminal partition:

[
mathcal T_i={S:omega_i(S)=1},
]

[
mathcal T_D=
{S:eta(S)=1, omega_0(S)=omega_1(S)=0}.
]

First-win semantics require transition evaluation to stop on the first newly satisfied (omega_i).

---

## 4. Claim-relative exact recurrence

Fix claimant (win{0,1}).

[
C_w(S)in{0,1}
]

is defined by

[
oxed{
C_w(S)=
egin{cases}
1,&Sinmathcal T_w,\[1mm]
0,&Sinmathcal T_{1-w}cupmathcal T_D,\[1mm]
0,&eta_w(S)=1,\[2mm]
displaystyleigvee_{cinmathcal A(S)} C_w(T_cS),
&p=w,\[5mm]
displaystyleigwedge_{cinmathcal A(S)} C_w(T_cS),
&p
eq w.
end{cases}}
]

Nonterminal shorthand:

[
oxed{
C_w(S)=
egin{cases}
displaystyleigvee_{cinmathcal A(S)} C_w(T_cS),&p=w,\[4mm]
displaystyleigwedge_{cinmathcal A(S)} C_w(T_cS),&p
eq w.
end{cases}}
]

Thus

[
p=wRightarrowexists c,
]

[
p
eq wRightarroworall c.
]

No remoteness term occurs.

---

## 5. Quotient form

Let

[
q=pi(S)
]

for an exact future-behavior congruence (pi), and let

[
F_c(q)=pi(T_c(S)).
]

Then

[
oxed{
C_w(q)=
egin{cases}
1,&qinmathcal T_w,\
0,&qinmathcal T_{1-w}cupmathcal T_D,\[1mm]
displaystyleigvee_{cinmathcal A(q)}C_w(F_c(q)),
&p(q)=w,\[4mm]
displaystyleigwedge_{cinmathcal A(q)}C_w(F_c(q)),
&p(q)
eq w.
end{cases}}
]

For the currently qualified ordinary forward projection, the candidate quotient substrate is of the form

[
pi(S)
=
(operatorname{support}(S),
operatorname{Min}(R_0),
operatorname{Min}(R_1)),
]

with any additional CPC/NDC certificate context retained whenever a claimed transition depends on reservation, release, response-resource, precedence, race, or deadline information.

---

## 6. Fixed-point form

Define

[
X_w^{(0)}=mathcal T_w.
]

For (nge0),

[
oxed{
X_w^{(n+1)}
=
X_w^{(n)}
cup
left{
q:
p(q)=w
land
exists cinmathcal A(q);
F_c(q)in X_w^{(n)}
ight}
cup
left{
q:
p(q)
eq w
land
orall cinmathcal A(q);
F_c(q)in X_w^{(n)}
ight}.
}
]

Hence

[
oxed{
X_w=igcup_{nge0}X_w^{(n)}
}
]

and

[
oxed{
C_w(S)=1
iff
pi(S)in X_w.
}
]

Equivalently, with controllable predecessor

[
operatorname{Pre}_w(X)=
{q:p(q)=wlandexists c, F_c(q)in X}
cup
{q:p(q)
eq wlandorall c, F_c(q)in X},
]

[
oxed{
X_w=mu X.left(mathcal T_wcupoperatorname{Pre}_w(X)ight),
}
]

where (mu) denotes the least fixed point.

---

## 7. Well-founded certificate form

For a structural descriptor

[
D(q)
]

with well-founded rank

[
mu:D	omathcal W,
]

every admitted nonterminal certificate edge satisfies

[
oxed{
mu(D(F_c(q)))<mu(D(q)).
}
]

Therefore a certificate may replace recursive expansion by finite structural descent when the following are closed:

[
oxed{
p=w:
quad
exists cinmathcal A(q)
;[
F_c(q)inmathcal T_w
lor
D(F_c(q))prec D(q)
],
}
]

[
oxed{
p
eq w:
quad
orall cinmathcal A(q)
;[
F_c(q)inmathcal T_w
lor
D(F_c(q))prec D(q)
].
}
]

A trivial physical rank is

[
mu_{mathrm{phys}}(S)
=
WH-sum_{c=0}^{W-1}h_c,
]

but this alone does not remove continuation-tree expansion.

---

## 8. CPC ownership term

For future target (t=(c,r)),

[
N(t)
=
(r-h_c+1)
+
sum_{d
eq c}(H-h_d)
]

and

[
N(t)
=
(W-1)H-operatorname{ply}+r+1.
]

Absolute zero-reservation owner bit:

[
oxed{
q_0(c,r)
=
((W-1)H+r)mod2.
}
]

With a certified parity correction (ho(c,r)),

[
oxed{
q(c,r)
=
((W-1)H+r+ho(c,r))mod2.
}
]

For standard (7	imes6),

[
oxed{
q_0(c,r)=rmod2.
}
]

These terms are inputs/constraints on admissible structural transforms; they do not replace the alternating recurrence.

---

## 9. Minimal complete statement

[
oxed{
egin{gathered}
q=pi(S),\[1mm]
F_c(q)=pi(T_cS),\[1mm]
C_w(q)=
egin{cases}
1,&qinmathcal T_w,\
0,&qinmathcal T_{1-w}cupmathcal T_D,\
igvee_c C_w(F_c(q)),&p(q)=w,\
igwedge_c C_w(F_c(q)),&p(q)
eq w,
end{cases}\[3mm]
F_c(q)
otinmathcal T
Rightarrow
mu(D(F_c(q)))<mu(D(q)).
end{gathered}
}
]

Equivalent fixed-point statement:

[
oxed{
X_w
=
mu X.
left(
mathcal T_w
cup
{q:p(q)=wlandexists c, F_c(q)in X}
cup
{q:p(q)
eq wlandorall c, F_c(q)in X}
ight).
}
]

---

## 10. Exact open problem

The recurrence above is not the unresolved part.

The unresolved target is to construct and prove a quotient/operator pair

[
oxed{
(pi,F)
}
]

such that all of the following hold:

[
oxed{
pi(S_1)=pi(S_2)
Rightarrow
C_w(S_1)=C_w(S_2)
quad
orall w,
}
]

[
oxed{
pi(T_cS)=F_c(pi(S))
}
]

for every legal (c),

[
oxed{
|pi(S)|le operatorname{poly}(W,H,K),
}
]

[
oxed{
operatorname{cost}(F_c)le operatorname{poly}(W,H,K),
}
]

and the existential/universal predecessor can be certified without enumerating an exponential continuation tree.

In shortest form:

[
oxed{
	ext{open problem}
=
	ext{polynomial exact congruence}
+
	ext{polynomial closed transition}
+
	ext{polynomial quantified predecessor closure}.
}
]

The alternating recurrence itself is already explicit.

---

## Provenance / claim boundary

This synthesis is consistent with and should be read against:

- `docs/research/2026-09-13-alternating-fixed-point-calculus.md`;
- `docs/research/2026-09-10-minimum-description-semantic-quotient.md`;
- `docs/research/2026-09-09-universal-strategic-algebra.md`;
- `docs/research/2026-09-14-cpc-control-potential-unification.md`;
- the experimental CPCX winner-existence / loser-equivalence work on `experiment/cpcx-20261002`.

It does not supersede `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md`, does not change specification acceptance status, and does not claim that the open polynomial quotient/operator construction has been completed.
