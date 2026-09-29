// Rule-only cross-dimension producer for action-unlabelled recursive quotients.
// Class construction consumes only geometry, gravity, turn order, first-win stopping,
// and the legal successor graph. Exact W/D/L is derived afterward only as validation.
import assert from 'node:assert/strict';

function popcount(x){
  let n=0;
  for(;x;x&=x-1)n++;
  return n;
}

function winMasks(width,height,k){
  assert.ok(Number.isInteger(width)&&width>=k&&k>=2);
  assert.ok(Number.isInteger(height)&&height>=k);
  const dirs=[[1,0],[0,1],[1,1],[1,-1]],masks=[];
  for(let row=0;row<height;row++)for(let col=0;col<width;col++)
    for(const [dc,dr] of dirs){
      const endCol=col+(k-1)*dc,endRow=row+(k-1)*dr;
      if(endCol<0||endCol>=width||endRow<0||endRow>=height)continue;
      let mask=0;
      for(let i=0;i<k;i++)mask|=1<<((row+i*dr)*width+col+i*dc);
      masks.push(mask);
    }
  return [...new Set(masks)];
}

function peakBy(frontier,key){
  return frontier.reduce((best,row)=>row[key]>best[key]?row:best,
    {rank:-1,states:0,classes:0});
}

function permutations(n){
  const out=[],a=Array.from({length:n},(_,i)=>i);
  function visit(i){
    if(i===n){out.push([...a]);return;}
    for(let j=i;j<n;j++){
      [a[i],a[j]]=[a[j],a[i]];
      visit(i+1);
      [a[i],a[j]]=[a[j],a[i]];
    }
  }
  visit(0);
  return out;
}

function normalizeMaskAntichain(raw){
  const unique=[...new Set(raw)].sort((a,b)=>a-b),out=[];
  for(let i=0;i<unique.length;i++){
    const a=unique[i];
    let absorbed=false;
    for(let j=0;j<unique.length;j++)if(i!==j){
      const b=unique[j];
      if(a!==b&&(a&b)===b){absorbed=true;break;}
    }
    if(!absorbed)out.push(a);
  }
  return out;
}

function normalizeResidualAntichain(winMasks,selfBits,opponentBits){
  const raw=[];
  for(const mask of winMasks){
    if(mask&opponentBits)continue;
    const residual=mask&~selfBits;
    if(residual)raw.push(residual);
  }
  return normalizeMaskAntichain(raw);
}

function heightsFromBits(p0,p1,width,height){
  const occ=p0|p1,h=new Uint8Array(width);
  for(let c=0;c<width;c++)
    while(h[c]<height&&(occ&(1<<(h[c]*width+c))))h[c]++;
  return h;
}

function columnPermutationData(width,height){
  return permutations(width).map(perm=>{
    const cellMap=new Uint8Array(width*height);
    for(let row=0;row<height;row++)for(let oldCol=0;oldCol<width;oldCol++)
      cellMap[row*width+oldCol]=row*width+perm[oldCol];
    return {perm,cellMap,maskCache:new Map([[0,0]])};
  });
}

function permuteMask(mask,pd){
  const known=pd.maskCache.get(mask);
  if(known!==undefined)return known;
  let rest=mask>>>0,out=0;
  while(rest){
    const low=rest&-rest,bit=31-Math.clz32(low);
    out|=1<<pd.cellMap[bit];
    rest=(rest^low)>>>0;
  }
  out>>>=0;
  pd.maskCache.set(mask,out);
  return out;
}

function serializeResidualQ(heights,r0,r1,permutationData){
  if(!permutationData)
    return Array.from(heights).join(',')+'|'+r0.join('.')+'|'+r1.join('.');
  const {perm}=permutationData,newHeights=new Uint8Array(heights.length);
  for(let oldCol=0;oldCol<heights.length;oldCol++)
    newHeights[perm[oldCol]]=heights[oldCol];
  const a=r0.map(mask=>permuteMask(mask,permutationData)).sort((x,y)=>x-y),
    b=r1.map(mask=>permuteMask(mask,permutationData)).sort((x,y)=>x-y);
  return Array.from(newHeights).join(',')+'|'+a.join('.')+'|'+b.join('.');
}

