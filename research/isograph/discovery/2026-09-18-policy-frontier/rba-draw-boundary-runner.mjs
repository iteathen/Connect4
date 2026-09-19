#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';

const W=7,H=6,K=4,CELLS=W*H;
function pc(x){let n=0;while(x){x&=x-1n;n++;}return n;}
function subset(a,b){return (a&b)===a;}
function cmpBig(a,b){return a<b?-1:a>b?1:0;}
function skey(h){return h.join(',');}
function parseArgs(){
  const o={base:[5,5,2,3,6,6,6],cache:'/mnt/data/rba-draw-cache',stopRank:0,traceMissing:7,skylineSwitch:2048};
  for(let i=2;i<process.argv.length;i++){
    const a=process.argv[i];
    if(a==='--base')o.base=process.argv[++i].split(',').map(Number);
    else if(a==='--cache')o.cache=process.argv[++i];
    else if(a==='--stop-rank')o.stopRank=Number(process.argv[++i]);
    else if(a==='--trace-missing')o.traceMissing=Number(process.argv[++i]);
    else if(a==='--skyline-switch')o.skylineSwitch=Number(process.argv[++i]);
    else throw new Error(`unknown arg ${a}`);
  }
  return o;
}
const OPT=parseArgs();
fs.mkdirSync(OPT.cache,{recursive:true});

function cellBit(c,r){return 1n<<BigInt(r*W+c);}
function lines(){const out=[];for(let r=0;r<H;r++)for(let c=0;c<=W-K;c++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r);out.push(m);}for(let c=0;c<W;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c,r+i);out.push(m);}for(let c=0;c<=W-K;c++)for(let r=0;r<=H-K;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r+i);out.push(m);}for(let c=0;c<=W-K;c++)for(let r=K-1;r<H;r++){let m=0n;for(let i=0;i<K;i++)m|=cellBit(c+i,r-i);out.push(m);}return out;}
const LINES=lines();
function supportMask(h){let s=0n;for(let c=0;c<W;c++)for(let r=0;r<h[c];r++)s|=cellBit(c,r);return s;}
function residualShapes(h){const S=supportMask(h),set=new Map();for(const l of LINES){const r=l&~S;if(r!==0n)set.set(r.toString(),r);}return [...set.values()].sort((a,b)=>pc(a)-pc(b)||cmpBig(a,b));}
const INFO=new Map();
function shapeInfo(h){const k=skey(h);if(INFO.has(k))return INFO.get(k);const shapes=residualShapes(h),n=shapes.length,byMask=new Map(shapes.map((x,i)=>[x.toString(),i])),up=Array(n).fill(0n);for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(subset(shapes[i],shapes[j]))up[i]|=1n<<BigInt(j);const all=n?((1n<<BigInt(n))-1n):0n;const info={h:h.slice(),shapes,n,byMask,up,all,bits:2*n};INFO.set(k,info);return info;}
function qpack(info,m,o){return m|((info.all^o)<<BigInt(info.n));}
function qunpack(info,q){return {m:q&info.all,o:info.all^((q>>BigInt(info.n))&info.all)};}

function minMasks(cands){const d=[...new Set(cands)];d.sort((a,b)=>pc(a)-pc(b)||cmpBig(a,b));const out=[];outer:for(const q of d){for(const g of out)if(subset(g,q))continue outer;out.push(q);}return out;}

