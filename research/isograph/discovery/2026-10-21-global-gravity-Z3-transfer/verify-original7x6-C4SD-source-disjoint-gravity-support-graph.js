"use strict";
/* C4SD: rank-local original7x6 source-minimum WSL and typed gravity support dependency.
 * Frozen before verification in docs/research/2026-10-23-frozen-C4SD-source-disjoint-gravity-support-obligation-chain.md.
 * No future game state-space/strategic WLD queries. */
const chk=(v,m)=>{if(!v)throw Error('C4SD '+m);};
const DIR=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]],lines=[];
const site=(c,r)=>c+','+r;
for(const [dir,dc,dr] of DIR)for(let c=1;c<=7;c++)for(let r=1;r<=6;r++){
 const cells=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
 if(cells.every(([x,y])=>x>=1&&x<=7&&y>=1&&y<=6))lines.push({dir,cells,keys:cells.map(([x,y])=>site(x,y))});
}
chk(lines.length===69,'69 original shared physical four-windows');
function board(word){
 const q={h:Array(7).fill(0),own:[new Set(),new Set()],trace:[]};
 for(let i=0;i<word.length;i++){
  const c=Number(word[i]),r=q.h[c-1]+1,p=i%2;
  chk(c>=1&&c<=7&&r<=6,'legal column gravity');
  q.h[c-1]=r;q.own[p].add(site(c,r));q.trace.push({p,c,r});
  const K=lines.filter(x=>x.keys.every(k=>q.own[p].has(k)));
  let ray=false;
  for(const [_,dc,dr] of DIR){
   let count=1;
   for(const sign of [-1,1])for(let j=1;j<=3;j++){
    if(q.own[p].has(site(c+sign*j*dc,r+sign*j*dr)))count++;
    else break;
   }
   if(count>=4)ray=true;
  }
  chk((K.length>0)===ray,'original K4/ray agreement for each physical source move');
  chk(!ray,'all source prefixes firstwinnerfree');
 }
 return q;
}
function WSL(q,p){
 const unique=new Map();
 for(const l of lines){
  if(l.keys.some(x=>q.own[1-p].has(x)))continue;
  const G=l.keys.filter(x=>!q.own[p].has(x)).sort();
  if(!G.length)continue;
  const k=G.join('|');
  if(!unique.has(k))unique.set(k,{id:k,mask:G,lines:[]});
  unique.get(k).lines.push({dir:l.dir,cells:l.cells});
 }
 const all=[...unique.values()];
 return all.filter(g=>!all.some(f=>f.mask.length<g.mask.length&&f.mask.every(x=>g.mask.includes(x))));
}
const atoms={
 H2:[[5,2],[6,2]],
 H4:[[3,4],[5,4]],
 R:[[3,5],[4,6]]
};
const atomKeys=Object.fromEntries(Object.entries(atoms).map(([n,c])=>[n,c.map(x=>site(...x)).sort().join('|')]));
const results=[];
for(const b of [2,4,6,7]){
 const word='4214254422333'+String(b)+'111',q=board(word),m=WSL(q,1);
 chk(q.h[2]===3&&q.h[4]===1,'common column c3=3 c5=1 support signatures');
 const src={};
 for(const [name,id] of Object.entries(atomKeys)){
  const v=m.find(g=>g.id===id);
  chk(v,'all three common original normalized P1 WSL source obligations '+name);
  src[name]=v.lines.map(o=>({dir:o.dir,cells:o.cells}));
 }
 chk(src.H2.some(x=>x.dir==='H')&&src.H4.some(x=>x.dir==='H')&&src.R.some(x=>x.dir==='R'),'three physical original K4 provenances H2/H4/R');
 const intersections=[],edges=[];
 for(const [from,fromG] of Object.entries(atoms))for(const [to,toG] of Object.entries(atoms)){
  if(from===to)continue;
  const overlap=fromG.filter(u=>toG.some(v=>u[0]===v[0]&&u[1]===v[1]));
  chk(overlap.length===0,'source residual target masks pairwise physically disjoint');
  intersections.push({from,to,count:overlap.length});
  for(const [col,lower] of fromG)for(const [col2,upper] of toG){
   if(col!==col2||q.h[col-1]>=lower||lower>=upper)continue;
   const intervening=Array.from({length:upper-lower-1},(_,i)=>[col,lower+1+i]);
   const corridor=[...intervening,[col,upper]];
   chk(corridor.every(([x,y])=>!q.own[0].has(site(x,y))&&!q.own[1].has(site(x,y))),'literal empty original support corridor');
   edges.push({from,to,lower:[col,lower],upper:[col2,upper],intermediate:intervening});
  }
 }
 chk(edges.length===2&&edges.some(e=>e.from==='H2'&&e.to==='H4'&&e.lower.join(',')==='5,2'&&e.upper.join(',')==='5,4')&&edges.some(e=>e.from==='H4'&&e.to==='R'&&e.lower.join(',')==='3,4'&&e.upper.join(',')==='3,5'),'strict chain and no reverse/direct other edges');
 // P0 currently owns original H3 c2,c3,c4, with missing c5r3 directly above x=c5r2.
 const p0=WSL(q,0),ready=p0.find(g=>g.mask.length===1&&g.mask[0]===site(5,3));
 chk(ready&&ready.lines.some(x=>x.dir==='H')&&q.h[4]===1,'common P0 H row3 trap in intermediate c5r3');
 results.push({P1firstB:b,word,rank:q.trace.length,heights:q.h,
  namedP1SourceProvenance:src,missingSourcePairIntersections:intersections,
  typedGravitySupportEdges:edges,
  edgeCount:edges.length,commonP0ReadyH3:true});
}
const q3=board('42142544223333'+'111');
const three=WSL(q3,1);
chk(!three.find(g=>g.id===atomKeys.H4)&&three.some(g=>g.id===site(5,4)),'exception b3 contracts original H4 into singleton');
const report={
 schema:'C4SD_original7x6_source_disjoint_gravity_support_chain_0_1',
 status:'EXACT_GUARDED_SOURCE_SUPPORT_GRAPH_NO_GAME_WLD',
 originalWinlines:Object.fromEntries(DIR.map(([dir])=>[dir,lines.filter(x=>x.dir===dir).length])),
 commonThreeRequirementIdentities:atoms,
 family:results,exceptionB3:{q3rank:q3.trace.length,h:q3.h,H4ReducedToSingleton:'c5r4'},
 fullFutureGameStateExploration:false,gameValueQueries:0,policyWinnerProved:false,
 typedWarning:'support edge means prerequisite occupancy by EITHER OWNER, never P1 must own the lower source cell; disjoint R_p masks do not imply causal independence'};
console.log(JSON.stringify(report,null,2));