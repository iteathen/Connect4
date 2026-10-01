# CPC rank-22 c1 routed win composition theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before execution  
**Status:** exact RLC proof-routing composition candidate  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Requalify the exact rank-22 candidate \`P1:c1\` using theorem routing rather than the earlier uniform c5-compression attempt.

Exact root:

\`4444415666662322224233\`

Required state:

- rank 22;
- Player 1 to move;
- support \`[1,6,3,6,1,5,0]\`.

Candidate move:

\`P1:c1\`.

After that move the legal Player-2 replies are exactly:

\[
\{c1,c3,c5,c6,c7\}.
\]

## Routing partition

### Reply c1 — exact rank-24 zugzwang handoff

The exact child must equal:

\`444441566666232222423311\`

Freshly re-execute \`run-cpc-rank24-zugzwang-win-composition.mjs\` and require \`accept=true\`.

### Reply c3 — exact rank-24 singleton-handoff handoff

The exact child must equal:

\`444441566666232222423313\`

Freshly re-execute \`run-cpc-rank24-reply3-singleton-handoff-composition.mjs\` and require \`accept=true\`.

This replaces the earlier failed attempt to force the c3 reply through the wrong height-1 c5-compression template.

### Reply c5 — existing shortened compression RCIC

Freshly re-execute \`run-cpc-rank22-c1-zugzwang-composition.mjs\`.

Use only the c5 branch if it independently reports:

- exact nonterminal reply;
- accepted shortened c5 forced-compression;
- exact residual contraction to the singleton target;
- accepted freshly synthesized target-reservoir certificate.

The overall old rank-22 theorem result may remain false; only this already-qualified local branch is reused.

### Reply c6 — existing height-1 compression RCIC

From the same fresh execution, use only the c6 branch if it independently reports accepted compression and target-reservoir closure.

### Reply c7 — exact new rank-24 routed handoff

The exact child must equal:

\`444441566666232222423317\`

Freshly re-execute \`run-cpc-rank24-reply7-routed-win-composition.mjs\` and require \`accept=true\`.

This replaces the earlier failed attempt to solve the c7 child with one fixed compression template.

## Conclusion target

If all five legal defender replies close under the routing partition above, then the exact rank-22 state is structurally certified as a Player-1 win by c1.

The proof introduces no new Connect-Four-specific theorem primitive. It composes:

- exact theorem-root handoff;
- forced compression as an RCIC progress edge;
- target-reservoir RCIC closure;
- previously qualified rank-local theorem roots.

## Falsifiers

Reject if:

- the legal reply family differs;
- any exact theorem-root handoff fails full RBA equality;
- any freshly re-executed downstream theorem fails;
- the c5 or c6 local branch no longer independently closes;
- any route consumes diagnostic W/D/L or ordinary game-tree value as a premise.

## Boundary

No Pons/oracle value, solved W/D/L input, diagnostic local value, ordinary game-tree search, best-move table, opening book, BSFP solved frontier, physical-position identity, or sealed holdout may be used.

Production CPC, JSMinSys, and BSFP remain unchanged.
