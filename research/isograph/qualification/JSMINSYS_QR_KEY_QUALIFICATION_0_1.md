# Current JSMinSys Exact-Key -> q_r Qualification 0.1

**Date:** 2026-09-25  
**Disposition:** QUALIFIES  
**Scope:** current JSMinSys exact cache key as the Connect4 authority-1.2 `q_r` scalar-value cache realization  
**JSMinSys revision:** `04d37498607ace16dae33c79462ddfe1503c8a0d`  
**Connect4 qualification workflow head:** `32ba3059ee1c91acfa7ff0f7c271d10c9e005342`  
**Workflow:** `JSMinSys q_r Qualification`  
**Run:** `36165229049`  
**Authority effect:** none; this qualifies the current implementation binding and does not rewrite frozen game-theory authority 1.2

## Semantic target

Authority 1.2 defines:

```text
q_o
    orientation-sensitive support
    + normalized P0 residual antichain
    + normalized P1 residual antichain

q_r
    canonical horizontal-reflection orbit representative of q_o
    with action transporter c -> 6-c on standard 7x6
```

Equal `q_r` authorizes exact scalar ordinary W/D/L/value-cache reuse and reflection-transported future-game correspondence. It does not authorize literal action-label identity, physical occurrence identity, history identity, or non-q proof/certificate identity.

## Current JSMinSys key layout

Prepared geometry fixes:

```text
keyWords =
    one uint32 height per column
    + one meta word
    + P0 residual-coordinate bitset
    + P1 residual-coordinate bitset
```

For legal nonterminal states:

- support heights determine occupied rank and mover;
- `connect4RbaBasisFromSupport` deterministically reconstructs the ordered residual basis from support;
- P0/P1 coordinate bits identify exact normalized residual-antichain membership relative to that support-derived basis;
- therefore the full orientation-sensitive key content reconstructs `q_o` exactly, with the meta rank field redundant but consistent.

## Reflection/canonicalization proof

Geometry contains exact reflection maps for columns and all residual shapes.

The qualification checks and source derivation establish:

1. `mirrorColumn[mirrorColumn[c]] = c`;
2. `reflect[reflect[id]] = id` for every residual shape;
3. reflected basis elements are re-sorted into the exact support-derived reflected basis;
4. coordinate bits are permuted through that exact basis isomorphism;
5. support heights are reversed only when reflection is selected;
6. meta is preserved;
7. canonicalization chooses one representative from the identity/reflection orbit;
8. full key equality—not hash equality or slot equality—is required for an exact cache hit.

Thus the current canonical JSMinSys full key is a concrete representation of the authority `q_r` orbit for its declared scalar-value cache scope.

## Mechanical qualification

The qualification script performed independent semantic-orbit decoding and bidirectional collision checks.

### Exhaustive bounded control — 4x4

```text
physical positions             161,029
legal nonterminal states       134,289
terminal positions              26,740
generated legal edges          304,574

unique canonical keys           17,113
unique independent q_r orbits   17,113
collision observations         117,176
transported child checks        20,021
mismatches                           0
```

Every canonical-key collision remained inside exactly one independently decoded reflection orbit, and every represented reflection orbit mapped to exactly one canonical full key.

### Standard 7x6 controls

```text
deterministic legal states       6,621
mirrored state checks            6,621
unique canonical keys            6,330
unique independent q_r orbits    6,330
collision observations             291
transported child checks        16,774
mismatches                           0
```

The standard corpus includes known solver controls plus deterministic legal-game sampling.

## Explicit checks

The workflow passed all of the following:

- support deterministically reconstructs the ordered basis;
- coordinate bitsets decode exact residual-antichain membership relative to that basis;
- shape and column reflection are involutions;
- mirrored legal histories canonicalize to identical full exact keys;
- independent semantic `q_r` orbit ID and JSMinSys canonical key are bijective over all controls;
- transported literal action `c -> width-1-c` preserves child terminal token and child canonical key;
- hash/slot coincidence is never used as identity authority.

## Identity and scope disposition

Qualified:

```text
current JSMinSys canonical full-key equality
    <=>
same represented q_r scalar-value cache class
```

within the declared legal state / RBA representation domain.

Not implied:

```text
same q_o literal orientation
same literal action label without transporter
same physical occurrence
same move history
same move/proof witness
same non-q certificate context
```

No NEI broadening is needed. This is an exact scoped implementation-realization qualification.

## Research disposition

`QU-LSMP-07` is closed for JSMinSys revision `04d3749...`.

A later key-layout or canonicalization change must requalify the implementation binding. Frozen authority 1.2 remains unchanged.
