# CPC frontier-residual attachment response theorem

**Date:** 2026-09-30  
**Version:** 0.1 frozen before execution  
**Status:** exact local theorem candidate / internal CPC response edge  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Preserve a load-bearing relation exposed jointly by:

- the pooled-frontier failure profile;
- the recent IsoMax R/S/F and boundary-depth formula work;
- IsoGraph minimum-sufficient-support and schema-conservation rules.

The missing observation is not merely that a cell is playable. It is that an observed attacker trigger and another currently playable cell are attached to the **same live residual winning requirement**.

This theorem adds one local CPC response edge. It is not a standalone safety theorem or move score.

## 1. Setup

Let \(q\) be a legal nonterminal attacker-to-move CPC/RBA state.

Let \(R\) be one active minimal attacker residual requirement.

Let \(x,y\in R\) satisfy:

1. \(x\neq y\);
2. \(x\) and \(y\) are in distinct columns;
3. both \(x\) and \(y\) are currently playable frontier cells in \(q\).

Suppose the attacker chooses \(x\).

## 2. Response legality

Because \(x\) and \(y\) are in distinct columns, occupying \(x\) does not change the support height of \(y\)'s column.

Therefore, unless first-win stopping already terminates at \(x\), \(y\) remains immediately legal for the defender on the next ply.

The defender may play \(y\).

## 3. Residual consequence

The originating winning line represented by \(R\) requires attacker ownership of every cell in \(R\).

After the defender occupies \(y\in R\), that line is permanently unavailable to the attacker.

Thus:

\[
\boxed{
x,y\in R\text{ both frontier}
\;\Longrightarrow\;
A:x,\;D:y
\text{ is a legal local discharge of }R
}
\]

subject to first-win stopping.

## 4. What the edge does not establish

The response may change support and may interact with other residuals.

Therefore the local discharge does **not** imply:

- a complete defender policy;
- a no-win result;
- a finite survival horizon;
- a draw;
- a loss;
- a move preference.

To use the edge inside renewal, exact RBA cofactor transport must be applied and the resulting nonterminal child must independently satisfy the downstream proof class.

Formally, for any already-sound survival class \(S_D\):

\[
\left[
A:x,\;D:y
\text{ satisfies the attachment-response premises}
\right]
\land
q_{xy}\in S_D
\Longrightarrow
q\text{ survives that realized branch through }D+2.
\]

Universal survival still requires every legal attacker trigger to have a qualifying response.

## 5. Relation to complete synchronized templates

A complete synchronized-response template may already prescribe the same response \(y\).

If so, the attachment edge adds no semantic transition and is deduplicated by response cell.

The new case is when a valid realized response exists from exact residual attachment but no single complete synchronized template needs to commit to that response as part of its counterfactual whole-board pairing.

This is a trigger-local CPC edge, not permission for arbitrary legal defender responses.

## 6. Why attachment identity is load-bearing

The recent formula revalidation found that:

- frontier-relative depth zero versus support-hidden positive depth is load-bearing;
- R/S/F composition can preserve exact future/action/value behavior on bounded controls;
- lossy projections first fail when residual grouping/attachment information is erased.

The present edge keeps exactly that missing relation:

\[
\text{residual identity}
+
\text{frontier exposure}
+
\text{exact support transport}.
\]

No scalar parity or occurrence count is substituted for attachment.

## 7. Qualification plan

Version 0.1 is frozen before execution.

First use the consumed v4 failure frontier only as theorem-discovery evidence.

If the edge materially extends the survival class:

1. freeze the resulting rule and implementation;
2. generate fresh legal positions independently of the consumed prefix;
3. mechanically identify qualifying attachment edges;
4. verify response legality and exact residual destruction;
5. verify every claimed downstream survival class without oracle input;
6. only after structural evidence is frozen, use Pons for falsification/validation if needed.

A failure narrows the rule. It does not justify adding outcome-fitted exceptions.

## Claim discipline

This theorem candidate is:

- rank-local;
- geometry-derived;
- exact for its local response claim;
- first-win guarded;
- compatible with CPC as aggregate obligation authority.

It does not license v5 and does not claim a universal move finder is complete.
