# IsoMax rank-local pre-search integration 0.1

Date: 2026-10-01 America/Los_Angeles

Status: implemented research integration; not a universal perfect-play theorem promotion.

## JSMinSys implementation

Branch:
`research/cpc-guard-proof-memo-nees-v1`

Integrated head:
`c8b450ae01073a684b68d492ec42a03403d56b2f`

Production CPC file `addons/cpc-connect4.mjs` was not modified. BSFP was not modified.

New LEGO pieces:

- `addons/connect4-rank-local-presearch.mjs`
  - pure current-state landing measurement and conservative local certificate;
- `addons/rba-connect4-move-selector.mjs`
  - thin IsoMax wrapper: local certificate first, unchanged Lazy SMP only on UNRESOLVED.

Existing `runLazySmpConnect4Rba32` is unchanged.

## Runtime rule

For each current legal landing c:

- A(P,c): mover-live winning lines containing the landing;
- B(P,c): opponent-live winning lines containing the landing, hence denied by occupying it;
- H(P,c): remaining empty same-column cells above the landing.

Pareto dominance uses (A,B).

A move is returned only when:

1. exactly one legal landing is Pareto-maximal;
2. that unique maximum has H > 0.

If the unique maximum has H = 0, the result is `UNRESOLVED / UNIQUE_MAX_EXHAUSTS_COLUMN`. The calculator does not discard the maximum and choose a runner-up.

No literal opening prefix is encoded.

## Required controls

The same rule produces:

- empty -> c4, (A,B,H)=(7,7,5)
- 4 -> c4, (9,10,4)
- 44 -> c4, (11,12,3)
- 444 -> c4, (10,11,2)
- 4444 -> c4, (8,8,1)
- 44444 -> UNRESOLVED; c4 remains the unique incidence maximum at (6,6,0)
- 41 -> c4, (10,9,4)

Thus a bad/deviating move is handled by recalculation from the actual state; there is no expected-line recovery logic.

## CI / NEES

Workflow:
`Connect4 Rank-Local Pre-Search`

Green run:
`36969689273`

Head:
`c8b450ae01073a684b68d492ec42a03403d56b2f`

Results:

- 5 tests passed, 0 failed;
- first-five structural controls passed;
- move-six unresolved boundary passed;
- 41 deviation control passed;
- descriptive candidate trace contract passed;
- IsoMax wrapper pre-search bypass control passed;
- JSMinSys catalog verified with 198/198 add-on units cycle-ledgered.

A red TDD run was recorded first at workflow run `36969412243`, failing with `ERR_MODULE_NOT_FOUND` before the implementation existed.

## Claim boundary

The module proves that this declared local rule reaches or fails its own certificate condition from rank-local geometry. It is an additive research integration and is not promoted here as a universal theorem that every returned move is perfect on every legal Connect Four state.

No oracle or solved W/D/L is consumed at runtime.
