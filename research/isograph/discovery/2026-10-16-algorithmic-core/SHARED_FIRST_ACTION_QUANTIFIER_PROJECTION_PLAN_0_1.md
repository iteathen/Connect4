# Frozen experiment 0.1: one shared quantified future, complete first-action vector

**Date:** 2026-10-16 (Pacific). **Owner:** research/semantic-quotient.
**Live branch at freeze:** 64f9dd1ba13823902e90aff253cd6693d14122e7.
**Status:** PLAN, no candidate result or game-value qualification.

## Mathematical objective
Primary goal is exact nonbranching strategic action choice, including **all** W/D/L-optimal literal moves and ties. The original recursive core is already complete; this tests a stronger property.

Let source q be legal nonterminal and k <= unoccupied cells. Existing rule-derived guard-complete action-QBF matrix F_z(a0,...,a[k-1]) represents each P0-relative Boolean threshold z in {Wlo,Nlo,Whi,Nhi}; future action blocks are existential for P0 and universal for P1, with first-win, draw, invalid-code/full-column neutralization.
Define

  G_z(a0) = Q_1 a1 ... Q_(k-1) a[k-1] F_z(a0,...,a[k-1]).

**Prove** for each legal literal column c that G_z(c) equals the corresponding depth-k bounded Bellman action threshold, with no new fixed-first-action QBF or independent successor-value solve. Retain a0 free until all inner choices have been eliminated. In particular, do not turn forall-reply exists-response into exists-response forall-reply. For player-to-move P0, aggregate action intervals with max; for P1 use min. When every action interval is exact, output (exact W/D/L, complete set of all actions of equal optimal W/D/L); otherwise expose UNKNOWN and never promote an incomplete set to complete.

Construct a single shared source-only gate DAG per threshold and quantify every future action bit exactly once for the entire action vector. It may still blow up due to nested adaptive obligations. This is **one-step action-vector sharing**, not a proof of universal branch elimination.

## Falsifiers and independently frozen controls
- Original exact source-QBF builder and existing live-compact Shannon projection; no altered game-theory authority.
- 4x3 Connect3 and 4x4 Connect4 physically legal predeclared histories (including 223, 1212 where legal); standard7x6 44444 and 444444. Test k<=5 first, then attempt k6 within original per-compile resource caps; stop at first source-specific failure.
- Full-game short suffix controls at rank N-4 or N-5 on both small geometries, selected by deterministic position enumeration WITHOUT inspecting outcomes; reference exact physical minimax (independent), value of every legal action and optimal set including ties. Already-terminal histories excluded with reason.
- For k<=6, compare each four-threshold action vector to independent physical bounded-depth first-win min/max, including literal first-action-fixed QBF controls. Test reflection transport on symmetric q, full-column exclusion, upper/lower cutoffs and the legal 223 quantified-order counterexample.
- Compare total source construction+projection Boolean/cofactor work and peak retained gates of ONE shared action vector against SEPARATE fixed-first-action projections on the same input and same per-query caps. Count even unsuccessful baseline work and original CNF graph construction; never compare only output expression sizes.
- Original unchanged limits per compile: 60,000 retained BDD/Boolean DAG nodes, 300,000 nontrivial Boolean operations, 10,000 support representatives, 15 seconds. Charge live compaction/graph/traversal separately, no hidden game-state enumeration in producer.

## Success / stop
A positive partial result is a proved and independently tested one-pass complete optimal-action vector on full-horizon small suffix states with measured savings over separate action evaluations. A stronger result requires deep/general branch elimination, not merely skipping seven repeated roots. A null/unknown on 44444 remains unknown. Any projected width wall or counterexample must be recorded without making a general hardness claim. Do not promote IsoGraph authority or merge.
