// Operation census only. Wrapped callbacks must never supply timing evidence.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const [library,out]=process.argv.slice(2);
if(fs.existsSync(out))throw Error('refuse evidence overwrite');
const load=f=>import(pathToFileURL(path.join(library,'addons',f)));
const {prepareConnect4RbaGeometry,prepareConnect4RbaCoordinateScratch}=await load('rba-connect4-geometry.mjs');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile.mjs');
const {connect4RbaCofactorKnownLegal}=await load('rba-connect4-coordinate.mjs');
const {connect4RbaFromMoves}=await load('rba-connect4-solver.mjs');
const g=prepareConnect4RbaGeometry({columns:7,rows:6}),base=prepareConnect4RbaExecutionProfile(g);
let subsetPreparations=0,subsetTests=0,transitions=0,terminals=0;
const profile={...base,
  prepareSubset(g,id){subsetPreparations++;return base.prepareSubset(g,id);},
  shapeSubsetPrepared(g,a,b){subsetTests++;return base.shapeSubsetPrepared(g,a,b);}};
const words=new Uint32Array(g.keyWords),basis=new Uint32Array(g.maxBasis),size=new Uint32Array(1),scratch=prepareConnect4RbaCoordinateScratch(g),digest=createHash('sha256');
for(const input of ['45461667','13333111271421','13333111444444'])for(let rank=0;rank<=input.length;rank++){
  const moves=Array.from(input.slice(0,rank),c=>c.charCodeAt(0)-49),q=connect4RbaFromMoves(moves,{geometry:g,canonical:false});
  for(let column=0;column<7;column++)if(q.words[column]<6){
    const terminal=connect4RbaCofactorKnownLegal(g,profile,q.words,0,q.basis,0,q.basis.length,column,
      words,0,basis,0,scratch.seen,size,0,scratch.map,scratch.inverse);
    transitions++;if(terminal)terminals++;
    digest.update(new Uint8Array(words.buffer));digest.update(new Uint8Array(basis.buffer,0,size[0]*4));
  }
}
const result={transitions,terminals,subsetPreparations,subsetTests,childContentSha256:digest.digest('hex'),timingEvidence:false};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
