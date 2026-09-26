# Lazy SMP sole execution model — retirement history

Owner direction: retain Lazy SMP and remove competing IsoMax/JSMinSys execution
models from active source and branches. This is retirement, not a claim that all
underlying mathematical or local optimization ideas were false.

JSMinSys PR50 merged at93aca1758718bcbf0635c11a957a67ca6387d50c removes the
RBA shared-work TT, BranchManager/worker and reconciliation evaluator; cold
ingress survives unchanged in its own module. Generic primitives and native
RBA/CPC alpha-beta remain. Baseline159 tests becomes138: 23 retired-model tests
removed, two architecture guards added. Catalog/geometry audits and CI pass.

Connect4 PR166 aligns dependency, current Candidate spec, agent guidance and
status. Old design/plan/spec/status text is retained explicitly as historical.
The independent downstream review reproduced 11tests and q_r controls and found
two historical-routing gaps, subsequently repaired. No BSFP change is included.

The manifest records exact branch tips, subjects and annotated archive tags.
Branches carry unique source/evidence: that work is preserved, not declared
merged or worthless. Pre-Lazy-SMP assertion/basis experiments, managed-surplus
hashless/position-code experiments, retained-pull/deficit prototypes and their
measurement branches cease to be live competing implementations. Reusable local
findings remain inspectable at their exact archived sources.

Lazy SMP optimization candidates, generic cofactor candidate PR33, canonical
research, other solver lanes and main are outside this retirement list.
A branch is removed only after its exact tip is verified under its remote tag;
expected-head leases reject any intervening updates. Original qualification
failures and timings are unchanged. See manifest status for execution completion.

Completed: nine JSMinSys and31 Connect4 branch tips verified under remote
annotated archive tags, then removed with exact-head leases. The only unselected
Connect4 change during this procedure was our own prior history checkpoint on
research/semantic-quotient; no unrelated solver or candidate branch changed.

Final integration: JSMinSys PR50 ->93aca175; Connect4 PR166 ->1522943f,
PR163 ->0c8824c0, current routing ->afbb8baa2a504790319890d935f641b3e4087e4b
on work/isomax-jsminsys-rebuild. The legacy solver/isometric head was also
archived and removed: total41 retired model/evidence branches (32Connect4,
9JSMinSys), all exact remote tags reverified and all retired heads absent.
GitHub additionally removed the three merged PR source branches; their full
pre-squash source is pinned under archive/pr-50, archive/pr-166 and archive/pr-163
with the 20260926 suffix. Current other solver lanes and Lazy SMP candidates
were left unchanged. Independent review accepted final routing.

Application11/11 and upstream138/138 controls pass. Current q_r controls pass.
First Fhourstones input smoke: four workers, EXACT+1, move3, cleanup=true,
1056.3568ms whole-operation wall and17,603,717,519 process cycles. Winner-only
node count is708,500; no all-worker cycles/node is inferred. The former full
worker-scaling measurements remain unchanged. Automatic final-head CI/benchmark
run status is available in GitHub; no incomplete full benchmark is called solved.
