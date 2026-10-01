#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});

function boardFrom(sequence){
  const heights=new Uint8Array(7),owner=new Int8Array(42);owner.fill(-1);
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1,row=heights[c]++;
    assert(c>=0&&c<7&&row<6,'invalid sequence');
    owner[row*7+c]=i&1;
  }
  return {heights,owner};
}
function grayInfo(board){
  const relevant=new Uint8Array(42),gray=new Uint8Array(42);
  for(let line=0;line<g.lineCount;line++){
    const base=line*4;let live0=1,live1=1;
    for(let i=0;i<4;i++){
      const cell=g.lineRow[base+i]*7+g.lineColumn[base+i],o=board.owner[cell];
      if(o===1)live0=0; else if(o===0)live1=0;
    }
    if(live0||live1)for(let i=0;i<4;i++)
      relevant[g.lineRow[base+i]*7+g.lineColumn[base+i]]=1;
  }
  let oddMask=0,count=0;
  for(let c=0;c<7;c++)for(let r=0;r<board.heights[c];r++){
    const cell=r*7+c;
    if(!relevant[cell]){
      gray[cell]=1;count++;
      if((r&1)===0)oddMask|=1<<(c*3+(r>>>1));
    }
  }
  return {relevant,gray,count,oddMask:oddMask>>>0};
}
function defenderOddMask(board,attacker){
  const defender=1-attacker;let mask=0;
  for(let c=0;c<7;c++)for(let r=0;r<board.heights[c];r+=2)
    if(board.owner[r*7+c]===defender)mask|=1<<(c*3+(r>>>1));
  return mask>>>0;
}
function guards(board,mask){
  const out=[];
  for(let c=0;c<7;c++){
    const h=board.heights[c];
    if(!(h>=1&&h<=5&&(h&1)))continue;
    const n=(h+1)>>>1,required=((1<<n)-1)<<(c*3);
    if((mask&required)===required)out.push({column:c+1,height:h});
  }
  return out;
}
function row(sequence){
  const q=connect4RbaFromMoves(Array.from(sequence,c=>Number(c)-1),{geometry:g,canonical:false});
  assert.equal(q.words[g.metaOffset]&3,0,'expected nonterminal '+sequence);
  const attacker=(sequence.length&1),board=boardFrom(sequence),gray=grayInfo(board),
    raw=defenderOddMask(board,attacker),effective=(raw|gray.oddMask)>>>0,
    cell=0*7+4;
  return {
    sequence,rank:sequence.length,attacker:attacker+1,
    support:Array.from(board.heights),
    rawOddMask:raw,grayOddMask:gray.oddMask,effectiveOddMask:effective,
    rawGuards:guards(board,raw),effectiveGuards:guards(board,effective),
    column5Row1:{
      owner:board.owner[cell]>=0?board.owner[cell]+1:null,
      gray:Boolean(gray.gray[cell]),
      relevant:Boolean(gray.relevant[cell])
    },
    grayCount:gray.count
  };
}

const parent='444441566666232222423311';
const afterTrigger=parent+'5';
const rows=[row(parent),row(afterTrigger)];
console.log(JSON.stringify({
  schema:'connect4.cpc_d13_trigger5_gray_probe.v1',
  oracleUsed:false,solvedInputsUsed:false,
  rows,
  conclusion:[
    'The probe asks only whether column-5 row-1 ownership is still live-line relevant at the transported D13 trigger-5 obstruction.',
    'Effective guards use the already-qualified neutral-token rule defender-owned OR gray on occupied odd rows.'
  ],
  boundary:[
    'This is consumed-boundary diagnostic evidence; fresh neutral-token/gray guard qualification is recorded separately.',
    'No response is licensed by this probe alone.'
  ]
},null,2));
