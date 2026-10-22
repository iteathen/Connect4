# Original 7x6: full single-K4 residual moments plus 438 Euler hazards are not actionwise absorbing-closed

**Date:** 2026-10-21 (Pacific). **Owner:** `iteathen/Connect4@research/semantic-quotient`. **Status:** research-level `deductive_exact`, scoped to the explicit legal-state ensemble; NOT a qualified IsoGraph 1.2 authority amendment and NOT the independent empty-root perfect-play theorem. **Preregistration:** `docs/research/2026-10-21-frozen-five-switch-K4-grade4-actionwise-absorption-coupling.md`, revisions `23e05cfe` and pre-run bit-convention correction `3a85734a`. No solver results, historical 28 terminal K4 identities or known empty-root values used.

## Precise counterexample and source operators

Generate all 69 original physical H/V/R/F four-windows on the nonwrapped 7x6 board. There are five variable two-stone columns `i = 1,2,3,5,6`, an empty column 4 and a fixed column 7 whose bottom stone is P0 and next stone P1. All 32 boards have heights `[2,2,2,0,2,2,2]`, exactly six stones per owner and a genuine alternating, firstwinner-free 12-move history. Assign one P0-bottom ownership bit `x_i` to each variable column and split the boards into the EVEN/ODD parity of these five bits; each field contains 16 states of mass one. The source history construction and original physical-ray verification are in the checked-in runner.

Define the source moment vector `F` to contain:
- every exact ternary ownership-pattern histogram on each of the 69 original four-cell K4s (hence all individually indexed, owner-conditioned local K4 residual grades 4/3/2/1/0, blocked labels, and all their local physical cofactor patterns);
- all 438 gravity-frontier-gated products of nonempty Euler directional hazard subsets, **for both physical owners** (876 moments);
- the complete column heights and total mass.

No correlators jointly involving distinct original K4s are included merely by listing each K4's full pattern. For each original line a pattern depends on only four physical cells, and for equal parity ensembles all moments of degree less than five in the five switch variables match. All `1+42+861+11,480+111,930 = 124,314` complete ternary owner marginals on at most four sites were separately checked equal. Every initial 69-line complete ternary histogram was checked equal. All 876 Euler emitter slots were directly calculated across true boards and checked equal. Therefore `F(mu_even)=F(mu_odd)`.

Define the **separate, fixed-action, nonterminal** transfer `T^L_{0,4}` to place P0 at actual cell (4,1), discard boards where the move firstwins, and retain unit mass on each otherwise surviving rank-13 board. Absorbed winning histories enter a separate P0 sink; the terminal Boolean is the OR of original windows, not their sum. Source-independent physical-ray checks agree with literal all-69 K4 evaluation, and *both* fields contribute exactly six P0 firstwinning histories (10 K4 incidences), leaving ten live boards.

Despite identical initial `F`, their successor `F` differ. The original **P1 rising K4**
`((1,1),(2,2),(3,3),(4,4))` has the grade-two cofactor requiring P1 owners at (1,1),(2,2) and emptiness at (3,3),(4,4). This local four-cell pattern has mass **four on each initial field**, but mass **three on the even survivors versus two on the odd survivors** after the identical P0 action. Because (4,1) is not in this rising line, the cofactor is still physically viable after the move; (3,3),(4,4) remain latent behind gravity support. Therefore the full single-K4 residual-pattern moments and the 438 hazards are **not jointly action-indexed closed once firstwin absorption is enforced**. A second independently counted survivor marginal, the number with P0 bottom ownership at column1, is **4 (even) versus 5 (odd)**.

## Closed-form algebraic explanation of the lost fifth-order correlation

All true *horizontal* source K4 windows through actual candidate P0 landing (4,1) are, from left to right,

```
A = x1*x2*x3
B = x2*x3*x5
C = x3*x5*x6
D = x5*x6                  # fixed c7 bottom P0
```

The full true firstwin Boolean is `W=A OR B OR C OR D`. Since `C=>D`, and all other intersections are handled by the exact Euler-interval identity (NOT by dropping middle windows),
`W=A+B+D-AB-BD`.
Thus total WIN flux is identical on the two parity fields because `W` has Boolean polynomial degree at most four. But multiplication by another K4 cofactor changes the closure requirement:

```
x1 W = x1*x2*x3 + x1*x5*x6 - x1*x2*x3*x5*x6.
```

For uniform parity fields in five independent Boolean switch bits,
`sum_even(m) - sum_odd(m)=0` for any squarefree monomial of degree <5,
while it equals `-1` for their degree-five product. Therefore
`sum_even x1*(1-W) - sum_odd x1*(1-W) = -1`,
as independently observed (survivors 4 versus 5).

For the *actual named original rising P1 grade-two cofactor* let `g=(1-x1)*x2`, since bottom P1 at c1 requires `x1=0` and top P1 at c2 requires `x2=1` (top reverses bottom ownership). The remaining sites (3,3),(4,4) are empty on every input and survivor. The degree-five coefficient of `gW` is **+1**: it comes from `-x1*x2*x3*x5*x6` in `x1W`, subtracted in `gW=(x2-x1*x2)W`. Thus

`sum_even g*(1-W)-sum_odd g*(1-W)=+1`,

matching **grade-two residual counts 3 versus 2**, while `sum_even g=sum_odd g=4`.

This is a nonclosure result about the *absorbing Koopman pullback*: a source-K4 residual observable multiplied by the correct other-orientation firstwin survival factor induces a connected five-switch correlation missing from the per-line and emission fields. It is not a generic lower bound of five on every different abstract representation, nor evidence that all fifth-order Fourier modes are needed. The failure may admit a local connected-cluster repair.

## Scope and proof dependency

Original K4 rule → physically legal alternating two-stone-column ensembles → parity marginal lemma → exact four-window Euler hazard identity → action-specific **first-win survivor mask** → new fifth-order joint cofactor/absorber correlation → rigorous F-nonclosure.

The experiment preserves the **earlier negative five-switch prediction**: terminal winning flux STILL agrees, six versus six. The new result concerns the live *post-absorption* field, a different mathematical object. It also refines the earlier rank4 six-state field nonclosure: the latter showed grade-two moments are needed beyond the 438 emitters; this result proves that adding all **single-K4** graded residual fields and their full local patterns does not by itself resolve the coupling.

No global lower bound on the minimal cluster hierarchy, no exact small robust winning cone, and no independent P0-from-empty forced win have been proved. A next candidate should include **action-specific products of original cofactor and survival Euler clusters**, then test closure under all seven separate legal action operators without uniform averaging, and finally address the alternating adversarial quantifiers.

## Verification and reproducibility

Pre-run freeze: `docs/research/2026-10-21-frozen-five-switch-K4-grade4-actionwise-absorption-coupling.md`.
Committed independent checker: `research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-five-switch-K4-grade4-plus-438-actionwise-absorbing-correlation-nonclosure.py`.
Structured counts/evidence: `research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/ORIGINAL7X6_FIVE_SWITCH_GRADE4_PLUS_EULER438_ABSORPTION_FIFTH_CORRELATION_NONCLOSURE_0_1.json`.

The experiment was executed locally with exact Python integer/Boolean arithmetic on all 32 genuine source-legal boards; physical rays independently checked original terminal windows. There is no claim of maintained Node26 CI, third-party formal assistant, or solver qualification. All existing qualified IsoGraph logic, production solvers and known historical labels remain unchanged.
