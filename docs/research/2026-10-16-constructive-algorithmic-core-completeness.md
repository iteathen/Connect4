# Connect Four algorithmic core — constructive completeness and optional branching reduction

**Date:** 2026-10-16  
**Canonical owner:** `research/semantic-quotient`  
**Research direction:** Josh Oshiro  
**Status:** *deductive exact game-semantics closure* under qualified q_o/first-win rules, plus internally qualified oracle-independent executable control; **no new IsoGraph authority promotion**  
**Implementation evidence:** `research/isograph/discovery/2026-10-16-algorithmic-core/CONSTRUCTIVE_CORE_QUALIFICATION_RESULTS_0_1.json`

## 1. Corrected definition and decision

The original question is **whether we have identified a complete algorithmic core** for exact Connect Four W/D/L and optimal-move selection. It is **not** whether the core must eliminate recursion or branching.

An algorithmic core is a finite, executable, mathematically sufficient specification of the transformations and value rule which, starting from any valid first-win-stopped position, uniquely computes the exact game value and every W/D/L-optimal action. The mechanism may be recursive and branching. This definition does not require a smallest representation, polynomial time, an oracle-precompiled table or a completed computation of the standard-board empty root.

**Result:** yes, the qualified ordinary residual-q/cofactor/terminal/alternating-value calculus is a complete constructive core for this scope. Its standard exact recursive implementation is finite, deterministic, oracle-independent and potentially exponential. The preferred property of *eliminating separately evaluated recursive alternatives* is a **different, still OPEN algorithmic improvement**.

This is a precise classification of already established structural mathematics, **not** a novel claim that Connect Four no longer requires minimax-like alternating quantification.

## 2. Formal structural core

For standard 7x6, define the legal **nonterminal** ordinary state

\[
q=(h,R_0,R_1),\qquad p(q)=\left(\sum_c h_c\right)\bmod2.
\]

Here each `R_i` is the minimal residual winning-requirement antichain for player i, with support/gravity encoded by `h`.

For legal column c, the landing event is `x_c=(c,h_c)`, and the two exact cofactor channels are

\[
R'_p=\operatorname{Min}\{r\setminus\{x_c\}:r\in R_p\},
\quad
R'_{1-p}=\operatorname{Min}\{r\in R_{1-p}:x_c\notin r\}.
\]

The action outcome operator is

\[
J_c(q)=
\begin{cases}
+1,&\varnothing\in R'_p\text{ and }p=0,\\
-1,&\varnothing\in R'_p\text{ and }p=1,\\
0,&\varnothing\notin R'_p\text{ and }\sum h_c+1=42,\\
V(h+e_c,R'_0,R'_1),&\text{otherwise}.
\end{cases}
\]

The terminal-completion test comes first, before draw or any post-win cofactor normalization. The value and complete W/D/L-optimal action set are

\[
\boxed{
V(q)=\begin{cases}
\max_{c:h_c<6}J_c(q),&p(q)=0,\\
\min_{c:h_c<6}J_c(q),&p(q)=1,
\end{cases}
\quad
M(q)=\{c\in\mathcal A(q):J_c(q)=V(q)\}.
}
\]

If the nonterminal carrier is empty of legal moves, `V=0`, `M=empty` by the full-board draw boundary. This is a completeness assertion for **W/D/L**, not strong-distance tie-breaking or literal winning-line provenance.

## 3. Constructive correctness proof without oracle input

**Assumptions/guards:**

1. Valid standard gravity/alternating/no-pass/first-win-stopped Connect Four physical input;
2. Qualified `q_o` congruence: exact residual antichain state preserves legal action names, immediate terminal status and deterministic q child under the local cofactors;
3. Empty mover residual is interpreted as **an immediate mover win** before any next turn; a filled board with neither winning completion is draw;
4. Only values, W/D/L-equivalent literal action sets and ordinary future behavior are claimed; history-specific proof resources, extra CPC/NDC reservations and individual terminal-line provenance are not part of the output contract.

