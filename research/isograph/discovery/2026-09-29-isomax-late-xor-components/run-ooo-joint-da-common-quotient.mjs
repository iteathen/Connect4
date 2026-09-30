import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {daDomain,paretoPairKeys,commonQuotient,PARETO_DA_MODES} from './ooo-joint-da-common-quotient-lib.mjs';

const base=new URL('.',import.meta.url);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const inputs=['EXPERIMENTAL_WARRANT_RS_078.json','ooo-joint-da-common-quotient-lib.mjs',
  'ooo-sign-channel-coupling-lib.mjs','run-ooo-joint-da-common-quotient.mjs'];
const domains=['CARTESIAN','OWNER_COUNT_REALIZABLE'].map(domain=>{
  const states=daDomain(domain),keys=states.map(paretoPairKeys);
  const columns=PARETO_DA_MODES.map((_,i)=>keys.map(row=>row[i]));
  const labels=commonQuotient(columns);
  const factorMaps=columns.map(column=>Object.fromEntries(column.map((key,i)=>[key,labels[i]])));
  const index=new Map(states.map((s,i)=>[s.join(','),i]));
  const reversals={
    simultaneous:([dp,dm,ap,am])=>[dm,dp,am,ap],
    D_only:([dp,dm,ap,am])=>[dm,dp,ap,am],
    A_only:([dp,dm,ap,am])=>[dp,dm,am,ap]
  };
  const symmetry=Object.fromEntries(Object.entries(reversals).map(([name,swap])=>{
    let inDomain=0,distinguished=0;
    states.forEach((s,i)=>{const j=index.get(swap(s).join(','));if(j!==undefined){inDomain++;if(labels[i]!==labels[j])distinguished++;}});
    return [name,{inDomain,distinguished}];
  }));
  return {domain,stateCount:states.length,quotientClassCount:new Set(labels).size,
    carrierClassCounts:columns.map(c=>new Set(c).size),
    states:states.map((state,i)=>({state,keys:keys[i],label:labels[i]})),factorMaps,symmetry};
});
const out={schema:'connect4.isomax.joint_da_common_quotient.v1',warrant:'EW-RS-078',
  sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  inputHashEncoding:'UTF8_LF',
  inputSha256:Object.fromEntries(inputs.map(f=>[f,sha256(fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n'))])),
  scalarAccess:false,domains,
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}};
fs.writeFileSync(new URL('OOO_JOINT_DA_COMMON_QUOTIENT_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(domains.map(({domain,stateCount,quotientClassCount,carrierClassCounts,symmetry})=>
  ({domain,stateCount,quotientClassCount,carrierClassCounts,symmetry})),null,2));
