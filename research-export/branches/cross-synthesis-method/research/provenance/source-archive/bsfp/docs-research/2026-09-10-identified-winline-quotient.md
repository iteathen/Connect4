# Identified win-line quotient for BSFP

**Status:** research candidate only; not a production representation, solver claim, or replacement for C1/WSL/NDC authority.

## Question

Can CUDA-BSFP retain the identity of the finite geometric winning lines while avoiding repeated colored-board / ownership detail, using the support skeleton plus shared masks or mask references as the dynamic state?

The standard 7x6 geometry has 69 four-cell winning lines. C4-0006 currently defines WSL-625 as the universe of unique non-empty residual subsets of those lines. The observation here is that, at a fixed support skeleton, a surviving line's residual requirement is already determined by **support + line identity**. The dynamic color-dependent fact is only whether the line has been physically killed by an opponent stone.

## Exact formulation

Let:

- `L` be the fixed set of geometric winning lines;
- `O(S)` be the occupied-cell set determined by support skeleton `S`;
- `I(x)` be the set of line IDs incident to cell `x`;
- `H0` be the set of line IDs hit by at least one P0 stone;
- `H1` be the set of line IDs hit by at least one P1 stone.

Then:

```text
P0 viable lines = L \ H1
P1 viable lines = L \ H0
```

For player `p`, if line `l` is viable, its residual requirement is:

```text
R_p(S, l) = cells(l) \ O(S)
```

No per-line colored residual mask is needed: every occupied cell of a line viable for `p` must already belong to `p`; every unoccupied cell is known from the support.

This means a candidate exact dynamic state at one support is simply:

```text
(H0, H1)
```

or equivalently the two viable-line masks. The support is already the outer BSFP lattice coordinate and need not be repeated in every inner record.

### Forward update

If P0 legally lands at cell `x`:

```text
H0' = H0 union I(x)
H1' = H1
```

and symmetrically for P1. A move only adds the fixed incidence mask of the landing cell to the mover's hit mask. Hit masks are monotone under forward play.

Terminal completion after the move is derivable from support plus the opponent hit mask: a newly support-complete line containing `x` is a P0 win exactly when it is not in `H1`, and vice versa. No historical color recovery is needed for that predicate.

## Exact-state / bisimulation argument

Consider two legal nonterminal colored positions with the same support `S` and the same `(H0,H1)` pair.

1. They have the same legal landing cells because legal moves depend on `S`.
2. For any legal landing cell `x`, they produce the same next hit-mask pair because the update is union with the same static `I(x)` mask.
3. They have the same newly completed winning-line predicate because completion depends only on the next support and whether the relevant line is absent from the opponent hit mask.
4. Therefore corresponding legal actions lead to states in the same equivalence class with the same terminal observation.

This is the domain-specific shape of an exact bisimulation / transition-system quotient. If the premises hold for the selected BSFP profile, exact W/D/L is preserved by induction over the finite support rank.

This does **not** yet prove that every existing C1/NDC proof-state distinction can be discarded. Strategic blocker/certificate/race facts remain separate where used. It does show that historical physical color ownership need not be the primary state merely to preserve geometric future wins.

## Relationship to WSL-625

WSL-625 remains useful as a semantic vocabulary for residual requirements and strategic blockers, but its residual ID need not necessarily be stored as dynamic state.

At fixed support:

```text
(lineId, support) -> local residual pattern -> WSL requirement ID
```

A tiny static mapping can translate a line ID plus its four-cell local residual pattern to the corresponding WSL element when NDC/blocker algebra needs it. The 625-element closure can therefore be derived/on-demand rather than carried for every live line.

Preserving line identity also retains direct access to the fixed incidence graph, which anonymous residual-set deduplication can obscure.

## Physical versus strategic blocking terminology

Do not overload C4-0006's certified strategic `blocker` meaning.

`H0/H1` above are **physical line-hit masks**: a line is hit because an actual stone of that player lies on it. NDC strategic blocker certificates remain proof facts with their existing horizon/response semantics.

A later representation may combine them only through a proved operation, for example by representing a certified strategic rule as a line-ID coverage mask over the opponent's surviving lines.

## Static geometry cost

For standard 7x6:

- 69 winning lines;
- 276 line-cell incidences (`69 * 4`);
- average cell incidence about 6.57 lines;
- the two central cells each occur in 13 winning lines (the maximum).

