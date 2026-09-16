# Rejected form: BSFP streaming incremental dominance reducer

**Claim:** C4-R0041  
**Disposition:** implementation form rejected for the tested JavaScript BigInt workload; parent antichain/dominance semantics remain valid.

The form replaced ordered unique/popcount/sort normalization with online pairwise dominance maintenance. It preserved exact BSFP semantics and matched the retained reference's root W/D/L, boundary counts and frontier widths on the cited controls.

Measured 5x5 wall time was 73.806 s versus 62.486 s for the first rolling ordered implementation and 58.326 s for the retained ordered reference. The workload generated about 81.5 million pair candidates, and the no-sort form exposed excessive BigInt subset comparisons when arrival order was unfavorable.

Do not use this result to reject dominance reduction itself. Do not rediscover this exact no-sort BigInt form as a presumed optimization without materially changing its indexing/comparison strategy.

Source: `research/provenance/source-archive/bsfp/docs-research/2026-09-10-bsfp-incremental-dominance-rejected.md`.
