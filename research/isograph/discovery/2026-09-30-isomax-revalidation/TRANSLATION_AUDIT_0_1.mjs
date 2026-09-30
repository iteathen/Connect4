// Read-only source audit; the only write is the sibling TRANSLATION_AUDIT_0_1.json.
// Semantic judgments below are human review annotations, not a Core theorem checker.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const late = 'research/isograph/discovery/2026-09-29-isomax-late-xor-components/';
const rev = 'research/isograph/discovery/2026-09-30-isomax-revalidation/';
const opt = 'research/isograph/optimization/';
const paths = {
  native: late+'ISOGRAPH_FULL_DECOMPOSITION_0_1.isg',
  vocab: late+'ISOGRAPH_FULL_DECOMPOSITION_VOCAB_0_1.json',
  json: late+'ISOGRAPH_FULL_DECOMPOSITION_0_1.json',
  prose: late+'ISOGRAPH_FULL_DECOMPOSITION_0_1.md',
  identities: late+'ISOGRAPH_FULL_DECOMPOSITION_IDENTITY_CHECK_0_1.json',
  control: rev+'REVALIDATION_CONTROL_0_1.json',
  lineage: rev+'LINEAGE_RS065_RS077.md',
  errata: rev+'SEMANTIC_ERRATA_0_1.md',
  hotAuthority: opt+'ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md',
  hotProse: opt+'ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.md',
  hotJson: opt+'ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.json',
  hotNative: opt+'ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.isg',
  hotQualification: opt+'ISOMAX_HOT_LOOP_GRAPH_0_3_QUALIFICATION.md',
  coreProse: opt+'ISOMAX_CORE020_PRIMITIVE_SEMANTICS_0_1.md',
  coreNative: opt+'ISOMAX_CORE020_PRIMITIVE_GAME_0_1.isg',
  coreManifest: 'research/isograph/discovery/2026-09-29-isomax-core020-ia-closure/SOURCE_MANIFEST_STRICT_0_2.json',
};
const raw = Object.fromEntries(Object.entries(paths).map(([k,p]) => [k,fs.readFileSync(path.join(root,p))]));
const texts = Object.fromEntries(Object.entries(raw).map(([k,b]) => [k,b.toString('utf8').replace(/\r\n/g,'\n')]));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
// Do not silently reapply semantic annotations to a revised graph or companion.
const reviewedPins={native:'aaa43467d4d1135035edcd9a444306fc801ec497f0040ff1a91537903e0f9e12',vocab:'e8a2a219d82919360269aabb8aa1c3e38827a0129fa843f2acd09ec2905eb7ef',json:'c24ca08d6b96851ee8cf526dc37410995cb94392c5a19160a0e4012a08022516',prose:'468d57627f9bd6fb659a6fe7a183988707fb49ff41a4632fe007d08c572c20ce',identities:'cabae1dedc21e102836d3ae4c23aa36d698f76420778f6abd3124ba659f06043'};
for(const [key,pin] of Object.entries(reviewedPins))assert.equal(sha(texts[key]),pin,`re-review changed ${key}`);
const ref = (key,line) => ({path:paths[key],line});
const anchor = (key,needle) => { const lines=texts[key].split('\n'); const n=lines.findIndex(x=>x.includes(needle)); assert.ok(n>=0,`missing ${key} anchor ${needle}`); return {...ref(key,n+1),text:lines[n]}; };
const vocab = JSON.parse(texts.vocab), companion = JSON.parse(texts.json), identity = JSON.parse(texts.identities);
const nodes = Object.entries(vocab.nodes).map(([id,name])=>({id:Number(id),name}));
const types = ['position','residual_state','projected_state','tactical_classifier','component_family','incidence_coordinate','phase_coordinate','descriptor','multiplicity_map','count_coordinate','presence_coordinate','oddness_coordinate','monoid','parity_observable','signature','feature_realization','feature_realization','feature_realization','quotient_feature_space','scalar_value','geometry_context','theorem_target','holdout_policy',...Array(8).fill('open_question'),'height_parity_observable','row_parity_observable','basis_motif_clue','basis_motif_clue','value_equivalence_scope','action_equivalence_scope','proof_equivalence_scope','decoder_candidate'];
assert.equal(types.length,nodes.length);
nodes.forEach((n,i)=>n.reviewType=types[i]);
const typeOf = id => nodes.find(n=>n.id===id).reviewType;
const edges=[];
texts.native.split('\n').forEach((line,i)=>{const m=line.match(/^\s*\(\^(9989\d\d) (998\d{3}) (998\d{3})\)\s*$/); if(m)edges.push({id:`TRANSLATION-E${String(edges.length+1).padStart(3,'0')}`,line:i+1,tuple:m[0].trim(),relationId:Number(m[1]),sourceId:Number(m[2]),targetId:Number(m[3])});});
const expectedLines=[10,11,12,13,14,15,16,17,18,19,20,21,24,25,26,27,30,31,32,33,34,35,36,39,40,41,42,43,44,45,46,49,50,51,52,55,56,57,60,61,62,63,64,65,66,67,70,71,72,73,74,77,78,79,80,81,82,86,87,88,89];
assert.deepEqual(edges.map(e=>e.line),expectedLines,'source changed: re-review edge census');
assert.equal(nodes.length,39); assert.equal(Object.keys(vocab.relations).length,16);
for(const e of edges){assert.ok(vocab.relations[e.relationId]); assert.ok(vocab.nodes[e.sourceId]); assert.ok(vocab.nodes[e.targetId]); e.relation=vocab.relations[e.relationId]; e.source=vocab.nodes[e.sourceId];e.target=vocab.nodes[e.targetId];e.sourceType=typeOf(e.sourceId);e.targetType=typeOf(e.targetId);}
const findings=[];
function finding(id,severity,title,lines,sourceMeaning,intended,impact,recommendation,evidence){
  findings.push({id:`TRANSLATION-F${String(id).padStart(3,'0')}`,severity,title,nativeReferences:edges.filter(e=>lines.includes(e.line)).map(e=>({...ref('native',e.line),edgeId:e.id,tuple:e.tuple})),sourceMeaning,likelyIntendedRelation:intended,downstreamImpact:impact,correctionRecommendation:recommendation,evidence});
}
finding(1,'P2','Rank parity does not supply scalar W/D/L',[36],
  'IA-07 reconstructs rank parity and hence side-to-move parity. The companions contain no absolute WDL input or derivation converting it to relative WDL at this edge.',
  'Possibly absolute-to-relative outcome gauge conversion, requiring a separately supplied absolute outcome and mover parity; otherwise delete this derivation.',
  'A consumer following deductively_derives can incorrectly read a closed scalar formula into a parity identity. This does not invalidate that identity or the separately computed scalar evidence.',
  'Keep the historical artifact; in a successor introduce an explicit conversion operation with both premises, or route parity to side-to-move only.',
  [ref('prose',380),ref('prose',424),ref('json',181),ref('identities',43)]);
