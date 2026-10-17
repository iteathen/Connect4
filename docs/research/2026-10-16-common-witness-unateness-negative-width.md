# Common-witness unateness theorem and negative k8 compression experiment

**Date:** 2026-10-16 Pacific. **Canonical research owner:** `research/semantic-quotient`.  
**Status:** Sound guarded Boolean lemma; independently checked finite controls PASS; **no meaningful reduction of the actual k8 lower quantifier wall**. Not a game-theory authority change, new WDL result or production operator recommendation.

## 1. Algebraic theorem

The existing guarded local QBF projector pushes `forall x` through conjunction, `exists x` through disjunction, and either quantifier past an x-independent factor, then uses exact Shannon where correlation remains. To avoid the still-expensive `exists x (A AND B)` with two x-dependent factors, derive the **common-witness criterion**:

For each fixed assignment to shared variables s, the identity

    exists x [A(x,s) AND B(x,s)]
      = (exists x A(x,s)) AND (exists x B(x,s))

holds if and only if, whenever both A and B have at least one true x, their sets of true x choices intersect. A sufficient constructive witness is a shared endpoint if A and B are both monotone nondecreasing in x or both nonincreasing in x. The dual statement covers `forall x(A OR B)` via shared false endpoints.

A simpler exact lemma for a *whole* Boolean function F(x,s) is:

    if F(0,s) <= F(1,s) for all s,
       exists x F = F(1,s), forall x F = F(0,s);
    if F(0,s) >= F(1,s) for all s,
       exists x F = F(0,s), forall x F = F(1,s).

These follow directly from the two-element Boolean lattice's max/min definition. No quantified action blocks are reordered.

## 2. Sound but conservative polarity proof

Assign a current quantified bit x a signed syntactic dependency type per exact AND/NOT circuit:
- 0 if x does not occur;
- + if nondecreasing in x;
- - if nonincreasing in x;
- ? if no reliable monotonicity certificate.

A positive x literal is +, NOT flips +/-, AND of same-direction children remains that direction, and combining x-independent with monotone preserves the monotone direction. AND of opposite-sign or uncertain children becomes ?. Signed negative output edges flip the direction. This structural induction is sound but deliberately incomplete: semantic cancellations or nonlocal conditional dependencies may have a real monotonicity the syntax cannot certify.

When the certificate is + or -, the operator substitutes the correct endpoint with **one** Boolean cofactor; otherwise it applies the previously proved localized quantifier/Shannon method unchanged. Therefore it never applies the *false* unrestricted distributivity of existential over conjunction. In particular `A=x,B=NOT x` is rejected by the syntactic common-witness certificate.

Frozen plan before coding:
`research/isograph/discovery/2026-10-16-algorithmic-core/GUARDED_UNATE_WITNESS_PROJECTION_PLAN_0_1.md`.

## 3. Bounded falsifiers and evidence

Reproducible producer:
`research/isograph/discovery/2026-10-16-algorithmic-core/guarded-action-qbf-unate-witness.mjs`.
Independent physical controls:
`unate-witness-control.mjs`, `unate-k7-physical-control.mjs`.
Machine evidence:
`GUARDED_UNATE_WITNESS_PROJECTION_RESULTS_0_1.json` (all in the same folder).

Git blob SHAs are recorded in that evidence and matched against local Node.js v22.16.0 sources.

The full fixed source-horizon validation suite passed **47 cases, 188 shared threshold projections and 672 physically derived labelled action threshold checks** with zero discrepancies. Every one of the 24 complete-game small-board suffixes still produced correct exact WDL and the **complete** optimal-action set (13 singleton, 11 tied). Independent physical standard7x6 `44444` k7 repeated **2,799,124** first-win/alternation validation transitions with no threshold discrepancy.

**But additional computational benefit was negligible.**

| `44444` horizon and threshold | Plain local quantifier Boolean work | With unateness | Gain | Disposition |
|---|---:|---:|---:|---|
| k7 Wlo/Nlo | 63,757 | 63,757 | 0 | Completed, same |
| k7 Whi/Nhi | 166,807 | 166,758 | 49 | Completed, same depth |
| k8 Wlo/Nlo | 292,251 at abort | 292,195 at abort | 56 | **Still 60k nodes, 16/21 bits** |
| k8 Whi/Nhi | 208,467 | 208,467 | 0 | Completed symbolic upper |

On the **blocked k8 lower path**, only **one** certified unate endpoint shortcut was identified, after 85,612 polarity-cache misses (extra diagnostic work, not counted as a 56-operation saving). The upper path had 77 shortcuts but still no net Boolean-operation reduction, with 68,499 polarity misses. These controls still use the exact unchanged 60,000-node / 300,000-Boolean-operation / 10,000-support / 15-second per-compile research envelope. No complete k8 lower thresholds or unrestricted W/D/L result emerged.

## 4. Precise negative disposition

- **Confirmed:** Unateness gives an exact sufficient condition for correlated existential-witness compatibility and can avoid a full two-cofactor expansion when provable.
- **Not confirmed:** That a cheap *syntactic* polarity certificate will capture a useful fraction of the blocked quantifier interfaces in this particular full legality/first-win source circuit.
- **Rejected as the preferred next implementation:** Globally computing signed DAG polarity on every currently quantified bit and applying endpoint substitution when syntactically certain. This has no meaningful benefit on k8 lower and adds significant proof-work scans.
- **Still open:** Semantically certified low-width response factors, support/terminal-conditioned variable independence, essential Boolean-cofactor-function equivalence or a structured decision diagram that preserves action adaptivity without materializing each cofactor product.

The **preferred currently measured algebraic candidate remains**:
`guarded-action-qbf-local-quantifier.mjs`, which already makes k7 exact as a bounded first-action vector. It is still weaker in maximum reached bounded horizon than the source-owner reflected BDD k11; it has **not** determined best moves or unrestricted WDL after `44444`.

Do not infer general nonbranching completion, a lower bound from the k8 allocator failure, or a new game-theory authority. Preserve this falsified practical representation idea so it is not rediscovered as a supposed new advantage.
