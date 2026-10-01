#!/usr/bin/env node
import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const key=(x,y)=>x+','+y;

function lines(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of DIRS){
    const cells=Array.from({length:K},(_,i)=>[x+i*dx,y+i*dy]);
    if(cells.every(([cx,cy])=>cx>=0&&cx<W&&cy>=0&&cy<H))out.push(cells);
  }
  return out;
}
const LINES=lines();
assert.equal(LINES.length,69);

function ownsLine(S,L){return L.every(([x,y])=>S.has(key(x,y)));}
function position(sequence=''){
  const heights=Array(W).fill(0),stones=[new Set(),new Set()];
  for(let ply=0;ply<sequence.length;ply++){
    const c=Number(sequence[ply])-1;
    assert(Number.isInteger(c)&&c>=0&&c<W&&heights[c]<H);
    stones[ply&1].add(key(c,heights[c]++));
  }
  return {heights,stones,rank:sequence.length,mover:sequence.length&1};
}
function legal(P){return Array.from({length:W},(_,c)=>c).filter(c=>P.heights[c]<H);}
function apply(P,c){
  assert(P.heights[c]<H);
  const heights=P.heights.slice(),stones=[new Set(P.stones[0]),new Set(P.stones[1])];
  const playedBy=P.mover,y=heights[c]++;
  stones[playedBy].add(key(c,y));
  const win=LINES.some(L=>ownsLine(stones[playedBy],L));
  return {heights,stones,rank:P.rank+1,mover:1-P.mover,landing:[c,y],playedBy,win};
}
function winningFrontier(P,player){
  const out=[];
  for(const c of legal(P)){
    const S=new Set(P.stones[player]);
    S.add(key(c,P.heights[c]));
    if(LINES.some(L=>ownsLine(S,L)))out.push(c);
  }
  return out;
}

function normalizeResiduals(xs){
  const uniq=[],seen=new Set();
  for(const cells of xs){
    const a=[...cells].sort((x,y)=>x-y);
    const sig=a.join(',');
    if(!seen.has(sig)){seen.add(sig);uniq.push(a);}
  }
  return uniq.filter((a,i)=>!uniq.some((b,j)=>i!==j&&b.length<a.length&&b.every(x=>a.includes(x))));
}
function liveResiduals(P,player){
  const opp=1-player,out=[];
  for(const L of LINES){
    if(L.some(([x,y])=>P.stones[opp].has(key(x,y))))continue;
    const missing=L.filter(([x,y])=>!P.stones[player].has(key(x,y))).map(([x,y])=>y*W+x);
    if(missing.length)out.push(missing);
  }
  return normalizeResiduals(out);
}
function earliestUnopposed(P,player,residual){
  const remaining=W*H-P.rank,first=player===P.mover?1:2;
  const needs=residual.map(id=>{
    const x=id%W,y=Math.floor(id/W);
    return y-P.heights[x]+1;
  }).sort((a,b)=>a-b);
  if(needs.some(n=>n<=0))return null;
  let slot=first;
  for(const need of needs){
    while(slot<need)slot+=2;
    if(slot>remaining)return null;
    slot+=2;
  }
  return slot-2;
}
function pairingsAll(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(let i=0;i<tail.length;i++){
    const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));
    for(const p of pairingsAll(rest))out.push([[a,b],...p]);
  }
  return out;
}
function optionalMatchings(items){
  if(!items.length)return [[]];
  const [a,...tail]=items,out=[];
  for(const p of optionalMatchings(tail))out.push(p);
  for(let i=0;i<tail.length;i++){
    const b=tail[i],rest=tail.slice(0,i).concat(tail.slice(i+1));
    for(const p of optionalMatchings(rest))out.push([[a,b],...p]);
  }
  return out;
}
function product(arrays,i=0,prefix=[],out=[]){
  if(i===arrays.length){out.push(prefix.slice());return out;}
  for(const v of arrays[i]){prefix.push(v);product(arrays,i+1,prefix,out);prefix.pop();}
  return out;
}
function templates(P){
  const rem=P.heights.map(h=>H-h),odds=[],evens=[];
  for(let c=0;c<W;c++){
    if(rem[c]===0)continue;
    (rem[c]&1?odds:evens).push(c);
  }
  if(odds.length&1)return [];
  const out=[];
  for(const opairs of pairingsAll(odds)){
    for(const epairs of optionalMatchings(evens)){
      const pairs=[...opairs,...epairs],paired=new Set(pairs.flat());
      const choices=pairs.map(([a,b])=>{
        const parity=rem[a]&1,ls=[];
        for(let L=1;L<=Math.min(rem[a],rem[b]);L++)if((L&1)===parity)ls.push(L);
        return ls;
      });
      if(choices.some(x=>!x.length))continue;
      for(const lengths of product(choices)){
        const vertical=new Set(),cross=[];
        for(let i=0;i<pairs.length;i++){
          const [a,b]=pairs[i],L=lengths[i];
          for(let j=0;j<L;j++)cross.push([(P.heights[a]+j)*W+a,(P.heights[b]+j)*W+b]);
          for(const c of [a,b]){
            for(let y=P.heights[c]+L;y+1<H;y+=2)vertical.add((y+1)*W+c);
          }
        }
        let valid=true;
        for(let c=0;c<W;c++)if(!paired.has(c)){
          if(rem[c]&1){valid=false;break;}
          for(let y=P.heights[c];y+1<H;y+=2)vertical.add((y+1)*W+c);
        }
        if(valid)out.push({pairs:pairs.map((p,i)=>({cols:p.map(c=>c+1),length:lengths[i]})),vertical,cross});
      }
    }
  }
  return out;
}
function covers(residual,T){
  if(residual.some(id=>T.vertical.has(id)))return true;
  const s=new Set(residual);
  return T.cross.some(([a,b])=>s.has(a)&&s.has(b));
}
function certifiedHorizon(P,attacker){
  const residuals=liveResiduals(P,attacker)
    .map(cells=>({cells,deadline:earliestUnopposed(P,attacker,cells)}))
    .filter(x=>x.deadline!==null)
    .sort((a,b)=>a.deadline-b.deadline || a.cells.join(',').localeCompare(b.cells.join(',')));
  let best={horizon:-1,template:null,firstUncovered:null};
  for(const T of templates(P)){
    const uncovered=residuals.filter(r=>!covers(r.cells,T));
    const first=uncovered.length?uncovered[0].deadline:Infinity;
    const horizon=Number.isFinite(first)?first-2:W*H-P.rank;
    if(horizon>best.horizon)best={horizon,template:T,firstUncovered:uncovered.slice(0,8)};
  }
  return best;
}
function pairSignature(T){
  return T.pairs
    .map(p=>({a:Math.min(...p.cols),b:Math.max(...p.cols),length:p.length}))
    .sort((x,y)=>x.a-y.a||x.b-y.b||x.length-y.length)
    .map(x=>`${x.a}-${x.b}:${x.length}`)
    .join('|');
}
function residualSignature(rows){
  return rows.map(r=>`${r.deadline}:${r.cells.join(',')}`);
}

