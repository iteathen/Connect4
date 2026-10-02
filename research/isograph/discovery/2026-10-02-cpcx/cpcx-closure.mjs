// CPCX v0.2 — exact forced-response closure and guarded multi-piece algebra.
//
// This module remains separate from production CPC. It adds only:
// - exact current-ply singleton/overload classification;
// - deterministic forced-event transit (no choice enumeration);
// - bounded 2..4-piece projection descriptors;
// - parity/XOR fact closure;
// - polynomial bipartite response-capacity matching;
// - explicit finite-column boundary/debt descriptors.
//
// No W/D/L recursion or solved-position data is consumed.

import {
  scanCpcxObligations,
  cpcxCell,
  cpcxColumnProfiles,
} from './cpcx.mjs';

function uniqueSorted(values){
  return [...new Set(values)].sort((a,b)=>a-b);
}

function terminalThroughCell(position,cell,player){
  const g=position.geometry;
  for(const lineId of g.cellLines[cell]){
    const line=g.lines[lineId];
    let full=1;
    for(const x of line.cells)if(position.owner[x]!==player){full=0;break;}
    if(full)return lineId;
  }
  return -1;
}

export function classifyCpcxImmediate(position,obligations=scanCpcxObligations(position)){
  if(position.terminal)return {
    kind:'ALREADY_TERMINAL',
    exact:true,
    terminal:position.terminal,
    mover:position.mover,
  };

  const mover=position.mover,opponent=mover^1,
    own=[],enemy=[];
  for(const o of obligations){
    if(o.missingCount!==1||o.events[0].supportDistance!==0)continue;
    (o.player===mover?own:enemy).push(o.missingCells[0]);
  }

  const ownCells=uniqueSorted(own),enemyCells=uniqueSorted(enemy);
  if(ownCells.length)return {
    kind:'IMMEDIATE_TERMINAL_AVAILABLE',
    exact:true,
    mover,
    winningCells:ownCells,
    opponentThreatCells:enemyCells,
    reason:'current-player terminal precedence',
  };
  if(enemyCells.length>=2)return {
    kind:'FORCED_LOSS_OVERLOAD',
    exact:true,
    mover,
    opponent,
    threatCells:enemyCells,
    responseSlots:1,
    deficit:enemyCells.length-1,
    reason:'distinct currently playable opponent singletons exceed one placement response slot',
  };
  if(enemyCells.length===1)return {
    kind:'FORCED_RESPONSE',
    exact:true,
    mover,
    opponent,
    cell:enemyCells[0],
    reason:'one distinct currently playable opponent singleton and no current-player terminal',
  };
  return {
    kind:'NO_IMMEDIATE_OBLIGATION',
    exact:true,
    mover,
  };
}

export function applyCpcxForcedEvent(position,cell){
  if(position.terminal)throw new RangeError('terminal position');
  const g=position.geometry,{column,row}=cpcxCell(g,cell);
  if(row!==position.heights[column])throw new RangeError('event is not current legal frontier');
  if(row>=g.rows||position.owner[cell]!==-1)throw new RangeError('illegal event');

  const owner=new Int8Array(position.owner),
    heights=new Uint32Array(position.heights),
    player=position.mover;
  owner[cell]=player;heights[column]=row+1;

  const moves=new Uint32Array(position.moves.length+1);
  moves.set(position.moves);moves[moves.length-1]=column;

  const next={
    geometry:g,
    moves,
    rank:position.rank+1,
    mover:player^1,
    heights,
    owner,
    terminal:null,
  };
  const lineId=terminalThroughCell(next,cell,player);
  if(lineId>=0)next.terminal={player,lineId};
  return next;
}

