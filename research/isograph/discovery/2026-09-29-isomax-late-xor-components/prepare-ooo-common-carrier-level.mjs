import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {commonQuotient} from './ooo-joint-da-common-quotient-lib.mjs';
import {JOINT_DA_CANDIDATES,jointTriangleKey} from './ooo-joint-da-scalar-lib.mjs';
import {rowBasis,linearCommonQuotient} from './ooo-common-carrier-level-lib.mjs';
const base=new URL('.',import.meta.url),read=f=>fs.readFileSync(new URL(f,base),'utf8').replace(/\r\n/g,'\n');
const sourceText=read('OOO_JOINT_DA_SCALAR_STRUCTURE_0_1.json'),source=JSON.parse(sourceText);
const catalog=[...new Set(source.cases.flatMap(c=>c.source.triples.map(([,v])=>JSON.stringify([...v].sort()))))].sort();
const index=new Map(catalog.map((key,i)=>[key,i]));
const columns=JOINT_DA_CANDIDATES.slice(2,6).map(c=>catalog.map(key=>jointTriangleKey(JSON.parse(key),c)));
const labels=commonQuotient(columns);
const cases=source.cases.map(c=>{
 const source=c.source,tripleLabels=source.triples.map(([i,v])=>[i,labels[index.get(JSON.stringify([...v].sort()))]]);
 const featureKeys=[...new Set(tripleLabels.map(([,l])=>l))].sort((a,b)=>a-b);
 const featureIndex=new Map(featureKeys.map((key,i)=>[key,i])),tripleIndex=new Map(tripleLabels);
 const structuralRows=source.dependencies.map(d=>{
  const toggles=new Set();for(const ti of d.oooResidue){const fi=featureIndex.get(tripleIndex.get(ti));if(toggles.has(fi))toggles.delete(fi);else toggles.add(fi);}return [...toggles].sort((a,b)=>a-b);
 });
 const triangle={id:'TRIANGLE_COMMON_OBSERVED_UNION',tripleLabels,featureKeys,structuralRows,basisDependencyIndices:rowBasis(structuralRows).indices,imageRank:rowBasis(structuralRows).pivots.size};
 const linear={id:'DEPENDENCY_COMMON_LINEAR',...linearCommonQuotient(c.candidates.slice(2,6).map(p=>p.structuralRows))};
 return {label:source.label,candidates:[triangle,linear]};
});
const inputs=['EXPERIMENTAL_WARRANT_RS_080.json','ooo-common-carrier-level-lib.mjs','prepare-ooo-common-carrier-level.mjs','ooo-joint-da-scalar-lib.mjs'];
const hash=s=>createHash('sha256').update(s).digest('hex');
const out={schema:'connect4.isomax.common_carrier_level_structure.v1',warrant:'EW-RS-080',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceStructureSha256:hash(sourceText),inputSha256:Object.fromEntries(inputs.map(f=>[f,hash(read(f))])),newScalarReplay:false,catalog,columns,labels,commonTriangleClasses:new Set(labels).size,cases,holdouts:source.holdouts};
fs.writeFileSync(new URL('OOO_COMMON_CARRIER_LEVEL_STRUCTURE_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({triples:catalog.length,commonTriangleClasses:out.commonTriangleClasses,cases:cases.map(c=>({label:c.label,ranks:c.candidates.map(p=>p.imageRank)}))},null,2));
