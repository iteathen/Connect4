// FROZEN independent true original standard7x6 FIRST-WIN PHYSICAL
// falsifier of ONE fixed horizontal q reflection automorphism and
// generic action weak WDL order via ONE reflected post-action support.
// NO future game Q/value queries in source. Physical recursive minimax
// ONLY after source-first produced exact weak action WDL order claims.
// Preserve canonical 44444 exact mirror classes without root value.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createOriginalSourceFixedReflectionWdlOrder} from './standard7x6-original-source-fixed-reflection-WDL-order.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 geom={width:W,height:H,connect:K},
 qcore=createExactQCore(geom),source=createOriginalSourceFixedReflectionWdlOrder(geom);
const byCell=Array.from({length:N},()=>[]);let lines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let m=0n,ids=[];
  for(let j=0;j<K;j++){let id=(r+j*dy)*W+c+j*dx;ids.push(id);m|=bit(c+j*dx,r+j*dy);}
  for(const id of ids)byCell[id].push(m);lines++;
 }
if(lines!==69||qcore.lineCount!==69)throw Error('incorrect original Connect4 winline count');
const blank=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,history:'',term:null});
const legal=s=>s.h.flatMap((h,c)=>h<H?[c]:[]);
function step(s,c){
 if(s.term!==null||c<0||c>=W||s.h[c]>=H)throw Error('not legal first-win stopped gravity');
 const p=s.n&1,row=s.h[c],id=row*W+c,h=s.h.slice(),P=s.P.slice();
 h[c]++;P[p]|=bit(c,row);
 const win=byCell[id].some(G=>(G&P[p])===G);
 return {h,P,n:s.n+1,history:s.history+String(c+1),
  term:win?(p===0?1:-1):s.n+1===N?0:null};
}
let seed=0x17AB22C7>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const refMemo=new Map();const stats={
 schema:'connect4.true7x6.fixed_original_q_reflection_full_game_symmetry_and_WDL_edges_v0_1',
 date:'2026-10-17',board:{W,H,K,originalKLines:69},startingSeed:seed,
 deterministicNonwinningRealPhysicalTrajectories:0,
 genuineRealPhysicalSourcesSeen:0,sourceOriginalQChecked:0,
 originalQReflectionAutomorphismProved:0,
 originalFullMirrorEquivalentLabelPairsProved:0,
 sourceDirectGlobalReflectionWeakWdlEdges:0,
 sourceGenericReflectedPostActionSupportCompatibleComparisons:0,
 sourceRawGeneratorSubsetTests:0,
 sourceFullColumnPermutationCandidateEnumerations:0,
 sourceOriginalGameValuesStrategicallyQueried:0,
 sourceRootBestSelectionWithoutScalar:0,
 originalMirrorSourceQComparedToReflectedPhysicalQ:0,
 badOriginalReflectionSourceQConjugacy:0,
 independentOriginalPhysicalWdlWeakEdgesChecked:0,
 independentRootBestWdlChecks:0,
 independentPhysicalAllLegalActionValuesCalculated:0,
 independentRecursiveCalls:0,independentRecursiveDistinctStates:0,
 physicallyIncorrectReflectedWeakEdges:0,
 physicallyWrongReflectionRootBestActions:0,
 sourceCanonical44444:null,
 firstAsymmetricSourceWeakWdlEdge:null,
 physicalRootBestExamples:[],
 status:'UNRUN',endingSeed:null
};
function key(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function wdl(s){
 stats.independentRecursiveCalls++;
 if(s.term!==null)return s.term;
 const k=key(s);if(refMemo.has(k))return refMemo.get(k);
 stats.independentRecursiveDistinctStates++;
 let x=(s.n&1)?1:-1;
 for(const c of legal(s)){
  const y=wdl(step(s,c));x=(s.n&1)?Math.min(x,y):Math.max(x,y);
 }
 refMemo.set(k,x);return x;
}
const seen=new Set();
function check(s,frozen=false){
 if(s.term!==null||s.n>=N)throw Error('not original nonterminal source');
 stats.genuineRealPhysicalSourcesSeen++;
 if(!frozen&&(s.n<30||legal(s).length<2))return;
 const k=key(s);if(seen.has(k))return;seen.add(k);
 const q=qcore.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const res=source.compute(q,{maxStaticSubsetTests:130000});
 stats.sourceOriginalQChecked++;
 stats.originalQReflectionAutomorphismProved+=
  Number(res.originalSourceFullMirrorAutomorphismProved);
 stats.originalFullMirrorEquivalentLabelPairsProved+=
  res.statistics.mirrorRelatedCurrentFirstActionTiesProved;
 stats.sourceDirectGlobalReflectionWeakWdlEdges+=
  res.statistics.directWeakP0WDLInequalities;
 stats.sourceGenericReflectedPostActionSupportCompatibleComparisons+=
  res.statistics.postActionMirrorSupportEqualPairsCompared;
 stats.sourceRawGeneratorSubsetTests+=res.statistics.originalQRawGeneratorSubsetTests;
 stats.sourceFullColumnPermutationCandidateEnumerations+=
  res.statistics.staticCompletedColumnPermutationCandidatesEnumerated;
 stats.sourceOriginalGameValuesStrategicallyQueried+=
  res.statistics.independentlyValuedAlternativeStrategicGameOutcomes;
 if(frozen&&s.history==='44444'){
  stats.sourceCanonical44444={
   status:res.status,fullOriginalQMirror:res.originalSourceFullMirrorAutomorphismProved,
   exactOriginalLegalActionEquivalenceClasses:res.sourceProvedActionWdlEqualityClasses,
   certifiedWeakOrderOriginalLiteralEdges:res.sourceP0WdlWeakOrderEdges.map(z=>
    [z.lowerP0ValueOriginalLiteralAction,z.upperP0ValueOriginalLiteralAction]),
   sourceOrdinaryRootWdl:res.numericalRootWDL??null,
   sourceSelectedBestMove:res.selectedOriginalLiteralBestColumn??null
  };
 }
 if(res.originalSourceFullMirrorAutomorphismProved){
  // Independent physical reflection: take literal current-history
  // and reflect EACH original move's column. Rebuild from blank
  // preserving physical gravity and first winner; verify NORMALIZED
  // source q is indeed EXACTLY the same when automorphism claimed.
  const mirrored=s.history.split('').map(ch=>String(W+1-Number(ch))).join('');
  let world=blank();
  for(const ch of mirrored){
   world=step(world,Number(ch)-1);
   if(world.term!==null)throw Error('mirrored physical history terminated earlier than original');
  }
  const qmirror=qcore.fromPhysical({h:world.h,p0:world.P[0],p1:world.P[1]});
  stats.originalMirrorSourceQComparedToReflectedPhysicalQ++;
  if(qcore.key(qmirror)!==qcore.key(q)){
   stats.badOriginalReflectionSourceQConjugacy++;
   throw Error('source claimed full reflection q automorphism but independent physical mirrored game yielded unequal q');
  }
 }
 if(res.status==='VALID_CONTINUATION')stats.sourceRootBestSelectionWithoutScalar++;
 if(s.n>=35&&(stats.independentOriginalPhysicalWdlWeakEdgesChecked<1050||
    (res.status==='VALID_CONTINUATION'&&stats.independentRootBestWdlChecks<150))&&
   res.sourceP0WdlWeakOrderEdges.length){
  const all=legal(s).map(c=>[c+1,wdl(step(s,c))]);
  const map=new Map(all);
  stats.independentPhysicalAllLegalActionValuesCalculated+=all.length;
  for(const e of res.sourceP0WdlWeakOrderEdges){
   stats.independentOriginalPhysicalWdlWeakEdgesChecked++;
   if(map.get(e.lowerP0ValueOriginalLiteralAction)>
      map.get(e.upperP0ValueOriginalLiteralAction)){
    stats.physicallyIncorrectReflectedWeakEdges++;
    throw Error('fixed source mirror weak WDL inequality false physically '+JSON.stringify({
     history:s.history,all,edge:e}));
   }
   if(e.kind==='FIXED_GLOBAL_REFLECTION_RAW_ORIGINAL_Q_P0_WEAK_WDL_TRANSPORT'&&
       !stats.firstAsymmetricSourceWeakWdlEdge)
    stats.firstAsymmetricSourceWeakWdlEdge={history:s.history,ply:s.n,
     edge:[e.lowerP0ValueOriginalLiteralAction,e.upperP0ValueOriginalLiteralAction],
     actionValues:all};
  }
  if(res.status==='VALID_CONTINUATION'){
   const p=s.n&1,root=p===0?Math.max(...all.map(z=>z[1])):Math.min(...all.map(z=>z[1]));
   stats.independentRootBestWdlChecks++;
   if(map.get(res.selectedOriginalLiteralBestColumn)!==root){
    stats.physicallyWrongReflectionRootBestActions++;
    throw Error('fixed mirror source extremum not actual WDL best original action');
   }
   if(stats.physicalRootBestExamples.length<16)
    stats.physicalRootBestExamples.push({history:s.history,ply:s.n,
     mover:p,bestOriginalLiteral:res.selectedOriginalLiteralBestColumn,
     physicalWDL:root,allPhysicalOriginalActionValues:all,
     sourceSymmetry:res.originalSourceFullMirrorAutomorphismProved});
  }
 }
}
for(const history of ['','4','44','444','4444','44444','444444',
 '475234143513367623351115664414672762']){
 let s=blank();for(const ch of history)s=step(s,Number(ch)-1);
 if(s.term!==null)throw Error('frozen original history already first win terminal');
 check(s,true);
}
for(let game=0;game<2600;game++){
 stats.deterministicNonwinningRealPhysicalTrajectories++;
 let s=blank();
 while(s.term===null){
  check(s);
  const options=legal(s).map(c=>step(s,c)).filter(z=>z.term===null);
  if(!options.length)break;
  s=options[rand()%options.length];
 }
}
stats.endingSeed=seed;
stats.status='PASS_SAMPLED_ORIGINAL7X6_FIXED_REFLECTION_Q_SYMMETRY_AND_PHYSICAL_WDL_FALSIFIER';
console.log(JSON.stringify(stats,null,2));
