# Fresh execution rebuild qualification

Execution source tested: `0c508650` (full SHA in execution-baseline.json).
Branch: `work/isomax-jsminsys-rebuild`. No prior solver code was imported.
JSMinSys: `617c5172a938e8df665671919462cb37797043ff`.
NEES: Draft 0.5, `7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.

## Reproduced results

- Node 26.7.0 / V8 14.6.202.34-node.28, Windows x64, i5-12600K.
- `npm test`: 26 passed, zero failures.
- Pinned JSMinSys library: 72 passed, zero failures.
- Hot-scope detector: 23 component/library functions, no reported violations.
  A deliberately introduced transitive array allocation was detected.
  Native `evaluate` remains explicitly open, not implicitly approved.
- Real evaluator counts 1/2/4, plus a separate manager thread.
- Exact hand-solved DAG and four seeded transposed DAGs agree with the independent
  oracle, including physical root action, at all three evaluator counts.
- Capacity, generation exhaustion, conflicting exact values, cancellation,
  deadline, worker death and death inside the transaction fail closed.
- Every real-thread test confirms all owned threads exit.

## Ownership review and fixes during construction

Insertion and installation of a child reference occur in one TT transaction.
Pending and attached edges own the same pin; attachment does not double-retain.
The retained first child can execute before manager consumption without losing
the pending parent pin. Manager pruning removes only that parent's edge; the
shared-child regression proves another parent's requirement survives.

Review found queued orphan rows unnecessarily held table capacity until a worker
dequeued them. A two-slot regression failed first, then passed after constant-time
unlinking was added. No capacity limit was increased. Another regression proved
retired local continuations must drop their claim before another kernel call;
the worker now checks that condition at the kernel control boundary.

Worker death inside a multi-row transaction is deliberately a session failure.
There is no recovery claim, speculative lock takeover, fabricated value, or
secondary ownership system. Disposal occurs after all threads are joined.

## Whole-operation fixture baseline

`node tools/bench-execution.mjs` ran seven samples per evaluator count in rotated
order, including fresh TT allocation, thread startup, execution and cleanup.
All 21 samples returned the expected fixture WDL and root action.

| Evaluators | Median ms | Min–max ms |
|---|---:|---:|
| 1 | 24.42 | 23.62–31.06 |
| 2 | 39.43 | 25.97–70.59 |
| 4 | 34.03 | 27.79–72.70 |

Raw samples: `execution-baseline.json`. These tiny cold execution fixtures do
not demonstrate a parallel speedup. Startup and host variability are included;
there is no measured attribution of the variance to a particular mechanism.
They are not Begin-Hard, empty-board or native IsoMax solve scores.

## Review outcome and remaining boundary

The requested execution components exist, are committed, and pass their current
component/integration tests. No BSFP change or workflow change was made.
No merge, deployment, performance promotion or full NEES/JMS conformance claim.

The new native WSL kernel, full transitive qualification, non-exact interval
propagation, cross-root retained workers and native-workload synchronization
economics remain open. The complete cost/debt record is in
`components/isometric/NEES_PROFILE.md`. In particular, the TT-wide transaction
and prepared record carriers must not be silently treated as proven optimal or
as an automatically sealed JSMinSys realization.
