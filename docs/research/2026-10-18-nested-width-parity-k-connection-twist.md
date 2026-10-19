# Nested width parity: exact K-dependent horizontal/diagonal phase twist and dimensional limits

**Date:** 2026-10-18 Pacific. **Owner research direction:** Josh Oshiro. **Canonical branch:** research/semantic-quotient. **Status:** exact source-algebra deductions + frozen finite falsifier protocol, research-only; not a qualified IsoGraph gameplay authority or a discovered general \`V(W,H,K)\` function.

## Research question

How can width parity influence perfect-play Connect-K through *nested per-column height parity*, and why do the published K4 empty-board outcomes exhibit much stronger vertical 2-step regularity than horizontal 2-step regularity? Preserve the differentiation between **parity identities**, **structural winning-line constraints**, **defensive resource implications**, and **perfect-play WDL**. Do not infer scalar outcomes from phase equivalence. Previous four-ribbon, CPC, support-pair and width-path results are premises.

## 1. An exact width-dependent constraint on the vector of column phases

In an original gravity-legal (nonterminal) position, let h=(h_0,...,h_{W-1}), n=sum h_c, eta_c=h_c mod2 and mover phase p=n mod2. Define

    kappa_c = (n-h_c) mod2 = p XOR eta_c.

Then

    XOR_{c=0}^{W-1} kappa_c = ((W-1) mod2) * p.

Hence:
- W ODD => parity of the full kappa vector is ALWAYS 0.
- W EVEN => parity of the full kappa vector equals the current mover phase p.

This is a literal algebraic form of nested width/column parity, not a WDL selector. A source move in column a increments n and h_a, so

    kappa'_c = kappa_c XOR [c != a].

When W is odd this flips W-1 (even) phases; when W is even it flips W-1 (odd) phases.

## 2. A LOCAL width-path phase edge law

Define adjacent column boundary/seam bits

    delta_c = kappa_c XOR kappa_{c+1}
            = eta_c XOR eta_{c+1},     c=0..W-2.

A move in column a has the **exact** effect

    delta'_c = delta_c XOR [a=c] XOR [a=c+1].

Therefore a column move toggles only its adjacent one/two seams, although it toggles kappa for *every other* column. Under the source-only unconstrained path-transport quotient, total parity is the only width-path invariant; the game-sign cannot be deduced from delta alone. Boundary availability and integer pair depth must remain separate.

For a length-K span from column c through c+K-1, the seams telescope:

    XOR_{i=0}^{K-2} delta_{c+i}
       = eta_c XOR eta_{c+K-1}.

The internal seam pattern still determines all K-1 pointwise ownership-equality constraints, not merely its endpoint XOR.

## 3. New explicitly K-dependent horizontal versus diagonal phase twist

For a supplied gravity-legal hypothetical continuation (as source algebra, stopping at first winner for actual gameplay), let e_i=(c+i,r+s*i), i=0..K-1, with s=0 (horizontal), +1 (ascending diagonal), or -1 (descending diagonal), and all K cells currently FUTURE. Let beta_i be the parity of OTHER-column future placements preceding e_i. The already established exact source owner identity is

    chi(e_i)= [r+s*i] XOR kappa_(c+i) XOR beta_i.

Write d=s mod2 (so horizontal d=0, BOTH diagonal orientations d=1). Adjacent equality chi(e_i)=chi(e_(i+1)) holds exactly iff

    beta_(i+1) XOR beta_i = delta_(c+i) XOR d.

For an entire monochromatic K-line, all K-1 constraints must hold and the first owner must match the claimed player. XORing all steps gives the necessary *endpoint parity law*

    beta_(K-1) XOR beta_0
      = eta_c XOR eta_(c+K-1) XOR (d * (K-1) mod2).

Thus for any K:
- horizontal endpoint twist = eta_first XOR eta_last;
- either diagonal endpoint twist = eta_first XOR eta_last XOR ((K-1) mod2).
- EVEN K: diagonals require the OPPOSITE endpoint cross-column-interleaving parity from horizontal for the same two column-phase endpoints.
- ODD K: endpoints have the SAME parity condition; the individual K-1 interior equations still differ.

**This is an exact connection-length parity interaction missing from any classifier of only W mod2 and H mod2.** It does not imply that an actual winning line can be formed under adversarial play. Every beta is constrained by column precedence and legal alternating choice, so no independent Boolean assignment of beta bits may be called a realizable strategy.

At the EMPTY q, eta=0 and kappa=0, so every horizontal K-window requires beta CONSTANT across its adjacent events to be monochromatic, while every diagonal K-window requires beta to ALTERNATE at every adjacent step. On even K the diagonal end phase differs from horizontal; on odd K it agrees at the endpoints but differs internally.

## 4. Exact two-row extension: parity invariant but new geometric winning requirements

For any fixed q supported on H rows, the same historical q embedded at the BOTTOM of H+2 rows has remaining capacities

    H-h_c=2m_c+epsilon_c
    (H+2)-h_c=2(m_c+1)+epsilon_c.

Every unmatched/resource parity epsilon_c is unchanged and each column has exactly one additional pair. Existing column eta/kappa and seam delta are unchanged. The new TOP two rows generate new winning-line geometry rather than only more copies of existing lines.

For W>=K, H>=K, a single extra rightmost column creates

    4H-3(K-1)

new K-window lines, and two extra rows create

    L(W,H+2,K)-L(W,H,K) = 8W-6(K-1)

new lines. (Symmetric two-column geometric growth is 8H-6(K-1).) These counts are for generated original line incidence; they say nothing about strategic equivalence of the added spaces.

A decisive archived falsifier to **unconditional** height+2 WDL equivalence is K4: 10x4 is P1-winning while 10x6 is P0-winning, despite identical empty-column parity bits. Therefore every exact height+2 outcome theorem needs more than the epsilon invariant: new-line obligations, boundary contracts, strategy effect, or a domain-specific guard.

## 5. Known finite outcome evidence is validation, NOT theorem premises

Pinned original K4 outcomes: \`research/isograph/discovery/2026-10-18-board-dimension-outcomes/SOLVED_K4_EMPTY_BOARD_WIDTH_HEIGHT_CENSUS_0_1.json\` (52 published, 38 blank among 4<=W<=12,4<=H<=13).

Same W,H PARITY categories can have contradictory WDL:
- even W/even H: (6,6) P1 vs (10,6) P0;
- odd W/even H: (7,6) P0 vs (9,6) P1;
- even W/odd H: (6,5) DRAW vs (8,5) P0;
- odd W/odd H: (7,7) DRAW vs (9,7) P0.

So V cannot equal a function ONLY of the two dimension-parity bits (nor of empty \`eta\` alone). The exact 32/35 reported H-to-H+2 matches and 15/32 W-to-W+2 matches motivate a parameter-dependent extension theory, not extrapolation into blanks.

## 6. Mechanism candidates, ordered

**NWP-1: support-aware boundary contract algebra (priority).** At a cut between columns, new horizontal/diagonal K-windows involve at most the last K-1 columns of the old side. Preserve original winning-line residual incidence on that interface, local seam delta, global mover phase, and the integer number of complete support pairs m_c. Prove conditional exact statements about compatible defensive responses/forced wins without constructing future game-value branches. Source geometric interface locality is proved; strategic sufficiency is OPEN because moves can be made in arbitrarily separated columns while sharing the global alternating clock.

**NWP-2: guarded two-row neutral-pair extension.** Give explicit sufficient conditions under which the two new rows can be paired into no-new-strategic-consequence blocks. Crucial guards: new K-windows, player/source obligations crossing the old/new boundary, first-win stop, gravity release. Need a STRATEGY-preserving extension/retraction, not just matched epsilon or static geometry. The (10,4)->(10,6) value change falsifies an unguarded extension immediately.

**NWP-3: odd-H P0 no-loss:** 24/24 published odd-height outcomes are P0 or DRAW, zero P1. Try a dimension-uniform P0 defensive pairing/stealing theorem that preserves both diagonal support obligations and adaptive opponent choice. This is a strict conjecture, not a mathematical consequence of kappa or epsilon.

**NWP-4: connection-length parity bifurcation.** Repeat K=3/4/5/6 exact small-board results and search for regimes where even/odd K twist changes available structural proof certificates. No K≠4 empty-board oracle outcomes are present in the current K4 table. Frozen symbolic theorem above is independent of outcome sampling.

Do not prioritize pure XOR-only WDL classifiers, dimension parity lookup tables, height-only thresholds or static full-word payoff quotients: these are insufficient by known original physical counterexamples. Retain parity as useful substrate for guarded outcome certification.

## 7. Freeze before physical checks; qualification contract

The next source-only regression must independently generate actual W,H,K winning lines, future gravity-legal event words, verify chi, kappa, seam updates, every individual K-line phase condition and the exact even/odd K endpoint twist. Include H+2 geometry increment for W,H>=K and a deliberately incorrect diagonal-no-twist negative control. This validates only the combinatorial identities, not WDL. The source math above is a derivation independent of oracle outputs. All unknown outputs stay INCOMPLETE; no solver/qualified IsoGraph authority edits.

**Engine applicability (secondary):** local seam-update and K-window boundary equations may be cheap owner/constraint metadata, but they are not admissible WDL node cutoffs by themselves. First integration requirement is a separate mathematically guarded exact outcome or dominance theorem; demonstrate net end-to-end solve-time gain under the current IsoMax/BSFP/SUT performance authority. Disposition: deferred until an exact strategic consequence is established.
