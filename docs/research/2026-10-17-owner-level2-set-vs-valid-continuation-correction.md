# Level 2 full information set vs one valid Level 2 continuation

**Date:** 2026-10-17 Pacific. **Owner correction:** The Level 2 information object is by definition the entire set of moves attaining the best available outcome, but a valid continuation of play needs **only one certified member**. This corrects an overly strong operational research gate in previous no-search studies, without changing the information-level taxonomy or game theory. Canonical research branch: `research/semantic-quotient`. Board focus: actual W=7,H=6,K=4; formulas symbolic in W,H,K.

## 1. Exact separation

For legal nonterminal original source q=(h,R0,R1), current mover p, and declared opponent model M, let A(q) be all original literal legal columns and U_M(q,a) its outcome-tier score, with WIN > DRAW > LOSS under the specified perfect-opposition or unknown-quality opportunity semantics.

Let

    U*_M(q) = max_{a in A(q)} U_M(q,a)
    B_M(q) = { a in A(q) : U_M(q,a) = U*_M(q) }.

**Level 2 as an INFORMATION RESULT** is the full set B_M(q). Reporting its complete membership is a stronger output contract and must not be claimed from a single witness.

**Level 2 as a VALID PLAY CONTINUATION** requires only

    a* in A(q) AND U_M(q,a*) = U*_M(q),

with a sound certificate for the membership. Other equally best moves may remain **UNKNOWN**; the algorithm may play a* without calculating or listing them. This does not lower the standard of proof for a*: the move must actually achieve the best attainable outcome under the chosen opponent model.

If one or more individually certified best moves are found, a routine may return ONE, or any proved nonempty subset, marked `VALID_CONTINUATION` or `PARTIAL_BEST_SET`. Only when EVERY literal legal label's membership/nonmembership is certified may it return `COMPLETE_LEVEL2_SET`. A legal move whose optimality is unknown is NOT a certified valid Level 2 continuation.

## 2. Proof-strength consequences

**WIN tier:** A single source-certified forced victory (PERFECT model), or source-certified achievable victory (UNKNOWN optimistic model), is automatically top tier: no higher outcome exists. Thus ONE well-guarded winning action certificate is sufficient for a valid L2 continuation, WITHOUT evaluating other actions for the purpose of selecting it. For PERFECT robust win, preserve all adversarial response quantifiers, gravity, first win and full original owner-line requirements; simply finding a cooperative winning history is NOT a forced win.

**DRAW tier:** A proof that action a guarantees / permits draw is NOT sufficient to call it L2-best unless higher WIN-tier is excluded at the ROOT under that same model. Such exclusion can come from a source invariant, a certified root outcome V=0 under PERFECT opposition, or a direct source opportunity impossibility proof under UNKNOWN; evaluating every other child strategically is not required if a universal root certificate exists.

**LOSS tier:** When the current player is certified to lose under PERFECT opposition from q, ALL current legal moves have the same losing outcome, because max over their WDL outcomes is loss. Hence any legal first move is a valid L2 continuation, and the COMPLETE L2 set is A(q) for FREE from that root certificate. Under UNKNOWN optimistic opportunity, LOSS fallback requires proving no winning or drawing path is attainable; then all moves are best by the declared outcome-tier rule.

**L1 outcome:** A valid WIN-tier continuation can sometimes be certified without a separate trivalent root-value computation, because a forced winner certificate establishes its associated root value. This does NOT imply that any unrestricted q can be solved without search or that all L1 outcomes are available from one winner witness.

**L3 duration:** The owner conjectures that selecting the fastest winning continuation or longest losing continuation may require additional strategic branching. This is still UNPROVEN in general. L2 valid continuation needs no timing information. Full-board DRAW always occurs at WH placements, so no drawn first-action duration tie-break exists.

## 3. Updated research success criterion

The immediate no-search exploration has two separate targets, not one all-or-nothing gate:

- **PRIMARY OPERATIONAL TARGET: ZERO-STRATEGIC-BRANCHING VALID L2 CONTINUATION.** From one arbitrary legal 7×6 source q and declared opponent model, derive and certify ANY one action a* in B_M(q), with ZERO separately valued inequivalent strategic futures. It need not compute B_M(q). Return an explicit `INCOMPLETE` when no action's membership is proved.
- **STRONGER INFORMATION TARGET: ZERO-STRATEGIC-BRANCHING COMPLETE L2.** Also derive ALL original legal action labels in B_M(q), including ties, with source proof of every inclusion/exclusion. This remains a distinct further achievement, not a precondition for a valid move.

A witness algorithm can be correct **on the sources where it returns a certified move**, while incomplete on other sources. "General total solution" requires a certified valid continuation for every genuine legal nonterminal source in the declared opponent model. It does NOT require full-set enumeration. Fast lookup or fewer solver branch nodes is not an acceptable substitute for the zero-strategic-branching proof.

**Proof-carrying output example:**

    {
      source: "q=(h,R0,R1)",
      evaluatedPlayer: "P0 or P1",
      opponentModel: "PERFECT or QUALITY_UNKNOWN",
      attainedTier: "WIN / DRAW / LOSS",
      validAction: "one ORIGINAL legal literal column",
      certificate: "source-derived invariant/first-win/response proof",
      claimStrength: "VALID_CONTINUATION",
      fullL2SetKnown: false
    }

The output above is a contract illustration, not a demonstrated algorithm. In a win case a positive source strategy certificate can prove membership without full enumeration. For draw/loss, retain the root exclusion guards.

## 4. Consequence for the seven ranked research candidates

Prioritize the rank-1 **inductive strategy/response invariant**, rank-2 **adaptive shared blocker** certificate, and rank-3 **dual winline potential** as ways of producing ONE certified action on actual standard7×6 q. A source-level proof that a single candidate move secures the best available outcome is now meaningful success even if its competitors are unresolved. Do not demand complete source optimal-action zero loci before experimenting with exact single-move witnesses.

The already-existing full q recursive algorithmic core returns all WDL-optimal moves with search. Previous guarded source strategies may already demonstrate single-move witnesses for restricted true7×6 sources; audit their exact guards before claiming coverage. Neither this correction nor a lone certificate proves a general no-search result; canonical `44444` unrestricted PERFECT-mode value and certified best continuation remain UNKNOWN until established from source.

**Preserve historical outputs:** Earlier notes requested full action masks. They remain correct as stronger full-information goals and valid negative results for full-set derivation, but their "INCOMPLETE unless ALL actions classified" rule is too strict as a gate for an operationally valid L2 continuation. Do not silently relabel partial output as a full L2 information result. Qualified IsoGraph 1.2 game semantics and the owner player/opponent model hierarchy are unchanged.
