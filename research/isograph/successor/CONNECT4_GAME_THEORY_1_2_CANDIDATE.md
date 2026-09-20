# Connect4 Game-Theory IsoGraph — 1.2 Candidate

**Status:** active successor candidate for Connect4 game-theory semantics  
**Owner:** `research/semantic-quotient`  
**Base historical authority:** Connect4 IsoGraph logic authority 1.1  
**NEI successor dependency:** `iteathen/isograph@485a16cd44299b3e7ec03768791d261a38bc08c8`, NEI 0.4 candidate  
**QU dependency:** qualified QU 0.1 semantics pinned by historical authority 1.1  
**Authority effect:** none until independent qualification/promotion  
**Supersedes for active game-theory interpretation:** the separate applied NEI 0.1 overlay and the stack of post-1.1 RBA/QU/topology overlays  
**Historical evidence retained:** authority 1.1, the old NEI overlay, and all successor RBA/proof discovery artifacts remain immutable provenance/evidence

## 1. Purpose

This is the clean current game-theory representation we would build from scratch knowing the post-1.1 results.

It does not require agents to compose:

```text
authority 1.1
+ NEI overlay
+ q reassessment
+ RBA overlay
+ RBA QU overlay
+ topology placement overlay
+ proof/value overlay
```

Those artifacts become source/provenance evidence.

The active candidate itself contains the current semantic structure and status.

## 2. Layered game model

### L0 — physical/event game

Owned facts:
- finite standard 7x6 gravity board;
- alternating no-pass placement;
- support determines legal landing cell in each non-full column;
- first completed Connect-4 terminates immediately;
- full non-winning board is draw;
- every legal nonterminal move raises occupied-cell rank by one.

### L1 — structural residual state

For each player:
- normalized minimal antichain of nonempty residual winning requirements;
- mover event positively cofactors own residual requirements;
- opponent event deletes blocked residual requirements;
- strict-superset absorption is exact under first-win stopping;
- support/accessibility and resource/deadline/proof facts remain separate where not derivable from residual state.

CPC/control-potential, blocker clauses, NDC obligations and proof resources are structural/proof facts, not automatically coordinates of ordinary future behavior.

### L2 — ordinary behavioral state q_o and reflection orbit q_r

For legal nonterminal standard-7x6 states, define the **orientation-sensitive** ordinary behavioral carrier:

```text
q_o(s) =
    support_o(s)
    + normalized P0 residual antichain_o(s)
    + normalized P1 residual antichain_o(s)
```

Columns retain physical orientation `0..6`. Side to move follows support-rank parity.

The current q-congruence derivation establishes as a **deductive successor candidate**:

```text
q_o(s) = q_o(t)
    ->
same literal legal columns
same terminal token for each literal action
same successor q_o for every nonterminal literal action
    ->
same complete orientation-sensitive action-labelled ordinary future game
```

Horizontal reflection is a second exact transformation. With `r_action(c)=6-c`, define:

```text
q_r(s) = canonical orbit representative of { q_o(s), r(q_o(s)) }
```

`q_r` is the reflection-canonical cache/value quotient used by the current Isometric implementation. Equal `q_r` implies exact future-game correspondence **under the identity-or-reflection action transporter**, not necessarily identical literal column labels.

The proof uses:
1. support-determined legal frontier;
2. q-determined terminal result of one move;
3. exact minimal-antichain cofactor semantics under first-win stopping;
4. deterministic successor q;
5. induction on remaining cells.

This is not yet promoted authority because independent successor qualification remains outstanding.

### L3 — ordinary value dependency

For P0-oriented W/D/L:

```text
-1 < 0 < +1

P0 turn:
    V(q) = max_a Outcome(q,a)

P1 turn:
    V(q) = min_a Outcome(q,a)
```

The legal game graph is rank-well-founded. Global fixed-point machinery is an implementation option, not a primitive requirement of ordinary game value.

### L4 — proof / guarded consequence

Proof/certificate state is finer than q whenever validity depends on facts not derivable from q:

- temporal/deadline facts;
- response resources;
- realizability;
- CPC/NDC premises;
- provenance/dependency cone;
- guard context.

A qualified guarded theorem may shortcut ordinary successor dependencies but does not create a second game semantics.

### L5 — residual-boundary algebra / exact value boundary

Post-1.1 RBA research works over support-conditioned residual fibers.

Current exact/deductive relations include:
- board-fiber residual/cofactor algebra;
- terminal-extended cofactor composition/adjunction;
- four-front partial-WDL carrier;
- Bellman antichain-semiring polynomial;
- local-skyline semiring factorization;
- outer-restriction skyline-width monotonicity;
- projection-subtree dominance pruning;
- block-signature antichain indexing;
- static dominance-tree normalization;
- core-relative product absorption;
- shared-target principal-cover dynamic programming.

RBA publishes exact ordinary-value consequences where its boundary is complete.

