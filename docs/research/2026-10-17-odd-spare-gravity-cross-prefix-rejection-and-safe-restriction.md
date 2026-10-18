# Real 7×6 negative: an odd spare breaks standard co-release cross-prefix when preemptive move leaves pair pending

**2026-10-17 Pacific, canonical research/semantic-quotient. Status: REJECTED original unrestricted odd-pending-pair source theorem; true 7×6 physical gravity counterexample.** Original board W=7,H=6,K=4, W/H/K symbolic for later extension. This document amends and narrows the earlier frozen *candidate* at `docs/research/2026-10-17-odd-gravity-spare-cell-co-release-defensive-pairing.md`. Preserve the original candidate and failed tests as historical evidence; do not silently convert it to qualified authority.

## Exact falsifier

The first independent actual7×6 physical replay of `standard7x6-odd-spare-col-co-release-no-win-source.mjs`, after correcting its static matcher resource budget handling, FAILED before qualification. This was **NOT** another budget/harness issue: the original SOURCE proof asserted o can mate an attacked virgin cross-column pair although its mate was NOT gravity playable because a prior pair was temporarily left half-filled by o preemptive action. The independent physical verifier reported:

- **Real gravity-legal nonterminal original history:** `32452113456772416435741762343657217`, rank35, P1 current mover.
- **Unpaired spare U:** literal column1, original row5.
- **Unsafe SOURCE pairing blocks:** zero-based columns (1,2) with one cross-prefix pair; zero-based columns (4,5) with TWO cross-prefix pairs `crossPairPrefixLength=2`.
- **Falsifying legal continuation prefix:** `32452113456772416435741762343657217155`.
- P1 now plays original literal column5 (zero-based col4), touching an originally unfilled cross pair. Source pairing demands immediate P0 mate at **literal column6 row5** (physical cell id40), but its **actual gravity frontier is row4**. The pair's predecessor cross pair was temporarily half-filled/pending, allowing release of the second pair's col5 cell without release of its col6 mate. The P0 mate is **ILLEGAL**. Earlier "co-release safe" law only guaranteed a mate after all PREFIX pairs complete, which the odd preemptive policy violates.

This refutes the unconditional claim that a single pending pair may be ANY source co-release pair. **Do not make any positive odd source L1/L2 claims from pre-restriction tests, and do not infer that odd T cannot admit a no-win defense.** The static source proof had improperly transported the EVEN-response pairing release theorem into an ODD game where one pair is left incomplete.

Historical source `standard7x6-odd-spare-col-co-release-no-win-source.mjs` Git blob `58b1b8aa1f0cacddc47bf18fca32a339e3708fbc` failed; independent physical control blob `897088c9f38a0b7a2d41d53bf28056def514b217` produced this exact witness. Both are durably identified.

## Safe conditional repair candidate: preemptable independent pair blocks

The odd spare one-pending-cell argument becomes sound under a stronger `PREEMPTION_RELEASE_SAFE` guard: while exactly one original matched pair is pending and only its o-owned member has been played, no subsequent untouched pair may become gravity-first-touchable on that one column while its partner is blocked by the pending mate. A simple structural sufficient condition within the existing source block normal form is:

    EVERY block in the safe matching either
       VERTICAL_CONSECUTIVE one-column pairs
       OR
       CO_RELEASE_PREFIX_AND_VERTICAL_TAILS
       with crossPairPrefixLength = 1.

Reason: a vertical pending pair occupies a single column and its own unplayed mate prevents release of the next same-column pair; an initial single cross pair pending may expose a vertical tail in its o-owned column, but every tail pair has an immediately reachable same-column upper mate after its lower cell is touched. No SECOND cross pair exists behind the pending cross pair, so the demonstrated asymmetric cross-successor obstruction cannot occur. The pair precedence DAG, single unmatched U in its own capacity-one column, and one-dangling-o-first invariant then guarantee that a currently playable VIRGIN lower cell exists whenever the defender needs a preemptive mark.

**This is a narrowed candidate to FREEZE and independently test before qualification.** It is sufficient, not necessary: many valid odd safe source pairings with longer cross prefixes might admit richer response protocols not covered here. Enforce the guard directly on the SOURCE certificate; do not just filter the independent test. If no matching passes, output INCOMPLETE, not source no-win.

## Next required actions

1. Record the rejected theorem and exact physical witness in STATUS and research routing before promoting any subsequent positive claim.
2. Enforce `every returned crossPairPrefixLength <=1` in the odd source producer; return INCOMPLETE for longer cross prefixes. Rerun the independent original7×6 physical control with pending/spare move variation.
3. If the source's existing matcher returns an unsafe longer-cross-prefix matching first, the wrapper may conservatively return INCOMPLETE even when a different safe match exists. Do not search multiple *strategic future games* to improve coverage; any dedicated safe matching construction is static original source proof-witness search and must be frozen/tested separately.
4. Record real7×6 sample positives, pairing proof resource misses, true physical opponent reply legality and later independent physical WDL if any. Canonical `44444` remains UNKNOWN unless a fully safe new source proof succeeds.
