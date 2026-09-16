# Repair-capacity predecessor induction

Date: 2026-09-13

**Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro**  
**Formalization / implementation / qualification: OpenAI ChatGPT**

## Scope

This note records the exact structural seam reached from the latent C3/G3 contract around `466565554644`. It is a proof-accounting record, not a root-solve claim and not a replacement for C4-0010 authority.

The work deliberately abandoned the attempted 12-class and 14-class progress-state quotients after cross-action controls showed that both split under stronger continuation observations. The replacement abstraction is action-relative: theorem reuse is licensed by the selected action's dependency cone, while physical state identity and unrelated residual context remain opaque.

## Exhausted-tail routing

From the retained rank-20 latent-contract control, exact action/reply routing produced 48 exhausted D/E/F tail handoffs. The first A/B-only handoff conjecture was falsified and retained as a negative control.

Across those 48 handoffs:

- A/B both safe: 16;
- exactly one of A/B safe: 8;
- neither A nor B safe: 24;
- after broadening immediate off-target candidates to A/B/D/E/F, 12 states still had no safe off-target action.

Every rejected immediate candidate in those 12 states exposed an enabled live P1 singleton that P1 could claim terminally. Failure of that candidate family was not treated as P0 loss.

## Twelve exact universal terminal-response states

All seven P0 columns were then exhausted for the 12 no-safe-off-target rank-22 states.

Result:

- 12/12 states have a universal immediate P1 terminal-response certificate;
- 0 escape actions;
- 0 immediate P0-winning exceptions.

The certificate is local and exact: for every legal P0 action in one of these states, an enabled live P1 singleton witnesses at least one immediate terminal P1 reply. This licenses a local P0-loss conclusion for these 12 states only. It does not generalize to siblings or to the predecessor action without alternating-predecessor reasoning.

## Adversarial elimination of tail actions

Pushing those local certificates one predecessor step backward over the 12 candidate D/E/F tail-consumption actions gives:

- 8 tail actions adversarially eliminated;
- 4 survive.

The survivors have a simple structural separator independent of resolved-singleton ownership:

- remaining target G3 -> F tail survives;
- remaining target C3 -> D tail survives.

Equivalently, within the retained D/E/F family, the only surviving tail action is the column immediately adjacent to the remaining target.

## Adjacent-tail follow-up and falsified A/B theorem

The stronger conjecture that every non-winning P1 reply after the target-adjacent tail immediately re-enters through A or B was false.

Across the 20 exact P1 replies following the four adjacent-tail actions:

- 4 are immediate P0 target-terminal certificates;
- 6 leave both A and B safe;
- 2 leave exactly one of A or B safe;
- 8 leave neither A nor B safe.

The eight no-A/B states were then exhausted over all seven P0 columns. None was unresolved:

- 0 immediate P0-certificate states;
- 8 states with a qualified continuation;
- 0 unresolved states.

Each of the eight has exactly one qualified continuation. The rule is structural:

> After the target-adjacent tail survives, if P1 consumes one of the two remaining D/E/F tails, P0 consumes the other remaining tail.

Resolved-singleton ownership again does not affect this rule.

## Complementary-tail forward routing

The eight unique complementary-tail continuations were replayed through every immediate P1 reply:

- 8 selected P0 continuations;
- 40 exact P1 replies;
- 8 replies already yield a P0 predecessor certificate;
- 32 replies yield another qualified continuation;
- 0 unresolved replies.

This exposed the correct well-founded resource measure. Selected-column capacity alone is insufficient once the policy changes channels.

Define

\[
\mu(S)=\sum_{c\in\{A,B,D,E,F\}} \operatorname{remainingCapacity}_c(S).
\]

For every selected repair action in the qualified subsystem:

- P0 decreases `mu` by exactly one;
- every P1 reply is nonincreasing in `mu`.

At nonterminal P0 induction states the observed values are the odd sequence `15,13,11,9,7,5,3,1`, matching two-ply resource descent.

## Restricted alternating-predecessor induction

A bounded structural proof control was then run over the 16 nonterminal successors of the four adjacent-tail survivor actions. The other four adjacent-tail replies are already immediate P0 target-terminal certificates.

Invariant at recursive P0 proof nodes:

