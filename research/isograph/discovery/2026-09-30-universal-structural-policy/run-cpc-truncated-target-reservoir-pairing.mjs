#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);
assert.equal(git('status','--porcelain'),'');

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const {prepareConnect4RbaExecutionProfile}=await load('rba-connect4-profile');
const {connect4RbaCofactor}=await load('rba-connect4-coordinate');
const {
  connect4CpcTargetOwner32,
  connect4CpcTargetSupportDistance32,
}=await load('cpc-connect4');

const g=prepareConnect4RbaGeometry({columns:7,rows:6});
const profile=prepareConnect4RbaExecutionProfile(g);
const P1=0,P2=1,P1_WIN=3,P2_WIN=1;
const TARGET_COLUMN=6,TARGET_ROW=2,TARGET=TARGET_ROW*g.columns+TARGET_COLUMN;
const ATTACK_COLUMN=4;
const parentSequence='444441566666232222423311';
const parentMoves=Array.from(parentSequence,c=>Number(c)-1);
const ingress=connect4RbaFromMoves(parentMoves,{geometry:g,canonical:false});
const root={words:ingress.words,basis:ingress.basis,n:ingress.basis.length,terminal:ingress.words[g.metaOffset]&3};
assert.equal(root.terminal,0);
assert.equal(root.words[g.metaOffset]>>>2,24);

function step(q,column){
  assert.equal(q.words[g.metaOffset]&3,0);
  assert(column>=0&&column<g.columns&&q.words[column]<g.rows);
  const words=new Uint32Array(g.keyWords);
  const basis=new Uint32Array(g.maxBasis);
  const seen=new Uint32Array(g.shapeWordCount);
  const sizes=new Uint32Array(1);
  const terminal=connect4RbaCofactor(
    g,profile,q.words,0,q.basis,0,q.n,column,
    words,0,basis,0,seen,sizes,0
  );
  assert(terminal>=0);
  return {words,basis,n:sizes[0],terminal};
}

function coordHas(q,player,index){
  const base=player?g.p1Offset:g.p0Offset;
  return (q.words[base+(index>>>5)]&(1<<(index&31)))!==0;
}

function activeIds(q,player){
  const out=[];
  for(let i=0;i<q.n;i++)if(coordHas(q,player,i))out.push(q.basis[i]);
  return out;
}

function shapeHasCell(id,cell){
  const n=g.shapeSize[id],base=id*4;
  for(let i=0;i<n;i++)if(g.shapeCells[base+i]===cell)return true;
  return false;
}

function singletonActive(q,player,cell){
  const ids=activeIds(q,player);
  for(let i=0;i<ids.length;i++)if(g.shapeSize[ids[i]]===1&&g.shapeCells[ids[i]*4]===cell)return true;
  return false;
}

function playableSingletons(q,player){
  const out=[];
  const ids=activeIds(q,player);
  for(let i=0;i<ids.length;i++){
    const id=ids[i];
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({id,cell,column:c+1,row:r+1});
  }
  return out;
}

function support(q){return Array.from(q.words.slice(0,g.columns));}

function compress(firstResponse){
  let q=step(root,ATTACK_COLUMN);
  assert.equal(q.terminal,0);
  q=step(q,firstResponse);
  assert.equal(q.terminal,0);
  if(firstResponse===ATTACK_COLUMN){
    const win=step(q,ATTACK_COLUMN);
    assert.equal(win.terminal,P1_WIN);
    return {directWin:true,state:null};
  }
  q=step(q,ATTACK_COLUMN);
  assert.equal(q.terminal,0);
  q=step(q,ATTACK_COLUMN);
  assert.equal(q.terminal,0);
  q=step(q,ATTACK_COLUMN);
  assert.equal(q.terminal,0);
  assert.equal(q.words[g.metaOffset]>>>2,29);
  assert.equal((q.words[g.metaOffset]>>>2)&1,P2);
  return {directWin:false,state:q};
}

function relevantCapacity(q){
  const out=new Uint32Array(g.columns);
  for(let c=0;c<g.columns;c++){
    out[c]=c===TARGET_COLUMN
      ?TARGET_ROW-q.words[c]+1
      :g.rows-q.words[c];
  }
  return out;
}

function buildPairMap(q,capacity,partner,length){
  const mate=new Int32Array(g.cellCount);mate.fill(-1);
  const role=new Uint8Array(g.cellCount);
  // role 1 = vertical D-trigger; 2 = vertical A-response; 3 = cross endpoint.
  for(let c=0;c<g.columns;c++){
    const h=q.words[c],p=partner[c],L=p>=0?length[c]:0,cap=capacity[c];
    if(p>=0&&c<p){
      const hp=q.words[p];
      for(let d=0;d<L;d++){
        const a=(h+d)*g.columns+c,b=(hp+d)*g.columns+p;
        assert(mate[a]===-1&&mate[b]===-1);
        mate[a]=b;mate[b]=a;role[a]=3;role[b]=3;
      }
    }
    for(let d=L;d<cap;d+=2){
      assert(d+1<cap,'vertical tail must be even');
      const lo=(h+d)*g.columns+c,hi=(h+d+1)*g.columns+c;
      assert(mate[lo]===-1&&mate[hi]===-1);
      mate[lo]=hi;mate[hi]=lo;role[lo]=1;role[hi]=2;
    }
  }
  return {mate,role};
}

