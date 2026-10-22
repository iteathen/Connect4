// Independent exact 7x6 source legal-state three-cube verifier, 2026-10-21.
// Runs in plain JavaScript / Node 22+, no imports, source-only 69 K4 first-win semantics.
function runExactTriangleControl(){
  const W=7,H=6,P0=1,P1=2,columns=[1,2,3,5,6],dirs=[[1,0],[0,1],[1,1],[1,-1]];
  const assert=(x,msg)=>{if(!x)throw Error(msg)};
  const lines=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of dirs){
    let l=[];for(let k=0;k<4;k++){let xx=x+k*dx, yy=y+k*dy;if(xx>=0&&xx<W&&yy>=0&&yy<H)l.push(xx+W*yy);}
    if(l.length===4)lines.push(l);
  }
  assert(lines.length===69,"69 K4");
  const ray=(q,x,y,p)=>{
    for(const [dx,dy] of dirs){
      let n=1;
      for(const sign of [-1,1])for(let j=1;j<=3;j++){
        const xx=x+sign*j*dx,yy=y+sign*j*dy;
        if(xx<0||xx>=W||yy<0||yy>=H||q[xx+W*yy]!==p)break;
        n++;
      }
      if(n>=4)return true;
    }
    return false;
  };
  const cube={};let hist=[{original:0,sinks:0,surviving:0,cofactorBefore:0,cofactorAfter:0},{original:0,sinks:0,surviving:0,cofactorBefore:0,cofactorAfter:0}];
  let coeff5=0,winHorizontal=0,winNonHorizontal=0,monomialDiff=0;
  for(let mask=0;mask<32;mask++){
    const x=columns.map((_,i)=>(mask>>i)&1),[x1,x2,x3,x5,x6]=x,parity=x.reduce((a,b)=>a+b,0)%2;
    const history=[7];
    for(let i=0;i<5;i++)if(x[i]===0)history.push(columns[i],columns[i]);
    history.push(7);
    for(let i=0;i<5;i++)if(x[i]===1)history.push(columns[i],columns[i]);
    assert(history.length===12,"12 moves");
    const q=new Array(42).fill(0),h=new Array(7).fill(0);
    for(let i=0;i<12;i++){
      const c=history[i]-1,y=h[c]++,p=i%2?P1:P0;
      q[c+W*y]=p;
      assert(!ray(q,c,y,p),"first-win-free legal history");
    }
    assert(h.join(",")==="2,2,2,0,2,2,2","expected heights");
    for(let i=0;i<5;i++)assert(q[columns[i]-1]===(x[i]?P0:P1),"switch owner");
    const u=Number(q[0]===P1&&q[1+W]===P1&&q[2+2*W]===0&&q[3+3*W]===0);
    const b=Number(q[2]===P0&&q[4]===P0);
    const d=Number(q[4]===P0&&q[5]===P0);
    assert(u===(1-x1)*x2,"P1 grade2");
    assert(b===x3*x5 && d===x5*x6,"original horizontal source");
    const next=q.slice();next[3]=P0;
    const wins=lines.filter(l=>l.includes(3)&&l.every(e=>next[e]===P0));
    const physWin=ray(next,3,0,P0);
    assert(Boolean(wins.length)===physWin,"independent P0 terminal evaluator");
    winHorizontal+=wins.filter(l=>l[1]-l[0]===1).length;
    winNonHorizontal+=wins.filter(l=>l[1]-l[0]!==1).length;
    const f=u*(1-Number(physWin)), factored=u*(1-b)*(1-d);
    assert(f===factored,"3-factor bridge failure");
    const key=`${u}${b}${d}`;
    if(!cube[key])cube[key]={u,b,d,examples:0,liveGrade2:0,sourceWords:[]};
    cube[key].examples++;
    cube[key].liveGrade2+=f;
    cube[key].sourceWords.push(history.join(""));
    hist[parity].original++;hist[parity].cofactorBefore+=u;
    hist[parity].sinks+=Number(physWin);
    hist[parity].surviving+=Number(!physWin);
    hist[parity].cofactorAfter+=f;
    const pop=x.reduce((a,b)=>a+b,0);
    coeff5+=(pop%2?1:-1)*f; // (-1)^(5-popcount)
    monomialDiff+=(pop%2?-1:1)*f; // EVEN minus ODD
  }
  assert(Object.keys(cube).length===8,"full legal 3-cube missing corner");
  let derivative3=0;
  for(const k of Object.keys(cube)){
    const v=cube[k];
    const val=v.liveGrade2/v.examples; // must be 0 or 1, constant on each triple cell
    assert(Number.isInteger(val),"f not constant within triple cell");
    derivative3 += ((v.u+v.b+v.d)%2?1:-1)*val;
  }
  assert(derivative3===1,"third Möbius derivative");
  assert(coeff5===-1,"5th Möbius derivative");
  assert(monomialDiff===1,"even-odd fifth order contrast");
  assert(hist[0].sinks===6&&hist[1].sinks===6,"terminal sink parity");
  assert(hist[0].cofactorBefore===4&&hist[1].cofactorBefore===4,"before grade2");
  assert(hist[0].cofactorAfter===3&&hist[1].cofactorAfter===2,"after grade2");
  assert(winNonHorizontal===0,"unexpected non-horizontal firstwinner");
  return {status:"PASS_EXACT_PHYSICAL_7X6_LEGAL_TRIANGLE_BRIDGE",originalK4Windows:69,states:32,completeThreeCubeCorners:Object.keys(cube).length,cube:Object.values(cube).sort((a,b)=>(`${a.u}${a.b}${a.d}`).localeCompare(`${b.u}${b.b}${b.d}`)).map(v=>({u:v.u,b:v.b,d:v.d,legalBoardCount:v.examples,liveGrade2Count:v.liveGrade2})),mixedThirdDifference:derivative3,physicalFiveBitDifference:coeff5,evenOddSurvivingMomentDifference:monomialDiff,evenOdd:hist,winningK4IncidenceHorizontal:winHorizontal,winningK4IncidenceNonHorizontal:winNonHorizontal,rootSolvedDataUsed:false,independentPerfectRootWinProved:false};
}
console.log(JSON.stringify(runExactTriangleControl(), null, 2));
