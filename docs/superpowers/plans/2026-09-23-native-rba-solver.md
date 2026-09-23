# Native RBA solver implementation plan

Goal: implement the reviewed standard-7x6 native solver on the rebuilt executor.
Execution: inline in the existing worktree, without delegation.
Spec: `docs/design/rba-native-integration.md`.
Substrate: Node 26.7, JSMinSys round 100, NEES Draft 0.5.

## Qualified units

- [x] Coordinates: cold global vocabulary and incidence; deterministic local
  bases; numeric cofactor/reflection; cold legal replay ingress. Test against
  independent physical winning-line residuals at every random legal prefix,
  first-win stopping, singleton completion, padding and reflected equality.
  Files: `components/isometric/rba/{prepare,coordinate,ingress}.mjs`,
  `test/rba-coordinate.test.mjs`, `test/helpers/physical-oracle.mjs`.
- [ ] Executor integration: replace the complete 42-word ABI with selected
  eight-word q layout. Extend numeric outcomes and fix external-frame root tie
  selection. Test exact collisions, failure/lifetime fixtures and both root
  orientations; update every production and fixture consumer simultaneously.
- [ ] Algebra: prepared numeric front arena, streamed absorption/semiring,
  terminal-extended cofactor preimages and four-front/action composition.
  Exhaustive small-support lattice controls and independent interval oracle
  must pass before using boundary closure for game results.
- [ ] Kernel: bounded native algebra plus explicit same-coordinate exact
  fallback, retained private continuation and shared surplus publication.
  No manager evaluation or conventional board recursion. Test legal late roots
  with an independent oracle at 1/2/4 workers, first-win/mirror/tie behavior,
  boundary exhaustion, cancellation and unchanged <=120s deadline.
- [ ] Qualification: complete transitive JSMinSys check, per-operation cycle
  ledger and whole-operation CPU-cycle measurement where supported. Distinguish
  actual hardware counts, static reference estimates, unresolved terms and
  elapsed time. Include charged basis derivation, contention and cleanup.

Each unit: write behavioral tests, observe missing behavior, implement, run
targeted tests then complete suite, review, document, commit and push after a
fresh remote-head check. No four-front producer before coordinate qualification.

## Representation implementation detail

Precompute geometry/global shape/cofactor/reflection tables in cold preparation.
Support-local bases may be derived into fixed numeric scratch as part of a
transition; this is charged hot work, not hidden cache preparation. This avoids
preparing up to 7^7 support fibers eagerly. No dynamic allocation or per-node
map/sort is permitted. Benchmark this cost rather than assuming it disappears.

## Review focus

1. Terminal completion before an opponent's apparent next completion.
2. Mirrored external roots with multiple value-preserving tied moves.
3. Exact local basis identity despite different worker histories.
4. Query uncovered / arena exhaustion never published as draw or exact bounds.
5. Failed/aborted workers leave no fabricated WDL or live thread resources.
