# Strategic candidate theoretical assessment — evaluator, Allis rules, proof-cost, controls

**Date:** 2026-09-09  
**Status:** research theory/evidence synthesis; maintained source and `main` unchanged.  
**Method:** `2026-09-09-categorical-reasoning-calibration.md`. All categories remain separate.

This document assesses candidates derived from the maintained evaluator, Victor Allis's VICTOR/Connect-Four work, proof/conspiracy-number ideas, and important negative/control mechanisms whose theoretical status must remain explicit.

## Maintained evaluator facts used as evidence

The maintained evaluator has several separable information channels:

1. **live-line positional field** — every geometric four-cell line containing no opponent token contributes `ownCount * 20`;
2. **immediate tactical class** — a three-own/one-empty line whose target is directly playable receives the legacy high tactical promotion;
3. **future parity class** — non-immediate 3+1 threats track target parity/support parity and promote positions with the legacy single-parity / both-parities conditions;
4. **root-relative asymmetry** — utility is `root score - 0.65 * opponent score`, intentionally not a negamax-symmetric value.

The maintained search already treats immediate win, opponent double immediate threat, and unique forced defense as exact search facts independently of the evaluator.

A key representation fact follows: the **exact legacy live-line score is not generally recoverable from only the minimal residual antichain**. Minimalization deliberately removes redundant supersets/duplicate obligations, while the legacy evaluator still counts every live geometric line. Exact evaluator compatibility therefore needs either retained geometric-line provenance/multiplicity or a separate derived summary. A new residual ordering heuristic may intentionally use the antichain directly, but then it is not the exact legacy evaluator.

---

## E1 — residual live-line / requirement-density ordering

**Underlying idea vs form.** Use the evaluator's observation that the number and maturity of surviving winning lines predicts move quality, but derive it from residual/incremental state rather than rescanning the board. Exact legacy replication and a new antichain-native analogue are separate implementation forms.

**Projected effectiveness.** Move-order/node effectiveness: **positive-to-strong expected**, confidence **medium-high**. Time-to-proof: **positive expected only if incremental**, confidence medium. Mechanism: alpha-beta benefits disproportionately from trying a decisive/high-potential move first; live winning obligations and their remaining size are direct measures of future tactical potential. This aligns with independent Connect-Four move-order evidence that scoring moves by newly created winning positions can substantially reduce search.

**Measured effectiveness.** The maintained evaluator/search is qualified for its incumbent fixed-depth semantics, but it has not yet been crossed into the exact residual solver. A separate structural-order experiment that merely added opponent-win destruction did **not** change move order/nodes on the two established exact roots and only added time; therefore not every structural score is useful. Pascal Pons's independent exact solver reports large gains from ordering by winning opportunities, increasing the prior for the *right* live-line signal.

**Adoption likelihood.** Medium-high as some ordering/proof-cost feature; exact legacy formula inside exact search is lower.

**Proof authority.** Ordering-only heuristic unless separately converted into a proved bound/rule.

**Hot/resource profile.** Full line rescans: high hot risk. Antichain-native size histogram or incrementally maintained line score: low-to-medium risk. Exact legacy residualization may require provenance/multiplicity words that compete with minimal-state compactness.

**Incrementalizability.** High: a move touches only incident winning lines/requirements; low16 positional score or size histograms can be updated locally if provenance is retained.

**Regime sensitivity.** Likely strongest in quiet/non-forced decision states; tactical closure already handles obvious immediate wins/blocks.

**Directional synergy.** `RWS/RID -> E1`: strong cost-sharing. `E1 -> YBWC`: potentially strong because first-child quality reduces speculation. `E1 -> proof-cost`: strong feature-sharing. `FMAC -> E1`: positive by paying ordering cost only at true decisions.

**Multi-problem leverage.** Ordering, proof-cost feature, possible shallow evaluator compatibility, possible Allis-rule prioritization.

