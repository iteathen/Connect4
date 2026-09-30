import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const I=JSON.parse(fs.readFileSync(new URL('./AUDIT_INPUT_0_1.json',import.meta.url),'utf8')),W=5,H=4,N=20;
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function parse(k){const [h,a,b]=k.slice(2).split('|');return {heights:h.split(',').map(Number),r0:a?a.split('.').filter(Boolean).map(Number):[],r1:b?b.split('.').filter(Boolean).map(Number):[]};}
const rank=s=>s.heights.reduce((a,b)=>a+b,0),pc=m=>{let n=0;for(let v=m>>>0;v;v=(v&(v-1))>>>0)n++;return n;};
function bits(m){const a=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const q=31-Math.clz32(v&-v);a.push({col:q%W,row:Math.floor(q/W)});}return a;}
function norm(xs){xs=[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);return xs.filter((a,i)=>!xs.some((b,j)=>i!==j&&a!==b&&((a&b)>>>0)===(b>>>0)));}
function key(s){return s.heights.join(',')+'|'+[...s.r0].sort((a,b)=>a-b).join('.')+'|'+[...s.r1].sort((a,b)=>a-b).join('.');}
function perms(n){const o=[],a=[...Array(n).keys()];function f(i){if(i===n){o.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return o;}const P=perms(W);
function pm(m,p){let z=0;for(const c of bits(m))z|=1<<(c.row*W+p[c.col]);return z>>>0;}
function ps(s,p){const h=[];for(let c=0;c<W;c++)h[p[c]]=s.heights[c];return {heights:h,r0:s.r0.map(x=>pm(x,p)).sort((a,b)=>a-b),r1:s.r1.map(x=>pm(x,p)).sort((a,b)=>a-b)};}
function orbit(a,b){const kb=key(b);return P.find(p=>key(ps(a,p))===kb)??null;}
function canon(s){let b=null,pset=[];for(const p of P){const k=key(ps(s,p));if(b===null||k<b){b=k;pset=[p];}else if(k===b)pset.push(p);}return {key:b,ps:pset};}
function relok(m,h,p){const r=rank({heights:h}),rem=N-r,mover=r&1,rs=bits(m).map(x=>x.row-h[x.col]+1).sort((a,b)=>a-b);let slot=p===mover?1:2;for(const q of rs){while(slot<q)slot+=2;if(slot>rem)return false;slot+=2;}return true;}
function frontier(s){const r=rank(s),m=r&1,own=m?s.r1:s.r0;let F=0;for(let c=0;c<W;c++)if(s.heights[c]<H){const b=1<<(s.heights[c]*W+c);if(!own.some(x=>x===b))F|=b;}return m?{...s,r0:s.r0.filter(x=>(x&F)!==F)}:{...s,r1:s.r1.filter(x=>(x&F)!==F)};}
function cap(s){const r=rank(s),rem=N-r;if(rem<=0||(rem&1))return s;let C=0;for(let c=0;c<W;c++)if(s.heights[c]<H)C|=1<<((H-1)*W+c);return r&1?{...s,r1:s.r1.filter(x=>(x&C)!==C)}:{...s,r0:s.r0.filter(x=>(x&C)!==C)};}
function release(s){return {...s,r0:s.r0.filter(x=>relok(x,s.heights,0)),r1:s.r1.filter(x=>relok(x,s.heights,1))};}
function move(s,c){assert.ok(s.heights[c]<H);const r=rank(s),m=r&1,b=1<<(s.heights[c]*W+c),own=m?s.r1:s.r0,opp=m?s.r0:s.r1,nx=[];let win=false;for(const q of own){if(q&b){const z=(q&~b)>>>0;if(!z){win=true;break;}nx.push(z);}else nx.push(q);}if(win)return {terminal:true,kind:m?'P1':'P0'};const h=[...s.heights];h[c]++;if(r+1===N)return {terminal:true,kind:'D'};const on=norm(nx),op=norm(opp.filter(q=>(q&b)===0));let z=m?{heights:h,r0:op,r1:on}:{heights:h,r0:on,r1:op};z=frontier(z);z=cap(z);z=release(z);return {terminal:false,state:z};}
function replay(s,actions){const states=[key(s)];for(const c of actions){const z=move(s,c);assert.equal(z.terminal,false,'witness route unexpectedly terminal');s=z.state;states.push(key(s));}return {state:s,states};}
function future(s){const M=new Map;function f(q){const k=key(q);if(M.has(k))return M.get(k);const a=[];for(let c=0;c<W;c++){if(q.heights[c]>=H){a.push('I');continue;}const z=move(q,c);a.push(z.terminal?'T'+z.kind:f(z.state));}const o='N'+rank(q)+'['+a.join('|')+']';M.set(k,o);return o;}return f(s);}

const rows=[];
for(const startSheet of [0,1]){
  const r0=I.routeRows.find(x=>x.pathParity===0&&x.startSheet===startSheet),
    r1=I.routeRows.find(x=>x.pathParity===1&&x.startSheet===startSheet);
  assert.ok(r0&&r1);
  const source0=parse(r0.steps[0].parentStateKey),source1=parse(r1.steps[0].parentStateKey);
  assert.equal(key(source0),key(source1),'both routes must start from the same exact sheet state');
  const a=r0.sourceActionSequences[0].split(',').map(Number),
    b=r1.sourceActionSequences[0].split(',').map(Number),
    A=replay(source0,a),B=replay(source0,b),
    p=orbit(A.state,B.state),ca=canon(A.state),cb=canon(B.state),
    fa=future(A.state),fb=future(B.state);
  rows.push({
    startSheet,source:'Q:'+key(source0),routeAActions:a,routeBActions:b,
    routeAStates:A.states.map(x=>'Q:'+x),routeBStates:B.states.map(x=>'Q:'+x),
    rawEndpointExactEqual:key(A.state)===key(B.state),
    rawEndpointOrbitEqual:!!p,
    orbitTransporter:p,
    rawEndpointLiteralFutureEqual:fa===fb,
    rawEndpointLiteralFutureHashes:[sha(fa),sha(fb)],
    canonicalEndpoints:['Q:'+ca.key,'Q:'+cb.key],
    canonicalEndpointEqual:ca.key===cb.key,
    expectedStoredCanonicalEndpoints:[r0.finalStateKey,r1.finalStateKey],
    routeACanonicalMatchesStored:'Q:'+ca.key===r0.finalStateKey,
    routeBCanonicalMatchesStored:'Q:'+cb.key===r1.finalStateKey,
    canonicalizerCounts:[ca.ps.length,cb.ps.length]
  });
}
const result={
 schema:'connect4.isomax.foundational_prior_audit.fixed_frame_routes.v1',
 date_author_local:'2026-09-29',
 rows,
 findings:{
   exactRawReconvergenceForBothSheets:rows.every(x=>x.rawEndpointExactEqual),
   orbitRawReconvergenceForBothSheets:rows.every(x=>x.rawEndpointOrbitEqual),
   literalFutureReconvergenceForBothSheets:rows.every(x=>x.rawEndpointLiteralFutureEqual),
   canonicalizationReproducesStoredEndpoints:rows.every(x=>x.routeACanonicalMatchesStored&&x.routeBCanonicalMatchesStored),
   interpretation:'source-frame routes are compared before per-step canonicalization; this separates physical/fixed-coordinate path behavior from canonical-frame sheet bookkeeping'
 }
};
fs.writeFileSync(new URL('./FIXED_FRAME_ROUTE_AUDIT_0_1.json',import.meta.url),JSON.stringify(result,null,2)+'\\n');
console.log(JSON.stringify({status:'FIXED_FRAME_ROUTE_AUDIT_COMPLETE',findings:result.findings,rows:rows.map(x=>({startSheet:x.startSheet,rawExact:x.rawEndpointExactEqual,rawOrbit:x.rawEndpointOrbitEqual,literalFuture:x.rawEndpointLiteralFutureEqual,canon:x.canonicalEndpoints,expected:x.expectedStoredCanonicalEndpoints}))},null,2));