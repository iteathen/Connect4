# Original7x6: exact Shannon-closed WSL field, global Fourier pivotality, and a nonenumerative P1-ALL fork certificate

**Date:** 2026-10-22 Pacific. **Canonical research owner:** iteathen/Connect4@research/semantic-quotient. **Research direction:** Josh Oshiro. **Pre-write HEAD:** 14ebfb50356a032313c49a85e803ac84e955ac66. **Status:** exact symbolic identities and scoped/static integer computation; root perfect-play WDL UNKNOWN by independent proof. Historical RBA cofactor and 1.2 qualified q_o semantics remain primary prior authority; no new IsoGraph claim is promoted.

## 1. Result in one sentence

The *entire* player-labelled original7x6 winning-obligation antichain is an exactly action-closed monotone Boolean function of 42 physical sites under **Shannon boundary evaluations**; a global Fourier first-derivative potential of its initial K4 source can be calculated by width3 tensor contraction without enumerating games, and one **guarded P1 universal-reply** subclass (playable double threats) admits an exact Boolean polynomial elimination. This does NOT produce the missing empty-root winning invariant.

The user's methodological distinction is preserved: testing a finite catalogue of local algebraic identities is allowed, but the target proof is a uniform field equation over whole legal state families, not one winning move sequence at a time.

## 2. The closed Boolean field: no per-window provenance needed for a legal cofactor

Let q be a LIVE original7x6 physical state with current support heights. For player p, let \(A_p(q)\) be the inclusion-minimal antichain of nonempty still-empty cell masks of opponent-unblocked original K4 windows (historical WSL-625). Define \(\mathbb B=\{0,1\}\) with Boolean OR/AND, and assign a *hypothetical future p-ownership variable* \(z_s\) to each physically real site.

\[
\boxed{\Phi_p(q;\mathbf z)=\bigvee_{M\in A_p(q)}\;\prod_{s\in M}z_s.}\tag{1}
\]

The original empty board has \(A_0=A_1=\mathcal L\), the same 69 physical K4 windows; hence \(\Phi_p(\varnothing;\mathbf z)=\bigvee_{L\in\mathcal L}\prod_{s\in L}z_s\). Each 625 possible residual-mask coordinate is attached to an actual subset of a physical original K4; only live antichain terms appear. This Boolean function is a source potential over *hypothetical* completions; it is not a probability or a game minimax value.

For an actual legal move by p at the uniquely gravity-playable empty site e, **up to firstwinner stopping**, the exact two-player residual-field update is

\[
\boxed{
\Phi_p(T_{p,e}q;\mathbf z)=\Phi_p(q;\mathbf z)\Big|_{z_e=1},
\qquad
\Phi_{1-p}(T_{p,e}q;\mathbf z)=\Phi_{1-p}(q;\mathbf z)\Big|_{z_e=0}.
}\tag{2}
\]

The right-hand cofactor representations can be normalized as:

\[
\boxed{
A'_p=\operatorname{Min}_{\subseteq}\{M\setminus\{e\}:M\in A_p(q)\},
\quad
A'_{1-p}=\{M\in A_{1-p}(q):e\notin M\}.
}\tag{3}
\]

**Proof, all legal states without enumerating positions.** For p, a surviving K4 missing-cell set M gains e and therefore becomes M\e when p claims e; otherwise M was unaffected. The deletion map \(d_e(M)=M\setminus\{e\}\) is monotone under inclusion. For EVERY finite family U, \(\min(d_e(U))=\min(d_e(\min(U)))\): every U element contains an old minimal U element, whose image remains contained in its image. For the opponent, every originally surviving requirement M with e∈M is blocked, while every M with e∉M is unchanged. Deleting all e-containing masks cannot expose a previously dominated e-free mask, since an e-containing proper subset of an e-free mask is impossible. Thus the second identity. This is not dependent on the particular 69 K4 line provenance or a listing of physical q. The empty mask from p's own cofactor represents TRUE (a just-completed K4) and enters the terminal P0/P1 firstwinner sink, not the live antichain.

