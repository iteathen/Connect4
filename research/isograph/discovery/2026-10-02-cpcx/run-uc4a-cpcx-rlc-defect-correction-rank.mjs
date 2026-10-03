import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  deriveCpcxSaturatedColumnRlcProfile,
} from './cpcx-saturated-column-cofactor.mjs';
import {
  certifyCpcxResidualDefectTransport,
  createCpcxResidualDefectPair,
} from './cpcx-residual-defect-transport.mjs';
import {
  deriveCpcxCommonRlcGuard,
} from './cpcx-common-rlc-guard.mjs';

const g=createCpcxGeometry(),center=3,sideColumns=[0,1,2,4,5,6];

function frontier(position){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const row=position.heights[c];
    if(row<g.rows)out.push(row*g.columns+c);
  }
  return out;
}

function pairEvent(left,right,eventCell){
  const t=certifyCpcxResidualDefectTransport(left,right,{
    eventCell,
    saturatedColumn:center,
  });
  if(!t.exact)throw new Error(`defect transport ${t.seam}`);
  return {
    transport:t,
    left:applyCpcxForcedEvent(left,eventCell),
    right:applyCpcxForcedEvent(right,eventCell),
  };
}

function profileMap(position){
  const q=deriveCpcxSaturatedColumnRlcProfile(position,{column:center});
  if(!q.exact)throw new Error(`RLC profile ${q.seam}`);
  return new Map(q.candidates.map(x=>[x.column,x]));
}

function correction(left,right){
  const L=profileMap(left),R=profileMap(right),vector=[],rows=[];
  if(L.size!==R.size)throw new Error('paired legal-column count mismatch');
  for(const column of sideColumns){
    const a=L.get(column),b=R.get(column);
    if(!a&&!b)continue;
    if(!a||!b)throw new Error('paired legal-column mismatch');
    const dA=a.A-b.A,dB=a.B-b.B;
    vector.push(dA,dB);
    rows.push({
      column:column+1,
      left:{A:a.A,B:a.B,H:a.H},
      right:{A:b.A,B:b.B,H:b.H},
      deltaA:dA,
      deltaB:dB,
    });
  }
  return {vector,rows};
}

function gcd(a,b){
  a=Math.abs(a);b=Math.abs(b);
  while(b){const t=a%b;a=b;b=t;}
  return a;
}
function primitive(v){
  let d=0;
  for(const x of v)d=gcd(d,x);
  if(!d)return [...v];
  const out=v.map(x=>x/d),
    first=out.find(x=>x!==0)??0;
  return first<0?out.map(x=>-x):out;
}

function rank(matrix){
  if(!matrix.length)return 0;
  const a=matrix.map(r=>r.map(Number)),
    m=a.length,n=a[0].length;
  let row=0;
  for(let col=0;col<n&&row<m;col++){
    let p=row;
    while(p<m&&Math.abs(a[p][col])<1e-12)p++;
    if(p===m)continue;
    [a[row],a[p]]=[a[p],a[row]];
    const q=a[row][col];
    for(let j=col;j<n;j++)a[row][j]/=q;
    for(let i=0;i<m;i++){
      if(i===row)continue;
      const f=a[i][col];
      if(Math.abs(f)<1e-12)continue;
      for(let j=col;j<n;j++)a[i][j]-=f*a[row][j];
    }
    row++;
  }
  return row;
}

const states=[];
function record(stage,x,left,right,meta={}){
  if(left.terminal||right.terminal)return;
  const pair=createCpcxResidualDefectPair(left,right,{saturatedColumn:center});
  if(!pair.exact)throw new Error(`pair ${pair.seam}`);
  const c=correction(left,right);
  states.push({
    stage,
    x:x+1,
    distanceFromCenter:Math.abs(x-center),
    rank:left.rank,
    mover:left.mover,
    support:Array.from(left.heights),
    defectSize:pair.defectSize,
    correctionVector:c.vector,
    correctionRows:c.rows,
    ...meta,
  });
}

