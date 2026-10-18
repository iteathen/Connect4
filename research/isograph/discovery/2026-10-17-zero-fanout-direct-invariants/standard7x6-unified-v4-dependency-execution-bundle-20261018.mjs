// REPRODUCIBLE READ-ONLY source test bundle, dependencies for V4.
// Frozen exact Git source blobs below, import/export syntax stripped ONLY.
// One console-free JS compilation unit, NOT a new theorem or qualified implementation.
// SOURCE research/isograph/discovery/2026-10-16-algorithmic-core/exact-q-core.mjs BLOB 6b25d0e2560fe4131d2f5442593e9ed9763c1a18
// Oracle-independent constructive Connect-K W/D/L algorithmic core.
// No physical ownership/history, strong-distance scores, opening books,
// external solved labels, CPC/NDC shortcuts, or precomputed W/D/L frontiers
// enter solve(). Branching/recursion are allowed and explicitly counted.
const DIRECTIONS=[[1,0],[0,1],[1,1],[1,-1]];
class CoreBudgetError extends Error {
  constructor(message,metrics){super(message);this.name='CoreBudgetError';this.metrics=metrics;}
}
function popcount(x){let n=0;for(;x;x&=x-1n)n++;return n;}
function cmpBig(a,b){return a<b?-1:a>b?1:0;}
function normalized(masks){
  const items=[...new Set(masks.map(String))].map(BigInt)
    .sort((a,b)=>popcount(a)-popcount(b)||cmpBig(a,b));
  const result=[];
  for(const x of items)if(!result.some(y=>(x&y)===y))result.push(x);
  return result;
}
function createExactQCore({width:W,height:H,connect:K}){
  if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
    throw Error('unsupported finite gravity geometry (1 <= W*H <= 42, K >= 2)');
  const bit=(c,r)=>1n<<BigInt(r*W+c),count=W*H;
  const lineSet=new Map();
  for(let c=0;c<W;c++)for(let row=0;row<H;row++)for(const [dx,dy] of DIRECTIONS){
    const endC=c+(K-1)*dx,endR=row+(K-1)*dy;
    if(endC<0||endC>=W||endR<0||endR>=H)continue;
    let line=0n;for(let d=0;d<K;d++)line|=bit(c+d*dx,row+d*dy);
    lineSet.set(String(line),line);
  }
  const lines=[...lineSet.values()].sort(cmpBig);
  const occupiedCount=h=>h.reduce((s,n)=>s+n,0);
  const createEmpty=()=>({h:Array(W).fill(0),R0:lines.slice(),R1:lines.slice()});
  function fromPhysical({h,p0,p1}){
    if(!Array.isArray(h)||h.length!==W||h.some(v=>!Number.isInteger(v)||v<0||v>H))
      throw Error('invalid physical support');
    if(typeof p0!=='bigint'||typeof p1!=='bigint'||(p0&p1)!==0n)
      throw Error('invalid physical ownership');
    let support=0n;
    for(let c=0;c<W;c++)for(let row=0;row<h[c];row++)support|=bit(c,row);
    if((p0|p1)!==support)throw Error('ownership and support differ');
    if(popcount(p0)!==Math.ceil(occupiedCount(h)/2)||
       popcount(p1)!==Math.floor(occupiedCount(h)/2))
      throw Error('physical player stone counts disagree with move parity');
    if(lines.some(m=>(p0&m)===m||(p1&m)===m))
      throw Error('physical input already terminal; require legal nonterminal input');
    const residual=who=>{
      const opposite=who===0?p1:p0;
      const xs=[];
      for(const m of lines)if((m&opposite)===0n)xs.push(m&~support);
      return normalized(xs);
    };
    return {h:h.slice(),R0:residual(0),R1:residual(1)};
  }
  function legal(q){
    const actions=[];
    for(let c=0;c<W;c++)if(q.h[c]<H)actions.push(c);
    return actions;
  }
  function next(q,c){
    if(!Number.isInteger(c)||c<0||c>=W||q.h[c]>=H)
      throw Error('illegal action');
    const mover=occupiedCount(q.h)&1;
    const landing=bit(c,q.h[c]);
    const own=mover===0?q.R0:q.R1;
    const opposite=mover===0?q.R1:q.R0;
    const reduced=normalized(own.map(m=>m&~landing));
    // First-win boundary must be tested BEFORE discarding empty residuals.
    if(reduced.some(m=>m===0n))
      return {terminal:mover===0?1:-1,kind:'win'};
    const h=q.h.slice();h[c]++;
    if(occupiedCount(h)===count)return {terminal:0,kind:'draw'};
    const blocked=normalized(opposite.filter(m=>(m&landing)===0n));
    return {q:mover===0?{h,R0:reduced,R1:blocked}:{h,R0:blocked,R1:reduced}};
  }
  const key=q=>q.h.join('.')+'|'+q.R0.map(String).join(',')+'|'+q.R1.map(String).join(',');
  function solve(q,{
    maxStates=Number.MAX_SAFE_INTEGER,
    maxTransitions=Number.MAX_SAFE_INTEGER,
    deadlineAt=Infinity,
    sharedMemo=null
  }={}){
    const stats={uniqueStates:0,recursiveCalls:0,memoHits:0,
      transitions:0,terminalWinEdges:0,terminalDrawEdges:0,
      branchingStates:0,maxDepth:0,cacheEntries:0};
    const memo=sharedMemo??new Map();
    if(!(memo instanceof Map))throw Error('sharedMemo must be a Map');
    const resultFor=(node,depth)=>{
      stats.recursiveCalls++;
      stats.maxDepth=Math.max(stats.maxDepth,depth);
      const k=key(node);
      if(memo.has(k)){stats.memoHits++;return memo.get(k);}
      if(stats.uniqueStates>=maxStates||stats.transitions>=maxTransitions||
         Date.now()>=deadlineAt)
        throw new CoreBudgetError('constructive q solve budget exhausted',{...stats});
      stats.uniqueStates++;
      const actions=legal(node),mover=occupiedCount(node.h)&1;
      if(actions.length>1)stats.branchingStates++;
      if(actions.length===0){
        const terminal={value:0,bestMoves:[],actionValues:[]};
        memo.set(k,terminal);return terminal;
      }
      const scored=[];
      let best=mover===0?-Infinity:Infinity;
      for(const c of actions){
        if(stats.transitions>=maxTransitions||Date.now()>=deadlineAt)
          throw new CoreBudgetError('constructive q solve budget exhausted',{...stats});
        const successor=next(node,c);
        stats.transitions++;
        let value;
        if(successor.terminal!==undefined){
          value=successor.terminal;
          if(value===0)stats.terminalDrawEdges++;
          else stats.terminalWinEdges++;
        }else value=resultFor(successor.q,depth+1).value;
        scored.push([c,value]);
        best=mover===0?Math.max(best,value):Math.min(best,value);
      }
      const result={value:best,
        bestMoves:scored.filter(([,v])=>v===best).map(([c])=>c),
        actionValues:scored};
      memo.set(k,result);
      return result;
    };
    const answer=resultFor(q,0);
    stats.cacheEntries=memo.size;
    return {answer,stats};
  }
  return Object.freeze({width:W,height:H,connect:K,lineCount:lines.length,
    lines,bit,createEmpty,fromPhysical,legal,next,key,solve});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/either-mover-future-transport.mjs BLOB 963014775aeee5d9fea9c2dd191302d44e04bcc0
// Same source-only full-future column transport for EITHER current mover.
// Qualified past implementation handled P1 only; this version uses the
// correct owner-true / opponent-blocked source cofactor on P0 turns also.
// Full-future P1-root action simulation from ORIGINAL q residuals.
// Instead of exploring any game continuation, construct a fixed column
// transporter satisfying height/capacity and pointwise residual-upset
// inclusion. Partial-generator obligations prune impossible mappings.
// FIRST WIN / FULL BOARD / ACTION ALPHABET must remain guarded.
// Every original literal first-action label is retained.
function createEitherMoverExactTransport({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||W*H>42)throw Error('invalid finite geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=300000,maxMs=15000,maxRepresentatives=10000}={}){
  const started=Date.now(),rank=q?.h?.reduce((a,b)=>a+b,0);
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     q.R0.some(x=>typeof x!=='bigint'||x<=0n)||
     q.R1.some(x=>typeof x!=='bigint'||x<=0n))throw Error('invalid source q');
  if(rank>=N)throw Error('nonterminal source required');
  const mover=rank%2;
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
   const own=(mover===0?q.R0:q.R1).map(m=>{charge('sourceCofactorTests');return m&~move;});
   if(own.some(m=>m===0n)||rank+1===N){
    children[col]={terminal:true,h};continue;
   }
   const enemy=(mover===0?q.R1:q.R0).filter(m=>{charge('sourceCofactorTests');return (m&move)===0n;});
   children[col]={terminal:false,h,
     R0:mover===0?normalize(own):normalize(enemy),
     R1:mover===0?normalize(enemy):normalize(own)};
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


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-WDL-order-extremal-one-best.mjs BLOB 2bbcbd09f95eed902a3c1f887212f78396f8828f
// FULL-WDL SCALAR FREE: ONE original legal Level2 best move if purely
// source-certified weak-WDL-order graph has current-mover extremum.
// Source transporter checks static original q cofactor RESIDUALS and
// capacity-preserving column program mappings, not future game VALUES.
// Static column permutation proof search counted, source child cofactor
// DESCRIPTIONS constructed by dependency (not independent WDL evaluation).
// Frozen theorem docs/research/2026-10-17-source-WDL-extremal-one-best-action-no-scalar-value.md
function createSourceWdlExtremalOneBest({width:W,height:H,connect:K}){
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


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-gravity-response-cover.mjs BLOB a8d908d90b92fae70fa12106cae63e483a022b4a
// Pure ORIGINAL q source-structural EXACT mate-in-three response-cover.
// NO future game q object; no strategic value/strategy tree evaluation.
// Theorem: docs/research/2026-10-17-source-gravity-response-cover-exact-mate-in-three.md
function createSourceGravityResponseCover({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<2||K<2||
     K>Math.min(W,H)||W*H>42)throw Error('unsupported board');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxSourceMaskTests=25000}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(h=>!Number.isInteger(h)||h<0||h>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('requires first-win-stopped exact source q');
  const h=q.h,n=h.reduce((s,x)=>s+x,0),p=n&1,o=1-p;
  if(n>=N)throw Error('nonterminal source only');
  const own=p===0?q.R0:q.R1,opp=p===0?q.R1:q.R0;
  if([...own,...opp].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('invalid source generator');
  const O=new Set(own.map(String)),E=new Set(opp.map(String));
  const legal=h.flatMap((height,c)=>height<H?[c]:[]);
  const stats={sourceOriginalQInitializations:1,
   literalCurrentActionMaskScans:0,
   originalResidualMembershipChecks:0,
   staticOpponentColumnSetMembershipChecks:0,
   originalSourceFutureQStatesMaterialized:0,
   independentlyValuedStrategicFutureGames:0,
   independentOpponentRepliesSimulated:0,
   sourceBDDQBFStrategyTreesConstructed:0};
  function has(S,mask){stats.originalResidualMembershipChecks++;
   if(stats.originalResidualMembershipChecks>maxSourceMaskTests)throw Error('static proof guard exhausted');
   return S.has(String(mask));}
  const witnesses=[];
  for(const a of legal){
   stats.literalCurrentActionMaskScans++;
   const x=bit(a,h[a]);
   if(has(O,x)){
    witnesses.push({kind:'IMMEDIATE_OWNER_FIRST_WIN',literalAction:a+1,
      mover:p,proof:{landingCell:'0x'+x.toString(16)},originalSourceFutureValueQueries:0});
    continue;
   }
   if(n+1>=N)continue; // nonwinning full board DRAW is not a WIN
   const frontier=legal.flatMap(d=>{
    const r=h[d]+(d===a?1:0);
    return r<H?[{d,row:r,y:bit(d,r),z:r+1<H?bit(d,r+1):null}]:[];
   });
   if(!frontier.length)continue;
   // Source original opponent requirements are BLOCKED on x, not owner-contracted.
   if(frontier.some(v=>has(E,v.y)))continue;
   const S=[],Z=[],proofS={},proofZ={};
   for(const v of frontier){
    const srcY=[];
    if(has(O,v.y))srcY.push('0x'+v.y.toString(16));
    if(has(O,x|v.y))srcY.push('0x'+(x|v.y).toString(16));
    if(srcY.length){S.push(v.d+1);proofS[v.d+1]=srcY;}
    if(v.z!==null){
     const srcZ=[];
     if(has(O,v.z))srcZ.push('0x'+v.z.toString(16));
     if(has(O,x|v.z))srcZ.push('0x'+(x|v.z).toString(16));
     if(srcZ.length){Z.push(v.d+1);proofZ[v.d+1]=srcZ;}
    }
   }
   const D=frontier.map(v=>v.d+1);
   let kind=null;
   if(S.length>=2)kind='TWO_DISTINCT_CURRENT_WIN_TARGETS';
   else if(S.length===1&&Z.includes(S[0]))kind='SAME_COLUMN_STACKED_RELEASE';
   else if(S.length===0&&D.every(d=>Z.includes(d)))
     kind='ALL_OPPONENT_REPLIES_RELEASE_NEXT_WIN';
   if(!kind)continue;
   witnesses.push({
    kind,literalAction:a+1,mover:p,
    opponentLiteralReplyColumns:D,
    currentPlayableOwnerWinTargetColumns:S,
    opponentReplyReleaseOwnerWinTargetColumns:Z,
    sourceOriginalCurrentOwnerWitnesses:proofS,
    sourceOriginalReleasedOwnerWitnesses:proofZ,
    allOpponentImmediateWinsSourceDenied:true,
    allOpponentRepliesCoveredByStaticSetBoolean:true,
    originalSourceFutureValueQueries:0,
    proofType:'forall d in D: (S minus {d} nonempty) OR (d in Z)',
    replayOnlyForIndependentFalsification:true
   });
  }
  const order=['ALL_OPPONENT_REPLIES_RELEASE_NEXT_WIN',
   'SAME_COLUMN_STACKED_RELEASE','TWO_DISTINCT_CURRENT_WIN_TARGETS','IMMEDIATE_OWNER_FIRST_WIN'];
  const priority=kind=>order.indexOf(kind);
  const selected=witnesses.slice().sort((a,b)=>priority(a.kind)-priority(b.kind)||
    a.literalAction-b.literalAction)[0]??null;
  return {status:selected?'VALID_CONTINUATION':'INCOMPLETE',
    selectedOriginalLiteralColumn:selected?.literalAction??null,
    sourceCertificate:selected,
    sourceProvenWinActions:witnesses,
    sourceWitnessCounts:Object.fromEntries(order.map(k=>[k,witnesses.filter(w=>w.kind===k).length])),
    reason:selected?'SOURCE_GRAVITY_RESPONSE_COVER_NEXT_OWNER_TURN_WIN':'NO_SOURCE_MATE_IN_3_OR_IMMEDIATE_CERTIFICATE',
    statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/co-release-pair-block-proof.mjs BLOB 1704db3137480d66a654c7d970e042fdd1003c48
// Exact source-only gravity CO-RELEASE static defender pairing certificate.
// Future cells are ordered chains. A safe pair is either two consecutive
// SAME-column cells or two cells at the SAME *relative ordinal* j of
// two source columns, in a common prefix of cross-pairs followed by
// EVEN-length vertical tails. Original source column heights may differ,
// so such pairs can cover certain diagonal winning requirements.
// The producer does NOT evaluate ANY actual future strategic game.
function createCoReleasePairBlockProof({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('invalid finite gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function prove(sourceHeights,attackerRequirements,{
    maxOperations=300000,maxMs=15000,maxStaticWitnessStates=10000}={}){
  const start=Date.now(),stats={
   sourceFutureCells:0,sourceAttackerRequirementCount:0,
   sourcePairBlockOptions:0,sourcePairMasksConstructed:0,
   sourceRequirementCoverageTests:0,staticColumnPartitionProofStates:0,
   staticProofMemoHits:0,completeStaticPairPartitionsTested:0,
   completeStaticDefensivePairCertificates:0,
   earlyStaticCoverageFeasibilityPrunes:0,
   staticBlockOptionsTried:0,
   successorGameStatesConstructed:0,strategicGameChoicesEvaluated:0,
   alternateFutureGamePoliciesEvaluated:0,solvedWDLOracleQueries:0,
   sourceOperations:0,elapsedMs:0};
  class Limit extends Error{constructor(kind){super('CO_RELEASE_PAIR_'+kind+'_LIMIT');this.kind=kind;}}
  const charge=(field)=>{stats[field]++;stats.sourceOperations++;
   if(stats.sourceOperations>maxOperations)throw new Limit('OPERATIONS');
   if(Date.now()-start>maxMs)throw new Limit('TIME');
  };
  if(!Array.isArray(sourceHeights)||sourceHeights.length!==W||
   sourceHeights.some(h=>!Number.isInteger(h)||h<0||h>H)||
   !Array.isArray(attackerRequirements)||
   attackerRequirements.some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('expected valid source column heights and attacker residual requirements');
  const rem=sourceHeights.map(h=>H-h),total=rem.reduce((a,b)=>a+b,0),
   cols=rem.flatMap((m,c)=>m?[c]:[]);
  stats.sourceFutureCells=total;stats.sourceAttackerRequirementCount=attackerRequirements.length;
  if(total%2!==0)return {status:'NO_CERTIFICATE_ODD_REMAINING_CAPACITY',
   certifiedAttackerWinImpossible:false,statistics:stats};
  if(!attackerRequirements.length)return {status:'ATTACKER_ALREADY_HAS_NO_WIN_REQUIREMENTS',
   certifiedAttackerWinImpossible:true,sourceBlocks:[],statistics:stats};
  const allTargets=(1n<<BigInt(attackerRequirements.length))-1n,
   options=new Map(),totalSourceCells=cols.reduce((m,c)=>{
    for(let row=sourceHeights[c];row<H;row++)m|=bit(c,row);
    return m;
   },0n);
  function addOption(c,kind,columns,crossPrefix,pairs){
   let covers=0n;
   for(let j=0;j<attackerRequirements.length;j++)
    for(const pair of pairs){
     charge('sourceRequirementCoverageTests');
     if((attackerRequirements[j]&pair)===pair){
      covers|=1n<<BigInt(j);break;
     }
    }
   stats.sourcePairBlockOptions++;
   options.get(c).push({kind,columns,crossPrefix,pairs,covers});
  }
  for(const c of cols)options.set(c,[]);
  for(const c of cols){
   if(rem[c]%2===0){
    const pairs=[];
    for(let row=sourceHeights[c];row<H;row+=2){
     pairs.push(bit(c,row)|bit(c,row+1));charge('sourcePairMasksConstructed');
    }
    addOption(c,'VERTICAL_CONSECUTIVE',[c],0,pairs);
   }
   for(const d of cols){
    if(d<=c||rem[c]%2!==rem[d]%2)continue;
    const min=Math.min(rem[c],rem[d]);
    for(let t=rem[c]%2?1:2;t<=min;t+=2){
     const pairs=[];
     for(let j=0;j<t;j++){
      pairs.push(bit(c,sourceHeights[c]+j)|bit(d,sourceHeights[d]+j));
      charge('sourcePairMasksConstructed');
     }
     for(const z of [c,d])
      for(let row=sourceHeights[z]+t;row<H;row+=2){
       pairs.push(bit(z,row)|bit(z,row+1));charge('sourcePairMasksConstructed');
      }
     addOption(c,'CO_RELEASE_PREFIX_AND_VERTICAL_TAILS',[c,d],t,pairs);
    }
   }
  }
  const fullColumns=cols.reduce((m,c)=>m|(1<<c),0),
   fullPairCount=total/2,visited=new Set();
  let solution=null;
  function dfs(unused,covered,groups){
   charge('staticColumnPartitionProofStates');
   if(solution)return;
   if(unused===0){
    stats.completeStaticPairPartitionsTested++;
    if(covered===allTargets){
     solution=groups.slice();
     stats.completeStaticDefensivePairCertificates++;
    }
    return;
   }
   const key=unused+':'+String(covered);
   if(visited.has(key)){stats.staticProofMemoHits++;return;}
   if(visited.size>=maxStaticWitnessStates)throw new Limit('STATIC_PROOF_STATE_REPRESENTATIVES');
   visited.add(key);
   let c=0;while(((unused>>c)&1)===0)c++;
   for(const option of options.get(c)){
    if(option.columns.some(x=>((unused>>x)&1)===0))continue;
    charge('staticBlockOptionsTried');
    const next=option.columns.reduce((mask,x)=>mask&~(1<<x),unused);
    dfs(next,covered|option.covers,groups.concat([option]));
    if(solution)return;
   }
  }
  try{dfs(fullColumns,0n,[]);}
  catch(e){
   if(e instanceof Limit)return {status:'RESOURCE_INCOMPLETE',
    why:e.kind,certifiedAttackerWinImpossible:false,
    statistics:{...stats,elapsedMs:Date.now()-start}};
   throw e;
  }
  stats.elapsedMs=Date.now()-start;
  if(!solution)return {status:'NO_CERTIFICATE_IN_THIS_SOURCE_BLOCK_FAMILY',
    certifiedAttackerWinImpossible:false,statistics:stats};
  // Independent structural validity of the found STATIC source matching.
  let union=0n,collisions=0,pairCount=0;
  for(const group of solution)for(const pair of group.pairs){
   if((pair&union)!==0n)collisions++;
   union|=pair;pairCount++;
  }
  if(collisions||union!==totalSourceCells||pairCount!==fullPairCount)
   throw Error('SOURCE matching failed full future-cell disjoint coverage');
  const coveredEveryRequirement=attackerRequirements.every(r=>
   solution.some(group=>group.pairs.some(pair=>(r&pair)===pair)));
  if(!coveredEveryRequirement)throw Error('source matching failed attacker source WIN requirement cover');
  return {status:'EXACT_GRAVITY_CO_RELEASE_DEFENDER_PAIR_CERTIFICATE',
   certifiedAttackerWinImpossible:true,
   sourceColumnHeights:sourceHeights.slice(),
   attackerResidualRequirementCount:attackerRequirements.length,
   sourceBlocks:solution.map(o=>({
    kind:o.kind,columns:o.columns.slice(),crossPairPrefixLength:o.crossPrefix,
    sourcePairMasksHex:o.pairs.map(pair=>'0x'+pair.toString(16))})),
   allSourceFutureCellsPaired:true,
   allAttackerWinningRequirementsContainDefenderPair:true,
   originalSourceOnly:true,
   noStrategicFutureGameStatesCreated:true,
   statistics:stats};
 }
 return Object.freeze({prove,width:W,height:H,connect:K});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-fractional-transversal.mjs BLOB 271c1266337ee5999ab8866b7472daf109c299c2
// Source-only fractional hyperedge packing witness for original residual q.
// NO future game states, action-value evaluations, opponent policy trees or
// solved WDL tables. Integer weights numerator / positive denominator D.
// W,H,K are symbolic geometry inputs; primary verification W=7 H=6 K=4.
// Mathematical authority: 2026-10-17-standard7x6-bilateral-winline-
// transversal-packing-candidate.md. Standalone Node ESM source.
function createSourceFractionalTransversal({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid source gravity geometry');
 const N=W*H;
 const cellIDs=g=>{
  const ids=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)
   if(g&(1n<<BigInt(r*W+c)))ids.push(r*W+c);
  return ids;
 };
 function prove(q,attacker,{denominators=[1,2,3,4,6,8,12]}={}){
  const n=q.h.reduce((a,b)=>a+b,0),T=N-n,o=1-attacker;
  if(attacker!==0&&attacker!==1)throw Error('bad player');
  if(T<=0)throw Error('nonterminal source q required');
  const oCapacity=Math.floor(T/2)+(T%2&&o===n%2?1:0);
  const R=q.R[attacker];
  const stats={attemptedStaticWeightVectors:0,witnessCellIncidenceChecks:0,
   strategicFutureGamesEvaluated:0,sourceGenerators:R.length};
  if(!R.length)return {status:'INCOMPLETE',reason:'NO_ATTACKER_WIN_REQUIREMENT',capacity:oCapacity,statistics:stats};
  const edges=R.map(g=>{
   if(typeof g!=='bigint'||g===0n)throw Error('nonterminal residual generator expected');
   const ids=cellIDs(g);
   for(const id of ids){const c=id%W,r=Math.floor(id/W);if(r<q.h[c])throw Error('source generator outside future support');}
   return ids;
  });
  const deg=Array(N).fill(0);for(const edge of edges)for(const id of edge)deg[id]++;
  const size=edges.map(z=>z.length),intersections=edges.map(e=>e.reduce((x,id)=>x+deg[id],0));
  const indices=Array.from({length:R.length},(_,i)=>i);
  const orders=[
   [...indices].sort((a,b)=>size[a]-size[b]||intersections[a]-intersections[b]||a-b),
   [...indices].sort((a,b)=>size[b]-size[a]||intersections[a]-intersections[b]||a-b),
   [...indices].sort((a,b)=>intersections[a]-intersections[b]||size[a]-size[b]||a-b),
   [...indices].sort((a,b)=>intersections[b]-intersections[a]||size[a]-size[b]||a-b),
   indices,
   [...indices].reverse()
  ];
  function verify(nums,D){
   const loads=Array(N).fill(0);
   let sum=0;
   for(let i=0;i<nums.length;i++){
    if(nums[i]<0||nums[i]>D||!Number.isInteger(nums[i]))throw Error('bad integer dual weight');
    sum+=nums[i];
    for(const x of edges[i]){stats.witnessCellIncidenceChecks++;loads[x]+=nums[i];}
   }
   if(loads.some(v=>v>D))throw Error('invalid dual cell capacity');
   return {sumNumerator:sum,maximumCellLoadNumerator:Math.max(...loads)};
  }
  let best=null;
  for(const D of denominators){
   if(!Number.isInteger(D)||D<1||D>1000)throw Error('bad static witness denominator');
   for(const quota of [1,Math.max(1,Math.floor(D/2)),D]){
    for(const ord of orders){
     stats.attemptedStaticWeightVectors++;
     const num=Array(R.length).fill(0),load=Array(N).fill(0);
     let changed=true;
     while(changed){
      changed=false;
      for(const i of ord){
       const remain=Math.min(...edges[i].map(x=>D-load[x]));
       const alloc=Math.min(quota,remain,D-num[i]);
       if(alloc<=0)continue;
       num[i]+=alloc;for(const id of edges[i])load[id]+=alloc;
       changed=true;
      }
     }
     const sum=num.reduce((a,b)=>a+b,0);
     if(!best||sum*best.denominator>best.sumNumerator*D)
      best={denominator:D,numerators:num,sumNumerator:sum,order:orders.indexOf(ord),quota};
     if(sum>oCapacity*D){
      const checked=verify(num,D);
      return {status:'CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN',
       attacker,opponent:o,remainingEvents:T,opponentTotalTurns:oCapacity,
       witness:{denominator:D,numerators:num.map(String),sumNumerator:sum,
        ...checked,guaranteedExcessNumerator:sum-oCapacity*D},
       statistics:stats};
     }
    }
   }
  }
  return {status:'INCOMPLETE',reason:'NO_FRACTIONAL_DUAL_GREEDY_WITNESS',
   capacity:oCapacity,bestKnownStaticWeights:{denominator:best.denominator,
    sumNumerator:best.sumNumerator},statistics:stats};
 }
 return {prove};
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/global-no-win-bound.mjs BLOB 6a9aed9590ac71366404cf8f9f540286084b4985
// Exact source-only FULL FUTURE WDL bounds; NO strategic-game fanout.
// Two mechanisms: extinct original residual winning-line families, and
// attacker-to-move gravity-legal static defensive pairing that blocks every
// attacker's residual winning requirement. Computes WDL interval for EVERY
// literal action at once, not any game-state/strategy continuation.
function createGlobalNoWinBound({width:W,height:H,connect:K}) {
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('unsupported finite gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=300000,maxMs=15000}={}) {
  const began=Date.now();
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    q.R0.some(m=>typeof m!=='bigint'||m<=0n)||
    q.R1.some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('expected source normalized nonterminal residual q');
  const rank=q.h.reduce((a,b)=>a+b,0),mover=rank&1;
  if(rank>=N)throw Error('already full/terminal source');
  const legal=q.h.flatMap((h,c)=>h<H?[c]:[]);
  const stats={sourceResiduals:q.R0.length+q.R1.length,
   legalLiteralActions:legal.length,
   sourceGeneratorMaskTests:0,sourceHeightParityTests:0,
   sourcePairCoverageTests:0,sourceCellPairCreationTests:0,
   sourceCandidateBlockComparisons:0,originalSourceWorkUnits:0,
   firstActionFutureQEvaluations:0,
   speculativeAlternativeGameStates:0,gameTreeBranchesConstructed:0,
   solvedWDLQueries:0,elapsedMs:0};
  function charge(kind){
   stats[kind]++;stats.originalSourceWorkUnits++;
   if(stats.originalSourceWorkUnits>maxOperations||
     Date.now()-began>maxMs)throw Error('GLOBAL_NO_WIN_SOURCE_CERTIFICATE_BUDGET_EXHAUSTED');
  }
  const bounds={lower:-1,upper:1},witness=[];
  if(q.R0.length===0){
   bounds.upper=0;witness.push({kind:'NO_REMAINING_P0_WINNING_REQUIREMENTS',certifiedP0CanNeverWin:true});
  }
  if(q.R1.length===0){
   bounds.lower=0;witness.push({kind:'NO_REMAINING_P1_WINNING_REQUIREMENTS',certifiedP1CanNeverWin:true});
  }
  // Defender responds SECOND after attacker's every first placement.
  // A legal pairing cover makes it impossible for attacker to own
  // both cells of any required pair, so attacker cannot win.
  let pairCertificate=null;
  const attacker=mover,targets=attacker===0?q.R0:q.R1,empties=N-rank;
  if(empties%2===0&&targets.length&&legal.length>0) {
   const used=new Set(),blocks=[],pairs=[],all=legal.slice();
   function vertical(c){
    const out=[];
    for(let row=q.h[c];row<H;row+=2){
     charge('sourceCellPairCreationTests');
     if(row+1>=H)return null;
     out.push(bit(c,row)|bit(c,row+1));
    }
    return out;
   }
   function horizontal(c,d){
    if(q.h[c]!==q.h[d])return null;
    const out=[];
    for(let row=q.h[c];row<H;row++){
     charge('sourceCellPairCreationTests');
     out.push(bit(c,row)|bit(d,row));
    }
    return out;
   }
   function coverage(chosenPairs){
    let count=0;
    for(const generator of targets){
     for(const pr of chosenPairs){
      charge('sourcePairCoverageTests');
      if((generator&pr)===pr){count++;break;}
     }
    }
    return count;
   }
   let partitionValid=true;
   // An ODD remaining cell column cannot be matched vertically.
   // Matching whole equal-height columns horizontally keeps gravity
   // release legal after every paired response.
   for(const c of all){
    if(used.has(c)||(H-q.h[c])%2===0)continue;
    charge('sourceHeightParityTests');
    const d=all.find(x=>x!==c&&!used.has(x)&&q.h[x]===q.h[c]);
    if(d===undefined){partitionValid=false;break;}
    const ps=horizontal(c,d);
    if(!ps){partitionValid=false;break;}
    used.add(c);used.add(d);pairs.push(...ps);
    blocks.push({kind:'horizontal-equal-height',columns:[c,d]});
   }
   if(partitionValid)for(const c of all){
    if(used.has(c))continue;
    const v=vertical(c);
    if(!v){partitionValid=false;break;}
    let alternate=null,delta=0;
    for(const d of all){
     if(d<=c||used.has(d)||q.h[c]!==q.h[d])continue;
     charge('sourceCandidateBlockComparisons');
     const h=horizontal(c,d),w=vertical(d);
     if(!h||!w)continue;
     const gain=coverage(pairs.concat(h))-coverage(pairs.concat(v,w));
     if(gain>delta){alternate={d,pairMasks:h};delta=gain;}
    }
    used.add(c);
    if(alternate){
     used.add(alternate.d);pairs.push(...alternate.pairMasks);
     blocks.push({kind:'horizontal-equal-height',columns:[c,alternate.d]});
    }else{
     pairs.push(...v);blocks.push({kind:'vertical-consecutive',columns:[c]});
    }
   }
   if(partitionValid) {
    let cellUnion=0n,collision=false;
    for(const pr of pairs){
     charge('sourceGeneratorMaskTests');
     if((cellUnion&pr)!==0n)collision=true;
     cellUnion|=pr;
    }
    const allFuture=legal.reduce((mask,c)=>{
     for(let r=q.h[c];r<H;r++){charge('sourceCellPairCreationTests');mask|=bit(c,r);}
     return mask;
    },0n);
    const allRequirementsCovered=targets.every(g=>pairs.some(pr=>{
     charge('sourcePairCoverageTests');
     return (g&pr)===pr;
    }));
    if(!collision&&cellUnion===allFuture&&pairs.length*2===empties&&allRequirementsCovered) {
     const valueBound=attacker===0?'P0_CANNOT_WIN':'P1_CANNOT_WIN';
     if(attacker===0)bounds.upper=Math.min(bounds.upper,0);
     else bounds.lower=Math.max(bounds.lower,0);
     pairCertificate={kind:'STATIC_ATTACKER_FIRST_DEFENDER_MATE_RESPONSE',
       moverAttacker:attacker,playerDefender:1-attacker,
       attackerCannotCompleteAnyResidualGenerator:true,
       pairedEveryFutureCell:true,
       capacityReleaseGuard:'vertical consecutive, or same-row same-height complete-column twin',
       sourceBlocks:blocks,sourcePairMasksHex:pairs.map(x=>'0x'+x.toString(16)),
       claim:valueBound};
     witness.push(pairCertificate);
    }
   }
  }
  if(bounds.lower>bounds.upper)throw Error('contradictory source full-future value bounds');
  stats.elapsedMs=Date.now()-began;
  return {schema:'connect4.source-global-no-win-bounds.v0_1',
   rank,mover,legalFirstActionLabels:legal,
   firstActionValueIntervals:legal.map(c=>({literalColumn:c,lower:bounds.lower,upper:bounds.upper})),
   fullGameRootInterval:[bounds.lower,bounds.upper],
   sourceProvenGlobalObstructions:witness,
   pairedResponseCertificate:pairCertificate,
   rootExactWDLCertified:bounds.lower===bounds.upper,
   exactWDLIfDetermined:bounds.lower===bounds.upper?bounds.lower:null,
   scopedTo:'Every continuation of q, hence EVERY legal first action, with original first-win/terminal/turn guards',
   statistics:stats};
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/co-release-global-no-win-bound.mjs BLOB 466dc988942c2b52086d7190828dd005f22b74c0
// Source-only attacker-first co-release pairing: certified full-future
// impossibility of victory for the CURRENT mover, for ALL legal first
// choices at once. First-win terminal/turn/gravity semantics guarded.
// No game continuation branching or solved policy evaluation.
function createCoReleaseGlobalNoWinBound(geometry){
 const {width:W,height:H}=geometry,
  matcher=createCoReleasePairBlockProof(geometry),N=W*H;
 function compute(q,{maxOperations=300000,maxMs=15000}={}){
  const rank=q.h.reduce((a,b)=>a+b,0),mover=rank%2,
   legal=q.h.flatMap((h,c)=>h<H?[c]:[]),
   ownRequirements=mover===0?q.R0:q.R1;
  let proof=null;
  if((N-rank)%2===0&&ownRequirements.length)
   proof=matcher.prove(q.h,ownRequirements,{maxOperations,maxMs});
  const proved=!!proof?.certifiedAttackerWinImpossible;
  const lower=proved&&mover===1?0:-1,
    upper=proved&&mover===0?0:1;
  return {schema:'connect4.global-co-release-attacker-no-win.v0_1',
   legalActionLabels:legal,
   firstActionValueIntervals:legal.map(c=>({literalColumn:c,lower,upper})),
   fullFutureAttackerCanNeverWinCertified:proved,
   originalSourcePairCertificate:proved?proof:null,
   candidateGameSemanticFutureFanout:0,
   statistics:{sourceProofOperations:proof?.statistics.sourceOperations??0,
    matchedPairsConstructed:proof?.sourceBlocks?.length??0,
    originalSourceLiveAttackerRequirements:ownRequirements.length,
    sourceQChildrenMaterialized:0,gameContinuationSearchCalls:0}};
 }
 return Object.freeze({compute,width:W,height:H,connect:geometry.connect});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/co-release-after-first-move-nonloss-bounds.mjs BLOB 0ec449cfaf777ffa9acb2ce380fa151104659ec5
// Source-only FIRST-ACTION full-future WIN impossibility / defensive
// pairing. No next(q,c), no future game-state value/policy evaluation;
// scans the ORIGINAL q and hypothetical source literal cofactor formulas.
// Static matching witness enumeration ranges over column-pair BLOCKS,
// never over strategic game plays or alternating game continuations.
function createCoReleaseAfterFirstMoveNonlossBounds({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('invalid gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),proof=createCoReleasePairBlockProof({width:W,height:H,connect:K});
 function compute(q,{maxOperations=300000,maxMs=15000,maxStaticPairings=10000}={}){
  const begin=Date.now(),rank=q?.h?.reduce((a,b)=>a+b,0);
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     q.R0.some(x=>typeof x!=='bigint'||x<=0n)||
     q.R1.some(x=>typeof x!=='bigint'||x<=0n))
    throw Error('expected normalized legal nonterminal q');
  if(rank>=N)throw Error('source already full board');
  const mover=rank&1,legal=q.h.flatMap((h,c)=>h<H?[c]:[]);
  const stats={
   literalFirstActionSourceSlices:0,ownerSingletonSourceChecks:0,
   opponentOriginalRequirementBlockerChecks:0,
   targetGeneratorSubsetChecks:0,sourcePairCandidateBlocksBuilt:0,
   sourcePairBlockCoverageChecks:0,sourceColumnMatchingStates:0,
   staticPairingCertificatesFound:0,staticCompleteColumnPartitionsEvaluated:0,
   sourcePerActionWDLBoundsFixed:0,sourcePerActionDrawsProved:0,
   sourceThreatSingletonOverrides:0,sourceFirstWinTerminalGuards:0,
   successorGameStateObjectsConstructed:0,
   futureSemanticChoicesEvaluated:0,futureGameTreesSearched:0,
   solvedPolicyOrOutcomeOracleQueries:0,
   sourceCoReleaseOperations:0,sourceCoReleasePairCertificatesFound:0,
   sourceOperations:0,elapsedMs:0
  };
  class Limit extends Error{constructor(kind){super('SOURCE_PAIRING_'+kind+'_LIMIT');this.kind=kind;}}
  function count(key){stats[key]++;stats.sourceOperations++;
   if(stats.sourceOperations>maxOperations)throw new Limit('OPERATIONS');
   if(Date.now()-begin>maxMs)throw new Limit('TIME');
  }
  const owners=mover===0?q.R0:q.R1,opponents=mover===0?q.R1:q.R0;
  const wantWin=mover===0?1:-1,wantLoss=-wantWin;
  // Static source proof witness at a fixed ATTACKER-FIRST future support,
  // following an already modelled original first move by the defender.
  function coverByGravitySafePairing(afterHeights,attackerRequirements){
    // Original source cofactor constraints for hypothetical first action,
    // NOT a descendant game's strategic WDL evaluation.
    const z=proof.prove(afterHeights,attackerRequirements,{
      maxOperations:Math.max(1,maxOperations-stats.sourceOperations),
      maxMs:Math.max(1,maxMs-(Date.now()-begin)),
      maxStaticWitnessStates:10000});
    stats.sourceCoReleaseOperations+=z.statistics.sourceOperations;
    stats.sourceOperations+=z.statistics.sourceOperations;
    if(stats.sourceOperations>maxOperations||Date.now()-begin>maxMs||
       z.status==='RESOURCE_INCOMPLETE')throw new Limit(z.why||'OPERATIONS');
    if(z.certifiedAttackerWinImpossible){
      stats.staticPairingCertificatesFound++;
      stats.sourceCoReleasePairCertificatesFound++;
      return z;
    }
    return null;
  }
  const intervals=[],sourceProofs=[];
  try{
   for(const c of legal){
    count('literalFirstActionSourceSlices');
    const played=bit(c,q.h[c]);
    count('ownerSingletonSourceChecks');
    if(owners.some(m=>m===played)){
     stats.sourceFirstWinTerminalGuards++;
     intervals.push({literalColumn:c,lower:wantWin,upper:wantWin});
     sourceProofs.push({literalColumn:c,exactFirstWinByMover:true,sourceLanding:'0x'+played.toString(16)});
     continue;
    }
    if(rank+1===N){
     stats.sourceFirstWinTerminalGuards++;
     intervals.push({literalColumn:c,lower:0,upper:0});
     sourceProofs.push({literalColumn:c,exactFullBoardNonwinningDraw:true});
     continue;
    }
    const opponentAfter=[];
    for(const r of opponents){
     count('opponentOriginalRequirementBlockerChecks');
     if((r&played)===0n)opponentAfter.push(r);
    }
    let low=-1,high=1;
    const reasons=[];
    if(owners.length===0){
     if(mover===0)high=Math.min(high,0);
     else low=Math.max(low,0);
     reasons.push({kind:'SOURCE_MOVER_WIN_REQUIREMENTS_ALREADY_EMPTY'});
    }
    if(opponentAfter.length===0){
     if(mover===0)low=Math.max(low,0);
     else high=Math.min(high,0);
     reasons.push({kind:'FIRST_MOVE_BLOCKS_ALL_OPPONENT_WIN_REQUIREMENTS'});
    }else {
     const heights=q.h.slice();heights[c]++;
     const staticPair=coverByGravitySafePairing(heights,opponentAfter);
     if(staticPair){
      if(mover===0)low=Math.max(low,0);
      else high=Math.min(high,0);
      reasons.push({kind:'POST_FIRST_ACTION_OPPONENT_ATTACK_FIRST_SOURCE_PAIR_DEFENSE',
       sourcePairWitness:staticPair});
     }
    }
    if(low>high)throw Error('contradictory first-action source full-future WDL bounds');
    if(low===high)stats.sourcePerActionDrawsProved++;
    if(low>-1||high<1)stats.sourcePerActionWDLBoundsFixed++;
    intervals.push({literalColumn:c,lower:low,upper:high});
    sourceProofs.push({literalColumn:c,
      sourceOwnerPlayedLanding:'0x'+played.toString(16),
      sourceOpponentRequirementsSurvivingFirstMove:opponentAfter.length,
      exactScalarWDLCertified:low===high,sourceConsequenceReasons:reasons});
   }
  }catch(e){
   if(e instanceof Limit)return {status:'SOURCE_CERTIFICATE_BUDGET_PARTIAL',
     reason:e.kind,legalActionLabels:legal,verifiedPrefixIntervals:intervals,
     statistics:{...stats,elapsedMs:Date.now()-begin},
     noUnexaminedActionClassified:true};
   throw e;
  }
  stats.elapsedMs=Date.now()-begin;
  return {status:'COMPLETE_SOURCE_ACTION_WDL_BOUNDS',
   legalActionLabels:legal,rank,mover,
   firstActionValueIntervals:intervals,
   exactActionWDLBySource:intervals.filter(x=>x.lower===x.upper).map(x=>[x.literalColumn,x.lower]),
   certifiedNoLossPairingOrExtinctionMoves:sourceProofs.filter(x=>x.sourceConsequenceReasons?.some(r=>r.kind.includes('PAIR_DEFENSE')||r.kind.includes('BLOCKS_ALL'))).map(x=>x.literalColumn),
   sourceCertificates:sourceProofs,
   statistics:stats,
   fullGameValueClaimed:false,
   sourceSemanticFutureFanout:0,
   sourceCandidateMoveAlgebraScanned:true,
   sourceAlternativeGameValuesEvaluated:false};
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-single-forced-threat-ladder.mjs BLOB 64d7ec5cc5fc220ebeae2649cbaff70b95c3382b
// ORIGINAL 7x6 first-win-stopped q SOURCE proof producer.
// Follows ONE strategically forced opponent reply lane at each rank.
// No recursive WDL, no game-tree expansion or alternative q future values.
// If selected forced ladder fails, returns INCOMPLETE; no backtracking.
// Frozen theorem: docs/research/2026-10-17-one-lane-forced-threat-ladder-source-win-witness.md
function createSingleForcedThreatLadder({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid first-win gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 const core=createExactQCore({width:W,height:H,connect:K});
 const local=createSourceGravityResponseCover({width:W,height:H,connect:K});
 function compute(q,{maxSourceTests=300000}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||!Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('first-win stopped exact q expected');
  const originalPlayer=q.h.reduce((a,b)=>a+b,0)&1;
  const stat={
   sourceOriginalCurrentActionScans:0,
   sourceResidualMembershipChecks:0,
   staticSingleThreatCandidatesConsidered:0,
   selectedOneLaneForcedTwoPlyTransitions:0,
   sourceQStatesMaterializedAlongOneLane:0,
   directSourceBoundaryChecks:0,
   sourceStrategicContinuationLaneFanoutMax:0,
   independentFutureGameWDLValueQueries:0,
   hiddenAlternativeGameContinuationGraphsConstructed:0,
   selectedForcedRounds:0,
   sourceMaximumFutureLaneDepth:0
  };
  function charge(){stat.sourceResidualMembershipChecks++;
    if(stat.sourceResidualMembershipChecks>maxSourceTests)
     throw Error('original source algebra structural operation guard exceeded');}
  function inspectForcedCandidates(node,p){
   const {h,R0,R1}=node,n=h.reduce((s,x)=>s+x,0),own=p===0?R0:R1,
    enemy=p===0?R1:R0,sets=[new Set(own.map(String)),new Set(enemy.map(String))];
   const legal=h.flatMap((v,c)=>v<H?[c]:[]);
   const picked=[];
   for(const a of legal){
    stat.sourceOriginalCurrentActionScans++;
    const x=bit(a,h[a]);charge();if(sets[0].has(String(x)))continue;
    if(n+1>=N)continue;
    const nextFrontier=legal.flatMap(d=>{
     const row=h[d]+(d===a?1:0);
     return row<H?[{d,row,y:bit(d,row)}]:[];
    });
    let counterWin=false;for(const f of nextFrontier){charge();
     if(sets[1].has(String(f.y))){counterWin=true;break;}
    }
    if(counterWin)continue;
    const S=[];
    for(const f of nextFrontier){
     charge();const first=sets[0].has(String(f.y));
     charge();const second=sets[0].has(String(x|f.y));
     if(first||second)S.push(f.d);
    }
    if(S.length!==1)continue;
    const b=S[0],landing=nextFrontier.find(x=>x.d===b),zRow=landing.row+1;
    const z=zRow<H?bit(b,zRow):null;
    if(z!==null){
      charge();const already=sets[0].has(String(z));
      charge();const xPair=sets[0].has(String(x|z));
      if(already||xPair)continue; // the direct stacked source theorem already wins
    }
    const sourceIncidence=own.reduce((score,G)=>{
      charge();return score+((G&x)!==0n?1:0);
    },0);
    stat.staticSingleThreatCandidatesConsidered++;
    picked.push({a,b,sourceIncidence,
      directThreatRow:landing.row,
      sourceProof:{
       selectedPAction:a+1,
       uniqueForcedOpponentBlockColumn:b+1,
       rankAtPAction:n,
       allOpponentImmediateWinningColumnsExcluded:true,
       singleCurrentlyPlayableOwnerWinningThreat:true,
       originalOwnerThreatKind:'singleton target or contracted original two-cell generator',
       permittedOpponentDeviationOutcome:'immediate owner P win at blocked column',
       noAlternativeForcedLaneEvaluated:true
      }});
   }
   // FIXED deterministic source q-only priority; no future q is
   // created for unselected candidates. Same rule at every forced rank.
   picked.sort((a,b)=>b.sourceIncidence-a.sourceIncidence||
     a.a-b.a||a.b-b.b);
   return picked[0]??null;
  }
  function run(node,p,depth){
   const n=node.h.reduce((s,x)=>s+x,0);
   if((n&1)!==p)throw Error('source forced chain parity violation');
   stat.sourceMaximumFutureLaneDepth=Math.max(stat.sourceMaximumFutureLaneDepth,depth);
   stat.directSourceBoundaryChecks++;
   const direct=local.compute(node);
   if(direct.status==='VALID_CONTINUATION'){
    return {status:'VALID_CONTINUATION',winningOriginalFirstAction:direct.selectedOriginalLiteralColumn,
     forcedRoundsFromThisNode:0,proofSteps:[{kind:'DIRECT_SOURCE_NEXT_OWNER_TURN_WIN',
      literalPAction:direct.selectedOriginalLiteralColumn,
      sourceCertificate:direct.sourceCertificate}]};
   }
   const candidate=inspectForcedCandidates(node,p);
   if(!candidate)
    return {status:'INCOMPLETE',reason:'NO_DIRECT_OR_ONE_SELECTED_FORCED_THREAT_CERTIFICATE',proofSteps:[]};
   stat.sourceStrategicContinuationLaneFanoutMax=Math.max(stat.sourceStrategicContinuationLaneFanoutMax,1);
   // EXACTLY ONE candidate p action and the matching unique forced
   // opponent reply are used to construct future q. Other moves are
   // proven locally losing for opponent (immediate p next first-win).
   const aStep=core.next(node,candidate.a);
   stat.sourceQStatesMaterializedAlongOneLane++;
   if(aStep.terminal!==undefined)
    return {status:'INCOMPLETE',reason:'UNEXPECTED_TERMINAL_ON_SELECTED_SOURCE_P_ACTION',proofSteps:[]};
   const bStep=core.next(aStep.q,candidate.b);
   stat.sourceQStatesMaterializedAlongOneLane++;
   stat.selectedOneLaneForcedTwoPlyTransitions++;
   stat.selectedForcedRounds++;
   if(bStep.terminal!==undefined)
    return {status:'INCOMPLETE',reason:'BLOCKING_REPLY_EARLY_TERMINAL_OR_DRAW',proofSteps:[]};
   const suffix=run(bStep.q,p,depth+1);
   if(suffix.status!=='VALID_CONTINUATION')
    return {status:'INCOMPLETE',reason:'SELECTED_SINGLE_STRATEGIC_LANE_DID_NOT_PROVE_WIN',
     selectedFailureLane:[candidate.sourceProof,...(suffix.selectedFailureLane??[])],proofSteps:[]};
   return {status:'VALID_CONTINUATION',
     winningOriginalFirstAction:candidate.a+1,
     forcedRoundsFromThisNode:suffix.forcedRoundsFromThisNode+1,
     proofSteps:[{kind:'SINGLE_WIN_THREAT_FORCES_ONE_BLOCKING_REPLY',
      ...candidate.sourceProof},...suffix.proofSteps]};
  }
  const answer=run(q,originalPlayer,0);
  return {status:answer.status,
    selectedOriginalLiteralColumn:answer.winningOriginalFirstAction??null,
    certifiedOwner:answer.status==='VALID_CONTINUATION'?originalPlayer:null,
    sourceForcedReplyRounds:answer.forcedRoundsFromThisNode??0,
    reason:answer.reason??'ONE_LANE_SOURCE_GUARANTEED_FIRST_WIN',
    certificate:answer.status==='VALID_CONTINUATION'?
      {mover:originalPlayer,proofSteps:answer.proofSteps,
       allOpponentNonForcedRepliesLoseImmediately:true,
       noDifferentlyValuedFutureGameQueries:true,
       selectedSingleForcedReplyLaneOnly:true}:null,
    failedSelectedLaneSourceDetails:answer.selectedFailureLane??null,
    statistics:stat};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-one-action-root-noforce-win-draw-certificate.mjs BLOB d502e97b8a7f272479d6c8418070411d65d850b5
// Exact ORIGINAL-q source two-certificate DRAW Level2 single move proof.
// Strong root: current mover cannot FORCE WIN. Strong action: mover can
// GUARANTEE NOT LOSING after first action. Therefore action is best DRAW.
// No strategic q successors / future game value queries; only original
// source cell masks, structured residuals and release-safe static pairs.
// Mathematical theorem frozen:
// docs/research/2026-10-17-source-root-win-exclusion-plus-one-action-draw-witness.md
function createRootNoForceWinSingleDrawWitness(geometry){
 const {width:W,height:H,connect:K}=geometry,N=W*H;
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||K>Math.min(W,H)||N>42)
  throw Error('unsupported original game geometry');
 const globalNoWin=createGlobalNoWinBound(geometry),
  coGlobal=createCoReleaseGlobalNoWinBound(geometry),
  postAction=createCoReleaseAfterFirstMoveNonlossBounds(geometry);
 function compute(q,{maxOperations=12000,maxMs=45,maxStaticPairings=1400}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
      q.h.some(v=>!Number.isInteger(v)||v<0||v>H)||
      !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('source q expected');
  const rank=q.h.reduce((s,x)=>s+x,0),p=rank&1,legal=q.h.flatMap((v,c)=>v<H?[c]:[]);
  if(rank>=N||!legal.length)throw Error('nonterminal original source required');
  const stats={originalSourceRootScans:1,staticGlobalPairingWork:0,
   coReleaseGlobalOriginalProofWork:0,staticPostActionPairProofWork:0,
   originalLiteralActionsConsideredForNoLoss:0,
   sourceGameFutureQStatesCreated:0,sourceGameFutureValuesQueried:0,
   sourceStrategyTreesOrBQBFConstructed:0,
   maxStrategicGameSemanticFanout:0,sourceProofTimeBudgetIncomplete:0};
  const own=p===0?q.R0:q.R1;
  let rootSource=null,rootInterval=null;
  if(own.length===0){
   rootSource={kind:'ROOT_MOVER_NO_ORIGINAL_SURVIVING_K_LINE',proof:'No possible mover win at ANY future original first terminal; root p cannot force win'};
   rootInterval=p===0?[-1,0]:[0,1];
  }else{
   try{
    const first=globalNoWin.compute(q,{maxOperations,maxMs});
    stats.staticGlobalPairingWork=first.statistics.originalSourceWorkUnits;
    const bound=first.fullGameRootInterval;
    if((p===0&&bound[1]<=0)||(p===1&&bound[0]>=0)){
     rootInterval=bound;
     rootSource={kind:'GLOBAL_ORIGINAL_SOURCE_NO_FORCED_MOVER_WIN',
      proof:first.sourceProvenGlobalObstructions};
    }
   }catch(e){stats.sourceProofTimeBudgetIncomplete++;}
   if(!rootSource){
    try{
     const c=coGlobal.compute(q,{maxOperations,maxMs});
     stats.coReleaseGlobalOriginalProofWork=c.statistics.sourceProofOperations;
     if(c.fullFutureAttackerCanNeverWinCertified){
      rootSource={kind:'GLOBAL_CO_RELEASE_PAIR_ATTACKER_FIRST_NO_MOVER_FORCED_WIN',
       proof:c.originalSourcePairCertificate};
      rootInterval=p===0?[-1,0]:[0,1];
     }
    }catch(e){stats.sourceProofTimeBudgetIncomplete++;}
   }
  }
  if(!rootSource)return {status:'INCOMPLETE',reason:'ROOT_NO_FORCED_WIN_NOT_CERTIFIED',
   rootNoForcedWinProved:false,selectedOriginalLiteralColumn:null,statistics:stats};
  // Source purely symbolic first-action pair/capacity checks; no
  // alternate q or WDL is constructed. All source predeclared static
  // pairing alternatives must be counted as structural certificate work.
  let per;
  try{per=postAction.compute(q,{maxOperations,maxMs,maxStaticPairings});
  }catch(e){stats.sourceProofTimeBudgetIncomplete++;
   return {status:'INCOMPLETE',reason:'POST_ACTION_NONLOSS_PAIR_CERTIFICATE_BUDGET',
    rootNoForcedWinProved:true,rootSourceProof:rootSource,statistics:stats};}
  stats.staticPostActionPairProofWork=per.statistics?.sourceOperations??0;
  if(per.status!=='COMPLETE_SOURCE_ACTION_WDL_BOUNDS')
   return {status:'INCOMPLETE',reason:'POST_ACTION_STATIC_PAIR_SOURCE_INCOMPLETE',
    rootNoForcedWinProved:true,rootSourceProof:rootSource,statistics:stats};
  stats.originalLiteralActionsConsideredForNoLoss=per.firstActionValueIntervals.length;
  for(const x of per.firstActionValueIntervals){
   if(!legal.includes(x.literalColumn))throw Error('source interval unknown literal action');
   if((p===0&&x.lower>=0)||(p===1&&x.upper<=0)){
    const reason=per.sourceCertificates.find(z=>z.literalColumn===x.literalColumn);
    return {status:'VALID_CONTINUATION',
     kind:'ROOT_NO_FORCED_WIN_PLUS_FIRST_ACTION_NO_FORCED_LOSS_PROVES_DRAW',
     mover:p,selectedOriginalLiteralColumn:x.literalColumn+1,
     exactRootOutcomeP0Relative:0,
     exactChosenFirstActionOutcomeP0Relative:0,
     rootNoForcedWinProved:true,
     exactRootIntervalSource:rootInterval,
     rootSourceProof:rootSource,
     chosenActionNonLossSourceProof:reason,
     chosenActionOriginalP0RelativeSourceInterval:[x.lower,x.upper],
     fullLevel2SetClaimed:false,
     independentlyValuedAlternativeFutureGames:0,statistics:stats};
   }
  }
  return {status:'INCOMPLETE',
    reason:'ROOT_CANNOT_FORCE_WIN_BUT_NO_PROVEN_DRAW_PRESERVING_FIRST_ACTION',
    rootNoForcedWinProved:true,rootSourceProof:rootSource,
    selectedOriginalLiteralColumn:null,statistics:stats};
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-inevitable-loss-source-dual-packing.mjs BLOB 6f4fddaf7c8878ce8dedd1646212b51d40c9d949
// One-source ORIGINAL q fractional packing inevitable opponent first win.
// Returns any one original literal legal action as certified Level2 best,
// because all legal alternatives necessarily lose (no WDL future queries).
// Mathematical proof: docs/research/2026-10-17-source-inevitable-loss-dual-packing-any-L2-move.md
function createOriginalSourceInevitableLossBest({width:W,height:H,connect:K}){
 const core=createSourceFractionalTransversal({width:W,height:H,connect:K}),N=W*H;
 function compute(q,{denominators=[1,2,3,4,6,8,12]}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(h=>!Number.isInteger(h)||h<0||h>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('requires original nonterminal q');
  const n=q.h.reduce((a,v)=>a+v,0),p=n&1,o=1-p,
   legal=q.h.flatMap((v,c)=>v<H?[c]:[]);
  if(n>=N||!legal.length)throw Error('not first-win-stopped nonterminal');
  const own=p===0?q.R0:q.R1,other=p===0?q.R1:q.R0,
   stat={originalLiteralLegalColumns:legal.length,
    originalWinGeneratorsCurrentMover:own.length,
    originalWinGeneratorsOpposite:other.length,
    staticOriginalFractionalPackingWitnessAttempts:0,
    staticPerCellPackingLoadChecks:0,
    independentFutureGameValueEvaluations:0,
    sourceAlternativeStrategicGameQConstructed:0,
    sourceGameStrategicFanout:0};
  if(own.length) return {status:'INCOMPLETE',
   reason:'CURRENT_MOVER_STILL_HAS_ORIGINAL_VIABLE_WIN_REQUIREMENTS',
   rootValueClaimed:false,statistics:stat};
  const packing=core.prove({h:q.h,R:[q.R0,q.R1]},o,{denominators});
  stat.staticOriginalFractionalPackingWitnessAttempts=packing.statistics.attemptedStaticWeightVectors;
  stat.staticPerCellPackingLoadChecks=packing.statistics.witnessCellIncidenceChecks;
  if(packing.status!=='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN')
   return {status:'INCOMPLETE',reason:'NO_OPPONENT_FRACTIONAL_OVERLOAD_CERTIFICATE',
    rootValueClaimed:false,sourcePackingAttempt:packing,statistics:stat};
  const totalCurrentMoverTurns=Math.ceil((N-n)/2);
  const D=packing.witness.denominator,sum=packing.witness.sumNumerator;
  if(packing.opponent!==p||packing.attacker!==o||
     packing.opponentTotalTurns!==totalCurrentMoverTurns||
     sum<=D*totalCurrentMoverTurns)
   throw Error('packing theorem wrongly interpreted owner parity');
  return {status:'VALID_CONTINUATION',kind:'INEVITABLE_MOVER_LOSS_ANY_LITERAL_ACTION_BEST',
   exactRootP0RelativeWDL:o===0?1:-1,
   selectedOriginalLiteralColumn:legal[0]+1,
   allOriginalLiteralLegalBestMoves:legal.map(c=>c+1),
   fullLevel2SetCertified:true,
   guaranteedFirstWinningPlayer:o,
   originalCurrentMoverCannotWinProof:'No current mover original residual K-winning generators survive',
   opponentHypergraphExcessProof:packing.witness,
   moverTurnsAvailableUntilFullBoard:totalCurrentMoverTurns,
   firstWinBeforeNonwinningDrawGuard:true,
   opponentWinsAgainstEveryFutureMoveSequence:true,
   sourceStrategicFutureValueQueries:0,
   statistics:stat};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-pair-defense-plus-dual-overload-source.mjs BLOB e5ae5466915ada351011eac8a1d1edeee90cb254
// SOURCE-ONLY p forced LOSS despite R_p possibly nonempty.
// One fixed gravity co-release opponent response policy stops EVERY p win,
// while fractional original o winning-line packing > p remaining turns
// forces o win before a full-board draw. ZERO alternative game values.
// Frozen proof: docs/research/2026-10-17-adaptive-gravity-pairing-plus-opponent-overload-forced-loss.md
function createPairDefenseDualOverloadLoss({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid true gravity original K game');
 const N=W*H,matcher=createCoReleasePairBlockProof({width:W,height:H,connect:K}),
  dual=createSourceFractionalTransversal({width:W,height:H,connect:K});
 const bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=8000,maxMs=25,maxStaticWitnessStates=2000,
    denominators=[1,2,3,4,6,8,12]}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(v=>!Number.isInteger(v)||v<0||v>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x<=0n))
   throw Error('expected ordinary normalized NONTERMINAL source q');
  const n=q.h.reduce((s,v)=>s+v,0),p=n&1,o=1-p,T=N-n,
   legal=q.h.flatMap((v,c)=>v<H?[c]:[]);
  if(n>=N||!legal.length)throw Error('not original first-win-stopped nonterminal');
  const own=p===0?q.R0:q.R1,other=p===0?q.R1:q.R0;
  const stats={originalSourceRank:n,mover:p,opponent:o,
   originalViableMoverGenerators:own.length,originalViableOpponentGenerators:other.length,
   originalFutureCellCount:T,currentMoverFutureBlockingTurns:Math.ceil(T/2),
   staticDualWeightVectorsExamined:0,staticDualCellIncidenceChecks:0,
   staticPairBlockOptionsTried:0,staticPairPartitionsVisited:0,
   staticPairCoverageChecks:0,sourceCrossoverEqualOrdinalPairs:0,
   sourceOriginalPairingPhysicalCellsIndependentlyChecked:0,
   sourceOriginalDualCapacityChecks:0,
   rootGameSuccessorsConstructed:0,rootOtherLiteralActionWDLQueries:0,
   independentStrategicFutureGameValuesEvaluated:0,
   sourceStrategicGameFanout:0,sourceStrategyGraphEnumerations:0,
   sourcePairingBudgetIncomplete:0};
  if(own.length===0)return {status:'INCOMPLETE',
    reason:'ALREADY_COVERED_BY_OLDER_EXTINCT_P_WINLINE_CONDITION',
    selectedOriginalLiteralColumn:null,statistics:stats};
  if(T%2!==0)return {status:'INCOMPLETE',reason:'REQUIRES_DEFENDER_AS_SECOND_WITH_EVEN_REMAINING_CELLS',
    selectedOriginalLiteralColumn:null,statistics:stats};
  // Cheap STATIC packing overload first: if impossible no reason to
  // construct a gravity-safe full-cell matching.
  const packed=dual.prove({h:q.h,R:[q.R0,q.R1]},o,{denominators});
  stats.staticDualWeightVectorsExamined=packed.statistics.attemptedStaticWeightVectors;
  stats.staticDualCellIncidenceChecks=packed.statistics.witnessCellIncidenceChecks;
  if(packed.status!=='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN')
   return {status:'INCOMPLETE',reason:'NO_OPPONENT_SOURCE_DUAL_OVERLOAD',
    selectedOriginalLiteralColumn:null,statistics:stats};
  const capacity=T/2;
  if(packed.opponent!==p||packed.attacker!==o||
    packed.opponentTotalTurns!==capacity||
    packed.witness.sumNumerator<=capacity*packed.witness.denominator)
   throw Error('dual original player capacity guard contradiction');
  const pairing=matcher.prove(q.h,own,{
    maxOperations,maxMs,maxStaticWitnessStates});
  stats.staticPairBlockOptionsTried=pairing.statistics.staticBlockOptionsTried??0;
  stats.staticPairPartitionsVisited=pairing.statistics.staticColumnPartitionProofStates??0;
  stats.staticPairCoverageChecks=pairing.statistics.sourceRequirementCoverageTests??0;
  if(pairing.status==='RESOURCE_INCOMPLETE')stats.sourcePairingBudgetIncomplete++;
  if(!pairing.certifiedAttackerWinImpossible||
     !pairing.allSourceFutureCellsPaired||
     !pairing.allAttackerWinningRequirementsContainDefenderPair)
   return {status:'INCOMPLETE',
    reason:pairing.status==='RESOURCE_INCOMPLETE'?'SOURCE_STATIC_PAIRING_BUDGET':'NO_FULL_GRAVITY_SAFE_ALL_ATTACKER_LINES_PAIR',
    selectedOriginalLiteralColumn:null,
    opponentPackingFirstWitness:packed.witness,
    statistics:stats};
  // Independent explicit CERTIFICATE recheck using source q and raw
  // pairing blocks: all WH-n cells disjoint/exhaustively paired and
  // every original mover G contains the full physical pair.
  const pairs=pairing.sourceBlocks.flatMap(group=>group.sourcePairMasksHex.map(BigInt));
  let union=0n;
  for(const pair of pairs){
   if((pair&union)!==0n)throw Error('dual pairing source cells collided');
   union|=pair;
   stats.sourceOriginalPairingPhysicalCellsIndependentlyChecked+=2;
  }
  let allFuture=0n;
  for(let c=0;c<W;c++)for(let r=q.h[c];r<H;r++)allFuture|=bit(c,r);
  if(pairs.length!==T/2||union!==allFuture||own.some(G=>!pairs.some(pair=>(pair&G)===pair)))
   throw Error('opponent response pairing physical/source requirement mismatch');
  const loads=Array(N).fill(0),D=packed.witness.denominator,
   nums=packed.witness.numerators.map(Number);
  if(nums.length!==other.length)throw Error('fractional o dual vector dimension inconsistent');
  let sum=0;
  for(let i=0;i<other.length;i++){
   if(!Number.isInteger(nums[i])||nums[i]<0)throw Error('source rational dual numerator invalid');
   sum+=nums[i];
   for(let j=0;j<N;j++){
    if((other[i]&(1n<<BigInt(j)))!==0n){loads[j]+=nums[i];stats.sourceOriginalDualCapacityChecks++;}
   }
  }
  if(loads.some(z=>z>D)||sum!==packed.witness.sumNumerator||sum<=capacity*D)
   throw Error('opponent o source hypergraph fractional dual load/capacity invalid');
  return {status:'VALID_CONTINUATION',
   kind:'ADAPTIVE_OPPONENT_PAIR_DEFENSE_PLUS_SOURCE_WINLINE_DUAL_OVERLOAD',
   certifiedFirstWinningPlayer:o,certifiedLosingCurrentPlayer:p,
   exactRootP0RelativeWDL:o===0?1:-1,
   selectedOriginalLiteralColumn:legal[0]+1,
   allOriginalLiteralEquallyBestLosingMoves:legal.map(c=>c+1),
   completeLossTierLevel2SetCertified:true,
   sourceUniformDefenderReplyPolicy:pairing.sourceBlocks,
   sourceDualOpponentWinCertificate:packed.witness,
   originalMoverStillHasViableWinlines:true,
   sourceStrictOverloadOfMoverBlockingTurns:sum/D-capacity,
   currentMoverMaximumRemainingBlockingTurns:capacity,
   sourceFullGameFirstWinAgainstEveryMoverPolicy:true,
   independentlyValuedFutureGameWDLQueries:0,
   statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-odd-spare-col-co-release-no-win-source.mjs BLOB 1b39c79cf3789ac70832c69f646b729aaced6eb6
// ORIGINAL-q source-only odd future cell count NO-FORCED-MOVER-WIN
// source witness with ONE unmatched currently playable LAST source
// column cell (remaining capacity exactly 1) plus o-second safe pair
// block structure on every other future cell.
// No game q future, WDL oracle, policy graph, minimax or future search.
// Frozen before physical test theorem:
// docs/research/2026-10-17-odd-gravity-spare-cell-co-release-defensive-pairing.md
function createOddSpareColCoReleaseNoWin({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('unsupported original gravity board');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
  matcher=createCoReleasePairBlockProof({width:W,height:H,connect:K});
 function compute(q,{maxOperations=14000,maxMs=50,maxStaticWitnessStates=3500}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(z=>!Number.isInteger(z)||z<0||z>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x<=0n))
    throw Error('first-win-stopped original source q=(h,R0,R1) expected');
  const n=h.reduce((s,z)=>s+z,0),T=N-n,p=n&1,own=p===0?q.R0:q.R1;
  if(T<=0)throw Error('already terminal original source');
  const stats={rootPly:n,remainingPhysicalCells:T,
   originalCurrentMoverLiveKRequirements:own.length,
   sourceCapacityOneUnmatchedColumnsConsidered:0,
   sourceStaticMatchingCandidateSetsConstructed:0,
   sourceStaticBlockMatchingWorkOps:0,sourceStaticBlockRepresentativesVisited:0,
   sourceStaticOpponentPairResponsePoliciesConstructed:0,
   sourceOriginalPairWinlineIncidenceChecks:0,
   sourceOriginalPhysicalFutureCellCoverageChecks:0,
   sourceGameSuccessorQMaterializations:0,sourceFutureGameWDLValueQueries:0,
   sourceStrategyTreeAlternativesConstructed:0,
   sourceGameStrategicFanout:0,
   sourceStaticProofResourceIncomplete:0};
  if(T%2===0)return{status:'INCOMPLETE',
    reason:'EVEN_REMAINING_CAPACITY_OLD_DIRECT_DEFENDER_PAIR_POLICY',
    sourceCannotForceCurrentMoverWin:false,statistics:stats};
  if(!own.length)return{status:'INCOMPLETE',
    reason:'MOVER_ALREADY_HAS_ZERO_WINLINES_OLD_SOURCE_NO_WIN_THEOREM',
    sourceCannotForceCurrentMoverWin:true,
    selectedUnmatchedLiteralColumn:null,statistics:stats};
  const candidate=h.flatMap((z,c)=>H-z===1?[c]:[]);
  if(!candidate.length)return {status:'INCOMPLETE',
    reason:'NO_ORIGINAL_SOURCE_COLUMN_WITH_EXACTLY_ONE_IMMEDIATELY_PLAYABLE_LAST_CELL',
    sourceCannotForceCurrentMoverWin:false,statistics:stats};
  for(const u of candidate){
   stats.sourceCapacityOneUnmatchedColumnsConsidered++;
   const heights=h.slice();heights[u]=H;
   let result;
   try{
    stats.sourceStaticMatchingCandidateSetsConstructed++;
    result=matcher.prove(heights,own,{
      maxOperations,maxMs,maxStaticWitnessStates});
   }catch(e){
    // Existing matcher can throw this resource guard DURING its static
    // block-candidate construction (before its DFS catch); this is
    // UNKNOWN source proof, never a negative strategic result.
    if(/^CO_RELEASE_PAIR_.*_LIMIT$/.test(String(e.message))){
      stats.sourceStaticProofResourceIncomplete++;
      continue;
    }
    throw e;
   }
   stats.sourceStaticBlockMatchingWorkOps+=result.statistics?.sourceOperations??0;
   stats.sourceStaticBlockRepresentativesVisited+=
    result.statistics?.staticColumnPartitionProofStates??0;
   if(result.status==='RESOURCE_INCOMPLETE'){stats.sourceStaticProofResourceIncomplete++;continue;}
   if(!result.certifiedAttackerWinImpossible||!result.allSourceFutureCellsPaired||
    !result.allAttackerWinningRequirementsContainDefenderPair)continue;
   // CRITICAL original true7x6 falsifier: a dangling preemptively
   // o-marked cross pair j can release the NEXT cross pair j+1 on one
   // source column WITHOUT making its mate gravity playable in the
   // other column. The standard even-T co-release matcher assumes
   // previous cross-prefix pairs COMPLETE. Odd pending policy breaks
   // that assumption. Only ZERO/ONE cross-prefix pairs per block are
   // safely preemptable in the current one-dangling-token proof.
   // See 2026-10-17-odd-spare-gravity-cross-prefix-rejection-and-safe-restriction.md
   if(result.sourceBlocks.some(b=>
       b.kind==='CO_RELEASE_PREFIX_AND_VERTICAL_TAILS'&&
       b.crossPairPrefixLength>1)){
     stats.sourceReturnedUnsafeLongCrossPrefixRejected=
       (stats.sourceReturnedUnsafeLongCrossPrefixRejected??0)+1;
     continue;
   }
   const pairs=result.sourceBlocks.flatMap(b=>b.sourcePairMasksHex.map(BigInt));
   let cells=0n;
   for(const P of pairs){
    if((P&cells)!==0n)throw Error('source pair witness repeats original cell');
    cells|=P;
    stats.sourceOriginalPhysicalFutureCellCoverageChecks+=2;
   }
   let future=0n;
   for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(c,r);
   const unmatched=bit(u,h[u]);
   if(pairs.length*2!==T-1||(cells|unmatched)!==future||
     (cells&unmatched)!==0n)throw Error('odd source pair plus spare failed physical support coverage');
   for(const G of own){
    stats.sourceOriginalPairWinlineIncidenceChecks++;
    if(!pairs.some(P=>(G&P)===P))
     throw Error('mover original winning generator not covered by complete pair outside spare');
   }
   // The coRelease blocks have a certificate of safe mate immediately
   // after p first touch in ANY pair. The odd spare slack-token
   // theorem adds one preclaimed virgin pair at a time.
   stats.sourceStaticOpponentPairResponsePoliciesConstructed++;
   const legal=h.flatMap((z,c)=>z<H?[c+1]:[]);
   return {status:'CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN',
    kind:'ODD_SINGLE_ORIGINAL_SPARE_CELL_PLUS_GRAVITY_SAFE_ONE_PENDING_PAIR_DEFENDER_POLICY',
    sourceCannotForceCurrentMoverWin:true,rootCurrentMover:p,originalDefender:oFrom(p),
    remainingOriginalCells:T,sourceUnmatchedLastCell:{
      originalLiteralColumn:u+1,rowZeroBased:h[u],
      physicalCellMaskHex:'0x'+unmatched.toString(16)},
    sourceGravitySafePairBlocks:result.sourceBlocks,
    pairedEveryFuturePhysicalCellOtherThanUnmatched:true,
    everyOriginalMoverWinningResidualContainsOppositeOwnedMatePair:true,
    defenderOnePendingPairSlackTokenPolicy:'If p takes a virgin pair cell, o takes mate. If p takes unmatched U or pending mate, o preclaims one currently playable virgin pair cell; <=one pending pair.',
    futureWinByCurrentMoverExcludedUnderOneAdversarialOResponsePolicy:true,
    certifiedP0RelativeRootValueInterval:p===0?[-1,0]:[0,1],
    allOriginalLegalFirstActionNames:legal,
    directL2BestActionNotYetProved:true,
    sourceOriginalGameFutureWDLEvaluations:0,
    statistics:stats};
  }
  return {status:'INCOMPLETE',
   reason:stats.sourceStaticProofResourceIncomplete?
    'STATIC_PAIRING_RESOURCE_INCOMPLETE_OR_NO_WITNESS':'NO_COVERING_GRAVITY_SAFE_ODD_SPARE_DEFENSE_PAIRING',
   sourceCannotForceCurrentMoverWin:false,statistics:stats};
 }
 function oFrom(p){return 1-p;}
 return Object.freeze({width:W,height:H,connect:K,compute});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-odd-safe-pair-best-draw-or-loss-source.mjs BLOB f2e22e187ad9cf4aca97ed306846febc4d28a404
// ORIGINAL q SOURCE-only ODD spare safe pairing no-p-forced-win
// plus either o winline overload => mover LOSS all legal actions BEST,
// or ONE selected robust nonloss first action => mover DRAW best.
// Zero future game-value evaluation. Theorem frozen before tests:
// docs/research/2026-10-17-odd-pending-pair-plus-dual-or-one-nonloss-tier-closure.md
function createOddSafePairBestDrawOrLoss({width:W,height:H,connect:K}){
 const geom={width:W,height:H,connect:K},N=W*H,
  odd=createOddSpareColCoReleaseNoWin(geom),
  dual=createSourceFractionalTransversal(geom),
  oneAction=createCoReleaseAfterFirstMoveNonlossBounds(geom);
 function compute(q,{pairMaxOperations=9000,pairMaxMs=23,pairMaxStaticStates=1200,
      actionMaxOperations=4000,actionMaxMs=8,actionMaxStaticPairings=400,
      denominators=[1,2,3,4,6,8,12]}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
      q.h.some(z=>!Number.isInteger(z)||z<0||z>H)||
      !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('expected exact first-win-stopped original q');
  const n=q.h.reduce((s,z)=>s+z,0),p=n&1,o=1-p,
   legal=q.h.flatMap((z,c)=>z<H?[c+1]:[]);
  if(n>=N||!legal.length)throw Error('terminal source refused');
  const stats={sourceCurrentOriginalRank:n,mover:p,oddSafeNoForceWinCertified:false,
   oddStaticPairProofWork:0,originalDualWeightCandidatesExamined:0,
   originalDualCellLoadsVerified:0,
   perFirstActionStaticProofOperations:0,
   currentLiteralActionSourceBoundsScanned:0,
   futureGameStatesConstructed:0,
   independentlyValuedStrategicFutureGames:0,
   maxStrategicGameFanout:0,
   sourceResourceIncomplete:0};
  if((N-n)%2===0)return {status:'INCOMPLETE',reason:'ODD_SOURCE_COMPOSITION_ONLY',
   statistics:stats};
  const sourceOdd=odd.compute(q,{maxOperations:pairMaxOperations,
    maxMs:pairMaxMs,maxStaticWitnessStates:pairMaxStaticStates});
  stats.oddStaticPairProofWork=sourceOdd.statistics.sourceStaticBlockMatchingWorkOps;
  stats.sourceResourceIncomplete+=sourceOdd.statistics.sourceStaticProofResourceIncomplete;
  if(sourceOdd.status!=='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')
   return {status:'INCOMPLETE',reason:'ODD_MOVER_NO_FORCE_WIN_NOT_CERTIFIED',
    oddRootSourceStatus:sourceOdd.status,originalOddRootSourceReason:sourceOdd.reason,
    statistics:stats};
  stats.oddSafeNoForceWinCertified=true;
  const R=[q.R0,q.R1];
  const winner=dual.prove({h:q.h,R},o,{denominators});
  stats.originalDualWeightCandidatesExamined=winner.statistics.attemptedStaticWeightVectors;
  stats.originalDualCellLoadsVerified=winner.statistics.witnessCellIncidenceChecks;
  const capacity=Math.ceil((N-n)/2);
  if(winner.status==='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN'){
   if(winner.opponent!==p||winner.attacker!==o||
      winner.opponentTotalTurns!==capacity||
      winner.witness.sumNumerator<=winner.witness.denominator*capacity)
    throw Error('odd source overloaded o winline strategy capacity mismatch');
   return {status:'VALID_CONTINUATION',bestOutcomeTier:'LOSS',
    proofKind:'ODD_SAFE_ONE_PENDING_PAIR_DEFENSE_AND_OPPONENT_HYPERGRAPH_DUAL_FORCE_LOSS',
    ordinaryRootValueP0Relative:o===0?1:-1,
    selectedOriginalLiteralColumn:legal[0],
    fullLevel2SetKnown:true,allBestOriginalLiteralMoves:legal,
    oddSourceCannotForceWinProof:sourceOdd,
    opponentDualSourceWitness:winner.witness,
    sourceFutureGameValueQueries:0,statistics:stats};
  }
  // Without o-overload, a single existing original first-action
  // NONLOSS source proof plus root no-mover-win => DRAW best.
  let action;
  try{
   action=oneAction.compute(q,{maxOperations:actionMaxOperations,
     maxMs:actionMaxMs,maxStaticPairings:actionMaxStaticPairings});
  }catch(e){
   if(!String(e.message).includes('SOURCE_PAIRING_'))throw e;
   stats.sourceResourceIncomplete++;
   return {status:'INCOMPLETE',
    reason:'ODD_ROOT_PROVED_NO_MOVER_WIN_BUT_PER_ACTION_SOURCE_STATIC_BUDGET',
    oddRootSourceStatus:sourceOdd.status,statistics:stats};
  }
  stats.perFirstActionStaticProofOperations=action.statistics?.sourceOperations??0;
  if(action.status!=='COMPLETE_SOURCE_ACTION_WDL_BOUNDS'){
   stats.sourceResourceIncomplete++;
   return {status:'INCOMPLETE',
    reason:'ODD_NO_FORCE_WIN_PROVED_BUT_PER_ACTION_BOUNDS_PARTIAL',
    oddRootSourceStatus:sourceOdd.status,statistics:stats};
  }
  stats.currentLiteralActionSourceBoundsScanned=action.firstActionValueIntervals.length;
  for(const z of action.firstActionValueIntervals){
   if(!legal.includes(z.literalColumn+1))
    throw Error('co-release bound using invalid original literal action');
   if((p===0&&z.lower>=0)||(p===1&&z.upper<=0)){
    const reason=action.sourceCertificates.find(x=>x.literalColumn===z.literalColumn);
    if(!reason)throw Error('source action nonloss pairing proof missing');
    return {status:'VALID_CONTINUATION',bestOutcomeTier:'DRAW',
     proofKind:'ODD_SAFE_ONE_PENDING_PAIR_ROOT_NO_WIN_PLUS_ONE_ACTION_NONLOSS',
     ordinaryRootValueP0Relative:0,
     selectedOriginalLiteralColumn:z.literalColumn+1,
     fullLevel2SetKnown:false,allBestOriginalLiteralMoves:null,
     oddSourceCannotForceWinProof:sourceOdd,
     chosenSourceNonlossActionInterval:[z.lower,z.upper],
     chosenSourceNonlossProof:reason,
     sourceFutureGameValueQueries:0,statistics:stats};
   }
  }
  return {status:'INCOMPLETE',
   reason:'ODD_SAFE_PAIR_EXCLUDES_WIN_BUT_NEITHER_OPPONENT_OVERLOAD_NOR_DRAW_ACTION_PROVED',
   oddRootSourceStatus:sourceOdd.status,statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-unified-one-valid-best-action-source-v2.mjs BLOB aca84558a77bacde0c5e0c0e5f624022e701c832
// v2 supersets frozen v1 exact source proof families with the independently
// true7x6-qualified STRICT odd spare preemption-safe NO-WIN root and an
// independent dual LOSS/first-action nonloss DRAW outcome witness.
// Original v1 source and evidence are IMMUTABLE research provenance.
// Type-safe original q=(h,R0,R1) source proof union for ONE Level2 BEST move.
// Exact guarded WIN, DRAW and LOSS sub-provers already independently frozen
// and true standard7x6-validated. NO game WDL values computed here.
// At most ONE strategically forced future q lane in the win-ladder
// certificate; static matching/duals remain original q proof witnesses.
// docs/research/2026-10-17-unified-one-certified-best-action-source-protocol.md
function createUnifiedOneValidBestActionSourceV2({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid original gravity Connect-K');
 const geometry={width:W,height:H,connect:K},
  winning=createSingleForcedThreatLadder(geometry),
  draw=createRootNoForceWinSingleDrawWitness(geometry),
  lossExtinct=createOriginalSourceInevitableLossBest(geometry),
  lossAdaptive=createPairDefenseDualOverloadLoss(geometry),
  oddTier=createOddSafePairBestDrawOrLoss(geometry);
 function compute(q,{
  maxWinSourceMaskTests=300000,
  drawMaxOperations=4000,drawMaxMs=8,drawMaxStaticPairings=400,
  dualDenominators=[1,2,3,4,6,8,12],
  pairMaxOperations=4000,pairMaxMs=12,pairMaxStaticStates=1200,
  oddPairMaxOperations=9000,oddPairMaxMs=23,oddPairMaxStaticStates=1200
 }={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(n=>!Number.isInteger(n)||n<0||n>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('legal original normalized nonterminal source q required');
  const n=q.h.reduce((s,x)=>s+x,0),p=n&1,legal=q.h.flatMap((h,c)=>h<H?[c+1]:[]);
  if(n>=W*H||!legal.length)throw Error('requires original first-win-stopped nonterminal q');
  const stats={rootRank:n,mover:p,originalLegalLiteralLabels:legal,
   sourceWinLadderConstructedQCount:0,sourceLadderProofDepth:0,
   sourceWinStaticMoveScans:0,sourceForcedLadderSelectedLaneFanout:0,
   originalSourceDrawStaticPairingOps:0,
   originalSourceLossDualWeightAttempts:0,
   originalSourceAdaptiveLossMatchingStates:0,
   originalSourceOddPairMatchingWork:0,
   originalSourceOddDualWeightCandidates:0,
   originalSourceOddActionNonLossChecks:0,
   sourceAlternativeFutureGameWDLEvaluations:0,
   sourceGameStrategicFanoutMax:0,
   subTheoremsInvoked:[],sourceBudgetIncomplete:0};
  const outcome=(p===0?1:-1);
  function emit(tier,action,kind,proof,V,full=null){
   if(!legal.includes(action)||![-1,0,1].includes(V)||
      V!==(tier==='WIN'?outcome:tier==='LOSS'?-outcome:0))
     throw Error('source proof has invalid legal best action / outcome');
   if(full!==null&&(tier!=='LOSS'||full.join(',')!==legal.join(',')))
    throw Error('only unconditional exact all-loss certificate may emit all equally best labels');
   return {status:'VALID_CONTINUATION',type:'PROOF_CARRYING_SOURCE_LEVEL2_BEST_ACTION',
    opponentModel:'PERFECT',board:{W,H,K},mover:p,ordinaryRootValueP0Relative:V,
    bestOutcomeTier:tier,selectedOriginalLiteralColumn:action,
    proofKind:kind,sourceProof:proof,
    completeLevel2SetKnown:full!==null,
    allBestOriginalLiteralLabels:full,
    sourceGameValuesIndependentlyEvaluated:0,
    statistics:stats};
  }
  // WIN: direct response-cover or one strategically forced opponent lane.
  let win;
  try{win=winning.compute(q,{maxSourceTests:maxWinSourceMaskTests});}
  catch(e){
   if(!String(e.message).includes('original source algebra structural operation guard exceeded'))
    throw e;
   stats.sourceBudgetIncomplete++;
   win={status:'INCOMPLETE',reason:'WIN_SOURCE_STATIC_OPERATION_BUDGET'};
  }
  stats.subTheoremsInvoked.push({kind:'WIN_DIRECT_OR_SINGLE_FORCED_LANE',
    status:win.status,reason:win.reason});
  stats.sourceWinLadderConstructedQCount=win.statistics?.sourceQStatesMaterializedAlongOneLane??0;
  stats.sourceLadderProofDepth=win.sourceForcedReplyRounds??0;
  stats.sourceWinStaticMoveScans=win.statistics?.sourceOriginalCurrentActionScans??0;
  stats.sourceForcedLadderSelectedLaneFanout=win.statistics?.sourceStrategicContinuationLaneFanoutMax??0;
  stats.sourceGameStrategicFanoutMax=Math.max(stats.sourceGameStrategicFanoutMax,
    stats.sourceForcedLadderSelectedLaneFanout);
  if(win.status==='VALID_CONTINUATION')
   return emit('WIN',win.selectedOriginalLiteralColumn,
    'ONE_FORCED_LANE_TO_GRAVITY_RESPONSE_COVER',win.certificate,outcome);
  // DRAW: root universal no forced p WIN AND single source a guarantees
  // nonloss. This is exact best even if other root action WDL unknown.
  let d;
  try{d=draw.compute(q,{maxOperations:drawMaxOperations,maxMs:drawMaxMs,
    maxStaticPairings:drawMaxStaticPairings});}
  catch(e){if(!String(e.message).includes('SOURCE_')&&!String(e.message).includes('budget'))throw e;
    stats.sourceBudgetIncomplete++;d={status:'INCOMPLETE',reason:'DRAW_SOURCE_WORK_BUDGET'};}
  stats.subTheoremsInvoked.push({kind:'ROOT_NO_FORCED_WIN_PLUS_ONE_NONLOSS_DRAW',
    status:d.status,reason:d.reason});
  stats.originalSourceDrawStaticPairingOps=(d.statistics?.staticGlobalPairingWork??0)+
   (d.statistics?.coReleaseGlobalOriginalProofWork??0)+
   (d.statistics?.staticPostActionPairProofWork??0);
  stats.sourceBudgetIncomplete+=d.statistics?.sourceProofTimeBudgetIncomplete??0;
  if(d.status==='VALID_CONTINUATION')
   return emit('DRAW',d.selectedOriginalLiteralColumn,
     'ORIGINAL_ROOT_WIN_EXCLUSION_AND_SINGLE_ACTION_NONLOSS',d,0);
  // LOSS old: no own original K line AND opponent overload alone forces
  // opponent first win, so ALL first mover original actions tied loss.
  const oldLoss=lossExtinct.compute(q,{denominators:dualDenominators});
  stats.subTheoremsInvoked.push({kind:'EXTINCT_OWN_WINLINE_AND_OPPONENT_HYPEREDGE_OVERLOAD',
    status:oldLoss.status,reason:oldLoss.reason});
  stats.originalSourceLossDualWeightAttempts+=
   oldLoss.statistics?.staticOriginalFractionalPackingWitnessAttempts??0;
  if(oldLoss.status==='VALID_CONTINUATION')
   return emit('LOSS',oldLoss.selectedOriginalLiteralColumn,
    'EXTINCT_OWN_WINLINES_OPPONENT_DUAL_FORCE_LOSS',oldLoss,-outcome,
    oldLoss.allOriginalLiteralLegalBestMoves);
  // LOSS new: owner R_p may still survive, but o has uniform co-release
  // mate response protecting against all p winlines AND strict dual.
  const pairedLoss=lossAdaptive.compute(q,{
    maxOperations:pairMaxOperations,maxMs:pairMaxMs,
    maxStaticWitnessStates:pairMaxStaticStates,
    denominators:dualDenominators});
  stats.subTheoremsInvoked.push({kind:'UNIFORM_OPPONENT_MATE_RESPONSES_PLUS_STRICT_OPPONENT_WINLINE_DUAL',
    status:pairedLoss.status,reason:pairedLoss.reason});
  stats.originalSourceLossDualWeightAttempts+=
   pairedLoss.statistics?.staticDualWeightVectorsExamined??0;
  stats.originalSourceAdaptiveLossMatchingStates=
   pairedLoss.statistics?.staticPairPartitionsVisited??0;
  stats.sourceBudgetIncomplete+=pairedLoss.statistics?.sourcePairingBudgetIncomplete??0;
  if(pairedLoss.status==='VALID_CONTINUATION')
   return emit('LOSS',pairedLoss.selectedOriginalLiteralColumn,
    'LIVE_OWN_WINLINES_DEFENDER_SAFE_PAIRING_PLUS_DUAL_FORCE_LOSS',pairedLoss,-outcome,
    pairedLoss.allOriginalLiteralEquallyBestLosingMoves);
  // NEW STRICT ODD-T response source: one single spare and co-release
  // blocks whose cross prefixes are <=1. Unrestricted cross prefixes
  // were PHYSICALLY REFUTED and are NOT accepted by this source.
  // It may prove p root DRAW (one robust nonloss original first action)
  // or p inevitable LOSS (uniform odd o pair policy + o winline dual).
  if(((W*H-n)&1)===1){
   const oddProof=oddTier.compute(q,{
    pairMaxOperations:oddPairMaxOperations,
    pairMaxMs:oddPairMaxMs,
    pairMaxStaticStates:oddPairMaxStaticStates,
    actionMaxOperations:drawMaxOperations,
    actionMaxMs:drawMaxMs,
    actionMaxStaticPairings:drawMaxStaticPairings,
    denominators:dualDenominators
   });
   stats.subTheoremsInvoked.push({kind:'SAFE_ODD_SPARE_ONE_PENDING_PAIR_PLUS_DUAL_OR_ONE_NONLOSS',
    status:oddProof.status,reason:oddProof.reason});
   stats.originalSourceOddPairMatchingWork+=oddProof.statistics?.oddStaticPairProofWork??0;
   stats.originalSourceOddDualWeightCandidates+=oddProof.statistics?.originalDualWeightCandidatesExamined??0;
   stats.originalSourceOddActionNonLossChecks+=oddProof.statistics?.currentLiteralActionSourceBoundsScanned??0;
   stats.sourceBudgetIncomplete+=oddProof.statistics?.sourceResourceIncomplete??0;
   if(oddProof.status==='VALID_CONTINUATION'){
    if(oddProof.bestOutcomeTier==='DRAW')
     return emit('DRAW',oddProof.selectedOriginalLiteralColumn,
      'ODD_SAFE_SPARE_ROOT_NO_WIN_PLUS_ONE_NONLOSS_DRAW',oddProof,0);
    if(oddProof.bestOutcomeTier==='LOSS')
     return emit('LOSS',oddProof.selectedOriginalLiteralColumn,
      'ODD_SAFE_SPARE_O_DUAL_FORCED_MOVER_LOSS',oddProof,-outcome,
      oddProof.allBestOriginalLiteralMoves);
    throw Error('odd source WDL conclusion kind invalid');
   }
  }
  return {status:'INCOMPLETE',type:'NO_UNIVERSALLY_APPLICABLE_SOURCE_BEST_ACTION_THEOREM',
   opponentModel:'PERFECT',mover:p,
   selectedOriginalLiteralColumn:null,exactRootValueP0Relative:null,
   sourceProvenBestMove:false,completeLevel2SetKnown:false,
   fullUnrestrictedGameValueNotInferred:true,
   sourceGameValuesIndependentlyEvaluated:0,statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}


// SOURCE research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-unified-one-valid-best-action-source-v4.mjs BLOB 462cead38be227dcb3659c0d99b2fd1779a8d256
// SOURCE V4: immutable V2 scalar WDL proof, then fixed two-column
// DIRECT transposition q mask inclusion, then historical V3 enumerated
// STATIC transport fallback. Never values alternative FUTURE GAMES.
// Frozen theorem docs/research/2026-10-17-unified-source-v4-fixed-two-column-swap-before-transport.md
// SOURCE-ONLY proof-carrying V3: previously qualified V2 exact
// WIN/DRAW/LOSS scalar proof families PLUS scalar-free Level2 action
// optimality certified via source WDL-order extremum. Does NOT invent
// scalar root outcome for extremal source proof. No alternate future
// GAME VALUE search. Static source permutation witness constructions
// by existing future-column transporter are EXPLICITLY counted.
// Frozen theorem:
// docs/research/2026-10-17-unified-one-certified-best-action-source-protocol.md
function createUnifiedOneValidBestActionSourceV4({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||
   K>Math.min(W,H)||W*H>42)throw Error('invalid original gravity geometry');
 const geom={width:W,height:H,connect:K},
   prior=createUnifiedOneValidBestActionSourceV2(geom),
   order=createSourceWdlExtremalOneBest(geom),
   fixed=createSourceFixedTwoColumnSwapWdlOrder(geom);
 function compute(q,{priorOptions={},fixedSwapOptions={maxStaticSubsetTests:120000},orderOptions={
  maxOperations:140000,maxMs:100,maxRepresentatives:10000
 }}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
    q.h.some(h=>!Number.isInteger(h)||h<0||h>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x===0n))
   throw Error('exact first-win-stopped original source q expected');
  const n=q.h.reduce((s,z)=>s+z,0),p=n&1,
   legal=q.h.flatMap((z,c)=>z<H?[c+1]:[]);
  if(n>=W*H||!legal.length)throw Error('nonterminal original q required');
  const previous=prior.compute(q,priorOptions);
  const counters={rootOriginalPly:n,originalCurrentMover:p,
    priorSourceStatus:previous.status,
    v2SourceQStatesMaterializedAlongOneForcedLane:
      previous.statistics?.sourceWinLadderConstructedQCount??0,
    v2MaximumLiveStrategicFutureLane:
      previous.statistics?.sourceGameStrategicFanoutMax??0,
    qualitativeSourceOrderProofOperations:0,
    fixedTwoColumnStaticSourceMaskTests:0,
    fixedSourceLegalActionPairsCompared:0,
    fixedSourcePositiveWdlOrderEdges:0,
    fixedSourceFullColumnPermutationCandidates:0,
    staticColumnPermutationTransportFallbackInvoked:false,
    staticCompletedColumnPermutationWitnesses:0,
    staticSourceFirstActionCofactorDescriptionsConstructed:0,
    scalarRootOutcomeCalculatedByQualitativeSelector:false,
    independentlyValuedStrategicFutureGameValues:0,
    sourceStaticProofSearchMayBranchIntoColumnPermutations:false,
    sourceGameSemanticFutureFanoutMax:
      previous.statistics?.sourceGameStrategicFanoutMax??0};
  if(previous.status==='VALID_CONTINUATION')
   return {...previous,algorithm:'SOURCE_UNIFIED_PROOF_V4',
     v4ProofFamily:'V2_ALREADY_CERTIFIED_WDL_SCALAR',
     v4FixedSwapAndStaticPermutationFallbackNotInvoked:true,
     v4Statistics:counters};
  if(previous.status!=='INCOMPLETE')
   throw Error('previous V2 returned unexpected qualification status');
  // Any one ORIGINAL legal move is optimal if it is the ONLY move.
  // No game VALUE needed and no future q need be calculated by this
  // special operational proof.
  if(legal.length===1)
   return {status:'VALID_CONTINUATION',
    algorithm:'SOURCE_UNIFIED_PROOF_V4',
    type:'PROOF_CARRYING_SOURCE_LEVEL2_BEST_ACTION_SCALAR_UNKNOWN',
    v4ProofFamily:'ONE_ORIGINAL_LEGAL_ACTION_TRIVIALLY_BEST',
    opponentModel:'PERFECT',mover:p,
    selectedOriginalLiteralColumn:legal[0],
    ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
    exactRootOrdinaryWDLCertified:false,
    selectedOriginalActionBestRegardlessOfOutcome:true,
    completeLevel2SetKnown:true,
    allBestOriginalLiteralLabels:legal.slice(),
    sourceCertificate:{soleLegalOriginalLiteralColumn:legal[0],
      noCompetingLegalMovePossible:true},
    sourceIndependentlyValuedFutureGames:0,
    v4Statistics:counters};
  // Direct RAW original source bit-swap and generator containment.
  // Crucially checks a SINGLE predeclared two-column transposition for
  // each equal-height current action-label pair, NEVER enumerates a
  // permutation candidate mapping. No new future game q materialized.
  const direct=fixed.compute(q,fixedSwapOptions);
  counters.fixedTwoColumnStaticSourceMaskTests=
    direct.statistics.exactOriginalGeneratorSubsetChecks;
  counters.fixedSourceLegalActionPairsCompared=
    direct.statistics.originalStaticLiteralActionPairsConsidered;
  counters.fixedSourcePositiveWdlOrderEdges=
    direct.statistics.sourceProvedWeakP0WdlOrderEdges;
  counters.fixedSourceFullColumnPermutationCandidates=
    direct.statistics.sourceCompletedColumnPermutationCandidatesEnumerated;
  if(direct.status==='VALID_CONTINUATION'){
   if(!legal.includes(direct.selectedOriginalLiteralColumn))
    throw Error('source direct swap chose nonlegal original action');
   if(counters.fixedSourceFullColumnPermutationCandidates!==0)
    throw Error('direct source should NOT enumerate full column permutations');
   return {
    status:'VALID_CONTINUATION',
    algorithm:'SOURCE_UNIFIED_PROOF_V4',
    type:'PROOF_CARRYING_SOURCE_LEVEL2_BEST_ACTION_SCALAR_UNKNOWN',
    v4ProofFamily:'DIRECT_FIXED_TWO_COLUMN_SOURCE_WDL_EXTREMUM_ZERO_PERMUTATIONS',
    opponentModel:'PERFECT',mover:p,
    selectedOriginalLiteralColumn:direct.selectedOriginalLiteralColumn,
    ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
    exactRootOrdinaryWDLCertified:false,
    selectedOriginalActionBestRegardlessOfOutcome:true,
    completeLevel2SetKnown:false,allBestOriginalLiteralLabels:null,
    proofOriginalQualitativeWDLOrder:direct.sourceExtremumProofOverAllRootLegalColumns,
    sourceProof:direct,sourceIndependentlyValuedFutureGames:0,
    v4Statistics:counters
   };
  }
  // Existing full-future transport is retained ONLY as a conservative
  // static proof-witness fallback. Its permutation assignment work is
  // logged, unlike the direct branch above.
  counters.staticColumnPermutationTransportFallbackInvoked=true;
  counters.sourceStaticProofSearchMayBranchIntoColumnPermutations=true;
  const proof=order.compute(q,orderOptions);
  counters.qualitativeSourceOrderProofOperations=
    proof.statistics?.sourceColumnTransportOperations??0;
  counters.staticCompletedColumnPermutationWitnesses=
    proof.statistics?.sourceStaticColumnPermutationProofCandidates??0;
  counters.staticSourceFirstActionCofactorDescriptionsConstructed=
    proof.statistics?.staticActionCofactorDescriptionsConstructed??0;
  if(proof.status!=='VALID_CONTINUATION')
   return {status:'INCOMPLETE',algorithm:'SOURCE_UNIFIED_PROOF_V4',
    type:'NO_CURRENT_SOURCE_PROOF_OF_ONE_BEST_FIRST_ACTION',
    opponentModel:'PERFECT',mover:p,
    selectedOriginalLiteralColumn:null,
    ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
    exactRootOrdinaryWDLCertified:false,
    completeLevel2SetKnown:false,
    priorV2Reason:previous.type,
    sourceQualitativeOrderReason:proof.reason,
    sourceIndependentlyValuedFutureGames:0,
    v4Statistics:counters};
  if(!legal.includes(proof.selectedOriginalLiteralColumn))
   throw Error('source optimal-order certificate selected illegal original column');
  return {status:'VALID_CONTINUATION',
    algorithm:'SOURCE_UNIFIED_PROOF_V4',
    type:'PROOF_CARRYING_SOURCE_LEVEL2_BEST_ACTION_SCALAR_UNKNOWN',
    v4ProofFamily:'ENUMERATED_STATIC_COLUMN_TRANSPORT_FALLBACK',
    opponentModel:'PERFECT',mover:p,
    selectedOriginalLiteralColumn:proof.selectedOriginalLiteralColumn,
    ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
    exactRootOrdinaryWDLCertified:false,
    selectedOriginalActionBestRegardlessOfOutcome:true,
    completeLevel2SetKnown:false,
    allBestOriginalLiteralLabels:null,
    proofOriginalQualitativeWDLOrder:proof.proofOfBestAgainstEveryOtherOriginalLegalAction,
    sourceProof:proof,
    sourceIndependentlyValuedFutureGames:0,
    v4Statistics:counters};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}

// END exact dependency bundle, source names: createExactQCore, createEitherMoverExactTransport, createSourceWdlExtremalOneBest, createSourceGravityResponseCover, createCoReleasePairBlockProof, createSourceFractionalTransversal, createGlobalNoWinBound, createCoReleaseGlobalNoWinBound, createCoReleaseAfterFirstMoveNonlossBounds, createSingleForcedThreatLadder, createRootNoForceWinSingleDrawWitness, createOriginalSourceInevitableLossBest, createPairDefenseDualOverloadLoss, createOddSpareColCoReleaseNoWin, createOddSafePairBestDrawOrLoss, createUnifiedOneValidBestActionSourceV2, createUnifiedOneValidBestActionSourceV4
