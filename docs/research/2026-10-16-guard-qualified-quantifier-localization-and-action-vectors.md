# Source-guarded local quantifier elimination: depth-seven action vectors and exact optimal ties

**Date:** 2026-10-16 Pacific. **Canonical research owner:** `research/semantic-quotient`.  
**Research direction:** Josh Oshiro.  
**Status:** Exact elementary Boolean quantifier-localization laws plus new guarded source-QBF projector; Node22 independently checked 4x3/4x4 full suffix optimal action sets and 7x6 depth-seven literal action thresholds. Canonical `44444` unrestricted W/D/L remains UNKNOWN. No game-theory authority promotion, polynomial-time proof, or merge.

## 1. Target and previous bound

The owner's primary OPEN research target is *eliminate independently expanded adaptive strategic branches*, returning (exact ordinary W/D/L, **all** legal actions tied for best W/D/L). Our previous theorem constructs one shared quantified first-action Boolean threshold vector (keeping action a0 free) and computes 24 complete small-game suffix optimal sets without one independent per-action QBF. However its inner chronological action-bit Shannon quantifier still constructs `F[x=0]` and `F[x=1]` first, then ORs for P0 existential or ANDs for P1 universal. At `44444` k7, that approach exhausted 60,000 retained AND nodes after 12 quantified action bits, even with exact post-bit live compaction. This is a representation-specific temporary cofactor wall, not an impossibility theorem.

New question: can the quantifier be pushed into *locally provable Boolean factors* BEFORE constructing both whole-function cofactors, without reordering alternating quantifiers or forgetting source legality/terminal guards?

Frozen pre-experiment plan:
`research/isograph/discovery/2026-10-16-algorithmic-core/GUARDED_LOCAL_QUANTIFIER_PROJECTION_PLAN_0_1.md`.

## 2. Exact mathematical rules (all quantified domains = {0,1})

Let x be the inner bit currently eliminated, s the other fixed variables, A(x,s) and B(x,s) Boolean functions, and `Q_x` be either exists or forall. The source-QBF semantics prequalify F on full first-win/illegal/full-column neutral guards.

**Independence localization**, when B(s) does not depend on x:

    Q_x [ A(x,s) AND B(s) ] = [Q_x A(x,s)] AND B(s)
    Q_x [ A(x,s) OR  B(s) ] = [Q_x A(x,s)] OR  B(s).

**Quantifier-polarity distributivity:**

    forall x [A(x,s) AND B(x,s)] =
      [forall x A(x,s)] AND [forall x B(x,s)]

    exists x [A(x,s) OR B(x,s)] =
      [exists x A(x,s)] OR [exists x B(x,s)].

**Negation duality:**

    exists x NOT A = NOT [forall x A]
    forall x NOT A = NOT [exists x A].

**Proof:** For each assignment to s, ∀ is meet in the two-element Boolean lattice and preserves conjunction, while ∃ is join and preserves disjunction. Moving a quantifier past an independent operand is ordinary substitution of an x-invariant Boolean constant, and De Morgan duality proves the negation identities. These are finite Boolean identities for all functions, not candidate behavioral hypotheses.

**Forbidden counterrule:**

    exists x (A AND B) != (exists x A) AND (exists x B)

in general. Take A=x, B=NOT x; LHS false, RHS true. Dually, forall over OR cannot distribute. When two conjuncts BOTH depend on an existentially quantified bit, the candidate retains exact original Shannon correlation and **does not** force separate witnesses to agree by fiat. The older genuine legal 4x3 source prefix `223` remains an independent `forall b exists a` / `exists a forall b` quantifier-order falsifier. These local identities do NOT swap those blocks.

## 3. Quantifier-localized signed-edge AND DAG

Start with the proven source-only, original-residual guarded-action QBF matrix and deterministic Tseitin gate definitions; no source future positions or policies are enumerated. At each inner action bit x, from the innermost chronological block toward the initial action, recursively traverse the signed-edge AND/NOT DAG:

1. Skip any factor whose conservative exact-DAG variable-support mask excludes x (sound despite possible overapproximation).
2. For a NOT edge, switch to the dual quantifier and negate the result.
3. Under FORALL, push the projection through BOTH AND children and combine only the projected children.
4. Under EXISTS, if one AND child is x-independent, project only the dependent child and keep the other untouched.
5. Otherwise, and **only** otherwise, materialize the exact two cofactors and OR them. This avoids the illegal independent-witness assumption.

Cache projected subfunctions by positive gate ID and quantifier polarity for the current x. Preserve every remaining action-bit dependency; rebuild the signed-edge AND graph by exact live compaction only after finishing a bit. The **first action block remains free**, as in the established complete-action-vector theorem; once all later quantifiers are eliminated, evaluate one shared output function at every literal legal first action and use four WIN/NONLOSS threshold vectors to reconstruct complete optimal sets when exact.

**Inductive correctness:** Each recursion case applies one of the universally valid laws above or exact Shannon. Signed-edge duality preserves meaning, the gate DAG is acyclic, and memoization reuses only identical (gate, quantifier, eliminated variable) calculations. Hence projection of every original Boolean function is exact. Induction through the unchanged action quantifier-prefix proves `G_z(c)` has the same guarded finite-horizon Bellman first-action threshold as before; the prior optimal-mask completeness theorem applies verbatim. No global closure or width bound follows.

**Costs and epistemic scope:** Each local quantifier cache miss, Shannon cofactor miss and newly created AND node is charged as nontrivial Boolean work; recursive visits, cache hits, source QBF construction and live compaction/equivalence-validation scans are separately instrumented. Boolean node lifetime is limited by the original 60,000 retained-node cap, 300,000 nontrivial Boolean-operation cap, 10,000 support cap, 15-second compilation cap. The stronger full-game branch-free outcome is still unproved.

## 4. Independent physical validation

Reproducible producer: `research/isograph/discovery/2026-10-16-algorithmic-core/guarded-action-qbf-local-quantifier.mjs` (Git blob `e46a847c43ab5b8d79bc02cc09d60f9e89fb86ae`).  
Physically independent small-board optimal-action vector control: `local-quantifier-control.mjs` (Git blob `81fbe9cb770097f68d05a61fab92f52910ddec77`).  
Separate standard7x6 k7 first-win physical falsifier: `local-quantifier-k7-physical-control.mjs` (Git blob `ec395be044069434ce55957b5561cc453a242657`).

Local Node.js v22.16.0 runs, all source identities verified. Machine record:
`GUARDED_LOCAL_QUANTIFIER_PROJECTION_RESULTS_0_1.json`.

**Same frozen 47 source-horizon cases as the original one-pass action-vector method:**
- 188 complete four-threshold shared first-action projections;
- 672 per-action Boolean thresholds compared with physically replayed, independently alternating legal first-win outcomes;
- 24 complete-game suffix positions across 4x3 Connect3 and 4x4 Connect4; **24/24 exact W/D/L plus complete optimal-action sets**, including **13 unique-best and 11 tied-best cases**;
- zero discrepancies; validation alone explored 532,956 physical transitions, while source candidate explored zero game continuations.

**Separate canonical 7x6 `44444` k7 falsifier:** all four source-projected action Boolean threshold vectors complete and agree for each of seven literal actions with independent physical first-win finite-horizon minimax. **2,799,124 physical validator transitions**, zero mismatches. Candidate does not read those policy/search results.

| `44444` future k7 threshold | Completed future action bits | Boolean projection ops | Peak retained nodes | Additional counted GC/evaluation units | Physical result |
|---|---:|---:|---:|---:|---|
| Wlo/Nlo | 18/18 | **63,757** | **6,298** | 268,070 | FALSE, all 7 legal labels |
| Whi/Nhi | 18/18 | **166,807** | **16,517** | 507,801 | TRUE, all 7 legal labels |

