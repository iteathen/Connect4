import fs from 'node:fs';

const PROFILES = Object.freeze([
  [4,3,3],
  [4,4,4],
  [5,3,4],
]);

function readSolvedCorpus(){
  const raw=fs.readFileSync(new URL('../../../../reference/oracles/solved-actions-v1.tsv',import.meta.url),'utf8').trim();
  return raw.split(/\n/).map(line=>{
    const [group,sourceSet,sourceLine,sequence,parentScore,moveScores]=line.split('\t');
    return {
      group,
      sourceSet,
      sourceLine:Number(sourceLine),
      sequence,
      parentScore:Number(parentScore),
      moveScores:moveScores.split(',').map(Number),
    };
  });
}

function corpusSeparation(){
  const rows=readSolvedCorpus(),
    losing=rows.filter(x=>x.parentScore<0),
    detail=losing.map(row=>{
      const legal=row.moveScores.filter(x=>x!==-1000),
        distinct=[...new Set(legal)].sort((a,b)=>b-a),
        best=Math.max(...legal);
      return {
        group:row.group,
        sourceSet:row.sourceSet,
        sourceLine:row.sourceLine,
        sequence:row.sequence,
        parentScore:row.parentScore,
        legalCount:legal.length,
        distinctLossScores:distinct,
        scoreSpread:best-Math.min(...legal),
        strongBestCount:legal.filter(x=>x===best).length,
      };
    }),
    mixed=detail.filter(x=>x.distinctLossScores.length>1);
  return {
    corpusRows:rows.length,
    losingParentCount:losing.length,
    losingParentsWithDistinctLossDistances:mixed.length,
    losingParentsWithDistinctLossDistanceFraction:mixed.length/losing.length,
    maximumScoreSpread:Math.max(...mixed.map(x=>x.scoreSpread)),
    examples:mixed.slice(0,16),
    interpretation:'for a losing parent every legal move is W/D/L-loss, yet exact Pons-style scores can still distinguish slower and faster losses',
  };
}

function generateLines(W,H,K){
  const lines=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)
    for(const [dx,dy,orientation] of [[1,0,'H'],[0,1,'V'],[1,1,'D+'],[1,-1,'D-']]){
      const x=c+(K-1)*dx,y=r+(K-1)*dy;
      if(x<0||x>=W||y<0||y>=H)continue;
      const cells=[];
      for(let j=0;j<K;j++)cells.push((r+j*dy)*W+c+j*dx);
      lines.push({orientation,cells});
    }
  return lines;
}

