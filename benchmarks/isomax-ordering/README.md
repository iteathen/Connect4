# Native IsoMax ordering comparison

Run with Node 26.7.0 from a clean source checkout:

```text
node --test benchmarks/test/isomax-ordering.test.mjs components/isometric/test/*.test.mjs
node benchmarks/isomax-ordering/run.mjs
```

This implementation qualification compares, in historical order:

1. Current fixed center-first recursive ordering.
2. A native WSL realization of the accepted September 15 playable-singleton
   effect order: promote one move creating two, then one, distinct own playable
   completions; veto promotion if support exposes an opponent singleton.

The research source is
`docs/research/2026-09-15-native-singleton-effect-ordering.md`, also preserved
by canonical research revision `104abfbe4444fcd315ac807b46ce2be8da13df39`.
The separately rejected opponent-suppression and own-cofactor proximity tiers
are not part of this candidate.

Production solver files remain unchanged. The candidate loader reads the current
solver and substitutes only the unresolved recursive ordering loop, failing if
its source seam changes. Native state, transitions, exact closures, caches and
root tie selection remain the same. Pair incidence is compiled once from the
WSL vocabulary; move classification does not materialize children or mutate the
residual pool. Suppressed degree-two supersets cannot remove a new completion:
their surviving singleton subset is either already exposed by support or the
landing singleton would have triggered immediate-win closure first.

Only below-root unresolved nodes receive advisory promotion. No value, pruning,
certificate or identity consequence follows from an ordering class. Optional
RBA remains disabled in both variants.

The workload has two independently seeded sets of 32 quiet legal roots, at
24 and 28 pieces played (18 and 14 remaining). Physical domain predicates select
roots without either player's immediate win; no solver results select fixtures.
These are synthetic controls, not Begin-Hard or an empty-board solve.

Each process has the same eight untimed warmup roots and fresh pool/cache per
measured root. Times measure exact WDL plus root move selection; setup and forced
GC between roots are excluded and setup is separately reported. Six processes
run sequentially A-B-B-A-A-B, with 120-second process deadlines, no retries.
The report requires identical WDL/root moves and repeatable node counts, then
reports three-sample median total solve time per workload and all raw timings.

Tests compare effect classes to realized physical child threats, and both
orders to a physical-board exact oracle on late roots. Benchmark agreement on
earlier roots is differential evidence, not an independent solved oracle.
Logs flush per completed root; interrupted roots have no invented result.
Evidence is retained under the Git-private `solver-performance/<run-id>/`
directory. Results do not automatically promote the candidate to production.
