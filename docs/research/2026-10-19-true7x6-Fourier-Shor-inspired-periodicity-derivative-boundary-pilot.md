# Original 7x6 K4 — Fourier calculus, quantum period-finding, and gravity-boundary operator pilot

**Date:** 2026-10-19. **Owner scope LOCK:** standard original gravity Connect4 W=7, H=6, K=4, 42 cells, 69 K4 geometric lines, two-player alternating ownership and original first-win stopping. NO alternative board dimensions, non-K4 controls, artificially smaller Connect games, source strategic future game-value search, quantum circuit speedup assumption, or production solver modifications. Research branch: \`research/semantic-quotient\`; qualified IsoGraph gameplay1.2 remains unchanged. **Status:** derived symbolic Fourier identities plus exploratory PREVALIDATION spectrum indicators, with independent exact falsification still required.

## 1. Correct quantum-inspired distinctions

Shor's quantum Fourier transform exploits a group-theoretic PERIOD/HIDDEN SUBGROUP of a suitable function, such as modular exponentiation; it is NOT itself a partial differential equation algorithm. Classical Fourier/Walsh transforms are exact algebraic changes of basis for functions on finite groups; simulating a generic quantum QFT classically does NOT grant Shor's algorithm's quantum period-finding speedup. However this mathematical apparatus can expose degree, derivative, alias symmetry, and rank/coupling information that ordinary CPC GF(2) parity does not.

Prior foundational references:
- Richard Jozsa, *Quantum Algorithms and the Fourier Transform* (1997), https://arxiv.org/abs/quant-ph/9707033.
- Ryan O'Donnell, *Analysis of Boolean Functions* (2021), https://arxiv.org/abs/2105.10386.
- Martin Roetteler, *Quantum algorithms to solve the hidden shift problem for quadratics and for functions of large Gowers norm* (2009), https://arxiv.org/abs/0911.4724.

Do not conflate: \`no extra unconditional linear stabilizer on all 42 full hypothetical gravity shuffles\` (earlier proved) with \`no nonlinear Fourier information\` or \`no adaptive strategy-conditioned invariant\`. Both latter possibilities remain open.

## 2. Exact Fourier of TRUE physical column-height raising: cyclic diagonal + boundary rank one

Each of the SEVEN ORIGINAL columns has true physical filled height \`h_c ∈ {0,1,2,3,4,5,6}\`; the local height register is a **7-dimensional level system**, not a 6-bit toy. Let basis \`|h>\`, h=0,...,6. The nonunitary (partial) physical raise operator is

    S = SUM_(h=0..5) |h+1><h|,
    S|6> = 0.

Let \`C=\sum_{h=0}^6 |(h+1) mod7><h|\` be the INVALID cyclic wrap extension, and \`B=|0><6|\`. Then

    S = C - B,    S^7=0,    C^7=I,    rank(B)=1.

Thus the true gravity height raise is NILPOTENT and has no cyclic Shor-style height-translation period. But its loss of cyclicity is exactly a **rank-one boundary defect**.

Define \`ω=e^{2πi/7}\`, and \`F_7|h>=7^{-1/2}\sum_{k=0}^6 ω^{kh}|k>\`. The valid transformed operator satisfies

    [F_7 S F_7†]_(k,l)
       = δ_(k,l) ω^k  - (1/7) ω^l.

A bulk cyclic translation is diagonal in the Fourier basis, while the REAL original full-column boundary introduces a dense-looking BUT rank-one correction. The seven-column physical height-only space is dimension \`7^7=823543\` and its truncated raises are tensor-local. However source q also tracks which PLAYER owns stones and original R0/R1; HEIGHT-ONLY operators commuting do NOT imply gameplay operators commute. In particular q cofactors with P0/P1 owner assignments are noncommutative under exchanging move order, even when final heights coincide. Quantum height phases alone are not a game-WDL classifier.

**Falsification:** independently construct the exact 7x7 matrices S,C,B and F7, confirm all 49 Fourier entry identities within numerical tolerance and confirm S^7=0/C^7=I/B rank1 by integer matrix algebra. These are local seven-height levels INSIDE true 7x6, not a different board dimension.

## 3. Exact Boolean/Walsh finite difference for source nonlinear K4 restrictions

For variables \`x∈GF(2)^n\`, let \`χ_S(x)=(-1)^{∑_(j∈S)x_j}\`; any Boolean function f admits exact Fourier coefficients

    hat f(S) = 2^{-n} SUM_x f(x) χ_S(x).

Its bit-flip finite difference is

    f(x XOR e_j)-f(x) = -2 SUM_(S containing j) hat f(S) χ_S(x).

Thus Boolean *discrete differential calculus* becomes a spectral multiplier: no approximate derivative or ordinary PDE is required. The spectral influence / derivative energy can be measured exactly using integer Walsh numerators.

For an ORIGINAL 7x6 K4 q winning-generator Boolean expression, taking a source original action cofactor that fixes a future ownership variable \`z_x=±1\` is a Fourier restriction:

    f|_(z_x=s)  has coefficients  hat f(S) + s hat f(S U {x})
    on Fourier sets S not containing x.

This describes the already accepted original source generator \`contract own variable/delete opponent-invalid generator\` in operator notation. It is an EXACT SOURCE REWRITE, not a new action-value theorem.

**Two-placement order exchange, EXACT higher-order cancellation:** Fix two different currently playable original physical landing sites x,y and one supplied arbitrary multilinear Fourier function f of the FULL future owner signs. Write

    f = A + B z_x + C z_y + D z_x z_y,

where A,B,C,D may be any functions of all OTHER owner signs, of ANY nonlinear degree. If the first mover is P1 and second P0, two original alternative orders create owner signs (-,+) and (+,-). Their source restriction difference is

    f(-,+)-f(+,-) = 2(C-B).

The mixed D term **CANCELS IDENTICALLY**. Equivalently only Fourier subsets having EXACTLY ONE of {x,y} contribute to that source exchange difference. This is the harmonic-analysis version of our prior original q raw-generator ODD-INCIDENCE exchange obstruction. Do not interpret \`f\` as actual perfect-play WDL unless a game-theoretic theorem establishes such identification; a static winning-line Boolean payoff is not a complete adaptive strategy operator.

**Falsification:** independently regenerate all 69 original physical lines at actual canonical \`44444\`; test the order swap of all 21 unordered pairs of the seven LEGAL literal first columns, under strict original first-win nonterminal guards for source q cofactor checks. For supplied future sign assignments, verify the Fourier exchange identity and original source raw-generator odd-incidence condition. No minimax or future game WDL inputs.

## 4. Exact spectrum of the 12 residual signed P1 cubics (gauge conditional, NOT strategic)

Use the previously source-frozen genuine original \`44444\` q and 18 hypothetical vertically split outer-column pairs + a 21/21 owner quota fixing center top P1. Original P1 R1 had 42 minimal requirements; 18 are pair-orthogonal, 12 are signed-Pauli-matched causal predecessor vetoes, leaving exactly **12** signed cubic requirements over n=18 representative lower owner bits.

Define the STATIC Boolean function \`f_12(x)\` equal to OR of these 12 remaining signed cubic clauses, x∈GF(2)^18. This is a conditional complete-coloring *potential P1 residual completion* indicator, NOT P1 first WIN or a strategy value. Compute its entire 2^18-entry truth table and exact INTEGER unnormalized Walsh spectrum

    W(S) = SUM_x f_12(x) χ_S(x).

The particular source-frozen 12 clauses have preliminary exploratory Walsh evidence (MUST independently reproduce before relying on numbers):
- source truth f_12=1 on 169404/262144 conditional assignments;
- exactly 102400/262144 Walsh coefficients nonzero;
- nonzero maximum Fourier degree 16, with nonzero degree-one coefficients at ALL 18 coordinates;
- nonconstant Fourier L2 energy mainly low degree (preliminary >80% through degree3, ~99% through degree6), but a nonzero degree16 tail prohibits exact low-degree truncation;
- paired column-reflection symmetry of one-bit influences is suggested.

**Rigorous hidden-XOR-period criterion:** \`f(x XOR t)=f(x)\` for ALL x holds iff \`(-1)^{S·t}=1\` for every Fourier frequency S with W(S) nonzero. Since preliminarily ALL 18 SINGLETON Fourier coefficients are NONZERO, it would force t=0. If validated, \`f_12\` has **no nontrivial hidden translation subgroup of GF(2)^18**, so Simon/Shor-style hidden-XOR-period finding cannot compress THIS particular conditional 12-clause function. This does not exclude cyclic periods elsewhere, reflection symmetry (not a translation), approximate/spectral regularity, or an as-yet-unknown strategy-conditioned observable with a meaningful period.

**Independent validation requirements:** freeze PURE source exact 18-bit Walsh producer using existing 12 source signed cubic clauses; independently reconstruct the 12 owner-line meanings on original W7H6K4 physical cells and calculate direct bit-flip influences on all 2^18 static gauge assignments without importing source FFT. Independently verify selected transform coefficients directly by naive parity summation (all singleton frequencies and selected high-degree terms), full Walsh inversion/Parseval, degree histogram, total nonzero count, absence of any hidden XOR period using independent rank or the nonzero singleton coefficients. Preserve any nontrivial periodicity if found. Do NOT claim full 2^18 enumeration is game search: it enumerates one STATIC 18-variable Boolean gauge, not legal alternating move histories.

## 5. Honest expected outcome and next mathematical gate

Potential positive value: Fourier transforms could identify exact **finite-difference response-coupling patterns**, low spectral degree/concentration, sparse localized derivative generators, nonlinear obligations and reflection-transport structure. They could facilitate deriving a compact *online, observation-conditioned* Pauli/ZH defender invariant with physically enforced source cofactor guards.

Known limitations: the 7-level shift is NILPOTENT and has rank-one boundary; the canonical residual Boolean spectrum might be high degree/dense and have NO Shor-style hidden XOR period. Neither numerical low-degree truncation nor a Fourier-based static minimization can prove perfect-play WDL. Any proposed opponent-adaptive response law must preserve first-win termination and beat the strongest existing original q support-mirror/nonbijective source proofs on SAME original standard positions.

**Next theorem success criterion:** one genuine NEW source-only exact signed WDL/no-win or one-best-original-action certificate on ordinary original 7x6 q, with independent true-gravity first-win physical control. Otherwise preserve proven representation, Fourier negative results and INCOMPLETE.

**Engine optimization (secondary):** seven-dimensional per-column DFT and 18-bit Walsh are feasible research computations; full 42-cell quantum statevector (~64 TiB complex128) is not. No new admissible solver cutoff until strategy consequence is proved. No solver edits/qualified authority changes.
