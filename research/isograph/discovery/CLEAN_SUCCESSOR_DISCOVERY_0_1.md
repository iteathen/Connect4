# Clean successor Discovery Protocol pass 0.1

**Date:** 2026-09-19  
**Owner:** `research/semantic-quotient`  
**Hot-loop candidate:** `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.*`  
**Game-theory candidate:** `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.*`  
**Machine ledger:** `research/isograph/discovery/CLEAN_SUCCESSOR_DISCOVERY_0_1.json`  
**Protocols executed:** DP-01 through DP-45  
**Authority effect:** none

## Result

All 45 qualified Discovery Protocol routes were executed against both clean successors.

No new semantic defect was found.

No new implementation issue was created by this pass.

The principal result is architectural simplification.

## Hot-loop result

The cleaned hot-loop graph does not currently require NEI to justify any retained optimization.

The exact structure is:

```text
representation A
representation B
    -> exact scoped equivalence / reconstruction evidence
    -> choose lower-cost realization
```

Examples:
- signed versus unsigned prepared hash under exact 32-bit locator projection;
- signed versus unsigned isolated bit under `Math.clz32`;
- runtime cell mask versus precomputed mask;
- object pair incidence versus flat numeric incidence;
- residual scan versus direct singleton projection.

NEI becomes relevant only if a future optimization asks an actual identity question beyond those scoped equivalences.

This removes a substantial amount of conceptual machinery from the hot-loop graph.

## Game-theory result

The cleaned game-theory graph keeps the identity questions at the layer where they matter.

The central relation is:

```text
q =
support
+ normalized P0 residual antichain
+ normalized P1 residual antichain
```

The q-congruence derivation is candidate exact evidence that equal q determines the complete ordinary action-labelled future game.

That gives a candidate exact **ordinary future-behavior quotient**.

It does not collapse:
- physical occurrence;
- colored board position;
- move history;
- proof/certificate context;
- terminal-line provenance.

A derived NEI future-behavior SAME result is therefore possible only after the q theorem and NEI 0.4 successor semantics are qualified.

## QU result

The pass confirmed three distinct game-theory open regions:

1. evidence-independence uncertainty;
2. the missing clause/proof -> compact q/value controllable-predecessor law;
3. RBA representation/evaluation research unknowns.

They are not one generic UNKNOWN and are not automatically identity questions.

The hot-loop QU regions remain:
- V8 lowering;
- dynamic machine cost;
- workload distribution.

## Bayesian evidence result

No current Connect4 identity question has a qualified likelihood model that justifies a numerical Bayes factor.

Therefore:

```text
finite controls
test count
number of q collisions
number of successful replays
    != Bayes factor
```

The evidence remains structurally represented and unweighted.

## Full-protocol negative controls

The pass explicitly rejected:
- global whole-graph isomorphism;
- raw ID correspondence as identity;
- lexical/class/layout similarity as authority;
- treating RBA/proof QUs as QUI merely because both are unresolved;
- using exact value equality as complete future-behavior identity;
- using q equality as proof/certificate identity;
- treating old overlay ordering as semantic precedence.

## Promotion blockers

The clean graphs are ready for replacement qualification, but promotion is intentionally blocked on:

1. NEI 0.4 qualification or an independently qualified exact bridge;
2. independent standard-7x6 q-congruence review;
3. complete game-theory coverage mapping against authority 1.1 and post-1.1 successor claims;
4. final independent semantic qualification of both replacement candidates.

Until then:
- authority 1.1 remains the sole promoted Connect4 logic authority;
- the 1.2 game-theory graph is the sole active game-theory successor candidate;
- the 0.3 hot-loop graph is the sole active hot-loop interpretation;
- historical overlays are evidence/provenance only.

