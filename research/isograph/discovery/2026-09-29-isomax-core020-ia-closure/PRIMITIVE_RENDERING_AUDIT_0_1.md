# IsoMax structural-control Core-0.20 primitive rendering audit 0.1

**Status:** candidate primitive-closure audit  
**Research direction:** Joshua Oshiro  
**Campaign:** `2026-09-29-isomax-core020-ia-closure`  
**Native kernel:** `ISOMAX_STRUCTURAL_CONTROL_CORE020_0_1.isg`  
**DP used:** no  
**NEI used:** no  
**DTS used:** no

## Pinned semantic dependencies

The rendering uses the current qualified Core chain through Core 0.20 and QU
0.1. The exact semantic pins are recorded in `SOURCE_MANIFEST_0_1.json`.

Primitive logical role IDs follow IsoGraph's Core-0.20 supporting kernel:

- `^150001` AND
- `^150002` OR
- `^150003` NOT
- `^150004` IMPLIES
- `^150005` IFF
- `^150006` FORALL
- `^150007` EXISTS
- `^150008` EQUAL
- `^150010` ordered predicate application
- `^150013` raw carrier
- `^150014` raw value
- `^150019` definitional expansion
- `^150020` derived view
- `^150022` source provenance
- `^150023` primitive support
- `^150024` raw extensional tuple

The Boolean carrier/value convention follows the already-rendered primitive
Boolean controls:

```text
7400  Boolean carrier
7401  0
7402  1
```

No algebraic law is inherited from the English word "XOR".

## Local semantic IDs

### Carrier roles

```text
196000  binary-continuation node carrier
196001  binary-continuation edge carrier
196002  explicit path carrier
196003  action-slot carrier
196004  labelled-sheet carrier
196005  support-signature carrier
196006  residual-signature carrier
196007  transporter carrier
196008  exact residual-state carrier
196009  board-control carrier
```

These names are audit/navigation labels only. Their native meaning is supplied
by incidences below.

### Defined / extensional relations

```text
196100  Boolean XOR relation
196101  EDGE(edge, from, to, delta, action)
196102  PATH2(path, edge1, edge2)
196103  PATH3(path, edge1, edge2, edge3)
196104  PATH2_PHASE(path, bit)
196105  PATH3_PHASE(path, bit)
196106  TRANSPORT_OBS(path, phase, sign, transporter, action_sequence, final_state)
196107  SHEET_SUPPORT(sheet, support)
196108  RESIDUAL_MEMBER_BIT(subject, player, residual_token, bit)
196109  BINARY_TIE_ALLOWED(bit1, bit2)
196110  XOR_ZERO(bit1, bit2)
196112  PATH_BOARD(path, board)
```

`PATH2_PHASE` and `PATH3_PHASE` are definitionally expanded into edge
incidence plus the four-row XOR relation. They are not opaque graph/cocycle
operators.

### 5x4 obstruction identities

```text
nodes
197000 = source group 3260
197001 = group 1857
197002 = target group 574
197003 = group 3255

edges
197100 = 3260 -> 1857, delta 0, column 1
197101 = 1857 -> 574, delta 0, column 0
197102 = 3260 -> 3255, delta 0, column 0
197103 = 3255 -> 574, delta 1, column 0

paths
197200 = route A = 197100,197101
197201 = route B = 197102,197103

board
197900 = 5x4 Connect-4 control
```

### 4x4 positive witness identities

```text
nodes
197010 = group 24
197011 = group 25
197012 = group 7
197013 = group 2
197014 = group 13
197015 = group 14

route A
197110,197111,197112 = 24 -> 25 -> 7 -> 2
columns 3,0,1
all delta 0

route B
197113,197114,197115 = 24 -> 13 -> 14 -> 2
columns 0,3,1
all delta 0

paths
197210 = route A
197211 = route B

board
197901 = 4x4 Connect-4 control
```

### Action tokens

```text
197300 = canonical action slot / column 0
197301 = canonical action slot / column 1
197302 = canonical action slot / column 2
197303 = canonical action slot / column 3
```

The labels are only raw values. Column arithmetic is not imported.

### Transport/residual witness identities

