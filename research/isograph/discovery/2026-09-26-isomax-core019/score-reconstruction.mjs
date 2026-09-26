import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {generate,GENERATOR} from 'astring';
import {controls} from './controls.mjs';
const dir=process.argv[2],packet=process.argv[3]||'packet-v2';
const reconstruction=fs.readFileSync(`${dir}/reconstruction.json`,'utf8');
const decoded=JSON.parse(reconstruction),oracle=JSON.parse(fs.readFileSync(`author-only/${packet}-source-oracle.json`,'utf8'));
assert.deepEqual(decoded,oracle);
const generator={...GENERATOR,ParenthesizedExpression(n,s){s.write('(');this[n.expression.type](n.expression,s);s.write(')');}};
const rows=[];
for(const [id,source] of controls){
  const represented=decoded.controls.find(x=>x.id===id);assert.ok(represented);
  const rendered=generate(represented.program,{generator});
  const originalModule=await import('data:text/javascript,'+encodeURIComponent(source));
  const reconstructedModule=await import('data:text/javascript,'+encodeURIComponent(rendered));
  const observations=[];
  for(const args of [[0,0],[2,2],[2,5],[-1,1],[0xffffffff,0],[0,3]]){
    const expected=originalModule.f(...args),actual=reconstructedModule.f(...args);
    assert.ok(Object.is(actual,expected),`${id} ${args}`);
    observations.push({args,actual});
  }
  rows.push({id,observations});
}
for(let i=0;i<rows.length;i+=2)assert.notDeepEqual(rows[i].observations,rows[i+1].observations,`mutation indistinguishable ${rows[i].id}`);
const result={disposition:'ORACLE_STRUCTURE_AND_BOUNDED_MUTATION_CONTROLS_PASS',
  renderingQualified:false,note:'This evidence does not by itself discharge semantic-bridge review or ESR promotion.',
  decoderJsonSha256:createHash('sha256').update(reconstruction).digest('hex'),
  exactSourceObjectComparison:true,modules:decoded.modules.length,controls:rows,pairedDistinctions:rows.length/2};
fs.writeFileSync(`${dir}/SOURCE_COMPARISON.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({modules:decoded.modules.length,controls:rows.length,pairedDistinctions:rows.length/2,pass:true}));
