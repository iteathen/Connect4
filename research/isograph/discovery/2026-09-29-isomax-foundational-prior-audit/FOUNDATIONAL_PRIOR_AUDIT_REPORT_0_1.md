# Foundational prior audit — surviving IsoMax cocycle witness

**Status:** foundational audit complete; old local-edge mechanism search closed  
**Research direction:** Joshua Oshiro  
**Discovery base:** `3b2b0945bce7e9b21fb87ceaedc80505235f6004`

## Result

The audit reproduces the graph mathematics but falsifies the stronger interpretation previously attached to it.

**Confirmed:** the repaired 5×4 representation graph has a non-exact Z2 edge cochain and one directed opposite-parity 3+3 reconvergence.

**Not supported:** that this is an intrinsic contradiction between distinct literal future-behavior states of Connect Four.

The two routes do not reconverge as exact states, arbitrary-column residual orbits, or fixed-frame literal futures. They correspond only after a named coarser relation: a global action relabeling, action-unlabelled future, or the stored base quotient.

All six stored two-sheet groups used by the witness have identical complete literal-action futures in their local canonical frames. At literal-future behavior resolution the six binary fibers collapse to one class each, so the witness has no two-sheet carrier at that resolution.

## Prior audit matrix

| Prior / label | Audit result |
|---|---|
| 5×4 board, k=4, row-0-bottom orientation | **PASS** |
| Physical winning-line construction | **PASS:** H=8, V=5, D=4, total=17 |
| Gravity / landing cell | **PASS:** all six transitions replay independently |
| Rank / side to move | **PASS:** rank=sum heights; mover=rank mod 2 |
| Residual ownership / cofactor update | **PASS** |
| Residual antichain normalization | **PASS** |
| Support vectors | **PASS** |
| Frontier blocker | **PASS, narrow logical meaning only** |
| Final-cap parity closure | **PASS, narrow logical meaning only** |
| Remaining-move capacity | **PASS as necessary cardinality bound** |
| Support-release/turn capacity | **PASS on witness:** 56/56 residuals match exhaustive isolated schedules |
| Full-game realizability | **NOT ESTABLISHED** by those closure checks |
| Action-unlabelled recursive set quotient | **PASS as declared coarse relation** |
| “Action-labelled class” = literal future class | **FAIL** |
| Safer label | **recursive canonical-frame action-token class** |
| Canonicalization mechanics | **PASS:** canonical children/canonicalizer sets replay |
| Arbitrary canonicalization = physical board symmetry | **FAIL** |
| Physical 5×4 column automorphisms | **identity + reflection only** |
| Witness nonphysical canonicalizer uses | **10 / 14** |
| Canonical slot = physical column | **FAIL without accumulated transporter** |
| Permutation parity | **PASS:** inversion parity = cycle parity on all 120 permutations |
| Canonical transporter | **PASS as a set; may be nonunique** |
| Transporter composition | **PASS** |
| Sheet 0/1 | **gauge-relative representation labels** |
| Individual edge delta | **gauge-relative** |
| “middle B edge is the flip” | **FALSE as invariant** |
| Route parity difference | **PASS on declared cover; gauge invariant** |
| Path construction | **PASS** |
| Cycle rank | **PASS / graph invariant** |
| 5×4 repaired cycle rank | **542** |
| 4×5 repaired cycle rank | **40** |
| Global Z2 potential on 5×4 representation graph | **does not exist** |
| Global Z2 potential on 4×5 representation graph | **exists** |
| Unique directed opposite-parity reconvergence | **PASS:** source 3483 → target 153 |
| 3+3 minimum witness | **PASS only as representation-graph MSS** |
| “22 nonzero independent obstructions” | **FALSE** |
| Fundamental-basis nonzero count | **basis-dependent:** 22/28/32/35/115 in tested bases |
| Invariant scalar cycle-functional image rank | **1 when non-exact, 0 when exact** |
| Same exact target object | **FALSE** |
| Same arbitrary-column residual orbit | **FALSE** |
| Same fixed-frame literal future | **FALSE** |
| Same future under explicit global action relabeling | **TRUE in audited experimental model** |
| Same action-unlabelled multiset/set future | **TRUE** |
| Stored sheet pair = different literal future behavior | **FALSE for all six witness groups** |
| Unqualified “same object” | **INCOMPLETE / relation must be named** |
| “flat” / “obstructed” | **must be scoped to declared representation cochain** |

## Central representation finding

The audited implementation does:

```
raw child
→ closures
→ arbitrary-column canonicalization
→ canonical child key
→ recursive child class
```

The recursive labelled signature then associates the **parent's local canonical slot** with a child class whose action labels already live in a **separately canonicalized child frame**.

The edge transporter is not composed into that recursive label alignment.

Therefore:

```
stored recursive "action-labelled" class
≠ proved globally aligned literal-action future class
```

The witness itself is the counterexample: stored classes differ while complete literal future trees agree.

## Physical geometry versus abstract canonical frames

