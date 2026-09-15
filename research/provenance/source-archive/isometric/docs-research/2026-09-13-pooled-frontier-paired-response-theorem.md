# Pooled-frontier paired-response theorem

**Date:** 2026-09-13  
**Status:** exact safety theorem + complete bounded qualification; no production solver change  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / self-proving predicate program:** **Josh Oshiro**  
**Formalization, implementation, and qualification:** **OpenAI ChatGPT**

## Purpose

Generalize the previously qualified all-even paired-response certificate into an exact
contingent response policy that preserves resource identity and ordering instead of
reducing safety to static blocker coverage.

This work is the first concrete result in the current guarded
alternative-implication / choice-elimination seam. It does **not** change C4-0010
state identity. It produces a stronger contextual W/D/L bound certificate over exact
`q` states and then uses interval separation to eliminate strictly inferior sibling
alternatives.

Exact enumeration is used only as a bounded qualification/falsification oracle. The
theorem itself is constructive and does not depend on solved values.

## 1. Construction

Let `s` be a nonterminal Connect Four state and let `A` be the side to move. Let the
opponent be defender `D`.

For each column `c` with current filled height `h_c`, define remaining capacity:

```text
m_c = H - h_c
```

When `m_c` is odd, define the currently playable frontier cell:

```text
u_c = (c, h_c)
```

and collect all such cells in the **frontier pool**:

```text
U(s) = { u_c | m_c is odd }
```

After omitting `u_c` in every odd-remainder column, each remaining column suffix has
even length. Partition every such suffix bottom-up into adjacent vertical pairs:

```text
(lower trigger, upper response)
```

Let `D(s)` be the set of all upper response cells.

The theorem guards are:

```text
|U(s)| is even
AND
for every surviving residual winning requirement r of attacker A:
  r intersects D(s)
```

It is sufficient to check the normalized minimal residual antichain because every
surviving non-minimal requirement contains some minimal requirement.

## 2. Defender policy

The defender uses exactly two response forms.

### Vertical response

If attacker `A` plays the lower cell of a declared vertical pair, defender `D`
immediately plays its upper mate.

Gravity makes the upper mate playable immediately after the lower trigger.

### Frontier-pool response

If attacker `A` plays an unconsumed frontier-pool cell `u`, defender `D` plays any
other still-unconsumed frontier-pool cell `u'`.

Every unconsumed pool cell remains currently playable because it was the original
frontier of its column and no cell above it can be played first.

Because the pool cardinality is even before every attacker turn, consuming one pool
cell always leaves another for the response. The attacker and defender pool moves
consume two odd-column frontiers. Both affected columns then expose even-length
suffixes already covered by the declared vertical pairing.

Thus the pool cardinality remains even and the response policy remains legal until
the pool is exhausted.

## 3. Safety proof

Under the policy:

1. an attacker cannot acquire an upper response cell from `D(s)`;
2. an upper response cannot be played before its lower trigger because of gravity;
3. when the attacker plays that lower trigger, the defender immediately occupies the
   upper response;
4. the defender never consumes a lower trigger as a waiting move;
5. frontier-pool responses only consume the deliberately omitted frontier cells;
6. blocked geometric winning lines never reappear.

Every surviving attacker winning line has a residual requirement containing at least
one cell of `D(s)`. Therefore every such line contains a future cell that the attacker
can never own under the policy.

Hence the attacker can never complete a winning line.

The exact consequence is:

```text
PooledFrontierResponse(s)
=> side-to-move cannot force a win
```

In the repository's absolute-P0 interval lattice:

```text
sideToMove = P0  => interval upper <= 0  => [-1,0]
sideToMove = P1  => interval lower >= 0  => [0,+1]
```

An earlier defender win is permitted and only strengthens the claimed no-win result.

## 4. Relationship to the old all-even theorem

The earlier paired-response guard required every remaining column capacity to be even.
That is exactly the special case:

```text
U(s) = empty
```

of the pooled-frontier theorem.

