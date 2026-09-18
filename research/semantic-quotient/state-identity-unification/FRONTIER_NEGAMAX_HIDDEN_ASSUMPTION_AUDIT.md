# Frontier Negamax hidden-assumption audit

Date: 2026-09-11
Branch: `research/semantic-quotient-explore-hints`
Status: research architecture audit; solver behavior is not changed by this note.

Research direction / architecture: Josh Oshiro
Adversarial audit / implementation review: OpenAI ChatGPT

## Audit basis

This audit starts from the project's actual structural research chain rather than from conventional alpha-beta assumptions:

```text
geometric winning-line axioms
  -> CPC control parity / event precedence / race
  -> WSL-625 residual requirements and blockers
  -> NDC nested dependency closure
  -> BSFP backward fixed-point semantics
```

The quotient-native Negamax lane is a separate exact forward solver. It may consume the same Connect4-owned structural mathematics, but it is not allowed to redefine CPC, WSL-625, NDC or BSFP semantics merely because it uses a recursive proof procedure.

Primary references:

- `docs/specs/C4-0001-domain-v1.md`
- `docs/specs/C4-0006-control-parity-and-winspace-v1.md`
- `docs/specs/C4-0007-nested-dependency-closure-v1.md`
- `docs/specs/C4-0008-bsfp-exact-solver-v1.md`
- `docs/specs/C4-0010-quotient-native-negamax-v1.md`
- `docs/research/2026-09-09-owner-searchless-connect4-findings.md`
- `docs/research/2026-09-09-universal-strategic-algebra.md`
- `docs/research/2026-09-09-nested-strategic-dependency-closure.md`
- `docs/research/2026-09-09-searchless-solver-hypothesis.md`
- `docs/research/2026-09-09-backward-winline-fixed-point.md`
- `docs/research/2026-09-09-terminal-boundary-qualification.md`

## 1. C4-0010 currently creates a semantic fork

C4-0010 currently names C4-0001 as its lower authority and then restates residual-state and tactical semantics itself. That is the wrong ownership direction.

CPC, WSL residual requirements, minimal-antichain semantics, blockers, exhaustion, and support/event control already have a Connect4 structural owner in C4-0006. NDC owns nested exact dependency/certificate semantics in C4-0007. C4-0010 should define how forward Negamax consumes those facts, not establish a second version of them.

This authority split is the first thing to correct because it encourages future work to read `C4-0001 -> C4-0010` and skip the mathematics that produced the quotient in the first place.

## 2. The CPC invariant is event-reservoir control, not row parity

The zero-reservation CPC base case for target event `t=(c,r)` is:

```text
N(t)
  = (r - h_c + 1)
    + sum_{d != c}(H - h_d)
  = (W - 1)H - ply + r + 1

owner(t) <- (N(t) - 1) mod 2
```

The target-column height cancels. For standard 7x6 the constant `(W - 1)H` is even, but that simplification does not turn CPC into a generic row-parity heuristic.

The stronger control invariant is composition over the relevant future event reservoir:

```text
N'(t) = N(t) + Delta
owner'(t) = owner(t) iff Delta mod 2 = 0
```

A response fragment therefore preserves Zugzwang/control only when its reservations/releases, resource obligations and event precedence preserve the relevant event-rank relation. An odd release can flip control. Eventual ownership without deadline/order is not enough.

### Hidden assumption found

Any frontier compression that removes, reserves, releases or declares events irrelevant must preserve the parity contribution of those events. Dropping a strategically irrelevant event from the represented frontier is not automatically parity-neutral.

Therefore an event-frontier representation cannot merely retain the events that appear in residual winning requirements. It must also retain, or account algebraically for, the parity effect of omitted/released events whenever CPC facts depend on that reservoir.

This is a correctness condition, not an ordering preference.

## 3. WSL-625 is more than a compressed TT key

The 625-element universe is shared structural algebra for:

- residual winning requirements;
- blocker identities;
- subset/upward closure;
- exhaustion;
- implication/dominance;
- strategic coverage;
- certificate consequences.

Current forward code uses the residual side strongly but largely omits the blocker/certificate side. Treating `support + R0 + R1` as the whole frontier is therefore a forward-search projection, not the complete strategic closure state described by the research.

