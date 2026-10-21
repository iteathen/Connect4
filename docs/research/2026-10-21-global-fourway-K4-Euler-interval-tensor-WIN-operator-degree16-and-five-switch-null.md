# The global original7x6 four-direction firstwinner operator has an exact Euler–interval/tensor factorization

Date 2026-10-21 Pacific. Canonical iteathen/Connect4 research/semantic-quotient. Research direction: independent SOURCE original7x6 perfect-play P0-WIN proof from EMPTY via ENTIRE game-state Fourier/transfer FIELD and robust adversarial invariant, not individual move-path solving. THIS IS an exact structural theorem for the whole-space WIN ABSORBER, not an independent root winner proof. Historical28/root solver WDL not premises.

## I. Corrected global rank12 five-switch parity FALSIFIER

Frozen before trial in docs/research/2026-10-21-frozen-global-link-hypergraph-five-switch-Fourier-degree4-and-actionwise-closure.md: 32 TRUE alternating/firstwinfree rank12 states with five P0/P1 bottom/top switch bits in columns c1,c2,c3,c5,c6; col7 fixed [P0,P1]; col4 empty. Each has heights [2,2,2,0,2,2,2] and6 P0/6 P1 stones, with a legal literal 12-ply history. EVEN and ODD parity counting fields of16 such states each have identical COMPLETE actual ternary owner joint marginals for every site subset of size0,1,2,3,4: 1+42+861+11480+111930 = **124314 exact joint histogram equalities**. Thus every original ternary owner Z3 Fourier character with physical support≤4 agrees.

The preregistered guess "terminal P0 flux6 on EVEN versus5 on ODD" was FALSE. The actual original all-K4 physical P0 next-move winning flux is **6 in BOTH fields**, and raw winning ORIGINAL line incidence intensity is **10 in BOTH fields**. Because ALL four real H windows through empty center col4r1 count, not just the two extreme horizontal windows:
  A=b1*b2*b3,
  B=b2*b3*b5,
  C=b3*b5*b6,
  D=b5*b6 (c7 bottom fixed P0).
All are true original potential K4 conditions after P0 center c4r1 claim. Correct Boolean union is A∨B∨C∨D; higher-order apparent interactions cancel. The mistaken 6-versus5 prediction had dropped the middle B,C windows and was corrected without moving the test goalposts. Preserved negative result: parity fields matching owner correlations through4 need not DIFFER at the winner flux, because structural interval cancellation can protect the projection.

## II. EXACT interval Euler theorem for each of the FOUR original directions

For any original physical site e currently EMPTY and hypothetical mover/owner p, let I_(o,e) be the source K4 windows in original orientation o∈{H,V,R,F} containing e, ordered by successive possible original K4 start positions along that actual straight orientation. Each line window L has three other physical sites besides e. Define Boolean owner-p K4 grade1 monomial
  a_(o,i)(q;e)=PRODUCT_(v∈L_(o,i) other than e) n_p(q,v),
where n_p=1 iff that ACTUAL physical site is owned by p.

If two such original length4 windows through e are already P0/P1-completable, all original windows with consecutive start indices BETWEEN them must also be completable: their required sites belong to the physical union of the two extremal true four-cell spans. Hence for any Boolean physical owner assignment, the set of active ORIGINAL window-start indices in ONE orientation is always an INTERVAL (possibly empty).

The exact original per-orientation physical firstwinner OR projector is the EULER CHARACTERISTIC of this interval:
  **C_(p,o,e)=SUM_i a_(o,i) - SUM_(i adjacent) a_(o,i)*a_(o,i+1).**
A nonempty interval of k source windows has k active vertices and k−1 adjacent active edges, so value1; an empty interval has 0. This is not an approximation and holds for all formal owner assignments, even those not chronologically reachable. Each a_i uses3 OTHER true physical owner variables; two ADJACENT length4 K4s have union size5 including e, so each a_i*a_(i+1) uses at most4 OTHER owner variables. **Thus every original directional firstwinning hazard has squarefree formal Boolean degree≤4.**

No chronological game tree, selected perfect-play K4 mask or owner-phase gauge assumption is involved. This is an original K4 interval-hypergraph tautology that subsumes the five-switch null/fibonacci path cancellation.

## III. EXACT whole four-way physical junction WIN OR with formal degree≤16

At the same fixed true physical landing e, original winning-line windows in DIFFERENT orientations meet only at e; their other physical neighbor-site sets are DISJOINT. An original P0/P1 move at e completes some K4 in one or more orientations iff at least one directional hazard C_(p,o,e)=1. The full ORIGINAL FIRSTWIN operator factor is

  **Win_p(q,e) = 1−PRODUCT_(o in H,V,R,F)[1−C_(p,o,e)].**

