# NEES Draft 0.5 — JSMinSys CPC-first IsoMax

NEES revision: `7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.
JSMinSys revision: `25aeb13744a2ed413e660b16b8f3ec2332ae58ec`.

Semantic owner: retained Connect4 gameplay specifications and the accepted
Isometric/IsoMax solver contract. Reusable execution primitives are consumed from
the pinned merged JSMinSys library.

**Conformance status: partial qualification; no NEES-EXTREME, JMS-RESTRICTED or
JMS-SEALED claim.**

## Current execution scope

Public execution is:

```text
Connect4 legal replay ingress
  -> cold managed worker lifecycle
  -> JSMinSys runtime-configured 7x6 geometry
  -> canonical RBA q
  -> CPC/NDC closure
  -> exact RBA cofactor / canonicalization
  -> exact negamax/alpha-beta
  -> exact direct-mapped cache
```

The production mode is `RBA_AB_CPC_ONLY`. Recursive Four-Front is not on the
production hot path. Optional pooled/synchronized frontier-response logic is
disabled by default.

The current execution profile uses one search worker. This is explicit rather
than pretending that independent duplicated searches form a shared multiworker
solver.

## Ownership and lifecycle

Connect4 owns:

- legal replay and standard 7x6 product entry;
- P0-oriented result semantics and deterministic external move meaning;
- benchmark/oracle expectations;
- the public 120-second deadline.

JSMinSys owns:

- runtime geometry and execution-profile specialization;
- support-local q/basis/cofactor/canonicalization;
- CPC exact/bound/restriction closure;
- alpha-beta traversal and exact-cache discipline;
- generic managed worker/session lifecycle.

The search worker is disposable per solve. Timeout, cancellation or worker
failure terminates and joins it before public completion. No interrupted run
publishes W/D/L.

## Hot-path policy

After worker preparation, the recursive search uses preallocated typed storage.
Exact cache publication is restricted to globally exact values; narrow
alpha/beta returns remain local search control. Hashes are locators only.

CPC may return exact W/D/L, tighten an exact interval, or restrict legal actions
only under qualified guards. Advisory projected CPC facts remain non-authoritative.
Ordinary first-win timing is supplied by traversal unless a certificate
explicitly proves a skipped temporal interval.

No conventional colored-board reconstruction, BigInt gameplay state, recursive
Four-Front fallback, or alternate solver is on the production path.

## Qualification

GitHub Actions run `35927386403`:

- Connect4: 57/57 tests passed;
- pinned JSMinSys: 122/122 tests passed;
- independent physical-oracle agreement on maintained late 7x6 controls;
- mirrored caller-frame witness agreement;
- genuinely CPC-unresolved rank-28 control traverses alpha-beta with
  `frontCalls=0` and `frontSteps=0`;
- deadline/cancellation cleanup returns no W/D/L.

These tests qualify the implemented controls. They do not establish a complete
NEES cycle model, emitted-assembly optimality, all-state exhaustive verification,
multiworker scaling, or empty-board completion.

## Remaining qualification debt

- complete standard Fhourstones run using `tools/bench-fhourstones.mjs`;
- whole-operation CPU-cycle and elapsed measurements for the new managed-worker
  CPC-first path;
- representative V8/JIT lowering inspection if NEES-EXTREME promotion is sought;
- a real shared/distributed CPC-first design before admitting workers > 1;
- full all-state or stronger exhaustive differential qualification if required.

Historical measurements for the superseded shared-TT/Four-Front implementation
remain historical evidence only and must not be presented as measurements of
this implementation.
