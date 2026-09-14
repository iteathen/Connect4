# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router, not a historical ledger. Detailed evidence remains under `docs/research/**`; executable theorem controls remain under `research/semantic-quotient/**`.

## Objective

Derive a complete internal structural proof of standard 7x6 Connect Four perfect-play W/D/L, then exact P0 terminal winning-line provenance. External solved W/D/L is discovery/falsification evidence only, never a proof premise.

## Authority and proof boundary

- C4-0001 through C4-0005 are protected baseline authority in their scopes.
- C4-0006 and C4-0007 remain **Candidate** structural/proof research specifications.
- C4-0010 is an accepted **research** consumer specification for the quotient-native forward lane; consuming candidate clauses does not silently promote those upstream specs.
- Qualified executable controls establish theorem instances inside the research calculus; they do not change specification acceptance status.
- Ordinary quotient identity remains exact support plus normalized residual requirements. Temporal obligations, deadlines, proof terms, claim-relative theorem identity, execution-shard identity, and provenance are not silently collapsed into q.
- Unknown, theorem failure, candidate-action failure, and execution/resource failure are not loss.
- No implicit frame rule, player/ownership/column symmetry, q equality from claim-relative signatures, deadline regeneration, or unproved 69 -> 28 geometric-line reduction is accepted.

## Root boundary

All six non-center first moves remain internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The positive proof through opening column 4 remains unfinished. The repository does **not** yet claim a complete standard-7x6 solve. There are exactly 69 geometric winning lines.

## Obligation-first rho / kappa calculus

Distance-one induction remains

```text
rho(S) = (delta(S), mu(S))
```

with `mu` = remaining A/B/D/E/F capacity and `delta` = remaining capacity in the previously resolved C/G column. Distance-two induction uses

```text
kappa(S) = (d(S), delta(S), mu(S))
```

and delegates d=1 to rho.

Before ordinary rho at every P0 node:

```text
0 enabled P1 singleton obligations -> ordinary rho action basis
1 enabled P1 singleton obligation  -> exact blocking column only
2+ distinct enabled P1 obligations -> exact one-move response-capacity loss,
                                      after immediate P0 terminality is excluded
```

The clean rho corpus, kappa distance-two results, rank-18 partition `83W/1L`, and rank-16 partition `11W/1L` remain intact under this hardened ordering. Unique exact losses remain:

```text
rank18: 466565554644323332
rank16: 4665655546443233
```

## Qualified latent C1 state

Exact state

```text
466565554644
```

is structurally P0-winning via `P0:C1` with all seven P1 replies closed. The witness family is piecewise:

```text
C2 -> immediate P0:C3 terminal
G1 -> P0:G2 -> forced G3 block -> obligation-first rho(C3)
A1/B1 refusal -> P0:G1 seizure route -> forced G3 block -> obligation-first rho(C3)
D5/E5/F5 refusal -> P0:A1 -> exact B1 threat -> forced B1 block -> obligation-first rho(C3)
```

The earlier universal G1 refusal witness was falsified and is not reused.

```text
workflow: Frontier latent C1 full closure
run:      34882743270
result:   success
```

## Qualified D3 predecessor

Exact state

```text
4665655546
```

is structurally P0-winning via `P0:D3`:

```text
P1:D4     -> exact child 466565554644 -> qualified latent-C1 win
P1:not D4 -> immediate P0:D4 terminal win
```

D4 is therefore tactically forced if P1 avoids immediate loss; unique-zero-phase was not used as the forcing premise.

```text
workflow: Frontier D3 reply horizon closure
run:      34888051981
result:   success
```

## Qualified rank-9 universal predecessor

Exact P1-turn state

```text
466565554
```

is now structurally P0-winning because every legal P1 reply has an independently executable exact certificate:

```text
P1:A -> P0:F4 -> exact {C1,F5} double-threat response-capacity win
P1:B -> P0:F4 -> exact {C1,F5} double-threat response-capacity win
P1:C -> D3 -> forced D4 -> C2 -> forced C3 -> G1 -> distance-two/rho closure
P1:D -> P0:F4 -> exact {C1,F5} double-threat response-capacity win
P1:E -> P0:F4 -> exact {C1,F5} double-threat response-capacity win
P1:F -> exact child 4665655546 -> qualified D3 theorem
P1:G -> P0:F4 -> exact {C1,F5} double-threat response-capacity win
```

The C branch originally exhausted the shared quotient pool after the exact tactical chain reached `46656555434433`; this was execution pressure, not a logical falsifier. Fresh-kernel post-G1 reply isolation proved A/B/C/E/F plus immediate G3 terminal, while D5 required top-level rho action `C`, which proved by `resolved_tail_descent`. No proof-state or quotient-storage limit was raised.

```text
workflow: Frontier rank9 full reply closure
run:      34890470315
result:   success
```

Promoted consequence:

```text
466565554 in W
```

## Qualified rank-8 predecessor

Exact P0-turn state

```text
46656555
```

is structurally P0-winning via the exact D-column landing

```text
P0:D2 -> 466565554
```

The child is discharged by re-executing the complete seven-reply rank-9 theorem; no claim about alternative P0 moves is needed.

```text
workflow: Frontier rank8 D predecessor closure
run:      34890858920
result:   success
```

Promoted consequence:

```text
46656555 in W via P0:D2
```

## Current active seam: rank-7 P1 horizon

Move exactly one ply backward to

```text
4665655
```

which is P1 to move. The exact E reply reaches the newly qualified rank-8 state:

```text
4665655 -- P1:E4 --> 46656555
```

Focused diagnostic `Frontier rank7 reply horizon diagnostic`, run `34891083467`, succeeded and establishes the following boundary:

- all seven P1 replies A-G are legal nonterminal children;
- only E is presently a qualified winning child, by exact state identity with `46656555`;
- A/B/C/D/F/G have no immediate P0 terminal action, no enabled P0 singleton at the child, and no enabled P1 singleton obligation at the child;
- every immediate P0 action from those six children is nonterminal and gives P1 no immediate terminal override;
- `P0:F4` after A/B/C/D/E/G creates only the single P0 singleton `F5`, not the earlier `{C1,F5}` double threat;
- the rank-9 F4 double-threat circuit therefore cannot be transferred backward by analogy.

Next work is to classify the smallest exact structural continuation for A/B/C/D/F/G, beginning with candidate actions that create genuine support/temporal progress. E is consumed only by exact equality with the rank-8 theorem. Promotion of `4665655` requires all seven P1 children to close.

## Resource and proof hygiene

- Five-minute outer/inner execution wall: **300 seconds**.
- Preserve current proof-state and quotient/search-storage bounds.
- Execution sharding is hygiene only, never semantic identity.
- Do not raise limits merely to obtain a passing theorem.
- Unknown is not loss; candidate-action failure is not state loss.
- No deadline reset after clock advancement.
- No arbitrary physical-frontier broadening or unrestricted q recursion.

## Current evidence pointers

- `docs/research/2026-09-14-guarded-braid-transport-reversed-stutter.md`
- `docs/research/2026-09-14-forced-obligation-kappa-rank16-composition.md`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-latent-c1-full-closure.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-d3-reply-horizon-closure.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-rank9-c-reply-composed-closure.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-rank9-full-reply-closure.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-rank8-d-predecessor-closure.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-rank7-reply-horizon-diagnostic.mjs`
