#!/usr/bin/env node
import { performance } from 'node:perf_hooks';

const W=7,H=6,K=4;
const BASE=(process.argv[2]??'5,5,2,3,6,6,6').split(',').map(Number);
const bit=(c,r)=>1n<<BigInt(r*W+c);

function popcountBig(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function subsetBits(a,b){return (a&b)===a;}
function supersetBits(a,b){return (a&b)===b;}
function scoreKey(s){return `${s[0]}:${s[1]}`;}
function levels(rank){
  const rem=W*H-rank;
  if(rem===0)return [[0,0]];
  const out=[];
  for(let d=2;d<=rem;d+=2)out.push([-1,d]);
  out.push([0,rem]);
  for(let d=(rem%2?rem:rem-1);d>=1;d-=2)out.push([1,d]);
  return out;
}
function createLines(){
  const a=[];
  for(let r=0;r<H;r++)for(let c=0;c<=W-K;c++){let m=0n;for(let i=0;i<K;i++)m|=bit(c+i,r);a.push(m);}
  for(let c=0;c<W;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=bit(c,r+i);a.push(m);}
  for(let c=0;c<=W-K;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=bit(c+i,r+i);a.push(m);}
  for(let c=0;c<=W-K;c++)for(let r=K-1;r<H;r++){let m=0n;for(let i=0;i<K;i++)m|=bit(c+i,r-i);a.push(m);}
  return a;
}
const LINES=createLines();
function supportMask(h){let s=0n;for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)s|=bit(c,r);return s;}
function sKey(h){return h.join(',');}
function residualShapes(h){
  const S=supportMask(h),set=new Map();
  for(const l of LINES){const r=l&~S;if(r!==0n)set.set(r.toString(),r);}
  return [...set.values()].sort((a,b)=>popcountBig(a)-popcountBig(b)||(a<b?-1:a>b?1:0));
}
function shapeInfo(h){
  const shapes=residualShapes(h),n=shapes.length,byMask=new Map(shapes.map((x,i)=>[x.toString(),i]));
  const up=Array(n).fill(0n),down=Array(n).fill(0n);
  for(let i=0;i<n;i++)for(let j=0;j<n;j++)if((shapes[i]&shapes[j])===shapes[i]){up[i]|=1n<<BigInt(j);down[j]|=1n<<BigInt(i);}
  const downStrict=down.map((x,i)=>x&~(1n<<BigInt(i))),all=n===0?0n:(1n<<BigInt(n))-1n;
  return {shapes,n,byMask,up,down,downStrict,all};
}
function enumerateUpsets(info){
  const {n,up,down,all}=info,out=[],memo=new Set();
  function rec(inc,exc){
    const mk=`${inc}|${exc}`;if(memo.has(mk))return;memo.add(mk);
    const decided=inc|exc;if(decided===all){out.push(inc);return;}
    let best=-1,bestGain=-1;
    for(let i=0;i<n;i++){
      const b=1n<<BigInt(i);if(decided&b)continue;
      const gi=popcountBig(up[i]&~decided),ge=popcountBig(down[i]&~decided),g=Math.min(gi,ge)*64+Math.max(gi,ge);
      if(g>bestGain){bestGain=g;best=i;}
    }
    const ui=up[best],di=down[best];
    if((ui&exc)===0n)rec(inc|ui,exc);
    if((di&inc)===0n)rec(inc,exc|di);
  }
  rec(0n,0n);
  out.sort((a,b)=>popcountBig(a)-popcountBig(b)||(a<b?-1:a>b?1:0));
  return out;
}
function minIndices(sig,info){
  const arr=[];for(let i=0;i<info.n;i++){const b=1n<<BigInt(i);if((sig&b)!==0n&&(sig&info.downStrict[i])===0n)arr.push(i);}return arr;
}
function makeAntRecords(info){return enumerateUpsets(info).map(sig=>({sig,count:popcountBig(sig),mins:minIndices(sig,info)}));}
function stateGE(a,b){return supersetBits(a.m,b.m)&&subsetBits(a.o,b.o);}
function stateKey(x){return `${x.m}|${x.o}`;}
function normalizeUpper(cands){
  const uniq=[...new Map(cands.map(c=>[stateKey(c),c])).values()];
  uniq.sort((a,b)=>(popcountBig(a.m)-popcountBig(a.o))-(popcountBig(b.m)-popcountBig(b.o)));
  const res=[];
  outer:for(const c of uniq){for(const r of res)if(stateGE(c,r))continue outer;for(let i=res.length-1;i>=0;i--)if(stateGE(res[i],c))res.splice(i,1);res.push(c);}
  return res;
}
function normalizeLower(cands){
  const uniq=[...new Map(cands.map(c=>[stateKey(c),c])).values()];
  uniq.sort((a,b)=>(popcountBig(b.m)-popcountBig(b.o))-(popcountBig(a.m)-popcountBig(a.o)));
  const res=[];
  outer:for(const c of uniq){for(const r of res)if(stateGE(r,c))continue outer;for(let i=res.length-1;i>=0;i--)if(stateGE(c,res[i]))res.splice(i,1);res.push(c);}
  return res;
}
function intersectLower(A,B,metrics){
  if(!A.length||!B.length)return [];
  const raw=A.length*B.length;metrics.maxLowerIntersectionCandidates=Math.max(metrics.maxLowerIntersectionCandidates,raw);
  const c=[];for(const a of A)for(const b of B)c.push({m:a.m&b.m,o:a.o|b.o});
  return normalizeLower(c);
}
function coneSupports(base){
  const arr=[],h=base.slice();function rec(c){if(c===W){arr.push(h.slice());return;}for(let v=base[c];v<=H;v++){h[c]=v;rec(c+1);}}rec(0);
  arr.sort((a,b)=>b.reduce((x,y)=>x+y,0)-a.reduce((x,y)=>x+y,0));return arr;
}
function buildActionMap(parentInfo,ants,childInfo,x){
  const own=new Array(ants.length),opp=new Array(ants.length),terminal=new Uint8Array(ants.length);
  for(let ai=0;ai<ants.length;ai++){
    const a=ants[ai];let os=0n,ps=0n,term=false;
    for(const idx of a.mins){
      const r=parentInfo.shapes[idx];
      if((r&x)!==0n){const rr=r&~x;if(rr===0n){term=true;break;}const ci=childInfo.byMask.get(rr.toString());if(ci===undefined)throw Error('own escape');os|=childInfo.up[ci];}
      else{const ci=childInfo.byMask.get(r.toString());if(ci===undefined)throw Error('own unchanged escape');os|=childInfo.up[ci];}
    }
    terminal[ai]=term?1:0;own[ai]=term?null:os;
    for(const idx of a.mins){const r=parentInfo.shapes[idx];if((r&x)!==0n)continue;const ci=childInfo.byMask.get(r.toString());if(ci===undefined)throw Error('opp escape');ps|=childInfo.up[ci];}
    opp[ai]=ps;
  }
  const asc=ants.map((_,i)=>i).sort((i,j)=>ants[i].count-ants[j].count),desc=[...asc].reverse(),cache=new Map();
  function extrema(kind,target){
    const ck=`${kind}:${target}`;if(cache.has(ck))return cache.get(ck);
    const isMin=kind.endsWith('GE'),map=kind.startsWith('own')?own:opp,skipTerm=kind.startsWith('own'),order=isMin?asc:desc,res=[];
    outer:for(const i of order){
      if(skipTerm&&terminal[i])continue;
      const ms=map[i],ok=kind.endsWith('GE')?supersetBits(ms,target):subsetBits(ms,target);if(!ok)continue;
      const sig=ants[i].sig;
      if(isMin){for(const r of res)if(subsetBits(r,sig))continue outer;res.push(sig);}
      else{for(const r of res)if(supersetBits(r,sig))continue outer;res.push(sig);}
    }
    cache.set(ck,res);return res;
  }
  return {extrema};
}
function terminalBoundary(info,x){const idx=info.byMask.get(x.toString());return idx===undefined?[]:[{m:info.up[idx],o:info.all}];}
function actionUpper(childLower,amap,termB,metrics){
  const c=[...termB];
  for(const g of childLower){
    const ms=amap.extrema('ownGE',g.o),os=amap.extrema('oppLE',g.m);
    for(const m of ms)for(const o of os)c.push({m,o});
  }
  metrics.maxActionUpperCandidates=Math.max(metrics.maxActionUpperCandidates,c.length);
  return normalizeUpper(c);
}
function actionLower(childUpper,amap,metrics){
  const c=[];
  for(const g of childUpper){
    const ms=amap.extrema('ownLE',g.o),os=amap.extrema('oppGE',g.m);
    for(const m of ms)for(const o of os)c.push({m,o});
  }
  metrics.maxActionLowerCandidates=Math.max(metrics.maxActionLowerCandidates,c.length);
  return normalizeLower(c);
}

