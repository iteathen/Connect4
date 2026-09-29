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
  for(let c=0;c<g.columns;c++)if(s.heights[c]<g.rows){
    const cell=s.heights[c]*g.columns+c;
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


function defectTemplate(g,defectColumn){
  // State after one P0 token in the defect column, extended by the strict
  // P1-then-P0 same-column response coloring. This is geometry only.
  return Array.from({length:g.cells},(_,cell)=>{
    const row=Math.floor(cell/g.columns),column=cell%g.columns;
    return column===defectColumn?(row&1):((row&1)^1);
  });
}

function analyzeDefectColumn(g,defectColumn){
  assert.equal(g.rows&1,0,'dimension probe currently requires even height');
  const template=defectTemplate(g,defectColumn),monochromatic=[0,0];
  for(const line of g.lines)if(line.every(x=>template[x]===template[line[0]]))
    monochromatic[template[line[0]]]++;
  if(monochromatic[0]||monochromatic[1])return null;

  const vectors=[],labels=[];
  for(let c=0;c<g.columns;c++){
    const first=c===defectColumn?1:0,
      last=c===defectColumn?g.rows-3:g.rows-2;
    for(let h=first;h<=last;h+=2){
      vectors.push(incidence(g,1,h*g.columns+c)^incidence(g,0,(h+1)*g.columns+c));
      labels.push(`c${c+1}:r${h+1}-${h+2}`);
    }
  }
  const width=g.lines.length*2,pair=gf2Basis(vectors,width),
    unmatched=incidence(g,1,(g.rows-1)*g.columns+defectColumn),
    withUnmatched=gf2Basis([...vectors,unmatched],width).rank;
  return {
    column:defectColumn+1,
    responsePairs:vectors.length,
    responsePairRank:pair.rank,
    responseRelationNullity:vectors.length-pair.rank,
    unmatchedIndependent:withUnmatched===pair.rank+1,
    rankWithUnmatched:withUnmatched,
  };
}

export function analyzeDimensionControlAlgebra({widths=[4,5,6,7,8,9,10],heights=[4,6,8]}={}){
  const rows=[];
  for(const width of widths)for(const height of heights){
    assert.ok(Number.isInteger(width)&&width>=4);
    assert.ok(Number.isInteger(height)&&height>=4&&!(height&1));
    const g=geometry(width,height),safeDefects=[];
    for(let c=0;c<width;c++){
      const x=analyzeDefectColumn(g,c);
      if(x)safeDefects.push(x);
    }
    rows.push({width,height,lineCount:g.lines.length,safeDefects});
  }
  return {inputs:'geometry/rules only',connectK:4,outcomeLabelsRead:false,rows};
}


function standardResponseFragments(){
  const g=geometry(7,6),initialHeights=[0,0,0,1,0,0,0],fragments=[];
  for(let c=0;c<7;c++){
    const starts=c===3?[1,3]:[0,2,4];
    for(const h of starts){
      const lowerDepth=h-initialHeights[c],upperDepth=h+1-initialHeights[c];
      assert.ok(lowerDepth>=0&&upperDepth===lowerDepth+1);
      fragments.push({
        label:`c${c+1}:r${h+1}-${h+2}`,
        column:c,startRow:h,pairOrdinal:lowerDepth>>>1,
        tokens:[
          {player:1,cell:h*7+c,row:h,column:c,supportDepth:lowerDepth},
          {player:0,cell:(h+1)*7+c,row:h+1,column:c,supportDepth:upperDepth},
        ],
      });
    }
  }
  const row=5,column=3,supportDepth=row-initialHeights[column];
  return {
    g,fragments,
    unmatched:{
      label:'c4:r6-unmatched',
      column,row,pairOrdinal:supportDepth>>>1,
      tokens:[{player:1,cell:row*7+column,row,column,supportDepth}],
    },
  };
}

function tokenFeatureKeys(g,token,fragment,id){
  const keys=[];
  for(let li=0;li<g.lines.length;li++){
    const pos=g.lines[li].indexOf(token.cell);
    if(pos<0)continue;
    let suffix;
    switch(id){
      case 'player-line': suffix='';break;
      case 'player-line-support-parity': suffix=`:${token.supportDepth&1}`;break;
      case 'player-line-support-depth': suffix=`:${token.supportDepth}`;break;
      case 'player-line-pair-depth': suffix=`:${fragment.pairOrdinal}`;break;
      case 'player-line-row-parity': suffix=`:${token.row&1}`;break;
      case 'player-line-row': suffix=`:${token.row}`;break;
      case 'player-line-position': suffix=`:${pos}`;break;
      case 'player-line-resource-column': suffix=`:${token.column}`;break;
      default: throw new RangeError('unknown response projection');
    }
    keys.push(`${token.player}:${li}${suffix}`);
  }
  return keys;
}

function responseProjection(id){
  const {g,fragments,unmatched}=standardResponseFragments(),
    all=[...fragments,unmatched],keySet=new Set();
  for(const fragment of all)for(const token of fragment.tokens)
    for(const key of tokenFeatureKeys(g,token,fragment,id))keySet.add(key);
  const keys=[...keySet].sort(),index=new Map(keys.map((key,i)=>[key,i])),
    vector=fragment=>{
      let v=0n;
      for(const token of fragment.tokens)for(const key of tokenFeatureKeys(g,token,fragment,id))
        v^=1n<<BigInt(index.get(key));
      return v;
    },
    vectors=fragments.map(vector),width=keys.length,
    rank=gf2Basis(vectors,width).rank,
    unmatchedVector=vector(unmatched),
    withUnmatched=gf2Basis([...vectors,unmatchedVector],width).rank,
    dep=firstDependency(vectors,fragments.map(x=>x.label),width),
    baseDependency=new Set([
      'c1:r1-2','c1:r3-4','c1:r5-6',
      'c3:r1-2','c3:r3-4','c3:r5-6',
      'c5:r1-2','c5:r3-4','c5:r5-6',
      'c7:r1-2','c7:r3-4','c7:r5-6',
    ]);
  let baseRelation=0n;
  for(let i=0;i<fragments.length;i++)if(baseDependency.has(fragments[i].label))
    baseRelation^=vectors[i];
  return {
    id,featureCount:width,responsePairs:vectors.length,rank,
    nullity:vectors.length-rank,
    unmatchedIndependent:withUnmatched===rank+1,
    rankWithUnmatched:withUnmatched,
    originalRelationSurvives:baseRelation===0n,
    firstDependencyLabels:dep.dependencyLabels,
  };
}

export function analyzeGuardedResponseProjections(){
  const ids=[
    'player-line',
    'player-line-support-parity',
    'player-line-support-depth',
    'player-line-pair-depth',
    'player-line-row-parity',
    'player-line-row',
    'player-line-position',
    'player-line-resource-column',
  ];
  return {
    inputs:'geometry/rules only',
    responsePairs:20,
    outcomeLabelsRead:false,
    projections:ids.map(responseProjection),
  };
}


function connectKGeometry(columns,rows,connectK){
  const lines=[];
  for(let r=0;r<rows;r++)for(let c=0;c<columns;c++)
    for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
      const x=c+(connectK-1)*dc,y=r+(connectK-1)*dr;
      if(x<columns&&y>=0&&y<rows)
        lines.push(Array.from({length:connectK},(_,i)=>(r+i*dr)*columns+c+i*dc));
    }
  return {columns,rows,connectK,cells:columns*rows,lines};
}

