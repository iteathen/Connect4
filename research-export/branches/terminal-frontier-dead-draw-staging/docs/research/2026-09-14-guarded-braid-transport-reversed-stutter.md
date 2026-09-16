# Guarded braid transport and reversed-ownership stutter falsifier

**Date:** 2026-09-14  
**Branch:** `research/frontier-negamax-conformance`

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

The frontier-native structural program had exact predicates for support events, residual winning requirements, CPC/GF(2) phase, response resources, temporal deadlines, terminal alternatives, and well-founded ranks. It also had claim-relative typed-event reuse and guarded theorem composition.

The missing layer exposed by the braid view was narrower: an explicit law for **transporting a downstream claim across a short event braid**. Physical support/phase recovery is not sufficient when an event has consumed a temporal obligation or changed a response resource.

This unit adds that missing guarded transport/interchange layer and applies it first to the exact reversed-ownership candidate

```text
4665655546443
  -- P1:B1 -->
46656555464432
  -- P0:B2 -->
466565554644322
```

The result is a falsifier, not a W/D/L theorem.

## Existing authority versus newly integrated law

The accepted specifications already govern several properties that initially looked like missing axioms:

- terminal events are real semantic boundaries under C4-0001/C4-0010;
- unknown is not loss under C4-0010;
- CPC/GF(2) phase facts require exact qualification under C4-0006;
- NDC temporal correctness, response obligations, event order, and well-founded dependency ranks are first-class under C4-0007;
- claim-relative structural renaming is already separated from q equality;
- guarded theorem composition already forbids implicit frame, terminal, temporal/resource, and provenance carry-through.

Therefore this work does **not** modify the canonical game axioms. It integrates a derived research proof substrate connecting those accepted contracts across event transport.

## Guarded braid transport substrate

Implementation:

`research/semantic-quotient/state-identity-unification/src/quotient-guarded-braid-transport.mjs`

Qualification tests:

`research/semantic-quotient/state-identity-unification/src/quotient-guarded-braid-transport.test.mjs`

Exact standard-7x6 control:

`research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-reversed-ownership-stutter-control.mjs`

The transport snapshot retains the downstream claim interface explicitly:

```text
claim identity
exact side to move
claim-relative structural interface
CPC/GF(2) phase
support/event ordering
response resources
live obligations + causal deadline clocks
well-founded progress rank
```

A two-event macro may be certified as a neutral pair only when every observed interface field is preserved, every live obligation is exactly accounted for, no terminal boundary is crossed, and the declared finite progress rank strictly decreases.

The certificate explicitly denies:

```text
full-state equality
q equality
player renaming
implicit frame preservation
later-strategy equivalence
```

## Obligation conservation

A live obligation may not vanish because the transport abstraction forgot its source.

For every obligation present before a macro, the after-state must show one of the exact allowed dispositions:

```text
carried with the same semantic identity and response resource
discharged by an explicit derivation
```

Creation likewise requires an explicit derivation. A nonterminal transport may not use a fictional terminal supersession to erase an obligation.

This is a proof-accounting rule, not a heuristic threat counter.

## Causal deadline clocks

The decisive missing law is that a deadline is measured in its own **causal clock domain**.

Each live obligation carries:

```text
deadlineClock
remaining
```

and each transported event declares which clocks it advances.

For a carried obligation `o`:

```text
elapsed(o) = sum event.clockTicks[o.deadlineClock]
maximumRemainingAfter = remainingBefore - elapsed(o)
```

A transport is rejected if the obligation is expired or if the after-state gives it more remaining time than this bound.

In particular, returning to the same board-facing scheduler interface does not reset a consumed response turn.

This is the exact distinction the earlier stutter vocabulary lacked.

## Guarded interchange

The substrate also supplies a bounded interchange/coherence check. Two event orders may be treated as the same downstream braid crossing only when:

- every event in both paths is certified legal and nonterminal;
- both paths begin at the same declared claim interface;
- both paths finish at the same declared claim interface;
- final obligations agree exactly;
- final well-founded resource ranks agree.

This is deliberately weaker than a general commutativity theorem and does not imply q equality.

## Generic qualification

Focused workflow `Frontier guarded braid transport`, run `34863749014`, qualified commit

`c3022513ddcce3b9c33fe1f64841a7942cd7dbec`

with **8/8 tests passing**.

The hostile controls reject:

