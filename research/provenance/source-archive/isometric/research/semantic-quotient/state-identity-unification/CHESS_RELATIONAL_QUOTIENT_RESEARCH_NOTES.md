# Relational Quotient Framework for Exact Chess/Game-Graph Solvers

**Status:** research hypothesis and falsification program; not a production architecture claim  
**Date:** 2026-09-11  
**Owner branch:** `research/semantic-quotient`  
**Research direction and architecture:** Josh Oshiro  
**Adversarial analysis / reconstruction:** OpenAI ChatGPT

## Purpose

This note generalizes the semantic-quotient ideas developed for Connect Four into a deliberately harder class of cyclic, non-monotonic games, using chess as the primary adversarial case.

The goal is not to assume that chess admits the same compression as Connect Four. The goal is to make the hypothesis exact enough to falsify:

> Can physically distinct chess position-history states share a smaller, cheaply recognizable exact transition identity or transferable proof identity that reduces time to exact proof beyond conventional bitboard + Zobrist search?

The final authority is empirical. A relational quotient advances only if it preserves the declared exact semantics and improves total time to exact proof under fair accounting.

---

## 1. Authoritative augmented state

For a history-sensitive game, the authoritative concrete state is not the board position alone.

Let:

```text
x = (p, h)
```

where:

- `p` is the instantaneous physical chess position;
- `h` is the minimal rule/history context required to determine future legality and draw semantics.

The candidate relational form is:

```text
X = (q, hq)
```

where:

- `q` is a relational/canonical descriptor of future-relevant positional structure;
- `hq` is a reduced history/rule automaton state sufficient for the same consumer contract.

A useful implementation may keep these factored, but correctness belongs to the **joint augmented state**. Transition and proof equivalence must therefore be stated over `x`, not over bare board placement.

### 1.1 Instantaneous rule state versus history automaton

The original sketch grouped castling rights, en-passant, the halfmove clock and repetition context into one history tuple. That is implementable but obscures two different roles.

A clearer factorization is:

```text
h = (r, sigma)

r = current rule header
  = side-to-move/orientation
  + castling rights
  + en-passant availability
  + halfmove/rule clock

sigma = repetition/cycle context
```

The exact storage boundary is not authoritative: some or all of `r` may be absorbed into `q`. What matters is that every fact that changes immediate legal actions or draw semantics participates in the joint identity.

Castling rights and en-passant are especially important because they affect the legal successor relation immediately; they cannot be omitted merely because they arose from history.

### 1.2 Draw-rule profile must be explicit

The solver contract must declare the chess rule profile it is proving, including:

- claimable threefold repetition;
- automatic fivefold repetition;
- claimable 50-move rule;
- automatic 75-move rule;
- whether a claim is modeled as an available semantic action under optimal play.

For a claim-aware exact solver, a valid draw claim can be represented as an action:

```text
ClaimDraw(X) -> Draw
```

Automatic draw conditions terminate without a claim action.

The history automaton must preserve exactly enough information to distinguish these cases.

---

## 2. Positional quotient and history quotient

The working hypothesis is a dual reduction:

```text
physical position structure -> relational position descriptor q
physical path context        -> history automaton class hq
```

The quotient is not justified by compression alone. It is justified only by preservation of the declared future behavior.

### 2.1 Positional descriptor `q`

`q` should not be assumed to be a compressed board or a symmetry-normalized bitboard. It is a candidate descriptor of future-relevant structure.

Possible ingredients include, subject to evidence:

- occupancy/accessibility topology;
- piece-interaction and attack/defense relations;
- king-safety constraints;
- pins and latent unpin/reactivation structure;
- pawn reachability, promotion and blockade structure;
- mobility constraints;
- separable or conditionally interacting regions;
- structural information required to preserve exact legal successors.

The strongest lesson from Connect Four remains applicable: do not define the quotient from representational elegance. Discover it from future behavior.

### 2.2 History automaton `hq`

