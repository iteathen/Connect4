# IsoMax OOO Orientation Provenance Specification 0.1

**Status:** experimental structural specification; no authority effect  
**Warrant:** EW-RS-071  
**Scope:** 6x3-k3, 4x5-k4, 6x3-k4 discovery carriers only  
**Sealed:** EW-RS-059 PRIMARY 3x6-k4 and BACKUP 5x3-k4 remain outcome-blind.

## 1. Semantic boundary

The vertical rule is discrete support/precedence:

[
h_cmapsto h_c+1.
]

There is one playable frontier cell in each non-full column. There is no continuous-time or physical-gravity model.

The relevant structural quantities are support order, frontier accessibility, release depth, and role phase.

## 2. Raw winning-line provenance

Before any quotienting, every geometric K-line carries one raw direction label:

- H: step (1,0)
- V: step (0,1)
- D+: step (1,1)
- D-: step (1,-1)

Each geometric line has a stable outcome-independent line identity determined by its ordered board-cell set and raw direction.

## 3. q_o residualization with provenance

For owner p and opponent q, every unblocked source line L produces the residual mask

[
R=Lsetminus S_p.
]

If R is empty it is terminally complete and is not represented as a residual obligation.

For equal nonempty residual masks, q_o merges the masks but unions the complete source-line provenance. Source-line multiplicity is retained.

Strict-superset absorption is performed on residual masks exactly as in the frozen q_o implementation. If a residual mask is absorbed, its complete source provenance is deleted with it.

Thus q_o provenance is attached to semantic residual obligations, not to historical moves.

## 4. R/F/G propagation

R, F, and G are unchanged.

A provenance record survives iff its residual mask survives the corresponding mask-only R/F/G filter.

The provenance harness must reproduce the frozen mask-only q_o and RFG projections exactly on every declared carrier. Any mask mismatch invalidates the harness.

## 5. Components and repaired identity

Residual-incidence components are formed from surviving residual masks exactly as before.

The selected base component identity remains ROLE_CAPPAR_REL_INC:

- owner-labelled residual-mask grouping;
- exact frontier-relative residual depth;
- local component width;
- one remaining-capacity parity bit per local column role;
- joint local-column permutation canonicalization.

Orientation provenance is carried in parallel. It does not split or alter the base descriptor during the source OOO reconstruction.

## 6. Canonical exact orientation occurrence record

For one component occurrence, the exact orientation record retains, under the same local-column permutation search:

- owner channel;
- each surviving residual mask as a grouped object;
- each residual cell as (exact relative depth, canonical local role);
- the multiset of raw source orientations H,V,D+,D- for that residual mask;
- role-attached capacity parity.

Raw source line IDs are retained for pipeline verification but are omitted from the compact exact-orientation key after their raw orientation multiplicities have been preserved.

This is exact orientation provenance for the purpose of EW-RS-071; it is not full historical line identity.

## 7. Reflection control

Horizontal reflection is

[
(r,c)mapsto(r,W-1-c).
]

Before any quotient:

- H -> H
- V -> V
- D+ -> D-
- D- -> D+

The verifier must establish this on the complete geometric line catalog.

The provenance runner must also establish that reflected q_o/RFG/component occurrence records agree after:

1. reflecting columns/cells;
2. swapping D+ and D-;
3. applying the same ROLE_CAPPAR local canonicalization.

Only after those structural checks pass is the folded orientation family

[
D={D+,D-}
]

admitted.

## 8. Descriptor-level orientation annotation

The frozen OOO feature space is indexed by base ROLE_CAPPAR descriptor identities.

One base descriptor may occur with more than one exact orientation-provenance occurrence key. Therefore EW-RS-071 does not assume provenance is reconstructible from the base descriptor.

For every descriptor identity d and candidate summary M, define

[
A_M(d)={	ext{all structurally observed occurrence-summary variants of d}}.
]

The descriptor annotation is the sorted finite set A_M(d). This preserves ambiguity rather than outcome-selecting one provenance realization.

