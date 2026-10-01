#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library,'usage: node run-cpc-bottom-guard-fresh-structural.mjs <JSMinSys checkout>');
const EXPECTED='0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactorKnownHeight}=await load('rba-connect4-coordinate');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const moves=s=>Array.from(s,c=>Number(c)-1);

function ingress(sequence){
  const q=connect4RbaFromMoves(moves(sequence),{geometry:g,canonical:false});
  return {words:q.words,basis:q.basis};
}
const rank=q=>q.words[g.metaOffset]>>>2;
const terminal=q=>q.words[g.metaOffset]&3;
const mover=q=>rank(q)&1;

function qEqual(a,b){
  return a.words.length===b.words.length &&
    a.basis.length===b.basis.length &&
    a.words.every((x,i)=>x===b.words[i]) &&
    a.basis.every((x,i)=>x===b.basis[i]);
}
let cofactorCount=0;
function cofactor(q,column){
  assert.equal(terminal(q),0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords),basisBuf=new Uint32Array(g.maxBasis),
    seen=new Uint32Array(g.shapeWordCount),sizes=new Uint32Array(1);
  const term=connect4RbaCofactorKnownHeight(
    g,profile,q.words,0,q.basis,0,q.basis.length,column,q.words[column],
    words,0,basisBuf,0,seen,sizes,0
  );
  cofactorCount++;
  return {term,q:{words,basis:basisBuf.slice(0,sizes[0])}};
}

// Fresh, outcome-independent corpus. None is derived from the consumed
// 444441566* boundary. Every case ends on a defender row-1 move into a
// previously empty guard column, leaving the attacker to move.
const corpus=[
  {id:'g1_r2',sequence:'41',guard:1},
  {id:'g2_r2',sequence:'52',guard:2},
  {id:'g3_r2',sequence:'63',guard:3},
  {id:'g4_r2',sequence:'14',guard:4},
  {id:'g5_r2',sequence:'25',guard:5},
  {id:'g6_r2',sequence:'36',guard:6},
  {id:'g7_r2',sequence:'47',guard:7},

  {id:'g1_r4',sequence:'2231',guard:1},
  {id:'g2_r4',sequence:'3342',guard:2},
  {id:'g3_r4',sequence:'4453',guard:3},
  {id:'g4_r4',sequence:'5564',guard:4},
  {id:'g5_r4',sequence:'6675',guard:5},
  {id:'g6_r4',sequence:'7716',guard:6},
  {id:'g7_r4',sequence:'1127',guard:7},

  {id:'g1_r8',sequence:'44556621',guard:1},
  {id:'g2_r8',sequence:'55667732',guard:2},
  {id:'g3_r8',sequence:'66771143',guard:3},
  {id:'g4_r8',sequence:'77112254',guard:4},
  {id:'g5_r8',sequence:'11223365',guard:5},
  {id:'g6_r8',sequence:'22334476',guard:6},
  {id:'g7_r8',sequence:'33445517',guard:7},
];

function replayOwnership(sequence){
  const heights=new Uint8Array(7);
  const owner=new Int8Array(42);owner.fill(-1);
  for(let i=0;i<sequence.length;i++){
    const c=Number(sequence[i])-1,r=heights[c]++;
    assert(r<6,'illegal corpus overflow '+sequence);
    owner[r*7+c]=i&1;
  }
  return {heights,owner};
}

const rows=[];
for(const item of corpus){
  const c=item.guard-1;
  const q0=ingress(item.sequence);
  assert.equal(terminal(q0),0,item.id+' corpus state terminal');
  assert.equal(mover(q0),0,item.id+' expected P0 attacker to move');
  assert.equal(q0.words[c],1,item.id+' guard height must be 1');

  const physical=replayOwnership(item.sequence);
  assert.equal(physical.heights[c],1,item.id+' physical guard height');
  assert.equal(physical.owner[c],1,item.id+' row1 must be defender/P1 owned');

  let q=q0,seq=item.sequence;
  const transitions=[];
  for(const [stage,expectedBefore,attackerRow,defenderRow,expectedAfter] of [
    ['G1_TO_G3',1,2,3,3],
    ['G3_TO_G5',3,4,5,5],
  ]){
    assert.equal(q.words[c],expectedBefore,item.id+' '+stage+' before height');
    const first=cofactor(q,c);
    assert.equal(first.term,0,item.id+' '+stage+' attacker trigger unexpectedly terminal');
    assert.equal(first.q.words[c],attackerRow,item.id+' '+stage+' attacker support');
    seq+=String(item.guard);
    const replayFirst=ingress(seq);
    assert(qEqual(first.q,replayFirst),item.id+' '+stage+' attacker cofactor/replay mismatch');

    const second=cofactor(first.q,c);
    assert.equal(second.term,0,item.id+' '+stage+' defender renewal unexpectedly terminal');
    assert.equal(second.q.words[c],expectedAfter,item.id+' '+stage+' defender support');
    seq+=String(item.guard);
    const replaySecond=ingress(seq);
    assert(qEqual(second.q,replaySecond),item.id+' '+stage+' defender cofactor/replay mismatch');

    transitions.push({
      stage,
      beforeHeight:expectedBefore,
      attackerLandingRow:attackerRow,
      defenderLandingRow:defenderRow,
      afterHeight:expectedAfter,
      exactCofactorReplay:true,
      nonterminal:true,
    });
    q=second.q;
  }

  assert.equal(q.words[c],5,item.id+' pre-top guard height');
  const top=cofactor(q,c);
  assert.equal(top.q.words[c],6,item.id+' top exhaustion support');
  assert.equal(top.term,0,item.id+' top trigger unexpectedly terminal');
  seq+=String(item.guard);
  assert(qEqual(top.q,ingress(seq)),item.id+' top cofactor/replay mismatch');

  rows.push({
    ...item,
    startRank:rank(q0),
    guardColumn:item.guard,
    startSupport:Array.from(q0.words.slice(0,7)),
    reconstruction:{
      height1:true,
      defenderOwnsRow1:true,
      nextPlayableRow:2,
    },
    transitions,
    topExhaustion:{
      attackerLandingRow:6,
      resultingHeight:6,
      sameColumnResponseExists:false,
      nonterminal:true,
      exactCofactorReplay:true,
    }
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_bottom_response_guard_fresh_structural.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  consumedBoundaryUsed:false,
  cases:rows.length,
  guardColumnsCovered:[...new Set(rows.map(x=>x.guardColumn))].sort((a,b)=>a-b),
  ranksCovered:[...new Set(rows.map(x=>x.startRank))].sort((a,b)=>a-b),
  rows,
  work:{cofactorCount},
  conclusion:[
    'Every fresh row-1 defender placement reconstructs the height-1 odd-row guard from current occupancy.',
    'Across all seven columns and three independent starting-rank families, attacker row2/row4 triggers followed by same-column defender row3/row5 responses are exact legal nonterminal CPC/RBA transports.',
    'After guard height 5, attacker row6 exactly exhausts the column and no same-column response exists, isolating the top-debt boundary.'
  ],
  boundary:[
    'This qualifies guard reconstruction and same-column renewal structure only; it does not license the original row-1 defender response.',
    'No W/D/L, strong score, oracle, consumed-prefix label, or best-move information is used.',
    'Top-exhaustion repair remains governed by its separate frozen theorem and downstream proof-class closure.'
  ]
},null,2));
