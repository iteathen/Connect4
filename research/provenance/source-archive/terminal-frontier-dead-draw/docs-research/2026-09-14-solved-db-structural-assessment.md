# Solved-database structural assessment: mixed owner cofactors and guarded obligation birth

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Scope

This note independently assesses the solved-database discovery work landed in
`docs/research/2026-09-14-solved-db-structural-discovery.md` before extending it.

The database remains validation/falsification evidence only. No solved value below is a premise of a structural theorem.

## Assessment verdict

The landed pass is suitable as finite falsification/discovery evidence with the proof boundaries stated in its note.

The minimal six-ply collision does **not** currently justify a new primitive board-state predicate. The full positive residual antichains already contain the first observed structural distinction. The sharper missing seam is:

```text
exact owner-labelled positive cofactor
+ exact mixed-owner cofactor composition
+ support / turn admissibility
+ opponent-universal intervention guard
+ response/deadline/first-win guards
-> certified lower-order obligation
-> guarded response-capacity / terminal consequence.
```

Classification:

```text
new primitive predicate                 NOT WARRANTED
owner-labelled enabling                 DERIVED CERTIFICATE RELATION
obligation birth                        DERIVED CONSEQUENCE, once temporal guards hold
intervening-choice stability            MISSING GUARD / CERTIFICATE CONDITION
guarded cofactor -> NDC obligation      MISSING COMPOSITION RULE
first-win stopping                      REQUIRED GUARD; Hall deficiency is only a sufficient certificate where proved
winner/sign lift                        downstream of a decisive terminal certificate
```

The primary missing item is therefore a **guarded quantifier-lift composition rule**, with intervening-choice stability as one of its guards. It sharpens the M2/M3 boundary in the side-research missing-axiom register; it does not establish a new primitive coordinate.

## Source/provenance and BDD-reader audit

The discovery note identifies Markus Boeck's published standard 7x6 strong solution, archive MD5
`59750231c1131ee352a8bda03f231aea`, and the source reader/prober used to interpret the database.

Independent source inspection confirmed the material adapter assumptions:

- memory-mapped BDD nodes are 9 bytes: one variable byte plus two little-endian 32-bit child indices;
- the root is the final node record;
- variable-zero records are terminals and use the low child as Boolean terminal value;
- win and loss predicates are loaded separately;
- source probing interprets neither predicate true as draw and simultaneous win/loss as invalid;
- the source `position_key` representation is algebraically equivalent to the adapter's sentinel-plus-P0-stones key, with side-to-move supplied separately.

The independent checker is implementation-independent but **not** solution-provenance-independent: its BDD and opening-book comparisons ultimately come from the same published solution. The opening book therefore checks adapter consistency, not an independently solved truth source.

This assessment did not re-download or re-run the full 46.8 GB solved archive. It inspected the landed qualification/evidence artifacts and executable code, cross-checked the reader against the published solver source, and independently replayed the structural collision without solved labels.

## Corpus-selection and label-leakage audit

The discovery pipeline computes structural descriptors before querying the solved value. The descriptor has no solved-label input. The audit also injects a synthetic `solvedValue` field and verifies canonical signatures ignore it.

The finite corpus is label-independent but not a uniform sample of all states:

```text
ranks <= 5: exhaustive
ranks 6..8: exact-content sorted, evenly spaced cap of 8192 states per retained layer
next layer: successors of the selected preceding layer
```

That is a coverage limitation, not label selection. It must not be promoted to a population-frequency estimate or completeness claim.

Missing opening-book rows are ignored rather than interpreted as draw/loss. The BDD reader returns draw only when the loaded win and loss predicates are both false; absent source data is not mapped to a strategic value.

Collision grouping is performed from canonical structural signatures and only then compared against database labels. The exact-signature and ownerJet no-collision observations therefore remain finite validation, not theorem evidence.

## Recheck of the minimal collision

The documented pair is:

```text
A = [6,6,6,6,2,2]
B = [2,6,6,2,6,6]
```

Both replay to:

```text
support heights = [0,0,2,0,0,0,4]
side to move     = P0
```

An independent structural replay, using only Connect-4 geometry, ownership and minimal positive residual antichains, reproduced:

- equal degree-2 signatures after every one-event P0 continuation;
- exactly 13 differing degree-2 signatures among the 49 common two-event column pairs used by the landed test;
- the first listed witness `P0 a1, P1 d1`;
- after that pair, B has the P1 residual `{e1,f1}` while A does not.

This replay did not consult solved values.

The database evidence says the shared `d` move has different action values in A and B, but the structural replay also shows that the post-`d` states still differ in several higher-order residuals. Therefore the `{e1,f1}` witness is a discriminator, **not** by itself a value proof and not evidence for a new special "cubic-threat" primitive.

## Exact mixed-owner cofactor law

For player `p`, write the positive completion formula

```text
F_p = OR_(R in R_p) AND_(v in R) X_(p,v)
```

with `X_(p,v)` meaning that empty event/cell `v` is eventually owned by `p` in the represented assignment.

The existing positive cofactor transition is ordinary monotone Boolean substitution:

```text
C_(p,x):       X_(p,x) = 1
C_(1-p,y):     X_(p,y) = 0
```

followed by minimal-antichain canonicalization.

For distinct cells `x != y`, Boolean cofactors commute:

```text
C_(1-p,y) C_(p,x) F_p
=
C_(p,x) C_(1-p,y) F_p.
```

Canonical minimal antichains therefore agree after either substitution order because both represent the same monotone Boolean cofactor.