function staticMax(values, bits, leaf=31){
  if(!values.length)return [];
  const arr=[...new Set(values)];
  const recs=arr.map(q=>({q,p:pc(q)}));
  recs.sort((a,b)=>b.p-a.p||cmpBig(a.q,b.q));
  const nodes=[];
  function build(lo,hi){
    const id=nodes.length,n={lo,hi,u:0n,maxp:recs[lo]?.p??0,left:-1,right:-1};nodes.push(n);
    if(hi-lo<=leaf){let u=0n,mp=0;for(let i=lo;i<hi;i++){u|=recs[i].q;mp=Math.max(mp,recs[i].p);}n.u=u;n.maxp=mp;return id;}
    const mid=(lo+hi)>>1;n.left=build(lo,mid);n.right=build(mid,hi);n.u=nodes[n.left].u|nodes[n.right].u;n.maxp=Math.max(nodes[n.left].maxp,nodes[n.right].maxp);return id;
  }
  const root=build(0,recs.length),keep=new Uint8Array(recs.length);
  function hasStrict(q,p,id,qi){const n=nodes[id];if(!subset(q,n.u)||n.maxp<=p)return false;if(n.left<0){for(let i=n.lo;i<n.hi;i++){if(i===qi)continue;const r=recs[i];if(r.p<=p)continue;if(subset(q,r.q))return true;}return false;}return hasStrict(q,p,n.left,qi)||hasStrict(q,p,n.right,qi);}
  for(let i=0;i<recs.length;i++)if(!hasStrict(recs[i].q,recs[i].p,root,i))keep[i]=1;
  return recs.filter((_,i)=>keep[i]).map(r=>r.q).sort(cmpBig);
}
function staticMin(values,bits){if(!values.length)return [];const all=bits?((1n<<BigInt(bits))-1n):0n;return staticMax(values.map(q=>all^q),bits).map(q=>all^q).sort(cmpBig);}

class EdgeMap{
  constructor(parent,child,x){
    this.parent=parent;this.child=child;this.x=x;
    this.own=[];this.opp=[];this.ownCover=Array.from({length:child.n},()=>[]);this.oppCover=Array.from({length:child.n},()=>[]);
    for(let i=0;i<parent.n;i++){
      const r=parent.shapes[i],P=parent.up[i];
      let ownImage=null,terminal=false;
      if((r&x)!==0n){const rr=r&~x;if(rr===0n){terminal=true;}else{const ci=child.byMask.get(rr.toString());if(ci===undefined)throw new Error('own contracted shape missing');ownImage=child.up[ci];}}
      else{const ci=child.byMask.get(r.toString());if(ci===undefined)throw new Error('own unchanged shape missing');ownImage=child.up[ci];}
      let oppImage=0n;
      if((r&x)===0n){const ci=child.byMask.get(r.toString());if(ci===undefined)throw new Error('opp unchanged shape missing');oppImage=child.up[ci];}
      if(!terminal&&ownImage!==null){const idx=this.own.length;this.own.push({P,I:ownImage});for(let b=0;b<child.n;b++)if(ownImage&(1n<<BigInt(b)))this.ownCover[b].push(idx);}
      const oi=this.opp.length;this.opp.push({P,I:oppImage});for(let b=0;b<child.n;b++)if(oppImage&(1n<<BigInt(b)))this.oppCover[b].push(oi);
    }
    this.ownGE=new Map([[0n,[0n]]]);this.oppGE=new Map([[0n,[0n]]]);this.ownLE=new Map();this.oppLE=new Map();
  }
  maxLE(mode,target){const memo=mode==='own'?this.ownLE:this.oppLE;if(memo.has(target))return memo.get(target);const list=mode==='own'?this.own:this.opp;let u=0n;for(const e of list)if(subset(e.I,target))u|=e.P;memo.set(target,u);return u;}
  minGE(mode,target){const memo=mode==='own'?this.ownGE:this.oppGE;if(memo.has(target))return memo.get(target);const list=mode==='own'?this.own:this.opp,covers=mode==='own'?this.ownCover:this.oppCover;let bestBit=-1,bestN=1e9;for(let b=0;b<this.child.n;b++){if((target&(1n<<BigInt(b)))===0n)continue;const n=covers[b].length;if(n<bestN){bestN=n;bestBit=b;}}if(bestBit<0){memo.set(target,[0n]);return [0n];}if(bestN===0){memo.set(target,[]);return [];}const c=[];for(const idx of covers[bestBit]){const e=list[idx],rem=target&~e.I;for(const u of this.minGE(mode,rem))c.push(e.P|u);}const out=minMasks(c);memo.set(target,out);return out;}
}
function terminalBoundary(info,x){const idx=info.byMask.get(x.toString());return idx===undefined?[]:[info.up[idx]];}
function actionUpper(parent,childLower,edge,term){const c=term.slice();for(const q of childLower){const {m,o}=qunpack(edge.child,q),ms=edge.minGE('own',o),op=edge.maxLE('opp',m);for(const mm of ms)c.push(qpack(parent,mm,op));}return staticMin(c,parent.bits);}
function actionLower(parent,childUpper,edge){const c=[];for(const q of childUpper){const {m,o}=qunpack(edge.child,q),mm=edge.maxLE('own',o),os=edge.minGE('opp',m);for(const oo of os)c.push(qpack(parent,mm,oo));}return staticMax(c,parent.bits);}