const prefix='444441566';
const root=position(prefix);
const child=apply(root,5); // candidate 6
assert.equal(child.win,false);
assert.deepEqual(child.heights,[1,0,0,5,1,3,0]);
const attacker=child.mover;

const before=certifiedHorizon(child,attacker);
assert.equal(before.horizon,5);
assert.equal(pairSignature(before.template),'1-4:1|2-3:2|5-6:1');

function forcedOrientation(setupColumn,forcedBlockColumn){
  const afterSetup=apply(child,setupColumn-1);
  assert.equal(afterSetup.win,false);
  assert.deepEqual(winningFrontier(afterSetup,afterSetup.mover),[],
    'defender must have no immediate counter-win');
  assert.deepEqual(winningFrontier(afterSetup,attacker),[forcedBlockColumn-1],
    'setup must create exactly the stated attacker terminal target');

  const successor=apply(afterSetup,forcedBlockColumn-1);
  assert.equal(successor.win,false);
  assert.equal(successor.mover,attacker);
  assert.deepEqual(successor.heights,[1,1,1,5,1,3,0]);

  const cert=certifiedHorizon(successor,attacker);
  assert.equal(cert.horizon,5);
  assert.equal(pairSignature(cert.template),'1-2:1|3-4:1|5-6:1');
  assert.deepEqual(
    residualSignature(cert.firstUncovered.slice(0,3)),
    residualSignature(before.firstUncovered.slice(0,3)),
    'leading uncovered residual boundary must remain unchanged'
  );

  return {
    setupColumn,
    forcedBlockColumn,
    successorHeights:successor.heights,
    successorHorizon:cert.horizon,
    successorTemplatePairs:cert.template.pairs,
    successorPairSignature:pairSignature(cert.template),
    firstUncovered:cert.firstUncovered.map(r=>({
      deadline:r.deadline,
      cellIds:r.cells,
      cells:r.cells.map(id=>({column:(id%W)+1,row:Math.floor(id/W)+1}))
    }))
  };
}

const orientation23=forcedOrientation(2,3);
const orientation32=forcedOrientation(3,2);

console.log(JSON.stringify({
  schema:'connect4.forced_response_template_switch_stutter.v1',
  oracleUsed:false,
  prefix,
  candidate:6,
  before:{
    heights:child.heights,
    horizon:before.horizon,
    templatePairs:before.template.pairs,
    pairSignature:pairSignature(before.template),
    firstUncovered:before.firstUncovered.map(r=>({
      deadline:r.deadline,
      cellIds:r.cells,
      cells:r.cells.map(id=>({column:(id%W)+1,row:Math.floor(id/W)+1}))
    }))
  },
  forcedOrientations:[orientation23,orientation32],
  conclusion:'Both forced 2<->3 response fragments preserve the constructive survival horizon H=5 via an exact response-template switch. The fragment is a lower-bound survival stutter, not proven attacker progress.',
  theoremBoundary:'Preservation of a certified lower bound does not imply equality of exact strong distance and does not create a move-selection rule.'
},null,2));
