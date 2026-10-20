# CORRECTION: Unfold FIRST, define owner waves on the 37-strand intersection network, Fourier transform SECOND

**Date:** 2026-10-19. **Owner direction:** Josh Oshiro. **Research branch:** research/semantic-quotient. **Scope:** real Connect4 **W=7, H=6, K=4**, 42 physical cells, 69 four-cell winlines, original gravity and first-win stopping. **Epistemic:** geometric and owner-operator theorem frozen before independent controls; first-win and perfect-play WDL remain separate. No nonstandard board or connection length.

## 0. Correction to the previous methodology

Earlier \`docs/research/2026-10-19-true7x6-interwoven-owner-waves-unfolded-spatial-Fourier-nodes.md\` calculated P0/P1 winline joint probabilities in the ORIGINAL cell/historical-shuffle representation **BEFORE** assigning their numbers to the existing four-ribbon strands and applying DFT across window starts. Even though the output windows had valid geometry, this was **not the unfold-FIRST potentiality-space construction requested**. Do not rename that experiment as if it had tested the latter. Preserve previous validated probability numbers as a DIFFERENT, narrower observation. This new note starts in the FULL intersection/alias structure before constructing ownership operators, wave amplitude models or line probabilities.

## 1. The actual unfolded base space, defined before owners or frequencies

Define physical site set E={(c,r):0≤c<7,0≤r<6}, |E|=42. Define 37 ordered finite, OPEN directional strands:
- H: six physical rows;
- V: seven actual gravity columns;
- R: twelve rising diagonals;
- F: twelve falling diagonals.

For each physical site e there is exactly ONE appearance in a strand of EACH of the four orientations, total **168 appearances**. Let B be the 168×42 binary site-to-appearance matrix with B_{a,e}=1 if appearance a is e. Then B^T B=4I42 and A=B/2 is an isometry. The physical subspace of coherent **aliased** appearances is rank42 and has 126 constraints. A naive 168-independent-cell model is not Connect4.

Before assigning owners, construct the **bipartite intersection graph \(\mathcal G\)**: 37 strand vertices + 42 physical junction vertices, one edge for every physical appearance linking its strand to its site: 79 nodes, 168 edges. It is connected for the real 7×6 directions; its ordinary graph cycle rank is **168−79+1=90**. The alternate projected STRAND-ONLY graph has one vertex per strand; any physical junction connects the four different orientation strands by a 4-clique (six pair intersections). Any two DISTINCT orientation strands can intersect in AT MOST one literal physical cell, giving exactly **42×6=252** unique unoriented strand-pair edges, and if connected cycle rank 252−37+1=216. Six pairs per physical junction are NOT six independent owners or six independent strategic choices. Both graph ranks are GEOMETRIC cycle counts, not a number of strategic game loops; freeze before independent physical checking.

The exact original 69 winline intervals lie locally as four consecutive appearances on exactly one strand, but the four orientations' line constraints are glued together through the 42 four-way junctions. This incidence tensor network, including its 42 equality constraints, is the **primary mathematical object**.

## 2. Only NOW define the separate P0 / P1 ownership operators

Use physical ternary indicators \(n_0^\pi(e),n_1^\pi(e),n_\varnothing^\pi(e)\in\{0,1\}\) for any ACTUAL board \(\pi\), with \(\sum_p n_p^\pi(e)=1\) and \(n_0^\pi(e)n_1^\pi(e)=0\) for every e. These can describe any legal first-win-free prefix, first-win-terminal board or a labeled hypothetical complete board (the latter not necessarily a played original full game after first win).

Let \(\mathcal F=\bigoplus_{\sigma=1}^{37}F_{\ell_\sigma}\) be the block unitary DFT on the ordered finite strand appearances (all valid physical endpoints, NO periodized winning lines). Define the normalized spectral alias isometry

    T = (1/2) \mathcal F B,    T†T=I_42,  P_phys=T T†.

The owner-specific wave projectors in **unfolded-first** Fourier space are

    K_p^\pi = T diag(n_p^\pi) T†,    p∈{P0,P1,EMPTY}.

Exact **simultaneous** identities for EACH actual colored board:
    (K_p^\pi)^2=K_p^\pi,
    K_p^\pi K_q^\pi=0 if p≠q,
    K_0^\pi+K_1^\pi+K_empty^\pi=P_phys.

This is an exact 168-dimensional owner-SEPARATED projector calculus, with physical rank limits and no phantom duplicate cells. A full hypothetically colored board has K_empty=0. These identities are **NOT** relative wave interference in a physical quantum particle. They formalize actual mutual exclusivity and shared junctions BEFORE any trajectory probability measure is introduced.

## 3. Exact cross-strand Fourier junction kernel, no earlier board aggregation

For a strand σ of length ℓσ and Fourier mode k, the amplitude for physical cell e on σ is

    T_(σ,k;e)= 1/(2√ℓσ) exp(+2π i k tσ(e)/ℓσ)

when e belongs to σ, otherwise 0. The sign convention is arbitrary provided used consistently, and T†T=I.

For DISTINCT orientations and fixed strand σ,τ their geometric intersection Eσ∩Eτ has size 0 or1. Consequently the owner-p Fourier cross-orientation block is:

    (K_p^\pi)_(σ,k;τ,l)
      = [n_p^\pi(e)/(4√ℓσℓτ)]
          exp(2π i [k tσ(e)/ℓσ − l tτ(e)/ℓτ])

if the original strands intersect at physical e, otherwise zero.

This is *the proposed interweaving amplitude*: each cross-strand junction carries one exact phase and exactly ONE physical owner indicator. A P0 and P1 wave can occupy the SAME spectral mode (both mode amplitudes nonzero) even though their direct same-history occupied CELL projectors remain orthogonal. There is NO hidden pairwise cancellation among multiple physical junctions inside a fixed cross-orientation strand pair because each pair intersects at most once. Other interference occurs along longer strand sums, across several junctions/modes, and around multi-junction network circuits.

For σ=τ, a mode block sums over ALL ℓσ physical sites and therefore does have conventional finite Fourier phase cancellation:
    (K_p^\pi)_(σ,k;σ,l)
       = 1/(4ℓσ) ∑_(e∈σ) n_p^\pi(e)
                     exp(2πi(k−l)tσ(e)/ℓσ).

This distinction is a **new exact geometric constraint on where Fourier cancellation can physically arise**. It is not a defensive-obligation approximation or an assertion that winning line values are linear.

## 4. The requested cancellation web: actual owner exclusivity vs unresolved ownership POTENTIALITY

Only AFTER constructing the junction projectors, choose a clearly specified distribution over possible board histories \(\rho\) (e.g. the PRIOR uniform hypothetical complete gravity-shuffle model, or a known finite actual first-win-stopped history sample). Let
    \(p_p(e)=\mathbb E_\rho[n_p^\pi(e)]\),
    \(\mu_e=p_0(e)-p_1(e)\),
    \(o_e=p_0(e)+p_1(e)\).

Their mean spectral wave operators are \(\overline K_p=Tdiag(p_p)T†\), and the signed owner-potential overlay is \(\Delta=\overline K_0-\overline K_1=Tdiag(\mu)T†\).

**Important correction to intuition:** on EACH board \(K_0^\pi K_1^\pi=0\); AFTER averaging mutually exclusive histories one generally has

    \(\overline K_0\overline K_1=Tdiag(p_0 p_1)T† \succeq0\).

This is *cross-history unresolved owner potential* at the same four-way junction, NOT literal simultaneous P0/P1 ownership of one cell. A signed wave cancellation \(\mu_e=0\) can occur with BOTH player potentials positive; the cell does NOT disappear.

The exact positive-semidefinite **potentiality/cancellation slack** is

    \(\Gamma=\overline K_{occupied} -\Delta^2
       =Tdiag(o_e-\mu_e^2)T† \succeq0\).

For a COMPLETE hypothetical binary-coloring ensemble o_e=1, and

    \(\Gamma=P_phys-\Delta^2=4\overline K_0\overline K_1\),
    \(\operatorname{tr}\Gamma
       =\sum_e(1-\mu_e^2)
       =4\sum_e p_0(e)p_1(e)\).

On an actual single board (not an uncertain ensemble), \(\mu_e\in\{-1,0,+1\}\), o_e=μ_e², so Γ=0. For a complete two-owner ensemble \(\mu_e=0\) gives MAXIMAL local slack1, not a canceled obligation. This is an EXACT geometric wave-operator identity for owner potentiality, independent of perfect-play game search and independent of choosing a defensive-obligation interpretation.

To retain winning-line meaning, a K4 event still requires a four-body joint projector
    \(W_{p,L}(\pi)=\prod_{e∈L}n_p^\pi(e)\).
Its expectation is NOT the product of four one-cell p_p(e); it can be represented on one original ribbon as a consecutive length4 monomial, linked by equality junction tensors to every other ribbon. Owner opposition is locally exclusive but first-win stopping, chronological rivalry and strategic quantifiers are **not** in one-body K_p or Γ.

## 5. Independent original-7x6-only falsifiers frozen before claims of validation

- Independently construct actual original 37 strands from OPEN boundary starts, all 42 four-way junctions and all 168 appearances; verify 79 vertices/168 edges/bipartite cycle rank90 and 252 unique cross-orientation strand-pair intersections, projected graph cycle rank216.
- Independently compute 168-mode geometric DFT coefficients and all K_p for chosen REAL original histories: empty, genuine \`44444\` (P1 next), genuine \`444444\` (center full), complete physically legal 42-ply DRAW \`123456123456654321654321123456123456777777\`, plus genuine terminal P1 win \`44444421122333\`. Verify at least one physically valid K4 terminal rule and no earlier winner on each given real history.
- Check cross-strand unique intersection and its single-phase Fourier formula on EVERY cross-orientation junction at a subset of mode pairs, plus same-strand mode interference. Verify owner projector idempotence, pairwise orthogonality, total P_phys and rank constraints by 42-site compressed algebra and separately sampled 168×168 entries (do not build costly dense 168x168 if not useful).
- For the EXACT earlier canonical uniform full 42-event hypothetical gravity-shuffle marginal \(\mu_e\), compute Γ, its 42 eigenvalues \(1-\mu_e^2\), \(\operatorname{tr}\Gamma\), \(\operatorname{tr}(\overline K_0\overline K_1)\), and verify \(\operatorname{tr}\Gamma=4\operatorname{tr}(\overline K_0\overline K_1)\) by independent physical site count, Fourier/orientation modes and selected matrix elements.
- Expose at least one genuine CROSS-MODE signed interference (e.g. a Fourier-mode coefficient cancels even though p0,p1 individually positive) and one original **junction with μ=0** if one exists; if none, record that exact negative. Do not confuse trace cancellation with cancellation of game potential, winning-line existence or WDL.
- Preserve exact differences from the previous post-hoc WINLINE wave DFT; do not rewrite history as though it had genuinely taken unfolded geometry first.

**No original root WDL, Level2 best action, Shor quantum speedup or future strategic no-search solver follows yet.** The purpose is to test the owner's geometrically primary interwoven wave idea faithfully and find exact new structural mathematics beyond defensive obligations.
