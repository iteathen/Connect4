# CPCX prior-research review: UC4A, semantic quotient, and IsoGraph control equivalence

**Date:** 2026-10-02  
**CPCX branch:** `experiment/cpcx-20261002`  
**Review purpose:** identify prior structural machinery relevant to the standard-7x6 `44444` ply-6 proof before extending CPCX with new proof mechanisms.

## Provenance boundary

A current standalone repository named `iteathen/UC4A` is not present in the accessible owner repository set and does not resolve through the GitHub repository API. The surviving UC4A lineage is preserved inside `iteathen/Connect4`.

The explicit research publication is:

- branch: `research/nim-control-parity-algebra-20260929`
- file: `research/publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_1.md`
- blob: `4ff0a22fe4403fec2b6423f3d88af3b321d13267`
- title: **C = NC? Control-Parity Algebra, Branch Collapse, and a Structural Research Program for Generalized Connect Four**
- companion hypothesis: `research/hypotheses/NIM_LIKE_CONTROL_PARITY_ALGEBRA.md`, blob `13599092c61ad5324132ace640dbab5c4eae88a8`
- current branch head observed during this review: `4bfe1c6507c6b2edd93bbd1dabd74b0efe5343f7`

The later UC4A tomography line is preserved on:

- branch: `research/universal-structural-policy-20260930`
- checkpoint commit: `ad07562a89112870e3aaef9cc261e8e5f840723e`
- commit title: `research: freeze UC4A tomography structural atlas`

No solved/oracle result from these older lines is imported as a CPCX proof premise.

---

## 1. Relevant UC4A ideas already exist

### 1.1 Latent control state, not literal board state

The C=NC? paper explicitly proposes a latent control representation

`X(s)=F(G(s),R(s),P(s),O(s),D(s),...)`

where geometry, residual obligations, support/control parity, guarded obligations/resources, and first-win deadlines are the load-bearing ingredients.

The strongest relevant bounded observation is the exact common-boundary collapse of the odd center prefixes `4`, `444`, and `44444`: under the declared rule-only response policy, different literal histories converge to the identical 2,108-state unresolved boundary. The paper correctly limits this to that policy/boundary and does **not** claim global state equality.

### 1.2 Typed control/debt state

The closest UC4A predecessor to the present CPCX control-state idea is:

- `research/isograph/discovery/2026-09-30-universal-structural-policy/PARITY_DEBT_CONTROL_TRANSFER_HYPOTHESIS.md`
- blob: `9977ffabfcd436b979e8c56473105dcc445e398b`

It proposes a finite state

`Q=(q, Gamma, delta)`

with:

- `q`: exact CPC/RBA semantic state or a separately proved congruent quotient;
- `Gamma`: current response-resource/guard relation;
- `delta`: unmatched response debt.

Its falsifiers are already the right congruence obligations: equal descriptors may not differ in legal response set, terminal precedence, CPC restriction output, guard reconstruction, response-resource availability, residual/winning-line attachment, or exact successor descriptor.

### 1.3 Claim-relative quotienting already exists

Two explicit predecessor theorems:

- `CPC_GRAY_TOKEN_GUARD_QUOTIENT_THEOREM.md`, blob `60bd5a667286937ff2e449df7b79fee75a8f85d8`
- `CPC_NEUTRAL_TOKEN_GUARD_QUOTIENT_THEOREM.md`, blob `d178fd0093514e56b06e3a3139fdfcabf5540542`

erase ownership only after an occupied cell can no longer belong to any still-live winning line. Occupancy/support/gravity remain exact. The quotient is explicitly proof-state identity, not unrestricted board identity.

This is a direct precedent for CPCX: erase a physical distinction only after proving that it cannot affect the declared proof observation.

### 1.4 Control restoration / debt transport already exists as a local pattern

Relevant exact/candidate local rules include:

