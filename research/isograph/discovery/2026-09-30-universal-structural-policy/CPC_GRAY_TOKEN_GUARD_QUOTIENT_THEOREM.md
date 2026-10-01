# CPC gray-token guard quotient theorem candidate

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** structural quotient theorem candidate  
**Branch:** `research/universal-structural-policy-20260930`

## Research clue

Joshua Oshiro proposed using gray tokens for occupied cells that can no longer contribute to any live Connect Four winning line, so that otherwise distinct ownership states can collapse to one proof state.

This file formalizes that clue conservatively for the current CPC guard-set proof. It does not assert that every board distinction can be gray-normalized.

## 1. Live-line definition

For a legal current board (q), a geometric four-cell line (L) is live for player (P) iff (L) contains no token owned by the opponent of (P).

Thus a line may be:

- live for player 0;
- live for player 1;
- live for both while empty;
- dead for both after it contains both colors.

An occupied cell (x) is **gray** iff it belongs to no line that is live for either player.

Equivalently, every four-line containing (x) is already dead for both players.

## 2. Irreversibility

Connect Four only adds tokens.

Once a line contains both colors, no later move can make that line live again.

Therefore grayness is monotone:

[
xin G(q)implies xin G(q')
]

for every legal descendant (q') in which the already-occupied cell (x) remains on the board.

## 3. Ownership irrelevance of a gray token

For an already occupied gray cell:

- gravity depends only on occupancy/support height, not token color;
- no present or future winning line for either player can use that cell;
- changing only its owner cannot create, remove, or revive a live four-line;
- terminal first-win precedence is unaffected because a gray cell is in no live line.

Hence, conditional on identical support/occupancy and identical ownership of all non-gray cells, the owner label of a gray cell is not a load-bearing game-state distinction.

This is the ordinary neutral-token quotient already audited independently in pinned JSMinSys authority by `test/neutral-token-quotient.test.mjs`, where exhaustive legal 4x4 states showed that neutral-token-equivalent boards never split across RBA (q).

The present theorem does not rely on that test alone; the structural reason is line-death irreversibility above.

## 4. Canonical gray physical code

On standard 7x6, the exact gravity-valid position code stores:

- support implicitly through each column sentinel;
- player-1 ownership bits below the sentinel.

Define (N(q)) by clearing the ownership bit of every occupied gray cell while preserving all support sentinels and all non-gray ownership bits.

Thus every gray token is represented by one canonical color code.

This does **not** alter the exact RBA state used for CPC/cofactor computation. It is only a proof-state identity quotient.

## 5. Gray-safe odd-row resource

The existing guard-set proof tracks defender ownership on occupied odd one-based rows.

For survival/blocking purposes define an odd occupied cell as **guard-safe** iff it is either:

1. defender-owned; or
2. gray.

A gray cell is admissible here because the guard theorem uses the carried odd-row resource to deny attacker winning-line use. A gray cell is already permanently unusable by the attacker on every winning line containing it.

It is not being treated as a defender scoring token.

Define the effective odd-row safety mask

[
M^*(q)=M_D(q)cup G_{mathrm{odd}}(q),
]

where (M_D) is the prior defender odd-row ownership mask.

The reconstructed guard set becomes

[
Gamma^*(q)=Gamma(q,M^*(q)).
]

## 6. Transition rule

Exact cofactors remain authoritative.

After every attacker/defender pair:

1. update the exact RBA child normally;
2. update exact physical occupancy normally;
3. recompute gray cells from the exact child;
4. recompute (M^*) and (Gamma^*) from current state.

No gray bit is transported by fiat.

Because grayness is monotone for already occupied cells, a gray carrier cannot later become attacker-relevant.

Newly dead cells may become gray and therefore permit additional state collapse.

## 7. Compact memo identity

For fixed attacker and horizon, the candidate compact memo identity is

[
K(q,D)=igl(N(q),M^*(q),Digr).
]

The exact RBA state is still used to generate and validate every response and child.

The quotient is admissible only if fresh qualification confirms that states merged by (K) are observation-equivalent for the guard survival proof.

## 8. Qualification plan

Before using this as positive D25+ evidence:

1. verify gray-cell detection against direct colored-board live-line reconstruction;
2. verify gray monotonicity under fresh exact cofactors;
3. verify the effective odd-row safety mask and guard set by direct reconstruction;
4. validate the gray quotient at already-established horizons;
5. audit any memo collision where distinct exact physical states share one gray key;
6. require identical constructive acceptance/failure behavior for collision groups at validation horizons;
7. only then use the quotient to extend the horizon ladder.

## Claim discipline

This candidate:

- adds no solved W/D/L premise;
- adds no oracle premise;
- adds no new legal response type;
- does not change gravity/support;
- does not turn gray cells into scoring tokens;
- does not assert a literal Nim-sum;
- does not by itself prove candidate-6 optimality or v5.

Its sole intended effect is to remove ownership distinctions that can no longer affect any live Connect Four line while preserving the current CPC guard-survival semantics.