**Connection to qualified RBA/q_o:** This is the explicit 42-site Boolean/Shannon representation of the existing qualified cofactor action on normalized residual antichains; it is **not** a new claim that the old full q_o carrier was previously action-inexact. Qualified q_o includes support and BOTH owner-labelled antichains. Source-only moment projections of this full field can still be action-inexact as witnessed by the October C6 obstruction. The new work gives an exact compact-form operator/calculus and its uniform proof boundary, not a novel semantic authority promotion.

**Flatness and its limit:** For distinct sites e,f, Shannon evaluations \(z_e\mapsto\epsilon,z_f\mapsto\delta\) commute. The raw residual completion field is a flat family of binary boundary cofactors. BUT alternating two-player moves cannot be swapped arbitrarily in time. Legal frontier selection, firstwinning absorption, player identity, draw terminal and the P0-EXISTS/P1-FORALL action binders are NOT consequences of this commuting site-assignment algebra. That is precisely where the game-theoretic obstruction lives.

## 3. Static blocker dual and a genuine local-to-global Boolean derivative

For a hypothetical static **blocking set** encoded by w_s, define the De Morgan dual

\[
\boxed{\Psi_p(q;\mathbf w)=1-\Phi_p(q;\mathbf 1-\mathbf w)
=\bigwedge_{M\in A_p(q)}\bigvee_{s\in M}w_s.}\tag{4}
\]

This is exactly the transversal condition "some blocked/claimed site intersects every p residual winning requirement." Under p's own claiming of e it changes by w_e=0 (that cell is no longer defender-available), and under an opponent's placement it changes by w_e=1. This duality is an exact Boolean identity for all source configurations; **the existence of a static hitting set does not give P1 the turns or chronology to realize it**. In particular \(\Psi_p\) is not a certified P1 forcing/drawing policy.

Split (1) at one site e:

\[
P_e(\mathbf z_{-e})=\bigvee_{M\in A_p:\ e\in M} \prod_{s\in M\setminus\{e\}}z_s,\qquad
Q_e(\mathbf z_{-e})=\bigvee_{M\in A_p:\ e\notin M}\prod_{s\in M}z_s.
\]

Thus \(\Phi_p=Q_e\lor(z_e\land P_e)\). Its exact Boolean Shannon difference is

\[
\boxed{\Delta_e\Phi_p=
\Phi_p|_{z_e=1}-\Phi_p|_{z_e=0}
=
P_e(\mathbf z_{-e})\,\bigl(1-Q_e(\mathbf z_{-e})\bigr).
}\tag{5}
\]

This is a concrete **Euler/Fourier-ready global potential**: the site is pivotal iff some winning requirement uses it *and no independent requirement already supplies a win without it*. The no-bypass factor couples independently sourced original windows; summing their individual intensities loses this interaction. The order of its squarefree owner-site expansion need NOT be at most K=4. This is an actual algebraic mechanism, consistent with the prior C6 and fifth-degree cross-window experiments.

On any LIVE board with an actually playable e, the immediate firstwinner flag is simply \(\operatorname{Win}_{p,e}(q)=\Phi_p(q;\mathbf1_{\{e\}})\). Only a singleton residual mask {e} can evaluate TRUE; no game-state enumeration is needed to derive this identity.

## 4. One exact adversarial quantifier elimination: robust fork field

Let q be a LIVE Player1-to-move original7x6 board. For each legal column c with playable landing e_c define \(t_{p,c}=\Phi_p(q;\mathbf1_{\{e_c\}})\). All t are **exact current immediately winning moves**, not predictions of likely opponent behavior. Define

