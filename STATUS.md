# Current state

Active rebuild branch: `work/isomax-jsminsys-rebuild`.

## Current IsoMax implementation

The public standard-7x6 solver now uses the merged JSMinSys CPC-first implementation.

Pinned dependency:

`vendor/jsminsys` -> `iteathen/JSMinSys@25aeb13744a2ed413e660b16b8f3ec2332ae58ec`

Public execution:

```text
solve7x6 legal replay
  -> managed JSMinSys file worker
  -> runtime-configured 7x6 RBA geometry
  -> canonical q
  -> CPC/NDC exact/bound/restriction closure
  -> one-ply RBA cofactor
  -> exact negamax/alpha-beta
  -> exact cache
  -> P0-oriented W/D/L + caller-frame move
```

The production search mode is `RBA_AB_CPC_ONLY`. Recursive Four-Front is not
on the production search path. The pooled/synchronized frontier-response
extension remains disabled by default because it has not demonstrated additional
standard-7x6 closure on the maintained controls.

The current host profile admits exactly one search worker. Requests for more
workers fail explicitly. Timeout, cancellation or worker failure returns no W/D/L.

## Qualification

GitHub Actions run `35927386403` passed:

- Connect4: 57/57 tests;
- pinned JSMinSys: 122/122 tests;
- independent physical-oracle W/D/L and deterministic caller-frame move controls;
- reflection controls;
- genuine CPC-unresolved traversal with Four-Front metrics remaining zero;
- managed-worker cancellation/deadline cleanup.

This qualifies the implemented control set. It is not an exhaustive proof over
all reachable standard states and is not a completed Fhourstones score.

The standard Fhourstones harness at `tools/bench-fhourstones.mjs` now targets
this implementation. Qualification requires all four official inputs to return
`EXACT` with expected P0-oriented values `[1,-1,0,1]`.

## Legacy rebuild code

The earlier shared-TT / recursive Four-Front RBA implementation remains in
`components/isometric/execution/**` and `components/isometric/rba/**` only as
existing differential/component evidence. `components/isometric/solve.mjs`
does not import or execute that path. It is not the current production solver.
A later cleanup may archive/remove it after any remaining useful qualification
coverage is migrated.

## Claims not yet made

- full empty-root completion;
- full Fhourstones qualification;
- multiworker CPC-first search;
- performance superiority over external solvers;
- exhaustive all-state implementation verification;
- NEES-EXTREME / JMS-SEALED conformance.