**Substitution/displacement.** Exact tactical closure displaces the evaluator's immediate-win component, but not non-immediate live-line ordering.

**Next falsifier.** Crossed exact 7x6 experiment: center/TT baseline vs exact-legacy incremental vs antichain-native size/coverage ordering, after FMAC, with NPS and nodes measured separately.

---

## E2 — residual parity / future-threat ownership signal

**Underlying idea.** Preserve the evaluator's target/support parity information as a compact ordering/proof-cost feature; when formal Allis preconditions are met, some parity facts may graduate from heuristic to exact strategic certificates.

**Projected effectiveness.** Ordering effectiveness: **positive expected**, confidence medium-high. Multi-problem leverage: high. Time effect depends on whether parity is already native to SUP/event state.

**Evidence/mechanism.** The maintained evaluator explicitly promotes future 3+1 threats based on parity. Allis's strategic system is built heavily around control of odd/even squares and Zugzwang. This is independent conceptual convergence: parity is not arbitrary evaluator noise. However the maintained evaluator's bit is a heuristic summary, not an Allis proof certificate.

**Adoption likelihood.** High as some compact metadata; low for using the current heuristic bit as pruning authority.

**Proof authority.** Ordering/proof-cost hint by default; exact only when attached to a proved rule instance/coverage certificate.

**Hot/resource profile.** Very low if support-event frontier already records event distance/parity; medium if recomputed through row/height scans. GPU suitability high as bit flags.

**Directional synergy.** `SUP-event -> E2`: very strong cost-sharing. `E2 -> Claimeven/Aftereven/Lowinverse/Before`: strong prioritization and possibly instance-generation support. `E2 -> proof-cost`: strong. `E2 -> CARD/SEWB`: independent but shared support-distance substrate.

**Multi-problem leverage.** Ordering, proof-cost, Allis-rule generation, event ownership, maybe coarse resource classification.

**Next falsifier.** Measure parity-informed ordering on non-tactical exact roots and separately test whether event-native parity reduces Allis instance-generation cost enough to be nearly free.

---

## E3 — legacy asymmetric root-relative evaluator as exact-search ordering

**Projected effectiveness.** **Small-to-moderate positive expected at root/shallow ordering; sign uncertain deep inside negamax**, confidence medium-low.

**Mechanism.** The `own - 0.65*opponent` weighting intentionally values initiative asymmetrically from the fixed root player's perspective. That may be useful when choosing root/PV order, but it does not share the exact solver's symmetric negamax score semantics and would require root-perspective bookkeeping at every state if used literally.

**Measured effectiveness.** Strong incumbent compatibility/strength evidence exists for the full evaluator, but no isolated exact-solver ordering test of the 0.65 asymmetry exists.

**Adoption likelihood.** Low-medium in the recursive exact hot path; medium as root/coarse-task ordering control.

**Proof authority.** Ordering heuristic only.

**Hot/resource profile.** Full evaluator form is expensive; a residualized scalar could be cheap. Reroot persistence is weaker because root perspective changes.

**Synergy.** `PH -> E3` is necessary for safe hint-only use. `E1/E2 -> E3` share metadata. `YBWC -> E3` may benefit if root ordering improves eldest-child quality.

**Multi-problem leverage.** Narrow: ordering/evaluator compatibility.

**Next falsifier.** Root/task-only ordering ablation separating 0.65 asymmetry from the underlying player scores.

---

## E4 — evaluator immediate-threat promotion inside exact solver

**Projected effectiveness.** As a *separate* heuristic: **low/overlapped**, confidence high.

**Reason.** Exact IWIN/DTH/FBLK already own directly playable immediate threats with stronger authority. Paying an evaluator channel to rediscover the same fact at decision nodes adds little.

**Measured evidence.** Maintained search handles these facts before normal recursion; residual tactical closure is already strongly positive.

