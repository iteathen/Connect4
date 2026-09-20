# Connect4 Game-Theory IsoGraph 1.2 — Final Qualification Review

**Disposition:** QUALIFIES FOR CURRENT GAME-THEORY AUTHORITY  
**Owner:** `research/semantic-quotient`  
**Gameplay semantic scope:** Connect4 game-theory semantics, ordinary future behavior, q/value/proof/RBA/QU relations  
**Does not own:** solver implementation lifecycle, hot-loop performance semantics, unrelated repository process semantics

## 1. Qualified package

Exact promoted artifacts:

- Markdown root blob: `0359e8e7a3d7e5402d562c4ae5be04d2617f46fb`
- machine-readable JSON blob: `761bb2ad4ec3c45eff4707bbeb216b467bc7c300`
- native IsoGraph blob: `dba9fccee417dc6c593011d85330d42f5b71b079`
- claim-coverage companion blob: `b0e2d21935b3035997c19c42941b225e77cf5ff9`

The historical filename token `CANDIDATE` identifies the exact pre-promotion bytes. Qualification status is owned by this review and the authority root/manifest.

## 2. Package closure

```text
JSON parse                                  PASS
native [] balance                           PASS
native () balance                           PASS
undeclared local 997xxx SIs                    0
claim coverage records                        93
unique claim IDs                              93
missing C4-R0001..C4-R0093 claims              0
claims without successor target                0
open claims without open/QU target              0
```

Claim dispositions:

```text
retained          65
strengthened       4
historical_only   17
open               7
```

Historical-only claims remain evidence/provenance. Open claims remain explicitly open.

## 3. NEI authority dependency

Current qualified NEI authority:

```text
iteathen/isograph@55c98d31dd2715cdb48abe4f8e313fd72d0dabba
NEI 0.4 semantic SHA-256:
6e2f0efb1f4bfbfa55bc2c5597f1ecc5b4d7bb734216543c21ba72089b0aacee
Experiment 016 workflow:
35478421676
Q01-Q18:
18 / 18 PASS
mismatches:
0
```

NEI 0.4 establishes the identity architecture used by this package:

- SAME/DISTINCT are derived;
- profile answer tags are not identity authority;
- exact and probabilistic identity evidence remain separate;
- Bayes factors are evidence strength, not identity truth;
- evidence lineage/dependence is load-bearing;
- QU is required for identity-relevant unresolved structure;
- missing QU is incomplete, not semantic UNKNOWN;
- scoped quotient equivalence is not global identity.

**PASS.**

## 4. q_o / q_r qualification

Qualified theorem record:

- `research/isograph/qualification/Q_CONGRUENCE_FINAL_QUALIFICATION_0_2.md`

Cold semantic qualification:

```text
host                 iteathen/IsoGraph Experiment 017
workflow run         35479007618
external calls       1
cases                18 / 18 PASS
mismatches           0
```

Implementation control:

```text
solver/isometric     eb8928fe6f4c4b3dba6ad3e2d42f186947a6ebf2
workflow run         35478469795
conclusion           success
```

Qualified distinction:

```text
q_o
    orientation-sensitive ordinary behavioral state
    equal q_o -> same complete literal-action-labelled ordinary future game

q_r
    horizontal-reflection orbit quotient of q_o
    transporter: c -> 6-c when orientations differ

equal q_r:
    exact reflection-transported future-game equivalence
    exact scalar W/D/L/value reuse

equal q_r does not imply:
    literal action-label identity without transporter
    physical occurrence identity
    move-history identity
    non-q proof/certificate identity
```

Under qualified NEI 0.4:

```text
q_o(s)=q_o(t)
    ->
NEI_future_behavior_oriented(s,t)=SAME
```

for the declared ordinary future-behavior identity question.

**PASS.**

## 5. Proof/value boundary

The package preserves non-q proof premises separately:

- timing/deadline;
- response resources;
- realizability;
- CPC/NDC premise state;
- provenance/dependency cone;
- guard context.

