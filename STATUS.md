# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Pre-cleanup snapshot:** `8bf24b6818b4e2775a3b41cd21e517b94e36271c`  
**Research direction / architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router. Retained history and controls remain under
`docs/research/**` and `reference/research-prototypes/**`.

## Objective

Derive the exact perfect-W/D/L P0 terminal winning-line set for standard 7x6 Connect
Four from structural proof. The suspected final cardinality is output only and is not a
premise, tuning target, or acceptance criterion.

## Governing semantic boundary

Value identity remains the C4-0010 quotient:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

Winning region:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

Output identity remains:

```text
q + exact P0 residual/origin provenance Pi0
```

The six-element absolute-P0 interval lattice remains the shared proof currency.
Certificate reuse is not state equality. Safety requires a complete legal response
policy; positive wins require well-founded progress.

## Accepted response/proof primitives

- pooled-frontier paired response;
- synchronized column-channel response;
- strict sibling interval elimination;
- local response-resource automata;
- singleton and forbidden-subset ownership closure;
- support-shadow race/preemption;
- exact output provenance `Pi0` when terminal-line identity is observable.

## Non-center first-move safety is now internally complete

All six non-center first moves are proved P0-non-winning without a solved opening table,
minimax recursion, or full physical game tree as proof authority.

Representative constructive replies:

```text
P0 1 -> P1 2
P0 2 -> P1 3
P0 3 -> P1 4
```

Reflection gives:

```text
P0 7 -> P1 6
P0 6 -> P1 5
P0 5 -> P1 4
```

Each proof is an asynchronous product of three tiny local response components:

```text
normal column:         4 P0-turn states / 3 edges / 0 invalid
initial coupled pair: 21 P0-turn states / 24 edges / 0 invalid
empty coupled pair:   43 P0-turn states / 50 edges / 0 invalid
```

Generated 69-line closure:

```text
opening 1 / reply 2: 48 singleton + 19 pair + 2 race = 69
opening 2 / reply 3: 49 singleton + 18 pair + 2 race = 69
opening 3 / reply 4: 56 singleton + 11 pair + 2 race = 69
```

All have zero unclassified P0 winning lines.

Therefore:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}
```

or equivalently each receives interval `[-1,0]`.

Authority:
`docs/research/2026-09-13-noncenter-opening-structural-safety-theorem.md`

Structural compiler:
`reference/research-prototypes/2026-09-13-perfect-play-winline/noncenter_local_policy_compiler.mjs`

Independent physical falsifier:
`reference/research-prototypes/2026-09-13-perfect-play-winline/noncenter_policy_full_control.mjs`

Evidence:
`docs/research/evidence/2026-09-13-noncenter-structural-safety.json`

## Independent physical qualification

The composed policies were separately executed over every reachable P0 choice:

```text
opening 1: 56,720 P0-turn states / 259,980 edges / 0 P0 wins / 0 invalid responses
opening 2: 56,720 P0-turn states / 259,980 edges / 0 P0 wins / 0 invalid responses
opening 3: 19,936 P0-turn states /  98,896 edges / 0 P0 wins / 0 invalid responses
```

These graphs are qualification only. The proof is the local-product induction plus the
69-line closure.

## Important new structural primitive

Support-shadow race/preemption:

```text
P0 upper winning line R
P1 one-row-lower winning line Q
policy proves every Q cell is P1-owned before its corresponding R cell can be P0-owned
---------------------------------------------------------------------------------------
Q completes before R, so R cannot be a P0 terminal line
```

This explains why blocker-only projections were incomplete: some P0 lines disappear
because P1 wins first, not because a P1 stone lies inside the P0 line.

## First-move proof boundary is now sharp

The non-center safety side is closed. The remaining first-move value gap is:

```text
P0 opening column 4 -> prove positive win by well-founded structural progress
```

If root `P0Win` were admitted externally, the exact existential predecessor together
with the six internal non-center `[-1,0]` bounds would force column 4 as the winning
first move. A complete self-contained solve proof still needs the center/root positive
proof itself.

## Immediate execution seam

Shift from safety to **center-positive progress**.

The next theorem must establish a finite, well-founded P0 progress certificate after
opening column 4, not merely show that P1 lacks a win. Candidate proof objects should
be expressed over exact C4-0010 `q` plus contextual CPC/WSL/NDC/resource facts and
should reduce every P1 alternative to a strictly smaller progress obligation.

Target form:

```text
center root certificate C
+ for every legal P1 reply b:
    exists legal P0 continuation a
    such that successor has certificate C'
    and rank(C') < rank(C)
+ terminal base = P0 win
------------------------------------------------
P0 opening 4 is winning
```

Do not import the known center win as proof authority. Exact search may discover/falsify
candidate ranks and response classes only.

## Hygiene

- `STATUS.md` / `next_step.yaml` contain current state only.
- Negative controls and incomplete experiments remain retained.
- Tied value reductions do not erase output paths without `Pi0` proof.
- The retired `2023 -> 419 + 1604` scratch count remains non-authoritative.