**Adoption likelihood.** Low as separate exact-search candidate; high only as retained compatibility behavior in the incumbent evaluator.

**Substitution/displacement.** Displaced by tactical closure for exact search.

---

# Allis strategic rules

The nine rules below are assessed as **rule-instance/certificate candidates**, not as permission to import VICTOR's dynamic compatibility graph wholesale. A rule instance can certify that specified opponent winning groups are strategically refuted under stated support/parity conditions. A complete draw/win certificate may require a *compatible set* covering all dangerous opponent groups.

Allis explicitly shows that rule compatibility is nontrivial. Vertical and Baseinverse are Zugzwang-independent and broadly combinable when square demands do not interfere; Aftereven/Before/Specialbefore and Lowinverse combinations have column/order/parity constraints. Therefore a simple `OR all solves masks` is unsound unless compatibility/precondition ownership is preserved.

The proposed residual representation is:

```text
rule instance
  -> solves-mask over opponent residual requirements
  -> required/support-event resource mask
  -> compatibility/conflict facts
  -> optional strategic transition/consequence
```

The fixed RID universe can make coverage cheap; support/event state is expected to own the dynamic preconditions.

---

## A1 — Claimeven

**Projected effectiveness.** Certificate coverage: **positive-to-strong expected**, confidence high. Runtime cost: **very low if parity/support native**.

**Mechanism.** Two empty vertically adjacent squares with even upper square let the Zugzwang controller claim the upper square; opponent groups needing that upper square are solved. This is local, frequent, and maps almost directly to a cell/requirement mask.

**Evidence maturity.** Strong historical/theoretical rule definition; not yet implemented/qualified in current residual solver.

**Adoption likelihood.** High as compiled rule instance or event/parity consequence.

**Proof authority.** Exact strategic certificate under controller/Zugzwang preconditions. Incorrect controller/parity assumptions can cause false proof.

**Hot risk.** Low if instances compiled/incremental; high only if regenerated through broad scans.

**Synergy.** `SUP-event/RID/E2 -> A1`: very strong cost-sharing. `A1 -> Aftereven`: direct dependency; Aftereven is built from Claimevens. `A1 -> rule-cover`: high coverage supply.

**Leverage.** Single local rule but platform primitive for Aftereven/Before/Specialbefore compatibility.

**Next falsifier.** Exhaustively validate generated Claimeven instances and solved requirement masks on complete small games, then measure rule-coverage frequency on ordinary 7x6 residual states.

---

## A2 — Baseinverse

**Projected effectiveness.** **Positive expected**, confidence medium-high. Likely lower frequency than Claimeven but cheap and decisive where two directly playable squares co-occur in an opponent requirement.

**Mechanism.** Opponent cannot take two directly playable squares in one turn, so controller can secure at least one; all opponent groups containing both are refuted.

**Compatibility.** Favorable: Allis classifies Baseinverse as Zugzwang-independent, making it broadly composable when square demands are disjoint.

**Hot risk.** Low: at most seven playable cells on 7x6, so candidate pairs are tiny and can be compiled/masked.

**Synergy.** `SUP/RID -> A2`: strong. `A2 -> rule-cover`: positive. `A2 -> Baseclaim`: conceptual component/overlap.

**Leverage.** Narrow local certificate, plus combination primitive.

**Adoption likelihood.** High as a cheap rule family.

---

## A3 — Vertical

**Projected effectiveness.** **Positive expected**, confidence high; frequency likely high because every column exposes consecutive empty pairs.

**Mechanism.** For two adjacent empty squares with odd upper square, controller can guarantee one; opponent groups containing both are refuted. It is Zugzwang-independent in Allis's combination analysis.

**Hot risk.** Very low with event/height state.

**Synergy.** `SUP-event/RID -> A3`: very strong. `A3 -> Before/Lowinverse`: primitive relation. Broad compatibility makes it attractive for coverage search.

**Multi-problem leverage.** Local certificate plus primitive inside richer rules.