Equal q/value never transfers these automatically.

C4-R0075 is retained as the confirmed distributed-universal composition wall.

C4-R0076 remains the open missing compact realizability-preserving clause/proof -> q/value controllable-predecessor law.

**PASS.**

## 6. RBA integration

Current exact/deductive RBA relations are integrated directly into the package rather than interpreted through overlay precedence:

```text
C4-R0077
C4-R0078
C4-R0079
C4-R0080
C4-R0081
C4-R0082
C4-R0085
C4-R0086
C4-R0088
C4-R0090
C4-R0091
C4-R0092
```

Empirical execution checkpoints remain evidence rather than universal laws.

RBA research unknowns remain in `QU-GAME-03`.

**PASS.**

## 7. QU preservation

The clean game-theory package retains distinct unresolved regions:

### QU-GAME-01 — evidence independence
Unknown statistical independence remains property uncertainty, not identity uncertainty.

### QU-GAME-02 — proof/value bridge
The compact realizability-preserving proof/clause -> q/value predecessor law remains open.

### QU-GAME-03 — RBA research/evaluation
Representation/planning/evaluator/rare-tail/restricted-image/scaling questions remain explicit.

Process incompleteness and qualification gaps are not encoded as semantic UNKNOWN.

No probability distribution is invented over QU.

**PASS.**

## 8. Bayesian evidence discipline

No Connect4 identity Bayes factor is currently calibrated.

Finite controls, collision counts, solver matches and replay counts remain unweighted evidence unless a qualified likelihood model exists.

Exact q_o congruence is exact evidence and requires no probabilistic score.

**PASS.**

## 9. Discovery Protocol qualification

The cleaned successors were subjected to DP-01 through DP-45.

The first clean pass missed the q_o/q_r distinction; that miss remains historical evidence in `CLEAN_SUCCESSOR_DISCOVERY_0_1.*`.

The corrected full rerun is:

- `research/isograph/discovery/CLEAN_SUCCESSOR_DISCOVERY_0_2.md`
- `research/isograph/discovery/CLEAN_SUCCESSOR_DISCOVERY_0_2.json`

```text
protocol records          45
unique protocol IDs       45
known defect              q_o/q_r distinction
defect corrected          YES
additional semantic defects after correction
                          none
```

**PASS.**

## 10. Authority-1.1/post-1.1 coverage

The package companion maps all canonical claims C4-R0001..C4-R0093.

```text
authority-1.1 claims      74
post-1.1 claims           19
total                     93
uncovered                  0
```

Broad historical missing-law claims were narrowed/strengthened where later exact laws exist; their remaining open residuals are explicitly retained.

No semantic claim disappears merely because the old overlay stack is no longer active.

**PASS.**

## 11. Historical artifact disposition

Superseded for active game-theory interpretation:

- authority-1.1 game-theory interpretation;
- applied NEI 0.1 overlay;
- NEI profile/results overlay;
- post-1.1 RBA overlay stack;
- RBA QU/topology overlay stack.

They remain immutable provenance/evidence at their pinned revisions.

This is pre-alpha replacement, not compatibility layering.

## 12. Scope boundary with hot-loop authority

Current hot-loop performance-research authority is separately owned by:

- `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md`

That package consumes the game-theory `q_r` value/cache consequence and does not redefine game identity.

There is one owner per semantic surface, not competing authority.

## 13. Final disposition

```text
package mechanical closure                     PASS
93-claim coverage                              PASS
qualified NEI 0.4 dependency                   PASS
q_o future-behavior congruence                 PASS
q_r action transporter                         PASS
proof/value separation                         PASS
RBA integration                                PASS
QU preservation                                PASS
Bayesian evidence discipline                   PASS
DP-01..DP-45 corrected rerun                   PASS
historical provenance preserved                PASS
compatibility/dual authority introduced        NO
```

**CONNECT4 GAME-THEORY ISOGRAPH 1.2 QUALIFIES AS CURRENT GAME-THEORY AUTHORITY.**
