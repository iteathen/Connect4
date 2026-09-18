# Searchless seven-wide opening selection

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Objective

Close the first part of the standard-board semantic-selection gap without solved W/D/L labels or recursive game-tree evaluation.

The target is not to prove that center wins. It is to prove the stronger structural implication needed by any first-player winning theorem:

```text
if P0 can force a win on 7 x even-H Connect-4,
then P0's first move must be the center column.
```

The proof is a static response certificate.

## Elementary response frontier

A first searchless response layer uses only generic vertical claim pairs and bottom Baseinverse pairs.

For empty `W x H`, `K=4`, an explicit compatible construction certifies every geometric P0 winning requirement except the horizontal length-4 groups on one-based odd rows `3,5,7,...`.

Therefore the exact unresolved count for this elementary vocabulary is

```text
R1(W,H)=(W-3)*floor((H-1)/2).
```

For standard `7x6`:

```text
69 geometric groups
61 certified by the elementary response layer
8 unresolved = four row-3 horizontals + four row-5 horizontals.
```

This `61 certified / 8 unresolved` result is the dual of a response-cover theorem. It is **not** the earlier W/D/L-only experiment in which 61 terminal winning lines were observed over tied losing replies.

Executable control:

`research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-elementary-response-cover-control.mjs`

## Higher-rule semantics and an important harness warning

The existing Allis-compatibility PR preserves its v1 failure form and repairs it dynamically in the v3 runner. The v1 descriptor omitted `claims`; issue/PR prose is therefore not a substitute for reading the exact harness revision.

The relevant conservative compatibility semantics remain the qualified Allis §7.4 conditions; the generic v3 predicate is diagnostic where it allows additional combinations.

The original rule definitions make the deadline content explicit:

- Claimeven / Vertical / Baseinverse / Lowinverse / Highinverse / Baseclaim are response-resource guarantees;
- Aftereven and Before establish that one completion occurs before a set of opponent successor events can all be acquired;
- Specialbefore adds a directly playable cross-column response resource.

The NDC translation must therefore retain timing and response-support transfer. A static line mask is insufficient.

## Constructive non-center theorem on width 7

Victor Allis Appendix B records explicit certificates after the three non-center opening classes on the left half of a 7-column board. Reflection covers the right half. The certificate pattern can be reconstructed without hard-coding the `7x6` rule list and extends to every even height.

Let P0 open in left-side column

```text
x in {0,1,2}.
```

P1 replies one column toward the center:

```text
x+1.
```

Define the vertical-response columns

```text
V={x,x+1}
```

and, when `x<=1`, add the secondary pair

```text
{x+4,x+5}.
```

All remaining columns form the Claimeven set `C`.

For every even one-based source row

```text
2,4,...,H-2
```

and every one of the four horizontal length-4 windows, construct one Before certificate:

- in a column in `C`, the source event is the upper cell of a Claimeven pair `(source-1,source)`;
- in a column in `V`, the source event is the lower cell of a Vertical pair `(source,source+1)`.

Add:

- a top Claimeven `(H-1,H)` in every `C` column;
- the bottom Baseinverse `{x+4,x+5}` when `x<=1`.

Reflection gives the certificates for openings `4,5,6` zero-based.

## Why this covers every P0 group

The proof separates by orientation.

### Bottom horizontal groups

A bottom horizontal window either contains P1's reply `x+1`, hence is already blocked, or—only where needed—contains both cells of the secondary Baseinverse pair.

For `x=2`, the reply is the center column and every bottom horizontal contains it, so no secondary Baseinverse is needed.

### Higher horizontal groups

Every four-column window intersects the Claimeven column set `C`.

- An even one-based source row is blocked by the Claimeven side-effect inside its Before certificate.
- The following odd row is the successor set of the corresponding Before source and is therefore blocked by the Before deadline response.
- The top even row is covered by the explicit top Claimevens.

Thus all horizontal groups above the floor are solved.

### Diagonal groups

Along a length-4 diagonal, row parity alternates with column position. For each of the four possible horizontal windows and either starting row parity, at least one one-based even-row cell lies in a `C` column.

That cell is Claimeven-controlled, so every diagonal group contains a certified blocker.

This statement depends only on the width-7 mode pattern and not on the board height.

### Vertical groups

In a `C` column, every vertical length-4 interval contains a Claimeven-controlled even cell.

In a `V` column, the repeated Vertical response pairs on rows `(2,3),(4,5),...` intersect every vertical length-4 interval in a complete response pair. Therefore the opponent cannot acquire the whole vertical group.

## Compatibility

The construction is internally compatible under the conservative rule-combination conditions:

- different non-Before rules use disjoint resources;
- a Before and Claimeven/Baseinverse use disjoint resources;
- overlapping Befores reuse identical response fragments in a shared column rather than partially overlapping them.

The executable control verifies pairwise compatibility and complete group coverage directly for all six non-center openings on every even height from 4 through 24.

No legal continuation tree is generated.

## The theorem

For every even `H>=4`:

```text
P0 non-center opening on 7xH
  -> explicit P1 response certificate
  -> every surviving P0 winning group is blocked
  -> P0 cannot force a win from that opening.
```

Hence

```text
P0 forced win => P0 opens center.
```

On standard `7x6`, this proves the first center event of the canonical critical chain searchlessly. It does **not** use the oracle fact that the empty board is a P0 win; it states a necessary condition on any such win.

Executable control:

`research/semantic-quotient/state-identity-unification/src/quotient-connect4-k4-seven-wide-noncenter-draw-certificate.mjs`

## Relation to the 28 program

Before this result, the target-free canonical 28 bridge selected the center by empty-board symmetry and structural centrality, but game-semantic necessity remained open.

Now the first selection step is a theorem:

```text
any P0 forced-win proof
  -> center opening is necessary.
```

The remaining strong-distance gap begins after that center event:

```text
why does optimal P1 delay select the same-column zero-phase response,
why does that strong-distance selection repeat through the first five events,
and why does the resulting deadline closure attain the maximal-delay terminal envelope?
```

That problem requires deadline-valued CPC/NDC semantics. Static coverage cardinality, minimum blocker sets and cooperative completion horizons have already been falsified as sufficient selectors.

## Proof boundary

- no solved W/D/L premise;
- no optimal-move oracle premise;
- no predefined 28 or 69;
- no recursive legal-move evaluation;
- external Appendix-B certificates were used as provenance/discovery evidence, then replaced by a parameterized construction and independently checked;
- theorem proves center **necessary** for a forced P0 win on `7 x even-H`, not sufficient;
- exact strong distance after center remains open.