**Adoption likelihood.** High.

**Potential saturation.** Some immediate/near tactical vertical threats may already be handled by exact tactical closure; strategic higher-pair coverage remains distinct.

---

## A4 — Aftereven

**Projected effectiveness.** **Moderate-to-strong positive in parity-structured positions**, confidence medium-high. Potentially high multi-problem leverage because one completed strategic group blocks higher opponent groups in one of several columns.

**Mechanism.** A controller-completable group using even Claimeven squares creates an event after which opponent occupation above the decisive completion square is prevented in at least one participating column. This is inherently an **event-order/reachability** rule, not merely a static cell mask.

**Hot/form risk.** Medium-high if modeled as dynamic rule graph; low-medium if SUP event frontier already owns the completion events and RID owns coverage masks.

**Compatibility.** Nontrivial with other Zugzwang-dependent rules. Shared Claimevens can be compatible in specific column-wise conditions, but arbitrary combinations are unsafe.

**Synergy.** `A1 -> A4`: dependency. `SUP-event -> A4`: very strong state-simplification/cost synergy. `RID -> A4`: strong coverage-mask synergy. `E2 -> A4`: strong prioritization/precondition support.

**Leverage.** Multi-purpose: opponent group coverage, event reachability, dead-above-region implications, potential DEAD/SEWB interaction.

**Adoption likelihood.** Medium-high, contingent on event representation.

---

## A5 — Lowinverse

**Projected effectiveness.** **Moderate positive expected**, confidence medium. It solves relationships across two columns and includes two Vertical-like guarantees, so individual instances can have broad coverage.

**Mechanism.** Two vertical empty pairs in distinct columns with odd upper squares; solves groups containing both upper squares plus groups solved by the embedded Verticals.

**Hot/form risk.** Low-medium for instance generation (small column pairs), medium for compatibility because its interaction with Claimeven/(Special)Before depends on relative vertical order.

**Synergy.** `SUP-event/E2/RID -> A5`: strong. `A5 -> rule-cover`: positive. `A3 -> A5`: primitive/overlap.

**Leverage.** Multi-purpose certificate: cross-column pair coverage + two vertical subrules.

**Adoption likelihood.** Medium-high.

**Regime sensitivity.** Requires suitable empty pairs/parity, likely mid/late rather than universally active.

---

## A6 — Highinverse

**Projected effectiveness.** **Small-to-moderate positive expected**, confidence medium-low. Likely less frequent and more state-specific than Lowinverse, but can solve groups that contain upper pairs or middle pairs across two columns.

**Mechanism.** Two columns each with three adjacent empty squares and even upper squares; its resource footprint is larger (six squares), increasing rarity and compatibility constraints.

**Hot/form risk.** Medium: pair generation remains bounded, but checking six-square/resource relations and compatibility costs more.

**Synergy.** `SUP-event/RID -> A6`: strong cost-sharing. `rule-cover -> A6`: niche extra coverage can be disproportionately valuable when it closes the last uncovered groups.

**Leverage.** Dual coverage modes but still one strategic rule family.

**Adoption likelihood.** Medium; likely selective/niche rather than universally queried.

---

## A7 — Baseclaim

**Projected effectiveness.** **Moderate positive expected**, confidence medium. It can cover two different group families with one composite local configuration.

**Mechanism.** Three directly playable squares plus an even square above one of them combine a Baseinverse-like relation with a claim relation.

**Hot risk.** Low-medium because playable-cell combinations are small; compatibility/precondition bookkeeping is modest relative to Before.

**Synergy.** `SUP/RID -> A7`: strong. `A2 -> A7`: conceptual overlap. `rule-cover -> A7`: potentially valuable because one instance solves two pattern classes.

**Multi-problem leverage.** Composite/dual-purpose rule instance.

**Adoption likelihood.** Medium-high if instance frequency is reasonable.

---

## A8 — Before

