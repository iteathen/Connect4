# Directional synergy map against the core candidate set

**Date:** 2026-09-09  
**Status:** research theoretical classification; maintained source and `main` unchanged.

## Purpose

Synergy is an independent relational category. This map records **directional** effects `A -> B`: whether candidate A makes a specific core candidate B cheaper, more applicable, more powerful, more local, or less effective. It does not duplicate pairwise compatibility and it is not an overall candidate score.

Core candidates are ordinary rows as well as columns. They are evaluated on the same synergy axis as every other candidate.

## Core columns

- `RWS` residual win-space semantic state
- `RID` fixed residual-requirement universe
- `SUP` exact support/accessibility state, including possible event-frontier realization
- `FW` fixed-width allocation-free execution
- `INC` incremental/precomputed transitions
- `IWIN` exact immediate-win closure
- `DTH` exact double-threat loss closure
- `FBLK` forced single-response restriction
- `FMAC` forced macro-edges / decision-state admission
- `CARD` cheap exact earliest-win bound (cardinality fallback)
- `CTT` compact exact TT identity
- `PH` proof/bound authority separated from hints
- `AUTO` residual automorphism/equivalence collapse
- `DEAD` exact dead/neutral choice equivalence

## Relation vocabulary

Each recorded edge has an evidence state and a mechanism:

- `OBS` — observed composition/ablation evidence;
- `PROJ` — theoretical/projected synergy, not yet directly measured as a crossed composition.

Mechanisms:

- `cost` — lowers execution/metadata cost;
- `state` — simplifies/canonicalizes B's input domain;
- `apply` — increases B's applicability/hit rate;
- `proof` — improves proof order/cutoff power;
- `cache` — improves retention/density/locality;
- `correct` — supplies the exact validity condition B needs;
- `interfere` — projected or observed negative interaction;
- `overlap` — B's addressable work is partly already removed by A.

Only material edges are listed. Absence means `no material synergy currently established`, not incompatibility.

---

# Core -> core directional synergy