export function closeCpcxForcedResponses(position,{maxSteps=position.geometry.cellCount-position.rank}={}){
  if(!Number.isInteger(maxSteps)||maxSteps<0)throw new RangeError('maxSteps');
  let current=position;
  const steps=[];
  for(let step=0;step<=maxSteps;step++){
    const obligations=scanCpcxObligations(current),
      immediate=classifyCpcxImmediate(current,obligations);
    if(immediate.kind!=='FORCED_RESPONSE')return {
      kind:immediate.kind==='FORCED_LOSS_OVERLOAD'
        ?'CERTIFIED_FORCED_LOSS'
        :immediate.kind==='ALREADY_TERMINAL'
          ?'TERMINAL'
          :'OPEN',
      exact:true,
      position:current,
      steps,
      boundary:immediate,
      choiceEnumeration:false,
    };
    if(step===maxSteps)throw new RangeError('forced closure step bound exhausted');
    const beforeRank=current.rank,mover=current.mover;
    current=applyCpcxForcedEvent(current,immediate.cell);
    steps.push({
      rankBefore:beforeRank,
      player:mover,
      cell:immediate.cell,
      column:immediate.cell%current.geometry.columns,
      reason:'FORCED_SINGLETON_RESPONSE',
      terminal:current.terminal,
    });
    if(current.terminal)return {
      kind:'TERMINAL',
      exact:true,
      position:current,
      steps,
      boundary:{kind:'FORCED_RESPONSE_TERMINAL',terminal:current.terminal},
      choiceEnumeration:false,
    };
  }
  throw new RangeError('unreachable forced closure');
}

export function projectCpcxObligation(obligation){
  const owner=obligation.player,vector=obligation.projectedOwnerVector,
    ownerCount=vector.reduce((n,x)=>n+(x===owner),0),
    opponentCount=vector.length-ownerCount,
    ranks=obligation.events.map(e=>e.eventRank),
    distances=obligation.events.map(e=>e.supportDistance),
    sameRank=ranks.every(x=>x===ranks[0]),
    sameSupportDistance=distances.every(x=>x===distances[0]);

  return {
    obligationId:obligation.id,
    player:owner,
    missingCount:obligation.missingCount,
    controlClass:ownerCount===vector.length
      ?'ALL_PROJECTED_TO_OWNER'
      :opponentCount===vector.length
        ?'ALL_PROJECTED_TO_OPPONENT'
        :'MIXED_PROJECTED_OWNERSHIP',
    ownerCount,
    opponentCount,
    synchronizedEventRank:sameRank?ranks[0]:null,
    synchronizedSupportDistance:sameSupportDistance?distances[0]:null,
    eventRanks:ranks,
    supportDistances:distances,
    projectionOnly:true,
    exactCompletionClaim:false,
    boundary:'projected ownership is not certified future ownership without response/resource/deadline guards',
  };
}

export function listCpcxMultiPieceProjectionCandidates(obligations){
  return obligations
    .filter(o=>o.missingCount>=2&&o.missingCount<=4)
    .map(projectCpcxObligation)
    .filter(x=>x.controlClass==='ALL_PROJECTED_TO_OWNER');
}

export function findCpcxSynchronizedProjectionLadders(obligations){
  const out=[];
  for(const obligation of obligations){
    if(obligation.missingCount<2||obligation.missingCount>4)continue;
    const projection=projectCpcxObligation(obligation);
    if(projection.controlClass!=='ALL_PROJECTED_TO_OWNER')continue;
    if(projection.synchronizedEventRank===null||projection.synchronizedSupportDistance===null)continue;
    out.push({
      obligationId:obligation.id,
      player:obligation.player,
      lineId:obligation.lineId,
      lineLabel:obligation.lineLabel,
      orientation:obligation.orientation,
      missingCount:obligation.missingCount,
      missingCells:[...obligation.missingCells],
      eventRank:projection.synchronizedEventRank,
      supportDistance:projection.synchronizedSupportDistance,
      contractionLevels:Array.from({length:obligation.missingCount+1},(_,i)=>obligation.missingCount-i),
      kind:'SYNCHRONIZED_MULTI_PIECE_PROJECTION',
      exact:false,
      proofNeed:[
        'certify projected event ownership under interventions',
        'certify event admissibility/support',
        'certify completion before opponent terminal deadline',
      ],
    });
  }
  return out;
}

export function buildCpcxBoundaryOperators(position){
  return cpcxColumnProfiles(position).map(p=>({
    column:p.column,
    height:p.height,
    remaining:p.remaining,
    neutralPairCount:p.neutralPairCount,
    unmatchedTopDefect:p.unmatchedTopDefect,
    pairEvents:2*p.neutralPairCount,
    unmatchedEventOffset:p.unmatchedTopDefect?2*p.neutralPairCount+1:null,
    class:p.unmatchedTopDefect?'ODD_REMAINDER_BOUNDARY':'EVEN_REMAINDER_BOUNDARY',
    operator:p.unmatchedTopDefect
      ?'consume neutral response pairs, then expose one unmatched top event'
      :'consume neutral response pairs, then exhaust column with no unmatched event',
    premise:'exact local boundary descriptor under a certified same-column response-pair schedule',
  }));
}

