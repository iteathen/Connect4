# Nonenumerative original 7x6 obligation field and guarded Isaacs winning certificate

**Date:** 2026-10-22 Pacific. **Research owner:** research/semantic-quotient. **Research direction:** Josh Oshiro. **Status:** exact symbolic residual-field construction and SUFFICIENT certificate theorem; construction of an actual root WIN certificate is OPEN. **Pre-write HEAD:** 77c721d54c2bbc87036f7e23b3490e3540aa0290. No solved game values, oracle results, nonlegal boards or dimensions below five are proof premises.

## 1. Method

The user correctly objected to attempting to PROVE original 7x6 perfect-play WDL by enumerating game states. Finite genuine-board experiments remain useful for falsifying candidate invariants, but should not substitute for a universal field identity. Compile an exact symbolic field of legal winning requirements, gravity actions and firstwinner absorption; then seek a compact inductive winning-potential function. A generic field that secretly encodes the full minimax solution is NOT acceptable as a non-search derivation.

## 2. Exact universal Boolean WSL source field

Use the original 42 physical sites S with three mutually exclusive site values EMPTY, P0 and P1. Let x_{p,s}(q) in {0,1} mean owner p occupies site s; let e_s(q)=1-x_{0,s}(q)-x_{1,s}(q). Work only with Boolean identities valid on mutually exclusive ternary sites.

Let L be the original set of 69 nonwrapped K4 windows: H24,V21,R12,F12. Let M be the distinct nonempty subsets of those windows, 625 residual masks in total. For a fixed p, line L and nonempty residual mask M subset L, define

\[
E_{p,L,M}(q)=\left(\prod_{s\in L\setminus M}x_{p,s}(q)\right)\left(\prod_{s\in M}e_s(q)\right).
\]

This is one precisely when the entire line L is p-owned except for exactly the still-empty cells M. Any opponent-owned site in L makes E zero automatically. Deduplicating different original K4s that supply the same residual mask is the exact Boolean field

\[
\boxed{u_{p,M}(q)=1-\prod_{L:\,M\subseteq L}(1-E_{p,L,M}(q)).}\tag{1}
\]

WSL strict-superset antichain normalization is another exact field operation:

\[
\boxed{a_{p,M}(q)=u_{p,M}(q)\prod_{N\in\mathcal M:\ \varnothing\ne N\subsetneq M}(1-u_{p,N}(q)).}\tag{2}
\]

Finally, one complete source requirement field is a 625-term symbolic generating polynomial

\[
\boxed{\mathcal W_p(q;z)=\sum_{M\in\mathcal M}a_{p,M}(q)\prod_{s\in M}z_s.}\tag{3}
\]

All three identities hold UNIFORMLY on every physically valid live ternary board assignment, not only sampled states. They follow directly from local cases of one K4 window: opponent-blocked, complete p-winning, or unblocked with one nonempty residual. The already-completed case is handled separately as a firstwin TERMINAL sink, not mistaken for a live residual.

The 625 residual masks have sizes 1:42, 2:282, 3:232, 4:69. The original 69 windows generate 1,035 labelled nonempty subsets before equality collapse, and 2,922 strict subset links on unique masks. Every mask has at most 14 nonempty strict subsets, because every source K4 has exactly four sites. This is a finite static geometry catalog, **not a game-state enumeration**.

Important two-gradings distinction: the z polynomial is at most degree4 in formal missing-site variables; its COEFFICIENTS as functions of actual owner x variables can have larger Fourier/multilinear degree due to the nonlinear products in (1)-(2). The independently checked 2026-10-22 WSL horizontal-singleton/diagonal witness, multiplied by firstwin survival, has physical primitive owner degree5. This is consistent, not contradictory.

## 3. Exact local Euler winning projector and action substitution

For any live legal gravity move by p in column c landing at the uniquely specified empty frontier site e=(c,h_c+1), only a K4 L containing e can complete as a NEW first win. Therefore

\[
\boxed{\operatorname{Win}_{p,c}(q)=
1-\prod_{L\ni e}\left(1-\prod_{s\in L\setminus\{e\}}x_{p,s}(q)\right).}\tag{4}
\]

This exact Boolean OR of all possible new line completions counts overlap correctly; the earlier directional Euler interval reduction can simplify it further without averaging or double-counting. Each original physical site belongs to at most 13 original K4s. A legal placement therefore changes at most 13 RAW original line residual sources and one column height. This is a **direct update bound only**: WSL subset normalization can change additional derived mask coefficients.

Let legal \(\ell_c=[h_c<6]\), terminal-full-after \(\delta_c=[\operatorname{rank}(q)+1=42]\), actual gravity+owner substitution \(T_{p,c}\), and live censor \(S_{p,c}=\ell_c(1-\operatorname{Win}_{p,c})(1-\delta_c)\). Define the individual action-indexed (NOT action-averaged) field pullback

\[
\boxed{K^L_{p,c}f(q)=S_{p,c}(q)\,f(T_{p,c}q).}\tag{5}
\]

Separate terminal emissions are: player p firstwinner \(\ell_c\operatorname{Win}_{p,c}\), and fullboard nonwinner DRAW \(\ell_c(1-\operatorname{Win}_{p,c})\delta_c\). No source feature may be mistaken for its surviving postaction image; in particular the previous WSL dominated P1 diagonal source event gets blocked by actual P0 center.

## 4. Exact EXISTENTIAL/UNIVERSAL root-winning field certificate

A potential that merely counts chances of winning or sums lines cannot prove adversarial perfect-play value. Instead seek compact Boolean indicators \(C_0(q),C_1(q)\) for nonterminal P0-turn and P1-turn guarded regions, **constructed independently from physical owner, residual obligation, gravity/tempo and causal defense constraints**, satisfying \(C_0(\mathrm{empty})=1\) and these algebraic implications.