`hq` is not a compressed move list. It is a sufficient statistic of path history for future rule behavior.

A conservative first form may contain:

```text
hq = (
  halfmoveClock,
  repetitionContext,
  any rule facts not absorbed into q
)
```

Repetition multiplicities may be saturated at the highest threshold that can still affect the declared rule contract. Once an automatic terminal draw is reached, no live successor state remains to encode.

### 2.3 History barriers are not all the same operation

Do not conflate:

- **repetition barriers**: events that make some earlier exact states impossible to revisit;
- **halfmove-clock resets**: captures and pawn moves under ordinary chess rules.

For example, irreversible loss of castling rights may invalidate recurrence to an earlier state with those rights without resetting the halfmove clock.

The history reducer must treat these mechanisms separately.

### 2.4 Future-relevance minimization is optional, not a hot-path requirement

A mathematically minimal repetition context could be described as retaining only historical states that can still participate in a future repetition. That does **not** imply production search should solve a reachability problem at every node.

Valid implementation levels include:

1. retain the complete bounded repetition context since a safe barrier;
2. apply cheap incremental barrier rules;
3. intern persistent history contexts;
4. introduce stronger future-relevance minimization only if it is independently shown to pay for itself.

Exactness does not require maximal compression.

---

## 3. Transition identity and proof transfer are different relations

A central correction is to keep three notions separate:

```text
Q_V : value/outcome class
Q_T : exact transition identity/congruence
R_P : structurally recognizable proof-transfer relation
```

### 3.1 Value class `Q_V`

The degenerate mapping:

```text
Q_V(x) = exact W/D/L value of x
```

has enormous compression but is useless as a search key because determining the key already requires solving the state.

Value equality is therefore an oracle/analysis result, not a usable proof identity by itself.

### 3.2 Transition congruence `Q_T`

`Q_T` is the identity strong enough to support ordinary search-state reuse.

For a W/D/L value-only quotient, duplicate physical moves into the same quotient child do not matter. The relevant object is the set of unique successor classes plus terminal/rule observations.

Conceptually, for augmented concrete states `x1` and `x2`:

```text
Q_T(x1) = Q_T(x2)
```

requires:

1. identical observable terminal/rule status for the declared contract;
2. identical side-to-move/value orientation;
3. identical sets of unique quotient successor classes under the chosen action-observation contract;
4. recursive preservation of the same condition.

For unlabeled W/D/L solving:

```text
Succ_Q(x) = unique { Q_T(T(x,a)) | a in A(x) }
```

and the required equality is set equality of quotient successors, not equality of physical move counts and not a bijection between move strings.

If a consumer requires move-specific scores, policy labels or exact root-action identity, use a finer action-labelled transition contract. Consumer-relative exactness is mandatory.

### 3.3 Root action witnesses

Even if multiple physical actions collapse to one quotient edge, the engine must be able to emit a legal physical root move.

Each quotient edge should therefore retain or reconstruct at least one valid witness:

```text
(q, quotientEdge, representativeContext) -> physical move
```

Search may reason over unique quotient successors while the interface preserves executable move identity.

### 3.4 Recognizable proof-transfer relation `R_P`

`R_P` is intentionally weaker than `Q_T` but cannot be defined merely as equal solved value.

A useful proof relation must be structurally recognizable **before** the target position is solved and must declare exactly what fact transfers.

Prefer typed contracts such as:

```text
Transfer_WDL(r1, r2, certificate) -> certified W/D/L fact
Transfer_LowerBound(r1, r2, bound) -> certified lower bound
Transfer_DrawCertificate(r1, r2, certificate) -> certified draw fact
```

or a proved preorder:

```text
x1 <=_P x2  =>  LB(x1) <= LB(x2)
```

The relation may be asymmetric. It need not be an equivalence class.

### 3.5 Proof cache and transition TT must remain typed

Do not replace the ordinary TT key with a broad proof key unless the proof key is also a qualified transition congruence.