**Proof:** Let \(m=42-\sum_c h_c\) be remaining cells. When \(m=0\), the legal non-winning board is draw. For \(m>0\), each legal action either terminates immediately with exactly the physical first-win/draw outcome or leads, by qualified q-cofactor congruence, to the uniquely corresponding ordinary q child with remaining count \(m-1\). By induction, the core value of every continuing child is its exact physical perfect-play value. Perfect play at the parent means choosing the maximum of the action values on P0's turn and minimum on P1's turn; thus the core computes the exact parent W/D/L. The attaining-action set \(M(q)\) contains **every** W/D/L-optimal literal move, including ties. Every recursive dependency strictly decreases \(m\), so recursion terminates with finitely many nodes even without memoization, symmetry or symbolic branching compression. QED.

There is **no** oracle premise, learned answer, global previously solved frontier, or hidden probabilistic state estimate in the proof. This does not infer that an actual run from the empty 7x6 board has been completed.

## 4. Independent executable implementation and comparison

A new deliberately small core implementation is in:

- `research/isograph/discovery/2026-10-16-algorithmic-core/exact-q-core.mjs`

Its `solve()` uses **only** current `h,R0,R1`, local legal actions, the two cofactor channels, terminal completion, recursive alternation and optional exact memoization. The separately authored physical control scans consecutive owned stones along four directions after each move, and does **not** use q antichains or precomputed values.

The control and frozen results are:

- `constructive-core-control.mjs`
- `CONSTRUCTIVE_CORE_QUALIFICATION_RESULTS_0_1.json`
- `CONSTRUCTIVE_CORE_PLAN_0_1.md`

Exact exhaustive first-win-reachable nonterminal domains:

| Board | Physical positions compared | Physical action edges checked | Exact q states solved | W/D/L/action-set/cofactor errors | States with multiple W/D/L-best actions |
|---|---:|---:|---:|---:|---:|
| 4x3 Connect-3 | 4,631 | 11,818 | 3,734 | 0 | 2,321 |
| 4x4 Connect-4 | 134,289 | 304,574 | 34,094 | 0 | 56,763 |
| **Total** | **138,920** | **316,392** | **37,828** | **0** | **59,084** |

The independent physical reference and q core agree on **every** reachable nonterminal board state's absolute W/D/L, exact per-action value vector, complete W/D/L-optimal action set, and each one-ply terminal or successor q. Thirty-two reflection transports were checked per small domain, with zero disagreements.

Core recursion cost by complete bounded domain:

| Board | q recursive calls | q successor evaluations | q states with more than one legal action |
|---|---:|---:|---:|
| 4x3 c3 | 7,837 | 10,232 | 3,556 |
| 4x4 c4 | 94,501 | 100,764 | 33,704 |

These counts are important negative evidence: **the qualified core still branches.** A single returned value or action-set result does not mean the computation itself is unbranched.

Standard 7x6 qualification, **not** a root solve:

- seeded oracle-blind first-win-avoiding legal playouts, seed `0x4c2a3026`;
- 12 distinct nonterminal rank-35 positions, found in 13 attempts;
- q-only recursion compared with independent direct-physical recursion on each **remaining-game suffix**;
- 12/12 complete parent W/D/L and action vectors match, zero disagreements;
- 173 q states constructed across the 12 bounded suffix evaluations;
- complete fixture sequences, per-position values, best columns and costs are in the machine evidence.

### Evidence and performance limitations

Execution used **isolated JavaScript V8** evaluating the exact committed module bodies with import/export syntax removed and minimal Node/performance shims. All specialized checks were internal; they are **not** Node26/Actions end-to-end qualification, mechanized machine proofs or independent external reproduction. The mathematical proof rests separately on domain rules and qualified q congruence; finite test counts support the implementation only.

The total isolated run took about 0.37s (4x3), 7.02s (4x4 including exhaustive independent checking), and about 0.02s (12 late 7x6 suffix cases), on this execution path. These are not hardware-normalized solver benchmarks.

### Exact reconciliation with the older 4x4 q-census

The historical `RESIDUAL_Q_COLUMN_ORBIT_RESULT.md` counted **34,105**
orientation-sensitive classes on **161,029** physical states. The new
q-only recursive reference holds **34,094 nonterminal q states** across
**134,289 nonterminal physical states**. This is **not** a mismatch:

```text
physical:  134,289 nonterminal + 26,740 first-win/draw terminal = 161,029
carrier:    34,094 nonterminal q + 11 terminal (rank,kind) tokens  = 34,105
```

