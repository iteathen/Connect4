# Frozen algebraic check: antichain Shannon cofactor, dual blocker and exact 7-action fork contraction

**Date:** 2026-10-22 Pacific. **Canonical:** research/semantic-quotient, starting HEAD 77cceac097e800b5799dfd9020c5918ce12a9d09. **Direction:** Josh Oshiro. **Status:** frozen algebraic hypotheses, not a game-value certificate. Historical RBA already establishes fixed-action antichain cofactor sufficiency; this program derives explicit site Boolean/WSL formulas and a very restricted adversarial one-turn contraction, NOT a new universal winning-algorithm authority.

**No board-position enumeration** is allowed for checking these claims. Enumerate at most the 168 antichains of the FOUR-SITE subset poset (an algebraic truth-table of DNF normal forms), 128 possible seven-frontier threat flag vectors and the original fixed 69 K4/static 625-mask catalog. This is not the 7x6 gameplay state space.

## H1: cofactor acts on minimal antichain alone

For finite antichain A of nonempty site masks define monotone Boolean field F_A(z)=OR_{M in A} AND_{s in M} z_s. Allow the empty mask as the constant-TRUE terminal sentinel *only after an own claiming action*; an initial nonterminal WSL has no empty mask.

For any previously empty legal site e, hypothesize exact source-to-successor:
- mover p's field F'_p=F_p|_{z_e=1}, with canonical antichain A'_p=Min{M\e:M in A_p}; an empty output mask signifies an actual NEW winning line and firstwinner terminal.
- opponent field F'_{1-p}=F_{1-p}|_{z_e=0}, A'_{1-p}={M in A_{1-p}:e not in M}. No new previously dominated residual need be revived because a subset N containing e can never dominate an e-free M.

Hypothesis is a uniform monotone-Boolean-cofactor identity: it must hold on any finite subset poset, not rely on enumerating legal boards. Full static owner-normalized q_o retains actual support heights and move role; a field without those guards is not a full gameplay state.

## H2: dual static blocking hypergraph

Let B_A(w)=NOT F_A(1-w)=AND_{M in A} OR_{s in M} w_s. B_A describes all hypothetical sets hitting every currently unblocked p residual win-line. It is the exact De Morgan transversal dual but NOT a proof that a real defender has the moves, timing, supports or freedom to occupy such a set.

If p claims e, B'_p=B_p|_{w_e=0}; if opponent claims e, B'_p=B_p|_{w_e=1}. No terminal/policy equivalence from this static dual alone.

## H3: true Boolean pivotality / Fourier-ready differential

Split F_A(z)=Q(z_{other}) OR (z_e AND P(z_{other})), where Q=OR over masks NOT containing e and P=OR over e-containing mask tails. Then the exact characteristic-zero multilinear Boolean derivative (the two Shannon cofactors differ) is

  Delta_e F_A(z)=F_A(z_e=1)-F_A(z_e=0)
    =P(z_{other}) AND NOT Q(z_{other}).

This *attack through e AND absence of bypass* is a physically anchored cross-window interaction. Its Boolean Fourier coefficients can be arbitrarily higher order than individual four-site monomials, because the no-bypass factor is a PRODUCT of many other masks. A single raw incident-window potential does not determine this derivative.

## H4: two-ply robust forced-win field via complete universal-reply contraction

On any genuine firstwinfree 7x6 P1-turn position q, define frontiers e_c for columns with h_c<6; t_{p,c}(q)=F_p(q, z=1_{e_c}), the exact single-move K4 firstwinner flag. At most one frontier site per column. Define

  I_0(q)=OR_{c<d, c,d legal} (t_{0,c} AND t_{0,d});
  J_1(q)=OR_{d legal} t_{1,d}.

Hypothesis: [I_0(q)=1 AND J_1(q)=0] suffices for a forced P0 firstwin on P0's very next turn, regardless of P1's legal move: one P1 move can consume at most one of two distinct currently playable P0 completion cells, cannot create a P1 firstwin (J_1=0), and cannot cause a draw if a second empty completion cell survives. This is the classical fork theorem (already known to CPC), expressed as an exact **nonenumerative field certificate**.

Its P1-ALL elimination identity is purely seven-Boolean-variable algebra:

  AND_{d legal} (OR_{c legal,c!=d} t_{0,c})
       = OR_{c<d legal} t_{0,c} t_{0,d}.

Check all 128 seven-threat bit assignments and all legal frontier masks having at least one legal column. For a nonterminal game a legal column is guaranteed.

One P0 ply farther back, any q at P0 turn with a legal c such that an immediate Win0 occurs, or the actual P0 successor is live and satisfies [I_0 AND NOT J_1], is also a forced P0 win. This is a **very short-horizon subset of the true WIN field**, not a strategy from empty. Do not extrapolate beyond this fork certificate without proving an invariant/closed class.

## H5: static incidence cone caveat

All 69 original K4 windows generate exactly 625 distinct nonempty masks. For any fixed physical site e, at most 13 original lines contain it; the union of all nonempty masks sourced from those lines can still be much larger (anticipated maximum 129 unique masks), and the upward closure of affected masks under the subset-poset can reach many more (anticipated maximum 556 of the 625). Check exact original geometry only. This is an upper dependency cone; it is NOT actual simultaneous propagation size for every valid state.

## Success / falsification criteria

Exact checks H1-H5 and proofs must be recorded separately. If they pass, record genuine field-level Shannon closure and fork contraction, but mark compact **empty-root** C0/C1 invariant still OPEN and any static hitting-set potential NOT a perfect-play winner classifier. No game state exploration, search oracle or solved result inputs, no below-five carrier refutation, no CI/formal authority promotion.
