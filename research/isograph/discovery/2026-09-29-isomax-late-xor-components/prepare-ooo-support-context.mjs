import fs from 'node:fs';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {JOINT_DA_CANDIDATES,jointTriangleKey} from './ooo-joint-da-scalar-lib.mjs';import {rowBasis} from './ooo-common-carrier-level-lib.mjs';import {supportProfileCommon} from './ooo-support-context-lib.mjs';
const base=new URL('.',import.meta.url),read=f=>fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const source=JSON.parse(read('OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json')),prev=JSON.parse(read('OOO_COMMON_CARRIER_LEVEL_STRUCTURE_0_1.json')),local=JSON.parse(read('OOO_CONTEXTUAL_TRIANGLE_STRUCTURE_0_1.json'));
const catalog=prev.catalog,index=new Map(catalog.map((key,i)=>[key,i])),domains=source.cases.map(c=>[...new Set(c.source.triples.map(([,v])=>index.get(JSON.stringify([...v].sort()))))].sort((a,b)=>a-b));
const {profiles,labels}=supportProfileCommon(domains,prev.columns),caseRanges=[];let offset=0;
for(const c of source.cases){caseRanges.push({label:c.source.label,start:offset,count:c.source.dependencies.length});offset+=c.source.dependencies.length;}
const candidateIds=['SUPPORT_PROFILE_COMMON','GEOMETRY_TAGGED_LOCAL_CONTROL',...JOINT_DA_CANDIDATES.slice(2).map(c=>c.id)];
const candidates=candidateIds.map((id,k)=>{
 const maps=source.cases.map((c,ci)=>new Map(c.source.triples.map(([ti,v])=>[ti,k===0?'SUPPORT:'+labels[index.get(JSON.stringify([...v].sort()))]:k===1?ci+':LOCAL:'+new Map(local.cases[ci].local.tripleLabels).get(ti):jointTriangleKey(v,JOINT_DA_CANDIDATES[k])])));
 const featureKeys=[...new Set(maps.flatMap(m=>[...m.values()]))].sort(),fidx=new Map(featureKeys.map((key,i)=>[key,i]));
 const structuralRows=source.cases.flatMap((c,ci)=>c.source.dependencies.map(d=>{const set=new Set();for(const ti of d.oooResidue){const fi=fidx.get(maps[ci].get(ti));if(set.has(fi))set.delete(fi);else set.add(fi);}return [...set].sort((a,b)=>a-b);}));
 const perCarrier=caseRanges.map(range=>{const rows=structuralRows.slice(range.start,range.start+range.count),b=rowBasis(rows);return {...range,imageRank:b.pivots.size,basisDependencyIndices:b.indices};});
 const b=rowBasis(structuralRows);return {id,featureKeys,structuralRows,imageRank:b.pivots.size,basisDependencyIndices:b.indices,perCarrier};
});
const inputs=['EXPERIMENTAL_WARRANT_RS_082.json','ooo-support-context-lib.mjs','prepare-ooo-support-context.mjs','OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json','OOO_COMMON_CARRIER_LEVEL_STRUCTURE_0_1.json','OOO_CONTEXTUAL_TRIANGLE_STRUCTURE_0_1.json'];
const out={schema:'connect4.isomax.support_context_structure.v1',warrant:'EW-RS-082',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),inputSha256:Object.fromEntries(inputs.map(f=>[f,hash(read(f))])),newScalarReplay:false,catalog,profiles,labels,caseRanges,candidates,holdouts:source.holdouts};fs.writeFileSync(new URL('OOO_SUPPORT_CONTEXT_STRUCTURE_0_1.json',base),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(candidates.map(c=>({id:c.id,rank:c.imageRank,perCarrier:c.perCarrier.map(p=>p.imageRank)})),null,2));
