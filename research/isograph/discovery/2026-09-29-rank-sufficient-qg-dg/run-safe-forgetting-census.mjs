import fs from 'node:fs';
import assert from 'node:assert/strict';

const cases=[
 {width:4,height:4,k:4,label:'4x4-k4'},
 {width:4,height:4,k:3,label:'4x4-k3'},
 {width:3,height:4,k:3,label:'3x4-k3'},
 {width:4,height:3,k:3,label:'4x3-k3'},
];

function popcount(x){let n=0;for(let v=x>>>0;v;v=(v&(v-1))>>>0)n++;return n;}
function gf2Rank(rows,bits){
 rows=rows.filter(Boolean).map(x=>x>>>0);let rank=0;
 for(let bit=bits-1;bit>=0;bit--){
  const i=rows.findIndex((x,j)=>j>=rank&&((x>>>bit)&1));
  if(i<0)continue;
  [rows[rank],rows[i]]=[rows[i],rows[rank]];
  for(let j=0;j<rows.length;j++)if(j!==rank&&((rows[j]>>>bit)&1))rows[j]=(rows[j]^rows[rank])>>>0;
  rank++;
 }
 return rank;
}
function hist(xs){const m={};for(const x of xs)m[x]=(m[x]??0)+1;return Object.entries(m).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k,v])=>k+':'+v).join(',');}

