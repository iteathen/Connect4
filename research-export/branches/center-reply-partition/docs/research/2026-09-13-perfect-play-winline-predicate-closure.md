# Perfect-play win-line predicate closure

**Date:** 2026-09-13  
**Status:** theoretical research / blind structural derivation target; no solver implementation change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction, hypothesis, and conceptual framing:** **Josh Oshiro**  
**Formalization and synthesis:** OpenAI ChatGPT

## Purpose

Formalize the current rule-derived Connect Four investigation as a self-contained predicate/closure theory over the mechanically derived 69 geometric winning lines.

The target is **not** to import an externally solved perfect-play line classification. The target is to derive, from the standard game rules plus explicitly declared player-quality/value premises, the subset of geometric winning lines that can occur under perfect W/D/L play.

The currently suspected cardinality of that output subset is **28**, but **28 is not an axiom, premise, tuning target, or allowed classification input**. It is an output hypothesis to be accepted only if the predicate closure independently yields it.

The quarantined external-oracle branch and solved terminal-line classifications are not authority for this derivation.

---

## 1. Foundation

### 1.1 Background logic and finite mathematics

The theory assumes ordinary finite classical logic with equality and finite arithmetic sufficient for:

- equality and substitution;
- Boolean connectives and quantifiers;
- finite ordered sets and sequences;
- subset, intersection, union, and set difference;
- finite cardinality;
- integer order and addition;
- parity / congruence modulo 2;
- finite minimum/maximum where defined.

These are background mathematics, not Connect Four-specific axioms.

### 1.2 Standard board parameters

For standard Connect Four:

```text
W = 7 columns
H = 6 rows
K = 4 consecutive cells to win
```

Columns are `0..6`, rows are `0..5` from bottom to top, and the physical board contains `W*H = 42` cells.

### 1.3 Primitive game semantics

The Connect Four-specific primitive content is:

1. two players, `P0` and `P1`;
2. `P0` moves first;
3. turns alternate after every accepted move;
4. a move chooses one non-full column;
5. the token occupies the lowest empty cell in that column;
6. a player wins immediately when the move first completes four consecutive owned cells horizontally, vertically, rising-diagonally, or falling-diagonally;
7. no move follows a terminal position;
8. a full board without an earlier win is a draw.

Everything else in this note must be defined or proved from these rules plus the player-quality/value premises below.

---

## 2. Player quality and perfect-play premises

### 2.1 Play quality

Each player has a play-quality parameter from an ordered quality domain `Q` with greatest element `q*`.

```text
PlayQuality(p, q)
Perfect(p) := PlayQuality(p, q*)
```

For this research profile, **perfect** means W/D/L optimality only. There is no assumed secondary tie-break such as fastest win or slowest loss unless a later theory explicitly introduces it.

Therefore equally valued moves remain equally perfect.

### 2.2 Outcome preference

For each player:

```text
Win > Draw > Loss
```

### 2.3 Standard-board perfect value premise

This research profile is permitted to take the following as an explicit semantic premise:

```text
Board(7,6) AND ConnectLength(4)
AND Perfect(P0) AND Perfect(P1)
=> Value(root) = P0-Win
```

This premise supplies only the root W/D/L value. It does **not** supply:

- which geometric line wins;
- a witness sequence;
- an opening book;
- any solved-state table;
- any perfect-play reachability classification;
- the cardinality of the perfect-play winning-line subset.

The perfect-play terminal-line classification remains the object to derive.

---

## 3. Geometric winning-line universe

Let `Lambda` be the complete mechanically generated winning-line universe.

A geometric winning line is exactly a set of four cells

```text
a, a+d, a+2d, a+3d
```

for one of the four allowed directions:

```text
(1,0), (0,1), (1,1), (1,-1)
```

with all four cells inside the board.

The derived counts are:

```text
24 horizontal
21 vertical
12 rising diagonal
12 falling diagonal
-------------------
69 total
```

Hence:

```text
WinLine(L) := L in Lambda
|Lambda| = 69
```

The number `69` is a derived geometric theorem, not a primitive constant table.

---

## 4. Exact research target

Define:

```text
PPWinLine(L)
```

as:

> there exists at least one legal terminal trajectory under perfect W/D/L play on the standard board whose terminal move completes geometric line `L`.