Use distinct authorities:

```text
Transition TT
  key: Q_T(X)
  may store:
    exact values
    qualified alpha-beta bounds
    depth/search metadata
    best/witness move information

Proof / Bound Cache
  key or relation: R_P(X)
  may store only:
    facts explicitly certified transferable by the R_P contract
```

A proof relation that transfers W/D/L does not automatically transfer depth-conditioned alpha-beta scores, move ordering or successor structure.

---

## 4. Negamax and cyclic-game semantics

For an acyclic game the side-to-move recurrence can be written directly as:

```text
V(X) = max_a -V(T(X,a))
```

Chess contains cycles. The recurrence remains the local value law, but a complete solver also needs cycle/draw semantics over the augmented state graph.

The quotient must therefore preserve:

- strongly connected/cyclic behavior relevant to the rule profile;
- repetition and halfmove-rule outcomes through `hq`;
- terminal checkmate/stalemate observations;
- any claimable-draw action semantics.

Offline exact solving may use retrograde/fixed-point/SCC machinery rather than naïve recursive evaluation. Forward negamax may use the same `Q_T` identity with qualified repetition handling.

This is another reason the authoritative transition relation is over augmented state `X`, not board geometry alone.

---

## 5. Reversible reactivation: the principal semantic risk

Connect Four admits permanent information loss because stones accumulate and blocked residual win relations cannot reappear.

Chess does not provide that monotonicity for non-pawn pieces.

A relationship that is inactive now may become relevant after a reversible sequence:

- a pinned piece may become unpinned;
- a blocked slider ray may reopen;
- a rook may re-enter a file many plies later;
- a knight may leave and return;
- a dormant sector may reconnect without a capture or pawn move.

Therefore:

```text
inactive now != dead forever
```

A candidate quotient may discard a distinction only when the states remain equivalent under all future behavior required by the consumer contract, including possible reactivation.

A useful conceptual distinction is:

```text
ACTIVE
DORMANT / reactivatable
IMPOSSIBLE / behaviorally dead
```

but these labels are research aids, not proof authority.

The decisive experiment is whether behavioral refinement restores almost every physical distinction. If it does, unrestricted chess may have little useful transition compression even though restricted domains still do.

---

## 6. Representation and execution are orthogonal

Bitboards are not prohibited by the relational hypothesis.

A strong intermediate architecture is:

```text
semantic identity / proof identity
        Q_T(X), R_P(X)
             |
             v
optimized execution representation
        bitboards / piece lists / attack maps
```

Keeping bitboards as an operational cache does not make the design equivalent to a conventional Zobrist engine if physically distinct augmented states can share `Q_T` or certified facts through `R_P`.

### 6.1 Discovery path

During early research it is acceptable to use:

```text
physical representative
  -> conventional legal move generation
  -> physical children
  -> map each child to candidate quotient class
  -> deduplicate unique quotient successors
```

This isolates the existence and usefulness of the quotient before requiring a direct quotient move generator.

### 6.2 Cached quotient successor sets

If the joint transition identity is qualified, cache:

```text
Succ_Q(Q_T(X))
```

not merely `Succ_Q(q)` unless the factorization has proven that `h` cannot affect the legal successor set.

This is a critical correction. Castling, en-passant, repetition claims and other rule context may change successor semantics even for identical positional descriptors.

### 6.3 Direct transition is a later promotion step

Only after useful compression is demonstrated should production work attempt a direct incremental operator:

```text
T_Q(X, quotientAction) -> X'
```

The first evidence campaign need not solve that engineering problem in advance.

---

## 7. Compression metrics without double counting

For a history-sensitive experiment, define the concrete augmented graph:

```text
G_P = (X_P, E_P)
```

where each `X_P` node includes all concrete rule/history facts required by the chosen contract.

Let the transition quotient graph be:

```text
G_Q = (X_Q, E_Q)
```

