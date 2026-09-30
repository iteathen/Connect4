import fs from 'node:fs';
import assert from 'node:assert/strict';

function auditCase(W,H,K){
  const N=W*H;
  function winMasks(){
    const o=[];
    for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
      const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;
      let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);o.push(m>>>0);
    }
    return [...new Set(o)];
  }
  const L=winMasks(),won=b=>L.some(m=>((b&m)>>>0)===m);
  function bits(m){const o=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0)o.push(31-Math.clz32(v&-v));return o;}
  function cols(m){return [...new Set(bits(m).map(b=>b%W))].sort((a,b)=>a-b);}
  function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
  function residuals(a,b){const o=[];for(const l of L){if(l&b)continue;const r=(l&~a)>>>0;if(r)o.push(r);}return norm(o);}
  const states=new Map();
  function visit(a,b,h,r){
    const key=a+':'+b;if(states.has(key))return key;
    const A=won(a),B=won(b);assert.equal(A&&B,false);
    const t=A||B||r===N,x={key,a,b,h:[...h],r,t,ch:[]};
    states.set(key,x);if(t)return key;
    for(let c=0;c<W;c++)if(h[c]<H){const bit=1<<(h[c]*W+c);h[c]++;const y=(r&1)?visit(a,b|bit,h,r+1):visit(a|bit,b,h,r+1);h[c]--;x.ch.push({c,key:y});}
    return key;
  }
  visit(0,0,new Uint8Array(W),0);
  const nts=[...states.values()].filter(x=>!x.t);
  function qOf(x){return{h:[...x.h],r0:residuals(x.a,x.b),r1:residuals(x.b,x.a)};}
  function key(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
  function cnt(q){const rank=q.h.reduce((a,b)=>a+b,0),rem=N-rank,m=rank&1,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);return{rank,rem,m,p0:m?oo:mm,p1:m?mm:oo};}
  function feasible(mask,h,p){const c=cnt({h,r0:[],r1:[]}),ds=bits(mask).map(b=>Math.floor(b/W)-h[b%W]+1).sort((a,b)=>a-b);let s=p===c.m?1:2;for(const d of ds){while(s<d)s+=2;if(s>c.rem)return false;s+=2;}return true;}
  function R(q){return{h:q.h,r0:q.r0.filter(z=>feasible(z,q.h,0)),r1:q.r1.filter(z=>feasible(z,q.h,1))};}
  function F(q){const c=cnt(q),own=c.m?q.r1:q.r0;let f=0;for(let col=0;col<W;col++)if(q.h[col]<H){const b=1<<(q.h[col]*W+col);if(!own.some(z=>z===b))f|=b;}return c.m?{h:q.h,r0:q.r0.filter(z=>(z&f)!==f),r1:q.r1}:{h:q.h,r0:q.r0,r1:q.r1.filter(z=>(z&f)!==f)};}
  function G(q){let caps=0;for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);if(!caps)return q;const fp=(N-1)&1,np=1-fp;return np?{h:q.h,r0:q.r0,r1:q.r1.filter(z=>(z&caps)!==caps)}:{h:q.h,r0:q.r0.filter(z=>(z&caps)!==caps),r1:q.r1};}
  function Hc(q){const open=[];for(let c=0;c<W;c++)if(q.h[c]<H)open.push(c);if(open.length!==1)return q;const col=open[0],rank=q.h.reduce((a,b)=>a+b,0);function keep(mask,owner){for(const b of bits(mask))if(b%W===col){const d=Math.floor(b/W)-q.h[col]+1;if(d>0&&((rank+d-1)&1)!==owner)return false;}return true;}return{h:q.h,r0:q.r0.filter(z=>keep(z,0)),r1:q.r1.filter(z=>keep(z,1))};}

  function components(q){
    const p=[...Array(W).keys()];
    function find(x){while(p[x]!==x){p[x]=p[p[x]];x=p[x];}return x;}
    function union(a,b){a=find(a);b=find(b);if(a!==b)p[b]=a;}
    for(const m of [...q.r0,...q.r1]){const cs=cols(m);for(let i=1;i<cs.length;i++)union(cs[0],cs[i]);}
    const g=new Map();for(let c=0;c<W;c++){const r=find(c);if(!g.has(r))g.set(r,[]);g.get(r).push(c);}
    return [...g.values()].map(cs=>cs.sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0]);
  }
  function subResiduals(q,cs,owner){
    const S=new Set(cs),rs=owner?q.r1:q.r0;
    return rs.filter(m=>cols(m).every(c=>S.has(c)));
  }
  function recombine(h,locals){
    return {h,r0:norm(locals.flatMap(x=>x.r0)),r1:norm(locals.flatMap(x=>x.r1))};
  }

  function Rlocal(q){
    const cs=components(q),c=cnt(q),locals=[];
    for(const C of cs)locals.push({
      r0:subResiduals(q,C,0).filter(z=>feasible(z,q.h,0)),
      r1:subResiduals(q,C,1).filter(z=>feasible(z,q.h,1))
    });
    return {q:recombine(q.h,locals),scheduler:{p0Slots:c.p0,p1Slots:c.p1,rank:c.rank}};
  }
  function Flocal(q){
    const cs=components(q),c=cnt(q),rows=[];
    for(const C of cs){
      const own=subResiduals(q,C,c.m),f0=[];
      let f=0;
      for(const col of C)if(q.h[col]<H){const b=1<<(q.h[col]*W+col);if(!own.some(z=>z===b)){f|=b;f0.push(col);}}
      rows.push({C,f,active:f!==0,r0:subResiduals(q,C,0),r1:subResiduals(q,C,1)});
    }
    const active=rows.reduce((n,x)=>n+(x.active?1:0),0),locals=[];
    for(const row of rows){
      const externalActive=active-(row.active?1:0);
      if(externalActive>0){locals.push({r0:row.r0,r1:row.r1});continue;}
      if(c.m)locals.push({r0:row.r0.filter(z=>(z&row.f)!==row.f),r1:row.r1});
      else locals.push({r0:row.r0,r1:row.r1.filter(z=>(z&row.f)!==row.f)});
    }
    return {q:recombine(q.h,locals),scheduler:{activeFrontierComponentsCapped2:Math.min(active,2),mover:c.m}};
  }
  function Glocal(q){
    const cs=components(q),fp=(N-1)&1,np=1-fp,rows=[];
    for(const C of cs){
      let caps=0,open=0;for(const col of C)if(q.h[col]<H){caps|=1<<((H-1)*W+col);open++;}
      rows.push({C,caps,open,r0:subResiduals(q,C,0),r1:subResiduals(q,C,1)});
    }
    const openComps=rows.reduce((n,x)=>n+(x.open>0?1:0),0),locals=[];
    for(const row of rows){
      const externalOpen=openComps-(row.open>0?1:0);
      if(externalOpen>0||!row.caps){locals.push({r0:row.r0,r1:row.r1});continue;}
      if(np)locals.push({r0:row.r0,r1:row.r1.filter(z=>(z&row.caps)!==row.caps)});
      else locals.push({r0:row.r0.filter(z=>(z&row.caps)!==row.caps),r1:row.r1});
    }
    return {q:recombine(q.h,locals),scheduler:{openComponentsCapped2:Math.min(openComps,2),nonFinalPlayer:np}};
  }
  function Hlocal(q){
    const cs=components(q),open=[];for(let c=0;c<W;c++)if(q.h[c]<H)open.push(c);
    if(open.length!==1)return {q,scheduler:{openColumnsCapped2:Math.min(open.length,2)}};
    const col=open[0],rank=q.h.reduce((a,b)=>a+b,0),locals=[];
    function keep(mask,owner){for(const b of bits(mask))if(b%W===col){const d=Math.floor(b/W)-q.h[col]+1;if(d>0&&((rank+d-1)&1)!==owner)return false;}return true;}
    for(const C of cs)locals.push({r0:subResiduals(q,C,0).filter(z=>keep(z,0)),r1:subResiduals(q,C,1).filter(z=>keep(z,1))});
    return {q:recombine(q.h,locals),scheduler:{openColumnsCapped2:1}};
  }

  let mismatchR=0,mismatchF=0,mismatchG=0,mismatchH=0;const examples=[];
  const schedHist={R:{},F:{},G:{},H:{}};
  function bump(stage,k){schedHist[stage][k]=(schedHist[stage][k]??0)+1;}
  for(const x of nts){
    const q0=qOf(x);
    const lr=Rlocal(q0),mr=R(q0);bump('R',lr.scheduler.p0Slots+','+lr.scheduler.p1Slots);
    if(key(lr.q)!==key(mr)){mismatchR++;if(examples.length<16)examples.push({stage:'R',state:x.key,local:key(lr.q),mono:key(mr)});}
    const lf=Flocal(mr),mf=F(mr);bump('F',String(lf.scheduler.activeFrontierComponentsCapped2));
    if(key(lf.q)!==key(mf)){mismatchF++;if(examples.length<16)examples.push({stage:'F',state:x.key,local:key(lf.q),mono:key(mf)});}
    const lg=Glocal(mf),mg=G(mf);bump('G',String(lg.scheduler.openComponentsCapped2));
    if(key(lg.q)!==key(mg)){mismatchG++;if(examples.length<16)examples.push({stage:'G',state:x.key,local:key(lg.q),mono:key(mg)});}
    const lh=Hlocal(mg),mh=Hc(mg);bump('H',String(lh.scheduler.openColumnsCapped2));
    if(key(lh.q)!==key(mh)){mismatchH++;if(examples.length<16)examples.push({stage:'H',state:x.key,local:key(lh.q),mono:key(mh)});}
  }
  assert.equal(mismatchR,0);assert.equal(mismatchF,0);assert.equal(mismatchG,0);assert.equal(mismatchH,0);
  return {
    label:W+'x'+H+'-k'+K,width:W,height:H,k:K,physicalStates:states.size,nonterminalStates:nts.length,
    mismatches:{R:mismatchR,F:mismatchF,G:mismatchG,H:mismatchH},
    schedulerHistograms:schedHist
  };
}