If one terminal move simultaneously completes more than one geometric line, every such completed line satisfies `PPWinLine`.

The desired output subset is:

```text
Lambda_PP = { L in Lambda | PPWinLine(L) }
```

and necessarily:

```text
Lambda_PP subset_of Lambda
```

The current hypothesis is that closure may ultimately produce:

```text
|Lambda_PP| = 28
```

but this equation is **not available to the derivation**. It is to be inspected only after the line classifications have been proved.

---

## 5. Three-valued line classification during derivation

The derivation must distinguish proof from lack of refutation.

Maintain three disjoint sets:

```text
YES = { L | PPWitness(L) }
NO  = { L | PPRefuted(L) }
UNK = Lambda \ (YES union NO)
```

with invariant:

```text
YES intersection NO = empty
```

Rules may only move a line monotonically:

```text
UNK -> YES
UNK -> NO
```

Never:

```text
NO -> UNK
YES -> UNK
```

The classification is complete only when:

```text
UNK = empty
```

Then:

```text
Lambda_PP = YES
```

and only then should its cardinality be compared with the suspected output count.

---

## 6. Predicate families

The theory requires relational predicates as well as unary line properties. Perfect-play line possibility depends on interactions among targets, supports, parity reservoirs, response resources, and deadlines.

### 6.1 Geometry

```text
Cell(x)
WinLine(L)
Member(x,L)
Intersects(L,M)
SharedTarget(x,L,M)
Orientation(L,o)
```

Convenience predicates such as horizontal/vertical/diagonal orientation are derived from coordinates.

### 6.2 Gravity and support

```text
Below(x,y)
ImmediateBelow(x,y)
Supported(s,x)
Playable(s,x)
DownClosure(L,D)
SupportCell(x,L)
MandatoryBefore(x,y)
```

For a line `L`, `D(L)` is the least gravity-closed physical cell set containing `L`.

### 6.3 Event order and parity

```text
Event(e)
Before(e1,e2)
Rank(e,n)
RankParity(e,epsilon)
Owner(e,p)
OwnerXor(e1,e2,epsilon)
```

Alternation derives ownership from event-rank parity. A separate stone-color axiom is unnecessary once event rank is known.

### 6.4 Terminal timing

```text
LineCompleteAt(L,n)
FirstCompleteAt(L,n)
TerminalEvent(e)
TerminalContains(L)
EarlierCompletionForced(M,L)
```

`FirstCompleteAt` is essential: eventual four-in-a-row is not enough for legal terminal semantics.

### 6.5 Residual winspace

```text
Live(s,p,L)
Required(s,p,L,x)
ResidualRequirement(s,p,L,R)
ResidualSize(R,n)
RequirementSubset(R1,R2)
RequirementKilled(R)
Exhausted(s,p)
```

Residual requirements may only shrink or die under irreversible occupancy.

### 6.6 Threats

```text
Threat(s,p,L,x)
PlayableThreat(s,p,L,x)
ImmediateWinAvailable(s,p)
MustAnswer(s,p,x)
```

A threat is not automatically playable. Accessibility and deadline are part of the semantic distinction.

### 6.7 CPC / event reservoir

```text
ReservoirMember(s,t,e)
ReservoirCount(s,t,n)
ReservoirParity(s,t,epsilon)
ReservedEvent(e)
ReleasedEvent(e)
DeltaParity(delta,epsilon)
Control(s,t,p,h)
ReservoirGuardHolds(s,t,h)
```

For zero-reservation CPC:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)
  = (W - 1)H - ply + r + 1
