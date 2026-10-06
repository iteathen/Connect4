# ABI-cleanup realization

Producer87ed5977a11b827ed5841107e83479e69d5e0d2e, after full empty7x6
solve34.9560658s with exact WIN/c4 and six pinned/clean workers. Diagnostic is
ten seconds of instrumented search, not performance qualification.

The latest center isolate1 body in `code-7164-1.asm` has45,416 instruction bytes.
The storeExact call at line19909 is still separate. Immediately before it, the
full hash argument loaded from `[rbp-0xc8]` is compared to0x7fffffff; larger values
convert to double and allocate a16-byte HeapNumber. Slot/tail arguments have
disappeared, but unsigned-hash boxing has **not** been superseded by ABI cleanup.
This is current evidence admitting a signed-bit internal hash-carrier experiment.
It does not count execution frequency or establish its performance benefit.

The public full hash algorithm and all32 bits must remain unchanged. Every
partial24/mixed consumer uses `&` for index/sample selection or `>>>` for stored
hash prefix/bank selection, so signed presentation can preserve the same bits;
this must be checked with byte-equivalent row/collision controls before full solve.
