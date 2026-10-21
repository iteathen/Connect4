# Global Connect4 state-space Fourier transfer and adversarial invariant: source-only research synthesis

Date: 2026-10-21. Canonical owner: iteathen/Connect4, branch research/semantic-quotient. Research direction: an independently derived, nonsearch mathematical proof of P0 winning the ORIGINAL 7x6 K4 game from EMPTY. Status: the global operator and a rigorous low-order Fourier nonclosure theorem are proved; the independent perfect-play root WIN is OPEN. Existing qualified IsoGraph1.2 and production solvers remain unchanged. Historical 28 strong terminal K4 labels and previously solved root game outcomes are held-out diagnostics and never used as mathematical proof premises.

## 1. Method correction: stop treating one defense chain as the research object

A collection of manually traced source-firstwinning chains, even when each is proved exactly, does not establish that the same result follows globally under all adaptive P1 defenses. The primary research object is now the entire physical legal-state population, simultaneously acted on by original four-directional H/V/R/F source geometry, gravity and owner turn parity. Tactical grade1/grade2 and 4-ply source results are legitimate LOCAL checks and absorbing-boundary lemmas, not a strategy for deriving root WDL by extending isolated lines to the end.

Use three distinct mathematical notions consistently:
  (A) an unweighted exact ALL-HISTORY counting field;
  (B) a policy-conditioned probability field under specified P0/P1 controls;
  (C) adversarial perfect-play winning, requiring P0 succeeds against every P1 strategy.
(A) does not establish (C), no matter how many histories terminate with P0 winning. A distribution over legal play is not automatically a Bayesian posterior without a policy prior, and a forward transfer analogy to a Schrödinger equation is an operator analogy, not literal quantum dynamics.

## 2. Full ORIGINAL physical state bundle and one-step transfer

At each of seven actual gravity columns, the contiguous occupied prefix may have height h=0..6 and one of 2^h binary owner strings. Hence the complete column-gravity-colored configuration bundle has cardinality

  (1+2+4+8+16+32+64)^7 = 127^7 = 532875860165503.

Most such configurations are not reachable by alternating firstwin-free actual play. No full enumeration of this bundle has been performed. One exact 49-bit encoding stores the seven column-local sentinel words (2^h plus P1-owner bits below height) in base128 digits. Since fewer than 2^49 codes are needed, encoded global keys can be represented losslessly in Python ints and JS safe integers.

