# Poisoned-support progress calculus

**Date:** 2026-09-13  
**Status:** exact local theorem + complete-small-game structural control; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Extract a positive/progress rule from the complete 4x3 connect-3 control rather than inventing one from the unsolved 7x6 structural quotient.

The repository's earlier exhaustive 4x3 control established that the empty game is a P0 win and that its root proof collapses to a tiny dependency grammar. This note identifies a recurring structural mechanism inside that grammar:

```text
singleton requirement
+ gravity support
+ turn order
-> poisoned defender support move
-> safe-move restriction / forced answer
-> response overload
```

This is a generic Connect-style progress mechanism and can be expressed in CPC/WSL/NDC terms.

---

## 1. Playable singleton completion

Let P0 have a live residual requirement:

```text
R = {t}
```

and suppose:

```text
Playable(t).
```

Then on a P0 turn, playing `t` completes the corresponding geometric winning line immediately.

This is the terminal base case of the positive predecessor calculus.

---

## 2. Poisoned-support theorem

Suppose P0 has a live singleton requirement:

```text
R = {t}
```

but `t` is not yet playable.

Let `s` be the immediate gravity support below `t`, and suppose:

```text
ImmediateBelow(s,t)
Playable(s)
P1ToMove
```

and P1 has no immediate terminal counterwin that ends the game on the current move.

If P1 plays `s`, gravity makes `t` playable. Because turns alternate, P0 moves next and can play `t`, immediately completing its line.

Therefore:

```text
SingletonRequirement(P0,t)
AND ImmediateBelow(s,t)
AND Playable(s)
AND P1ToMove
AND not ImmediateWinAvailable(P1)
=> UnsafeForP1(s).
```

Call `s` a **poisoned support** for P1.

This is exact. It is a deadline/race statement, not an eventual-ownership heuristic.

---

## 3. Important guard

The support cell `s` is not itself a missing member of the singleton requirement.

If `s` belonged to the same incomplete geometric line and were empty, the residual requirement would contain both `s` and `t`, contradicting `R={t}`.

Thus a singleton above an empty immediate support necessarily expresses a support dependency outside the remaining target set.

---

## 4. Safe-move restriction

Define:

```text
SafeForP1(m)
```

relative to the current proof horizon as a legal P1 move that does not immediately establish a certified P0 terminal continuation before P1 can recover.

The poisoned-support theorem yields:

```text
PoisonedSupport(s,t)
=> not SafeForP1(s).
```

Hence a latent P0 threat can make a currently legal move unusable by a perfect defender.

This is a progress fact: the physical legal-move set need not shrink, but the **value-preserving defender move reservoir** does.

---

## 5. Stacked-singleton overload

Suppose P0 has two singleton residual requirements:

```text
R1={s}
R2={t}
```

with:

```text
Playable(s)
ImmediateBelow(s,t).
```

Assume P1 to move and no immediate P1 counterwin.

Then:

- if P1 does not occupy `s`, P0 occupies `s` next and wins through `R1`;
- if P1 occupies `s`, `t` becomes playable and P0 occupies `t` next, winning through `R2`.

Therefore P1 has no safety-preserving response:

```text
StackedSingletons(s,t)
=> ForcedP0Win.
```

This is a dynamic response-capacity circuit: the lower response both consumes the only current answer and releases the upper winning event.

It generalizes the ordinary two-playable-cell double threat.

---

## 6. 4x3 control — immediate overload

Use columns A-D and rows 1-3.

After:

```text
P0 B1
P1 B2
P0 C1
```

P0 has two live singleton requirements:

```text
{A1}
{D1}
```

and both are playable.

P1 has one move and cannot occupy both. This is the ordinary response-capacity overload / double-threat base case.

---

## 7. 4x3 control — forced answer

After:

```text
P0 B1
P1 A1
P0 B2
```

P0 has the playable singleton:

```text
{B3}.
```

Therefore P1 must answer at B3 unless P1 can terminate immediately elsewhere.

In the complete 4x3 proof, B3 is the forced safety response.

---

## 8. 4x3 control — latent poisoned support

Continue:

```text
P0 B1
P1 A1
P0 B2
P1 B3
P0 A2
```

Now P0 has singleton requirement:

```text
{C2}
```

while:

```text
C2 is not playable
C1 is playable
ImmediateBelow(C1,C2).
```

Hence C1 is poisoned for P1.

