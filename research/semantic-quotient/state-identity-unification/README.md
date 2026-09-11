# State identity unification experiment

**Status:** Research / experiment plan

**Branch:** `research/semantic-quotient`

## Question

Can Connect Four state identity be reduced from physical board identity to a smaller exact primitive/residual relationship state that is useful across minimax/alpha-beta, CUDA-BSFP, and hybrid confluence **without making any solver's hot path slower**?

This experiment is solver-neutral. It does not own search control flow, CUDA-BSFP execution, hybrid scheduling, or production solver state layouts.

## Working distinction

Treat three concepts separately:

1. **Operational state** — the representation a solver uses to execute transitions cheaply. Minimax may continue using a bitboard even if another identity becomes authoritative for equivalence.
2. **Semantic identity** — the smallest exact state needed to preserve the consumer's future game behavior.
3. **Proof state** — exact W/D/L, strong score, bounds, distance or other certified facts associated with an identity.

The experiment must not assume these should collapse into one physical representation.

## Candidate semantic state

The current qualified semantic-quotient chain already supports a strong candidate:

```text
support/accessibility
+ minimal current-player residual winning-requirement antichain
+ minimal opponent residual winning-requirement antichain
```

MQ4 showed that bounded controls can transition directly from this residual state without recursively carrying the colored board or identified-line history.

The next question is not merely whether this state is exact. It is whether it is economically useful as a common identity for the three solver lines.

## Exactness levels

Do not conflate these levels:

### Value equivalence

```text
q(s1) == q(s2) => V(s1) == V(s2)
```

Useful for exact lookup/proof reuse, but insufficient to replace operational state.

### Action-score equivalence

Corresponding legal actions have equal exact scores.

Useful for stronger TT/proof reuse and move-order information.

### Action-labelled game congruence

For corresponding legal actions:

```text
q(next(s1, a)) == q(next(s2, phi(a)))
```

with terminal semantics and action correspondence preserved.

Only this stronger form can justify navigating the quotient directly instead of carrying a physical board representation.

## Consumer-sensitive identity

Equivalence is relative to the value contract.

A quotient exact for W/D/L may not be exact for a distance-sensitive strong score. Maintain separate evidence for at least:

- W/D/L identity;
- distance/strong-score identity;
- action-labelled transition identity.

Do not broaden a result beyond the value contract actually tested.

## Experiment program

### SIU-1 — shadow identity census

Run an unchanged exact solver over bounded complete controls while computing candidate semantic identity `q(s)` in shadow mode.

Measure:

- physical states per semantic identity;
- exact W/D/L collision correctness;
- strong-score collision correctness;
- action-score collision correctness;
- successor-class consistency;
- distribution of merge multiplicity, not just the mean.

**Falsifier:** any collision violating the tested consumer contract.

### SIU-2 — useful-transposition replay

Replay a real minimax trace without changing search behavior.

For each repeated semantic identity, measure whether an exact reusable fact was already available early enough to save work.

Measure:

- additional useful hits versus ordinary board identity;
- descendant nodes that would have been avoided;
- cutoff amplification;
- heavy-tail concentration of savings;
- semantic-key compute cost.

The relevant quantity is saved work, not raw collision count.

### SIU-3 — secondary semantic TT

Keep the ordinary minimax board/TT path intact and add the semantic identity only as an experimental secondary lookup.

Compare:

- exact result equivalence;
- wall-clock time;
- node count;
- TT hit usefulness;
- cache footprint;
- key-generation cost;
- move-order stability.

A smaller key that produces more hits but slower wall time is a failed optimization.

### SIU-4 — incremental semantic transition

Test whether the semantic identity can be maintained locally per move:

```text
q' = T(q, move)
```

without rescanning the board.

Measure transition cost against the incumbent board update and against recomputation from board state.

### SIU-5 — cross-solver identity contract

If SIU-1 through SIU-4 succeed, test whether minimax and CUDA-BSFP can publish/consume the same logical identity while retaining different physical hot representations.

The desired shape is:

```text
minimax operational board B + semantic q
CUDA-BSFP native structure      + semantic q
hybrid proof publication keyed by q
```

Physical state is shared only if later measurement proves that doing so is faster.

### SIU-6 — direct quotient navigation

Only after action-labelled congruence and transition economics are established should an experiment remove the physical board from recursive forward solving.

This is the strongest and highest-risk step, not the starting point.

## Performance rule

Unification is accepted only when it produces a measurable total-system benefit.

Use the decision inequality:

```text
saved solver work
  > semantic conversion cost
  + synchronization/publication cost
  + locality/cache cost
  + any slowdown to solver-native operations
```

Architectural elegance is not evidence.

## Ownership / promotion gate

This packet owns experimentation only.

- minimax-specific implementation remains on `solver/minimax-alpha-beta`;
- CUDA-BSFP-specific implementation remains on `solver/cuda-bsfp`;
- hybrid-confluence implementation remains on `solver/hybrid-confluence`;
- shared exact semantic findings remain on `research/semantic-quotient` until deliberately promoted.

No solver branch should receive speculative state-identity machinery merely to prepare for possible future unification.

Promotion requires:

1. exactness evidence for the target consumer contract;
2. benchmark evidence showing a notable net gain;
3. a clear ownership boundary for the promoted mechanism;
4. no material regression to solver-native hot-path operations.

## Current hypothesis

The likely winning architecture is **logical identity unification without mandatory physical representation unification**.

Minimax can retain a bitboard for cheap move execution while carrying or deriving an exact residual identity. CUDA-BSFP can use its own bulk representation. Hybrid confluence can exchange proof facts keyed by the common semantic identity.

If later experiments show that a direct residual transition machine is faster than the bitboard path, physical convergence can occur as an observed optimization rather than as a design objective.

## Non-claims

- no standard 7x6 exhaustive quotient proof is established by this packet;
- no production minimax speedup is claimed;
- no claim is made that board state should be removed;
- no claim is made that transposition disappears;
- no claim is made that minimax, BSFP and hybrid should share mutable physical state.
