import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGeometry} from '../shared/geometry.mjs';
import {IsoMaxC} from '../variants/c-guarded/solver.mjs';
import {createPhysical} from './independent-oracle.mjs';
function random(seed){let s=seed|0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}

test('C fork-source opportunity gate does not miss an actual two-frontier threat on sampled legal states',()=>{
 const rnd=random(0x59e8ff1f);let checked=0,actual=0;
 for(const [w,h] of [[4,4],[5,5],[6,5],[7,6],[8,8],[10,10]]){
  const g=prepareGeometry({columns:w,rows:h});
  for(let game=0;game<100;game++){
   const solver=new IsoMaxC({columns:w,rows:h,ttMiB:.0625,nodeLimit:10000}),s=solver.state,ref=createPhysical(w,h);
   for(let ply=0;ply<w*h;ply++){
    if(ref.winner>=0)break;
    let {p0,p1,legal}=s.immediateColumns(),player=s.rank&1,own=player?p1:p0,opp=player?p0:p1;
    if(!own&&!opp){
     for(let c=0;c<w;c++)if(legal&(1<<c)){
      const site=c*h+s.heights[c],gate=solver.mayCreateFork(site,player);
      s.apply(c,true);const fork=solver.forkEstablished(player);s.undo(c);
      if(fork){actual++;assert.ok(gate,`gate missed fork w=${w} h=${h} ply=${ply} col=${c}`);}
      checked++;
     }
    }
    let choices=[];for(let c=0;c<w;c++)if(ref.heights[c]<h)choices.push(c);
    if(!choices.length)break;
    const col=choices[rnd()%choices.length];
    const a=s.apply(col),b=ref.push(col);assert.equal(a,b);
    if(a)break;
   }
  }
 }
 console.log(`fork admission checks ${checked}, complete tactical forks ${actual}`);
});