function incidenceFor(g,player,cell){
  let v=0n;
  for(let i=0;i<g.lines.length;i++)if(g.lines[i].includes(cell))
    v|=1n<<BigInt(player*g.lines.length+i);
  return v;
}

function fullColumnContribution(g,column,phase){
  let v=0n;
  for(let row=0;row<g.rows;row++)
    v^=incidenceFor(g,(row&1)^phase,row*g.columns+column);
  return v;
}

function parityClassContribution(g,phase,columnParity){
  let v=0n;
  for(let c=0;c<g.columns;c++)if((c&1)===columnParity)
    v^=fullColumnContribution(g,c,phase);
  return v;
}

function singleDefectIdentity(g,defectColumn){
  const actualColumn=c=>fullColumnContribution(g,c,c===defectColumn?0:1);
  let opposite=0n,same=0n;
  for(let c=0;c<g.columns;c++){
    if((c&1)===(defectColumn&1))same^=actualColumn(c);
    else opposite^=actualColumn(c);
  }
  const defectDelta=fullColumnContribution(g,defectColumn,0)^
    fullColumnContribution(g,defectColumn,1);
  return {oppositeZero:opposite===0n,sameEqualsDefectDelta:same===defectDelta};
}

function standardResponseSystemAtHeight(height){
  const g=connectKGeometry(7,height,4),defectColumn=3,
    initialHeight=c=>c===defectColumn?1:0,
    pairVectors=[],unmatched=[];
  const relationColumns=new Set([0,2,4,6]);
  let completedRelation=0n;
  for(let c=0;c<7;c++){
    const start=initialHeight(c),remaining=height-start,pairs=remaining>>>1;
    for(let k=0;k<pairs;k++){
      const row=start+(k<<1),
        v=incidenceFor(g,1,row*7+c)^incidenceFor(g,0,(row+1)*7+c);
      pairVectors.push(v);
      if(relationColumns.has(c))completedRelation^=v;
    }
    if(remaining&1){
      const row=height-1,v=incidenceFor(g,1,row*7+c);
      unmatched.push(v);
      if(relationColumns.has(c))completedRelation^=v;
    }
  }
  const width=g.lines.length*2,pairRank=gf2Basis(pairVectors,width).rank,
    combinedRank=gf2Basis([...pairVectors,...unmatched],width).rank;
  return {
    height,
    pairCount:pairVectors.length,
    pairRank,
    pairNullity:pairVectors.length-pairRank,
    unmatchedTops:unmatched.length,
    unmatchedAddedRank:combinedRank-pairRank,
    combinedNullity:pairVectors.length+unmatched.length-combinedRank,
    completedRelationZero:completedRelation===0n,
  };
}

