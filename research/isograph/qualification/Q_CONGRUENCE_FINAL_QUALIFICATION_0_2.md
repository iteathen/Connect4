# Standard-7x6 q Congruence — Final Qualification 0.2

**Disposition:** QUALIFIES  
**Owner:** `research/semantic-quotient`  
**Qualified theorem scope:** legal nonterminal standard-7x6 Connect4 ordinary future behavior  
**Internal review:** `research/isograph/qualification/Q_CONGRUENCE_INDEPENDENT_REVIEW_0_1.md`  
**Cold qualification host:** `iteathen/IsoGraph` Experiment 017  
**Cold workflow run:** `35479007618`  
**Cold model:** `gemini-3.5-flash`  
**External semantic calls:** 1  
**Mismatches:** 0 / 18  
**Solver implementation control:** `solver/isometric@eb8928fe6f4c4b3dba6ad3e2d42f186947a6ebf2`  
**Isometric native WSL run:** `35478469795` — success  
**Authority effect:** qualifies the q relations for incorporation into the Connect4 game-theory successor; does not itself promote the whole 1.2 authority

## 1. Qualified orientation-sensitive carrier

For a legal nonterminal state (s), define:

```text
q_o(s) =
    orientation-sensitive support
    + normalized P0 residual antichain
    + normalized P1 residual antichain
```

with side to move derived from support rank parity.

Qualified theorem:

> If `q_o(s)=q_o(t)`, then `s` and `t` have the same complete orientation-sensitive literal-action-labelled ordinary future game.

This means they have:
- the same literal legal columns;
- the same landing cell for every literal legal column;
- the same side to move;
- the same terminal token for every literal legal action;
- the same successor `q_o` for every nonterminal literal legal action;
- therefore the same exact W/D/L;
- the same recursively defined distance-sensitive value under a fixed ordinary tie convention;
- the same exact per-literal-column action values.

## 2. Proof obligations

### Support frontier

Equal support determines the literal legal action alphabet, landing cells, rank and mover.

**PASS.**

### One-move terminal token

The mover residual cofactor, opponent blocker cofactor and full-board draw check depend only on `q_o + action`.

**PASS.**

### Minimal-antichain normalization

Strict supersets are semantically absorbed.

First-win stopping is load-bearing: once a mover residual becomes empty, post-terminal residual differences are outside ordinary future behavior.

**PASS.**

### Successor closure

For every common nonterminal literal action:

```text
q_o + action -> unique successor q_o
```

**PASS.**

### Rank induction

Every legal nonterminal move increases occupied rank by one on a finite board, giving a well-founded induction over the full ordinary future game.

**PASS.**

## 3. Reflection is a second quotient

Horizontal reflection is an exact automorphism with transporter:

```text
c -> 6-c
```

Define:

```text
q_r(s) =
canonical horizontal-reflection orbit representative of q_o(s)
```

Qualified consequences:

- equal `q_r` supports exact future-game correspondence under identity-or-reflection action transport;
- equal `q_r` supports exact scalar ordinary W/D/L/value-cache reuse;
- equal `q_r` does **not** imply identical literal legal-column labels without orientation/transport metadata;
- equal `q_r` does not imply physical occurrence identity;
- equal `q_r` does not imply move-history identity;
- equal `q_r` does not imply non-q proof/certificate identity.

## 4. Independent implementation control

The added regression:

```text
reflection-canonical q_r transports literal action labels
```

uses a state with column 0 full and its mirror with column 6 full.

It proves:
- equal `gameplayKey()` / q_r;
- unequal literal legal-column sets;
- exact legal-set transport by `c -> 6-c`;
- equal transported child terminal status;
- equal transported child q_r;
- exact undo restoration.

The full `Isometric native WSL` workflow passed at run `35478469795`.

## 5. Cold semantic qualification

Experiment 017 used exact frozen Connect4 source snapshots plus qualified NEI 0.4.

Frozen packet SHA-256:

```text
7da5cf2f08c961ddf1061b4a04ee39f9d32928906d8c774355657ffa848be12e
```

Frozen report SHA-256:

```text
51464c19bbb43a43cdefc008139fbf51fb5ac3b9e0c02a1c29883ff691735427
```

Result:

```text
formal disposition              QUALIFIES
C01-C18                         18 / 18 PASS
failed cases                    none
duplicates                      none
unexpected cases                none
packet self-audit               true
overall q_o congruence          VALID_UNDER_DECLARED_SCOPE
q_o/q_r distinction required    true
API attempts                    1
```

Frozen evidence is owned locally under:

`research/isograph/qualification/evidence/experiment-017/`

## 6. NEI 0.4 identity consequence

Qualified NEI 0.4 authority:

```text
iteathen/isograph@55c98d31dd2715cdb48abe4f8e313fd72d0dabba
semantic SHA-256:
6e2f0efb1f4bfbfa55bc2c5597f1ecc5b4d7bb734216543c21ba72089b0aacee
```

For the identity query:

> same orientation-sensitive literal-action-labelled ordinary future behavior?

the qualified q_o theorem forces every admissible identity model for equal-q_o states to merge the pair.

Therefore:

```text
q_o(s) = q_o(t)
    ->
NEI_future_behavior_oriented(s,t) = SAME
```

This exact SAME result is scoped only to the declared future-behavior identity question.

No Bayes factor is involved or required.

## 7. Negative scope controls

The theorem does not establish:
- physical colored-board identity;
- physical occurrence identity;
- ordered move-history identity;
- terminal-line provenance identity;
- non-q CPC/NDC proof identity;
- guard/deadline/resource/realizability identity;
- arbitrary advisory evaluator identity.

Equal scalar W/D/L alone is also insufficient to establish q_o future-behavior identity.

## 8. Generalization boundary

The proof shape appears dimension-independent for finite gravity Connect-K under matching residual semantics, but only standard 7x6 is qualified here.

The broader geometry-family generalization remains a separate candidate until independently qualified.

## 9. Final disposition

```text
support/action lemma                      PASS
one-move terminal lemma                   PASS
first-win antichain lemma                 PASS
successor q_o closure                     PASS
rank induction                            PASS
literal action-labelled q_o congruence    PASS
q_r reflection transporter                PASS
scalar q_r value reuse                    PASS
q_r literal-label overclaim rejected      PASS
physical/history/proof scope preserved    PASS
NEI 0.4 oriented future SAME              PASS
cold semantic holdout                     PASS
implementation qualification              PASS
```

**STANDARD-7X6 q_o FUTURE-BEHAVIOR CONGRUENCE QUALIFIES.**