- `CPC_TOP_EXHAUSTION_PHASE_DEBT_BLOCKER_REPAIR_THEOREM.md`, blob `8ae9ffea43e55433ad5cea5b284b4fdaacee0b53`
- `CPC_THREE_COLUMN_PHASE_TRANSFER_WIN_THEOREM.md`, blob `be8577f53f3b2758f1ac75f7f6bb783fb88c14be`

The top-exhaustion theorem permits an off-pair repair only when it is current, residual-attached, guard-preserving, and first-win safe. The qualified three-column theorem transports phase through a finite reservoir and explicitly refuses to equate states merely because they share a support vector.

---

## 2. Older Connect4 semantic-quotient work already states the congruence criterion

The most direct predecessor is not a new CPCX mechanism at all. It is the semantic-quotient line on:

- branch: `research/semantic-quotient`
- observed review head: `77701467d269be45f480d4e9a8b390d644faf064`

### 2.1 Exact action-labelled behavioral equivalence

`docs/research/2026-09-10-minimum-description-semantic-quotient.md`  
blob: `eca2ac2a322126b4aa38826defa581b76a89c7e2`

It gives the domain-specific equivalence criterion. If `Q(s)=Q(t)`, then the quotient must preserve/derive:

1. side to move;
2. rank if the consumer needs it;
3. legal action set;
4. immediate terminal/winner meaning for every legal action;
5. for every nonterminal action, child quotient equality.

This is explicitly described as close to action-labelled bisimulation / Myhill-Nerode future equivalence. W/D/L agreement, sampled score agreement, or hash agreement alone are rejected as insufficient.

For CPCX, this criterion should be weakened only by the **declared observation scope**, not by dropping first-win-relevant structure.

### 2.2 Standard-7x6 q_o congruence is already qualified

The later authority record resolves an important question that the earlier semantic-quotient notes still treated as a candidate:

- `research/isograph/discovery/2026-09-18-high-value-leads/STANDARD_7X6_Q_CONGRUENCE.md`
- blob: `4d72c6984380bfee2c74345062a1849ebbd514db`
- `research/isograph/qualification/Q_CONGRUENCE_FINAL_QUALIFICATION_0_2.md`
- blob: `f96ce5a28fb41cee8fde82eb8b7b58393acb16ba`
- independent review: `research/isograph/qualification/Q_CONGRUENCE_INDEPENDENT_REVIEW_0_1.md`, blob `552881337d8e013317524558a7c33d4bfc645502`

Qualified standard-7x6 theorem:

`q_o(s)=q_o(t)`

for legal nonterminal states implies the same complete **orientation-sensitive literal-action-labelled ordinary future game**, including legal columns, terminal token for every action, successor `q_o`, W/D/L, fixed-tie distance value, and per-column action values.

The qualification also keeps the scope boundary explicit: q equality does **not** imply physical/history identity or non-q CPC/CPCX proof identity.

This theorem means ordinary future-game equivalence does not need to be reproved inside CPCX. CPCX only needs a rule-only witness that the relevant child carriers are equal or transition-isomorphic under an action transporter.

### 2.3 Residual-q column orbits already motivate branch-local transporters

`research/isograph/discovery/2026-09-29-center-proof-cycle/RESIDUAL_Q_COLUMN_ORBIT_RESULT.md`  
blob: `1cac653892b6cbda4ce2e1c1b9057197be4ace87`

On the exhaustive 4x4 control, every residual-q global column-permutation orbit lay inside one recursive action-unlabelled behavior class, but the static orbit quotient remained finer than the recursive quotient.

The result explicitly identifies the remaining gap as a **local action-transporter system / bisimulation**: one node may match its actions using one correspondence while successor nodes use different correspondences.

This is the closest prior structural model for the present ply-6 question.

### 2.4 MQ2: the exact future-behavior quotient exists on bounded controls

`docs/research/2026-09-11-semantic-quotient-mq2-behavioral-partition.md`  
blob: `ce1aca32ba0fdce6a7d896f34aeb44d56d978bef`

MQ2 defines the coarsest deterministic behavior class by the complete labeled continuation:

`column -> illegal | immediate-terminal-score | child-behavior-class`.

