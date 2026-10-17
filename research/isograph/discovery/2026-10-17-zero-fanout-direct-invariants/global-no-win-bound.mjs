// Exact source-only FULL FUTURE WDL bounds; NO strategic-game fanout.
// Two mechanisms: extinct original residual winning-line families, and
// attacker-to-move gravity-legal static defensive pairing that blocks every
// attacker's residual winning requirement. Computes WDL interval for EVERY
// literal action at once, not any game-state/strategy continuation.
export function createGlobalNoWinBound({width:W,height:H,connect:K}) {
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
