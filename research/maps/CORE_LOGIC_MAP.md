# Core logic map

This map is the agent-facing connective tissue for the research program.

```text
Connect-k board geometry
        |
        +--> exact line counts / finite derivatives -------- C4-R0002
        |                         |
        |                         +--> higher-order candidate predicates --- C4-R0012
        |
winning structures / residual lines ------------------------ C4-R0001
        |
        +--> intersection / blocking / ownership
        +--> gravity reachability
        +--> timing / ply / parity
        +--> support dependencies
        |
        v
local structural predicates
        |
        +--> own playable singleton ------------------------- C4-R0003
        +--> >=2 distinct opponent completions -------------- C4-R0004
        +--> unique opponent completion --------------------- C4-R0005
        +--> no residual win-space -------------------------- C4-R0009
        |
        v
composition / closure laws  <--------- MISSING ------------ C4-R0011
        |
        v
semantic equivalence / quotient ---------------------------- C4-R0008
        |
        v
exact terminal / move constraints
        |
        +--> exact before heuristic ------------------------- C4-R0006
        |
        v
unresolved structural residue ------------------------------ C4-R0007
       /|\
      / | \
     /  |  \
Isometric Negamax/Minimax BSFP
```

## Evidence loop

```text
hypothesis/candidate rule
        |
        v
experiment or derivation
        |
        +--> supporting evidence
        +--> counterexample
        +--> exact proof/certificate
        |
        v
claim registry status + confidence record
        |
        v
solver consumption / new predictions
```

The implementation loop is downstream of the epistemic loop. An optimization can fail while its underlying theorem remains true. `C4-R0009` versus `C4-R0010` is the current canonical example.

## Why this map exists

Historically, the same idea was encountered through semantic quotient experiments, terminal-frontier work, Minimax candidate systems, derivative classification, and BSFP investigations. Those are research campaigns around a shared structural object, not unrelated projects. Agents should reason across the connections above before creating a new local explanation of the same phenomenon.
