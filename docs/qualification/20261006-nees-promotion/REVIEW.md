# rc.5 promotion review and fix pass

Fresh read-only review covered mainad0bfd0..f27be196 and producer456ef71..b7604c7.
It did not run tests or compete with the timed solve. No Critical finding.

Important: automatic partial24 admission ignored custom layouts and capacities,
rejecting previously valid split caches and1/2/4-entry overrides. A new selector
regression failed before the fix and passed afterward. Native-compatible fallback
now runs those cases through the public API; explicitly requested incompatible
partial24 remains an error. Default qualified workers/TT settings are unchanged.

The reviewer also found custom split40 reported32-byte entries while allocating
40 correctly. Regraded Important for exact configuration/evidence claims and
fixed in the same cold metadata branch. A real public application test failed
32!=40, then passed with metadata matching actual storage. No hot reporting.

Both fixes are at their owners. Producer runtime freeze advances to
8b81911bb19f58665f5a5bbb4811a05fc0fd9fba; all32worker kernels remain identical
to qualified1c7b64f. Package/archive are rebuilt and bound to that revision.
Initial public-default-01/archive-smoke are retained historical pre-fix evidence;
final package tests/archive/public-default-02 qualify the shipped revision.

The reviewer did not establish exhaustive correctness, portable performance,
whole-runtime NEES or immediate RSS reclamation. Ruling: preserve those explicit
limits and use bounded claims. No separate deferred review minors remain.