```

Even/odd changes in the relevant preceding event reservoir preserve/flip control respectively, **only while the applicable support/resource/order/deadline guards remain valid**.

### 6.8 Response resources

```text
Trigger(e)
CandidateResponse(e,r)
ResponseTo(trigger,response,h)
ResponseAvailable(s,response)
ReservedResponse(response)
ResourceConflict(r1,r2)
ResourceCompatible(R)
ForcedResponse(trigger,response,h)
```

### 6.9 Blockers

```text
Blocker(B)
BlockerMember(B,x)
CertifiedBlocker(s,p,B,h)
CoversRequirement(B,R)
SolvedRequirement(R,h)
```

`CertifiedBlocker(s,p,B,h)` means player `p` cannot own every event in `B` before the applicable horizon `h`.

Coverage itself is ordinary set inclusion:

```text
B subset_of R
```

The difficult fact is certification, not coverage.

### 6.10 Race / deadlines

```text
Horizon(h)
Deadline(L,h)
BeforeHorizon(e,h)
CanCompleteBy(s,p,L,h)
CannotCompleteBefore(s,p,L,h)
CompletionPrecedes(L,M)
Preempts(A,B)
RaceSafe(certificate)
```

Eventual ownership and ownership before an opponent completion deadline are distinct propositions.

### 6.11 Perfect-play / value

```text
WinningRegion(s)          // absolute P0 value = Win
ValuePreservingEdge(s,s')
PPReachable(s)
PPWitness(L)
PPRefuted(L)
```

Within the P0-winning region:

```text
P0 to move: at least one legal successor remains in the winning region;
P1 to move: every legal successor remains in the winning region.
```

This follows from W/D/L minimax semantics and the assumption that the state itself has absolute P0 value `Win`.

---

## 7. Static line-interaction relations

Unary line filters are insufficient. For every ordered pair `(L,M)` define the exact static interaction components:

```text
TT(L,M) = L intersection M
TS(L,M) = L intersection Support(M)
ST(L,M) = Support(L) intersection M
SS(L,M) = Support(L) intersection Support(M)
DD(L,M) = D(L) intersection D(M)
```

These distinguish:

- shared winning targets;
- one line using another line's target as support;
- common support dependencies;
- gravity-closure interference.

A useful static interaction descriptor is conceptually:

```text
Sigma(L,M) =
  (TT, TS, ST, SS, DD,
   parity(|D(L)|), parity(|D(M)|))
```

This descriptor is not itself sufficient for semantic equivalence. Dynamic ownership, playability, CPC reservoirs, responses, and deadlines must be added before any strategic merge is sound.

---

## 8. Foundational derived theorems and intersections

### 8.1 Gravity closure

```text
Member(x,L) AND Below(y,x)
=> y in D(L)
```

`D(L)` is the unique least gravity-closed occupied set containing `L`.

### 8.2 Rank-parity ownership

If placement event `e` occurs at rank `n`, ownership is determined by rank parity because players alternate and P0 moves first.

Therefore:

```text
Owner(e1) XOR Owner(e2)
```

is determined by the parity of their rank difference.

This is the common parent of:

- gap parity;
- CPC target control;
- even-release preservation;
- same/opposite ownership constraints.

### 8.3 Same-player gap condition

For the four target events of a candidate line ordered by actual event rank:

```text
t1 < t2 < t3 < t4
```

same-player ownership requires:

```text
t2-t1, t3-t2, t4-t3 are even
```

or equivalently the numbers of intervening non-target events are odd.

### 8.4 Completion-volume relation

For candidate line `L`, let `F_L` be the number of occupied events outside `D(L)` before the line completes. Then:

```text
TerminalRank(L) = |D(L)| + F_L
```

For a P0 terminal line, terminal rank is odd, so:

```text
F_L = 1 - |D(L)|  (mod 2)
```

This is a necessary parity condition, not by itself a perfect-play certificate.

### 8.5 Residual shrink-or-die

For player `p`, an own move removes a required cell from every surviving requirement containing it. An opponent move permanently kills every surviving `p` requirement containing the played cell.

Residual requirements never grow or revive.

### 8.6 Antichain reduction

At identical support/timing context, if:

```text
R1 subset R2
```

for the same player, `R2` is redundant for the existential objective of completing some requirement no later than `R1`.

This theorem must not be applied across incompatible support/timing contexts.

### 8.7 Singleton threat + playability

```text
ResidualRequirement(L) = {x}
AND Playable(s,x)
=> PlayableThreat(s,p,L,x)
```

### 8.8 Mandatory answer

If player `p` has a playable singleton threat at `x`, the opponent is to move, and the opponent has no immediate terminal win, failure to discharge the threat before `p`'s next opportunity permits immediate completion.

This produces a deadline-bound `MustAnswer` fact, not an unconditional ownership fact.

### 8.9 Incompatible mandatory answers

If two simultaneously live mandatory answers require incompatible responses before the same deadline, and no earlier favorable terminal event intervenes, the defender cannot satisfy both obligations.

This is the generic shape behind double-threat/fork consequences.

### 8.10 Blocker elimination

```text
CertifiedBlocker(s,p,B,h)
AND B subset_of ResidualRequirement(s,p,L)
=> SolvedRequirement(L,h)
```

### 8.11 Complete blocker cover versus winning region

At a perfect-play-reachable state in the absolute P0-winning region, a simultaneously valid P1 blocker family cannot solve every surviving P0 requirement before all relevant P0 completion horizons.

Otherwise P0 cannot win from the state, contradicting `WinningRegion(s)`.

### 8.12 Perfect P1-turn universal successor theorem

For a P1-to-move state `s` with absolute P0 value `Win`:

```text
for every legal successor s': WinningRegion(s')
```

If any legal P1 move had value Draw or P1-Win, a perfect P1 would choose it and `s` would not be a P0-winning state.

This theorem is a strong refutation tool for candidate perfect-play structures.

### 8.13 First-win preemption

If every legal realization of candidate line `L` necessarily completes another winning line `M` at an earlier terminal rank, then `L` cannot be the first terminal winning line in that realization.

When this covers every perfect-play-compatible realization of `L`, it proves `PPRefuted(L)`.

---

## 9. Typed closure operations

There is no single sound generic merge operation. Each algebra closes differently.

### 9.1 Precedence closure

```text
O' = transitive_closure(O union new_order_facts)
```

A forbidden cycle signals inconsistency in a purported strict event order.

### 9.2 Parity closure

Parity/ownership relations close under GF(2) equation propagation.

For example:

```text
x XOR y = a
y XOR z = b
----------------
x XOR z = a XOR b
```

Contradictory equations invalidate the candidate certificate context.

### 9.3 Requirement/blocker closure

Certified blockers solve every residual requirement in their upward subset closure. Requirement elimination can make further obligations irrelevant, but proof relevance to parity/deadline must be audited separately.

### 9.4 Response-resource closure

Response fragments may be combined only when their resource, event-order, parity-release, and deadline guards are jointly satisfiable.

### 9.5 Perfect-line classification closure

The output classification is monotone:

```text
YES grows
NO grows
UNK shrinks
```

A line is never promoted to `YES` merely because it has not been refuted.

---

## 10. Proof relevance distinctions

Three relevance predicates must remain distinct:

```text
RelevantToWin(e)
RelevantToParity(e,t)
RelevantToDeadline(e,h)
```

A cell/event may be absent from every surviving winning requirement yet still consume a move and change target-control parity or completion timing.

Therefore:

```text
not RelevantToWin(e)
```

does **not** imply:

```text
not RelevantToParity(e,t)
```

or:

```text
not RelevantToDeadline(e,h)
```

Any event-reservoir reduction must prove the relevant parity/timing preservation rather than infer it from winspace irrelevance alone.

---

## 11. Positive and negative perfect-play certificates

### 11.1 Positive certificate

`PPWitness(L)` must establish the existence of a legal terminal history:

```text
s0 -> s1 -> ... -> sn
```

such that:

- `s0` is the standard empty board;
- `WinningRegion(s0)`;
- every P0 edge on the history preserves the P0-winning value;
- every P1 edge used is legal from a P0-winning P1-turn state and therefore remains inside the winning region;
- `sn` is terminal;
- the terminal move completes `L`.

A future compact certificate may establish the same proposition without enumerating the history, but it must prove equivalent semantics.

### 11.2 Negative certificate

`PPRefuted(L)` must establish that every legal realization of terminal line `L` violates at least one necessary perfect-play condition.

Useful exact refutation constructors include:

```text
ParityContradiction(L)
SupportContradiction(L)
EarlierWinForced(L)
OpponentDrawOrWinAvailable(L)
CompleteCompatibleBlockerCover(L)
RequiredP0MoveLeavesWinningRegion(L)
```

These are proof constructors, not primitive axioms.

---

## 12. Abstract closure state

A useful abstract proof state is:

```text
X = (
  O,        // precedence/deadline facts
  Pi,       // GF(2) ownership/control facts
  R0, R1,   // residual requirements
  B0, B1,   // certified blockers
  V,        // winning-region / value facts
  YES,
  NO
)
```

Let:

```text
F(X) = X union ExactConsequences(X)
```

for a monotone exact inference profile.

Then:

```text
X* = lfp(F)
```

is the closure.

At closure:

```text
UNK* = Lambda \ (YES* union NO*)
```

If `UNK*` is nonempty, the current predicate language/rule family is incomplete for full line classification.

If `UNK*` is empty:

```text
Lambda_PP = YES*
```

and only then is its cardinality evaluated.

---

## 13. Relationship to CPC / WSL / NDC

This theory is intended to expose the common structure already present in the repository:

```text
geometry
  -> gravity/event order
  -> rank-parity ownership (CPC)
  -> residual requirements (WSL)
  -> responses/blockers/deadlines
  -> nested dependency closure (NDC)
  -> perfect-play line classification
