# Standard-7x6 q-congruence independent review 0.1

**Date:** 2026-09-19  
**Owner:** `research/semantic-quotient`  
**Reviewed claim:** `research/isograph/discovery/2026-09-18-high-value-leads/STANDARD_7X6_Q_CONGRUENCE.md`  
**Reviewed implementation:** `solver/isometric@69a1ae0929b934682d475b31cdd4a38fac77fc12`  
**Status:** proof core survives; one identity/labeling distinction must be made explicit before promotion  
**Authority effect:** none

## Review method

The proof was reconstructed against:

- C4-0001 legal/terminal rules;
- C4-0010 forward quotient semantics;
- independent colored-board `PhysicalControl`;
- Isometric state/residual transition implementation;
- deliberate same-q collision controls;
- horizontal-reflection cache canonicalization.

The review did not assume the conclusion from the historical NEI overlay.

## 1. Orientation-sensitive q

Define the orientation-sensitive ordinary behavioral carrier:

```text
q_o(s) =
    support_o(s)
    + normalized P0 residual antichain_o(s)
    + normalized P1 residual antichain_o(s)
```

where columns retain physical orientation `0..6`.

For legal nonterminal states, the original proof survives.

### Lemma A — legal frontier

Equal `support_o` gives:
- identical full/non-full columns;
- identical landing cell for each literal column;
- identical ply;
- identical side to move.

PASS.

### Lemma B — one-action terminal token

Given literal legal column `a`, support fixes landing cell `x`.

Mover/opponent residual cofactors depend only on `x` and the two residual antichains.

A mover singleton at `x` terminalizes immediately. Full-board draw after a nonwinning action depends only on support.

PASS.

### Lemma C — minimal-antichain normalization

Strict-superset residual requirements are absorbed under the monotone completion function.

For mover cofactors, any apparent post-completion difference is outside the game because first-win stopping terminates immediately.

For opponent cofactors, blocking a subset also blocks every superset containing it; blocking only a superset cannot make it uniquely relevant while its subset survives.

PASS.

### Lemma D — successor q

For every nonterminal legal literal column:

```text
support_o'
R0'
R1'
```

are determined by `q_o + action`.

PASS.

### Theorem

Rank strictly increases by one on each nonterminal move, so induction on remaining cells yields:

```text
q_o(s)=q_o(t)
    ->
same literal legal columns
same terminal token for each literal column
same q_o successor for each nonterminal literal column
```

and therefore the same complete **orientation-sensitive action-labelled future game**.

PASS.

## 2. Reflection-canonical cache key is a second quotient

Production `gameplayKey()` performs additional horizontal-reflection canonicalization.

Let `r` be board reflection with action transporter:

```text
r_action(c) = 6-c
```

and let:

```text
q_r(s) = canonical orbit representative of { q_o(s), r(q_o(s)) }
```

Then:

```text
q_r(s)=q_r(t)
```

does **not** necessarily imply:

```text
literal action c in s
    corresponds to literal action c in t
```

when one representative is reached through reflection.

Instead it implies transported correspondence:

```text
action c in s
    <-> action c in t          when orientations agree

action c in s
    <-> action 6-c in t        when orientations differ
```

Thus the reflection-canonical cache key represents an exact **automorphism-orbit quotient**, not literal orientation-sensitive action-label identity.

This distinction matters for:
- exact move/action labels;
- root move selection;
- proof/certificate transport;
- any consumer exposing physical column coordinates.

It does not threaten exact scalar W/D/L reuse because horizontal reflection preserves ordinary game value.

## 3. Existing controls are consistent with this distinction

`PhysicalControl.q()` uses raw physical heights and residual masks; it does not reflection-canonicalize.

The deliberate q-collision test:
- compares physically distinct same-`q_o` pairs;
- runs mirrored versions as separate controls;
- verifies every legal suffix and exact action values;
- separately relies on native `gameplayKey()` reflection sharing.

Therefore the controls support both layers but do not justify conflating them.

## 4. Correct successor topology

The clean game-theory successor should contain two explicit relations:

```text
q_o
    = exact orientation-sensitive ordinary future-behavior carrier

horizontal reflection automorphism r
    -> orbit quotient q_r
```

Identity/equivalence consequences:

### Orientation-sensitive future behavior

```text
q_o(s)=q_o(t)
    -> candidate exact literal action-labelled future-behavior identity
```

### Reflection-transported future behavior

```text
q_r(s)=q_r(t)
    -> candidate exact future-behavior equivalence under an explicit
       identity-or-reflection action transporter
```

Do not call the second relation literal action-label identity.

## 5. NEI consequence under 0.4 candidate semantics

NEI should not be used to repair the distinction.

Represent first:
- `q_o` equality theorem;
- reflection automorphism;
- action transporter;
- orbit quotient `q_r`;
- query scope.

Then derive the identity result appropriate to the question.

Possible identity questions include:

```text
same orientation-sensitive labeled future game?
same future game up to horizontal coordinate automorphism?
same scalar ordinary value?
same physical occurrence?
same proof/certificate?
```

They have different admissible-model burdens.

## 6. Qualification disposition

```text
core q-congruence proof for q_o                  SURVIVES
first-win/minimal-antichain lemma                SURVIVES
rank-induction theorem                           SURVIVES
literal action-label claim for q_o               SURVIVES
literal action-label claim for q_r               REJECTED
reflection-transported equivalence for q_r       SUPPORTED EXACT COROLLARY
scalar WDL reuse under q_r                       SUPPORTED EXACT COROLLARY
proof-context reuse under q_r                     NOT IMPLIED
```

## 7. Required correction

Before promotion of `CONNECT4_GAME_THEORY_1_2_CANDIDATE`:

1. rename/separate `q_o` from reflection-canonical `q_r`;
2. make the action transporter explicit;
3. attach q-congruence theorem to `q_o`;
4. attach cache/reflection quotient to `q_r`;
5. ensure hot-loop graph consumes `q_r` only for claims its transporter/value scope supports;
6. add negative controls for literal action labels across reflected positions.

This is a semantic clarification, not a failure of the q-congruence theorem.

## 8. q_r transporter implementation qualification

The explicit reflection-transporter regression was added on `solver/isometric`:

```text
commit: eb8928fe6f4c4b3dba6ad3e2d42f186947a6ebf2
test: reflection-canonical q_r transports literal action labels
workflow: Isometric native WSL
run: 35478469795
conclusion: success
```

The control constructs a nonterminal position with column 0 full and its mirror with column 6 full. It establishes:

- equal reflection-canonical `gameplayKey()` / q_r;
- unequal literal legal-column sets;
- exact legal-set correspondence under `c -> 6-c`;
- equal child terminal status under transported actions;
- equal child q_r under transported actions;
- exact undo restoration.

The workflow also ran the full domain/native-Isometric/RBA qualification command and completed successfully.

This closes the implementation-side transporter control requested by Section 7. Promotion-grade semantic/cold review of the q_o theorem remains separate.
