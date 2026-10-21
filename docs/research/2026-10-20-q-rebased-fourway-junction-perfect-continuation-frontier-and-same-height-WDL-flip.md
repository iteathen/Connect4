# Rebase the four-way interference frontier on the current q: exact owner-phase crossing changes perfect-continuation WDL

Date 2026-10-20 PDT. Research direction: Josh Oshiro. Canonical iteathen/Connect4 research/semantic-quotient. Scope: actual original 7x6 and6x6 K4, all four physical directional K4 junction copies, gravity, P0/P1 alternating, firstwinner-stopped. **Proved source-local rebasing and bounded exact q39 game-value controls; NOT a new empty-root perfect-play WDL oracle or a general nonrecursive game-state WDL algorithm.**

The owner corrected the task: the perfect-play interference frontier of an EMPTY original board is a result for PERFECT continuation from that root. Do not apply an unchanged empty-root Fourier owner/obligation field after unknown deviations in the actual game. Instead regenerate current q physical owner-conditioned four-way tensor phases, both owners' complete original K4 residual constraints, gravity frontier, and defender compatibility, then seek exact perfect-continuation value from q. The fixed geometry (source K4 line set, four-way junction alias topology and K4 line-syzygy basis) can be cached by board dimensions. The OWNER-CONDITIONED field and all response constraints must be rebased on q, even if another q has identical heights.

## 1. Exact q-conditional junction Fourier formula

Each true physical cell is ONE owner variable s∈{0 EMPTY,1 P0,2 P1}, copied across its H,V,rising,failing diagonal appearances. At a KNOWN current actual q, the normalized four-leg Z3 Fourier tensor is

  hatJ_(q,e)(k_H,k_V,k_R,k_F)=omega^[s_q(e)K]/9,
  omega=exp(2pi*i/3), K=(k_H+k_V+k_R+k_F) mod3.

Every one of its 81 frequency tuples has nonzero magnitude1/9, including for known EMPTY. The previous count27 surviving and54 canceled tuples instead applies to summing all three owner possibilities in the abstract unweighted COPY tensor. No contradiction: q-conditioned phases, not unchanged local spectral support, encode occupancy changes.

To represent one actual current-turn action without treating alternative columns as independently occupied, let a_c be a FORMAL one-hot selector for physical legal next-move column c. Enforce sum(a_c)=1 and a_c*a_d=0 for distinct legal moves; also each a_c in {0,1}. For every current physically playable EMPTY frontier site x_c=(c,h_c) and current mover p as ternary owner label p=1 for P0, p=2 for P1:

  hatJ_next,x_c(K;a_c)=[1+a_c*(omega^(pK)-1)]/9.

At already owned cells retain known-owner hatJ, and at still-unplayable EMPTY cells retain1/9. Selecting one legal a_c updates EXACTLY the one physical four-way owner variable and its four aliases. This is a correct local algebraic action interpolation; it does not assign probabilities or compute strategic WDL from a quantum spectrum. Any contraction with directional winning lines must preserve the global one-hot rule, physical column gravity, owner turn and firstwinning absorption.

## 2. Local Fourier owner projection enters the ORIGINAL directional K4 requirements

The exact P0 owner indicator on a site is a ternary Fourier inverse:

  n_0(s)=1[s=1]=[1+omega^(s-1)+omega^(2(s-1))]/3.

Similarly n_1(s)=1[s=2]. For every actual original K4 window L and a candidate last site x, the source original P0 cofactor is

  A_(0,L,x)(q)=1[q_x=EMPTY] * PRODUCT_(u in L minus x) n_0(s_q(u)).

This is 1 iff L is exactly a genuine P0 one-missing K4 at x, 0 otherwise, including exact cancellations when one four-way junction belongs to P1. The same formula holds for P1. Classify these by H,V,R,F direction and missing physical site x, and apply current gravity frontier F(q). Also retain two-missing K4 requirements to track earlier perfect-play transitions, rather than waiting for terminal one-missing lines.

At P1-to-move rank39 firstwin-free q, source physical playable P0 threats after actual P1 x are exactly:

  T_0(q+x) = (T_0(q) excluding x) UNION ({y directly above x} INTERSECT A_0(q)),

where A_0 includes LATENT one-missing sites and T_0=A_0∩F(q). No other P0 three-owned K4 target can appear merely from placing a P1 stone, because P0 occupancy did not increase. Reject any P1 immediately FIRSTwinning x before applying this P0 criterion.

