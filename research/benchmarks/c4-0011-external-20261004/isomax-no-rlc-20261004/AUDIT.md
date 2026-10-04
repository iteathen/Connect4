# IsoMax without RLC — bounded comparison variant

Owner request: disable RLC and repeat the IsoMax test only. The parent frozen packet/result commit is `948e8356d33695a1a6e8ca93c97d48013efc5d3f`. JSMinSys remains pinned at `1b843981ba7d68c118656dad1a6c7591453e7686`.

The only runtime file changed is the benchmark `wrapper.mjs`: remove the RLC evaluator import/call and advancement loop, retain an initially empty move array, call exact search once, and label the target as fixed empty-root W/D/L. No chosen moves or solved knowledge are supplied. An empty handoff event is retained solely for the unchanged audited runner's record format. The entrypoint test uses an isolated fake package that throws if RLC is invoked and rejects any nonempty exact-search input or changed worker/cache/time-limit settings. Test fixtures never enter the real runtime directory.

The preparer hash-checks the parent runtime, copies it to a new external directory, replaces the wrapper, and asserts that exactly that one file differs. All 49 packaged runtime modules, Node executable, profile and affinity targets are byte-identical. Four deep workers, 4 GiB shared TT, 576 MiB private TT per worker, mask 85 and individual P-core bindings remain unchanged. Internal timeout remains 300,000 ms; the external process ceiling remains 3,600,000 ms. No CPC, BSFP, support library, TT, move-ordering or search changes.

The three common runner/measurement/parser files are byte-identical copies of the parent audited harness, independently hash-bound by the new variant lock. There is no new measurement implementation. Whole-process timing and fresh-zero-buffer/no-book/no-persistence conditions are unchanged. The parent runtime-input-only audit applies to the unchanged solver dependency closure; this wrapper adds no file inputs, learned state or constants encoding solved play. Its only file input is the same frozen profile. Historical lineage remains not certified.

Unlike the original RLC run, this exact-search target is the empty root and thus matches the external weak-W/D/L targets. Timing differences still reflect single runs and the preserved native resource/toolchain differences. No expected answer enters the measured process. Validate records and compare outcomes only after it returns.

Preparation: `node --test entrypoint.test.mjs`, then `node prepare-variant.mjs <parent-build-root> <new-variant-build-root>`. Perform a `prepare` cold check, freeze this audit and metadata on the experiment branch, then run one `run` invocation with the copied `runner.mjs`. No external solvers are rerun.
