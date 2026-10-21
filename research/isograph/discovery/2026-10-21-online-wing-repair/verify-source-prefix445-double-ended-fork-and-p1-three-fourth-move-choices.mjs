#!/usr/bin/env node
// True original 7x6 K4 source prefix445 two-ended horizontal fork.
// No solved game oracle, historic strong28 IDs or recursive game values.
import assert from 'node:assert/strict';
const W=7,H=6,D=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dir,dx,dy] of D){
 const a=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
 if(a.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))lines.push({dir,a});
}
assert.equal(lines.length,69);
function replay(word){
 const board=Array.from({length:H},()=>Array(W).fill(-1));
 const h=Array(W).fill(0),wins=[];
 for(let i=0;i<word.length;i++){
  const c=Number(word[i])-1,r=h[c]++,p=i%2;
  assert(c>=0&&c<W&&r>=0&&r<H);
  board[r][c]=p;
  const now=lines.filter(l=>l.a.every(([x,y])=>board[y][x]===p));
  if(now.length)wins.push({ply:i+1,p,lines:now});
 }
 return {board,h,wins};
}
function U(q,p){
 const a=[];
 for(let c=0;c<W;c++){
  const r=q.h[c];if(r===H)continue;
  const supported=lines.filter(l=>l.a.some(([x,y])=>x===c&&y===r)&&
   l.a.every(([x,y])=>(x===c&&y===r)||q.board[y][x]===p));
  if(supported.length)a.push({col:c+1,row:r+1,K4:supported.map(l=>l.dir)});
 }
 return a;
}
const data={},P1need=[3,6,7];
for(let p4=1;p4<=W;p4++){
 const q4=replay('445'+p4);
 assert.equal(q4.wins.length,0);
 if(p4===6){
  assert.equal(q4.board[0][5],1);
  data[p4]={connectorC6AlreadyP1:true};
  continue;
 }
 const q5=replay('445'+p4+'6');
 assert.equal(q5.wins.length,0);
 const winCells=U(q5,0).map(x=>x.col);
 assert.deepEqual(winCells,([3,7].filter(c=>c!==p4)));
 const forcedP1Move6=[],losingP1Responses=[];
 for(let p6=1;p6<=W;p6++){
  const q6=replay('445'+p4+'6'+p6);
  assert.equal(q6.wins.length,0);
  const remain=U(q6,0).map(x=>x.col);
  if(remain.length===0){forcedP1Move6.push(p6);continue}
  const q7=replay('445'+p4+'6'+p6+remain[0]);
  assert.equal(q7.wins.length,1);
  assert.equal(q7.wins[0].ply,7);
  assert.equal(q7.wins[0].p,0);
  losingP1Responses.push(p6);
 }
 if(!P1need.includes(p4))assert.equal(forcedP1Move6.length,0);
 if(p4===3)assert.deepEqual(forcedP1Move6,[7]);
 if(p4===7)assert.deepEqual(forcedP1Move6,[3]);
 data[p4]={sourceP0WinningLandingsAfterMove5Column6:winCells,
  necessaryP1ReplyMove6:forcedP1Move6,
  opponentRepliesMove6LosingToP0Move7:losingP1Responses};
}
assert.equal(Object.values(data).filter(o=>!o.connectorC6AlreadyP1&&o.necessaryP1ReplyMove6.length===0).length,4);
const result={schema:1,date:'2026-10-21',
 status:'ORIGINAL7X6_SOURCE_PREFIX445_FORCED_P1_MOVE4_C3_C6_OR_C7',
 proof:'If P1 ply4 does not take c3,c6 orc7 bottom, P0 takes c6 bottom ply5, creating two distinct live K4 final cells c3,c7; P1 cannot take both on ply6, so P0 FIRSTWINS on ply7. If P1 plays c3 orc7 on ply4 the opposite endpoint must be taken on ply6. P1 taking c6 on ply4 blocks the connector.',
 legalP1Ply4Replies:7,necessaryP1ColumnsAtPly4:P1need,
 allOriginalK4:69,physicalChecks:data,
 originalRootP0WINProved:false,historical28Used:false};
console.log(JSON.stringify(result,null,2));
