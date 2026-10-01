# RLC controlled-invariant / ranked controlled-invariant certificate theorem

**Date:** 2026-10-01  
**Version:** 0.1 frozen before instantiation audit  
**Status:** generic RLC theorem schema; research-side only  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Unify the recurring RLC proof shape behind current-state guard sets, forced compression, target-reservoir pairing, and phase transfer.

The generic proof object is not a Connect-Four-specific named tactic. It is:

\[
\boxed{
(\text{current state},
\text{live obligations},
\text{control resources},
\text{response policy},
\text{optional well-founded rank})
}
\]

The controller does not need a predicted move history. The controller needs a current-state resource that answers every adversarial transition, plus—when a win rather than safety is claimed—a finite progress argument showing indefinite avoidance is impossible.

This theorem refines the older

\[
\mathrm{Safe}+\mathrm{Progress}+\mathrm{PolicyTotal}\Rightarrow\mathrm{Win}
\]

architecture into an explicit rank-local certificate interface.

## 1. Macro-state interface

Let \(A\) be the controller and \(D\) the adversary.

A **controlled macro-state** is a legal nonterminal state \(q\) at an adversary decision point together with current-state structural data:

- \(O(q)\): live obligations that must remain controlled;
- \(C(q)\): currently available control resources;
- \(G(q)\): exact guards/premises under which responses are licensed.

These objects must be reconstructed from the exact current state or otherwise justified by an already-qualified exact handoff. They are not arbitrary history tags.

Let \(\mathcal D(q)\) be the legal adversary transitions from \(q\).

For \(d\in\mathcal D(q)\), let

\[
\rho(q,d)
\]

be the finite set of controller responses licensed by qualified structural rules.

A response macro-step is:

\[
q \xrightarrow{d} q_d \xrightarrow{r} q'.
\]

First-win precedence is part of the transition semantics.

## 2. Controlled-Invariant Certificate (CIC)

A set \(S\) of controlled macro-states is a **Controlled-Invariant Certificate** for \(A\) when every \(q\in S\) satisfies:

1. **adversary safety** — no legal adversary trigger used by the certificate is already a first win for \(D\);
2. **response totality** — for every legal \(d\in\mathcal D(q)\), at least one response \(r\in\rho(q,d)\) is exact and legal;
3. **obligation preservation** — the response blocks/discharges every obligation that could otherwise let \(D\) win before the next controller decision point;
4. **controlled re-entry** — the response either:
   - gives \(A\) an immediate first win;
   - reaches an allowed nonloss terminal such as draw, when only safety is being claimed; or
   - reaches \(q'\in S\) with \(O(q'),C(q'),G(q')\) reconstructed from the exact child.

Then \(D\) cannot force a win while the CIC policy applies.

For finite Connect Four:

\[
\boxed{\mathrm{CIC}\Rightarrow A\text{ has a nonloss/safety certificate}}
\]

with the exact terminal claim determined by the declared allowed terminal set.

The current guard-set theorem is of this form: \(\Gamma(q)\) is a renewable current-state control resource, but the guard-set theorem alone need not provide a rank forcing eventual \(A\)-terminal completion.

## 3. Ranked Controlled-Invariant Certificate (RCIC)

A CIC becomes a **Ranked Controlled-Invariant Certificate** when there is additionally a map

\[
\mu:S\to W
\]

into a well-founded ordered set \((W,\prec)\) such that every nonterminal controlled re-entry satisfies

