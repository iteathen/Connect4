# IsoMax package replacement in Connect4

Owner explicitly requested that the promoted solver replace Connect4's old IsoMax.
Owning implementation head: `work/isomax-jsminsys-rebuild`, recovered at
`6b8c60fa7819cbab242f0273c36e6a39afbba696`. Temporary integration branch:
`work/isomax-package-20261006`; retire only after its qualified tree reaches that
implementation head. Research and BSFP are outside this replacement scope.

The existing application API delegates to the self-contained `isomax/` package
instead of the historical vendor entry point. The default is four deep workers,
the producer's retained memory/profile, and no root-frontier/RLC execution. Search
and all72 runtime modules are copied unchanged from the frozen producer package.
The package's600s timeout replaces the old adapter's120s ceiling. Pre-aborted
initialization follows the package rejection contract; active cancellation,
terminal precedence, reflection and optimal caller-frame moves remain qualified.

Producer: iteathen/JSMinSys, runtime source
`d2e4ccadcef6d67bc97a53679476e1ef6a5a9916`, promoted at8e176bc.
Version0.2.0-rc.2 archive SHA-256:
`26b1c5232ced8fa7c1e12f0bb3ccf0e6fd9c55788a7dab6caeab18e034d162e1`.
`node isomax/verify.mjs` verifies all144 locked files and24 worker variants.
No package hash or runtime source is rewritten for this transfer.

The default-worker regression failed against the old adapter (7 !=4) and passed
after delegation changed. Independent late-position physical-minimax tests cover
two/four workers and reflected/terminal states. Correctness fixtures use explicitly
small TT capacities and no complete support plans; these are not timing authority.
Unavailable diagnostic counters are asserted null instead of reintroducing them.
The complete package suite separately checks physical transitions across all100
dimensions, compiled paths, cache input guards, preparation and cleanup.

Run `npm test`, `npm run test:package`, and `node isomax/verify.mjs`. Producer
performance records remain scoped to their exact source/configuration. This
transfer does not claim a new speedup or universal evaluator and does not access
the sealed EW-RS-059 formula-holdout outcomes.

Transfer qualification:13 integration and46 package tests passed, all144 package
locks and the original archive hash match. Fresh read-only review found an old
execution-profile authority contradiction; dated supersession notes in the
candidate solver specification and Lazy-SMP decision resolved it. No other
concrete defects were reported. Review used textual inspection and saved logs,
not new independent tests or performance data.

One full empty7×6 confirmation from the Connect4 package location, source89a0882,
completed EXACT WIN/column4 in57,460.6506ms primary,61,561.8893ms whole operation
and61,840.4814ms external process wall. CPU217,187.5ms, peakRSS6,903,889,920bytes,
recorded Node27nightly/V8 and verified0/2/4/6 worker targets, processmask85, four
ready/exited workers and clean termination. TT/geometry capacities match the
producer. Raw stdout/stderr/invocation/measurement/affinity are under
`20261006-package/full-confirmation/`. This single transfer confirmation is not
a new repeated optimization comparison, and the10s goal remains unmet.

Historical gitlink and qualification artifacts remain preserved. Old benchmark
commands require their original source revision; they do not select the current
package settings. Solver-specific qualification stays on this implementation
head; main receives the current solver routing link only.