**Projected effectiveness.** Coverage: **strong positive potential**, confidence medium. Time effect: sign uncertain until event-native implementation. It is one of the richest rule families and can solve successor groups plus groups handled by its embedded Verticals/Claimevens.

**Mechanism.** An opponent-free group whose empty squares are below the top row induces a strategy over the successor squares, decomposing into Claimevens and Verticals. It encodes a future sequence, not just a current tactical fact.

**Hot/form risk.** High in literal dynamic implementation; potentially medium if RWS/SUP compile candidate groups and their component masks incrementally.

**Compatibility.** Nontrivial. It can overlap/subsume simpler rules; Allis notes a pure-Claimeven form is better treated as Aftereven. Interactions with Lowinverse and other Before/Aftereven rules depend on column-wise relations.

**Synergy.** `SUP-event -> A8`: very strong. `RID -> A8`: strong. `A1/A3 -> A8`: direct component relation. `A8 -> DEAD/SEWB`: projected event-consequence synergy because future inaccessible regions become explicit.

**Multi-problem leverage.** High: strategic coverage, future event constraints, embedded local rules, potential dead-region inference.

**Adoption likelihood.** Medium-high as compiled/selective certificate; low for per-node dynamic graph construction.

---

## A9 — Specialbefore

**Projected effectiveness.** **Moderate niche positive expected**, confidence medium-low. It exists specifically to solve cases where normal Before conflicts with another needed rule, so frequency may be low but marginal value can be high on the last uncovered threat.

**Mechanism.** Extends Before with a directly playable square in another column and one playable empty square in the Before group, permitting an alternate response that preserves coverage.

**Hot/form risk.** High relative to simpler rules due extra resource/compatibility conditions, but candidate instance count remains geometrically bounded.

**Synergy.** Strong dependency on SUP/RID and A8 components. High potential marginal synergy with rule-cover because rare Specialbefore certificates may close otherwise impossible covers.

**Leverage.** Niche repair rule rather than broad platform.

**Adoption likelihood.** Medium; likely invoke only after cheaper rule families fail to cover all obligations.

---

## A10 — compatible Allis rule-cover certificate search

**Underlying idea vs form.** Determine whether a compatible set of rule instances covers all relevant opponent winning requirements. The **candidate is the proof obligation**, not VICTOR's original dynamic adjacency-matrix implementation.

**Projected effectiveness.** Exact proof cutoffs: **potentially strong**, confidence medium. Time effect: **positive only if compiled/bitset/bounded**, confidence medium-low. Mechanism: replace large subtrees with a strategic certificate that globally refutes all opponent win obligations.

**Historical evidence.** Allis's system successfully solved Connect Four positions using compatible rule sets, and the thesis explicitly treats rule compatibility and complete opponent-group coverage as the critical proof structure. It also identifies combination work as a practical bottleneck.

**Proof authority.** Exact strategic proof when preconditions, compatibility and coverage are all valid.

**Hot/form risk.** Literal generic set-cover/compatibility graph per node: very high and likely incompatible with the performance envelope. RID bitsets + compact conflict/resources + bounded branch-and-bound at selected decision states: medium.

**Regime sensitivity.** Likely strongest in strategic mid/late states where tactical search remains large but a compact rule cover exists; many states may fail quickly.

**Directional synergy.** `RID -> A10`: very strong coverage bitset. `SUP-event -> A10`: very strong compatibility/resource ownership. `AUTO -> A10`: may canonicalize equivalent rule/resource configurations. `E2 -> A10`: prioritizes parity-compatible instances. `A1-A9 -> A10`: supply certificate pieces.

**Multi-problem leverage.** High if successful: exact subtree proof, opponent-group coverage, strategic dead-region consequences. But the cover search itself is a dedicated subsystem unless event/RID representations absorb it.

**Adoption likelihood.** Medium-high for **selective compiled certificate check**; low for full dynamic VICTOR graph in every node.