function analyze({width:W,height:H,k:K,label}){
 const N=W*H,span=2**N;
 assert.ok(N<=20);
 function winMasks(){
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)
   for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
    const ec=c+(K-1)*dc,er=r+(K-1)*dr;
    if(ec<0||ec>=W||er<0||er>=H)continue;
    let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);
    out.push(m>>>0);
   }
  return [...new Set(out)].sort((a,b)=>a-b);
 }
 const lines=winMasks(),won=bits=>lines.some(m=>(bits&m)===m);
 function normalize(xs){
  xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
  return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));
 }
 function residuals(self,opp){
  const raw=[];
  for(const m of lines){if(m&opp)continue;const r=(m&~self)>>>0;if(r)raw.push(r);}
  return normalize(raw);
 }
 const nodes=new Map(),byRank=Array.from({length:N+1},()=>[]);
 const keyOf=(p0,p1)=>p0*span+p1;
 function visit(p0,p1,heights,rank){
  const key=keyOf(p0,p1);if(nodes.has(key))return key;
  const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);
  const terminal=w0||w1||rank===N,winner=w0?0:w1?1:null;
  const rec={key,p0,p1,heights:[...heights],rank,terminal,winner,children:[]};
  nodes.set(key,rec);byRank[rank].push(rec);
  if(terminal)return key;
  for(let c=0;c<W;c++)if(heights[c]<H){
    const bit=1<<(heights[c]*W+c);heights[c]++;
    const child=(rank&1)?visit(p0,p1|bit,heights,rank+1):visit(p0|bit,p1,heights,rank+1);
    heights[c]--;rec.children.push({col:c,key:child});
  }
  return key;
 }
 const root=visit(0,0,Array(W).fill(0),0);

 const futureClass=new Map(),futureSigToId=new Map(),value=new Map();
 let nextFuture=0;
 for(let rank=N;rank>=0;rank--)for(const rec of byRank[rank]){
  let fs,v;
  if(rec.terminal){
   const kind=rec.winner===0?'P0':rec.winner===1?'P1':'D';
   fs='T:'+kind;
   v=rec.winner===0?1:rec.winner===1?-1:0;
  }else{
   const slots=Array(W).fill('I'),vals=[];
   for(const ch of rec.children){
    const cr=nodes.get(ch.key);
    if(cr.terminal){
     const kind=cr.winner===0?'P0':cr.winner===1?'P1':'D';
     slots[ch.col]='T:'+kind;
    }else slots[ch.col]='C:'+futureClass.get(ch.key);
    vals.push(value.get(ch.key));
   }
   fs='N:'+slots.join('|');
   v=(rank&1)?Math.min(...vals):Math.max(...vals);
  }
  let id=futureSigToId.get(fs);if(id===undefined){id=nextFuture++;futureSigToId.set(fs,id);}
  futureClass.set(rec.key,id);value.set(rec.key,v);
 }

 function qOf(rec){
  if(rec.terminal){
   const kind=rec.winner===0?'P0':rec.winner===1?'P1':'D';
   return {terminal:true,kind};
  }
  return {terminal:false,heights:[...rec.heights],r0:residuals(rec.p0,rec.p1),r1:residuals(rec.p1,rec.p0)};
 }
 function qKey(q){
  if(q.terminal)return 'T:'+q.kind;
  return q.heights.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');
 }
 function reflectMask(m){
  let out=0;
  for(let bit=0;bit<N;bit++)if(m&(1<<bit)){
   const row=Math.floor(bit/W),col=bit%W,nc=W-1-col;
   out|=1<<(row*W+nc);
  }
  return out>>>0;
 }
 function reflectQ(q){
  if(q.terminal)return q;
  return {terminal:false,heights:[...q.heights].reverse(),
    r0:q.r0.map(reflectMask).sort((a,b)=>a-b),
    r1:q.r1.map(reflectMask).sort((a,b)=>a-b)};
 }
 function qrKey(q){const a=qKey(q),b=qKey(reflectQ(q));return a<b?a:b;}
 function sizes(rs){return rs.map(popcount).sort((a,b)=>a-b);}
 function incidenceHist(rs){
  const d=Array(N).fill(0);for(const m of rs)for(let bit=0;bit<N;bit++)if(m&(1<<bit))d[bit]++;
  return d.filter(Boolean).sort((a,b)=>a-b);
 }
 function candidateKeys(q){
  if(q.terminal)return Object.fromEntries(CANDIDATES.map(x=>[x,'T:'+q.kind]));
  const support=q.heights.join(','),owned=q.r0.join('.')+'|'+q.r1.join('.'),
    union=[...new Set([...q.r0,...q.r1])].sort((a,b)=>a-b).join('.'),
    s0=sizes(q.r0),s1=sizes(q.r1),
    rank0=gf2Rank(q.r0,N),rank1=gf2Rank(q.r1,N),
    inc0=incidenceHist(q.r0),inc1=incidenceHist(q.r1);
  return {
   QO:qKey(q),
   QR:qrKey(q),
   SUPPORT:support,
   SUPPORT_R0:support+'|'+q.r0.join('.'),
   SUPPORT_R1:support+'|'+q.r1.join('.'),
   OWNED_NO_SUPPORT:owned,
   SUPPORT_UNOWNED_UNION:support+'|'+union,
   SUPPORT_SIZE_HIST:support+'|'+q.r0.length+':'+hist(s0)+'|'+q.r1.length+':'+hist(s1),
   SUPPORT_GF2:support+'|'+q.r0.length+':'+rank0+':'+hist(s0)+'|'+q.r1.length+':'+rank1+':'+hist(s1),
   SUPPORT_INCIDENCE:support+'|'+hist(inc0)+':'+hist(s0)+'|'+hist(inc1)+':'+hist(s1)
  };
 }
 const CANDIDATES=['QO','QR','SUPPORT','SUPPORT_R0','SUPPORT_R1','OWNED_NO_SUPPORT','SUPPORT_UNOWNED_UNION','SUPPORT_SIZE_HIST','SUPPORT_GF2','SUPPORT_INCIDENCE'];

 function qStep(q,col,rank){
  assert.ok(!q.terminal&&q.heights[col]<H);
  const bit=1<<(q.heights[col]*W+col),mover=rank&1,own=mover?q.r1:q.r0,opp=mover?q.r0:q.r1,next=[];
  let win=false;
  for(const req of own){
   if(req&bit){const r=(req&~bit)>>>0;if(!r){win=true;break;}next.push(r);}
   else next.push(req);
  }
  if(win)return {terminal:true,kind:mover?'P1':'P0'};
  const heights=[...q.heights];heights[col]++;
  if(rank+1===N)return {terminal:true,kind:'D'};
  const oppNext=normalize(opp.filter(req=>(req&bit)===0)),ownNext=normalize(next);
  return mover?{terminal:false,heights,r0:oppNext,r1:ownNext}:{terminal:false,heights,r0:ownNext,r1:oppNext};
 }

 let qTransitions=0,qTransitionMismatches=0;
 const qTransitionExamples=[];
 for(const rec of nodes.values())if(!rec.terminal){
  const q=qOf(rec);
  for(const ch of rec.children){
   qTransitions++;
   const actual=qKey(qOf(nodes.get(ch.key))),derived=qKey(qStep(q,ch.col,rec.rank));
   if(actual!==derived){
    qTransitionMismatches++;
    if(qTransitionExamples.length<16)qTransitionExamples.push({state:rec.key,col:ch.col,actual,derived});
   }
  }
 }

 const groups=Object.fromEntries(CANDIDATES.map(c=>[c,new Map()]));
 for(const rec of nodes.values()){
  const q=qOf(rec),keys=candidateKeys(q),f=futureClass.get(rec.key),v=value.get(rec.key);
  for(const c of CANDIDATES){
   let row=groups[c].get(keys[c]);
   if(!row){row={states:0,futures:new Set(),values:new Set(),examples:[]};groups[c].set(keys[c],row);}
   row.states++;row.futures.add(f);row.values.add(v);
   if(row.examples.length<4)row.examples.push({physicalKey:rec.key,future:f,value:v,q:qKey(q)});
  }
 }
 const census={};
 for(const c of CANDIDATES){
  let futureCollisionGroups=0,valueCollisionGroups=0,futureCollisionStates=0,valueCollisionStates=0;
  const futureExamples=[],valueExamples=[];
  for(const [k,row] of groups[c]){
   if(row.futures.size>1){futureCollisionGroups++;futureCollisionStates+=row.states;if(futureExamples.length<8)futureExamples.push({candidateKey:k,...row,futures:[...row.futures],values:[...row.values]});}
   if(row.values.size>1){valueCollisionGroups++;valueCollisionStates+=row.states;if(valueExamples.length<8)valueExamples.push({candidateKey:k,...row,futures:[...row.futures],values:[...row.values]});}
  }
  const clean=x=>x.map(e=>({candidateKey:e.candidateKey,states:e.states,futures:e.futures,values:e.values,examples:e.examples}));
  census[c]={
   groups:groups[c].size,
   futureBehaviorSufficient:futureCollisionGroups===0,
   scalarValueSufficient:valueCollisionGroups===0,
   futureCollisionGroups,futureCollisionStates,valueCollisionGroups,valueCollisionStates,
   futureCollisionExamples:clean(futureExamples),valueCollisionExamples:clean(valueExamples)
  };
 }
 assert.equal(census.QO.futureBehaviorSufficient,true,'q_o must be future-behavior sufficient on bounded census');
 assert.equal(census.QO.scalarValueSufficient,true);
 assert.equal(census.QR.scalarValueSufficient,true,'physical reflection quotient must preserve scalar value');
 assert.equal(qTransitionMismatches,0,'rank-local q_o update must reproduce all physical successor q_o states');

 return {
  label,width:W,height:H,k:K,cells:N,winningLines:lines.length,
  physicalStates:nodes.size,futureBehaviorClasses:nextFuture,
  rootValue:value.get(root),
  q_o:{
   distinctRepresentations:groups.QO.size,
   futureBehaviorSufficient:census.QO.futureBehaviorSufficient,
   scalarValueSufficient:census.QO.scalarValueSufficient,
   transitionClosure:{edges:qTransitions,mismatches:qTransitionMismatches,examples:qTransitionExamples}
  },
  q_r:{
   distinctRepresentations:groups.QR.size,
   scalarValueSufficient:census.QR.scalarValueSufficient,
   literalFutureBehaviorSufficient:census.QR.futureBehaviorSufficient,
   note:'literal future labels need not be preserved by reflection quotient'
  },
  census
 };
}

