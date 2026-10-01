# CPC rank-20 dual-obligation setup / transport probe 0.1

**Date:** 2026-10-01  
**Status:** frozen structural discovery design before execution  
**Branch:** `research/universal-structural-policy-20260930`  
**Superclass:** `RLC_RANKED_CONTROLLED_INVARIANT_CERTIFICATE_THEOREM.md`

## Source

Consume only the already-frozen structural evidence:

- `CPC_RANK20_C3_PROOF_ROUTING_DISCOVERY_0_1.json`;
- `CPC_RANK20_GENERIC_RCIC_ROUTE_MATCHER_DISCOVERY_0_1.json`.

Reconstruct all tested states again from exact RBA cofactors at pinned JSMinSys authority.

## Scope

The generic matcher has closed defender replies c1 and c5 after the exact rank-20 candidate `P1:c3`.

Only defender replies c6 and c7 remain.

Both exact children retain the two Player-1-aligned minimal residual pairs:

[
L={c1r3,c3r5},
qquad
R={c7r3,c5r5}.
]

The difference is support distance to the near pair endpoints.

## Purpose

Test the already-observed dual-obligation setup mechanism without introducing a new proof primitive.

A **setup endpoint** is an endpoint of a current aligned minimal size-2 P1 residual whose support distance is exactly 1.

For each unresolved child, test every such endpoint.

## Route grammar

For each setup endpoint (e):

1. P1 plays in the endpoint column, placing the token immediately below (e);
2. enumerate every legal P2 reply.

### Off-column P2 reply

If P2 does not play the setup column:

1. require no P2 first terminal;
2. require the endpoint itself to remain playable for P1;
3. P1 plays the setup column again, consuming endpoint (e);
4. require the original exact size-2 residual to contract to an active P1 singleton at its other endpoint;
5. require the singleton CPC projected owner to be P1;
6. require no currently playable P2 singleton;
7. synthesize the existing truncated target-reservoir pairing from that exact state;
8. exhaustively validate the finite RCIC under first-win precedence.

Accepted route:

`OFF_COLUMN_PAIR_CONTRACTION_TO_RESERVOIR_RCIC`.

### Same-column P2 reply

If P2 plays the setup column, P2 occupies endpoint (e).

Do not assign a value.

Record:

- exact resulting state;
- surviving P1-aligned minimal residual pairs;
- their support distances;
- current CPC baseline/frontier facts;
- exact known-root matches, if any.

Classify:

`TAKEN_ENDPOINT_OBLIGATION_TRANSPORT`.

This branch is discovery evidence for the next routing layer.

## Boundedness

This probe stops after:

- one P1 setup move;
- one P2 reply;
- for off-column replies only, one deterministic P1 endpoint-consumption move plus finite target-reservoir validation.

It performs no recursive exploration of taken-endpoint branches.

## Success criterion

Useful positive evidence is:

- all off-column replies after a setup close under the existing singleton target-reservoir RCIC;
- same-column replies preserve a smaller or clearly transported obligation resource;
- the same structural setup law works in both remaining defender children.

Complete rank-20 closure is not required.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, ordinary game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.

This is discovery evidence only.
