# Horizon sensitivity of source-q interval Bellman (not minimality research)

Date: 2026-10-16, canonical owner research/semantic-quotient.
Existing exact verified positive `BOUNDED_SUPPORT_INTERVAL_RANK20_RESULTS_0_1.json`:
source `43214636342357317661`, rank20. At cutoff k=4,
the symbolic root and all seven literal actions are EXACT, including
unique winning column5; complete q-only reference confirms every
value despite 14,400 future-support full rectangle.
Earlier rank18/16/14 stabilize at k=2, but full-q reference stops at
800,000 transitions; a separate direct physical k=2 falsifier fully
confirmed rank18 and rank20 local outcomes.
Canonical `44444` and selected rank10 remain [-1,+1] through k=8.

## Frozen tests

1. To measure *how much* strategic depth the rank20 apparent
algebraic early closure requires, compile k=1,2,3 on exactly that
source q **before consulting** the already stored solution.
This is a local sensitivity/qualification check, NOT a formal
minimality theorem about the Connect Four core.
2. On the same preselected rank10 source `4321463634` and
canonical rank5 `44444`, compile **k=9**, the greatest remaining
bounded cone under the unchanged 10,000 support cap.
Planned support cones: rank10 **9,224**; `44444` **7,798**.
The k=10 cones would be 14,380 and 12,341 respectively and
remain explicitly OUT OF SCOPE (over 10k).
3. Preserve all action-wise lower/upper WDL intervals and BDD
width/time/operation count. Do not infer a value where the interval
is open. No new optimal policy search or oracle label enters
formula compilation. Compare exact results only to the previously
qualified independent q / direct physical controls **after** source
calculation is complete.
4. Budget per compile unchanged: 60,000 BDD nodes, 300,000
nontrivial BDD operations, <=10,000 supports, <=15s,
GC every64/high water40k. On exact resource limit stop and
preserve PARTIAL rather than increasing ceilings.
5. If k9 remains open or fails budget, conclude this boundary
requires more than the present support-cone algebra provides
under the frozen envelope; do not disguise a deeper game-tree
search as symbolic composition.