1. P0 to move;
2. the remaining target singleton is live;
3. target support distance is exactly one.

Allowed P0 witness actions are restricted to `A,B,D,E,F`.

A repair action proves the current node only if:

1. it is legal;
2. immediate P0 terminality closes the branch, or otherwise `mu` decreases by exactly one;
3. no legal P1 reply is terminal for P1;
4. every legal P1 reply either gives an immediate P0 terminal certificate or reaches another invariant P0 node with strictly smaller `mu`.

The recursion is therefore well-founded by `mu`; physical state ids are used only as memoization witnesses.

Qualified result:

- nonterminal start states: 16;
- proved start states: 16;
- failed start states: 0;
- physical memoized proof states: 9,635;
- candidate repair actions checked: 25,424;
- exact P1 branches checked: 80,384;
- maximum induction depth: 7.

Memoized `mu` distribution:

| mu | physical states | proved | unproved alternatives |
| ---: | ---: | ---: | ---: |
| 1 | 152 | 152 | 0 |
| 3 | 1,334 | 1,283 | 51 |
| 5 | 3,232 | 3,050 | 182 |
| 7 | 3,141 | 3,009 | 132 |
| 9 | 1,304 | 1,248 | 56 |
| 11 | 371 | 358 | 13 |
| 13 | 89 | 84 | 5 |
| 15 | 12 | 12 | 0 |

The 439 unproved physical nodes are rejected action alternatives encountered while finding existential P0 witnesses. They do not block the 16 start proofs.

## Claim-relative proof-term canonicalization

The finite proof DAG was then canonicalized at the proof-claim boundary. This is not state quotienting.

The canonical proof term retains:

- current `mu`;
- complete P1 branch multiplicity;
- terminal alternatives;
- multiset of child proof-class ids.

Physical P0/P1 column labels are erased only after exact branch coverage is checked. Equality therefore licenses reuse only for this restricted predecessor proof claim.

Result:

- total canonical proof classes including terminal base: 1,022;
- nonterminal classes: 1,021;
- the 16 physical start states use 9 distinct proof classes;
- `mu=1` has exactly one nonterminal proof class, with signature `M1[T]`.

Distinct nonterminal proof classes by `mu`:

| mu | classes |
| ---: | ---: |
| 1 | 1 |
| 3 | 5 |
| 5 | 33 |
| 7 | 173 |
| 9 | 291 |
| 11 | 165 |
| 13 | 47 |
| 15 | 9 |

The 1,022-class result is important negative evidence: the current conservative proof-term representation is a valid finite certificate, but it is **not** yet a small universal theorem library. Do not report this as a dramatic semantic compression. The useful compression at the current seam is that all 16 required start states are closed by one well-founded repair-capacity induction schema, with nine conservative start proof terms.

## What is now proved

Within the retained latent-contract domain:

1. the 12 exact blocking rank-22 states are locally P0-losing by universal immediate P1 terminal response;
2. eight of twelve D/E/F tail actions are adversarially eliminated;
3. the four target-adjacent tail survivors are closed by four immediate target-terminal replies plus the 16-state restricted repair-capacity induction;
4. the restricted repair subsystem has an exact well-founded measure `mu` and no unresolved start states.

## What is not proved

This work does **not** establish:

- root W/D/L;
- center-opening membership in `W`;
- q equality between proof states;
- global strategy equivalence;
- provenance equivalence;
- a 69-to-28 geometric winning-line reduction;
- that 1,022 proof classes are minimal or fundamental;
- that arbitrary states satisfying a visually similar board pattern satisfy the restricted induction invariant.

## Next proof obligation

The highest-value next step is backward composition, not deeper physical horizons and not premature proof-class minimization.

For each of the exact rank-20 latent-contract states, determine whether P0 has at least one legal action whose complete P1 reply set is discharged by one of:

- immediate P0 terminal certificate;
- already-qualified chain descent;
- the proven target-adjacent-tail / repair-capacity induction subsystem;
- another already-qualified guarded contract.

If all rank-20 latent-contract states close, the temporal latent-target subsystem can be promoted to a structural P0-winning predecessor contract. Only then should that contract be composed backward through the qualified D3/D4 hinge toward the center opening.
