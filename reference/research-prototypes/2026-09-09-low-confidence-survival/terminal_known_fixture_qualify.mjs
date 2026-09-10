import assert from 'node:assert/strict';
import { ExactConnect4Oracle } from '../../../components/oracle/exact7x6.mjs';

function linesFor(W,H,K){
  const lines=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const x=c+(K-1)*dx,y=r+(K-1)*dy;if(x<0||x>=W||y<0||y>=H)continue;
    let mask=0n;const cells=[];
    for(let j=0;j<K;j++){const cell=(r+j*dy)*W+c+j*dx;mask|=1n<<BigInt(cell);cells.push(cell);}
    lines.push({mask,cells});
  }
  return lines;
}
function hasWin(bits,lines){return lines.some(l=>(bits&l.mask)===l.mask);}
function winningLinesThrough(bits,cell,lines){const bit=1n<<BigInt(cell);return lines.map((l,i)=>({l,i})).filter(x=>(x.l.mask&bit)!==0n&&(bits&x.l.mask)===x.l.mask).map(x=>x.i);}
function directionalWin(bits,W,H,K,cell){
  const row=Math.trunc(cell/W),col=cell-row*W;
  const owns=(c,r)=>c>=0&&c<W&&r>=0&&r<H&&(bits&(1n<<BigInt(r*W+c)))!==0n;
  for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    let count=1;
    for(const sign of [-1,1]){let c=col+sign*dx,r=row+sign*dy;while(owns(c,r)){count++;c+=sign*dx;r+=sign*dy;}}
    if(count>=K)return true;
  }
  return false;
}
function terminalSequence(sequence,W,H,K,expectedWinner){
  const lines=linesFor(W,H,K),heights=new Uint8Array(W);let p0=0n,p1=0n,lastCell=-1;
  for(let ply=0;ply<sequence.length;ply++){
    assert(!hasWin(p0,lines)&&!hasWin(p1,lines),`continued after terminal before ply ${ply+1}: ${sequence}`);
    const col=sequence.charCodeAt(ply)-49,row=heights[col];assert(col>=0&&col<W&&row<H);
    lastCell=row*W+col;const bit=1n<<BigInt(lastCell);if(ply&1)p1|=bit;else p0|=bit;heights[col]++;
    if(ply<sequence.length-1)assert(!hasWin(p0,lines)&&!hasWin(p1,lines),`won before documented last move: ${sequence}`);
  }
  const winner=hasWin(p0,lines)?0:hasWin(p1,lines)?1:null;
  assert.equal(winner,expectedWinner,`winner mismatch ${sequence}`);
  const winBits=winner===0?p0:p1,through=winningLinesThrough(winBits,lastCell,lines);
  assert(through.length>0,`documented terminal win does not pass through last move: ${sequence}`);
  assert(directionalWin(winBits,W,H,K,lastCell),`directional terminal check failed: ${sequence}`);
  return {sequence,winner,lastCell,lineIds:through,p0:p0.toString(16),p1:p1.toString(16)};
}
function drawSequence(sequence,W,H,K){
  const lines=linesFor(W,H,K),heights=new Uint8Array(W);let p0=0n,p1=0n;
  for(let ply=0;ply<sequence.length;ply++){
    assert(!hasWin(p0,lines)&&!hasWin(p1,lines),`draw fixture continued after terminal: ${sequence}`);
    const col=sequence.charCodeAt(ply)-49,row=heights[col];assert(col>=0&&col<W&&row<H);
    const bit=1n<<BigInt(row*W+col);if(ply&1)p1|=bit;else p0|=bit;heights[col]++;
    assert(!hasWin(p0,lines)&&!hasWin(p1,lines),`draw fixture contains winner: ${sequence}`);
  }
  assert.equal(sequence.length,W*H);for(const h of heights)assert.equal(h,H);
  return {sequence,draw:true,p0:p0.toString(16),p1:p1.toString(16)};
}

// External documented fixtures, used only as independent boundary anchors.
// connectpy documents Board("4455673") as a 7-move first-player win.
// https://github.com/loic-ehrhardt/connectpy
// connect-4-game-engine documents 0-based 0101010 as Player 1 win -> 1212121 here;
// 0-based 041425 plus winning recommendation 3 -> terminal 1525364 here;
// and 4x4 0213203102132031 as Draw -> 1324314213243142 here.
// https://github.com/RenaudGaudron/connect-4-game-engine
const terminalFixtures=[
  {source:'connectpy README',sequence:'4455673',winner:0},
  {source:'connect-4-game-engine README vertical',sequence:'1212121',winner:0},
  {source:'connect-4-game-engine README horizontal',sequence:'1525364',winner:0},
];
const verified=[],oracle=new ExactConnect4Oracle();
for(const fixture of terminalFixtures){
  const terminal=terminalSequence(fixture.sequence,7,6,4,fixture.winner);
  const parent=fixture.sequence.slice(0,-1),expectedImmediate=Math.trunc((43-parent.length)/2);
  oracle.reset();const parentScore=oracle.solveSequence(parent);
  assert.equal(parentScore,expectedImmediate,`maintained oracle immediate-score mismatch ${fixture.sequence}`);
  verified.push({...fixture,...terminal,parent,parentScore,expectedImmediate});
}
const draw4x4=drawSequence('1324314213243142',4,4,4);
console.log(JSON.stringify({kind:'known-terminal-fixture-qualification',terminalFixtures:verified,drawFixture:{source:'connect-4-game-engine README 4x4 draw',...draw4x4},mismatches:0},null,2));
