# Branch Manager optimization checkpoint — generation-stamped inspection

Date: 2026-09-24

JSMinSys revision:
`4e5cc93ac674993dc46e883205120e3ef8c140d3`

Connect4 scaling run:
`35936505861`

Immediate control:
`35935640694` (tail-first ready inspection).

Change:
- add `inspectGeneration[q]`;
- duplicate-probe a q identity at most once per q generation across ready
  inspection and periodic TT cleanup;
- later duplicates still probe themselves and find the already-inspected
  canonical q.

Official first Fhourstones input `45461667`, 65,536 TT rows, manager budget 64,
30-second cap:

| Workers | Tail-first control | Generation-stamped inspection |
|---:|---|---|
| 1 | TIMEOUT; 11,104 evals; TT 8,519; ready 4,065 | TIMEOUT; 14,692 evals; TT 1,027; ready 382 |
| 2 | CAPACITY 24.67 s; 98,726 evals; ready 29,349 | CAPACITY 28.11 s; 109,797 evals; ready 31,400 |
| 4 | CAPACITY 0.971 s; 119,602 evals; ready 36,301 | CAPACITY 1.247 s; 118,472 evals; ready 36,081 |

Interpretation:

- Repeated duplicate probing was a material manager cost.
- One-worker live TT footprint fell ~87.9% from the tail-first control while
  useful evaluations increased ~32.3%.
- Two-worker time-to-capacity improved ~13.9% and evaluations before capacity
  improved ~11.2%.
- Four-worker time-to-capacity improved ~28.4%, but the manager still cannot
  absorb four-worker surplus production.
- The next redundant probe is in pending-parent attachment: children already
  inspected and stamped by the ready/cleanup path are probed again before
  attachment. Extending the same generation-stamp rule there is the next
  isolated optimization.
