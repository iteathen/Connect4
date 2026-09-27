# Connect4 game-theory Core 0.19 derived-support overlay — 0.1

**Status:** unqualified derived-support overlay  
**Gameplay authority effect:** none  
**Base authority:** Connect4 game-theory / logic authority 1.2  
**Core dependency:** qualified Core 0.19 implicit-assertion semantics  
**Native:** `CONNECT4_GAME_THEORY_CORE019_SUPPORT_0_1.isg`

This overlay does not modify authority 1.2. It makes one family of already-implied relations explicit so later discovery does not treat the three W/D/L classes as three independent information generators.

## Exact premises already in authority 1.2

Authority 1.2 supplies:

```text
ordinary P0-oriented exact value domain = {-1, 0, +1}
first completed Connect-4 terminates immediately
full non-winning board = draw
```

For an **exact completed ordinary W/D/L classification**, define:

```text
+1 = P0 WIN
 0 = DRAW
-1 = P0 LOSS
```

The three values are mutually exclusive and collectively exhaustive by the exact three-value ordinary-value domain.

## Exact implicit support

Under that scope:

```text
not WIN
AND
not LOSS
    ->
DRAW
```

Likewise, exact WIN excludes LOSS/DRAW, and exact LOSS excludes WIN/DRAW.

These are derived support relations. They do not replace the three semantic outcomes in the game-theory representation.

## Critical non-consequence

This overlay deliberately records:

```text
partial nonterminal CPC
fails to detect a tactical WIN
AND
fails to detect a tactical LOSS

    !=

DRAW
```

A partial CPC pass may simply be unresolved.

The residual DRAW inference is lawful only after the declared exact W/D/L classification scope is closed.

This distinction prevents the overlay from being misused as a justification for deleting arbitrary CPC analysis.

## Why this is not authority 1.3

No new game rule is introduced. The outcome partition is derived from current authority 1.2.

The modernization therefore preserves the qualified 1.2 package and adds this support overlay rather than manufacturing a new game-theory authority revision solely for a derived assertion.

If later work changes gameplay semantics or adds a new authoritative game-theory relation, that belongs in a separately qualified successor authority.
