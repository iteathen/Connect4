# Realizability composition map

**Research direction:** Josh Oshiro  
**Formalization:** OpenAI ChatGPT

This map separates the relations that must not be collapsed under the word `realizability`.

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
owner-labelled cofactors / CPC potential
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

### Dynamic/proof boundary

Even a legally realizable state does not settle future behavior. Existing research places the remaining noncommuting content in admissibility, opponent quantification, response-resource sharing, deadlines and first-win stopping. The mixed-cofactor algebra itself commutes on distinct variables; the guarded quantifier lift into obligations is still a separate theorem target.

## What this map prevents

Do not silently substitute any of these for another:

```text
line-hit image membership
!= legal history
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

The realizability layer explains correlation loss; it does not prove a numerical equality between those objects.
