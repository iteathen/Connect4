import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {coupleFamilyPair} from './ooo-sign-channel-coupling-lib.mjs';
const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('OOO_JOINT_DA_COMMON_QUOTIENT_0_1.json',base)));
assert.equal(result.warrant,'EW-RS-078');
assert.equal(result.scalarAccess,false);
assert.equal(result.inputHashEncoding,'UTF8_LF');
for(const [f,hash] of Object.entries(result.inputSha256))
  assert.equal(createHash('sha256').update(fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n')).digest('hex'),hash);
assert.deepEqual(result.domains.map(x=>x.domain),['CARTESIAN','OWNER_COUNT_REALIZABLE']);
const modes=[['TOTAL','SIGNED_NET'],['SIGNED_NET','TOTAL'],['ABS_NET','SEPARATED'],['SEPARATED','ABS_NET']];
const summaries=[];
for(const d of result.domains){
  // Independent domain oracle: exact integer witnesses plus the warrant's
  // exhaustive symbolic tail proof. This scan is a check, not the tail proof.
  const feasible=new Set();
  for(let x=0;x<=12;x++)for(let y=0;y<=12;y++)feasible.add([Math.min(3,x+y),Math.min(2,Math.abs(x-y))].join(','));
  assert.equal(feasible.size,7);
  const expected=[];
  for(let p=0;p<4;p++)for(let m=0;m<4;m++)for(let a=0;a<3;a++)for(let b=0;b<3;b++)
    if(d.domain==='CARTESIAN'||(feasible.has(p+','+a)&&feasible.has(m+','+b)))expected.push([p,m,a,b]);
  assert.deepEqual(d.states.map(x=>x.state),expected);
  assert.equal(d.stateCount,expected.length);
  for(const row of d.states){
    const [p,m,a,b]=row.state;
    assert.deepEqual(row.keys,modes.map(([D,A])=>coupleFamilyPair('D',p,m,D)+'|'+coupleFamilyPair('A',a,b,A)));
  }
  // Independent graph traversal checks the union-find result, including
  // maximality: neither a false split nor a false merge is admissible.
  const seen=new Set(),labels=Array(d.stateCount);
  for(let i=0;i<d.stateCount;i++){
    if(seen.has(i))continue;
    const pending=[i];seen.add(i);
    while(pending.length){
      const u=pending.pop();labels[u]=i;
      for(let v=0;v<d.stateCount;v++)
        if(!seen.has(v)&&modes.some((_,k)=>d.states[u].keys[k]===d.states[v].keys[k])){seen.add(v);pending.push(v);}
    }
  }
  assert.deepEqual(d.states.map(x=>x.label),labels);
  assert.equal(new Set(labels).size,d.quotientClassCount);
  for(let k=0;k<4;k++){
    const entries=new Map();
    d.states.forEach(row=>{
      if(entries.has(row.keys[k]))assert.equal(entries.get(row.keys[k]),row.label);
      entries.set(row.keys[k],row.label);
    });
    assert.deepEqual(d.factorMaps[k],Object.fromEntries(entries));
    assert.equal(d.carrierClassCounts[k],entries.size);
  }
  const swaps={simultaneous:([p,m,a,b])=>[m,p,b,a],D_only:([p,m,a,b])=>[m,p,a,b],A_only:([p,m,a,b])=>[p,m,b,a]};
  for(const [name,swap] of Object.entries(swaps)){
    let inDomain=0,distinguished=0;
    d.states.forEach(row=>{const other=d.states.find(x=>x.state.join(',')===swap(row.state).join(','));if(other){inDomain++;if(row.label!==other.label)distinguished++;}});
    assert.deepEqual(d.symmetry[name],{inDomain,distinguished});
  }
  summaries.push({domain:d.domain,states:d.stateCount,classes:d.quotientClassCount,symmetry:d.symmetry});
}
const out={schema:'connect4.isomax.joint_da_common_quotient_verify.v1',warrant:'EW-RS-078',status:'PASS',
  evidenceClass:'INTERNAL-QUALIFICATION',method:'independent graph traversal versus union-find; canonical interval map shared',
  scalarQualification:false,domains:summaries,holdouts:result.holdouts};
fs.writeFileSync(new URL('OOO_JOINT_DA_COMMON_QUOTIENT_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
