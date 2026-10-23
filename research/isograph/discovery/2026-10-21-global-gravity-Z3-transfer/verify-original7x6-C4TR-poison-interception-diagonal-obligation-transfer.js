"use strict";
/* C4TR independent finite original7x6 physical source controller.
   No Solved Oracle, no game-value minimax, no future state-tree traversal.
   Frozen protocol docs/research/2026-10-23-frozen-C4TR-poisoned-trap-interception-resource-exchange.md */
const ck=(b,m)=>{if(!b)throw Error('C4TR '+m);};
const W=7,H=6,DIR=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
const L=[];
const key=(c,r)=>c+','+r;
for(const [dir,dx,dy] of DIR)for(let c=1;c<=W;c++)for(let r=1;r<=H;r++){
 const xs=Array.from({length:4},(_,i)=>[c+dx*i,r+dy*i]);
 if(xs.every(([x,y])=>x>=1&&x<=W&&y>=1&&y<=H))
  L.push({dir,cells:xs,keys:xs.map(([x,y])=>key(x,y))});
}
const hist=Object.fromEntries(DIR.map(([d])=>[d,L.filter(x=>x.dir===d).length]));
ck(L.length===69&&JSON.stringify(hist)===JSON.stringify({H:24,V:21,R:12,F:12}),'original69 four-direction physical window inventory');
function fresh(){return{h:Array(W).fill(0),p:[new Set(),new Set()],events:[],terminal:false};}
function copy(q){return{h:q.h.slice(),p:q.p.map(x=>new Set(x)),events:q.events.slice(),terminal:q.terminal};}
function who(q,s){return q.p[0].has(s)?0:q.p[1].has(s)?1:-1;}
function lastRay(q,c,r,p){
 for(const [dir,dx,dy]of DIR){
  let n=1;
  for(const sign of [-1,1])for(let j=1;j<=3;j++){
   if(who(q,key(c+sign*j*dx,r+sign*j*dy))!==p)break;
   n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function put(q,c,p){
 ck(!q.terminal&&p===q.events.length%2,'live legal alternating turn');
 ck(c>=1&&c<=7&&q.h[c-1]<H,'original gravity');
 const r=++q.h[c-1],s=key(c,r);
 q.p[p].add(s);
 const wins=L.filter(x=>x.keys.every(y=>q.p[p].has(y)));
 const ray=lastRay(q,c,r,p);
 ck(Boolean(wins.length)===ray,'independent K4 window versus directional ray');
 const e={player:p,column:c,row:r,firstwin:ray,wins:wins.map(x=>({dir:x.dir,cells:x.cells}))};
 q.events.push(e);
 q.terminal=ray||q.events.length===W*H;
 return e;
}
function fromHistory(word){
 const q=fresh();
 for(let i=0;i<word.length;i++){
  const e=put(q,Number(word[i]),i%2);
  ck(!e.firstwin,'source prefix firstwinnerfree');
 }
 return q;
}
const subset=(a,b)=>a.every(x=>b.includes(x));
function wsl(q,p){
 const unique=new Map();
 for(const line of L){
  if(line.keys.some(s=>q.p[1-p].has(s)))continue;
  const missing=line.keys.filter(s=>!q.p[p].has(s)).sort();
  if(missing.length===0)continue;
  const id=missing.join('|');
  if(!unique.has(id))unique.set(id,{id,cells:missing,original:[]});
  unique.get(id).original.push({dir:line.dir,cells:line.cells});
 }
 const all=[...unique.values()];
 return all.filter(g=>!all.some(t=>t.cells.length<g.cells.length&&subset(t.cells,g.cells)));
}
function mask(q,p,xs){
 const s=xs.map(([c,r])=>key(c,r)).sort().join('|');
 return wsl(q,p).find(x=>x.id===s);
}
function winsNext(q,p){
 const A=wsl(q,p),out=[];
 for(let c=1;c<=7;c++){
  if(q.h[c-1]>=6)continue;
  const s=key(c,q.h[c-1]+1);
  const z=A.find(x=>x.cells.length===1&&x.cells[0]===s);
  if(z)out.push({c,r:q.h[c-1]+1,original:z.original.map(x=>x.dir)});
 }
 return out;
}
function readyNext(q,p){
 const A=wsl(q,p),out=[];
 for(let c=1;c<=7;c++){
  if(q.h[c-1]>=5)continue;
  const s=key(c,q.h[c-1]+2);
  const z=A.find(x=>x.cells.length===1&&x.cells[0]===s);
  if(z)out.push({c,r:q.h[c-1]+2,original:z.original.map(x=>x.dir)});
 }
 return out;
}
function grades(A){
 const result={};
 for(const x of A)result[String(x.cells.length)]=(result[String(x.cells.length)]||0)+1;
 return result;
}
function source(q){
 return{rank:q.events.length,h:q.h.slice(),P0WSL:wsl(q,0).length,P1WSL:wsl(q,1).length,
  P0grades:grades(wsl(q,0)),P1grades:grades(wsl(q,1)),
  P0immediate:winsNext(q,0),P1immediate:winsNext(q,1),
  P0ready:readyNext(q,0),P1ready:readyNext(q,1)};
}
const q13=fromHistory('4214254422333');
const q17=fromHistory('42142544223336111');
ck(q13.h.join(',')==='1,4,3,4,1,0,0'&&q17.h.join(',')==='4,4,3,4,1,1,0','authentic two original sources');
const y=[5,3],x=[5,2],e=[6,2],z=[7,1];
const sourceA=mask(q17,0,[y]),sourceDH=mask(q17,1,[x,e]),sourceDF=mask(q17,1,[e,y,z]);
ck(sourceA&&sourceA.original.some(t=>t.dir==='H'),'P0 original H3 source singleton');
ck(sourceDH&&sourceDH.original.some(t=>t.dir==='H'),'P1 original H2 source grade2');
ck(sourceDF&&sourceDF.original.some(t=>t.dir==='F'),'P1 original FALLING diagonal source grade3');
ck(readyNext(q17,0).map(t=>t.c).join(',')==='5','one authentic P0 trap c5r3');
const tr=[],b=copy(q17);
const D18=put(b,6,1);ck(!D18.firstwin,'P1 e nonterminal');
tr.push({event:D18,source:source(b)});
ck(mask(b,1,[x])&&winsNext(b,1).some(t=>t.c===5),'D e opens P1 H2 immediate x');
const A19=put(b,5,0);ck(!A19.firstwin,'P0 interceptor x nonterminal');
tr.push({event:A19,source:source(b)});
ck(!wsl(b,1).some(g=>g.original.some(o=>o.dir==='H'&&o.cells.every(([c,r])=>r===2&&c>=3&&c<=6))), 'P0 x kills original D H2');
ck(mask(b,0,[y])&&winsNext(b,0).some(t=>t.c===5),'P0 x exposes A H3 firstwinner y');
ck(winsNext(b,1).length===0,'no D immediate competing firstwin before blocked-y choice');
const dsweep=[];
for(let col=1;col<=7;col++){
 if(b.h[col-1]>=6)continue;
 const p=copy(b),d=put(p,col,1);
 ck(!d.firstwin,'no P1 immediate FIRSTWIN on any current action');
 const o={col,row:d.row,Dfirstwin:d.firstwin,P0winningColumns:winsNext(p,0).map(t=>t.c)};
 if(col!==5){
  ck(o.P0winningColumns.includes(5),'all non-y replies allow P0 H3 firstwin');
  const p0=put(p,5,0);ck(p0.firstwin,'true original P0 H3 winner if D does not block y');
 }else{
  ck(!o.P0winningColumns.includes(5),'D y removes P0 source H3');
 }
 dsweep.push(o);
}
const D20=put(b,5,1);ck(!D20.firstwin,'forced P1 H3 blocker nonterminal');
tr.push({event:D20,source:source(b)});
ck(!mask(b,0,[y]),'D y blocks P0 H3 original line');
ck(mask(b,1,[z])&&winsNext(b,1).map(t=>t.c).join(',')==='7','P1 e/y exposes FALLING original diagonal firstwin z');
ck(winsNext(b,0).length===0,'P0 no alternative immediate FIRSTWIN at rank20');
const asweep=[];
for(let col=1;col<=7;col++){
 if(b.h[col-1]>=6)continue;
 const p=copy(b),a=put(p,col,0);
 ck(!a.firstwin,'P0 has no immediate win instead of blocking z');
 const o={col,row:a.row,Afirstwin:a.firstwin,P1winningColumns:winsNext(p,1).map(t=>t.c)};
 if(col!==7){
  ck(o.P1winningColumns.includes(7),'all non-z P0 replies leave P1 original diagonal winning');
  const d22=put(p,7,1);ck(d22.firstwin&&d22.wins.some(w=>w.dir==='F'),'original F P1 FIRSTWIN next turn');
 }else ck(!o.P1winningColumns.includes(7),'P0 z blocks P1 F original K4');
 asweep.push(o);
}
const A21=put(b,7,0);ck(!A21.firstwin,'forced P0 diagonal counterblock nonterminal');
tr.push({event:A21,source:source(b)});
ck(!mask(b,1,[z])&&winsNext(b,1).length===0,'P0 z blocks immediate P1 F firstwinner');
ck(readyNext(b,1).some(t=>t.c===3&&t.r===5),'new P1 gravity ready diagonal c3r5 after four-event relay');
const profiles=[];
for(const col of [2,3,4,6,7]){
 const q=copy(q13);
 for(const v of [col,1,1,1]){
  const E=put(q,v,q.events.length%2);ck(!E.firstwin,'four-event q13 primer remains LIVE');
 }
 const trp=new Set(readyNext(q,0).map(t=>t.c)),odd=[],even=[];
 for(let c=1;c<=7;c++)if(!trp.has(c)&&q.h[c-1]<6){
  ((6-q.h[c-1])%2?odd:even).push(c);
 }
 const eq=[];
 for(let i=0;i<even.length;i++)for(let j=i+1;j<even.length;j++)
  if(q.h[even[i]-1]===q.h[even[j]-1])eq.push([even[i],even[j]]);
 const low=wsl(q,1).filter(g=>g.cells.length<=2).map(g=>({cells:g.cells,dirs:g.original.map(o=>o.dir)}));
 profiles.push({firstDcol:col,rank:q.events.length,heights:q.h.slice(),
  P0ready:readyNext(q,0),P1immediate:winsNext(q,1),
  oddNontrap:odd,equalHeightEvenNontrapPairs:eq,sourceP1MinGradeLE2:low});
}
const result={schema:'c4tr.original7x6_poisoned_trap_interception_cross_direction_source_ladder.v1',
 status:'EXACT_GUARDED_TWO_STAGE_FORCED_SOURCE_TRANSFER_ONLY_Q13_ALL_AND_EMPTY_WLD_OPEN',
 geometry:hist,originalSource:'42142544223336111',
 originalQ13:'4214254422333',noPreviouslySolvedGameInput:true,
 noFutureStrategicGameValueQueries:true,fullGameTreeEnumeration:false,
 typedOriginalSourceRequirements:{
  P0_H3:sourceA.original.filter(o=>o.dir==='H'),
  P1_H2:sourceDH.original.filter(o=>o.dir==='H'),
  P1_F3:sourceDF.original.filter(o=>o.dir==='F')},
 originalSourceResiduals:{P0_H3:[y],P1_H2:[x,e],P1_F3:[e,y,z]},
 sourceBefore:source(q17),sourceAfterFourForcedEvents:source(b),
 fourForcedEvents:tr,P1currentLegalReplySourceSweep:dsweep,
 P0nextLegalReplySourceSweep:asweep,
 derivedMacro:'P1 c6r2 -> P0 c5r2 interception -> P1 c5r3 compulsory block -> P0 c7r1 compulsory diagonal block',
 exactPhysicalLineGuard:'D H row2 c3-c6 blocked by P0 c5r2, A H row3 c2-c5 threatened by c5r3, D falling diagonal c4r4-c7r1 threatened by c7r1 after D c5r3',
 residualLimit:'rank21 P1 to move, P1 ready diagonal c3r5, no P0 trap; no claim of P0 WIN, q13 ALL or root WIN',
 q13FixedPrimerOriginalProfiles:profiles};
console.log(JSON.stringify(result,null,2));