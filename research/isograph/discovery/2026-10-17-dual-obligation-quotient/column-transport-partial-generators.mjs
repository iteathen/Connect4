// Full-future P1-root action simulation from ORIGINAL q residuals.
// Instead of exploring any game continuation, construct a fixed column
// transporter satisfying height/capacity and pointwise residual-upset
// inclusion. Partial-generator obligations prune impossible mappings.
// FIRST WIN / FULL BOARD / ACTION ALPHABET must remain guarded.
// Every original literal first-action label is retained.
export function createPartialGeneratorTransport({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||W*H>42)throw Error('invalid finite geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=300000,maxMs=15000,maxRepresentatives=10000}={}){
  const started=Date.now(),rank=q?.h?.reduce((a,b)=>a+b,0);
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     q.R0.some(x=>typeof x!=='bigint'||x<=0n)||
     q.R1.some(x=>typeof x!=='bigint'||x<=0n))throw Error('invalid source q');
  if(rank%2!==1||rank>=N)throw Error('P1 nonterminal source required');
  const stats={sourceQInputs:1,sourceResiduals:q.R0.length+q.R1.length,
   initialP1Actions:0,sourceCofactorTests:0,sourceSubsetNormalizationTests:0,
   generatorCellPreprocessingScans:0,distinctInitialPairs:0,
   terminalOrDrawExcluded:0,capacityMismatchPairs:0,
   capacityCompatiblePairs:0,partialMappingAssignments:0,
   partialGeneratorEligibilityTests:0,newCompletedGeneratorConstraints:0,
   mappedGeneratorCellVisits:0,subsetContainmentTests:0,
   partialMapNodesPrunedBothDirections:0,
   partialDirectionImpossibilityProofs:0,completeColumnPermutations:0,
   reflectionWitnesses:0,nonGeometricPermutationWitnesses:0,
   exactFullFutureIsomorphisms:0,biDirectionalWeakOrders:0,
   unilateralWeakOrders:0,pairsWithoutCertificate:0,
   sourceSuccessorQObjects:0,gameContinuationsSearched:0,
   solvedGameValuesRead:0,operations:0,elapsedMs:0};
  class Limit extends Error{constructor(kind){super('PARTIAL_GENERATOR_'+kind+'_LIMIT');this.kind=kind;}}
  function charge(field){
   stats[field]++;stats.operations++;
   if(stats.operations>maxOperations)throw new Limit('OPERATIONS');
   if(Date.now()-started>maxMs)throw new Limit('TIME');
  }
  function normalize(xs){
   const masks=[...new Set(xs.map(String))].map(BigInt).sort((a,b)=>a<b?-1:a>b?1:0),result=[];
   for(const m of masks){
    let dominated=false;
    for(const n of masks)if(m!==n){
     charge('sourceSubsetNormalizationTests');
     if((m&n)===n){dominated=true;break;}
    }
    if(!dominated)result.push(m);
   }
   return result;
  }
  const legal=[],children=Array(W);
  for(let col=0;col<W;col++)if(q.h[col]<H){
   legal.push(col);stats.initialP1Actions++;
   const move=bit(col,q.h[col]),h=q.h.slice();h[col]++;
   const own=q.R1.map(m=>{charge('sourceCofactorTests');return m&~move;});
   if(own.some(m=>m===0n)||rank+1===N){
    children[col]={terminal:true,h};continue;
   }
   const enemy=q.R0.filter(m=>{charge('sourceCofactorTests');return (m&move)===0n;});
   children[col]={terminal:false,h,R0:normalize(enemy),R1:normalize(own)};
  }
  function generators(pool,h){
   return pool.map(mask=>{
    let cols=0,coords=[];
    for(let c=0;c<W;c++)for(let r=h[c];r<H;r++){
     charge('generatorCellPreprocessingScans');
     if(mask&bit(c,r)){cols|=1<<c;coords.push([c,r]);}
    }
    if(!coords.length)throw Error('nonterminal source residual contains no future cells');
    return {mask,cols,coords};
   });
  }
  function mapper(gen,pi){
   let res=0n;
   for(const [c,r] of gen.coords){
    charge('mappedGeneratorCellVisits');
    const z=pi[c];if(z<0)throw Error('mapping incompletely assigned generator');
    res|=bit(z,r);
   }
   return res;
  }
  function testCompleted(listA,listB,pi,oldAssigned,newAssigned){
   for(const gen of listA){
    charge('partialGeneratorEligibilityTests');
    if((gen.cols&~newAssigned)!==0||(gen.cols&~oldAssigned)===0)continue;
    charge('newCompletedGeneratorConstraints');
    const m=mapper(gen,pi);
    let found=false;
    for(const other of listB){
     charge('subsetContainmentTests');
     if((other.mask&m)===other.mask){found=true;break;}
    }
    if(!found)return false;
   }
   return true;
  }
  const pairs=[];
  const flip=c=>W-1-c;
  function testPair(a,b){
   charge('distinctInitialPairs');
   const A=children[a],B=children[b];
   if(A.terminal||B.terminal){
    stats.terminalOrDrawExcluded++;
    return {actions:[a,b],status:'TERMINAL_OR_DRAW_GUARD_EXCLUDED'};
   }
   const hist=Array(H+1).fill(0);
   for(const v of A.h)hist[v]++;
   for(const v of B.h)hist[v]--;
   if(hist.some(x=>x!==0)){
    stats.capacityMismatchPairs++;
    return {actions:[a,b],status:'NO_CAPACITY_PRESERVING_COLUMN_BIJECTION'};
   }
   stats.capacityCompatiblePairs++;
   const AO=generators(A.R0,A.h),AP=generators(A.R1,A.h),
      BO=generators(B.R0,B.h),BP=generators(B.R1,B.h);
   const degree=Array(W).fill(0);
   for(const gen of [...AO,...AP])for(let c=0;c<W;c++)
    if(gen.cols&(1<<c))degree[c]++;
   const countHeights=Array(H+1).fill(0);
   for(const h of A.h)countHeights[h]++;
   const assignmentOrder=Array.from({length:W},(_,i)=>i)
     .sort((x,y)=>countHeights[A.h[x]]-countHeights[A.h[y]]||degree[y]-degree[x]||x-y);
   const perm=Array(W).fill(-1),inverse=Array(W).fill(-1);
   let fwd=null,rev=null,iso=null;
   function search(depth,assignedS,assignedT,canForward,canReverse){
    if(depth===W){
      if(stats.completeColumnPermutations>=maxRepresentatives)throw new Limit('REPRESENTATIVES');
      charge('completeColumnPermutations');
      if(canForward&&!fwd)fwd=perm.slice();
      if(canReverse&&!rev)rev=perm.slice();
      if(canForward&&canReverse&&!iso)iso=perm.slice();
      return;
    }
    const col=assignmentOrder[depth];
    for(let z=0;z<W;z++){
     if(inverse[z]!==-1||A.h[col]!==B.h[z])continue;
     charge('partialMappingAssignments');
     perm[col]=z;inverse[z]=col;
     const sourceAssigned=assignedS|(1<<col),targetAssigned=assignedT|(1<<z);
     let forward=canForward,reverse=canReverse;
     if(forward){
       forward=testCompleted(AO,BO,perm,assignedS,sourceAssigned)&&
          testCompleted(BP,AP,inverse,assignedT,targetAssigned);
       if(!forward)stats.partialDirectionImpossibilityProofs++;
     }
     if(reverse){
       reverse=testCompleted(BO,AO,inverse,assignedT,targetAssigned)&&
          testCompleted(AP,BP,perm,assignedS,sourceAssigned);
       if(!reverse)stats.partialDirectionImpossibilityProofs++;
     }
     if(forward||reverse){
       search(depth+1,sourceAssigned,targetAssigned,forward,reverse);
     }else stats.partialMapNodesPrunedBothDirections++;
     inverse[z]=-1;perm[col]=-1;
     if(fwd&&rev&&iso)break;
    }
   }
   // A partial assignment's older set is immutable through siblings;
   // each new column can only complete new generator constraints.
   search(0,0,0,true,true);
   const mutual=!!fwd&&!!rev;
   if(iso)stats.exactFullFutureIsomorphisms++;
   if(mutual)stats.biDirectionalWeakOrders++;
   else if(fwd||rev)stats.unilateralWeakOrders++;
   else stats.pairsWithoutCertificate++;
   const sym=iso&&iso.every((x,i)=>x===flip(i));
   if(sym)stats.reflectionWitnesses++;
   else if(iso)stats.nonGeometricPermutationWitnesses++;
   return {actions:[a,b],
    status:iso?'EXACT_FUTURE_GAME_ISOMORPHISM':
      mutual?'EQUAL_FULL_WDL_TWO_SIMULATIONS':
      fwd?'FIRST_P1_ACTION_NO_HIGHER_P0_WDL':
      rev?'SECOND_P1_ACTION_NO_HIGHER_P0_WDL':'NO_CERTIFICATE_UNDER_TESTED_TRANSPORT',
    firstNoHigher:!!fwd,secondNoHigher:!!rev,
    firstToSecondPermutation:fwd,secondToFirstPermutation:rev,
    exactFutureActionMap:iso,exactMapIsReflection:!!sym,
    columnAssignmentOrder:assignmentOrder};
  }
  try{
   for(let i=0;i<legal.length;i++)for(let j=i+1;j<legal.length;j++)
    pairs.push(testPair(legal[i],legal[j]));
  }catch(e){
   if(!(e instanceof Limit))throw e;
   stats.elapsedMs=Date.now()-started;
   return {status:'BUDGET_PARTIAL',kind:e.kind,sourceRank:rank,legalP1Columns:legal,
      pairs,statistics:stats,
      caveat:'Only explicitly completed positive certificates are sound; incomplete pair and remaining columns UNKNOWN'};
  }
  stats.elapsedMs=Date.now()-started;
  return {status:'COMPLETE',sourceRank:rank,legalP1Columns:legal,
   pairs,statistics:stats,
   scope:'SOURCE-only full-future weak WDL order of original P1 first-choice children using fixed column transport; every later action matched by one permutation; all root best-move labels retained until exact strict/equality proof'};
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}