```text
197400 = source sheet 92634
197401 = source sheet 92670
197402 = route-A final exact residual state
197403 = route-B final exact residual state

197500 = route-A accumulated full transporter [0,1,3,2,4]
197501 = route-B accumulated full transporter [1,0,2,3,4]

197510 = route-A source-frame action sequence [1,2]
197511 = route-B source-frame action sequence [0,2]

197600 = shared source support [2,2,2,3,3]

197700 = residual-mask atom 884736
197701 = residual-mask atom 753664
197800 = player P0 token
```

The mask integers are raw identities here. This packet does not infer their
geometric meaning from their decimal spelling.

## Primitive Boolean support

`196100` is exactly:

```text
0 XOR 0 = 0
0 XOR 1 = 1
1 XOR 0 = 1
1 XOR 1 = 0
```

represented as four raw extension tuples.

No associativity, vector-space law, group law, rank theorem, linear algebra,
cycle-space theorem, or Gaussian elimination is imported by the relation ID.

The finite two- and three-edge path phase relations are recursively unfolded
only far enough for the concrete witnesses in this packet.

## Concrete 5x4 contradiction is primitive-supported

The native kernel contains the Boolean formula saying there do **not** exist
four node bits `a,b,c,d` satisfying simultaneously:

```text
a XOR b = 0
b XOR d = 0
a XOR c = 0
c XOR d = 1
```

This formula is reconstructed only from:

- existential quantification;
- conjunction;
- negation;
- equality;
- the four-row XOR truth table.

Therefore the shortest 5x4 obstruction does not require the high-level terms
"cocycle", "holonomy", "cycle rank", "graph potential", or "GF(2)" as semantic
leaves.

## Concrete 4x4 flat witness is primitive-supported

The kernel separately represents existence of node bits satisfying all six
zero-delta equations along the two explicit 4x4 reconvergent routes.

This supports the local witness only. It does not turn the source aggregate
claim "all measured 4x4/4x5 cycles are flat" into a primitive theorem.

## Binary-tie orientation relation is primitive-supported

The allowed orientation pairs are explicitly:

```text
(0,0)
(1,1)
```

and the kernel definitionally equates that relation with `XOR_ZERO`.

Thus the bounded binary-tie law is represented without treating
"vector space", "subgroup", "kernel", or "parity-check matrix" as primitive
operators.

## Transporter falsifier support

The packet preserves the exact source observation:

```text
route A phase = 0, accumulated permutation sign = 1
route B phase = 1, accumulated permutation sign = 1
```

and assigns distinct raw transporter identities and distinct source-frame
action-sequence identities to the two routes.

The internal permutation semantics are not needed for the exact IA:

```text
same observed sign
+
different observed phase
->
sign alone does not determine phase on this witness.
```

Any stronger theorem about the full symmetric group remains outside this
primitive support unless separately expanded.

## Residual/support witness support

Both source sheets have the same raw support identity `197600`.

The packet separately records differing P0 residual-membership bits for the
two distinguished residual tokens. Therefore support identity alone cannot
encode the complete sheet distinction on this witness.

Likewise the two final exact residual states have a represented difference in
residual membership. The action-unlabelled reconvergence therefore erases an
exact residual distinction at the finer represented layer.

## Core-0.20 derived-view firewall

The following high-level research objects remain derived navigation views and
are not used as primitive IA leaves:

- residual-orbit graph;
- recursive action-labelled / action-unlabelled class;
- deeper continuation phase;
- GF(2) cocycle;
- cycle rank;
- syndrome census;
- global phase potential;
- transporter group;
- vector space / stabilizer;
- polynomial identity space;
- W/D/L value;
- nimber.

Deleting those labels leaves the concrete Boolean witness equations and exact
incidences above reconstructable.

Large finite census numbers from the source workflows are preserved through the
derived-view map and source provenance, but they are not premises for the exact
IA closure unless their required lower semantics are separately represented.

## Syntax / identity audit

The native bytes were checked after commit `6b455e4300fd37404bfdef095ca9c933e2f7b617`:

```text
parenthesis balance  0
bracket balance      0
negative-prefix depth 0
```

No semantic conclusion was generated from the earlier malformed intermediate
bytes.

## Admission boundary

This packet claims primitive closure only for the concrete relations and
witnesses enumerated above plus predecessor Core-0.20 primitives referenced by
the campaign.

It does **not** claim a primitive rendering of every state in the 4x5 or 5x4
carrier. Aggregate census results remain pinned observations/derived views.

That scope narrowing is deliberate and satisfies the Core-0.20 rule that an
exact claim may exclude a non-load-bearing dependency rather than hide it as a
semantic leaf.
