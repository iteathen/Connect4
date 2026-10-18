# Exact no-word-search causal FIRST-HEAD set for a fixed one-chain-plus-singletons owner projection

**2026-10-18, FROZEN BEFORE exhaustive original 7×6 falsification.** Research owner `research/semantic-quotient`; qualified gameplay theory remains IsoGraph 1.2. This is an exact SOURCE theorem for **projection-realizability and original next-event availability**, not a perfect-play strategic best-move rule.

## Starting authority and scope

Use `docs/research/2026-10-18-exact-single-chain-singleton-colored-shuffle-elimination.md`: from genuine original q with ply n, one chosen column c contributes L≥1 successive future physical cells with prescribed owner bits x_1..x_L; s other pairwise DISTINCT columns each contribute ONE next current-frontier physical cell with prescribed owner bit y_i. Only one-chain-plus-singleton segments, not two nontrivial chains.

Let `ε_j=x_j XOR ((n+j-1) mod 2)` and `M=ε_1+Σ_{j=2}^{L}(ε_j XOR ε_{j-1})`. For total segment T=L+s, quotas of both owners must equal the global alternating turn clock. Earlier exact theorem proves a realizing gravity shuffle exists iff quotas match and s≥M, by the explicit minimal gap construction.

We now ask for the entire set `H(q;x,y)` of **literal columns that can legally be played FIRST in at least one such realizing segment**. This is a static phase-feasible head set, not a game-value move set.

## Main exact theorem: all realizable first heads directly from ε_1, M, s

Assume the fixed owner projection is realizable (otherwise H=∅). Let current mover p=n mod2. Then:

    c ∈ H        iff ε_1=0.

For any one-time singleton column a_i:

    a_i ∈ H      iff y_i=p
                    AND [
                      (ε_1=1 AND s>=M)
                      OR
                      (ε_1=0 AND s>=M+2)
                    ].

Since global original projection realizability already provides s≥M, the first disjunct with ε_1=1 needs no extra work. Thus H can be computed in O(L+s), from the SAME scalar M and first ε bit used to eliminate global shuffle existence. No alternative future word or WDL child is evaluated.

**Proof for c:** c is the first event iff no singleton precedes c_1. Then the mandatory `g_0 mod2=ε_1` requires ε_1=0. Conversely if ε_1=0, the minimal-gap construction of the preceding theorem has g_0=0, so its ONE canonical realizing word begins in c.

**Proof for singleton a_i:** the desired owner bit must equal the current mover p. Assume it does. Remove this one first singleton placement. The required relative clock for ALL remaining c events shifts by one, so every residual ε bit flips:

    ε'_j = ε_j XOR 1,

and hence its minimum singleton phase-transition cost is

    M' = (1-ε_1) + Σ_{j=2}^{L}(ε_j XOR ε_{j-1})
       = M + 1 - 2ε_1.

There are now exactly s−1 remaining singleton events. Because the first singleton had correct actual turn owner p, their new total requested color quotas automatically match the remaining alternating turn slots. Apply the EXACT source feasibility theorem to this residual colored segment: the requested original a_i head is extendable iff

    s−1 >= M'
      iff
    s >= M + 2 − 2ε_1.

For ε_1=1 this becomes s≥M, already true; for ε_1=0 it becomes s≥M+2. All remaining selected singleton columns are still gravity-legal and pairwise distinct, and original physical c chain is untouched, so no additional release guard is needed. This completes necessary and sufficient proof.

**Nontrivial consequence:** the complete phase-feasible FIRST original label set is derived without evaluating any second symbolic or game state, enumerating alternate words, or using minimax. A unique head (|H|=1) implies that one exact **physical scheduling** first action is forced if that particular owner-phase allocation is to be achieved. It does NOT mean that head is strategically BEST in the actual adversarial Connect4 game, since the players never committed to that future owner allocation.

## Concrete actual board controls to freeze

1. Empty physical original 7×6 segment c=2, L=2, singleton column1 with desired original colored owner c=(P0,P1), singleton1=P0 has ε=[0,0], M=0, s=1. The owner allocation is feasible via `221`. The exact source H={2}; selecting 1 first would require g_0≥2 and s≥2, which fails. This is the strict exact repair of the earlier greedy scheduling counterexample.
2. Empty c=4,L=5, singleton a1=1,b2=2, desired c owner bits P1,P0,P1,P0,P1 and both outer cells P0 has ε=[1,1,1,1,1], M=1, s=2. The source H={1,2}, excluding c4. Both realizing words `1444442` and `2444441` are the two-element long-range owner fiber.
3. Exhaustively reproduce ALL 56 exact true7×6 single-chain/singleton test configurations of the frozen prior control, and for EACH of the 740 physically realizable owner projections compare direct source H against the union of actual physical first columns seen among ALL gravity-legal realizing words. Also check 3,130 source-proven unattainable owner projections yield H=∅. This physical enumeration is a FALSIFIER only, NEVER the source producer.
4. Count source singleton-first versus chain-first permissions, unique-head fixed-profile configurations, multihead configurations, mismatches and preserved dual-first-win races. Do not infer `44444` perfect WDL or a Level2 best move. Maintain CI/formal qualification distinctions and original research owner.

## Next general mathematical step, not proved

Generalizing the exact scalar M/head law to TWO OR MORE nontrivial columns likely requires simultaneous prefix parity constraints and capacity sharing; the single-chain proof cannot simply be tensor-multiplied because both columns compete for singleton slack and for who observes the opposing event first. Seek a source-only **joint colored-frontier admissibility relation**, possibly a Hall-like prefix-capacity certificate over the original gravity-chain incidence, with a proof of realizability and adaptive-turn compatibility. Do not substitute a game-tree or implicit full-word/strategy enumeration. Even a complete schedule feasibility law remains weaker than perfect-play game-value preservation.