finding(2,'P2','T2 and signature dependency arrows are reversed',[20,21],
  'T2 classification and the structural signature are inputs to the piecewise relative-value evaluation. The later center-opening depends_on edges establish the ordinary dependent-to-prerequisite direction.',
  'Value evaluation depends on T2; its T2-O branch depends on a signature and a qualified decoder.',
  'The present arrows suggest outcome-dependent construction of the classifier/signature, obscuring the structural/scalar boundary.',
  'Reverse these dependencies and represent the tactical branches plus decoder qualification explicitly; do not imply the signature alone deductively computes WDL.',
  [ref('prose',32),ref('prose',108),ref('json',34),ref('native',80)]);
finding(3,'P3','decomposes_to is used backwards for descriptor construction',[15,16],
  'REL_INC and role-attached phase jointly form a descriptor under the same local column canonicalization; neither is a whole decomposing into that descriptor.',
  'Jointly constructs(REL_INC, rolePhase, descriptor), or descriptor decomposes into its two jointly aligned coordinates.',
  'Inconsistent part/whole direction can turn a conjunction into two independent descriptor reconstructions.',
  'Use a construction node with both inputs and common role alignment, or reverse these part edges.',
  [ref('prose',155),ref('json',89),ref('native',13)]);
finding(4,'P2','Row-parity derivations drop their joint premises',[25,26],
  'rowmod2 = Hmod2 XOR kappa_c XOR dmod2 for a particular represented cell; REL_INC and its aligned phase are jointly needed, given H.',
  'A contextual joint derivation from H, the cell depth in REL_INC, and that same role phase.',
  'Read independently, each unary edge asserts sufficiency not supplied by the formula.',
  'Represent the full premise tuple and cell/role association; preserve the true companion identity.',
  [ref('prose',222),ref('prose',233),ref('json',156),ref('identities',39)]);
