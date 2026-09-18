# QU 0.1 Native Vocabulary

**Status:** normative vocabulary companion to `QUANTIFIABLE_UNKNOWN_SPEC_0_1_CANDIDATE.md`  
**Native declaration:** `QU_VOCAB_0_1.isg`

These stable labels are owned by the QU 0.1 extension namespace/revision. Numeric spelling has no meaning outside that namespace/revision.

| Stable label | Role |
| --- | --- |
| `^95000` | QU extension/profile authority record |
| `^95001` | QU state `Q` |
| `^95002` | subject / declared scope |
| `^95003` | fixed represented structure `F` |
| `^95004` | open structural region `O` |
| `^95005` | possibility universe / admissible-domain authority `Ω` |
| `^95006` | constraint set / constraint authority `C` |
| `^95007` | interface/boundary structure `B` |
| `^95008` | scope/closure authority `A` |
| `^95009` | admissible realization family `R(Q)` |
| `^95010` | admissible realization / family membership |
| `^95011` | QU semantic state `OPEN` |
| `^95012` | QU semantic state `DETERMINATE` |
| `^95013` | QU semantic state `INCONSISTENT` |
| `^95014` | QU qualification state `INCOMPLETE_SCOPE` |
| `^95015` | QU claim/result record |
| `^95016` | claim status `NECESSARY` |
| `^95017` | claim status `POSSIBLE` |
| `^95018` | claim status `UNRESOLVED` |
| `^95019` | claim status `IMPOSSIBLE` |
| `^95020` | verified QU semantic refinement relation |
| `^95021` | strict refinement witness/status |
| `^95022` | semantic revision / non-refinement change relation |
| `^95023` | optional information-measure/profile authority |
| `^95024` | optional information-measure record/value/bound |
| `^95025` | Quantifiable Unknown Isomorph (QUI) claim |
| `^95026` | QUI mapping/witness/certificate |
| `^95027` | cross-realization correspondence / anchor authority |
| `^95028` | provenance/evidence reference |
| `^95029` | verification/qualification record |
| `^95030` | resource/completeness status |
| `^95031` | coverage/universality certificate over `R(Q)` |
| `^95032` | pinned dependency/revision relation |
| `^95033` | open structural carrier/relation occurrence role |
| `^95034` | admissible domain / unresolved-role constraint |
| `^95035` | exclusion / out-of-scope / fixed-status evidence role |

The vocabulary intentionally represents semantic roles rather than introducing a dedicated unknown token or constraint language. The internal structure of an open region remains ordinary IsoGraph structure under the governing QU/profile authority.

A QU artifact may use only the roles required by its claim and profile, but omission never weakens a governing semantic obligation. For example, a complete realization-family claim still requires enough structure to recover its possibility universe, constraints, and closure authority even if a compact profile supplies those through pinned dependencies.

The vocabulary introduces no parser tokens. These labels participate in ordinary IsoGraph scopes/incidences under the extension authority.
