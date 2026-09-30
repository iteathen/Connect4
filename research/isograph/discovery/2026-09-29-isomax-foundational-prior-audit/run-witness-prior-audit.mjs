import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const input=JSON.parse(fs.readFileSync(new URL('./AUDIT_INPUT_0_1.json',import.meta.url),'utf8'));
const W=5,H=4,K=4,N=W*H,hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function parse(key){const [hs,a,b]=key.slice(2).split('|');return {key,heights:hs.split(',').map(Number),r0:a?a.split('.').filter(Boolean).map(Number):[],r1:b?b.split('.').filter(Boolean).map(Number):[]};}
const rank=s=>s.heights.reduce((a,b)=>a+b,0);
function bits(m){const z=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const q=31-Math.clz32(v&-v);z.push({bit:q,col:q%W,row:Math.floor(q/W)});}return z;}
function pc(m){return bits(m).length;}
function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
function perms(n){const o=[],a=[...Array(n).keys()];function f(i){if(i===n){o.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return o;}const P=perms(W);
function invParity(p){let x=0;for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(p[i]>p[j])x^=1;return x;}
function cycParity(p){let c=0,seen=Array(p.length).fill(0);for(let i=0;i<p.length;i++)if(!seen[i]){c++;for(let x=i;!seen[x];x=p[x])seen[x]=1;}return (p.length-c)&1;}
assert.equal(P.length,120);for(const p of P)assert.equal(invParity(p),cycParity(p));
function pmask(m,p){let z=0;for(const x of bits(m))z|=1<<(x.row*W+p[x.col]);return z>>>0;}
function pstate(s,p){const hs=Array(W);for(let c=0;c<W;c++)hs[p[c]]=s.heights[c];return {heights:hs,r0:s.r0.map(m=>pmask(m,p)).sort((a,b)=>a-b),r1:s.r1.map(m=>pmask(m,p)).sort((a,b)=>a-b)};}
function key(s){return s.heights.join(',')+'|'+[...s.r0].sort((a,b)=>a-b).join('.')+'|'+[...s.r1].sort((a,b)=>a-b).join('.');}
function eq(a,b){return key(a)===key(b);}
function canonLex(s){let best=null,ps=[];for(const p of P){const x=pstate(s,p),k=key(x);if(best===null||k<best){best=k;ps=[p];}else if(k===best)ps.push(p);}return {key:best,ps};}
function tuple(s){return [s.heights,[...s.r0].sort((a,b)=>a-b),[...s.r1].sort((a,b)=>a-b)];}
function cmp(a,b){const A=tuple(a),B=tuple(b);for(let k=0;k<3;k++){for(let i=0;i<Math.min(A[k].length,B[k].length);i++)if(A[k][i]!==B[k][i])return A[k][i]-B[k][i];if(A[k].length!==B[k].length)return A[k].length-B[k].length;}return 0;}
function canonNum(s){let b=null;for(const p of P){const x=pstate(s,p);if(b===null||cmp(x,b)<0)b=x;}return key(b);}
function orbit(a,b){return P.some(p=>eq(pstate(a,p),b));}

function counts(h){const r=h.reduce((a,b)=>a+b,0),rem=N-r,m=r&1;return {r,rem,m,p0:m?Math.floor(rem/2):Math.ceil(rem/2),p1:m?Math.ceil(rem/2):Math.floor(rem/2)};}
function releases(m,h){return bits(m).map(x=>x.row-h[x.col]+1).sort((a,b)=>a-b);}
function releaseGreedy(m,h,p){const c=counts(h),rs=releases(m,h);let slot=p===c.m?1:2;for(const q of rs){while(slot<q)slot+=2;if(slot>c.rem)return false;slot+=2;}return true;}
function releaseMatch(m,h,p){const c=counts(h),rs=releases(m,h),slots=[];for(let q=p===c.m?1:2;q<=c.rem;q+=2)slots.push(q);const used=slots.map(()=>0);function f(i){if(i===rs.length)return true;for(let j=0;j<slots.length;j++)if(!used[j]&&slots[j]>=rs[i]){used[j]=1;if(f(i+1))return true;used[j]=0;}return false;}return f(0);}
function frontier(s){const r=rank(s),m=r&1,own=m?s.r1:s.r0;let F=0;for(let c=0;c<W;c++)if(s.heights[c]<H){const b=1<<(s.heights[c]*W+c);if(!own.some(x=>x===b))F|=b;}return m?{...s,r0:s.r0.filter(x=>(x&F)!==F)}:{...s,r1:s.r1.filter(x=>(x&F)!==F)};}
function cap(s){const r=rank(s),rem=N-r;if(rem<=0||(rem&1))return s;let C=0;for(let c=0;c<W;c++)if(s.heights[c]<H)C|=1<<((H-1)*W+c);return r&1?{...s,r1:s.r1.filter(x=>(x&C)!==C)}:{...s,r0:s.r0.filter(x=>(x&C)!==C)};}
function release(s){return {...s,r0:s.r0.filter(x=>releaseGreedy(x,s.heights,0)),r1:s.r1.filter(x=>releaseGreedy(x,s.heights,1))};}
function move(s,c){
  const r=rank(s),m=r&1,b=1<<(s.heights[c]*W+c),own=m?s.r1:s.r0,opp=m?s.r0:s.r1,next=[];
  let win=false;for(const q of own){if(q&b){const z=(q&~b)>>>0;if(!z){win=true;break;}next.push(z);}else next.push(q);}
  if(win)return {terminal:true,kind:m?'P1':'P0'};
  const hs=[...s.heights];hs[c]++;if(r+1===N)return {terminal:true,kind:'D'};
  const on=norm(next),op=norm(opp.filter(q=>(q&b)===0));
  let z=m?{heights:hs,r0:op,r1:on}:{heights:hs,r0:on,r1:op};
  const raw=key(z);z=frontier(z);const f=key(z);z=cap(z);const cp=key(z);z=release(z);
  return {terminal:false,state:z,stages:{raw,frontier:f,cap:cp,release:key(z)}};
}
function cstep(s,c){const z=move(s,c);if(z.terminal)return z;return {...z,canon:canonLex(z.state)};}

function future(s){
  const memo=new Map();
  function f(q){const k=key(q);if(memo.has(k))return memo.get(k);const r=rank(q),lit=[],multi=[],set=[];for(let c=0;c<W;c++){if(q.heights[c]>=H){lit.push('I');continue;}const z=move(q,c);let y;if(z.terminal)y={l:'T'+z.kind,m:'T'+z.kind,s:'T'+z.kind};else y=f(z.state);lit.push(y.l);multi.push(y.m);set.push(y.s);}multi.sort();const o={l:'N'+r+'['+lit.join('|')+']',m:'N'+r+'['+multi.join('|')+']',s:'N'+r+'['+[...new Set(set)].sort().join('|')+']'};memo.set(k,o);return o;}return f(s);
}

const routeStates=new Set;for(const rr of input.routeRows)for(const st of rr.steps){routeStates.add(st.parentStateKey);routeStates.add(st.childStateKey);}
const stateAudit=[...routeStates].sort().map(k=>{const s=parse(k),viol=[];for(const [p,rs] of [[0,s.r0],[1,s.r1]])for(const m of rs)for(const x of bits(m))if(x.row<s.heights[x.col])viol.push({p,m,x});return {key:k,rank:rank(s),mover:rank(s)&1,residuals:s.r0.length+s.r1.length,futureCellViolations:viol,lexCanonical:canonLex(s).key===k.slice(2),numericCanonicalHash:hash(canonNum(s))};});
assert.ok(stateAudit.every(x=>x.futureCellViolations.length===0&&x.lexCanonical));

const closure=[];for(const k of routeStates){const s=parse(k);for(const [p,rs] of [[0,s.r0],[1,s.r1]])for(const m of rs){const a=releaseGreedy(m,s.heights,p),b=releaseMatch(m,s.heights,p);assert.equal(a,b);closure.push({state:k,p,m,releaseDepths:releases(m,s.heights),greedy:a,matching:b});}}

const steps=[];for(const rr of input.routeRows)for(const st of rr.steps){const z=cstep(parse(st.parentStateKey),st.column);assert.ok(!z.terminal);const child='Q:'+z.canon.key,ps=z.canon.ps.map(p=>p.join(',')).sort(),stored=st.canonicalizerPermutations.map(p=>p.join(',')).sort();assert.equal(child,st.childStateKey);assert.deepEqual(ps,stored);const pars=[...new Set(z.canon.ps.map(invParity))].sort();assert.deepEqual(pars,st.canonicalizerParitySet);steps.push({pathParity:rr.pathParity,startSheet:rr.startSheet,edgeId:st.edgeId,from:st.from,to:st.to,column:st.column,delta:st.delta,childMatches:true,canonicalizers:ps,paritySet:pars,stages:z.stages});}

function pair(g){const z=new Set;for(const rr of input.routeRows)for(const s of rr.steps){if(s.from===g)z.add(s.parentStateKey);if(s.to===g)z.add(s.childStateKey);}return [...z].sort();}
const gids=[...new Set(input.routeRows.flatMap(r=>r.steps.flatMap(s=>[s.from,s.to])))].sort((a,b)=>a-b),pairs=Object.fromEntries(gids.map(g=>[g,pair(g)]));
for(const [g,z] of Object.entries(pairs))assert.equal(z.length,2,'group '+g);
const resolution=gids.map(g=>{const [ka,kb]=pairs[g],a=parse(ka),b=parse(kb),fa=future(a),fb=future(b);return {group:g,a:ka,b:kb,exact:eq(a,b),orbit:orbit(a,b),numericCanonicalEqual:canonNum(a)===canonNum(b),literal:fa.l===fb.l,multiset:fa.m===fb.m,set:fa.s===fb.s,hashes:{aLiteral:hash(fa.l),bLiteral:hash(fb.l),aMulti:hash(fa.m),bMulti:hash(fb.m),aSet:hash(fa.s),bSet:hash(fb.s)}};});

const em=new Map;for(const rr of input.routeRows)for(const s of rr.steps){if(!em.has(s.edgeId))em.set(s.edgeId,{id:s.edgeId,from:s.from,to:s.to,stored:s.delta,m:[]});const e=em.get(s.edgeId);if(!e.m.some(x=>x.a===s.parentStateKey&&x.b===s.childStateKey))e.m.push({a:s.parentStateKey,b:s.childStateKey});}
const edges=[];for(const e of em.values()){const src=pairs[e.from],dst=pairs[e.to],M=new Map(e.m.map(x=>[x.a,x.b]));assert.equal(e.m.length,2);const ti=src.map(k=>dst.indexOf(M.get(k)));assert.ok(ti.every(x=>x>=0)&&ti[0]!==ti[1]);edges.push({...e,targetIndices:ti,independent:ti[0]});}
const by=new Map(edges.map(e=>[e.id,e])),A=input.contradiction.witnessEdgeIdsByParity[0][0],B=input.contradiction.witnessEdgeIdsByParity[1][0],xp=(ids,f)=>ids.reduce((q,id)=>q^by.get(id)[f],0),pa=xp(A,'independent'),pb=xp(B,'independent'),sa=xp(A,'stored'),sb=xp(B,'stored');

function compose(a,b){return a.map(x=>b[x]);}function inverse(p){const q=[];for(let i=0;i<p.length;i++)q[p[i]]=i;return q;}
const transports=[];for(const rr of input.routeRows){let hs=[{p:[0,1,2,3,4],a:[]}];for(const st of rr.steps){const nx=new Map;for(const h of hs){const ia=inverse(h.p),act=ia[st.column];for(const p of st.canonicalizerPermutations){const cp=compose(h.p,p),x={p:cp,a:[...h.a,act]};nx.set(cp.join(',')+'|'+x.a.join(','),x);}}hs=[...nx.values()];}const acts=[...new Set(hs.map(x=>x.a.join(',')))].sort(),pars=[...new Set(hs.map(x=>invParity(x.p)))].sort();assert.deepEqual(acts,[...rr.sourceActionSequences].sort());assert.deepEqual(pars,[...rr.totalTransporterParitySet].sort());transports.push({pathParity:rr.pathParity,startSheet:rr.startSheet,actions:acts,totalParitySet:pars});}

const target=resolution.find(x=>x.group===input.contradiction.target);
const labels=[
 {label:'same exact state',status:target.exact?'SUPPORTED':'FALSE'},
 {label:'same column-orbit object',status:target.orbit?'SUPPORTED':'FALSE'},
 {label:'same literal future behavior',status:target.literal?'SUPPORTED':'FALSE'},
 {label:'same action-unlabelled multiset future',status:target.multiset?'SUPPORTED':'FALSE'},
 {label:'same action-unlabelled set future',status:target.set?'SUPPORTED':'FALSE'},
 {label:'reconvergence',status:'RESOLUTION_DEPENDENT',note:'stored same unlabelled base group; exact endpoints are distinct'},
 {label:'sheet',status:'QUOTIENT_RELATIVE',note:'two finer states/classes above one coarse group; numeric 0/1 is gauge'},
 {label:'delta',status:'GAUGE_RELATIVE_EDGE_LABEL',note:'route parity difference is gauge invariant'},
 {label:'canonical transporter',status:steps.some(x=>x.canonicalizers.length>1)?'NONUNIQUE_ON_SOME_STEPS':'UNIQUE_IN_WITNESS'},
 {label:'residual',status:'TRANSPORTED_FUTURE_REQUIREMENT',note:'canonical-frame mask need not be interpreted as a straight physical line without transporter ancestry'},
 {label:'obstructed',status:'COARSE_QUOTIENT_COCYCLE_PROPERTY',note:'not by itself an intrinsic physical/q_o contradiction'}
];
const out={schema:'connect4.isomax.foundational_prior_audit.witness.v1',date_author_local:'2026-09-29',
 geometry:{width:W,height:H,k:K,cells:N,lineCounts:{H:8,V:5,D:4,total:17}},
 stateAudit,closureAudit:{rows:closure,greedyEqualsIndependentMatching:true,semanticLimit:'per-residual turn-slot feasibility, not full-game realizability'},
 transitionReplay:{allSixSheetTransitionsReproduced:true,steps},
 permutationAudit:{count:P.length,inversionParityEqualsCycleParity:true,canonicalizerSetsReproduced:true},
 groupResolution:resolution,
 independentSheetGauge:{gauge:'lex exact-state key',edges,routeA:{ids:A,stored:sa,independent:pa},routeB:{ids:B,stored:sb,independent:pb},storedDifference:sa^sb,independentDifference:pa^pb,gaugeInvariantDifference:(sa^sb)===(pa^pb)},
 transporterAudit:transports,
 endpointIdentity:{group:input.contradiction.target,...target},
 labelAudit:labels,
 disposition:{parityAnomalyReproduced:(pa^pb)===1,exactEndpointReconvergence:target.exact,orbitEndpointReconvergence:target.orbit,literalFutureReconvergence:target.literal,multisetFutureReconvergence:target.multiset,setFutureReconvergence:target.set,status:'WITNESS_LEVEL_COMPLETE__CARRIER_LEVEL_PENDING'}
};
fs.writeFileSync(new URL('./WITNESS_PRIOR_AUDIT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\\n');
console.log(JSON.stringify({status:'FOUNDATIONAL_WITNESS_AUDIT_COMPLETE',endpoint:out.endpointIdentity,parity:out.independentSheetGauge,disposition:out.disposition},null,2));