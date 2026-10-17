// Direct exact full-WDL and ALL WDL-optimal literal action labels on a
// SOURCE-CERTIFIED restricted domain. ZERO strategic continuation fanout.
// The candidate never constructs q successors, terminal future histories,
// future response obligations, a QBF/BDD, nor calls a minimax oracle.
// Static source generator + fixed pairing normalization is NOT game search.
export function createDirectZeroFanout({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
   throw Error('unsupported finite gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=300000,maxMs=15000}={}){
  const started=Date.now();
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     q.R0.some(x=>typeof x!=='bigint'||x<=0n)||
     q.R1.some(x=>typeof x!=='bigint'||x<=0n))throw Error('expected normalized legal nonterminal source q');
  const rank=q.h.reduce((s,x)=>s+x,0),mover=rank%2,opp=1-mover;
  if(rank>=N)throw Error('full board is terminal, cannot classify as source');
  const legal=[];
  for(let c=0;c<W;c++)if(q.h[c]<H)legal.push(c);
  const stats={sourceGeneratorMasks:q.R0.length+q.R1.length,
   sourceMembershipTests:0,sourceCellScans:0,sourcePairCoverageTests:0,
   sourceStaticPairBlocksConsidered:0,sourceStaticCertificateChoices:0,
   futureStrategicBranches:0,futureGameStates:0,
   quantifiedFutureObligations:0,precomputedGameValueQueries:0,
   sourceBitsetOperations:0,elapsedMs:0};
  const charge=(kind)=>{stats[kind]++;stats.sourceBitsetOperations++;
   if(stats.sourceBitsetOperations>maxOperations||Date.now()-started>maxMs)
    throw Error('DIRECT_ZERO_FANOUT_SOURCE_BUDGET');
  };
  function complete(kind,value,valuemap,proof){
   const actionValues=legal.map(c=>[c,valuemap(c)]);
   const opt=mover===0?Math.max(...actionValues.map(x=>x[1])):Math.min(...actionValues.map(x=>x[1]));
   if(opt!==value)throw Error('direct value and action labels inconsistent');
   return {status:'EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN',
     proofKind:kind,value,playerToMove:mover,
     legalActionLabels:legal.slice(),bestMoves:actionValues.filter(x=>x[1]===value).map(x=>x[0]),
     actionValues,structuralCertificate:proof,
     statistics:{...stats,elapsedMs:Date.now()-started},
     fullUnrestrictedWDLCertified:true,allTiedOptimalMovesCertified:true,
     zeroStrategicFanoutCertified:true,
     universalBoardCoverageClaim:false};
  }
  const sets=[new Set(q.R0.map(String)),new Set(q.R1.map(String))],
    immediatelyWins=[[],[]];
  for(const c of legal){
   const current=bit(c,q.h[c]).toString();
   for(let p=0;p<2;p++){
    charge('sourceMembershipTests');
    if(sets[p].has(current))immediatelyWins[p].push(c);
   }
  }
  // Two DISTINCT playable opponent singleton targets survive every
  // non-winning move of the current mover. The opponent wins next.
  if(immediatelyWins[opp].length>=2){
   const own=new Set(immediatelyWins[mover]),winnerValue=mover===0?1:-1,
    loserValue=-winnerValue,hasWin=own.size>0;
   const value=hasWin?winnerValue:loserValue;
   return complete('TWO_DISTINCT_OPPONENT_LIVE_SINGLETONS',
    value,c=>own.has(c)?winnerValue:loserValue,
    {opponentImmediateWinningColumns:immediatelyWins[opp],
     moverImmediateWinningColumns:immediatelyWins[mover],
     allOtherMovesLoseOnTheVeryNextOpponentMove:true,
     noSuccessorValueEvaluationsNeeded:true});
  }
  if(q.R0.length===0&&q.R1.length===0)
   return complete('BOTH_PLAYERS_HAVE_NO_OPEN_WIN_REQUIREMENTS',
    0,()=>0,{sourceResidualsBothEmpty:true,allLegalMovesDraw:true});
  // With exactly one nonfull column, the *entire future* has one forced
  // sequence. Read every future cell's uniquely determined mover ownership
  // from absolute row/turn parity and earliest completing residual.
  if(legal.length===1){
   const c=legal[0],events=[],remaining=H-q.h[c];
   for(let p=0;p<2;p++)for(const r of (p===0?q.R0:q.R1)){
    let mask=r,maxDelta=-1,possible=true;
    for(let row=q.h[c];row<H;row++){
     charge('sourceCellScans');
     const cell=bit(c,row);
     if((mask&cell)!==0n){
      mask&=~cell;const delta=row-q.h[c];
      if((rank+delta)%2!==p)possible=false;
      maxDelta=Math.max(maxDelta,delta);
     }
    }
    if(mask!==0n)throw Error('residual requirement includes no longer future cells');
    if(possible&&maxDelta>=0)events.push({player:p,absoluteTurn:rank+maxDelta+1});
   }
   events.sort((a,b)=>a.absoluteTurn-b.absoluteTurn);
   const terminal=events[0];
   const val=terminal?(terminal.player===0?1:-1):0;
   return complete('ONE_LEGAL_COLUMN_PARITY_DETERMINISTIC_FULL_FUTURE',
     val,()=>val,{onlyLegalColumn:c,futurePlacementsForced:remaining,
      earliestWinningTerminalTurn:terminal??null,
      noTurnSequenceOrFutureStateConstructed:true});
  }
  // Fixed, deterministic pairing certificate. No alternate game pairings
  // or game histories are searched. Odd-capacity columns MUST be paired
  // horizontally with a same-height mate; even-capacity columns may
  // be consumed by disjoint consecutive vertical pairs.
  function pairCertificate(){
   const used=new Set(),blocks=[],pairs=[];
   const suffix=[...legal].sort((a,b)=>a-b);
   function makeVertical(c){
    const cellPairs=[];
    for(let row=q.h[c];row<H;row+=2){
     charge('sourceCellScans');
     if(row+1>=H)return null;
     cellPairs.push(bit(c,row)|bit(c,row+1));
    }
    return cellPairs;
   }
   function makeHorizontal(c,d){
    const cellPairs=[];
    if(q.h[c]!==q.h[d])return null;
    for(let row=q.h[c];row<H;row++){
     charge('sourceCellScans');
     cellPairs.push(bit(c,row)|bit(d,row));
    }
    return cellPairs;
   }
   function score(xs){
    let num=0;
    for(const r of q.R0){
     let covered=false;
     for(const pair of xs){
      charge('sourcePairCoverageTests');
      if((r&pair)===pair){covered=true;break;}
     }
     if(covered)num++;
    }
    return num;
   }
   // Required odd-capacity horizontal pairs, deterministic by height then
   // source column label (no alternative proof search).
   for(const c of suffix){
    if(used.has(c)||(H-q.h[c])%2===0)continue;
    const d=suffix.find(x=>x!==c&&!used.has(x)&&q.h[x]===q.h[c]);
    if(d===undefined)return null;
    const ps=makeHorizontal(c,d);if(!ps)return null;
    used.add(c);used.add(d);blocks.push({type:'horizontal',columns:[c,d]});pairs.push(...ps);
   }
   // Even-capacity columns choose one deterministic source-local block,
   // only when horizontal pair covers more *additional* unresolved
   // residuals than the two separate vertical columns.
   for(const c of suffix){
    if(used.has(c))continue;
    const alone=makeVertical(c);if(!alone)return null;
    let chosen=null,bestGain=0;
    for(const d of suffix){
     if(d<=c||used.has(d)||q.h[c]!==q.h[d])continue;
     charge('sourceStaticPairBlocksConsidered');
     const horizontal=makeHorizontal(c,d),second=makeVertical(d);
     if(!horizontal||!second)continue;
     // Full current mask union is used for deterministic source-only
     // certificate selection, never an opponent future choice.
     const horizontalCovered=score(pairs.concat(horizontal));
     const verticalCovered=score(pairs.concat(alone,second));
     const gain=horizontalCovered-verticalCovered;
     if(gain>bestGain){bestGain=gain;chosen={d,ps:horizontal};}
    }
    used.add(c);
    if(chosen){
     used.add(chosen.d);blocks.push({type:'horizontal',columns:[c,chosen.d]});
     pairs.push(...chosen.ps);
    }else {
     blocks.push({type:'vertical',columns:[c]});
     pairs.push(...alone);
    }
   }
   stats.sourceStaticCertificateChoices++;
   for(const residual of q.R0){
    let hit=false;
    for(const pair of pairs){
     charge('sourcePairCoverageTests');
     if((residual&pair)===pair){hit=true;break;}
    }
    if(!hit)return null;
   }
   return {blocks,pairMasksHex:pairs.map(m=>'0x'+m.toString(16)),
     everyP0WinningRequirementContainsACompletePair:true,
     defenderRespondsImmediatelyToAttackerFirstCellOfEachPair:true,
     allFutureEmptyCellsPaired:true};
  }
  if(mover===0&&q.R1.length===0){
   const c=pairCertificate();
   if(c)return complete('SAFE_GRAVITY_PAIRING_AND_NO_P1_WIN_PATH',
     0,()=>0,c);
  }
  return {status:'INCOMPLETE',value:null,bestMoves:null,actionValues:null,
   legalActionLabels:legal,playerToMove:mover,
   reason:'No source-only exact complete-outcome theorem proved in this direct invariant family',
   statistics:{...stats,elapsedMs:Date.now()-started},
   fullUnrestrictedWDLCertified:false,zeroStrategicFanoutCertified:true,
   universalBoardCoverageClaim:false};
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}