This establishes the correct theoretical target but is an offline whole-graph construction, not an admissible CPCX runtime method.

### 2.5 MQ3/MQ4: a forward-constructible semantic state already exists on bounded controls

`docs/research/2026-09-11-semantic-quotient-mq3-residual-sufficiency.md`

Candidate state:

`support + minimal P0 residual antichain + minimal P1 residual antichain`.

Important falsifier: residuals **without support** were insufficient on every complete control. Gravity/accessibility is load-bearing.

`docs/research/2026-09-11-semantic-quotient-mq4-residual-automaton.md`  
blob: `a1a800c8f03fabad6c60fc4771ed548f478ed042`

MQ4 generates the residual automaton forward using only that state and its local cofactor law. On complete bounded controls it had zero mismatches in reachable semantic states, strong state/action scores, and flat transition replay.

This is the clearest existing evidence that a physical Connect Four board can be reduced to a smaller forward semantic state. It is **not** a standard-7x6 theorem.

### 2.6 Identified-line quotient supplies a direct bisimulation proof pattern

- `docs/research/2026-09-10-identified-winline-quotient.md`, blob `977f00253ee6f0cbd5384da3fa0a9525cead2070`
- `docs/research/2026-09-10-identified-winline-quotient-exact-results.md`, blob `81a3d859ba76d02e110fbdea43ebc4d4fce0f140`

At fixed support, `(support,H0,H1)` has the same legal actions, local line-hit transition, and terminal observations for equivalent states. Complete small controls showed zero transition/WDL mismatches.

The important negative result is equally relevant: a correct quotient can still be the wrong architecture if materialized extensionally. The 5x5 flat quotient exceeded eight million states. The conclusion was to prefer a symbolic/factored quotient rather than enumerate the quotient graph.

---

## 3. IsoGraph already has the appropriate formalism

Current IsoGraph `main` head observed in this review:

`f3217af9a4fd50e838db39e249e93f39380e0e4a`

Current authority manifest:

- `qualification/QUALIFIED_MODULES_2026-09-29_CORE_0_21.md`
- blob: `682a0a0b17082188bf5df4595cad929e9d01d734`

The integrated qualified stack includes Core through 0.21, QU 0.1, NEI 0.4, DP 0.1-0.10, and DTS 0.1.

### 3.1 DTS Transition Isomorph is the closest formal concept

- `extensions/dts/DETAILED_TRANSITION_SYSTEM_0_1_CANDIDATE.md`
- blob: `04170c1faa26ca8b76e211a0491ce76e358d111b`
- qualification: `qualification/DTS_0_1_QUALIFICATION.md`, blob `8e57e28649425d9c737dafc4e1d335836f991e50`

DTS defines a scoped Transition Isomorph:

`TI_C(TA,TB)`

under a pinned comparison/view authority `C`.

A valid TI must specify:

- load-bearing regions;
- projected/irrelevant regions **with authority**;
- a structural mapping/witness for every load-bearing role;
- residual structure;
- QU correspondence when load-bearing;
- decomposition/factorization authority when load-bearing.

Normative DTS barriers already say:

- same source/target endpoints != same transition != TI;
- TI != same action/mechanism/rule/decomposition;
- role-factorization similarity does not prove an invariant.

The deterministic helper `tools/dts/dts-base.mjs`, blob `f490b021a8e3c920a6dad3a4dabe958269052e69`, mechanically rejects “same endpoints” without a witness and rejects omission of a load-bearing role without QU/irrelevance authority.

### 3.2 DP 0.9 gives the correct rule for choosing a control descriptor

- `extensions/discovery/DISCOVERY_PROTOCOLS_0_9_MINIMUM_SUFFICIENT_SUPPORT_VALUATION_CANDIDATE.md`
- qualified revision recorded in the current manifest
- qualification review: `qualification/DISCOVERY_PROTOCOLS_0_1_TO_0_10_QUALIFICATION_REVIEW.md`, blob `f021b394e1ab479ef41fd896da601e61c6b420ca`
- Experiment 053: `experiments/053/EXPERIMENT_053_FINAL_QUALIFICATION_REVIEW.md`, blob `9786cdc1611d9a5d603a9c5eca283333d30d9608`, 20/20 PASS.