\[
\boxed{
\operatorname{Fork}_0(q)=\bigvee_{\substack{c<d\\c,d\ \mathrm{legal}}}t_{0,c}t_{0,d},
\qquad
\operatorname{P1Threat}(q)=\bigvee_{c\ \mathrm{legal}}t_{1,c}.
}\tag{6}
\]

**Universal guarded theorem:** On this exact LIVE P1-turn domain, \(\operatorname{Fork}_0=1\) and \(\operatorname{P1Threat}=0\) imply Player0 **forces a firstwin on the immediately following P0 turn**. Proof: two P0 singleton win requirements are playable at distinct columns. A legal single P1 move can occupy at most one, never erase the three already-P0 support stones of the other, cannot itself firstwin by the second guard, and cannot cause a full-board draw while an unoccupied second playable completion remains. P0 plays the surviving completion and wins. This is a universal proof over a FIELD-DEFINED FAMILY of legal positions, not a case-by-case strategy enumeration. It recovers the known CPC double-threat/fork rule in the exact monotone-Boolean field language, without claiming it was historically undiscovered.

The universal reply quantifier in this short case **contracts algebraically**:

\[
\boxed{
\bigwedge_{d\ \mathrm{legal}}\left(\bigvee_{\substack{c\ \mathrm{legal}\\c\ne d}}t_{0,c}\right)
=
\bigvee_{\substack{c<d\\c,d\ \mathrm{legal}}}t_{0,c}t_{0,d}.
}\tag{7}
\]

Both sides are TRUE precisely if at least two legal frontier threat bits equal1. This identity was checked on ALL 2,186 admissible (nonempty legal-column-set, contained threat-set) bit pairs, never enumerating game positions.

**A concrete actual original-board realization, not the proof premise:** The alternating genuine firstwinner-free move word \(2,7,3,7,4,6,2\) leaves Player1 to move with P0 bottom row1 at columns2,3,4. P0 has distinct immediately playable firstwins c1 and c5, while P1 has no immediate win. Both physical ray and 69-window checks verified the source word firstwinner-free. The theorem above proves the outcome against EVERY Player1 continuation without evaluating their seven successors. This witness merely demonstrates that the certified field family is nonempty; it does not establish that P0 can force this family from empty.

The corresponding short P0-turn precursor class is every live q with some legal c such that P0 wins on c immediately or the **actual live** P0 successor satisfies (6) with P1 next. This is a sound ≤two-P0-move subset of true WIN, NOT a general empty-root invariant. Iterating it blindly would repackage minimax and is not the requested mathematical breakthrough.

## 5. Exact full original 7x6 source Fourier potential from width-three field contraction

Evaluate the *initial* \(\Phi(\mathbf z)=\bigvee_{L\in69}z^L\) on hypothetical INDEPENDENT binary completion assignments to the actual 42 shared physical cells, **without alternating players/gravity**. Define the K4-free partition polynomial

\[
Z(\mathbf t)=\sum_{\mathbf z:\,\Phi(\mathbf z)=0}\prod_{s:z_s=1}t_s.
\]

At all t=1, Z counts all original physical binary subsets with no full four-in-a-row. A 7-column/6-row tensor transfer keeps only the previous three 6-bit column masks because original K4 has horizontal span at most four. Each new column is checked for internal vertical K4 and cross-column H/R/F windows. EXACT static integers from the checked-in JS transfer:

\[
\boxed{Z(\mathbf1)=439,428,365,759.}\tag{8}
\]

For physical site e, the gradient \(N_1(e)=\partial Z/\partial t_e|_{\mathbf t=\mathbf1}\) is the count of K4free subsets containing e. \(N_0(e)=Z-N_1(e)\) are those omitting it. The number of OTHER 41-bit choices for which adding e changes the global K4 property is

\[
\boxed{
I_e=N_0(e)-N_1(e)=Z-2N_1(e).
}\tag{9}
\]

