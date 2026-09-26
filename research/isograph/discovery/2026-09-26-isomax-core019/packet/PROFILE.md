# Native tree profile — candidate, not semantic admission

Core dependency: iteathen/IsoGraph@43490735f0073acccb4f900e247cd0db19681e1f,
qualified Core 0.17 + 0.18 + 0.19, especially Core 0.19 section 18.

This packet attempts a downward rendering of executable source, rather than
an opaque function-name graph. This profile describes exact structural
serialization. Passing its reconstruction test alone does NOT qualify the
program's operational semantics. A fresh reviewer must separately assess model
leaf authority, binding, evaluation, effects and external runtime closure.

Owning namespace: this packet only. Each native expression is ordered incidence.
Labels are declared here as a candidate profile; they are not Core primitives.

- `(^980010 (key value) ...)`: a finite record, each key is a UTF-16 string;
  duplicate keys forbidden. Field order preserved by reconstruction.
- `(^980011 value ...)`: an ordered sequence, preserving every occurrence.
- `(^980012 #u ...)`: UTF-16 code units, each in 0..65535; no normalization.
- `(^980013 #hi #lo)`: IEEE-754 binary64 bit payload, high uint32 then low
  uint32, both big endian. Signed zero and precision retained.
- `(^980014 #b)`: boolean, b is 0 or 1.
- `(^980015)`: null.

There are no other constructors or implicit defaults. Reject malformed input,
undeclared labels, duplicate fields, invalid ranges, and trailing terms.
Native literal numbers are exact integers. Object-number values use explicit
binary64 payloads so decimal conversion cannot lose precision.

The top-level record includes the interpretation, imports, entry points, and
module programs. Each program is an Acorn 8.15.0 ECMAScript-2025 syntax tree,
with parentheses preserved and source offsets/comments removed. Node type,
operator, operands, declaration/use names, lexical nesting, guards, statement
order, optional/computed flags, raw literal spelling, import/export and call
arguments remain in the native tree. RegExp values are represented by pattern
and flags; BigInt values by exact decimal integer strings. Original Literal
raw/regex/bigint fields remain too.

The intended source interpretation is ECMAScript modules under Node 26.7.0.
ECMA-262 es2025 source anchor: 2e1eeda78a104b5e50eec93214fb800309ee379f.
This citation is not a claim that a new ECMAScript/ESTree semantic bridge has
already been qualified. In particular do not promote a serialization test
into operational source-semantic equivalence without assessing that bridge.

## Cold reconstruction output

Using only this profile, NATIVE.isg and the pinned Core authority, independently
decode the complete native object into `reconstruction.json`. Do not read source
files, author oracle, encoder/decoder implementations, earlier reports or
expected reconstructions. Write a separate review of whether this packet is
admissible under Core 0.19 section 18, including precise unresolved obligations.
Do not infer an operational theorem from exact serialization. Do not execute
the reconstructed program. Keep code and report in your assigned output folder.
