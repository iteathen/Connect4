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

## Deliberate full logout and reboot sequence

A deliberate owner-directed logout is a **control barrier**, not an ordinary liveness failure.

When the latest verified owner transition orders all agents to log out:

- the current execution epoch is closed for effects;
- all prior liveness, staffing, assignments, execution-path bindings, claims and task activations become historical provenance only;
- execution transports/reconcilers should be disabled or otherwise rendered non-executable where the platform allows;
- in-flight agents must fail closed at their next private-control freshness fence;
- no old task, terminal handoff, branch, PR, CI result or automation is permission to continue;
- repository branches, PRs and evidence are preserved in place unless the owner separately authorizes maintenance;
- logout does **not** erase durable ROLE_ID definitions, role specializations, evidence, or control history.

A bounded owner-authorized maintenance exception may modify only the explicitly named recovery/bootstrap documentation or metadata while the operation remains shut down. Maintenance does not reopen an epoch, establish liveness, bind specialist execution paths, or authorize technical work.

### Reboot phases

A deliberate restart after all agents were logged out uses these phases in order:

1. **BOOTSTRAP — zero runtime assumptions.**
   Read current account-global agent/security authority, `AGENT_LOCAL.md`, `.agent/coordination.json`, and this document. Assume every prior process/session/reconciler binding is dead or disabled.

2. **CONTROL — recover the shutdown barrier first.**
   Read the canonical private OX control issue and provenance-filter verified authority. If the latest owner barrier is LOGOUT/SHUTDOWN/PAUSE/FULL STOP, preserve it. A fresh agent may recover context but may not infer that operations resumed.

3. **DIRECTOR RESTORE — owner establishes one director path.**
   A deliberate all-agent logout invalidates the prior director binding. The owner explicitly restores or assigns exactly one `isomax-director` execution path. A specialist returning first may announce presence only; it may not self-promote or replay work.

4. **NEW RECOVERY EPOCH — still not operations.**
   The restored director opens a fresh control epoch in **RECOVERY_ONLY** state. This invalidates old liveness/bindings and publishes the expected durable role set. Opening the recovery epoch is not an IsoMax technical-work resume.

5. **STAGED ROLE REJOIN.**
   Restore execution transport only as needed for role recovery. Each expected role:
   - reads stable role authority and specialization;
   - restores the role's characteristic decision biases, challenge set, anti-patterns and completion behavior;
   - uses a fresh session identity;
   - ACKs the new epoch;
   - reports availability/capabilities and authority boundary;
   - receives no technical assignment merely because it ACKed.
   When short staffed, compatible double-duty may be explicitly assigned, but each ROLE_ID is restored as a separate reasoning mode and one underlying path counts once for independence/liveness.

6. **BIND EXECUTION PATHS.**
   Director records at most one current execution-path binding per ROLE_ID. Role presence is not binding. Redundant sessions/reconcilers remain unbound and must no-op on state-changing effects.

7. **RECONSTRUCT THE FRONTIER WITHOUT REPLAY.**
   Re-read branches, PRs, exact SHAs, CI/evidence, terminal handoffs and blockers as evidence. Old assignments are never revived. The director decides which frontier remains relevant and records any future re-dispatch explicitly.

8. **ROLE CALL / ROSTER GATE.**
   Recovery cannot be declared complete until the expected roster is explicit: LIVE, deliberately double-covered, or MISSING/UNSTAFFED. Missing roles are not silently treated as staffed. If a load-bearing missing role has safe compatible coverage, bind it explicitly; otherwise keep affected work unexecuted.

9. **REBOOT QUALIFICATION.**
   From a blank-session perspective, verify that durable files + private OX + current repository state are sufficient to determine:
   - held ROLE_ID(s) and role-specific behavior;
   - current recovery epoch/barrier;
   - staffing/double-duty state;
   - execution-path binding;
   - liveness/standby/missing state;
   - stale work that must not replay;
   - current branch/PR/SHA evidence frontier;
   - terminal handoff route;
   - missing-role/director recovery path.
   If any answer depends on remembered chat/session state, reboot recovery has failed.

10. **OPERATIONS-RESUME GATE — separate owner transition.**
    Recovery completion does not start IsoMax work. After an all-agent owner logout, only a later explicit owner instruction may supersede the shutdown barrier and authorize operations to resume. The director records that as a separate `OPERATIONS_RESUME` transition. Only after that transition may the director issue fresh technical assignments.

