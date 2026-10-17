# Exact output-cone reduction of deterministic source-QBF gates

**Date:** 2026-10-16. **Owner:** research/semantic-quotient. **Branch live HEAD at freeze:** `e6dfab7cc901916ac848db0ca87fb5b5de5e7e3e`.
**Status:** PLAN only, not WDL qualification.

## Mathematical observation

The existing source-q gated QBF constructor builds ONE shared AND/NOT DAG for four WIN/NONLOSS interval thresholds, then `makeCNF(threshold)` emits deterministic Tseitin equivalence clauses for **all** gates even when some cannot reach that threshold output. The first action remains free; original chronological alternating quantifiers remain unchanged.

For any chosen Boolean output literal `o`, let `Anc(o)` be precisely the transitive closure of deterministic AND-gate operand edges ending at o. Every gate outside Anc(o) is a total deterministic Boolean function of action bits and/or other gates. It has no path to the selected output and no other source constraints except its three Tseitin equivalences. Eliminating all such unrelated gate definitions and their existential gate variables is **truth-preserving** for the chosen quantified threshold, because each omitted auxiliary has exactly one satisfying extension and cannot change output.

Compile **only** source gate definitions in Anc(o) into a canonical ROBDD, in original increasing gate-ID topological order. Source gate fanout/last-use and compaction must also ignore omitted gate definitions. Exact terminal/full-column/draw source guards needed by the selected output remain in its cone. No bounded tactical outcomes or solved policies enter the cone selection.

## Predeclared falsifiers and accounting
- Count source total gates, selected threshold-dependent gates, excluded gates, operand-edge traversals and closure time. A claim of compression must account for source QBF construction and closure work; no hidden future move histories.
- Compare Wlo, Nlo, Whi, Nhi and complete exact best-move sets on original 47 small-board source/horizon cases and 24 exact small-game suffix positions; retain all 11 tied moves and legal 223 noncommutation.
- Independent full-7x6 physical k8 first-win/alternating validation (3,567,031 physical transitions) remains reference; do not feed its result to the candidate. Attempt k9 only after matching all k6–k8 threshold action masks. Try k10 if k9 fits, stop at earliest budget failure.
- Constant outputs, complemented output edges, unused source inputs, and source gate aliasing are strict controls. Quantifier order must NOT change when dropping deterministic unused auxiliaries.
- Strict 60,000 retained BDD nodes, 300,000 nontrivial Boolean ops, 10,000 support representatives, 15s per compile. Count auxiliary GC/free-list work separately. No claim that a compact cone automatically yields a compact quantified solution.

The operator must still return every optimal action when all unrestricted intervals converge; currently `44444` remains UNKNOWN. No game-theory authority promotion or merge.
