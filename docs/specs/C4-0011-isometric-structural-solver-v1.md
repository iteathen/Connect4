# C4-0011 — Isometric structural solver v1

**Status:** candidate research specification

**Research direction / structural architecture:** Josh Oshiro

## Purpose

Define the Connect4-owned **Isometric** solver family: the structural-calculus / frontier-exact line that grew out of the terminal-frontier experiment but is now independent of Negamax.

Isometric is a sibling of the BSFP, Research, and Negamax lineages. Historical descent from the forward Negamax experiment does not make Negamax recurrence, value orientation, proof procedure, or branch ownership authoritative here.

The current implementation still uses recursive alpha-beta/minimax machinery for unresolved residue. That machinery is an execution backend. The solver-family identity is the exact structural state and consequence system that increasingly resolves the game before recursive value backup is required.

## Shared structural dependencies

Read and preserve the shared Connect4 meanings from:

- **C4-0001** — legal Connect Four domain and first-win stopping;
- **C4-0006** — control parity, support/event semantics, residual win-space requirements, blocker semantics, antichain/exhaustion semantics;
- **C4-0007** — nested dependency closure, certificate, response/resource, timing and deadline semantics.

C4-0010 defines the separate quotient-native Negamax lane. It may be used as historical evidence, a control implementation, or an explicitly imported clause when independently justified, but it does not own Isometric semantics.

## Current Isometric state

The current implementation is inherited intact from the live terminal-frontier experiment at the Isometric split point.

It presently combines:

```text
incrementally maintained structural frontier
+ exact terminal/tactical structural consequences
+ transposition-table bounds/exact values
+ advisory structural move ordering
+ recursive alpha-beta minimax for unresolved residue
+ heuristic evaluation only after exact frontier closure fails at the depth horizon
```

This is not canonical Negamax. In particular, the current recursive implementation fixes root-player value orientation and alternates explicit max/min behavior rather than applying the canonical `-search(child, -beta, -alpha)` recurrence.

## Exact frontier consequences currently admitted

Subject to first-win stopping and the maintained frontier semantics:

- a playable current-player singleton completion is an exact terminal win at physical distance `+1` ply;
- two or more distinct playable opponent singleton completions are an exact forced loss at physical distance `+2` plies when no current-player immediate win supersedes them;
- one playable opponent singleton completion gives a forced transition but does **not** by itself determine an exact value;
- structural terminal/frontier facts are maintained once in transition state and reused by terminal, tactical, ordering, and evaluator consumers where their contracts permit;
- structural move-order effects are advisory unless a separately qualified theorem upgrades them to an exact value or interval consequence.

At a finite search horizon, exact frontier consequences are consumed before heuristic evaluation. If no exact consequence closes the state, heuristic evaluation remains a residual approximation and the finite-depth result is not thereby promoted to a globally exact solution.

## Solver identity boundary

Isometric remains allowed to use minimax/alpha-beta, TT lookup, or another recursive backend while those mechanisms compute unresolved residue.

The primary solver identity changes only when value authority changes:

1. If state value is still obtained by alternating max/min over recursively enumerated unresolved successors, minimax remains an execution backend.
2. If structural rules, certificates, quotient propagation, or fixed-point closure derive the state value without requiring that recursive backup, the recursive backend becomes subordinate fallback machinery.
3. Legal move generation may remain useful for instantiating structural consequences without making the solver a move-tree algorithm by identity.

This specification therefore avoids calling Isometric either Negamax or a completed non-search exact solver prematurely.

## Proof and qualification rules

- Structural theorem claims require their stated guards; finite solved tables and stronger/deeper searches are validation/falsification evidence, not theorem premises.
- Unknown is not loss, absence of a forcing certificate is not draw, and lower residual degree is not signed value without a qualified coupling.
- Exact certificates retain support, resource, controller/opponent quantifiers, deadlines, and first-win timing where those facts affect validity.
- TT reuse is legal only under a state identity sufficient for the stored semantic claim.
- Advisory ordering evidence must be qualified across independent workloads before promotion; a reduction on one fixture is not enough.
- Historical incumbent/Negamax behavior is evidence, not compatibility authority when a semantic defect is proven.

## Ownership and migration

The root branch `isometric` is the active branch for this solver family.

`research/terminal-frontier-horizon-exact` and draft PR #45 are retained only as historical provenance for the pre-split experiment. New Isometric semantics, implementation, experiments, qualification evidence, and current-state routing belong on `isometric` unless a later explicit ownership decision says otherwise.
