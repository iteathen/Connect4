# Exact canonical cofactor BDD stable-handle sweep trial

**Date:** 2026-10-16. **Research owner:** research/semantic-quotient. **HEAD at plan:** `fd841cf15858441a017163501843f6c784c6190a`.
**Status:** PLAN; no game WDL claim or new game-theory authority.

## Measured wall
A source-only action-QBF ROBDD compiled/projection yielded k8 first-action bounded WDL intervals with zero discrepancies against an independent 3,567,031-transition physical check. Source gate last-use scheduling successfully reduced dead intermediate retention but k9 still fails under 60,000 retained BDD nodes on eight predeclared action-bit orders. Some failures are **two-space GC** failures: original BDD slots plus copied live nodes exceed 60k simultaneously, while neither alone necessarily exceeds 60k. This is not a lower bound on canonical future Boolean-function width.

## Candidate exact law
Use mark-and-sweep on the canonical ROBDD while retaining stable numeric node handles. After a source gate stage or completed quantified action bit (NEVER inside an in-flight APPLY/cofactor call):
1. Mark exactly the node IDs reachable from ALL live source gate roots (or current quantified root) through low/high complemented edges.
2. Null out all unmarked prior node slots, rebuilding the unique `(var,low,high)` table only from marked canonical nodes; clear APPLY/cofactor memos whose IDs could be reused.
3. Push freed node slot IDs to a reusable freelist. New BDD nodes may reuse slots with no hidden second node array. Track slot capacity, peak active nodes, marking bitmap, sweep scans and all cached functions separately.
4. Do not rename surviving handles or change BDD node triples. **By extensional identity**, each retained root remains exactly the same Boolean function under any assignment. Source last-use handle counts ensure no required future gate operand is discarded. Each completed quantified prefix is still the exact original alternation.

Proof obligations: reduced/ordered/complement-normalized invariants, no dangling reference from a surviving root, unique table rehash equality, old APPLY memo invalidation before reuse, correct simultaneous live source gate root set. A linear marker bitmap is scratch data, *not* a hidden second BDD; report its bytes. All peak BDD slots capped at 60k and nontrivial Boolean operations capped at 300k; 10k support and 15s unchanged. GC work counted separately, never described as free.

## Falsifiers
- Generic reduced BDD Boolean truth functions and quantifier order (including x AND NOT x, forall-exists vs exists-forall).
- Physical independent 4x3/4x4 full-game optimal action sets (13 unique, 11 ties), 672 bounded action threshold comparisons, legal 223.
- 44444 k6/k7/k8 all literal action threshold vectors match prior independent physical validation; then attempt k9 and k10 in exact envelope with chronological and bitplane orders.
- Compare initial gate compilation and abstracting stages, peak slots/active nodes, Boolean APPLY/cache-miss work, marker/sweep scans, f-live source roots. Stop at first cap; if k9 still fails after in-place mark/sweep, preserve as candidate-specific negative. No solver values permitted as construction inputs.

No automatic width or polynomial-time claim; no authority promotion, merge or limit change.