const cases=[
  auditCase(3,3,3),auditCase(3,4,3),auditCase(4,3,3),
  auditCase(4,4,3),auditCase(4,4,4),auditCase(3,5,3),auditCase(5,3,3)
];
const out={
  schema:'connect4.isomax.component_scheduler_factorization.v1',
  date_author_local:'2026-09-29',
  warrant:'EW-RS-021',
  scope:'seven complete bounded carriers in current rank-sufficiency campaign',
  theoremShape:{
    R:'componentwise residual feasibility parameterized by global remaining P0/P1 move slots',
    F:'componentwise frontier deletion parameterized by number of components with nonempty local blocked-frontier set, capped at 2',
    G:'componentwise final-cap deletion parameterized by number of components with open columns, capped at 2',
    H:'componentwise sole-column ownership deletion parameterized by global open-column count, capped at 2'
  },
  cases,
  result:cases.every(c=>Object.values(c.mismatches).every(x=>x===0))?'EXACT_FINITE_COMPONENT_PLUS_SCHEDULER_FACTORIZATION':'FALSIFIED',
  implications:[
    'Safe forgetting can split residual-incidence connectivity and produce remote component changes, but these tested R/F/G/H interactions reconstruct exactly from local component state plus a small global scheduler/boundary context.',
    'Deleted residual bridges need not be restored wholesale to reproduce the reduction operators.',
    'The natural algebraic object is therefore a scheduler-graded/contextual component monoid rather than a plain independent component monoid.',
    'No value-composition law, XOR law, or standard-7x6 theorem follows from this bounded factorization alone.'
  ]
};
fs.writeFileSync(new URL('./COMPONENT_SCHEDULER_FACTORIZATION_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'COMPONENT_SCHEDULER_FACTORIZATION_COMPLETE',result:out.result,cases:cases.map(c=>({label:c.label,mismatches:c.mismatches,schedulers:c.schedulerHistograms}))},null,2));