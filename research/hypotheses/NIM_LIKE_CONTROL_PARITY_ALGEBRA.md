# Nim-like control-parity algebra hypothesis

**Status:** hypothesis / active investigation  
**Research direction:** Joshua Oshiro  
**Owner:** `research/semantic-quotient`  
**Primary strategy seam:** GSP-004 guarded obligation closure  
**Gameplay authority effect:** none  
**Runtime adoption effect:** none

## Hypothesis

Connect Four may admit a latent control quantity derived entirely from game
geometry and rules whose construction is potentially complicated, while the
composition/cancellation law on that quantity is substantially simpler and may
be XOR / addition over GF(2).

This is deliberately **not** the claim that board columns have simple nimbers,
that Connect Four is an impartial Sprague-Grundy game, or that game value is a
simple parity formula.

The intended shape is:

```text
geometry
+ gravity/support
+ alternating control
+ residual winning obligations
+ response resources
+ first-win deadlines
+ implicit assertions
    -> latent control representation F(s)

composition / cancellation of compatible control components
    -> possibly XOR-like law
```

A schematic candidate is:

```text
X(s) = F(G(s), R(s), P(s), O(s), D(s), ...)
```

where:

- `G` is geometric winning-line incidence and symmetry;
- `R` is the residual winning-requirement structure;
- `P` is support/control parity;
- `O` is guarded obligation/resource structure;
- `D` is first-win timing/deadline structure.

The hypothesis permits `F` to be high-degree, vector-valued, recursively
derived, or represented by a system of polynomials. The candidate simplicity
is in the **composition law**, not necessarily in deriving the operands.

## Why Nim is a useful analogy but not a premise

Connect Four is partizan, gravity-coupled and first-win terminating. Its
substructures can share cells, blockers and deadlines. Ordinary
Sprague-Grundy decomposition therefore does not apply automatically.

The useful analogy is narrower:

- paired control resources can cancel;
- unmatched resources can survive;
- parity controls who receives residual opportunities;
- independent or conditionally independent obligations may compose through an
  algebra simpler than their derivation;
- XOR is the cheapest candidate cancellation law and must emerge from rules if
  it is real.

No solved outcome may be used to assign latent values in the producer.

## Connection to current center-prefix research

The current rule-only center campaign established a common unresolved boundary
of 2,108 support states reached from the restricted
`4` / `444` / `44444` follow-up policy after immediate-win closure.

That common boundary is a useful falsification laboratory because:

1. the three prefixes differ in literal history and center-stack depth;
2. the restricted response policy collapses them to exactly the same unresolved
   support set;
3. no solved W/D/L labels are needed to construct the set;
4. geometry, support parity and first-win conditions remain explicit.

The current research question is whether this convergence is one visible
instance of a deeper control quotient.

## Candidate algebraic program

Do not prescribe the latent value. Derive constraints on it.

### A. Transition cancellation

For rule-derived transition or response fragments `T_i`, determine whether
there is a quotient in which compatible pairs satisfy:

```text
T_i xor T_i = 0
```

or more generally whether nontrivial linear relations exist over GF(2).

The relation must be derived from geometry/rules, not outcome labels.

### B. Guarded polynomial assertions

Encode primitive support/control predicates as Boolean variables and calculate
low-degree GF(2) identities satisfied by a rule-derived state family.

Factor simple identities back into game geometry.

A useful form is:

```text
guard * syndrome = 0
```

where multiplication represents a geometric/support guard and XOR is the
additive/cancellation operation.

### C. Implicit-assertion closure

Use IsoGraph IA recursively:

```text
explicit rules
-> primitive obligations
-> implicit equalities/cancellations
-> guarded polynomial consequences
-> fixed point
```

The purpose is not to fit a finite outcome table. Each generated assertion must
have an independent rule/geometry interpretation or remain only an empirical
algebraic lead.

### D. Dimension perturbation

Rows and columns are expected to influence the algebra, but their directness is
unknown.

