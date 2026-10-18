# Scope boundary: two nontrivial gravity columns provide each other's phase-resource

**2026-10-18, mathematical negative companion to the exact single-chain-plus-singletons theorem.** Owner: `research/semantic-quotient`. Qualified game-theory IsoGraph 1.2 unchanged. This document is a narrow exact counterexample to applying the **one-chain scalar M budget independently to more than one nontrivial original column**. It is not a counterexample to the correctly guarded single-chain theorem or a game-value proof.

From the EMPTY original standard W=7,H=6,K=4 board, consider the first four ordinary moves:

    1,2,1,2

P0 claims original column1 rows 1 and 2; P1 claims original column2 rows 1 and 2. This is gravity-legal and has no first win. The desired owner-colored local column words are therefore

    C1 = [P0,P0],
    C2 = [P1,P1].

Both are genuine original multi-event gravity columns. A naive independent application of the previous **single-chain** scalar condition with `s=0` would incorrectly conclude that neither coloring can occur:
- if C1 were the ONLY chain, its unshifted two-event base owner sequence is [P0,P1], so target [P0,P0] would have ε=[0,1], M=1>0;
- if C2 were the ONLY chain, its target [P1,P1] against the same [P0,P1] base would have ε=[1,0], M=2>0.

But in the actual legal word `1212`, the C2 move inserted between the two C1 moves supplies the missing **opponent-color phase flip** to C1, and conversely the C1 moves shift the C2 clock so both C2 events belong to P1. The resources are coupled, not independent singleton reservoirs. Therefore

    independently enforce s_c≥M_c for every live column
      ⇒ NOT a necessary test for MULTI-chain alternating shuffle feasibility.

A correct joint formulation must use shared cross-column prefix counts. For two columns A and B, with i-th A cell and j-th B cell, define

    α_i = (n+i-1 + #B events preceding A_i) mod2,
    β_j = (n+j-1 + #A events preceding B_j) mod2.

These equations are exact for any supplied gravity-legal interleaving. The before-counts depend on a SINGLE combined monotone two-column event order; they cannot be assigned independently. A static candidate constraint relation is the lattice of pairs (i,j) of committed column-prefix lengths, with the next A event's target parity determined by j mod2 and next B event's by i mod2. This is an exact structural representation, but traversing the lattice to choose strategies would be a separate algorithm and is NOT yet claimed as an original game-value solution.

**Research direction:** derive a joint source admissibility operator for 2+ nontrivial gravity columns which eliminates dependence on explicit turn words, retains owner-tagged original winning K-interval incidence and first-win competition, and makes clear what residual adaptive strategic-choice information remains. A finite Boolean path/lattice reachability for FIXED colored events would be a useful intermediate structural checker only; it cannot be relabeled zero strategic branching unless no alternative future game values/decision strategies are evaluated. The ultimate source-best Level2 original move remains OPEN at `44444`.
