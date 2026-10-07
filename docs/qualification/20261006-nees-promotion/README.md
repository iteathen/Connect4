# IsoMax rc.5 promotion qualification

The owner authorizes the tested NEES candidate as the current solver on Connect4
main. This promotion branch derives from main `ad0bfd0`, not the independent
solver history. Only the package, setup/routing and qualification are imported.
Incumbent, BSFP and research implementations remain unchanged.

Initial producer runtime source: `b7604c7dcca54fca362d630ed96c96410469e3e2`. Its only
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

## Public default confirmation

`public-default-01` ran the unmodified `node isomax/run.mjs` startup on the
recorded Node 27 runtime. It selected profile12 automatically and returned
EXACT/WIN/column4 in33,083.8197ms primary,38,905.2284ms operation and
39,621.574ms external wall. CPU204,923ms; peakRSS15,596,896,256bytes. Actual
shared bytes12,884,901,888; private201,326,592 per worker. All six discovered
workers pinned to0/2/4/6/8/10, ready/exited, cleanup true, no solver process left.
Raw command/settings/stdout/stderr and summaries remain in that run folder.

The extracted archive verified123locked files and returned an exact draw on
the bounded4×1 installation check with six discovered workers. SHA-256:
`9ae5bcddd3e92d51c313295b9feaf7fb6d3112233e098e67fa55306ce3904307`.
Archive size466,177bytes. This is an extraction/closure check, not timing evidence.

The main-derived suite passed118tests,0failed,1GC-only skip. The GC-only lifecycle
test separately passed3cases, including backing-handle release. Worker kernels
remain source-identical to the previously qualified candidate; cold memory
selection and public CPU/RSS reporting are the only new runtime composition.

The review fix pass advances the shipped runtime to
`8b81911bb19f58665f5a5bbb4811a05fc0fd9fba`, preserving custom-layout/tiny-cache
fallback and accurate split40 entry-width metadata. See REVIEW.md. The first
archive hash above belongs to pre-fix evidence. The final archive SHA-256 is
`be8335280f8dc1db881939c48fa65517f8b3c58c530efe57c5ee590d950d434b`;
`archive-smoke-final.json` verifies its independent extraction.

## Shipped-source confirmation

Final source8b81911, `public-default-02`:33,334.3664ms primary,
38,885.0416ms operation,39,689.6962ms external wall,204,688ms CPU,
15,600,730,112bytes peakRSS. EXACT/WIN/column4, profile12 automatic,
12GiB shared/192MiB private, six verified P-core workers, six clean exits,
no solver process remaining. OneDrive remains stopped as instructed.

Final main-derived suite:121passed,0failed,1GC-only skip. Final producer suite:
493passed,0failed,1GC-only skip. The separate GC release test has3passing cases.
The archive and source locks reproduce; no worker/CPC/search body changed.

Owner review exception is explicitly configured by the repository's
“PR review - owner and ChatGPT exceptions” ruleset. Promotion uses that exception
only after required verify CI is green, retaining expected-head protection and
linear-history squash merging. No branch protection is disabled.
