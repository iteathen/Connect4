# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Pre-cleanup snapshot:** `8bf24b6818b4e2775a3b41cd21e517b94e36271c`  
**Research direction / architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This file is a **current-state router**, not a historical journal. Historical results,
negative controls, superseded interpretations, benchmark records, and prior optimization
work remain under `docs/research/**` and in Git history. Start with
[`docs/research/RESEARCH_INDEX.md`](docs/research/RESEARCH_INDEX.md).

## Current objective

Derive the exact subset of the 69 geometric Connect Four winning lines that can occur
as P0 terminal wins on at least one W/D/L-perfect trajectory, using structural proof
rather than an externally supplied solved terminal-line classification.

The suspected final cardinality is **output only**. It must not be used as a premise,
tuning target, acceptance criterion, or measure of whether a candidate theorem is
"getting warmer."

Exact enumeration/search is permitted as a bounded control or qualification oracle.
It is not theory-construction authority.

## Governing authority

Read in this order before mutation:

1. account-global `iteathen/.github/AGENTS.md`;
2. `AGENT_LOCAL.md`;
3. `docs/specs/C4-0006-control-parity-and-winspace-v1.md`;
4. `docs/specs/C4-0007-nested-dependency-closure-v1.md`;
5. `docs/specs/C4-0010-quotient-native-negamax-v1.md`;
6. current research routed by `docs/research/RESEARCH_INDEX.md`.

C4-0010 remains the forward-solver contract. The mathematical work does not silently
redefine its exact game semantics.

## Accepted structural boundary

The mechanically derived standard-board geometry contains:

- 69 geometric winning lines;
- 625 unique nonempty residual fragments;
- CPC for parity/control/event-precedence facts;
- WSL-625 for residual requirements and blocker closure;
- NDC for monotone nested dependency closure.

Support/playability, ownership, response resources, event order, race horizons,
deadlines, guards, and output provenance remain load-bearing where the corresponding
proof or observable depends on them.

## Exact semantic decomposition

### Value-state identity

C4-0010 owns the qualified ordinary forward quotient:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

The current causal-isomorphism boundary is extension-coherent support/winning-line
geometry automorphism. Same-snapshot resemblance is not enough. Non-derivable
CPC/NDC/path-dependent certificate facts must extend identity or remain contextual.

### Winning region

The P0 winning region remains:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

where `PreE` is the P0 existential predecessor and `PreA` is the P1 universal
predecessor.

### W/D/L proof currency

Sound structural facts narrow the six possible absolute-P0 W/D/L intervals. Exact
predecessor propagation is max/min over child interval endpoints.

The old all-even paired-response theorem remains sound, but it is now a strict special
case of the pooled-frontier theorem below.

### Terminal-line output

Perfect-play terminal-line identity is richer than W/D/L:

```text
value layer:   q
output layer:  q + exact P0 residual/origin provenance Pi0
```

Geometry isomorphism transports line labels; it does not erase them. Strictly inferior
W/D/L children can be eliminated from output reachability. Tied children cannot be
discarded for output merely because value is preserved.

## New exact safety theorem: pooled-frontier paired response

For side-to-move attacker `A`, let every odd-remainder column contribute its currently
playable frontier cell to pool `U`. Omit those cells, then pair every remaining column
suffix bottom-up into vertical `(trigger,response)` pairs and let `D` be the set of
upper response cells.

If:

```text
|U| is even
AND every surviving attacker residual requirement intersects D
```

then the defender has a constructive no-win policy:

```text
attacker plays vertical trigger -> defender plays its upper mate
attacker plays pool cell        -> defender plays any other live pool cell
```

Pool responses consume two odd-column frontiers and expose even suffixes already
covered by vertical pairing. Every response cell in `D` is therefore unavailable to
the attacker, so every surviving winning line is permanently blocked.

Absolute-P0 consequence:

```text
side P0 -> [-1,0]
side P1 -> [0,+1]
```

Research/evidence:

- `docs/research/2026-09-13-pooled-frontier-paired-response-theorem.md`
- `docs/research/evidence/2026-09-13-pooled-frontier-response-control.json`
- `reference/research-prototypes/2026-09-13-perfect-play-winline/pooled_frontier_response_control.mjs`

