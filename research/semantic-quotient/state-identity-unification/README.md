# State identity unification experiment

**Status:** SIU-1 passed on complete bounded controls; operational/performance qualification open

**Branch:** `research/semantic-quotient`

## Question

Can Connect Four state identity be reduced from physical colored-board identity to one smaller exact relational state that can serve minimax/alpha-beta, CUDA-BSFP and hybrid confluence without forcing any solver into a slower physical representation?

This packet is solver-neutral. It does not own production search control flow, CUDA-BSFP execution, hybrid scheduling or solver-specific state layouts.

## Common relational language

SIU-1 tested the logical state already present in the BSFP residual semantics:

```text
q = supportIndex
  + sideToMove
  + normalized P0 residual winning-requirement antichain
  + normalized P1 residual winning-requirement antichain
```

`supportIndex` is the BSFP support/accessibility skeleton. The residual requirements are surviving future winning relationships rather than a colored ownership board.

For ordinary legal play, `sideToMove` is derivable from support rank parity, but it remains explicit in the logical contract because solver/proof orientation may require it.

## SIU-1 result

The first experiment deliberately went beyond a shadow-key census. The same `q` drove:

1. deterministic forward transitions without recursive colored-board state;
2. exact distance-sensitive strong-score evaluation;
3. exact per-column action scores;
4. exact reverse W/D/L closure using relational IDs plus the inverse relation;
5. comparison against an independent physical-state oracle;
6. comparison against the existing BSFP ownership-antichain W/D/L solver.

Across complete 4x3 c3, 4x4 c4, 5x3 c4 and 4x5 c4 controls:

```text
physical states checked: 1,681,808
exactness mismatches:             0
BSFP W/D/L mismatches:            0
reverse-closure mismatches:       0
```

Observed physical-to-relational compression ranged from **1.247x to 13.431x**. On 4x5 c4, 1,385,521 physical states collapsed to 294,593 relational states; one relational identity represented as many as 37,080 physical states.

Evidence:

- `src/siu1-relational-dual-direction.mjs`
- `evidence/2026-09-11-siu1-relational-dual-direction.json`
- `SIU1_RESULT.md`
- workflow run `34632643724`, job `103372941221`

## Important result: forward function, backward relation

The quotient is exact but is not state-level reversible.

Forward play is deterministic:

```text
T(q, column) -> terminal | q'
```

The inverse is generally set-valued:

```text
T^-1(q', column) -> {q1, q2, ...}
```

On 4x5 c4, 127,374 `(child,column)` pairs had more than one relational predecessor, with as many as 21 parents for one pair.

This is not a reason to restore colored history. Useful quotienting naturally loses distinctions that do not affect future behavior. The common algebra should therefore expose both:

- a cheap deterministic forward image for search;
- an exact symbolic inverse-image/preimage operator for BSFP.

An explicit reverse CSR proves correctness but nearly duplicates transition storage, so the next backward-facing experiment should derive the preimage symbolically rather than materialize every reverse edge.

## Working distinction

Keep three concepts separate:

1. **Operational state** — whatever physical representation makes one solver fastest.
2. **Semantic identity** — the exact relational identity `q` shared across solver boundaries.
3. **Proof state** — W/D/L, strong score, alpha-beta bounds, BSFP frontiers or other certified facts associated with `q` or sets of `q`.

SIU-1 strengthens the hypothesis that semantic identity can be unified without requiring physical representation unification.

## Current gaps

### Minimax hot-path economics

Exactness is established on the bounded controls, but the prototype uses BigInt masks, normalized arrays, objects and string keys. Direct alpha-beta must still prove that relational navigation can compete with a highly optimized bitboard hot path.

The minimax-facing follow-up must measure:

- transition cost;
- dense/packed identity and interning cost;
- TT hit increase from semantic merging;
- total nodes and wall time;
- immediate-win / forced-response extraction;
- move ordering and symmetry handling;
- evaluator or NN features that are not directly encoded by `q`.

### BSFP preimage economics

Current BSFP can symbolically compress solved regions more aggressively than explicit relational-state enumeration. On 4x5 c4, the relational automaton had 294,593 states while the ownership-antichain BSFP solution used 40,707 Win/Loss boundary records.

Therefore BSFP should not be forced to enumerate every `q`. It should learn to express its symbolic predecessor/frontier operations in the same relational algebra.

### Standard 7x6 scale

No exhaustive 7x6 relational-state census or speed claim exists. WSL-625 and the 823,543 support skeletons provide finite structural universes, not a bound proving that all reachable relational combinations are economical.

## Revised experiment program

### SIU-1 — relational dual-direction exactness — **PASS**

Establish a common BSFP-aligned state language, direct forward transition sufficiency, exact strong/action scores, exact reverse closure, compression and inverse-relation ambiguity.

### SIU-2 — direct relational alpha-beta

Run alpha-beta recursively on `q` without a colored board in recursive state. Compare fairly against positional search while decomposing node savings versus per-node relational cost.

### SIU-3 — useful semantic TT / identity economics

Measure whether merged relational identity produces useful earlier TT facts and net wall-clock savings under fair TT memory and ordering controls.

### SIU-4 — packed incremental transition

Replace research objects/string keys with dense or packed incremental relational transitions and measure the true hot-path cost.

### SIU-5 — symbolic relational preimage

Implement `Pre_a(Q)` over relational sets/frontiers without materializing the complete reverse graph. Compare against the explicit reverse relation from SIU-1.

### SIU-6 — cross-solver proof contract

Use the common identity/algebra as the publication/query contract between minimax, BSFP and hybrid while retaining solver-native physical layouts when those remain faster.

## Promotion rule

No solver branch receives speculative state machinery merely to make the architectures look unified.

Promotion requires:

1. exactness for the intended consumer contract;
2. notable net performance gain or a necessary cross-solver capability;
3. clear ownership and lifecycle boundaries;
4. no material regression to solver-native hot paths.

## Current architectural hypothesis

The strongest candidate is now:

```text
                 one exact relational game algebra
                           q
              /             |              \
     forward image       inverse image      proof/classify
       T(q,a)             Pre_a(Q)             over q
          |                  |                   |
       minimax              BSFP               hybrid
```

The engines can therefore speak the same language through and through without being forced to use the same data structure or execution schedule.

## Non-claims

- no standard 7x6 exhaustive quotient proof;
- no production minimax speedup yet;
- no claim that BSFP should enumerate all relational states;
- no claim that the relational transition is reversibly functional;
- no requirement for shared mutable physical state.
