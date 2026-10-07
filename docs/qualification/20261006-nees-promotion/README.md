# IsoMax rc.5 promotion qualification

The owner authorizes the tested NEES candidate as the current solver on Connect4
main. This promotion branch derives from main `ad0bfd0`, not the independent
solver history. Only the package, setup/routing and qualification are imported.
Incumbent, BSFP and research implementations remain unchanged.

Producer runtime source: `b7604c7dcca54fca362d630ed96c96410469e3e2`. Its only
post-measurement runtime change is cold memory-policy admission for partial24 and
the 12 GiB profile. Worker kernels remain byte-identical to qualified `1c7b64f`.
Package provenance binds 86 modules, all 32 workers, source ledger and entry points.
No npm registry publication is included.

Package verification, bounded tests and a public empty 7×6 confirmation are
recorded here before merging. The public launcher must discover six P-core
workers, verify CPUs 0/2/4/6/8/10, and select actual 12 GiB shared / 192 MiB
private per worker on the recorded localhost. Node 27 nightly/V8 and flags remain
unchanged. OneDrive stays stopped. No RLC, books or oracle inputs are supplied.
Preparation and solve timing are separate. CI qualifies correctness, not timing.

Source/evidence are in `isomax/provenance.json` and its evidence folder.
Whole-runtime NEES and allocation-free certification remain unqualified.
