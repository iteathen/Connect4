// Source audit and tiny formal countermodels only. Never enumerates or solves a board.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../../..');
const isoRepo=process.env.ISOGRAPH_AUDIT_REPO || 'C:/r/isograph-authority-ref';
const latePin='a0d439449e398c5ce5a70ccbc9b3a38f3df16928';
const isoPin='323d0f4ea78775ca99170002efb5be0037d6b01b';
const lateDir='research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const lf=s=>s.replace(/\r\n/g,'\n');
const sha=s=>createHash('sha256').update(s).digest('hex');
const sources=[];
function source(id,root,pin,p,patterns=[]){
  const text=lf(execFileSync('git',['-C',root,'show',pin+':'+p],{encoding:'utf8',maxBuffer:16*1024*1024}));
  const lines=text.split('\n');
  const anchors=patterns.map(pattern=>{
    const i=lines.findIndex(x=>x.includes(pattern));
    assert.ok(i>=0,`${id}: missing anchor ${pattern}`);
    return {line:i+1,text:lines[i]};
  });
  const record={id,repository:root,revision:pin,path:p,identityEncoding:'UTF8_LF',sha256:sha(text),anchors};
  sources.push(record);
  return text;
}
const late=(id,p,patterns=[])=>source(id,repo,latePin,lateDir+p,patterns);
const dp09=source('DP09',isoRepo,isoPin,'extensions/discovery/DISCOVERY_PROTOCOLS_0_9_MINIMUM_SUFFICIENT_SUPPORT_VALUATION_CANDIDATE.md',[
  'same admissible inputs','# 6. Minimal and minimum sufficient support','nonessential for sufficiency of one objective','# 18.','# 19. Search discipline'
]);
const dp10=source('DP10',isoRepo,isoPin,'extensions/discovery/DISCOVERY_PROTOCOLS_0_10_EXPERIMENTAL_WARRANT_CANDIDATE.md',[
  'narrow negative result','# 11. Adaptive evidence firewall','No warrant is justified merely','The warrant itself proves none'
]);
assert.equal(sha(dp09),'4d6ed98288863ccd50e9cbccf2e626ff241aded3bd9fb534e0fb74ad147858ea');
assert.equal(sha(dp10),'108f3998bba90aff6a386335aeb45fde663d4be0b32643a06e01fb039bff61ec');
source('QUALIFIED_MODULES',isoRepo,isoPin,'qualification/QUALIFIED_MODULES_2026-09-29_CORE_0_21.md',[
  '4d6ed98288863ccd50e9cbccf2e626ff241aded3bd9fb534e0fb74ad147858ea','108f3998bba90aff6a386335aeb45fde663d4be0b32643a06e01fb039bff61ec'
]);
late('DECOMPOSITION','ISOGRAPH_FULL_DECOMPOSITION_0_1.md',[
  '**IsoGraph family:','current repaired-coordinate evidence is Q-V evidence only','No global minimum has been established','That is a DP valuation result','polynomial decoder is an existence witness','not independent qualification'
]);
late('DECOMPOSITION_IA','ISOGRAPH_FULL_DECOMPOSITION_0_1.json',['"id": "IA-LATE-011"','affine joint target dimension 2 means both output columns']);
late('RS059','EXPERIMENTAL_WARRANT_RS_059.json');
late('RS060','EXPERIMENTAL_WARRANT_RS_060.json',['joint target dimension dim','A joint target dimension greater than two','explicitly outcome-fitted discovery evidence']);
late('RS061','EXPERIMENTAL_WARRANT_RS_061.json',['oracle-motivated discovery hypothesis']);
late('ORI_NOTE','OOO_ORIENTATION_DP_DTS_0_1.md',[
  'Therefore diagonal sign is removable','This is an exact structural quotient','**diagonal sign:**','**orientation family as universal required support:**','Orientation may still organize'
]);
const ori=late('ORI_LIB','ooo-orientation-provenance-lib.mjs',[
  "if(orientation==='D+'||orientation==='D-')return 'D';",'orientation:foldOrientation(src.orientation)','const os=new Set(rec.sources.map','function exactOrientationKey'
]);
late('ORI_RUNNER','run-ooo-orientation-provenance.mjs');
for(const n of ['065','066','067','068','069','070','071','072','073','074','075','076','077','079','080','081','082'])late('RS'+n,'EXPERIMENTAL_WARRANT_RS_'+n+'.json');
for(const [id,p] of [
  ['LINEAGE_POOLED','OOO_POOLED_LINEAGE_INTERPRETATION_0_1.md'],
  ['ROLE_DEPTH','OOO_POOLED_ROLE_DEPTH_INTERPRETATION_0_1.md'],
  ['OWNER_COHERENCE','OOO_POOLED_OWNER_COHERENCE_INTERPRETATION_0_1.md'],
  ['NATIVE_COMMON','OOO_POOLED_NATIVE_COMMON_INTERPRETATION_0_1.md'],
  ['NATIVE_DOMAIN','OOO_POOLED_NATIVE_DOMAIN_INTERPRETATION_0_1.md'],
  ['ENDPOINT_GAUGE','OOO_POOLED_ENDPOINT_GAUGE_INTERPRETATION_0_1.md'],
  ['SIGN_CORRELATION','OOO_POOLED_SIGN_CORRELATION_INTERPRETATION_0_1.md'],
  ['RELATION_CIRCUIT','OOO_POOLED_RELATION_CIRCUIT_INTERPRETATION_0_1.md'],
  ['RELATION_LIB','ooo-pooled-relation-circuit-lib.mjs'],
  ['PARTITION_COMMON_LIB','ooo-joint-da-common-quotient-lib.mjs'],
  ['LINEAR_COMMON_LIB','ooo-common-carrier-level-lib.mjs']
])late(id,p);