export function createCpcxParitySystem(cellCount){
  if(!Number.isInteger(cellCount)||cellCount<1)throw new RangeError('cellCount');
  const anchor=cellCount,n=cellCount+1,
    parent=new Int32Array(n),rank=new Uint8Array(n),xorToParent=new Uint8Array(n);
  for(let i=0;i<n;i++)parent[i]=i;
  let contradiction=null;

  function validateCell(cell){
    if(!Number.isInteger(cell)||cell<0||cell>=cellCount)throw new RangeError('cell');
  }
  function find(x){
    if(parent[x]===x)return {root:x,xor:0};
    const p=parent[x],r=find(p);
    xorToParent[x]^=r.xor;parent[x]=r.root;
    return {root:parent[x],xor:xorToParent[x]};
  }
  function addXorRaw(a,b,value){
    const bit=value&1,fa=find(a),fb=find(b);
    if(fa.root===fb.root){
      if((fa.xor^fb.xor)!==bit){
        contradiction={a:a===anchor?'ANCHOR':a,b:b===anchor?'ANCHOR':b,value:bit};
        return false;
      }
      return true;
    }
    let ra=fa.root,rb=fb.root,xa=fa.xor,xb=fb.xor;
    if(rank[ra]>rank[rb]){
      [ra,rb]=[rb,ra];[xa,xb]=[xb,xa];
    }
    parent[ra]=rb;
    xorToParent[ra]=xa^xb^bit;
    if(rank[ra]===rank[rb])rank[rb]+=1;
    return true;
  }

  return {
    cellCount,
    addXor(a,b,value){validateCell(a);validateCell(b);return addXorRaw(a,b,value);},
    setOwner(cell,owner){validateCell(cell);return addXorRaw(cell,anchor,owner);},
    queryXor(a,b){
      validateCell(a);validateCell(b);
      const fa=find(a),fb=find(b);
      return fa.root===fb.root?(fa.xor^fb.xor):null;
    },
    queryOwner(cell){
      validateCell(cell);
      const fc=find(cell),fa=find(anchor);
      return fc.root===fa.root?(fc.xor^fa.xor):null;
    },
    get contradiction(){return contradiction;},
    get consistent(){return contradiction===null;},
  };
}

function normalizeCellSet(value){
  if(value instanceof Set)return value;
  if(Array.isArray(value)||value instanceof Uint32Array||value instanceof Int32Array)
    return new Set(Array.from(value));
  throw new TypeError('cell guard set');
}

export function certifyCpcxObligation(obligation,{
  parity,
  admissibleCells=obligation.missingCells,
  beforeDeadlineCells=obligation.missingCells,
}={}){
  if(!parity||typeof parity.queryOwner!=='function')throw new TypeError('parity system required');
  if(!parity.consistent)return {
    kind:'INCONSISTENT_FACT_SYSTEM',
    exact:false,
    contradiction:parity.contradiction,
  };
  const admissible=normalizeCellSet(admissibleCells),
    beforeDeadline=normalizeCellSet(beforeDeadlineCells),
    facts=[];
  for(const cell of obligation.missingCells){
    const owner=parity.queryOwner(cell);
    facts.push({
      cell,
      owner,
      admissible:admissible.has(cell),
      beforeDeadline:beforeDeadline.has(cell),
    });
    if(owner!==null&&owner!==obligation.player)return {
      kind:'CERTIFIED_KILLED',
      exact:true,
      obligationId:obligation.id,
      killingCell:cell,
      owner,
      facts,
    };
  }
  if(facts.some(x=>x.owner===null))return {
    kind:'UNRESOLVED_OWNER',
    exact:false,
    obligationId:obligation.id,
    facts,
  };
  if(facts.some(x=>!x.admissible))return {
    kind:'UNRESOLVED_ADMISSIBILITY',
    exact:false,
    obligationId:obligation.id,
    facts,
  };
  if(facts.some(x=>!x.beforeDeadline))return {
    kind:'UNRESOLVED_DEADLINE',
    exact:false,
    obligationId:obligation.id,
    facts,
  };
  return {
    kind:'CERTIFIED_COMPLETION',
    exact:true,
    obligationId:obligation.id,
    player:obligation.player,
    missingCount:obligation.missingCount,
    facts,
    proofShape:'all required events have exact owner, admissibility and before-deadline facts',
  };
}

