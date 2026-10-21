# First-win absorption: historical 28 plus two reflected forbidden P1 K4 lines equals 30, not 31

Date: October 20, 2026 Pacific. Research direction: Josh Oshiro. Canonical Connect4 branch research/semantic-quotient. This is exact conditional original7x6 geometry based on previously strongly solved root premises; it is NOT a source-only perfect-play WDL theorem nor a new qualified IsoGraph authority.

## Hypothesis

The owner proposed that some prospective K4 winning-line identities beyond the historical 28 might be inaccessible only because perfect play already ends on move41, with a potentially meaningful relationship to the full original31 rational line-incidence syzygies.

This is partly confirmed: genuinely completable Player 2 lines are suppressed by firstwinner absorption. However the exact union of historical P0 firstwinning lines and all possible P1 line identities from the otherwise forbidden move42, conditioned on the historical center opening and move41 optimal horizon, is **30**, not31. The two added lines increase site-incidence rank rather than introducing additional syzygies.

## Original physical strict-firstwinner replay

Original 7x6 K4: 42 real gravity cells,69 four-in-a-row windows, P0 first. Historical issue41 gives 28 distinct geometric P0 firstwinning K4 line IDs under distance-sensitive strong optimal play, all firstwinning at absolute move41 after firstfive center moves.

Each genuine rank41 firstwinning board has exactly ONE unfilled top-row site x (physical row6 one-based). P1 would claim it on hypothetical move42 if play continued, but ordinary Connect4 stops when P0 won on41. Write W_p(L,q)=product of actual owner-p indicators for original four-cell K4 line L. For q41 with sole empty x and the counterfactual q42 with P1 taking x:

  W_0(L,q42) = W_0(L,q41)
  W_1(L,q42) - W_1(L,q41)
       = 1[x in L] * product_(e in L except x) n_1(e,q41).

Therefore only P1 may create NEW K4 completions on the hypothetical final move. P0's completed K4s persist, and any P0 three-owned one-missing K4 at x is blocked rather than won by P1.

Independent original-board directional-ray Python replay of the 28 historical archived witness entries found 27 unique real 41-move histories, all firstwin-free before41. Across those27:
- 39 P0 firstwinning K4 completion events representing the historical28 distinct original line IDs (some terminal drops complete multiple lines);
- seven histories in which the forbidden P1 move42 would produce a K4, nine new P1 K4 events and FIVE distinct geometric P1 line IDs;
- four of those five P1 line IDs are in the historical T28 set (although completed by P0 in other games), and one is outside;
- 11 histories with other P0 three-owned one-empty potential at x:18 events representing12 distinct T28 lines. P0 cannot play move42.

These seven and five are sample counts in the 27 selected archive histories, NOT frequencies/censuses over all root-strong histories.

## Exact historical strong root two-extra-line theorem

The firstfive center moves make P0 own original one-based middle-column cells (4,1),(4,3),(4,5). A P1 K4 that would complete with the forbidden last move42 necessarily contains a top-row physical cell and none of those permanent P0-owned initial cells. Filtering the independently regenerated original69 K4 windows gives exactly14 geometrically eligible P1 last-move42 windows. TWELVE are within T28; exactly TWO are outside:

  rising:  (3,3),(4,4),(5,5),(6,6);
  falling: (2,6),(3,5),(4,4),(5,3).

One archived genuine strong-optimal word for firstwinning line28:
  original columns zero-based 33333222225655000000513526446611411616444
ends on actual P0 firstwinner ply41 and leaves column6,row6 empty; its illegal P1 move42 would complete the rising extra line. Horizontal reflection of the ENTIRE word:
  33333444441011666666153140220055255050222
is another true gravity-legal, no-earlier-win41 history, and by the qualified horizontal game symmetry preserves perfect-play strong scoring. Its illegal P1 move42 at column2,row6 completes the falling extra line. Both exact physical replay controls pass.

Upper bound: at most two forbidden-postwinning line labels outside T28, due to firstfive center geometry.
Lower bound: both are actually reachable after genuine strongly optimal histories, by witness plus reflection.
Hence under historical strong-optimal premises:

  |T28 union forbidden_move42_P1_completed_K4_labels| = 30.

This is NOT a proof that all14 static P1 last-move candidates individually occur along strong optimal play.

## Precise source incidence comparison against full 31

Let B_S be the rational 42-site x |S|-line TRUE physical incidence matrix for a chosen original K4 line-label set S. Fresh independent exact SymPy rational calculations:

  S=T28:               |S|28, rank26, kernel2.
  S=T28+one extra:     |S|29, rank27, kernel2.
  S=T28+both extras:  |S|30, rank28, kernel2.
  S=ALL original69:    |S|69, rank38, kernel31.

The two forbidden extra diagonals each introduce one independent physical-incidence direction and ZERO new linear line-incidence syzygies. Both historical selected signed six-window syzygies remain precisely the two reflected three-edge four-step dipole triangles from the unrestricted source18-cycle geometry; the full31 original source dependencies split into18 dipole cycles and13 strand-base gluing dependencies.

