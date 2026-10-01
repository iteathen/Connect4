# CPC bottom-response guard-establishment corollary

**Date:** 2026-09-30  
**Version:** 0.1  
**Status:** exact local corollary / CPC proof-provenance transition  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Separate discovery provenance from the actual premise of the frozen odd-row guard-column contract.

The guard was first discovered through the c6 cross-residual ladder, but cross-ladder ancestry is not required to establish a height-1 odd-row guard.

## Theorem

Let a legal nonterminal defender response \(r\) be independently licensed by an already-sound CPC response rule.

Suppose \(r\) lands on row 1 of column \(g\).

Then in the exact post-response attacker-to-move state:

1. support height in \(g\) is exactly 1;
2. \(g1\) is defender-owned;
3. the next playable cell in \(g\), if any, is \(g2\).

Therefore the premises of the frozen odd-row guard-column contract hold at height 1:

\[
\boxed{
D:g1
\Longrightarrow
G_g(1)
}
\]

provided the realized response itself was independently licensed and first-win stopping was respected.

## Consequence

The proof automaton may attach guard provenance to the exact child after **any already-licensed row-1 defender response**.

This does not create a new legal response.

It only records an exact current-state consequence of a response that was already justified.

The later guard transitions remain those of
\`CPC_ODD_ROW_GUARD_COLUMN_CONTRACT_THEOREM.md\`.

## Why this matters

The distinction is:

\[
\text{why a defender move is licensed}
\neq
\text{which proof resources exist after that move}.
\]

A synchronized-template response, pooled response, attachment response, or other independently qualified response may all establish the same current-state guard if they land on row 1.

Requiring cross-ladder provenance after the move would incorrectly preserve discovery history as a semantic premise.

This is also consistent with the IsoGraph Core 0.21 reconstruction discipline: guard membership is reconstructed from current occupancy, not from the path by which the defender stone arrived.

## Scope boundary

This corollary does **not**:

- license arbitrary row-1 defender moves;
- make an unlicensed response legal;
- prove the guard alone is sufficient for survival;
- replace exact child-state closure;
- use W/D/L or oracle information.

It only permits guard provenance after a response already licensed by another sound rule.

## Qualification plan

1. freeze this corollary before composition;
2. allow guard establishment after every already-licensed row-1 response;
3. rerun the consumed rank-12 c6 boundary;
4. if positive, freeze implementation and generate fresh structural guard-establishment controls;
5. independently qualify before production promotion.

## Claim discipline

This is a rank-local, geometry-derived, path-independent proof-resource corollary.

It does not license v5 by itself.