RBA value identity is not proof/certificate identity.

### L6 — evaluation policy

Demand-driven IsoMax, supply-driven BSFP and a possible meeting/SUT policy are evaluation schedules over the same ordinary value dependency plus optional proof shortcuts.

Solver names are not game-theory primitives.

## 3. Identity questions: “same what?”

The graph keeps distinct identity questions explicit.

### 3.1 Physical occurrence identity

Two separately occurring positions/events/histories remain distinct physical occurrences unless ordinary represented facts force otherwise.

q equality does not erase occurrence identity.

### 3.2 Physical board-position identity

A colored ownership arrangement is a finer physical state than q.

Two physically different arrangements may have equal q.

### 3.3 Move-history identity

Ordered move histories can differ while reaching states with equal q.

History identity is not ordinary future-behavior identity.

### 3.4 Ordinary future-behavior identity

Two related identity/equivalence questions must stay separate.

#### Orientation-sensitive labeled future behavior

Current successor evidence:

```text
legal nonterminal standard-7x6
+ q_o(s)=q_o(t)
+ first-win semantics
+ exact residual cofactor/normalization laws
    ->
candidate exact literal action-labelled future-behavior coidentity
```

Under NEI 0.4 successor semantics, the query context does not declare `q_o` equality “identity-preserving.” The q-congruence theorem constrains the admissible identity-model family. If independently qualified, every admissible orientation-sensitive future-behavior model merges equal-`q_o` states and the derived result is:

```text
NEI_future_behavior_oriented(s,t) = SAME
```

#### Future behavior up to horizontal reflection

For equal `q_r`, the exact relation is transporter-aware:

```text
orientation agrees: action c <-> c
orientation differs: action c <-> 6-c
```

This is an exact automorphism-orbit equivalence. It preserves scalar ordinary value and the entire future game after coordinate transport, but it is not literal action-label identity.

The independent review is recorded in `research/isograph/qualification/Q_CONGRUENCE_INDEPENDENT_REVIEW_0_1.md`.

### 3.5 Proof/certificate identity

Equal q does **not** imply equal proof/certificate identity.

Proof identity must preserve all validity premises not derivable from q.

### 3.6 Reflection/orbit equivalence

Horizontal reflection is an exact board automorphism with explicit action transporter `c -> 6-c`.

It establishes the orbit quotient `q_r` over orientation-sensitive `q_o`.

It does not mean the two physical occurrences are one physical occurrence, and `q_r` equality does not mean literal column labels coincide. Future-behavior equivalence across the orbit is transporter-aware.

### 3.7 Value equality

Equal exact W/D/L, strong score or action value is a property equality.

It is weaker than complete future-behavior identity.

### 3.8 Evidence artifact/event/lineage identity

Artifact instance, evidence event and evidence lineage remain separate represented quantities.

A single artifact may participate in multiple lineage occurrences.

Unknown evidence independence is a property uncertainty, not NEI identity uncertainty.

## 4. NEI 0.4 integration

NEI appears only after the game-theory facts are represented.

The governing shape is:

```text
identity query context
+ exact game/domain facts
+ exact proof/structural evidence
+ probabilistic identity evidence, if legitimately calibrated
+ QU when unresolved identity-relevant structure exists
    ->
admissible identity models
    ->
derived SAME / DISTINCT / UNKNOWN
```

The graph MUST NOT:
- mark q equality “identity-preserving” as a profile answer tag;
- mark physical difference “identity-separating” merely because representations differ;
- turn an exact scoped quotient into global identity;
- turn missing qualification into semantic UNKNOWN;
- assign a Bayes factor to finite controls without a likelihood model.

## 5. Identity evidence

### Exact evidence

Candidate exact evidence for future-behavior identity:
- q-congruence Lemmas 1-4;
- first-win-aware antichain absorption proof;
- rank induction theorem;
- exact q transition contract;
- independent q collision controls on bounded/current solver tests.

Negative scope evidence:
- physical ownership/history can differ at equal q;
- proof context can differ at equal q;
- terminal-line provenance can differ while ordinary future behavior is unchanged.

### Probabilistic evidence

No calibrated identity Bayes factor is currently authoritative.

The following remain unweighted evidence unless/until a likelihood model exists:
- bounded SIU finite-domain controls;
- deliberate q-collision controls;
- solved-database observations;
- repeated random/adversarial transition checks.

Counts are not automatically Bayes factors.

Evidence lineage/dependence must be represented before probabilistic combination.

## 6. QU placement

QU is used only for genuine unresolved semantic/evidence structure.

### QU-GAME-01 — evidence independence

When cross-lineage statistical independence is unresolved, preserve that property uncertainty explicitly.

It does not imply identity uncertainty.

### QU-GAME-02 — proof/value bridge

The exact relation:

```text
support-local predecessor-closed clause/proof carrier
    -> compact realizability-preserving q/value bound
```

