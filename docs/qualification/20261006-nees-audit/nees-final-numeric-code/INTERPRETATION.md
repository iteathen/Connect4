# Final numeric ABI realization — diagnostic only

Producer1c7b64f352c2e44b4853f9faaf916b48d7837bce; Node27 nightly/V814.6,
Windows i5-12600K, six verified pinned workers, unchanged12GiB shared and
192MiB private TTs. Ten-second instrumented observation deliberately returns
TIMEOUT with six clean exits. It is not a performance trial. OneDrive stopped
with owner authorization, matching later uninstrumented controls.

Representative latest center/live negamax instruction bodies are37,112 and
43,896bytes. machine-inventory.json binds every isolate raw file and records
static sites only, never executed allocation frequencies.

M1: representative center storeExact argument preparation at offsets34a9..34b5
loads signed hash/coordinates and tags them with shifts by32. Live offsets
34d9..34e8 do the same. The previously observed unsigned-hash greater-than
0x7fffffff allocation branch is absent from these argument preparations.
All32 locator bits are preserved by signed presentation; this is not truncation.

M2: center recursion offsets5e95/5ea6 convert normalized window values to
integers, then5eca/5ece tag those integers directly. Live6668/6679 and
66a1/66a5 have the corresponding integer conversions/tagging. The former
negative-zero window allocation is absent at these argument preparations.
V8 still uses floating intermediates/conversions in places: source int32
normalization is not automatically one native bitwise instruction.

Remaining HeapNumber paths, allocator slow calls, builtin/helper calls and
GC activity still exist. Some pre-recursion boxing belongs to other arguments;
reachability/frequency is not established by these excerpts. Neither complete
allocation-free recursion nor global NEES cost qualification is claimed.
Required Atomics and exact proof guards are retained. M4 native-lowering costs
remain realization-sensitive debt, not bare-load/popcount latency assumptions.
