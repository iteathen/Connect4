# Core logic map

This is the agent-facing connective tissue for the Connect4 research program. Historical branch names identify experiment locations, not separate theories.

```text
GEOMETRIC WINNING-LINE AXIOMS
        |
        +--> exact line counts / finite derivatives ---------------- C4-R0002
        |                         |
        |                         +--> derivative semantic candidates - C4-R0012
        |
        v
RESIDUAL WINNING STRUCTURES / WINSPACE ------------------------------- C4-R0001
        |
        +--> WSL-625 residual basis --------------------------------- C4-R0015
        +--> support / gravity accessibility ------------------------- C4-R0025
        +--> blocker upward closure ---------------------------------- C4-R0016
        +--> CPC event-rank ownership / timing ----------------------- C4-R0014
        +--> race / precedence guard --------------------------------- C4-R0017
        |
        v
LOCAL EXACT CONSTRAINTS / CERTIFICATES
        |
        +--> playable own singleton ---------------------------------- C4-R0003
        +--> >=2 distinct opponent completions ----------------------- C4-R0004
        +--> unique forced block -------------------------------------- C4-R0005
        +--> dead residual draw --------------------------------------- C4-R0009
        +--> exact terminal-subtraction frontier algebra ------------- C4-R0046
        +--> role-general A123 ---------------------------------------- C4-R0029,R0030
        +--> narrow ZPAR ---------------------------------------------- C4-R0033
        +--> A4/A8 compatible-cover extension ------------------------ C4-R0038
        +--> scoped A9-orientation counterexample -------------------- C4-R0037
        |
        v
GUARDED COMPOSITION / NESTED DEPENDENCY CLOSURE --------------------- C4-R0018
        ^                                   |
        |                                   +--> central missing laws - C4-R0011
        |
        +--> compatibility candidate ------------------------------- C4-R0031,R0032
        +--> implication / proof transfer --------------------------- C4-R0034
        |
        v
SEMANTIC EQUIVALENCE / QUOTIENT -------------------------------------- C4-R0008
        |
        +--> identified-line exact controls -------------------------- C4-R0023
        +--> behavioral minimization --------------------------------- C4-R0024
        +--> direct residual automaton ------------------------------- C4-R0026
        +--> MQ5 proof-volume reduction ------------------------------ C4-R0027
        +--> typed exact interning ----------------------------------- C4-R0028
        +--> typed MQ5 + A123 composition ---------------------------- C4-R0036
        +--> line-hit product antichain ------------------------------ C4-R0042
        |       |
        |       +--> realizability-preserving recurrence missing ----- C4-R0043
        +--> residual-pair crossing reuse ---------------------------- C4-R0044
        |
        v
EXACT CONSEQUENCE / RESIDUAL BOUNDARY
        |
        +--> exact before heuristic ---------------------------------- C4-R0006
        +--> unresolved residue stays unresolved --------------------- C4-R0007
        |
       /|\
      / | \
     /  |  \
ISOMETRIC        NEGAMAX / MINIMAX          BSFP
forward          recursive residual          backward symbolic
relational       consumer + exact oracle     fixed-point consumer
calculus                                      |
                                              +--> antichain form ----- C4-R0039
                                              +--> rolling ranks ------ C4-R0040
                                              +--> rejected no-sort --- C4-R0041
                                              +--> measured compute wall C4-R0045
```

## Cross-direction interpretation

The three solver families are different computational consumers of the same structural knowledge.

- **Isometric** attempts to make the relation/certificate/composition layer itself do progressively more of the solving.
- **Negamax/Minimax** is a recursive residual consumer and a strong exact oracle for qualifying structural certificates, quotient identities and interactions.
- **BSFP** consumes terminal, win-space, timing and quotient structure in the reverse direction through backward symbolic fixed-point propagation.

The new line-product result is deliberately cross-linked rather than labeled BSFP-only: it is evidence about the structural sufficiency/compression of win-line relations themselves. Its missing realizability law is therefore part of the same composition problem Isometric is trying to solve.

A result in one solver can support a shared claim, but solver success does not automatically change the claim's epistemic status.

## Evidence loop

```text
hypothesis / candidate rule
        |
        v
derivation, oracle, replay, benchmark, counterexample
        |
        v
normalized evidence record
        |
        v
stable claim ID + scoped epistemic status
        |
        +--> supports / contradicts / constrains / qualifies
        |
        v
solver consumption + new predictions
```

C4-R0035 governs this loop:

**mechanism != implementation form != workload != stage order != synergy != adoption status**

This is why the exact dead-residual theorem survives a runtime-negative detector (R0009 vs R0010), why the scoped A9 responder implementation is falsified without declaring the published A9 rule family false (R0037), and why the rejected streaming dominance reducer does not weaken the antichain representation results (R0041 vs R0039/R0042).

## Current central gap

The program has exact geometry, exact local terminal rules, strong bounded quotient evidence, strategic certificates, timing structure and several proof-compression mechanisms. The main missing bridge remains C4-R0011: a complete enough **guarded composition calculus** to turn these local relations into global game-theoretic consequences without silently reintroducing ordinary game-tree enumeration. R0043 gives that gap a concrete structural target: a realizability-preserving closure law over line-hit product state.
