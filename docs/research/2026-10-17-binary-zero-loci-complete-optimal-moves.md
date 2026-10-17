# Two nested binary zero loci EXACTLY reconstruct WDL and ALL optimal literal moves

**Date 2026-10-17 Pacific. Owner primary objective ZERO strategic branching, standard W=7,H=6,K=4 first, W/H/K symbolic for later generalization.** Status: exact Boolean derivation / CANDIDATE source-normal-form target, frozen before further 7×6 physical controls. NOT a total source-derived zero-branch solver. Game-theory IsoGraph authority 1.2 unchanged.

## 1. Exact phase-NAND kernel

For a legal nonterminal source q, let p=n mod2, legal literal action set A(q), and ordinary P0-relative V∈{-1,0,+1}. Define threshold bits f_+=[V=+1], f_0=[V>=0], and g_t=f_t XOR p for t∈{+,0}. At every ordinary nonterminal q the EXACT equation is

    g_t(q) = 1 XOR PRODUCT_{a∈A(q)} g_t(next(q,a)).

The two full-game g bits are distinct channels, with same gate but different full-board DRAW terminal tags. Each decisive first-win terminal for either player has (g_+,g_0)=(0,0); a drawn full terminal at even W*H=42 has (0,1). At a general W,H, terminal DRAW (g_+,g_0)=(p_terminal,1 XOR p_terminal). Both g recurrences are ordinary full-future game-value statements; merely writing them creates no zero-branch method.

## 2. The source-independent exact ZERO-LOCUS output theorem

Define for each threshold t the COMPLETE set of original legal literal column labels whose child transformed bit is zero:

    Z_t(q)={a∈A(q) : g_t(next(q,a))=0}.

As a Boolean identity, g_t(q)=[Z_t(q) nonempty]. This follows from the NAND product without assuming equal child games or any order/pruning. The sets are nested because threshold f_+<=f_0 but XOR flips inequalities on P1 turns:

**P0 to move (p=0, children p=1):**

    Z_+(q) ⊆ Z_0(q).

    If Z_+ nonempty:
         V(q)=+1, M*(q)=Z_+.
    Else if Z_0 nonempty:
         V(q)= 0, M*(q)=Z_0.
    Else:
         V(q)=-1, M*(q)=A(q).

Reason: on children p=1, child g_t=1 XOR f_t, so g_t(child)=0 iff the literal action achieves threshold t. Highest achievable threshold determines P0 MAX and its entire tied-best set.

**P1 to move (p=1, children p=0):**

    Z_0(q) ⊆ Z_+(q).

    If Z_0 nonempty:
         V(q)=-1, M*(q)=Z_0.
    Else if Z_+ nonempty:
         V(q)= 0, M*(q)=Z_+.
    Else:
         V(q)=+1, M*(q)=A(q).

Reason: children have p=0, hence child g_t=f_t; g_t(child)=0 precisely when that move FAILS to achieve threshold t for P0. Lowest resulting WDL determines P1 MIN and its ENTIRE tied-best set.

**This is an exact identity for (V,M*) at EVERY first-win-stopped legal q. It does NOT give Z_t(q) from source q by itself**. Computing Z_t by recursively valuing inequivalent child futures would violate the owner's zero-branch target. The research target is a direct SOURCE GEOMETRIC PARITY NORMAL FORM for the ZERO LOCI, not a table lookup, child-value enumeration, or a symbolic QBF/BDD with hidden strategy fanout. Already proven source-first exact labels/intervals/equivalence can contribute sound zero memberships, but NO inferred tie without exact equal values.

## 3. Exact draw factorization

Define draw bit d(q)=[V(q)=0]. Then, since f_+<=f_0,

    d(q)=f_0(q) XOR f_+(q) = g_0(q) XOR g_+(q).

Thus ordinary W/D/L is entirely recovered by two binary bits, with turn phase factored:

    P0-win bit = g_+(q) XOR p(q);
    DRAW bit   = g_0(q) XOR g_+(q);
    P1-win bit = 1 XOR (P0-win bit) XOR (DRAW bit).

The two kernels differ only at terminal DRAW boundary tags. For a nonterminal q,

    d(q) = PRODUCT_a g_0(q_a) XOR PRODUCT_a g_+(q_a).

For any fixed ordering of current original literal actions a_1,...,a_m, this yields a GF2 telescoping/pivotal decomposition

    d(q) = XOR_{i=1..m} [ d(q_ai)
               * PRODUCT_{j<i} g_0(q_aj)
               * PRODUCT_{j>i} g_+(q_aj) ].

Algebra proof: for A_i=g_0(child_i), B_i=g_+(child_i), product(A)-product(B) over GF2 telescopes by replacing one factor A_i for B_i at a time; A_i XOR B_i=d(child_i). **The operator still contains child game outcomes**, so this is a proof target about source-derivable critical draw channels, not a discovered algorithm. No independent successor game value may be computed inside any claimed source producer.

## 4. Canonical source scope

At real standard7×6 q=44444, P1 moves on absolute turn6. Reflection yields four possible full-future original-label classes {1,7},{2,6},{3,5},{4} but does NOT prove the classes scalar value-equal to one another. Because P1 moves, the two nested unknown ZERO loci satisfy

    Z_0(44444) ⊆ Z_+(44444).

Either set must be a union of actual reflection-orbit literal columns, but the SOURCE mathematical obstacle remains deriving both COMPLETE memberships without separately evaluating the four inequivalent future games. Root WDL and all best moves are UNKNOWN. A hypothetical formula that only gets the NAND product (whether some zero factor exists) may establish ROOT threshold but cannot reconstruct all tied-best moves unless it also derives WHICH zero factors occur.

## 5. Frozen 7×6 physical falsifiers

1. On REAL standard 7×6 first-win-stopped nonterminal positions with MULTIPLE legal actions and known unrestricted WDL from an independent ordinary physical minimax reference, build g_+/g_0 by separately independently executing a reference binary NAND recursion (REFERENCE ONLY; both branch). Check the two nested Z sets, exact root WDL, and EVERY original legal optimal move against the physical reference, including draws and ties.
2. At each tested source, ensure the forbidden raw threshold pair (f_+,f_0)=(1,0) is never returned. Check binary DRAW XOR identity, terminal first-win tag, drawn full-board tag.
3. Canonical 44444 chronology and four reflection groups: record symbolic loci UNKNOWN, do not run unbounded full-game search or invent values.
4. Test pure finite Boolean algebra for m=1..7 current legal columns if helpful, but genuine 7×6 source results control progress; NO varying small-board geometries.
5. Exact source-zero-locus closure not found => STATUS INCOMPLETE. No game-value oracle, hidden finite policy enumeration, BDD/QBF, or branching in a claimed source algorithm. Compare source math with full preexisting one-lane direct rules and report honest incremental domain.

**Prior art:** terminal-tagged g NAND resembles the ordinary N/P kernel of an acyclic impartial game, but draws require the second channel and gravity/winlines couple columns; no Sprague–Grundy XOR-of-column-piles follows. This representation is exact Boolean algebra, not a novel winner theorem.