class VerticalIndex{
  constructor(rows,bits){this.rows=rows;this.bits=bits;this.post=Array(bits).fill(0n);this.freq=new Uint32Array(bits);const t0=performance.now();for(let i=0;i<rows.length;i++){const rb=1n<<BigInt(i),q=rows[i];for(let b=0;b<bits;b++)if(q&(1n<<BigInt(b))){this.post[b]|=rb;this.freq[b]++;}}this.all=rows.length?((1n<<BigInt(rows.length))-1n):0n;this.order=Array.from({length:bits},(_,i)=>i).sort((a,b)=>this.freq[a]-this.freq[b]);this.buildMs=performance.now()-t0;this.env=0n;for(const q of rows)this.env|=q;}
  supersetExists(q){if(this.rows.length===0)return false;if(q===0n)return true;let r=this.all;for(const b of this.order)if(q&(1n<<BigInt(b))){r&=this.post[b];if(r===0n)return false;}return r!==0n;}
  traceMax(a){const seen=new Set(),out=[];let andOps=0,extraOps=0;for(const bmask of this.rows){const q=a&bmask;if(seen.has(q))continue;seen.add(q);let rows=this.all;for(const b of this.order)if(q&(1n<<BigInt(b))){rows&=this.post[b];andOps++;}let dom=false;for(const b of this.order){const bit=1n<<BigInt(b);if((a&bit)!==0n&&(q&bit)===0n){extraOps++;if((rows&this.post[b])!==0n){dom=true;break;}}}if(!dom)out.push(q);}return {out:out.sort(cmpBig),andOps,extraOps,distinct:seen.size};}
}
class ProjectionTree{
  constructor(rows,leaf=31){this.rows=rows.slice();this.leaf=leaf;this.nodes=[];this.env=0n;for(const q of rows)this.env|=q;this.rows.sort((a,b)=>pc(b)-pc(a)||cmpBig(a,b));this.root=this.build(0,this.rows.length);}
  build(lo,hi){const id=this.nodes.length,n={lo,hi,u:0n,left:-1,right:-1};this.nodes.push(n);if(hi-lo<=this.leaf){let u=0n;for(let i=lo;i<hi;i++)u|=this.rows[i];n.u=u;return id;}const mid=(lo+hi)>>1;n.left=this.build(lo,mid);n.right=this.build(mid,hi);n.u=this.nodes[n.left].u|this.nodes[n.right].u;return id;}
  query(a,skylineSwitch=2048){const sky=[];let leafScans=0,nodeVisits=0,aborted=false;const insert=q=>{for(const g of sky)if(subset(q,g))return;for(let i=sky.length-1;i>=0;i--)if(subset(sky[i],q))sky.splice(i,1);sky.push(q);if(sky.length>skylineSwitch)aborted=true;};const dominated=u=>{for(const g of sky)if(subset(u,g))return true;return false;};const rec=id=>{if(aborted)return;const n=this.nodes[id];nodeVisits++;const up=a&n.u;if(dominated(up))return;if(n.left<0){for(let i=n.lo;i<n.hi;i++){leafScans++;insert(a&this.rows[i]);if(aborted)return;}return;}const l=this.nodes[n.left],r=this.nodes[n.right],lp=pc(a&l.u),rp=pc(a&r.u);if(lp>=rp){rec(n.left);rec(n.right);}else{rec(n.right);rec(n.left);}};rec(this.root);return{out:sky.sort(cmpBig),leafScans,nodeVisits,aborted};}
}
function coreAbsorb(A,B,bits){if(!A.length||!B.length)return{absorbers:[],A:[],B:[]};let envA=0n,envB=0n;for(const a of A)envA|=a;for(const b of B)envB|=b;const idxB=new VerticalIndex(B,bits),idxA=new VerticalIndex(A,bits),ra=new Uint8Array(A.length),cb=new Uint8Array(B.length),absorbers=[];for(let i=0;i<A.length;i++){const q=A[i]&envB;if(idxB.supersetExists(q)){ra[i]=1;absorbers.push(q);}}for(let j=0;j<B.length;j++){const q=B[j]&envA;if(idxA.supersetExists(q)){cb[j]=1;absorbers.push(q);}}return{absorbers,A:A.filter((_,i)=>!ra[i]),B:B.filter((_,j)=>!cb[j]),raw:A.length*B.length,residual:ra.reduce((s,x)=>s+(x?0:1),0)*cb.reduce((s,x)=>s+(x?0:1),0)};}
function productMax(A,B,bits,metrics,label=''){if(!A.length||!B.length)return[];const t0=performance.now(),abs=coreAbsorb(A,B,bits),local=abs.absorbers.slice(),inner=abs.B;let traceIdx=null,tree=null,traceQueries=0,treeQueries=0,switchQueries=0,leafScans=0,nodeVisits=0,localCandidates=abs.absorbers.length;if(inner.length){tree=new ProjectionTree(inner);for(const a of abs.A){const missing=pc(tree.env&~a);let qres;if(missing<=OPT.traceMissing){traceIdx??=new VerticalIndex(inner,bits);qres=traceIdx.traceMax(a);traceQueries++;}else{const r=tree.query(a,OPT.skylineSwitch);leafScans+=r.leafScans;nodeVisits+=r.nodeVisits;if(r.aborted){traceIdx??=new VerticalIndex(inner,bits);qres=traceIdx.traceMax(a);switchQueries++;}else{qres=r;treeQueries++;}}local.push(...qres.out);localCandidates+=qres.out.length;}}
  const tg=performance.now(),out=staticMax(local,bits),globalMs=performance.now()-tg,total=performance.now()-t0;const m={label,a:A.length,b:B.length,raw:A.length*B.length,absorbed_candidates:abs.absorbers.length,residual_a:abs.A.length,residual_b:abs.B.length,residual_pairs:abs.A.length*abs.B.length,local_candidates:localCandidates,trace_queries:traceQueries,tree_queries:treeQueries,switch_queries:switchQueries,leaf_scans:leafScans,node_visits:nodeVisits,global_ms:globalMs,total_ms:total,output:out.length};metrics.products.push(m);console.error(JSON.stringify({type:'product',...m}));return out;}