const results=[];
for(const c of cases){console.log('case',c.label);results.push(analyze(c));}
const candidates=Object.keys(results[0].census);
const crossCase={};
for(const c of candidates){
 crossCase[c]={
  futureBehaviorSufficientAll:results.every(r=>r.census[c].futureBehaviorSufficient),
  scalarValueSufficientAll:results.every(r=>r.census[c].scalarValueSufficient),
  falsifiedFutureCases:results.filter(r=>!r.census[c].futureBehaviorSufficient).map(r=>r.label),
  falsifiedValueCases:results.filter(r=>!r.census[c].scalarValueSufficient).map(r=>r.label)
 };
}
const out={
 schema:'connect4.rank_sufficient_qg_dg.safe_forgetting_census.v1',
 date_author_local:'2026-09-29',
 warrant:'QGDG-EW-001',
 cases:results,
 crossCase,
 exact_bounded_conclusions:{
  qoFutureSufficientAll:results.every(r=>r.q_o.futureBehaviorSufficient),
  qoRankLocalTransitionClosedAll:results.every(r=>r.q_o.transitionClosure.mismatches===0),
  qrValueSufficientAll:results.every(r=>r.q_r.scalarValueSufficient)
 },
 interpretation_guard:'Candidate maps are rank-local and future/value blind. Complete futures and values are post-hoc bounded validation oracles. Finite positive results do not establish standard-7x6 minimality.'
};
fs.writeFileSync(new URL('./SAFE_FORGETTING_CENSUS_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({
 status:'QGDG_EW001_COMPLETE',
 cases:results.map(r=>({label:r.label,states:r.physicalStates,futures:r.futureBehaviorClasses,rootValue:r.rootValue,qo:r.q_o.distinctRepresentations,qr:r.q_r.distinctRepresentations})),
 crossCase
},null,2));