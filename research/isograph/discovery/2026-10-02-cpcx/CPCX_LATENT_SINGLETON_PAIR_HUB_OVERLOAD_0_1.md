# CPCX Latent-Singleton Pair-Hub Overload 0.1

**Status:** frozen theorem contract before implementation  
**Scope:** experimental CPCX only  
**Observation:** opponent-to-move precursor combining support release with pair-hub response overload

## Purpose

Close a structural class that ordinary CPC2 intentionally misses.

Ordinary CPC2 detects a current attacker trigger whose owner-labelled cofactor
creates multiple playable singleton completions.  It does not count a
*pre-existing* attacker singleton that is support-hidden before the trigger
and becomes playable because the trigger supplies its support.

The present theorem handles exactly that composition.

A controller/attacker has:

1. one live singleton target `t` at support distance one;
2. its unique support cell `h`, which is current frontier;
3. at least two live two-piece residuals sharing `h` whose other endpoints
   are distinct and currently playable.

The opponent moves now.

If the opponent occupies `h`, it releases `t` for an immediate controller
terminal.  If the opponent occupies one spoke, the controller can occupy `h`,
which releases `t` and contracts a surviving hub pair to another distinct
playable singleton.  If the opponent plays elsewhere, `h` releases `t`
and contracts at least two surviving hub pairs.

Under explicit first-win guards this creates response-capacity overload without
recursive reply search.

## Objects

Let `S` be an exact nonterminal finite-gravity Connect-K position.

Let:

- `D=S.mover` be the current opponent/defender;
- `A=D^1` be the controller/attacker;
- `T` be one live `A` singleton residual with unique target `t`;
- `supportDistance_S(t)=1`;
- `h` be the unique cell immediately below `t`;
- `P={p_1,...,p_m}`, `m>=2`, be distinct spoke cells.

For every spoke `p_i`, there must exist at least one live `A` two-piece
residual with missing set exactly:

```text
{h,p_i}.
```

Both `h` and every `p_i` are current legal frontier cells.

Multiple winning-line descriptions with the same physical spoke are
deduplicated.  Response capacity is charged by physical completion cell, not by
residual-description multiplicity.

## Premises

1. **Exact nonterminal source.** `S` is exact and nonterminal.

2. **Opponent to move.** `S.mover=D=A^1`.

3. **No higher-precedence current terminal.**
   Current immediate CPCX classification is
   `NO_IMMEDIATE_OBLIGATION`.
   Existing forced terminals/normalizations are handled before this theorem.

4. **Depth-one attacker singleton.**
   `T.player=A`, `T.missingCount=1`, and its target `t` has exact support
   distance one.

5. **Unique support hub.**
   `h` is immediately below `t`, is empty, and is the current legal frontier
   in `t`'s column.

6. **Pair-hub spokes.**
   At least two distinct physical cells `p_i` satisfy:
   - `p_i != h`;
   - `p_i` is current legal frontier;
   - one live `A` residual has missing set `{h,p_i}`.

7. **Flat current-frontier quantification.**
   Every current legal defender event `d` is audited exactly once.  No child
   frontier is recursively enumerated.

## Response classes and exact audit

For each current legal defender event `d`:

### A. Defender occupies the hub: `d=h`

1. Apply exact event `D:h`.
2. If it is terminal for `D`, the theorem fails closed.
3. Otherwise `t` must be current legal frontier for `A`.
4. Exact `A:t` must terminally complete `T`.

This row is certified first win for `A`.

### B. Defender does not occupy the hub: `d!=h`

1. Apply exact nonterminal event `D:d`.
   A defender terminal here is a theorem falsifier.
2. `h` must remain current legal frontier.
3. Apply exact `A:h`.
4. If `A:h` is terminal, the row is already certified.
5. Otherwise compute the deduplicated set `U_d` of currently playable
   `A` singleton completion cells after `A:h`.
6. `U_d` must contain:
   - the released latent target `t`; and
   - at least one distinct surviving spoke completion.
7. Therefore `|U_d|>=2`.
8. Compute the deduplicated currently playable `D` singleton set after
   `A:h`.  It must be empty.
9. The defender has exactly one placement response slot before `A` moves
   again.  Distinct physical completion cells in `U_d` therefore give a Hall
   deficiency:

```text
|U_d| >= 2 > 1 response slot.
```

This row is certified first win for `A`.

## Conclusion

If every current defender frontier event passes one of the exact audits above,
emit:

```text
CERTIFIED_FIRST_WIN(A)
source = LATENT_SINGLETON_PAIR_HUB_OVERLOAD
```

with:

- the latent singleton line/target;
- hub cell;
- deduplicated spoke cells and line provenance;
- one exact proof row per current defender event;
- response-capacity witnesses;
- explicit first-win guards.

## Why this is not search

The theorem does not choose among future arbitrary replies and does not evaluate
child values.

It quantifies only the **current legal frontier** and applies a fixed
two-event structural script determined by the present hub:

```text
D:d
A:h          when d != h

D:h
A:t          when d = h
```

The next defender placement is not enumerated; its inability to cover at least
two distinct terminal cells is proved by response capacity.

For board width `W`, the current response class has size at most `W`.

## First-win semantics

Every physical event is checked with exact first-terminal stopping.

The theorem fails closed if:

- a current defender event terminally wins;
- after a non-hub defender event and `A:h`, the defender has an immediate
  terminal;
- fewer than two distinct playable attacker completion cells survive.

`NO_CERTIFICATE` has no draw/loss meaning.

## Complexity

For `W` columns, `L` live winning lines, and fixed Connect-K:

```text
candidate discovery: O(L*K)
current-frontier audit: O(W * L * K)
capacity check: O(W)
```

For Connect Four `K=4`.  There is no recursive game-tree traversal.

## Required qualification controls

### Fresh positive

Use `4×4, connect-3`, sequence:

```text
12234
```

P1 is to move.  P0 has:

```text
latent target: C3
hub/support:   C2
spokes:        A2, D2, B3
```

At least two distinct spokes share `C2`.  Every current P1 frontier event
must pass the theorem's flat audit.

### Counterterminal negative

Use `4×4, connect-3`, sequence:

```text
12232
```

The same latent/hub pattern exists, but the current defender has a first-win
counterterminal in the audited response class.  The theorem must fail closed.

Additional controls:

1. no candidate when fewer than two distinct physical spokes exist;
2. duplicate residual descriptions for one spoke do not count twice;
3. hidden/nonfrontier hub is rejected;
4. target support distance other than one is rejected;
5. current immediate obligation has precedence;
6. production-CPC / solver / oracle / recursive-search isolation.

## Turn-6 application boundary

A consumed B2 hazard leaf currently has:

```text
P1 to move
latent P0 singleton: C6, support distance 1
hub:                 C5
pair spokes:         B5, D6
```

Ordinary CPC2 identifies `C5` as a fork trigger but fails first-win totality
only on `P1:G4`, because that event creates the P1 counterterminal `G5`.

Deterministic forced normalization:

```text
P1:G4 -> P0:G5
```

returns to a P1-to-move state where CPC2 gives the exact blocker set:

```text
{B5,C5,D6}.
```

The present theorem is intended to test the stronger source structure directly,
including the latent `C6` release.  The consumed turn-6 leaf is an application
target only and is not a theorem premise.

Qualification of this theorem does not by itself establish
`Best(44444)=LegalActions(44444)`; the surrounding recurrence must still
compose every remaining endpoint to a certified first win or a strictly smaller
closed descriptor.
