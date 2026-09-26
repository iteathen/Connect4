# Current IsoMax state

Lazy SMP is the only active parallel execution model. Public solve7x6 delegates
to JSMinSys runLazySmpConnect4Rba32. Each of at least two workers owns a private
RBA/CPC exact search and local cache, sharing only committed exact W/D/L.
There is no shared-work TT, Branch Manager, surplus queue or dependency scheduler.

The exact dependency is the vendor/jsminsys gitlink, also recorded in
components/isometric/NEES_PROFILE.md. The application timeout stays <=120 seconds
and the default shared sampling mask stays 7. Root conversion is cold and occurs
once; internal transitions remain native RBA cofactors.

This cleanup removes retired implementations and conflicting instructions. It
does not claim a new speedup, empty-board solve, exhaustive exactness proof, or
whole-system NEES certification. Current implementation qualification is recorded
in docs/history/2026-09-26-lazy-smp-cleanup.md; older measurements remain scoped to
their recorded revisions. See docs/qualification/20260926-worker-scaling/REPORT.md
for the preserved recent worker-scaling report.

Retired model descriptions and qualification failures are preserved in
docs/history/retired-execution and the exact archived Git refs. They are not
alternate executable configurations. Canonical research remains owned by
research/semantic-quotient. BSFP remains separate and unchanged.
