# Forced macro-edge / support-implication experiment recipe

Research-only reproduction notes. No maintained solver code is changed.

Base the experiment on the repaired 625-ID residual solver preserved by `reference/research-prototypes/2026-09-09-residual-automorphisms/residual_automorphism_625.mjs` at parent research commit `5f84cb526c43d9b5ce4112ded3d8f05fbe1faa3d`.

## Forced macro-edge patch

Before TT admission/search at a recursive state, repeatedly inspect size-1 residual requirements whose sole cell is exactly the current landing cell of its column.

Pseudocode:

```text
while true:
  if side-to-move has any playable singleton:
      return exact immediate-win score

  threats = distinct playable singleton cells for opponent

  if threats.count >= 2:
      return exact opponent-next-move loss score

  if threats.count == 0:
      break

  apply the unique threat-blocking move
  update both 625-ID antichains and the column height
  increment ply
  do NOT TT-admit the intermediate forced state

search the resulting decision state normally
```

For qualification, also run a `tactical` control that performs the immediate-win and double-threat terminal cases but stops before applying a unique forced reply. `tactical -> macro` is the clean measurement of actual transit-state elimination.

## Support-compatible implication patch

Only compare states with identical packed column heights.

For antichain formula `F(R) = OR(r in R) AND(cell in r)`, define:

```text
S dominates T for P0 iff
  F(T.P0) => F(S.P0)
  AND
  F(S.P1) => F(T.P1)
```

Then `V(S) >= V(T)` for the exact signed distance score because legal future move/support structure is identical.

Use proved lower/upper bounds only:

```text
S >= T  => lower(T) is a valid lower(S)
S >= T  => upper(S) is a valid upper(T)
```

Do not prune sibling moves merely because their residual formulas imply one another.

### 625-bit formula implication

For each requirement ID `b`, precompute the 625-bit set of IDs `a` whose cell mask is a superset of `b`.

For antichain B, OR those sets to obtain `upClosure(B)`.

Then:

```text
F(A) => F(B)
iff
(ids(A) & ~upClosure(B)) == 0
```

Maintain separate support-local lower and upper proof frontiers. The tested bounded variant retains at most eight records per direction/support vector. It retains essentially all measured node reduction but remains slower in the JavaScript prototype.

## Qualification cohorts

Use:

1. complete empty-root games: 4x3 connect-3, 4x4 connect-4, 5x3 connect-4, 4x5 connect-4;
2. the frozen eight-position 7x6 cohort from the parent residual-automorphism prototype, checking the same independent oracle scores;
3. the fresh 12-position non-tactical-root cohort recorded in `docs/research/evidence/2026-09-09-forced-macro-and-support-implication.json`.

Use rotating mode order for timing and discard initial warm-up repetitions. Node counts are deterministic; JavaScript timings are mechanism evidence only.

See `docs/research/2026-09-09-forced-macro-and-support-implication.md` for results and disposition.