## Latest qualification

Across the same seven complete bounded games used by the current C4-0010 controls:

```text
reachable states:                    443,170
nonterminal states:                  353,378

old all-even certificates:            10,912
pooled-frontier certificates:          40,804
new certificates:                      29,892

old genuine-decision certificates:      9,388
pooled genuine-decision certificates:  31,845
new genuine-decision certificates:     22,457

old q classes covered:                  2,386
pooled q classes covered:               9,841
old decision q classes covered:         1,981
pooled decision q classes covered:      6,960

exact W/D/L mismatches:                     0
explicit policy failures:                   0
explicit policy states explored:      279,261
```

The old theorem is a subset of the new theorem on every control.

Two naive relaxations remain explicit negative controls on complete 4x3 connect-3:

```text
leave top unpaired, static coverage only:
  562 qualifying / 106 false no-win claims

leave bottom frontier unpaired but omit even-pool guard:
  562 qualifying / 96 false no-win claims
```

Thus the improvement comes from exact response-resource identity and consumption, not
from looser static coverage.

## Guarded sibling elimination now established

With sound child intervals, distinct exact `q` alternatives may be ordered without
being merged.

For P0/max:

```text
upper(a) < lower(b) -> eliminate a
```

For P1/min:

```text
lower(a) > upper(b) -> eliminate a
```

These strict rules preserve both parent W/D/L and perfect-play line output because the
eliminated child is provably not value-preserving.

Using only direct tactical intervals plus response certificates, with no recursive
interval propagation:

```text
strict sibling eliminations, old theorem:    2,440
strict sibling eliminations, pooled theorem: 2,804
incremental strict eliminations:                364
exact parent-value mismatches:                    0
```

This is the first concrete theorem-backed reduction at the proof-obligation layer of
the current alternative-implication seam.

## Standard 7x6 boundary

The pooled-frontier theorem alone does not discharge the opening at ply 2. After each
P0 first move and every legal P1 reply, uncovered P0 residual requirements remain:

```text
openings 1,2,3,5,6,7: minimum uncovered residuals = 8
opening 4:             minimum uncovered residuals = 9
```

No solved opening table was used. This is a structural boundary showing that richer
blocker/NDC/resource interaction is still needed.

## Current missing calculus

The exact state differential is not the active gap. The next safety-side gap is a
**guarded response-resource graph** that generalizes the fully interchangeable
frontier pool:

```text
attacker trigger / obligation
  -> timely playable response resources
  -> compatibility / consumption relation
  -> complete contingent safety policy
  -> one-sided W/D/L interval
  -> strict sibling elimination
```

The pooled-frontier theorem is the complete-compatibility/even-cardinality seed case.
Any relaxation must retain support, response identity, order, deadlines, CPC/NDC guards,
and the smallest counterexample when falsified.

Positive P0-win implication remains separate and still requires a well-founded
progress theorem.

## Immediate execution seam

Develop and qualify the **response-resource graph calculus** over exact C4-0010 `q`
classes.

The next unit should:

1. preserve pooled-frontier paired response as an accepted safety primitive;
2. construct explicit trigger/obligation -> timely response-resource relations;
3. relax full pool interchangeability only under proved compatibility/Hall/deadline
   conditions;
4. compile every accepted policy into the same W/D/L interval currency;
5. apply strict sibling elimination before considering tied/value-only reductions;
6. preserve `Pi0` whenever output-sensitive non-strict elimination is considered;
7. mechanically falsify every relaxed rule on complete controls and retain the
   smallest counterexample;
8. keep positive-win progress obligations separate.

The obsolete remembered scratch count `2023 -> 419 + 1604` remains retired as
unverified historical evidence.

## Research hygiene

- `STATUS.md` and `next_step.yaml` contain current state only.
- `docs/research/RESEARCH_INDEX.md` routes retained research.
- `reference/research-prototypes/README.md` routes non-production prototypes.
- Negative controls are retained.
- Corrected/superseded experiments are retained with downgraded interpretation.
- Unknown usefulness is retained by default.
- Deletion requires demonstrated redundancy or obsolescence plus preserved provenance.