finding(5,'P3','DTS invariant self-loop omits the transition and survivor guard',[27],
  'Only the same surviving physical cell in the moved column has depth and phase toggled together. This is not closure of the whole projected signature under a move.',
  'Preservation along the guarded move relation for a transported cell.',
  'An unguarded self-loop can be mistaken for transition congruence, while QU_signature_transition_closure is explicitly open.',
  'Attach the transition, moved role and survivor identity; retain the separate open closure question.',
  [ref('prose',250),ref('prose',260),ref('prose',639),ref('native',62)]);
finding(6,'P2','Rank reconstruction and 7x6 edges omit state/context and mix types',[34,35,77,78],
  'Rank parity follows from WHmod2 and the XOR of every descriptor phase checksum weighted by multiplicity oddness. W=7,H=6 simplifies constants; it is not equivalent to a phase coordinate and does not determine a position parity alone.',
  'A rule specialization followed by evaluation on the whole descriptor-count state, with complete column accounting.',
  'Singleton descriptor, unlabelled ZOE count, or geometry context may otherwise appear sufficient to reconstruct rank parity.',
  'Distinguish descriptor types from whole-state maps, expose geometry/checksum/multiplicity premises, and replace specialization-equivalence with specializes_rule.',
  [ref('prose',380),ref('prose',394),ref('prose',410),ref('prose',938),ref('json',181)]);
finding(7,'P3','OOO candidate dependency hides retained lower-degree presence terms',[88],
  'RS061 uses complete affine and degree-two P/O plus all OOO cubic triples. Only the cubic correction omits presence.',
  'The cubic correction depends on oddness, while the complete candidate also includes the full lower-degree P/O span.',
  'Calling the entire decoder oddness-only can silently remove necessary lower-degree information or change the hypothesis under test.',
  'Split the candidate into lower-degree carrier and OOO correction, and preserve the bounded empirical relation rather than upgrading it to deduction.',
  [ref('prose',1024),ref('prose',1051),ref('json',497)]);
finding(8,'P3','Topology vocabulary is not primitive semantic proof closure',[],
  'The native file lists named binary links. Predicate meanings, conjunctions, carrier scopes, operational maps and proof witnesses reside in external prose/vocabulary; 16 predicate IDs are not listed in its local ^0 node declaration.',
  'A research topology index into companion evidence, not a label-erased primitive derivation of all named claims.',
  'Native serialization, bracket balance and vocabulary resolution alone cannot certify truth, Core typing, NEI identity, IA closure or DP minimality.',
  'Label this layer topology throughout; a primitive successor needs explicit carrier definitions, maps, guarded quantification and proof support. External predicate declarations are a coverage fact, not a demonstrated grammar violation.',
  [anchor('vocab','RESEARCH_TOPOLOGY'),ref('native',2),ref('coreProse',14),ref('coreProse',646)]);
