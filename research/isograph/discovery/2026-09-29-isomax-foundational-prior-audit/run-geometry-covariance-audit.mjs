import fs from 'node:fs';
import assert from 'node:assert/strict';

const I=JSON.parse(fs.readFileSync(new URL('./AUDIT_INPUT_0_1.json',import.meta.url),'utf8')),W=5,H=4,K=4;
function parse(k){const [h,a,b]=k.slice(2).split('|');return {key:k,heights:h.split(',').map(Number),r0:a?a.split('.').filter(Boolean).map(Number):[],r1:b?b.split('.').filter(Boolean).map(Number):[]};}
function bits(m){const a=[];for(let v=m>>>0;v;v=(v&(v-1))>>>0){const q=31-Math.clz32(v&-v);a.push({col:q%W,row:Math.floor(q/W),bit:q});}return a;}
function mask(xs){let m=0;for(const x of xs)m|=1<<(x.row*W+x.col);return m>>>0;}
function lines(){
 const out=[];
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [fam,dc,dr] of [['H',1,0],['V',0,1],['D',1,1],['D',1,-1]]){
   const ec=c+(K-1)*dc,er=r+(K-1)*dr;if(ec<0||ec>=W||er<0||er>=H)continue;
   const xs=[];for(let i=0;i<K;i++)xs.push({col:c+i*dc,row:r+i*dr});
   out.push({family:fam,mask:mask(xs),cells:xs});
 }
 return [...new Map(out.map(x=>[x.mask,x])).values()];
}
const L=lines(),lineSet=new Set(L.map(x=>x.mask));
function perms(n){const o=[],a=[...Array(n).keys()];function f(i){if(i===n){o.push([...a]);return;}for(let j=i;j<n;j++){[a[i],a[j]]=[a[j],a[i]];f(i+1);[a[i],a[j]]=[a[j],a[i]];}}f(0);return o;}const P=perms(W);
function pm(m,p){let z=0;for(const x of bits(m))z|=1<<(x.row*W+p[x.col]);return z>>>0;}
function preservesLineHypergraph(p){return L.every(x=>lineSet.has(pm(x.mask,p)));}
const physicalAutomorphisms=P.filter(preservesLineHypergraph);
assert.equal(physicalAutomorphisms.length,2);
function pk(p){return p.join(',');}
const physicalSet=new Set(physicalAutomorphisms.map(pk));
const canonicalizers=[];
for(const rr of I.routeRows)for(const st of rr.steps)for(const p of st.canonicalizerPermutations)
 canonicalizers.push({edgeId:st.edgeId,pathParity:rr.pathParity,startSheet:rr.startSheet,p,isPhysicalBoardAutomorphism:physicalSet.has(pk(p))});
const uniqueCanonicalizers=[...new Map(canonicalizers.map(x=>[pk(x.p),x.p])).values()];
const states=new Map;
for(const rr of I.routeRows)for(const st of rr.steps){states.set(st.parentStateKey,parse(st.parentStateKey));states.set(st.childStateKey,parse(st.childStateKey));}
function subsetOfLine(m){return L.some(l=>((m&l.mask)>>>0)===(m>>>0));}
const residualGeometry=[];
for(const s of [...states.values()].sort((a,b)=>a.key.localeCompare(b.key))){
 const rows=[];
 for(const [owner,rs] of [[0,s.r0],[1,s.r1]])for(const m of rs)rows.push({owner,mask:m,cells:bits(m),subsetOfCurrentPhysicalWinningLine:subsetOfLine(m)});
 residualGeometry.push({state:s.key,rows,allResidualsGeometricInDisplayedFrame:rows.every(x=>x.subsetOfCurrentPhysicalWinningLine)});
}
const out={
 schema:'connect4.isomax.foundational_prior_audit.geometry_covariance.v1',
 date_author_local:'2026-09-29',
 board:{width:W,height:H,k:K,winningLines:L.length,winningLineFamilies:Object.fromEntries(['H','V','D'].map(f=>[f,L.filter(x=>x.family===f).length]))},
 columnPermutationAudit:{
   allPermutations:P.length,
   physicalBoardAutomorphisms:physicalAutomorphisms,
   physicalBoardAutomorphismCount:physicalAutomorphisms.length,
   witnessCanonicalizerUses:canonicalizers.length,
   uniqueWitnessCanonicalizers:uniqueCanonicalizers,
   nonPhysicalCanonicalizerUses:canonicalizers.filter(x=>!x.isPhysicalBoardAutomorphism).length,
   examples:canonicalizers
 },
 residualGeometry,
 result:{
   everyWitnessCanonicalizerIsPhysicalBoardSymmetry:canonicalizers.every(x=>x.isPhysicalBoardAutomorphism),
   everyDisplayedResidualIsSubsetOfPhysicalWinningLine:residualGeometry.every(x=>x.allResidualsGeometricInDisplayedFrame),
   strongestStatement:'Arbitrary column canonicalization is an isomorphism of the transported abstract support+residual-hypergraph state only when the residual hyperedges and action transporter are carried with it. It is not, in general, a symmetry of the fixed physical Connect4 board geometry.',
   labelRule:'A canonical-frame column is a local abstract action slot, not a physical/original column label unless an explicit accumulated transporter maps it back.'
 },
 nonclaim:'This does not by itself invalidate action-unlabelled residual-state equivalence; it invalidates reading arbitrary canonical slot labels as fixed physical geometry without transporter metadata.'
};
fs.writeFileSync(new URL('./GEOMETRY_COVARIANCE_AUDIT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'GEOMETRY_COVARIANCE_AUDIT_COMPLETE',columnPermutationAudit:out.columnPermutationAudit,result:out.result},null,2));