function coverageWitness(q,id,partner,length){
  const n=g.shapeSize[id],base=id*4;
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(c===TARGET_COLUMN&&r>TARGET_ROW){
      return {kind:'post-target-deferral',cell,column:c+1,row:r+1};
    }
  }
  for(let j=0;j<n;j++){
    const cell=g.shapeCells[base+j],c=g.cellColumn[cell],r=g.cellRow[cell],
      h=q.words[c],depth=r-h,p=partner[c],L=p>=0?length[c]:0;
    if(depth<0)continue;
    if(depth>=L+1&&((depth-(L+1))&1)===0){
      return {kind:'vertical-response',cell,column:c+1,row:r+1,depth,L};
    }
    if(p>=0&&depth<L){
      const mate=(q.words[p]+depth)*g.columns+p;
      if(shapeHasCell(id,mate)){
        return {
          kind:'cross-pair',
          cells:[cell,mate],
          columns:[c+1,p+1],
          rows:[r+1,g.cellRow[mate]+1],
          depth,
          L,
        };
      }
    }
  }
  return null;
}

function templateEvidence(q,capacity,partner,length){
  const targetDepth=TARGET_ROW-q.words[TARGET_COLUMN];
  const targetL=partner[TARGET_COLUMN]>=0?length[TARGET_COLUMN]:0;
  const targetIsResponse=
    targetDepth>=targetL+1&&((targetDepth-(targetL+1))&1)===0;
  if(!targetIsResponse)return null;

  const defenderIds=activeIds(q,P2);
  const coverage=[];
  for(let i=0;i<defenderIds.length;i++){
    const id=defenderIds[i],witness=coverageWitness(q,id,partner,length);
    if(!witness)return null;
    coverage.push({residualId:id,size:g.shapeSize[id],witness});
  }

  const pairs=[];
  for(let c=0;c<g.columns;c++){
    const p=partner[c];
    if(p>=0&&c<p)pairs.push({columns:[c+1,p+1],prefixLength:length[c]});
  }
  return {
    targetIsResponse,
    targetDepth,
    targetPrefixLength:targetL,
    synchronizedPairs:pairs,
    defenderResidualCount:defenderIds.length,
    coverage,
  };
}

function findTemplate(q){
  const capacity=relevantCapacity(q);
  if(capacity[TARGET_COLUMN]===0)return null;
  let total=0;
  const odd=[];
  for(let c=0;c<g.columns;c++){
    total+=capacity[c];
    if(capacity[c]&1)odd.push(c);
  }
  if(total&1)return null;
  if(odd.length&1)return null;

  const partner=new Int32Array(g.columns);partner.fill(-1);
  const length=new Uint32Array(g.columns);
  let found=null;

  function rec(pending){
    if(found)return;
    if(!pending.length){
      const ev=templateEvidence(q,capacity,partner,length);
      if(ev){
        const map=buildPairMap(q,capacity,partner,length);
        found={
          capacity:Array.from(capacity),
          totalRelevant:total,
          oddColumns:odd.map(c=>c+1),
          partner:Array.from(partner,x=>x<0?0:x+1),
          prefixLength:Array.from(length),
          ...ev,
          mate:Array.from(map.mate),
          role:Array.from(map.role),
        };
      }
      return;
    }
    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;
      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        // Never permit the target itself to be a cross-pair endpoint.
        if((a===TARGET_COLUMN||b===TARGET_COLUMN)&&L>=capacity[TARGET_COLUMN])continue;
        rec(rest);
      }
      partner[a]=-1;partner[b]=-1;length[a]=0;length[b]=0;
    }
  }
  rec(odd);
  return found;
}

