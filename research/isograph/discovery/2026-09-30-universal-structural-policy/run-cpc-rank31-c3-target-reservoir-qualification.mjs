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
const sequence='4444415666662322224233177555571';
const TARGET_COLUMN=2,TARGET_ROW=4,TARGET=TARGET_ROW*g.columns+TARGET_COLUMN;

function fromSequence(s){
  const x=connect4RbaFromMoves(Array.from(s,c=>Number(c)-1),{geometry:g,canonical:false});
  return {words:x.words,basis:x.basis,n:x.basis.length,terminal:x.words[g.metaOffset]&3};
}
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
function support(q){return Array.from(q.words.slice(0,g.columns));}
function rankOf(q){return q.words[g.metaOffset]>>>2;}
function moverOf(q){return rankOf(q)&1;}
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
  return activeIds(q,player).some(id=>g.shapeSize[id]===1&&g.shapeCells[id*4]===cell);
}
function playableSingletons(q,player){
  const out=[];
  for(const id of activeIds(q,player)){
    if(g.shapeSize[id]!==1)continue;
    const cell=g.shapeCells[id*4],c=g.cellColumn[cell],r=g.cellRow[cell];
    if(q.words[c]===r)out.push({id,cell,column:c+1,row:r+1});
  }
  return out;
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
  // 1 = P2 trigger in vertical pair; 2 = P1 response; 3 = synchronized cross endpoint.
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
      depth=r-q.words[c],p=partner[c],L=p>=0?length[c]:0;
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
          depth,L,
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
  for(const id of defenderIds){
    const witness=coverageWitness(q,id,partner,length);
    if(!witness)return null;
    coverage.push({
      residualId:id,
      size:g.shapeSize[id],
      containsTarget:shapeHasCell(id,TARGET),
      witness
    });
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
  if(total&1||odd.length&1)return null;

  const partner=new Int32Array(g.columns);partner.fill(-1);
  const length=new Uint32Array(g.columns);
  let found=null;

  function rec(pending){
    if(found)return;
    if(!pending.length){
      const ev=templateEvidence(q,capacity,partner,length);
      if(!ev)return;
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
      return;
    }

    const a=pending[0];
    for(let j=1;j<pending.length&&!found;j++){
      const b=pending[j],rest=pending.filter((_,k)=>k!==0&&k!==j),
        max=Math.min(capacity[a],capacity[b]);
      partner[a]=b;partner[b]=a;

      for(let L=1;L<=max&&!found;L+=2){
        length[a]=L;length[b]=L;
        if((a===TARGET_COLUMN||b===TARGET_COLUMN)&&L>=capacity[TARGET_COLUMN])continue;
        rec(rest);
      }

      partner[a]=-1;partner[b]=-1;
      length[a]=0;length[b]=0;
    }
  }

  rec(odd);
  return found;
}
function validateTemplate(q,template){
  const mate=Int32Array.from(template.mate),role=Uint8Array.from(template.role);
  const failures=[];
  let defenderNodes=0,responsePairs=0,maxPairDepth=0,p1Terminals=0,targetTerminals=0;

  function walk(state,depth){
    defenderNodes++;
    maxPairDepth=Math.max(maxPairDepth,depth);
    if(moverOf(state)!==P2){
      failures.push({kind:'wrong-mover',rank:rankOf(state),support:support(state)});
      return;
    }

    let legal=0;
    for(let c=0;c<g.columns;c++){
      if(state.words[c]>=g.rows)continue;
      legal++;

      const row=state.words[c],cell=row*g.columns+c,r=role[cell],m=mate[cell];
      if(r!==1&&r!==3){
        failures.push({
          kind:'unmapped-defender-trigger',
          column:c+1,row:row+1,role:r,support:support(state)
        });
        continue;
      }

      const afterD=step(state,c);
      if(afterD.terminal===P2_WIN){
        failures.push({kind:'defender-terminal-before-response',column:c+1,row:row+1});
        continue;
      }
      if(afterD.terminal){
        failures.push({kind:'unexpected-defender-terminal',terminal:afterD.terminal,column:c+1,row:row+1});
        continue;
      }

      const rc=g.cellColumn[m],rr=g.cellRow[m];
      if(afterD.words[rc]!==rr){
        failures.push({
          kind:'response-not-playable',
          trigger:[c+1,row+1],
          response:[rc+1,rr+1],
          support:support(afterD)
        });
        continue;
      }

      const afterA=step(afterD,rc);
      responsePairs++;
      if(afterA.terminal===P1_WIN){
        p1Terminals++;
        if(m===TARGET)targetTerminals++;
        continue;
      }
      if(afterA.terminal){
        failures.push({
          kind:'unexpected-response-terminal',
          terminal:afterA.terminal,
          response:[rc+1,rr+1]
        });
        continue;
      }

      walk(afterA,depth+1);
    }

    if(!legal)failures.push({kind:'no-legal-defender-move-before-p1-win',support:support(state)});
  }

  walk(q,0);
  return {
    pass:failures.length===0,
    defenderNodes,
    responsePairs,
    maxPairDepth,
    p1TerminalResponses:p1Terminals,
    targetTerminalResponses:targetTerminals,
    failures:failures.slice(0,20),
  };
}

const state=fromSequence(sequence);
assert.equal(state.terminal,0);
assert.equal(rankOf(state),31);
assert.equal(moverOf(state),P2);
assert.deepEqual(support(state),[3,6,3,6,5,5,3]);

const activeP1Singleton=singletonActive(state,P1,TARGET);
const targetProjectedOwner=connect4CpcTargetOwner32(g,state.words,0,TARGET)+1;
const targetPlayable=state.words[TARGET_COLUMN]===TARGET_ROW;
const targetSupportDistance=connect4CpcTargetSupportDistance32(g,state.words,0,TARGET);
const playableP2=playableSingletons(state,P2);

const guards={
  activeP1Singleton,
  targetProjectedOwner,
  targetPlayable,
  targetSupportDistance,
  playableP2Singletons:playableP2,
};

let template=null,validation=null,rejectionReason=null,accept=false;

if(!activeP1Singleton)rejectionReason='target-not-active-p1-singleton';
else if(targetProjectedOwner!==1)rejectionReason='target-not-projected-to-p1';
else if(targetPlayable)rejectionReason='target-already-playable';
else if(playableP2.length)rejectionReason='playable-p2-singleton-terminal-exists';
else{
  template=findTemplate(state);
  if(!template)rejectionReason='no-valid-truncated-pairing-template';
  else{
    validation=validateTemplate(state,template);
    if(!validation.pass)rejectionReason='exact-rba-traversal-falsified-template';
    else accept=true;
  }
}

const publicTemplate=template?{
  capacity:template.capacity,
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
}:null;

console.log(JSON.stringify({
  schema:'connect4.cpc_rank31_c3_target_reservoir_qualification.v1',
  jsMinSysSha:EXPECTED,
  oracleUsed:false,
  solvedInputsUsed:false,
  ordinaryGameTreeSearchUsed:false,
  proofPremiseAllowed:accept,
  design:'CPC_RANK31_C3_TARGET_RESERVOIR_QUALIFICATION_0_1.md',
  theoremSchema:'CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md',
  state:{
    sequence,
    rank:31,
    mover:2,
    support:support(state),
  },
  target:{cell:TARGET,column:TARGET_COLUMN+1,row:TARGET_ROW+1},
  guards,
  template:publicTemplate,
  validation,
  accept,
  rejectionReason,
  conclusion:accept?[
    'The exact rank-31 state admits a fresh truncated synchronized pairing certificate for the active Player-1 singleton c3r5.',
    'The target is assigned as a Player-1 vertical response and every active Player-2 residual has an exact blocker/deferral witness.',
    'Independent exact-RBA traversal found no illegal paired response and no Player-2 terminal before the Player-1 response.',
    'Therefore the rank-31 current state is structurally certified as a Player-1 win without solved values or ordinary game-tree search.'
  ]:[
    'The frozen rank-31 c3r5 target-reservoir theorem candidate is rejected at this exact state.',
    'The rejection reason is recorded without changing the pairing schema.'
  ],
  boundary:[
    'No oracle, Pons, solved W/D/L, ordinary game-tree search, best-move table, BSFP solved frontier, physical-position identity, or sealed holdout is used.',
    'Template synthesis uses only the current exact RBA residuals, support/gravity, mover parity, and CPC target ownership.',
    'The traversal is a finite falsification cross-check of the synthesized response law; it does not consume a solved value.',
    'Production CPC and JSMinSys are read-only and unchanged; BSFP is unchanged.'
  ]
},null,2));