// Import the exact pinned, self-contained source, not a moving working-tree file.
assert.ok(!/^import .*from ['"]\./m.test(ori),'unexpected local import in pinned pure library');
const orientation=await import('data:text/javascript;base64,'+Buffer.from(ori+'\n//# sourceURL=PINNED_RS071_ORIENTATION_LIBRARY.mjs\n').toString('base64'));
const flip=xs=>xs.map(orientation.reflectOrientation);
const orbit=xs=>[xs.join(','),flip(xs).join(',')].sort();
const sameSign=xs=>xs[0]===xs[1];
const a=['D+','D+'],b=['D+','D-'];
assert.notDeepEqual(orbit(a),orbit(b));
assert.deepEqual(a.map(orientation.foldOrientation),b.map(orientation.foldOrientation));
for(const xs of [a,b])assert.equal(sameSign(xs),sameSign(flip(xs)));
assert.notEqual(sameSign(a),sameSign(b));
const occurrence=xs=>({width:2,capsByRole:[0,0],records:xs.map((o,i)=>({owner:0,cells:[{depth:0,role:i}],sources:[{orientation:o}]}))});
const countsA=orientation.summarizeOrientationOccurrence(occurrence(a),'ORI_COUNTS');
const countsB=orientation.summarizeOrientationOccurrence(occurrence(b),'ORI_COUNTS');
assert.equal(countsA,countsB);
assert.notEqual(orientation.summarizeOrientationOccurrence(occurrence(a),'EXACT_ORIENTATION_PROVENANCE'),orientation.summarizeOrientationOccurrence(occurrence(b),'EXACT_ORIENTATION_PROVENANCE'));

const artifact={
  schema:'connect4.revalidation.discovery_protocol_application_audit.v1',
  status:'SOURCE_AUDIT_WITH_FORMAL_INFERENCE_COUNTERMODEL',
  date:'2026-09-30',
  baselineLateRevision:latePin,
  comparisonIsoGraphRevision:isoPin,
  authority:{connect4:'1.2 UNCHANGED',canonicalOwner:'research/semantic-quotient',location:'staging checkout; no authority promotion',
    upstreamDisposition:'No upstream DP categorical defect established by this audit. Qualified DP0.9 and DP0.10 explicitly guard the distinctions violated by the application findings below.',
    exactSpecsVerified:true,
    historicalApplicationPin:'The late decomposition identifies the integrated stack by versions. This audit did not recover an exact immutable IsoGraph revision/hash binding in that decomposition, so the current qualified comparison pin must not be silently substituted for a proven historical execution pin.',
    candidateFilename:'CANDIDATE in the historical filenames is not evidence of unqualified status; exact hashes match the qualified module ledger.'},
  scope:{mode:'read-only historical sources; new audit artifacts only',boardEnumeration:false,boardSolve:false,outcomePayloadInspection:false,sealedHoldouts:'EW-RS-059 remain sealed',phase2Execution:'paused; no execution by this audit',newMathematics:'finite abstract sign countermodel only; not a game position or scalar outcome counterexample'},
  findings:[
    {id:'DPAPP-01',status:'CONFIRMED_APPLICATION_INFERENCE_ERROR',severity:'material',title:'Global reflection does not imply independent diagonal-sign erasure',
      sourceRefs:['ORI_NOTE','ORI_LIB','ORI_RUNNER','DP09'],
      claim:'The note deduces diagonal sign removable exactly for reflection-invariant scalar questions from the global reflection exchanging D+ and D-.',
      actualCode:'foldOrientation maps every D+ and D- source token to D independently; allSourceInstances, cellExpanded and pairIncidence use that pointwise fold. EXACT_ORIENTATION_PROVENANCE retains raw signs. The coarse candidate is not merely canonicalization under one simultaneous global reflection.',
      failure:'Equivariance of the raw line catalog under one Z2 action proves preservation along its orbits. Independent sign forgetting merges distinct simultaneous-action orbits and can discard relative signs. A scalar invariant under reflection need not be constant on these larger fibers.',
      established:'The deduction is invalid in general, and the implemented coarse map actually performs the additional forgetting.',
      notEstablished:'No legal Connect4 board pair with different scalar values in a folded fiber was constructed. This is not proof the particular folded carrier fails bounded scalar sufficiency.',
      qualificationDisposition:'Retract exact-removability status based solely on reflection. Retain catalog symmetry and the empirical ladder as distinct scoped evidence.',
      discoveryDisposition:'OPEN_STRUCTURAL_LEAD: test/preserve relative sign information or prove its redundancy on the admissible structural domain before claiming removal.',
      correction:'Use simultaneous reflection orbit canonicalization for an exact symmetry quotient. Classify pointwise folding as an additional forgetful candidate needing independent sufficiency proof.',
      protocolSpecDisposition:'Application violation of DP0.9 unchanged-scope sufficiency and support-versus-identity discipline; no upstream defect inferred.'},
    {id:'DPAPP-02',status:'CONFIRMED_OVERBROAD_APPLICATION_WORDING',severity:'material',title:'One H-only domain does not establish universal dispensability of orientation information',
      sourceRefs:['ORI_NOTE','DP09','DP10'],
      claim:'The DP/MSS disposition labels orientation family as universal required support REJECTED because an H-only carrier has a nonzero OOO correction.',
      legitimateNarrowConclusion:'An explanation requiring a joint interaction of H, V and D to generate every OOO correction is contradicted by the already declared H-only control, relative to the fixed repaired-coordinate polynomial representation.',
      failure:'A feature constant on one carrier may remain necessary to distinguish situations on other carriers for one common evaluator. Not required in every individual carrier is different from removable from a law over their union. OOO itself is representation-relative, so this evidence also does not establish an intrinsic game-theoretic cubic cause.',
      sourceNuance:'The note explicitly says orientation may still organize mixed-orientation carriers. That qualification should govern its stronger MSS bullet and QU-ORI-01 wording.',
      qualificationDisposition:'Narrow the rejection to the joint-H/V/D source explanation; do not record global support elimination.',
      discoveryDisposition:'OPEN_STRUCTURAL_LEAD: mixed-carrier conditional role and a common support law remain open.',
      protocolSpecDisposition:'Application scope/necessity overstatement; DP0.9 states nonessential for one objective is not globally irrelevant, and DP0.10 limits narrow negatives.'},
    {id:'DPAPP-03',status:'CONFIRMED_NONDISCRIMINATING_FALSIFIER',severity:'material',title:'RS060 target-dimension greater than two cannot falsify a two-output target',
      sourceRefs:['RS060','DECOMPOSITION','DECOMPOSITION_IA','DP10'],
      claim:'A joint target dimension greater than two rejects the retained two-output-direction hypothesis relative to degree two.',
      derivation:'For any vector space L and two appended columns y0,y1, dim((L+span(y0,y1))/L) <= dim(span(y0,y1)) <= 2. This follows before seeing any game labels or data.',
      legitimateMeasurement:'Values 0, 1 and 2 are meaningful relative to L; testing membership of both targets in a frozen structural image remains meaningful. Outcome-independent basis choice and outcome-fitted coefficient discovery remain distinct.',
      failure:'The >2 condition can only signal an implementation/definition mismatch, not reject an empirical two-output hypothesis in the declared measurement. A two-bit output alphabet does not discover two native structural syndrome generators or their constructive rule.',
      sourceNuance:'The later decomposition, including IA-LATE-011, correctly distinguishes rank-two independence modulo the affine span from exactly two unique structural syndrome generators. Credit that correction. The defect identified here is the historical warrant falsifier, not a claim that the observed rank-two result is vacuous.',
      qualificationDisposition:'Reclassify >2 as an impossible-by-definition integrity check; replace the claimed hypothesis falsifier with a test of a predeclared structural syndrome map.',
      discoveryDisposition:'KEEP: structural rank, target rank and fitted support remain diagnostic evidence within the fixed representation.',
      protocolSpecDisposition:'Application experimental-design defect; DP0.10 provides warrant authority, not truth or validation of every downstream falsifier.'},
    {id:'DPAPP-04',status:'TERMINOLOGY_AND_ORDERING_RISK_NOT_PROVEN_RESULT_FAILURE',severity:'limited',title:'A frozen search order is not automatically a semantic coarsening order',
      sourceRefs:['RS067','RS070','RS077','DP09'],
      observation:'RS067 uses coarsest-first and first passing language. Several candidate summaries in the lineage are incomparable (mask-size versus depth-histogram summaries; SIGN versus SIGNED_PARITY). RS070 separately treats candidate ordering as discovery valuation, and RS077 has a declared finite coordinate order.',
      disposition:'Call a first-passing element preferred under the frozen valuation unless a factorization/refinement relation or minimum under a declared measure is proved. No global minimum or incorrect selected scalar result is established by this observation.',
      protocolSpecDisposition:'DP0.9 permits declared valuation orders and partial orders; it explicitly distinguishes minimal, minimum, sufficiency and semantics.'}
  ],
  countermodel:{kind:'FORMAL_INFERENCE_COUNTERMODEL_NOT_CONNECT4_WITNESS',pinnedImplementationTested:'ORI_LIB',
    labeledInputs:{a,b},simultaneousReflectionOrbits:{a:orbit(a),b:orbit(b)},pointwiseFold:a.map(orientation.foldOrientation),
    invariant:{name:'the two labeled signs are equal',a:sameSign(a),b:sameSign(b),unchangedBySimultaneousReflection:true},
    actualLibraryCoarseCounts:{a:countsA,b:countsB},actualLibraryExactProvenanceSeparates:true,
    conclusion:'Reflection-invariant functions need not factor through pointwise sign erasure. This invalidates the universal inference but does not establish actual game-scalar failure.'},
  lineageAudit:{domainDefinitions:{X:'whole-state repaired signature classes on one declared reachable T2O domain',L:'complete constant/P/O/degree-two evaluation span',K:'kernel of the transpose of the lower-degree feature evaluation matrix',T:'complete distinct-descriptor OOO product evaluation family',dependencyCarrier:'image of K under the transpose of T; not a board observational quotient'},
    stages:[
      {rs:'065',operation:'Linear kernel/image construction on dependency space; basis selection is gauge, not natural identity.'},
      {rs:'066',operation:'Separate whole-state depth-coarsening test; not the next quotient of the RS065 dependency image.'},
      {rs:'067',operation:'Triple motif labels with one-hot parity assembly; candidate siblings are not all nested.'},
      {rs:'068',operation:'Vertex/pair boundary linear maps; failures obstruct those maps, not all pair-level or nonlinear laws.'},
      {rs:'069',operation:'Pair deltas regenerated from three exact descriptors, with lexicographic endpoint gauge. Gauge invariance requires a separate check.'},
      {rs:'070',operation:'Parallel delta encodings, including incomparable SIGN and SIGNED_PARITY; not one total quotient chain.'},
      {rs:'071',operation:'Augments provenance from source occurrences and pools observed per-descriptor occurrence variants; a new structural source/domain branch, not a quotient of RS070. Pointwise orientation folding has the additional DPAPP-01 issue.'},
      {rs:'072-074',operation:'Coordinate-family deletions and summary maps within the chosen pair-delta encoding. Owner-symmetric bucket construction alone does not prove physical owner-swap equivariance upstream.'},
      {rs:'075',operation:'Sibling transforms of exact bucket counts: presence, parity, ZOE, clip2, clip3 and exact.'},
      {rs:'076',operation:'Grid regenerated from RS074 exact counts, not generally a quotient of RS075 clip3; ZOE distinguishes 3 from 4 where clip3 does not. The selected presence/clip3/clip2 map does factor through clip3.'},
      {rs:'077',operation:'Genuine symbol coupling of selected saturated interval coordinates under the declared finite coordinate order. Historical coverage/repair is a separate implementation issue, not a DP axiom.'}
    ],
    checkedVsUnverified:'Map/domain/gauge classifications are a source audit, supported by the existing detailed LINEAGE_RS065_RS077.md and this pin of warrants. No scalar re-execution or universal factorization proof was performed here. A later RS076 repair must be cited separately rather than attributed to the baseline pin.'},
  coverageAndLegitimateOperations:[
    {topic:'Search space versus semantics / MSS',refs:['DECOMPOSITION','DP09'],assessment:'The decomposition declares bounded scalar WDL as its objective, labels support removals by scope, and explicitly denies a global minimum. This is legitimate objective-scoped valuation. A search preference has no independent game-semantic authority.'},
    {topic:'QV versus QA/QF',refs:['DECOMPOSITION','RS060','RS061'],assessment:'Sources explicitly limit repaired-coordinate evidence to scalar QV and deny move/action or transition sufficiency. A scalar-constant fiber need not preserve optimal actions or transition closure.'},
    {topic:'Fitted decoder versus constructive law',refs:['DECOMPOSITION','RS060'],assessment:'Frozen feature spans plus scalar fits establish existence of a decoder on declared finite rows. The decomposition calls the polynomial an existence witness/diagnostic basis, not the final law. An abstract Phi of the signature is not a closed algorithmic native evaluator.'},
    {topic:'Adaptive frozen discovery versus independent qualification',refs:['RS059','RS060','RS061','DP10'],assessment:'RS060 freezes its structural basis before fitted coefficient inspection; RS061 then explicitly calls OOO oracle-motivated discovery, not independent qualification. Re-freezing an adaptively motivated hypothesis on the same carriers does not restore freshness. EW-RS059 reserves later sealed formula qualification. These guards are legitimate and must remain attached.'},
    {topic:'Per-geometry existence versus shared law',refs:['RS079','RS080','RS081','RS082','LINEAGE_POOLED','ROLE_DEPTH'],assessment:'RS079-081 test or compare per-carrier structures. RS082 explicitly strengthens the objective to one shared GF(2) scalar functional on pooled dependencies and limits a negative to that map. Formally, forall g exists ell_g does not imply exists ell forall g; success on three geometries still does not establish a universal closed law.'},
    {topic:'Observational quotient versus linear factorization',refs:['PARTITION_COMMON_LIB','LINEAR_COMMON_LIB','NATIVE_COMMON','NATIVE_DOMAIN'],assessment:'An equality-generated partition on a finite triangle catalog, a quotient of a linear dependency space, and a quotient of whole board observations are different objects. The union-find common coarsening is domain-relative; kernel-sum linear construction is a vector-space operation. Synthetic domain extension can change paths and ranks without falsifying a realizable-domain claim.'},
    {topic:'Owner and endpoint gauges',refs:['OWNER_COHERENCE','ENDPOINT_GAUGE'],assessment:'The later notes explicitly distinguish formal owner flips of already oriented records, vertex-level owner swap followed by reorientation, and game-player relabeling. Endpoint recodings can require reconstruction from source vertices and need not factor through an earlier compressed carrier. These are appropriate distinctions.'},
    {topic:'Parity characters versus outcome meaning',refs:['RS060','SIGN_CORRELATION','RELATION_LIB'],assessment:'P and O are presence and multiplicity-parity coordinates; OaObOc is a Boolean product, not an outcome character. GF(2) output characters depend on the chosen L/D/W code basis. A dependency XOR target is not a pointwise board-value formula. A preserved one-dimensional output character alone does not supply the full scalar law.'},
    {topic:'Counterexample versus representation-relative obstruction / RS095',refs:['RELATION_CIRCUIT','RELATION_LIB','RS082'],assessment:'The four symmetric Boolean functions 1,e1,e2,e3 span the functions of three Boolean inputs invariant under permutation. RS095 tests an additive direct sum with marginal one-hot features; failure excludes that additive linear dependency descent, not arbitrary nonlinear dependence on the joint marginal/circuit label. Its note explicitly preserves this distinction and separate positive/negative encodings. A kernel certificate is a decisive obstruction to its declared representation and assembly, not a general game-law impossibility.'}
  ],
  protocolSpecDisposition:{upstreamCategoryMistakeEstablished:false,applicationViolations:['DPAPP-01','DPAPP-02','DPAPP-03'],
    notAFrameworkRefutation:'The current qualified protocol explicitly requires unchanged input/scope/obligations before sufficient-support removal, separates support from semantic identity, limits minimum claims to declared coverage and order, and separates adaptive discovery from independent qualification. The reviewed failures apply those rules incorrectly or supply a vacuous downstream falsifier; they do not follow from the rules.',
    independentOtherAudits:'Core semantic-conservation and CLOSED_PRIMITIVE body reconstruction are handled by the parent/parallel audits; this file does not assert an independent reconstruction of that separate corpus.'},
  validation:{executed:['Exact qualified DP0.9/0.10 hashes match ledger','Every listed source and anchor resolved at immutable revision','Simultaneous sign orbits differ','Pointwise fold and actual ORI_COUNTS merge the abstract inputs','Equality-of-sign invariant is reflection invariant and separates inputs','Actual EXACT_ORIENTATION_PROVENANCE preserves the distinction'],noBoardComputation:true},
  sources
};
writeFileSync(path.join(here,'DISCOVERY_PROTOCOL_AUDIT_0_1.json'),JSON.stringify(artifact,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',sourceCount:sources.length,findings:artifact.findings.map(x=>({id:x.id,status:x.status})),countermodel:artifact.countermodel,boardComputations:0}));
