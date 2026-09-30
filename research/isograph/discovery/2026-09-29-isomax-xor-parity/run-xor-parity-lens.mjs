import fs from 'node:fs';
import assert from 'node:assert/strict';

const CASES=[
 {width:4,height:4,k:4,label:'4x4-k4',role:'exploratory'},
 {width:4,height:4,k:3,label:'4x4-k3',role:'holdout'},
 {width:3,height:3,k:3,label:'3x3-k3',role:'holdout'},
 {width:3,height:4,k:3,label:'3x4-k3',role:'holdout'},
 {width:4,height:3,k:3,label:'4x3-k3',role:'holdout'},
];

function analyze({width:W,height:H,k:K,label,role}){
 const N=W*H;
 function masks(){const a=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dc,dr]of[[1,0],[0,1],[1,1],[1,-1]]){const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;let m=0;for(let i=0;i<K;i++)m|=1<<((r+i*dr)*W+c+i*dc);a.push(m>>>0);}return[...new Set(a)].sort((a,b)=>a-b);}
 const L=masks(),won=b=>L.some(m=>((m&b)>>>0)===m);
 function bits(m){const o=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const b=31-Math.clz32(v&-v);o.push({bit:b,col:b%W,row:Math.floor(b/W)});}return o;}
 function pc(m){return bits(m).length;}
 function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
 function residuals(self,opp){const a=[];for(const l of L){if(l&opp)continue;const r=(l&~self)>>>0;if(r)a.push(r);}return norm(a);}

 const nodes=new Map(),byRank=Array.from({length:N+1},()=>[]);
 function visit(p0,p1,h,r){const key=p0+':'+p1;if(nodes.has(key))return key;const w0=won(p0),w1=won(p1);assert.equal(w0&&w1,false);const t=w0||w1||r===N,x={key,p0,p1,h:[...h],r,t,w:w0?0:w1?1:null,ch:[]};nodes.set(key,x);byRank[r].push(x);if(t)return key;for(let c=0;c<W;c++)if(h[c]<H){const b=1<<(h[c]*W+c);h[c]++;const y=(r&1)?visit(p0,p1|b,h,r+1):visit(p0|b,p1,h,r+1);h[c]--;x.ch.push({c,key:y});}return key;}
 visit(0,0,Array(W).fill(0),0);
 const nts=[...nodes.values()].filter(x=>!x.t);

 const future=new Map(),sigId=new Map(),value=new Map(),actionValue=new Map();let nextFuture=0;
 for(let r=N;r>=0;r--)for(const x of byRank[r]){
   if(x.t){const tok=x.w===0?'P0':x.w===1?'P1':'D',s='T:'+tok;let id=sigId.get(s);if(id===undefined){id=nextFuture++;sigId.set(s,id);}future.set(x.key,id);value.set(x.key,x.w===0?1:x.w===1?-1:0);continue;}
   const slots=Array(W).fill('I'),av=Array(W).fill('I'),vs=[];
   for(const e of x.ch){const y=nodes.get(e.key);slots[e.c]=y.t?'T:'+(y.w===0?'P0':y.w===1?'P1':'D'):'C:'+future.get(y.key);av[e.c]=value.get(y.key);vs.push(value.get(y.key));}
   const s='N:'+slots.join('|');let id=sigId.get(s);if(id===undefined){id=nextFuture++;sigId.set(s,id);}future.set(x.key,id);actionValue.set(x.key,av);value.set(x.key,(r&1)?Math.min(...vs):Math.max(...vs));
 }

 function qOf(x){return{h:[...x.h],r0:residuals(x.p0,x.p1),r1:residuals(x.p1,x.p0)};}
 function qkey(q){return q.h.join(',')+'|'+q.r0.join('.')+'|'+q.r1.join('.');}
 const qmap=new Map(nts.map(x=>[x.key,qOf(x)]));
 function sf(h){const rank=h.reduce((a,b)=>a+b,0),xor=h.reduce((a,b)=>a^b,0),p=rank&1,sorted=[...h].sort((a,b)=>a-b),sq=h.reduce((a,b)=>a+b*b,0),cube=h.reduce((a,b)=>a+b*b*b,0),xorSq=h.reduce((a,b)=>a^(b*b),0),xor1h=h.reduce((a,b)=>a^(1<<b),0);let oddMask=0,openMask=0;for(let c=0;c<W;c++){if(h[c]&1)oddMask|=1<<c;if(h[c]<H)openMask|=1<<c;}const e=Array(W+1).fill(0);e[0]=1;for(const x of h)for(let j=W;j>=1;j--)e[j]+=e[j-1]*x;return{rank,xor,p,sorted:sorted.join(','),sq,cube,xorSq,xor1h,oddMask,openMask,elem:e.slice(1).join(',')};}
 let parityRedundancy=true;
 for(const x of nts){const f=sf(x.h);if(f.p!==(f.xor&1)){parityRedundancy=false;break;}}
 assert.equal(parityRedundancy,true);

 function counts(q){const f=sf(q.h),rem=N-f.rank,m=f.p,mm=Math.ceil(rem/2),oo=Math.floor(rem/2);return{...f,rem,m,p0:m?oo:mm,p1:m?mm:oo};}
 function M(q){const c=counts(q);return{h:q.h,r0:q.r0.filter(z=>pc(z)<=c.p0),r1:q.r1.filter(z=>pc(z)<=c.p1)};}
 function feasible(mask,h,p){const c=counts({h,r0:[],r1:[]}),ds=bits(mask).map(z=>z.row-h[z.col]+1).sort((a,b)=>a-b);if(ds.some(d=>d<=0))return false;let s=p===c.m?1:2;for(const d of ds){while(s<d)s+=2;if(s>c.rem)return false;s+=2;}return true;}
 function R(q){return{h:q.h,r0:q.r0.filter(z=>feasible(z,q.h,0)),r1:q.r1.filter(z=>feasible(z,q.h,1))};}
 function F(q){const c=counts(q),own=c.m?q.r1:q.r0;let f=0;for(let col=0;col<W;col++)if(q.h[col]<H){const b=1<<(q.h[col]*W+col);if(!own.some(z=>z===b))f|=b;}return c.m?{h:q.h,r0:q.r0.filter(z=>(z&f)!==f),r1:q.r1}:{h:q.h,r0:q.r0,r1:q.r1.filter(z=>(z&f)!==f)};}
 function C(q){const c=counts(q);if(c.rem<=0||(c.rem&1))return q;let caps=0;for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);return c.m?{h:q.h,r0:q.r0,r1:q.r1.filter(z=>(z&caps)!==caps)}:{h:q.h,r0:q.r0.filter(z=>(z&caps)!==caps),r1:q.r1};}
 function G(q){let caps=0;for(let col=0;col<W;col++)if(q.h[col]<H)caps|=1<<((H-1)*W+col);if(!caps)return q;const final=(N-1)&1,nonFinal=1-final;return nonFinal?{h:q.h,r0:q.r0,r1:q.r1.filter(z=>(z&caps)!==caps)}:{h:q.h,r0:q.r0.filter(z=>(z&caps)!==caps),r1:q.r1};}
 function Hc(q){const open=[];for(let c=0;c<W;c++)if(q.h[c]<H)open.push(c);if(open.length!==1)return q;const col=open[0],rank=sf(q.h).rank;function keep(mask,owner){for(const z of bits(mask))if(z.col===col){const depth=z.row-q.h[col]+1;if(depth>0&&((rank+depth-1)&1)!==owner)return false;}return true;}return{h:q.h,r0:q.r0.filter(z=>keep(z,0)),r1:q.r1.filter(z=>keep(z,1))};}
 function RFG(q){return G(F(R(q)));}
 function oldNormal(q){return C(F(R(M(q))));}

 function elemKey(h){return sf(h).elem;}
 const candidateDefs=[
   ['P',q=>''+sf(q.h).p],['X',q=>''+sf(q.h).xor],['XP',q=>sf(q.h).xor+'|'+sf(q.h).p],
   ['RANK_MOD3',q=>''+(sf(q.h).rank%3)],['RANK_MOD4',q=>''+(sf(q.h).rank%4)],['RANK',q=>''+sf(q.h).rank],
   ['SORTED_HEIGHTS',q=>sf(q.h).sorted],['ELEMENTARY',q=>elemKey(q.h)],['POWER12',q=>sf(q.h).rank+'|'+sf(q.h).sq],
   ['XOR_SQUARE',q=>''+sf(q.h).xorSq],['XOR_ONEHOT',q=>''+sf(q.h).xor1h],['X_RANK',q=>sf(q.h).xor+'|'+sf(q.h).rank],
   ['HEIGHT_PARITY_MASK',q=>''+sf(q.h).oddMask],['OPEN_MASK',q=>''+sf(q.h).openMask],['XP_OPEN',q=>sf(q.h).xor+'|'+sf(q.h).p+'|'+sf(q.h).openMask],
   ['FULL_SUPPORT',q=>q.h.join(',')],
   ['RES_X',q=>sf(q.h).xor+'|'+q.r0.join('.')+'|'+q.r1.join('.')],
   ['RES_X_RANK',q=>sf(q.h).xor+'|'+sf(q.h).rank+'|'+q.r0.join('.')+'|'+q.r1.join('.')],
   ['RES_SORTED',q=>sf(q.h).sorted+'|'+q.r0.join('.')+'|'+q.r1.join('.')],
   ['RES_POWER12',q=>sf(q.h).rank+'|'+sf(q.h).sq+'|'+q.r0.join('.')+'|'+q.r1.join('.')],
   ['RES_PARITYMASK',q=>sf(q.h).oddMask+'|'+q.r0.join('.')+'|'+q.r1.join('.')],
   ['RES_X_OPEN',q=>sf(q.h).xor+'|'+sf(q.h).openMask+'|'+q.r0.join('.')+'|'+q.r1.join('.')],
   ['QO',q=>qkey(q)],['RFG',q=>qkey(RFG(q))],['RFG_XP',q=>qkey(RFG(q))+'|'+sf(q.h).xor+'|'+sf(q.h).p],
 ];
 const candidateMaps=new Map(candidateDefs.map(([id])=>[id,new Map]));
 for(const x of nts){const q=qmap.get(x.key);for(const [id,fn] of candidateDefs)candidateMaps.get(id).set(x.key,fn(q));}

 function evaluate(id){
   const m=candidateMaps.get(id),groups=new Map();for(const x of nts){const k=m.get(x.key);let a=groups.get(k);if(!a){a=[];groups.set(k,a);}a.push(x);}
   let qf=true,closed=true,qa=true,qv=true,ff=null,cf=null,af=null,vf=null;
   for(const [k,a] of groups){
     const f0=future.get(a[0].key),av0=JSON.stringify(actionValue.get(a[0].key)),v0=value.get(a[0].key);
     for(let i=1;i<a.length;i++){const x=a[i];if(qf&&future.get(x.key)!==f0){qf=false;ff={key:k,a:a[0].key,b:x.key,aFuture:f0,bFuture:future.get(x.key)};}const av=JSON.stringify(actionValue.get(x.key));if(qa&&av!==av0){qa=false;af={key:k,a:a[0].key,b:x.key};}if(qv&&value.get(x.key)!==v0){qv=false;vf={key:k,a:a[0].key,b:x.key,aValue:v0,bValue:value.get(x.key)};}}
     for(let col=0;col<W;col++){let o0=null;for(const x of a){const e=x.ch.find(z=>z.c===col);let o='I';if(e){const y=nodes.get(e.key);o=y.t?'T:'+(y.w===0?'P0':y.w===1?'P1':'D'):'N:'+m.get(y.key);}if(o0===null)o0=o;else if(closed&&o!==o0){closed=false;cf={key:k,col,a:a[0].key,b:x.key,aOutcome:o0,bOutcome:o};break;}}}
   }
   return{id,classes:groups.size,futureSufficient:qf,recursiveClosure:closed,actionValueSufficient:qa,scalarValueSufficient:qv,firstFutureFailure:ff,firstClosureFailure:cf,firstActionFailure:af,firstValueFailure:vf};
 }
 const candidateResults=candidateDefs.map(([id])=>evaluate(id));
 const byId=new Map(candidateResults.map(x=>[x.id,x]));
 assert.equal(byId.get('XP').classes,byId.get('X').classes);
 assert.equal(byId.get('XP').futureSufficient,byId.get('X').futureSufficient);
 assert.equal(byId.get('ELEMENTARY').classes,byId.get('SORTED_HEIGHTS').classes);
 assert.equal(byId.get('RFG_XP').classes,byId.get('RFG').classes);

 function kept(q2,owner,mask){return (owner?q2.r1:q2.r0).includes(mask);}
 const opFns={M,R,F,G,H:Hc};
 const descFns={
   P:(q,o,m)=>o+'|'+m+'|'+sf(q.h).p,
   X:(q,o,m)=>o+'|'+m+'|'+sf(q.h).xor,
   XP:(q,o,m)=>o+'|'+m+'|'+sf(q.h).xor+'|'+sf(q.h).p,
   RANK:(q,o,m)=>o+'|'+m+'|'+sf(q.h).rank,
   X_RANK:(q,o,m)=>o+'|'+m+'|'+sf(q.h).xor+'|'+sf(q.h).rank,
   SORTED:(q,o,m)=>o+'|'+m+'|'+sf(q.h).sorted,
   OPEN_P:(q,o,m)=>o+'|'+m+'|'+sf(q.h).openMask+'|'+sf(q.h).p,
   FULL_SUPPORT:(q,o,m)=>o+'|'+m+'|'+q.h.join(','),
   FULL_Q:(q,o,m)=>o+'|'+m+'|'+qkey(q),
 };
 const rulePredictability={};
 for(const [op,fn] of Object.entries(opFns)){
   const desc={};for(const name of Object.keys(descFns))desc[name]=new Map();
   for(const x of nts){const q=qmap.get(x.key),z=fn(q);for(const [owner,rs] of [[0,q.r0],[1,q.r1]])for(const mask of rs){const del=!kept(z,owner,mask);for(const [name,df] of Object.entries(descFns)){const k=df(q,owner,mask);let row=desc[name].get(k);if(!row){row={d:new Set(),examples:[]};desc[name].set(k,row);}row.d.add(del?1:0);if(row.examples.length<2)row.examples.push({state:x.key,support:q.h,owner,mask,deleted:del});}}}
   rulePredictability[op]={};
   for(const [name,m] of Object.entries(desc)){let mixed=0,examples=[];for(const [k,row] of m)if(row.d.size>1){mixed++;if(examples.length<5)examples.push({signature:k,rows:row.examples});}rulePredictability[op][name]={signatures:m.size,mixed,determinesDecision:mixed===0,examples};}
 }

 let currentMoverChecks=0,finalMoverChecks=0,xUpdateChecks=0,hSimplificationChecks=0;
 for(const x of nts){
   const f=sf(x.h);currentMoverChecks++;assert.equal(x.r&1,f.p);assert.equal(f.p,f.xor&1);
   const rem=N-x.r,last=f.p^((rem-1)&1);finalMoverChecks++;assert.equal(last,(N-1)&1);
   for(const e of x.ch){const y=nodes.get(e.key),hf=x.h[e.c],expected=f.xor^hf^(hf+1);xUpdateChecks++;assert.equal(sf(y.h).xor,expected);assert.equal(sf(y.h).p,f.p^1);}
   const open=[];for(let c=0;c<W;c++)if(x.h[c]<H)open.push(c);
   if(open.length===1){const c=open[0];for(let row=x.h[c];row<H;row++){const depth=row-x.h[c]+1,a=(x.r+depth-1)&1,b=(((W-1)*H+row)&1);hSimplificationChecks++;assert.equal(a,b);}}
 }
 const derivations={
   p_equals_X_lsb:{checks:currentMoverChecks,result:true,meaning:'stone-count parity is exactly the least-significant bit of height XOR'},
   current_mover:{checks:currentMoverChecks,result:true,formula:'mover=p=X&1'},
   final_board_mover:{checks:finalMoverChecks,result:true,formula:'f=(W*H-1)&1',note:'p cancels; X is unnecessary'},
   X_recursive_update:{checks:xUpdateChecks,result:true,formula:"X'=X xor h_c xor (h_c+1); p'=p xor 1",note:'requires moved-column current height h_c; X,p alone are not a closed action state'},
   sole_open_column_owner:{checks:hSimplificationChecks,result:true,formula:'owner(row)=((W-1)*H+row)&1',note:'rank parity p cancels exactly; X is unnecessary once the one-open-column condition and row are known'}
 };

 function perms(n){const o=[],a=[...Array(n).keys()];function f(i){if(i===n){o.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return o;}const P=perms(W);
 function pm(m,p){let o=0;for(const z of bits(m))o|=1<<(z.row*W+p[z.col]);return o>>>0;}
 function pq(q,p){const h=Array(W);for(let c=0;c<W;c++)h[p[c]]=q.h[c];return{h,r0:q.r0.map(z=>pm(z,p)).sort((a,b)=>a-b),r1:q.r1.map(z=>pm(z,p)).sort((a,b)=>a-b)};}
 function orbitKey(q){let best=null;for(const p of P){const k=qkey(pq(q,p));if(best===null||k<best)best=k;}return best;}
 const sigmaRFG=new Set(),sigmaRFGxp=new Set();let sigmaInvariantChecks=0;
 for(const x of nts){const q=RFG(qmap.get(x.key)),f=sf(q.h),ok=orbitKey(q);sigmaRFG.add(ok);sigmaRFGxp.add(ok+'|'+f.xor+'|'+f.p);for(const p of P){const pf=sf(pq(q,p).h);sigmaInvariantChecks++;assert.equal(pf.xor,f.xor);assert.equal(pf.p,f.p);}}
 assert.equal(sigmaRFG.size,sigmaRFGxp.size);
 const sigma={
   permutations:P.length,invarianceChecks:sigmaInvariantChecks,
   xorParityInvariantUnderColumnPermutation:true,
   qSigmaRFGClasses:sigmaRFG.size,qSigmaRFGPlusXPClasses:sigmaRFGxp.size,
   XPAddsInformationToCurrent_qSigmaRFG:sigmaRFGxp.size!==sigmaRFG.size,
   canonicalRepresentativePower:'NONE_AS_TIE_BREAKER__X_AND_P_ARE_CONSTANT_ON_EVERY_COLUMN_ORBIT'
 };

 let oldAmbiguity=null;
 if(W===4&&H===4&&(K===4||K===3)){
   const nmap=new Map(nts.map(x=>[x.key,qkey(oldNormal(qmap.get(x.key)))])),groups=new Map();
   for(const x of nts){const k=nmap.get(x.key);let a=groups.get(k);if(!a){a=[];groups.set(k,a);}a.push(x);}
   let failures=0,futureOnly=0,supportConstant=0,parentXPConstant=0,childXPConstant=0;const examples=[];
   for(const [pk,parents] of groups){const legal=parents[0].ch.map(z=>z.c);for(const col of legal){const outs=new Map(),fs=new Set(),ps=new Set(),pxp=new Set(),cxp=new Set();for(const p of parents){ps.add(p.h.join(','));const pf=sf(p.h);pxp.add(pf.xor+'|'+pf.p);const e=p.ch.find(z=>z.c===col),y=nodes.get(e.key),out=y.t?'T:'+(y.w===0?'P0':y.w===1?'P1':'D'):'N:'+nmap.get(y.key);outs.set(out,1);fs.add(future.get(y.key));const cf=sf(y.h);cxp.add(cf.xor+'|'+cf.p);}if(outs.size>1){failures++;if(fs.size===1)futureOnly++;if(ps.size===1)supportConstant++;if(pxp.size===1)parentXPConstant++;if(cxp.size===1)childXPConstant++;if(examples.length<8)examples.push({parentNormal:pk,col,parentSupport:[...ps],parentXP:[...pxp],childXP:[...cxp],outcomes:[...outs.keys()],futureClasses:[...fs]});}}}
   oldAmbiguity={failures,futureOnly,supportConstant,parentXPConstant,childXPConstant,examples,allSupportOnlyCoordinatesConstant:supportConstant===failures};
 }

 const summary={
   label,role,width:W,height:H,k:K,physicalStates:nodes.size,nonterminalStates:nts.length,futureClasses:nextFuture,
   candidateResults,rulePredictability,derivations,sigma,oldAmbiguity,
   valueSetsByXP:(()=>{const m=new Map();for(const x of nts){const f=sf(x.h),k=f.xor+'|'+f.p;let s=m.get(k);if(!s){s=new Set;m.set(k,s);}s.add(value.get(x.key));}return [...m.entries()].map(([k,s])=>({key:k,values:[...s].sort()}));})()
 };
 return summary;
}

const cases=[];for(const c of CASES){console.log('xor-parity',c.label);cases.push(analyze(c));}
const ambiguity=cases.filter(x=>x.oldAmbiguity).reduce((a,x)=>({failures:a.failures+x.oldAmbiguity.failures,futureOnly:a.futureOnly+x.oldAmbiguity.futureOnly,supportConstant:a.supportConstant+x.oldAmbiguity.supportConstant,parentXPConstant:a.parentXPConstant+x.oldAmbiguity.parentXPConstant,childXPConstant:a.childXPConstant+x.oldAmbiguity.childXPConstant}),{failures:0,futureOnly:0,supportConstant:0,parentXPConstant:0,childXPConstant:0});
assert.equal(ambiguity.failures,836);
assert.equal(ambiguity.futureOnly,836);
assert.equal(ambiguity.supportConstant,836);
assert.equal(ambiguity.parentXPConstant,836);
assert.equal(ambiguity.childXPConstant,836);

const out={
 schema:'connect4.isomax.xor_parity_lens.v1',date_author_local:'2026-09-29',
 candidate:{X:'xor column heights',p:'stone-count parity'},
 exact_global_algebra:{
   p_redundant_given_X:true,
   identity:'p = X & 1',
   proof:'least-significant bit of XOR is XOR of column-height parity bits, equal to parity of their sum'
 },
 cases,
 ambiguity836:{
   ...ambiguity,
   conclusion:'All 836 same-future representation splits occur at fixed full support before and after the common action; therefore no support-only coordinate, including X,p or any symmetric function of support, can resolve them.'
 },
 interpretationGuard:'Complete bounded exact evidence only. Structural candidate keys are frozen independently of future/value labels. No standard-7x6 theorem or solver adoption follows automatically.'
};
fs.writeFileSync(new URL('./XOR_PARITY_LENS_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'XOR_PARITY_LENS_COMPLETE',global:out.exact_global_algebra,ambiguity:out.ambiguity836,cases:cases.map(c=>({label:c.label,sigma:c.sigma,derivations:c.derivations,candidates:c.candidateResults.map(x=>({id:x.id,classes:x.classes,QF:x.futureSufficient,closed:x.recursiveClosure,QA:x.actionValueSufficient,QV:x.scalarValueSufficient})),ruleMixed:Object.fromEntries(Object.entries(c.rulePredictability).map(([op,d])=>[op,{XP:d.XP.mixed,X_RANK:d.X_RANK.mixed,SORTED:d.SORTED.mixed,FULL_SUPPORT:d.FULL_SUPPORT.mixed}]))}))},null,2));