```

The feedback loop is:

```text
control/response fact
  -> certified blocker
  -> requirement elimination
  -> changed proof relevance
  -> certified reservoir change
  -> stronger control/response fact
  -> ...
```

This feedback is permitted only when each relevance/reservoir transition retains the parity/resource/deadline premises that make the consequence sound.

---

## 14. Blindness / anti-leakage rule

The following are prohibited as premises for this research derivation:

- external perfect-play terminal-line subsets;
- externally supplied line-membership labels;
- perfect-play witness sequences;
- opening books;
- solved-state databases;
- tuning any predicate/rule because it moves the surviving count toward a known target;
- importing classifications from `research/perfect-play-winset-count` or equivalent oracle experiments.

The only permitted solved-game semantic premise in this profile is the coarse root value:

```text
standard 7x6, perfect-vs-perfect => P0 wins
```

Even that premise must be clearly distinguished from anything the structural theory proves independently.

The perfect-play winning-line subset and its cardinality remain blinded output.

---

## 15. Current output hypothesis and falsifiers

### Hypothesis

After exact predicate closure from the standard rules, perfect-player semantics, and coarse P0-winning root value, the `PPWinLine` predicate may classify a strict subset of the 69 geometric winning lines whose cardinality is the previously suspected value.

The count itself is not part of the inference engine.

### Falsifiers

Rework the theory if any of the following occurs:

1. a line in `YES` lacks a positive perfect-play certificate;
2. a line in `NO` has a valid perfect-play witness;
3. classification depends on line enumeration order or closure scheduling;
4. an event is dropped from a CPC reservoir merely because it is winspace-dead while its parity/deadline role remains unresolved;
5. a blocker is used outside its certified resource/horizon guards;
6. perfect-player semantics silently introduce a fastest-win or slowest-loss tie-break not present in the quality axiom;
7. solved-game line classifications influence rule construction;
8. the closure stalls with `UNK != empty`, in which case incompleteness must be reported rather than converted into negative classification.

---

## 16. Next theoretical work

1. Mechanically generate all 69 lines from `(W,H,K)=(7,6,4)`.
2. Populate the complete static pair-interaction relation for `TT`, `TS`, `ST`, `SS`, and `DD`.
3. Derive exact line-level support shapes, completion-volume parity, and first-win ordering obligations.
4. Express CPC target control and response-pair facts as GF(2) plus resource/deadline constraints.
5. Compile certified blockers into WSL upward-closure elimination.
6. Apply winning-region invariants implied by perfect-vs-perfect P0-winning play.
7. Iterate the exact monotone closure without consulting the external terminal-line classification.
8. Require every final member/nonmember classification to carry a replayable or independently checkable certificate.
9. Count the resulting `YES` set only after the derivation is frozen.
10. Only afterward compare the frozen result against the quarantined external oracle as independent falsification/validation evidence.

---

## Attribution

The central research direction is **Josh Oshiro's**: begin from the mechanically derived 69 geometric Connect Four win lines, make player quality/perfect-play semantics explicit, derive interacting support/parity/response/blocker predicates from the rules, and determine the perfect-play terminal-line subset by exact closure rather than by importing solved-game classifications or expanding the conventional move tree.

This document formalizes that direction as a predicate/closure research program and deliberately treats any suspected final subset cardinality as output rather than authority.
