import fs from 'node:fs';
import assert from 'node:assert/strict';

function lineFamily(dc,dr){
 if(dc===1&&dr===0)return 'H';
 if(dc===0&&dr===1)return 'V';
 return 'D';
}
function lines(width,height,k,families){
 const allowed=new Set(families),dirs=[[1,0],[0,1],[1,1],[1,-1]],out=[];
 for(let r=0;r<height;r++)for(let c=0;c<width;c++)for(const [dc,dr] of dirs){
  const fam=lineFamily(dc,dr);if(!allowed.has(fam))continue;
  const ec=c+(k-1)*dc,er=r+(k-1)*dr;
  if(ec<0||ec>=width||er<0||er>=height)continue;
  const cells=[];for(let i=0;i<k;i++)cells.push([c+i*dc,r+i*dr]);
  cells.sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
  out.push({family:fam,cells});
 }
 const key=x=>x.cells.map(([c,r])=>c+','+r).join(';');
 const uniq=new Map(out.map(x=>[key(x),x]));
 return [...uniq.values()].sort((a,b)=>key(a).localeCompare(key(b)));
}
function keyLine(line){return line.cells.map(([c,r])=>c+','+r).join(';');}
function transposeLine(line){
 const fam=line.family==='H'?'V':line.family==='V'?'H':'D';
 const cells=line.cells.map(([c,r])=>[r,c]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
 return {family:fam,cells};
}
function degreeMultiset(width,height,ls){
 const counts=Array(width*height).fill(0);
 for(const l of ls)for(const [c,r] of l.cells)counts[r*width+c]++;
 return counts.sort((a,b)=>a-b);
}
function intersectionMultiset(ls){
 const out=[];
 for(let i=0;i<ls.length;i++)for(let j=i+1;j<ls.length;j++){
  const a=new Set(ls[i].cells.map(x=>x.join(',')));
  let n=0;for(const x of ls[j].cells)if(a.has(x.join(',')))n++;
  out.push(n);
 }
 return out.sort((a,b)=>a-b);
}
const pairs=[{"id":"T-K4-HD","k":4,"source":{"width":5,"height":4,"families":["H","D"]},"target":{"width":4,"height":5,"families":["V","D"]}},{"id":"T-K3-H","k":3,"source":{"width":5,"height":4,"families":["H"]},"target":{"width":4,"height":5,"families":["V"]}},{"id":"T-K3-HV","k":3,"source":{"width":5,"height":4,"families":["H","V"]},"target":{"width":4,"height":5,"families":["H","V"]}},{"id":"T-K3-VD","k":3,"source":{"width":5,"height":4,"families":["V","D"]},"target":{"width":4,"height":5,"families":["H","D"]}}];
const rows=pairs.map(p=>{
 const s=lines(p.source.width,p.source.height,p.k,p.source.families),
  t=lines(p.target.width,p.target.height,p.k,p.target.families),
  mapped=s.map(transposeLine).sort((a,b)=>keyLine(a).localeCompare(keyLine(b))),
  sk=mapped.map(keyLine),tk=t.map(keyLine);
 const exact=JSON.stringify(sk)===JSON.stringify(tk),
  sourceDegrees=degreeMultiset(p.source.width,p.source.height,s),
  targetDegrees=degreeMultiset(p.target.width,p.target.height,t),
  degreesEqual=JSON.stringify(sourceDegrees)===JSON.stringify(targetDegrees),
  sourceInts=intersectionMultiset(s),targetInts=intersectionMultiset(t),
  intersectionsEqual=JSON.stringify(sourceInts)===JSON.stringify(targetInts);
 assert.equal(exact,true);assert.equal(degreesEqual,true);assert.equal(intersectionsEqual,true);
 return {
  id:p.id,k:p.k,source:p.source,target:p.target,
  sourceLines:s.length,targetLines:t.length,
  exactTransposeLineSet:exact,
  cellIncidenceDegreeMultisetEqual:degreesEqual,
  lineIntersectionMultisetEqual:intersectionsEqual,
  sourceDegreeMultiset:sourceDegrees,
  intersectionHistogram:Object.fromEntries([...new Set(sourceInts)].map(n=>[n,sourceInts.filter(x=>x===n).length])),
 };
});
const out={
 schema:'connect4.isomax.discovery.transpose_hypergraph_audit.v1',
 date_author_local:'2026-09-29',warrant:'EW-013',rows,
 allExact:rows.every(x=>x.exactTransposeLineSet&&x.cellIncidenceDegreeMultisetEqual&&x.lineIntersectionMultisetEqual),
 interpretation_guard:'Static geometry only; gravity/support transition order is deliberately not included.'
};
fs.writeFileSync(new URL('./TRANSPOSE_HYPERGRAPH_AUDIT_0_1.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'EW013_COMPLETE',allExact:out.allExact,rows:rows.map(x=>({id:x.id,lines:x.sourceLines,exact:x.exactTransposeLineSet}))},null,2));
