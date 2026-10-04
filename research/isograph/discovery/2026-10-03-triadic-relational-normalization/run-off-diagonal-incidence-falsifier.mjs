import fs from 'node:fs';

const oldBase='research/isograph/discovery/2026-09-30-universal-structural-policy';
const bridge=JSON.parse(fs.readFileSync(
  oldBase+'/CPC_FORMULA_EXCHANGE_PHASE_BRIDGE_PILOT_0_1.json','utf8'
));
const cpcx=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));

const PAIRS=[[0,1],[0,2],[1,2]];
function channelVector(x){
  return [x.capacity,x.depth0,x.positiveDepth,
    x.p1Depth0,x.p1PositiveDepth,x.p2Depth0,x.p2PositiveDepth];
}
function edgeVector(x){
  return [x.deltaCapacity,x.deltaPositiveDepth,x.relation];
}
function changedIndices(a,b,vec){
  const out=[];
  for(let i=0;i<Math.min(a.length,b.length);i++)
    if(JSON.stringify(vec(a[i]))!==JSON.stringify(vec(b[i])))out.push(i);
  return out;
}
function incidentEdges(roleSet){
  const s=new Set(roleSet),out=[];
  for(let i=0;i<PAIRS.length;i++){
    const [a,b]=PAIRS[i];
    if(s.has(a)||s.has(b))out.push(i);
  }
  return out;
}
function sameSet(a,b){
  return a.length===b.length&&a.every(x=>b.includes(x));
}

const historical=[];
for(const r of bridge.rows??[]){
  const roles=changedIndices(r.pre.channels,r.post.channels,channelVector),
    edges=changedIndices(r.pre.edges,r.post.edges,edgeVector),
    expected=roles.length===1?incidentEdges(roles):roles.length===2?[0,1,2]:[];
  historical.push({
    state:r.state,label:r.label,persistent:Boolean(r.next),
    roles,edges,expected,
    offDiagonalExact:sameSet(edges,expected),
  });
}

function col(label){return label.charCodeAt(0)-65;}
function deltas(v){return [v[1]-v[0],v[2]-v[0],v[2]-v[1]];}
const current=[];
for(const source of cpcx.rows??[]){
  const support=[...(source.residual?.supportVector??[])],
    missing=[...(source.residual?.missing??[])];
  if(support.length!==3||missing.length!==3)continue;
  const cols=missing.map(col);
  for(const e of source.responses??[]){
    if(e.role!=='EXTERNAL_SUPPORT_EVENT')continue;
    const after=[...support],ec=col(e.eventCell);
    for(let i=0;i<3;i++)if(cols[i]===ec&&after[i]>0)after[i]--;
    const roles=[];for(let i=0;i<3;i++)if(support[i]!==after[i])roles.push(i);
    const bd=deltas(support),ad=deltas(after),edges=[];
    for(let i=0;i<3;i++)if(bd[i]!==ad[i])edges.push(i);
    const expected=roles.length===1?incidentEdges(roles):[];
    current.push({
      roles,edges,expected,
      offDiagonalExact:roles.length===0?edges.length===0:sameSet(edges,expected),
    });
  }
}

function permuteRoles(indices,p){return indices.map(i=>p.indexOf(i)).sort((a,b)=>a-b);}
function permuteEdges(indices,p){
  const map=PAIRS.map(([a,b])=>{
    const x=[p.indexOf(a),p.indexOf(b)].sort((u,v)=>u-v);
    return PAIRS.findIndex(([u,v])=>u===x[0]&&v===x[1]);
  });
  return indices.map(i=>map[i]).sort((a,b)=>a-b);
}
const perms=[
  [0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]
];
function invariantUnderS3(rows){
  for(const r of rows)for(const p of perms){
    const roles=permuteRoles(r.roles,p),edges=permuteEdges(r.edges,p),
      expected=roles.length===1?incidentEdges(roles):roles.length===2?[0,1,2]:[];
    if(roles.length===0){if(edges.length!==0)return false;}
    else if(!sameSet(edges,expected))return false;
  }
  return true;
}
console.log(JSON.stringify({
  schema:'connect4.triadic.off_diagonal_incidence_falsifier.v0_1',
  historical:{
    rowCount:historical.length,
    persistentCount:historical.filter(x=>x.persistent).length,
    exactOffDiagonalCount:historical.filter(x=>x.offDiagonalExact).length,
    persistentExactOffDiagonal:
      historical.filter(x=>x.persistent).every(x=>x.offDiagonalExact),
    allExactOffDiagonal:historical.every(x=>x.offDiagonalExact),
    failures:historical.filter(x=>!x.offDiagonalExact),
    s3Invariant:invariantUnderS3(historical),
  },
  cpcx:{
    rowCount:current.length,
    nonStutterCount:current.filter(x=>x.roles.length>0).length,
    exactOffDiagonalCount:current.filter(x=>x.offDiagonalExact).length,
    allExactOffDiagonal:current.every(x=>x.offDiagonalExact),
    failures:current.filter(x=>!x.offDiagonalExact).slice(0,20),
    s3Invariant:invariantUnderS3(current),
  },
  interpretation:
    'This test checks incidence, not just counts: a one-role intervention must change exactly the two pair relations incident to that role, and the law must survive every S3 relabeling.',
  boundary:{
    algebraicIncidenceTest:true,
    noSolvedData:true,
    noOracle:true,
    noValueClaim:true,
    noThreeBodyClaim:true
  }
},null,2));