If P1 plays C1, P0 plays C2 and wins through the horizontal A2-B2-C2.

Thus P1 must avoid a physically legal support move.

---

## 9. Avoidance itself makes progress

In the same 4x3 control, if P1 avoids poisoned C1:

### Left avoidance

If P1 plays A3, P0 can play C1 itself and create two playable singleton completions:

```text
C2
D1.
```

This becomes ordinary response overload.

### Right avoidance

If P1 plays D1, P0 can play A3 and create singleton requirements:

```text
C1
C2
```

with C1 playable immediately below C2.

This is the stacked-singleton overload theorem.

Thus every P1 alternative either:

```text
plays poisoned support -> immediate P0 completion
or
avoids poisoned support -> P0 creates response overload.
```

The alternatives have different concrete continuations but converge to the same higher consequence:

```text
P0 progresses to a strictly stronger winning certificate.
```

---

## 10. Relation to the measured 4x3 proof DAG

The repository's complete 4x3 control found a tiny W/D/L root dependency grammar despite 4,659 reachable states.

The representative path above shows that several nodes of that grammar correspond directly to:

```text
terminal singleton completion
response overload
create-overload move
forced answer
latent singleton / poisoned support
avoidance -> overload
```

So the response-capacity and support/deadline predicates developed in the 7x6 investigation are not arbitrary additions: they reproduce concrete structure inside a complete independently solved small-game proof.

Prototype for the local predicates:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/poisoned_support_4x3_control.mjs
```

---

## 11. General progress operator

A useful generic rule family is now:

```text
Threat(t)
-> mandatory answer / poisoned support restrictions
-> SafeMoveSet(P1) shrinks
-> for every remaining safe P1 alternative, P0 derives stronger threat obligations
-> alternatives converge to response overload or terminal completion.
```

This suggests the structural progress rank should not be only requirement cardinality.

Candidate components include:

```text
number of P1 value-preserving safe moves
minimum response slack
number of live singleton requirements
support distance of latent singletons
response-circuit deficiency
```

The 4x3 path makes strict progress even when a target is temporarily unplayable because its support becomes poisoned.

---

## 12. Connection to CPC / WSL / NDC

### WSL

Recognizes:

```text
ResidualRequirement={t}
```

and carries the original line provenance needed for terminal completion.

### Support/event frontier

Determines:

```text
Playable(t)
ImmediateBelow(s,t)
Playable(s).
```

### CPC

Controls whether release/reservation of support events preserves the ownership/deadline premise for the resulting target.

### Response-capacity calculus

Recognizes the no-two-answers / stacked-release overload once threat obligations compete for defender turns.

### NDC

Carries the conditional chain:

```text
P1 chooses support -> immediate completion
P1 avoids support -> stronger P0 threat certificate
```

and promotes consequences common to every exhaustive alternative.

---

## 13. New proof predicates

Candidate generic predicates:

```text
LatentSingleton(p,t)
PoisonedSupport(defender,s,t)
SafeStrategicMove(p,m,h)
SafeMoveReservoir(p,S,h)
StackedSingletons(p,s,t)
ThreatStrengthens(C1,C2)
AlternativeConverges(A,C)
```

These are derived proof predicates, not new game axioms.

---

## 14. Claim boundary

Established:

- the poisoned-support theorem under the stated no-counterwin/deadline guards;
- the stacked-singleton overload theorem;
- representative 4x3 proof states instantiate immediate overload, forced answer, poisoned support, and avoidance-to-overload;
- these mechanisms are expressible through the existing structural substrate plus response-capacity relations.

Not established:

- that these rules alone solve every state in the complete 4x3 game without predecessor enumeration;
- a complete structural rank proving all 4x3 root alternatives;
- that every 7x6 winning continuation reduces to the same small rule family;
- any final 7x6 perfect-play terminal-line membership/cardinality.

## 15. Next test

Compile these local progress predicates over the full complete 4x3 state control and ask:

1. what fraction of winning-attractor predecessor steps are discharged by terminal singleton / response overload / forced answer / poisoned support rules;
2. what exact first state remains unexplained;
3. anti-unify that state's proof shape into the next missing predicate;
4. iterate until the empty 4x3 root is derived from geometry without using its precomputed W/D/L labels during inference.

This gives a disciplined route to learning the missing structural predecessor calculus from a complete finite game before applying it to 7x6.
