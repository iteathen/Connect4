# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Pre-cleanup snapshot:** `8bf24b6818b4e2775a3b41cd21e517b94e36271c`  
**Research direction / architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router. Historical, negative, superseded, and qualification
records remain under `docs/research/**` and `reference/research-prototypes/**`.

## Objective

Derive the exact perfect-W/D/L P0 terminal winning-line set for standard 7x6 Connect
Four from structural proof. The suspected final cardinality is output only and may not
be used as a premise, tuning target, or acceptance criterion.

Exact enumeration/search is permitted only as a bounded falsifier/qualification oracle.

## Governing authority

Read before mutation:

1. account-global `iteathen/.github/AGENTS.md`;
2. `AGENT_LOCAL.md`;
3. `docs/specs/C4-0006-control-parity-and-winspace-v1.md`;
4. `docs/specs/C4-0007-nested-dependency-closure-v1.md`;
5. `docs/specs/C4-0010-quotient-native-negamax-v1.md`;
6. current research routed by `docs/research/RESEARCH_INDEX.md`.

## Exact semantic boundary

Value identity remains:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

Winning region:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

Output identity remains richer:

```text
q + exact P0 residual/origin provenance Pi0
```

The six-element absolute-P0 W/D/L interval lattice remains the shared proof currency.
Certificate reuse is not state equality. Positive wins require well-founded progress;
safety/no-win requires a complete legal response policy.

## Accepted response primitives

### Pooled-frontier paired response

A shared even pool of currently playable odd-column frontier cells plus vertical paired
tails gives a constructive no-win policy.

Seven complete controls:

```text
40,804 certificates
31,845 genuine-decision certificates
0 exact W/D/L contradictions
0 explicit policy failures
```

### Synchronized column channels

Same-parity columns may be paired through a synchronized same-depth prefix, then return
to vertical paired tails.

Seven complete controls:

```text
55,488 certificates
44,118 genuine-decision certificates
13,603 q classes
0 exact W/D/L contradictions
0 explicit policy failures
417,798 policy states explored
```

These are proof-obligation refinements over exact C4-0010 states, not a coarser state
identity.

## New internally proved opening theorem

The previously admitted standard-board fact for P0 opening column 3 is now derived
internally.

After:

```text
P0: column 3
P1: column 4
```

P1 uses the constructive policy:

```text
ordinary P0 move below top -> reply directly above
P0 C6 -> reply at lowest empty D cell
P0 D6 -> reply at lowest empty C cell
```

The proof factors into:

1. five independent normal-column response macros;
2. a 21-state local C/D response automaton with 24 macro edges and zero invalid
   responses;
3. 16 permanent singleton blockers;
4. four exact P0-forbidden pairs in the coupled C/D channel;
5. two support-shadow race/preemption certificates.

Mechanical geometry closure:

```text
singleton-blocked lines:      56
forbidden-pair lines:         11
support-shadow race lines:     2
-------------------------------
all P0 geometric lines:        69
unclassified:                   0
```

No solved W/D/L value and no full game tree is used by this proof.

Therefore:

```text
NonWin0(opening column 3)
NonWin0(opening column 5)   // horizontal reflection
```

Authority:
`docs/research/2026-09-13-opening3-structural-safety-certificate.md`

Reproducer:
`reference/research-prototypes/2026-09-13-perfect-play-winline/opening3_structural_safety_certificate.mjs`

Evidence:
`docs/research/evidence/2026-09-13-opening3-structural-safety-certificate.json`

The older full physical policy execution in `c1_draw_policy_certificate.mjs` is retained
only as an independent falsifier/qualification control and independently obtains the
same `56 + 11 + 2` decomposition.

## New generic race primitive made explicit

Support-shadow race/preemption:

```text
attacker winning line R = {u_i}
defender winning line Q = {q_i}
q_i supports u_i
policy proves defender owns each q_i before attacker can own u_i
---------------------------------------------------------------
Q completes before R; R cannot be an attacker terminal line
```

This is the missing progress/preemption information that the earlier P0-only safety
projection erased. It is compatible with the existing generic race-blocker / NDC
formalization and does not require historical named rules at runtime.

## Choice elimination boundary

Strict sibling elimination remains value + output safe:

```text
P0/max: upper(a) < lower(b) -> eliminate a
P1/min: lower(a) > upper(b) -> eliminate a
```

Non-strict equality elimination is Stage-1 value-only unless `Pi0`/output subsumption is
proved separately.

## Remaining first-move proof gaps

Internally proved non-center openings:

```text
column 3
column 5 (reflection)
```

Openings 1,2 and their reflections 7,6 still require the same level of internally
generated structural safety proof if external opening premises are to be eliminated.

The center opening still requires a positive well-founded progress proof. That remains
the decisive gap to a complete structural solve once the non-center safety side is
internalized.

## Immediate execution seam

Compile structural safety certificates for openings 1 and 2 using the same generic
language:

```text
local response-resource automata
+ singleton / forbidden-subset ownership invariants
+ support-shadow / generic race blockers
+ WSL/geometric closure
=> one-sided [-1,0] certificates
```

Do not import named Allis rules as theorem authority. Historical strategies may be used
for theorem discovery only; the accepted proof object must be generated from support,
response resources, ownership/exclusion, race precedence, and geometry.

If both openings close, reflection closes 6 and 7 and all six non-center first moves are
internal non-win theorems. The next seam then becomes center-positive progress.

## Hygiene

- `STATUS.md` / `next_step.yaml` contain current state only.
- Negative controls and incomplete experiments remain retained.
- Unknown usefulness is retained by default.
- The retired `2023 -> 419 + 1604` scratch count remains non-authoritative.
