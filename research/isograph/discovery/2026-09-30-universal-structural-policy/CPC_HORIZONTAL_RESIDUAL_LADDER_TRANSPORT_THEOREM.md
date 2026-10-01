# CPC horizontal residual-ladder transport theorem

**Date:** 2026-09-30  
**Version:** 0.1  
**Status:** exact local transition theorem candidate / CPC internal response edge  
**Branch:** `research/universal-structural-policy-20260930`  
**Implementation frozen before composition run:** `c478d377314b1d8f56f816a7c6b39c9da2e624a5`

## Purpose

Formalize the cross-residual response exposed by the ancestry-safe c6 failure analysis without collapsing physical winning-line identity.

The theorem is a local transition rule only. It does not by itself prove a no-win state, a survival horizon, W/D/L, strong distance, or a move preference.

## 1. Geometry

Let attacker (A) be to move in a legal nonterminal Connect Four state.

Let two live attacker winning lines have current residuals

[
L={x,y}
]

and

[
M={z,x^+,y^+},
]

where:

- (x) and (y) lie in distinct columns;
- (x^+) is exactly two rows above (x);
- (y^+) is exactly two rows above (y);
- (z) lies in a third column;
- (x,y,z) are currently playable frontier cells;
- (L) and (M) retain their exact physical winning-line ancestry.

Thus the middle residual is the +2-row lift of the lower pair plus one currently exposed trigger:

[
M={z}cup operatorname{Lift}_2(L).
]

## 2. Trigger and response

Suppose the attacker plays (z).

First-win stopping is checked first.

If play remains nonterminal, either (x) or (y) remains immediately legal because both are in columns distinct from (z).

The defender may play one endpoint, say (x).

## 3. Exact residual consequences

Under exact CPC/RBA cofactor transport:

1. the attacker move at (z) contracts the ancestry of (M) to

[
M'={x^+,y^+}=operatorname{Lift}_2(L);
]

2. the defender move at (xin L) permanently kills the lower winning line (L);

3. (M') is not declared killed merely because the old shape identifier for (M) disappears;

4. all other residuals, support effects, terminal precedence, and CPC facts are determined only by the exact transported child.

Therefore

[
oxed{
L={x,y},quad
M={z}cupoperatorname{Lift}_2(L)
Longrightarrow
A:z, D:x
	ext{ kills }L
	ext{ and transports }M	ext{ to }operatorname{Lift}_2(L)
}
]

subject to legality and first-win stopping.

The symmetric response (D:y) is identical.

## 4. CPC use

For any already-sound downstream survival class (S_D), this local response is admissible only when the exact child (q') independently satisfies (S_D):

[
q'in S_D
Longrightarrow
	ext{the realized branch survives through }D+2.
]

Universal predecessor closure still requires every attacker trigger to have at least one independently certified response.

The ladder edge is therefore an additional CPC transition witness, not a parallel obligation solver or move score.

## 5. Consumed-boundary witness

At the first c6 renewal-failure descendants, exact line ancestry includes:

- line 3: `B1-C1-D1-E1`, residual `{B1,C1}`;
- line 30: `A3-B3-C3-D3`, residual `{A3,B3,C3}`;
- line 53: `A5-B5-C5-D5`, residual `{A5,B5,C5}`.

When the attacker plays `A3`:

- line 30 contracts exactly to `{B3,C3}`;
- a defender response `B1` or `C1` kills line 3;
- line 53 remains live.

Durable evidence:

- `CPC_CROSS_ATTACHMENT_LINEAGE_PROBE_0_1.json`;
- `CPC_HORIZONTAL_LADDER_ANCESTRY_0_1.json`.

No oracle value is used.

## 6. Why ancestry is mandatory

The same residual cell set can arise from different physical winning lines and can have different downstream attachments.

Therefore the theorem state must preserve enough ancestry to reconstruct:

- which line was killed;
- which line contracted;
- the exact lifted pair;
- support/release geometry.

A histogram, shape count, or gauge-dependent scalar is insufficient.

This directly follows the current IsoGraph/Core 0.21 conservation rule and the late formula revalidation result that lossy projection first fails when grouping/role attachment is erased.

## 7. Schema-closure target

The local rule suggests a finite temporal schema when several same-orientation line ancestries form a two-row ladder:

[
L_r, L_{r+2}, L_{r+4},ldots
]

The present theorem proves only one transport step.

A repeated ladder theorem requires separate proof that:

- the lifted residual enters the next admitted ladder state;
- all non-ladder attacker moves have certified stutter/response transitions;
- every response preserves first-win precedence and all load-bearing CPC observations;
- the schema covers all and only admitted transitions.

Do not infer repeated closure from the observed three-rung c6 example alone.

## Claim discipline

This theorem candidate is:

- rank-local;
- geometry-derived;
- exact for one cross-residual transport step;
- ancestry preserving;
- compatible with CPC aggregate obligation ownership;
- oracle free.

It does not license v5 unless the composed proof class actually closes and is then freshly qualified.
