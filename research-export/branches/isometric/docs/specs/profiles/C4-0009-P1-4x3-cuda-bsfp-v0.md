# C4-0009-P1 — 4x3 CUDA-BSFP first qualification profile v0

**Status:** Working subordinate execution profile; portable-qualified, native numerical qualification outstanding.  
**Parent authority:** C4-0009 CUDA-BSFP execution profile v1.  
**Solver semantics:** C4-0008 BSFP exact solver v1.  

## Purpose

Freeze the exact first CUDA-BSFP implementation/qualification shape without turning its deliberately small correctness representation into a general BSFP or standard-7x6 compatibility requirement.

This profile contains two complementary device slices:

1. **P1-A ranked support activation** — exercises the reusable CUDA-Algorithms seam using Connect4-owned support-predecessor derivation;
2. **P1-B dense symbolic W/D/L** — exercises the complete Connect4-owned BSFP recurrence directly through public CUDA-JS execution.

The split is normative for this qualification profile because it demonstrates that generic ranked activation and BSFP value/proof evaluation are different ownership concerns.

## Exact dependency identity

Portable qualification is bound to:

```text
CUDA-Algorithms:
  48ee0aec9acae7776950f03ab52ab1737e598b6e
  feature/ranked-closure
  draft PR #8

CUDA-JS:
  98e2ebc942c14d63acf4dd82e912dd548c363a05
  cuda-js@0.1.0-alpha.20

Node qualification profile:
  26.7.0
```

A different dependency revision is a different qualification tuple until independently requalified.

CUDA-JS was not modified for this profile.

## Geometry

```text
columns:     4
rows:        3
connect:     3
cell count:  12
win lines:   14
```

The expected exact empty-root W/D/L result is **Win for player 0**.

## Support-lattice identity

A support item is the column-height vector:

```text
(h0, h1, h2, h3), 0 <= hc <= 3
```

encoded in base 4:

```text
supportIndex = h0 + 4*h1 + 16*h2 + 64*h3
```

Therefore:

```text
item capacity: 4^4 = 256
rank:          h0 + h1 + h2 + h3
rank domain:   0..12
```

The exact numeric support-index encoding is frozen only for this P1 qualification profile. It is not a general BSFP compatibility promise.

## P1-A — ranked support activation

### Consumer derivation

For one source support skeleton at rank `r > 0`, each of four emission lanes corresponds to a column. If that column height is nonzero, the target is the support skeleton with that height decremented by one; otherwise the lane is inactive.

The Connect4 Device-JS leaf therefore has exact logical signature:

```text
(u32 sourceIndex, u32 emissionLane)
  -> u32 targetIndex | 0xffffffff
```

with:

```text
maxEmissionsPerItem = 4
rank(target) = rank(source) - 1
```

For full support item `255 = (3,3,3,3)`, the expected predecessor set is:

```text
[191, 239, 251, 254]
```

### CUDA-Algorithms contract used

P1-A consumes the Working CUDA-Algorithms contract:

```text
CUDA-Algorithms-ranked-derived-activation-u32-working-v0
```

CUDA-Algorithms owns for this profile:

- active source index workset;
- finite emission lanes;
- strict rank-descending validation;
- inactive-lane sentinel interpretation;
- duplicate-idempotent target activation;
- deterministic ascending target compaction;
- device-resident next count/status;
- exact output-capacity truth;
- four-node prepared epoch lifecycle.

Connect4 owns:

- support item meaning;
- column/lane meaning;
- predecessor meaning;
- rank meaning;
- all BSFP W/D/L and proof semantics.

### P1-A native acceptance

Native mode must demonstrate on a real NVIDIA CUDA host:

1. duplicate sources `[255,255]` still produce exactly four targets `[191,239,251,254]`;
2. output capacity `2` reports capacity exhaustion and exact required count `4`, never truncated success;
3. an intentionally corrupted rank table produces rank-descent semantic failure;
4. operation and resource cleanup complete through public CUDA-JS lifecycle.

P1-A does not itself prove the root W/D/L result.

## P1-B — dense symbolic W/D/L

### Purpose

P1-B is an intentionally redundant correctness representation for the complete BSFP recurrence. It is designed to make the first device implementation simple enough to qualify exhaustively, not to scale to standard 7x6.

### Ownership valuation

For the 12-cell geometry, a 12-bit assignment mask represents the owner of each potentially filled cell:

```text
bit 0 -> player 0 owns the cell
bit 1 -> player 1 owns the cell
```

Only bits corresponding to cells filled by the selected support skeleton are semantically material. A legal placement overwrites the landing cell's assignment for the mover before the child table lookup.

### Dense table

```text
support skeletons:       256
ownership assignments:   2^12 = 4,096
table entries:           256 * 4,096 = 1,048,576
entry type:               u32
table bytes:              4,194,304 (4 MiB)
```

