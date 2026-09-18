import assert from 'node:assert/strict';
const W=7,H=6,K=4;
const k=(c,r)=>`${c},${r}`;
const lines=[];
for(let r=1;r<=H;r++)for(let c=1;c<=W;c++)for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
 const a=[];for(let i=0;i<K;i++){const x=c+i*dc,y=r+i*dr;if(x<1||x>W||y<1||y>H){a.length=0;break}a.push([x,y])}if(a.length)lines.push(a)
}
assert.equal(lines.length,69);
const lineKeys=new Set(lines.map(L=>L.map(([c,r])=>k(c,r)).join('|')));
const bit=(i)=>1n<<BigInt(i);

function normalColumn(c){
 const states=[{h:0,p0:0n,p1:0n}],inter=[];let edges=0,invalid=0;
 for(let i=0;i<states.length;i++){const s=states[i];if(s.h>=H)continue;edges++;const r=s.h+1;let p0=s.p0|bit(r-1),p1=s.p1;inter.push({h:r,p0,p1});if(r===H){invalid++;continue}p1|=bit(r);const ns={h:r+1,p0,p1};if(!states.some(x=>x.h===ns.h&&x.p0===ns.p0&&x.p1===ns.p1))states.push(ns)}
 // With even H, P0 should never be the top trigger.
 assert.equal(invalid,0);
 return {type:'normal',cols:[c],states,inter,edges,invalid,globalOwn:(s,pl,row)=>((pl?s.p1:s.p0)&bit(row-1))!==0n};
}
function coupledPair(a,b,mode){
 // local bit index: a rows 1..H then b rows 1..H
 const cb=(c,r)=>bit((c===a?0:H)+(r-1));
 let starts;
 if(mode==='initial') starts=[{ha:1,hb:1,p0:cb(a,1),p1:cb(b,1),phase:'running'}];
 else if(mode==='empty') starts=[{ha:0,hb:0,p0:0n,p1:0n,phase:'empty'}];
 else throw new Error(mode);
 const states=[...starts],seen=new Set(states.map(s=>`${s.ha}/${s.hb}/${s.p0}/${s.p1}/${s.phase}`)),inter=[];let edges=0,invalid=0;
 for(let i=0;i<states.length;i++){
  const s=states[i];
  for(const c of [a,b]){
   const h=c===a?s.ha:s.hb;if(h>=H)continue;edges++;const r=h+1;let t={...s,p0:s.p0|cb(c,r)};if(c===a)t.ha=r;else t.hb=r;inter.push(t);
   let rc,rr;
   if(s.phase==='empty'){
    // First local P0 move must be a bottom move; take the other bottom.
    assert.equal(r,1);rc=c===a?b:a;rr=1;
   }else if(r<H){rc=c;rr=r+1;}
   else {rc=c===a?b:a;rr=(rc===a?t.ha:t.hb)+1;}
   if(rr>H){invalid++;continue}
   t={...t,p1:t.p1|cb(rc,rr),phase:'running'};if(rc===a)t.ha=rr;else t.hb=rr;
   const q=`${t.ha}/${t.hb}/${t.p0}/${t.p1}/${t.phase}`;if(!seen.has(q)){seen.add(q);states.push(t)}
  }
 }
 assert.equal(invalid,0);
 return {type:`coupled-${mode}`,cols:[a,b],states,inter,edges,invalid,globalOwn:(s,pl,c,r)=>((pl?s.p1:s.p0)&cb(c,r))!==0n};
}