finding(9,'P3','NEI SAME wording overstates scoped representation equivalence',[],
  'Late prose under NEI identity discipline calls invertible recodings SAME for representation-content questions, without an NEI query/evidence model or native NEI judgment. Hot-loop0.3 explicitly separates exact representation equivalence from NEI SAME.',
  'Scoped exact recoding given its parameters, not an admitted NEI SAME result.',
  'Readers may carry a representation bijection into physical-event, action or proof identity without the required scope.',
  'Use scoped_recoding/equivalence terminology unless a separate admissible NEI query is supplied. No native NEI claim is present to invalidate.',
  [ref('prose',580),ref('prose',590),ref('hotProse',13),ref('hotProse',153)]);
finding(10,'INFO','Historical graph stops at RS061 and is not the current campaign graph',[],
  'The last native candidate and JSON postDecompositionEvidence record RS061. Later RS065-RS095 quotient searches and revalidation do not appear as native edges here. Historical fresh-case language must not become present independent qualification.',
  'A preserved research checkpoint with links to subsequent evidence and its present scope reset.',
  'Calling this the full current graph can conceal the lineage, training-data status and difference between geometry-parameterized laws and a geometry-blind pooled functional.',
  'Retain the source snapshot and add an explicit as-of/successor coverage index; do not overwrite it or infer that old QU labels reflect every later resolution.',
  [ref('prose',1020),anchor('control','geometryParameterizedDecoder'),anchor('control','Provisional oracle-motivated'),ref('lineage',7)]);
finding(11,'P3','RFG companion prose names the wrong owner for F', [11],
  'The decomposition prose says F applies to the mover family. The separately recorded semantic erratum says the post-R absorption rule removes opponent residuals containing all nonwinning legal frontier cells.',
  'The same pipeline topology with the corrected opponent-family definition of F.',
  'A reconstruction from the prose alone can implement a different projection. This audit cites the recorded erratum, not a new independent code or board verification.',
  'Cross-link the preserved graph to the erratum and use its corrected owner semantics in any successor.',
  [ref('prose',96),anchor('errata','F removes opponent')]);
const certainty={
  1:['confirmed_overstrong_translation','The native predicate is explicit; the proposed conversion intent is uncertain. No claim here that an admitted Core theorem has been refuted.'],
  2:['confirmed_direction_inconsistency','Judgment uses depends_on orientation in the same file and the structural pipeline semantics.'],
  3:['confirmed_relation_label_inconsistency','Whole-to-part versus part-to-whole usage in the same file.'],
  4:['confirmed_missing_premises_under_literal_reading','Companion formula is correct; a topology reader might supply the conjunction implicitly, but it is absent natively.'],
  5:['confirmed_missing_guard','The companion supplies the missing guard; no claim that the guarded identity is false.'],
  6:['confirmed_missing_context_and_type_mismatch','If nodes stand for contextual rules rather than values some omissions are shorthand, but the native vocabulary does not encode that distinction.'],
  7:['confirmed_omitted_dependency_not_false_bounded_result','depends_on need not be an exhaustive list; the risk is interpreting the named whole candidate as wholly oddness-only.'],
  8:['confirmed_representation_limit','Not a Core syntax rejection or a certification failure of another artifact.'],
  9:['terminology_ambiguity','SAME may be informal scoped-equivalence language. No native NEI admission is asserted.'],
  10:['confirmed_snapshot_scope','Historical claims remain historical, not disproven by later research.'],
  11:['confirmed_companion_erratum','Already recorded by another bounded audit; underlying implementation not independently inspected in this audit.'],
};
for(const f of findings){const [classification,qualification]=certainty[Number(f.id.slice(-3))];f.certainty={classification,qualification};}

