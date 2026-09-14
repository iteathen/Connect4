# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router, not a historical ledger. Detailed evidence remains under `docs/research/**`; executable theorem controls remain under `research/semantic-quotient/**`.

## Objective

Derive a complete internal structural proof of standard 7x6 Connect Four perfect-play W/D/L, then exact P0 terminal winning-line provenance. External solved W/D/L is discovery/falsification evidence only, never a proof premise.

## Authority status

Acceptance status is part of authority.

- C4-0001 through C4-0005 are protected baseline authority in their scopes.
- C4-0006 is a **Candidate** structural research specification for CPC/WSL mathematics.
- C4-0007 is a **Candidate** proof/certificate research specification for NDC semantics.
- C4-0010 is an accepted **research** specification for the quotient-native forward lane; importing C4-0006/C4-0007 clauses does not silently promote those upstream specs.
- Qualified executable controls establish theorem instances inside the research calculus; they do not change specification acceptance status.

## Semantic and proof boundary

The working structural stack is:

```text
E  causal support / enabled events
R  residual winning-requirement antichains
P  CPC / GF(2) phase / precedence
C  temporal contracts / response resources / deadlines
N  guarded dependency closure
G  alternating predecessor fixed point
Q  observation-sensitive value / provenance quotients
```

Ordinary quotient identity remains exact support plus normalized residual requirements. Temporal obligations, deadlines, proof terms, claim-relative theorem identity, execution-shard identity, and provenance are not silently collapsed into q.

The logical-map audit remains in force:

- exact ordered causal-clock accounting;
- event-certified obligation creation/discharge;
- path-local interchange validation;
- no deadline regeneration;
- generic target-row support-distance arithmetic;
- non-vacuous dual-target closure;
- no latent-policy/live-deadline conflation;
- no implicit frame/player/ownership symmetry;
- unknown, theorem failure, and resource failure are not loss.

## Root boundary

All six non-center first moves remain internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The positive proof through opening column 4 remains unfinished. The repository does **not** yet claim a complete standard-7x6 solve.

There are exactly 69 geometric winning lines. No 69 -> 28 reduction is accepted.

## Obligation-first rho calculus

Distance-one induction remains

```text
rho(S) = (delta(S), mu(S))
```

with `mu` = remaining A/B/D/E/F capacity and `delta` = remaining capacity in the previously resolved C/G column.

Before ordinary rho at every P0 node:

```text
0 enabled P1 singleton obligations -> ordinary rho action basis
1 enabled P1 singleton obligation  -> exact blocking column only
2+ distinct enabled P1 obligations -> exact one-move response-capacity loss,
                                      after immediate P0 terminality is excluded
```

The clean rho corpus, kappa distance-two results, rank-18 partition `83W/1L`, and rank-16 partition `11W/1L` remain intact under this hardened ordering.

## Qualified latent C1 state

The exact state

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

Focused qualification: `Frontier latent C1 full closure`, run `34882743270`, success under the 300-second wall.

## Qualified D3 predecessor

The earlier exact state

```text
4665655546
```

is now structurally P0-winning via

```text
P0:D3
```

The complete P1 reply horizon after D3 has a two-case exact proof:

```text
P1:D4     -> exact child 466565554644 -> consume qualified latent-C1 win
P1:not D4 -> immediate P0:D4 terminal win
```

Thus D4 is tactically forced if P1 wants to avoid immediate loss. The proof does **not** use “unique zero phase” as a forcing premise; phase observation only helped expose the hinge earlier.

Focused qualification:

```text
workflow: Frontier D3 reply horizon closure
run:      34888051981
result:   success
wall:     timeout 300s
```

Promoted consequence:

```text
4665655546 in W via P0:D3
```

This proves only that exact predecessor. It does not prove the rank-9 parent, the center opening, or the empty-board root.

## Current active seam

Move exactly one ply backward to the P1-turn predecessor:

```text
466565554
```

The known P1 reply

```text
466565554 -- P1:F --> 4665655546
```

reaches the newly qualified P0-winning child. To promote `466565554` as P0-winning, **every** legal P1 reply from that exact state must be closed by an exact P0-winning child theorem.

Next work:

1. enumerate every legal P1 reply from `466565554`;
2. record exact terminal, enabled-singleton, support, phase, and obligation surfaces at each P0 child;
3. consume the new `4665655546` theorem only for the exact F child;
4. derive independent contracts for the other replies; no symmetry or phase-only inference;
5. promote the rank-9 state only if the full adversarial reply horizon closes.

## Resource and proof hygiene

- Five-minute outer and inner execution wall: **300 seconds**.
- Preserve existing proof-state and quotient/search-storage bounds.
- Execution sharding is hygiene only, never semantic identity.
- Unknown is not loss; candidate-action failure is not state loss.
- No deadline reset after clock advancement.
- No implicit frame rule, player/ownership symmetry, or q equality from claim-relative signatures.
- No arbitrary physical-frontier broadening, unrestricted q recursion, or cap increase merely to make a theorem pass.

## Current evidence pointers

- `docs/research/2026-09-14-guarded-braid-transport-reversed-stutter.md`
- `docs/research/2026-09-14-forced-obligation-kappa-rank16-composition.md`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-expired-response-refusal-closure.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-latent-c1-full-closure.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-d3-reply-horizon-closure.mjs`
- `.github/workflows/frontier-logical-map-audit.yml`
- `.github/workflows/frontier-latent-c1-full-closure.yml`
- `.github/workflows/frontier-d3-reply-horizon-closure.yml`
