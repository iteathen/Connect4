# Restart-safe multi-agent coordination

This repository may run multi-agent campaigns whose durable authority must survive complete or partial loss of agent processes.

The machine-readable bootstrap registry is:

```text
.agent/coordination.json
```

That registry is **repository-stable bootstrap policy, not live runtime state**. Current epoch, staffing, assignment, liveness, task, branch/PR/SHA, blocker and handoff state belong only to the declared private control issue.

## State model

Recovery must keep three facts separate:

1. **ROLE AUTHORITY** — durable `ROLE_ID`, purpose, specialization and authority limits. Repository-stable.
2. **CONTROL ASSIGNMENT** — current authorized task/claim, prerequisite and exact evidence/revision pins. Private OX live-control state.
3. **EXECUTABLE LIVENESS** — a fresh verified session ACK/CHECKIN for the current control epoch. Disposable runtime state.

None implies another.

A role existing in `.agent/coordination.json` does not mean it is staffed. An assignment does not prove an executable owner exists. Historical `ACTIVE`, old session handles, branch activity, PR movement, scheduler existence, or automation existence do not establish current liveness.

A campaign listed as `active` in the registry means **registered and recoverable**, not that any worker is currently running.

## Canonical live-control routes

- IsoMax: **`iteathen/OX-Alpha-Contol#12`** is the only live agent-control issue.
- Project Operations / capacity: **`iteathen/OX-Alpha-Contol#13`** is the only live staffing/recruiting control issue.
- OX #10 is an index/router, not a substitute for #12 or #13.
- Connect4 #102 and #126 are information/evidence only.
- Connect4 #139 is wake/event transport only.

Public comments never create claims, handoffs, blockers, staffing, assignment, liveness, architecture decisions or director transitions. Useful public evidence must be independently validated and any resulting control change recorded on the matching private OX issue.

Private placement also does not create authority: actor provenance, expected transport, ROLE_ID, task ownership, repository authority and security policy still apply.

## Startup / restart algorithm

After reading the global and repository-local agent authority:

1. Read `.agent/coordination.json`.
2. If no registered campaign overlaps the requested work, continue normally.
3. If one overlaps, open its declared private control issue before substantive research, mutation, review or qualification.
4. Apply the provenance/security gate before interpreting any control text. ROLE_ID syntax or AX/GH formatting is not authentication.
5. Restore only the durable ROLE_ID authority/specialization from the registry.
6. Recover from verified private control:
   - current pause/resume gate;
   - current control epoch;
   - expected staff for that epoch;
   - fresh role/session ACKs and liveness disposition;
   - current staffing/fallback assignment;
   - current task/claim/revision/blocker/handoff frontier;
   - newest verified director transition.
7. If the current epoch requires this role and the session has not ACKed it, post a fresh ACK with:
   - epoch;
   - ROLE_ID;
   - fresh session identity;
   - active / blocked / idle state;
   - current assigned seam or none;
   - executable capabilities relevant to the role;
   - authority boundary.
8. Do not begin or resume assigned work until current-epoch liveness and assignment are both established, except when the explicit assignment is itself a recovery/recruitment action to restore the role.
9. Never auto-replay a pre-epoch task claim. Re-fetch exact state and require deliberate redispatch from the verified current frontier.

A prior session handle is historical provenance only. It is not stored as current state in the bootstrap registry.

## Control epochs

A director/owner recovery transition establishes or advances a control epoch when previous liveness assumptions are invalidated, including:

- total restart;
- deliberate resynchronization or FULL STOP release;
- director replacement;
- detected partial silent agent loss that requires staff reconstitution.

The director records the expected staff set for the epoch on private OX. Each expected role is `LIVE` only after a fresh verified ACK/CHECKIN for that epoch. Missing roles remain `MISSING` or `UNSTAFFED`; they are never inferred active from repository metadata or historical control comments.

Assignment to a missing role is **unexecuted/unavailable**, not active work.

## Partial silent agent loss

Ordinary loss of one or a few roles does not require a campaign-wide FULL STOP when targeted recovery is safe.

When a load-bearing role disappears:

1. re-fetch private OX and exact repository/CI state;
2. classify ROLE AUTHORITY, CONTROL ASSIGNMENT and EXECUTABLE LIVENESS separately;
3. mark the missing expected role `MISSING` for the current epoch;
4. preserve its durable role authority and task/evidence history;
5. targeted-roll-call, restart, recover or recruit only that role;
6. require a fresh epoch ACK;
7. deliberately resume or reassign the task from the verified frontier.

Escalate to a campaign-wide resync/FULL STOP only when missing roles or control ambiguity make local recovery unsafe.

## Total-loss recovery

If every prior agent process is gone:

1. the first valid recovered control session reads repository-stable authority plus private OX;
2. historical ACTIVE/liveness is treated as stale;
3. director authority is restored only through current owner/director authority, never by self-promotion;
4. the director establishes a new/fresh control epoch when needed and records expected staff;
5. all expected roles must fresh-ACK before being counted LIVE;
6. tasks are deliberately redispatched only from the verified current frontier.

No old task automatically resumes simply because its branch, PR, comment, scheduler or ROLE_ID still exists.

## Execution transport versus authority

OX is durable control authority. **An OX comment is not proof that a runtime woke.**

Event routes, schedulers, automations and recurring role/director reconcilers are execution transport only. They:

- grant no authority;
- do not establish role liveness;
- must re-fetch authoritative private OX state before acting;
- must be idempotent for the same authoritative exchange/task/revision;
- must not create overlapping claims;
- must not let a specialist schedule successor specialist work directly.

The expected design is **pre-provisioned reconciliation**, not child-automation chains. A specialist terminal handoff is complete when its exact durable disposition is recorded on private OX. Pre-provisioned director/role reconciliation consumes that handoff. Failure of transport consumption is a control-plane fault detected by reconciliation.

GitHub event bus #139 remains wake-only. A wake means “something changed”; it never creates control state.

## Completion-triggered control

When a role reaches implementation-complete, research disposition, review/qualification PASS/BLOCKED/FAIL, or another terminal state:

1. record the exact terminal handoff on the authoritative private OX issue;
2. target the role that owns the next decision;
3. stop owning the completed seam unless a newer authoritative assignment says otherwise.

For IsoMax, the director consumes terminal specialist handoffs, validates exact repository/CI/control state, records the next transition and dispatches the smallest authorized next unit.

Specialists do **not** need to create child automations to wake the director. The durable handoff and execution transport are separate concerns.

## Director liveness reconciliation

The `isomax-director` owns control-chain liveness, not specialist implementation/research/review/qualification work.

Normal chain:

```text
verified director transition
    -> assigned role that is LIVE in current epoch
    -> bounded specialist work
    -> terminal private-OX handoff
    -> pre-provisioned director transport
    -> director re-fetch + next transition
```

Freeze/mismatch signals include:

- authoritative assignment with no current-epoch LIVE owner;
- expected role missing a current-epoch ACK;
- terminal handoff not consumed by the director;
- completed CI/external gate with stale waiting control state;
- duplicate transport execution that would create overlapping ownership;
- repository activity being mistaken for role liveness.

On a freeze, re-fetch authoritative state, localize the exact broken assignment/liveness/transport seam, perform a targeted roll call or role recovery, and repair only that bounded seam. Notify the owner when safe recovery requires owner authority.

## Fallback staffing

Fallback/double-duty relations in the registry are **eligibility policy only**. They never assert current staffing.

Current fallback staffing belongs on private OX and requires explicit assignment plus current liveness. Example: reviewer eligibility to cover qualification does not mean qualification is currently staffed by reviewer, and a dedicated qualification session becoming live does not automatically transfer the assignment until control records that transition.

## Durable role specialization

Stable ROLE_ID recovery includes the role’s behavioral specialization from `.agent/coordination.json`:

- `decision_biases`;
- `things_to_challenge`;
- `anti_patterns`;
- `completion_behavior`.

These narrow behavior inside existing authority. They do not grant merge, architecture, access, spending, security, staffing or cross-role authority.

The intended IsoMax complement remains:

- director: prioritization, integration, expected-staff/epoch state and control-chain liveness;
- implementation: structural work-removal, NEES-efficient realization and clean replacement;
- reviewer: falsification, exact-revision challenge, cleanliness and whole-system efficiency;
- research: invariant/representation search and executable falsifiers;
- qualification: exact revision/platform/lifecycle/performance evidence without production ownership.

## Cold-start qualification matrix

A recovery design is acceptable only when it gives one safe, unambiguous disposition for each case without remembered session state or unavailable runtime capabilities:

- one expected specialist disappears while others remain;
- all prior sessions are gone;
- specialist returns before director;
- director returns before specialists;
- latest gate is PAUSE/FULL STOP;
- stale ACTIVE/assignment comments exist;
- registry contains no live session/task mirrors;
- assigned role has no fresh ACK;
- duplicate reconciler sees the same assignment;
- private-OX handoff exists but no runtime consumed it yet;
- public event bus emits wake without a control transition;
- capacity/fallback staffing changes during recovery.

PASS requires no invented authority, no stale task replay, no session-liveness mirror in checked-in files and no child-automation requirement.

## Administrative and security routing

- HR/capacity role policy may be public-safe in the registry; live staffing/probation state remains private OX #13.
- Finance/treasury authority and live state remain private on OX #6 and private finance coordination files.
- Security/reconciliation remains account-global under `iteathen/.github`; substantive vulnerability details stay in the affected repository Security Advisory.

The coordination system preserves complementary responsibilities and restart continuity. It never supersedes accepted solver specifications, repository ownership or security policy.
