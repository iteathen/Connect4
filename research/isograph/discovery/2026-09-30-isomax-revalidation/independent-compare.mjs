// Comparison orchestration imports the reference adapter explicitly. The oracle
// module and independent runner never import any reference implementation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {isDeepStrictEqual} from 'node:util';
import {assertCarrier,canonicalExternalImage} from './independent-oracle.mjs';
import {legacyStateRecords,LEGACY_SOURCE} from './legacy-state-adapter.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)),label=process.argv[2];
const match=/^(\d+)x(\d+)-k(\d+)$/.exec(label??'');if(!match)throw new Error('Expected trained carrier label');
const [W,H,K]=match.slice(1).map(Number);assertCarrier(W,H,K);
const target=path.join(here,`independent-${label}`),manifest=JSON.parse(fs.readFileSync(path.join(target,'independent-state-manifest.json')));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const output=path.join(target,'independent-comparison.json');
const write=result=>{fs.writeFileSync(output+'.partial',JSON.stringify(result,null,2)+'\n');fs.renameSync(output+'.partial',output);};
const fields=['key','a','b','rank','h','terminal','winner','wdlAbsolute','t2','q','rfg','components','roleCapparZoe'];
const fieldMismatches=Object.fromEntries(fields.map(f=>[f,0]));
let shardIndex=0,current=[],rowIndex=0,compared=0,missingIndependent=0,firstMismatches=[];
const sourceIdentity={legacySource:hash(fs.readFileSync(LEGACY_SOURCE)),adapter:hash(fs.readFileSync(new URL('./legacy-state-adapter.mjs',import.meta.url))),comparison:hash(fs.readFileSync(fileURLToPath(import.meta.url))),independentConfigHash:manifest.configHash};
function next(){
  if(rowIndex===current.length){if(shardIndex===manifest.shards.length)return null;const shard=manifest.shards[shardIndex++],bytes=fs.readFileSync(path.join(target,shard.file));if(hash(bytes)!==shard.sha256)throw new Error('Independent row shard integrity mismatch: '+shard.file);current=gunzipSync(bytes).toString('utf8').trimEnd().split('\n').map(JSON.parse);rowIndex=0;}
  return current[rowIndex++];
}
const base=()=>({label,sourceIdentity,compared,expectedIndependentStates:manifest.counts.states,fieldMismatches,missingIndependent,firstMismatches,qualification:'PENDING',discovery:'NO_NEW_DISCOVERY_REQUESTED'});
write({...base(),phase:'STARTED',started:new Date().toISOString()});
try{
  const legacy=legacyStateRecords(W,H,K,reference=>{
    const independent=next();if(!independent){missingIndependent++;return;}
    for(const field of fields)if(!isDeepStrictEqual(independent[field],reference[field])){fieldMismatches[field]++;if(firstMismatches.length<20)firstMismatches.push({ordinal:compared,field,independentKey:independent.key,referenceKey:reference.key,independent:independent[field],reference:reference[field]});}
    compared++;
    if(compared%100000===0){write({...base(),phase:'STATEWISE'});process.stdout.write(JSON.stringify({label,compared,fieldMismatches})+'\n');}
  },{captureOoo:!process.argv.includes('--skip-ooo')});
  const extraIndependent=next()!==null;
  let oooComparison=null;
  if(legacy.ooo){
    const independent=JSON.parse(fs.readFileSync(path.join(target,'independent-ooo-image.json'))),reference=canonicalExternalImage(legacy.ooo.semanticTriples,legacy.ooo.dependencies);
    const exactImageMatch=isDeepStrictEqual(independent.oooColumns,reference.oooColumns)&&isDeepStrictEqual(independent.rref,reference.rref);
    oooComparison={independent:{structuralClasses:independent.structuralClasses,lowerRank:independent.lowerRank,leftNullity:independent.leftNullity,oooRank:independent.oooRank,canonicalImageSha256:independent.canonicalImageSha256},reference:{structuralClasses:legacy.ooo.structuralClasses,lowerRank:legacy.ooo.lowerRank,leftNullity:legacy.ooo.dependencies.length,oooRank:reference.oooRank,canonicalImageSha256:reference.canonicalImageSha256},exactImageMatch,referenceDependencySha256:hash(JSON.stringify(legacy.ooo.dependencies)),referenceSemanticTripleSha256:hash(JSON.stringify(legacy.ooo.semanticTriples))};
    fs.writeFileSync(path.join(target,'independent-reference-ooo-certificate.json'),JSON.stringify(reference)+'\n');
  }
  const statewiseMatch=!missingIndependent&&!extraIndependent&&compared===manifest.counts.states&&Object.values(fieldMismatches).every(n=>n===0);
  const oooMatch=oooComparison?.exactImageMatch&&isDeepStrictEqual(oooComparison.independent,oooComparison.reference);
  const result={...base(),phase:'COMPLETE',legacyStates:legacy.states,extraIndependent,statewiseMatch,oooComparison,qualification:statewiseMatch&&oooMatch?'BOUNDED_STATEWISE_AND_OOO_AGREEMENT':statewiseMatch&&oooComparison===null?'STATEWISE_AGREEMENT_OOO_NOT_RUN':'MISMATCH',completed:new Date().toISOString()};write(result);process.stdout.write(JSON.stringify(result)+'\n');
  if(!statewiseMatch||(oooComparison&&!oooMatch))process.exitCode=1;
}catch(error){write({...base(),phase:'FAILED',error:error.message});throw error;}
