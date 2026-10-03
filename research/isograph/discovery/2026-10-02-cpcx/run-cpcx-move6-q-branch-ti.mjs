import {
  createCpcxGeometry,
  buildCpcxPosition,
} from './cpcx.mjs';
import {applyCpcxForcedEvent} from './cpcx-closure.mjs';
import {
  canonicalizeCpcxQColumnOrbit,
  findCpcxQColumnTransporter,
} from './cpcx-q-quotient.mjs';
import {verifyCpcxQBranchLocalTi} from './cpcx-q-branch-ti.mjs';

const g=createCpcxGeometry(),
  root=buildCpcxPosition('44444',{geometry:g});

function legalColumns(position){
  const out=[];
  for(let c=0;c<g.columns;c++)if(position.heights[c]<g.rows)out.push(c);
  return out;
}
function fullDraw(position){
  return !position.terminal&&legalColumns(position).length===0;
}
function actionToken(position,column){
  const child=applyCpcxForcedEvent(
    position,position.heights[column]*g.columns+column
  );
  if(child.terminal)return {
    token:`T:${child.terminal.player}`,
    child,
    terminal:true,
  };
  if(fullDraw(child))return {
    token:'D',
    child,
    terminal:true,
  };
  return {
    token:`Q:${canonicalizeCpcxQColumnOrbit(child).key}`,
    child,
    terminal:false,
  };
}
function profile(position){
  const actions=legalColumns(position).map(column=>({
    column,
    ...actionToken(position,column),
  }));
  return {
    actions,
    signature:actions.map(x=>x.token).sort().join('\n'),
  };
}
function constructWitness(a,b,pa,pb){
  if(pa.signature!==pb.signature)return null;
  const byA=new Map(),byB=new Map();
  for(const row of pa.actions){
    if(!byA.has(row.token))byA.set(row.token,[]);
    byA.get(row.token).push(row);
  }
  for(const row of pb.actions){
    if(!byB.has(row.token))byB.set(row.token,[]);
    byB.get(row.token).push(row);
  }
  const actionMap=Array(g.columns).fill(null),
    childTransporters={},
    matches=[];
  for(const [token,aa0] of byA){
    const aa=[...aa0].sort((x,y)=>x.column-y.column),
      bb=[...(byB.get(token)??[])].sort((x,y)=>x.column-y.column);
    if(aa.length!==bb.length)return null;
    for(let i=0;i<aa.length;i++){
      const x=aa[i],y=bb[i];
      actionMap[x.column]=y.column;
      if(!x.terminal){
        const t=findCpcxQColumnTransporter(x.child,y.child);
        if(!t)return null;
        childTransporters[String(x.column)]=[...t.permutation];
        matches.push({
          sourceColumn:x.column+1,
          targetColumn:y.column+1,
          tokenClass:'Q',
          childPermutation:t.permutation.map(z=>z+1),
        });
      }else matches.push({
        sourceColumn:x.column+1,
        targetColumn:y.column+1,
        tokenClass:token,
        childPermutation:null,
      });
    }
  }
  const witness={actionMap,childTransporters},
    verification=verifyCpcxQBranchLocalTi(a,b,witness);
  return {witness,verification,matches};
}

const rows=[];
for(let c=0;c<g.columns;c++){
  const child=applyCpcxForcedEvent(
    root,root.heights[c]*g.columns+c
  );
  rows.push({
    sixthMove:c+1,
    position:child,
    profile:profile(child),
  });
}

const groups=new Map();
for(const row of rows){
  if(!groups.has(row.profile.signature))groups.set(row.profile.signature,[]);
  groups.get(row.profile.signature).push(row.sixthMove);
}

const pairwise=[];
for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  if(rows[i].profile.signature!==rows[j].profile.signature)continue;
  const result=constructWitness(
    rows[i].position,rows[j].position,
    rows[i].profile,rows[j].profile
  );
  pairwise.push({
    moves:[rows[i].sixthMove,rows[j].sixthMove],
    exact:result?.verification?.exact??false,
    kind:result?.verification?.kind??'NO_WITNESS',
    actionMap:result?.witness?.actionMap?.map(x=>
      Number.isInteger(x)?x+1:null
    )??null,
    matches:result?.matches??[],
    seam:result?.verification?.seam??null,
  });
}

const classes=[...groups.values()]
  .map(moves=>[...moves].sort((a,b)=>a-b))
  .sort((a,b)=>a[0]-b[0]);

console.log(JSON.stringify({
  schema:'connect4.cpcx.move6.qo-branch-local-ti.v0_1',
  root:'44444',
  oneStepBranchLocalClasses:{
    classCount:classes.length,
    classes,
    allSevenEquivalent:classes.length===1,
  },
  rows:rows.map(row=>({
    sixthMove:row.sixthMove,
    actionTokens:row.profile.actions.map(x=>({
      column:x.column+1,
      token:x.token,
    })),
  })),
  pairwiseWitnesses:pairwise,
  allDiscoveredWitnessesVerify:pairwise.every(x=>x.exact),
  premises:{
    standardBoard:'7x6',
    targetSpecificDiscovery:true,
    parentRelation:'branch-local action bijection',
    childRelation:'exact complete q_o column transporter',
    theorem:'cpcx-q-branch-ti.mjs',
    solvedData:false,
    oracle:false,
    minimax:false,
    recursiveGameTreeSearch:false,
    delayEquivalenceAssumed:false,
  },
  boundary:'equal one-step signatures become proof only when the explicit action bijection and every child q_o transporter pass the generic verifier; failure to merge is not a value distinction',
},null,2));