function coneSupports(base){const arr=[],h=base.slice();function rec(c){if(c===W){arr.push(h.slice());return;}for(let v=base[c];v<=H;v++){h[c]=v;rec(c+1);}}rec(0);arr.sort((a,b)=>b.reduce((x,y)=>x+y,0)-a.reduce((x,y)=>x+y,0)||skey(a).localeCompare(skey(b)));return arr;}
function pathsFor(h){const k=h.join('_');return{u:path.join(OPT.cache,`${k}.U.hex`),l:path.join(OPT.cache,`${k}.L.hex`),m:path.join(OPT.cache,`${k}.json`)};}
function serialize(arr){return arr.slice().sort(cmpBig).map(x=>x.toString(16)).join('\n')+'\n';}
function sha(s){return createHash('sha256').update(s).digest('hex');}
function saveBoundary(h,U,L,meta){const p=pathsFor(h),us=serialize(U),ls=serialize(L);fs.writeFileSync(p.u,us);fs.writeFileSync(p.l,ls);fs.writeFileSync(p.m,JSON.stringify({...meta,support:h,upper:U.length,lower:L.length,upper_sha256:sha(us),lower_sha256:sha(ls)},null,2)+'\n');}
function loadHex(p){const s=fs.readFileSync(p,'utf8').trim();return s?[...s.split(/\n/)].map(x=>BigInt('0x'+x)):[];}
function loadBoundary(h){const p=pathsFor(h);if(!fs.existsSync(p.m)||!fs.existsSync(p.u)||!fs.existsSync(p.l))return null;return{U:loadHex(p.u),L:loadHex(p.l),meta:JSON.parse(fs.readFileSync(p.m,'utf8'))};}
function actionPaths(h,c){const k=h.join('_');return{u:path.join(OPT.cache,`${k}.A${c}.U.hex`),l:path.join(OPT.cache,`${k}.A${c}.L.hex`) };}
function stateUpperPath(h){return path.join(OPT.cache,`${h.join('_')}.stateU.hex`);}
function productPath(h,step){return path.join(OPT.cache,`${h.join('_')}.P${step}.hex`);}
function saveHexFile(p,arr){fs.writeFileSync(p,serialize(arr));}
function loadHexIf(p){return fs.existsSync(p)?loadHex(p):null;}

