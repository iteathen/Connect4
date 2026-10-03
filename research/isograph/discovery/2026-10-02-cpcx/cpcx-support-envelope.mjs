// CPCX exact support-envelope projection.
//
// A support envelope is a SET of possible support vectors.  Projection may
// collapse distinct full-board vectors to the same lower-dimensional vector;
// multiplicity after projection has no semantic meaning and must be removed.
//
// This operator is observation-scoped only.  Equality of projected envelopes
// says exactly that the selected columns admit the same support-vector set.  It
// does not identify full support, ownership, residuals, terminal precedence, or
// complete CPCX proof state.

function compareVectors(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++)if(a[i]!==b[i])return a[i]-b[i];
  return a.length-b.length;
}

export function normalizeCpcxSupportVectors(vectors){
  if(!Array.isArray(vectors))throw new TypeError('support vectors');
  const m=new Map();
  for(const source of vectors){
    if(!Array.isArray(source))throw new TypeError('support vector');
    const v=[...source];
    if(!v.every(Number.isInteger))throw new TypeError('integer support vector');
    m.set(v.join(','),v);
  }
  return [...m.values()].sort(compareVectors);
}

export function projectCpcxSupportEnvelope(envelope,columns){
  if(!Array.isArray(columns)||!columns.length)
    throw new RangeError('nonempty projection columns required');
  if(!columns.every(Number.isInteger)||new Set(columns).size!==columns.length)
    throw new RangeError('projection columns must be unique integers');

  if(envelope?.exact!==true||!Array.isArray(envelope.vectors))return {
    exact:false,
    columns:[...columns],
    vectors:[],
    source:'source support envelope is not exact',
  };

  const projected=[];
  for(const source of envelope.vectors){
    if(!Array.isArray(source))throw new TypeError('support vector');
    for(const c of columns)
      if(c<0||c>=source.length)throw new RangeError('projection column');
    projected.push(columns.map(c=>source[c]));
  }

  return {
    exact:true,
    columns:[...columns],
    vectors:normalizeCpcxSupportVectors(projected),
    setSemantics:true,
    projectionRule:'coordinate projection followed by duplicate elimination; multiplicity of full vectors that share one projection is not observable',
    source:'exact support-envelope projection',
  };
}

export function keyCpcxSupportEnvelope(envelope){
  if(envelope?.exact!==true)return JSON.stringify({exact:false});
  return JSON.stringify({
    exact:true,
    columns:[...(envelope.columns??[])],
    vectors:normalizeCpcxSupportVectors(envelope.vectors??[]),
  });
}