DP 0.9 says sufficiency is **objective-scoped**. Before projecting information away, pin:

- target conclusion/observable;
- required certificate/witness;
- admissible inputs and scope;
- QU/DTS obligations;
- invariants;
- allowed substitutions.

Key rule:

`same endpoint != same sufficient transition support`.

A detail may be projected only under an explicit view proving that the target obligation is preserved.

### 3.3 NEI supplies the scoped-quotient guardrail

- `extensions/nei/NATURAL_ENTROPIC_IDENTITY_SPEC_0_4_CANDIDATE.md`
- blob: `2b00d7a60dd3f1c94b3d31cdcc7022fe0728cc04`

Its qualified scoped-quotient discipline is:

`Q_S(a)=Q_S(b)`

establishes only the relation owned by scope `S`.

Therefore a CPCX control quotient should mean:

> equivalent for this first-win proof obligation under this pinned view

not:

> physically/naturally the same Connect Four state.

### 3.4 Core 0.21 removes the need to materialize a recursive game graph

Core 0.21 Schema Closure permits an exact closed transition/generator schema without exhaustive materialization, provided:

- all-and-only generation coverage is proved;
- every load-bearing component is closed;
- termination is separately established;
- unknowns are preserved rather than erased.

Thus a recurrent CPCX control class may be proved by a closed finite/decreasing schema without legal-reply-tree enumeration.

---

## 4. The closest existing result to “control-state equivalence”

The strongest combined formulation already exists in pieces:

1. Connect4 semantic quotient: action-labelled future congruence.
2. UC4A/Isometric: claim-relative theorem/transform reuse.
3. DTS: view-scoped Transition Isomorph with explicit mappings/residuals.
4. DP 0.9: minimum sufficient support for one objective.
5. NEI: scoped quotient is not global identity.
6. Core 0.21: closed transition schema is enough; extensional enumeration is not required.

The especially direct Isometric statement is:

- `research/hypotheses/BSFP_ISOMETRIC_INVARIANT_TRANSFER.md`
- blob: `3ed580a7f61dfd6bf1494a34867c2c40e36599f5`

Section D1:

> same load-bearing dependency cone for observation O -> reuse the theorem/transform for O

without asserting full state equality.

It explicitly recommends **operation-specific dense IDs, not one universal state quotient**, and gives the falsifier:

> two instances assigned one operation signature but requiring different outputs for the declared observation.

That is the conceptual shortcut CPCX should use.

---

## 5. What can be imported directly

Directly reusable proof discipline:

- DTS pinned-view TI record shape;
- semantic-quotient transition-congruence obligations;
- DP 0.9 objective-scoped sufficiency;
- NEI scoped-quotient boundary;
- Core 0.21 closed-schema / no-materialization discipline;
- exact residual cofactor transition law;
- neutral/gray ownership irrelevance when proved monotone;
- claim-relative theorem/transform reuse instead of full state merging;
- exact reflection as an unconditional automorphism.

No solver W/D/L artifact is needed for any of these imports.

---

## 6. What needs Connect Four / CPCX specialization

A CPCX first-win view must define its load-bearing roles explicitly. At minimum, candidate roles are:

- mover/attacker role;
- legal frontier/accessibility for admitted structural events;
- live residual requirements with enough line/attachment ancestry for the theorem;
- support/release depth and deadline relations;
- current CPCX response restrictions / capacity;
- guard/resource/debt state when used;
- immediate opponent counterterminal set;
- first-terminal precedence;
- terminal observation `CERTIFIED_FIRST_WIN(player)`;
- residual information intentionally projected out, with a proof of irrelevance to this certificate.

The event mapping need not map physical columns identically. It must map the **structural events used by the certificate** and preserve the corresponding child control class.

---

## 7. Old falsifiers that must remain active

Do not repeat these earlier mistakes:

1. **W/D/L or score equality is not transition equivalence.**
2. **Support equality is not semantic equality.** The qualified three-column phase theorem preserved separate same-support orientations until exact RBA equality was independently proved.
3. **Residuals without support are insufficient.** MQ3 falsified this on every bounded control.
4. **Static low-dimensional signatures can overfit.** UC4A’s first board-outcome triples were falsified by fresh geometries; a fourth pre-frozen coordinate repaired the sample but remained descriptive only.
5. **Same endpoints do not prove TI.** DTS qualification has an explicit negative control.
6. **A claim-relative reuse key must not become full state identity.** This is an explicit Isometric falsifier.
7. **GF(2) span is not positive residual semantics.** The Nim/control work and Isometric transfer notes preserve this distinction.
8. **A correct quotient can still be a bad architecture when materialized.** The 5x5 flat identified-line quotient exploded.
9. **Generic response search is not a structural theorem.** UC4A’s response/certificate work repeatedly stops when a proposed repair becomes unrestricted legal-move choice.
10. **Proof-state equality != semantic-state equality.** `ISOMETRIC_BSFP_DUAL_CLOSURE.md` states this explicitly.

---

## 8. Reformulation of the ply-6 problem

The current question should **not** be reformulated as:

> prove the seven physical children are globally the same state.

Nor should CPCX immediately attempt seven independent whole proofs.

The existing formalism supports this narrower target:

> Under a pinned first-win control view `C_FW`, determine whether the theorem-defined transition/proof obligations generated by the seven sixth actions are Transition-Isomorphic or fall into a small number of TI classes.

For positions/transitions `A,B`, a useful relation is:

`A ~=_FW B`

only when a witness establishes correspondence for every first-win-load-bearing role and every admitted CPCX transition used by the proof.

Then a certificate may be transported by representative **without** asserting full board identity or equal remoteness.

This is closer to the existing Isometric D1 principle than to a universal state quotient.

The current exact reflection classes remain valid positive instances. The next target is to test whether non-reflected representative response classes share a claim-relative dependency cone after deterministic wing normalization.

---

## 9. Smallest missing lemma

The archaeology separates two questions that should not be conflated.

### 9.1 First missing lemma for **move-6 game-value equivalence**

Because standard-7x6 `q_o` future-behavior congruence is already qualified, the smallest missing lemma is a **finite branch-local q_o action-transporter witness** between the remaining move-6 classes.

A sufficient one-layer form is:

> There is a bijection between the current legal actions of states `A` and `B`; matched actions have the same first-terminal observation; and every matched nonterminal child pair is related by an exact complete-`q_o` column transporter.

Then qualified q_o congruence closes the entire future below each matched child. The current node is therefore ordinary future-game/value equivalent without recursively traversing the future game.

This is exactly the branch-local transporter pattern anticipated by the bounded residual-q column-orbit work.

### 9.2 Separate missing lemma for **CPCX certificate reuse**

Only after ordinary value-equivalence classes are established do we need a broader CPCX first-win certificate-transport TI if we want to reuse one proof artifact across states whose non-q proof context differs.

That later lemma must map every first-win-load-bearing CPCX role and preserve projected residual/guard/debt/first-terminal obligations. It must not be used merely to prove the game values equal when q_o transport already supplies that theorem.

## Consequence for current CPCX work

Pause further widening of reservoir/RCIC response grammars.

Next work should:

1. test the four current `44444` reflection representatives for a finite branch-local `q_o` action-transporter witness;
2. use the qualified q_o theorem as the ordinary future-game closure below transported children;
3. merge only classes with a complete verified witness;
4. if all seven sixth-action children collapse, prove one representative `CERTIFIED_FIRST_WIN(P0)`;
5. only if proof artifacts themselves need transport, introduce the broader CPCX first-win TI;
6. preserve same-support/non-equivalent and first-win-stopping falsifiers.

This imports the qualified q-congruence/UC4A/IsoGraph machinery instead of inventing another bespoke move-6 proof chain.
