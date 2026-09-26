# Shared/private cache memory screen result

Status: SCREEN COMPLETE; NO CONFIGURATION PROMOTED; broader expansion stopped
under the predeclared no-convincing-improvement rule.

JSMinSys: ec6a602268e5dd281db9cb29b2f4defd47c6d325.
Connect4 harness: 670ca4d3 (full revision in manifests).
Windows i5-12600K, Node26.7.0, four workers, input 45461667, mask7,
30-second case ceiling. Baseline: 65,536 shared and 65,536 private entries
per worker. Move ordering and all solver code are unchanged.

128 sizing samples, eight identical-configuration noise samples.
Every sample EXACT, rootWdl=1, move=3, clean worker exit; cycle partitions
validated. Configurations run in the committed seeded order; each comparison
has four fresh-process ABBA blocks, two observations per arm per block.

| Arm (other capacity remains 64K) | Total cycle delta | Descriptive 95% interval | Wall delta | Total cache backing MiB | Mean final RSS MiB |
|---|---:|---:|---:|---:|---:|
| shared-16384 | 2.05% | [0.54, 3.57]% | 2.34% | 16.25 | 98.0 |
| shared-131072 | -0.47% | [-1.90, 0.96]% | -0.54% | 23.25 | 104.1 |
| shared-262144 | -0.49% | [-1.70, 0.73]% | -0.24% | 31.25 | 108.6 |
| shared-1048576 | 0.86% | [-1.28, 3.01]% | 0.94% | 79.25 | 119.5 |
| private-16384 | 2.23% | [-0.52, 4.98]% | 2.58% | 7.81 | 100.7 |
| private-131072 | 0.68% | [-3.92, 5.29]% | 0.40% | 34.50 | 101.3 |
| private-262144 | 0.65% | [-3.59, 4.89]% | 0.28% | 65.00 | 100.6 |
| private-1048576 | 2.20% | [-1.41, 5.81]% | 2.22% | 248.00 | 99.8 |

These are mean block-paired ratios, not pooled means. Intervals are descriptive,
unadjusted for multiple comparisons. Noise control was +0.93% cycles, two blocks;
its very wide interval is not a claim of sub-percent measurement precision.

## Conclusion

Neither larger shared nor larger private caches established a benefit on this
quick control. Shared 128K/256K point estimates are about -0.5%, but their
intervals include no change. No interaction or broad confirmation phase was
triggered. Retain 64K shared / 64K private PER WORKER.

This does not show that larger caches cannot help harder positions. This is a
single-position screening result, not a full Fhourstones score or a global cache
size optimum. No best configuration was selected from noise.

## Accounting and checks

All-process CPU cycles include bootstrap, setup, worker execution and shutdown.
Existing JSMinSys source routes both capacity arguments to their respective
allocators. Cold public-allocator checks for every tested size agree with
61 bytes per private entry and 64 bytes per shared entry plus 12 shared statistics
bytes (keyWords=14). Per-process final RSS is reported separately and includes
more than cache arrays; after workers exit it is not peak allocation. No peak RSS
claim is made. Admission required 4 GiB free RAM; backing budget stayed below
512 MiB. Unit tests: Connect4 14/14, selected JSMinSys 142/142.

All-worker node diagnostics and periodic RSS sampling were planned for finalists;
there were none, so those phases were not run. Production timing intentionally
has no aggregate node instrumentation. Winner metrics are preserved but are not
used as total-node denominators. Cache hit counts alone are not a success metric.

No JSMinSys/BSFP code or production dependency pin changed. The cold harness was
extended with independent capacity configuration, bounded timeouts and explicit
configuration provenance. Raw manifests/process output/samples/summaries are in
each arm directory; configs and run-order.json reproduce all calls:

node tools/isomax-cycle-campaign.mjs memory OUTPUT LIBRARY CONFIG_JSON 4

Use two blocks for configs/noise.json. Do not overwrite an existing output folder.