The runner reports reconstructibility by the distribution of |A_M(d)|.

## 9. Frozen orientation summary ladder

After reflection folding D+/D- -> D, the candidate occurrence summaries are:

1. ORI_PRESENCE  
   presence subset of {H,V,D}.

2. ORI_COUNTS  
   exact source-provenance count vector (n_H,n_V,n_D).

3. OWNER_ORI_COUNTS  
   owner-separated orientation count vectors.

4. ORI_ROLE_PHASE_COUNTS  
   residual-cell counts by orientation x role-capacity parity.

5. ORI_DEPTH_HISTOGRAM  
   residual-cell exact-depth histograms by orientation.

6. OWNER_ORI_DEPTH_HISTOGRAM  
   owner x orientation x exact-depth histograms.

7. PAIR_ORI_INCIDENCE  
   for each unordered pair H-V, H-D, V-D, count local component columns carrying residual provenance of both families.

8. OWNER_ORI_PHASE_DEPTH  
   owner x orientation x role-capacity parity x exact-depth counts.

9. EXACT_ORIENTATION_PROVENANCE  
   canonical owner/mask-group/depth-role/raw-orientation-multiplicity occurrence key.

10. FULL_DESCRIPTOR_PLUS_EXACT_ORIENTATION  
    base descriptor identity plus exact orientation annotation; reconstruction control.

No candidate is altered after scalar replay.

## 10. OOO triple classification

Each OOO triple has three distinct base descriptor identities.

For candidate M, its triple key is the unordered multiset

[
{A_M(d_a),A_M(d_b),A_M(d_c)}.
]

For ORI_PRESENCE, define the descriptor orientation envelope as the union of all folded families occurring in A_M(d).

A descriptor is orientation-pure when its envelope is exactly H, V, or D.

Triples of three orientation-pure descriptors are classified as:

HHH, HHV, HHD, HVV, HVD, HDD, VVV, VVD, VDD, DDD.

All other triples are classified MIXED.

## 11. HVD predicate

[
T_{HVD}(e)=1
]

iff the union of the three descriptor orientation envelopes contains H, V, and D.

This predicate is structural and frozen before scalar replay.

The runner separately constructs:

- the HVD-only OOO residue map;
- the non-HVD-only OOO residue map.

For both it measures structural image rank, kernel, scalar contradictions, and scalar image dimension.

## 12. Cross-k discriminator

The clean primary comparison is:

- 6x3-k3
- 6x3-k4

Board geometry is identical while K changes.

For every candidate the runner records:

- triple-key intersection;
- pure H/V/D category intersection;
- scalar-factorization disposition on each K;
- whether one common orientation-derived candidate is exact on both.

This is the direct discriminator against a purely k-1 companion-count explanation.

## 13. Deterministic shuffled controls

For each candidate, descriptor annotations are cyclically reassigned among sorted base descriptor identities by shifts 1, 3, and 7 modulo descriptor count.

The annotation multiset is preserved.

No random seed and no scalar information are used.

The same triple/residue factorization audit is then rerun.

## 14. DTS rendering

A move advances one support chain by one frontier cell.

For source-line provenance:

- H lines are transverse to the support chain and contain at most one cell in the advanced column;
- V lines lie entirely in one support chain and may contain multiple cells in the advanced column;
- D+ and D- each contain at most one cell in the advanced column and couple column displacement to vertical displacement.

The provenance runner records transition deltas of surviving H,V,D channels after q_o/RFG on legal discovery-carrier moves.

This is a discrete transition system, not physical gravity.

## 15. Discovery firewall

Solved W/D/L is used only after every structural candidate row and structural basis is frozen.

No holdout outcome is accessed.

No outcome-selected orientation split, category exception, line identity, depth bucket, or role exception is permitted.

## 16. Interpretation guard

A common passing H/V/D summary would establish bounded factorization of the tested OOO scalar residue through that orientation structure.

It would not establish that H/V/D is the unique or universal cause of the triadic correction.

A failure of the declared ladder is preserved as evidence against the H/V/D explanation.
