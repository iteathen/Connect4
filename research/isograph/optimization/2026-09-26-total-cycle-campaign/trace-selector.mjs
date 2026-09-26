// TEST ONLY: exact ordered node trace, never a performance measurement.
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {appendFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const [baseline,candidate,output]=process.argv.slice(2);
writeFileSync(output,'',{flag:'wx'});
registerHooks({load(url,ctx,next){const r=next(url,ctx);if(!url.endsWith('/addons/rba-connect4-alphabeta.mjs'))return r;
 const s=(typeof r.source==='string'?r.source:new TextDecoder().decode(r.source)).replaceAll('\r\n','\n');
 assert.equal(s.split('state.nodes+=1;').length-1,2);
 return {...r,source:s.replaceAll('state.nodes+=1;','state.trace(words,keyOffset,g.keyWords,depth);state.nodes+=1;')};
}});
const a=await import(pathToFileURL(baseline+'/addons/index.mjs').href),b=await import(pathToFileURL(candidate+'/addons/index.mjs').href);
const sha=path=>execFileSync('git',['-C',path,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
appendFileSync(output,JSON.stringify({baseline:sha(baseline),candidate:sha(candidate),kind:'exact-ordered-q-trace-test-not-timing'})+'\n');
const late=[4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4];
const fixtures=[{moves:[3,4,3,5,0,5,5,6],offsets:[0]},
 {moves:late,offsets:[0,1,2,3]}, {moves:late.map(c=>6-c),offsets:[0,1,2,3]}];
const trace=new Uint32Array(32*1024*1024);
for(const {moves,offsets} of fixtures)for(const offset of offsets){
 let used=0,read=0;const run=(lib,visit)=>{
  const g=lib.prepareConnect4RbaGeometry({columns:7,rows:6}),root=lib.connect4RbaFromMoves(moves,{geometry:g}),
   state=lib.prepareConnect4RbaAlphaBeta({geometry:g,cacheCapacity:65536,orderOffset:offset});
  state.trace=visit;return lib.solveConnect4RbaAlphaBeta(root,{state,reflected:root.reflected});
 };
 const control=run(a,(words,key,len,depth)=>{if(used+len+1>trace.length)throw Error('bounded trace exhausted');trace[used++]=depth;for(let i=0;i<len;i++)trace[used++]=words[key+i];});
 const result=run(b,(words,key,len,depth)=>{assert.ok(read+len+1<=used);assert.equal(depth,trace[read++]);for(let i=0;i<len;i++)assert.equal(words[key+i],trace[read++]);});
 assert.equal(read,used);assert.deepEqual(result,control);
 const row={moves,offset,traceWords:used,nodes:result.metrics.nodes,cofactors:result.metrics.cofactors,value:result.value,move:result.move,status:'IDENTICAL'};
 appendFileSync(output,JSON.stringify(row)+'\n');console.log(JSON.stringify(row));
}