For fixed Connect-K rule K=4, vary width and height and derive, blind to known
board outcomes:

- winning-line incidence;
- response-transition relation rank;
- quotient dimension;
- unmatched-defect dimension;
- symmetry-fixed relations;
- minimum observed degree of nontrivial polynomial identities;
- dimensions of degree-d identity spaces.

Only after freezing those structural quantities may known outcomes be consulted
as external discovery evidence.

A useful result would be a structural quantity that changes when outcome changes
without having been designed from the outcome.

## Falsifiers

The hypothesis loses support if, across independent rule-derived families:

1. nontrivial XOR relations disappear after proper support/deadline guards are
   included;
2. every apparent cancellation is merely a restatement of raw token parity and
   carries no obligation/control information;
3. latent-value candidates require solved W/D/L labels for their definition;
4. polynomial identities fail to generalize under dimension or state-family
   perturbation;
5. the supposed composition law changes arbitrarily with context rather than
   admitting explicit guards;
6. an allegedly independent component decomposition silently shares a cell,
   blocker, resource or first-win deadline.

A failure of simple per-column nimbers does **not** falsify this hypothesis.

## Evidence discipline

Keep three levels separate:

```text
algebraic identity on a rule-derived finite family
    !=
general Connect Four theorem
    !=
game-value theorem
```

Likewise:

```text
XOR relation among transition contributions
    !=
proof that W/D/L is the XOR value
```

The first goal is to discover a real latent algebra. Game-value consumption
requires an independently proved bridge from that algebra into guarded
obligation closure.

## First repository reproduction

Checked-in rule-only code now reproduces bounded evidence at
[CONTROL_ALGEBRA_RESULT.md](../isograph/discovery/2026-09-29-center-proof-cycle/CONTROL_ALGEBRA_RESULT.md):

- the standard 7x6 single-defect response family has 20 pair generators of
  GF(2) rank 19;
- the unique recovered response dependency is the XOR of all three ordinary
  pairs in columns 1,3,5,7;
- the unmatched P1 center-top event raises the rank from 19 to 20;
- the 2,108 unresolved boundary has no nonzero degree-1 or degree-2 vanishing
  polynomial, exactly two independent degree-3 identities, and 43 identities
  by degree 4 in the declared 12-bit support encoding;
- the two cubic identities factor into reflected support-parity gates for
  center-crossing diagonal completions;
- degree <= 4 separates all 1,987 immediate-win comparison states from the
  unresolved family;
- across widths 4..10 and even heights 4/6/8, every geometrically safe
  single-defect family has exactly one pair-relation dependency and an
  independent unmatched top defect.

This is bounded algebraic evidence, not a value theorem. The post-hoc
[outcome comparison](../isograph/discovery/2026-09-29-center-proof-cycle/CONTROL_ALGEBRA_OUTCOME_COMPARISON.md)
also shows that the first GF(2) skeleton is insufficient for W/D/L: 7x4, 7x6
and 7x8 share the same one-relation/one-defect structure while their known
outcomes differ.

## Immediate experiment

Build a cold, rule-only experiment with no solver or solved-outcome imports.

1. reproduce the 7x6 response-transition relation space;
2. recover exact GF(2) dependencies and unmatched-defect rank;
3. recover the lowest-degree polynomial identities of the 2,108 unresolved
   boundary;
4. decode the simplest factors back into explicit winning-line geometry;
5. perturb width/height while keeping K=4 and derive the same structural
   quantities without consulting board outcomes;
6. preserve negative results as aggressively as positive ones.

No production solver changes follow from this experiment.


## Research publication

The current bounded research synthesis is published on this research branch as:

[C = NC? Control-Parity Algebra, Branch Collapse, and a Structural Research Program for Generalized Connect Four](../publications/2026-09-29/C_EQUALS_NC_CONTROL_PARITY_ALGEBRA_0_2.md)

Author: Joshua Oshiro. The paper discloses AI-agent assistance and explicitly states that the AI agent was not responsible for the core conceptual findings or research direction.