const review = new Map();
function annotate(lines,assessment,note,evidence=[]){for(const line of lines){assert.ok(!review.has(line));review.set(line,{assessment,note,evidence});}}
annotate([10],'consistent_topology','Normalization pipeline link; exact state semantics remain in the authority/companion, not in this edge.',[ref('prose',72)]);
annotate([11],'companion_erratum','RFG pipeline retained, but F owner wording requires the recorded erratum.',[ref('prose',90)]);
annotate([12,13,14],'consistent_topology','Component extraction and coordinate projections; role phase uses support/geometry context. These are structural summaries, not scalar claims.',[ref('prose',128)]);
annotate([15,16],'direction_or_type_mismatch','Part-to-whole construction is labelled decomposes_to; joint canonicalization is omitted.',[ref('json',89)]);
annotate([17],'context_required','Multiplicity is counted over the entire component family, not obtained from one descriptor occurrence.',[ref('prose',394)]);
annotate([18],'consistent_topology','Apply the Z/O/E multiplicity quotient per descriptor; preserve descriptor labels.',[ref('prose',282)]);
annotate([19],'context_required','Signature is the entire labelled count map, not one bare ZOE symbol; tactical scope remains separate.',[ref('json',34)]);
annotate([20,21],'reversed_dependency','The value evaluation depends on the structural inputs, with branch/decoder qualification.',[ref('native',80)]);
annotate([24],'context_required','Exact parity recoding given H; not an unparameterized equality and not a NEI judgment.',[ref('prose',210)]);
annotate([25,26],'missing_joint_premises','Needs aligned relative depth and phase jointly, given H and a represented cell.',[ref('prose',233)]);
annotate([27],'missing_transition_guard','Guarded surviving-cell invariant; no full signature transition congruence.',[ref('prose',260)]);
annotate([30,31],'consistent_topology','Presence and oddness coordinates jointly encode the three valid ZOE states.',[ref('prose',282)]);
annotate([32,33],'context_required','P composes by OR and O by XOR jointly in the valid-state monoid. Neither coordinate separately reconstructs the whole monoid.',[ref('identities',41)]);
annotate([34,35],'missing_joint_premises','Needs whole labelled multiplicity state, descriptor checksums, geometry parity and complete column accounting.',[ref('prose',410)]);
annotate([36],'unsupported_derivation','Parity/mover alone does not derive scalar outcome; no absolute-outcome premise supplied.',[ref('prose',424)]);
annotate([39,40,41],'context_required','These are candidate feature/function families over the signature; decoder_realization_of is not a success claim. Affine/D2 failures and cubic bounded evidence are separate edges.',[ref('prose',739)]);
annotate([42],'context_required','Outcome-independent quotient of cubic features modulo lower degree on a fixed carrier; not an outcome-independent scalar decoder.',[ref('prose',540)]);
annotate([43,44],'consistent_bounded_claim','Insufficiency for the declared hard discovery targets, not every carrier and not universal impossibility.',[ref('prose',739)]);
annotate([45,46],'consistent_bounded_claim','Bounded Q-V existence/factorization evidence on declared finite carriers; no closed decoder or general theorem follows.',[ref('prose',778)]);
annotate([49,50],'context_required','Motif histogram of the selected deterministic quotient basis on the observed corpus. Basis dependence precludes interpreting it as a universal invariant.',[ref('prose',548)]);
annotate([51,52],'consistent_scope_warning','Scope-guard label warns that motif clues do not themselves compute WDL; its actual condition is supplied only by companions.',[ref('prose',548)]);
annotate([55],'consistent_bounded_claim','The bounded repaired-coordinate Q-V statement is supported on tested scopes, not all geometries.',[ref('prose',592)]);
annotate([56,57],'consistent_scope_warning','Q-V does not establish action/future or proof identity.',[ref('json',293)]);
annotate([60,61,62,63,64,65,66,67],'consistent_open_question','An explicitly open historical question concerning the target coordinate/theorem; no truth or closure assertion.',[ref('prose',862)]);
annotate([70,71],'consistent_scope_warning','Sealed formula-holdout boundary is a research policy, not a mathematical implication. Only warrant labels were inspected.',[ref('json',26)]);
annotate([72,73,74],'consistent_topology','Research routing from an unresolved question to decoder discovery; not proof dependency or experimental result.',[ref('prose',898)]);
annotate([77,78],'direction_or_type_mismatch','Specialization of parity identities has been encoded as geometry-to-coordinate equivalence/derivation; actual state input is missing.',[ref('prose',938)]);
annotate([79,80,81,82],'consistent_open_question','Necessary research prerequisites for the center-opening target, not a jointly sufficient proof. A center-opening argument is explicitly absent.',[ref('prose',966)]);
annotate([86],'context_required','Candidate decoder family on the signature includes complete lower-degree P/O plus all OOO; the name alone omits that split.',[ref('prose',1024)]);
annotate([87],'consistent_bounded_claim','RS061 is bounded discovery evidence and explicitly not independent qualification or a final formula.',[ref('prose',1055)]);
annotate([88],'missing_lower_degree_context','Only the highest-degree correction is oddness-only; presence remains in the lower-degree span.',[ref('prose',1051)]);
annotate([89],'consistent_bounded_claim','OOO restriction substitutes for the full cubic family for scalar decoding on the stated discovery carriers, not structural equality of feature spaces.',[ref('prose',1051)]);
assert.equal(review.size,61);
for(const e of edges){assert.ok(review.has(e.line));Object.assign(e,review.get(e.line));e.findingIds=findings.filter(f=>f.nativeReferences.some(r=>r.line===e.line)).map(f=>f.id);e.typeCheck={vocabularyResolved:true,sourceType:e.sourceType,targetType:e.targetType,formalCoreTypeCheck:'NOT_PERFORMED',semanticJudgment:e.assessment};}