**Next falsifier.** Implement only Claimeven/Baseinverse/Vertical first, with fixed RID coverage and exact small-game oracle; measure coverage rate, cutoff size and cost. Then add richer rules only if uncovered residuals justify them.

---

# Proof-cost / conspiracy / proof-number candidates

## P1 — conspiracy/proof-cost signal for move ordering and threshold selection

**Projected effectiveness.** **Positive-to-strong expected in nonuniform proof trees**, confidence medium-high; direct time effect depends on feature cost.

**Mechanism.** Estimate how much proof/disproof work remains for each child/threshold and search the likely decisive obligation first. This targets a different weakness from static move quality: the cheapest proof move is not always the positionally strongest move.

**External prior.** Allis's thesis used conspiracy-number ideas to focus useful parts of minimax trees. Later proof-number search formalized proof/disproof effort and showed strength in non-uniform game trees. Depth-first PN variants demonstrate that proof-number information can be adapted without retaining a full best-first tree.

**Local evidence.** Explicit WDL-first staging was negative, so `prove outcome first` is not itself a good proxy for proof cost. Existing exact threshold sequence already exploits TT reuse. Therefore P1 should consume cheap structural features rather than impose a separate prepass.

**Proof authority.** Ordering/window/resource hint only unless the underlying feature is itself an exact bound.

**Features with strong substrate sharing.** requirement-size histogram, cardinality/support distance, forced-chain depth, residual orbit count, rule-coverage deficit, parity class, previous child cost/cutoff history, TT witness.

**Hot risk.** Low-medium if using already-maintained scalars; high if recursively computing proof numbers or running a secondary search.

**Synergy.** `RWS/RID/CARD/E2/Allis -> P1`: strong shared-feature synergy. `P1 -> YBWC`: potentially very strong because better eldest child reduces speculative work. `P1 -> MHINT`: complementary persistent witnesses.

**Multi-problem leverage.** Ordering, null-window threshold choice, split-depth/resource selection at coarse boundaries.

**Adoption likelihood.** Medium-high in cheap-signal form.

**Next falsifier.** Logistic/rule-based proof-cost ordering from existing exact metadata, compared with center/TT and evaluator ordering, without adding new per-node scans.

---

## P2 — full best-first proof-number search as replacement/alternate solver

**Projected effectiveness.** Potentially **strong on highly nonuniform binary proof goals**, confidence medium from literature; compatibility with current exact distance-sensitive solve is **low/uncertain**.

**Mechanism.** Maintain proof/disproof numbers and repeatedly expand the most-proving node in an AND/OR tree rather than depth-first alpha-beta/null-window traversal.

**Measured local evidence.** None in current repository. WDL-first prepass is not PNS and cannot be used as a direct performance result.

**Proof authority.** Exact for the configured binary proof goal.

**Resource/lock-in.** High memory/tree-maintenance cost, high architectural lock-in, different draw/distance-score handling, and potentially poor fit with fixed-width no-object hot kernel unless radically redesigned. GPU suitability uncertain because best-first global frontier operations are coordination-heavy.

**Compatibility.** Substitutive with the current alpha-beta/null-window driver, not an additive `optimization switch`. Could be selective for tactical/endgame/binary subproofs.

**Adoption likelihood.** Low as wholesale replacement in this current cycle; medium as later alternate/selective proof kernel.

**Multi-problem leverage.** Proof-order selection and nonuniform-tree focus, but at cost of a new search architecture.

**Next falsifier.** Only after cheap P1 signals are characterized: compare a bounded/selective PN or depth-first PN kernel on proof-dense residual subproblems, not entire empty-board distance solve first.

---

# Important negative/control candidates

These remain candidates in the ledger, but current categorical assessment should reflect the evidence instead of repeatedly rediscovering them.

## N1 — explicit WDL-first then exact-distance refinement