This is the important connection:

```text
owner-labelled cofactor
<-> mixed owner derivative / substitution
<-> latent lower-order residual exposure.
```

The residual algebra itself does not need a temporal-order primitive. Temporal order enters through which substitutions are legally/admissibly realizable before deadlines and before first-win stopping.

## Why owner-labelled enabling is not a new primitive

A useful certificate relation can be defined schematically as

```text
Enable_p(s, x, R ; G)
```

but its content should be derived from existing coordinates:

```text
R is a live positive residual for p
x is in R
an owner-p event at x is certified admissible under support/turn guard G
no earlier terminal stops the line of reasoning
required resources remain available through the certification rank.
```

Its algebraic consequence is already exact:

```text
R -> R \ {x}
```

inside the full antichain cofactor.

What remains unproved is the temporal certificate `G`, not the substitution.

## Obligation birth is not identical to degree drop

A cubic residual contracting to a pair is exact structural information, but a pair is not automatically a defensive obligation. The opponent may be able to occupy one member, consume the relevant response resource, or terminate elsewhere before the candidate becomes forcing.

Therefore define the missing connection conceptually as:

```text
cofactor contraction
+ support enabling
+ completion-before-deadline
+ shared response/resource accounting
+ first-win guard
-> obligation birth.
```

The output obligation may be an enabled singleton, a qualified fork/precursor, a blocker clause, or another already-defined certificate form. No new Boolean consequence type is yet required.

## Intervening-choice stability must quantify consequences, not one residual

A too-strong guard such as

```text
for every opponent event y: y notin R
```

is not the right general law. Positive residuals are an OR-antichain: an opponent may kill one residual while another certified route survives.

The guard must quantify over the **post-cofactor consequence**:

```text
for every admissible opponent intervention y before the deadline,
  the exact substituted antichain either
    (a) still entails the same certified obligation/consequence, or
    (b) reaches an independently certified favorable terminal consequence.
```

Controller alternatives are existential; opponent alternatives are universal. `min`/`max` timing may be used only after those quantifiers are explicit and the C4-0007 certificate semantics justify the aggregation.

This is the missing guarded quantifier lift. It should merge equal consequences in a finite certificate DAG rather than smuggle in a recursive legal-move-tree solve.

## Hall deficiency and first-win stopping

Response-capacity/Hall deficiency remains one-way at the current proof status:

```text
qualified Hall deficiency under exact guards
-> sound forcing/stopping certificate.
```

The converse is not established:

```text
no Hall deficiency
-/-> draw
-/-> no forced win.
```

The solved collision reinforces this boundary. Absence of an immediate current Hall/fork certificate did not determine the database value.

First-win stopping is a separate guard on any otherwise commuting substitution/response process. A decisive certificate must establish that the terminal obligation becomes unavoidable **before** neutral completion or an opposing terminal event.

## Winner/sign lift

Once a decisive terminal line is independently certified, the existing owner/control-potential lift can supply the player/sign bit by anchoring the zero-disagreement line to its certified owner.

No evidence here supports deriving sign from static rank/core data, residual degree, or defect charge alone.

## Relation to the isolated derivative-classification branch

The isolated `research/connect-k-derivative-classification` branch currently sharpens the ledger by asking whether a proposed new axiom is actually a derivative, support/resource/deadline guard, or NDC feedback law. Its newer binary-selector placeholder does not contain a competing solution of this temporal seam.

No merge/cherry-pick is warranted by this assessment. The present result should remain on the primary frontier branch; the side branch can be reconciled later by ownership-aware documentation cleanup if desired.

## Strongest confirmed/falsified statements after assessment

Confirmed structurally:

1. full positive residual incidence already distinguishes the minimal collision;
2. the first low-order distinction is exposed by a mixed owner-labelled cofactor after two events;
3. distinct-cell positive cofactors commute algebraically;
4. therefore the unresolved non-commuting content is in legality/support/resources/deadlines/first-win and quantifier closure, not in a missing one-dimensional linear primitive.

Falsified by the landed finite source evidence:

1. degree-2 residual data as a value-complete signature;
2. current-owner one-step degree-2 derivatives as value-complete;
3. GF(2) span as a replacement for positive residual incidence;
4. absence of immediate Hall/fork pressure as draw evidence.

Not proved:

- degree-3 value completeness;
- ownerJet value completeness or compression usefulness;
- Hall completeness;
- guarded cofactor closure completeness;
- a structural proof of either A/B solved value;
- the standard root value.

## Next bounded proof target

Do **not** add another state coordinate first.

Construct the smallest guarded certificate rule that takes an exact mixed owner cofactor consequence and proves when it becomes an NDC obligation before a deadline:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
=> CertifiedObligation.
```

Apply it first to the A/B shared `d` action. Stop at the first guard that cannot be derived from existing support, blocker, control-potential, response-capacity or deadline coordinates. Only that residue is a candidate for a genuinely new predicate.

## Qualification performed in this assessment

- live primary branch head rechecked before mutation;
- global/local agent authority and C4-0001/0006/0007/0010 re-read;
- September 14 structural notes re-read;
- solved-database note, reader, structural signature builder, collision audit, independent checker, focused tests and qualification artifact inspected;
- published BDD reader/prober/board key source cross-checked;
- published archive metadata/MD5 cross-checked;
- minimal A/B structural replay performed independently of solved labels;
- one-step equality and 13/49 two-step degree-2 divergence reproduced;
- side research branch inspected and deliberately not merged.

No production solver code was modified.