This is the Banzhaf pivotal count; the normalized influence is \(I_e/2^{41}\). More directly, under the uniform \(\{-1,+1\}\) Fourier character \(\chi_e=(-1)^{z_e}\), the **exact one-site Fourier coefficient of original 69-K4 OR** is

\[
\boxed{
\widehat\Phi(\{e\})=-I_e/2^{42}.
}\tag{10}
\]

The transfer is a global field contraction, not listing all \(2^{42}=4,398,046,511,104\) binary subsets. It visits up to 175,616 distinct 3-column boundary triples and counts 23,976,936 accepted column transitions (forward pass and same number backward). Fixed-width contraction does not guarantee polynomial scaling across arbitrary dimensions; it is an exact original7x6 result.

**Static pivotal count matrix** (physical row1 at board bottom, columns1..7):

| Physical row | c1 | c2 | c3 | c4 | c5 | c6 | c7 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 6 | 36,789,765,449 | 47,096,256,413 | 58,539,126,505 | 111,434,791,827 | 58,539,126,505 | 47,096,256,413 | 36,789,765,449 |
| 5 | 47,342,167,607 | 63,738,397,577 | 87,170,013,805 | 126,118,181,759 | 87,170,013,805 | 63,738,397,577 | 47,342,167,607 |
| 4 | 78,082,303,889 | 103,608,106,897 | 127,272,240,843 | **149,598,088,717** | 127,272,240,843 | 103,608,106,897 | 78,082,303,889 |
| 3 | 78,082,303,889 | 103,608,106,897 | 127,272,240,843 | **149,598,088,717** | 127,272,240,843 | 103,608,106,897 | 78,082,303,889 |
| 2 | 47,342,167,607 | 63,738,397,577 | 87,170,013,805 | 126,118,181,759 | 87,170,013,805 | 63,738,397,577 | 47,342,167,607 |
| 1 | 36,789,765,449 | 47,096,256,413 | 58,539,126,505 | 111,434,791,827 | 58,539,126,505 | 47,096,256,413 | 36,789,765,449 |

**Interpretation:** c4r3/c4r4 are the jointly strongest pivots, each with \(I_e=149,598,088,717\), influence about 0.06802933454. This is a full 69-window-overlap geometric potential, not a center-first perfect-play theorem: gravity means the immediate legal empty-board center placement is r1 rather than r3/r4; actual opponent moves are not uniform random free-site occupancy. Unlike the gameplay system, the static uncolored original K4 hypergraph is ALSO vertically reflection symmetric. NEVER transport this vertical symmetry into gravity gameplay.

**Independent reproduction:** The primary JS method uses direct H/R/F bit intersection and vertical-column rejection. A completely separately written local C++ method first creates the 69 explicit four-site physical windows, forbids a line when the newly added column becomes its rightmost site, and runs independently pinned site 0/1 counts. It reproduced Z and:
- c4r3: \(N_0=294,513,227,238\), \(N_1=144,915,138,521\), \(I=149,598,088,717\);
- c4r1: \(N_0=275,431,578,793\), \(N_1=163,996,786,966\), \(I=111,434,791,827\);
- c1r1: \(N_0=238,109,065,604\), \(N_1=201,319,300,155\), \(I=36,789,765,449\);
- c3r3: \(N_0=283,350,303,301\), \(N_1=156,078,062,458\), \(I=127,272,240,843\).

An initial prototype of the optimized width3 transfer had a **column-shift indexing error**, leading to implausibly equal pivotality by column. This was caught before checkpointing, corrected to \(((s\&4095)\ll6)\mathbin{|}d\), and the final values were corroborated by the explicitly reconstructed original69 independent C++ implementation. Preserve this negative provenance so old draft numbers do not propagate.

## 6. What the exact closure and global potential do NOT solve

