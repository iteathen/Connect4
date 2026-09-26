# Round 0: accounting and host resolution

Disposition: calibration completed; no optimization qualified or promoted.

Connect4 harness: `5b37c1fb` initially, then `ec43fe26` for the corrected
Windows preload. Production baseline remains `afbb8baa2a504790319890d935f641b3e4087e4b`.
Both arms used JSMinSys `93aca1758718bcbf0635c11a957a67ca6387d50c`.
Host: Intel Core i5-12600K, Windows, Node 26.7.0 / V8 14.6.202.34-node.28.
Four workers; first standard Fhourstones input `45461667`; sample mask 7;
65,536 local/shared entries; 30-second solver ceiling. Each completed sample
returned WDL +1, column 3, with all four workers exited and clean shutdown.

## Observations

Each completed screen used four sequential ABBA blocks, 16 fresh processes.
Intervals below are descriptive block-paired Student-t 95% intervals, not
proof of independent stationary samples or a final qualification.

| Screen | Total process cycle difference B/A | Interval | Solve wall difference |
| --- | ---: | ---: | ---: |
| Identical production code A/A | +0.9915% | [-0.2984%, +2.2815%] | +1.0712% |
| Counter loader versus production | +1.0139% | [-1.8540%, +3.8817%] | +0.9434% |

The quick A/A screen cannot resolve a one-percent improvement. A nominal
one-percent gain on this host is insufficient evidence for promotion. The
node-counter loader cannot be declared free or below one-percent overhead;
its interval also does not establish a regression. Keep it diagnostic, with
untouched production measurements governing acceptance.

The eight instrumented samples recorded 2,710,205 to 2,885,204 total visits.
Those are all-worker visits. The winner-only metric is not an admissible
denominator for all-thread cycles. Each winner counter matched the existing
production winner metric after joins. All recorded cycle partitions close:
bootstrap + module/geometry setup + joined solve = cumulative process cycles.

This is one completed control, not the full four-position Fhourstones score.
No source operation envelope is represented as a hardware cycle measurement.
The catalog's AMD Zen 3 profile does not become an Intel instruction ledger.
`cpuMs` and `wallMs` cover the joined solve; total process cycles also include
bootstrap/setup. Report these scopes separately.

## Preserved failure and repair

`round0-instrumentation` stopped on its first B sample before solver execution:

```text
ERR_UNSUPPORTED_ESM_URL_SCHEME
Only URLs with a scheme in: file, data, and node are supported ...
On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
```

The controller had passed a Windows path directly to Node's `--import`.
Commit `ec43fe26` converts it with `pathToFileURL(...).href`. The failed folder
is retained verbatim. A distinct corrected folder holds the new run; no failed
sample was overwritten or silently retried. The old harness's `startedAt`
timestamp was taken after the child returned; do not use it as a true start
timestamp. The repair also records actual start and finish separately.

## Reproduction and next candidate

From the committed harness branch, use Node 26.7.0 (experimental FFI enabled
by the child launcher), a clean JSMinSys checkout at the SHA above, and a
previously nonexistent output directory:

```text
node tools/isomax-cycle-campaign.mjs noise NEW_OUTPUT JS_CHECKOUT JS_CHECKOUT 4
node tools/isomax-cycle-campaign.mjs instrumentation NEW_OUTPUT JS_CHECKOUT JS_CHECKOUT 4
```

Raw child outcomes, errors, measurement labels, revisions, source hashes and
each sample are in the adjacent folders. Thirteen application/accounting tests
passed. Production solver code was unchanged.

Next bounded candidate: compose dense indexed cofactor execution with C1's
per-player upward-closure absorption. The old PR33 implementation bypasses C1
and its older baseline timing is not current-head evidence. Require native
transition/oracle tests, an updated operation ledger, and uninstrumented paired
whole-solve measurements before deciding whether it is useful. Small effects
require more independent evidence than these quick calibration screens.