function canonicalResidualQState(heights,r0,r1,permutationData){
  let best=null,bestHeights=null,bestR0=null,bestR1=null;
  for(const pd of permutationData){
    const {perm}=pd,h=new Uint8Array(heights.length);
    for(let oldCol=0;oldCol<heights.length;oldCol++)
      h[perm[oldCol]]=heights[oldCol];
    const a=r0.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
      b=r1.map(mask=>permuteMask(mask,pd)).sort((x,y)=>x-y),
      signature=Array.from(h).join(',')+'|'+a.join('.')+'|'+b.join('.');
    if(best===null||signature<best){
      best=signature;
      bestHeights=h;
      bestR0=a;
      bestR1=b;
    }
  }
  return {signature:best,heights:bestHeights,r0:bestR0,r1:bestR1};
}

function applyUniversalFrontierBlocker(
  heights,r0,r1,width,height,{nonterminalOnly=false}={}
){
  const rank=Array.from(heights).reduce((a,b)=>a+b,0),
    mover=rank&1,own=mover?r1:r0;
  let frontier=0;
  for(let col=0;col<width;col++)if(heights[col]<height){
    const bit=1<<(heights[col]*width+col),
      immediateWin=own.some(requirement=>requirement===bit);
    if(!nonterminalOnly||!immediateWin)frontier|=bit;
  }
  if(!nonterminalOnly&&frontier===0)return {r0,r1,removed:0};
  if(mover){
    const next=r0.filter(requirement=>(requirement&frontier)!==frontier);
    return {r0:next,r1,removed:r0.length-next.length};
  }
  const next=r1.filter(requirement=>(requirement&frontier)!==frontier);
  return {r0,r1:next,removed:r1.length-next.length};
}

function applyMoverFinalCapParity(heights,r0,r1,width,height){
  const rank=Array.from(heights).reduce((a,b)=>a+b,0),
    remaining=width*height-rank;
  if(remaining<=0||(remaining&1))return {r0,r1,removed:0};
  let caps=0;
  for(let col=0;col<width;col++)if(heights[col]<height)
    caps|=1<<((height-1)*width+col);
  if(caps===0)return {r0,r1,removed:0};
  if(rank&1){
    const next=r1.filter(requirement=>(requirement&caps)!==caps);
    return {r0,r1:next,removed:r1.length-next.length};
  }
  const next=r0.filter(requirement=>(requirement&caps)!==caps);
  return {r0:next,r1,removed:r0.length-next.length};
}

