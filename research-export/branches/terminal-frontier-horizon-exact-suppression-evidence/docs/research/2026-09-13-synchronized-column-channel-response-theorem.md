# Synchronized column-channel response theorem

**Date:** 2026-09-13  
**Status:** accepted exact safety theorem on bounded controls; opening-3 follow-up remains incomplete  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / structural proof program:** **Josh Oshiro**  
**Formalization, implementation, and qualification:** **OpenAI ChatGPT**

## Purpose

Extend pooled-frontier paired response from a one-layer shared waiting pool into an
exact multi-layer response channel between columns, then measure how much additional
W/D/L proof and sibling-alternative elimination this creates without changing C4-0010
state identity.

The construction was derived from the current response-resource seam. Exact game
values are used only as bounded falsification/qualification controls. The theorem is
constructive: its defender policy is explicit and separately executed against every
legal attacker choice on the complete control games.

## 1. Construction

Let `A` be the side to move and `D` the defender. For a column `c`, let `h_c` be its
current height and `m_c = H - h_c` its remaining capacity.

A future column may be handled in one of two ways.

### Vertical response tail

If a future suffix has even length, pair it bottom-up:

```text
(lower trigger, upper response)
```

If `A` plays the lower trigger, `D` immediately plays the upper response. Gravity
makes the response legal. The attacker can never acquire that upper response cell.

### Synchronized cross-column channel

Choose two columns `c,d` whose remaining capacities have the same parity. Choose a
channel length `L` satisfying:

```text
1 <= L <= min(m_c, m_d)
L mod 2 = m_c mod 2 = m_d mod 2
```

Pair the first `L` future cells by equal depth from the current frontiers:

```text
(c, h_c + j) <-> (d, h_d + j)    for j = 0 .. L-1
```

When `A` plays either endpoint of the currently exposed cross pair, `D` plays the
other endpoint. Both columns therefore advance by exactly one cell, so the next cross
pair is simultaneously playable. This synchrony is invariant no matter which side of
the channel the attacker chooses.

After `L` cross exchanges, both tails have even remaining length by the parity guard,
so each tail reverts to vertical response pairing.

Unpaired even-remainder columns may use vertical response pairing from the start. Odd
remainder columns must be consumed in same-parity channel pairs.

The resulting template is a disjoint response system over all future cells.

## 2. Coverage condition

For every surviving attacker residual winning requirement `r`, require at least one of:

```text
r contains a vertical upper-response cell
OR
r contains both endpoints of at least one cross-channel pair
```

The first case gives a cell the attacker can never own. The second case gives a pair
of cells of which the defender necessarily owns one.

It is sufficient to check the normalized minimal residual antichain. Every surviving
non-minimal residual contains a minimal residual and therefore inherits its blocker.

## 3. Safety proof

The policy is legal because:

1. a vertical upper response becomes playable immediately after its lower trigger;
2. both cross-channel frontiers are playable together at channel entry;
3. every cross response advances both columns exactly once, preserving synchronized
   depth;
4. the channel ends only after both prefixes have advanced `L` levels;
5. the parity guard leaves even tails, so no unmanaged cell is created at the channel
   boundary;
6. templates are disjoint, so one response never consumes another template's trigger.

The coverage condition then blocks every surviving attacker winning requirement.
Therefore:

```text
SynchronizedChannelResponse(s)
=> side-to-move attacker cannot force a win
```

In absolute-P0 interval form:

```text
sideToMove = P0 -> [-1,0]
sideToMove = P1 -> [0,+1]
```

## 4. Relationship to pooled-frontier response

Pooled-frontier response is a strict special case.

Pair the odd-remainder columns arbitrarily and choose `L = 1` for each pair. Leave
every even-remainder column under ordinary vertical response pairing. The cross-channel
first layer is then just a fixed matching of the old frontier pool; the vertical tails
are identical to the pooled theorem.

Thus every pooled-frontier certificate has a synchronized-channel certificate. The
new theorem additionally permits longer synchronized prefixes, which creates blockers
that pure vertical response cells cannot express.

The complete controls confirm:

```text
pooled certificate AND NOT synchronized-channel certificate = 0
```

## 5. Complete bounded qualification

Seven complete games were checked. For every qualifying state:

1. the claimed one-sided interval was compared with exact complete-game W/D/L;
2. the explicit response map was executed against every legal attacker choice;
3. response legality was checked at every step;
4. attacker terminal wins under the policy were treated as policy failures.

Totals:

```text
reachable states:                       443,170

pooled-frontier certificates:            40,804
synchronized-channel certificates:       55,488
incremental certificates:                 14,684

synchronized-channel decision states:     44,118
incremental decision states:               12,273

synchronized-channel q classes:           13,603
synchronized-channel decision q classes:   9,847

exact W/D/L contradictions:                    0
explicit policy failures:                       0
explicit policy states explored:          417,798
```

Per-control results are in the machine-readable evidence file.

## 6. Alternative elimination

### Strict rule: value + output safe

For P0/max:

```text
upper(a) < lower(b) -> eliminate a
```

For P1/min:

```text
lower(a) > upper(b) -> eliminate a
```

The channel theorem changes strict eliminated sibling edges:

```text
pooled:   2,804
channel:  2,816
increment:   12
```

All batch-removal controls preserved exact parent value.

Because the eliminated child is strictly worse, it cannot occur on a W/D/L-perfect
trajectory. Strict elimination is therefore safe for the terminal-line output layer.

### Non-strict rule: Stage-1 value only

For value solving, a retained dominating witness also permits:

```text
P0/max: upper(a) <= lower(b)
P1/min: lower(a) >= upper(b)
```

Equality may remove a tied W/D/L-perfect child, so this rule is **not** terminal-line
output safe without separate `Pi0`/output subsumption.

On the complete controls:

```text
pooled weak value edges:    45,430
channel weak value edges:   49,711
incremental value edges:     4,281
```

This is meaningful proof-obligation compression for the value layer even though the
output layer must restore tied alternatives.

## 7. Standard 7x6 boundary

No P1 reply at ply 2 after any P0 first move is fully discharged by the synchronized
channel theorem alone.

However the best residual defect counts improve:

```text
P0 opening 1: 8 uncovered
P0 opening 2: 8 uncovered
P0 opening 3: 6 uncovered
P0 opening 4: 7 uncovered
P0 opening 5: 6 uncovered
P0 opening 6: 8 uncovered
P0 opening 7: 8 uncovered
```

The strongest opening-3 template after the structural P1 reply in column 4 uses a
five-level synchronized channel between columns 3 and 4. Its six remaining defects are
concentrated in vertical requirements of those two columns and two odd-row horizontal
requirements.

This isolates the next missing behavior: a defender must sometimes **change response
phase** rather than preserve one fixed channel.

## 8. Stronger opening-3 observation: all requirements covered before top defects

A different template is even more revealing for:

```text
P0 first move: column 3
P1 reply:      column 4
P0 to move
```

Pair every future column bottom-up vertically and, in odd-remainder columns 3 and 4,
leave only the top cells unpaired.

Result:

```text
live minimal P0 residual requirements: 60
statically uncovered requirements:      0
only unpaired cells:                    (3,6), (4,6)
```

So the opening-3 safety problem is not missing blocker coverage. It is a **waiting-move
/ phase-release problem at two eventual top defects**.

Under the fixed vertical policy before the first top defect:

```text
policy states reached:             9,216
first top-defect states:           6,144
P0 wins before first defect:           0
one-step re-enter-cover repairs:   6,142
first defects not repaired by the current cover/channel library: 2
```

The two exceptional late states admit tiny constructive P1 race policies after one
setup move, but that does not by itself close the recursively repeated defect-transfer
problem.

## 9. Recursive closure experiment: not yet a proof

A recursive proof-DAG experiment combined:

- complete synchronized-channel seeds;
- bottom-up vertical cover templates;
- nominal vertical responses;
- explicit top-defect repair choices;
- small deterministic column-race seeds.

It produced:

```text
memoized structural states: 4,331
proved states:              3,559
unproved states:              772
channel seeds:              1,515
race seeds:                    33
defect repairs:               892
maximum proof depth:           19
root closed:                false
```

Therefore **opening 3 is not yet internally proved no-win by this certificate grammar**.
The 6,142/6,144 first-defect result must not be promoted into a complete proof.

A broader rule allowing P1 to choose any response that re-establishes a certified
invariant is logically sound, but an unconstrained prototype exceeded the bounded
control window and risks degenerating into ordinary game-tree solving. It remains
unaccepted.

## 10. What the missing calculus now looks like

The next theorem should not add more static blocker patterns. The opening-3 control
already has complete static blocker coverage.

The missing object is a **guarded certificate-switch / defect-transfer relation**:

```text
current covering certificate
+ attacker move cannot yet complete a line
+ defender response r
+ successor has a certified covering invariant
+ well-founded resource/rank decrease
------------------------------------------------
response r is a legal certificate switch
```

The key requirement is compression. The rule must be stated over response resources,
CPC/event precedence, WSL residual coverage, NDC guard closure, and a decreasing rank;
it must not merely replay every physical move tree.

For the opening-3 control, the concrete target is to express how the two top-defect
tokens can be transferred or annihilated without releasing the blockers currently
protecting all 60 residual requirements.

This is a substantially narrower target than “find a second-player strategy after
opening 3.”

## Reproducer and evidence

Prototype:

```text
reference/research-prototypes/2026-09-13-perfect-play-winline/synchronized_channel_response_control.mjs
```

Evidence:

```text
docs/research/evidence/2026-09-13-synchronized-channel-response-control.json
```

The failed/incomplete opening-3 closure experiments are evidence only and remain below
the acceptance boundary until the certificate-switch relation is compressed and
qualified.

## Claim discipline

This work does **not** establish a complete 7x6 solve, does not prove opening 3 from
first principles, and does not derive any final perfect-play terminal-line count. It
establishes a stronger exact safety primitive and sharply localizes the next missing
calculus to guarded response-phase switching / defect transfer.
