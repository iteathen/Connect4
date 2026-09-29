// Cold rule-only research probe. No solver, solved corpus or outcome-table imports.
import assert from 'node:assert/strict';
import {geometry,replay} from './probe.mjs';
import {boundaryWitness,opportunisticFollowup} from './parity-geometry.mjs';

function popcountSmall(x){
  let n=0;for(;x;x&=x-1)n++;return n;
}

function gf2Basis(rows,width){
  const basis=new Array(width).fill(0n);
  let rank=0;
  for(const row0 of rows){
    let row=row0;
    for(let bit=width-1;bit>=0;bit--)if((row>>BigInt(bit))&1n){
      if(basis[bit])row^=basis[bit];
      else{basis[bit]=row;rank++;break;}
    }
  }
  return {basis,rank};
}

function gf2InSpan(row0,basis,width){
  let row=row0;
  for(let bit=width-1;bit>=0;bit--)if((row>>BigInt(bit))&1n){
    if(!basis[bit])return false;
    row^=basis[bit];
  }
  return true;
}

function firstDependency(vectors,labels,width){
  const basis=new Array(width).fill(null);
  let rank=0;
  for(let i=0;i<vectors.length;i++){
    let row=vectors[i],combo=1n<<BigInt(i),inserted=false;
    for(let bit=width-1;bit>=0;bit--)if((row>>BigInt(bit))&1n){
      if(basis[bit]){row^=basis[bit].row;combo^=basis[bit].combo;}
      else{basis[bit]={row,combo};rank++;inserted=true;break;}
    }
    if(!inserted&&row===0n){
      const members=[];
      for(let j=0;j<labels.length;j++)if((combo>>BigInt(j))&1n)members.push(labels[j]);
      return {rank,dependencyLabels:members};
    }
  }
  return {rank,dependencyLabels:[]};
}

function incidence(g,player,cell){
  let v=0n;
  for(let i=0;i<g.lines.length;i++)if(g.lines[i].includes(cell))
    v|=1n<<BigInt(player*g.lines.length+i);
  return v;
}

function standardResponseVectors(){
  const g=geometry(7,6),vectors=[],labels=[];
  for(let c=0;c<7;c++){
    const starts=c===3?[1,3]:[0,2,4];
    for(const h of starts){
      vectors.push(incidence(g,1,h*7+c)^incidence(g,0,(h+1)*7+c));
      labels.push(`c${c+1}:r${h+1}-${h+2}`);
    }
  }
  return {g,vectors,labels};
}

export function analyzeStandardCenterControlAlgebra(){
  const {g,vectors,labels}=standardResponseVectors(),
    width=g.lines.length*2,
    dep=firstDependency(vectors,labels,width),
    pairRank=gf2Basis(vectors,width).rank,
    unmatched=incidence(g,1,5*7+3),
    withUnmatched=gf2Basis([...vectors,unmatched],width).rank;
  assert.equal(dep.rank,pairRank);
  return {
    inputs:'geometry/rules only',
    geometry:'7x6 connect-4',
    lineCount:g.lines.length,
    responsePairs:vectors.length,
    responsePairRank:pairRank,
    responseRelationNullity:vectors.length-pairRank,
    dependencyLabels:dep.dependencyLabels,
    unmatchedCenterIndependent:withUnmatched===pairRank+1,
    rankWithUnmatchedCenter:withUnmatched,
    outcomeLabelsRead:false,
  };
}

function immediateWin(g,s,player){
  for(let c=0;c<g.width;c++)if(s.heights[c]<g.height){
    const cell=s.heights[c]*g.width+c;
    s.board[cell]=player;
    const win=g.lines.some(line=>line.every(x=>s.board[x]===player));
    s.board[cell]=-1;
    if(win)return true;
  }
  return false;
}

function pairCodeFromHeights(heights){
  const sides=[0,1,2,4,5,6];
  let code=0;
  for(let i=0;i<sides.length;i++){
    const pairs=heights[sides[i]]>>>1;
    assert.ok(pairs>=0&&pairs<=3);
    code|=pairs<<(2*i);
  }
  return code;
}

function boundaryClasses(){
  const g=geometry(7,6),
    u1=opportunisticFollowup(1).unknownKeys,
    u3=opportunisticFollowup(3).unknownKeys,
    u5=opportunisticFollowup(5).unknownKeys;
  assert.deepEqual(u3,u1);assert.deepEqual(u5,u1);
  const unknown=new Set(u1),unknownCodes=[],immediateCodes=[];
  let fullDrawCode=-1;
  for(let raw=0;raw<4096;raw++){
    const pairs=Array.from({length:6},(_,i)=>(raw>>>(2*i))&3),
      s=replay(g,boundaryWitness(3,pairs)),
      key=Array.from(s.heights).join(','),
      code=pairCodeFromHeights(s.heights);
    assert.equal(code,raw);
    if(unknown.has(key)){unknownCodes.push(code);continue;}
    if(s.rank===42){fullDrawCode=code;continue;}
    assert.equal(immediateWin(g,s,0),true,'boundary complement must be a rule-derived immediate P0 win');
    immediateCodes.push(code);
  }
  assert.equal(fullDrawCode,4095);
  return {unknownCodes,immediateCodes,fullDrawCode};
}

function monomials(maxDegree){
  const out=[];
  for(let mask=0;mask<4096;mask++)if(popcountSmall(mask)<=maxDegree)out.push(mask);
  return out;
}

function evaluationRow(code,masks){
  let row=0n;
  for(let j=0;j<masks.length;j++)if((code&masks[j])===masks[j])
    row|=1n<<BigInt(j);
  return row;
}

function bit(code,index){return (code>>>index)&1;}

function cubicLeft(code){
  const c2L=bit(code,2),c3H=bit(code,5),c5H=bit(code,7);
  return c3H&c5H&(c2L^1);
}

function cubicRight(code){
  const c3H=bit(code,5),c5H=bit(code,7),c6L=bit(code,8);
  return c3H&c5H&(c6L^1);
}

export function analyzeBoundaryPolynomialAlgebra(){
  const {unknownCodes,immediateCodes}=boundaryClasses(),identitySpace=[];
  for(let degree=1;degree<=4;degree++){
    const ms=monomials(degree),
      rows=unknownCodes.map(code=>evaluationRow(code,ms)),
      b=gf2Basis(rows,ms.length);
    let separated=0;
    for(const code of immediateCodes)
      if(!gf2InSpan(evaluationRow(code,ms),b.basis,ms.length))separated++;
    identitySpace.push({
      degree,monomials:ms.length,rank:b.rank,nullity:ms.length-b.rank,
      separatedImmediateWins:separated,
    });
  }

  for(const code of unknownCodes){
    assert.equal(cubicLeft(code),0);
    assert.equal(cubicRight(code),0);
  }
  let cubicUnionImmediateWins=0;
  for(const code of immediateCodes)if(cubicLeft(code)||cubicRight(code))
    cubicUnionImmediateWins++;

  // Degree <= 3 has nullity exactly two. These two independent, nonzero,
  // rule-decoded cubics therefore span the complete cubic vanishing space.
  assert.equal(identitySpace[2].nullity,2);

  return {
    inputs:'geometry/rules/derived boundary only',
    unknownStates:unknownCodes.length,
    immediateWinStates:immediateCodes.length,
    identitySpace,
    cubicFactors:[
      'c3H*c5H*(1 xor c2L)',
      'c3H*c5H*(1 xor c6L)',
    ],
    cubicBasisVerified:true,
    cubicUnionImmediateWins,
    outcomeLabelsRead:false,
  };
}
