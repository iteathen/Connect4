# Standard 7x6 W/D/L frontier-shell compilation

**Date:** 2026-10-16  
**Status:** complete ranks 33–42; mirror-reuse optimization under qualification  
**Owner:** \`research/semantic-quotient\`  
**Parent theorem:** \`docs/research/2026-10-16-oracle-compiled-action-value-frontier-theorem.md\`

## Purpose

Materialize the standard-7x6 exact W/D/L frontier family directly in the
support-local residual lattice, without carrying the full strong-distance
threshold ladder and without enumerating future move trees at runtime.

The construction uses the existing exact RBA threshold recurrence implemented
by:

\`research/isograph/discovery/2026-09-18-policy-frontier/rba-draw-boundary-runner.mjs\`

For one support fiber the stored pair

\[
(U_s,L_s)
\]

is the exact central W/D/L threshold boundary:

\[
U_s = \operatorname{Min}\{q:V(q)\ge 0\},
\]

\[
L_s = \operatorname{Max}\{q:V(q)\le 0\},
\]

in the transformed favorable-state representation.

These two fronts suffice for W/D/L classification. Strong-distance threshold
fronts are not required.

---

## 1. W/D/L specialization

The previously studied strong score chain is not primitive for this target.

The four-valued Bellman information process

\[
\{\mathrm{UNKNOWN},\mathrm{WIN},\mathrm{DRAW},\mathrm{LOSS}\}
\]

determines the W/D/L sign directly; strong distance is the first resolution
ordinal.

Therefore the W/D/L compiler carries only the central threshold instead of the
full strong-distance ladder.

The exact state classification is:

\[
V(q)=
\begin{cases}
+1,&q\in\uparrow U_s\ \land\ q\notin\downarrow L_s,\\
0,&q\in\uparrow U_s\ \land\ q\in\downarrow L_s,\\
-1,&q\notin\uparrow U_s\ \land\ q\in\downarrow L_s.
\end{cases}
\]

The impossible fourth case would contradict exact Bellman closure.

---

## 2. Exact recurrence used

For every legal support edge the runner computes exact cofactor preimages by
the right-adjoint/principal-cover transform.

State Upper is the normalized union of action Upper fronts.

State Lower is the exact antichain-semiring product of all action Lower fronts.

Thus, schematically,

\[
U_s
=
\operatorname{Min}
\bigcup_a U_{s,a},
\]

\[
L_s
=
\operatorname{Max}
\bigotimes_a L_{s,a}.
\]

No oracle label is consumed by this recurrence. The oracle-compiled frontier
theorem supplies the independent value interpretation; this compiler constructs
the same threshold object symbolically.

---

## 3. Complete ranks 36–42

Workflow:

\`Research standard7x6 WDL frontier shell\`

Run:

\[
38935430774
\]

Head:

\[
\texttt{a847718194df4cf57350c641ff49beacfccf0b3b}
\]

Every standard-board support vector of occupied rank 36 through 42 was
compiled.

| rank | supports | Upper generators | Lower generators | max Upper | max Lower |
|---:|---:|---:|---:|---:|---:|
| 42 | 1 | 1 | 1 | 1 | 1 |
| 41 | 7 | 7 | 7 | 1 | 1 |
| 40 | 28 | 98 | 28 | 4 | 1 |
| 39 | 84 | 392 | 238 | 6 | 8 |
| 38 | 210 | 1,644 | 959 | 19 | 16 |
| 37 | 462 | 5,468 | 8,276 | 29 | 75 |
| 36 | 924 | 32,662 | 25,696 | 168 | 217 |

Totals:

\[
\boxed{1,716\text{ support fibers}}
\]

\[
\boxed{75,477\text{ frontier generators}}
\]

No support was omitted or sampled.

---

## 4. Complete ranks 34–42

Run:

\[
38935517962
\]

Head:

\[
\texttt{052127abbc0ae67a73466a66b1d6d4148ef51b00}
\]

The compiler then descended through every support at ranks 35 and 34.

Additional results:

| rank | supports | Upper generators | Lower generators | max Upper | max Lower | summed support-local elapsed |
|---:|---:|---:|---:|---:|---:|---:|
| 35 | 1,709 | 88,977 | 213,287 | 377 | 1,713 | ~5.64 s |
| 34 | 2,954 | 782,219 | 577,428 | 2,755 | 3,175 | ~21.81 s |

Cumulative ranks 34–42:

\[
\boxed{6,379\text{ support fibers}}
\]

\[
\boxed{911,468\text{ Upper generators}}
\]

\[
\boxed{825,920\text{ Lower generators}}
\]

\[
\boxed{1,737,388\text{ total generators}}
\]

Largest rank-34 Upper observed:

\[
2,755
\]

at support

\[
[6,5,4,3,4,6,6].
\]

Largest rank-34 Lower observed:

\[
3,175
\]

at support

\[
[6,6,3,3,4,6,6].
\]

This is complete support-fiber compilation, not sampled coverage.

---

## 5. Complete rank 33

The first full rank-33 shell run completed successfully before the dense-memo
retry was required for correctness.

Run:

\[
38935669989
\]

Head:

\[
\texttt{f0c0e050e00b9d5256055cf1899972a56552ecc4}
\]

Exact rank-33 result:

\[
\boxed{4,809\text{ support fibers}}
\]

\[
\boxed{2,049,203\text{ Upper generators}}
\]

\[
\boxed{5,999,813\text{ Lower generators}}
\]

\[
\boxed{8,049,016\text{ rank-33 generators}}.
\]

Largest Upper:

\[
4,766
\]

at support

\[
[5,6,3,3,4,6,6].
\]

Largest Lower:

\[
33,278
\]

at support

\[
[6,6,3,3,3,6,6].
\]

The summed support-local elapsed time recorded for rank 33 was approximately

\[
598.3\text{ s}.
\]

Cumulative ranks 33–42:

\[
\boxed{11,188\text{ support fibers}}
\]

and

\[
\boxed{9,786,404\text{ total generators}}.
\]

The long pauses observed during the run were aggregate shell cost, not a failed
support. Every rank-33 support closed.

### Dense small-fiber memo

A semantics-preserving implementation refinement was subsequently introduced at

\[
\texttt{ef229ca73db93b11f7529947dd9484939cbff214}.
\]

For child fibers with at most 20 residual shapes, the exact uncovered-target
memo uses a dense target-mask array rather than a generic BigInt-keyed Map.
The recurrence is unchanged and research-integrity passed.

---

## 6. Isolated rank-33 target qualification

To distinguish a local algebraic wall from aggregate shell cost, support

\[
[4,6,6,5,3,4,5]
\]

was compiled in an isolated descendant cone.

Workflow run:

\[
38936875924
\]

Head:

\[
\texttt{406698e3f95e1d4c1c9c627a4898a65bbb35b825}
\]

Result at rank 33:

\[
\boxed{U=212,\qquad L=651}
\]

with measured support-local elapsed approximately

\[
101.4\text{ ms}.
\]

The target cone completed successfully.

The persisted workflow artifact is:

\[
\texttt{wdl-target-r33}
\]

artifact ID:

\[
12060618415
\]

compressed size:

\[
450,547\text{ bytes}
\]

with SHA-256:

\[
40ac71e99e545c582f06121774e743f6fa6692eacacfffa6c09525dd83f38de9.
\]

Thus that support is not an intrinsic semantic or local-product wall.

---

## 7. Exact horizontal-reflection reuse

After rank-33 closure, the compiler was modified to avoid recomputing mirrored
support fibers.

For support

\[
s=(h_0,\ldots,h_6)
\]

define

\[
\rho(s)=(h_6,\ldots,h_0).
\]

Horizontal reflection is a game automorphism and an order isomorphism of the
support-local residual lattice. Therefore

\[
U_{\rho(s)}=\rho(U_s),
\qquad
L_{\rho(s)}=\rho(L_s).
\]

The implementation at

\[
\texttt{6101e27ce44d5c79fdfe3bc5d9f4d7c4abea1c41}
\]

reuses an already-computed canonical mirror and performs an exact reflection
round-trip assertion before accepting the copied frontier.

This is an evaluation optimization only. It does not alter W/D/L semantics or
frontier membership.

A complete rank-33 timing replay under mirror reuse is currently being used as
the direct qualification/control.

---

## 8. Current interpretation

The complete rank-34 shell demonstrates that W/D/L-only frontier construction
is dramatically narrower than the earlier full strong-distance campaign.

At these ranks the active exact object is:

\[
\boxed{
\text{support}
+
\text{two central W/D/L antichain fronts}.
}
\]

The current uncertainty is no longer correctness of the representation.

The next empirical question is the rank at which complete-shell construction
cost or frontier width ceases to remain practical.

Rank 33 shows the first substantial width/cost jump, but it remains a complete
finite compilation rather than a semantic failure.

The next descent should not repeat exact horizontal-reflection work.

---

## 9. Claim boundary

Established:

- exact W/D/L threshold recurrence;
- complete support-fiber materialization for ranks 34–42;
- exact isolated rank-33 target materialization;
- dense small-fiber memo preserves the recurrence and passed repository
  research-integrity.

Not yet established:

- complete ranks 0–32;
- empty-root frontier materialization;
- a polynomial bound on frontier width or construction time;
- final production storage/query layout;
- promotion into IsoGraph logic authority.

The standard-7x6 root is therefore **not yet claimed solved by the compiled
frontier implementation**.