export function analyzeFullColumnCancellation(){
  const uniformParityFailures=[],singleDefectIdentityFailures=[];
  for(let width=4;width<=12;width++)for(let height=4;height<=12;height++){
    const g=connectKGeometry(width,height,4);
    for(let phase=0;phase<2;phase++)for(let parity=0;parity<2;parity++)
      if(parityClassContribution(g,phase,parity)!==0n)
        uniformParityFailures.push({width,height,phase,parity});
    for(let defect=0;defect<width;defect++){
      const x=singleDefectIdentity(g,defect);
      if(!x.oppositeZero||!x.sameEqualsDefectDelta)
        singleDefectIdentityFailures.push({width,height,column:defect+1,...x});
    }
  }

  const connectKPeriodicity=[];
  for(let connectK=3;connectK<=8;connectK++){
    const width=connectK+4,height=connectK+4,
      g=connectKGeometry(width,height,connectK);
    let ok=true;
    for(let phase=0;phase<2;phase++)for(let parity=0;parity<2;parity++)
      ok=ok&&parityClassContribution(g,phase,parity)===0n;
    connectKPeriodicity.push({connectK,width,height,uniformParityCancellation:ok});
  }

  return {
    inputs:'geometry/rules only',
    outcomeLabelsRead:false,
    dimensionSweep:{
      connectK:4,widths:[4,12],heights:[4,12],
      uniformParityFailures,singleDefectIdentityFailures,
    },
    standardWidth7:[4,5,6,7,8,9].map(standardResponseSystemAtHeight),
    connectKPeriodicity,
  };
}


function polynomialDegree(p){
  let d=-1;for(let q=p;q;q>>=1n)d++;return d;
}

function polynomialMod(a,b){
  const db=polynomialDegree(b);
  while(a&&polynomialDegree(a)>=db)
    a^=b<<BigInt(polynomialDegree(a)-db);
  return a;
}

function polynomialGcd(a,b){
  while(b){const r=polynomialMod(a,b);a=b;b=r;}
  return a;
}

function polynomialText(p){
  if(!p)return '0';
  const terms=[];
  for(let i=0;p>>BigInt(i);i++)if((p>>BigInt(i))&1n)
    terms.push(i===0?'1':i===1?'x':`x^${i}`);
  return terms.join('+');
}

function standardDepthRelationPolynomials(){
  const {g,fragments}=standardResponseFragments(),
    relation=new Set([
      'c1:r1-2','c1:r3-4','c1:r5-6',
      'c3:r1-2','c3:r3-4','c3:r5-6',
      'c5:r1-2','c5:r3-4','c5:r5-6',
      'c7:r1-2','c7:r3-4','c7:r5-6',
    ]),
    byCoordinate=new Map();
  for(const fragment of fragments)if(relation.has(fragment.label))
    for(const token of fragment.tokens)for(let li=0;li<g.lines.length;li++)
      if(g.lines[li].includes(token.cell)){
        const key=`${token.player}:${li}`,
          prior=byCoordinate.get(key)??0n;
        byCoordinate.set(key,prior^(1n<<BigInt(token.supportDepth)));
      }
  const nonzero=[...new Set([...byCoordinate.values()].filter(Boolean).map(String))]
    .map(BigInt).sort((a,b)=>a<b?-1:a>b?1:0);
  let gcd=0n;for(const p of nonzero)gcd=polynomialGcd(gcd,p);
  return {nonzero,gcd};
}

function depthResidualPolynomials(g,phase,columnParity){
  const byCoordinate=new Map();
  for(let c=0;c<g.columns;c++)if((c&1)===columnParity)
    for(let row=0;row<g.rows;row++){
      const player=(row&1)^phase,cell=row*g.columns+c;
      for(let li=0;li<g.lines.length;li++)if(g.lines[li].includes(cell)){
        const key=`${player}:${li}`,
          prior=byCoordinate.get(key)??0n;
        byCoordinate.set(key,prior^(1n<<BigInt(row)));
      }
    }
  return [...byCoordinate.values()].filter(Boolean);
}

export function analyzeDepthPolynomialAnnihilator(){
  const standard=standardDepthRelationPolynomials(),connectK=[];
  for(let k=3;k<=12;k++){
    const g=connectKGeometry(k+4,k+4,k);
    let ungradedCancellation=true;
    for(let phase=0;phase<2;phase++)for(let parity=0;parity<2;parity++)
      ungradedCancellation=ungradedCancellation&&parityClassContribution(g,phase,parity)===0n;
    const polys=depthResidualPolynomials(g,1,0);
    let gcd=0n;for(const p of polys)gcd=polynomialGcd(gcd,p);
    connectK.push({connectK:k,ungradedCancellation,depthGcd:polynomialText(gcd)});
  }
  return {
    inputs:'geometry/rules only',
    outcomeLabelsRead:false,
    standard7x6:{
      nonzeroRelationPolynomials:standard.nonzero.map(polynomialText),
      gcd:polynomialText(standard.gcd),
      existingOperator:'partial^2',
      canonicalIdentity:'1+x^2=(1+x)^2',
    },
    connectK,
  };
}