This is a four-leg Boolean tensor coupling, not an independent sum of line intensities. Expansion has at most15 nonempty products of directional hazard functions. Because each C_(p,o,e) has degree≤4 on DISJOINT directional neighbor-site sets, the full multilinear FIRSTWIN Boolean polynomial has degree≤16. EIGHT actual physical landing cells attain EXACT formal degree16, so this is a tight bound over the full binary owner-p formal variable hypercube:
  (c4,r2), (c3,r3), (c4,r3), (c5,r3),
  (c3,r4), (c4,r4), (c5,r4), (c4,r5).

At original center physical e=(c4,r3) there are13 original K4 windows through e (H4,V3,R3,F3), and the exact complete original owner firstwin Boolean polynomial after idempotent reduction has 1727 NONZERO different monomial coefficients, of which24 have degree16. Its four per-orientation Euler factors have merely7,5,5,5 nonzero own monomial coefficients respectively. Across ALL42 possible landing cells, the original physical source link hypergraph has276 (69×4) K4/site incidences; exactly18 sites carry four available orientations and24 sites carry three, giving SUM_e(2^{orientationCount(e)}−1) = 18×15+24×7 = **438 per-owner orientation-subset hazard field observables**.

A fully arbitrary positive original game-state distribution Psi over true boards has one-step ORIGINAL owner-p absorbing winner flux exactly as an expectation of this compact local operator:
  J_p(Psi)=SUM_(e physical)
      SUM_(emptyset!=S subset of available orientations at e)
         (−1)^(|S|+1) <1[e legal gravity landing] PRODUCT_(o in S) C_(p,o,e)>_Psi.
There are at most438 source owner-p local orientation-cluster terms before combining equivalent symmetries, not an arbitrary catalogue of all up-to-16-body Fourier charges. The expectation of each compact cluster still depends on real OWNER and GRAVITY correlations and can be nontrivial; 438 is an exact EMISSION INTERFACE SIZE for this particular factorization, NOT a proved minimal GLOBAL TRANSFER-CLOSED field dimension.

## IV. Independent symbolic and physical verification

After frozen prereg, an independent pure Python source rebuilt all69 original H,V,R,F K4 windows, for EACH e of42 actual sites:
  1. Expand naive true firstwin Boolean OR over ALL original K4 windows containing e into squarefree physical owner monomials by EXACT inclusion-exclusion, including intersecting terms.
  2. Independently build each TRUE orientation's adjacent-start Euler interval polynomial and combine the four orientations by Boolean OR, likewise expand squarefree.
  3. Compare EVERY monomial mask and exact integer coefficient. All42 comparisons agree with NO mismatches, max formal degree16 achieved at8 interior cells.
  4. On15,000 independently randomized binary physical owner assignments (not necessarily legal gravity plays), verify evaluating compact polynomial gives exactly the original direct K4 incident-window FIRSTWIN indicator. ZERO mismatches.
The separate source rank12 five-switch owner legal ensemble test replayed all32 true alternating firstwinfree histories, checked all124314 0..4-site complete ternary owner joint marginal histograms with ZERO mismatches and every original next P0 action; identical physical terminal flux6 versus6 and original K4 line incidences10 versus10. All results locally executed; exact GitHub CI and external formal proof assistant still NOT run. No production/qualified IsoGraph1.2 changes.

## V. What this changes about the proof architecture

Earlier experimental attempts treated the connected higher-order original Fourier hierarchy as if degree necessarily grows with every overlapping K4. The correct exact source operator has an interval-Euler cancellation inside EACH original line direction and then a small four-direction tensor OR. The dependency graph has geometry-induced cancellation and limited local interface, even though its full formal physical multilinear owner degree reaches16. This is a promising compact FACTORIZATION for the WHOLE-STATE owner/Fourier transfer; one does not have to propagate independently every one of exponentially many raw K4-line coincidence terms.

But a one-step absorbing WIN interface is not a CLOSED field under subsequent owner-dependent gravity transitions, much less a source proof that a controlled P0 strategy from EMPTY defeats ALL adaptive P1 strategies. The next exact research question is whether the 438 source orientation-subset frontier moments can be supplemented by a manageable action-indexed transfer/Koopman-closed module, or whether a precise moment indistinguishability falsifier forces further connected space/time correlation variables. Perfect-play proof still requires P0 existential, P1 universal source invariant, not a uniform distribution's win flux.

Frozen: docs/research/2026-10-21-frozen-global-fourway-Euler-interval-K4-hazard-Fourier-cluster-identity.md. Source exact program and structured profile data under research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/. Maintained CI/formal verification not run. Original empty7x6 independently proved P0 WIN remains OPEN.
