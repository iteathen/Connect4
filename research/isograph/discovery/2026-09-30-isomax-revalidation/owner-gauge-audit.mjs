import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {swapVertexOwners} from '../2026-09-29-isomax-late-xor-components/ooo-pooled-owner-coherence-lib.mjs';
import {endpointGaugeTriangleKey} from '../2026-09-29-isomax-late-xor-components/ooo-pooled-endpoint-gauge-lib.mjs';
import {capacityStarTriangleKey} from '../2026-09-29-isomax-late-xor-components/ooo-pooled-capacity-star-lib.mjs';
import {rowBasis,kernelBasis} from '../2026-09-29-isomax-late-xor-components/ooo-common-carrier-level-lib.mjs';
const here=new URL('.',import.meta.url),prior=new URL('../2026-09-29-isomax-late-xor-components/',here);
const read=url=>fs.readFileSync(url,'utf8').replace(/\r\n/g,'\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const write=(name,o)=>fs.writeFileSync(new URL(name,here),JSON.stringify(o,null,2)+'\n');
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024});
const warrantText=read(new URL('OWNER_GAUGE_WARRANT_0_1.json',here)),warrant=JSON.parse(warrantText);
const sourceText=read(new URL('OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json',prior));
const inputs={warrant:hash(warrantText),source:hash(sourceText),runner:hash(read(new URL(import.meta.url)))};
const structureFile='OWNER_GAUGE_STRUCTURE_0_1.json';
if(process.argv[2]==='prepare'){
  const source=JSON.parse(sourceText);
  assert.deepEqual(source.cases.map(c=>c.source.label),['6x3-k3','4x5-k4','6x3-k4']);
  const candidates=warrant.candidates.map(([id,swapped,mode])=>{
    const keys=source.cases.map(c=>new Map(c.source.triples.map(([ti,v])=>{
      const vertices=swapped?v.map(swapVertexOwners):v;
      return [ti,mode==='FULL_EDGE_REVERSAL_ORBIT'?endpointGaugeTriangleKey(vertices,mode):capacityStarTriangleKey(vertices,mode)];
    })));
    const triangleKeys=keys.flatMap(m=>[...m.values()]);
    const featureKeys=[...new Set(triangleKeys)].sort(),index=new Map(featureKeys.map((k,i)=>[k,i]));
    const rows=source.cases.flatMap((c,ci)=>c.source.dependencies.map(d=>{
      const toggles=new Set();for(const ti of d.oooResidue){const i=index.get(keys[ci].get(ti));assert.notEqual(i,undefined);if(!toggles.delete(i))toggles.add(i);}return [...toggles].sort((a,b)=>a-b);
    }));
    const basis=rowBasis(rows);
    return {id,triangleKeys,featureKeys,rows,rank:basis.pivots.size,basis:basis.indices,kernel:kernelBasis(rows)};
  });
  const equivalent=[[0,1],[2,3],[4,5]].map(([a,b])=>{
    const forward=new Map(),reverse=new Map();let splits=0,merges=0;
    candidates[a].triangleKeys.forEach((x,i)=>{const y=candidates[b].triangleKeys[i];if(forward.has(x)&&forward.get(x)!==y)splits++;if(reverse.has(y)&&reverse.get(y)!==x)merges++;forward.set(x,y);reverse.set(y,x);});
    return {a:candidates[a].id,b:candidates[b].id,splits,merges,bijection:splits===0&&merges===0};
  });
  write(structureFile,{status:'STRUCTURE_FROZEN_NO_NEW_SCALAR_REPLAY',sourceCommit:git(['rev-parse','HEAD']).trim(),inputs,candidates,equivalent});
  console.log(JSON.stringify({candidates:candidates.map(c=>({id:c.id,rank:c.rank})),equivalent},null,2));
}else if(process.argv[2]==='replay'){
  const text=read(new URL(structureFile,here)),s=JSON.parse(text);
  const rel='research/isograph/discovery/2026-09-30-isomax-revalidation/'+structureFile;
  assert.equal(git(['show','HEAD:'+rel]),text,'structural snapshot must be committed before replay');
  assert.deepEqual(s.inputs,inputs);
  const scalar=JSON.parse(read(new URL('OOO_JOINT_DA_SCALAR_0_1.json',prior)));
  const codes=scalar.cases.flatMap(c=>c.scalarCodes);assert.equal(codes.length,462);
  const audits=s.candidates.map(c=>{
    const failures=c.kernel.map((indices,k)=>({k,indices,code:indices.reduce((v,i)=>v^codes[i],0)})).filter(x=>x.code);
    // Independently validate every claimed kernel row using BigInt feature rows.
    const rows=c.rows.map(r=>r.reduce((v,i)=>v^(1n<<BigInt(i)),0n));
    for(const row of c.kernel)assert.equal(row.reduce((v,i)=>v^rows[i],0n),0n);
    return {id:c.id,rank:c.rank,kernelDimension:c.kernel.length,scalarKernelFailures:failures.length,exact:failures.length===0,firstFailure:failures[0]??null};
  });
  write('OWNER_GAUGE_RESULT_0_1.json',{status:'BOUNDED_REPLAY_COMPLETE',structureSha256:hash(text),structureCommit:git(['rev-parse','HEAD']).trim(),scalarSourceSha256:hash(read(new URL('OOO_JOINT_DA_SCALAR_0_1.json',prior))),equivalent:s.equivalent,audits,interpretation:warrant.interpretation,rs096:'HOLD'});
  console.log(JSON.stringify(audits,null,2));
}else throw new Error('use prepare or replay');
