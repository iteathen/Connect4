# Solved-database structural discovery: owner-labelled residual enabling

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro
**Formalization / implementation / qualification:** OpenAI ChatGPT / authorized project agent

## Finding and disposition

The concrete remaining seam is **guarded creation of response obligations from higher-degree, owner-labelled residuals**. Current playable singleton/fork capacity is not a value-complete observation, even when strengthened with every legal current-player event's effect on all residuals of size at most two. A six-ply counterexample has the same such observation but database values draw versus P0 win. The first distinction appears on the next owner's event.

This is not a counterexample to C4-0010 exact `support + R0 + R1`, the full domain-wall normal form, the guarded Hall theorem, or the affine/clause calculus. The omitted information already exists in their residual/ownership objects. What remains unproved is a small certificate-generation/guard-closure law that turns this information into the exact value without expanding the move tree.

Execution stops at the requested **minimal unresolved collision** boundary, not at a claimed general value theorem. Both-owner conditional event derivatives separate all sampled positions, but do not compress this sample at all. Calling that a discovered compact winning selector would be misleading.

## Source and authority boundary

Assessed branch base: `10123b6fc41ef92d331b22b4d27a71a9887571ea`, after the fork-precursor intersection/macro-merge work. Read account-global engineering guidance, local routing, current state, C4-0001/0006/0007/0010 and the September 14 static, potential/domain-wall, affine/clause, Hall, pure-followup and fork notes before implementation. C4-0006/0007 remain Candidate; the accepted research consumer does not promote them.

