# Rank as causal time: P1 compelled release, pair-defect Laplacian and exact nonunitary four-ribbon winning-threat transfer

**Date:** 2026-10-19. **Owner mathematical idea:** a Schrödinger-like rank/turn evolution of intertwined P0/P1 paired-response potentiality may expose how board geometry forces a second-player (repository P1) no-pass/zugzwang-like failure on the way to the 28 historical strong-optimal first-winning-line identities. **Owner:** `research/semantic-quotient`. **Status:** source-only deductive rank-step theorem and internally independently validated original-board data; no root-perfect no-search WDL, no proof of literal chess-style pass zugzwang, no production solver edit, and NO promotion of qualified gameplay IsoGraph 1.2. Historical 28 line labels enter ONLY as validation paths; none are used to define the source operator. Strict standard W=7 H=6 K=4.

## 1. The exact old phase algebra has a physical paired-response meaning

Original geometry: 42 true cells, 37 open directional strands, 168 appearances linked by equality at four-way original cells, 69 genuine four-cell K4 windows, alternating P0/P1 placement with gravity and FIRST WIN stopping. Original future capacity in column c is `t_c=6-h_c`. Split it:
```
t_c=2 j_c+u_c, u_c=t_c mod2∈{0,1}.
J=sum j_c, U=sum u_c, 42-rank=2J+U.
```
Since H6 is EVEN, `u_c=h_c mod2`. The physical unpaired vertical-site bit **IS** the previously derived CPC/pure-followup phase `phi`, not a new invented field. One actually legal move in column a causes exactly
```
u'=u XOR e_a,
J'=J-(1-u_a),
U'=U+1-2u_a.
```
The historical width-path GF2 Laplacian gives, for a genuine two-move fragment (a,b), with `d=delta u`,
```
d_(n+2)=d_n XOR delta(e_a+e_b)=d_n XOR L_E z_ab,
L_E=delta partial,
partial z_ab=e_a+e_b;
```
for a=b the displacement is zero. These are exact physics-of-gravity rank-step resource bookkeeping and previously qualified phase identities, NOT outcome equations.

At actual historical center prefix `44444` (n5), `(J,U)=(18,1)`. P1 sixth-move center consumption `444444` gives (18,0); any sixth-move off-center gives (17,2). The SAME rank6 has two distinct paired-resource topologies, and two-turn exchanges can end with same heights while player ownership/residual cofactor differ. This is the concrete lower-rank place to look for adaptive pair-phase disturbance; prior CPCX and source residual research already isolated the center-exhaustion handoff.

## 2. Exact source-only late-step theorem: P1 blocks one potential and RELEASES the next

For a true ORIGINAL first-win-free nonterminal q=(h,R0,R1) with P1 to move, define the PHYSICAL set `S0(q)` of future singleton P0 winning targets using ALL original 69 finite K4 windows. `S0` contains e precisely when some original surviving P0 K4 requirement has residual `{e}`: three original physical P0 cells, one empty e, no P1 stone. This is an actual four-body owner correlation, **not** one-body marginal probability. Let `F(h)` be the gravity-playable physical landing sites. Let `s0(q)∈{0,1}^42` indicate `S0(q)∩F(h)`.

For any legal P1 action in column a let
```
x=(a,h_a),    y=(a,h_a+1) if y exists,
sigma_a=s0(q)(x),
lambda_a=1[y∈S0(q)].
```
If this P1 action does NOT itself terminate as P1 win/draw, then exact P0 opponent-cofactor semantics leave all P0 singleton lines except any singleton x unchanged; gravity removes x from the legal frontier and exposes y. Therefore the following is a **direct exact theorem at every P1 turn**, not only rank39:
```
s0(q after P1 action a) = s0(q) - sigma_a e_x + lambda_a e_y.
```
The arrow is CONDITIONAL on physically legal/firstwin-nonterminal P1 action. P0's own following move does NOT obey this formula: P0 acquisition may create new P0 singleton targets from original two-cell residuals, and first-winning terminal must absorb before another turn.

