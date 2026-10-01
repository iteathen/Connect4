#!/usr/bin/env node
import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const roots=[
  {id:'c6_r4',sequence:'444441566614'},
  {id:'c6_r5',sequence:'444441566615'},
  {id:'c6_r6',sequence:'444441566616'},
];

function lines(){
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){
    if(c+3<W)out.push({orientation:'H',cells:[0,1,2,3].map(i=>r*W+c+i)});
    if(r+3<H)out.push({orientation:'V',cells:[0,1,2,3].map(i=>(r+i)*W+c)});
    if(c+3<W&&r+3<H)out.push({orientation:'D+',cells:[0,1,2,3].map(i=>(r+i)*W+c+i)});
    if(c+3<W&&r>=3)out.push({orientation:'D-',cells:[0,1,2,3].map(i=>(r-i)*W+c+i)});
  }
  return out.map((x,id)=>({...x,id}));
}
const ALL=lines();

function replay(sequence){
  const board=new Int8Array(W*H);board.fill(-1);
  const heights=new Uint8Array(W);
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1,r=heights[c]++;
    assert(c>=0&&c<W&&r<H,sequence);
    board[r*W+c]=i&1;
  }
  return {board,heights,turn:sequence.length&1};
}
function play(s,c){
  const {board,heights,turn}=s;
  if(heights[c]>=H)return null;
  const nb=new Int8Array(board),nh=new Uint8Array(heights);
  const r=nh[c]++;nb[r*W+c]=turn;
  return {board:nb,heights:nh,turn:turn^1,last:{player:turn,column:c,row:r,cell:r*W+c}};
}
function cellName(cell){return String.fromCharCode(65+(cell%W))+String(((cell/W)|0)+1);}
function lineState(s,line,attacker){
  let blocked=false;const residual=[],owned=[];
  for(const cell of line.cells){
    const p=s.board[cell];
    if(p<0)residual.push(cell);
    else if(p===attacker)owned.push(cell);
    else blocked=true;
  }
  return {
    lineId:line.id,orientation:line.orientation,cells:line.cells.map(cellName),
    live:!blocked,residual:blocked?null:residual.map(cellName),
    residualCells:blocked?null:residual,
    owned:owned.map(cellName)
  };
}
function liveLines(s,attacker){return ALL.map(l=>lineState(s,l,attacker)).filter(x=>x.live);}
function horizontalLadder(s,attacker){
  return liveLines(s,attacker)
    .filter(x=>x.orientation==='H')
    .filter(x=>x.residualCells.some(cell=>{
      const col=cell%W,row=(cell/W)|0;
      return (col===1||col===2) && (row===0||row===2||row===4);
    }))
    .map(x=>({
      lineId:x.lineId,cells:x.cells,residual:x.residual,
      bcOddCells:x.residual.filter(name=>/^[BC][135]$/.test(name))
    }));
}
function lineByCells(names){
  const key=[...names].sort().join(',');
  const hit=ALL.find(l=>l.cells.map(cellName).sort().join(',')===key);
  assert(hit,'missing line '+key);return hit;
}

const tracked=[
  {name:'L1_BE_row1',line:lineByCells(['B1','C1','D1','E1'])},
  {name:'L3_AD_row3',line:lineByCells(['A3','B3','C3','D3'])},
  {name:'L5_AD_row5',line:lineByCells(['A5','B5','C5','D5'])},
];

const rows=[];
for(const root of roots){
  const s0=replay(root.sequence),attacker=s0.turn;
  assert.equal(attacker,0);
  const before=Object.fromEntries(tracked.map(t=>[t.name,lineState(s0,t.line,attacker)]));
  assert.deepEqual(before.L1_BE_row1.residual,['B1','C1']);
  assert.deepEqual(before.L3_AD_row3.residual,['A3','B3','C3']);
  assert.deepEqual(before.L5_AD_row5.residual,['A5','B5','C5']);

  // The first failed trigger is A3.
  assert.equal(s0.heights[0],2);
  const s1=play(s0,0);assert(s1);
  const afterTrigger=Object.fromEntries(tracked.map(t=>[t.name,lineState(s1,t.line,attacker)]));
  assert.deepEqual(afterTrigger.L3_AD_row3.residual,['B3','C3']);

  const replies=[];
  for(let d=0;d<W;d++){
    const s2=play(s1,d);if(!s2)continue;
    replies.push({
      responseColumn:d+1,
      support:Array.from(s2.heights),
      tracked:Object.fromEntries(tracked.map(t=>[t.name,lineState(s2,t.line,attacker)])),
      bcHeights:[s2.heights[1],s2.heights[2]],
      ladder:horizontalLadder(s2,attacker)
    });
  }
  rows.push({
    ...root,
    attacker:attacker+1,
    supportBefore:Array.from(s0.heights),
    trackedBefore:before,
    horizontalLadderBefore:horizontalLadder(s0,attacker),
    supportAfterTrigger:Array.from(s1.heights),
    trackedAfterTrigger:afterTrigger,
    horizontalLadderAfterTrigger:horizontalLadder(s1,attacker),
    replies
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_horizontal_ladder_ancestry_probe.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  trackedLineAncestry:tracked.map(t=>({name:t.name,lineId:t.line.id,cells:t.line.cells.map(cellName)})),
  rows,
  interpretation:[
    'Residual ancestry is attached to full physical winning-line identity; cofactoring an attacker-owned cell shrinks the residual instead of falsely counting the old shape id as killed.',
    'The probe tests whether the c6 first-failure family is a repeated horizontal B/C response ladder at rows 1,3,5.',
    'Any proposed schema must preserve these full-line identities or prove a congruent quotient.'
  ],
  boundary:[
    'Consumed-training diagnostic only.',
    'No W/D/L, strong distance, or move preference is inferred.',
    'Sequence replay is used only to reconstruct the exact current occupancy; current occupancy is an allowed rank-local proof input.'
  ]
},null,2));