**Information closure of q_o is known and exact. Game-value compactness is not.** The \(\Phi\) Boolean site potential and its simple Shannon cofactor maintain all normalized original winning-line requirements. But when choosing who occupies the NEXT frontier site, we still require action-indexed firstwin sinks and the alternating P0-EXISTS/P1-FORALL binder. Both can be written symbolically, yet a generic nested binder is disguised minimax unless it admits a provably small invariant/closed rewrite basis.

The pivotal field \(\widehat\Phi_e\) is an exact whole-space Fourier observable over imaginary static binary site completions, **not** a winning probability, equilibrium harmonic function or value field. We must not turn it into an oracle-free best-move recommendation without further causal proof. The static blocker \(\Psi\) is likewise not an actual adaptive P1 policy.

**New concentration of the OPEN research problem:** derive a compact, source-defined family \(C_0,C_1\) in these *exact Shannon-closed attack/dual-blocker fields*, augmented by gravity, deadline and firstwin chronology, such that:
- \(C_0(\mathrm{empty})=1\);
- whenever P0 is to move in \(C_0\), there exists a legal immediate win or a LIVE successor in \(C_1\);
- whenever P1 is to move in \(C_1\), **every** legal reply is LIVE and returns to \(C_0\).

The short fork field (6)-(7) is an example where the P1 universal binder contracts to ONE degree-two symmetric Boolean formula and yields genuine forced WIN on a guarded region, with no reply enumeration. We need a **new long-range reply-resource/collision contraction**, not merely repeating the fork or recursively unrolling (6). A plausible precise unknown is a causal extension of the static hitting-set dual \(\Psi_p\) with legal frontier, usable turn slots, firstwinner order and adaptive-response demand, admitting a source-derived bounded cluster algebra. All exact C6 signed-exchange and fifth-order absorption obstructions must remain visible to such a projection.

**Qualification:** These are deductive source-field identities + independently reproduced exact STATIC source count and a bounded true gameplay certificate. No empty-root WDL proof, all-position 3-way WDL algorithm, independent IsoGraph qualification or maintained CI run. Current qualified authority 1.2 and QU-GAME-02/C4-R0076 remain unchanged.

## 7. Frozen protocols, execution and evidence

Frozen before tests: \`docs/research/2026-10-22-frozen-antichain-Shannon-dual-and-fork-field-contraction.md\` and \`docs/research/2026-10-22-frozen-global-K4-Boolean-influence-tensor-contraction.md\`.

Checked-in, GitHub-readback and isolated-V8 executed:
- \`research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-original7x6-Shannon-antichain-dual-pivotal-and-fork.js\`: all 168 antichains of the abstract four-site Boolean subset lattice, 21,504 own/opponent canonical Shannon tests, 21,504 static-blocker dual tests, 10,752 pivotality cases, 8,064 distinct-site cofactor commutation tests, all 2,186 seven-column legal/threat truth assignments, all original 42-cell/69 K4 static dependency cones. **Zero full gameplay boards or move histories enumerated.**
- \`.../run-original7x6-K4-Boolean-pivotality-three-column-transfer.js\`: exact original69 K4 source width3 partition and 42 site marginal gradient, 175,616 maximum boundary triples, 23,976,936 accepted transitions. **Zero whole 42-site subset assignments enumerated.**
- independently developed and compiled locally with \`g++ -O3 -std=c++17\`: \`.../verify-original7x6-K4-Boolean-pivotality-explicit69.cpp\`, exact literal 69-window K4-free Z and four pinned pivotalities PASS. Committed C++ source read back from GitHub; maintained CI not run.

Machine evidence \`.../ORIGINAL7X6_SHANNON_ANTICHAIN_BLOCKER_FORK_FIELD_0_1.json\` and \`.../ORIGINAL7X6_GLOBAL_K4_BOOLEAN_STATIC_PIVOTALITY_0_1.json\`. This work should be routed as concrete new exact algebraic evidence to **existing GSP-003 symbolic q solver and GSP-004 guarded obligation closure**, not a new game-theory authority or a duplicate gameplay-strategy identity.