1. implicit player renaming;
2. dropped obligations without discharge;
3. newly created obligations without derivation;
4. deadline regeneration after the causal clock ticks;
5. response-resource drift;
6. a neutral pair that does not strictly decrease its finite resource;
7. terminal crossings;
8. interchange paths whose final guarded contracts differ.

The broader `Pre-alpha cleanup qualification` also passed on the same commit (`34863749016`).

## Exact B1 -> B2 control

The first concrete control starts immediately after P0 has played C1:

```text
4665655546443
```

The accepted latent-target contract has the support-pair relation

```text
P0:C1 -> P1:G1
```

with deadline

```text
next_P1_turn
```

The candidate reversed stutter is:

```text
P1:B1 -> P0:B2
```

Both events are legal and nonterminal in the exact C4-0010 transition system.

### What the pair really preserves

The control found an unusually strong physical re-entry. Before P1:B1 and after P0:B2, all of the following are exactly unchanged:

```text
C3 live singleton: true
C3 support distance: 1
G3 live singleton: true
G3 support distance: 2
full column GF(2) phase bits: 0010000
P1 enabled singleton surface: empty
P1 immediate terminal-action surface: empty
next C support event: C2
next G support event: G1
```

The finite off-system repair resource strictly progresses:

```text
mu: 18 -> 16
```

Thus board-facing phase, target, terminal-surface, and target-support observations all say “re-entry.”

### Why the theorem nevertheless fails

`P1:B1` is itself the **next P1 turn** after `P0:C1`.

Therefore it advances the causal clock for the live support-pair response obligation by one:

```text
before remaining = 1
elapsed P1 turns = 1
maximum remaining after = 0
```

Treating the post-B2 state as the original latent contract would restore the same obligation with `remaining = 1`.

The guarded transport substrate rejects this exactly as:

```text
obligation_deadline_regenerated
```

The CI certificate reports:

```text
id: support-pair:P0:C1->P1:G1
before: 1
after: 1
elapsed: 1
maximumRemaining: 0
```

Therefore:

```text
P1:B1 -> P0:B2
```

is **not** an exact same-contract reversed-ownership stutter for this scheduler.

## Interpretation

This falsifier is important because almost every simpler observable says the stutter should work. The missing information is neither another board feature nor another GF(2) bit. It is the temporal history carried by the live contract.

The structural state needed by this downstream theorem is therefore at least:

```text
board-facing claim interface
+
live temporal obligations with causal-clock age/deadline
```

This is a direct example of why claim-relative abstraction must retain history only where a downstream claim observes it.

It also validates the braid view: the support/phase strand and the deadline strand cross. The former can return to its original local shape while the latter has irreversibly advanced.

## What is *not* proved

The falsifier does not prove any of the following:

- `46656555464432` is losing;
- `466565554644322` is losing;
- P0:B2 is a bad game move;
- A/D/E/F reversed pairs fail for the same reason in every context;
- `466565554644` belongs to W or L;
- the center opening is solved.

Candidate theorem failure is not an outcome theorem.

## New theorem seam: expired-response consequence

The old next step—restore the same scheduler contract after B1/B2—is now invalid.

The correct next question is:

> What exact consequence follows when P1 declines the support-pair response `G1` on its required next turn after P0:C1?

The latent automaton proves the response relation and its deadline only inside the target scheduler. It does not yet export a theorem for the **refusal/expiry branch**.

The next bounded control should therefore start at:

```text
4665655546443 -- P1:B1 --> 46656555464432
```

and derive, without solved labels or recursive board search, whether deadline expiry yields one of:

```text
an exact P0 terminal opportunity;
a strengthened residual/ownership requirement;
a forced target-support action;
a qualified response-capacity defect for P1;
a smaller guarded contract with the old support-pair obligation explicitly discharged/replaced;
or an exact unresolved separator showing another predicate is missing.
```

Only an explicitly derived consequence may replace the expired contract. P0:B2 may still appear in that new theorem, but it cannot be justified by resetting the old deadline.

## Durable boundary

The focused workflow `.github/workflows/frontier-guarded-braid-transport.yml` remains useful because it protects both the generic transport laws and the exact falsifier against later changes to the relevant research files.

No q/frontier/proof cap was increased. No solved W/D/L label or external oracle was used as a premise. No ownership symmetry was assumed. No root theorem was promoted.
