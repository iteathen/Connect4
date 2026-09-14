# Connect4 current research status

**Updated:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This file is a current-state router, not a historical ledger. Detailed evidence remains under `docs/research/**`; executable theorem controls remain under `research/semantic-quotient/**`.

## Objective

Derive a complete internal structural proof of standard 7x6 Connect Four perfect-play W/D/L, then derive exact P0 terminal winning-line provenance. External solved W/D/L may be used only as discovery/falsification evidence, never as a proof premise.

## Authority status

Acceptance status is part of authority.

- C4-0001 through C4-0005 are protected baseline authority in their scopes.
- C4-0006 is a **Candidate** structural research specification for CPC/WSL mathematics.
- C4-0007 is a **Candidate** proof/certificate research specification for NDC semantics.
- C4-0010 is an accepted **research** specification for the quotient-native forward lane; importing C4-0006/C4-0007 clauses does not silently promote those upstream specs.
- Qualified executable controls establish theorem instances inside the research calculus; they do not change specification acceptance status.

## Semantic boundary

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

## Root boundary

All six non-center first moves remain internally structurally proved P0-nonwinning:

```text
V(opening c) <= 0 for c in {1,2,3,5,6,7}.
```

The unresolved empty-board problem remains the positive structural proof through opening column 4. The repository does **not** yet claim a complete standard-7x6 solve.

There are exactly 69 geometric winning lines. No 69 -> 28 reduction is accepted.

## Logical-map audit corrections

The 2026-09-14 audit tightened the proof substrate before allowing further promotion:

- guarded braid transport now uses exact ordered causal-clock accounting and event-certified obligation creation/discharge;
- interchange validates each transported path rather than comparing finishes only;
- live deadlines cannot be regenerated after their causal clock advances;
- generic target-distance arithmetic is derived from the target cell rather than hard-coded to row three;
- dual-target certificates require the exact direct-support landing guard and cannot close vacuously with zero exits;
- the D3/D4 bridge no longer labels a latent response policy as an already-live deadline obligation;
- C4-0006/C4-0007 Candidate status is explicit in `AGENT_LOCAL.md`;
- proof failure, resource failure, and unknown remain distinct from loss.

The hardened logical-map audit and pre-alpha regressions are green.

## Obligation-first rho calculus

The retained distance-one induction is still

```text
rho(S) = (delta(S), mu(S))
```

with

```text
mu(S)    = remaining capacity in A/B/D/E/F
delta(S) = remaining capacity in the previously resolved C/G column.
```

However, ordinary rho reasoning is now preceded by the exact P1 obligation surface at every P0 node:

```text
0 enabled P1 singleton obligations -> ordinary rho action basis
1 enabled P1 singleton obligation  -> only the exact blocking column is admissible
2+ distinct enabled P1 obligations -> exact one-move response-capacity loss,
                                      provided P0 has no immediate terminal move
```

This ordering is qualified by `quotient-standard7x6-resolved-tail-forced-obligation.test.mjs` and the logical-map audit. It prevents rho from spending a repair move while an immediate P1 obligation is already live.

The previously qualified clean corpus, target-distance kappa results, exact rank-18 partition `83W/1L`, and exact rank-16 partition `11W/1L` remain intact under the hardened calculus.

## Qualified latent C1 closure

The fixed latent scheduler state

```text
466565554644
```

is now structurally proved P0-winning with witness:

```text
P0:C1
```

Every legal P1 reply after C1 is independently closed under the hardened calculus:

```text
P1:C2 -> immediate P0:C3 terminal
P1:G1 -> P0:G2 -> forced G3 block -> obligation-first rho(C3)
P1:A1 -> P0:G1 seizure route -> forced G3 block -> obligation-first rho(C3)
P1:B1 -> P0:G1 seizure route -> forced G3 block -> obligation-first rho(C3)
P1:D5 -> P0:A1 creates exact B1 threat -> forced B1 block -> obligation-first rho(C3)
P1:E5 -> P0:A1 creates exact B1 threat -> forced B1 block -> obligation-first rho(C3)
P1:F5 -> P0:A1 creates exact B1 threat -> forced B1 block -> obligation-first rho(C3)
```

The D/E/F piecewise witness is important: the earlier universal `P0:G1` refusal witness was falsified by exact two-obligation children and is not reused.

Focused qualification:

```text
workflow: Frontier latent C1 full closure
run:      34882743270
result:   success
wall:     timeout 300s
```

The same HEAD also passed the broad pre-alpha cleanup qualification.

This proves only the fixed latent state. It does not prove the earlier D3 predecessor, the center opening, or the empty-board root.

## D3 hinge boundary

At

```text
4665655546 -- P0:D3 --> 46656555464
```

the exact hinge control establishes:

- no immediate P1 terminal reply;
- C3 and G3 singleton obligations survive every nonterminal P1 reply;
- P1:D4 is the unique zero-phase reply;
- P1:D4 reaches the now-qualified winning latent state `466565554644`;
- D4 is **not** a forced reply merely because it is the zero-phase reply.

Therefore the current proof obligation is the full seven-reply P1 horizon after P0:D3. The D4 child is closed. The other six reply columns `{A,B,C,E,F,G}` must each receive an exact theorem contract or preserved separator before `4665655546` can be promoted to W through D3.

## Current active seam

Close the exact P1 reply horizon after P0:D3 from `4665655546`:

```text
4665655546 -- P0:D3 -- P1:{A,B,C,D,E,F,G}
```

For each child:

1. check exact terminal and enabled-singleton surfaces first;
2. consume the qualified latent-state theorem only for the exact D4 child;
3. route any live P1 obligation through forced-defense / response-capacity logic before rho/kappa;
4. otherwise derive the smallest guarded E/R/P/C/N consequence needed for that exact child;
5. do not infer symmetry among the six defect-phase replies without a qualified typed renaming theorem.

If all seven P1 replies close, then and only then promote `4665655546` to W via P0:D3 and continue backward toward the center opening.

## Resource and proof hygiene

- Five-minute outer and inner execution wall: **300 seconds**.
- Preserve existing proof-state and quotient/search-storage bounds.
- Execution sharding is hygiene only, never semantic identity.
- Unknown is not loss.
- Candidate-action failure is not state loss.
- No deadline reset after clock advancement.
- No implicit frame rule or player/ownership symmetry.
- No q equality from claim-relative signatures.
- No arbitrary physical-frontier broadening or unrestricted q recursion.
- No proof/state/quotient cap increase merely to make a theorem pass.

## Current evidence pointers

- `docs/research/2026-09-14-guarded-braid-transport-reversed-stutter.md`
- `docs/research/2026-09-14-forced-obligation-kappa-rank16-composition.md`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-resolved-tail-forced-obligation.test.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-expired-response-refusal-closure.mjs`
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-latent-c1-full-closure.mjs`
- `.github/workflows/frontier-logical-map-audit.yml`
- `.github/workflows/frontier-latent-c1-full-closure.yml`
