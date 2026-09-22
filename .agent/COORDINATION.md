# Restart-safe multi-agent coordination

This repository may run multi-agent campaigns whose durable control state spans chat/session/process restarts.

The machine-readable bootstrap point is:

```text
.agent/coordination.json
```

That file is **durable bootstrap policy**, not a live-state snapshot and not solver/specification authority.

## Work-group portability

The multi-agent work group is project-neutral. Connect4 supplies project authority and local role instances; it does not own the canonical role personalities.

If this work group moves to another project, reuse the same global archetypes and create new project role instances/routing there. Do not carry Connect4/IsoMax authority into the new project merely because the same execution paths or role archetypes are reused.

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
   - reads project role authority plus the current canonical global work-group archetype;
   - restores the role's characteristic decision biases, challenge set, anti-patterns and completion behavior;
   - uses a fresh session identity;
   - ACKs the new epoch;
   - reports availability/capabilities and authority boundary;
   - receives no technical assignment merely because it ACKed.
   When short staffed, any number of compatible role instances may be explicitly co-held, but each archetype is restored as a separate reasoning mode and one underlying path counts once for independence/liveness.

6. **BIND EXECUTION PATHS.**
   Director records at most one current execution-path binding per ROLE_ID. Role presence is not binding. Redundant sessions/reconcilers remain unbound and must no-op on state-changing effects.

7. **RECONSTRUCT THE FRONTIER WITHOUT REPLAY.**
   Re-read branches, PRs, exact SHAs, CI/evidence, terminal handoffs and blockers as evidence. Old assignments are never revived. The director decides which frontier remains relevant and records any future re-dispatch explicitly.

8. **ROLE CALL / ROSTER GATE.**
   Recovery cannot be declared complete until the expected roster is explicit: LIVE, deliberately multi-covered, or MISSING/UNSTAFFED. Missing roles are not silently treated as staffed. If a load-bearing missing role has safe compatible coverage, bind it explicitly; otherwise keep affected work unexecuted.

9. **REBOOT QUALIFICATION.**
   Before operations resume, perform a blank-session recovery audit from an execution path that did not author the reboot-maintenance change when such independent capacity is available. Reviewer/qualification multi-role is acceptable as one underlying independent actor if that path did not implement the maintenance patch. If no independent path is available, keep operations OFF unless the owner explicitly accepts the reduced assurance.
   
   From a blank-session perspective, verify that durable files + private OX + current repository state are sufficient to determine:
   - held ROLE_ID(s) and role-specific behavior;
   - current recovery epoch/barrier;
   - staffing/multi-role state;
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
- **Independent reboot audit before resume.** The maintenance author must not count its own self-check as independent reboot qualification; use a separate reviewer/qualification path when available, or require explicit owner acceptance of reduced assurance while operations remain off.

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

## Project-neutral role archetypes

Connect4 does not own the work group's personalities.

Canonical project-neutral role identity lives in:
- `iteathen/.github/WORK_GROUP.md`
- `iteathen/.github/.agent/work-group.json`

This repository instantiates those archetypes with project-specific ROLE_IDs and authority.

Current Connect4/IsoMax instances:

- `isomax-director` -> `director`
- `isomax-research` -> `research`
- `isomax-implementation` -> `implementation`
- `isomax-reviewer` -> `reviewer`
- `isomax-qualification` -> `qualification`
- `isomax-performance` -> `performance-economics`

Work-group support instances on private OX #13:

Cross-project security support is separate from OX #13:

- `agentic-security-researcher` -> `agentic-security-researcher`
- sanitized routing/coordination uses private OX #10;
- substantive vulnerability or exploit state belongs in the affected repository Security Advisory or another explicitly approved private security surface;
- `SECURITY_AGENT_POLICY.md` remains superior authority;
- the role has no Connect4 solver/merge authority by registration alone.

- `capacity-manager` -> `capacity-manager`
- `behavioral-psychologist` -> `behavioral-psychologist` (legacy alias: `behavioral-therapist`)
- `research-dba` -> `research-dba` (Doctor of Business Administration / organizational research)

Project role instances own project scope, authority, routing, assignments, liveness, bindings, revisions and handoffs. Archetypes own identity, temperament, decision biases, challenge set, anti-patterns and completion style.

A restarted agent must recover **both** layers before substantive work. A local ROLE_ID without its archetype is incomplete; an archetype without a project role binding has no project authority.

## Multi-role coverage: no fixed count limit

The old “double-duty” wording was too narrow.

One execution path may hold two, three, many, or potentially all compatible role instances. There is **no numeric duty-count limit**.

