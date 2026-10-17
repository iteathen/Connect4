// Source-only FIRST-ACTION full-future WIN impossibility / defensive
// pairing. No next(q,c), no future game-state value/policy evaluation;
// scans the ORIGINAL q and hypothetical source literal cofactor formulas.
// Static matching witness enumeration ranges over column-pair BLOCKS,
// never over strategic game plays or alternating game continuations.
export function createAfterFirstMoveNonlossBounds({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
  throw Error('invalid gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
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
   const remaining=N-afterHeights.reduce((a,b)=>a+b,0);
   if(remaining%2!==0||!attackerRequirements.length)return null;
   const cols=afterHeights.flatMap((h,c)=>h<H?[c]:[]);
   const options=new Map();
   for(const c of cols){
    const list=[];
    if((H-afterHeights[c])%2===0){
     const masks=[];
     for(let row=afterHeights[c];row<H;row+=2)
      masks.push(bit(c,row)|bit(c,row+1));
     list.push({kind:'vertical-consecutive',columns:[c],pairs:masks});
     count('sourcePairCandidateBlocksBuilt');
    }
    for(const d of cols){
     if(d<=c||afterHeights[d]!==afterHeights[c])continue;
     const masks=[];
     for(let row=afterHeights[c];row<H;row++)
      masks.push(bit(c,row)|bit(d,row));
     list.push({kind:'horizontal-identical-height',columns:[c,d],pairs:masks});
     count('sourcePairCandidateBlocksBuilt');
    }
    options.set(c,list);
   }
   const targetCount=attackerRequirements.length,
      fullTarget=(1n<<BigInt(targetCount))-1n;
   for(const entries of options.values())for(const option of entries){
    let hit=0n;
    for(let i=0;i<targetCount;i++)for(const pair of option.pairs){
     count('sourcePairBlockCoverageChecks');
     if((attackerRequirements[i]&pair)===pair){
      hit|=1n<<BigInt(i);break;
     }
    }
    option.cover=hit;
   }
   // This is a finite STATIC source pairing witness problem, NOT a game
   // continuation/strategy search. There are <=7 literal columns.
   const seen=new Set();
   let found=null;
   function visit(unused,covered,blocks){
    count('sourceColumnMatchingStates');
    if(found)return;
    if(unused===0){
     stats.staticCompleteColumnPartitionsEvaluated++;
     if(covered===fullTarget){found=blocks.slice();stats.staticPairingCertificatesFound++;}
     return;
    }
    const key=String(unused)+':'+String(covered);
    if(seen.has(key))return;seen.add(key);
    if(seen.size>maxStaticPairings)throw new Limit('STATIC_PAIR_CERTIFICATES');
    let c=0;while(((unused>>c)&1)===0)c++;
    for(const option of options.get(c)){
     const cs=option.columns;
     if(cs.some(x=>((unused>>x)&1)===0))continue;
     const remainingMask=cs.reduce((x,v)=>x&~(1<<v),unused);
     visit(remainingMask,covered|option.cover,blocks.concat([option]));
     if(found)return;
    }
   }
   visit(cols.reduce((m,c)=>m|(1<<c),0),0n,[]);
   if(!found)return null;
   return {defenderMateResponseGuaranteesAttackerNeverWins:true,
     afterMoveAttackerToPlay:1-mover,
     sourceStaticPairBlocks:found.map(x=>({kind:x.kind,columns:x.columns.slice(),
      pairMasksHex:x.pairs.map(v=>'0x'+v.toString(16))})),
     attackerResidualRequirementCount:targetCount,
     allAttackerRequirementsContainSomeCompleteStaticPair:true};
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
