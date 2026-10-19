# Genuine standard 7×6 K4: separate P0/P1 ownership "wavefunctions" over complete gravity-play potentiality, then overlay/cancel them

**2026-10-19, canonical research branch \`research/semantic-quotient\`, research direction Josh Oshiro.** This is the user's explicit NEW framing: represent owner-separated token/play potentiality as **two interwoven wave fields** over possible plays, like interference of light or pond ripples, project them into common unfolded physical/winning-line coordinates, and inspect cancellation/intersection/mismatched structures. Do not reduce the entire research to "defensive obligations"; overlap and cancellation may reveal other mathematical invariants, representation equivalences, symmetric/antisymmetric modes, response algebra, group actions or new outcome identities. The experiment uses **ONLY ORIGINAL W=7,H=6,K=4**, gravity, alternating ownership and first-win stopping for actual games. It is a mathematical exploration of wave representations, not a claim that Connect4 is a physical quantum system.

## 1. Distinguish THREE levels of wave/potentiality, and what "cancellation" means

Let \(\mathscr H(q)\) be the finite set of **hypothetical COMPLETE gravity-compatible interleavings of the remaining original column event chains** after a genuine nonterminal source prefix \(q\). All remaining original stones are interleaved (within each column order is fixed); alternation assigns p(t)=(n+t) mod2 for absolute starting ply n. Importantly: for algebraic complete-coloring measurements we **SUSPEND the first-win stop after the start prefix**. Some interleavings are NOT whole legal played games because earlier winning lines would have terminated them. Every empirical number must be labelled **hypothetical gravity-shuffle potentiality**, not physically enforceable strategy or exact WDL.

A formal uniform coherent amplitude vector can be defined on the orthonormal distinguishable-history basis,
    \(|\Psi(q)\rangle = |\mathscr H(q)|^{-1/2}\sum_{\pi∈\mathscr H(q)}|\pi\rangle\).
The fixed amplitudes \(+|\mathscr H|^{-1/2}\) are a MODEL CHOICE with zero relative phase—not a physical Feynman action or quantum speedup. Direct probability of an event is the norm-square of its history-basis projector, and has no destructive interference between distinguishable histories.

Two **player-resolved fields** can be extracted through physically justified owner projectors \(\Pi_{p,e}\): who owns original cell \(e\) in the full hypothetical coloring. Their raw same-history supports are orthogonal for p=0,1 at e. An owner-contrast wave built by assigning the **natural turn-parity phase** \((-1)^{n+t}\) and coarse-graining into cell or winning-line coordinates CAN have mathematical cancellation. Do NOT infer game impossibility from a zero contrast: P0 and P1 may each have nonzero potential while their signed difference vanishes.

The genuine original first-win-stopped legal path space \(\mathscr H^{\mathrm{live}}_t(q)\) is a DIFFERENT object. Restricting by "no earlier first win" is an absorbing, nonlocal, player-history-dependent filter; our closed gravity-shuffle formulas below do not evaluate its full strategy-weighted wave. Defining a legal-path operator is valid symbolically but must not hide a minimax/policy search or confuse positive history counts with opponent-universal force.

## 2. A truly exact **non-search** temporal Fourier amplitude for every original physical site

Let original \(q\) be either the empty standard7x6 K4 board (n=0, all remaining column lengths m_c=6,N=42), or the true nonterminal canonical history \`44444\` (n=5, remaining lengths m_3=1 and m_c=6 otherwise,N=37). For a remaining physical cell (c,r) with local future column index \(k=r-h_c\), its **event time T within the N-step hypothetical future interleaving** is the position of the (k+1)-st event in a uniform m_c-subset of N ordered slots. This holds because every fixed subset of positions for this column corresponds to the SAME number of interleavings among all other original columns. Thus the exact combinatorial law is

    P(T=t)=C(t,k) C(N-1-t,m_c-1-k) / C(N,m_c),
    k <= t <= N-m_c+k.

Define the finite-frequency characteristic *wave*
    \(\varphi_{c,k}(\theta)=\sum_t P(T=t) e^{i\theta(n+t)}\).
The \(\theta=\pi\) amplitude
    \(\mu_{c,k}=\varphi_{c,k}(\pi)=\sum_t (-1)^{n+t}P(T=t)\)
is exactly the P0 minus P1 marginal ownership potential:
    \(\Pr(P0\text{ owns }e)=(1+\mu_e)/2\);
    \(\Pr(P1\text{ owns }e)=(1-\mu_e)/2\).
Its numerator is an **integer alternating binomial sum**, denominator \(\binom N{m_c}\). There is no minimax or game-future branching in this formula; all cancellation follows from mathematically grounded owner-turn parity phases.

The spatial FOUR-RIBBON unfolding maps \(\mu\) into FOUR linked finite strand Fourier spectra \(\widehat\mu=F_{\rm rib}M\mu\), with \`M^T M=4I42\` and no invalid wrap. The same Fourier transform applies to each of the P0 and P1 potentiality fields. Their signed difference in any mode is precisely the transform of the signed owner contrast, and common physical aliases ensure each cell stays ONE event.

## 3. Line-wave overlap is a FOUR-BODY correlation, not a product of four one-body marginals

For original actual K4 winning interval L, define the exact hypothetical complete-gravity-history **joint owner line potentiality**
    \(\mathcal P_p(L|q)=|\mathscr H(q)|^{-1}\#\{\pi∈\mathscr H(q): \forall e∈L,\operatorname{owner}_\pi(e)=p\}\).
This is generally NOT \(\prod_{e∈L}\Pr(\operatorname{owner}(e)=p)\); gravity interleavings correlate ownership. Use the Pauli/Boolean projectors already derived:
    \(P_{0,L}=\prod_{e∈L}(1+Z_e)/16\);
    \(P_{1,L}=\prod_{e∈L}(1-Z_e)/16\),
where \(Z_e=(-1)^{\operatorname{owner}(e)}\) on fully colored histories.

Their **owner-contrast/cancellation projector** is
    \(P_{0,L}-P_{1,L}=\frac18\left[\sum_{e∈L}Z_e+\sum_{e<f<g∈L}Z_eZ_fZ_g\right]\).
All EVEN-order terms cancel. The **sum of potentially monochromatic lines** is
    \(P_{0,L}+P_{1,L}=\frac18\left[1+\sum_{e<f∈L}Z_eZ_f+\prod_{e∈L}Z_e\right]\).
Thus the “interweaving owner waves” on the SAME L naturally decompose into ODD-order **advantage/interference** modes and EVEN-order **total collision/potential** modes. This exact identity is independent of statistical distribution and of any arbitrary physical quantum phase. It uses the owner's requested separation and overlap directly; it is NOT a defensive obligation assumption.

## 4. Compute full 69-line distributions without enumerating whole original 42-event game trees

For a given original physical K4 line L and current q, designate up to FOUR columns that contain its future target sites. Other original columns contain no site of L; they can be aggregated as ONE filler symbol of length \(f=N-\sum m_{\rm designated}\). Consider SHUFFLES of the designated original remaining column chains and this filler chain. Every such compressed shuffle expands into exactly
    \(f!/\prod_{\rm undesignated\ c}m_c!\)
ordinary full original gravity interleavings, a multiplicity **independent of the positions of designated events**. Therefore line-owner probability is EXACTLY the ratio of two compressed multichain interleaving counts:
    numerator = number of compressed gravity-shuffles in which each target cell is owned by p;
    denominator = \(\frac{N!}{f!\prod_{\rm designated}m_c!}\).
An integer dynamic lattice recurrence over **at most 4 designated height counters plus 1 filler counter** computes this ratio without materializing all complete 7-column future histories, ANY strategic action outcomes or game-tree evaluation. This is **combinatorial path counting** rather than minimax. The counts may be enormous; use BigInt, an explicit state budget, and preserve the different meaning of actual first-win legal games.

Do this for all 69 legitimate ORIGINAL 7x6 K4 windows on both the TRUE empty and TRUE canonical \`44444\` prefixes. Record P0/P1 numerator/denominator for each line, their signed difference, sum, and four-orientation wave pattern. Verify both owner probabilities are in [0,1] and their sum <=1. The complement is mixed owner potential.

**Independent physical check:** freeze a differently written original7x6 K4 geometry/line checker and an independent closed one-body hypergeometric formula, plus actual small-remaining-history controls drawn as genuine prefixes of a known original 42-ply full DRAW. For those rank>=34 true original prefixes, enumerate ALL hypothetical complete column-shuffle suffixes in checker only (not WDL game search) and match source joint P0/P1 results. Reversal duality and Jx reflection supply exact 69-line whole-space consistency controls on the empty root.

## 5. A NEW exact P0/P1 **wave cancellation** symmetry from full gravity-shuffle sequence reversal

For the EMPTY original 7x6 game, any length-42 original column-label interleaving word \(\pi\) is transformed into another valid gravity-chain interleaving \(\pi^{\rm rev}\) by reversing its entire label sequence. In \(\pi^{\rm rev}\), each physical column's event rows are reassigned bottom-up, so original event (c,r) maps to (c,5-r). Its absolute time becomes \(41-t\) if original t was 0-based, flipping owner parity because 41 is ODD. Hence the **natural** full interleaving ensemble is exactly equivariant under

    physical vertical reflection Jy combined with P0↔P1 owner exchange.

For every original K4 interval L, there is a same-size original vertical-reflected winning line Jy(L) and exact line-potentiality identity
    \(\mathcal P_0(L)=\mathcal P_1(J_yL)\).
The signed overlay \(\Delta(L)=\mathcal P_0(L)-\mathcal P_1(L)\) therefore satisfies
    \(\Delta(J_y L)=-\Delta(L)\).
The unordered original 69 lines under Jy have **SEVEN individually fixed** windows: the central vertical interval rows1..4 zero-based in each of 7 columns (the actual H6 length4 interval with start r1). Thus each has an **EXACT ZERO** P0/P1 signed potentiality difference, even though its two nonnegative individual potentials need NOT vanish.

This produces rigorously derived **seven wave-cancellation nodes** without computing any opponent winning strategy. Physical left-right reflection Jx separately preserves each owner's gravity-shuffle measure and line potentiality, giving an even symmetry in x and a signed antisymmetry under y.

**WARNING:** Jy+owner swap is NOT an automorphism of ordinary first-win-stopped GAME trajectories or perfect-play value; it is a mathematical duality of the hypothetical complete gravity-chain shuffle ensemble. Our earlier source graph showed top-bottom mirror reverses gravity on partially played q. Do not transfer this wave cancellation to forced P0/P1 WDL claims.

## 6. What remains potentially valuable beyond "defensive obligations"

- **Owner-resolved interference geometry:** exact P0/P1 line waves, signed differences and common K4 line correlations through the ORIGINAL 37 unfolded directional strands. Which signed modes vanish for deep combinatorial reasons? Which survive when real q ownership breaks symmetry?
- **Higher-order correlations:** line-projector odd/even Pauli moment split tests interaction not visible in marginal ownership. Could identify amplitudes and cancellations that a static 2D geometry hides, without presuming tactical threat calculus.
- **Quantum Fourier/HSP analogy:** exact characteristic functions and nested parity phases in the shuffle algebra, e.g. \(\pi\)-mode zeros; hidden-group studies require explicit observable/phase and distinguishing actual game symmetry.
- **Absorbing game-terminal filter:** embed original first-win-stopped trajectories as a nonunitary absorbing transition on the formal history Hilbert space, then investigate whether a finite rank/symmetry/analytic generating-function identity factors it **without strategic case branching**.
- **Optional strategic consequences:** ONLY IF proved that a wave invariant is preserved against the opponent's choices and determines forced outcomes/optimal moves. Equality of unsigned potential or a zero signed contrast alone is NOT a WDL tie.

**Qualification:** new source theorem/HYPOTHESIS frozen before direct computer verification. No solver modification, gameplay1.2 change or presumed quantum speedup; no other W/H/K board tests.