function compile(opening){
 const [p0first,p1reply]=opening;
 const specs = p0first===1
  ? [normalColumn(3),normalColumn(4),normalColumn(7),coupledPair(1,2,'initial'),coupledPair(5,6,'empty')]
  : p0first===2
    ? [normalColumn(1),normalColumn(4),normalColumn(5),coupledPair(2,3,'initial'),coupledPair(6,7,'empty')]
    : p0first===3
      ? [normalColumn(1),normalColumn(2),normalColumn(5),normalColumn(6),normalColumn(7),coupledPair(3,4,'initial')]
      : (()=>{throw new Error('opening')})();
 const owner=new Map();for(const s of specs)for(const c of s.cols)owner.set(c,s);
 assert.equal(owner.size,7);
 // singleton blockers: no intermediate state in the owning component has P0 on cell.
 const singleton=new Set();
 for(let c=1;c<=W;c++)for(let r=1;r<=H;r++){
  const comp=owner.get(c);let ever=false;
  for(const s of comp.inter){const yes=comp.cols.length===1?comp.globalOwn(s,0,r):comp.globalOwn(s,0,c,r);if(yes){ever=true;break}}
  // Initial occupied P0/P1 cells are represented in local inter descendants; if a component can become full without
  // an intermediate containing an initial cell, descendants still carry its bits.
  if(!ever)singleton.add(k(c,r));
 }
 // Forbidden pairs only within one component: never jointly P0 in any intermediate state.
 const pairs=[];
 for(const comp of specs){const cells=[];for(const c of comp.cols)for(let r=1;r<=H;r++)cells.push([c,r]);for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++){
   const [u,v]=[cells[i],cells[j]];let both=false;for(const s of comp.inter){const ou=comp.cols.length===1?comp.globalOwn(s,0,u[1]):comp.globalOwn(s,0,...u);const ov=comp.cols.length===1?comp.globalOwn(s,0,v[1]):comp.globalOwn(s,0,...v);if(ou&&ov){both=true;break}}
   if(!both)pairs.push([u,v]);
 }}
 // Support precedence P1 below before P0 upper: over all intermediate local states where upper is P0-owned.
 const precedence=new Set();
 for(let c=1;c<=W;c++)for(let r=2;r<=H;r++){
   const comp=owner.get(c);let seenUpper=false,ok=true;
   for(const s of comp.inter){const up=comp.cols.length===1?comp.globalOwn(s,0,r):comp.globalOwn(s,0,c,r);if(!up)continue;seenUpper=true;const lo=comp.cols.length===1?comp.globalOwn(s,1,r-1):comp.globalOwn(s,1,c,r-1);if(!lo){ok=false;break}}
   if(seenUpper&&ok)precedence.add(k(c,r));
 }
 function hasPair(L){return pairs.some(([u,v])=>L.some(x=>k(...x)===k(...u))&&L.some(x=>k(...x)===k(...v)))}
 const classes={singleton:[],pair:[],race:[],unclassified:[]};
 const races=[];
 for(const L of lines){
  if(L.some(x=>singleton.has(k(...x)))){classes.singleton.push(L);continue}
  if(hasPair(L)){classes.pair.push(L);continue}
  // Generic support-shadow: shift every target down one row, require resulting defender line + precedence.
  if(L.every(([c,r])=>r>1&&precedence.has(k(c,r)))){
    const Q=L.map(([c,r])=>[c,r-1]);const qk=Q.map(x=>k(...x)).join('|');
    if(lineKeys.has(qk)){classes.race.push(L);races.push({attacker:L,defender:Q});continue}
  }
  classes.unclassified.push(L)
 }
 return {opening,components:specs.map(s=>({type:s.type,columns:s.cols,states:s.states.length,edges:s.edges,intermediate:s.inter.length,invalid:s.invalid})),singleton:[...singleton],forbiddenPairCount:pairs.length,precedence:[...precedence],coverage:{singleton:classes.singleton.length,pair:classes.pair.length,race:classes.race.length,total:69-classes.unclassified.length,unclassified:classes.unclassified.length},races,unclassified:classes.unclassified};
}
const results=[[1,2],[2,3],[3,4]].map(compile);
for(const r of results){console.error('opening',r.opening,'coverage',r.coverage,'components',r.components);}
console.log(JSON.stringify(results,null,2));
