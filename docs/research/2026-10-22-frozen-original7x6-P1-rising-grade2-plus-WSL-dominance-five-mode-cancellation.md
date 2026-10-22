# Frozen independent recheck after symbolic observation: two different P1 surviving observables cancel the fifth Fourier order

**Date:** 2026-10-22 Pacific. **Research direction:** Josh Oshiro. **Canonical pre-recheck HEAD:** `b5f2cde48d72083ca6370efa8b0005197fb737a2`. **Integrity:** exact algebraic candidate discovered by exploratory symbolic calculations BEFORE this freeze, frozen prior to an independently implemented full original7x6 physical 32-state/ray/antichain verifier. Do not mislabel discovery as prospectively preregistered; holdout solved game inputs unused.

## Fixed authentic original7x6 source

Anchor c7 contains P0 bottom/P1 top; c1,c2,c3,c5,c6 have opposite owner pairs, center c4 empty, five independent actual bottom-P0 bits `x1,x2,x3,x5,x6`. Each of all 32 choices is a genuine alternating, firstwinner-free rank12 game prefix. The next actual P0 action is center c4 row1. All firstwinner sinks must be removed; full-board draw does not arise at rank13.

Define `S=1-Win_P0(q,c4)` using true original69 K4 detection/Euler interval. Define:
- `g=(1-x1)*x2`: original P1 rising K4 `(c1,r1),(c2,r2),(c3,r3),(c4,r4)` is a grade2 residual that survives the P0 center **physical** placement when live.
- `D=x5*(1-x1)*(1-x2)*(1-x3)`: historical Player1 WSL **source** strict-dominance of rising M by horizontal singleton N at c4,r1 (see previous exact theorem). The D predicate does NOT survive as the same poststate residual after P0 fills center.

From the independently derived October middle-window Euler factorization:
```text
g*S=(1-x1)*x2*(1-x5*x6)*(1-x3*x5)
D*S=(1-x6)*x5*(1-x1)*(1-x2)*(1-x3)
```
The products must be interpreted in the Boolean owner coordinate ring `Q[x_i]/(x_i^2-x_i)`: formal unreduced polynomials can have degree6 because `x5^2` and are NOT the correct squarefree Fourier/Boolean degree. Under exact Boolean reduction the top squarefree monomial `x1*x2*x3*x5*x6` has coefficients respectively -1 for gS and +1 for DS.

**Predicted new exact cancellation:** `g*D=0` since g contains x2 and D contains 1-x2. Then `U=g*S+D*S` is a disjoint union indicator and has squarefree degree **at most four**, as its order-five coefficients cancel. On original five-switch EVEN/ODD 16-board fields:
- gS EVEN3 / ODD2 (existing October witness);
- DS EVEN0 / ODD1 (new September WSL source predicate);
- U EVEN3 / ODD3 (new cancellation).

## Independent recheck gates

1. Rebuild all69 original physical four-direction K4 cells and all32 original legal alternating firstwinnerfree histories; compare a separate ray winner on every action.
2. Reconstruct g by directly checking the *post-P0-center live* original P1 rising K4 grade2 residual, not merely substituting the formula.
3. Reconstruct D from P1 original diagonal+horizontal WSL strict-subset antichain domination at the SOURCE, not from a synthetic polynomial. Keep poststate D=0 distinct.
4. Verify full truth table for gS, DS, U, guards gD=0; compute EVEN/ODD masses separately.
5. Determine exact squarefree Boolean coefficients by an independent five-bit Möbius inversion. For each monomial subset S, `c_S=sum_{T subseteq S}(-1)^{|S|-|T|} f(1_T)`; report top coefficient and total degree, not unreduced real polynomial degree.
6. Report the question this does *not* answer: U cancellation on one guarded face is NOT a universal value formula, nor an actionwise closed module or P0-exists/P1-forall empty-root win proof. It is a new exact relation among two distinct original P1 residual observables sharing the same P0 firstwin absorber.

A negative result must preserve the exact first differing source board, K4 mask, parity bit or inclusion relation. No sub-five geometry or prior solved-game premises.