For comparison, the prior nonlocalized live-compacted Shannon projector hit **60,000 nodes** after 12/21 total quantified action bits at k7. At k6 the new *future-only* projector used 49,929 lower Boolean operations / 4,874 peak nodes and 17,271 upper operations / 1,543 peak nodes; the old shared Shannon k6 used 214,299 / 31,064 and 159,697 / 24,985, respectively. The guard-licensed local factoring is an actual reduction in quantified evaluation work, not just a smaller unevaluated formula. The original source-owner reflected interval BDD k11 still reaches deeper than this new action-QBF method, so do NOT infer that the latter is the best solver overall.

Across five **deliberately uncached separate-first-action projection** controls, the localized *shared* vector saved **81.05–90.76%** of counted Boolean source/quantification work compared with that baseline; separately charging GC/evaluation units gave **75.92–86.41%** savings. No equivalence to an optimally cached solver is implied.

## 5. Next observed obstruction: k8 lower, not k7

The first bounded `44444` k8 attempt, within the **same resource envelope**, gave:

- **Wlo/Nlo: RESOURCE-PARTIAL** at 60,000 nodes and **292,251** counted Boolean projection operations, after **16 of 21 inner action bits**. Do not infer a false lower threshold, or a new WDL outcome.
- **Whi/Nhi: EXACT TRUE for all seven literal first actions**, completing 21 of 21 inner action bits at **208,467** Boolean projection operations / **20,573** peak retained nodes. No separate physical k8 control was run; this is algebraic correctness under the proved source-QBF and local quantifier laws.
- Because lower vectors were incomplete, the complete k8 intervals and optimal set must be **PARTIAL/UNKNOWN**.
- The `44444` k7 all-seven action intervals remained **[-1,+1]**. **Do not** call the actions unrestricted WDL-equivalent or claim the opponent's best move has been established.

This is a new scoped **positive** removal of one adaptive cofactor construction wall, and a new **negative** width/work wall one ply deeper. A cap exhaustion does not imply a semantic minimum cofactor width lower bound. Some gates are only conservatively dependent on x; the next mathematical lever is improving factor-correlated existential projection.

## 6. Next mathematical hypothesis: coherent existential witnesses

The elementary local rule `exists x(A AND B) = (exists x A) AND (exists x B)` is false without assumptions. Its **pointwise necessary and sufficient exact condition** is: for every shared assignment s where both factor projections are TRUE, there exists one common x that makes **both** factors TRUE. For a single Boolean x, it is enough that both A and B are certified monotone in the **same direction** in x: they then share the endpoint x=0 or x=1 as a witness whenever either has a witness. The universal-over-OR dual has the corresponding shared counterexample endpoint.

This is a hypothesis for a *new safe local certificate*, not authorization to distribute existential projection through arbitrary correlated factors. Any implementation should compute a conservative **syntactic signed variable-polarity/unateness certificate**, preserve all original terminal/legality factor dependencies, and fall back to exact Shannon whenever polarity cannot be proven. The candidate must have complete physical/q controls before any k8 scaling claim and use the original envelope. A derived theorem about compatible choices does not itself prove that a cheap witness certificate exists in the source Connect Four formula.

## 7. Qualification and limits

- Source residual transition algebra and first-win boundary remain qualified; no modification of their semantics.
- The new local rule is exact finite Boolean algebra, while its implementation has finite physical falsifier coverage and not a maintained Node26 full-suite or external replication.
- The scalar **exact recursive** algorithmic core remains complete.
- The **stronger original research objective**—general nonbranching evaluation returning all exact best moves across all ranks—remains OPEN. This work eliminates some intermediate Boolean branch products under provable guards, **not all adaptivity**.
- Any new source-game result after `44444` remains UNKNOWN until lower/upper intervals converge and all literal-action equal-value claims are independently qualified.
- No new IsoGraph claim, authority promotion, merging or solver adoption occurred.