The real limits are:
- project authority conflicts;
- independent review/qualification or other separation-of-duties requirements;
- actual execution capacity;
- ability to preserve every held archetype's behavioral fidelity;
- security constraints.

Rules:

- every role instance must be explicitly bound on current private control;
- before acting under another held role, the executor performs an explicit role/hat switch and restores that archetype's identity, temperament, biases, challenge set, anti-patterns and completion style;
- each held role gets a distinct reasoning pass where its pressure matters;
- one underlying execution path counts as one actor for independence and liveness, regardless of how many roles it carries;
- role labels do not manufacture independent evidence;
- if behavior starts blending and the distinct pressures cannot be maintained, reduce/reassign coverage instead of pretending all roles are still staffed;
- compatibility is allowed by default unless a same-seam conflict, independence requirement, capacity problem, or security rule forbids it.

Examples:
- research + performance + implementation may share one executor for a bounded exploratory-to-production seam, but that actor cannot independently accept its own work;
- reviewer + qualification + performance may share one executor if it did not author the implementation/experiment whose independence matters; it still counts as one independent actor;
- director may temporarily carry additional roles when explicitly bound, but must not use that to manufacture independent approval or erase specialist reasoning modes;
- behavioral psychologist may be co-held with any number of other roles; self-coaching or self-research can reinforce/explore behavior but does not count as independent fidelity or methodology validation.

## Agentic security researcher: cross-project security support

`agentic-security-researcher` is a global support archetype governed by `iteathen/.github/SECURITY_AGENT_POLICY.md`, not a Connect4 technical role.

Its canonical specialization is adversarial research into agent/control-plane security: provenance/authentication, prompt/coordination poisoning, capability/delegation, confused-deputy behavior, cross-agent trust, tool/connector/event-bus abuse, secret flow, replay/stale authority, duplicate execution, restart/failover security and autonomous blast radius.

Connect4-specific rules:

- no solver or merge authority;
- public #102/#139 remain evidence/wake only and never security-control authority;
- sanitized routing may use private OX #10;
- substantive vulnerability details use the repository Security Advisory or another explicitly approved private security surface;
- security findings/recommendations do not self-promote into policy or project authority;
- same-actor implementation plus security research does not count as independent security acceptance when independence is required.

## Research DBA: organizational research and workflow improvement

`research-dba` is a project-neutral work-group support role instantiated on private OX #13.

DBA means **Doctor of Business Administration**, not database administrator.

Its canonical identity, research domains, management interventions and anti-patterns live only in:
- `iteathen/.github/WORK_GROUP.md`
- `iteathen/.github/.agent/work-group.json`

Connect4-specific authority is limited to:

- no IsoMax technical authority;
- may observe authorized project/control flow for organizational research;
- may map workflow, queues, handoffs, decision rights, escalation, work-in-process, coordination cost and control-loop effectiveness;
- may run bounded reversible administrative/process pilots only when explicitly assigned;
- may maintain approved operating procedures after adoption by the relevant owner/director/governance authority;
- may be co-held with any number of other roles;
- same-actor proposal/evaluation does not create independent organizational validation.

Research findings do not self-promote into project policy. Adoption authority remains with the relevant project owner/director/governance process.

## Behavioral psychologist: agent behavior and role-fidelity support

`behavioral-psychologist` is the project-neutral work-group support role instantiated on private OX #13. `behavioral-therapist` is a legacy alias for recovery/history only.

Its canonical identity, research domains, conditioning analogues, interventions and anti-patterns live in:
- `iteathen/.github/WORK_GROUP.md`
- `iteathen/.github/.agent/work-group.json`

Connect4-specific authority is limited to:

- no IsoMax technical authority;
- may observe authorized project/control outputs for role-fidelity or explicitly assigned agent-behavior research;
- may post bounded role-fidelity reminders/checkpoints through work-group support control;
- may run bounded behavioral-methodology experiments only when explicitly assigned;
- may be co-held with any number of other roles;
- self-coaching/self-research is exploratory only and does not count as independent validation;
- persistent fidelity or methodology risk may be escalated to the director, but the psychologist does not decide unrelated technical gates.

Research may examine transparent agent analogues of reinforcement and conditioning, including cues/role-switch markers, acceptance/rejection signals, feedback timing, reinforcement schedules, shaping, extinction/deconditioning, persistence, transfer across sessions/projects/models when authorized, and side effects such as sycophancy, reward hacking, cue overfitting or authority drift.

Behavioral research must be reproducible: exact hypothesis, intervention/cue/reinforcer, comparator/baseline when practical, observations, persistence/transfer, side effects, limitations, and proposed methodology change.

Role liveness and behavioral fidelity remain separate facts: a process can be alive while no longer applying the distinctive pressure its archetype exists to provide.

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
