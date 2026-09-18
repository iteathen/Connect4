# Experiments

Experiments test claims; they are not themselves claims.

Historical experiment trees are preserved in `research/provenance/source-archive/`. As they are normalized, each experiment should declare:

1. target claim IDs;
2. hypothesis and falsifier;
3. exact oracle/reference semantics;
4. board family / position distribution / workload;
5. controlled variables;
6. measured outputs;
7. result and uncertainty;
8. whether the result is correctness evidence, performance evidence, or both;
9. any dependence on previous experiments;
10. disposition: supports, contradicts, qualifies, inconclusive, or implementation-only.

Negative results are retained. A failed implementation strategy belongs in history/rejected or deferred after its evidence is normalized; the theorem it attempted to exploit is classified separately.


## Active normalized experiment records

- `bsfp-support-local-clause-coverage/` — target claims **C4-R0073** (deductive dictionary/predecessor closure) and **C4-R0074** (bounded empirical qualification). Complete differential recurrence controls plus 6x5 support-local dictionary census. Canonical requalification run 35332181198 passed. Result is correctness/representation evidence only; no CUDA speedup or production adoption is claimed.
