/** Independent original 7x6 hexagon circuit physics/hazard checker.
 * No runtime imports or solved-game values; run with Node 22+.
 * Source function was executed in isolated JavaScript V8 before commit.
 */
function verifyOriginal7x6Hexagon(){
 const W=7,H=6,dirs=[[1,0],[0,1],[1,1],[1,-1]],outer=[1,2,3,5,6,7];
 const ok=(b,s)=>{if(!b)throw Error(s)};
 const lines=[],inc=Array.from({length:42},()=>[[],[],[],[]]);
 for(let x=0;x<W;x++)for(let y=0;y<H;y++)for(let d=0;d<4;d++){
  let [dx,dy]=dirs[d],s=[];
  for(let i=0;i<4;i++){let X=x+i*dx,Y=y+i*dy;if(X>=0&&X<W&&Y>=0&&Y<H)s.push(X+W*Y)}
  if(s.length===4){lines.push({d,cells:s});for(let e of s)inc[e][d].push(s)}
 }
 ok(lines.length===69,"69 original K4");
 const rays=(q,x,y,p)=>{
  for(let [dx,dy] of dirs){
   let n=1;
   for(let sign of [-1,1])for(let i=1;i<=3;i++){let X=x+sign*i*dx,Y=y+sign*i*dy;if(X<0||X>=W||Y<0||Y>=H||q[X+7*Y]!==p)break;n++;}
   if(n>=4)return true;
  }return false;
 };
 function source(anchor,index){
  let free=outer.filter(c=>c!==anchor),bits=free.map((_,i)=>(index>>(4-i))&1);
  let word=[anchor];for(let i=0;i<5;i++)if(!bits[i])word.push(free[i],free[i]);
  word.push(anchor);for(let i=0;i<5;i++)if(bits[i])word.push(free[i],free[i]);
  ok(word.length===12,"source length");
  let q=new Array(42).fill(0),h=new Array(7).fill(0);
  for(let t=0;t<12;t++){let c=word[t]-1,r=h[c]++,p=1+t%2;q[c+7*r]=p;ok(!rays(q,c,r,p),"source firstwin")}
  ok(h.join(",")==="2,2,2,0,2,2,2","physical heights");
  return {q,h,src:index,anchor};
 }
 function drop(s, c, p){
  if(s===null)return {state:null,win:0,k4:0};
  let q=s.q.slice(),h=s.h.slice(),ci=c-1,r=h[ci]++,e=ci+7*r;ok(r<6,"full column");q[e]=p;
  let hits=lines.filter(L=>L.cells.includes(e)&&L.cells.every(i=>q[i]===p)).length;
  ok(Boolean(hits)===rays(q,ci,r,p),"ray physical match");
  return {state:hits?null:{q,h,src:s.src,anchor:s.anchor},win:Number(hits>0),k4:hits};
 }
 function push(states,c,p){
  let out=[],win=0,k4=0;
  for(let q of states){let result=drop(q,c,p);out.push(result.state);win+=result.win;k4+=result.k4;}
  return {states:out,win,k4};
 }
 function native(plus,minus){
  let k4Equal=true,hazardsEqual=true,differentK4=0,differentEuler=0,patternExamples=[];
  for(let L of lines){
   let maps=Array.from({length:2},()=>new Map());
   for(let [side,states] of [plus,minus].entries())for(let st of states){
    if(!st)continue;
    let pat=L.cells.map(i=>st.q[i]).join('');
    maps[side].set(pat,(maps[side].get(pat)||0)+1);
   }
   for(let pat of new Set([...maps[0].keys(),...maps[1].keys()])){
    let diff=(maps[0].get(pat)||0)-(maps[1].get(pat)||0);
    if(diff){differentK4++;k4Equal=false;if(patternExamples.length<2)patternExamples.push({line:L.cells,pat,diff});}
   }
  }
  let slots=0;
  for(let owner of [1,2])for(let e=0;e<42;e++){
   let active=dirs.map((_,d)=>d).filter(d=>inc[e][d].length);
   for(let mask=1;mask<(1<<active.length);mask++){
    slots++;
    let count=ss=>ss.reduce((acc,st)=>{
     if(!st)return acc;
     let c=e%7;if(st.h[c]>=6||e!==c+7*st.h[c])return acc;
     for(let j=0;j<active.length;j++)if(mask&(1<<j)){
      let d=active[j];
      if(!inc[e][d].some(line=>line.every(i=>i===e||st.q[i]===owner)))return acc;
     }
     return acc+1;
    },0);
    if(count(plus)!==count(minus)){hazardsEqual=false;differentEuler++;}
   }
  }
  ok(slots===876,"both-owner Euler slot count");
  return {k4Equal,hazardsEqual,differentK4,differentEuler,patternExamples};
 }
 const plusIds=[1,8,18],minusIds=[2,9,16],report=[];
 for(let anchor of [1,7]){
  let P=plusIds.map(i=>source(anchor,i)),N=minusIds.map(i=>source(anchor,i));
  let before=native(P,N);
  ok(before.k4Equal&&before.hazardsEqual,"initial native null");
  let p0P=push(P,4,1),p0N=push(N,4,1);
  ok(p0P.win===0&&p0N.win===0,"first center all survive");
  ok(native(p0P.states,p0N.states).k4Equal&&native(p0P.states,p0N.states).hazardsEqual,"first action native null");
  let stages=[];
  for(let d=1;d<=7;d++){
   let p1P=push(p0P.states,d,2),p1N=push(p0N.states,d,2);
   ok(p1P.win===0&&p1N.win===0,"P1 no firstwin");
   let mid=native(p1P.states,p1N.states);
   ok(mid.k4Equal&&mid.hazardsEqual,"P1 native null");
   let endP=push(p1P.states,4,1),endN=push(p1N.states,4,1);
   let end=native(endP.states,endN.states),pos=endP.states.filter(Boolean),neg=endN.states.filter(Boolean);
   if(d!==4){
    ok(endP.win===2&&endN.win===2,"equal second center wins");
    ok(pos.length===1&&neg.length===1&&pos[0].src===18&&neg[0].src===9,"one each survivor");
    ok(!end.k4Equal&&end.hazardsEqual,"new K4 survivor-only but no Euler");
   }else{
    ok(endP.win===0&&endN.win===0&&pos.length===3&&neg.length===3,"blocked center win");
    ok(end.k4Equal&&end.hazardsEqual,"blocked center no new output");
   }
   let lowerCol=outer.find(c=>c!==anchor)-1,lowerP0Difference=pos.filter(s=>s.q[lowerCol]===1).length-neg.filter(s=>s.q[lowerCol]===1).length;
   ok(lowerP0Difference===(d===4?0:1),"bottom source owner survivor");
   stages.push({P1Reply:d,plusP0Wins:endP.win,minusP0Wins:endN.win,plusLive:pos.length,minusLive:neg.length,afterK4Equal:end.k4Equal,afterEulerEqual:end.hazardsEqual,ownerMomentDifference:lowerP0Difference});
  }
  report.push({anchor,plusSourceIndices:plusIds,minusSourceIndices:minusIds,initialNativeEquality:before.k4Equal&&before.hazardsEqual,stages});
 }
 return {status:"INDEPENDENT_JAVASCRIPT_V8_69K4_876EULER_3V3_HEXAGON_PASS",sourceLegalGamesChecked:12,originalWinWindows:69,perOwnerEulerSlots:438,analysedCenterThreeMovePaths:14,solverKnowledgeUsed:false,rootProved:false,report};
}
console.log(JSON.stringify(verifyOriginal7x6Hexagon(),null,2));
