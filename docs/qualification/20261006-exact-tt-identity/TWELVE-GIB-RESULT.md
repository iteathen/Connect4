# Twelve GiB shared TT measurement

The requested 12 GiB shared TT was run after the owner freed host memory. The first
attempt was censored before allocation; that negative preflight remains in
`partial24-shared-12gib-preflight-01/`. Subsequent fresh preflights passed without
changing the reserve, OS paging, runtime flags or private cache sizes.

All timed runs use producer source `6bc1dd047209664f9924c4cb49597a2154555107`,
the same Node 27 nightly/V8 14.6.202.34-node.36 executable/hash, 2400/9600 inlining
flags and startup preload. Six auto-discovered verified P-cores 0/2/4/6/8/10,
192 MiB private per worker, rootFrontier=false, sharedSampleMask=0, proof bounds
sharing and retained compiled support plans. Empty 7x6 root, no prefix/RLC/book,
fresh process and fresh page-warmed TT. No expected answer enters the worker.

The full24 extension uses two banks of 2^28 entries each, 6 GiB per bank, for 2^29
global entries/12 GiB payload. Private capacity remains 2^23 entries. Each row is
unchanged; its stored partial locator includes the redundant bank-selection bit,
so index bits plus retained bits still reconstruct the exact 32-bit locator.
Within-bank indices stay below 2^31. Attachment and accessor binding happen
before READY. Only banked shared access pays a bank-reference lookup, shift and
mask; no layout branch, allocation, resizing or statistics enter the hot loop.

Because closing tasks changed the environment, fresh 6 GiB references were run
instead of attributing a difference against earlier timings entirely to memory.
The matched comparison uses two banks for both sizes: 2x3 GiB versus 2x6 GiB.
A fresh one-bank 6 GiB sample is recorded separately, not treated as three trials.

| Shared configuration | Runs | Solve times | Mean solve | Mean process CPU | Mean initialization | Maximum peak RSS |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| 6GiB, one bank, fresh reference | 1 | 37.921s | 37.921s | 210.906s | 4.192s | 8.585GiB |
| 6GiB, two banks | 3 | 38.677 /37.486 /38.942s | 38.368s | 215.646s | 4.473s | 8.594GiB |
| 12GiB, two banks | 3 | 34.805 /38.467 /37.298s | 36.857s | 214.057s | 5.576s | 14.593GiB |

Primary solve starts after all workers and TT pages are ready and includes
actual empty-root construction through exact-result observation. Initialization
and cleanup are separate. Process CPU includes the entire run; process cycles
are unavailable. No hot node/cache counters were collected.

12 GiB has a 3.94% lower mean primary wall time than the matched 6 GiB banked
control (1.511 s). Mean whole-process CPU is 0.74% lower; external wall means are
43.301 s (12 GiB) and 43.303 s (6 GiB). More memory adds setup cost, and the owner-selected
primary boundary excludes that setup. Three samples overlap: this is a modest
measured mean benefit, not a statistically established or universal gain. The
34.805 s sample must not be presented as the typical solve time or a 10 s solve.

All seven measured runs returned EXACT/WIN/c4, verified all six pins and exited
six workers cleanly. [comparison12.json](comparison12.json) contains every raw
value and descriptive statistics; [compare12.mjs](compare12.mjs) recomputes them
and checks source/runtime/flags/configuration, memory, results and cleanup.
Per-run stdout/stderr, commands, physical/commit preflight and measurement records
are retained in each named directory. Final cleanup reports no remaining solver.

Preparation passed 467/467 root tests and 26 independent bounded physical-minimax
comparisons (1340 oracle memo nodes). Four tiny banks exercise same local slots
across banks, all five proof tags, clone/alias handling, busy rows and full32bit
sequence wrap. Host checks verify both banks and private caches exist before
search. No 10x10 full solve; generic board dimensions retain the old exact fallback.

NEES verifies 298 sealed functions +642 add-on units, 30/30 blocks, 0 deferred.
Review found no runtime blocker and required the bank-array access to be charged
as `runtime.array.reference.load` (with array guards), separately from its three
field reads. That correction is included in 6bc1dd0. Review was read-only.
The actual 12 GiB JIT diagnostic shows banked probe/store inlining into Negamax,
12 GiB payload, two banks, six ready workers and clean exits. It used a 10-second
diagnostic ceiling; its incomplete solve is not performance evidence.

The extension is retained in the experimental producer branch to reproduce this
requested capacity. Production package, memory defaults and main remain unchanged.
Direct current factory limits: compact7x6, compiled support plans and native
caches; each shared bank 8..2^28 entries, global capacity at most 2^32 with the
existing bank-count bound. Supported but unmeasured larger capacities are not
qualified by this 12 GiB test.

Reproduce on the audited localhost environment:

```powershell
& docs/qualification/20261006-exact-tt-identity/run.ps1 -Id fresh12 -Identity partial24 -SharedEntries 536870912 -SharedBankEntries 268435456 -LocalEntries 8388608
& docs/qualification/20261006-exact-tt-identity/run.ps1 -Id fresh6-banked -Identity partial24 -SharedEntries 268435456 -SharedBankEntries 134217728 -LocalEntries 8388608
```

12 GiB plus private caches consume 13.125 GiB TT payload. The preflight requires 15.125 GiB
of free physical and commit headroom including the unchanged 2 GiB reserve.
This is a localhost benchmark fixture, not a portable distribution launcher.
