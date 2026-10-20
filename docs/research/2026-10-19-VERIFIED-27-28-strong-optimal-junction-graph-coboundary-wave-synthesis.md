# 27 and 28 on original Connect Four: verified geometric bridge, distinct algebraic 27s, and exact strategic limitation

**Date:** 2026-10-19 Pacific. **Research owner:** canonical \`research/semantic-quotient\`. **Scope:** ORIGINAL W7×H6, K4, 42 shared physical cells, 37 finite directional strands, 168 appearances and 69 nonperiodic genuine four-windows; original column gravity, P0/P1 alternation and immediate first-win absorption. **Status:** internally independently verified new exact *conditional-topology* result; previously qualified optimal-line premise reused with attribution. No new strong oracle values, Level2 all-best moves, fully nonbranching WDL, solver/main mutation, or qualified IsoGraph gameplay-authority promotion.

## 1. Context reconstruction, proof identities and historical source priority

Resynchronized from live branch governance \`STATUS.md\`, \`next_step.yaml\`, global and local AGENT instructions, governing IsoGraph gameplay 1.2 authority/manifest, accepted C4-0001 game/C4-0005 solved-oracle specifications, CPC/WSL/NDC Candidate specs, the pre-October incidence/CPC/optimal-line proofs and the October unfold-first/quantum, zero-fanout and perfect-play correction records. The branch contains many historical source proofs, failed campaigns and handoffs, all preserved. The following are **distinct** established objects rather than mutually supporting labels for a single quantity:

| Quantity | Definition / field | Grounding / qualification |
|---|---|---|
| \`|Lambda|=69\` | All original genuine physical four-cell winning windows | Accepted C4-0001 geometry |
| \`|G_strong(empty)|=28\` | P0 first-winning geometric window **identities** possible in some root-to-terminal distance-sensitive strong-optimal history | 2026-09-14 externally strongly solved [issue #41](https://github.com/iteathen/Connect4/issues/41), matching geometric upper bound and 28 full 41-ply witness histories; not re-strong-solved here |
| \`|G_WDL(empty)|=61\` | Historical weaker WDL-tied root possible winning-line union | C4-R0048; historical empirical, normalized raw 61-run NOT retained |
| \`Y_cell=28\` | GF(2) \`ker(axis | im B)\` with \`B:F2^69→F2^42\` | Symbolically proved incidence quotient, no solved labels |
| \`Y_line=28\` | GF(2) \`ker(vertical phase | ker B)\` | Symbolically derived, no solved labels |
| \`rank beta=rank gamma=28\` | CPC/residual pairing \`beta\` and weighted degree-3 pairing \`gamma\` on GF(2) cores | Prior finite exact controls, natural isomorphism \`T=beta_flat^{-1}∘gamma_flat\` |
| \`E_max=38\` | K4 windows meeting a capacity-possible top-two-row final-landing site for ply41 P0 | Static gravity/support conditional on maximal delay, not proof that strong play reaches delay |
| \`27\` source gate failures | 27 of 35 first-touch gate cells after genuine center history \`44444\` without a common immediate legal blocker | Exact source-proof incompleteness, **NOT** terminal-win support |
| \`27\` support-mirror losses | Number of late original q from a frozen sampled corpus independently certified as mover LOSS under support-mirror proof | Sample count; all 27 were already covered by a stronger older proof family |
| \`27=3^3\` local Z3 Fourier | Number of charge-conserving local frequency configurations at EACH genuine four-copy ternary owner junction (out of81) | Algebraic per-junction Fourier tensor rule, NOT 27 global strategic variables |
| \`27\` original strong witness **histories** | The 28 archived per-line witnesses use only 27 distinct 41-move strings; line IDs 41 and 56 share one history completing multiple lines | Archive selection artifact, not asserted minimum or universal invariant |

Previous rejected claims remain rejected: one-axis-only quotient ranks, linear incidence identifying optimal 28 with common \`Y\`, post-hoc line probability/Fourier computation mislabeled unfold-FIRST, cyclic four-window wraps on a finite board, treating ordinary GF2 window-parity hidden XOR shifts as game symmetries, and treating hypothetical uniform gravity-shuffles as optimal games. The original exact Node Oracle \`components/oracle/exact7x6.mjs\` remains the qualified primary game-value validator; October cold empty-root node-limited calls were inconclusive and do **not** overturn issue #41.

## 2. Construct the 28 objects without inventing a 27-edge graph

Start with the historical **game-semantic premises** (not newly proved target-free): first five zero-based strong-optimal columns \`33333\`, P0 first winner on ply41, and the 28 externally witnessed root-strong terminal line IDs. The center contains P0 at physical rows0,2,4 and P1 at rows1,3 (all zero-based, column3).

Before adding either owner wavefield or Fourier phases, define the true physical potential last-landing sites:
\[
F=\{(c,r):0\le c<7,\ r\in\{4,5\}\}\setminus\{(3,4)\},\quad |F|=13.
\]
Do **not** assume that every member of F can in fact be the last site on a particular strong-optimal history. F is a legal-capacity filter, not a strategic reachability oracle.

The old terminal support refinement admits a more explicit identity:
\[
\boxed{38\ {\rm top\ capacity}\ \longrightarrow\
35\ {\rm eligible\ landing}\ \longrightarrow\
28\ {\rm center\ P1\ unblocked}.}
\]
Exactly three of the 38 original top-two-row K4 windows meet that band **only** at the occupied center \`(3,4)\`. Seven of the remaining 35 contain opponent center \`(3,1)\` or \`(3,3)\` and are impossible for P0 to complete. The other **28 exactly match all 28 archived strong-winning K4 physical lines**. This is independently regenerated by unwrapped four-direction window enumeration with no literal target28 built into the selector:
\[
T=\{L\in\Lambda: L\cap F\ne\varnothing,\quad
L\cap\{(3,1),(3,3)\}=\varnothing\},\quad |T|=28.
\]
Crucially the construction is conditioned on solved opening/terminal timing. It does **not** derive root-perfect center selection or move41 from source-only game theory, and not every individually filtered physical window is guaranteed reachable without issue #41's matching lower bound.

Define the **bipartite physical junction incidence** between these 28 original K4 line-nodes and their 13 possible common top terminal sites. There are 58 actual line-to-site incidences. Project to the simple undirected 28-line graph \`G_F\`: two different line IDs share an edge iff their original four-cell windows BOTH contain the **same actual physical site** in F. All line aliases at a crossing refer to a single cell, as demanded by the 37-strand/42-junction unfolding; edges are not arbitrary or fitted to 27.

New independently regenerated finite facts, original 7×6 only:
- \`|V(G_F)|=28\`, \`|E(G_F)|=102\` distinct shared-physical-site line pairs, **one connected component**, minimum degree2.
- A deterministic line-ID ordered BFS constructs an explicit 27-edge spanning tree; its complete edges are frozen in the machine packet.
- Bipartite \`T-F\` graph: 41 vertices, 58 edges, one connected component, cycle dimension18.
- The projected line-only graph: 28 vertices,102 edges, undirected cycle-space dimension **75**. The number 27 is **not** the count of raw pairwise connections (102).
- Horizontal reflection maps this graph to itself. There are 14 pairs of line nodes, zero individually reflection-fixed terminal line IDs.

## 3. New positive theorem: 28 line potentials have 27 independent relative differences

For a field \`k\` (Q, R, C or F2), let \`k^T\` be the space of scalar fields attached to the 28 named terminal K4 lines. Orient each of the 102 real edges arbitrarily but FIX its endpoints and define
\[
d_F:k^T\to k^{E_F},\qquad
(d_Ff)_{(L,L')}=
\begin{cases}
f(L')-f(L)&\operatorname{char}k\ne2,\\
f(L')+f(L)&k=\mathbb F_2.
\end{cases}
\]
For any graph, \`d_F f=0\` iff f is constant on each component. This ORIGINAL physical graph is connected by a checked spanning-tree witness; therefore, in all stated fields,
\[
\boxed{\dim\ker d_F=1,\quad\operatorname{rank}d_F=28-1=27,\quad
k^T/k\mathbf1\ \simeq\ \operatorname{im}d_F.}
\]
This is a **proved natural 28→27 relation** for the specified line-junction difference operator. Its global one-dimensional kernel is the line-uniform offset, not a physically canceled K4 win. Any spanning tree gives 27 independent relative coordinate differences. A particular BFS tree is a reproducible connectivity *certificate*, not a new canonical 27-edge physical subnetwork.

Over Q or C, the graph Laplacian \`d_F^*d_F\` has a single zero eigenvalue and 27 nonzero eigenvalues (positivity and connectivity). Its unique zero eigenvector is the constant line mode. With true horizontal reflection Jx the 28-dimensional line signal decomposes into reflection-even14 and reflection-odd14; after removing the single **even** constant, the relative space decomposes canonically into
\[
\boxed{27=13_{\rm even}+14_{\rm odd}.}
\]
No ±-eigenspace conclusion is silently transferred to characteristic2. This supplies a finer structural/spectral test than 28−1 arithmetic.

## 4. Strong negative: this is NOT the former \`Y=28\` incidence kernel

Let \`B_T:k^T→k^{42}\` map one selected K4 winning-line basis label to its four ORIGINAL physical cell indicators. Independent GF2 bitset elimination and rational-rank certification give:
\[
\operatorname{rank}_{\mathbb F_2} B_T
=\operatorname{rank}_{\mathbb Q} B_T=26,\quad\dim\ker B_T=2.
\]
Independent integer null relations (coefficients listed in machine evidence) have supports
\[
\{34,35,37,43,53,58\},\quad
\{13,14,27,28,61,62\},
\]
and horizontal reflection exchanges them. The rational supports carry alternating **signed** coefficients, not the all-\`+1\` GF2 sums. These two exact signed rational null vectors give rank\`≤26\`; a rank26 nonzero minor modulo101 gives rank\`≥26\` over Q. So **the 28 terminal line-vectors do not have one cell-incidence redundancy; they have TWO**. The previously qualified GF2 incidence filtration is preserved:
\[
28_{\rm line\ coordinates}=2_{\rm line\ dependency}
+20_{\rm cell\ core\ overlap}+6_{\rm axis\ boundary}.
\]
Their overlap with the canonical \`Y_line\` is only dim2. The present graph \`d_F\` is an entirely different operator with a different one-dimensional kernel. The true \`Y_cell\cong Y_line\` via the prior CPC/cofactor pairing is a separate exact result.

There is a further nontrivial **physical-observer limitation**. Let \`P=B_T^\top:k^{42}→k^T\` take a physical scalar cell field to its 28 four-window SUM signals. The composite line-gradient \`d_FP\` has independently checked rank **25** over both GF2 and Q (over Q also C):
\[
\boxed{\operatorname{rank}P=26,\quad
\operatorname{rank}d_F=27,\quad
\operatorname{rank}(d_FP)=25.}
\]
Over Q, the uniform physical field \`x_e=1/4\` projects to \`P(x)=\mathbf1_T\`, which the graph derivative kills; thus \`rank(d_FP)≤25\`. An actual nonzero 25-minor modulo101 establishes \`≥25\`, proving equality. GF2 is checked separately and gives25. **Consequently the entire abstract 27-dimensional graph-gradient space is NOT spanned by gradients of linear physical K4 cell-sums; two additional graph-gradient coordinates lie outside that physical linear image.** Nonlinear four-body owner-line potentials may have different spans and require separate tests; the rank25 result must not be applied to those nonlinear observables without proof.

## 5. Unfold-first two-owner wave algebra and OTHER 27

The exact underlying four-ribbon geometry has **37 open finite strands**, 42 shared physical four-way junctions, 168 strand appearances, 69 original K4 windows (25 active strands), with alias isometry \`(1/2)FB\` and no phantom physical cells. At every physical junction, the four copies of ternary EMPTY/P0/P1 ownership are ONE site. A local \`Z3\` Fourier transform on the four ternary appearance labels enforces
\[
k_H+k_V+k_R+k_F=0 \pmod3.
\]
For each given physical junction, there are exactly
\[
\boxed{3^4=81\quad\to\quad3^3=27\text{ nonzero charge tuples},
\qquad54\text{ exact canceled tuples}.}
\]
This old exact 27 was already documented in the October19 Hadamard/Z3 owner-junction theorem. There are 42 junctions; **27 is the number of local allowed tuples PER junction**, or the dimension of complex-valued functions on those 27 tuples, not the number of original Connect4 winning lines. The constrained group \`Z3^3\` itself has **dimension3 as an F3 vector space**, not 27. Its possible abstract complex 27-dimensional function space and the 27-dimensional graph-gradient complex space are equidimensional, but no distinguished physical/representation-theoretic intertwiner or game-semantic identification has been found. Selecting an arbitrary bijection between bases would be manufactured evidence.

The separately known Hadamard owner-pair tensor has a rank-one forbidden \`11\` P0+P1 local correction and a rank-two cross-owner Fourier matrix. Mean owner projectors remain mutually orthogonal on any **single** actual board, whereas averages over mutually exclusive histories may overlap at potentiality level. Zero signed P0−P1 contrast does NOT mean neither owner has live K4 potential. The documented 15 genuine empty-uniform-hypothetical-gravity-shuffle signed-line cancellations are not actual first-win-stopped perfect-play cancellations; those symmetries do not preserve gravity strategy histories. Four-body owner-line projectors and actual first-win timing are essential.

For owner-conditioned line potential functions \`a_0,a_1∈\mathbb C^T\`, define \`d_Fa_0\` and \`d_Fa_1\` separately after physical junction gluing. Both lose one uniform line offset; the contrast \`d_F(a_0-a_1)\` loses one offset in the **difference** only, not both absolute fields. This is a mathematically legitimate potential-difference/Fourier interpretation, but **NOT a game-value quotient**. There is no proof that an opponent's adaptive choices, absolute line-completion probability, first-win absorption or a legal action's forced outcome are invariant under uniform shifts, and many scalar line fields used here are not even physically reachable.

## 6. Tests, counterexamples, provenance, confidence

Frozen *before* independent checker:
\`docs/research/2026-10-19-strong28-line-junction-graph-coboundary-27-frozen-candidate.md\`.
Machine evidence:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STRONG28_TERMINAL_LINE_JUNCTION_27_COBBOUNDARY_INTERNAL_VALIDATION_0_1.json\`.
Exact archived 28 issue41 witness fixture:
\`research/isograph/discovery/2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json\`.

Independently reconstructed ORIGINAL open-boundary 69 windows in two different programming-language approaches, original 42 physical sites, 37 directional strands and 168 aliases. Checked all 28 archived 41-ply actual witness histories from literal empty with gravity, alternating owner and FIRST-WIN STOP (1,148 replays), 28 distinct historical line labels, 0 geometric violations; historical full strong-score values were not recalculated. A 27-edge BFS spanning tree explicitly certifies graph connectivity. Both GF2 bitset and rational/exact integer/minor rank proofs distinguish graph rank27, cell map rank26 and physical-gradient rank25. Exact horizontal reflection and row-stratum controls were checked. Verification is **independent internal code and algebra**, NOT external formal proof-assistant qualification.

Negative/specificity controls on this SAME ORIGINAL board:
- With only eligible row4 cells, line graph has **63 edges, 7 components**; with only row5, **39 edges, 13 components**. **Both levels and their physical connections matter** for the full rank27.
- Let 28 strong K4 windows connect through ANY of their physical cells: **146 edges**, still one component. The incidence rank27 is robust, not the count of raw overlaps.
- Use ALL 69 original K4 windows with ANY original cell as junction: **821 edges**, 1 component, graph incidence rank68. Thus \`connected n→n−1\` is a general graph fact, **not a 7×6 game-WDL exception**.
- Use ALL 69 original K4 windows but only F cells as junction: **146 edges, 35 components**, 34 isolated lines; this is **not** a 69-line connected graph. The 28 selected lines form a connected subset of the single 35-line active terminal-support component.
- Of the 28 archived issue41 per-line witnesses, only **27 different full 41-ply histories** occur, because one physical history witnesses both distinct line IDs **41 and 56** (and in fact completes multiple lines). The terminal winline-indicator matrix on this *chosen finite witness list* has rank27; this is a **selection-dependent artifact**, not a mathematical bound on the set of all perfectly played histories or a new global game invariant. Another choice of complete witnesses could change the rank.

The 27 first-touch common-blocker failures at \`44444\`, 27 late source certified losses, 27 ternary junction modes, 27 selected witness histories and 27 graph relative directions are all **real but differently typed quantities**. Nothing in current proofs naturally equates their elements, operators, or mathematical fields.

## 7. Exact new statement and the next substantive WDL gate

**Positive:** There IS a natural, exact relation between the known 28 root-perfect first-winning-line identities and **27 independent relative line-junction modes**, via the physically defined eligible-terminal-junction graph's connected incidence/coboundary. This is stronger than an arbitrarily picked 28-element set and stronger than merely observing 28−1; an explicit original-board physical graph, 102 links and 27-tree certificate establish it. The 27 sector count in the owner's unfold-first ternary wave research is a **second distinct exact occurrence**, not proved equivalent.

**Negative:** The old \`Y=28\` cell/line core is not the same vector space; its interaction with optimal-line coordinate incidence has rank26 and kernel2, not 27/1. Furthermore physically linear induced difference rank is25. No game-value theorem follows from graph connectedness or charge cancellation alone. Conditional 38→35→28 still uses historical strong-solve opening/horizon premises, so no circular claim of nonsearch root strong-play selection is authorized.

**Prioritized proof gate:** Build a *game-causal* operator on the same original 37-strand/42-junction network whose data includes two separate owner-specific **four-body K4 potentialities**, gravity support and alternating ownership, **earliest first-win absorption** and universal/existential best-move quantification. Test whether its actual valid transformations preserve the 27 relative-mode quotient and whether those modes, plus any necessary absolute/global components, suffice to distinguish exact root and arbitrary-q WDL and complete best-label sets. First falsify on independently Oracle-qualified original legal histories **from literal empty root** when asserting strong perfection, preserving the historically qualified 28-line count as a cross-check, never as an input to the desired target-free selector. If shift-invariance fails on even one actual score-qualified game state, retain the graph relation as static topology and reject its promotion to strategic state congruence. Non-search structural consequences may later reduce search branching, but no solver optimization or qualified gameplay authority changes are warranted yet.

**Governing objective unchanged:** exact purely algorithmic W/D/L under legal play **without strategically branching over alternate game futures**. This report proves a limited mathematical bridge, not that final target.