const decl=texts.native.slice(texts.native.indexOf('(^0'),texts.native.indexOf('])')+2);
const declared=[...decl.matchAll(/\^(998\d{3})/g)].map(m=>Number(m[1]));
assert.equal(new Set(declared).size,39);
let stack=[];for(const c of texts.native){if(c==='['||c==='(')stack.push(c);else if(c===']'||c===')'){assert.equal(stack.pop(),c===']'?'[':'(');}}assert.equal(stack.length,0);
assert.equal(companion.postDecompositionEvidence.warrant,'EW-RS-061');
assert.equal(identity.status,'PASS'); assert.equal(identity.solvedOutcomesRead,false);
const sourceManifest=Object.entries(paths).map(([key,p])=>({key,path:p,bytes:raw[key].length,rawSha256:sha(raw[key]),utf8LfSha256:sha(texts[key]),reviewCoverage:['native','vocab','json','prose','identities','control','lineage','errata','hotAuthority','hotProse','coreProse','coreManifest','hotNative'].includes(key)?'full_text_review':key==='hotQualification'?'bounded qualification/closure/provenance sections':key==='hotJson'?'metadata and representation category comparison':'sampled native primitive clauses; whole file hashed, not fully proof-checked'}));
const report={
  schema:'connect4.isomax.translation_audit.v1',dateAuthorLocal:'2026-09-30',status:'COMPLETE_BOUNDED_TRANSLATION_REVIEW_WITH_FINDINGS',authorityEffect:'none',owner:'research/semantic-quotient',
  auditNature:'Every edge in late decomposition 0.1 is individually assessed against its vocabulary and companions. Mechanical checks verify census/reference integrity only; semantic annotations are reviewer judgments.',
  sourceManifest,
  mechanicalChecks:{nativeEdgeCount:edges.length,nodeCount:nodes.length,vocabularyRelationCount:Object.keys(vocab.relations).length,distinctUsedRelationCount:new Set(edges.map(e=>e.relationId)).size,allEndpointsResolve:true,allPredicatesResolveInExternalVocabulary:true,allEdgesReviewedExactlyOnce:true,balancedBracketsAndParentheses:true,localDeclaredNodeCount:declared.length,predicateIdsAbsentFromLocalNodeDeclaration:Object.keys(vocab.relations).map(Number).filter(id=>!declared.includes(id)),formalParserOrCoreTypeCheckerRun:false,assertedNativeDeductionCount:edges.filter(e=>e.relationId===998902).length},
  nodes,relationCensus:Object.entries(vocab.relations).map(([id,name])=>({id:Number(id),name,count:edges.filter(e=>e.relationId===Number(id)).length,edgeIds:edges.filter(e=>e.relationId===Number(id)).map(e=>e.id),semantics:'Externally named topology relation; semantic domain/range judgments recorded per edge, not an authoritative Core predicate signature.'})),nativeEdges:edges,findings,
  companionIdentityCheck:{recordedStatus:identity.status,recordedChecks:identity.checks,recordedScopeGuard:identity.scopeGuard,auditTreatment:'Read the exact companion record; did not rerun identity tests or board enumeration. These identities do not verify parity-to-WDL or every native edge.'},
  representationContrast:{
    late:{status:vocab.status,declaredStack:companion.authority.isograph_stack,sourcePins:companion.sourcePins,meaning:'Research topology with external labels and companion premises; neither native proof closure nor game-theory authority.'},
    hotLoop03:{metadata:JSON.parse(texts.hotJson).nei_dependency,meaning:'Qualified performance-research graph uses scoped exact representation equivalence; it explicitly disclaims generic NEI SAME and requires reflection action transport. Its qualification must not be inherited by the late graph.',references:[ref('hotProse',13),ref('hotProse',153),ref('hotProse',275)]},
    core020:{sourceManifest:JSON.parse(texts.coreManifest),meaning:'Separate primitive-candidate representation embeds quantified definitions, carriers, transition/value recursion and rank measure. Its admitted source versions and qualification burden differ from the late topology label. This audit does not certify those primitive clauses or infer Core0.21 compatibility.',references:[ref('coreProse',8),ref('coreProse',14),ref('coreProse',38),ref('coreProse',646)]}
  },
  answers:{geometryBlindLawAssertedByCompanions:false,universalOOOLawEstablished:false,absoluteWdlPremiseSuppliedForParityEdge:false,fullNativePrimitiveProofClosure:false,empiricalOOOEdgeIsBounded:true,transitionClosureStillOpenInSnapshot:true,latestNativeEvidence:'EW-RS-061',currentGeometryDistinction:JSON.parse(texts.control).scope,requiresSuccessorCorrection:true,historicalEvidenceInvalidatedByThisAudit:false},
  limitations:['No board solving, scalar replay, sealed outcome access or inference. Only source text, existing summary records and warrant labels read.','No whole historic-package review, no independent replay of empirical ranks, no formal Core parser/type checker or theorem prover.','Source hashes attest exact reviewed text, not that cited Git pins resolve to the same underlying evidence; deep pin-chain qualification is outside this bounded audit.','IA process and Discovery Protocol audits are owned separately. No finding here declares native IA roots211044/211052 invalid or adjudicates SC057.','The native graph has no explicit NEI SAME predicate; the finding concerns companion terminology.','F owner correction is cross-checked against the existing semantic erratum, not independently re-proved here.','No original source, qualified authority, historical evidence or unknown ledger is changed.'],
  reproduction:{command:'node research/isograph/discovery/2026-09-30-isomax-revalidation/TRANSLATION_AUDIT_0_1.mjs',writes:[rev+'TRANSLATION_AUDIT_0_1.json'],generatorUtf8LfSha256:sha(fs.readFileSync(fileURLToPath(import.meta.url),'utf8').replace(/\r\n/g,'\n')),sourceHashConvention:'Both raw bytes and UTF-8 with CRLF converted to LF; no other whitespace normalization.'}
};
fs.writeFileSync(path.join(here,'TRANSLATION_AUDIT_0_1.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,edges:edges.length,findings:findings.length,sourceFiles:sourceManifest.length,output:rev+'TRANSLATION_AUDIT_0_1.json'}));