| Source candidate | Observed core synergies | Projected core synergies | Interference / overlap notes |
|---|---|---|---|
| **RWS** | `RWS -> CARD` OBS/state: cardinality is native requirement metadata; `RWS -> AUTO` OBS/state: residual orbits exist beyond board symmetry | `-> RID` apply/structure; `-> SUP` state: tells support compiler which cells/events remain strategically relevant; `-> IWIN/DTH/FBLK` cost via singleton/playable requirements; `-> CTT` state by smaller semantic identity; `-> DEAD` state | Rich RWS form can interfere with FW if represented dynamically; this is cost tension, not semantic incompatibility. |
| **RID** | `RID -> AUTO` OBS/cost: precomputed swap maps made orbit integration cheap enough to win with CARD; `RID -> IMPL` OBS/cost predicate | `-> RWS` cost; `-> CARD` cost; `-> IWIN/DTH/FBLK` cost; `-> INC` substrate; `-> CTT` state packing; `-> DEAD` apply | Dense 625-wide scanning would interfere with FW; compact active representation avoids it. |
| **SUP** | Current height support already makes tactical legality exact | Event form `-> CARD/SEWB` cost; `-> IWIN/DTH/FBLK` correct; `-> AUTO` correct identity; `-> DEAD` **strong correct/state**; `-> CTT` correct key; `-> RWS` correct physical complement | Any support abstraction that drops event timing can make DEAD/AUTO/RWS unsound. |
| **FW** | Fixed two-word implementation directly enabled ~10M/s kernel | `-> RWS/RID/SUP/AUTO/DEAD` cost by forcing compact numeric realization; `-> FMAC` cost; `-> CTT` cost | FW does not reduce nodes; it can exclude otherwise sound but expensive forms. |
| **INC** | Precomputed RID transitions and AUTO swap maps have direct mechanism evidence | `-> RWS/RID/SUP/IWIN/DTH/FBLK/FMAC/CARD/AUTO/DEAD` cost; broadest cost-sharing edge set | Large random transition tables could hurt locality; table footprint must be measured. |
| **IWIN** | `-> FMAC` OBS/proof: terminates forced chains; tactical closure strongly reduces search | `-> CTT/AUTO` overlap by preventing terminal states from reaching them | Overlaps with evaluator immediate-threat heuristics; exact rule should own authority. |
| **DTH** | `-> FMAC` OBS/proof: terminates opponent fork chains | `-> CTT/AUTO` overlap | Same saturation note as IWIN. |
| **FBLK** | `-> FMAC` OBS/apply: unique forced defense is the primitive that creates macro transit chains | `-> CARD` proof: forced transition may tighten earliest-win distance before next decision | FBLK and FMAC work overlap if their savings are double-counted; semantic roles remain distinct. |
| **FMAC** | `-> RANK/CTT physical cache` OBS/cache indirectly: decision admission cut writes strongly; `FMAC + tactical` OBS strong composition | `-> AUTO` cost: expensive equivalence only at decisions; `-> IMPL` cost but overlap: fewer candidate states to query; `-> CARD` cost frequency; `-> PH` cleaner decision-state hints | `FMAC -> IMPL` has both cost synergy and saturation/overlap; implication measured smaller node gain after macros. Skipping transit TT can occasionally lose reuse. |
| **CARD** | `-> AUTO` OBS/proof: CARD+AUTO removed more nodes and measured faster than CARD alone | `-> CTT` cache via fewer states; `-> FMAC` proof ordering; `-> PH` exact bound class | Can be subsumed by equally cheap richer support-aware bound. |
| **CTT** | `CTT <-> RANK` OBS/cache in rank-compatible 10-byte format | `-> FW` cost/memory traffic; `-> PH` footprint; `-> AUTO` cache capacity if canonicalization fixed; `-> FMAC` cache density | Current address-derived encoding co-designs with AUTO/banking/relocation; wrong order can create interference. |
| **PH** | Maintained incumbent OBS: score validity separated from ordering-only best-move reuse | `-> CTT` correct metadata packing; `-> FMAC` hint scope; `-> AUTO` safe hint reuse across weaker validity; `-> RWS` allows heuristic residual metadata without proof promotion | Primarily correctness/enabling synergy, not direct node reduction. |
| **AUTO** | `AUTO -> CARD stack` OBS/state: orbit collapse adds savings beyond CARD | `-> CTT` cache by collapsing keys; `-> DEAD` apply through canonical equivalent actions; `-> RWS` state quotient | Canonicalization can worsen direct-map collision distribution; physical reflection is observed example of negative cache interaction. |
| **DEAD** | Structural quotient OBS: dead/neutral action collapse exposes large branch reductions on eligible roots | `-> AUTO` apply/state: fewer distinctions can enlarge automorphism classes; `-> RWS` state; `-> CTT` cache; `-> CARD` proof volume | Incorrect global neutral pooling interferes with SUP exact timing; safe DEAD depends on SUP rather than overriding it. |

---

# Non-core strategic candidate -> core synergy