const supports=coneSupports(OPT.base),metrics={products:[]},start=performance.now();
for(const h of supports){const rank=h.reduce((a,b)=>a+b,0);if(rank<OPT.stopRank)break;const cached=loadBoundary(h);if(cached){console.error(JSON.stringify({type:'cached',support:h,rank,upper:cached.U.length,lower:cached.L.length}));continue;}const info=shapeInfo(h);if(rank===CELLS){saveBoundary(h,[0n],[0n],{rank,shapes:info.n,bits:info.bits,elapsed_ms:0});continue;}const actionU=[],actionL=[];const t0=performance.now();for(let c=0;c<W;c++){if(h[c]>=H)continue;const ap=actionPaths(h,c),cachedAU=loadHexIf(ap.u),cachedAL=loadHexIf(ap.l);let au,al;if(cachedAU&&cachedAL){au=cachedAU;al=cachedAL;console.error(JSON.stringify({type:'cached_action',support:h,rank,column:c,upper:au.length,lower:al.length}));}else{const ch=h.slice();ch[c]++;const childB=loadBoundary(ch);if(!childB)throw new Error(`missing child boundary ${skey(ch)}`);const child=shapeInfo(ch),x=cellBit(c,h[c]),edge=new EdgeMap(info,child,x),term=terminalBoundary(info,x);au=actionUpper(info,childB.L,edge,term);al=actionLower(info,childB.U,edge);saveHexFile(ap.u,au);saveHexFile(ap.l,al);console.error(JSON.stringify({type:'action',support:h,rank,column:c,upper:au.length,lower:al.length,ownMemo:edge.ownGE.size,oppMemo:edge.oppGE.size}));}actionU.push(...au);actionL.push({column:c,L:al});}
  const sup=stateUpperPath(h);let U=loadHexIf(sup);if(!U){U=staticMin(actionU,info.bits);saveHexFile(sup,U);}else console.error(JSON.stringify({type:'cached_state_upper',support:h,rank,upper:U.length}));let L=actionL.length?actionL[0].L:[];for(let i=1;i<actionL.length;i++){const pp=productPath(h,i),cachedP=loadHexIf(pp);if(cachedP){L=cachedP;console.error(JSON.stringify({type:'cached_product',support:h,rank,step:i,output:L.length}));}else{console.error(JSON.stringify({type:'product_start',support:h,rank,step:i,a:L.length,b:actionL[i].L.length,column:actionL[i].column}));L=productMax(L,actionL[i].L,info.bits,metrics,`${skey(h)}:c${actionL[i].column}`);saveHexFile(pp,L);}}const elapsed=performance.now()-t0;saveBoundary(h,U,L,{rank,shapes:info.n,bits:info.bits,elapsed_ms:elapsed,products:metrics.products.splice(0)});console.error(JSON.stringify({type:'support',support:h,rank,shapes:info.n,bits:info.bits,upper:U.length,lower:L.length,elapsed_ms:elapsed}));}
console.log(JSON.stringify({schema:1,experiment:'rba-draw-boundary-runner',base:OPT.base,stopRank:OPT.stopRank,cache:OPT.cache,elapsed_ms:performance.now()-start},null,2));