function validateTemplate(q,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  let dNodes=0,pairs=0,maxDepth=0,earlyP1Wins=0,targetWins=0;
  const failures=[];

  function walk(state,depth){
    dNodes++;if(depth>maxDepth)maxDepth=depth;
    const rank=state.words[g.metaOffset]>>>2;
    if((rank&1)!==P2){
      failures.push({kind:'wrong-mover',rank,support:support(state)});return;
    }

    let legalCount=0;
    for(let c=0;c<g.columns;c++){
      if(state.words[c]>=g.rows)continue;
      legalCount++;
      const row=state.words[c],cell=row*g.columns+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){
        failures.push({kind:'unmapped-defender-trigger',column:c+1,row:row+1,role:r,support:support(state)});
        continue;
      }
      const afterD=step(state,c);
      if(afterD.terminal===P2_WIN){
        failures.push({kind:'defender-terminal-before-response',column:c+1,row:row+1,support:support(state)});
        continue;
      }
      if(afterD.terminal){
        failures.push({kind:'unexpected-terminal-after-defender',terminal:afterD.terminal,column:c+1,row:row+1});
        continue;
      }
      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(afterD.words[rc]!==rr){
        failures.push({kind:'paired-response-not-playable',trigger:{column:c+1,row:row+1},response:{column:rc+1,row:rr+1},support:support(afterD)});
        continue;
      }
      const afterA=step(afterD,rc);
      pairs++;
      if(afterA.terminal===P1_WIN){
        earlyP1Wins++;
        if(m===TARGET)targetWins++;
        continue;
      }
      if(afterA.terminal){
        failures.push({kind:'unexpected-terminal-after-response',terminal:afterA.terminal,response:{column:rc+1,row:rr+1}});
        continue;
      }
      walk(afterA,depth+1);
    }
    if(!legalCount)failures.push({kind:'no-legal-defender-move-before-p1-win',support:support(state)});
  }

  walk(q,0);
  return {
    pass:failures.length===0,
    defenderNodes:dNodes,
    responsePairs:pairs,
    maxPairDepth:maxDepth,
    p1TerminalResponses:earlyP1Wins,
    targetTerminalResponses:targetWins,
    failures:failures.slice(0,20),
    role:'falsification cross-check only; structural pairing coverage is the proof certificate',
  };
}

const firstResponses=[0,2,5,6];
const rows=[];
let accept=true;
for(let i=0;i<firstResponses.length;i++){
  const response=firstResponses[i],compressed=compress(response),q=compressed.state;
  assert(q);
  const singleton=singletonActive(q,P1,TARGET);
  const defenderPlayable=playableSingletons(q,P2);
  const owner=connect4CpcTargetOwner32(g,q.words,0,TARGET);
  const supportDistance=connect4CpcTargetSupportDistance32(g,q.words,0,TARGET);
  const template=singleton&&defenderPlayable.length===0?findTemplate(q):null;
  const validation=template?validateTemplate(q,template):null;
  const rowAccept=
    singleton&&defenderPlayable.length===0&&owner===P1&&
    !!template&&template.targetIsResponse&&!!validation?.pass;
  if(!rowAccept)accept=false;
  rows.push({
    firstResponseColumn:response+1,
    rank:q.words[g.metaOffset]>>>2,
    mover:((q.words[g.metaOffset]>>>2)&1)+1,
    support:support(q),
    target:{
      column:TARGET_COLUMN+1,row:TARGET_ROW+1,cell:TARGET,
      activeP1Singleton:singleton,
      supportDistance,
      projectedOwner:owner+1,
    },
    defenderPlayableSingletons:defenderPlayable,
    truncatedCapacity:template?.capacity??Array.from(relevantCapacity(q)),
    template:template?{
      totalRelevant:template.totalRelevant,
      oddColumns:template.oddColumns,
      synchronizedPairs:template.synchronizedPairs,
      partner:template.partner,
      prefixLength:template.prefixLength,
      targetIsResponse:template.targetIsResponse,
      targetDepth:template.targetDepth,
      targetPrefixLength:template.targetPrefixLength,
      defenderResidualCount:template.defenderResidualCount,
      coverage:template.coverage,
    }:null,
    validation,
    accept:rowAccept,
  });
}

console.log(JSON.stringify({
  schema:'connect4.cpc_truncated_target_reservoir_pairing.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  theoremCandidate:'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
  consumedLocator:{
    sequence:parentSequence,
    role:'qualification locator only; post-compression states are reached by exact RBA cofactors',
  },
  target:{column:7,row:3,cell:TARGET,attackerPlayer:1,defenderPlayer:2},
  rows,
  accept,
  conclusion:accept?[
    'Every qualified post-compression state admits a finite truncated synchronized pairing template.',
    'The target c7r3 is an active Player-1 singleton and an assigned Player-1 vertical response in every accepted template.',
    'Every active Player-2 residual is blocked by a vertical response, a complete synchronized cross pair, or target-first gravity deferral.',
    'Exact cofactor traversal of the synthesized template found no defender terminal or illegal response and reaches a Player-1 terminal on every branch.',
    'Therefore the pairing schema closes escape/preemption for these rank-29 states without using solved values or ordinary game-tree search as a proof premise.',
  ]:[
    'At least one rank-29 state failed the frozen structural pairing certificate or its exact-cofactor falsification cross-check.',
  ],
  boundary:[
    'Template synthesis uses only current support, gravity, exact active RBA residual attachment, mover parity, and the already-active singleton target.',
    'The validation traversal is an independent falsification cross-check of the finite template, not the proof premise and not a runtime universal policy.',
    'Production CPC is read-only and unchanged.',
    'No Pons/oracle, solved W/D/L, minimax, best-move label, physical-position identity, or sealed holdout is used.',
  ],
},null,2));
