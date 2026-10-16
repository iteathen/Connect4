# All-depth owner-mask residual path lift — rule-only transition to game completion

**Date:** 2026-10-16. Canonical owner `research/semantic-quotient`.
**Predecessor:** `MOVE7_MOVE8_COLUMN_CLOSURE_RESULTS_0_1.json` and the strictly bounded virtual-upset-five-ply control. All transitions are qualified under game-theory authority 1.2, not new ordinary game rules.
**Scope:** prove/check that owner-labelled residual-cofactor transformations compose without requiring a new kind of state transition at ranks 7/8 or any later rank, including when columns reach full capacity. This is NOT full strategic W/D/L branch elimination.

## Algebraic lemma frozen before experiment

For ANY legal first-win-stopped **nonterminal** initial q=(h,R0,R1), let A0 and A1 be disjoint sets of future cells placed by P0 and P1 respectively over a finite legal continuation **before terminal**. For either i in {0,1}:

  R_i[after] = Min( { r minus A_i : r in R_i[initial], r intersect A_(1-i) is empty } ).

Equivalently, for future-cell S disjoint from A0∪A1,

  U_i_after(S)
  = exists r in R_i_initial:
      (r intersect A_(1-i) = empty) AND (r subseteq (S union A_i)).

These statements are exact from true owner cofactor/false blocker cofactor and antichain absorption, independent of **order of independent cell events** once ownership is fixed. The *legality*, *gravity availability*, *side to move*, *first-win stopping* and *terminal time* DO depend on prefixes and must be checked each step before using the nonterminal version. A full column removes its legal landing but does not create a new residual transformation rule.

To detect terminal at the next move x of player i, update accumulated A_i, calculate whether some original unblocked residual of player i has become empty; check this **before** full-board draw and stop immediately. This handles first-win precedence without constructing intermediate q states.

The column-support phase law is separate: phi_c=(H-h_c) mod2, phi'=phi XOR e_c on a legal move; full-capacity flag h_c=H is indispensable, since phase=0 does not distinguish a full from an empty column.

## Fixed, validation-only campaign

1. Implement source-residual owner-mask path lift and virtual upset queries using ONLY original q and accumulated owner masks. Candidate does NOT select moves or use oracle/policy/game-tree search.
2. Independent physical rule checker generates up to 200 legal standard 7x6 playouts using reproducible seeded pseudorandom legal actions and a subset of bounded terminal-avoiding **validation-only fixtures**. Budget <=4000 attempts and <=20,000 physical move checks. Prefer coverage of every support rank through 41, and draw rank42 only if safely reachable; report missing ranks honestly.
3. On each physical validation step compare (a) independent direct first-win terminal from last placed stone, (b) path-lift terminal/draw, (c) full normalized source-owner-mask-derived q vs physically reconstructed q and (d) ordinary exact one-move q cofactor. Include owner mask and support conservation, GF2 phase and legality.
4. On every fifth nonterminal step, compare virtual source-upset queries for all legal landing singletons plus deterministic pairs/triples to actual materialized q. Preserve checks and first failing q.
5. Force first-win boundary examples (initial early won path), `444444` center full, paths through rank7/8 on both move-6/move-7/move-8 completion timings, and late-game near-full fixture controls.
6. Use no external WDL oracle to generate moves or verify ordinary strategy; the physical model is **independent validation only**. No search-generated winning policy is a producer input.

Predeclared budgets: at most 20,000 independent physical move checks, 250,000 virtual upset queries, 2,000,000 residual inclusion comparisons and 45 seconds total isolated V8. Stop on cap and declare PARTIAL with monotone evidence; no expansion into a game-tree search.

**Interpretation:** Success proves exact **transition-rule continuity** for arbitrary legal fixed histories (by algebra) and tests it to all *reached* ranks. It does **not** classify unproved early 7x6 move values, eliminate arbitrary-depth existential/universal branching, or show that compressed response-cover antichains stay polynomial when iterated.
