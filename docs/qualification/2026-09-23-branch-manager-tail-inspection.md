# Branch Manager optimization checkpoint — fresh-surplus inspection

Date: 2026-09-23

JSMinSys revision:
`e60ff7d0206586eb4f2946bfa5c2b6ea85112d3d`

Connect4 benchmark run:
`35935640694`

Control run before this optimization:
`35933520866`

Change: workers append surplus at the ready tail, so the Branch Manager now
inspects the newest tail window first instead of repeatedly inspecting the old
head window. Worker/manager ownership semantics are unchanged.

Official first Fhourstones input `45461667`, 65,536 TT rows, manager budget 64,
30-second cap:

| Workers | Before | Tail-first | Effect |
|---:|---|---|---|
| 1 | TIMEOUT; 14,005 evals; TT 17,035; ready 10,419 | TIMEOUT; 11,104 evals; TT 8,519; ready 4,065 | TT -50.0%; ready -61.0%; eval throughput lower |
| 2 | CAPACITY 18.77 s; 46,730 evals; ready 41,099 | CAPACITY 24.67 s; 98,726 evals; ready 29,349 | time-to-cap +31.5%; evals +111.3%; ready -28.6% |
| 4 | CAPACITY 0.981 s; 58,849 evals; ready 38,875 | CAPACITY 0.971 s; 119,602 evals; ready 36,301 | capacity wall unchanged; evals +103.2%; ready -6.6% |

Interpretation:

- Fresh-surplus inspection materially improves manager dedupe/queue effectiveness.
- It does not solve the 4-worker TT-production rate.
- One-worker process CPU time fell from 1.111 s to 0.625 s across a 30 s wall
  interval while useful evaluations also fell. This strengthens the existing
  evidence that transaction contention followed by the 1 ms park path is a
  major throughput wall.
- Next optimization target: TT transaction acquisition/manager lock residency and
  worker parking behavior. Do not move dedupe into workers and do not make the
  manager generate or consume surplus.
