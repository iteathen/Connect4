# Slot-Local 64-Bit Residual Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Bounded qualification:** workflow run `34654807627`, job `103444762602`  
**Standard-7x6 growth:** workflow run `34654991224`, job `103445330595`  
**Status:** exact; promoted as the strongest residual-memory architecture so far, but transition implementation still requires optimization

## Candidate

The residual antichain is represented over the fixed 625-term standard-7x6 ontology as:

```text
20 x u32 ontology words
-> 10 fixed slots x 64 bits
-> one hash-consed dictionary per slot
-> class = 10-tuple of slot-local chunk IDs
```

Each slot reference starts at u8 and widens independently to u16/u32 only when required. Parent/child persistence reuses unchanged parent chunk IDs instead of re-interning them.

## Exactness qualification

Complete bounded controls reproduced exactly:

- complete q-state census;
- complete edge census;
- every residual class term-ID sequence;
- every qID `(supportIndex,p0Class,p1Class)`;
- every quotient edge;
- independent BSFP root and root-action W/D/L;
- identical Negamax expansion and call counts.

The bounded controls are not favorable memory proxies because their ontologies occupy only a few of the ten standard-7x6 slots. They did establish semantic correctness.

## Standard 7x6 target-scale result

The target-scale campaign explicitly expanded support ranks 0 through 8 and discovered the complete rank-9 frontier.

Semantic checkpoints matched the term-list baseline exactly:

```text
q states after expanding rank 8:      797,388
residual classes:                    1,357,101
rank-9 frontier states:                538,774
nonterminal edges visited:           1,772,397
terminal wins:                          33,274
illegal/full-column probes:              4,627
```

No state/class-count drift occurred.

## Memory

At the rank-8 boundary:

```text
term-list baseline total typed:      213,445,613 B
term-list baseline residual:         181,839,518 B

global-128 chunked total typed:      133,828,301 B
global-128 chunked residual:         102,222,206 B

slot64 total typed:                  118,139,885 B
slot64 residual:                      86,533,790 B
slot64 q-state storage:               28,311,552 B
slot64 packed support:                 3,294,207 B
```

Therefore slot64 uses:

```text
55.35% of term-list total typed memory   -> 44.65% reduction
47.59% of term-list residual memory      -> 52.41% reduction
88.28% of global-128 total typed memory  -> 11.72% reduction
84.65% of global-128 residual memory     -> 15.35% reduction
```

### Actual class tuple widths

At rank 8 the ten slots widened to:

```text
[2,2,2,2,1,2,2,2,2,4] bytes/reference
```

Actual unique chunk counts were:

```text
[977, 365, 1224, 396, 121, 6625, 25666, 5803, 13936, 366766]
```

These exactly match the earlier storage census model and validate the slot-local narrow-ID premise.

Memory decomposition:

```text
class tuple arrays:        44,040,192 B
class metadata total:      69,206,016 B
class hash slots:           8,388,608 B
chunk payload:              4,753,408 B
chunk hash slots:           2,648,064 B
chunk dictionaries total:   7,401,472 B
transition prefix cache:     1,376,256 B
```

The prior ~31.9 MB census figure was a payload model, not a complete production residual-footprint estimate; the measured implementation correctly includes class capacity, metadata, class hashing, dictionaries, masks and transition cache.

## Persistence behavior

At rank 8:

```text
parent chunk reuses: 23,388,248
actual chunk interns: 12,039,032
reuse / intern:       1.943
slot width changes:   10
```

The persistence mechanism is therefore materially active rather than theoretical.

## Runtime

The standard-7x6 rank-8 campaign took:

```text
slot64 total campaign: 14.359 s
slot64 rank-8 expansion: 10.256 s
```

The earlier term-list campaign reached the same rank-8 boundary in roughly 2.02 s on its runner. Cross-run timings are not a controlled head-to-head benchmark, but the gap is large enough to establish that the current slot64 transition implementation is substantially slower.

The global-128 prototype also had a large transition penalty. A later class-first experiment reduced chunk-dictionary lookups by ~60% on 4x5 while barely changing runtime, indicating that dictionary interning order is not the primary cost.

## Disposition

Promote **slot-local 64-bit persistent chunks** as the strongest residual-memory architecture found so far.

Do **not** promote the current transition implementation as the speed path.

The next optimization seam is transition materialization itself:

1. precompute which ontology slots can be affected by each landing cell;
2. for block transitions, load/modify only slots containing terms that use that cell;
3. for own transitions, load direct affected slots first, derive reduced terms, then load only slots that can receive reduced terms or contain strict supersets that must be removed;
4. reuse all other parent slot IDs directly;
5. avoid reconstructing/scanning the full 20-word class when the exact transition closure touches only a subset.

This attacks the work that remains after parent-chunk reuse and class-first interning have already removed redundant dictionary activity.
