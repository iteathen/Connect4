# Connect4 gameplay description — human guide

**Status:** human-facing research explanation  
**Audience:** readers who know Connect Four but do not need to know IsoGraph, NEI, BSFP, or solver internals  
**Technical proposal:** `gameplay-strategy/GSP-001-QUOTIENT_NATIVE_GAMEPLAY_DESCRIPTION.md`  
**Formal research derivation:** `isograph/discovery/2026-09-18-high-value-leads/STANDARD_7X6_Q_CONGRUENCE.md`

This document explains the same idea in three forms:

1. ordinary novice-level game language;
2. a classical logical proof;
3. the IsoGraph/research interpretation.

None of these three views changes the game. They are three descriptions of the same gameplay behavior.

---

# 1. Novice description: what information do we really need?

In ordinary Connect Four, people usually describe a position by drawing every red and yellow piece on the board.

That works, but an exact solver does not necessarily need to remember every historical detail.

For future play, it can instead remember two kinds of information.

## A. How full is each column?

For example:

~~~text
column:   1 2 3 4 5 6 7
height:   2 0 3 1 0 4 2
~~~

This tells us exactly where the next piece would land in every legal column.

We call this the **support**.

## B. What winning possibilities are still alive?

Imagine every possible four-in-a-row as a little recipe.

A recipe might say:

> Player 0 still needs these two empty cells to finish this four-in-a-row.

If the opponent already owns one cell in a four-in-a-row, that recipe is dead and can be forgotten.

If a player already owns some cells in the line, we only need to remember the cells that are still missing.

Example:

~~~text
original winning line:
A B C D

Player 0 already owns A and B.

live requirement:
{C, D}
~~~

If Player 0 later plays C:

~~~text
{C, D}
    becomes
{D}
~~~

If Player 1 plays C instead:

~~~text
{C, D}
    disappears
~~~

because Player 0 can never own all four cells of that line anymore.

These remaining "winning recipes" are called **residual requirements**.

---

# 2. Remove recipes that can never matter more than another recipe

Suppose Player 0 has both:

~~~text
{A}
{A, B}
~~~

If Player 0 gets A, the first recipe already wins immediately.

There is no future situation in which Player 0 must also complete the larger recipe {A,B} before the smaller one matters.

So the larger recipe is redundant.

We keep only the smallest live recipes.

That collection is called the **minimal residual antichain**.

You do not need to know the word "antichain" to use the idea.

In novice language:

> Keep every genuinely different shortest remaining route to a four-in-a-row. Throw away a route when another surviving route requires a strict subset of the same cells.

---

# 3. The gameplay state q

The proposed exact gameplay description is simply:

~~~text
q =
    column heights
    + Player 0's shortest live winning recipes
    + Player 1's shortest live winning recipes
~~~

We do **not** put the entire move history into q.

We do **not** even need every physical ownership detail if it no longer affects any future winning recipe.

The side to move is known from how many pieces have already been placed.

---

# 4. How to play one move using q

Suppose a player chooses column 4.

### Step 1 — find the landing cell

The column heights tell us where the new piece lands.

### Step 2 — update the mover's recipes

For every live recipe belonging to the moving player:

~~~text
if the landing cell is in the recipe:
    remove that cell from the recipe

otherwise:
    leave the recipe alone
~~~

If removing the cell makes a recipe empty:

~~~text
{}
~~~

the player has completed a four-in-a-row.

**The game ends immediately.**

That first-win stopping rule is important.

### Step 3 — update the opponent's recipes

For every opponent recipe:

~~~text
if the new piece occupies one of its required cells:
    delete that recipe

otherwise:
    keep it
~~~

The opponent can never complete a four-in-a-row through a cell now permanently owned by the mover.

### Step 4 — remove redundant recipes

If one remaining recipe strictly contains another one, keep only the smaller recipe.

### Step 5 — increase the chosen column height

That produces the next q.

So gameplay becomes:

~~~text
q + chosen column
    -> illegal move
       OR immediate win
       OR next q
~~~

---

# 5. Why two different-looking boards can be the same future game

Two physical positions can have different histories and even different irrelevant ownership details.

But if they have the same:

- column heights;
- Player 0 residual requirements;
- Player 1 residual requirements;

then every legal move lands in the same place and changes the same winning recipes in the same way.

So from that point forward, their gameplay unfolds identically.

This is the important distinction:

~~~text
same physical position?
    maybe NO

same future game?
    YES, when q is the same
~~~

That is why the solver can potentially solve one q once instead of separately solving every physical history that leads to it.

---

# 6. Classical logic proof

We now state the same argument as an ordinary mathematical proof without relying on IsoGraph notation.

## Definitions

Let S and T be two legal, nonterminal Connect Four positions.

Let:

~~~text
q(S) = (H(S), R0(S), R1(S))
~~~

where:

- H is the vector of column heights;
- R0 is Player 0's normalized minimal set of live residual winning requirements;
- R1 is Player 1's normalized minimal set of live residual winning requirements.

Assume:

~~~text
q(S) = q(T)
~~~

We prove that S and T have the same complete future gameplay.

---

## Lemma 1 — S and T have the same legal moves

Because:

~~~text
H(S) = H(T)
~~~

