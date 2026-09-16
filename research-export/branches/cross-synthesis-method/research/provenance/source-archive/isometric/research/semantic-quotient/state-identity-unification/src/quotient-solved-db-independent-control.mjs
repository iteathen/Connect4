#!/usr/bin/env node
// Independent replay, assignment construction and BDD traversal. This does not
// import the discovery reader, structural projector or its transition function.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const [directory,evidencePath,outputPath]=process.argv.slice(2);
if(!directory||!evidencePath||!outputPath)throw Error('usage: independent-control <db> <evidence> <output>');
const evidence=JSON.parse(await readFile(evidencePath,'utf8'));
const buffers=new Map();
for(const file of evidence.provenance.files){
  const bytes=await readFile(join(directory,file.name));
  assert.equal(bytes.length,file.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  buffers.set(file.name,new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength));
}
const width=7,height=6;
function replayIndependent(path){
  const board=Array.from({length:height},()=>Array(width).fill(null));
  const heights=Array(width).fill(0);
  for(let i=0;i<path.length;i++){
    const c=path[i],r=heights[c]++;
    assert.ok(Number.isInteger(c)&&c>=0&&c<width&&r<height);
    board[r][c]=i%2;
    for(const [dx,dy]of [[1,0],[0,1],[1,1],[1,-1]]){
      let run=1;
      for(const sign of [-1,1])for(let k=1;k<4;k++){
        const x=c+sign*k*dx,y=r+sign*k*dy;
        if(x<0||x>=width||y<0||y>=height||board[y][x]!==i%2)break;
        run++;
      }
      if(run>=4)return {terminal:true,board,heights};
    }
  }
  return {terminal:false,board,heights};
}
function queryIndependent(path){
  const {board,heights,terminal}=replayIndependent(path);assert.equal(terminal,false);
  const assignment=Array(51).fill(false);assignment[1]=path.length%2===0;
  let key=0; // 49 bits: exactly representable in Number, no BigInt/bitwise truncation
  for(let c=0;c<width;c++){
    assignment[2+c*7+heights[c]]=true;key+=2**(c*7+heights[c]);
    for(let r=0;r<heights[c];r++)if(board[r][c]===0){assignment[2+c*7+r]=true;key+=2**(c*7+r);}
  }
  const flags=[];
  for(const kind of ['win','loss']){
    const data=buffers.get(`bdd_w7_h6_${path.length}_${kind}.10.bin`);assert.ok(data);
    let address=data.byteLength-9,hops=0;
    while(data.getUint8(address)!==0){
      const variable=data.getUint8(address);assert.ok(variable>0&&variable<=50);
      address=9*data.getUint32(address+(assignment[variable]?5:1),true);
      assert.ok(address>=0&&address<data.byteLength&&++hops<=50);
    }
    const flag=data.getUint32(address+1,true);assert.ok(flag===0||flag===1);flags.push(flag);
  }
  assert.ok(flags[0]+flags[1]<=1);
  return {relative:flags[0]-flags[1],key:String(key)};
}
const book=new Map((await readFile(join(directory,'openingbook_w7_h6_d8.csv'),'utf8')).trim().split(/\r?\n/).map(line=>{const [k,v]=line.split(',');return [k.trim(),Number(v)];}));
const checked=new Map();let bookChecks=0,absentBookRows=0;
for(const pair of evidence.representatives)for(const side of ['a','b']){
  const x=pair[side],path=x.movesZeroBased,key=JSON.stringify(path);
  if(checked.has(key))continue;
  const actual=queryIndependent(path);assert.equal(actual.relative,x.relative);assert.equal(actual.key,x.key);
  checked.set(key,actual);
  // Independently test rank-8 extensions against the separate supplied score
  // book. No ancestor score is reconstructed and absence supplies no value.
  let fringe=[path];
  while(fringe.length&&fringe[0].length<8){
    const next=[];
    for(const prefix of fringe){
      const s=replayIndependent(prefix);
      for(let c=0;c<width;c++)if(s.heights[c]<height){const p=[...prefix,c];if(!replayIndependent(p).terminal)next.push(p);}
    }
    fringe=next;
  }
  for(const p of fringe){
    const value=queryIndependent(p);
    if(book.has(value.key)){assert.equal(Math.sign(book.get(value.key)),value.relative);bookChecks++;}
    else absentBookRows++;
  }
}
const result={claim:'Independent replay and BDD implementation agree on these representatives; rank-8 score-book signs agree where present. This does not independently prove database labels or any unbounded theorem.',
  evidenceSHA256:createHash('sha256').update(await readFile(evidencePath)).digest('hex'),
  representativePositions:checked.size,bookChecks,absentBookRows,
  checks:[...checked].map(([moves,result])=>({movesZeroBased:JSON.parse(moves),...result}))};
await writeFile(outputPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({representativePositions:checked.size,bookChecks,absentBookRows}));