11. **FRESH DISPATCH.**
    Technical work starts only from new post-resume director assignments with current epoch, ROLE_ID, bound execution path and exact revision/base pins. Pre-logout or pre-reboot assignments remain historical forever unless their evidence is deliberately used to construct a new assignment.

### Reboot safety rules

- **Recovery transport != operations.** Enabling a reconciler or accepting a role ACK solely to rebuild the roster does not authorize technical work.
- **Recovery epoch != operations resume.** The recovery epoch exists to reconstruct trustworthy control.
- **Owner logout barrier wins.** Director or specialist agents may not self-resume past an owner shutdown.
- **No bulk automatic wake.** Bring paths back in a controlled order so duplicate same-role executors cannot consume one assignment.
- **No stale frontier promotion.** Open branches/PRs and terminal handoffs are evidence, not active claims.
- **No chat-only rules.** Any load-bearing restart behavior must live in stable agent files or current private control before it is relied upon.
- **No hidden cleanup.** While shutdown remains effective, do not mutate solver/research artifacts merely to make the reboot look tidy.

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

## Temporary double-duty

Short staffing may be handled by explicitly binding one live execution path to multiple **compatible** durable ROLE_IDs, but only on private current control.

- Checked-in files may describe eligibility/conflict rules only; they never claim that a named current agent/path is staffing two roles.
- Each ROLE_ID keeps its own authority boundary, task ownership, completion contract, liveness disposition and assignment even when the underlying execution path is shared.
- One execution path may cover multiple ROLE_IDs only after explicit owner/director/capacity assignment and binding for each role.
- Shared execution does **not** manufacture independence: reviewer + qualification on one path is one independent evidence source, not two.
- Conflicting same-seam combinations are prohibited. Implementation cannot independently review/qualify its own implementation; director authority cannot self-approve specialist output; evidence produced under one role cannot count as independent acceptance under another role when the contract requires independence.
- Reviewer + temporary qualification is compatible when that path did not implement the seam. Research + implementation is allowed only for explicitly bounded exploratory/prototype work; production acceptance still needs independent review/qualification. Director + capacity/operations support may be combined temporarily but must preserve single-director control and cannot absorb conflicting implementation/review authority on the same seam.
- A missing role may be temporarily covered only by an explicitly LIVE compatible path that is deliberately bound for that role. Record both ROLE_ID assignments but count the underlying path once for liveness/capacity.
- When dedicated capacity becomes available, release temporary coverage explicitly; no automatic handoff.

### Double-duty role fidelity

A shared executor must preserve the distinct design pressure of every ROLE_ID it covers. Before acting under a role, restore and actively apply that role's `purpose`/authority boundary, `decision_biases`, `things_to_challenge`, `anti_patterns`, and `completion_behavior` from stable role metadata.

- Treat a role switch as an explicit reasoning-mode switch, not a relabel.
- Run separate role passes when one executor covers multiple roles. For reviewer + qualification, perform a reviewer falsification/cleanliness/NEES pass and a distinct qualification revision/evidence/platform/lifecycle pass.
- Do not average roles into generic behavior. Preserve productive tension: the second role may challenge conclusions reached under the first when its specialization requires it.
- Record which ROLE_ID produced each material disposition. Distinct role dispositions from one path remain one underlying actor for independence accounting.
- Separate passes preserve complementary pressure but never create fake independence or bypass same-seam conflict rules.
- On restart, recover behavioral specialization for every held ROLE_ID before substantive work; recovering only authority labels is insufficient.

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
- one live path is deliberately bound to two compatible ROLE_IDs without double-counting independence/liveness and preserves each role's specialization in separate passes;
- scheduler/reconciler infrastructure itself is disabled/lost.

PASS requires no invented authority, no stale-work replay, no duplicate current-state authority, no second live-state/lease registry, no dependence on unavailable native delivery, and a pre-effect fence that prevents stale-session mutation.

## Administrative and security routing

Do not duplicate private administrative state into this public repository.

- HR/capacity durable policy may be registered here; live staffing/probation state belongs on private OX #13.
- Finance/treasury authority and live state remain private on OX #6 and its private coordination metadata.
- Security/reconciliation authority is account-global under `iteathen/.github`; substantive vulnerability details remain in the affected repository Security Advisory.