before distributed universal expansion remains an OPEN missing law (C4-R0076).

Known:
- distributed universal proof composition causes the observed rank-35 wall (C4-R0075);
- q/value projection is much smaller;
- several generic reducers were falsified as sufficient.

Unknown:
- the exact compact controllable-predecessor projection preserving realizability/deadlines/resources/first-win semantics.

### QU-GAME-03 — RBA execution/research region

Current RBA-QU-0015 open dimensions:
- canonical/minimal presentation;
- earlier-rank staged cost law;
- adaptive evaluator scaling;
- transformer fusion;
- empty-root compactness;
- proof/value bridge;
- independent replay;
- multi-factor planning;
- representation-independent prunable volume;
- rare-tail prediction;
- hard restricted-image evaluation;
- earlier-support scaling of shared-target cover DP.

These are mostly algorithmic/representation unknowns over an exact value semantics.

They become NEI-relevant only if they can change an identity/evidence conclusion.

## 7. Current theorem/candidate statuses

### Qualified/historical authority retained

Authority 1.1 remains current qualified history until this successor is promoted.

### Deductive successor candidates

- standard-7x6 q future-behavior congruence;
- support-local favorable residual order -> isotone state/fixed-action strong value;
- exact action-value threshold antichain frontiers, contingent on q-congruence qualification.

### Confirmed scoped findings

- distributed universal proof composition causes the rank-35 clause-propagation wall before semantic collapse (C4-R0075).

### Open missing law

- compact realizability-preserving clause-to-q/value controllable predecessor (C4-R0076).

### Current RBA exact/deductive relations

```text
C4-R0077  board-fiber residual/cofactor algebra
C4-R0078  board-fiber ordinary-value invariance (guarded exact)
C4-R0079  terminal-extended cofactor composition
C4-R0080  four-front partial-WDL carrier
C4-R0081  Bellman antichain-semiring lattice polynomial
C4-R0082  local-skyline multiplication factorization
C4-R0085  outer-restriction skyline monotonicity
C4-R0086  projection-tree dominance pruning
C4-R0088  block-signature antichain indexing
C4-R0090  static dominance-tree normalization
C4-R0091  core-relative pre-product absorption
C4-R0092  shared-target principal-cover DP
```

Empirically supported execution checkpoints remain evidence, not promoted universal laws.

## 8. Current RBA execution state

Selected rank26 support:

```text
[3,3,2,0,6,6,6]
target draw16
40 residual shapes
80 transformed bits
```

One rank27 draw15 child is closed; three remain missing:
- `[4,3,2,0,6,6,6]`;
- `[3,3,3,0,6,6,6]`;
- `[3,3,2,1,6,6,6]`.

This is execution state, not semantic identity.

## 9. Solver-method consequence

The game-theory graph supports the orientation-sensitive ordinary relation:

```text
q_o --literal action--> terminal token | q_o'
```

and its reverse value dependency:

```text
V(q_o) <- V(q_o')
```

Implementations may additionally cache scalar value under `q_r`, because horizontal reflection is an exact automorphism. Any exposed action/move label must retain or reconstruct the transporter orientation.

IsoMax, BSFP and possible SUT differ in materialization/evaluation schedule.

Exact meeting objects may include:
- q value;
- action value;
- exact region membership;
- stronger guarded proof fact with its non-q premises preserved.

No q-level identity result transfers stronger proof context automatically.

## 10. Historical artifact disposition

Superseded for active game-theory interpretation:
- `research/isograph/identity/CONNECT4_NEI_APPLICATION_0_1.*`;
- `CONNECT4_NEI_PROFILES_0_1.json`;
- `CONNECT4_NEI_RESULTS_0_1.*`;
- `CONNECT4_NEI_7X6_REASSESSMENT_0_1.md`;
- post-1.1 RBA overlay series;
- RBA QU overlay series;
- RBA topology-placement overlay series.

They remain provenance, raw evidence and historical research checkpoints.

Future game-theory reasoning should start from this candidate and follow direct source evidence only when auditing or extending a named relation.

## 11. Qualification and promotion burden

Before promotion as successor game-theory authority:

1. retain the completed independent q-congruence review separating `q_o` from `q_r` and obtain any additional independent/cold review required for promotion;
2. re-run bounded `q_o` controls plus explicit negative-scope and reflected-action-label controls;
3. verify physical/history/proof identities remain distinct where required;
4. verify NEI results are derived from model constraints, not profile answer tags;
5. verify no Bayes factor is asserted without a qualified likelihood model;
6. verify QU captures every identity-relevant unresolved region without converting process incompleteness into semantic UNKNOWN;
7. integrate current RBA exact relations and open QU without relying on overlay precedence;
8. run a complete Discovery Protocol pass over the clean graph;
9. verify coverage against every game-theory claim in authority 1.1 and the post-1.1 successor corpus;
10. after qualification, route current game-theory authority to the promoted successor and leave 1.1 historical.

