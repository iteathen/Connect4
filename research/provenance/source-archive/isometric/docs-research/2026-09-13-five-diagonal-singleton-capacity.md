# Five-diagonal singleton response-capacity deficiency

**Date:** 2026-09-13  
**Status:** exact finite cover/compatibility theorem for unconditional singleton blocker certificates; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization and qualification:** OpenAI ChatGPT

## Purpose

Continue directly from the center-defect edge-denial result.

After the candidate structural sequence

```text
P0 D1
P1 E1
P0 A1
P1 B1
```

the best temporally feasible column-parity safety assignment leaves five P0 diagonal requirements:

```text
L1 = A1-B2-C3-D4
L2 = B2-C3-D4-E5
L3 = A3-B4-C5-D6
L4 = A5-B4-C3-D2
L5 = B6-C5-D4-E3
```

This note asks the first exact response-capacity question on that finite obligation family:

> Can P1 cover all five merely by adding unconditional singleton ownership blockers while preserving the singleton guarantees already reserved by the parity safety field?

The answer is no.

This is deliberately narrower than the full strategic problem. Pair blockers, contingent `Before`-style certificates, and richer CPC/NDC response policies remain open.

---

## 1. Arbitrary singleton hitting sets

Ignore compatibility first and ask for the minimum set of cells intersecting all five diagonals.

Mechanical enumeration gives minimum cardinality:

```text
2
```

and exactly two minimum covers:

```text
{C3,C5}
{B4,D4}
```

So static set cover alone makes the defect family look cheap.

---

## 2. Existing parity reservations

The best B1-repair parity field is:

```text
A even
B odd
C even
F even
G even
```

with P1 singleton guarantees:

```text
A2,A4,A6
B1,B3,B5
C2,C4,C6
E1
F2,F4,F6
G2,G4,G6
```

The two cardinality-2 covers conflict immediately with these reservations.

### `{C3,C5}`

`C3` is immediately above reserved P1 cell `C2`, and `C5` is immediately above reserved P1 cell `C4`.

Without an independently proved forced diversion of P0, P1 cannot universally guarantee both members of either adjacent pair:

```text
Owner(C2)=P1 => C3 becomes playable on P0's next turn
Owner(C4)=P1 => C5 becomes playable on P0's next turn
```

Thus the singleton guarantees required by the cover are incompatible with the inherited even-control certificate.

### `{B4,D4}`

`B4` is immediately above reserved P1 cell `B3`.

Therefore an unconditional P1 ownership guarantee for `B4` is incompatible with the inherited odd-control certificate in B unless an additional forced-response theorem is supplied.

Hence neither minimum static cover is a compatible extension of the current safety certificate.

---

## 3. Exhaust all adjacency-compatible singleton blockers

Filter every cell occurring in the five defects by the local compatibility condition:

```text
candidate x is rejected
if x is already a reserved P1 singleton
or x is immediately above/below a reserved P1 singleton
```

This condition is only a necessary compatibility condition, not a complete strategic compatibility theory. It is nevertheless exact for the unconditional singleton guarantees being tested.

After this filter, the only singleton hitting set that covers all five defects is:

```text
{D2,D4,D6}
```

and its minimum cardinality is therefore:

```text
3
```

This is already a nontrivial cover lower bound induced by compatibility:

```text
static coverLB = 2
compatible singleton coverLB = 3
```

---

## 4. Temporal denial of the only compatible cover

At the physical prefix

```text
D1 E1 A1 B1
```

it is P0's turn.

The current height of column D is one, so:

```text
D2
```

is immediately playable by P0.

Therefore P1 cannot use:

```text
Owner(D2)=P1
```

as an unconditional universal safety certificate: P0 may legally occupy `D2` now.

Removing this temporally unavailable singleton destroys the only adjacency-compatible singleton hitting set.

Hence:

> **There is no complete unconditional singleton blocker cover of the five diagonal defects that is simultaneously compatible with the inherited parity singleton guarantees and valid against the current P0 move.**

This is the first direct response-capacity deficiency derived from the center defect.

---

## 5. Capacity form

Let `O5` be the five diagonal obligations.

Let `R1` be the set of cells that may be used as unconditional P1 singleton blockers while preserving the inherited singleton certificate and current-turn legality.

Then mechanical enumeration proves:

```text
no P subset_of R1 covers O5
```

Equivalently, for this certificate class:

```text
coverLB(O5) > singletonCapacity(O5)
```

where the compatible cover lower bound requires `{D2,D4,D6}` but the current state removes `D2` from P1's universally certifiable response resources.

This is not yet the full Hall theorem desired by the temporal-response calculus because one response may be a pair blocker or contingent rule rather than a singleton. It is, however, an exact finite capacity failure for one nontrivial certificate class.

---

## 6. Why this matters

The result sharpens the location of the missing calculus again.

The five diagonal defects cannot be repaired by merely adding more unconditional ownership facts. Any successful P1 repair must use at least one richer object:

```text
pair blocker
contingent response relation
race/preemption certificate
forced diversion
nested CPC/NDC consequence
```

So the remaining question is no longer whether singleton ownership can restore safety. It cannot.

The next search should enumerate **certified pair/response blockers** for `O5` and test their joint compatibility/timing.

This is much smaller than searching the whole board or all 69 requirements.

---

## 7. Relation to the fixed-point calculus

The standard value target remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

The current structural chain is now:

```text
center boundary defect
 -> A1 denies unique complete parity repair
 -> B1 repair exposes five diagonals
 -> unconditional singleton repair capacity is insufficient
 -> richer response certificates required
```

If all richer compatible response families can also be discharged/refuted structurally, the `A1` branch becomes a genuine symbolic `PreE` witness.

---

## 8. Evidence

The same maintained control owns this result:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/center_defect_repair_exposure.mjs
```

with structured evidence:

```text
docs/research/evidence/2026-09-13-center-defect-repair-exposure.json
```

The control mechanically verifies:

```text
minimum arbitrary singleton covers:
  {C3,C5}
  {B4,D4}

only adjacency-compatible singleton cover:
  {D2,D4,D6}

D2 playable by P0 now:
  true

complete temporally certifiable singleton cover:
  false
```

---

## 9. Claim boundary

### Established

- the five B1-repair diagonal obligations have exactly two cardinality-2 singleton hitting sets;
- both conflict with existing unconditional parity ownership reservations;
- after filtering local adjacent-ownership conflicts, the unique complete singleton cover is `{D2,D4,D6}`;
- `D2` is immediately playable by P0 at the relevant prefix;
- therefore no complete unconditional singleton blocker cover exists while preserving the inherited parity certificate and current-turn legality.

### Not established

- impossibility of complete pair-blocker or contingent-response covers;
- impossibility of replacing some inherited parity guarantees with a different richer safety policy;
- a complete temporal Hall deficiency over all certified response resources;
- that the five diagonal defects force a P0 win;
- a full standard-root symbolic predecessor proof;
- any perfect-play terminal-line membership or cardinality.

## Next seam

Enumerate the blocker subsets of each of the five diagonals that can be certified by the existing generic pair/response theorems, then build the exact conflict graph among those certificates.

The decisive next question is:

```text
exists compatible, timing-safe pair/response cover of O5 ?
```

If no, the five-diagonal branch supplies the first complete response-capacity predecessor macro. If yes, analyze the resulting repair transition rather than treating it as failure: the repair may expose the next defect family under NDC closure.
