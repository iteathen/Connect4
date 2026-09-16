# Column-phase defect algebra and zero-phase residual core

**Date:** 2026-09-13  
**Status:** exact local algebra + bounded structural controls; no complete 7x6 proof claim  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / invariant-first and isomorphism program:** **Josh Oshiro**  
**Formalization / implementation / qualification:** OpenAI ChatGPT

## Purpose

The invariant-first pass asked whether structures hidden below the canonical `E/R/P/C/N/G/Q` layers become visible when comparing invariants rather than surface formalisms.

This note preserves three tightly bounded results:

1. an exact **column-phase GF(2) quotient** of two-ply support dynamics;
2. an exact isomorphism between its Hamming-weight transitions and the previously observed `collapse / transport / re-expansion` vocabulary;
3. a compact seven-requirement residual defect core reached by the broad `46656555` sibling after its unique hard transition into zero phase.

It also preserves a negative result from the immediately preceding control: same-support residual-objective entailment alone supplied zero proof-term compression on the fixed sibling boundary.

No external W/D/L labels or solved-value oracle are used by the new controls, and neither control recursively descends the hard frontier.

---

## 1. Preceding negative: R-only semantic entailment does not compress this seam

Bounded control:

```text
research/semantic-quotient/state-identity-unification/src/
  quotient-standard7x6-4665655-semantic-entailment.mjs
```

The experiment lifted proof-term comparison from exact child-ID subset to an exact same-support residual-objective implication relation, with global horizontal reflection and already-qualified local interval facts.

Across the four fixed sibling controls:

```text
hard state occurrences:          132
canonical atoms:                 132
reflection savings:                0
direct semantic implication:       0
transitive implication edges:      0
new interval discharges:           0
witness proof terms:              28
prime terms after entailment:     28
```

Thus the earlier `28 -> 28` result was not repaired merely by replacing exact state-ID inclusion with residual-objective dominance.

Conclusion:

> the missing implication at this boundary is not carried by `R` residual objectives alone. It must depend on `P/C/N` structure, or on a still richer exact invariant.

This is a retained negative control, not evidence against the generic antichain/entailment algebra.

---

## 2. Exact column-phase vector

For standard height `H=6`, define for each column `c`:

```text
phi_c = (H - h_c) mod 2 = h_c mod 2.
```

`phi_c=1` means the remaining capacity of column `c` is odd; `phi_c=0` means it is even.

Let:

```text
phi = (phi_1,...,phi_7) in GF(2)^7.
```

Because `H` is even:

```text
XOR_c phi_c = supportRank mod 2.
```

Thus fixed support-rank parity restricts `phi` to one affine parity coset of `GF(2)^7`.

At even rank, the accessible phase vectors lie in the even-weight binary subspace.

---

## 3. Exact two-ply macro transition

For one nonterminal P0/P1 macro-step playing columns `a` and `b`:

```text
phi' = phi + e_a + e_b       over GF(2).
```

If `a=b`, the same coordinate toggles twice and:

```text
phi' = phi.
```

If `a!=b`, a weight-two vector is added.

Ignoring capacity boundaries, the distinct-column macro generators `e_a+e_b` generate the even-weight binary subspace. Therefore the phase-only macro dynamics have the algebraic shape of a Cayley graph over the even-weight code.

This is only a support/parity quotient. It does not identify strategic states or prove equal W/D/L values.

---

## 4. Hidden isomorphism: collapse / transport / re-expansion

For a distinct-column macro-step, inspect the two touched phase bits.

### Collapse

```text
(1,1) -> (0,0)
```

so:

```text
weight(phi') = weight(phi) - 2.
```

### Transport

```text
(1,0) -> (0,1)
```

or the reverse, so:

```text
weight(phi') = weight(phi).
```

One odd-column defect is relocated to another column.

### Re-expansion

```text
(0,0) -> (1,1)
```

so:

```text
weight(phi') = weight(phi) + 2.
```

### Vertical same-column pair

```text
phi' = phi.
```

The earlier empirical frontier language `collapse -> transport -> re-expansion` therefore has an exact support-phase algebra beneath it.

Important boundary:

> This does **not** prove that hard-frontier width equals phase Hamming weight. It proves only that the same three qualitative transition classes arise exactly in the column-phase quotient. Any connection from phase defects to proof-frontier obligations must still be established through `R/P/C/N` semantics.

---

## 5. Phase-defect rank

At even support rank define:

```text
d_phi = weight(phi) / 2.
```

Each distinct-column macro-step can reduce `weight(phi)` by at most two. Therefore:

```text
d_phi
```

is an exact lower bound on the number of distinct-column macro-steps required to reach zero phase, subject to legality/capacity constraints.

This is a support/resource distance, not a game-theoretic distance-to-win.

---

## 6. Fixed 4665655 sibling control

Workflow:

```text
.github/workflows/frontier-4665655-phase-defect.yml
run 34799269752
```

Hard limits:

```text
GitHub timeout: 5 minutes
inner process timeout: 270 seconds
recursive hard-frontier descent: none
scope: four fixed sibling states, one P0/P1 macro-step
```

Parent phase results:

| sequence | phase bits | weight | d_phi |
|---|---|---:|---:|
| `46656551` | `1001110` | 4 | 2 |
| `46656552` | `0101110` | 4 | 2 |
| `46656555` | `0001010` | 2 | 1 |
| `46656557` | `0001111` | 4 | 2 |

