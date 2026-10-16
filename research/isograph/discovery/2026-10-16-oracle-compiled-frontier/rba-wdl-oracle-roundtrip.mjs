#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { loadSolvedActionCorpus } from '../../../../components/oracle/corpus.mjs';
import { ORACLE_CONSTANTS } from '../../../../components/oracle/exact7x6.mjs';

const W=7,H=6,K=4,CELLS=W*H;
const INVALID=ORACLE_CONSTANTS.INVALID_MOVE;
const cache=process.argv[2];
const minRank=Number(process.argv[3]??33);
if(!cache)throw new Error('usage: node rba-wdl-oracle-roundtrip.mjs <cacheDir> [minRank]');

function pc(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function subset(a,b){return (a&b)===a;}
function cmpBig(a,b){return a<b?-1:a>b?1:0;}
function cellBit(c,r){return 1n<<BigInt(r*W+c);}
function lines(){const out=[];for(let r=0;r<H;r++)for(let c=0;c<=W-K;c++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r);out.push(m);}for(let c=0;c<W;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c,r+i);out.push(m);}for(let c=0;c<=W-K;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r+i);out.push(m);}for(let c=0;c<=W-K;c++)for(let r=K-1;r<H;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r-i);out.push(m);}return out;}
const LINES=lines();

function supportMask(h){let s=0n;for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)s|=cellBit(c,r);return s;}
function residualShapes(h){const S=supportMask(h),set=new Map();for(const l of LINES){const r=l&~S;if(r!==0n)set.set(r.toString(),r);}return [...set.values()].sort((a,b)=>pc(a)-pc(b)||cmpBig(a,b));}
function shapeInfo(h){const shapes=residualShapes(h),n=shapes.length,byMask=new Map(shapes.map((x,i)=>[x.toString(),i])),up=Array(n).fill(0n);for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(subset(shapes[i],shapes[j]))up[i]|=1n<<BigInt(j);const all=n?((1n<<BigInt(n))-1n):0n;return{shapes,n,byMask,up,all};}
function qpack(info,m,o){return m|((info.all^o)<<BigInt(info.n));}

function antichainMasks(values){const sorted=[...new Set(values)].sort((a,b)=>pc(a)-pc(b)||cmpBig(a,b)),out=[];outer:for(const x of sorted){for(const y of out)if(subset(y,x))continue outer;out.push(x);}return out;}
function ownerResiduals(state,p){
  const own=p===0?state.p0:state.p1,opp=p===0?state.p1:state.p0,S=supportMask(state.h),raw=[];
  for(const line of LINES){
    if(line&opp)continue;
    const r=line&~S;
    if(r===0n)throw new Error('nonterminal state contains completed residual');
    raw.push(r);
  }
  return antichainMasks(raw);
}
function upset(info,residuals){
  let bits=0n;
  for(const r of residuals){
    const i=info.byMask.get(r.toString());
    if(i===undefined)throw new Error('actual residual absent from support shape universe');
    bits|=info.up[i];
  }
  return bits;
}
function encodeQ(state){
  const info=shapeInfo(state.h),p=state.rank&1;
  const mover=ownerResiduals(state,p),opp=ownerResiduals(state,1-p);
  return {info,q:qpack(info,upset(info,mover),upset(info,opp))};
}
function hasWin(bits){return LINES.some(line=>(bits&line)===line);}
function replay(sequence){
  const s={h:Array(W).fill(0),p0:0n,p1:0n,rank:0,terminal:null};
  for(let i=0;i<sequence.length;i++){
    const c=sequence.charCodeAt(i)-49;
    if(c<0||c>=W||s.h[c]>=H||s.terminal!==null)throw new Error('illegal sequence');
    const x=cellBit(c,s.h[c]++);
    if((s.rank&1)===0)s.p0|=x;else s.p1|=x;
    s.rank++;
    const mover=(s.rank-1)&1;
    if(hasWin(mover===0?s.p0:s.p1))s.terminal=mover;
    else if(s.rank===CELLS)s.terminal=2;
  }
  return s;
}
function play(state,c){
  if(state.terminal!==null||state.h[c]>=H)return null;
  const s={h:state.h.slice(),p0:state.p0,p1:state.p1,rank:state.rank+1,terminal:null};
  const mover=state.rank&1,x=cellBit(c,s.h[c]++);
  if(mover===0)s.p0|=x;else s.p1|=x;
  if(hasWin(mover===0?s.p0:s.p1))s.terminal=mover;
  else if(s.rank===CELLS)s.terminal=2;
  return s;
}
function loadHex(file){const t=fs.readFileSync(file,'utf8').trim();return t?t.split(/\n/).map(x=>BigInt('0x'+x)):[];}
const boundaryMemo=new Map();
function boundary(h){
  const key=h.join('_');
  if(boundaryMemo.has(key))return boundaryMemo.get(key);
  const U=loadHex(path.join(cache,key+'.U.hex')),L=loadHex(path.join(cache,key+'.L.hex'));
  const out={U,L};boundaryMemo.set(key,out);return out;
}
function classify(state){
  assert.equal(state.terminal,null);
  const {q}=encodeQ(state),{U,L}=boundary(state.h);
  const nonLoss=U.some(u=>subset(u,q));
  const nonWin=L.some(l=>subset(q,l));
  if(nonLoss&&!nonWin)return 1;
  if(nonLoss&&nonWin)return 0;
  if(!nonLoss&&nonWin)return -1;
  throw new Error('frontier gap/overlap invariant failure at support '+state.h.join(','));
}
function mirrorSequence(sequence){return Array.from(sequence,ch=>String(8-Number(ch))).join('');}
function sign(x){return x>0?1:x<0?-1:0;}

const calibration=loadSolvedActionCorpus(new URL('../../../../reference/oracles/solved-actions-v1.meta.json',import.meta.url));
const rows=calibration.vectors.filter(v=>v.sequence.length>=minRank);
let parents=0,actions=0,parentMismatch=0,actionMismatch=0,mirrors=0;
for(const v of rows){
  for(const mirrored of [false,true]){
    const sequence=mirrored?mirrorSequence(v.sequence):v.sequence;
    const scores=mirrored?[...v.moveScores].reverse():v.moveScores;
    const state=replay(sequence);
    if(state.terminal!==null)throw new Error('qualified parent replay became terminal: '+sequence);
    const gotParent=classify(state),wantParent=sign(v.oracleScore);
    parents++;if(gotParent!==wantParent)parentMismatch++;
    for(let c=0;c<W;c++){
      if(scores[c]===INVALID)continue;
      const child=play(state,c);
      if(!child)throw new Error('oracle legal action rejected');
      let got;
      if(child.terminal===state.rank%2)got=1;
      else if(child.terminal===2)got=0;
      else if(child.terminal!==null)throw new Error('unexpected opponent terminal on mover action');
      else got=-classify(child);
      const want=sign(scores[c]);
      actions++;if(got!==want)actionMismatch++;
    }
    if(mirrored)mirrors++;
  }
}
const result={
  schema:'standard7x6-wdl-frontier-oracle-roundtrip-v0_1',
  minRank,
  sourcePositions:rows.length,
  mirroredPositions:mirrors,
  parents,
  actions,
  parentMismatch,
  actionMismatch,
  recursiveContinuationUsed:false,
};
assert.equal(parentMismatch,0);
assert.equal(actionMismatch,0);
console.log(JSON.stringify(result,null,2));
