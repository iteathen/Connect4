import test from 'node:test';
import assert from 'node:assert/strict';
import {fromMoves7x6,prepareRba7x6} from '../components/isometric/rba/ingress.mjs';
import {position} from './helpers/physical-oracle.mjs';
import {basis7x6} from '../components/isometric/rba/coordinate.mjs';
const url=new URL('../components/isometric/rba/front.mjs',import.meta.url);
function bounds(moves,depth){
  const p=position(moves);if(p.terminal)return [p.terminal,p.terminal];
  if(!depth)return [1,3];
  let lo=p.ply&1?4:0,hi=lo;
  for(let c=0;c<7;c++)if(p.heights[c]<6){
    const v=bounds([...moves,c],depth-1);
    lo=p.ply&1?Math.min(lo,v[0]):Math.max(lo,v[0]);
    hi=p.ply&1?Math.min(hi,v[1]):Math.max(hi,v[1]);
  }
  return [lo,hi];
}
test('native four-front algebra API exists',async()=>{
  const a=await import(url.href).catch(()=>null);assert.ok(a?.buildFour7x6,'four-front producer missing');
});
test('bounded symbolic fronts agree with independent physical interval propagation',async()=>{
  const {prepareFrontArena7x6,buildFour7x6,queryFour7x6}=await import(url.href);
  const g=prepareRba7x6();
  for(const moves of [[],[0],[0,1,0,1,0,1],[3,2,4,2,5],[0,0,1,1,2,2]]){
    const q=fromMoves7x6(moves,{geometry:g,canonical:false}).words;
    for(const depth of [1,2]){
      const a=prepareFrontArena7x6(depth,2048,2000000);
      assert.equal(buildFour7x6(g,a,q[0],0,depth),0);
      const packed=queryFour7x6(a,0,q,0);
      assert.deepEqual([packed&3,packed>>>2],bounds(moves,depth));
      // LW ⊆ LD, LW ⊆ UW, LD ⊆ UD, UW ⊆ UD at the actual query.
      assert.ok((packed&3)<=(packed>>>2));
    }
  }
});
test('front construction budget fails explicitly without turning incomplete into WDL',async()=>{
  const {prepareFrontArena7x6,buildFour7x6}=await import(url.href);
  assert.equal(buildFour7x6(prepareRba7x6(),prepareFrontArena7x6(2,1,1),0,0,2),6);
});

test('streamed front product preserves mixed covers and absorbs before capacity admission',async()=>{
  const {prepareFrontArena7x6,insertFront7x6,combineFront7x6}=await import(url.href);
  const a=prepareFrontArena7x6(1,32,100000);
  const left=[3,12],right=[5,10];
  for(const [slot,values] of [[0,left],[1,right]])for(const value of values){a.temp.fill(0);a.temp[0]=value;assert.equal(insertFront7x6(a,slot),0);}
  assert.equal(combineFront7x6(a,0,1,2,1),0);
  const raw=[...new Set(left.flatMap(x=>right.map(y=>x|y)))];
  const expected=raw.filter(x=>!raw.some(y=>y!==x && (y&~x)===0)).sort((x,y)=>x-y);
  const actual=Array.from({length:a.count[2]},(_,i)=>a.words[a.base[2]+i*6]).sort((x,y)=>x-y);
  assert.deepEqual(actual,expected);
  const small=prepareFrontArena7x6(1,1,1000);
  small.temp[0]=3;assert.equal(insertFront7x6(small,0),0);
  small.temp[0]=1;assert.equal(insertFront7x6(small,0),0); // subsumes full slot
  small.temp[0]=2;assert.equal(insertFront7x6(small,0),7); // incomparable: capacity
});

test('front arena transfers ownership without copying published boundary words',async()=>{
  const {prepareFrontArena7x6,swapFront7x6}=await import(url.href);
  assert.equal(typeof swapFront7x6,'function');
  const a=prepareFrontArena7x6(1,4,1000);
  a.words[a.base[0]]=7;a.count[0]=1;
  const before=a.words.slice(),original=a.base[0];
  swapFront7x6(a,0,1);
  assert.equal(a.base[1],original);assert.equal(a.count[1],1);assert.equal(a.count[0],0);
  assert.deepEqual(a.words,before);
  assert.equal(new Set(a.base).size,a.base.length,'every arena region retains one owner');
});

test('complete small support fibers agree with independent residual-array game including first-win guards',async()=>{
  const {prepareFrontArena7x6,buildFour7x6,queryFour7x6}=await import(url.href);
  const g=prepareRba7x6();
  for(const heights of [[6,6,6,6,6,5,5],[6,6,6,6,5,5,5],[6,6,6,6,5,5,4]]){
    let support=heights.reduce((n,h,c)=>n|(h<<(3*c)),0)|(heights.reduce((a,b)=>a+b,0)<<21);
    const ids=new Uint32Array(69),n=basis7x6(g,support,ids,0,new Uint32Array(20));
    assert.ok(n<=10,'exhaustive fixture bound');
    const upsets=[];
    for(let mask=0;mask<(1<<n);mask++){
      let valid=true;
      for(let i=0;i<n;i++)if(mask&(1<<i))for(let j=0;j<n;j++)if(g.subset[ids[j]*625+ids[i]]&&!(mask&(1<<j)))valid=false;
      if(valid)upsets.push(mask);
    }
    function residual(mask){return [...ids.slice(0,n)].filter((_,i)=>mask&(1<<i)).map(id=>BigInt(g.shapeLo[id])|(BigInt(g.shapeHi[id])<<32n));}
    function oracle(h,r0,r1,ply){
      if(ply===42)return 2;
      let value=ply&1?4:0;
      for(let c=0;c<7;c++)if(h[c]<6){
        const bit=1n<<BigInt(h[c]*7+c),own=ply&1?r1:r0;
        let child;
        if(own.some(r=>r===bit))child=ply&1?1:3;
        else{
          const next=h.slice();next[c]++;
          const a=ply&1?r0.filter(r=>!(r&bit)):r0.map(r=>r&~bit);
          const b=ply&1?r1.map(r=>r&~bit):r1.filter(r=>!(r&bit));
          child=oracle(next,a,b,ply+1);
        }
        value=ply&1?Math.min(value,child):Math.max(value,child);
      }
      return value;
    }
    const depth=42-(support>>>21),arena=prepareFrontArena7x6(depth,2048,2000000);
    assert.equal(buildFour7x6(g,arena,support,0,depth),0);
    for(const p0 of upsets)for(const p1 of upsets){
      const q=new Uint32Array([support,0,p0,0,0,p1,0,0]);
      const result=queryFour7x6(arena,0,q,0),expected=oracle(heights,residual(p0),residual(p1),support>>>21);
      assert.equal(result,expected|(expected<<2),`basis ${n}, q ${p0}/${p1}`);
    }
  }
});