The three previously closing controls share phase-defect rank 2. The previously broad re-expansion control `46656555` has rank 1.

This role comparison is theorem-discovery evidence only; the phase rank is not promoted as a value classifier.

### Unique zero-phase hard transition

Across every legal one-macro continuation retained as hard by the existing theorem-backed shallow `I/E(O)` classification:

```text
46656551: zero hard phase transitions = 0
46656552: zero hard phase transitions = 0
46656555: zero hard phase transitions = 1
46656557: zero hard phase transitions = 0
```

The unique transition is:

```text
46656555
  P0: column 4
  P1: column 6
-> 4665655546
```

with support:

```text
[0,0,0,2,4,4,0]
```

and:

```text
phi = 0000000.
```

The other three controls cannot reach zero phase in one macro-step even abstractly, because their phase weight is four and one macro-step can clear at most two odd coordinates.

---

## 7. Meaning of zero phase

At P0-to-move zero phase, every remaining column capacity is even.

This is exactly the support-side guard of the previously qualified vertical paired-response theorem: P1 may pair future column events so that after P0 takes the lower cell of a remaining pair, P1 takes the upper response cell.

For the support `4665655546`, those P1 response rows are one-based:

```text
2, 4, 6.
```

If every P0 residual requirement intersects that response mask, the qualified theorem would establish P0-no-win.

It does not: a small residual defect core remains.

---

## 8. Zero-phase residual defect core

Workflow:

```text
.github/workflows/frontier-4665655-zero-phase-residual-defect.yml
run 34799371776
```

State:

```text
sequence: 4665655546
rank:     10
heights:  [0,0,0,2,4,4,0]
phase:    0000000
```

P0 has:

```text
37 residual requirements total
30 intersect the P1 vertical-response rows
 7 do not
```

The seven uncovered residuals are:

```text
{C3,D3}
{D3,G3}
{A1,B1,C1}
{A5,B5,C5,D5}
{B5,C5,D5,E5}
{C5,D5,E5,F5}
{D5,E5,F5,G5}
```

Every cell in every one of these seven requirements is a **base-CPC P0 parity cell** in the zero-reservation model for this state.

Thus the residual core is not random coverage leakage. It is exactly the portion of P0 winspace that survives the P1 vertical response mask because it lies wholly on the opposite parity class.

This gives a direct `R <-> P <-> C` bridge:

```text
R: residual requirements
P: base event parity class
C: vertical response resource mask
```

and the defect core is their set-theoretic difference.

---

## 9. Static blocker dual of the seven-term core

The minimum static transversal cardinality of the seven uncovered requirements is three.

There are exactly three cardinality-three transversals:

```text
{A1,D3,D5}
{B1,D3,D5}
{C1,D3,D5}
```

Reason for the factorization:

```text
middle pair family  -> common cell D3
bottom requirement  -> choose one of A1/B1/C1
row-5 window family -> common cell D5
```

So the minimum-cardinality blocker expression factors as:

```text
D3 AND D5 AND (A1 OR B1 OR C1).
```

There are also larger inclusion-minimal static transversals; therefore `D3` and `D5` are forced only in the **minimum-cardinality** static blockers, not in every possible blocker.

Most importantly, a static transversal is **not** a certified P1 strategic blocker. P1 must establish ownership/response/resource/deadline facts for whatever blocker certificate it actually uses.

---

## 10. Structural interpretation

Pure vertical follow-up at zero phase gives P1 a large draw-oriented response skeleton but leaves precisely the P0-parity residual core above.

Therefore any complete P1 safety proof at this state must augment or alter the vertical policy with additional typed `C/N` certificates that cover these seven requirements.

That statement is exact at the representation level:

```text
vertical paired-response certificate
+ additional certified cover of seven-term defect core
-> candidate total safety certificate
```

Whether such a total compatible safety certificate exists is unresolved here.

Conversely, a P0 positive proof could attempt to show that every legal P1 repair of this parity-pure core causes one of:

```text
phase defect injection
response-resource circuit
CPC ownership contradiction
race/deadline failure
transfer of the uncovered defect to another requirement
```

followed by a well-founded progress argument.

This is substantially smaller than proving 37 residual requirements independently.

---

## 11. Relationship to paving / boundary-defect intuition

The structure is consistent with, but does not prove, the earlier hypothesis suggested by infinite-board paving work:

```text
large closed response policy
  + finite/phase-sensitive defect core
  -> strategic outcome determined by whether the defects can be repaired compatibly.
```

Here the `zero-phase` vertical response policy is explicit and the residual defect core is finite and exact.

The next work should therefore study repair of the seven-term core, not recurse the whole q frontier.

---

## 12. Next bounded seam

Use only `4665655546` and its seven uncovered requirements.

Compile candidate generic fragments from existing exact machinery:

```text
CPC ownership / parity-shift facts
vertical and cross-column response contracts
Baseinverse-style directly playable response pairs compiled generically
race/successor blockers
response-matroid circuits
NDC prerequisite/guard closure
```

Then ask:

> Can P1 construct one compatible safety cover of the seven-term core while preserving the 30-requirement vertical paired-response cover, or does every repair necessarily produce a typed defect/circuit that transfers back into P0 progress?

This is a finite `R/P/C/N` problem. Do not descend the broad exact-q frontier.

All experiments remain under the hard five-minute wall-clock rule.