**Projected effectiveness after evidence.** **Negative expected for the current exact-distance driver**, confidence high.

**Measured effectiveness.** Nodes increased ~23.1% on `663152175` and ~5.5% on `41267575`.

**Mechanism for loss.** The existing score-threshold/null-window sequence already reuses TT knowledge across thresholds; explicit outcome staging perturbs that useful sequence and adds proof work.

**Adoption likelihood.** Low for exact-distance prepass; independent WDL-only product query remains separate.

---

## N2 — ordinary physical horizontal-reflection TT canonicalization

**Projected effectiveness.** **Regime/layout-dependent, small/negative in current direct-map**, confidence high for current form.

**Measured effectiveness.** Weak positive only at one small-capacity case; node increases on `41267575` across 256K-2M in later tests (e.g. 5.946M -> 6.579M at 512K). Arithmetic overhead also increased.

**Mechanism for loss.** Canonicalization changes direct-map collision distribution; extra equivalence sharing need not compensate.

**Relationship.** Not evidence against AUTO residual symmetry, which produces much larger quotient classes after semantic reduction.

**Adoption likelihood.** Low as recursive direct-map canonicalizer; root/input mirror normalization remains cheap separate possibility.

---

## N3 — separate semantic-successor dedup layer inside alpha-beta

**Projected effectiveness.** **Low marginal value in current stack**, confidence medium-high.

**Measured effectiveness.** Full enumeration showed large duplicate-successor reductions, but crossed alpha-beta tests showed no node-count change because TT/order already prevented the duplicates from becoming additional expanded work.

**Relationship.** The semantic equivalence is real; prefer canonical state identity/AUTO rather than a separate child-dedup pass.

**Adoption likelihood.** Low as dedicated hot layer.

---

## N4 — extra structural ordering by opponent-win destruction

**Projected effectiveness.** **Negative/near-zero in tested form**, confidence medium-high.

**Measured effectiveness.** Exact same nodes/hits/writes on both established 7x6 roots; extra winning-position computation only increased runtime.

**Interpretation.** This does not falsify evaluator live-line/parity/proof-cost ordering. The feature simply failed to change ordering on the tested roots.

---

## N5 — two-tier previous-pass-read/current-pass-write TT

**Projected effectiveness.** **Negative expected at equal total memory in current form**, confidence high.

**Measured effectiveness.** 41267575 flat512 5.946M nodes vs 2x256 tiers 6.710M. Giving each tier 512K improved to 5.362M but still lost to flat1M 5.156M. Similar negative direction on smaller root.

**Mechanism for loss.** Physical isolation strands capacity and prevents current/previous knowledge from competing in one retention pool; extra memory, not tier semantics, explained the apparent larger-table gain.

**Adoption likelihood.** Low as mandatory architecture. CPR's coarse proof directory is a different candidate.

---

## N6 — monotone same-key dual-bound retention in hot direct TT

**Projected effectiveness.** **Near-zero/negative in current direct-map kernel**, confidence high.

**Measured effectiveness.** Same nodes/hits/write attempts as baseline across tested capacities on `663152175`; extra checks/storage only added cost.

**Interpretation.** Monotone interval semantics remain valuable for CPR/coarse proof sharing. The negative result applies to adding stronger same-key bound retention to this hot TT layout.

---

## N7 — recursion-only forced-chain loop with normal TT at every transit state

**Projected effectiveness.** **Near-zero**, confidence very high.

**Measured effectiveness.** Nodes/hits/writes exactly identical to baseline; only call-stack form changed.

**Relationship.** Explicitly subsumed by FMAC/decision-state admission, whose benefit comes from changing the graph/cache boundary rather than loop syntax.

---

## N8 — branch-factor TT banking

**Projected effectiveness.** **Negative/low**, confidence medium-high.

**Evidence.** Earlier banking by branching factor did not improve the kernel and could worsen collisions. Branch factor is not a transposition-impossibility invariant and poorly tracks working-set lifetime.

