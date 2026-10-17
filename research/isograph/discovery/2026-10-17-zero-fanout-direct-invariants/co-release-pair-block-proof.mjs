// Exact source-only gravity CO-RELEASE static defender pairing certificate.
// Future cells are ordered chains. A safe pair is either two consecutive
// SAME-column cells or two cells at the SAME *relative ordinal* j of
// two source columns, in a common prefix of cross-pairs followed by
// EVEN-length vertical tails. Original source column heights may differ,
// so such pairs can cover certain diagonal winning requirements.
// The producer does NOT evaluate ANY actual future strategic game.
export function createCoReleasePairBlockProof({width:W,height:H,connect:K}){
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
