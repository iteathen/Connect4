# Initial checkpoint — deeper work remains open

No polynomial perfect-play proof has been obtained. The campaign is paused
for owner discussion of workload coverage; do not equate this checkpoint with
completion or a falsification of structural solving.

All target probes used standard **7x6** prefixes `44`, `444`, `4444`.
The 4x4 exhaustive control was solely a generic leaf-rule correctness test,
not a translation of the center prefixes or evidence about their game values.
It checked intervals against all 161,029 legal states. Reflection and first-win
controls passed. An initial test-count assertion mistakenly reused 4x3 connect-3
research's 4,631 count for connect-4; it was corrected by using the established
4x4 connect-4 domain, without changing any proof rule to fit an outcome.

The independent rule-only producer imports no solver or prior answers. At six
additional plies, terminal/immediate-win/double-threat/paired-response intervals
left all seven root actions [-1,+1] for all three prefixes:

| Prefix | Calls | Distinct depth/state keys | Unresolved horizon leaves |
|---|---:|---:|---:|
| 44 | 33,695 | 19,957 | 11,222 |
| 444 | 34,947 | 20,588 | 14,058 |
| 4444 | 31,669 | 18,541 | 10,175 |

This tests only that leaf vocabulary at depths 2/4/6. It does not show that
deeper partial search or stronger structural certificates fail. No performance
claim is made from this diagnostic's wall time or physical representation.

One concrete missing premise: vertical paired response leaves 12 live attacker
requirements uncovered at both 44 and 4444, including bottom cells [0,1,2]
(zero-based row-major) beside the existing center token. At 444 its even-capacity
guard fails. Thus pairing alone does not close these roots. These are failures
of this sufficient certificate, not proofs of any W/D/L result.

Read-only selected native CPC inspection at
6bbba7c71c60afb1018a22b6d5c03f495f5d2c9e also returns NONE and [-1,+1] at all
three roots, with either existing response policy. NATIVE_CPC.json retains root
and all one-ply child observations. No root action is inferred from old solves.

Cycle candidate C1 isolated the repeated post-CPC singleton check. Source proof
and regression tests support its redundancy, but four matched 7x6 exact runs on
353335714 showed +3.764% process cycles (+4.002% wall) at ~3.2 seconds. All exact
WDL/moves matched. This is an adverse **short-control** result only. Initial
campaign-wide rejection was premature and is superseded by the owner correction:
deeper/branch-heavy qualification is required. No conclusion about larger
searches is justified by this screen. Candidate remains preserved, not selected.

JSMinSys candidate: 37d369c9c73a3302af0c850da63ee1e97f2f72ca.
Raw/result checkpoint: ff658904805f0e6f5cb5134c7b949c985331fd40.
Disposition correction: 763406e, experiment/isomax-cpc-kind-contract-20260929.
Evidence: evidence/isomax-center-proof-cycle-20260929/ and referenced raw samples.
Selected runtime/profile are unchanged. No benchmark process remains running.

Next proof opportunity: a compact response/deadline certificate that covers
the unresolved residual obligations while retaining universal opponent replies.
Check the stronger synchronized-channel family and existing proof-frontier
work before inventing another representation. Candidate discovery, certificate
verification, and polynomial construction bounds remain separate burdens.

Next economics requirement: deeper completed controls and branch-heavy runs
under the locked profile before a broad C1 disposition. Do not infer benefit
or harm solely from operation counts, shallow probes, or timeout throughput.