Accounting for source versus restriction dimensions:
  original69 minus T28 =41 omitted line coordinates =12 omitted site-image directions +29 omitted syzygy dimensions.
  original69 minus T30 =39 omitted line coordinates =10 omitted site-image directions +29 omitted syzygy dimensions.

In particular, the full source31 syzygy space intersects the T28 coordinate subspace in dimension2, and intersects the larger T30 coordinate subspace in the SAME dimension2. The late two lines do not remove three formerly missed source dependency modes. Numerical subtraction 31−28=3 was comparing different mathematical kinds of object, not measuring forbidden K4 moves.

## Exact algebraic firstwin absorber DOES affect the interference charges

For a rational original K4 line incidence syzygy z satisfying Bz=0, define signed nonlinear owner-completion charge

  C_z(q) = sum_(original K4 lines L) z_L [W_0(L,q)-W_1(L,q)].

The exact hypothetical last P1 move changes it by

  C_z(q42)-C_z(q41) = -sum_(L newly P1-complete at42) z_L.

This is a real, physical-history-conditioned source charge impulse which the ACTUAL firstwinner rule suppresses entirely. At real q41, one cell is empty, so the previously derived full-binary-board pure-cubic Fourier owner charge requires a nonzero occupancy/vacancy boundary correction for many histories.

Among the 27 archived histories, four exhibit a nonzero charge impulse in the TWO historical terminal K4 syzygies. Two are genuine signed-charge cancellations:
- archived firstwinner label27: the selected falling syzygy charge at true stop41 is +1; the forbidden P1 completion of line13 would reduce it to0;
- archived firstwinner label34: the selected rising syzygy charge at true stop41 is -1; the forbidden P1 completions including line43 would raise it to0.
Two other histories create nonzero selected charge from previously zero. The three remaining P1 postwinning histories produce real suppressed K4 events invisible to these TWO selected charges. Therefore those two charges alone do not detect every firstwinner-suppressed event.

Writing owner P0/P1 K4 completion impulse I_(p,L)(t) as the t-to-(t-1) difference of W_(p,L), and A(t) as the indicator of NO preceding K4 by either player, the actual firstwinner event is A(t)I_(p,L)(t). The absorber is chronological and nonlinear in competing owners; it is NOT a linear deletion of three fixed dimensions from source ker B.

## Critical negative control: the apparent 31 -> 27 observer kernel is a historical sample artifact

Form one row R_q per root-strong q41 history, marking every P1 original K4 line newly completed by hypothetical move42. Restrict R to source rational original incidence kernel K=ker B, dim31. For any selected collection R, exact formula:
  rank(R|K)=rank([B;R])-rank(B).
Then dim(K intersect ker R)=31-rank(R|K).

Independent rational SymPy:
- 27 distinct archived witness histories: R rank4, R|K rank4, invisible source syzygies27.
- 50 distinct histories from the archive PLUS their actual strong-valid horizontal reflections: R rank7, R|K rank6, invisible source syzygies25.
- All14 distinct static upper-bound eligible P1 move42 candidate line-coordinate probes: R|K rank12, invisible source syzygies19.

Hence 31−4=27 on the particular archive is **not** a canonical 27 mode-space relation: symmetry-valid alternative witnesses change the rank immediately. None supplies universal 31−3=28. The exact source firstwin absorber exists, but an optimal-sector theorem is still needed to determine which event histories survive from empty.

## Scope, evidence, and next step

The archive's28 line IDs and27 chosen histories are not an exhaustive list of all actual game histories. The exact count30 is proved using accepted firstfive-center and move41 strong-optimal premises, static original geometry and horizontal reflection, not by assuming all archived witnesses exhaust histories.

Durable frozen hypotheses: docs/research/2026-10-20-frozen-strong28-firstwin-absorber-counterfactual42-vs-31-syzygies.md and docs/research/2026-10-20-frozen-strong28-plus-two-reflected-forbidden-P1-line30-vs-kernel31.md.
Machine evidence:
research/isograph/discovery/2026-10-20-interference-number-atlas/STRONG28_MOVE41_ABSORBED_P1_MOVE42_OBSERVATIONS_30_TOTAL_VS_31_SOURCE_KERNEL_0_1.json
and research/isograph/discovery/2026-10-20-interference-number-atlas/POSTWIN31_SYZYGY_OBSERVER_ARCHIVE27_REFLECTION25_STATIC19_RANK_NEGATIVE_0_1.json.
Committed standalone source reproducer: research/isograph/discovery/2026-10-20-interference-number-atlas/verify-strong28-firstwin-absorber-hypothetical-move42.mjs.

The independently written original physical Python direct-ray control and the exact SymPy rational matrix calculations ran successfully. The committed Node source file was not separately run under maintained Node26 CI. External proof assistant not run. Original qualified IsoGraph1.2/production solvers unchanged.

Next perfect-play-first problem: combine ALL original69 owner-specific K4 line projectors, full31 syzygy algebra, real gravity, and the chronological firstwin absorber to find a SOURCE-DERIVED invariant optimality-sector selector. The historical T28, two forbidden mirrored diagonals, and established independent root WDL outcomes remain validation fixtures, not source inputs. General imperfect-opponent play is deferred.
