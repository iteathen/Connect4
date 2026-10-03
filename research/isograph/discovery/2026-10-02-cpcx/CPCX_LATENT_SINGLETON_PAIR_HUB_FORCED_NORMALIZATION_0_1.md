# CPCX Latent-Singleton Pair-Hub Forced-Normalization Handoff 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Parent theorem:** `CPCX_LATENT_SINGLETON_PAIR_HUB_OVERLOAD_0_1`  
**Observation:** one current defender event may create a unique forced controller block before the qualified latent pair-hub theorem re-enters

## Purpose

Extend the qualified latent-singleton pair-hub first-win theorem by one
deterministic normalization seam without introducing recursive response search.

The base theorem is exact when every current defender event is handled directly
by the latent target / hub overload script. A narrowly different current event
may instead create one immediate defender singleton. The controller must block
that singleton before using the hub strategy.

If deterministic CPCX forced normalization restores the **same current
latent-singleton pair-hub candidate**, the already-qualified base theorem may be
reused at the normalized boundary.

This theorem is an adaptive current-response composition:

```text
observe one current defender event d

ordinary row:
  use the qualified base pair-hub response

forced-normalization row:
  execute exact deterministic forced normalization
  -> re-enter the qualified base pair-hub theorem
```

The theorem never invokes itself.

## Objects

Let `S` be an exact nonterminal position.

Let:

- `D=S.mover` be the current defender/opponent;
- `A=D^1` be the controller/attacker;
- `C=(t,h,P)` be one current live candidate admitted by
  `findCpcxLatentSingletonPairHubCandidates`:
  - latent attacker singleton target `t` at support distance one;
  - support hub `h` immediately below `t`;
  - at least two distinct current playable pair spokes `P`.

The parent theorem and its physical-spoke deduplication remain authoritative.

## Premises

1. **Exact nonterminal source.**

2. **Opponent to move.** `S.mover=D=A^1`.

3. **Current live base candidate.**
   `C` is reconstructed mechanically from `S`; no caller-supplied stale
   candidate is trusted.

4. **No source immediate precedence.**
   `classifyCpcxImmediate(S)=NO_IMMEDIATE_OBLIGATION`.

5. **Flat current-frontier quantification.**
   Audit every current legal `D` event exactly once. No descendant defender
   frontier is generated.

## Per-event theorem

For each current legal defender event `d`, apply exact `D:d`.

### Case A — defender terminal

If `D:d` is terminal for `D`, fail closed.

### Case B — immediate attacker terminal

If the exact child has
`IMMEDIATE_TERMINAL_AVAILABLE` for `A`, this row is certified first win.
The row retains the exact winning-cell set.

### Case C — ordinary pair-hub row

If the child has `NO_IMMEDIATE_OBLIGATION`, apply the same fixed row semantics
as the qualified parent theorem:

- if `d=h`, `A:t` must terminally complete;
- otherwise `A:h` must either terminally complete or produce a deduplicated
  attacker singleton overload containing the released `t` and at least one
  surviving distinct spoke, with no defender counterterminal.

No future defender frontier is enumerated.

### Case D — deterministic forced-normalization row

If the exact child has one CPCX `FORCED_RESPONSE` for `A`:

1. invoke `closeCpcxForcedResponses` from that exact child;
2. the closure may use only deterministic singleton normalization;
3. any first win for `D` rejects the theorem;
4. a certified first win for `A` closes the row;
5. otherwise the closure must end `OPEN`;
6. the mover must again be `D`;
7. reconstruct latent pair-hub candidates at the normalized state;
8. require the **same role candidate**:
   - same physical latent target `t`;
   - same physical hub `h`;
   - at least the same two selected physical spokes remain admitted;
9. invoke the already-qualified **base**
   `certifyCpcxLatentSingletonPairHubOverload` exactly once on the normalized
   child;
10. the base theorem must return `CERTIFIED_FIRST_WIN(A)`.

The extension theorem is not called again.

### All other immediate classes

Fail closed. In particular, opponent overload/counterterminal boundaries are
not erased or reinterpreted.

## Conclusion

If every current defender event is certified by Case B, C, or D, emit:

```text
CERTIFIED_FIRST_WIN(A)
source = LATENT_SINGLETON_PAIR_HUB_FORCED_NORMALIZATION_HANDOFF
```

with one proof row per current defender event and explicit provenance of:

- direct parent-theorem row;
- immediate controller terminal; or
- deterministic normalization trace followed by one base-theorem certificate.

## Well-foundedness

No recursive theorem call occurs.

For a forced-normalization row, at least one physical event is consumed after
the current defender event. Therefore remaining physical capacity strictly
decreases before the parent theorem is re-entered:

```text
remainingCapacity(normalized) < remainingCapacity(S).
```

This is a local handoff witness, not yet the global turn-6 recurrence theorem.

## Why this is not search

The only quantified choice set is the current legal defender frontier.

After each observed defender event:

- the controller response is fixed by the parent pair-hub theorem; or
- CPCX immediate semantics determine a unique forced normalization sequence.

No arbitrary controller reply is selected, no second free defender layer is
enumerated, and no value/minimax label is consulted.

## Complexity

For width `W`, live-line count `L`, board capacity `N`, and fixed
Connect-K cardinality `K`:

```text
current frontier audit:     O(W)
deterministic normalization: O(N * L * K) worst-case per forced row
base pair-hub theorem:      O(W * L * K)
total:                      polynomial in W, N, and L
```

Connect Four has fixed `K=4`.

## Required qualification controls

### Fresh positive — forced normalization then base re-entry

Use `5×3, connect-3`, sequence:

```text
1243345
```

P1 is to move.

The live candidate is:

```text
latent target: B3
hub:           B2
spokes:        A2, C3
```

The current defender event:

```text
P1:E2
```

creates a unique forced controller normalization:

```text
P0:E3
```

After that deterministic block, P1 is again to move and the same
`B3/B2/{A2,C3}` candidate is live. The qualified parent theorem must certify
that normalized boundary.

### Required negatives

Qualification must preserve fail-closed behavior when:

1. the current defender event terminally wins;
2. immediate classification after the defender event is not a unique forced
   response and is not an attacker terminal;
3. deterministic normalization ends in a defender first win;
4. deterministic normalization ends open but not with `D` to move;
5. the original target/hub role is lost;
6. fewer than two selected physical spokes survive;
7. the parent pair-hub theorem remains non-exact after normalization;
8. production CPC / solver / oracle / recursive-search isolation is violated.

## Turn-6 application boundary

A consumed rank-33 endpoint has:

```text
P1 to move
latent target: C6
hub:           C5
spokes:        B5, D6
```

The parent theorem's sole first-win seam is:

```text
P1:G4
```

because it creates an immediate P1 singleton at `G5`.

CPCX deterministic normalization is:

```text
P1:G4 -> P0:G5
```

and reaches an open P1-to-move state where the same `C6/C5/{B5,D6}` candidate
is live and the qualified parent theorem certifies P0 first win.

That consumed state is an application target only. It is not a theorem premise.

Even after this handoff qualifies, `Best(44444)` remains unproved until the
surrounding protected-diagonal recurrence is shown closed for every remaining
endpoint descriptor.
