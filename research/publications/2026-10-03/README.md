# Connect4 research publications — 2026-10-03

## Rank-Local Landing Certificates for the First Five Plies of Standard Connect Four

Author: Joshua Oshiro

Publication:
RANK_LOCAL_FIVE_PLY_CENTER_CERTIFICATE_0_1.md

Status: formal project research preprint; not peer reviewed.

Result: the current-state rank-local landing certificate uniquely selects column 4 from the empty board and after prefixes 4, 44, 444, and 4444, constructively yielding 44444 without descendant enumeration, recursive search, oracle input, solved W/D/L values, projection, or an encoded opening table. At 44444 the same certificate reaches its explicit move-six unresolved boundary because the unique center incidence maximum has zero headroom.

Primary provenance:
- Connect4 source record commit 9201e6b26489deed814cf6fc33f91e4e710cd0a2
- JSMinSys qualified implementation commit c8b450ae01073a684b68d492ec42a03403d56b2f
- qualification workflow run 36969689273