export function analyzeUnlabelledQuotientDimension({width,height,k,auditResidualOrbit=false}){
  const cells=width*height;
  assert.ok(cells<=20,'Number-key research harness is intentionally bounded to <=20 cells');
  const masks=winMasks(width,height,k),span=2**cells,memo=new Map(),
    byRank=Array.from({length:cells+1},()=>[]);

  const keyOf=(p0,p1)=>p0*span+p1;
  const won=bits=>masks.some(mask=>(bits&mask)===mask);

  function enumerate(p0,p1,heights,rank){
    const key=keyOf(p0,p1),known=memo.get(key);
    if(known)return key;

    const p0Won=won(p0),p1Won=won(p1);
    assert.equal(p0Won&&p1Won,false,'first-win graph cannot contain dual winners');
    const terminal=p0Won||p1Won||rank===cells;
    const winner=p0Won?0:p1Won?1:null;
    const rec={key,p0,p1,rank,terminal,winner,children:[]};
    memo.set(key,rec);
    byRank[rank].push(rec);
    if(terminal)return key;

    for(let col=0;col<width;col++)if(heights[col]<height){
      const cell=heights[col]*width+col,bit=1<<cell;
      heights[col]++;
      const childKey=(rank&1)?
        enumerate(p0,p1|bit,heights,rank+1):
        enumerate(p0|bit,p1,heights,rank+1);
      heights[col]--;
      rec.children.push(childKey);
    }
    return key;
  }

  const rootKey=enumerate(0,0,new Uint8Array(width),0);

  // Producer: recursive action-unlabelled quotient. No W/D/L values are read.
  const stateClass=new Map(),signatureClass=new Map(),
    classSize=new Map(),statesByRank=Array(cells+1).fill(0),
    classesByRank=Array(cells+1).fill(0);
  let nextId=0,successorEdgesProcessed=0,
    statesWithDuplicateEquivalentMoves=0,duplicateEquivalentMoveEdges=0,
    maxClassSize=0;

  for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
    statesByRank[rank]++;
    let signature;
    if(rec.terminal){
      const terminalKind=rec.winner===0?'P0':rec.winner===1?'P1':'D';
      signature=`T:${rank}:${terminalKind}`;
    }else{
      successorEdgesProcessed+=rec.children.length;
      const ids=rec.children.map(key=>{
        const id=stateClass.get(key);
        assert.notEqual(id,undefined,'child class must exist before parent class');
        return id;
      });
      const unique=[...new Set(ids)].sort((a,b)=>a-b);
      if(unique.length<ids.length){
        statesWithDuplicateEquivalentMoves++;
        duplicateEquivalentMoveEdges+=ids.length-unique.length;
      }
      signature=`N:${rank}:${rank&1}:${unique.join('.')}`;
    }
    let id=signatureClass.get(signature);
    if(id===undefined){
      id=nextId++;
      signatureClass.set(signature,id);
      classesByRank[rank]++;
    }
    stateClass.set(rec.key,id);
    const size=(classSize.get(id)??0)+1;
    classSize.set(id,size);
    if(size>maxClassSize)maxClassSize=size;
  }


  let residualOrbitAudit=null;
  if(auditResidualOrbit){
    const permutationData=columnPermutationData(width,height),
      orientationSignatures=new Set(),orbitToClasses=new Map(),
      orbitStateCount=new Map(),classToOrbits=new Map();

    for(const rec of memo.values()){
      const classId=stateClass.get(rec.key);
      let orientation,orbit;
      if(rec.terminal){
        const kind=rec.winner===0?'P0':rec.winner===1?'P1':'D';
        orientation='T:'+rec.rank+':'+kind;
        orbit=orientation;
      }else{
        const heights=heightsFromBits(rec.p0,rec.p1,width,height),
          r0=normalizeResidualAntichain(masks,rec.p0,rec.p1),
          r1=normalizeResidualAntichain(masks,rec.p1,rec.p0);
        orientation='Q:'+serializeResidualQ(heights,r0,r1,null);
        orbit=null;
        for(const pd of permutationData){
          const candidate='Q:'+serializeResidualQ(heights,r0,r1,pd);
          if(orbit===null||candidate<orbit)orbit=candidate;
        }
      }
      orientationSignatures.add(orientation);
      let classes=orbitToClasses.get(orbit);
      if(!classes){classes=new Set();orbitToClasses.set(orbit,classes);}
      classes.add(classId);
      orbitStateCount.set(orbit,(orbitStateCount.get(orbit)??0)+1);
      let orbits=classToOrbits.get(classId);
      if(!orbits){orbits=new Set();classToOrbits.set(classId,orbits);}
      orbits.add(orbit);
    }

    let splitOrbitSignatures=0,splitOrbitStates=0,
      recursiveClassesWithMultipleOrbitSignatures=0,
      maxOrbitSignaturesPerRecursiveClass=0;
    for(const [signature,classes] of orbitToClasses)if(classes.size>1){
      splitOrbitSignatures++;
      splitOrbitStates+=orbitStateCount.get(signature)??0;
    }
    for(const orbits of classToOrbits.values()){
      if(orbits.size>1)recursiveClassesWithMultipleOrbitSignatures++;
      if(orbits.size>maxOrbitSignaturesPerRecursiveClass)
        maxOrbitSignaturesPerRecursiveClass=orbits.size;
    }

    residualOrbitAudit={
      basis:'support + normalized P0/P1 residual antichains',
      canonicalization:'all column-label permutations',
      permutations:permutationData.length,
      orientationSensitiveClasses:orientationSignatures.size,
      columnOrbitClasses:orbitToClasses.size,
      recursiveClasses:nextId,
      splitOrbitSignatures,
      splitOrbitStates,
      soundAgainstRecursiveQuotient:splitOrbitSignatures===0,
      recursiveClassesWithMultipleOrbitSignatures,
      maxOrbitSignaturesPerRecursiveClass,
      exactMatch:
        splitOrbitSignatures===0&&
        recursiveClassesWithMultipleOrbitSignatures===0&&
        orbitToClasses.size===nextId,
    };
  }

  // Validation only: derive exact W/D/L after producer classes are frozen.
  const values=new Map();
  for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
    let value;
    if(rec.winner===0)value=1;
    else if(rec.winner===1)value=-1;
    else if(rec.terminal)value=0;
    else{
      const childValues=rec.children.map(key=>values.get(key));
      assert.ok(childValues.every(value=>value!==undefined));
      value=(rank&1)?Math.min(...childValues):Math.max(...childValues);
    }
    values.set(rec.key,value);
  }

  const classValueMask=new Map(),splitStatesByClass=new Map();
  for(const rec of memo.values()){
    const id=stateClass.get(rec.key),value=values.get(rec.key),
      bit=value<0?1:value>0?4:2;
    classValueMask.set(id,(classValueMask.get(id)??0)|bit);
    splitStatesByClass.set(id,(splitStatesByClass.get(id)??0)+1);
  }
  let wdlSplitClasses=0,wdlSplitStates=0;
  for(const [id,mask] of classValueMask)if((mask&(mask-1))!==0){
    wdlSplitClasses++;
    wdlSplitStates+=splitStatesByClass.get(id)??0;
  }

  const frontier=statesByRank.map((states,rank)=>({
    rank,states,classes:classesByRank[rank],
  })),root=memo.get(rootKey);

  return {
    schema:'connect4.unlabelled-quotient.dimension.v1',
    inputs:'geometry/gravity/turn-order/first-win/legal-successors',
    producerUsesOutcomeLabels:false,
    validationUsesDerivedWdl:true,
    width,height,k,cells,
    winningLineCount:masks.length,
    states:memo.size,
    successorEdgesProcessed,
    classes:nextId,
    stateClassRatio:memo.size/nextId,
    wdlSplitClasses,
    wdlSplitStates,
    rootValue:values.get(rootKey),
    rootLegalMoves:root.children.length,
    rootDistinctChildClasses:new Set(root.children.map(key=>stateClass.get(key))).size,
    statesWithDuplicateEquivalentMoves,
    duplicateEquivalentMoveEdges,
    maxClassSize,
    residualOrbitAudit,
    peakStateFrontier:peakBy(frontier,'states'),
    peakClassFrontier:peakBy(frontier,'classes'),
    frontier,
  };
}


