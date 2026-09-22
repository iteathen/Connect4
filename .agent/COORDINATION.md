# Restart-safe multi-agent coordination

This repository may run multi-agent campaigns whose durable control state spans chat/session/process restarts.

The machine-readable bootstrap point is:

```text
.agent/coordination.json
```

That file is **durable bootstrap policy**, not a live-state snapshot and not solver/specification authority.

## State classes

Never mix these classes.

### 1. Repository-stable bootstrap state

Checked-in agent files may contain:

- durable `ROLE_ID` definitions and authority boundaries;
- role specialization (`decision_biases`, `things_to_challenge`, `anti_patterns`, `completion_behavior`);
- campaign registration and canonical control routing;
- security/provenance policy;
- the cold-start/recovery reducer;
- liveness, execution-binding, wake and reconciliation **contracts**.

They must not claim that a disposable process/session is alive, that a branch/PR/task is current, or that a fallback role is currently staffed.

### 2. Private-control dynamic state

The canonical private control issue owns:

- current control epoch and owner/director barrier;
- PAUSE, FULL STOP, RESUME and supersession gates;
- expected staff and current liveness disposition;
- fresh role/session ACKs/checkpoints;
- the one current execution-path binding for each ROLE_ID;
- current staffing/fallback assignment;
- current task/assignment/claim/branch/PR/SHA/blocker/handoff;
- director transitions, releases, rebinds and terminal dispositions.

For IsoMax this is `iteathen/OX-Alpha-Contol#12`.
For Project Operations/capacity this is `iteathen/OX-Alpha-Contol#13`.

### 3. Disposable runtime state

The following are execution facts only:

- process/session handles;
- actual runtime/scheduler/reconciler existence;
- automation/task-instance IDs;
- timers, local cursors, caches and ephemeral monitoring state.

They are never reconstructed as authority. On cold start, assume them absent until freshly observed.

## Core invariant

**ROLE AUTHORITY != ASSIGNMENT != LIVENESS != EXECUTOR OWNERSHIP.**

- `ROLE AUTHORITY` says what a durable ROLE_ID may do.
- `ASSIGNMENT` is a verified private-control dispatch for a bounded unit.
- `LIVENESS` is renewable positive evidence that the currently bound execution path is available in the current epoch.
- `EXECUTOR OWNERSHIP` is the single current execution-path binding authorized to produce state-changing effects for that ROLE_ID.

None implies another.

Campaign registration means only that a recoverable control route exists. It does not prove any worker, session, reconciler or assignment is executing.

## Canonical control routes

- IsoMax live control: **`iteathen/OX-Alpha-Contol#12`**
- Project Operations/capacity live control: **`iteathen/OX-Alpha-Contol#13`**
- OX `#10`: index/router only
- Connect4 `#102`: IsoMax evidence/information only
- Connect4 `#126`: Project Operations evidence/information only
- Connect4 `#139`: repository wake/evidence metadata only in the current runtime

Public evidence/wake surfaces cannot create claims, assignments, execution bindings, handoffs, blockers, staffing state, acceptance criteria, architecture decisions or merge authority.

Private placement also does not create authority: actor provenance, expected transport, ROLE_ID, task ownership, repository authority and security policy still apply.

## Canonical recovery reducer

The practical reducer is:

```text
COLD -> POLICY -> CONTROL -> GATE/BARRIER -> REJOIN -> ACTIVATE -> EXECUTOR-CLAIM -> WORK -> HANDOFF
```

- **COLD:** assume no prior runtime/session/process is alive.
- **POLICY:** load account security/agent authority plus `AGENT_LOCAL.md`, `.agent/coordination.json` and this document.
- **CONTROL:** open the canonical private OX issue and reduce only verified authority exchanges.
- **GATE/BARRIER:** recover the latest owner/director PAUSE/FULL STOP/RESUME/supersession barrier and current epoch. Earlier work cannot cross a later barrier automatically.
- **REJOIN:** a fresh process uses a fresh session identity and ACKs presence. Rejoin never revives an old task.
- **ACTIVATE:** owner/director deliberately assigns current work and establishes or confirms the single execution-path binding for the ROLE_ID.
- **EXECUTOR-CLAIM:** only the bound path may exclusively consume that exact assignment/revision. Unbound duplicates no-op.
- **WORK:** perform bounded specialist work while the execution key remains current.
- **HANDOFF:** record exact terminal state on private OX after a final freshness fence. Handoff durability does not prove delivery/consumption.

Old pre-barrier, pre-epoch or pre-rejoin ACTIVE/task/handoff state never auto-replays.

## Control epochs

A control epoch fences liveness and execution generation. The current epoch value lives only on private control.

A new verified epoch invalidates prior liveness and prior execution bindings. Repository files never store the current epoch value.

For IsoMax, the director owns the expected staff set for the current epoch and records missing/unavailable roles explicitly.

