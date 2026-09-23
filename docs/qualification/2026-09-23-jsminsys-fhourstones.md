# Standard Fhourstones benchmark — JSMinSys CPC-first IsoMax

Date: 2026-09-23

Benchmark run: GitHub Actions `35927770000`

Connect4 revision under test:
`0ba27d8b29285e820b9381edc22989d8e11b5af6`

Pinned JSMinSys:
`25aeb13744a2ed413e660b16b8f3ec2332ae58ec`

Profile:

- GitHub Actions `windows-latest`;
- Node 26.7.0;
- one exact search worker;
- exact-cache capacity 65,536;
- production CPC response profile;
- projected advisory disabled;
- 120-second cap per official input;
- one cold attempt per input, no retry or warmup.

## Result

Outcome: **incomplete, 1/4 official cases solved**.

| Input | Expected | Result | Wall time | Search nodes | Cofactors |
|---|---:|---|---:|---:|---:|
| `45461667` | +1 | EXACT +1, move 3 | 2.722 s | 1,590,668 | 1,596,122 |
| `35333571` | -1 | TIMEOUT | 120.009 s | not retained on interruption | not retained |
| `13333111` | 0 | TIMEOUT | 120.025 s | not retained on interruption | not retained |
| empty | +1 | TIMEOUT | 120.009 s | not retained on interruption | not retained |

The exact first case used:

- 636,990 alpha-beta cutoffs;
- 625,677 exact-cache hits;
- 10,831 CPC exact closures;
- 245,613 CPC bound closures;
- 241,591 CPC restrictions;
- 314,096 forced CPC actions;
- 6 fork-precursor certificates;
- zero Four-Front calls and zero Four-Front steps.

Measured first-case process CPU cycles: `7,084,105,830`.
Measured first-case CPU time: 2.938 s.
Peak sampled RSS at case completion: 61,538,304 bytes.

All timeout cases cleaned up their owned worker and returned no W/D/L.

## Interpretation

This does **not** pass the standard Fhourstones qualification because three of
four official cases did not complete inside the retained 120-second cap.

It is nevertheless a stronger result than the historical removed-fallback
qualification, which completed 0/4 official cases under its own recorded run.
The historical and current runs were not on the same machine, and their internal
work counters are different units, so no wall-time speedup factor or node-rate
ratio is claimed across those runs.

The published Fhourstones reference node counts remain contextual only. JSMinSys
CPC-first alpha-beta nodes/cofactors are not Fhourstones engine alpha-beta nodes
and must not be compared as identical work units.

The immediate performance wall is therefore no longer the first official input.
Current optimization should target the second input `35333571`, then the draw
case and empty root, while preserving exactness and the production no-Four-Front
path.

Machine-readable evidence:
`docs/qualification/fhourstones-isomax-jsminsys.json`.