export function analyzeDirectResidualOrbitGraph({width,height,k,universalFrontierBlocker=false,nonterminalFrontierBlocker=false,moverFinalCapParity=false,measureLocalBranchClosure=true}){
  const cells=width*height;
  assert.ok(cells<=30,'direct residual-orbit harness is intentionally bounded to <=30 cells');
  const masks=winMasks(width,height,k),
    permutationData=columnPermutationData(width,height),
    nodes=new Map(),byRank=Array.from({length:cells+1},()=>[]);
  let literalActionEdges=0,duplicateEquivalentActionEdges=0;

  function addTerminal(rank,kind){
    const key='T:'+rank+':'+kind;
    if(!nodes.has(key)){
      const rec={key,rank,terminal:true,kind,children:[]};
      nodes.set(key,rec);
      byRank[rank].push(rec);
    }
    return key;
  }

  function visit(state){
    const key='Q:'+state.signature,known=nodes.get(key);
    if(known)return key;
    const rank=Array.from(state.heights).reduce((a,b)=>a+b,0),
      rec={
        key,rank,terminal:false,kind:null,
        heights:state.heights,r0:state.r0,r1:state.r1,children:[],
      };
    nodes.set(key,rec);
    byRank[rank].push(rec);

    for(let col=0;col<width;col++)if(state.heights[col]<height){
      literalActionEdges++;
      const cell=state.heights[col]*width+col,bit=1<<cell,mover=rank&1,
        own=mover?state.r1:state.r0,opponent=mover?state.r0:state.r1,
        ownNext=[];
      let wins=false;
      for(const requirement of own){
        if(requirement&bit){
          const residual=requirement&~bit;
          if(residual===0){wins=true;break;}
          ownNext.push(residual);
        }else ownNext.push(requirement);
      }

      let childKey;
      if(wins){
        childKey=addTerminal(rank+1,mover?'P1':'P0');
      }else{
        const nextHeights=new Uint8Array(state.heights);
        nextHeights[col]++;
        if(rank+1===cells){
          childKey=addTerminal(rank+1,'D');
        }else{
          const opponentNext=opponent.filter(requirement=>(requirement&bit)===0),
            ownNormalized=normalizeMaskAntichain(ownNext),
            opponentNormalized=normalizeMaskAntichain(opponentNext),
            r0=mover?opponentNormalized:ownNormalized,
            r1=mover?ownNormalized:opponentNormalized,
            blocked=(universalFrontierBlocker||nonterminalFrontierBlocker)?
              applyUniversalFrontierBlocker(
                nextHeights,r0,r1,width,height,{nonterminalOnly:nonterminalFrontierBlocker}):
              {r0,r1,removed:0},
            closed=moverFinalCapParity?
              applyMoverFinalCapParity(
                nextHeights,blocked.r0,blocked.r1,width,height):
              blocked,
            canonical=canonicalResidualQState(
              nextHeights,closed.r0,closed.r1,permutationData);
          childKey=visit(canonical);
        }
      }
      rec.children.push(childKey);
    }
    duplicateEquivalentActionEdges+=
      rec.children.length-new Set(rec.children).size;
    return key;
  }

  const initialResidual=normalizeMaskAntichain(masks),
    rootHeights=new Uint8Array(width),
    rootBlocked=(universalFrontierBlocker||nonterminalFrontierBlocker)?
      applyUniversalFrontierBlocker(
        rootHeights,initialResidual,initialResidual,width,height,{nonterminalOnly:nonterminalFrontierBlocker}):
      {r0:initialResidual,r1:initialResidual,removed:0},
    rootClosed=moverFinalCapParity?
      applyMoverFinalCapParity(
        rootHeights,rootBlocked.r0,rootBlocked.r1,width,height):
      rootBlocked,
    root=canonicalResidualQState(
      rootHeights,rootClosed.r0,rootClosed.r1,permutationData),
    rootKey=visit(root);

  const stateClass=new Map(),signatureClass=new Map(),
    statesByRank=Array(cells+1).fill(0),classesByRank=Array(cells+1).fill(0);
  let nextId=0;
  for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
    statesByRank[rank]++;
    let signature;
    if(rec.terminal)signature=rec.key;
    else{
      const ids=rec.children.map(child=>{
        const id=stateClass.get(child);
        assert.notEqual(id,undefined,'direct q child class must exist');
        return id;
      }),unique=[...new Set(ids)].sort((a,b)=>a-b);
      signature='N:'+rank+':'+(rank&1)+':'+unique.join('.');
    }
    let id=signatureClass.get(signature);
    if(id===undefined){
      id=nextId++;
      signatureClass.set(signature,id);
      classesByRank[rank]++;
    }
    stateClass.set(rec.key,id);
  }

  let localBranchClosureResult=null;
  if(measureLocalBranchClosure){
    function samePartition(candidate,reference){
      const aToB=new Map(),bToA=new Map();
      for(const key of nodes.keys()){
        const a=candidate.get(key),b=reference.get(key);
        if(aToB.has(a)&&aToB.get(a)!==b)return false;
        if(bToA.has(b)&&bToA.get(b)!==a)return false;
        aToB.set(a,b);bToA.set(b,a);
      }
      return true;
    }
  
    let localClass;
    {
      const terminalIds=new Map(),next=new Map();
      let id=0;
      for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
        if(rec.terminal){
          const sig='T:'+rec.rank+':'+rec.kind;
          let classId=terminalIds.get(sig);
          if(classId===undefined){classId=id++;terminalIds.set(sig,classId);}
          next.set(rec.key,classId);
        }else next.set(rec.key,id++);
      }
      localClass=next;
    }
  
    const localBranchClosure=[{
      round:0,
      classes:new Set(localClass.values()).size,
      matchesFull:samePartition(localClass,stateClass),
    }];
    let localRoundsToFull=localBranchClosure[0].matchesFull?0:null;
    for(let round=1;round<=cells&&localRoundsToFull===null;round++){
      const signatureToId=new Map(),next=new Map();
      let id=0;
      for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
        let sig;
        if(rec.terminal)sig='T:'+rec.rank+':'+rec.kind;
        else{
          const childIds=rec.children.map(child=>localClass.get(child));
          assert.ok(childIds.every(x=>x!==undefined));
          const unique=[...new Set(childIds)].sort((a,b)=>a-b);
          sig='N:'+rec.rank+':'+(rec.rank&1)+':'+unique.join('.');
        }
        let classId=signatureToId.get(sig);
        if(classId===undefined){classId=id++;signatureToId.set(sig,classId);}
        next.set(rec.key,classId);
      }
      localClass=next;
      const matchesFull=samePartition(localClass,stateClass);
      localBranchClosure.push({
        round,
        classes:new Set(localClass.values()).size,
        matchesFull,
      });
      if(matchesFull)localRoundsToFull=round;
    }
    assert.notEqual(localRoundsToFull,null,
      'iterated local branch closure must recover full recursive quotient');
  
  
    localBranchClosureResult={
      roundsToFull:localRoundsToFull,
      rounds:localBranchClosure,
    };
  }

  // Post-hoc exact W/D/L validation on the direct q-orbit graph.
  const values=new Map(),classValueMask=new Map();
  for(let rank=cells;rank>=0;rank--)for(const rec of byRank[rank]){
    let value;
    if(rec.terminal)
      value=rec.kind==='P0'?1:rec.kind==='P1'?-1:0;
    else{
      const childValues=rec.children.map(child=>values.get(child));
      assert.ok(childValues.every(x=>x!==undefined));
      value=(rank&1)?Math.min(...childValues):Math.max(...childValues);
    }
    values.set(rec.key,value);
    const id=stateClass.get(rec.key),bit=value<0?1:value>0?4:2;
    classValueMask.set(id,(classValueMask.get(id)??0)|bit);
  }
  let wdlSplitClasses=0;
  for(const mask of classValueMask.values())
    if((mask&(mask-1))!==0)wdlSplitClasses++;

  const frontier=statesByRank.map((states,rank)=>({
      rank,states,classes:classesByRank[rank],
    })),
    rootRec=nodes.get(rootKey),
    orbitIndex=new Map([...nodes.keys()].map((key,index)=>[key,index])),
    dynamicMergeByRank=[];
  let earliestDynamicMergeRank=null,earliestDynamicMergeGroups=[];
  for(let rank=0;rank<=cells;rank++){
    const groups=new Map();
    for(const rec of byRank[rank]){
      const id=stateClass.get(rec.key);
      let rows=groups.get(id);
      if(!rows){rows=[];groups.set(id,rows);}
      rows.push(rec);
    }
    const merged=[...groups.entries()].filter(([,rows])=>rows.length>1);
    dynamicMergeByRank.push({
      rank,
      mergedRecursiveClasses:merged.length,
      orbitExcess:merged.reduce((n,[,rows])=>n+rows.length-1,0),
      maxOrbitStatesPerRecursiveClass:merged.reduce(
        (m,[,rows])=>Math.max(m,rows.length),1),
    });
    if(earliestDynamicMergeRank===null&&merged.length){
      earliestDynamicMergeRank=rank;
      earliestDynamicMergeGroups=merged.slice(0,64).map(([classId,rows])=>({
        classId,
        orbitStates:rows.map(rec=>({
          orbitIndex:orbitIndex.get(rec.key),
          support:rec.heights?Array.from(rec.heights):null,
          p0Residuals:rec.r0??null,
          p1Residuals:rec.r1??null,
          childOrbitIndices:rec.children.map(key=>orbitIndex.get(key)),
          childRecursiveClasses:[...new Set(
            rec.children.map(key=>stateClass.get(key)))].sort((a,b)=>a-b),
        })),
      }));
    }
  }

  return {
    schema:'connect4.direct-residual-orbit-graph.v1',
    inputs:'root geometry + residual-antichain cofactor rules + support + action relabeling',
    physicalBoardStatesEnumerated:false,
    outcomeLabelsUsedByProducer:false,
    validationUsesDerivedWdl:true,
    width,height,k,cells,
    columnPermutations:permutationData.length,
    universalFrontierBlocker,
    nonterminalFrontierBlocker,
    moverFinalCapParity,
    measureLocalBranchClosure,
    winningLineCount:masks.length,
    residualOrbitStates:nodes.size,
    literalActionEdges,
    duplicateEquivalentActionEdges,
    recursiveUnlabelledClasses:nextId,
    wdlSplitClasses,
    rootValue:values.get(rootKey),
    rootLegalActions:rootRec.children.length,
    rootDistinctOrbitChildren:new Set(rootRec.children).size,
    rootDistinctRecursiveChildren:
      new Set(rootRec.children.map(child=>stateClass.get(child))).size,
    earliestDynamicMergeRank,
    earliestDynamicMergeGroups,
    dynamicMergeByRank,
    localBranchClosure:localBranchClosureResult,
    peakOrbitStateFrontier:peakBy(frontier,'states'),
    peakRecursiveClassFrontier:peakBy(frontier,'classes'),
    frontier,
  };
}

export function analyzeUnlabelledQuotientDimensionMatrix({
  cases=[
    {width:3,height:3,k:3},
    {width:4,height:3,k:3},
    {width:3,height:4,k:3},
    {width:4,height:4,k:3},
    {width:4,height:4,k:4},
  ],
}={}){
  return {
    schema:'connect4.unlabelled-quotient.dimension-matrix.v1',
    producerUsesOutcomeLabels:false,
    cases:cases.map(analyzeUnlabelledQuotientDimension),
  };
}