Among all 120 column permutations, only identity and horizontal reflection preserve the fixed 5×4 Connect4 winning-line hypergraph.

The witness uses adjacent/interior column swaps as canonicalizers. Every one of the 12 displayed witness states contains at least one residual hyperedge that is not a subset of any fixed-frame physical winning line.

These residuals are not thereby invalid. They are **transported abstract residual hyperedges**. But canonical-frame columns and residual shapes must not be read as fixed physical gravity geometry without accumulated transporter provenance.

## Endpoint identity falsifier

For each start sheet, replay the source-frame action sequences without intermediate canonicalization:

```
Route A: 0,1,1
Route B: 1,0,0
```

Their raw endpoints are:

- exact-state distinct;
- residual-orbit distinct;
- literal-future distinct in one common frame;
- action-unlabelled multiset/set future equivalent;
- literal-future equivalent after at least one explicit global action permutation.

The stored base “reconvergence” is therefore **quotient-relative**, not unqualified endpoint equality.

## Gauge and basis corrections

An independent exact-state sheet gauge moves the only `delta=1` on Route B from edge 2710 to edge 2724. Total odd route difference remains 1.

So:

```
edge carrying delta=1      not invariant
route parity difference    invariant on declared cover
```

Likewise, the same 5×4 carrier yields different counts of nonzero fundamental-basis cycles under different spanning orders:

```
22, 28, 32, 35, 115
```

So:

```
number of nonzero basis cycles  not invariant
non-exactness                   invariant
```

## Transporter-aware witness reconstruction

Using complete literal-action future behavior as the sheet identity:

```
stored two-sheet groups: 6
two-sheet groups remaining: 0
```

Thus the stronger claim

> this witness is a non-exact cocycle on distinct literal future-behavior states

is **falsified**.

The weaker claim survives:

> the canonical-frame action-token representation graph carries a non-exact Z2 cochain / odd relative holonomy.

## NEI and QU

NEI remains **INCOMPLETE** for natural/domain identity of the endpoint objects. Exact representation, physical symmetry, arbitrary action relabeling, future behavior and coarse quotient identity are different relations.

Open QUs now center on:

1. a full transporter-aware behavior carrier;
2. root-to-state physical-frame transporter provenance;
3. whether any nontrivial holonomy survives corrected transport;
4. whether residual/cap-hole motifs survive that corrected carrier.

No probability or preferred realization was introduced.

## Legos

### Hard

- representation-graph non-exactness is real;
- the unique 3+3 graph contradiction is real;
- edge-local flip position is gauge-dependent;
- basis-cycle nonzero count is basis-dependent;
- exact route endpoints do not reconverge;
- fixed-frame literal futures do not reconverge;
- explicit action transport restores future correspondence;
- all six stored sheet pairs collapse at literal-future resolution;
- recursive action-token signatures omit transporter alignment;
- arbitrary canonical slots are not physical column labels;
- closures replay correctly in their narrow stated scopes.

### Soft

- the graph may encode discrete/groupoid holonomy of changing coordinate frames;
- a transporter-aware full carrier may retain a different nontrivial fiber;
- gravity-relative ordering may still matter after corrected transport;
- residual/cap-hole structure may remain useful after physical-frame reconstruction.

### Missing

- transporter-aware recursive action semantics;
- full-carrier transporter-aware future partition;
- root-to-state physical-frame transporter provenance;
- explicit identity authority for arbitrary action relabeling;
- physical-symmetry-only quotient control;
- any qualified bridge from representation holonomy to game value or solver behavior.

## Problem shape

The best-fitting **hypothesis family** is now:

- discrete bundle / groupoid holonomy over a quotient;
- quotient-induced gauge/section obstruction;
- path-dependent coordinate transport;
- hidden state / frame information omitted by quotienting.

An **ordinary intrinsic physical-state non-exact cocycle is not supported by this witness**.

“Noncommuting game transitions” and “gravity causes the obstruction” remain open hypotheses, not findings.

## IsoGraph closure

Foundational audit IA recursion:

```
round 1: 8 new IAs
round 2: 6 new IAs
round 3: 0 assertions / 0 support refinements / 0 QU refinements
```

Status:

```
FOUNDATIONAL_AUDIT_IA_FIXED_POINT
```

DP, DTS, MSS and Experimental Inquiry corrections are frozen in the sibling audit artifacts.

## Final disposition

The old question:

> Why is the middle B edge delta 1?

is closed as ill-posed at invariant resolution.

The next valid research question is:

> Does a nontrivial semantic fiber and non-exact holonomy survive when recursive action labels are aligned through explicit transporters, or when the carrier is built in a fixed / physically restricted frame?

Until that corrected carrier exists:

```
representation-graph non-exactness: CONFIRMED
intrinsic literal-future obstruction: NOT SUPPORTED / WITNESS FALSIFIED
physical-state obstruction: NOT ESTABLISHED
full transporter-aware carrier: QU / OPEN
old middle-edge mechanism search: CLOSED
```

No solver changes follow. No solved W/D/L information was imported into the structural producer.