The historical producer explicitly uses `'T:'+rank+':'+kind` for terminal
states. The new q solver instead returns exact terminal values on outgoing
actions, never memoizing those 11 absorbing rank/kind tokens as q states.
A fresh bounded direct physical census confirmed exactly 11 terminal tokens.
The observation, negative-scope classification and reproduction are preserved
in `TERMINAL_CLASS_ACCOUNTING_RECONCILIATION_0_1.json`.

### Falsification sensitivity — not just passing a common implementation

The independent physical-run-length control was also challenged with **three
deliberately defective q-core copies** on the complete 4x3 domain:

1. reverse the first-win terminal winner sign;
2. omit the owner-true landing-event cofactor;
3. omit the opponent-blocking cofactor.

The unmodified source passed; **all three defects were rejected** as
W/D/L or exact-transition discrepancies. The actual candidate core and
qualified sources were not modified. Reproducer and evidence:

- `constructive-core-mutation-control.mjs`;
- `CONSTRUCTIVE_CORE_MUTATION_RESULTS_0_1.json`.

This is an implementation-validator sanity control, not an independent
formal/mechanized proof.

## 5. What we have, and what we do NOT have

**Established for exact ordinary W/D/L / tie-retaining optimal actions:**

- complete constructive core and finite termination;
- exact local cofactor and terminal semantics under the qualified legal-q carrier;
- an executable oracle-free instance plus independent finite-rule controls;
- ability to return one result \((V,M)\), where \(M\) may contain multiple outcome-equivalent optimal moves.

**NOT established:**

- eliminating recursive branching, or eliminating recursion itself;
- an output-sensitive or polynomial-size universal symbolic predecessor representation;
- solving the standard 7x6 empty root or `44444` by this implementation within a practical budget;
- a compact positive CPC/NDC winning proof for the seven turn-6 responses;
- polynomial time/space, optimal implementation or minimality;
- preserving history-specific proof identity, deadline/resource certificates or literal terminal winning-line identities by q alone;
- independently reproducing the new source in a maintained Node26/CI environment.

## 6. Correct next objective — branch elimination as optional stronger property

The exact core answers **what game-value algebra is sufficient**. The remaining interesting improvement is how to evaluate it without separately recursively expanding all strategic alternatives.

Two distinct targets must not be confused:

1. **Exact value compression:** many physical histories collapse to one q and many equal-W/D/L actions may appear in one output set. Existing G2 and favorable residual-order reductions are correct where guards hold, but knowing ties only **after** independently computing their values does not save their computations.
2. **Exact branch-composition operator:** produce a compact algebraic object carrying `exists` and `forall` obligations, with first-win/race/realizability guards intact, and evaluate that object by **one continuing recursive step** or a nonrecursive direct transform rather than constructing separate sub-solves. The Bellman antichain semiring already expresses this logically; an operationally compact composition/multiplication without Cartesian distributive expansion is the OPEN engineering/research seam.

Do **not** make branch elimination, recursion elimination or minimality a prerequisite for declaring the core established. Do **not** silently count an internally branching operation as unbranched merely because its API returns a single result.

The next highest-value experiment should target **one compact verified alternation operator at a time**, comparing its exact q/action outcome against the proven recursive reference on a bounded domain, recording generator/intermediate widths and actual number of independently evaluated continuation subproblems. Advance or reject it based on exactness **and** true dependency reduction.

## Prior authority/evidence

- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md` (qualified authority);
- `research/isograph/qualification/Q_CONGRUENCE_FINAL_QUALIFICATION_0_2.md`;
- `docs/research/2026-10-16-connect4-algorithmic-core-formula.md`;
- `docs/research/2026-10-16-oracle-relative-proof-algorithmic-core.md`;
- `docs/research/2026-10-16-oracle-compiled-action-value-frontier-theorem.md`;
- `research/isograph/discovery/2026-09-18-policy-frontier/RBA_ALGEBRA_CORE_CHECKPOINT_0_1.md`.

No new C4-R claim ID is allocated; the conclusion reclassifies existing known exact semantics according to the owner's corrected definition of **algorithmic core**, not a new gameplay mechanism.