### 7.1 State compression

```text
C_S = |X_P| / |X_Q|
```

### 7.2 Branching compression

```text
C_B = (|E_P| / |X_P|) / (|E_Q| / |X_Q|)
```

### 7.3 Total graph compression

```text
C_graph = C_S * C_B = |E_P| / |E_Q|
```

`C_graph` already includes state and average branching reduction. Do not multiply it by another state factor.

### 7.4 History metrics

Do not use `|H| / |Q_T|`; those sets describe different dimensions.

Measure instead:

- number of distinct history classes per positional `q`;
- mean / p95 / maximum history classes per `q`;
- fraction of reached states with a trivial history class `h0`;
- augmentation factor `|X_Q| / |Q_position|`;
- state compression before versus after adding exact history semantics;
- incremental cost of updating `hq`;
- repetition/cycle cache hit rates.

### 7.5 Final decision metric

All compression ratios are diagnostics.

Promotion requires:

```text
TimeToExactProof(relational) < TimeToExactProof(control)
```

under fair accounting of:

- quotient recognition/mapping;
- history updates;
- physical or direct move generation;
- transition-cache probes;
- proof-cache probes;
- memory footprint and cache locality;
- canonicalization;
- solver control flow;
- oracle/tablebase probe cost where used.

No arbitrary state-compression ratio such as `> 5x` is itself sufficient for promotion.

---

## 8. Experimental falsification ladder

### Stage 0 — rule contract and independent oracle

Before quotienting, freeze:

- chess rules/profile;
- terminal observations;
- claim semantics;
- W/D/L versus DTM/DTZ consumer contract;
- canonical physical-state identity;
- independent reference solver/tablebase oracle.

Do not let the candidate quotient define its own correctness oracle.

### Stage 1 — complete bounded transition domains

Use complete tractable material classes and/or closed bounded domains to build the physical augmented graph and compute the coarsest observation-preserving transition quotient for the declared contract.

A useful quotient ladder is:

```text
P / X_P         concrete augmented states
Q_sym           conventional legal symmetries only
Q_T             coarsest qualified transition congruence
Q_rel           candidate compact structural descriptor
```

Measure:

- `C_S`;
- `C_B`;
- `C_graph`;
- class-size distribution;
- physical-move-to-quotient-edge multiplicity;
- quotient-edge witness requirements;
- whether candidate `Q_rel` matches the oracle `Q_T` partition.

Partition refinement is an **offline discovery/oracle tool** for these bounded domains. Production search is not expected to run global partition refinement.

### Stage 2 — history and reversibility domains

Construct or extract bounded cyclic suites that deliberately stress:

- reversible shuffles;
- threefold/fivefold repetition conditions;
- 50/75-move counters;
- pawn moves and captures;
- castling-right loss and castling itself;
- en-passant availability and expiration;
- reactivation after long reversible sequences.

Measure the history metrics from Section 7.4 and verify that candidate `hq` never merges states with different future rule behavior.

This stage exists because conventional endgame tablebases alone do not exercise the complete history automaton.

### Stage 3 — proof-transfer discovery and qualification

Search for structurally recognizable `R_P` relations that transfer specific exact facts across non-identical physical states.

For every proposed proof-transfer contract:

1. derive the relation without consulting the target state's solved value;
2. state the exact fact type that transfers;
3. validate against an independent oracle;
4. adversarially search for counterexamples;
5. measure useful proof-cache hits and work avoided.

Equal W/D/L alone is not a proof relation.

### Stage 4 — existing local 6/7-piece tablebase as oracle source

A local 6- or 7-piece endgame tablebase set already exists in the broader project environment. Do **not** download or regenerate an equivalent oracle as a prerequisite.

At execution time, first verify:

- exact tablebase format/profile;
- available material classes;
- integrity/coverage;
- whether WDL, DTZ or other metrics are available;
- rule semantics represented by the files.

