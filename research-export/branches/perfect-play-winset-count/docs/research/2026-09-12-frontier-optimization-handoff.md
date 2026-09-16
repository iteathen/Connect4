# Frontier optimization handoff

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

Continue `iteathen/Connect4`, branch `research/frontier-negamax-conformance`, from
the remote checkpoint supplied with this handoff. Fetch and inspect the actual
head before mutation; preserve concurrent work. This is continued implementation
and qualification, not a fresh solver design or repository-ref cleanup task.

Read the [conversation summary](https://github.com/iteathen/Connect4/blob/research/frontier-negamax-conformance/docs/research/2026-09-12-frontier-conversation-summary.md)
first for the owner's reasoning, corrections and important interpretation limits.

Follow assess → research → reassess → plan → execute → qualify → review →
cleanup/document. Read AGENTS.md, AGENT_LOCAL.md, C4-0001/0006/0007/0010, STATUS.md,
next_step.yaml, the full-engine sanity audit, and these latest records:

- `docs/research/2026-09-12-native-key-integration.md`
- `docs/research/2026-09-12-native-relational-key.md`
- `docs/research/2026-09-12-depth21-ranked-optimization.md`
- `docs/research/2026-09-12-pons-protocol-benchmark.md`

Preserve the frontier-native relational architecture. Board dimensions have one
initialization owner. Exact local state is support plus canonical P0/P1 residuals;
side to move derives from support rank. Do not reconstruct a board for hot-path
evaluation or invent unproved parity terminalization. Shared proof identity remains
exact semantic content, never worker-local IDs or hash equality alone.

The active slot64 state owner now stores native two-word local identities where
sealed capacities fit, with an exact three-word layout for wider configurations.
There are no duplicate support/class arrays in that owner. Field consumers use
owner reads. Reservation preserves IDs and edges; readers captured before sealing
remain valid. Packed payload, count and capacity are private. Keep exact collision
comparison and fail-closed resource/lifecycle behavior.

The initial integration was slower. Do not repeat the unsupported claim that a
bitwise AND caused the regression. Several helpers/accessors are demonstrably
inlined by V8. The integration had extra validation/access work and a stale-reader
lifecycle defect; the latter is fixed and explicitly tested. Latest paired empty
7-column × 6-row depth-8 measurement: elapsed 1786.365 → 1786.722 ms, CPU
1969.5 → 1929.5 ms, state payload 6,291,456 → 4,194,304 bytes. Every result and
search/operation counter matches, including 4,777,115 calls and 221,398 states.
CPU improvement is small measured evidence, not a guaranteed speedup. The earlier
18% result was an isolated lookup benchmark, not engine throughput.

Final local qualification: 74 controls, six bounded campaigns and ten provider
controls passed. Evidence and exact source hashes are under
`docs/research/evidence/2026-09-12-native-key-integration/qualified/`; source snapshots
and before/after hashes are also preserved in the parent evidence directory.
Five bounded workflow filters include the new owner. Verify hosted CI for the
actual pushed commit before treating it as remote qualification.

Next: inspect the complete packed-state consumer path and isolate remaining
candidate construction, descriptor materialization, validation and memory-access
costs. Eliminate unnecessary work first; then exploit shared relational invariants;
then optimize necessary operations. Keep hot code numeric and allocation-free,
without parsing, strings, unnecessary transformations/copies, blocking waits or
synchronous reporting. Avoid adding abstraction overhead merely to hide bit access.
Check for redundant cold helpers as part of cleanup without broad unrelated edits.

Use local bounded tests with identical conditions, exact counter comparisons and
timing attributable to source. A sampling profile without line attribution is not
line-level evidence. Explicitly distinguish CPU, elapsed time, lookup microbenchmarks
and full-search measurements. Use one total 60-second deadline for a test batch;
kill and join unfinished work. No orphan or duplicate solves. Do not blindly run
several full-length 60-second tests in sequence.

The full standard 7×6 root remains unlaunched. Do not change
`standard7x6-root-qualification-revision.txt` until the complete active-path audit
and relevant bounded qualification justify it. Depth-8 horizon results are not an
exact root draw. Earlier depth-21 runs timed out; the Pons batch completed only
137/6000 positions, all correct W/D/L signs, with partial-set selection and setup
cost limitations. No universal “under ten million nodes” solver claim is established.

Maintain STATUS.md, next_step.yaml, the research index and audit ledger. Report
actual improvements and unresolved costs candidly. Preserve evidence of rejected
variants. Do not force-push or mutate protected main as part of this continuation.