for(const x of [0,1,2,4,5,6]){
  const left=buildCpcxPosition('44444'+(x+1)+'4',{geometry:g}),
    right=buildCpcxPosition('444444'+(x+1),{geometry:g});
  record('HANDOFF',x,left,right);

  for(const event1 of frontier(left)){
    const p1=pairEvent(left,right,event1);
    if(p1.left.terminal||p1.right.terminal)continue;
    record('AFTER_EVENT1',x,p1.left,p1.right,{event1Column:event1%g.columns+1});

    const guard=deriveCpcxCommonRlcGuard(p1.left,p1.right,{
      saturatedColumn:center,
    });
    if(!guard.exact)throw new Error(`guard1 ${guard.seam}`);

    for(const responseColumn of guard.guardColumns){
      const responseCell=p1.left.heights[responseColumn]*g.columns+responseColumn,
        p2=pairEvent(p1.left,p1.right,responseCell);
      if(p2.left.terminal||p2.right.terminal)continue;
      record('AFTER_RESPONSE1',x,p2.left,p2.right,{
        event1Column:event1%g.columns+1,
        response1Column:responseColumn+1,
      });

      for(const event2 of frontier(p2.left)){
        const p3=pairEvent(p2.left,p2.right,event2);
        if(p3.left.terminal||p3.right.terminal)continue;
        record('AFTER_EVENT2',x,p3.left,p3.right,{
          event1Column:event1%g.columns+1,
          response1Column:responseColumn+1,
          event2Column:event2%g.columns+1,
        });
      }
    }
  }
}

const vectors=states.map(x=>x.correctionVector),
  directions=new Map(),
  stageStats={},
  distanceStats={};

for(const s of states){
  const p=primitive(s.correctionVector),key=p.join(',');
  if(!directions.has(key))directions.set(key,{
    direction:p,count:0,stages:new Set(),distances:new Set(),
  });
  const d=directions.get(key);
  d.count++;d.stages.add(s.stage);d.distances.add(s.distanceFromCenter);

  if(!stageStats[s.stage])stageStats[s.stage]={count:0,vectors:[]};
  stageStats[s.stage].count++;
  stageStats[s.stage].vectors.push(s.correctionVector);

  const dk=String(s.distanceFromCenter);
  if(!distanceStats[dk])distanceStats[dk]={count:0,vectors:[]};
  distanceStats[dk].count++;
  distanceStats[dk].vectors.push(s.correctionVector);
}

const maxAbs=Math.max(0,...vectors.flat().map(Math.abs)),
  allCoordinateAntiSymmetric=states.every(s=>
    s.correctionRows.every(r=>r.deltaA===-r.deltaB)
  ),
  nonzeroCoordinatePairs=[...new Set(states.flatMap(s=>
    s.correctionRows
      .filter(r=>r.deltaA!==0||r.deltaB!==0)
      .map(r=>`${r.deltaA},${r.deltaB}`)
  ))].sort();

console.log(JSON.stringify({
  schema:'connect4.uc4a.cpcx.rlc-defect-correction-rank.v0_1',
  observation:'full saturated-center RLC A/B score correction between owner-exchange paired states through two qualified common-guard layers',
  states,
  summary:{
    stateCount:states.length,
    vectorWidth:vectors[0]?.length??0,
    correctionSpanRank:rank(vectors),
    primitiveDirectionCount:directions.size,
    primitiveDirections:[...directions.values()]
      .sort((a,b)=>b.count-a.count||a.direction.join(',').localeCompare(b.direction.join(',')))
      .map(x=>({
        direction:x.direction,
        count:x.count,
        stages:[...x.stages].sort(),
        distances:[...x.distances].sort((a,b)=>a-b),
      })),
    maxAbsoluteCoordinate:maxAbs,
    nonzeroCoordinatePairs,
    allCoordinateAntiSymmetric,
    byStage:Object.fromEntries(Object.entries(stageStats).map(([k,v])=>[
      k,{count:v.count,spanRank:rank(v.vectors)}
    ])),
    byDistance:Object.fromEntries(Object.entries(distanceStats).map(([k,v])=>[
      k,{count:v.count,spanRank:rank(v.vectors)}
    ])),
  },
  boundary:{
    diagnosticOnly:true,
    exactlyTwoAdversaryLayers:true,
    fullRlcCandidateScoresRetained:true,
    boundedResidualDefectTransportOnly:true,
    noInductiveClaim:true,
    noSolvedData:true,
    oracle:false,
    minimax:false,
    recursiveSearch:false,
  },
},null,2));
