/**
 * Connect4 exact local scope audit, not a 7x6 WDL solve.
 * Historical EWR-064/070 descriptor fragments are manually transcribed from
 * original experimental branch f6bfce75ebf6aeafef08b9102ce20e0bfade2bdb.
 * Source: OOO_PRESENCE_FIBER_GEOMETRY_0_1.json descriptor-ID example catalog;
 * OOO_PAIR_DELTA_COORDINATE_LADDER_0_1.json matched dependency rows.
 * The OLD control is finite 4x5-k4 T2-O ONLY; no oracle or solved root.
 * Run: node verify-subfive-k4-and-old-ooo-circulation-scope.mjs
 */
function fail(msg) { throw Error("SCOPE AUDIT: "+msg); }
function check(x,msg) { if(!x)fail(msg); }
const geometries=[
 [4,5,4, {H:5,V:8,R:2,F:2,pairs:0,adjacent:0,maxH:1}],
 [5,4,4, {H:8,V:5,R:2,F:2,pairs:4,adjacent:4,maxH:2}],
 [5,5,4, {H:10,V:10,R:4,F:4,pairs:5,adjacent:5,maxH:2}],
 [7,6,4, {H:24,V:21,R:12,F:12,pairs:36,adjacent:18,maxH:4}],
 [6,3,4, {H:9,V:0,R:0,F:0,pairs:9,adjacent:6,maxH:3}],
 [6,3,3, {H:12,V:6,R:4,F:4,pairs:15,adjacent:9,maxH:3}]
];
function geometry(W,H,K) {
 const ls=[],dirs=[[1,0,'H'],[0,1,'V'],[1,1,'R'],[1,-1,'F']];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const[dx,dy,d]of dirs) {
  const cells=[];for(let i=0;i<K;i++){const X=x+i*dx,Y=y+i*dy;if(X<0||X>=W||Y<0||Y>=H){cells.length=0;break;}cells.push(Y*W+X);}
  if(cells.length===K)ls.push({d,x,y,cells});
 }
 const hs=ls.filter(a=>a.d==='H'),counts=Object.fromEntries(dirs.map(x=>[x[2],ls.filter(l=>l.d===x[2]).length]));
 let pairs=0,adjacent=0,maxH=0;
 for(let a=0;a<hs.length;a++)for(let b=a+1;b<hs.length;b++) {
  if(hs[a].cells.some(q=>hs[b].cells.includes(q))) {
   pairs++;if(hs[a].y===hs[b].y&&Math.abs(hs[a].x-hs[b].x)===1)adjacent++;
  }
 }
 for(let q=0;q<W*H;q++) maxH=Math.max(maxH,hs.filter(l=>l.cells.includes(q)).length);
 return {board:W+'x'+H+'-k'+K,...counts,total:ls.length,horizontalOverlapPairs:pairs,horizontalAdjacentOverlapPairs:adjacent,maxHorizontalWindowsThroughCell:maxH};
}
const geometryReport=[];
for(const [W,H,K,expected]of geometries) {
 const g=geometry(W,H,K);
 for(const [d,value]of Object.entries(expected)) {
  const actual=d==='pairs'?g.horizontalOverlapPairs:d==='adjacent'?g.horizontalAdjacentOverlapPairs:d==='maxH'?g.maxHorizontalWindowsThroughCell:g[d];
  check(actual===value,g.board+' '+d+': '+actual+' != '+value);
 }
 check(g.H===H*Math.max(0,W-K+1),'horizontal formula');
 check(g.V===W*Math.max(0,H-K+1),'vertical formula');
 check(g.R===Math.max(0,W-K+1)*Math.max(0,H-K+1),'rising formula');
 check(g.F===g.R,'falling formula');
 geometryReport.push(g);
}
// Four original 'tetrahedron faces' per GF(2)^2 nonzero dependency;
// IDs and code recorded by frozen EW-RS-070; descriptor identities retained
// in EW-RS-064 sampled presence-fiber result with same ID assignment code.
const descriptors=new Map([
 [5,'w1|cap=0|r0=|r1='],
 [10,'w1|cap=1|r0=|r1='],
 [16,'w1|cap=1|r0=1:0|r1=2:0'],
 [42,'w1|cap=1|r0=1:0|r1=0:0,1:0;2:0'],
 [49,'w1|cap=1|r0=|r1=1:0']
]);
function vectorTokens(s) {
 const [width,cap,owner0,owner1]=s.split('|');
 check(/^w[0-9]+$/.test(width)&&cap.startsWith('cap=')&&owner0.startsWith('r0=')&&owner1.startsWith('r1='),'old descriptor grammar');
 const m=new Map([['W',Number(width.slice(1))]]);
 cap.slice(4).split('.').map(Number).forEach((v,i)=>{check(v===0||v===1,'binary capacity');if(v)m.set('C:'+i,v);});
 for(const [oi,raw]of [[0,owner0.slice(3)],[1,owner1.slice(3)]])for(const mask of raw.split(';'))for(const cell of mask.split(','))if(cell) {
  const [dt,role]=cell.split(':').map(Number);
  check(Number.isInteger(dt)&&Number.isInteger(role)&&dt>=0,'depth:role');
  const key='D'+oi+':'+dt;m.set(key,(m.get(key)||0)+1);
 }
 return m;
}
const V=new Map([...descriptors].map(([id,s])=>[id,{s,m:vectorTokens(s)}]));
function ordered(a,b) {return a.s<=b.s?[a,b]:[b,a];}
function pairSign(ia,ib) {
 const [a,b]=ordered(V.get(ia),V.get(ib));
 const keys=[...new Set([...a.m.keys(),...b.m.keys()])].sort();
 const z=keys.map(k=>[k,(b.m.get(k)||0)-(a.m.get(k)||0)]).filter(([k,v])=>v);
 return z.length?z.map(([k,v])=>k+':'+(v>0?'+':'-')).join(','):'0';
}
const sgn=x=>Number(x>0)-Number(x<0);
function keysForTriangle(ids) {
 const sorted=ids.map(i=>V.get(i)).sort((a,b)=>a.s<b.s?-1:a.s>b.s?1:0);
 const keys=[...new Set(sorted.flatMap(v=>[...v.m.keys()]))].sort();
 const κ=[];
 for(const key of keys) {
  const [A,B,C]=sorted.map(v=>v.m.get(key)||0);
  const sign=sgn(B-A)+sgn(C-B)+sgn(A-C);
  check(sign===sgn((B-A)*(C-A)*(C-B)),'signed-order theorem');
  if(sign)κ.push(key+':'+(sign>0?'+':'-'));
 }
 const signKey=[pairSign(ids[0],ids[1]),pairSign(ids[0],ids[2]),pairSign(ids[1],ids[2])].sort().join('|||');
 return {kappa:κ.join(',')||'ZERO',signKey};
}
const oldDependencyCases=[
 {index:91,source:'5:O,10:O,16:O,49:O',code:2,
  triangles:[[5,10,16],[5,10,49],[5,16,49],[10,16,49]]},
 {index:134,source:'5:O,10:O,42:O,49:O',code:2,
  triangles:[[5,10,42],[5,10,49],[5,42,49],[10,42,49]]}
];
const historical=[];
for(const d of oldDependencyCases) {
 const feats=d.triangles.map(keysForTriangle);
 check(feats.every(f=>f.kappa==='ZERO'),'tetrahedron kappa all zero');
 const toggle=new Set();
 for(const f of feats)toggle.has(f.signKey)?toggle.delete(f.signKey):toggle.add(f.signKey);
 check(toggle.size===4,'original SIGN key GF2 parity support four');
 check(d.code===2,'frozen nonzero relative outcome code');
 historical.push({matchedDependencyIndex:d.index,codeFromOldFixture:d.code,
  trianglesChecked:feats.length,nonzeroKappaTriangleCount:0,
  originalSignParitySupport:toggle.size,old4x5Only:true});
}
const report={
 status:'PASS_SCOPED_GEOMETRY_AND_HISTORICAL_DESCRIPTOR_CHECK',
 geometry:geometryReport,
 historicalCarrier:'4x5-k4 EW-RS-070 T2-O, not 7x6',
 historicalSampleDescriptorIDs:[...descriptors.keys()],
 oldDependencyChecks:historical,
 original7x6ScalarFactorization:'NOT_TESTED',
 independentEmptyRootWin:'NOT_PROVED',
 currentGameTheoryAuthority:'UNCHANGED',
 originalGeneratorRerun:'NOT_RUN;_USING_FROZEN_SAMPLED_FIXTURES'
};
if(typeof console!=='undefined') console.log(JSON.stringify(report,null,2));
