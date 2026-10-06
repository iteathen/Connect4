# Current IsoMax state

## Current prepared package — 2026-10-06

This branch contains self-contained **0.2.0-rc.4**, runtime freeze
`40b19431f00174c5d52c442677d67ec698e8c50a`, with154 locked files. Worker
count/pinning and memory profiles are selected during initialization. Auto
chooses any fitting profile, including labeled experimental sizes.1/2/4/8GiB
tested;16/32/64/128GiB experimental. Actual allocation depends on geometry;
private budget256MiB per worker plus support/runtime reserve. No new hot policy,
diagnostic counters or resizes. Setup is in [isomax/README.md](isomax/README.md).

Local six-worker8GiB measurements averaged41.124s/best39.822s. Larger profiles
have address/metadata checks, not full-capacity timing qualification. Main/registry
promotion is separate. Earlier records below remain historical authority for
their exact source/configuration.

## Historical promoted replacement — 2026-10-06

The active solver is the self-contained **0.2.0-rc.2** package under `isomax/`.
The existing `components/isometric/solve.mjs` application API delegates to it.
Runtime source is JSMinSys `d2e4ccadcef6d67bc97a53679476e1ef6a5a9916`; all144
locked files verify unchanged, and the transferred archive SHA-256 is
`26b1c5232ced8fa7c1e12f0bb3ccf0e6fd9c55788a7dab6caeab18e034d162e1`.

Defaults: four deep center/live workers, 4 GiB shared TT, 256 MiB private TT per
worker, native32 entries, shared proof bounds, sampling mask0, rootFrontierfalse,
1 GiB base plans and512 MiB auxiliary compiled-transition budget. All-ready
precedes root construction and search. The candidate mean is53.828s; extracted
package confirmation is55.326s. The10s target is unmet. These are scoped
localhost7×6 root-solve measurements, not a complete self-play game.

The package and thin application API have separate qualification. Current
configuration and setup are in README.md. Research and BSFP are unchanged.

## Historical replaced source and profile

The remaining record is retained provenance for the previous adapter. It does
not select the new solver's worker topology, memory or execution defaults.

Lazy SMP is the only active parallel execution model. Public solve7x6 delegates
to JSMinSys runLazySmpConnect4Rba32. Each of at least two workers owns a private
RBA/CPC exact search and local cache, sharing only committed exact W/D/L.
There is no shared-work TT, Branch Manager, surplus queue or dependency scheduler.

The exact dependency is the vendor/jsminsys gitlink, also recorded in
components/isometric/NEES_PROFILE.md. The application timeout stays <=120 seconds
with six deep + one wide worker, 4M shared entries, 1M private entries per worker
and full exact sharing (mask 0). Root conversion is cold and occurs
once; internal transitions remain native RBA cofactors.

The 2026-09-27 selected version uses native root-frontier execution and int32
polarity transport from the pinned JSMinSys profile. Its qualification record is
docs/qualification/20260927-selected-isomax.md. This promotion
does not claim a new speedup, empty-board solve, exhaustive exactness proof, or
whole-system NEES certification. Current implementation qualification is recorded
in docs/history/2026-09-26-lazy-smp-cleanup.md; older measurements remain scoped to
their recorded revisions. See docs/qualification/20260926-worker-scaling/REPORT.md
for the preserved recent worker-scaling report.

Retired model descriptions and qualification failures are preserved in
docs/history/retired-execution and the exact archived Git refs. They are not
alternate executable configurations. Canonical research remains owned by
research/semantic-quotient. BSFP remains separate and unchanged.

Current IsoMax implementation branch: `work/isomax-jsminsys-rebuild`.
The retired `solver/isometric` lineage is preserved under
`archive/lazy-smp-retirement-20260926/solver/isometric`, not another active model.