| Source | Observed synergies with core | Projected synergies with core | Negative / overlap edges |
|---|---|---|---|
| **SEWB support-aware earliest-win** | Removes slightly more nodes than CARD on frozen 7x6 | `SUP-event -> SEWB` is reverse edge; `SEWB -> PH` exact bound; `-> CTT` fewer states | `SEWB -> CARD` is mostly substitution/overlap, not additive. Scan-heavy form interferes with FW. |
| **EXH one-sided exhaustion** | Uses RWS-empty fact; strong on one small geometry, mixed elsewhere | `RWS/RID -> EXH` reverse free-rider relation; `EXH -> PH` exact WDL bound | Saturates heavily after tactical/CARD/neutral mechanisms. Do not build dedicated machinery. |
| **IMPL dominance** | Node reductions survive RID bitset predicate; time negative in current frontier | `-> PH` strong correct bound supply; `-> CTT` can reduce exact-state work; `SUP-event -> IMPL` reverse strong cost; `RID -> IMPL` reverse observed cost | After FMAC its marginal node benefit fell; current index interferes with FW. |
| **RANK banking** | `RANK + FMAC` OBS/cache; `RANK + CTT` OBS co-designed exact compact key | `-> CTT` cache locality; `-> FW` locality; `-> PH` retention | Benefit saturates with roomy capacity; fixed poor bank boundaries can interfere with CTT capacity. |
| **STT global shared TT** | Strong cross-worker node/wall reductions | `-> CTT` makes compact key more valuable (more shared traffic); `-> PH` more shared hints/bounds; `-> FMAC` shares decision proofs | Shared random working set can interfere with locality; CAP required. |
| **CAP active capacity** | Capacity knees directly observed | `-> CTT/RANK/STT` strong cache tuning; `-> FW` locality | No direct semantic synergy with RWS/tactical candidates. |
| **YBWC/Jamboree** | Wall-time wins with extra nodes | `-> PH` increases value of safe first-child hints; `-> FMAC` may shorten critical path; `-> CTT/STT` raises value of shared proof memory | Can interfere with node-reducing core via speculation; FMAC may reduce available sibling parallelism. |
| **AFF temporal grouping** | Fixed A1/A2/B replay protected reuse without extra physical capacity | `-> CTT/STT` cache retention; `-> PH` ordering history | Can interfere with YBWC critical path if grouping delays eligible proof work. |
| **CPR completed coarse proof reuse** | Whole-solve coarse graph experiment reduced nodes/dispatches/time; completed-only ablation strong | `-> PH` supplies exact interval owner; `-> CTT` complements recursive cache; `RWS/AUTO -> CPR` reverse duplicate/coarse identity | Overlap with JOIN; does not require core hot-state changes. |
| **JOIN in-flight proof coalescing** | Duplicate-request mechanism tests positive; whole-solve advantage over CPR not established | `-> CTT/STT` duplicate traffic reduction; `RWS/AUTO -> JOIN` reverse identity | Coordination cost can interfere with FW/YBWC; overlap with CPR is large. |
| **MHINT TT/cutoff move hint** | Exact-solver byte form small node win; incumbent persistent ordering stronger | `-> FMAC` proof order at decision states; `-> PH` consumes ordering-only authority; `-> YBWC` (non-core) strong | Extra byte interferes with CTT footprint; only attractive if packed nearly free. |

---

# Evaluator-derived candidate -> core synergy

| Source | Observed | Projected core synergy | Negative / overlap |
|---|---|---|---|
| **E1 residual live-line/requirement ordering** | Exact-solver direct cross not yet measured; external and incumbent evidence support winning-opportunity ordering | `-> FMAC` proof-order at true decisions; `-> PH` hint; `RWS/RID/INC -> E1` reverse strong cost; `-> CTT` fewer nodes if order works | Full geometric line scan interferes strongly with FW. Exact tactical part overlaps IWIN/DTH/FBLK. |
| **E2 parity/future-threat signal** | Maintained evaluator uses it; no exact residual ordering crossing yet | `SUP/RWS/RID -> E2` reverse cost; `E2 -> PH` hint; `-> CARD/SEWB` shared support metadata; `-> FMAC` decision ordering | Heuristic bit must not be promoted to proof authority. |
| **E3 0.65 root-relative evaluator ordering** | no isolated exact evidence | `-> PH` ordering-only; possibly `-> FMAC` root/task order | Root-perspective dependence conflicts with deep negamax simplicity/FW if used literally. |
| **E4 evaluator immediate tactical promotion** | Maintained behavior qualified | none material beyond compatibility | Strongly overlapped/displaced by exact IWIN/DTH/FBLK in exact search. |

---

# Allis rule family -> core synergy

These edges refer to **compiled exact rule instances/certificates**, not a dynamic recursive VICTOR graph.