The NDC closure state is closer to:

```text
X = (R0, R1, B0, B1, P, T)
```

where `P` carries parity/response/event-order facts and `T` carries derived terminal/result facts.

Negamax may operate on a smaller Markov state for ordinary legal continuation, but it must not attach path/context-dependent strategic certificates to that smaller key unless their complete premises are derivable from the key or included in proof identity.

## 4. The common terminal method is nested frontier closure, not a catalog of tactical detectors

Immediate win, double immediate threat, forced block, one-sided exhaustion, bilateral exhaustion, parity/Zugzwang disposition and compatible blocker coverage are not best understood as unrelated special-case tricks.

The research reduced them toward one common shape:

```text
future support/event facts
  + CPC parity/response/race constraints
  + WSL residual requirements
      -> certified blocker / ownership facts
      -> upward-closure requirement elimination
      -> changed event obligations
      -> stronger parity/response facts
      -> ... fixed point ...
      -> terminal proposition or unresolved decision
```

Current `tacticalCode()` implements only a cheap local projection of that closure: playable singleton win, single forced block, multiple playable opponent singletons and bilateral exhaustion/no-continuation draw.

Those local cases are sound. The hidden assumption is treating them as though they exhaust the common frontier-terminalization method.

## 5. Temporal/race meaning cannot be collapsed into eventual ownership

A falsifier in the research already established:

```text
I eventually own the required event
!=
I own it before the opponent completes a winning requirement
```

Therefore blocker certification for Aftereven/Before/Specialbefore-like structures requires deadline/event-order context. A generic blocker ID describes the consequence once certified; it does not by itself prove the strategy that certifies it.

Any future shared proof cache for strategic certificates must preserve horizon/order/resource premises. Reusing a blocker certificate by WSL ID alone would be unsound.

## 6. Live-line move value is a frontier projection, not a piece-square heuristic

The legacy evaluator's position value is player-relative:

```text
value_p(cell)
  = number of original geometric winning lines through cell
    that contain no opponent stone
```

One opponent stone annihilates that line's value for player `p`. Own stones do not cancel it.

The empty-board vector `[3,4,5,7,5,4,3]` is only the derived root result. It must never become the implementation.

### Hidden assumption found in the current explore prototype

The first implementation reconstructed occupancy masks from a representative path and then used center order as a tie-break. Both are suspect for a frontier engine:

- reconstructing board occupancy is an implementation shortcut back toward historical state;
- center tie-breaking imports a conventional search preference after the frontier metric has tied;
- quotient-state dedup chooses the first representative path, even though original live-line multiplicity can differ between physical histories collapsed by residual antichain normalization.

The correct frontier-native form is to maintain player-specific live geometric-line masks or equivalent line-provenance/multiplicity state incrementally for the branch where the advisory score is needed. That auxiliary ordering state is not quotient semantic identity and must not become proof authority.

## 7. Authoritative Negamax still uses conventional move ordering

The active recursive engine currently uses:

```text
proof-store best move
  -> centerOrder
```

and one worker path can reverse center order by `workerSalt`.

That means the authoritative solve is still conventional even though explore work now has a frontier-derived score.

Before another root performance claim, authoritative move ordering should consume frontier-native information. Fixed center order and salt reversal should remain controls only if measured evidence justifies them.

## 8. Forced transitions are still traversed as ordinary recursive states

The research already established FBLK/FMAC:

- one immediate opponent threat yields an exact forced response;
- repeated forced responses can be collapsed into a deterministic macro-edge;
- deterministic transit states need not be treated as ordinary decision/search vertices or receive equal TT admission.

Current Negamax recognizes a forced move but recursively traverses one forced ply at a time.

That is a hidden conventional-tree assumption and is especially important because it combines badly with the current shared-TT policy: transit states consume global proof slots even when no decision exists there.

## 9. Shared semantic TT allocates on proof read and admits every visited state

`proofKey(stateId)` currently calls `findOrCreate()` before ordinary bound reads. Thus every touched semantic state allocates shared table identity, including states that publish no useful bound and deterministic transit states that research suggested keeping out of the main decision-state cache.

