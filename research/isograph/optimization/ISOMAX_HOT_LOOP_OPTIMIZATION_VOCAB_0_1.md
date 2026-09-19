# IsoMax hot-loop optimization IsoGraph vocabulary 0.1

**Status:** issue-73 optimization-profile vocabulary; research successor artifact, not Connect4 logic authority 1.1  
**Owner:** `research/semantic-quotient`  
**Purpose:** name the integrated semantic -> source -> runtime -> machine -> cost graph used to optimize IsoMax.

This vocabulary adds no Connect4 gameplay primitive. It names representation/evidence/optimization roles around already-owned semantics.

| SI | Label | Role |
|---:|---|---|
| `^995000` | isomax_hot_loop_integrated_graph | graph root |
| `^995001` | ordinary_value_dependency | exact ranked W/D/L dependency |
| `^995002` | canonical_q_addressing | exact ordinary future-behavior lookup/store identity |
| `^995003` | own_residual_cofactor | mover residual transition |
| `^995004` | block_residual_cofactor | opponent residual transition |
| `^995005` | support_transition | native support/playability transition |
| `^995006` | advisory_move_order | exact-value-neutral ordering relation |
| `^995007` | task_necessity | manager-owned scheduling liveness |
| `^995008` | ranked_q_dependency_dag | semantic dependency topology |
| `^995009` | task_subtree_occurrence | one execution occurrence of unresolved q work |
| `^995010` | solveNode_source | current recursive JS realization |
| `^995011` | prepared_q_key_source | current q key/hash realization |
| `^995012` | apply_undo_source | current reversible state realization |
| `^995013` | own_transition_source | current own residual realization |
| `^995014` | block_transition_source | current block residual realization |
| `^995015` | move_order_source | current ordering realization |
| `^995016` | task_control_source | current scheduled worker control realization |
| `^995017` | branch_manager_source | current global q/task realization |
| `^995100` | signed_hash_bitpattern | signed-int32 hash carrier optimization |
| `^995101` | profile_cell_masks | precomputed 42-cell mask optimization |
| `^995102` | flat_pair_incidence | fixed numeric move-order incidence |
| `^995103` | residual_transition_prefix_64k | selected exact transition memo prefix |
| `^995104` | singleton_direct_projection | singleton metadata projection from fixed term IDs |
| `^995105` | module_scope_growth_helper | cold growth helper detached from hot lexical context |
| `^995106` | signed_isolated_bit | signed-int32 isolated-bit carrier into clz32 |
| `^995107` | widen_before_grow_preparation | selected cold preparation ordering |
| `^995108` | necessity_poll_512 | selected busy-task retirement polling interval |
| `^995109` | current_subtree_dispatch | current bounded worker task materialization |
| `^995110` | manager_q_dedup | current manager q canonicalization/reuse |
| `^995111` | exact_wdl_result | exact ordinary W/D/L consequence |
| `^995112` | final_campaign_observation | integrated benchmark observation |
| `^995113` | parallel_excess_work_observation | four-worker work-inflation observation |
| `^995114` | hardware_counter_unknown | unresolved branch/cache/instruction counters |
| `^995115` | lowering_cost_unknown | unresolved or environment-conditional V8 lowering |
| `^995116` | cross_worker_overlap_unknown | unresolved avoidable-overlap quantity |
| `^995200` | nei_bitpattern_profile | identity view over operation-observed 32-bit patterns |
| `^995201` | nei_q_identity_profile | exact q versus locator/representation identity |
| `^995202` | nei_q_occurrence_profile | canonical q versus contextual task/parent occurrences |
| `^995300` | qu_v8_lowering | QU region for runtime lowering |
| `^995301` | qu_machine_cost | QU region for dynamic machine cost |
| `^995302` | qu_distribution | QU region for unresolved work-distribution economics |
| `^995400` | discovery_protocol_pass | issue-73 Discovery Protocol execution |
| `^995401` | static_bitpattern_mismatch | DP finding: static/bit-pattern semantics represented too generally |
| `^995402` | cold_context_leakage | DP finding: cold helper representation imposes hot allocation |
| `^995403` | dag_subtree_mismatch | DP finding: ranked q DAG realized as private subtree work |
| `^995404` | representation_machine_gap | DP finding: source shape does not predict machine cost reliably |
| `^995500` | realizes | implementation realizes semantic operation |
| `^995501` | lowered_to | source/runtime lowering relation |
| `^995502` | observed_as | environment-pinned observation relation |
| `^995503` | same_under_profile | scoped NEI SAME relation |
| `^995504` | distinct_under_profile | scoped NEI DISTINCT relation |
| `^995505` | contextual_occurrence_of | occurrence/anchor to canonical referent |
| `^995506` | constrained_by | load-bearing guard/constraint |
| `^995507` | optimized_by | qualified implementation optimization |
| `^995508` | unresolved_as | QU attachment |
| `^995509` | supported_by | evidence relation |
| `^995510` | discovered_by | Discovery Protocol relation |
| `^995511` | candidate_from | unpromoted optimization candidate relation |
| `^995512` | preserves | exact invariant preservation relation |
| `^995513` | causes_observed_cost | causal cost relation, only when supported |
| `^995514` | profile | identity/comparison profile attachment |

## Identity discipline

`same_under_profile` is never global identity. In particular:

- signed and unsigned JavaScript numbers may be SAME under a pinned 32-bit bit-pattern consumer profile while remaining DISTINCT under numeric-value/representation profiles;
- a hash locator is DISTINCT from exact q identity even when it addresses q storage;
- multiple task/parent occurrences may project to the SAME ordinary q while their occurrence/lineage roles remain represented.

## QU discipline

`unresolved_as` must retain the known causal neighborhood, constraints, evidence environment, and discriminating experiment. It is not an opaque UNKNOWN marker.

## Discovery Protocol discipline

DP findings are research conclusions about representation/optimization structure. They do not mutate Connect4 gameplay authority. Each finding must retain a falsifier or boundary and may become an implementation candidate only through separate qualification.
