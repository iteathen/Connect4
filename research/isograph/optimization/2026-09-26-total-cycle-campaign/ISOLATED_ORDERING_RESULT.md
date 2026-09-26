# Isolated ordering controls after the challenged mixed experiment

Date: 2026-09-26. No candidate promoted. Selected JSMinSys stays
49f88b2b0cd45ae427f43ceece568a4895953e5f.

## Correction to interpretation

The earlier strict live-line-only variant changed several policies together.
Its measured +97.09% total cycles was a result for that combined implementation,
not evidence that lazy selection or live-line scoring was inherently expensive.
Live-line scoring was already used by the control. Treating the combined result
as a causal verdict on the selector would be incorrect.

The isolated selector preserves CPC restrictions, forced transit, center ties,
worker rotation, root ordering and cache publication. Exact ordered q-word/depth
traces match the selected control: 832,445 main-position visits and eight late /
mirror / order-offset controls. Result and all serial metrics match. This is
sampled serial evidence, not exhaustive proof or a concurrent trace claim.
See selector-trace-committed.jsonl and trace-selector.mjs.

## Measurement

Harness Connect4 7a1a41665d3f5b1a679c16598d60ae3d1035706d. Windows,
i5-12600K, Node v26.7.0. Four workers, first Fhourstones position 45461667,
30-second ceiling, shared sample mask 7, local/shared capacities 65,536.
Four fresh-process ABBA blocks per comparison, sequential, uninstrumented.
Cycle boundary is process creation through joined solve, including bootstrap,
setup and every worker. Post-measurement report formatting/controller excluded.

| Isolated change | Total cycle delta | Descriptive 95% interval | Wall delta |
|---|---:|---:|---:|
| Lazy selector, policies preserved | -0.78% | [-3.71%, +2.15%] | -1.20% |
| Natural-column ties, rotation retained | +10.13% | [+6.96%, +13.31%] | +10.35% |
| Same center-out tie order for all workers | +8.66% | [+3.44%, +13.89%] | +11.00% |
| Ignore CPC move restrictions | +29.04% | [+25.81%, +32.27%] | +34.06% |

Deltas are means of paired block ratios, not ratios of aggregate means.
All 64 samples were EXACT, rootWdl=1, move=3, with clean worker shutdown;
bootstrap+setup+solve cycle totals reconcile exactly for each sample.
Raw manifests, subprocess outputs, samples and summaries are in:

- isolated-selector-production-clean/
- natural-ties-production/
- same-worker-order-production/
- cpc-filter-off-production/

| Arm | JSMinSys SHA |
|---|---|
| Selected control | 49f88b2b0cd45ae427f43ceece568a4895953e5f |
| Selector only | 97d1f4ccfb4cbd54ed46990f152d11e626e43b75 |
| Natural ties only | f69d01835b4f60b5098bcac1e5841064d46ae6e3 |
| Same worker order only | 42011bc99242861b129fa9d26399cee6b96843cf |
| CPC filters off only | 75be013ce27eb57f913c9cda28ea09ff1621b4f2 |

## What follows from the evidence

The lazy selector is near-neutral on this fixture; no performance win is proven.
Each policy removal independently worsens this fixture, with ignoring CPC filters
the largest measured isolated regression. These results explain why the original
combined experiment was confounded. They do not fully explain its magnitude:
do not add these percentages or infer interactions without measuring them.

Natural ties removes center priority as a tie-break, not an extra live-line score.
Same worker order measures the effect of removing deterministic order diversity;
it does not directly count duplicate q exploration. Production samples intentionally
have no aggregate node instrumentation. Winner-node metrics are not all-worker
nodes and must not be used as the denominator for process cycles.

Ignoring CPC filters preserves their producer computation and exact win/loss
proofs. It measures consequences of not consuming restrictions, not savings from
removing the producer machinery. Forced transit becomes unreachable and intermediate
cache publication can change. CPC telemetry counts restrictions discovered, not
applied. Optional FourFront recursive filtering is unchanged; this is CPC-only
production execution. Natural ties also simplifies cold order construction, so
its whole-operation delta includes that small setup change.

## Qualification and review

Selector: 10 targeted tests and catalog verification; exact trace comparison.
Each policy control: 8 targeted tests and catalog verification before timing.
Read-only independent review found each diff consistent with its isolation plan;
its scope notes about cold setup, forced transit/cache publication and CPC-only
routing are retained above. No full-suite, full Fhourstones score, broad multi-input
qualification or final NEES qualification is claimed.

The initial selector attempt in isolated-selector-production/ was rejected by
the harness before samples: tracked line-ending/index normalization appeared dirty.
No semantic diff was present. Index normalization restored clean state; the new
clean run has a separate directory. The rejected manifest is preserved.

## Decision

Keep the selected candidate unchanged. Do not promote the strict combined variant
or claim a selector win. Any further optimization should preserve useful pruning
and assess whether an equally cheap ordering implementation can retain its benefits;
policy changes require more positions and explicit interaction tests before general
claims. These controls are diagnostic experiments, not competing production models.
