# Phase 2 direct-source zero-bound confirmation

Date: 2026-09-27

Candidate direct-source SHA:
`dbac3d430414a90b8e31da9e0c640a06dfef596d`.

Against frozen Stage-9 denominator `10380f79...`:

- process cycles: **-57.3835%**
- paired 95% interval: **[-57.8147%, -56.9524%]**
- wall: **-59.0374%**
- nodes: **-75.33%**
- cofactors: **-75.45%**
- exact result/root move unchanged.

Run `36358419229`, artifact `10944841910`,
digest `sha256:aacb67fc7db8630929be5d6b81ff60d1697286db26558c84b5e4a125ce979522`.

The second cumulative 50% target is therefore independently crossed on the hard
local exact-solve lane by the direct-source implementation.

Short-control cycles/wall remain statistically neutral.

Next gate is selected multiworker qualification. Explicitly preserve the
Phase-1 support-plan configuration in each measured worker; otherwise a
multiworker comparison would not be against the qualified denominator. Also
measure whether private zero-bound rows mask potentially useful shared-exact
lookups.
