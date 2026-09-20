# Decision: IsoGraph authority 1.2 supersedes Connect4 logic authority 1.1

**Date:** 2026-09-19  
**Status:** owner-authorized replacement authority decision  
**Current authority root:** `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md`  
**Authority root blob:** `14f46d82cfe349b01aea7fa881568dfdca9aa5a0`  
**Authority manifest:** `research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json`  
**Authority manifest blob:** `5f401c93f8ea653fd3bc96e386b08ef7d92c519e`  
**Native promotion record blob:** `f65bd319d9b955254d2f4c99247af829bd63340b`  
**Final qualification:** `research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_2.md`

## Decision

Connect4 IsoGraph logic authority 1.2 supersedes authority 1.1 as the sole current game-theory/logic authority.

Authority 1.1 remains immutable historical qualified evidence. It is not deleted, rewritten, or retained as co-equal active semantics.

The historical applied NEI overlay and post-1.1 RBA overlay/QU/topology stack also become provenance/evidence only for active interpretation.

The separately qualified IsoMax hot-loop authority 0.3 remains current performance-research authority with **no gameplay-authority effect**.

## Why 1.2 supersedes 1.1

Authority 1.2 incorporates post-1.1 research and corrects the identity architecture rather than layering another overlay on top of 1.1.

Key additions/corrections:

1. qualified NEI 0.4 derived-identity semantics replace profile-declared identity-answer behavior for current work;
2. orientation-sensitive `q_o` is distinguished from reflection-canonical `q_r`;
3. the standard-7x6 q_o future-behavior congruence is independently qualified;
4. horizontal reflection is represented as an exact automorphism with explicit action transporter `c -> 6-c`;
5. physical occurrence, board, history, future behavior, proof/certificate and value identities are kept as separate questions;
6. current RBA exact relations and QU regions are integrated directly, without overlay precedence;
7. all 93 current authority/post-authority claims are accounted for with zero uncovered;
8. historical-only implementation/performance claims remain provenance rather than active game primitives;
9. seven OPEN claims remain OPEN after promotion;
10. the entire replacement package passed a fresh final cold semantic holdout.

## Qualification chain

### NEI 0.4

IsoGraph Experiment 016:

```text
18 / 18 PASS
mismatches 0
external calls 1
```

Qualified semantic SHA-256:

`6e2f0efb1f4bfbfa55bc2c5597f1ecc5b4d7bb734216543c21ba72089b0aacee`

### q_o / q_r

Connect4 final q qualification:

- `research/isograph/qualification/Q_CONGRUENCE_FINAL_QUALIFICATION_0_2.md`;
- Experiment 017: 18/18 PASS;
- q_r implementation transporter workflow `35478469795`: success.

### Claim coverage

```text
total claims            93
uncovered                0
retained                65
strengthened             4
historical-only         17
open                     7
```

### Discovery Protocol

Corrected DP-01..DP-45 pass:
- `research/isograph/discovery/CLEAN_SUCCESSOR_DISCOVERY_0_2.*`.

### Final package holdout

IsoGraph Experiment 018:

```text
16 / 16 PASS
mismatches 0
duplicates 0
unexpected cases 0
external semantic calls 1
API attempts 1
```

Packet SHA-256:

`250dfde01e21f89d39d2d0ab27e4546c585aa41ef44dc1c2ce9f83ab4be7d6b9`

Report SHA-256:

`7e6194f9e709189cb26eb5f50c2e5c0cdac7e95b8e0d940e07f74edde2d4dcab`

## No compatibility / dual authority phase

This project is pre-alpha and has no compatibility consumer requiring a migration period.

Therefore promotion is atomic:

```text
before:
    authority 1.1 current
    game-theory 1.2 successor candidate

after:
    authority 1.2 current
    authority 1.1 historical
```

There is no:
- compatibility adapter;
- deprecated-but-live identity mode;
- dual active semantic interpretation;
- fallback to the historical applied NEI overlay;
- overlay-precedence rule.

## Open structure remains authoritative as open

Promotion does not solve:

- C4-R0076 proof/clause -> q/value controllable-predecessor missing law;
- other claim-coverage entries explicitly marked OPEN;
- current RBA algorithmic/evaluation QU;
- unresolved evidence-independence properties where not established.

Authority is complete with respect to represented status, not because every research question is solved.

## Ownership

`research/semantic-quotient` remains the sole durable owner of Connect4 research.

Solver branches remain implementation owners.

The authority change does not transfer semantic ownership to IsoMax, BSFP, SUT, Branch Manager or the hot-loop performance graph.

## Successor rule

Any future game-theory authority must preserve 1.1 and 1.2 immutably, preserve the q_o/q_r distinction and identity scopes, preserve QU/open status, and pass a fresh explicit qualification/promotion cycle.