The source LOCAL defensive-insolvency certificate I(q)=TRUE iff P1 has no immediately firstwinning landing and EVERY physically legal P1 x leaves nonempty T_0(q+x). This proves P0 can FIRSTWIN on its next ply against every legal P1 response. It is a q-specific one-round exact win certificate, not the whole earlier-rank nonbranching WDL problem.

## 3. Exact same-height early q source falsifier on BOTH 6x6 and7x6

Two original physically legal no-firstwin one-based histories:

  qA: 424
  qB: 442.

Both have physical column4 occupied height2, column2 height1, all other column heights0, P1 next, on both original 6x6 (54 actual K4 windows) and7x6 (69 K4 windows). Yet their ownership at the four-way crossing column4,row2 differs: in qA P0, in qB P1. Two physical cells in total differ in owner despite identical height vectors.

Original P0 two-missing live K4 requirements:
- qA: exactly one VERTICAL window column4 rows1..4, still needs (4,3),(4,4).
- qB: exactly TWO HORIZONTAL windows on original row1, with respective missing pairs (1,1),(3,1) and (3,1),(5,1).

The q-conditioned four-way Fourier coefficient at total charge K1 for crossing (4,2) changes from omega/9 to omega^2/9, and exact P0 K4 cofactor directions change even though physical junction topology, legal next columns and to-move player are identical.

This establishes state-dependent source necessity before perfect-play game values enter.

## 4. Stronger actual q39: SAME heights, distinct optimal-continuation signed WDL

Take one archived genuine ROOT-STRONG 7x6 firstwinner-free 39-move prefix, written here using one-based physical columns:

  qROOT = 444443333636613412225777255525666717751

It has original column heights [4,5,6,6,6,6,6]. P1 is to move on ply40. Reconstructing ALL 69 original K4 windows and all current physical owner indicators yields P0's one-missing K4 requirements:
- VERTICAL (1,2),(1,3),(1,4),(1,5), needs currently playable (1,5);
- HORIZONTAL (1,5),(2,5),(3,5),(4,5), needs same currently playable (1,5);
- FALLING diagonal (1,6),(2,5),(3,4),(4,3), needs currently LATENT (1,6).

There are exactly TWO P1 legal response columns, 1 and2. P1 playing column2 leaves P0's immediately winning target (1,5), completing V/H. P1 playing column1 blocks BOTH current V/H winning-line obligations in one stone, but physical gravity releases (1,6), where P0 immediately completes the latent falling diagonal. Thus ALL P1 defenses fail and source I(qROOT)=TRUE. Independent final-three-ply real firstwinner-stopped optimal verifier confirms perfect-continuation WDL from qROOT=P0 WIN.

Now swap the two consecutive opposite-player moves number9 and10 of this 39-move word, preserving every other played move:

  qREBASED = 444443336336613412225777255525666717751

The new 39-move word is also actual gravity legal and firstwin-free. It has EXACTLY the SAME [4,5,6,6,6,6,6] heights, P1 to move and available P1 columns1 and2. Only two physical ownership assignments differ: (3,4) changes P0→P1, (6,1) changes P1→P0 (one-based positions).

This is the crucial FOUR-WAY JUNCTION INTERFERENCE REBASE: the falling diagonal L from (1,6),(2,5),(3,4),(4,3) requires P0 at (3,4). Under qROOT its P0 owner projector is1; under qREBASED the exact ternary owner Fourier inverse at that shared four-direction crossing equals0, since site (3,4) now belongs to P1. Accordingly qREBASED retains both currently playable V/H P0 obligations at (1,5), but it LOSES the latent diagonal obligation at (1,6).

Now P1 plays current legal column1 and blocks both V/H P0 obligations; gravity still releases (1,6), but there is NO surviving P0 K4 requirement there. Source insolvency I(qREBASED)=FALSE. Independent real original final-three-ply perfect-continuation verifier shows qREBASED is DRAW: the P1 block in column1 ensures P0 cannot FIRSTWIN on41, and neither player completes a K4 on42. A P1 choice column2 instead permits P0 immediate41 win, so P1 chooses column1.

Thus two true original firstwin-free q states can have IDENTICAL HEIGHTS and SAME to-move player but DIFFERENT PERFECT-CONTINUATION WDL because their current FOUR-WAY OWNER LABELS change an orientation-specific K4 latent release:
  I(qROOT)=TRUE, V(qROOT)=P0 WIN;
  I(qREBASED)=FALSE, V(qREBASED)=DRAW.

