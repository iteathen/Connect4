#!/usr/bin/env node
// COMPLETE 7x6 original rank39 (three empty sites, P1 to move) signed
// P0WIN / DRAW / P1WIN via source K4 1-,2-missing Boolean cofactors.
// This is a nonrecursive fixed 3-capacity-shape theorem. NO historical
// solved lines or game WDL queries in the PREDICATE.
// For independent validation ONLY: 27 archived root-strong q39 boards,
// 285 legal swapped histories, 26 original center-five legal draw paths,
// and tiny ≤3-ply physical ray-game control of q39 values.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const W=7,H=6,DIR=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
const index=(c,r)=>c+W*r,lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dir,dx,dy] of DIR){
 const coords=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
 if(coords.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
  lines.push({dir,coords,sites:coords.map(([x,y])=>index(x,y))});
}
assert.equal(lines.length,69);
function ray(board,cell,p){
 const x=cell%W,y=Math.floor(cell/W);
 for(const [,dx,dy] of DIR){
  let n=1;
  for(const dir of [-1,1]){
   let c=x+dir*dx,r=y+dir*dy;
   while(c>=0&&c<W&&r>=0&&r<H&&board[index(c,r)]===p){
    n++;c+=dir*dx;r+=dir*dy;
   }
  }
  if(n>=4)return true;
 }
 return false;
}
function replay(columnWord){
 const board=Array(42).fill(-1),heights=Array(W).fill(0);
 for(let t=0;t<columnWord.length;t++){
  const c=Number(columnWord[t])-1;
  assert(c>=0&&c<W&&heights[c]<H);
  const e=index(c,heights[c]++),p=t%2;
  board[e]=p;
  const byWindows=lines.some(l=>l.sites.every(x=>board[x]===p));
  assert.equal(byWindows,ray(board,e,p));
  assert.equal(byWindows,false,'source prefix must be firstwin-free');
 }
 return {board,heights,ply:columnWord.length};
}
function F(h){return h.flatMap((v,c)=>v<H?[index(c,v)]:[])}
function U(q,p,e){
 return lines.some(l=>l.sites.includes(e)&&
  l.sites.every(x=>x===e||q.board[x]===p));
}
function V(q,p,e,f){
 return e!==f&&lines.some(l=>l.sites.includes(e)&&l.sites.includes(f)&&
  l.sites.every(x=>x===e||x===f||q.board[x]===p));
}
// Evaluate only CURRENT q's original owner-specific 1- and2-missing
// K4 cofactor indicators and fixed gravity shape; NO future game nodes.
function algebra(q){
 assert.equal(q.ply,39);
 const caps=q.heights.map(h=>H-h).filter(h=>h>0).sort((a,b)=>b-a).join(',');
 const p0=e=>U(q,0,e),p1=e=>U(q,1,e),two=(a,b)=>V(q,1,a,b);
 let p0win=false,p1win=false;
 if(caps==='3'){
  const x=F(q)[0],y=x+W,z=y+W;
  p0win=!p1(x)&&p0(y);
  p1win=p1(x)||(!p0(y)&&(p1(z)||two(x,z)));
 }else if(caps==='2,1'){
  const col2=q.heights.findIndex(h=>h===4),
        col1=q.heights.findIndex(h=>h===5);
  assert(col2>=0&&col1>=0);
  const x=index(col2,4),y=index(col2,5),z=index(col1,5);
  const Bxz=p1(z)||two(x,z),Bxy=p1(y)||two(x,y),Bzy=p1(y)||two(z,y);
  p0win=!p1(x)&&!p1(z)&&p0(x)&&(p0(y)||p0(z));
  p1win=p1(x)||p1(z)||
   (!p0(y)&&Bxz&&!p0(z)&&Bxy)||
   (!p0(x)&&Bzy);
 }else if(caps==='1,1,1'){
  const cells=F(q);
  assert.equal(cells.length,3);
  p0win=cells.every(x=>!p1(x))&&cells.filter(p0).length>=2;
  p1win=cells.some(p1);
  if(!p1win)for(const x of cells){
   const other=cells.filter(y=>y!==x);
   const allP0RepliesLose=other.every(y=>{
    const z=other.find(k=>k!==y);
    return !p0(y)&&(p1(z)||two(x,z));
   });
   if(allP0RepliesLose){p1win=true;break}
  }
 }else throw new Error('invalid 3-empty original column shape '+caps);
 assert(!(p0win&&p1win));
 return {value:p0win?1:p1win?-1:0,shape:caps,
  status:p0win?'P0_WIN':p1win?'P1_WIN':'DRAW'};
}
// Validation ONLY, bounded real original last three moves after q39.
// This independent physical game evaluation is NOT inside algebra(q).
function tinyValue(q){
 if(q.ply===42)return 0;
 const p=q.ply%2,values=[];
 for(const e of F(q.heights)){
  const board=q.board.slice(),heights=q.heights.slice();
  board[e]=p;heights[e%W]++;
  const won=ray(board,e,p);
  assert.equal(won,lines.some(l=>l.sites.every(x=>board[x]===p)));
  values.push(won?(p===0?1:-1):tinyValue({board,heights,ply:q.ply+1}));
 }
 return p===0?Math.max(...values):Math.min(...values);
}
const data=JSON.parse(readFileSync(
 new URL('../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json',
 import.meta.url),'utf8'));
const rootWords=[...new Set(data.witnesses.map(x=>x.movesZeroBased))];
assert.equal(rootWords.length,27);
const samples=[],seen=new Set();
for(const word of rootWords){
 const rootWord=word.slice(0,39).split('').map(c=>+c+1).join('');
 samples.push({group:'historic',q:replay(rootWord)});
 for(let i=0;i<38;i++){
  if(word[i]===word[i+1])continue;
  const swapped=word.slice(0,i)+word[i+1]+word[i]+word.slice(i+2);
  const suffixWord=swapped.slice(0,39).split('').map(c=>+c+1).join('');
  try{
   const q=replay(suffixWord),key=q.board.join(',');
   if(seen.has(key))continue;
   seen.add(key);samples.push({group:'modified',q});
  }catch(err){
   // Actual illegality/earlier original winner after the swap is excluded.
  }
 }
}
assert.equal(samples.length,312);
// Additional 26 independent SOURCE legal draw paths with first5 CENTER,
// constructed from vertically alternating full owner phases. Their
// STRATEGIC WDL at q39 is not assumed from having a drawn path; it is
// still independently checked by the three-ply game validator.
let extraDraws=0;
for(let mask=0;mask<128;mask++){
 const eps=Array.from({length:7},(_,c)=>(mask>>c)&1);
 if(eps[3]!==0)continue;
 const owner=(c,r)=>(eps[c]+r)%2;
 if(lines.some(l=>l.coords.every(([c,r])=>owner(c,r)===owner(...l.coords[0]))))continue;
 const P1Bottom=[...Array(7).keys()].filter(c=>eps[c]===1);
 const P0Bottom=[...Array(7).keys()].filter(c=>eps[c]===0&&c!==3);
 const word=[3,3,3,3,3,...P1Bottom.flatMap(c=>Array(6).fill(c)),
 3,...P0Bottom.flatMap(c=>Array(6).fill(c))].map(c=>c+1).join('');
 assert.equal(word.length,42);
 const q=replay(word.slice(0,39));
 samples.push({group:'independent_draw_prefix',q});
 extraDraws++;
}
assert.equal(extraDraws,26);
const counts={},mismatch=[];
for(const {group,q} of samples){
 const actual=tinyValue(q),pred=algebra(q);
 if(actual!==pred.value)mismatch.push({group,actual,pred});
 const key=group+'/'+pred.shape;
 counts[key]??={n:0,P0WIN:0,DRAW:0,P1WIN:0};
 counts[key].n++;
 counts[key][pred.status.replace('_','')==='P0WIN'?'P0WIN':pred.status.replace('_','')==='P1WIN'?'P1WIN':'DRAW']++;
}
assert.equal(mismatch.length,0,'full WDL source formulas must pass controls');
const report={
 schema:1,date:'2026-10-21',status:'ORIGINAL7X6_RANK39_EXACT_NONRECURSIVE_FULL_SIGNED_WDL_BOOLEAN',
 sourceOriginalK4Windows:lines.length,
 sourceInputOwnerCofactorGrades:[1,2],
 sourceHeightsCapacities:['3','2,1','1,1,1'],
 originalStateRank:39,currentMOVER:'P1',
 signedValue:{P0WIN:1,DRAW:0,P1WIN:-1},
 validation:{historicRootStrongQ39:27,legalModifiedSameHeightQ39:285,
 independentlyConstructedSourceLegalDrawHistoryQ39:26,
 totalPhysicallyValidatedPositions:samples.length,
 exactIndependentRayGameWDLValidationMismatches:mismatch.length,
 byShapeAndSourceCohort:counts},
 qualification:'Exact theorem is a three-gravity-shape Boolean case analysis, not a proof of root7x6 P0WIN; no solved game values in algebra(q) source predicate.'
};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