The 8,388,608-entry standard-7x6 saturation result therefore proves that more than 8.3M semantic states were touched/interned under this admission policy. It does not prove that 8.3M useful proof records must be retained.

Before designing replacement, measure a frontier-oriented policy:

```text
probe(descriptor)             // miss does not allocate
ensureForPublication(...)     // allocate when retaining useful proof/hint state
```

and combine it with decision-state/FMAC admission.

## 10. Fixed split depth is a conventional approximation to frontier availability

Depth 8 activated all three workers in the previous root experiment, but a fixed ply depth is not the natural unit of this engine.

The natural unit is unresolved proof/frontier dependency. Branch Manager should expose more structure when authoritative work supply is thin, using the same event/residual frontier and without interrupting busy workers.

A fixed depth can remain a bounded exploration budget or control, but should not define semantic work partitions.

## 11. Branch Manager should manage frontier supply, not worker requests

The intended execution rule is:

```text
authoritative ready proof work
  > queued frontier exploration
  > idle
```

Busy workers are never interrupted. Branch Manager should keep a bounded ready reservoir ahead of demand. Workers should not request work and wait for a response.

Completed exploration should feed future frontier candidates back to Branch Manager, but structural discovery alone must not turn a branch into an authoritative alpha/beta obligation. Negamax dependency state still owns the proof window required for parent advancement.

## 12. Bulk sibling synchronization remains a conventional barrier

The dependency-aware engine searches the preferred child first but launches sibling scouts and waits on `Promise.all` before consuming their results.

That creates an unnecessary synchronization barrier. A frontier-oriented parent should consume completed sibling proofs incrementally. If one completion closes the parent obligation, the parent stops depending on the remaining tasks. The workers themselves need not be interrupted; they may finish and publish sound proof before returning to the queue.

## 13. The Negamax lane is not the conceptual center of the project mathematics

The project's strongest structural hypothesis is searchless:

```text
event-poset constraints
+ GF(2) ownership/response equations
+ blocker hyperedge closure
+ monotone terminal predicates
-> fixed point
```

BSFP already demonstrated direct backward symbolic W/D/L on complete small games with zero W/D/L disagreements against 1,681,808 reachable physical states, and the backward fixed-point control reconstructs results from geometric win-line axioms.

The forward Negamax lane remains valuable as:

- an exact independent solver;
- a qualification/control path;
- a performance competitor;
- a consumer of exact frontier closure before unresolved branching.

It should not drag the shared mathematics back toward a normal board-search architecture.

## 14. Correctness obligations that remain valid

The following should be preserved:

- side to move from support rank parity under alternating no-pass Connect Four;
- residual transition algebra and opponent-line elimination;
- minimal-antichain normalization at compatible support context;
- exact semantic equality by descriptor content rather than hash alone;
- monotone lower/upper W/D/L proof publication;
- separation of proof authority from advisory ordering hints;
- worker-local qID/classID freedom under exact shared semantic identity;
- independent geometric terminal qualification;
- non-interruption of busy workers.

## 15. Correct next sequence for the forward lane

Before another standard-7x6 root performance claim:

1. repair the authority chain so quotient work reads C4-0006 and relevant C4-0007 research before C4-0010;
2. make C4-0010 a consumer of CPC/WSL rather than a competing owner;
3. replace representative-board reconstruction with an incremental live-line frontier for advisory move value;
4. remove fixed center/salt ordering from the active authoritative path unless measurements retain it as an explicit tie/control policy;
5. add exact one-sided exhaustion bounds and preserve CPC event-reservoir parity whenever frontier events are compressed/released;
6. collapse forced chains / decision-state admission before spending shared-TT slots on deterministic transit;
7. separate TT probe from allocation and remeasure actual retained-proof pressure;
8. let Branch Manager proactively maintain bounded frontier work supply;
9. consume sibling proof completions incrementally without interrupting busy workers;
10. only then rerun the standard-7x6 root and decide whether replacement/reclamation is actually required.

## Bottom line

The main risk is not that the quotient idea is too unusual. It is the opposite: conventional search machinery has repeatedly been allowed to reinterpret a stronger frontier algebra as if it were merely a better board representation.

The forward solver should conform to the CPC/WSL/NDC model. It should not make that model conform to conventional Negamax/TT habits.