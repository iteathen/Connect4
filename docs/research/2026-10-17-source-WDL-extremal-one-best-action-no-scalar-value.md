# Exact Level 2 best action from source-proved WDL partial order: no scalar outcome or other action values required

**2026-10-17 Pacific. Canonical research owner:** research/semantic-quotient. **STATUS: mathematical selection theorem** frozen before actual original 7×6 controls. Existing either-mover source future-simulation transporter is frozen and separately historically tested; no new strategic WDL search and no assumed total Connect4 solution. W,H,K retained symbolically; current primary W=7,H=6,K=4.

## Root best action without root scalar WDL

Let q=(h,R0,R1) be any genuine original nonterminal source, p=n mod2 current mover, A(q) all exact original legal literal columns, J_a(q)∈{-1,0,+1} the ordinary unrestricted first-action future WDL relative P0. Suppose one OR more previously sound purely source-derived full-future **weak value-order** certificates establish relationships:

    a <=_0 b  => J_a(q) <= J_b(q).

These are WDL-value inequalities only, not full future-game isomorphisms. They may be obtained via an exact original source cofactor simulation under a capacity-preserving column permutation, including first-win, terminal guards and both owner residual upsets. Let G_S(q) be the directed graph with legal action vertices and edges a->b only where this certified inequality exists. Its reflexive transitive closure is also sound due to ordinary ordering of {-1,0,+1}.

**SOURCE-EXTREMAL VALID CONTINUATION THEOREM:**

    p=P0: If one original legal action a receives a directed
          path from EVERY legal b, then a is Level2 BEST:
          ∀b, J_b<=J_a.

    p=P1: If one original legal action a reaches EVERY legal
          b by directed paths, then a is Level2 BEST:
          ∀b, J_a<=J_b.

This certifies exact optimality of ONE action **without deriving V(q)**, a numeric value for a, ANY other action's WDL, a policy tree, or a complete set of tied best labels. An SCC may provide several equal-best labels but the owner operation only requires selecting one (fixed smallest original literal among qualifying vertices). If no extremum has full certified coverage, output INCOMPLETE; absence of a source order edge is NOT evidence of strict inferiority or equality.

## Why this differs from old complete-set source closure

Old source-optimal-set-separation.mjs demanded certified membership/inferiority for EVERY original label and root scalar value. That was necessary for returning the complete Level2 information set but is stronger than the owner’s revised operational goal. **Here, a spanning reachability extremum in a purely qualitative source partial order suffices even if every action interval remains [-1,0,+1].** This targets sources where none of the previous WIN/LOSS/DRAW scalar certificates applies.

Root M* is a nonempty exact set of optimal first actions. A proof that a lies in M* says nothing about other ties, and must be tagged VALID_CONTINUATION, NOT COMPLETE_LEVEL2_SET. The ordinary source q and pairwise transporter must be faithfully first-win-, terminal- and owner-aware. The graph's transitive closure is a static proof-composition operation over at most W action LABELS, not game-tree search.

## Frozen initial implementation and physical falsifier

1. Build pure source-only operator using the previously frozen createEitherMoverExactTransport from original q. No root or action WDL oracle, no future game recursion, NO alternate game value queries. Source transporter may create some symbolic first-action q cofactor descriptions and enumerate static column PERMUTATION proof witnesses; count this explicitly as source proof search rather than pretending zero total computation. Return VALID_CONTINUATION only if the complete root legal action set is connected to some P0 upper-/P1 lower-order extremum by sound source edges, otherwise INCOMPLETE.
2. On genuine standard original7×6 first-win-stopped physical q, freeze and use a separately implemented PHYSICAL full recursive minimax only after the source emits a selected best action. Check scalar V(q) and J_a(q), and record if ordinary best membership holds. Seek source-certifiable cases that were INCOMPLETE under existing unified source WIN/DRAW/LOSS v2 to measure NEW operational coverage (same q corpus).
3. Test canonical 44444 with source-only positive constraints and record INCOMPLETE as appropriate, not conjectural scalar outcome. Any positive source theorem that produces contradictory physical reference must be downgraded and investigated.
4. Do not use uncertain STACS greedy lemma gravity adaptation as qualification of this result; the exact certified source transport inequalities are a DIFFERENT grounded hypothesis, and the STACS terminal-column detector remains UNQUALIFIED.

## Resource/epistemic note

The old either-mover fixed-column transporter may enumerate many STATIC COLUMN PERMUTATION candidates. The owner forbids branching into independently valued strategically inequivalent FUTURE GAMES, and this selection theorem meets that semantic condition. Whether a future closed-form direct source order formula can also eliminate combinatorial proof-candidate enumeration is a SEPARATE stronger task. The current result is not a mathematical proof general arbitrary standard 7×6 q admits an extremum whose ordering is source-certified. Canonical 44444 remains unknown until tested.