A dense cell-to-lines table is only 42 x 69 bits (three u32 words per cell), about 504 bytes without metadata. A line-to-cells table is similarly tiny. Thus the geometry can be immutable shared data rather than repeated per state.

## Mask references rather than pointer-rich line records

A per-line record of `{lineId, pointerToMask}` is probably the wrong level of indirection if the only dynamic information is line viability. The stronger candidate is a **set-level canonical mask arena**:

```text
state:
  p0HitRef
  p1HitRef

maskArena[ref]:
  three u32 words carrying the 69 identified line bits
```

The bit position is the line identity. The arena ref is an integer handle, not a raw CUDA pointer.

Potential advantages:

- identical 69-bit hit masks are stored once;
- one side's ref is unchanged by every move of the other side;
- state records can remain small even though a materialized line mask is 69 bits;
- equality after canonicalization becomes integer-ref equality;
- arenas remain relocatable/compactable and compatible with rolling-rank execution;
- no per-line pointer chasing is required.

The mask transition is:

```text
newMask = oldMask OR incidenceMask[landingCell]
```

A transition cache keyed by `(maskRef, landingCell)` is possible if measurements show enough reuse, but a full `maskRef x 42` table should not be assumed because it could cost more memory than it saves.

## Algebraic interpretation

Each player's physical hit mask belongs to the finite join-semilattice generated by the 42 fixed cell-incidence masks:

```text
H(playerStones) = OR_{x in playerStones} I(x)
```

The 69-bit masks are therefore not arbitrary elements of `2^69`; they are unions of a fixed small generator family, further restricted by support, parity, legality and terminal semantics.

Two different physical stone sets are equivalent for future geometric winning behavior when they induce the same line-hit signature at the same support. Stones whose incidence contribution is already covered by other stones become representationally redundant even though their occupied cells remain present in the support.

This is closely related to set-family / hypergraph incidence representations and to canonical DAG/ZDD-style sharing, but a generic ZDD is not assumed to be the production answer. Prior project research already notes that generic decision-diagram operations can move rather than eliminate the scaling wall.

## Connection to prior Connect Four theory

Allis's VICTOR presentation reasons explicitly in terms of potential winning **groups** and strategic rules that solve/refute sets of those groups. Claimeven, Baseinverse, Vertical and the other rules identify required squares and the groups thereby solved. This is naturally compatible with retaining geometric line identity and representing coverage as line-ID masks rather than repeatedly materializing anonymous board colorings.

This does not make VICTOR rules production primitives; C4-0006/C4-0007 remain the governing generic structural semantics.

## Reconnaissance measurements

These are exploratory calculations, not Q1/native performance evidence.

### Complete small reachable games

Reachable physical positions were grouped by:

```text
(support, P0 hit mask, P1 hit mask)
```

and compared with the number of physical colored states.

| Geometry | Reachable colored states | quotient signatures | collapse |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 7,157 | 6,761 | 1.06x |
| 4x4 c4 | 161,029 | 42,168 | 3.82x |
| 5x3 c4 | 158,911 | 19,771 | 8.04x |
| 4x5 c4 | 1,706,255 | 431,885 | 3.95x |

For all four complete controls, no quotient class contained conflicting exact W/D/L results. This is consistent with the transition-equivalence argument above; it is still research evidence, not production qualification.

### 6x5 rank-23 fixed-support reconnaissance

The current C1 wall appears during the first 6x5 static epoch and reaches rank 23, where seven cells are empty. 6x5 c4 has 39 geometric winning lines.

For three rank-23 support skeletons, all correct-count 12/11 color assignments were examined and current winning assignments removed. The remaining non-winning physical assignments were grouped by the pair of physical line-hit masks:

| support heights | non-winning colorings | hit-mask pairs | collapse |
| --- | ---: | ---: | ---: |
| `[4,4,4,4,4,3]` | 171,587 | 7,297 | 23.51x |
| `[5,5,5,5,3,0]` | 157,397 | 5,223 | 30.14x |
| `[5,5,4,3,3,3]` | 266,286 | 61,984 | 4.30x |

These are fixed-support combinatorial populations, not the actual C1 antichain frontiers and not a measured CUDA speedup. They do show that the quotient becomes particularly interesting in the late/high-occupancy region where C1 is currently expensive.