\[
\mu(q')\prec\mu(q).
\]

For a win certificate, the allowed exit condition is strengthened:

- every controlled macro-step either ends in an exact first win for \(A\), or returns to \(S\) with strictly smaller rank;
- no draw/non-\(A\)-terminal exit is licensed.

Because \(\prec\) is well-founded, an infinite sequence of nonterminal re-entries is impossible.

Therefore:

\[
\boxed{
\mathrm{CIC}
+\mathrm{response\ totality}
+\mathrm{well\!-\!founded\ progress}
\Rightarrow
A\text{ forces a win}
}
\]

This is the **RCIC theorem**.

The rank may be:

- an integer reservoir;
- residual/obligation cardinality;
- a lexicographic tuple;
- a finite theorem-class DAG height;
- any other exactly justified well-founded structural measure.

It need not be remoteness.

## 4. Progress-edge / compression lemma

A local mechanism need not itself be a complete RCIC.

A **ranked progress edge** from class \(X\) to class \(Y\) is sufficient when every adversary branch after the selected controller action either:

- terminates immediately for \(A\); or
- reaches an exact state in \(Y\);

and a declared well-founded measure satisfies

\[
\mu(Y)\prec\mu(X).
\]

If \(Y\) is already certified by an RCIC, then \(X\) inherits an RCIC by composition.

This demotes **forced compression** from a required top-level theorem species. Its natural role is often to generate a decreasing edge by replacing a larger live obligation with a smaller one.

For the qualified trigger-5 example:

\[
\{c5r5,c7r3\}\to\{c7r3\}
\]

is a progress edge. The complete win certificate appears only when this edge is composed with a downstream target-reservoir RCIC.

## 5. Exact handoff / theorem-root composition

Let \(S\) be a union of already-qualified certificate classes.

A child may re-enter \(S\) by **exact handoff** only when the child is proved equal under the relevant exact semantic identity. In the current RBA work, support-vector equality alone is insufficient.

Thus the generic routing rule is:

\[
\boxed{
q
\xrightarrow{\text{qualified transform}}
q'
\equiv_{\text{exact}} S_i
\Rightarrow
\text{reuse certificate class }S_i
}
\]

where the transform may be:

- forced-response restriction;
- residual contraction;
- exact cofactor;
- obligation transport;
- symmetry, if exact symmetry equivalence is proved;
- predecessor lifting;
- another already-qualified structural transform.

This makes the theorem library usable as a rewrite/normal-form system.

## 6. Resource and obligation interface

An RCIC instantiation must identify, rather than merely name:

### Obligations

Examples:

- active opponent residuals that must remain blocked;
- own target residual that must remain viable;
- outstanding phase/control debt;
- required support events;
- exact theorem-root obligations after handoff.

### Resources

Examples:

- reconstructed guard set \(\Gamma(q)\);
- synchronized response pairs;
- neutral/same-column response pairs;
- remaining c7 phase reservoir;
- CPC restriction/preemption resource;
- exact residual attachment;
- already-qualified theorem class reachable by exact handoff.

A resource is allowed to be renewable: \(C(q')\) may differ from \(C(q)\) as long as it is reconstructed exactly and the invariant remains true.

## 7. Canonical recent instantiations

### Guard set — CIC / safety superclass

Resource:

\[
C(q)=\Gamma(q).
\]

Invariant:

\[
\Gamma(q)\neq\varnothing
\]

is not by itself sufficient; the full survival class additionally requires every adversary trigger to have a licensed exact response whose child reconstructs a valid guard-set proof state.

No global strictly decreasing win rank is currently part of the guard-set theorem.

Therefore guard-set is naturally a **CIC**.

### Trigger-5 forced compression — ranked progress edge

Resource/invariant:

- exact attached residual ownership;
- CPC forced-reply channel.

Progress:

\[
|R|:2\to1
\]

on the nonterminal compressed branch, while other branches terminate immediately for Player 1.

Therefore forced compression is naturally a **ranked progress edge**, not necessarily a standalone RCIC.

### Truncated target-reservoir pairing — RCIC

Resource:

- finite truncated event reservoir;
- synchronized/vertical response pairing;
- complete opponent-residual coverage.

Invariant:

- every adversary trigger has a playable paired response;
- every opponent residual remains blocked or deferred past the target.

Progress:

- remaining relevant reservoir strictly decreases by a response pair.

Terminal condition:

- earlier Player-1 terminal, or eventual paired occupation of the active singleton target.

Therefore the qualified target-reservoir theorem is a direct RCIC instance.

### Three-column phase transfer / Bx viability — RCIC

Resource:

- viable \(Bx=1\) phase state;
- finite c7 reservoir.

Response rule:

- exposure edge gives exact Player-1 terminal;
- transfer edge returns to \(Bx=1\).

Progress:

\[
\text{remaining c7 capacity}\downarrow.
\]

Therefore the qualified Bx finite-reservoir theorem is a direct RCIC instance.

The older finite phase-transfer state machine is an explicit finite-state realization of the same ranked controlled-invariant object.

## 8. Relationship among the four named mechanisms

The intended hierarchy is:

\[
\boxed{
\text{CIC}
\supset
\text{RCIC}
}
\]

with proof fragments underneath:

\[
\text{forced compression / exact handoff / predecessor lift}
\quad=\quad
\text{ways to create RCIC progress or re-entry edges}.
\]

Thus:

- **guard-set** remains a safety-oriented CIC unless a progress rank is added;
- **target-reservoir pairing** is an RCIC;
- **phase transfer / finite Bx reservoir** is an RCIC;
- **forced compression** is generally a progress-edge generator that composes into an RCIC.

This preserves meaningful distinctions while eliminating unnecessary top-level theorem taxonomy.

## 9. Proof-routing consequence

For a new obstruction, the default research question becomes:

1. what are the live obligations \(O(q)\)?
2. what current-state resources \(C(q)\) are available?
3. which already-qualified responses preserve/discharge those obligations?
4. can a forced transform reach a known certificate class?
5. what well-founded quantity decreases?
6. only if no such routing exists, is a new proof primitive justified.

In symbolic form:

\[
\boxed{
\text{state}
\;\xrightarrow{\text{qualified structural transforms}}\;
\text{known CIC/RCIC normal form}
}
\]

This is the default RLC discovery policy after this theorem.

## 10. Qualification requirements

Before this schema is used as a theorem premise, audit the recent qualified mechanisms and require:

- current-state or exact-handoff reconstruction of resources;
- response totality at the claimed scope;
- obligation coverage/safety;
- explicit progress rank where win is claimed;
- strict decrease on every nonterminal re-entry;
- exact terminal direction;
- no solved W/D/L or ordinary game-tree value used as a premise;
- production CPC/JSMinSys/BSFP unchanged.

The audit must distinguish:

- direct RCIC instance;
- safety-only CIC instance;
- progress-edge fragment;
- failed/nonconforming candidate.

## Claim boundary

This theorem schema does not by itself prove any new Connect Four state.

It is a generic composition theorem over separately qualified current-state structural facts.

It does not license support-only state merging, solved-value import, hidden history assumptions, or promotion of diagnostic recursion into a theorem premise.

Production CPC, JSMinSys, and BSFP remain unchanged.
