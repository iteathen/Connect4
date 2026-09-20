# Decision — Promote Connect4 Game-Theory IsoGraph Authority 1.2

**Date:** 2026-09-19  
**Owner:** Josh Oshiro  
**Research branch:** `research/semantic-quotient`

## Decision

Promote the exact Connect4 Game-Theory IsoGraph 1.2 package as the current game-theory semantic authority.

Authority root:

- `research/isograph/successor/CONNECT4_GAME_THEORY_AUTHORITY_1_2.md`

Manifest:

- `research/isograph/successor/CONNECT4_GAME_THEORY_AUTHORITY_MANIFEST_1_2.json`

Qualification:

- `research/isograph/qualification/CONNECT4_GAME_THEORY_1_2_QUALIFICATION.md`

## Exact promoted package

- `CONNECT4_GAME_THEORY_1_2_CANDIDATE.md`
- `CONNECT4_GAME_THEORY_1_2_CANDIDATE.json`
- `CONNECT4_GAME_THEORY_1_2_CANDIDATE.isg`
- `CONNECT4_GAME_THEORY_CLAIM_COVERAGE_1_2_CANDIDATE.json`

The historical `CANDIDATE` filename token is not the current status. It preserves the exact pre-promotion artifacts that were qualified.

## Qualification basis

- qualified NEI 0.4 from `iteathen/isograph@55c98d31dd2715cdb48abe4f8e313fd72d0dabba`;
- NEI Experiment 016: 18/18 PASS;
- q_o/q_r Experiment 017: 18/18 PASS;
- native q_r transporter implementation workflow: PASS;
- 93/93 C4-R0001..C4-R0093 claim coverage, zero uncovered;
- corrected DP-01..DP-45 rerun after the q_o/q_r discovery;
- explicit proof/value and QU preservation.

## Authority boundaries

Game-theory 1.2 owns:
- physical/event game semantics;
- residual structural semantics;
- q_o orientation-sensitive ordinary future behavior;
- q_r reflection orbit/value-cache quotient;
- ordinary value dependency;
- proof/certificate semantic boundaries;
- RBA value relations;
- game-theory QU.

IsoMax hot-loop authority 0.3 separately owns implementation/performance realization semantics.

No parallel authority exists for either surface.

## Historical disposition

Authority 1.1 remains immutable historical full-corpus qualification/provenance evidence.

The old applied NEI and RBA overlay stacks remain historical evidence/provenance only.

Because the project is pre-alpha, there is:
- no compatibility adapter;
- no dual-read period;
- no deprecated-but-active identity mode;
- no fallback semantic interpretation.
