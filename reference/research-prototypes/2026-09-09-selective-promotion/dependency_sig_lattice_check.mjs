const DEFAULT_IDS=[1008138,878090,877066,877194,976906,975370,1009162,1008266,975498,878106,1008162,878618,878218,878114,878094];
const ids=(process.argv.length>2?process.argv.slice(2).map(Number):DEFAULT_IDS).map(x=>x>>>0);
function decode(sig){
  const out=[];
  for(let c=0;c<7;c++){
    const code=(sig>>>(c*3))&7;
    if(code===0)out.push([]);
    else if(code===1)out.push([0]);
    else if(code===2)out.push([1]);
    else {const x=code-3;out.push([x>>1,x&1]);}
  }
  return out;
}
function ancestor(a,b){
  const A=decode(a),B=decode(b);
  let strict=false;
  for(let c=0;c<7;c++){
    if(A[c].length>B[c].length)return false;
    for(let r=0;r<A[c].length;r++)if(A[c][r]!==B[c][r])return false;
    if(A[c].length<B[c].length)strict=true;
  }
  return strict;
}
function incompatible(a,b){
  const A=decode(a),B=decode(b);
  for(let c=0;c<7;c++){
    const n=Math.min(A[c].length,B[c].length);
    for(let r=0;r<n;r++)if(A[c][r]!==B[c][r])return true;
  }
  return false;
}
function text(sig){return decode(sig).map((v,c)=>`c${c}:${v.length?v.join(''):'.'}`).join(' ');}
for(const id of ids)console.log(`sig ${id} ${text(id)}`);
for(let i=0;i<ids.length;i++)for(let j=0;j<ids.length;j++)if(i!==j&&ancestor(ids[i],ids[j]))console.log(`ancestor ${ids[i]} -> ${ids[j]}`);
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)if(incompatible(ids[i],ids[j]))console.log(`incompatible ${ids[i]} x ${ids[j]}`);