The changed history is NOT asserted root-perfect: swapping P0 and P1 turn assignments is a separate physically legal history and may change both players' earlier strategy correctness. This is NOT a claim that a lone imperfect P1 move can defeat a still perfectly adapting P0 winning strategy from EMPTY. This is a proof that when the current board q has changed, the original precomputed perfect-root interference frontier cannot be imported without recomputing source owner fields.

## 5. Broader controlled same-height q39 experiment

Use the 28 archived historical strong firstwinner-line witness entries, containing27 distinct 41-move game histories. For EACH of their original genuine firstwin-free q39 prefixes, swap every pair of consecutive different-column opposite-owner moves in the first39 moves, keeping all other moves. Each swap leaves column heights unchanged; not every swap necessarily yields a legal firstwin-free history. An independent fresh physical K4/ray checker filtered validity, then a bounded at-most-three-ply exact firstwinner/alternating-turn verifier assessed PERFECT continuation from each new q39.

Exact counts:
- 533 candidate different-column adjacent cross-owner swaps;
- 285 still original gravity legal and firstwin-free 39-move states, all retaining original column heights;
- among 285 distinct new q39, conditional perfect-play values were175 P0 WINS,63 DRAWS,47 P1 WINS;
- 110 instances (63+47) lose the source P0 guaranteed WIN-by41 defensive-insolvency certificate inherited from their unmodified historical q39 parent.

All 27 unmodified historical q39 parents remained P0 wins and exact defensive-insolvent. This bounded case-control is ONLY a rebasing necessity check; the 285 altered histories are not assumed root-perfect and do not constitute a representative population of flawed players. The q39 values are independently evaluated because the physical board has only three empty spaces; full unrestricted nonrecursive q-WDL is not thereby proved.

## 6. Implications for the intended win/draw/loss interference determinator

For fixed W,H,K4 one may cache the original 69/54 K4 windows, true 4-way appearance incidence, ternary DFT basis and rational source syzygy space (31 on7x6,22 on6x6). But a proposed game-result certificate must be indexed to the actual board q:
  owner-conditioned ternary four-way junction phases,
  player-specific original H/V/R/F K4 residual windows of grade2 and grade1,
  current gravity frontier and all direct upper-site release obligations,
  to-move player and original firstwinner terminal guard.

There is no requirement to reconstruct how many earlier deviations occurred: ordinary nonterminal Connect4 is perfect-information and acyclic; the actual physical q plus current turn determines its legal future. Perfect play from q is a well-defined NEW problem. A proven empty-root P0 WIN against all P1 deviations continues to hold while P0 follows a valid winning strategy, but not necessarily on an arbitrarily changed q after P0 itself diverged; opponent P1 poor play also need not STRICTLY hasten terminal time.

This establishes a state-rebased computational contract and a concrete FOUR-WAY JUNCTION phase flip with changing q-local perfect continuation value. It does NOT prove the original EMPTY-root 7x6 forced P0 boundary or original6x6 forced P1 WIN from Fourier alone, nor a universal no-search value function. Source derivation of such a general adversarial constraint transition remains the research objective.

## Reproducibility and authority

FROZEN before experiment:
- docs/research/2026-10-20-frozen-q-relative-fourway-Fourier-perfect-play-frontier-rebase-and-same-heights-falsifier.md.

Reproducible Node source:
- research/isograph/discovery/2026-10-20-q-rebased-fourway/verify-q-rebased-fourway-frontier.mjs.

Evidence JSON:
- research/isograph/discovery/2026-10-20-q-rebased-fourway/CURRENT_Q_FOURWAY_PHASES_SAME_HEIGHT_Q39_WIN_VS_DRAW_285_STATE_CONTROLS_0_1.json.

Local independent JavaScript/connector V8 equivalent physical original K4 controls with literal replay, all legal 39-move histories, owner-specific grade2/1 obligation rebuilding, one-round defender insolvency and independent at-most-3-ply perfect continuation confirmed values. The committed standalone Node file has not independently been executed AS THOSE EXACT GITHUB BYTES under maintained Node26 CI; external formal proof assistant not run. Qualified IsoGraph game-theory authority1.2 and production solvers were not modified. Historic strong optimality source played words were only held-back q39 seed fixtures, not ingredients of q-dependent source field construction.
