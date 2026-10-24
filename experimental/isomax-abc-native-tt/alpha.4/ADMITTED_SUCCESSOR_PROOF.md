# Admitted successor FIRSTWIN exclusion (alpha.4 hypothesis and proof)

**Scope:** exact Connect Four K4, legal gravity, alternating owners, first-win-stopped nonterminal state, dimensions 1..10. No solved values or opening book. This optimization changes no source/TT identity.

Let `Immediate_p(q)` denote the set of currently legal gravity landing columns where mover `p` can complete an original K4 on that move. At an ingressed root `q`, evaluate this set. An immediate win terminates `q`, so below a recursed nonterminal node the current mover `p` has `Immediate_p(q)=∅` by induction.

Let the other owner be `d`. To search any child after `p` claims its current landing site `s`:

1. If `Immediate_d(q)` contains two or more different columns, `p` is already lost (because `p` has no immediate win); do not recurse.
2. If `Immediate_d(q)={c}`, the sole admissible response claims column `c`, blocking the old `d` immediate winning landing. All other moves are lost; do not recurse them.
3. If `Immediate_d(q)=∅`, no old `d` immediate winning landing exists.
4. For a proposed move into site `s=(c,h_c)`, independently rule out a `d` K4 whose three other physical sites are already `d`-owned and whose sole missing site is the newly exposed site `(c,h_c+1)`. This is the exact source-grade-one / physical-other-three-site **poison** test. If such a K4 exists, the move is losing without recursion.
5. The parent's zero own-immediate guard ensures `p` does not FIRSTWIN at site `s`, so a nonterminal child is legal to recurse.

**Lemma:** Every child admitted after guards (1)-(5) has `Immediate_d(q')=∅`.

**Proof.** Only column `c` changes its landing site; every other column has the same playable frontier. Claiming `s` by `p` cannot create a new viable original `d` K4, because it can only block original `d` lines that contain `s`. In any unchanged column, a `d` immediate win at `q'` would already have existed at `q`, contradicting guard (2) or (3) and the chosen response. In column `c`, the unique newly playable site is immediately above `s`; guard (4) excludes any original `d` K4 with precisely this remaining site. Thus `d` has no immediate win at `q'`. The proof is independent of the count and orientation of original K4 lines, and independent of solved outcomes. ∎

Hence, on **recursive** `node()` entries, the current mover's own immediate-win check is logically unnecessary. A narrow opponent-only frontier scan suffices for forced response and dual opponent threats. The **root** must still perform both-player immediate-win checks because supplied histories have no admitted-parent guard.

**Falsifiers:** any legal firstwinnerfree parent with zero mover immediate wins; a legal move admitted under guards (1)-(4); and a genuinely legal immediate K4 by the child mover. Such a case would falsify either the lemma, the rank-local ready-site kernel, or its placement/admission implementation. Sampled independent physical controls are useful regression evidence but are not the logical basis of the proof.

This is an implementation invariant / exact geometry-tactical lemma, not a general solution of EMPTY or an adoption/qualification performance claim. Full-root CPU time is the selection gate.