Let Q_t be genuinely legal firstwin-free configurations reachable after t moves, and let Psi_t(q) be the nonnegative INTEGER total number of legal alternating firstwin-free ordered move histories ending in q. Initialize Psi_0(empty)=1. The exact source all-history forward transfer is

  Psi_(t+1)(q') = SUM_(q in Q_t, legal column c:
            append mover p=t mod2 at gravity frontier, no original firstwinner,
            resulting physical board=q') Psi_t(q).

Every true winner transition (completion of any ORIGINAL physical H/V/R/F four-cell K4) is sent to an absorbing P0 or P1 firstwinner channel; if the board becomes full with neither winner it goes to DRAW. One physical move may complete two original K4 windows simultaneously, but contributes only ONCE to its terminal history mass. A Boolean OR of original winning-window projectors, not an uncorrected sum of their intensities, is necessary.

For fixed policy kernels Pi0(c|q), Pi1(c|q), the same transfer can be weighted to form a forward probability distribution. Root P0 perfect-play WIN means there exists a valid P0 strategy that ensures P0 firstwinner against EVERY legal P1 strategy. Random or uniform history frequencies are not this adversarial guarantee.

## 3. Original Z3 ownership Fourier field and coupling to higher moments

Use original ternary site labels s_e in {0 EMPTY,1 P0,2 P1}; the same owner at a physical cell is shared by all four directional strand appearances. Let omega=exp(2pi*i/3). The entire owner Fourier characteristic field is

  M_t(k) = SUM_q Psi_t(q) omega^(SUM_e k_e s_e(q))
for physical charge k in Z3^42.

All Fourier characters constitute a lossless coordinate change of the complete occupancy function, but the dimension is enormous. The unsolved compression question is whether a restricted hierarchy of source-motivated correlations closes under BOTH allowed owner transformations, gravity, and the original firstwinner absorber while preserving enough information for adversarial winner certification.

The true Fourier transfer is not diagonal: the legal frontier indicator 1[h_c(q)=r] and the original firstwinning condition couple different charge sectors. Owner-specific original K4 line projectors have polynomial degree up to four on physical site occupancy; their Boolean union develops intersection terms when one move completes multiple lines. Four-direction correlations and gravity-support prerequisites matter. The formerly studied Z4 Fourier transform over support-debt grades is a different grading from the Z3 owner-state Fourier transform; do not conflate their scalar values.

Exact dual identity for any Fourier test observable f:
  <f, T_p Psi> = <L_p f, Psi>,
where L_p f(q) sums f(q after every legal nonwinning p move) and routes actual win contributions to absorbing channels. For a FIXED policy this is a linear Koopman/transfer dual; under worst-case opposing control the Bellman/quantifier action is nonlinear. An exact small invariant moment space must survive all action-indexed pullbacks (not merely a fixed uniform sum), or carry certified conservative bounds statewise.

## 4. Whole-field calculation through rank10

Two source-only implementations used all69 original physical H/V/rising/falling K4 windows and exact firstwinner stopping. A 49-bit JS field processor computes low-order Fourier characteristics and line-grade correlations through rank8; an independent Python producer extended original absorbing mass and cross-line coincidence through rank10. Distinct original physical colored live boards and total ordered surviving history masses:

  rank 0: 1 board, 1 history
  rank 1: 7 boards, 7 histories
  rank 2: 49 boards, 49 histories
  rank 3: 238 boards, 343 histories
  rank 4: 1120 boards, 2401 histories
  rank 5: 4263 boards, 16807 histories
  rank 6: 16422 boards, 117649 histories
  rank 7: 54131 boards, 810504 histories
  rank 8: 182383 boards, 5628804 histories
  rank 9: 538774 boards, 38307690 histories
  rank10: 1618398 boards, 263770588 histories.

The first 0..6 ranks have exactly 7^t history weight since no original player has four owned stones and no column can be overfilled before its seventh placement. Distinct move orders can lead to identical physical colored boards and are automatically merged (already rank3 has 238 boards versus343 paths).

Firstwinning physical absorbing history mass by ply:
  P0 move7: 13032, P1 move8: 44430,
  P0 move9: 1086882, P1 move10: 4261058.
At ply9 there are 77112 weighted terminal histories where one P0 move completes TWO distinct original K4 windows; at ply10 P1 has 147816 such histories. No cross-orientation double win was found through move10; all double overlaps there are same-orientation windows. The source winner flux counts EACH of those terminal histories once, whereas a sum of original winning line incidences counts each twice.

At rank7 (P1 to move8) the actual all-history P1 original single-missing line intensity is 45194, but only 44430 weighted original firstwinners are immediately playable; 764 weighted one-missing line requirements are LATENT behind real gravity supports (H540, rising112, falling112; V0). This is an exact early collective distinction between winning-line intensity, playable site support and absorbing firstwinner flux. It is not a perfect-play WDL probability.

The early field symmetry matches reflection of full original columns, and original physical Z3 one- and two-site owner Fourier moments were independently calculated across all reached states (not just selected principal variations).

## 5. Exact counterexample: all first/second owner Fourier moments are insufficient

A rigorous negative result was preregistered and independently checked. At rank8, construct EIGHT physically legal firstwin-free original boards with fixed column heights [2,2,2,0,0,0,2]. Column7 has bottom owner P0 and top owner P1. In each of columns1,2,3 a binary phase bit chooses [P1,P0] or [P0,P1], and each board admits an alternating firstwin-free 8-move history.

Even three-bit parity ensemble, 4 equally weighted boards: 000,011,101,110.
Odd parity ensemble, 4 equally weighted boards: 001,010,100,111.

The COMPLETE ternary EMPTY/P0/P1 marginal histograms match between these two fields for each of 42 actual physical sites AND for all 861 unordered physical pairs of sites. By exact inverse Fourier transform, every owner Z3 Fourier character with support size <=2 has exactly the same moment under these two fields.

Yet next-move source P0 firstwinner flux at rank9 is 0 from the even parity field and 1 from the odd parity field. Only odd has a state with P0 already owning bottom columns1,2,3; P0 taking currently playable column4 bottom completes the original H K4. The three-body owner correlation distinguishes the ensembles. Therefore a field truncated to all degree<=2 physical owner Fourier modes CANNOT close exactly under the original FIRSTWIN absorbing transfer, even when all states are physically legal and have identical column heights. At least some higher-order original occupancy correlations are mathematically required; this does not assert that degree3 suffices over the whole game.

This is an operator-level NONCLOSURE theorem, not a selected move-sequence argument. It precludes interpreting scalar or pairwise interference patterns as a complete exact root-game evaluator without additional structural information.

## Addendum: third-order owner Fourier hierarchy also fails under K4 overlap

An independent frozen WHOLE-STATE field test gives a strictly stronger exact Fourier nonclosure result than the rank8 two-field degree2 counterexample. At rank10, EVEN and ODD parity ensembles each contain eight genuine original firstwin-free7x6 boards, with independent bottom/top owner switch bits in columns1,2,3,5 plus fixed c7 [P0,P1]. Every source board has heights [2,2,2,0,2,0,2] and a legal ten-ply history. ALL true physical joint owner distributions for every subset of at most THREE cells agree between the ensembles (1 empty subset +42 singles +861 pairs +11480 triples =12384 exact subset tests), hence so do all original site Z3 Fourier characters of support<=3.

P0 move11 in physical column4 can complete two original horizontal K4s, A=b1*b2*b3 and B=b2*b3*b5. The TRUE absorbing event is A OR B=A+B-b1*b2*b3*b5, so a FOUR-site overlap owner correlation is required. EVEN parity has ONE original P0 physical winning move (b1111, completing both K4 lines); ODD parity has TWO winning moves on separate boards (b0111 and b1110, each completing one line). Both ensembles have the same RAW line incidence count2, but the physical original firstwinner transition flux is1 versus2. No other P0 legal move in these boards firstwins. Thus **the complete Fourier hierarchy of OWNER degree<=3 is NOT closed for exact source winning transfer**; degree4 correlators distinguish this example but are not proved sufficient in general.

Verified mathematical report: docs/research/2026-10-21-global-Z3-physical-owner-degree3-Fourier-nonclosure-from-overlapping-K4-firstwins.md. True original K4 checker and JSON evidence under research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/. Local independent 16-history/12384-marginal/true-win-flux checks PASS; checked-in exact runner/maintained CI and third-party formal verification remain outstanding. No historical strong28/root solver premise.

## 6. Required adversarial source-invariant theorem

A rigorous independent P0 winning proof may take the form of a compact, original-geometry-specified controlled-invariant region or symbolic cone C over ACTUAL game-state fields, with all four-direction original K4 owner correlations and gravity support. Required sound conditions:
  - the empty board is in C;
  - C excludes P1 firstwinning and DRAW terminal outcomes;
  - at a P0-to-move state in C, P0 has some legal action remaining inside C or already firstwinning;
  - at a P1-to-move state in C, EVERY legal P1 action stays in C, unless a prior original P0 firstwin already ended the game;
  - no false 'unknown terminal' state is admitted, and firstwinner absorption and finite <=42-move game length are enforced.

If such a source-defined C is proved closed, any adaptive P1 play is unable to escape, and finiteness forces P0 firstwinner. But DEFINING C merely as 'the states that minimax says are winning' or computing it by exhaustively propagating OR/AND game values is NOT a nonsearch theorem. The current research task is to DISCOVER a small computable cone/invariant from original H/V/R/F overlap, owner cofactor grade hierarchy, gravity support causality and true enemy counterwin priority, and PROVE its controlled closure globally, not check isolated trajectories.

A stronger moment framework may need tensor networks/transfer matrices, source K4 hypergraph cluster intersections, character ideals, symmetry-covariant owner Fourier mode modules, and proof-carrying abstract interpretation. Necessary tests are statewise adversarial (every P1 action), not merely expected terminal flux or typical random policies. Exact global field counterexamples must force representation refinement, rather than papering over closure failure with selected game-line repairs.

Immediate research continuation: perform a degree/cluster-order hierarchy study of original site-owner Fourier observables under action-indexed transfer and actual WIN absorber; compute a source-generated mode closure or rigorous bound, with exact positivity and adversarial universal-action guards. Do not return to iterative local tactical cases as PRIMARY method. Tactical source mate3/mate4 results are held-back boundary controls.

## 7. Durable artifacts and qualification

Frozen research pivot: docs/research/2026-10-21-frozen-global-gravity-state-space-Z3-Fourier-transfer-and-robust-field-certificate.md.
Global field JS source: research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-global-original7x6-early-rank-absorbing-Z3-Fourier-field.mjs.
Independent global field Python: research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-global-original7x6-oriented-absorbing-history-field-through10.py.
Global field evidence: research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/ORIGINAL7X6_FULL_FIELD_RANK0_10_FIRSTWIN_FLUX_OVERLAP_Z3_GRADIENT_MOMENTS_0_1.json.
Preregistered Fourier nonclosure: docs/research/2026-10-21-frozen-global-Z3-Fourier-moment-degree2-nonclosure-under-original-firstwinner-operator.md.
Exact eight-board source nonclosure: research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-two-legal-ensembles-pairwise-Z3-identical-different-P0-winning-flux.py.
Nonclosure packet: research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/ORIGINAL7X6_GLOBAL_Z3_ONE_TWO_SITE_EQUAL_PARITY_FIELDS_DIFFERENT_WIN_FLUX_0_1.json.

This research was independently crosschecked in the current session: reimplemented all original69 K4 physical windows, replayed eight truly gravity-legal/firstwin-free 8-ply boards, verified 42 singleton and861 joint pair owner marginal equalities and next P0 firstwinner flux 0-versus1, and independently reconstructed the exact all-history rank0..8 board/population counts and P0/P1 firstwinner flux 13032/44430. No discrepancies. Previously recorded rank9/10 results have saved evidence and reproducible source, but their exact checked-in bytes have not been rerun in this session. Maintained Node26 CI/external formal assistant NOT run; qualified IsoGraph1.2/production solvers unchanged. Original independent root 7x6 P0 forced WIN remains OPEN.
