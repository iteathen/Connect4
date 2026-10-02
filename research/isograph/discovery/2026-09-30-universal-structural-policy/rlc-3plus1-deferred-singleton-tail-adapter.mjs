// Research-side adapter for the qualified 3+1 deferred-singleton tail theorem.
// Standard 7x6 only. It classifies from exact current semantic-q structure;
// no sequence, column name, solved value or history tag is a premise.

export const THREE_PLUS_ONE_DEFERRED_SINGLETON_TAIL_DRAW =
  'THREE_PLUS_ONE_DEFERRED_SINGLETON_TAIL_DRAW';

function hasBit(term,cell){
  return cell<32
    ? (((term[0]>>>cell)&1)!==0)
    : (((term[1]>>>(cell-32))&1)!==0);
}
function termCells(term){
  const out=[];
  for(let cell=0;cell<42;cell++)if(hasBit(term,cell))out.push(cell);
  return out;
}
function keyCells(cells){return [...cells].sort((a,b)=>a-b).join(',');}
function keyArray(key){return key===''?[]:key.split(',').map(Number);}
function strictSubset(a,b){
  const aa=keyArray(a),bb=new Set(keyArray(b));
  return aa.length<bb.size&&aa.every(x=>bb.has(x));
}
function normalize(keys){
  const u=[...new Set(keys)];
  return u.filter(k=>!u.some(o=>o!==k&&strictSubset(o,k))).sort();
}
function support(kernel,state){
  const s=kernel.states.supportAt(state),out=[];
  for(let c=0;c<7;c++){
    const x=kernel.supportAccess.landingAt(s,c);
    out.push(x===0xff?6:Math.floor(x/7));
  }
  return out;
}
function rank(kernel,state){
  return kernel.supportAccess.rankAt(kernel.states.supportAt(state));
}
function residualKeys(kernel,state,player){
  const cid=player===0?kernel.states.p0At(state):kernel.states.p1At(state);
  return normalize(kernel.classes.terms(cid).map(termCells).map(keyCells));
}

export function classifyThreePlusOneDeferredSingletonTail(kernel,state){
  if(!kernel?.states||!kernel?.supportAccess||!kernel?.classes){
    throw new TypeError('3+1 tail adapter requires a prepared semantic quotient kernel');
  }
  const r=rank(kernel,state);
  if((r&1)!==0){
    return Object.freeze({applies:false,reason:'P0_NOT_TO_MOVE',rank:r});
  }

  const h=support(kernel,state);
  const open=h.map((height,column)=>({height,column,remaining:6-height}))
    .filter(x=>x.remaining>0);
  if(open.length!==2){
    return Object.freeze({applies:false,reason:'OPEN_COLUMN_COUNT_NOT_2',rank:r,support:h});
  }
  const chain=open.find(x=>x.remaining===3);
  const singleton=open.find(x=>x.remaining===1);
  if(!chain||!singleton){
    return Object.freeze({applies:false,reason:'REMAINING_POSET_NOT_3_PLUS_1',rank:r,support:h});
  }

  const A1=chain.height*7+chain.column;
  const A2=(chain.height+1)*7+chain.column;
  const A3=(chain.height+2)*7+chain.column;
  const B=singleton.height*7+singleton.column;
  const p0=residualKeys(kernel,state,0);
  const p1=residualKeys(kernel,state,1);
  const wantP0=keyCells([A1,A2,A3]);
  const wantP1=keyCells([A2]);

  if(p0.length!==1||p0[0]!==wantP0){
    return Object.freeze({
      applies:false,reason:'P0_RESIDUAL_MISMATCH',rank:r,support:h,
      expected:[wantP0],actual:p0,
    });
  }
  if(p1.length!==1||p1[0]!==wantP1){
    return Object.freeze({
      applies:false,reason:'P1_RESIDUAL_MISMATCH',rank:r,support:h,
      expected:[wantP1],actual:p1,
    });
  }

  return Object.freeze({
    applies:true,
    kind:THREE_PLUS_ONE_DEFERRED_SINGLETON_TAIL_DRAW,
    interval:Object.freeze([0,0]),
    rank:r,
    support:Object.freeze(h),
    events:Object.freeze({
      A1,ObjectA1:Object.freeze({cell:A1,column:chain.column+1,row:chain.height+1}),
      A2,ObjectA2:Object.freeze({cell:A2,column:chain.column+1,row:chain.height+2}),
      A3,ObjectA3:Object.freeze({cell:A3,column:chain.column+1,row:chain.height+3}),
      B,ObjectB:Object.freeze({cell:B,column:singleton.column+1,row:singleton.height+1}),
    }),
    residuals:Object.freeze({
      P0:Object.freeze([Object.freeze([A1,A2,A3])]),
      P1:Object.freeze([Object.freeze([A2])]),
    }),
    theorem:'CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_NONWIN_THEOREM.md',
    qualification:'CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_QUALIFICATION_0_1.json',
  });
}
