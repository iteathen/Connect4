# CPC neutral-token guard quotient theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact quotient / guard-state relaxation theorem candidate  
**Branch:** `research/universal-structural-policy-20260930`

## Purpose

Apply the already-qualified RBA neutral-token principle to the current-state odd-row guard side-state.

The current guard-set proof correctly avoids reattaching full physical ownership to RBA, but its 21-bit odd-row defender mask can still distinguish ownership of occupied cells whose ownership has become irrelevant to every still-possible Connect Four winning line.

Those ownership distinctions are gray-token distinctions and may be erased.

This theorem changes no legal response rule.

## 1. Neutral occupied cell

For a legal current state (q), call an occupied physical cell (x) **neutral** iff (x) belongs to no still-possible four-cell winning line for either player.

Equivalently, every winning line containing (x) is already killed for both ownership interpretations relevant to future play.

The cell remains physically occupied and therefore continues to contribute to:

- support height;
- gravity;
- frontier location;
- column exhaustion.

Only its player-ownership label is erased.

This is the same semantic neutral-token quotient already qualified in the pinned RBA lineage.

## 2. Neutrality is monotone

Connect Four only adds tokens.

A winning line that is no longer still-possible cannot become possible again after additional tokens are added.

Therefore:

[
x	ext{ neutral at }q
Longrightarrow
x	ext{ neutral at every legal descendant containing }x.
]

Once ownership is erased for a neutral occupied cell, no future proof state needs to recover it.

## 3. Neutral-aware odd-row ownership mask

Let (M_D(q)) be the existing defender-owned odd-row mask.

Let (N(q)) contain every occupied odd-row cell that is neutral in the current state.

Define the quotient mask

[
widetilde M(q)=M_D(q)cup N(q).
]

A set bit now means:

> this occupied odd-row cell cannot be attacker-owned in any way that remains relevant to future winning-line obligations.

That can be true either because the defender owns it or because ownership is neutral.

## 4. Relaxed guard reconstruction

For a nonfull odd-height column (g), reconstruct a neutral-aware guard when every occupied odd one-based row through the current height satisfies the quotient mask:

[
g1,g3,g5inwidetilde M
]

as applicable to the current height.

This weakens only ownership bookkeeping. It does not weaken support, gravity, height, first-win stopping, or any response legality premise.

## 5. Why the guard contract remains sound

The frozen odd-row guard theorem uses prior odd-cell defender ownership for two purposes.

### 5.1 Same-column renewal

If the attacker plays the next even row while a higher odd row exists, gravity makes that higher odd row immediately playable by the defender.

That transition depends on support and turn order, not on the ownership label of older occupied cells.

So neutralizing an older odd cell cannot invalidate the exact same-column renewal.

### 5.2 Blocking live attacker winning lines

For a non-neutral guard-chain cell, the relaxed predicate still requires defender ownership. Therefore any still-live attacker line whose obligation uses that cell remains blocked.

For a neutral guard-chain cell, by definition no still-possible winning line for either player uses that cell. There is no remaining attacker obligation for its ownership to block.

Thus replacing

[
	ext{defender-owned}
]

by

[
	ext{defender-owned OR neutral}
]

does not remove a live attacker blocker obligation.

## 6. Child reconstruction and forgetting

After every exact trigger/response cofactor:

1. update support and RBA normally;
2. update the odd-row ownership mask for newly occupied odd cells;
3. recompute or derive newly neutral occupied odd cells;
4. promote those bits into (widetilde M);
5. never restore ownership distinctions for already-neutral cells.

Because neutrality is monotone, this is a one-way quotient.

Two states with the same exact RBA state and the same neutral-aware guard mask may share the guard survival memo entry even if raw ownership differs only on neutral occupied odd cells.

## 7. Relation to RBA

Pinned JSMinSys evidence already establishes on an exhaustive reachable 4x4 audit that every neutral-token equivalence collapses in RBA q and that RBA q is strictly coarser than the explicit neutral-token board quotient.

Therefore the class key should not reattach raw physical ownership to RBA.

For this guard-set proof, the only extra ownership information retained beyond RBA is the minimum side-state required by the guard contract, after neutral ownership has been erased.

## 8. Qualification plan

Before using this quotient to claim additional horizon reach:

1. preserve the frozen response grammar unchanged;
2. verify D15/D19/D21/D23 remain accepted;
3. audit neutral-aware mask updates against direct board reconstruction on fresh legal states;
4. include cases where an attacker-owned odd cell becomes neutral and is subsequently treated as gray;
5. verify exact guard reconstruction and same-column renewal from the quotient state;
6. only then use the quotient for D25+ memory reduction.

## Claim discipline

This theorem candidate:

- erases ownership only after it has no remaining live-line meaning;
- preserves occupancy, support, gravity, column height, and turn parity;
- adds no legal response;
- does not assert a literal Nim-sum;
- does not by itself prove candidate-6 optimality, exact remoteness, v5, or a complete 7x6 solve.
