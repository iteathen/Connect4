# Restart-safe multi-agent coordination

This repository may run temporary multi-agent campaigns whose live state spans chat/session restarts.

The machine-readable discovery point is:

```text
.agent/coordination.json
```

This file is a **bootstrap registry**, not implementation/specification authority. Its purpose is to let a fresh or restarted agent discover that a live coordination campaign exists, recover the correct role, and rejoin the communication channel before doing substantive work.

## Startup / restart rule

After reading the normal global and repository-local agent instructions:

1. Read `.agent/coordination.json`.
2. If no active campaign overlaps the requested work, continue normally.
3. If an active campaign overlaps the requested work, read its declared communication channel **before substantive research, mutation, review, or qualification**.
4. Recover the assigned stable `role_id`.
5. Read the channel far enough to recover:
   - the role's latest exchange/state;
   - active task claims and handoffs;
   - current implementation/prototype branches;
   - blockers and rejected paths;
   - the newest director instruction.
6. Rejoin with a new session handle if the prior process/session was lost. Do not impersonate a dead session merely to preserve continuity.
7. Announce the rejoin on the live channel using the campaign transport profile before claiming new write work.

A prior session handle is historical provenance. The **stable role ID** is the durable collaboration identity.

## Monitoring rule

A participating role is responsible for keeping the live channel fresh in its working context.

Preferred behavior:

- when the runtime supports scheduled/conditional monitoring, establish a bounded condition watch for the campaign channel;
- otherwise, read the channel before and after each substantive work unit and before acting on assumptions that another role may have changed.

A disconnected process cannot monitor while it does not exist. The recovery guarantee is therefore:

```text
restart / reconnect
    -> repository bootstrap
    -> coordination registry
    -> live channel refresh
    -> role recovery
    -> monitoring resumes
```

Do not claim continuous monitoring if the runtime cannot actually provide it.

## Role recovery

The owner/director may reassign a durable role to a newly started agent with only the role name/ID. The agent should then recover the rest of its working context from the registry and live channel.

If no role has been assigned after restart:

- read the active channel;
- remain read-only with respect to contested/shared implementation state;
- do not self-assign another role's active write claim;
- wait for owner/director delegation or choose an explicitly unclaimed independent-validation task when the channel permits it.

## Agent X-Change transport

Campaigns may use Agent X-Change semantics over an ordinary transport such as a GitHub issue.

For the current Connect4 IsoMax campaign, substantive coordination messages use the `AX/GH-102` profile declared on the live issue. A restarted agent should use a fresh session handle and include its durable `ROLE_ID` in the first rejoin exchange.

Suggested rejoin shape:

```text
AX/GH-102
EXCHANGE: <new exchange id>
FROM: IX-<new session handle>
ROLE_ID: <stable role id>
TO: all
INTENT: ACK
TASK: DIR.rejoin
PARENT: <latest relevant role/director exchange>
BRANCH: <current branch or none>
BASE: <freshly observed SHA>
STATE: active
```

Then continue using the stable task/parent relationships already present in the channel.

## Authority boundaries

Coordination metadata does not promote proposals, issue comments, role messages, experiments, or prototypes into solver/specification authority.

Normal repository authority still governs:

- accepted specifications/contracts;
- durable solver ownership;
- research ownership;
- exact revision qualification;
- branch and cleanup policy.

The coordination system exists to preserve complementary agent responsibilities and cross-session continuity, not to create a second project authority.
