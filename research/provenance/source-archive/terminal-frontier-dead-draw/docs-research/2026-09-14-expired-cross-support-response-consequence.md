# Expired cross-support response: support seizure and branch-composed rho closure

**Date:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Result

The reversed-ownership `B1 -> B2` pair is not a same-contract stutter. After `P0:C1`, the latent cross-support contract requires `P1:G1` on the next P1 turn. `P1:B1` consumes that causal-clock tick. Restoring the old contract after `P0:B2` would regenerate an expired deadline and is therefore forbidden.

The missing consequence is not contract reset. It is **support seizure**.

At the exact refusal state

```text
46656555464432
```

the old `P1:G1` response obligation is expired-unsatisfied, but `G1` remains directly playable. P0 can therefore play `G1` as a new P0-owned support event. This does not satisfy or reset the old P1 response obligation.

The permanent qualifier proves:

```text
46656555464432 in W
witness: P0:G1
```

without solved W/D/L labels or external solver authority.

## Exact closure

After `P0:G1`:

- P1:C2 exposes immediate P0:C3 terminality;
- P1:G2 exposes immediate P0:G3 terminality;
- P1:A/B/D/E/F leaves both C3 and G3 live at support distance one.

For every off-subsystem reply, P0 advances `G2`:

- any P1 non-G3 response exposes immediate P0:G3 terminality;
- exact P1:G3 blocks that target but leaves C3 live at distance one;
- the resulting state is discharged by a `G4` resolved-tail action whose complete P1 reply horizon is composed from independently qualified `rho=(delta,mu)` child certificates.

Thus every legal P1 reply after the P0:G1 witness is closed.

## Branch composition vs. execution resource

A monolithic rho proof initially exhausted the fixed quotient state pool on some E/F branches. This was not interpreted as logical failure.

The exact P0:G4 action was instead qualified by explicit alternating-predecessor composition:

```text
P0:G4
-> enumerate every legal P1 reply
-> immediate P0 terminal, or
-> exact independently qualified rho child contract
```

Each nonterminal child was proved in a fresh kernel with unchanged limits:

```text
proof-state cap: 100000
states:          262144
classes:         524288
chunksPerSlot:   131072
```

All E and F children proved independently. Execution partitioning is hygiene only and is not semantic identity.

The generic executable composer is:

`research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-rho-action-branch-composition.mjs`

The exact B1 refusal theorem is:

`research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-expired-response-b1-closure.mjs`

The permanent workflow is:

`.github/workflows/frontier-expired-cross-support-response.yml`

Focused run `34867789785` passed the expired-response observation, exact B1 closure gate, and the existing resolved-tail rho regression. The rho regression remained 12/12 proved with zero resource failures.

## Structural lesson

The retained causal law is:

> If a response obligation expires because the obliged player spends its deadline-bearing turn elsewhere, the old obligation cannot be reset. If the response event remains legally open, the opponent may acquire that event only through a new exact transition. Any theorem using the resulting ownership must then be composed under the new residual/phase/deadline/resource state.

This is stronger and safer than a stutter law. It makes causal-clock age load-bearing while still allowing a missed response to create a positive structural consequence.

## Current boundary

This note proves only the exact B1 refusal after P0:C1. It does not yet generalize to A/D/E/F refusal events, and it does not yet prove `466565554644 in W`.

The next exact obligation is to classify every legal P1 reply after P0:C1 from `466565554644`. Off-subsystem refusals must be qualified independently; the on-contract G1 reply and any target-column deviation must also be closed before the latent root can be promoted.
