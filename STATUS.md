# Connect4 current research status

**Updated:** 2026-09-13  
**Branch:** `research/frontier-negamax-conformance`  
**Pre-cleanup snapshot:** `8bf24b6818b4e2775a3b41cd21e517b94e36271c`  
**Research direction / architecture:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This is a current-state router, not a historical journal. Retained work is under
`docs/research/**`; research prototypes are under `reference/research-prototypes/**`.

## Objective

Derive the exact subset of the 69 geometric Connect Four winning lines that can occur
as P0 terminal wins on at least one W/D/L-perfect trajectory, using structural proof
rather than an externally supplied terminal-line classification.

The suspected final cardinality is output only. It is not a premise, tuning target, or
acceptance criterion. Exact enumeration/search is a bounded falsifier/qualification
oracle, not theory-construction authority.

## Governing authority

Read before mutation:

1. account-global `iteathen/.github/AGENTS.md`;
2. `AGENT_LOCAL.md`;
3. `docs/specs/C4-0006-control-parity-and-winspace-v1.md`;
4. `docs/specs/C4-0007-nested-dependency-closure-v1.md`;
5. `docs/specs/C4-0010-quotient-native-negamax-v1.md`;
6. current research routed by `docs/research/RESEARCH_INDEX.md` and this file.

C4-0010 remains the forward semantic contract.

## Exact semantic boundary

Value identity:

```text
q = exact support
  + normalized P0 residual antichain
  + normalized P1 residual antichain
```

Output identity:

```text
q + exact P0 residual/origin provenance Pi0
```

Geometry automorphism may canonicalize value identity only with extension coherence;
output additionally transports original-line provenance.

Winning region:

```text
W = mu X . [ I union PreE(X) union PreA(X) ]
```

W/D/L proof currency is the six-element absolute-P0 interval lattice. Positive-win
claims require well-founded progress; no-win/safety claims require a complete legal
response policy.

## Accepted response hierarchy

### 1. All-even paired response

Historical accepted seed: every remaining column suffix even, vertically pair
`(trigger,response)`, and require every attacker residual to contain a response cell.

### 2. Pooled-frontier paired response

Accepted strict generalization:

- every odd-remainder column contributes its currently playable frontier cell to a
  shared pool;
- pool cardinality must be even;
- omit those frontier cells and vertically pair all even suffixes;
- attacker pool move -> defender consumes another live pool cell;
- attacker vertical trigger -> defender takes the upper mate;
- every attacker residual must intersect the vertical-response set.

Qualification across seven complete games:

```text
40,804 certificates
31,845 genuine-decision certificates
0 exact W/D/L contradictions
0 explicit policy failures
279,261 explicit policy states
```

Record:
`docs/research/2026-09-13-pooled-frontier-paired-response-theorem.md`

### 3. Synchronized column-channel response

Current strongest accepted static safety primitive.

Pair same-parity remaining columns for a synchronized same-depth prefix of length `L`
with matching parity, then vertically pair both even tails. A residual is blocked when
it contains either a vertical upper response or both endpoints of a synchronized cross
pair.

The defender response is exact:

```text
vertical trigger -> upper mate
cross-channel endpoint -> synchronized mate in the paired column
```

Cross-channel responses advance both columns in lockstep, preserving response
playability. Pooled-frontier response is the `L=1` odd-column special case.

Seven complete controls:

```text
reachable states:                       443,170
pooled-frontier certificates:            40,804
synchronized-channel certificates:       55,488
incremental certificates:                 14,684

channel genuine-decision certificates:    44,118
incremental genuine-decision states:       12,273

channel q classes:                        13,603
channel decision q classes:                9,847

exact W/D/L contradictions:                    0
explicit policy failures:                       0
explicit policy states explored:          417,798
```

Record:
`docs/research/2026-09-13-synchronized-column-channel-response-theorem.md`

Evidence:
`docs/research/evidence/2026-09-13-synchronized-channel-response-control.json`

Prototype:
`reference/research-prototypes/2026-09-13-perfect-play-winline/synchronized_channel_response_control.mjs`

## Choice elimination

Sound distinct-sibling implication does not imply state equality.

Strict, value + output safe:

```text
P0/max: upper(a) < lower(b) -> eliminate a
P1/min: lower(a) > upper(b) -> eliminate a
```

Current strict edge counts:

```text
pooled:   2,804
channel:  2,816
increment:   12
```

Non-strict, Stage-1 value only with retained witness:

```text
P0/max: upper(a) <= lower(b)
P1/min: lower(a) >= upper(b)
```

This grows from 45,430 to 49,711 eliminated value edges (+4,281). Equality is not
terminal-line-output safe without separate `Pi0`/output subsumption.

## Standard 7x6 boundary

No ply-2 child after any first move is fully certified by synchronized channels alone.
Best uncovered residual counts are:

```text
opening 1: 8
opening 2: 8
opening 3: 6
opening 4: 7
opening 5: 6
opening 6: 8
opening 7: 8
```

A more informative opening-3 control is now isolated:

```text
P0 first move column 3
P1 reply column 4
P0 to move
```

Bottom-up vertical response pairing covers **all 60** live minimal P0 residuals. Its
only unmanaged resources are the two eventual top cells `(3,6)` and `(4,6)`.

Before the first top defect:

```text
policy states:                    9,216
first-defect states:              6,144
P0 wins before first defect:          0
one-step re-enter-cover repairs:  6,142
unrepaired first defects:             2
```

The two exceptional late states have tiny constructive P1 race continuations, but a
recursive fixed-response proof-DAG still leaves 772 of 4,331 memoized structural states
unproved. Therefore opening 3 is **not yet internally proved no-win** by the current
certificate grammar.

An unconstrained "choose any reply that re-establishes a certificate" search exceeded
the bounded control window and is not accepted; it risks collapsing back into ordinary
game-tree search.

## Current missing calculus

The active gap is now **guarded certificate switching / defect transfer**, not blocker
coverage and not a smaller value quotient.

Required form:

```text
current covering certificate
+ attacker move cannot win immediately
+ candidate defender response
+ successor covering certificate
+ CPC / WSL / NDC / resource compatibility
+ well-founded resource-rank decrease
------------------------------------------------
candidate response is a legal certificate switch
```

For opening 3, the concrete question is how the two top-defect tokens can be transferred
or annihilated without releasing any of the blockers that already cover all 60 live
minimal requirements.

The response-switch relation must compress many physical histories into a small exact
proof graph. A relation that merely replays the game tree is rejected even if correct.

## Immediate execution seam

Derive a bounded **defect-transfer quotient and rank** from the opening-3 control:

1. retain synchronized channels as complete safety seeds;
2. represent a vertical-cover certificate by support, response phase, and live defect
   tokens rather than physical move order;
3. define a certificate-switch edge only when WSL coverage survives the response and
   CPC/NDC/resource guards remain legal;
4. prove a monotone rank decreases across switch edges;
5. quotient commuting paired moves before exploring switch choices;
6. mechanically compare the compressed proof graph with the rejected unconstrained
   switch search on bounded games;
7. preserve the smallest state where the proposed switch quotient loses information;
8. only after the switch graph closes may opening 3 be promoted to an internal no-win
   premise;
9. keep terminal-line provenance separate from value-only non-strict reductions.

Positive P0-win progress remains a separate later obligation.

## Hygiene

- `STATUS.md` / `next_step.yaml` are current-state files only.
- Negative controls and incomplete experiments are retained with their status.
- Unknown usefulness is retained by default.
- No state equality is inferred from certificate reuse.
- The retired `2023 -> 419 + 1604` scratch count remains non-authoritative.