For width-only seven-column immediate-threat field `sW_c=s0(c,h_c)`, P1 action updates precisely `sW'(a)=lambda_a`, with all other columns unchanged. Its ordinary complex DFT obeys
```
Delta F7(sW)(k) = (lambda_a-sigma_a)/sqrt(7)*exp(-2pi i k a/7).
```
This is a **rank-discrete driven equation** with one physical source/sink transition. It resembles a discrete-time open/non-Hermitian quantum walk, not closed unitary Schrödinger evolution. No amplitudes across alternative game histories are invented, and this Fourier change of basis DOES NOT compute opponent minimax values.

### Full four-ribbon exact source/sink equation

Build the ORIGINAL 37 finite open strands BEFORE P0/P1 source amplitudes: `M:Q^42→Q^168` duplicates every physical cell four times (same true identity) and `M^T M=4I_42`. Let `F_rib` be the block-normalized finite-strand DFT and `T=(1/2)F_rib M`, giving `T†T=I_42`. Define `Psi_n=T s0(q_n)`, `|x_F>=T e_x`, `|y_F>=T e_y`.

The exact ORIGINAL nonterminal P1 causal-rank equation is
```
Psi_(n+1) - Psi_n = -sigma_a |x_F> + lambda_a |y_F>.
```
Since `sigma_a=<x_F|Psi_n>`, equivalently
```
Psi_(n+1) = (I-|x_F><x_F|) Psi_n + lambda_a |y_F>.
```
This is an affine rank-one SINK plus physically observed upper-site SOURCE. It is **nonunitary**, action and source-line dependent; `lambda` needs the unplayed latent P0 singleton field, not just `Psi`. The source potential across all future cells is required for closure. Since x and y are distinct ORIGINAL cells,
```
||Psi_(n+1)-Psi_n||_2^2 = sigma_a + lambda_a.
```
This norm means Euclidean energy of **classical transformed indicators**, NOT probability of quantum measurement, not game value, and not an additional physical playable site.

### The crucial spectral blind spot

When P1 takes an already playable P0 singleton x and thereby releases another P0 singleton y IMMEDIATELY ABOVE x in the **same column**, `sigma=lambda=1`:
```
Delta F7(sW)(k) = 0 for all k=0..6,
||Delta Psi_four-ribbons||^2 = 2,
||Delta Psi_orientation||^2 = 1/2 each of H,V,R,F.
```
This is a **strict information loss** of the naive 7-column width-wave: the P0 winning opportunity is still present in the same column, but at a DIFFERENT physical row and often on a DIFFERENT directional K4 winning line. The correct four-ribbon field resolves the actual response displacement. The mode update carries a minus phase at x and plus phase at y, not an invented quantum interference between physically simultaneous occupancies.

## 3. A source-polynomial P1 compulsory-exposure certificate at rank39

For any genuine nonterminal ORIGINAL q at absolute rank39, P1 moves on move40 and P0 may move on move41; three unfilled cells remain. Let `a` range over **ALL actual currently legal P1 columns**, define:
```
v0_b = 1[(b,h_b)∈S0(q)],      u0_a=1[(a,h_a+1)∈S0(q)] (in bounds),
v1_a = 1[(a,h_a)∈S1(q)].
```
After nonwinning P1 a, P0's next-turn available immediate winning targets are exactly
```
B0(q,a)= ({(b,h_b): b legal, b!=a, v0_b=1})
         union ({(a,h_a+1)} if u0_a=1).
```
Thus Boolean arithmetic over CURRENT source h,R0,R1 proves the **necessary and sufficient** property "P0 immediately FIRST wins on move41 irrespective of P1's move40":
```
E_a(q) = (1-v1_a) * [1 - (1-u0_a) * PRODUCT_(b legal,b!=a)(1-v0_b)]
Z39(q) = PRODUCT_(a legal) E_a(q).
```
Here `Z39=1` means EVERY actual legal P1 action fails to win and exposes at least ONE immediate P0 win next; no strategically inequivalent FUTURE games were evaluated, only present original singleton sources and current legal action flags. P0's actual response can select any visible singleton after observing a. Conversely `Z39=0` refutes THIS two-ply universal immediate-winning property, not the general claim P0 may force a win later. This is a local original-source sufficient/necessary certificate, not full root WDL or Level3 remoteness. A counterfactual P1 PASS is illegal in Connect4; this is therefore **zugzwang-like compulsory exposure**, not independently proved strict chess-style zugzwang under passes.