The new theorem therefore strictly generalizes the old theorem by allowing an even
number of odd-remainder columns and treating their currently playable frontier cells
as explicit, globally shared waiting resources.

This is the missing resource-identity correction in constructive form: the odd cells
are not ignored. They are named, kept playable, consumed two at a time, and removed
from the vertical pairing only under an explicit temporal policy.

## 5. Negative controls that exposed the theorem

Two tempting static generalizations were falsified on complete 4x3 connect-3.

### Leave top cells unpaired, coverage only

```text
qualifying states:       562
false no-win claims:     106
smallest counterexample: ply 4
support:                 [1,2,0,1]
exact value:             P0 win
```

### Leave bottom frontier cells unpaired, but omit the even-pool policy guard

```text
qualifying states:       562
false no-win claims:      96
smallest counterexample: ply 5
support:                 [1,2,2,0]
exact value:             P1 win
```

The second falsifier is especially informative. Merely identifying the correct
frontier cells is insufficient. Their response capacity must be represented as an
**even, consumable, currently playable pool**.

## 6. Complete bounded qualification

The theorem was checked on the same seven complete games used by the current C4-0010
cross-game controls.

For every qualifying state two independent controls were applied:

1. compare the theorem's one-sided bound against exact complete-game W/D/L;
2. execute the theorem's explicit contingent policy against **every legal attacker
   choice**, with a deterministic choice of another available pool cell for pool
   responses.

Results:

| Game | Reachable | Old states | Pooled states | New | Old decision | Pooled decision | New decision | Old q | Pooled q | Strict sibling edges old→new | Policy nodes / failures |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3x3 c3 | 694 | 37 | 79 | +42 | 23 | 39 | +16 | 29 | 71 | 6→8 | 177 / 0 |
| 3x4 c3 | 2,715 | 68 | 92 | +24 | 32 | 42 | +10 | 46 | 70 | 12→14 | 214 / 0 |
| 4x3 c3 | 7,157 | 122 | 214 | +92 | 77 | 111 | +34 | 90 | 180 | 36→40 | 524 / 0 |
| 4x4 c3 | 41,750 | 134 | 174 | +40 | 26 | 38 | +12 | 98 | 138 | 114→114 | 422 / 0 |
| 4x4 c4 | 161,029 | 8,620 | 23,932 | +15,312 | 7,890 | 19,272 | +11,382 | 1,808 | 6,865 | 1,680→1,956 | 126,320 / 0 |
| 5x3 c3 | 70,914 | 345 | 1,052 | +707 | 107 | 210 | +103 | 226 | 828 | 292→372 | 3,281 / 0 |
| 5x3 c4 | 158,911 | 1,586 | 15,261 | +13,675 | 1,233 | 12,133 | +10,900 | 89 | 1,689 | 300→300 | 148,323 / 0 |

Totals:

```text
reachable states:                   443,170
nonterminal states:                 353,378

old all-even certificates:           10,912
pooled-frontier certificates:         40,804
new certificates:                     29,892

old genuine-decision certificates:     9,388
pooled genuine-decision certificates: 31,845
new genuine-decision certificates:    22,457

old q classes covered:                 2,386
pooled q classes covered:              9,841
old decision q classes covered:        1,981
pooled decision q classes covered:     6,960

exact W/D/L mismatches:                    0
explicit policy failures:                  0
explicit policy states explored:     279,261
```

The old theorem was a subset of the new theorem in every complete control:

```text
legacy qualifying AND not pooled qualifying = 0
```

## 7. Strict sibling choice elimination

The current W/D/L interval calculus gives an exact implication between **distinct**
sibling alternatives without claiming state equality.

For P0/max parent and children `a,b`:

```text
upper(a) < lower(b)
=> V(a) < V(b)
=> a cannot be W/D/L-perfect
=> eliminate a
```

For P1/min parent:

```text
lower(a) > upper(b)
=> V(a) > V(b)
=> a cannot be W/D/L-perfect
=> eliminate a
```