Then use it as an oracle/sampling source rather than attempting to materialize the complete 6/7-piece transition graph.

Suitable uses include:

- sampling structurally diverse exact positions;
- adversarial validation of proposed `R_P` facts;
- selecting complete smaller material slices when feasible;
- measuring candidate-key collision/multiplicity distributions;
- testing W/D/L-first versus optional distance refinement.

If the local set is Syzygy-compatible, remember that standard Syzygy tablebases provide WDL and DTZ-style information up to seven pieces and do not by themselves constitute a full arbitrary repetition/castling-history oracle. Verify the actual local profile rather than assuming it.

### Stage 5 — wall-clock solver comparison

Compare at least:

```text
A. Conventional control
   bitboard execution
   + conventional exact-position/Zobrist TT

B. Hybrid proof architecture
   conventional bitboard execution
   + normal Transition TT
   + relational Proof/Bound Cache using qualified R_P

C. Quotient-transition architecture
   representative or direct execution
   + Q_T transition identity
   + cached quotient successors
   + qualified history automaton

D. Direct relational architecture, only if earned
   packed (q,hq) identity
   + direct incremental quotient transition
   + no mandatory physical board in recursive state
```

All variants must use the same declared exact result contract and comparable total memory budgets where practical.

---

## 9. Promotion and falsification gates

### Reject direct relational state replacement for a tested domain when

- `Q_T` is effectively physical identity after valid symmetries/history are included;
- quotient branching barely contracts;
- candidate descriptors are materially more expensive than the proof work they eliminate;
- direct/cached quotient execution loses time-to-proof under fair memory and oracle controls.

Do not overgeneralize a negative result from one restricted domain to all chess without evidence.

### Promote the hybrid proof-cache architecture when

- `Q_T` remains too fine for state replacement;
- but a structurally recognizable `R_P` yields significant exact proof/bound reuse across physically distinct augmented states;
- and the proof-cache overhead produces a reproducible net time-to-proof improvement.

### Promote quotient-transition search when

- `Q_T` gives meaningful state/edge compression beyond ordinary symmetry/transposition identity;
- membership and transition can be recognized cheaply enough;
- exactness survives history/reactivation tests;
- cached or direct quotient transitions improve time-to-proof.

### Promote fully direct relational search only when

- on-the-fly packed `T_Q` and `T_H` are qualified;
- the physical board is no longer needed in recursive search state except as an optional execution cache;
- total-system performance beats the conventional control.

---

## 10. Explicit non-claims

This note does **not** claim that:

- unrestricted middlegame chess has large behavioral quotient classes;
- a boardless chess engine will outperform bitboards;
- ordinary strong bisimulation is the only useful exact relation;
- equal W/D/L values imply transferable proof certificates;
- the local 6/7-piece tablebase contains full history semantics;
- partition refinement can be run over the complete chess state space;
- current inactivity makes a relation permanently irrelevant;
- every quotient edge can be generated directly without physical move generation;
- compression alone establishes performance.

---

## 11. Current research position

The conceptual debate is closed unless a new correctness issue is identified.

The remaining central questions are empirical:

1. Does chess contain non-trivial exact transition congruence beyond ordinary physical/symmetry identity in useful domains?
2. Does action deduplication materially reduce quotient branching?
3. How much does exact history context fragment positional quotient classes?
4. Can a compact descriptor reproduce the discovered transition classes incrementally?
5. If full transition compression is weak, do structurally recognizable proof-transfer relations still yield useful exact reuse?
6. Does any resulting architecture reduce **time to exact proof** after all representation, history and cache costs are included?

The research therefore ends argument and begins measurement:

```text
coherent -> falsifiable -> oracle-backed -> bounded experiment -> time-to-proof decision
```

The existing local 6/7-piece endgame tablebase means the project already has a strong exact oracle source for the next phase. Small complete domains remain useful for exhaustive behavioral discovery, but there is no need to build or download a new large endgame oracle before starting.
