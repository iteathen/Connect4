# Transition-state read commit audit addendum

**Date:** 2026-09-12  
**Branch:** `research/frontier-negamax-conformance`  
**Research direction / architecture:** Josh Oshiro  
**Implementation / qualification:** OpenAI ChatGPT

## Scope

This addendum audits the two source-history commits immediately preceding this record:

- `50aac9251de217f5124a9cf30d2a7b255094c865` — `Fix CI timing summary quoting`;
- `5ec678f65595239af85f36de0942f571b3b730c3` — `Fuse transition state identity reads`.

The audit was performed against the actual branch state plus the account-global `AGENTS.md`, repository `AGENTS.md` / `AGENT_LOCAL.md`, C4-0001, C4-0006, C4-0007, C4-0010, `STATUS.md`, `next_step.yaml`, the frontier optimization handoff, conversation summary, full-engine audit and the latest packed-state optimization records. Prior comments and handoff claims were treated as evidence rather than authority.

## `50aac925`: timing-summary quoting repair

This commit changes only quoting in the GitHub Actions step-summary line. It does not modify solver source, test semantics, resource admission, proof state, semantic identity, CPC/WSL/NDC meaning, Branch Manager behavior, or the full-root qualification trigger.

The functional timing job was introduced by its parent `c4eb205accc36460439502625b1c8fef42325ff9`. That job is bounded to the ordinary 7x6 depth-8 search with a 6000 ms child budget and 2 GiB reservation budget. It records source SHA, Node/runtime context, elapsed/user/system time and the solver's existing JSON counters. It is observational evidence only; it does not relabel a depth-horizon result as an exact root W/D/L proof. Workflow permission remains `contents: read`. Source uses runner/environment path expressions rather than publishing a user-resolved local path.

Hosted run `34726280321` succeeded. Its timing sample on `50aac925` reported `searchMs=2667.062977`, 4,777,115 calls, 672,690 expanded nodes, 221,398 local states, 305,714 local residual classes, 4,355,811 semantic edge hits, 421,303 edge misses, 2,424 cutoffs and 4,014,763 unresolved horizon leaves.

**Disposition:** compliant. The quoting repair is retained. The timing sample is a bounded observation, not a speed claim or root qualification.

## `5ec678f6`: fused transition state identity read

On a direct semantic-edge miss, the kernel previously requested the same canonical local state through three separately validating field readers (`supportAt`, `p0At`, `p1At`). The commit creates one initialization-owned scratch record and calls the state owner's existing `writeStateParts(stateId, scratch)` once, then consumes the exact same three fields.

The state owner still validates `stateId` before reading. `writeStateParts` dispatches through the owner's current selected packed/wide layout, so the previously qualified stable-reader/reservation lifecycle remains intact. No duplicate semantic storage is added: the scratch contains only transient scalar copies. Exact local identity remains support index plus the two canonical residual-class IDs. Shared proof identity and exact descriptor comparison are unchanged; no hash becomes equality.

The scratch is allocated once at kernel construction rather than in recursive search. `advance()` is synchronous and contains no await/yield boundary while these scratch values are live, so Promise-parallel sibling search cannot interleave another call into the same scratch during one transition. Worker threads own separate JavaScript isolates. This does not weaken fail-closed validation, resource ownership, terminal semantics or proof publication.

The change does not alter CPC, WSL-625 or NDC facts, does not reconstruct a colored board, does not add a conventional search heuristic, does not move proof state into frontier state, and does not change Branch Manager responsibility or introduce per-node RPC.

Hosted run `34729099344` succeeded on exact source `5ec678f65595239af85f36de0942f571b3b730c3`. The depth-8 timing sample reported `searchMs=2657.891633` and user CPU 3.11 s versus 2667.062977 ms and 3.15 s on the immediately preceding timing baseline. All recorded semantic/search/proof counters match exactly, including 4,777,115 calls, 672,690 expansions, 221,398 states, 305,714 classes, 421,303 edge misses and 2,424 cutoffs. The approximately 0.34% elapsed difference is noise-scale hosted-runner evidence and is **not** a demonstrated speedup.

Four bounded workflow runs associated with the exact source head completed without a failing run; the slot64 lane above directly covers the changed state owner/kernel path.

**Disposition:** compliant and retained. The optimization is an elimination of redundant owner reads/validation work, not a semantic change.

## Process finding and correction

The audit did find one real violation of the continuation instructions: after `50aac925` / `5ec678f6`, the required current-state routing was not advanced. `STATUS.md`, `next_step.yaml` and the research index still presented the preceding native-key checkpoint as the latest state. Some older historical sections also retained their original `uncommitted` wording.

That is a documentation/current-state integrity defect, not a solver-correctness defect. This addendum and its accompanying current-state/index edits repair the omission without rewriting historical experiment records or pretending their earlier source state was different at the time.

The full-engine audit remains the prior comprehensive active-path audit. This file is its bounded continuation/addendum for these two commits; it does not retroactively expand the earlier 44-file audit snapshot or authorize a new standard-root run.

## Governing conclusions for the next optimization

- Exact ordinary local state remains `supportIndex + canonical P0 class + canonical P1 class`.
- The packed state owner remains the single owner of that local identity payload and validation.
- Proof state remains separate; exact shared proof identity remains semantic content, never local IDs or hash equality.
- CPC/WSL/NDC implications remain unchanged.
- No board reconstruction or conventional heuristic substitution is authorized.
- Before removing any further adapter/state validation, prove it is truly duplicate under the **current** owner contract. Earlier ranked work already removed some duplicate tactical-adapter validation; do not repeat that optimization by appearance alone.
- Bounded identical-counter qualification precedes performance claims. The full standard root remains unlaunched and its revision trigger remains unchanged.
