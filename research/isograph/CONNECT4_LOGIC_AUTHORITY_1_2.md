# Connect4 IsoGraph Logic Authority 1.2

**Status:** qualified current game-theory / logic authority  
**Effective date:** 2026-09-19  
**Authority manifest blob:** `5f401c93f8ea653fd3bc96e386b08ef7d92c519e`  
**Qualified semantic source revision:** `4f4e25b2b6fe10a11ee3145df2422b5df5fbc67f`  
**Qualified NEI dependency:** `iteathen/isograph@55c98d31dd2715cdb48abe4f8e313fd72d0dabba`

## Authority root

The current Connect4 game-theory/logic authority is the exact package pinned by:

`research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json`

Native promotion record:

`research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.isg`

Final qualification:

`research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_2.md`

Promotion decision:

`docs/decisions/2026-09-19-isograph-logic-authority-1-2.md`

Authority 1.1 remains immutable historical qualified evidence. It is not edited or deleted.

## Current semantic package

Promotion confers current authority on the exact frozen files:

- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.md`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.json`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.isg`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_CLAIM_COVERAGE_1_2_CANDIDATE.json`.

The historical `CANDIDATE` filename token is part of the frozen artifact identity. Qualification/promotion status comes from this root and the manifest, not the filename.

## What 1.2 changes

Authority 1.2 replaces the layered active interpretation:

```text
authority 1.1
+ applied NEI overlay
+ post-1.1 RBA overlays
+ separate q reassessment layers
```

with one integrated game-theory package.

The package explicitly distinguishes:

```text
q_o
    orientation-sensitive ordinary future-behavior carrier

q_r
    horizontal-reflection orbit/value-cache quotient
    transporter c -> 6-c
```

Qualified standard-7x6 result:

```text
q_o(s)=q_o(t)
    ->
same complete literal-action-labelled ordinary future game
    ->
NEI_future_behavior_oriented(s,t)=SAME
```

This does not imply physical occurrence, colored-board, move-history, terminal-line provenance, or non-q proof/certificate identity.

Equal `q_r` preserves exact future-game correspondence under the explicit reflection transporter and exact scalar W/D/L/value reuse. It does not imply identical literal action labels without transport metadata.

## Claim/status closure

Authority 1.2 accounts for every current canonical/post-1.1 claim in scope:

```text
authority-1.1 claims           74
post-1.1 claims               19
total                          93
uncovered                       0

retained                       65
strengthened                    4
historical-only                17
open                            7
```

Promotion preserves OPEN as OPEN. Qualification does not solve C4-R0076 or other explicitly open research.

## QU

Current unresolved regions include:

- `QU-GAME-01`: evidence-independence property uncertainty;
- `QU-GAME-02`: missing compact realizability-preserving proof/clause -> q/value controllable predecessor (C4-R0076);
- `QU-GAME-03`: RBA representation/evaluation research region.

Unresolved structure is represented, not treated as absent.

## Proof/value boundary

q/value equality does not transport non-q proof premises.

RBA exact ordinary-value conclusions do not establish proof/certificate identity.

Deadlines, response resources, realizability, CPC/NDC premises, provenance/dependency cone, and guards remain separately owned when not q-derived.

## Solver ownership

IsoMax, BSFP and possible SUT policies are evaluation/materialization schedules over the same Connect4 semantic dependency.

Solver implementation locality does not create alternate game semantics.

## Hot-loop performance authority

The separately qualified:

`research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md`

remains current performance-research authority for the IsoMax hot loop.

It has **no gameplay-authority effect** and therefore does not create split Connect4 game-theory authority.

## Qualification

Key promotion evidence:

- qualified NEI 0.4: IsoGraph Experiment 016, 18/18 PASS;
- qualified q_o/q_r relation: Experiment 017, 18/18 PASS;
- q_r implementation transporter workflow: `35478469795`, success;
- corrected full DP-01..DP-45 rerun;
- 93/93 claim coverage, zero uncovered;
- final package Experiment 018: 16/16 PASS, zero mismatches, one external semantic call.

Experiment 018 packet SHA-256:

`250dfde01e21f89d39d2d0ab27e4546c585aa41ef44dc1c2ce9f83ab4be7d6b9`

Report SHA-256:

`7e6194f9e709189cb26eb5f50c2e5c0cdac7e95b8e0d940e07f74edde2d4dcab`

## Historical interpretation

The following remain evidence/provenance only for active semantic interpretation:

- authority 1.1;
- historical applied NEI 0.1 overlay;
- historical RBA overlay/QU/topology files;
- superseded hot-loop 0.1/0.2 identity layers.

They are available for audit and reconstruction, but do not compete with authority 1.2.

## Successor rule

A later game-theory authority must preserve authority 1.1 and 1.2 immutably, retain explicit OPEN/QU structure, preserve identity-scope boundaries, and pass a fresh explicit qualification/promotion cycle.
