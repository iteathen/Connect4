// FULL-WDL SCALAR FREE: ONE original legal Level2 best move if purely
// source-certified weak-WDL-order graph has current-mover extremum.
// Source transporter checks static original q cofactor RESIDUALS and
// capacity-preserving column program mappings, not future game VALUES.
// Static column permutation proof search counted, source child cofactor
// DESCRIPTIONS constructed by dependency (not independent WDL evaluation).
// Frozen theorem docs/research/2026-10-17-source-WDL-extremal-one-best-action-no-scalar-value.md
import {createEitherMoverExactTransport} from './either-mover-future-transport.mjs';
export function createSourceWdlExtremalOneBest({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||
      K>Math.min(W,H)||W*H>42)throw Error('invalid finite original gravity game');
 const transport=createEitherMoverExactTransport({width:W,height:H,connect:K});
 function compute(q,{maxOperations=180000,maxMs=350,maxRepresentatives=10000}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(z=>!Number.isInteger(z)||z<0||z>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m===0n))
   throw Error('exact original q nonterminal expected');
  const n=q.h.reduce((s,x)=>s+x,0),p=n&1,
   legal=q.h.flatMap((z,c)=>z<H?[c]:[]);
  if(n>=W*H||!legal.length)throw Error('nonterminal original source required');
  const audit={originalSourcePly:n,mover:p,
   legalFirstActionCount:legal.length,
   sourceColumnTransportOperations:0,
   sourceStaticColumnPermutationProofCandidates:0,
   sourceStaticPartialColumnMappingAssignments:0,
   certifiedOriginalFirstActionValueInequalityEdges:0,
   sourceActionOrderGraphReachabilityChecks:0,
   sourceVerifiedOriginalActionOrderPaths:0,
   sourceCurrentRootOutcomeValuesCalculated:0,
   sourceIndependentFutureGameWdlEvaluations:0,
   strategicallyBranchedFutureQValues:0,
   staticActionCofactorDescriptionsConstructed:legal.length,
   sourceStaticPermutationProofSearch:true,
   sourceTransportStatus:null};
  let t;
  try{t=transport.compute(q,{maxOperations,maxMs,maxRepresentatives});}
  catch(e){
   if(String(e.message).startsWith('PARTIAL_GENERATOR_'))
    return{status:'INCOMPLETE',reason:'SOURCE_STATIC_TRANSPORT_WORK_GUARD',
     originalLiteralBestMove:null,statistics:audit};
   throw e;
  }
  audit.sourceTransportStatus=t.status;
  audit.sourceColumnTransportOperations=t.statistics.operations;
  audit.sourceStaticColumnPermutationProofCandidates=t.statistics.completeColumnPermutations;
  audit.sourceStaticPartialColumnMappingAssignments=t.statistics.partialMappingAssignments;
  const index=new Map(legal.map((c,i)=>[c,i])),
   nacts=legal.length,paths=Array.from({length:nacts},()=>Array(nacts).fill(false)),
   next=Array.from({length:nacts},()=>Array(nacts).fill(null)),
   direct=[];
  for(let i=0;i<nacts;i++){paths[i][i]=true;next[i][i]=i;}
  for(const record of t.pairs){
   if(!Array.isArray(record.actions)||record.actions.length!==2)throw Error('bad source action order record');
   const [a,b]=record.actions;
   const i=index.get(a),j=index.get(b);
   if(i===undefined||j===undefined)throw Error('order transport labels not root legal');
   if(record.firstNoHigher){
    paths[i][j]=true;next[i][j]=j;audit.certifiedOriginalFirstActionValueInequalityEdges++;
    direct.push({lowerOriginalLiteral:a+1,upperOriginalLiteral:b+1,
     reason:'SOURCE_FIRST_CHILD_FULL_FUTURE_P0_WEAK_ORDER',
     originalColumnTransport:record.firstToSecondPermutation});
   }
   if(record.secondNoHigher){
    paths[j][i]=true;next[j][i]=i;audit.certifiedOriginalFirstActionValueInequalityEdges++;
    direct.push({lowerOriginalLiteral:b+1,upperOriginalLiteral:a+1,
     reason:'SOURCE_SECOND_CHILD_FULL_FUTURE_P0_WEAK_ORDER',
     originalColumnTransport:record.secondToFirstPermutation});
   }
  }
  for(let k=0;k<nacts;k++)for(let i=0;i<nacts;i++)for(let j=0;j<nacts;j++){
   audit.sourceActionOrderGraphReachabilityChecks++;
   if(paths[i][k]&&paths[k][j]&&!paths[i][j]){
    paths[i][j]=true;next[i][j]=next[i][k];
   }
  }
  const qualifying=legal.filter((a,i)=>
   legal.every((b,j)=>p===0?paths[j][i]:paths[i][j]));
  const best=qualifying[0];
  if(best===undefined)return {
   status:'INCOMPLETE',
   reason:'NO_SOURCE_PROVED_ROOT_CURRENT_MOVER_GLOBAL_WDL_EXTREMAL_ORBIT',
   originalLegalLiteralLabels:legal.map(z=>z+1),
   currentlyProvedWdlOrderEdges:direct,
   sourceCandidateMaximalLabels:
    legal.filter((_,j)=>!legal.some((__,i)=>i!==j&&
      (p===0?paths[j][i]&&!paths[i][j]:paths[i][j]&&!paths[j][i]))).map(c=>c+1),
   sourceFullFutureValueOrderNotComplete:t.status!=='COMPLETE',
   statistics:audit};
  const target=index.get(best),allPaths=[];
  for(let i=0;i<nacts;i++){
   const start=p===0?i:target,end=p===0?target:i,seq=[start];
   let here=start;
   for(let step=0;here!==end;step++){
    if(step>nacts)throw Error('source action order cycle proof path overflow');
    here=next[here][end];
    if(here===null||here===undefined)throw Error('source action inequality path not constructed');
    seq.push(here);
   }
   allPaths.push({fromOriginalLiteral:legal[start]+1,toOriginalLiteral:legal[end]+1,
    sourceCertifiedInequalityPath:seq.map(j=>legal[j]+1)});
   audit.sourceVerifiedOriginalActionOrderPaths++;
  }
  return {status:'VALID_CONTINUATION',
   kind:'SOURCE_WDL_PARTIAL_ORDER_HAS_CURRENT_MOVER_EXTREMAL_ORIGINAL_ACTION',
   mover:p,opponentModel:'PERFECT',
   selectedOriginalLiteralColumn:best+1,
   qualifiedLiteralLabelsMeetingSameOrderCriterion:qualifying.map(c=>c+1),
   proofOfBestAgainstEveryOtherOriginalLegalAction:allPaths,
   sourceOriginalWdlWeakOrderEdgeWitnesses:direct,
   valueOfChosenOriginalAction:null,exactRootOrdinaryWDL:null,
   noNumericActionGameValueRequired:true,
   fullLevel2OptimalSetClaimed:false,
   bestMoveCertificateClass:'SOURCE_QUALITATIVE_ACTION_DOMINANCE_WITHOUT_ROOT_SCALAR',
   staticOriginalSourceCoFactorPermutationComparisons:true,
   sourceIndependentFutureGameWdlEvaluations:0,
   statistics:audit};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