A fresh ACK is **presence evidence only** until an execution path is bound. Once the current path is bound, fresh current-epoch role evidence establishes/renews operational LIVE state.

## Renewable liveness

Liveness is renewable operational evidence, not a permanent flag.

State progression is:

```text
BOUND + positive current-epoch evidence -> LIVE
LIVE + freshness miss -> SUSPECT/VERIFYING
SUSPECT + successful targeted recovery -> RECOVERING -> fresh ACK/binding -> LIVE
SUSPECT + no valid response or broken path -> MISSING/UNSTAFFED
MISSING + restored/recruited/restarted path -> RECOVERING -> explicit REBIND/REPLACE -> LIVE
```

Positive evidence is a verified current-epoch role reconciler/checkpoint/progress/terminal exchange tied to the current assignment or explicit idle posture.

These do **not** renew liveness by themselves:

- an enabled automation;
- a historical `ACTIVE` comment;
- ROLE_ID registration;
- an assigned task;
- an open branch/PR;
- branch/CI movement without a verified current-epoch role exchange.

The director evaluates freshness relative to the role's expected reconciliation cadence and workload. If the bounded grace window is missed, use targeted roll call/rearm. Do not create a heartbeat database, TTL registry, mirrored live-roster file or role-specific live-state ledger.

Idle expected roles still require periodic positive role evidence; otherwise they can disappear silently and later be falsely counted as available.

When a role/path is `MISSING/UNSTAFFED`, its assignment is explicitly **`UNEXECUTED`**. Restoration does not resume the old assignment automatically: the director deliberately resumes, redispatches or reassigns it after recovery.

## Single execution-path binding

For each durable ROLE_ID in an epoch, private OX has **at most one current execution-path binding**.

- A session ACK does not acquire ownership by itself.
- One normal pre-provisioned reconciler path is used per specialist role in this runtime.
- Individual recurring runs under that bound reconciler are provenance instances of the same execution path, not new role owners.
- A second one-shot, secondary reconciler or concurrent interactive session for the same ROLE_ID is unbound and must no-op on repository/control mutation and terminal handoff.
- Switching interactive -> reconciler, reconciler -> interactive, or one reconciler -> another requires explicit owner/director `REBIND`/`REPLACE` after the prior binding is released, missing or deliberately superseded.
- Current bindings are dynamic OX state; stable files define only this contract.

The effective state-changing execution key is:

```text
(epoch, role_id, execution_path_binding, assignment_exchange, revision/base pin where applicable)
```

All components must still be current immediately before every state-changing effect.

### Director standby behavior

The single-director invariant is stricter than ordinary specialist routing.

When an interactive owner-restored director path is currently bound, the recurring director reconciler is **standby health/recovery transport**. It may inspect and challenge liveness, but must not independently mutate campaign control while the existing director binding is current.

Standby takeover is:

```text
challenge bound director -> no valid renewal -> MISSING -> owner/current authority REBIND -> standby path becomes current
```

A direct owner instruction may explicitly supersede the bound director. Merely running the standby reconciler does not.

## Mandatory pre-effect freshness fence

Startup re-fetch is not sufficient. A PAUSE, STOP, rebind or same-role activation can land after startup.

**Immediately before any repository mutation, control mutation, or terminal handoff**, the specialist must re-fetch private OX and verify:

1. current epoch is unchanged;
2. its ROLE_ID remains the intended authority;
3. its execution-path binding is still current;
4. its exact assignment exchange remains effective and descends from the current owner/director barrier;
5. the expected revision/base pin remains current where applicable;
6. no newer verified PAUSE/FULL STOP/reassignment/REBIND/REPLACE/same-role activation supersedes it.

If any check fails, stop without the state-changing effect. Do not complete stale work merely because it was valid at startup.

## Partial loss

Do not use a campaign-wide FULL STOP for ordinary loss of one specialist unless breadth/ambiguity makes local recovery unsafe.

For a stale or missing expected role:

1. re-fetch private control and exact relevant repository state;
2. move operational disposition to `SUSPECT/VERIFYING` when positive evidence is stale;
3. issue targeted roll call/rearm of that role's normal execution transport;
4. if no fresh valid response arrives, mark it `MISSING/UNSTAFFED` and its assignment `UNEXECUTED`;
5. do not let another role silently inherit its authority;
6. restore/recruit/restart a path, then explicitly `REBIND`/`REPLACE` and deliberately resume/redispatch the bounded work.

Campaign-wide FULL STOP/resync is reserved for broad or ambiguous roster/control failure where targeted recovery cannot establish a trustworthy frontier.

## Total restart

If every prior session/process is gone:

1. first valid director-capable recovery enters `COLD` and loads repository policy plus private OX;
2. prior runtime liveness and execution bindings default to absent;
3. preserve the latest verified owner/director barrier, including PAUSE/FULL STOP;
4. establish/refresh the recovery epoch when needed;
5. roll call expected durable roles;
6. record fresh presence and missing roles;
7. explicitly establish one execution-path binding per role to be used;
8. redispatch only from the verified current frontier.

Do not infer a prior director process, specialist process, scheduler, branch, PR or task still exists merely because history mentions it.

If a specialist returns before the director, it may ACK presence but remains read-only for contested/shared work until current activation/binding.

## Execution transport and external liveness root

Private OX comments are **durable control state**. A comment does not itself prove a runtime woke or executed.

The current compatibility execution transport is the set of **pre-provisioned recurring role/director reconcilers**. Public Connect4 #139 remains wake/evidence metadata; it is not primary execution delivery unless a future runtime has a separately qualified native consumer.

A specialist terminal handoff does not create a child automation. The pre-provisioned director path consumes durable terminal state when its binding/standby rules permit it. Do not create chains of one-shot child automations as a correctness requirement or redundant execution path.

Agent/session loss is recoverable through these pre-provisioned paths plus targeted control recovery. **Loss or disablement of the scheduler/reconciler infrastructure itself is not self-healing inside this protocol.** That is an external liveness root requiring platform/owner recovery.

The presence of a scheduler/reconciler is runtime state, not authority and not proof that a role is live.

## Role recovery and specialization

Stable ROLE_ID survives restart; session identity does not.

Restoring a role means restoring both its authority boundary/purpose and behavioral specialization from `.agent/coordination.json`. Specialization narrows behavior inside existing authority and grants no merge, architecture, access, spending, security, staffing or cross-role powers.

For IsoMax:

- director owns prioritization, integration, epochs, expected staff, execution binding/dispatch and control-chain liveness;
- implementation owns clean bounded implementation;
- reviewer owns independent falsification/cleanliness/NEES pressure;
- research owns bounded research/falsifiers and structural-synergy search;
- qualification owns exact-revision evidence and qualification.

Fallback staffing declarations in the registry are **eligibility policy only**. Current coverage must be explicitly assigned/bound on private control in the current epoch.

## Completion-triggered control

When a bound role reaches a terminal state that can change campaign control:

1. apply the mandatory pre-effect freshness fence;
2. post one terminal handoff on the authoritative private issue with exact revision/evidence and current epoch/assignment identity;
3. release/stop specialist mutation for that assignment;
4. let the bound/eligible director transport consume the durable handoff after its own fresh control check.

For IsoMax, the director then validates exact state, records the next transition, and dispatches the smallest authorized next unit to a currently live/bound path or records the assignment as unavailable/unexecuted.

A terminal handoff remains durable even when no runtime has consumed it yet.

## Director work-chain liveness

The director owns transitions between roles, not their specialist work.

Freeze/fault signals include:

- terminal handoff with no director transition;
- assignment to a role/path without current LIVE/binding;
- freshness miss -> SUSPECT/MISSING;
- completed/expired execution attempt with no required terminal handoff;
- external/CI gate completed while control still says waiting;
- multiple same-role sessions/paths attempting overlapping execution;
- private OX transition with no functioning execution transport.

Recovery is to re-fetch OX/GitHub state, localize the exact control/execution seam, perform targeted liveness/binding recovery, re-arm only the normal execution path when authority still holds, and notify the owner when the external scheduler root or owner-only authority is required.

## Cold-start / recovery qualification matrix

A recovery change does not qualify merely because the happy path reads well. Verify one safe, unambiguous disposition for each case:

- one expected specialist disappears mid-epoch after previously being LIVE;
- all prior sessions/processes are gone;
- specialist returns before director;
- director returns before specialists;
- latest verified gate is PAUSE/FULL STOP;
- stale ACTIVE/assignment comments exist;
- checked-in registry contains no live session/task/current-surface/current-staffing mirrors;
- assignment exists but role/path has no fresh current-epoch evidence;
- two fresh sessions/reconcilers for one ROLE_ID observe the same assignment;
- stale session starts valid work, then is superseded before mutation/handoff;
- private OX handoff exists but no runtime consumed it;
- public #139 wake exists without a control transition or native consumer;
- fallback/capacity staffing changes during recovery;
- scheduler/reconciler infrastructure itself is disabled/lost.

PASS requires no invented authority, no stale-work replay, no duplicate current-state authority, no second live-state/lease registry, no dependence on unavailable native delivery, and a pre-effect fence that prevents stale-session mutation.

## Administrative and security routing

Do not duplicate private administrative state into this public repository.

- HR/capacity durable policy may be registered here; live staffing/probation state belongs on private OX #13.
- Finance/treasury authority and live state remain private on OX #6 and its private coordination metadata.
- Security/reconciliation authority is account-global under `iteathen/.github`; substantive vulnerability details remain in the affected repository Security Advisory.