External oracle: Markus Böck, **Connect4 7 x 6 Strong Solution**, Zenodo v1, [DOI 10.5281/zenodo.14582823](https://zenodo.org/records/14582823), published January 18, 2025. This is the previously downloaded dataset, not a new solver. The archive MD5 is `59750231c1131ee352a8bda03f231aea`. The previous extraction record verifies all 102 extracted files by size and CRC32 against that checksum-verified archive. The archive was deleted only after verification. This execution preserves the extracted dataset.

Consumed source files:

- `bdd_w7_h6_<rank>_win.10.bin` and `..._loss.10.bin`, ranks 0–9;
- `openingbook_w7_h6_d8.csv`, for a separate score-sign comparison;
- the archive's `src/connect4/probe/{board,probing,read,openingbook}.c`, to interpret the format. No native source was copied into maintained Connect4 code.

The generated evidence records exact byte counts and SHA256 of every consumed BDD and the opening book. Source identity is the archive release plus those hashes, not the current head of the external repository. Upstream probing implementation: [Connect4-Strong-Solver](https://github.com/markus7800/Connect4-Strong-Solver).

Each BDD node occupies 9 little-endian bytes: variable byte, low uint32, high uint32. Root is the last record; variable-zero records are Boolean terminals. The compressed assignment carries the column sentinel and P0 ownership bits plus the source's side bit. Both win and loss files must load successfully; simultaneous truth is an error. Only a successful query of a reachable nonterminal state with both predicates false is interpreted as draw. Missing opening-book rows are counted as absent and never supply a label.

Only W/D/L and its absolute projection are discovery labels. Book score sign is used for qualification; distance magnitude is not a feature or a theorem premise. The source adapter explicitly rejects other board dimensions. The structural geometry owner accepts initialized variable dimensions; this dataset does not solve those other boards.

## Signature ladder

Cell address is the transparent coordinate `v=c*H+r`; it is not an opaque class ID. Every equality key serializes complete stated content. SHA256 identifies files only. Sample selection is independent of all solved labels.

`R_p` is the exact minimal antichain of positive future-cell requirements for player `p`, after fixed-opponent elimination and fixed-own residualization. All signatures include initialized `(W,H,K)`, ordered support heights and side to move. No future cell is assigned a baseline CPC owner without a certificate.

Let `B` contain:

- support and side;
- **boundary** correction potential at each occupied column top, `q(c,h_c-1) XOR (kappa+h_c-1 mod 2)`; empty tops remain unknown;
- each player's distinct playable singleton cells;
- each player's two-residual fork stars: common currently playable enabling cell with at least two distinct currently playable endpoint cells.

The fork stars are candidate obligation geometry, not automatically certified wins: superseding counter-wins and intervening actions remain guards. The boundary potential is intentionally lossy; it is not the complete gravity-adapted seam/anchor normal form. Static A4 quantities are fixed on this one board and cannot partition its positions. Exact residual spans below test an incidence projection, not a newly asserted position-local A4 barcode.

| Signature | Complete compared content beyond support |
|---|---|
| `exact` | Full ordered `R0,R1`; strongest existing ordinary transition identity |
| `boundaryCapacity` | `B` |
| `degree2` | `B` + both antichains restricted to cardinality ≤2 |
| `degree3` | `B` + both antichains restricted to cardinality ≤3 |
| `span` | `B` + each full residual incidence span in canonical GF(2) reduced basis |
| `degree2Span` | `degree2` + those full GF(2) spans |
| `degree2Jet` | `degree2` + labelled effect of every currently legal mover event on both ≤2 antichains |
| `ownerJet` | `degree2` + those conditional event effects separately for both owners |

`ownerJet` is a conditional descriptor. A nonmoving owner's cofactor is not legal permission to move out of turn. No source label, move-history ID, advisory evaluator, center distance or fitted coefficient enters any signature.

The experiment does not pretend to run a complete NDC strategic closure: no independently certified future affine facts, reserved responses or blocker clauses were available as input for this general corpus. Fixed ownership blocking is consumed exactly by residualization. Inserting speculative facts to make the descriptor look stronger would invalidate the test.

## Corpus and collision results

The generator produces legal, nonterminal states, deduplicates exact physical content before querying and retains a move sequence only for representative reproduction. It is a data-sampling graph, not a solver: no value backups select samples or infer labels.

All states through rank 5 are included. Thereafter each rank uses at most 8,192 evenly spaced states from the exact-content-sorted successors of the preceding selected rank. Total: **30,254 queried states**. Ranks 6–8 are sampled, not exhaustive. No full-root solve was launched.

| Projection | Classes | Mixed W/D/L classes | Mixed decisive/draw | Mixed P0/P1 winner |
|---|---:|---:|---:|---:|
| exact | 30,254 | 0 | 0 | 0 |
| boundaryCapacity | 27,607 | 941 | 513 | 442 |
| degree2 | 30,160 | 44 | 29 | 15 |
| degree3 | 30,254 | 0 | 0 | 0 |
| span | 30,125 | 37 | 23 | 14 |
| degree2Span | 30,253 | 0 | 0 | 0 |
| degree2Jet | 30,247 | 2 | 2 | 0 |
| ownerJet | 30,254 | 0 | 0 | 0 |

A class may mix all three outcomes, so the last two columns need not partition the mixed-class count. No-collision rows are finite observations only. In particular, three rows distinguish every sampled physical state: they supply no evidence of a compact outcome quotient.

### Linear-span falsifier

Zero-based paths `[2,6,6,2]` and `[6,2,6,2]` have the same `span` signature but absolute winner codes `01` and `11`. They have identical support, boundary potential and empty enabled singleton/precursor sets. The full GF(2) spans agree exactly, not merely in dimension.

Thus replacing positive residual incidence by its linear closure can lose **winner orientation**, even with the owner split retained. Five-ply examples in the evidence additionally lose the win bit. This does not invalidate affine ownership equations: an XOR equation and a positive conjunction have different semantics.

### Low-order capacity falsifier

Paths `[6,6,1,6,6]` and `[1,6,6,6,6]` both have support `[0,1,0,0,0,0,4]`, identical boundary potential, and **no** residual of cardinality ≤2 for either player. Nevertheless the source gives `01` and `11`.

This is the first mixed `degree2` rank in the exhaustive early corpus: rank 5. The witness changes two occupied owners while preserving player counts. That is the smallest nonzero physical owner difference at fixed support and counts; it is not a claim that the entire residual difference consists of one independent causal fact.

Adding cubic residual information separates this collision. Adding only current immediate Hall/fork information cannot do so because both obligation families are empty.

### Minimal remaining temporal collision

Use zero-based move columns:

```text
A = [6,6,6,6,2,2]   source 00 (draw)
B = [2,6,6,2,6,6]   source 01 (P0 win)
support = [0,0,2,0,0,0,4], P0 to move.
```

Only `(g,1)` and `(g,2)` differ, using one-based rows: A owns them P0/P1; B owns them P1/P0. All other occupied owners agree. Both ≤2 residual antichains are empty. Boundary potential, singleton and precursor signatures agree.

Every one of the **seven** legal next events gives the same ≤2 observation in A and B. Therefore `degree2Jet` is equal too. Yet the exact source action values, relative to P0, are:

```text
column       a   b   c   d   e   f   g
A           -1  -1  -1   0  -1  -1  -1
B           -1  -1  -1  +1   0  -1  -1
```

The source narrows the proof problem to the same d-column action, whose draw versus winning consequence is not yet derived symbolically.

At two common events, **13 of 49** legal event pairs expose different ≤2 residuals. The first lexicographic example is P0 `a1`, then P1 `d1`. In B, P1's latent requirement `{d1,e1,f1}` becomes `{e1,f1}`; that cubic requirement is absent in A. The common low-order P1 residuals after these events are `{a4,b3}` and `{e2,f3}`, with `{e1,f1}` added only in B. These are exact set differences, not value correlations.

This identifies the omitted distinction: **opposite-owner conditional enabling through an intervening event**. It is already representable by positive residual incidence. Both-owner conditional derivatives separate the pair. They do not, by themselves, explain why the full games have their particular source values. In particular, the extra P1 requirement is not asserted to benefit P1; forcing, response and timing can interact.

Rank 6 is the first mixed `degree2Jet` rank, with no earlier collision in the exhaustive ranks 0–5. The selected witness again has minimum nonzero physical owner difference two. No claim of globally minimum proof/certificate complexity is made.

## Exact relation to retain: guarded positive cofactors

For a legal event `x` owned by `p`, the already-defined WSL transition is

```text
R_p       -> Min { R \ {x} : R in R_p }
R_(1-p)   -> Min { R : R in R_(1-p), x not in R }.
```

`Min` removes duplicates and strict supersets. This is substitution in the positive formula

```text
F_p = OR_(R in R_p) AND_(v in R) [q(v)=p],
```

not XOR addition of incidence vectors. Own substitution deletes one satisfied factor; opponent substitution falsifies every conjunction containing that event. Monotone absorption justifies antichain normalization. This derivation is independent of database values.

For a cubic `R={x,u,v}`, the guarded event consequence is

```text
R remains alive
AND x is playable at the owner's turn
AND no earlier win stops play
AND intervening opponent choices do not block the needed residual
  -> after owner(x), residual {u,v}.
```

If `u,v` are independently enabled and another residual shares the enabling event, this can feed the existing fork/capacity calculus. Otherwise support, discharge sharing and deadlines stay unresolved. An unmet syntactic guard is unknown, not loss.

This supplies a small necessary extension to the one-step current-owner observation: retain **owner-labelled enabling incidence and its intervening-choice guard**. The arithmetic/cofactor rule is exact; a complete low-cost guard-closure/value selector is still an open problem.

## Outcome-quotient interpretation

The source is projected as `00=draw`, `01=P0 win`, `11=P1 win`; `10` is never produced.

- Bulk/boundary capacity loses both decisiveness and orientation.
- Full linear residual span still loses both, so static abelian data alone is insufficient.
- Immediate capacity certificates remain sound on every exercised source instance: 2,436 own immediate wins, 229 double-obligation losses, and 3,093 forced-response value checks passed.
- The counterexamples **do not falsify guarded Hall deficiency as a sufficient certificate**. They falsify completeness of the presently observed local obligation set. No inference that absence of a local deficiency means draw survives.
- They support investigating stopping/response creation, but do not prove every decisive position admits a compact Hall certificate.

The sign bit remains the ownership lift of an actually decisive certificate. A partial frontier lift does not establish which future certificate can be forced.

## Qualification and implementation boundary

Maintained code is Node/JavaScript under `research/semantic-quotient/state-identity-unification/src/`:

- `quotient-solved-bdd-source.mjs`: bounded external BDD format owner;
- `quotient-structural-discovery-signature.mjs`: initialized geometry, exact residual projection, explicit ablations and event cofactors;
- `quotient-connect4-solved-db-structural-collision-audit.mjs`: label-separated corpus grouping and collision diagnostics;
- `quotient-solved-db-independent-control.mjs`: separate row-major replay, Boolean-array assignment and DataView BDD traversal;
- `quotient-structural-discovery.test.mjs`: source failure, algebra, geometry, symmetry and temporal regression controls.

The independent checker imports neither the discovery transition nor its BDD reader. It rechecks **12 distinct representative positions**, with **10,218** rank-8 book comparisons and 1,378 absent rows counted without inference. Those extension counts include repeated positions reached by different diagnostic sequences; they are not a unique-state census. The book and BDDs share source provenance, so this is independent implementation checking, not an independent solution proof.

The discovery run also checks 476 reflected source queries, 476 structural owner-complement cases, reversed line/term enumeration, and positive cofactor agreement with independently rematerialized residuals. Complement checks exchange structural player roles; they do not query an illegal P0-first color-complemented position. Reflection leaves the legal source game unchanged.

Nine new focused tests and the full local **219-test** repository suite passed. The existing guarded affine/clause control passed. Initial pilot qualification caught JavaScript `-0` versus `0` in a strict diagnostic comparison; draw negation now uses `0-value`. This was a harness representation defect, not an engine or database regression.

The existing `pre-alpha-cleanup-qualify.yml` source-path rule includes these files and runs the new `.test.mjs` controls through `node --test`. The external database run is local evidence, not silently claimed as a GitHub CI test. No production engine, evaluator, solver configuration or standard-root revision trigger changed.

## Reproduction and evidence

From the repository root, Node v26.7.0:

```text
node --test research/semantic-quotient/state-identity-unification/src/quotient-structural-discovery.test.mjs
node research/semantic-quotient/state-identity-unification/src/quotient-connect4-solved-db-structural-collision-audit.mjs <solution_w7_h6-directory> <output.json> 8192
node research/semantic-quotient/state-identity-unification/src/quotient-solved-db-independent-control.mjs <solution_w7_h6-directory> <output.json> <independent.json>
node research/semantic-quotient/state-identity-unification/src/quotient-connect4-guarded-affine-clause-control.mjs
node --test
```

The discovery command has a 300-second fail-closed budget. The final run completed in about 92 seconds, including signature qualification and a concurrent repository test run; this is not a performance benchmark. Output contains only summaries and collision representatives. No full state corpus or raw database is committed.

Evidence in `research/semantic-quotient/state-identity-unification/evidence/`:

- `2026-09-14-solved-db-structural-collisions.json` — signatures, exact source hashes, counts, witnesses and action queries;
- `2026-09-14-solved-db-independent-control.json` — separate reader/replay checks;
- `2026-09-14-solved-db-qualification.json` — commands, source-code hashes and qualification disposition.

## Remaining proof plan and stopping point

1. Keep the six-ply A/B pair as the minimal unresolved value discriminator for this pass. Preserve all exact residuals; do not cache strategic facts under `degree2Jet`.
2. Compile cubic enabling records for both owners with explicit support, intervening-choice, response-sharing and first-win guards. Use the existing positive cofactor, not F2 span, to produce their consequences.
3. Share equal guarded consequences across opponent variants. Apply `max` only to guarantees that must survive all variants, and `min` only to controller-selectable certificates proving the same consequence.
4. Derive the d-column draw/win distinction symbolically. Deliberately test every strengthened proposed guard against source collisions before calling it a serious general hypothesis.
5. If closure needs additional resource/deadline state, identify that exact dependency. Do not add an opaque solved-state class or disguise a move-tree backup as the missing structural law.

The full exact semantic identity is preserved. No universal value law, arbitrary-board theorem, completed root proof, or compact complete Hall characterization is claimed by this finite experiment.
