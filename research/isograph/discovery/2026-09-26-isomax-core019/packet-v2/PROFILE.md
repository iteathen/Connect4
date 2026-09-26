# Native executable-source profile — candidate 0.4

Owning namespace: this packet. Core: iteathen/IsoGraph commit
43490735f0073acccb4f900e247cd0db19681e1f, effective qualified 0.17 + 0.18 + 0.19.
This is a candidate interpretation contract undergoing admission, not a
declaration that the renderer or a new language bridge is already qualified.

The following derived constructors are ordinary ordered incidence and exact
integer literals. No new Core primitive is proposed:

- `(^980010 (key value) ...)`: finite record; distinct string keys, field
  occurrence order retained by serialization.
- `(^980011 value ...)`: ordered sequence with occurrence multiplicity.
- `(^980012 #u ...)`: exact sequence of UTF-16 code units 0..65535.
- `(^980013 #hi #lo)`: binary64 bit payload, unsigned 32-bit high then low
  word, big endian; signed zero and all bits retained.
- `(^980014 #b)`: boolean, b is exactly 0 or 1.
- `(^980015)`: null.

No omitted field has an implicit default. Reject malformed input, duplicate
keys, invalid ranges/arity, undeclared labels, and trailing terms.

The native object contains its source interpretation, module structures,
imports and entry points, node-to-language production interfaces, source-model
authority pins, binding/effect/memory dependencies, runtime boundary, and
unresolved environment family. These facts are inside the native payload;
this file does not supply omitted solver formulas. The six serialization
constructors are the proposed transport profile being tested by reconstruction.

## Meaning and scope

The claim is complete algorithm/control/data structure of the frozen executable
implementation under its explicit ECMAScript/Node source model. It is not a
claim that the solver is correct, an optimization is valid, source spelling is
minimal, or particular machine timing follows from code. Stack-trace formatting
and source-text introspection are outside this interpretation, explicitly;
errors, error handling, cleanup, calls and effects remain represented.

The complete module trees preserve node kind, operands, binding/use spelling,
lexical nesting, literals/raw forms, optional/computed flags, order, parameters,
closures, guards, branches, returns, exceptions, loops and effects. Imported
but inactive exports remain represented: static closure is not a claim that
every represented branch runs in the selected entry profile.

The semanticBridge record maps each present syntax node kind and its field
roles to the pinned ECMAScript production/semantics. Operators select their
corresponding productions under that language authority; they do not acquire
semantics from familiar glyphs. Scope/binding follows the represented lexical
structure and explicit environment-record authority. Native numeric labels are
transport identities, never program-variable or natural-object identity.

The bridge and primitive/model interfaces are candidates whose exactness is
part of this admission gate. Their source-model category is stipulated source
language / frozen implementation environment, not irreducible Core primitive.

## Cold reconstruction and review

Receive only NATIVE.isg, this profile, pinned Core authorities, and the pinned
ECMAScript/Node reference authorities where needed. Do not read source files,
encoder, author oracle, expected results, previous decoder outputs or DP leads.
Independently reconstruct the complete object to reconstruction.json. Record
hashes, structural checks and any semantic ambiguity/missing obligation in a
separate report. Do not execute the reconstructed solver.

Evaluate source-semantic admission separately from reversible transport. Do
not claim equality to a hidden oracle you did not receive. Require subsequent
oracle comparison, distinction controls and independent review before promotion.
