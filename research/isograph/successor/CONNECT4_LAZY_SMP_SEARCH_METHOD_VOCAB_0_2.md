# Connect4 Lazy SMP Operational Vocabulary 0.2

**Status:** successor operational vocabulary; unqualified  
**Owner:** `research/semantic-quotient`  
**Scope:** Lazy SMP search/execution realization only  
**Game-theory authority effect:** none

The 0.1 Lazy-SMP graph was a preliminary summary. This vocabulary makes the 0.2 native graph mechanically decodable.

## Relation roles

| ID | Meaning |
|---|---|
| ^997000 | has type |
| ^997001 | source realization / provenance anchor |
| ^997002 | parameter / configuration |
| ^997003 | invariant |
| ^997004 | state value |
| ^997005 | guard condition |
| ^997006 | scope |
| ^997007 | status |
| ^997008 | measured quantity |
| ^997010 | owns |
| ^997011 | shares |
| ^997012 | copies / clones into occurrence |
| ^997013 | spawns |
| ^997014 | invokes |
| ^997015 | reads |
| ^997016 | writes |
| ^997017 | probes |
| ^997018 | stores |
| ^997019 | publishes |
| ^997020 | computes |
| ^997021 | gates |
| ^997022 | on true |
| ^997023 | on false |
| ^997024 | transitions to |
| ^997025 | selects |
| ^997026 | claims |
| ^997027 | notifies |
| ^997028 | polls |
| ^997029 | terminates |
| ^997030 | fails closed to |
| ^997031 | materializes |
| ^997032 | optional for correctness |
| ^997033 | required for correctness |
| ^997034 | same content under declared scope |
| ^997035 | distinct occurrence |
| ^997036 | may overwrite |
| ^997037 | validates |
| ^997038 | increments |
| ^997039 | addresses from |
| ^997040 | samples by |
| ^997041 | ordered before |
| ^997042 | excludes |
| ^997043 | returns |
| ^997044 | observes only |
| ^997045 | discards at boundary |
| ^997046 | preserves |
| ^997047 | maps to |
| ^997048 | competes with |
| ^997049 | exact-only |
| ^997050 | local-first |
| ^997051 | no retry / drop on failure |
| ^997052 | per invocation |
| ^997053 | immutable during invocation |

## Entity types

| ID | Meaning |
|---|---|
| ^997100 | Lazy SMP invocation |
| ^997101 | host orchestration |
| ^997102 | managed thread session |
| ^997103 | worker occurrence |
| ^997104 | semantic root |
| ^997105 | worker root occurrence |
| ^997106 | shared immutable geometry |
| ^997107 | private exact search state |
| ^997108 | private local exact cache |
| ^997109 | shared exact cache |
| ^997110 | cache slot |
| ^997111 | exact-key hash |
| ^997112 | sample mask |
| ^997113 | sample-bit mask |
| ^997114 | share-eligibility key class |
| ^997115 | local probe |
| ^997116 | shared probe |
| ^997117 | local exact store |
| ^997118 | shared exact store |
| ^997119 | sequence word |
| ^997120 | empty shared-slot state |
| ^997121 | writing shared-slot state |
| ^997122 | committed shared-slot state |
| ^997123 | key row |
| ^997124 | value word |
| ^997125 | control buffer |
| ^997126 | stop flag |
| ^997127 | done flag |
| ^997128 | error flag |
| ^997129 | wake word |
| ^997130 | winner word |
| ^997131 | result buffer |
| ^997132 | worker result row |
| ^997133 | worker completion flag |
| ^997134 | metric buffer |
| ^997135 | worker metric row |
| ^997136 | winner CAS |
| ^997137 | exact root result occurrence |
| ^997138 | root W/D/L |
| ^997139 | move witness |
| ^997140 | host exactness gate |
| ^997141 | EXACT status |
| ^997142 | TIMEOUT status |
| ^997143 | INTERRUPTED status |
| ^997144 | FAILED status |
| ^997145 | deadline event |
| ^997146 | abort event |
| ^997147 | worker-error event |
| ^997148 | unexpected-exit event |
| ^997149 | host close |
| ^997150 | external worker termination |
| ^997151 | cleanup state |
| ^997152 | action-order policy |
| ^997153 | order offset |
| ^997154 | exact fact |
| ^997155 | non-exact/bound result |
| ^997156 | shared hit |
| ^997157 | cache miss |
| ^997158 | contention drop |
| ^997159 | shared statistics |
| ^997160 | configuration gate |
| ^997161 | root reflection metadata |
| ^997162 | result publication |
| ^997163 | exact-publication gate |
| ^997164 | local-cache epoch |
| ^997165 | local-cache stamp |
| ^997166 | timeout timer |
| ^997167 | abort handler |
| ^997168 | source function |
| ^997169 | losing private state |
| ^997170 | invocation teardown boundary |

These roles represent operational realization; they are not Connect4 gameplay primitives.