| Rule candidate | Projected core synergy | Reverse core synergy that makes rule cheaper | Important overlap/interference |
|---|---|---|---|
| **Claimeven** | `-> PH` exact strategic certificate; `-> DEAD` can prove future inaccessible/owned cells in some contexts | `SUP/RID/RWS/INC -> Claimeven` very strong | Some coverage overlaps simpler parity/tactical facts; controller/Zugzwang precondition is mandatory. |
| **Baseinverse** | `-> PH` certificate | `SUP/RID -> Baseinverse` strong because playable cells and requirement masks are native | Can overlap Baseclaim; broadly compatible otherwise. |
| **Vertical** | `-> PH` certificate; may aid DEAD/event consequences | `SUP/RID -> Vertical` very strong | Pure Claimeven may be stronger when upper square parity permits; do not duplicate coverage blindly. |
| **Aftereven** | `-> DEAD` projected event/inaccessible-above consequence; `-> PH` broad certificate | `SUP-event -> Aftereven` **very strong**; `RID/RWS ->` strong | Overlaps embedded Claimevens; compatibility with other parity rules nontrivial. |
| **Lowinverse** | `-> PH` multi-group certificate | `SUP-event/RID -> Lowinverse` strong | Embedded Verticals overlap A3; compatibility order with Claimeven/Before must be preserved. |
| **Highinverse** | `-> PH` certificate | `SUP/RID -> Highinverse` strong | Larger six-square condition means lower applicability and more compatibility cost. |
| **Baseclaim** | `-> PH` dual-pattern certificate | `SUP/RID -> Baseclaim` strong | Partly overlaps Baseinverse; count marginal extra solved groups, not whole mask. |
| **Before** | `-> DEAD` and potentially `CARD/SEWB` via event consequences; `-> PH` broad certificate | `SUP-event -> Before` **very strong**; `RID/RWS ->` strong | Pure-Claimeven form is subsumed by Aftereven; compatibility constraints can interfere if represented independently. |
| **Specialbefore** | `-> PH` niche closing certificate; potential DEAD event consequences | `SUP-event/RID ->` strong | High form cost; should be generated selectively after cheaper rule cover leaves gaps. |
| **Rule-cover solver** | If successful, `-> PH` exact global certificate; `-> FMAC/CTT/AUTO` overlap by terminating subtree before those mechanisms run | `RID/RWS/SUP-event -> cover` **very strong cost/state** | Dynamic graph form interferes with FW; successful cover heavily saturates downstream search work. |

---

# Proof-cost candidate -> core synergy

| Candidate | Projected core synergy | Reverse synergy | Interference / overlap |
|---|---|---|---|
| **P1 cheap conspiracy/proof-cost ordering** | `-> FMAC` better decision ordering; `-> PH` hint; indirectly improves CTT hit usefulness by earlier cutoffs | `RWS/RID/CARD/SUP/E2 -> P1` strong shared features | Secondary search/proof-number computation would interfere with FW; use already-paid metadata first. |
| **P2 full PNS alternate solver** | Little additive core synergy; may consume RWS/RID/SUP as state representation | `RWS/RID/SUP -> PNS` could make nodes cheaper | Primarily **substitutive** with alpha-beta/null-window driver; high lock-in and memory/frontier tension with FW/CTT design. |

---

# Negative/control forms -> core interaction

| Candidate form | Core relation |
|---|---|
| WDL-first exact-score prepass | observed interference with current exact proof sequence; not a synergy candidate |
| physical board reflection TT canonicalization | observed negative cache interaction with direct-mapped CTT baseline; do not infer negative AUTO residual synergy |
| separate successor-dedup pass | overlapped/saturated by TT/order; prefer AUTO/canonical state |
| structural opponent-destruction ordering | no measured proof-order gain; only added FW cost |
| two-tier previous/current TT | interferes with CTT/CAP by stranding equal-total capacity |
| same-key dual-bound hot retention | adds PH metadata without measured node benefit in direct TT; CPR is different coarse use |
| recursion-only forced chain | completely overlapped by baseline graph; FMAC's cache-boundary change is the real mechanism |
| global neutral deletion/pooling | fundamentally interferes with SUP exact event timing unless equivalence is proved |
| full evaluator rescans | interferes with FW; retain E1/E2 incremental knowledge instead |
| dynamic VICTOR compatibility graph | interferes with FW; retain fixed RID/SUP compiled rule certificates |

---

# Highest projected synergy hubs

This section is a *relational observation*, not a candidate score.

- **RID** is the strongest projected **cost-sharing hub**: RWS maintenance, AUTO transforms, IMPL predicates, CARD metadata and Allis coverage can all consume the same finite dictionary.
- **SUP event frontier** is the strongest projected **semantic/event hub**: DEAD safety, SEWB, evaluator parity, Aftereven/Before and IMPL support identity may all become native consequences.
- **FMAC** is the strongest measured **downstream-cost gate**: it reduces how often TT, symmetry, implication and ordering operate by exposing only genuine decision states.
- **CTT** is the strongest measured **physical-memory hub**: it affects active-capacity knee, rank bank width, shared-TT bandwidth and packed hint budget.
- **PH** is the strongest **authority integration hub**: evaluator, TT witnesses, previous-pass hints, Allis rules and coarse proof reuse can coexist without confusing hints with exact proof.

These observations identify high-leverage integration seams. They do not mean the hubs have the highest standalone effectiveness on every metric.