function solveProfile(W,H,K){
  const N=W*H,
    lines=generateLines(W,H,K),
    byCell=Array.from({length:N},()=>[]);
  lines.forEach((line,i)=>line.cells.forEach(cell=>byCell[cell].push(i)));
  const bit=cell=>1n<<BigInt(cell);

  function won(bits,cell){
    for(const lineId of byCell[cell])
      if(lines[lineId].cells.every(x=>(bits&bit(x))!==0n))return true;
    return false;
  }

  const memo=new Map();
  function stateKey(p0,p1,heights,mover){
    return `${p0.toString(16)}/${p1.toString(16)}/${heights.join('')}/${mover}`;
  }
  function solve(p0,p1,heights,mover){
    const k=stateKey(p0,p1,heights,mover);
    if(memo.has(k))return memo.get(k);
    const moves=[];
    for(let column=0;column<W;column++){
      if(heights[column]>=H)continue;
      const row=heights[column],
        cell=row*W+column,
        b=bit(cell),
        np0=mover===0?p0|b:p0,
        np1=mover===1?p1|b:p1;
      if(won(mover===0?np0:np1,cell)){
        moves.push({outcome:1,remoteness:1,column});
        continue;
      }
      const h=heights.slice();
      h[column]+=1;
      const child=solve(np0,np1,h,1-mover);
      moves.push({
        outcome:-child.outcome,
        remoteness:1+child.remoteness,
        column,
      });
    }
    let result;
    if(!moves.length)result={outcome:0,remoteness:0};
    else{
      const bestOutcome=Math.max(...moves.map(x=>x.outcome)),
        candidates=moves.filter(x=>x.outcome===bestOutcome);
      let selected=candidates[0];
      for(const c of candidates.slice(1)){
        if(bestOutcome===1&&c.remoteness<selected.remoteness)selected=c;
        else if(bestOutcome===-1&&c.remoteness>selected.remoteness)selected=c;
        else if(bestOutcome===0&&c.remoteness<selected.remoteness)selected=c;
      }
      result={outcome:selected.outcome,remoteness:selected.remoteness};
    }
    memo.set(k,result);
    return result;
  }

  const states=new Map(),
    stack=[{p0:0n,p1:0n,heights:Array(W).fill(0),mover:0}];
  while(stack.length){
    const state=stack.pop(),
      k=stateKey(state.p0,state.p1,state.heights,state.mover);
    if(states.has(k))continue;
    states.set(k,{
      ...state,
      value:solve(state.p0,state.p1,state.heights,state.mover),
    });
    for(let column=0;column<W;column++){
      if(state.heights[column]>=H)continue;
      const row=state.heights[column],
        cell=row*W+column,
        b=bit(cell),
        np0=state.mover===0?state.p0|b:state.p0,
        np1=state.mover===1?state.p1|b:state.p1;
      if(won(state.mover===0?np0:np1,cell))continue;
      const heights=state.heights.slice();
      heights[column]+=1;
      stack.push({p0:np0,p1:np1,heights,mover:1-state.mover});
    }
  }

  function reflectCell(cell){
    const row=Math.trunc(cell/W),column=cell%W;
    return row*W+(W-1-column);
  }
  function reflectBits(bits){
    let out=0n;
    for(let cell=0;cell<N;cell++)
      if((bits&bit(cell))!==0n)out|=bit(reflectCell(cell));
    return out;
  }

  function representation(state,tier,reflect){
    const rank=state.heights.reduce((a,b)=>a+b,0),
      heights=reflect?[...state.heights].reverse():state.heights.slice(),
      p0=reflect?reflectBits(state.p0):state.p0,
      p1=reflect?reflectBits(state.p1):state.p1;

    if(tier==='FULL_PHYSICAL')
      return JSON.stringify([
        state.mover,rank,heights,p0.toString(16),p1.toString(16),
      ]);

    const residuals=[[],[]],
      coarse=[new Map(),new Map()];
    for(let player=0;player<2;player++){
      const own=player===0?p0:p1,
        opponent=player===0?p1:p0;
      for(const line of lines){
        if(line.cells.some(cell=>(opponent&bit(cell))!==0n))continue;
        const missing=line.cells.filter(cell=>(own&bit(cell))===0n);
        if(!missing.length)continue;
        const events=missing.map(cell=>{
          const row=Math.trunc(cell/W),
            column=cell%W,
            supportDistance=row-heights[column];
          return [cell,supportDistance,(rank+supportDistance)&1];
        }).sort((a,b)=>a[0]-b[0]);
        residuals[player].push([line.orientation,events]);
        const signature=JSON.stringify([
          line.orientation,
          missing.length,
          events.map(x=>x[1]).sort((a,b)=>a-b),
          events.map(x=>x[2]).sort((a,b)=>a-b),
        ]);
        coarse[player].set(
          signature,
          (coarse[player].get(signature)??0)+1
        );
      }
    }
    const coarseRows=player=>[...coarse[player]]
      .sort((a,b)=>a[0].localeCompare(b[0]));

    if(tier==='COARSE_MULTISET')
      return JSON.stringify([
        state.mover,rank,[...heights].sort((a,b)=>a-b),
        coarseRows(0),coarseRows(1),
      ]);
    if(tier==='HEIGHTED_COARSE')
      return JSON.stringify([
        state.mover,rank,heights,coarseRows(0),coarseRows(1),
      ]);

    for(let player=0;player<2;player++)
      residuals[player].sort((a,b)=>
        JSON.stringify(a).localeCompare(JSON.stringify(b))
      );
    return JSON.stringify([
      state.mover,rank,heights,residuals[0],residuals[1],
    ]);
  }

  function canonicalDescriptor(state,tier){
    const a=representation(state,tier,false),
      b=representation(state,tier,true);
    return a<b?a:b;
  }

  const tiers=[
    'COARSE_MULTISET',
    'HEIGHTED_COARSE',
    'EXACT_LIVE_RESIDUAL_SUPPORT',
    'FULL_PHYSICAL',
  ],
    tierResults={};

  for(const tier of tiers){
    const groups=new Map();
    for(const state of states.values()){
      const descriptor=canonicalDescriptor(state,tier);
      if(!groups.has(descriptor))groups.set(descriptor,[]);
      groups.get(descriptor).push(state);
    }

    let mergedClassCount=0,
      mixedWdlClassCount=0,
      mixedRemotenessWithinWdlClassCount=0,
      maxClassSize=1;
    const witnesses=[];

    for(const group of groups.values()){
      if(group.length<2)continue;
      mergedClassCount+=1;
      maxClassSize=Math.max(maxClassSize,group.length);
      const outcomes=new Set(group.map(x=>x.value.outcome));
      if(outcomes.size>1)mixedWdlClassCount+=1;
      const distanceByOutcome=new Map();
      for(const state of group){
        if(!distanceByOutcome.has(state.value.outcome))
          distanceByOutcome.set(state.value.outcome,new Set());
        distanceByOutcome.get(state.value.outcome)
          .add(state.value.remoteness);
      }
      if([...distanceByOutcome.values()].some(x=>x.size>1)){
        mixedRemotenessWithinWdlClassCount+=1;
        if(witnesses.length<4)witnesses.push(group.slice(0,6).map(state=>({
          outcome:state.value.outcome,
          remoteness:state.value.remoteness,
          heights:state.heights,
          p0:state.p0.toString(16),
          p1:state.p1.toString(16),
        })));
      }
    }

    tierResults[tier]={
      classCount:groups.size,
      mergedClassCount,
      mixedWdlClassCount,
      mixedRemotenessWithinWdlClassCount,
      maxClassSize,
      witnesses,
    };
  }

  return {
    profile:`${W}x${H}c${K}`,
    physicalStateCount:states.size,
    tierResults,
  };
}

const started=Date.now(),
  result={
    schema:'connect4.rank-local-strong-distance-separation.v0_1',
    generatedAt:new Date().toISOString(),
    corpus:corpusSeparation(),
    exhaustiveSmallProfiles:PROFILES.map(profile=>solveProfile(...profile)),
    observations:{
      solvedCorpusUsesStrongScores:true,
      exhaustiveSmallProfilesUseExactStrongRemoteness:true,
      exactLiveResidualSupportTierIncludes:
        'mover, rank, exact support heights, and each player complete physical live-line residual basis; gray/dead ownership is omitted',
      proofStatus:
        'diagnostic evidence only; exact-live-residual/support transition sufficiency is a theorem candidate, not established by this census alone',
    },
    elapsedMs:Date.now()-started,
  };

console.log(JSON.stringify(result,null,2));