**Relationship.** Do not transfer this negative to RANK; rank is path-independent exact transposition disjointness and showed measured pressure-dependent gains.

---

## N9 — literal global neutral-tempo pool

**Projected effectiveness.** **Semantically unsafe unless event/support equivalence is proved**, confidence very high.

**Evidence.** Exact tempo witness shows deleting/suppressing a neutral move can change +1 to -2. Neutral gaps below live events alter when those events become reachable.

**Relationship.** DEAD remains valuable; the safe form must preserve tempo and support/event gating.

---

## N10 — full evaluator line scan per exact-search node/candidate

**Projected effectiveness.** **Negative time expected despite potentially useful ordering**, confidence high.

**Mechanism.** Scans every geometric line and reconstructs support/parity facts already available or incrementally maintainable in the residual representation; this conflicts with the 10M+/s hot kernel.

**Relationship.** Reject the implementation, retain E1/E2 knowledge.

---

## N11 — literal dynamic VICTOR compatibility graph in recursive hot path

**Projected effectiveness.** **Negative time expected**, confidence high.

**Mechanism.** Dynamic rule-instance graph/set-cover construction, compatibility edges and repeated traversal are exactly the kind of object/graph work the fixed-width kernel avoids. Allis's own work makes clear compatibility combination is nontrivial and can dominate the rule system.

**Relationship.** Reject the dynamic implementation; retain A1-A10 compiled-mask/certificate candidates.

---

# Sharpened theoretical conclusions from evaluator/Allis work

1. **Evaluator parity is strategically more important than its current one-bit heuristic form suggests.** Its independent alignment with Allis's odd/even/Zugzwang rule system raises projected multi-problem leverage. It should be represented as reusable event/support metadata, not promoted directly to proof authority.

2. **The live-line evaluator and minimal RWS antichain are not identical information.** If exact incumbent-evaluator compatibility is required, line provenance/multiplicity must survive somewhere. If only exact-solver ordering is desired, an antichain-native analogue may be cheaper and should be treated as a new heuristic rather than silently called the legacy evaluator.

3. **Claimeven, Baseinverse and Vertical have the best first-experiment profile among Allis rules:** local, cheap, small instance sets, high compatibility and straightforward RID coverage masks. This is a statement about implementation/evidence priority, not a claim that they are the most powerful complete rule set.

4. **Aftereven and Before have the highest projected synergy with an event-frontier support representation.** Their strategic content is fundamentally about what becomes reachable *after* certain support events, so an event-native implementation may encapsulate rule logic, support-aware bounds and dead-region reasoning together.

5. **Lowinverse/Baseclaim are medium-complexity, potentially useful bridge rules. Highinverse/Specialbefore are more niche but can have high marginal value when they close the last uncovered opponent groups.** Therefore rule-cover search should not necessarily generate all nine families eagerly.

6. **Proof-cost/conspiracy information should first be tested as a cheap signal inside the current alpha-beta/null-window driver.** Full PNS is a different search architecture and belongs in a substitutive/alternate category, not the same additive candidate bucket.

7. **The strongest candidate from Allis is arguably not any one rule but the idea of proof coverage over surviving opponent obligations.** RWS/RID makes that much more compatible with our architecture than VICTOR's original dynamic graph representation.

# External theory priors

- Victor Allis, *A Knowledge-based Approach of Connect-Four* (1988): formal definitions of the nine strategic rules, compatibility constraints, and conspiracy-number search.
- Allis, van der Meulen & van den Herik, *Proof-number search* (Artificial Intelligence 66, 1994): proof/disproof-number search for non-uniform game trees.
- Pascal Pons, *Solving Connect Four*: move ordering by winning opportunities, direct losing-move anticipation, TT design and compact key storage.

External work changes priors only. Exactness and performance promotion remain governed by repository tests and the project's fixed-width performance envelope.