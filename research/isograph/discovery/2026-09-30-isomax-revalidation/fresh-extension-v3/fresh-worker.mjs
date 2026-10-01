import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createFreshOracle,FRESH_CASES,ORACLE_COMMIT,ORACLE_SHA256,ADAPTED_SHA256} from './fresh-oracle-adapter.mjs';
import {preparePolynomial,factorization,sparseRank} from './fresh-polynomial.mjs';
import {atomicWrite} from './fresh-io.mjs';
assert.equal(process.env.FRESH_SUPERVISED,'1','Use fresh-run.mjs for bounded execution');
const [phase,label,snapshotCommit]=process.argv.slice(2);assert.ok(['prepare','replay'].includes(phase));assert.ok(FRESH_CASES.includes(label));
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../../../..'),target=path.join(here,'fresh-'+label),warrantPath=path.join(here,'FRESH_OOO_WARRANT.json');
const warrant=JSON.parse(fs.readFileSync(warrantPath)),caps=warrant.caps;fs.mkdirSync(target,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
const atomic=atomicWrite;
const write=(name,data)=>atomic(path.join(target,name),JSON.stringify(data,null,2)+'\n');
const read=name=>JSON.parse(fs.readFileSync(path.join(target,name)));
const checkpointExists=name=>fs.existsSync(path.join(target,name))&&fs.existsSync(path.join(target,name+'.sha256'));
const saveGzip=(name,data)=>{const json=JSON.stringify(data);assert.ok(Buffer.byteLength(json)<=caps.snapshotBytes,'RESOURCE_CENSORED: snapshot byte cap');const bytes=gzipSync(json),sha256=hash(bytes);atomic(path.join(target,name),bytes);atomic(path.join(target,name+'.sha256'),sha256+'\n');return {file:name,sha256,bytes:bytes.length};};
const readGzip=name=>{const bytes=fs.readFileSync(path.join(target,name));assert.equal(hash(bytes),fs.readFileSync(path.join(target,name+'.sha256'),'utf8').trim(),'Checkpoint checksum mismatch: '+name);return JSON.parse(gunzipSync(bytes));};
const sourceFiles=['fresh-worker.mjs','fresh-run.mjs','fresh-polynomial.mjs','fresh-oracle-adapter.mjs','fresh-io.mjs','packed-rank-scalable.mjs','FRESH_EXECUTION_ADAPTATION_0_3.json','FRESH_OOO_WARRANT.json'];
const sources=Object.fromEntries(sourceFiles.map(f=>[f,hash(fs.readFileSync(path.join(here,f),'utf8').replace(/\r\n/g,'\n'))]));
const identity={sources,sourceHashConvention:'UTF8_LF',oracleCommit:ORACLE_COMMIT,oracleSha256:ORACLE_SHA256,adaptedSha256:ADAPTED_SHA256};
const configHash=hash(JSON.stringify({label,identity})),ledgerPath=path.join(target,'fresh-resource-ledger.json');
const previous=fs.existsSync(ledgerPath)?read('fresh-resource-ledger.json'):{elapsedMs:0};
const started=Date.now();let ticks=0,lastLedger=started,stage=phase;
const elapsed=()=>previous.elapsedMs+Date.now()-started;
function ledger(status,extra={}){write('fresh-resource-ledger.json',{configHash,label,phase,stage,status,elapsedMs:elapsed(),...extra});lastLedger=Date.now();}
function guard(event={}){if(event.states!==undefined)assert.ok(event.states<=caps.states,'RESOURCE_CENSORED: reachable-state cap');if(++ticks%256!==0)return;assert.ok(elapsed()<=caps.wallMsPerCandidate,'RESOURCE_CENSORED: per-candidate time cap');assert.ok(process.memoryUsage().rss<=caps.rssBytes,'RESOURCE_CENSORED: process RSS cap');if(Date.now()-lastLedger>5000)ledger('RUNNING');}
if(previous.configHash)assert.equal(previous.configHash,configHash,'Source/configuration changed across resume');
const [W,H,K]=label.match(/(\d+)x(\d+)-k(\d+)/).slice(1).map(Number),oracle=createFreshOracle(W,H,K,guard);
const rankFile=r=>'fresh-rank-'+String(r).padStart(2,'0')+'.json.gz';
function enumerate(){stage='enumerate';return oracle.enumerate({loadRank:r=>checkpointExists(rankFile(r))?readGzip(rankFile(r)):null,saveRank:(r,codes)=>{if(!checkpointExists(rankFile(r)))saveGzip(rankFile(r),codes);},progress:event=>{ledger('RUNNING',event);console.log(JSON.stringify(event));}});}
try{
  ledger('RUNNING');
  if(phase==='prepare'){
    assert.ok(!fs.existsSync(path.join(target,'fresh-replay-result.json')),'Already exposed: do not prepare anew');
    if(fs.existsSync(path.join(target,'fresh-structure-manifest.json'))){assert.equal(read('fresh-structure-manifest.json').configHash,configHash);console.log('Structural snapshot already complete');ledger('STRUCTURE_ALREADY_COMPLETE');process.exit(0);}
    enumerate();stage='classes';const discoveryKeys=[],keyIndex=new Map(),classShards=[];let offset=0,t2OStates=0;
    for(let rank=0;rank<=W*H;rank++){
      const name='fresh-classes-'+String(rank).padStart(2,'0')+'.json.gz';let shard;
      if(checkpointExists(name)){shard=readGzip(name);assert.equal(shard.offset,offset);for(const key of shard.introduced){assert.ok(!keyIndex.has(key));keyIndex.set(key,discoveryKeys.length);discoveryKeys.push(key);}}
      else{
        const introduced=[],mapping=[];
        for(let i=oracle.rankStarts[rank];i<oracle.rankStarts[rank+1];i++){
          const row=oracle.row(oracle.codes[i]);assert.equal(row.wdlAbsolute,null,'Scalar accessed during prepare');
          if(row.t2!=='O'){mapping.push(-1);continue;}
          const key=JSON.stringify(row.roleCapparZoe);let id=keyIndex.get(key);
          if(id===undefined){id=discoveryKeys.length;keyIndex.set(key,id);discoveryKeys.push(key);introduced.push(key);assert.ok(discoveryKeys.length<=caps.classes,'RESOURCE_CENSORED: repaired-class cap');}
          mapping.push(id);
        }
        shard={rank,offset,introduced,mapping};saveGzip(name,shard);
      }
      t2OStates+=shard.mapping.filter(x=>x>=0).length;offset+=shard.mapping.length;classShards.push({file:name,sha256:hash(fs.readFileSync(path.join(target,name)))});ledger('RUNNING',{rank,states:offset,classes:discoveryKeys.length});
    }
    assert.equal(offset,oracle.codes.length);stage='polynomial';
    const polynomial=preparePolynomial(discoveryKeys.map(JSON.parse),{maxClasses:caps.classes,maxOooKeys:caps.oooKeys,maxIncidences:caps.incidences,check:guard});
    const sortedIndex=new Map(polynomial.classKeys.map((k,i)=>[k,i])),discoveryToSorted=discoveryKeys.map(k=>sortedIndex.get(k));
    const snapshot=saveGzip('fresh-structure.json.gz',{identity,configHash,label,polynomial,discoveryToSorted});
    const rankShards=Array.from({length:W*H+1},(_,rank)=>({file:rankFile(rank),sha256:hash(fs.readFileSync(path.join(target,rankFile(rank))))}));
    write('fresh-structure-manifest.json',{schema:'fresh.ooo.structure.v1',label,configHash,identity,states:oracle.codes.length,t2OStates,classes:polynomial.classKeys.length,affineRank:polynomial.affineRank,lowerRank:polynomial.lowerRank,oooRank:polynomial.oooRank,leftNullity:polynomial.leftNullity,newScalarReplay:false,status:polynomial.oooRank?'STRUCTURALLY_ELIGIBLE_AWAIT_COMMITTED_SNAPSHOT':'STRUCTURALLY_VACUOUS',snapshot,rankShards,classShards});
    ledger('STRUCTURE_COMPLETE');console.log(JSON.stringify({label,classes:polynomial.classKeys.length,oooRank:polynomial.oooRank,newScalarReplay:false}));
  }else{
    assert.ok(snapshotCommit&&/^[0-9a-f]{40}$/.test(snapshotCommit),'Replay requires reviewed structural snapshot commit SHA');
    const manifest=read('fresh-structure-manifest.json');assert.equal(manifest.configHash,configHash);assert.ok(manifest.oooRank>0,'STRUCTURALLY_VACUOUS: no replay');
    const prefix=path.relative(root,target).split(path.sep).join('/');
    for(const item of [{file:'fresh-structure-manifest.json',sha256:hash(fs.readFileSync(path.join(target,'fresh-structure-manifest.json')))},manifest.snapshot,...manifest.rankShards,...manifest.classShards]){
      const local=fs.readFileSync(path.join(target,item.file));assert.equal(hash(local),item.sha256,'Snapshot changed: '+item.file);
      const committed=execFileSync('git',['show',snapshotCommit+':'+prefix+'/'+item.file],{cwd:root,maxBuffer:caps.snapshotBytes});assert.equal(hash(committed),item.sha256,'Snapshot is not committed: '+item.file);
    }
    // Source identities use UTF8_LF; compare the same normalized bytes with the reviewed commit.
    for(const file of sourceFiles){const committed=execFileSync('git',['show',snapshotCommit+':'+path.relative(root,path.join(here,file)).split(path.sep).join('/')],{cwd:root,encoding:'utf8'});assert.equal(committed.replace(/\r\n/g,'\n'),fs.readFileSync(path.join(here,file),'utf8').replace(/\r\n/g,'\n'),'Source not in snapshot commit: '+file);}
    const snapshot=readGzip(manifest.snapshot.file),p=snapshot.polynomial;enumerate();stage='solve';
    const valuesFile=path.join(target,'fresh-values.bin');
    const saveValues=current=>{const bytes=Buffer.from(current.buffer,current.byteOffset,current.byteLength);atomic(valuesFile,bytes);atomic(valuesFile+'.sha256',hash(bytes)+'\n');};
    let restored=null;if(checkpointExists('fresh-values.bin')){const bytes=fs.readFileSync(valuesFile);assert.equal(hash(bytes),fs.readFileSync(valuesFile+'.sha256','utf8').trim(),'Value checkpoint checksum mismatch');restored=new Int8Array(bytes);}
    const values=oracle.solve({restored,saveValues,progress:event=>{ledger('SCALAR_RUNNING',event);}});
    saveValues(values);stage='purity';
    const classCodes=Array(p.classKeys.length).fill(null);let purityFailure=null;
    for(const item of manifest.classShards){const shard=readGzip(item.file);for(let i=0;i<shard.mapping.length;i++){
      guard();const discovery=shard.mapping[i];if(discovery<0)continue;const ci=snapshot.discoveryToSorted[discovery],value=values[shard.offset+i],code=value===-1?0:value===0?1:value===1?2:null;assert.notEqual(code,null);
      if(classCodes[ci]===null)classCodes[ci]=code;else if(classCodes[ci]!==code&&!purityFailure)purityFailure={classIndex:ci,classKey:p.classKeys[ci],firstCode:classCodes[ci],conflictingCode:code,stateCode:oracle.codes[shard.offset+i]};
    }}
    assert.ok(classCodes.every(x=>x!==null));saveGzip('fresh-class-codes.json.gz',classCodes);
    let result={label,configHash,snapshotCommit,status:'COORDINATE_PURITY_FAILURE',purityFailure,newScalarReplay:true};
    if(!purityFailure){
      stage='factorization';const affineCols=new Set(p.affineColumns),affine=factorization(p.rowsLow.map(r=>r.filter(i=>affineCols.has(i))),classCodes,{check:guard}),degree2=factorization(p.rowsLow,classCodes,{check:guard});
      const dependencyCodes=p.dependencies.map(d=>d.sourceIndices.reduce((code,i)=>code^classCodes[i],0));
      const scalarImageDimension=sparseRank(dependencyCodes.map(v=>[...(v&1?[0]:[]),...(v&2?[1]:[])]));
      assert.equal(scalarImageDimension===0,degree2.exact);
      const ooo=factorization(p.dependencies.map(d=>d.oooResidue),dependencyCodes,{check:guard});
      const frozenKernelObstructions=p.oooKernelDependencyIndices.map((indices,kernelIndex)=>({kernelIndex,scalarXor:indices.reduce((v,i)=>v^dependencyCodes[i],0)})).filter(x=>x.scalarXor);
      assert.equal(frozenKernelObstructions.length===0,ooo.exact,'Frozen pre-scalar OOO kernel disagrees with replay elimination');
      let failureCertificate=null;if(ooo.firstFailure){const toggled=new Set();for(const di of ooo.firstFailure.rowIndices)for(const ci of p.dependencies[di].sourceIndices){if(!toggled.delete(ci))toggled.add(ci);}failureCertificate={...ooo.firstFailure,classIndices:[...toggled].sort((a,b)=>a-b)};}
      result={...result,status:!scalarImageDimension?'SCALAR_OOO_VACUOUS':ooo.exact?'BOUNDED_FRESH_NONAFFINE_FULL_OOO_QUALIFICATION':'FRESH_FULL_OOO_FALSIFIER',affine,degree2,scalarImageDimension,ooo,frozenKernelObstructions,failureCertificate,scope:'Full OOO only; not RS095, universal cubic, Q_A/Q_F or 7x6'};
    }
    write('fresh-replay-result.json',result);ledger('SCALAR_COMPLETE');console.log(JSON.stringify(result));
  }
}catch(error){ledger(error.message.includes('RESOURCE_CENSORED')?'RESOURCE_CENSORED':'FAILED',{error:error.message});throw error;}