Encoded W/D/L from player-0 perspective:

```text
Loss -> 0
Draw -> 1
Win  -> 2
```

The encoding is physical profile identity; C4-0008 semantic W/D/L remains the authority.

### Rank program

The device program has one rank kernel instantiated in a fixed prepared DAG for:

```text
12 -> 11 -> ... -> 1 -> 0
```

Total prepared nodes:

```text
13
```

Each node evaluates only table entries whose support rank equals its fixed rank. It reads only already-finalized rank+1 entries for nonterminal continuations.

No Node readback or host decision occurs between ranks.

### Exact recurrence

For every legal column at a support/assignment pair:

1. derive the gravity-supported landing cell;
2. test whether the mover completes one of the 14 geometric connect-3 lines through that landing cell;
3. if terminal, use the mover's exact W/D/L terminal value;
4. otherwise read the already-finalized child support/assignment value;
5. combine legal move values using player-0 maximum or player-1 minimum.

Conceptually:

```text
P0 rank: max(moveValue...)
P1 rank: min(moveValue...)
```

This is C4-0008's bottom-up symbolic choice composition, not recursive minimax search.

A full support with no legal continuation and no earlier terminal win evaluates as Draw.

### P1-B Node boundary

Node may:

- construct/freeze host-known profile tables;
- allocate/bind device views;
- compile/prepare the fixed program;
- submit one prepared operation;
- await/observe operation completion administratively;
- read the completed table after semantic completion for qualification;
- close resources.

Node may not:

- choose the next rank;
- inspect an intermediate rank to decide progression;
- perform W/D/L reduction between kernels;
- replace a failed/incomplete operation with a result.

## Portable qualification

Reference semantics are independently qualified for all reachable nonterminal 4x3 connect-3 states:

```text
states:     4,631
legal edges:11,818
mismatches: 0
root:       Win
```

Final exact portable Connect4 tuple:

```text
Connect4:       d39322a1a66585114a35558f910a5582c0fc05e2
CUDA-Algorithms:48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS:        98e2ebc942c14d63acf4dd82e912dd548c363a05
```

Passing workflow evidence:

```text
verify:             34438946185
benchmark-evidence: 34438946186
strength-evidence:  34438946188
bsfp-portable:      34438946196
```

Portable qualification proves parser/type/compile/link/prepared-DAG/submission/lifecycle compatibility. It does **not** prove native numerical CUDA execution.

## P1-B native acceptance

On a real NVIDIA host, after the complete 13-rank operation finishes, the table must be compared with an independent explicit physical-state oracle.

Required exact outcome:

```text
root:                    Win
nonterminal states:      4,631
legal edges traversed:   11,818
W/D/L mismatches:        0
```

The evidence record must also freeze:

- Connect4 commit;
- CUDA-Algorithms commit used by P1-A;
- CUDA-JS commit/package;
- Node version;
- OS/architecture;
- GPU model and compute capability where available;
- CUDA driver/runtime/provider identity;
- operation terminal state;
- cleanup result.

## Physical failure truth

The profile is not accepted if:

- compilation or linking falls outside public CUDA-JS contracts;
- any prepared rank node fails;
- native root W/D/L differs from Win;
- any of the 4,631 states differs from the independent oracle;
- rank activation silently accepts a non-descending target;
- capacity pressure truncates work while reporting success;
- cleanup failure is suppressed;
- Node performs mathematical progression between rank kernels.

## Universality / routing rule

P1-B's W/D/L recurrence is **not** a candidate CUDA-Algorithms feature; it is Connect4/BSFP semantics.

P1-A's ranked activation is in CUDA-Algorithms only because its public meaning remains coherent for materially different consumers such as implicit dependency DAGs and staged data lineage.

Future mechanisms follow the same gate:

```text
Connect4/BSFP-specific proof/value/domain fact -> Connect4
reusable provider-neutral algorithm fact       -> CUDA-Algorithms, only after deletion/multi-consumer evidence
generic compiler/runtime/memory mechanism      -> CUDA-JS, only after demonstrated need
```

## Supersession and evolution

This P1 profile may be retired after a more compact representation has equivalent or stronger qualification. Retiring the dense representation does not retire C4-0008 BSFP semantics.

A later WSL/NDC/CPC/antichain profile should preserve the same exact W/D/L recurrence while replacing the deliberately redundant ownership table with compact proof/state structure.

## Non-claims

P1 does not claim:

- native NVIDIA numerical qualification yet;
- GPU performance superiority;
- standard-7x6 scalability;
- empty-board standard-7x6 solution;
- exact distance-to-win/loss;
- that 4 MiB dense ownership state is a production representation;
- that CUDA-Algorithms supports arbitrary consumer record/context callbacks;
- that SPEC-0004 or C4-0006..0009 are Accepted authority.