export function solveCpcxResponseCapacity({demands,resources,edges}){
  if(!Array.isArray(demands)||!Array.isArray(resources)||!Array.isArray(edges))
    throw new TypeError('demands/resources/edges arrays required');
  if(new Set(demands).size!==demands.length||new Set(resources).size!==resources.length)
    throw new RangeError('duplicate demand/resource ids');

  const di=new Map(demands.map((x,i)=>[x,i])),
    ri=new Map(resources.map((x,i)=>[x,i])),
    adj=Array.from({length:demands.length},()=>[]);
  for(const edge of edges){
    const d=Array.isArray(edge)?edge[0]:edge.demand,
      r=Array.isArray(edge)?edge[1]:edge.resource;
    if(!di.has(d)||!ri.has(r))throw new RangeError('edge endpoint');
    adj[di.get(d)].push(ri.get(r));
  }
  for(const a of adj)a.sort((x,y)=>x-y);

  const matchR=new Int32Array(resources.length);matchR.fill(-1);
  const matchD=new Int32Array(demands.length);matchD.fill(-1);

  function augment(d,seen){
    for(const r of adj[d]){
      if(seen[r])continue;
      seen[r]=1;
      if(matchR[r]===-1||augment(matchR[r],seen)){
        matchR[r]=d;matchD[d]=r;return true;
      }
    }
    return false;
  }

  let size=0;
  for(let d=0;d<demands.length;d++)
    if(augment(d,new Uint8Array(resources.length)))size+=1;

  const perfect=size===demands.length,
    matching=[];
  for(let d=0;d<demands.length;d++)if(matchD[d]>=0)
    matching.push({demand:demands[d],resource:resources[matchD[d]]});

  let hallWitness=null;
  if(!perfect){
    const seenD=new Uint8Array(demands.length),
      seenR=new Uint8Array(resources.length),queue=[];
    for(let d=0;d<demands.length;d++)if(matchD[d]===-1){seenD[d]=1;queue.push(d);}
    for(let qi=0;qi<queue.length;qi++){
      const d=queue[qi];
      for(const r of adj[d]){
        if(matchD[d]===r)continue;
        if(seenR[r])continue;
        seenR[r]=1;
        const md=matchR[r];
        if(md>=0&&!seenD[md]){seenD[md]=1;queue.push(md);}
      }
    }
    const S=[],N=[];
    for(let d=0;d<demands.length;d++)if(seenD[d])S.push(demands[d]);
    for(let r=0;r<resources.length;r++)if(seenR[r])N.push(resources[r]);
    hallWitness={
      demands:S,
      resources:N,
      demandCount:S.length,
      resourceCount:N.length,
      deficiency:S.length-N.length,
    };
  }

  return {
    exact:true,
    algorithm:'polynomial bipartite augmenting-path matching',
    demandCount:demands.length,
    resourceCount:resources.length,
    matchingSize:size,
    perfect,
    matching,
    hallWitness,
  };
}

export function immediateCpcxCapacityCertificate(position,obligations=scanCpcxObligations(position)){
  const immediate=classifyCpcxImmediate(position,obligations);
  if(immediate.kind!=='FORCED_LOSS_OVERLOAD')return {
    kind:'NO_IMMEDIATE_CAPACITY_DEFICIENCY',
    exact:true,
    immediate,
  };
  const demands=immediate.threatCells.map(cell=>`threat:${cell}`),
    resources=['current-placement-slot'],
    edges=demands.map(d=>[d,resources[0]]),
    matching=solveCpcxResponseCapacity({demands,resources,edges});
  return {
    kind:'IMMEDIATE_CAPACITY_DEFICIENCY',
    exact:true,
    immediate,
    matching,
  };
}
