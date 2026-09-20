# Connect4 game-theory 1.2 deterministic preflight 0.1

**Date:** 2026-09-19  
**Candidate:** `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.*`  
**Claim companion:** `research/isograph/successor/CONNECT4_GAME_THEORY_CLAIM_COVERAGE_1_2_CANDIDATE.json`  
**Hot-loop consumer:** `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.*`  
**Status:** historical deterministic preflight PASS — promotion completed  
**Authority effect:** none

## Checks

```text
authority-1.1 canonical claims expected       74
post-1.1 claims expected                     19
total expected                               93

coverage records                             93
unique claim IDs                             93
missing claim IDs                             0
extra claim IDs                               0
claims without successor target               0
open claims without open/QU target             0

dispositions:
    retained                                 65
    strengthened                              4
    historical_only                          17
    open                                      7
```

## q-layer correction

The candidate explicitly distinguishes:

```text
q_o
    orientation-sensitive ordinary behavioral state

q_r
    horizontal-reflection orbit/cache quotient
```

The recorded transporter is:

```text
orientation agrees: c -> c
orientation differs: c -> 6-c
```

The independent reconstruction in:

`research/isograph/qualification/Q_CONGRUENCE_INDEPENDENT_REVIEW_0_1.md`

finds:

```text
q_o literal action-labelled congruence theorem    survives
q_r literal action-label identity                 rejected
q_r transported future-game equivalence           supported exact corollary
q_r scalar W/D/L/value reuse                      supported exact corollary
q_r proof-context identity                        not implied
```

The hot-loop consumer now names its cache boundary `implementation_exact_qr_equality` and consumes only the q_r value/cache scope.

## Native closure

```text
game-theory native [] balance                    PASS
game-theory native () balance                    PASS
local 997xxx SIs declared                         34
undeclared local SIs                               0
```

## Package closure

The active 1.2 candidate is one semantic package:

- semantic Markdown root;
- machine-readable JSON graph;
- native IsoGraph topology;
- 93-claim coverage companion.

The coverage companion is not a compatibility layer or second authority.

## Blocker disposition

All preflight blockers subsequently closed:

1. NEI 0.4 qualified/promoted at `iteathen/isograph@55c98d31dd2715cdb48abe4f8e313fd72d0dabba`;
2. q_o congruence and q_r transporter qualified in `Q_CONGRUENCE_FINAL_QUALIFICATION_0_2.md`;
3. final package qualified by Experiment 018 and `FINAL_QUALIFICATION_REVIEW_1_2.md`;
4. hot-loop 0.3 qualified as separate non-gameplay performance authority.

Current authority is `CONNECT4_LOGIC_AUTHORITY_1_2.md`.


## Additional q_r transporter evidence

```text
solver head                                  eb8928fe6f4c4b3dba6ad3e2d42f186947a6ebf2
q_r transporter regression                  PASS
Isometric native WSL workflow run            35478469795
workflow conclusion                          success
```

The control explicitly proves that reflection-canonical q_r equality can coexist with different literal legal-column sets while the transported action map `c -> 6-c` preserves child q_r and terminal status.
