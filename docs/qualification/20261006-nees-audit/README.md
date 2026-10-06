# IsoMax NEES realization audit

The source/accounting audit is owned by JSMinSys on branch
`work/isomax-auto-workers-20261006`, under
`evidence/isomax-nees-audit-20261006/`. The
[audit report](https://github.com/iteathen/JSMinSys/blob/bde40d707c9954631ba31c443126961485e92342/evidence/isomax-nees-audit-20261006/REPORT.md), rule and method dispositions,
source manifest, reproduction and debt inventory distinguish production
`40b19431f00174c5d52c442677d67ec698e8c50a` from the measured partial24 candidate
`6bc1dd047209664f9924c4cb49597a2154555107`.

The audit is not clean: the enforced ledger graph misses actual compiled worker
roots; callback aggregation, symbolic validation and completion accounting have
confirmed gaps. Package/source identity still passes. New optimized code contains
uint32 hash boxing and negative-zero window allocation paths, and emitted unused
slot/tail argument work. Reachability/frequency and full-solve savings are not
measured. No solver or frozen package code changed during this audit.

This directory preserves two bounded observations:

- `partial24-banked-code-gc-01/`: initial output, including interleaved worker
  machine code. Useful for detecting a problem, unsuitable for precise per-body
  assembly attribution.
- `partial24-banked-code-gc-02/`: V8 `--redirect-code-traces` creates independent
  `code-31656-1.asm` through `code-31656-6.asm`. Use these for the report's source
  and machine-code anchors. Isolate 0 belongs to the main process.

Each run has exact invocation/environment/runtime identity, preflight resource
checks, raw stdout/stderr, external measurements and a machine-readable summary.
The second run's attributes preserve raw bytes across checkouts, including V8's
trailing whitespace; raw output is not reformatted to satisfy source-style checks.
Both intentionally observe search for ten seconds, return TIMEOUT with no WDL,
and verify six worker exits. **These are not performance benchmark results.**
GC activity does not quantify per-site allocation or separate ingress/tiering
from steady recursion. Main heap snapshots do not include worker-isolate heaps.

Same candidate configuration as the 12 GiB campaign: actual empty7x6, six
discovered/verified P-core workers on 0/2/4/6/8/10, shared12GiB in two banks,
private192MiB per worker, proof-bound sharing, no root-frontier worker, no RLC,
compiled support plans, Node27 nightly / V8 `14.6.202.34-node.36`, inlining
2400/9600 and the frozen startup bridge. Primary time begins after READY and
includes root construction. Selected diagnostic flags are removed from inherited
worker `process.execArgv` after process-wide activation; this does not turn off
V8 tracing. Diagnostic observation remains active, and no new worker hot counters
are added.

Reproduce only when resource headroom fits and no competing solver is running:

```powershell
./docs/qualification/20261006-nees-audit/run-diagnostic.ps1 -Id next-code-observation -RedirectCode
```

The harness accepts no expected solution input. It refuses source drift from the
measured `addons/`/`src/` candidate. Required solve/cache/cancellation semantics
remain unchanged. No10x10 full solves or sealed research holdout outcomes.
