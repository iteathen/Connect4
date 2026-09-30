import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {captureLateStructuralCase} from './run-ooo-sign-channel-coupling.mjs';
import {JOINT_DA_CANDIDATES,prepareRows} from './ooo-joint-da-scalar-lib.mjs';
const base=new URL('.',import.meta.url);
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const cases=[];
for(const spec of [[6,3,3],[4,5,4],[6,3,4]]){
 console.log('Preparing structural inputs for '+spec.join(','));
 const source=captureLateStructuralCase(...spec);
 const candidates=JOINT_DA_CANDIDATES.map(candidate=>prepareRows(source,candidate));
 cases.push({source,candidates});
 console.log(JSON.stringify({label:source.label,structuralRanks:candidates.map(c=>c.imageRank)}));
}
const inputs=['EXPERIMENTAL_WARRANT_RS_079.json','prepare-ooo-joint-da-scalar.mjs','ooo-joint-da-scalar-lib.mjs','ooo-joint-da-common-quotient-lib.mjs','ooo-sign-channel-coupling-lib.mjs','run-ooo-sign-channel-coupling.mjs'];
const inputSha256=Object.fromEntries(inputs.map(f=>[f,createHash('sha256').update(fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n')).digest('hex')]));
const out={schema:'connect4.isomax.joint_da_scalar_structure.v1',warrant:'EW-RS-079',sourceCommit,inputHashEncoding:'UTF8_LF',inputSha256,newScalarReplay:false,cases,holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}};
fs.writeFileSync(new URL('OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log('STRUCTURE_PREPARED: commit this artifact before scalar replay');