const supports=coneSupports(BASE),nodes=new Map(),metrics={supports:supports.length,maxAntichains:0,maxShapes:0,maxActionUpperCandidates:0,maxActionLowerCandidates:0,maxLowerIntersectionCandidates:0,maxUpper:0,maxLower:0,enumMs:0,mapMs:0,boundaryMs:0};
const tAll=performance.now();
for(let si=0;si<supports.length;si++){
  const h=supports[si],rank=h.reduce((a,b)=>a+b,0),key=sKey(h),te=performance.now(),info=shapeInfo(h),ants=makeAntRecords(info);
  metrics.enumMs+=performance.now()-te;metrics.maxAntichains=Math.max(metrics.maxAntichains,ants.length);metrics.maxShapes=Math.max(metrics.maxShapes,info.n);
  const lev=levels(rank),upper=new Map(),lower=new Map();
  if(rank===42){upper.set('0:0',[{m:0n,o:0n}]);lower.set('0:0',[{m:0n,o:0n}]);}
  else{
    const actions=[],tm=performance.now();
    for(let c=0;c<W;c++){const r=h[c];if(r>=H)continue;const ch=h.slice();ch[c]++;const child=nodes.get(sKey(ch));if(!child)throw Error('missing child');const x=bit(c,r);actions.push({child,amap:buildActionMap(info,ants,child.info,x),termB:terminalBoundary(info,x)});}
    metrics.mapMs+=performance.now()-tm;
    const tb=performance.now();
    for(let pi=0;pi<lev.length;pi++){
      const actionUps=[],actionLows=[];
      for(const a of actions){
        let au,al;
        if(pi===lev.length-1){au=a.termB;al=[{m:info.all,o:0n}];}
        else{
          const ci=a.child.levels.length-1-pi,ck=scoreKey(a.child.levels[ci]);
          au=actionUpper(a.child.lower.get(ck)??[],a.amap,a.termB,metrics);
          al=actionLower(a.child.upper.get(ck)??[],a.amap,metrics);
        }
        actionUps.push(...au);actionLows.push(al);
      }
      const U=normalizeUpper(actionUps);upper.set(scoreKey(lev[pi]),U);metrics.maxUpper=Math.max(metrics.maxUpper,U.length);
      let D=null;
      for(const al of actionLows){D=D===null?al:intersectLower(D,al,metrics);if(!D.length)break;}
      D??=[];lower.set(scoreKey(lev[pi]),D);metrics.maxLower=Math.max(metrics.maxLower,D.length);
    }
    metrics.boundaryMs+=performance.now()-tb;
  }
  nodes.set(key,{rank,info,levels:lev,upper,lower});
  if(rank<=35||si%10===0)console.error(JSON.stringify({support:h,rank,shapes:info.n,antichains:ants.length,maxUpper:Math.max(...[...upper.values()].map(x=>x.length),0),maxLower:Math.max(...[...lower.values()].map(x=>x.length),0)}));
}
metrics.elapsedMs=performance.now()-tAll;
const root=nodes.get(sKey(BASE));
console.log(JSON.stringify({schema:1,experiment:'rank33-lattice-generator-only-probe',root:{support:BASE,rank:root.rank,shapes:root.info.n,antichains:metrics.maxAntichains,upper:Object.fromEntries(root.levels.map(s=>[scoreKey(s),root.upper.get(scoreKey(s)).length])),lower:Object.fromEntries(root.levels.map(s=>[scoreKey(s),root.lower.get(scoreKey(s)).length]))},metrics},null,2));
