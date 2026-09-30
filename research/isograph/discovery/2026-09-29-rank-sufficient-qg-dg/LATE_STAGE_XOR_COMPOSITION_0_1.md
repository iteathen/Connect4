# Late-stage XOR composition hypothesis — 0.1

**Status:** active discovery lens; not a theorem and not a preferred final algebra  
**Research direction:** Joshua Oshiro  
**Parent objective:** (V_G(P)=D_G(Q_G(P)))

## Corrected placement of XOR

Do not test XOR primarily on raw board coordinates.

The active hypothesis is:

[
P
	o 	ext{exact rank-local reductions}
	o Q^*
	o {C_i}
	o phi_G(C_i)=g_i
	o igoplus_i g_i
	o D_G
	o V_G(P).
]

XOR, if it exists, is suspected to be a **late composition law** over already reduced components.

The unknown may be the component definition (C_i), the valuation (phi_G), the codomain of (g_i), or all three.

## Current reduction frontier

Current exact/strongly supported bounded reduction evidence includes:

- R: support-release / turn-slot necessary-feasibility deletion;
- F: universal nonterminal-frontier blocking deletion;
- G: hereditary final-board-mover cap deletion;
- full column transporter quotient (Sigma=S_W) over the compiled q transition algebra;
- current leading bounded transporter-aware Q-F/Q-A/Q-V candidate:
  [
  q_{Sigma RFG}=[G(F(R(q_o)))]_{S_W}.
  ]

Raw support XOR is not this object.

## Raw XOR evidence: corrected interpretation

Existing exact bounded evidence shows:

- (p(P)=(sum_c h_c)mod2 = (igoplus_c h_c)&1);
- raw height XOR (X_h=igoplus_c h_c) is not recursively closed;
- raw (X_h), (X_h+p), and nearby unreduced height summaries do not determine R/F/G decisions or Q-F/Q-A/Q-V across tested controls.

These are **operand-level falsifiers**.

They reject those raw operands as sufficient representations. They do **not** falsify XOR over a later reduced component valuation.

## Falsification hierarchy

For a frozen component extractor (C(Q^*)={C_i}):

1. If the **full component multiset** is not sufficient for a target semantic level, reject that component decomposition for that level.
2. If the full multiset is sufficient but the **component-type parity vector** is not, then no valuation
   [
   phi:C_i	o (mathbb Z_2)^d
   ]
   composed by XOR can be sufficient for that fixed component definition.
   Reason: every such XOR depends only on multiplicity parity of each component type.
3. If the parity vector is sufficient, then an XOR realization exists at least in the nonminimal one-hot basis. The next problem is to minimize the valuation/codomain.
4. A failure at steps 1 or 2 does not reject XOR for a **different, later, or finer component definition**.
5. A successful bounded fit is not promoted beyond scope without fresh holdouts and proof.

## First component hypothesis

After R/F/G, form the residual-incidence hypergraph:

- column vertices;
- one hyperedge for every surviving owned residual, labeled by owner;
- each column vertex carries its support height.

Take connected components of this hypergraph, including isolated columns.

Each component is canonicalized under arbitrary permutation of its own columns, retaining:

- component support heights;
- owned surviving residual hyperedges.

This componentization is:

- rank-local;
- post-safe-forgetting;
- invariant under the full column transporter action;
- independent of solved W/D/L;
- independent of future-tree classes.

It is a natural candidate for an **irreducible interaction component** because no surviving residual crosses between distinct components.

## Initial representations to compare

For (Q^*=RFG(q_o)):

- **C-MULTI:** full multiset of canonical component types;
- **C-PARITY:** odd-multiplicity set of component types + global stone-count parity (p);
- **C-MOD4:** component multiplicities modulo 4 + (p);
- **Q-SigmaRFG:** full orbit-normalized control.

C-PARITY is the universal finest test for literal XOR of component-type valuations into any exponent-2 Abelian group.

## Sufficiency levels

Test separately:

- **Q-F:** transporter-aware action/transition semantics;
- **Q-A:** exact transported action values / decision interface;
- **Q-V:** scalar exact value.

A candidate may fail Q-F and remain useful for Q-A or Q-V.

## Direct versus recursive realization

Also test independently:

- direct recomputation from current reduced position;
- whether the representation admits an exact local update
  [
  Q_{r+1}=F_G(Q_r,m_r,G).
  ]

No direct-success result implies recursive closure automatically.

## Derivational compression

The campaign also tracks description complexity.

If one component law derives several separate safe-forgetting facts, that is a reduction even without a large class-count change.

Conversely, if R/F/G require genuinely independent structural predicates after all tested reductions, retain that as evidence about irreducible dimensionality.

## Nonclaims

This document does not claim:

- that residual-incidence connected components are final;
- that XOR is fundamental;
- that component identity should ignore ownership/support;
- that q_{Sigma RFG} is minimal;
- that a bounded XOR fit generalizes;
- that failure of the first component extractor rules out later XOR composition.