For the complete 6x5 cell universe, exactly 15 selected cells have `C(30,15) = 155,117,520` possible subsets but only 354,914 distinct single-player 39-line hit masks, a 437x many-to-one mapping. This unrestricted single-player figure is only structural evidence of saturation/sharing potential; a legal two-player BSFP state has additional constraints.

## Why this may matter to the current wall

C1 currently pays for large ownership-antichain Cartesian products and later dedup/dominance normalization. The hit-mask quotient changes the state variable itself:

```text
ownership coloring
  -> pair of monotone line-hit signatures
```

A legal forward transition is three-word OR on one side's mask. In a symbolic backward realization, the child function is composed with a fixed OR generator rather than reconstructing a full board coloring.

If actual C1 frontier records collapse strongly under this quotient, the primary gain would be **work never generated**, not merely a faster normalizer. That would compose with, rather than invalidate, the B2/B3/terminal-specialization findings.

## Important risks / falsifiers

Reject or refine the representation if any of the following occurs:

1. Two records grouped by `(support,H0,H1)` have different exact terminal/legal transition behavior.
2. A C1/NDC proof profile needs a historical distinction not reconstructible from support, line-hit identity and separately retained proof facts.
3. First-win legality cannot be enforced from support plus line-hit/terminal information.
4. Actual C1 frontier quotient density is too low to repay larger materialized 69-bit masks and canonicalization.
5. Mask-arena canonicalization or random indirection costs dominate the saved pair/normalization work.
6. Backward preimage construction recreates an equivalent combinatorial explosion in a different form.

## Next experiments

1. **Frontier quotient census, no solver rewrite.** Instrument/replay the already exact CPU/C1 4x3, 4x4 and 5x5 frontiers. For every authoritative ownership record, map to `(support,H0,H1)` and count exact many-to-one collapse, per rank/support, plus conflicting W/D/L/frontier-class checks. This is the cheapest decisive experiment.
2. **6x5 C3-adjacent census.** At the already identified expensive rank/support region, measure how many generated ownership candidates map to already-seen hit-mask pairs before normalization. Do not run another blind 180 s solve.
3. **Reference quotient recurrence.** Implement a bounded CPU/reference BSFP realization over exact hit-mask pairs for complete small controls and compare every support frontier/root W/D/L with the existing oracle. This should explicitly test backward-preimage behavior, not only forward bisimulation.
4. **Mask-ref reuse census.** Measure unique P0 masks, P1 masks and mask pairs independently. Only introduce arena handles if sharing repays lookup/canonicalization.
5. **Device candidate only after the quotient survives.** If the census is strong, define a separate experimental profile rather than mutating C1. Keep generic set canonicalization in CUDA-Algorithms only if it is genuinely consumer-neutral; Connect Four line-incidence semantics remain here.

## External research notes

- Victor Allis, *A Knowledge-based Approach of Connect-Four* (1988): VICTOR reasons over potential winning groups and exact strategic rules that solve groups.
- Jun Kawahara et al., frontier-based ZDD work: fixed graph structure can be kept external while a compact frontier configuration is carried; equivalent suffix structures can be shared. This is an analogy for representation, not evidence that a ZDD should replace BSFP.
- ZDD literature: zero-suppressed decision diagrams are designed for sparse families of sets and gain compression by sharing equivalent subgraphs; operation size can nevertheless become the bottleneck.
- Exact state-abstraction/bisimulation literature: a quotient is behavior preserving when equivalent states have the same observations and corresponding transitions into equivalent classes. The proof obligation here is domain-specific and should be qualified directly against Connect Four semantics.

## Current conclusion

The strongest candidate is not 69 `{lineId,mask}` records and not 625 WSL records per state. It is:

```text
support skeleton (outer BSFP coordinate)
+ canonical P0 physical-hit line-mask ref
+ canonical P1 physical-hit line-mask ref
+ separately owned NDC/CPC certificate state only where required
```

Line identity is preserved by bit position. `lineId -> cells` and `cell -> incident line IDs` remain immutable geometry. WSL residual requirements are derived from `(support,lineId)` when needed.

This candidate attacks the number and semantics of symbolic states before Cartesian generation/normalization. It therefore merits an exact frontier census before further low-level normalizer work is allowed to dominate the design discussion.