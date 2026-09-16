# Realizability composition map

**Research direction:** Josh Oshiro  
**Formalization:** OpenAI ChatGPT

This map separates relations that must not be collapsed under the word `realizability`.

```text
empty-board geometry / winning-line incidence
        |
        v
support ideal / gravity chains
        |
        +------------------------------+
        |                              |
        v                              v
arbitrary ownership partition      support precedence
(C1 symbolic domain)                  |
        |                              |
        v                              |
line-hit map (H0,H1)                  |
        |                              |
        v                              |
PINNED NAE IMAGE RELATION             |
C4-R0060                              |
        |                              |
        +----- lossless static --------+
              correlation boundary
                    |
                    v
fixed colored support
                    |
                    v
ALTERNATING LINEAR EXTENSION / SHUFFLE
C4-R0062
                    |
                    v
first-win admissibility
                    |
                    v
history observation / projection alpha
                    |
                    v
UNIFORM / OBSERVATION-BASED STRATEGY
C4-R0064
                    |
                    v
explicit response dependencies
Skolem / bounded DQBF semantics
C4-R0065
                    |
                    v
opponent-universal intervention
+ shared response resources
+ deadlines / races
                    |
                    v
guarded NDC obligation/certificate closure
                    |
                    v
terminal certificate
                    |
                    v
player/sign + game value
```

## Exact boundary statements

### Static projection boundary

`C4-R0060` characterizes the exact support-local image of the line-hit map. `C4-R0061` proves that local/pairwise compatibility is not enough: an odd NAE cycle can create a globally impossible line-hit request.

The appropriate standard relational term is **lossless join** (`C4-R0063`). If selected projections do not join losslessly, their natural join admits spurious structural tuples.

### History boundary

An ownership partition can be symbolically valid yet not be a legal Connect-4 position. `C4-R0062` supplies the exact missing history relation before stopping: alternating/prescribed-color linear extension of the gravity support poset, equivalently shuffle membership of the column owner words in the global alternating player word.

`C4-R0066` records a complexity boundary: for unbounded numbers of columns, this constrained-shuffle problem already contains an NP-hard fixed-language case. `C4-R0067` separately falsifies replacing chain precedence with only per-event time windows plus matching.

### Strategy-dependency boundary

A legal history can still be strategically indistinguishable only if the required policy can factor through the chosen observation. `C4-R0064` identifies the standard object: an observation-based/uniform strategy. `C4-R0065` gives a bounded propositional representation in which retained opponent distinctions are precisely the allowed dependencies of the controller's Skolem response functions.

The response-serialization theorem is the minimal Connect-4 witness: after `D1 E1 A1 A2`, the correct P1 action depends on whether P0 played `B1` or `C1`. Forgetting that trigger does not create an unrealizable tuple; it destroys a realizable strategy dependency.

### Dynamic/proof boundary

Even an observation supporting one local uniform response does not settle the whole game. Existing research places the remaining noncommuting content in admissibility, opponent quantification, response-resource sharing, deadlines and first-win stopping. The mixed-cofactor algebra itself commutes on distinct variables; the guarded quantifier lift into obligations remains the active theorem target.

A full game/alternating bisimulation is a strong sufficient strategic-equivalence control, but it is not assumed to be the minimum quotient for W/D/L or a claim-relative theorem.

## What this map prevents

Do not silently substitute any of these for another:

```text
line-hit image membership
!= legal history
!= strategy uniformity
!= transition equivalence
!= proof/certificate identity
!= game value.
```

Likewise:

```text
structural core 28
!= strong-play terminal support 28
!= 6x7 support upper bound 30
!= W/D/L-only terminal union 61.
```

The realizability layers explain progressively stronger correlations; none proves a numerical identity among those quantities.
