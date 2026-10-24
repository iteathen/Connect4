import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGeometry} from '../shared/geometry.mjs';
import {SourceState} from '../shared/source-state.mjs';
import {PhysicalState} from '../variants/a-physical/state.mjs';
import {PhysicalTT} from '../variants/a-physical/tt.mjs';
import {ExactTT} from '../variants/b-source/tt.mjs';
import {GuardedTT,FORK_ATTEMPTED_NO_CERTIFICATE} from '../variants/c-guarded/tt.mjs';
import {createPhysical} from './independent-oracle.mjs';

function seeded(seed){let s=seed|0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function verify(a,b,oracle){
 assert.equal(a.rank,oracle.turn);
 assert.equal(b.rank,oracle.turn);
 assert.deepEqual([...a.heights],[...oracle.heights]);
 assert.deepEqual([...b.heights],[...oracle.heights]);
 // Verify the exact compact per-column state carrier bit for every board site.
 const g=a.g,code=new Uint32Array(a.keyWords),owners=new Uint32Array(a.owners.length);
 for(let col=0;col<g.columns;col++){
  const h=oracle.heights[col],sentinel=col*(g.rows+1)+h;
  code[sentinel>>>5]|=1<<(sentinel&31);
  for(let row=0;row<h;row++){
   const player=oracle.owners[col*g.rows+row],bit=col*(g.rows+1)+row;
   assert.ok(player===0||player===1);
   owners[player*a.keyWords+(bit>>>5)]|=1<<(bit&31);
   if(player===0)code[bit>>>5]|=1<<(bit&31);
  }
 }
 assert.deepEqual([...a.key],[...code]);
 assert.deepEqual([...a.owners],[...owners]);
 let d0=0,d1=0,tot=0;
 const maskA=a.immediateColumns(),maskB=b.immediateColumns();
 if(oracle.winner<0){
  assert.equal(maskA.p0,oracle.immediateMask(0));
  assert.equal(maskA.p1,oracle.immediateMask(1));
  assert.deepEqual(maskB,maskA);
 }
 for(let l=0;l<g.lineCount;l++){
  let empty=0,live0=true,live1=true;
  for(let i=0;i<4;i++){
    const site=g.siteLines[l*4+i],c=Math.floor(site/g.rows),r=site%g.rows;
    const player=oracle.owners[site];
    if(player<0)empty++;
    else if(player===0)live1=false;
    else if(player===1)live0=false;
  }
  const w=l>>>5,bit=1<<(l&31),k=b.k;
  assert.equal(!!(b.fields[w]&bit),live0);
  assert.equal(!!(b.fields[k+w]&bit),live1);
  for(let d=0;d<3;d++)assert.equal(!!(b.fields[(2+d)*k+w]&bit),!!(empty&(1<<d)));
  if(live0)d0++;
  if(live1)d1++;
  tot++;
 }
 assert.equal(b.noWinningLines(),d0===0&&d1===0);
}

test('A physical TT code and B/C original-source states match independent physical boards through 10x10',()=>{
 const random=seeded(0x21c05ab5),shapes=[[1,1],[2,5],[3,10],[4,4],[5,5],[6,5],[7,6],[8,8],[10,10]];
 let n=0;
 for(const [columns,rows] of shapes){
  const g=prepareGeometry({columns,rows});
  for(let game=0;game<40;game++){
   const a=new PhysicalState(g),b=new SourceState(g),ref=createPhysical(columns,rows),moves=[];
   verify(a,b,ref);n++;
   for(let ply=0;ply<g.cells;ply++){
    const legal=[];
    for(let c=0;c<g.columns;c++)if(ref.heights[c]<g.rows)legal.push(c);
    if(!legal.length)break;
    const col=legal[random()%legal.length];
    const wa=a.apply(col),wb=b.apply(col),wr=ref.push(col);
    moves.push(col);assert.equal(wa,wr);assert.equal(wb,wr);
    verify(a,b,ref);n++;
    if(wr)break;
   }
   for(let i=moves.length-1;i>=0;i--){
    const col=moves[i];a.undo(col);b.undo(col);ref.pop(col);
    verify(a,b,ref);n++;
   }
  }
 }
 console.log(`independent physical/native board checks: ${n}`);
});

test('each geometry-sized TT retains FULL exact identity, not a probabilistic key fingerprint',()=>{
 for(const [w,h] of [[4,4],[7,6],[8,8],[10,10]]){
  const g=prepareGeometry({columns:w,rows:h}),a=new PhysicalState(g),b=new SourceState(g);
  for(const [TT,state] of [[PhysicalTT,a],[ExactTT,b],[GuardedTT,b]]){
    const tt=new TT(g,0.001); // intentionally small for collisions
    assert.ok(tt.bytes<=0.001*1048576);
    assert.equal(tt.probe(state,tt.slot(tt.hash(state))),0);
    const original=tt.slot(tt.hash(state));
    if(TT===GuardedTT)tt.put(state,original,3,0,true);
    else tt.put(state,original,3,0);
    const hit=tt.probe(state,tt.slot(tt.hash(state)));
    assert.equal(hit&7,3);
    if(TT===GuardedTT)assert.ok(hit&FORK_ATTEMPTED_NO_CERTIFICATE);
    // Alter physical/source states legally. The old entry MUST NOT match the new state.
    a.apply(0);b.apply(0);
    assert.equal(tt.probe(state,tt.slot(tt.hash(state))),0);
    // Force the current state into the SAME slot as the old key; exact key still differs.
    assert.equal(tt.probe(state,original),0);
    a.undo(0);b.undo(0);
    assert.equal(tt.probe(state,original)&7,3);
  }
 }
});