## 4. Previously strong-solved 28 terminal-line witnesses: observed rank39 9+9+10 structure

Use LIVE historical [GitHub issue #41](https://github.com/iteathen/Connect4/issues/41) and its 28 independently score-checked full empty-root-to-move41 witness histories. The previously recorded 28 terminal line IDs are **NOT** an argument to any of the operators above, only associated with each validation record. They occupy **27 distinct physical history words** because two terminal line identities occur on the same game.

Independent ORIGINAL strict gravity/alternation/firstwin physical replay and **ALL 50 current P1 legal alternatives** at these rank39 witness states gave `Z39=1` for all 28 records. The physically independent last-placement local directional-ray checker matched source generation from all69 original K4 windows, including newly released targets. Exact decomposition by number of P0 currently PLAYABLE singleton sites BEFORE the compulsory P1 move:

| Archived witness records | At rank39 | Exact causal reason P1 cannot prevent P0 win next |
|---:|---|---|
| **9** | 0 immediately playable P0 win, only ONE legal P1 column with 3 remaining sites | P1 must occupy the lowest of the 3 cells; that releases an originally latent P0 winning singleton immediately above |
| **9** | 1 immediately playable P0 win, two legal P1 columns with 2+1 remaining sites | P1 choosing elsewhere leaves the current P0 win; blocking the current lower cell releases ANOTHER upper P0 singleton in same column |
| **10** | 2 already playable P0 wins | P1 can occupy at most one winning site, so another remains |

The 9 ONE-threat cases have prior winning cell physical row4 (zero-based), upper latent winning cell row5. All nine use an actual row4→row5 source/sink shift under the P1 blocking choice. The lower and upper missing-cell projectors frequently belong to **different orientation families** (falling diagonal→horizontal, vertical→horizontal, rising diagonal→horizontal), confirming the importance of shared four-way directional geometry.

At original rank39, `U=1,J=1` for **25** archived records, `U=3,J=0` for **3**. At rank40 the matched record totals have 15 `U=0,J=1` and 13 `U=2,J=0`, and all rank41 game records end with one unfilled physical cell (U=1,J=0) because first win stops P0 on move41. Neither U nor J is a stand-alone game-value invariant.

**Internal additional source controls:** Across 28 actual 41-step histories, an exact P1-action source singleton-update formula was independently compared to a separately written 4-direction ORIGINAL P0 immediate-win ray check on **2,973 one-step P1 alternatives** from **560 genuine first-win-free P1-to-move historical prefixes**; all matched, 0 source/physical defects, 0 finite width-7 DFT drive mismatches, 0 one-step physical pair-count mismatches. Those *alternative single moves* are NOT claimed full perfect-play paths after deviation. This is bounded original-physical correctness evidence only.

**Independent four-ribbon spectral controls:** rebuilt all37 finite strands, 168 appearances, 42 four-way cell aliases, all69 real K4 windows. On all **50 legal P1 rank39 replies**, checked 8,400 complex 168-mode source impulse entries with zero discrepancies, all 50 full-norm relations PASS. **Nine** lower-block/upper-release P1 alternatives have ALL seven WIDTH-Fourier mode differences zero yet EXACT full four-ribbon difference-norm²=2, exactly 1/2 in each of the four orientation families. Nine no-preexisting-threat forced-release replies have full norm²=1. These are independently verified numerical identities derived from exact source operators; a separate Python3 original-grid/ray checker reproduced all 50 rank39 reply results and 9/9/10 counts.

### Decisive negative control

The genuine legal firstwin-free rank39 prefix of full original 42-move DRAW
`123456123456654321654321123456123456777777`
has **the same (J,U)=(1,1)** as 25 historically strong-P0-win witness records, but `Z39=0`: no live P0 winning singleton or P1-forced release. Therefore the physical pair count, CPC phase and broad "all games reach zugzwang" interpretation are **falsified** without owner-sensitive winning-line correlations. The 9/9/10 classification is a property of THESE archived strong-optimal firstwinning-line witnesses, NOT an exhaustive census of all theoretically optimal rank39 histories.

Durable records:
- Frozen source/qualification protocol: `docs/research/2026-10-19-rank-causal-pair-defect-terminal-exposure-frozen-theorem.md`, `docs/research/2026-10-19-unfold-first-causal-rank-threshold-four-ribbon-spectral-shift-frozen.md`.
- Reproducible research Node source: `research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/standard7x6-rank-step-pair-exposure-independent.mjs` (committed, **not run in maintained Node26 CI**).
- Physical/perfect-play historical packet: `.../STANDARD7X6_RANK_CAUSAL_PAIR_RELEASE_28_WITNESSES_50_OPPONENT_RESPONSES_0_1.json`.
- Spectral packet: `.../STANDARD7X6_FOUR_RIBBON_RANK_STEP_NINE_HIDDEN_WIDTH_FOURIER_0_1.json`.
- Source 28 issue41 physical fixture `.../STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json`.
- Historical strong-optimal score claims remain [issue #41](https://github.com/iteathen/Connect4/issues/41), originally validated with 1,148 external strong-score checks and 504 separate endgame checks; **new work did not independently rerun strong scores or establish additional perfect histories**.

## 5. What a global rank/turn Schrödinger-style theorem would actually need

A mathematically honest model should use an exact finite **graded causal transfer**, with `n` move rank rather than real physical time. P1 opponent-blocker actions on singleton P0 potentials have the rank-one nonunitary `sink+upper-release` operator above. P0 owner actions, however, can CONTRACT a surviving two-cell P0 obligation into a new singleton; P1 can acquire a line of its own and FIRST-WIN before P0 can answer; columns exhaust; and P0/P1 actions do not commute even if the heights match after swapping move order.

One natural full-original-69-line formulation is to keep TWO distinct Boolean residual winning polynomials:
```
Phi_p(z)=OR_(G∈R_p) PRODUCT_(e∈G) z_e .
```
An actual mover p claims original physical landing x by `z_x=1` in `Phi_p` (OWN COFACTOR), while the opponent's `Phi_(1-p)` sets the SAME original variable `z_x=0` (BLOCK). These are the existing exact antichain cofactor semantics, now treated as a source transfer on the original four-ribbon owner-correlated algebra, with physical gravity guards and firstwin terminal sinks. Applying finite Walsh/Hadamard/Pauli or ribbon DFTs can expose useful low-rank kernels and higher-order interactions; it does **not** make the two-player minimax quantifiers disappear by change of basis alone.

The substantive next theorem is to find a SOURCE-DERIVED compact invariant family `I_n` and an observation-conditioned **paired response** relation with the correct P0/P1 roles such that, for every actually legal opponent action a, some certificate-derived one legal response b(a) preserves a favorable invariant or forces strictly ranked progress, with absolute first-win guards. Requiring an owner-licensed TWO-PLY source operator to close algebraically across ranks—rather than enumerating and valuing strategically inequivalent future histories—would be a genuine route toward a no-strategic-branching WDL/Level2 solution.

The historical 28 strong-terminal IDs and the newly verified 9/9/10 late-pressure structure should then be HELD OUT until the source rule is frozen. A successful formulation should *predict* what forced release and orientation changes make reachable terminal line identities possible, and ultimately derive their restricted 28-set if the strong distance-optimal selection and horizon can be proved without the existing solved opening book.

**Non-claims:** 28 does not become an input/source constant; rank39 pressure does not certify rank5 `44444` or root WDL; generic local pair depletion is not a whole-board losing strategy; no quantum advantage, physical Schr Hamiltonian, future hidden search, alternative board dimensions or solver modifications are claimed. The rigorous observed result is **rank-dependent compulsory exposure plus full four-ribbon spectral visibility that a simpler phase description loses**.
