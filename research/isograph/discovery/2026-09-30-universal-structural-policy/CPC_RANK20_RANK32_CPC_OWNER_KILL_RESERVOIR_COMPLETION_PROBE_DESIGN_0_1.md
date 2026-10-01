# CPC rank-20 / rank-32 CPC owner-kill reservoir completion probe 0.1

**Date:** 2026-10-01  
**Status:** frozen research-side completion probe before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Source evidence

Consume only:

- `CPC_RANK20_RANK32_TARGET_RESERVOIR_REJECTION_LOCALIZATION_0_1.json`
- `CPC_RANK20_RANK32_RECURRING_Q_GENERIC_RCIC_AUDIT_0_1.json`
- pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`

Production CPC remains read-only.

The rejection-localization evidence contains 39 exact `NO_COMPLETE_TEMPLATE` attempts. Across the frozen maximum-coverage uncovered sets there are 97 uncovered P2 residual occurrences. Every one of those 97 residuals contains at least one cell whose current CPC target-owner projection is Player 1.

This 97/97 observation is the hypothesis trigger only. It is not yet a discharge theorem.

## Question

Is the current target-reservoir synthesizer over-rejecting exact certificates because it requires explicit response-pair coverage of P2 residuals that CPC already makes incompatible with P2 ownership?

Define, for this probe only:

```text
CPC-owner-incompatible P2 residual R
  := R contains at least one cell x
     with connect4CpcTargetOwner32(q,x) = P1
```

The probe does **not** assume that this predicate is a universal residual-kill theorem.

Instead it asks whether the already-enumerated target-response pairings become exact finite certificates when every uncovered residual is owner-incompatible and the existing unchanged exhaustive pairing-policy validator is applied.

## Frozen execution

For each of the 39 source `NO_COMPLETE_TEMPLATE` attempts:

1. reconstruct the exact representative q state from the frozen move sequence;
2. execute the frozen setup move and verify support/target identity against source evidence;
3. reconstruct every frozen maximum-coverage target-response-valid pairing candidate;
4. recompute every candidate's uncovered P2 residual cells from exact RBA geometry;
5. recompute CPC projected owner for every uncovered residual cell;
6. classify a candidate as `OWNER_KILL_ELIGIBLE` only if **every** uncovered P2 residual contains at least one CPC-projected P1 cell;
7. reconstruct the candidate pair map without adding any response edge;
8. run the existing exhaustive deterministic pairing-policy traversal unchanged.

A candidate is accepted only if:

```text
all uncovered residuals are OWNER_KILL_ELIGIBLE
AND
unchanged exhaustive pairing traversal passes
```

The traversal must still reject:

- any P2 terminal;
- any unmapped defender trigger;
- any response that is not playable;
- any wrong-side or unexpected terminal;
- any no-legal-move-before-P1-win path.

## Exact finite result versus theorem

If a candidate passes, this establishes an exact finite fixed-policy certificate for that exact post-setup state.

It does **not** by itself authorize deleting arbitrary P2 residuals based on CPC owner projection in the general target-reservoir synthesizer.

A reusable theorem would require a separate guard-survival/congruence proof explaining when CPC owner incompatibility remains valid under the response policy.

## q-class impact

For each of the 34 recurring rank-32 q hubs, report whether at least one legal P1 setup action now has an accepted exact owner-kill-validated pairing certificate.

Then report how many of the 91 incoming consequence transitions from the recurring-q audit land in newly closed q classes.

Do not infer values for still-unclosed q classes.

## Required negative evidence

Preserve separately:

- no maximum-coverage target-response-valid pairing;
- uncovered residual lacking a P1-projected cell;
- pairing traversal failure after owner-kill eligibility;
- validation/resource failure.

The smallest counterexample is more important than closure count.

## Boundary

This is RLC research-side certificate qualification only.

No oracle, Pons score, solved W/D/L, minimax, unrestricted game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.