For each live P0-turn q:

\[
\boxed{C_0(q)\ \le\
1-\prod_{c=1}^7\left(
1-\ell_c\left[
\operatorname{Win}_{0,c}+(1-\operatorname{Win}_{0,c})(1-\delta_c)C_1(T_{0,c}q)
\right]\right).}\tag{6a}
\]

For each live P1-turn q:

\[
\boxed{C_1(q)\ \le\
\prod_{c=1}^7\left(
1-\ell_c+\ell_c(1-\operatorname{Win}_{1,c})(1-\delta_c)C_0(T_{1,c}q)
\right).}\tag{6b}
\]

These use the exact Boolean OR product (P0 exists a good action) and AND product (every actual legal P1 action is harmless and preserves the region). Illegal columns do not participate. Player 0 winning transitions are accepted immediately. Player 1 winning transitions and any fullboard draw are rejected. Both alternate-ownership types and the strict firstwinning stop matter.

**Conditional exact theorem:** If compact source-derived \(C_0,C_1\) are exhibited and (6a),(6b) are proved as symbolic identities/inequalities on all relevant original7x6 legal live boards (without using a solved-game oracle), then P0 can force a win from the empty board. Proof: choose a P0 successor guaranteed by (6a); every P1 reply preserves (6b), and each genuine move increments rank strictly, bounded by42. Since the invariant rules out opponent wins and draws, play must terminate with P0 firstwin. The proof quantifies over whole state FAMILIES, not a list of positions.

**Crucial admission:** This proves only that a suitably discovered field WOULD establish empty-root WIN; such compact C_0,C_1 have NOT been derived. Setting C to the unknown exact game winner predicate would be disguised minimax/search and is disallowed as an explanatory construction. The unconstructed closed-field certificate is the real target, not these tautologically necessary game quantifiers.

## 4A. Advancement: exact full-field Shannon cofactor, static first Fourier coefficients and a single quantified fork contraction

The previous source-field definition (1)–(3) has a stronger exact operator form: the COMPLETE normalized 625-mask WSL antichain is equivalent to `Phi_p(q,z)=OR_{M in A_p(q)} AND_{s in M}z_s`. For any actual firstwinnerfree legal gravity landing e by p, `Phi_p' = Phi_p|z_e=1`, `Phi_opp'=Phi_opp|z_e=0`. The action only needs the old MINIMAL antichains, not 1,035 explicit line/subset witnesses: the own deletion map commutes with subset MIN and opponent removal of all e-requiring masks cannot resurrect a dominated e-free mask. This is a uniform proof recovering the historically qualified q_o/RBA cofactor. The dual static blocker is `Psi_p(w)=1-Phi_p(1-w)`; it needs a CAUSAL defender response extension before its values can certify real defense. The exact Boolean site pivotal factor is `Delta_ePhi=P_e*(1-Q_e)`, where Q is the already-available bypass.

In the corresponding **static no-gravity original69 K4 Boolean** whole-site field at EMPTY, width3 column-tensor contraction computes `Z_noK4=439428365759` complete 42-site hypothetical binary subsets and the exact first uniform Fourier coefficient at each physical site `-I_e/2^42`, where `I_e=Z-2*N1(e)`. The maximum static pivotality is `149598088717` at c4r3 and c4r4. The exact forward/backward JS field was corroborated by an independent C++ original69 explicit-window elimination and four pinned-site marginals. It does NOT compute game WDL or a move-value field.

One genuine restricted P1-ALL binder **does** contract without any strategic reply enumeration: if a LIVE P1-turn q has no immediate P1 winner and P0 has two distinct legally playable singleton winner cells, the all-replies condition is exactly the symmetric degree-two OR `OR_{c<d}t0c*t0d`. This is the already-known sound CPC double-threat/fork theorem, as a whole-family exact field certificate, not a general opening proof. Source and complete guards: `docs/research/2026-10-22-original7x6-Shannon-field-Fourier-pivotality-and-robust-fork-certificate.md`; checked original7x6 JS/C++ evidence and machine packets in `research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/`. The compact C0(empty)=1/C1 universal closure from the earlier equations remains OPEN.

## 5. Concrete research program replacing enumeration

1. Freeze a small symbolic cluster basis of original connected K4×K4 WSL strict-domination events, their firstwinner survivor products and owner/column support times. Include the demonstrated C6 signed exchange and fifth-owner-bit defects. Do not start with a fixed finite physical Fourier degree; its sufficiency was already refuted.
2. Derive symbolic update identities under all seven labelled \(\ell_c, K^L_{p,c}\) and separately P0-OR/P1-AND. Factor products using physical shared-cell Boolean identities, gravity, interval Euler inclusion/exclusion and antichain subset Möbius normal forms. Test closure by checking identities, NOT by generating every reachable board.
3. Seek a compact algebraically describable P0-controlled sublevel/superlevel region \(C_0,C_1\) in that basis and a source-derived proof of (6). All defender branches are handled by the one symbolic AND product, not a manually traced obligation chain.
4. Keep finite exact board witnesses solely as NEGATIVE CONTROLS for candidate field closure, with explicit original 7x6 geometry. A failed polynomial simplification is not proof that no compact alternative exists.
5. Halt and report if the cluster basis grows without a proven structural contraction bound. A factored symbolic formula alone may still hide exponential complexity. No assertion that an efficient full-WDL algorithm exists is made.

This note is **a structural research proposal and exact finite-site field derivation**, not a new demonstration of actual P0-winning control. No CI / independent proof-assistant qualification of a game-value certificate has been performed; existing C4-R0076 / QU-GAME-02 remains OPEN.