the same columns are full in both positions.

Therefore exactly the same columns are legal.

For every legal column c, the next piece lands in the same row in S and T.

The total number of occupied cells is also the same, so the same player moves next.

Therefore:

~~~text
same q
-> same legal actions
-> same landing cell for each action
-> same player to move
~~~

---

## Lemma 2 — the result of one move is determined by q

Take any legal column c.

Let x be its landing cell and let p be the moving player.

Because:

~~~text
Rp(S) = Rp(T)
~~~

the mover has exactly the same live residual requirements in both positions.

For every requirement R:

~~~text
if x is not in R:
    R remains R

if x is in R:
    R becomes R minus {x}
~~~

A win occurs exactly when some mover requirement becomes empty.

Therefore the move is an immediate win in S if and only if it is an immediate win in T.

For the opponent, a residual requirement survives exactly when it does not contain x.

Because the opponent residual sets are equal in S and T, exactly the same opponent requirements survive.

Therefore every legal action has the same terminal/nonterminal result in S and T.

---

## Lemma 3 — removing strict-superset requirements is safe

Suppose two requirements for the same player satisfy:

~~~text
A is a strict subset of B.
~~~

If the player eventually obtains every cell in B, then the player necessarily obtained every cell in A first or at the same time.

So completing B can never be necessary when A is still a live requirement.

Now consider future moves.

### If the player moves

If the player occupies a required cell:

- A and B shrink consistently;
- A remains no larger than B.

If A becomes empty, the player wins immediately and the game stops.

Therefore any difference in the hypothetical larger B after that terminal move is irrelevant.

### If the opponent moves

If the opponent occupies a cell in A, both A and B are blocked.

If the opponent occupies a cell in B but not A, B is blocked while A remains alive.

So B never becomes necessary after A was retained.

Therefore deleting strict supersets preserves all future winning behavior.

---

## Lemma 4 — equal q and equal action give equal next q

From Lemma 1, the action lands on the same cell.

From Lemma 2, it is terminal in both positions or nonterminal in both.

If terminal, both transitions have the same winner.

If nonterminal:

- the same column height increases;
- the same mover requirements are transformed;
- the same opponent requirements are deleted;
- Lemma 3 gives the same normalized result.

Therefore:

~~~text
q(S) = q(T)
and the same legal action c is chosen

implies

either:
    both transitions terminate identically

or:
    q(S after c) = q(T after c)
~~~

---

## Theorem — equal q means equal future gameplay

Connect Four is finite.

Every legal nonterminal move adds exactly one piece, so there are fewer empty cells after every move.

We use induction on the number of empty cells.

### Base case

If there are no empty cells and the position is nonterminal, the game is a draw.

Equal q positions therefore have the same result.

### Inductive step

Assume the theorem is true for positions with fewer than n empty cells.

Take two positions S and T with n empty cells and equal q.

By Lemma 1 they have the same legal moves.

For every legal move:

- Lemma 2 says they have the same immediate terminal result;
- if the move is nonterminal, Lemma 4 says their successor q values are equal.

Those successor positions have n-1 empty cells, so the induction hypothesis applies.

Therefore every action has the same future consequence in S and T.

Hence the entire labelled future game is identical.

So:

~~~text
q(S) = q(T)
    ->
same ordinary future gameplay
~~~

This implies the same:

- exact win/draw/loss result;
- exact result of every legal action;
- fastest forced win under a fixed distance convention;
- longest forced resistance under that same convention.

QED.

---

# 7. What the proof does NOT say

The proof does not say the two physical positions are literally the same board.

It does not say their histories are the same.

It does not say they have the same proof certificate, provenance, or strategic side information.

It says only:

> For ordinary legal Connect Four gameplay from this point onward, q contains everything needed to determine what can happen.

That scope distinction is important.

---

# 8. How this maps to IsoGraph

The IsoGraph view represents the same structure with explicit identities, relations, scopes, uncertainty, and provenance.

At a high level:

~~~text
PhysicalPosition
    -> hasSupport -> SupportState

PhysicalPosition
    -> hasResiduals(P0) -> ResidualAntichain0

PhysicalPosition
    -> hasResiduals(P1) -> ResidualAntichain1

q =
    scoped future-behavior description
~~~

NEI then distinguishes different questions:

~~~text
physical identity:
    two positions may be DISTINCT

future-behavior identity:
    same q positions may be SAME
~~~

Discovery Protocols enforce that the second statement does not erase the first.

So the three human views align:

~~~text
novice:
    same column heights + same live winning recipes
    means the rest of the game works the same

classical logic:
    q is a transition congruence; induction gives equal future behavior

IsoGraph / NEI:
    DISTINCT under physical-state identity
    can coexist with SAME under the scoped future-behavior profile
~~~

---

# 9. What an implementation should look like

The human-facing gameplay API should remain understandable:

~~~text
state = describePosition(position)

actions = legalMoves(state)

result = play(state, column)
~~~

Internally:

~~~text
describePosition
    -> q

play(q, column)
    -> illegal
       | terminal
       | q'
~~~

A packed implementation may eventually replace the visible sets with IDs and bit operations, but the implementation must still mean exactly the simple recipe-update rules above.

This is the bridge from IsoGraph semantics to actual game play.