These strict rules preserve both parent W/D/L and the terminal-line-output search
space because a strictly inferior child cannot occur on a W/D/L-perfect trajectory.

Using only direct tactical intervals plus the response certificate—without recursive
interval propagation—the seven complete controls show:

```text
strict eliminated sibling edges with old theorem:    2,440
strict eliminated sibling edges with pooled theorem: 2,804
incremental strict eliminations:                        364
exact parent-value mismatches after batch removal:        0
```

On the primary 4x3 connect-3 control:

```text
36 -> 40 strict sibling eliminations
```

all four new eliminations occur at P1/min parents, where the stronger P0-no-win child
certificate gives the defender a strictly better alternative.

### Weak equality is different

The value layer may also use non-strict interval separation if it retains a witness.
But equality is **not automatically output-safe**: two tied W/D/L-perfect children can
carry different terminal-line provenance.

Therefore:

```text
strict elimination -> safe for value and perfect-play output
weak/tied elimination -> value-only unless output provenance is separately subsumed
```

This preserves the existing `q + Pi0` output boundary.

## 8. Standard 7x6 shallow boundary

The theorem was also evaluated structurally at the second ply of standard 7x6 without
using any solved value table.

For every P0 first move 1 through 7, every legal P1 reply leaves uncovered P0 residual
requirements under this theorem alone:

```text
opening columns 1,2,3,5,6,7: minimum uncovered residuals = 8
opening column 4:             minimum uncovered residuals = 9
```

No P1 reply at ply 2 is therefore directly certified as P0-no-win by this one theorem.

This is a useful boundary, not a failure of the theorem. It means the standard opening
requires additional blocker/NDC closure or a richer response-resource exchange before
this safety primitive can discharge it.

It also prevents accidental promotion of the bounded result into a claimed 7x6 solve.

## 9. What this teaches about the missing calculus

The most important result is conceptual:

```text
static coverage
  + unnamed spare capacity
is insufficient
```

but:

```text
coverage
  + named currently playable waiting resources
  + exact consumption invariant
  + vertical response order
=> constructive safety policy
```

The frontier pool is a concrete instance of the desired temporal response-capacity
calculus. It converts an apparently troublesome odd-capacity condition into a reusable
resource object whose legality, identity, and depletion are explicit.

This is also an example of proof-obligation compression rather than state compression:
many distinct exact C4-0010 `q` states receive the same theorem-backed one-sided bound.

## 10. Next seam

Do **not** respond by merging the newly covered states.

The next useful generalization is to replace the fully interchangeable frontier pool
with a guarded **response-resource graph**:

```text
attacker trigger / obligation
  -> set of timely playable response resources
  -> compatibility / consumption relation
  -> certified no-win bound
```

The pooled-frontier theorem is the complete-graph/even-cardinality special case of
that richer resource relation.

The next experiment should preserve the exact theorem as a seed and then test the
smallest relaxation:

1. start from exact C4-0010 `q` sibling alternatives;
2. construct the frontier response-resource graph, including vertical forced responses;
3. permit non-universal pool compatibility only when a Hall/deadline/resource proof
   establishes a complete contingent response policy;
4. compile the resulting policy into the same `[-1,0]` / `[0,+1]` interval form;
5. use **strict** interval-separated sibling elimination first;
6. retain the smallest counterexample for every relaxed resource rule;
7. carry `Pi0` whenever a non-strict/tied elimination is considered for output.

Positive P0-win implication still requires a separate well-founded progress theorem.
This result advances the safety side only.

## Reproducer / evidence

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/pooled_frontier_response_control.mjs
```

Machine-readable evidence:

```text
docs/research/evidence/2026-09-13-pooled-frontier-response-control.json
```

## Claim discipline

This theorem does not establish a complete standard 7x6 solve, a complete response
calculus, or any final perfect-play terminal-line set/cardinality. It establishes one
strictly stronger exact safety-certificate family and demonstrates that the resulting
one-sided intervals eliminate additional distinct sibling proof obligations without
changing exact state identity.
